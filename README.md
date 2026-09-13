# NovaNutritio

App für Ernährung basierend auf dem Weight-Set-Point.

Zeigt zu Lebensmitteln den glykämischen Index (GI), die glykämische Last (GL, bezogen auf
die tatsächliche Portion – zum Vergleich zusätzlich auch je 100 g), den Verarbeitungsgrad
nach der NOVA-Klassifikation und die Omega-6/3-Einordnung an und leitet daraus ein
Weight-Set-Point-Signal ab, wie gut ein Lebensmittel zum Weight-Set-Point-Konzept von
Dr. Andrew Jenkinson passt.

**Scoring** (`src/lib/assessment.ts`): ein gewichteter Composite-Score aus fünf Faktoren
statt eines Einzelfaktor-Triggers – Jenkinson beschreibt den Sollwert-Effekt als
Zusammenspiel mehrerer Mechanismen, nicht als Ergebnis eines einzelnen "schlechten" Werts.

| Faktor | Gewicht | Logik |
|---|---|---|
| NOVA-Gruppe | 35 % | NOVA 1–2 = Plus, NOVA 4 (ultra-verarbeitet) = stärkstes Minus |
| Glykämische Last (Portion) | 30 % | voll negativ nur bei GI hoch **und** Ballaststoffe niedrig; sonst gemildert (schnelle Insulinspitze bleibt aus) |
| Zuckeranteil | 15 % | ≤5 g/100 g günstig, ≥22,5 g/100 g ungünstig (Ampel-Grenzwerte) |
| Omega-6/3 | 15 % | zählt nur bei Fettanteil >5 g/100 g, sonst neutral |
| Protein-/Ballaststoffdichte | 5 % | reiner Sättigungs-Bonus, nie negativ |

Punkte je Faktor auf einer Skala von -2 bis +2; fehlt ein Faktor (NOVA/GL/Zucker unbekannt),
wird sein Gewicht auf die bekannten Faktoren umgelegt statt ihn als 0 zu werten. Der
gewichtete Gesamtscore wird auf eine 5-stufige Skala gebucketet: 🟢🟢 sehr günstig (≥1.2),
🟢 günstig (≥0.4), ⚪ neutral (>-0.4), 🟡 leicht ungünstig (≥-1.2), 🔴 ungünstig (<-1.2). GL
selbst bleibt an der Standard-Skala (≤10 niedrig, 11–19 mittel, ≥20 hoch, pro Portion,
nicht pro 100 g) orientiert; Jenkinsons Plan nennt dazu ein **tägliches** GL-Budget von
80–150, keine Einzelprodukt-Grenzwerte – jedes Produkt zeigt dazu einen passenden
Kontext-Hinweis.

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

Die Portionsgröße für die GL-Berechnung kommt von OFFs `serving_quantity`, sonst aus
`src/data/portionDefaults.json` (`src/lib/portionDefaults.ts`). Bei Trockenprodukten
(Getreide, Hülsenfrüchte, Reis) ist das bewusst die realistische *trockene* Menge pro
Mahlzeit (z. B. ~60 g, nicht 100 g): die Nährwertangabe dieser Produkte bezieht sich bei
Open Food Facts auf die trockene Rohware, nicht auf die gekochte Form – 100 g trocken
entsprechen je nach Produkt etwa 250–300 g gekocht, was sonst die GL massiv überschätzt.
Konserven-Hülsenfrüchte (bereits gegart) bekommen über eine eigene Keyword-Regel weiterhin
eine größere, verzehrfertige Portion zugeordnet.

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
