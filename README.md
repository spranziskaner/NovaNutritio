# NovaNutritio

App für Ernährung basierend auf dem Weight-Set-Point.

Zeigt zu Lebensmitteln den glykämischen Index (GI), die glykämische Last (GL), den
Verarbeitungsgrad nach der NOVA-Klassifikation und die Omega-6/3-Einordnung an und leitet
daraus ein Gesamtsignal ab, wie gut ein Lebensmittel zum Weight-Set-Point-Konzept von
Dr. Andrew Jenkinson passt.

## Datenquellen: ausschließlich lokal

Es gibt keinen Live-API-Aufruf mehr. Die App durchsucht zur Laufzeit zwei rein lokale
Quellen:

- **Handkuratierte Referenztabelle** (`src/data/foods.ts`): ~90 Lebensmittel mit
  gemessenem/dokumentiertem GI und vollständigen Nährwerten.
- **Offline-Subset von Open Food Facts** (`public/off-subset.json`): eine mit
  `scripts/extract-off-subset.mjs` aus dem öffentlichen
  [OFF-Bulk-Export](https://world.openfoodfacts.org/data) erzeugte, ca. 20.000 Produkte
  umfassende Teilmenge mit Deutschland-Bezug. Wird einmal pro Seitenaufruf als lokale
  Datei geladen (`src/lib/localOffDump.ts`), danach im Speicher gehalten – kein weiterer
  Netzwerkzugriff.

Beide Quellen laufen durch dieselbe Zuordnungslogik (`src/lib/offProduct.ts` bzw.
`src/lib/localFoodSearch.ts`): GI per Namensabgleich mit der Referenztabelle oder,
falls kein Treffer, per Formel aus den Nährwerten geschätzt (`src/lib/giEstimate.ts`,
grobe Näherung, kein Laborwert); Omega-6/3 ausschließlich über Kategorie-/Label-/
Zutatenlisten-Abgleich (`src/lib/omegaAssessment.ts`), nie berechnet.

### Barcode-Scanner

Über den 📷-Button kann ein Barcode per Kamera gescannt werden (ZXing, läuft
vollständig im Browser). Erkannte bzw. manuell eingegebene Barcodes werden im lokalen
Offline-Subset nachgeschlagen – ohne Internetverbindung nutzbar, findet aber nur
Produkte, die in den ~20.000 extrahierten Einträgen enthalten sind.

## Entwicklung

```bash
npm install
npm run dev
npm test
```
