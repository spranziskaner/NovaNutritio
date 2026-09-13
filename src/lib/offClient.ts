import { OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs'

/** HTTP-Status, die auf eine vorübergehende Überlastung hindeuten – ein Retry lohnt sich. */
const TRANSIENT_STATUS_CODES = new Set([502, 503, 504])
const MAX_ATTEMPTS = 3
const RETRY_DELAY_MS = 400

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms))
}

/**
 * Open Food Facts antwortet gelegentlich mit HTTP 502/503/504, wenn die
 * (teils ältere) Infrastruktur kurzzeitig überlastet ist – unabhängig von der
 * konkreten Anfrage (siehe auch `search.ts`). Solche Antworten werden hier
 * zentral für alle SDK-Aufrufe automatisch mit kurzer Wartezeit wiederholt,
 * statt den Fehler sofort weiterzureichen.
 */
const retryingFetch: typeof fetch = async (input, init) => {
  let response = await fetch(input, init)
  for (
    let attempt = 2;
    attempt <= MAX_ATTEMPTS && !response.ok && TRANSIENT_STATUS_CODES.has(response.status);
    attempt++
  ) {
    await delay(RETRY_DELAY_MS * (attempt - 1))
    response = await fetch(input, init)
  }
  return response
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
 * CORS-Fehler im Browser). Der `host`-Pfad zeigt daher auf `/off-api`, das im
 * Dev-Server per Vite-Proxy (`vite.config.ts`) server-seitig an
 * `world.openfoodfacts.org` weitergereicht wird – dort greift CORS nicht,
 * weil die eigentliche Anfrage nicht mehr vom Browser aus geht. Für den
 * Produktions-Build braucht es eine äquivalente Lösung auf Hosting-Ebene
 * (siehe README).
 */
export const off = new OpenFoodFacts(retryingFetch, { host: '/off-api', language: 'de' })
