import { OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs'

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
export const off = new OpenFoodFacts(fetch, { host: '/off-api', language: 'de' })
