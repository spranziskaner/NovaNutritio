import { OpenFoodFacts } from '@openfoodfacts/openfoodfacts-nodejs'

/**
 * SDK-Client für den Zugriff auf Open Food Facts. Ersetzt die frühere lokale
 * Datenbasis (Offline-Subset + Skript-Extraktion) vollständig: jeder
 * Produktabruf läuft über die offizielle JS/TS-SDK
 * (`@openfoodfacts/openfoodfacts-nodejs`, https://github.com/openfoodfacts/openfoodfacts-js),
 * die klassische Product-Opener-API (`world.openfoodfacts.org`) an – für den
 * Abruf einzelner Produkte per Barcode (API v3, siehe `loadFoodDetail.ts`/
 * `offProduct.ts`).
 *
 * Die Volltextsuche (`search.ts`) läuft NICHT über diesen Client, sondern per
 * direktem `fetch` gegen die klassische `/cgi/search.pl`-Route derselben
 * Domain: die SDK bildet zwar auch die neuere search-a-licious-API ab
 * (`search.openfoodfacts.org`), diese sendet aber keine
 * `Access-Control-Allow-Origin`-Freigabe für beliebige Browser-Origins –
 * Anfragen aus dem Browser schlagen mit einem CORS-Fehler fehl (in der
 * echten App geprüft). `/api/v2/search` der SDK wiederum unterstützt laut
 * generierter OpenAPI-Spezifikation keine freie Textsuche, nur Tag-/
 * Nährwert-Filter. Siehe `search.ts` für Details.
 */
export const off = new OpenFoodFacts(fetch, { country: 'world', language: 'de' })
