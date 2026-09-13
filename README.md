# NovaNutritio

App für Ernährung basierend auf dem Weight-Set-Point.

Zeigt zu Lebensmitteln den glykämischen Index (GI), die glykämische Last (GL, immer auf
100 g bezogen), den Verarbeitungsgrad nach der NOVA-Klassifikation und die
Omega-6/3-Einordnung an und leitet daraus ein Weight-Set-Point-Signal ab, wie gut ein
Lebensmittel zum Weight-Set-Point-Konzept von Dr. Andrew Jenkinson passt.

## Datenquelle: Open Food Facts

Es gibt keine lokale/extrahierte Datenbasis mehr.

- **Produktdetails** (`src/lib/loadFoodDetail.ts`, `src/lib/offClient.ts`): laufen über
  die offizielle
  [`@openfoodfacts/openfoodfacts-nodejs`](https://github.com/openfoodfacts/openfoodfacts-js)-SDK
  (Product-Opener-API v3, `getProductV3`, `world.openfoodfacts.org`) und werden erst
  geladen, wenn ein Suchtreffer ausgewählt wird. Erst dann werden GI, GL, NOVA und
  Omega-6/3 berechnet (`src/lib/offProduct.ts`).
- **Suche** (`src/lib/search.ts`): läuft bewusst NICHT über die SDK, sondern per
  direktem `fetch` gegen die klassische Volltextsuche
  (`world.openfoodfacts.org/cgi/search.pl`, JSON-Modus). Die SDK bildet zwar auch die
  neuere search-a-licious-API ab (`search.openfoodfacts.org`), diese sendet aber keine
  `Access-Control-Allow-Origin`-Freigabe für beliebige Browser-Origins – Anfragen direkt
  aus dem Browser schlagen mit einem CORS-Fehler fehl (geprüft). `/api/v2/search` der SDK
  wiederum unterstützt laut generierter OpenAPI-Spezifikation keine freie Textsuche, nur
  Tag-/Nährwert-Filter. Die klassische Route durchsucht Produktname/Marke/Schlagwörter
  bereits server-seitig – ein eigenes clientseitiges Fuzzy-Matching ist damit nicht
  nötig, auch wenn sie (anders als search-a-licious) keine Tippfehlertoleranz bietet.
  Liefert bewusst nur Anzeigefelder (Name, Marke, Bild, NOVA-Gruppe) und ist auf Produkte
  mit Deutschland-Bezug eingeschränkt, da eine unbegrenzte Suche in der globalen
  OFF-Datenbank bei generischen Begriffen sehr viele irrelevante Treffer liefert. Die
  Filterung läuft bewusst clientseitig über das zurückgelieferte `countries_tags`-Feld
  (größerer Rohpool wird angefragt, dann im Browser gefiltert) statt über zusätzliche
  Facetten-Query-Parameter am Legacy-Endpunkt – letzteres führte im Test zu HTTP 503.

Open Food Facts liefert keinen glykämischen Index. Für den GI wird daher zunächst per
Namensabgleich in einer kleinen, handkuratierten Referenztabelle
(`src/data/foods.ts`, ~90 Grundnahrungsmittel mit gemessenem/dokumentiertem GI)
nachgeschlagen (`src/lib/giReference.ts`); ohne Treffer schätzt eine Formel den GI aus
den Nährwerten (`src/lib/giEstimate.ts`, grobe Näherung, kein Laborwert).

Omega-6/3 wird berechnet, wenn Open Food Facts gemessene Omega-3/6-Fettsäurewerte für ein
Produkt führt (`omega-3-fat_100g`/`omega-6-fat_100g`, real aber selten gepflegt); sonst
über Kategorie-/Label-/Zutatenlisten-Abgleich eingeordnet (`src/lib/omegaAssessment.ts`).

Die NOVA-Gruppe kommt ausschließlich von Open Food Facts, es wird nichts geschätzt: liegt
keine vor, zeigt die App „NOVA unbestimmt" an.

### CORS / Dev-Proxy

`world.openfoodfacts.org` sendet für Browser-Anfragen von beliebigen Origins keine
`Access-Control-Allow-Origin`-Freigabe. Im Dev-Server (`npm run dev`) läuft jede Anfrage
deshalb über einen Vite-Proxy (`vite.config.ts`, Pfad `/off-api`) server-seitig an
`world.openfoodfacts.org` – dort greift CORS nicht, weil kein Browser-Request an die
Fremd-Domain mehr nötig ist. **Für einen Produktions-Build braucht es eine äquivalente
Lösung auf Hosting-Ebene** (z. B. eine Serverless-Function/Edge-Function, die
`/off-api/*` an `world.openfoodfacts.org` weiterreicht, oder ein Reverse-Proxy-Rewrite),
da der Vite-Dev-Proxy nur für `npm run dev` gilt.

## Entwicklung

```bash
npm install
npm run dev
npm test
```
