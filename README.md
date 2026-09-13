# NovaNutritio

App für Ernährung basierend auf dem Weight-Set-Point.

Zeigt zu Lebensmitteln den glykämischen Index (GI), die glykämische Last (GL) und den
Verarbeitungsgrad nach der NOVA-Klassifikation an und leitet daraus eine Einschätzung ab,
wie gut ein Lebensmittel zum Weight-Set-Point-Konzept von Dr. Andrew Jenkinson passt.

## Datenquelle: Open Food Facts

Lebensmittel werden zur Laufzeit über die öffentliche
[Open-Food-Facts-API](https://world.openfoodfacts.org) gesucht (Namens-/Markensuche
sowie Barcode-Abfrage) – es gibt keine lokale Produktdatenbank mehr in der App.

- **NOVA-Verarbeitungsgrad**, Nährwerte (Kohlenhydrate, Zucker, Ballaststoffe, Protein,
  Fett) und Portionsgröße kommen direkt aus der API.
- **Glykämischer Index (GI):** Open Food Facts führt keinen GI. Die App gleicht den
  Produktnamen deshalb per Stichwort-Heuristik mit einer kleinen, kuratierten
  Referenztabelle (`src/data/foods.ts` / `src/lib/giReference.ts`) ab. Gibt es keinen
  passenden Treffer (typischerweise bei Markenprodukten), wird der GI als „nicht
  verfügbar" ausgewiesen statt geraten – die Glykämische Last wird dann ebenfalls nicht
  berechnet.
- Fehlt bei einem Produkt die NOVA-Einstufung, zeigt die App das transparent an
  (`NOVA ?`) statt eine falsche Gesamteinschätzung vorzutäuschen.

### Barcode-Scanner

Über den 📷-Button kann ein Barcode per Kamera gescannt werden (native
[`BarcodeDetector`-API](https://developer.mozilla.org/docs/Web/API/BarcodeDetector),
aktuell v. a. Chrome/Edge auf Desktop/Android, benötigt HTTPS bzw. `localhost` für
Kamerazugriff). In Browsern ohne Unterstützung – oder wenn kein Kamerazugriff möglich
ist – kann der Barcode alternativ manuell eingegeben werden.

## Entwicklung

```bash
npm install
npm run dev
```
