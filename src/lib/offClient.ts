import { OpenFoodFacts, SearchApi } from '@openfoodfacts/openfoodfacts-nodejs'

/**
 * Zentrale SDK-Clients für den Zugriff auf Open Food Facts. Ersetzt die
 * frühere lokale Datenbasis (Offline-Subset + Skript-Extraktion) vollständig:
 * jede Produktsuche und jeder Produktabruf läuft jetzt über die offizielle
 * JS/TS-SDK (`@openfoodfacts/openfoodfacts-nodejs`, https://github.com/openfoodfacts/openfoodfacts-js).
 *
 * `search` spricht die search-a-licious-API an (`search.openfoodfacts.org`):
 * diese führt bereits server-seitig eine ranggewichtete Volltextsuche
 * inklusive Tippfehlertoleranz durch, daher ist clientseitiges Fuzzy-Matching
 * nicht mehr nötig (siehe `search.ts`).
 *
 * `off` spricht die klassische Product-Opener-API (`world.openfoodfacts.org`)
 * für den Abruf einzelner Produkte per Barcode an (API v3, siehe `offProduct.ts`).
 */
export const off = new OpenFoodFacts(fetch, { country: 'world', language: 'de' })
export const search = new SearchApi(fetch)
