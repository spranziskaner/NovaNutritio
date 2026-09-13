import { OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs'
import { OFF_API_BASE_URL } from './offApiBase'

/** HTTP-Status, die auf eine vorübergehende Überlastung hindeuten – ein Retry lohnt sich. */
const TRANSIENT_STATUS_CODES = new Set([502, 503, 504])
const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 400

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Open Food Facts / die Supabase Edge Function davor schlagen gelegentlich
 * fehl – teils mit HTTP 502/503/504, teils bricht `fetch()` selbst mit einer
 * Exception ab (z. B. `TypeError: Load failed` auf iOS Safari bei einer
 * abgebrochenen Verbindung). Empirisch reproduzierbar: dieselbe URL, die in
 * der App mit "Load failed" scheiterte, lief kurz danach über einen
 * manuellen `fetch()`-Aufruf anstandslos durch – also keine deterministische
 * Ursache (falsche URL, CORS, Request-Objekt), sondern zeitlich schwankende
 * Netzwerk-/Backend-Flakiness. Beide Fehlerarten werden hier daher
 * gleichermaßen mit kurzer Wartezeit wiederholt, statt nur HTTP-Statuscodes
 * abzudecken.
 *
 * `input` ist bei SDK-Aufrufen ein von `openapi-fetch` gebautes `Request`-
 * Objekt (nicht bloß ein URL-String) – Safari/WebKit lässt dasselbe
 * `Request`-Objekt nicht in einem zweiten `fetch()`-Aufruf wiederverwenden,
 * Chrome/Firefox sind toleranter. Jeder Versuch bekommt deshalb über
 * `.clone()` eine frische Kopie statt das Original erneut zu verwenden.
 */
const retryingFetch: typeof fetch = async (input, init) => {
  const attemptFetch = () => fetch(input instanceof Request ? input.clone() : input, init)
  const requestUrl = input instanceof Request ? input.url : String(input)

  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    const isLastAttempt = attempt === MAX_ATTEMPTS
    try {
      const response = await attemptFetch()
      if (response.ok || !TRANSIENT_STATUS_CODES.has(response.status) || isLastAttempt) {
        return response
      }
    } catch (err) {
      if (isLastAttempt) {
        // Reichert die Exception um die tatsächlich von der SDK gebaute URL
        // an – ohne Entwicklertools auf dem betroffenen Gerät ist sonst
        // nicht erkennbar, wohin der fehlgeschlagene Request überhaupt ging.
        const reason = err instanceof Error ? err.message : String(err)
        throw new Error(`Fetch fehlgeschlagen nach ${MAX_ATTEMPTS} Versuchen: ${reason} — URL: ${requestUrl}`)
      }
    }
    await delay(RETRY_DELAY_MS * attempt)
  }

  // Unerreichbar: die Schleife kehrt beim letzten Versuch immer zurück oder wirft.
  throw new Error(`Fetch fehlgeschlagen — URL: ${requestUrl}`)
}

/**
 * SDK-Client für den Zugriff auf Open Food Facts. Ersetzt die frühere lokale
 * Datenbasis (Offline-Subset + Skript-Extraktion) vollständig: jeder
 * Produktabruf läuft über die offizielle JS/TS-SDK
 * (`@openfoodfacts/openfoodfacts-nodejs`, https://github.com/openfoodfacts/openfoodfacts-js)
 * gegen die klassische Product-Opener-API (`world.openfoodfacts.org`) – für
 * den Abruf einzelner Produkte per Barcode (API v3, siehe
 * `loadFoodDetail.ts`/`offProduct.ts`).
 *
 * `world.openfoodfacts.org` sendet für Browser-Anfragen von beliebigen
 * Origins keine `Access-Control-Allow-Origin`-Freigabe (empirisch geprüft:
 * CORS-Fehler im Browser). Der `host`-Pfad zeigt daher auf `OFF_API_BASE_URL`
 * (siehe `offApiBase.ts`): im Dev-Server der Vite-Proxy (`vite.config.ts`,
 * `/off-api`), im Produktions-Build eine Supabase Edge Function
 * (`supabase/functions/off-proxy`) – beide reichen die Anfrage server-seitig
 * an `world.openfoodfacts.org` weiter, dort greift CORS nicht, weil die
 * eigentliche Anfrage nicht mehr vom Browser aus geht.
 */
export const off = new OpenFoodFacts(retryingFetch, { host: OFF_API_BASE_URL, language: 'de' })
