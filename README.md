# NovaNutritio

App für Ernährung basierend auf dem Weight-Set-Point.

Zeigt zu Lebensmitteln den glykämischen Index (GI), die glykämische Last (GL, immer auf
100 g bezogen), den Verarbeitungsgrad nach der NOVA-Klassifikation und die
Omega-6/3-Einordnung an und leitet daraus ein Weight-Set-Point-Signal ab, wie gut ein
Lebensmittel zum Weight-Set-Point-Konzept von Dr. Andrew Jenkinson passt.

## Datenquelle: Open Food Facts über die offizielle JS-SDK

Es gibt keine lokale/extrahierte Datenbasis mehr. Suche und Produktdaten laufen
vollständig über die offizielle
[`@openfoodfacts/openfoodfacts-nodejs`](https://github.com/openfoodfacts/openfoodfacts-js)-SDK
(browserfähig, siehe `src/lib/offClient.ts`):

- **Suche** (`src/lib/search.ts`): läuft über die search-a-licious-API
  (`search.openfoodfacts.org`). Diese übernimmt Volltextsuche, Relevanz-Ranking und
  Tippfehlertoleranz bereits server-seitig – ein eigenes clientseitiges Fuzzy-Matching
  ist damit nicht nötig. Die Suche liefert bewusst nur Anzeigefelder (Name, Marke, Bild,
  NOVA-Gruppe).
- **Produktdetails** (`src/lib/loadFoodDetail.ts`): werden erst geladen, wenn ein
  Suchtreffer ausgewählt wird (Product-Opener-API v3, `getProductV3`). Erst dann werden
  GI, GL, NOVA und Omega-6/3 berechnet (`src/lib/offProduct.ts`).

Open Food Facts liefert keinen glykämischen Index. Für den GI wird daher zunächst per
Namensabgleich in einer kleinen, handkuratierten Referenztabelle
(`src/data/foods.ts`, ~90 Grundnahrungsmittel mit gemessenem/dokumentiertem GI)
nachgeschlagen (`src/lib/giReference.ts`); ohne Treffer schätzt eine Formel den GI aus
den Nährwerten (`src/lib/giEstimate.ts`, grobe Näherung, kein Laborwert). Omega-6/3 wird
ausschließlich über Kategorie-/Label-/Zutatenlisten-Abgleich eingeordnet
(`src/lib/omegaAssessment.ts`), nie berechnet.

## Entwicklung

```bash
npm install
npm run dev
npm test
```
