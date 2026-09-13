#!/usr/bin/env node
// Extrahiert aus dem vollständigen OpenFoodFacts-JSONL-Export
// (openfoodfacts-products.jsonl.gz, siehe https://world.openfoodfacts.org/data)
// eine kompakte Teilmenge für den Offline-Betrieb von NovaNutritio.
//
// Nutzung:
//   node scripts/extract-off-subset.mjs -i openfoodfacts-products.jsonl.gz -o public/off-subset.json -l 20000
//
// Bei einem Node-"out of memory"-Fehler bei sehr hohem --limit:
//   node --max-old-space-size=4096 scripts/extract-off-subset.mjs ...
//
// Das Ergebnis ist bewusst im rohen OFF-API-Format (wie die Live-Suche es
// liefert) statt im Format der handkuratierten `src/data/foods.ts` – die
// eigentliche Kategorie-/GI-/Omega-Zuordnung übernimmt dieselbe Pipeline wie
// bei Live-API-Treffern (`mapProduct` in `src/lib/openfoodfacts.ts`), damit
// es keine zwei parallelen Logiken gibt und "echte Referenz" (foods.ts) und
// "automatisch zugeordnet" (Massendaten) klar getrennt bleiben.

import { createReadStream, writeFileSync } from 'node:fs'
import { createGunzip } from 'node:zlib'
import { createInterface } from 'node:readline'
import { parseArgs } from 'node:util'

const { values } = parseArgs({
  options: {
    input: { type: 'string', short: 'i' },
    output: { type: 'string', short: 'o', default: 'off-subset.json' },
    limit: { type: 'string', short: 'l', default: '20000' },
    // Ohne diese Flag werden nur Produkte mit Deutschland-Bezug behalten
    // (product_name_de vorhanden ODER countries_tags enthält "en:germany").
    // Mit --all-countries entfällt dieser Filter (deutlich größerer
    // Kandidatenpool, mehr Arbeitsspeicher nötig).
    'all-countries': { type: 'boolean', default: false },
  },
})

if (!values.input) {
  console.error(
    'Nutzung: node scripts/extract-off-subset.mjs -i <pfad-zu-openfoodfacts-products.jsonl.gz> [-o output.json] [-l limit] [--all-countries]',
  )
  process.exit(1)
}

const limit = Number(values.limit)
const requireGermanRelevance = !values['all-countries']

function isGermanRelevant(doc) {
  if (doc.product_name_de) return true
  if (Array.isArray(doc.countries_tags) && doc.countries_tags.includes('en:germany')) return true
  return false
}

/** Je mehr der fünf Kernnährwerte vorhanden sind, desto brauchbarer der Datensatz. */
function completenessScore(nutriments) {
  if (!nutriments) return 0
  const fields = ['carbohydrates_100g', 'sugars_100g', 'fiber_100g', 'proteins_100g', 'fat_100g']
  return fields.filter((f) => typeof nutriments[f] === 'number').length
}

/** Log-skalierter Popularitäts-Bonus, damit bekannte Produkte bei gleicher Vollständigkeit vorgezogen werden. */
function popularityScore(doc) {
  const scans = doc.unique_scans_n ?? doc.scans_n ?? 0
  return Math.log10(1 + scans)
}

const candidates = []
let processed = 0
let kept = 0
let malformed = 0

const input = createReadStream(values.input).pipe(createGunzip())
input.on('error', (err) => {
  console.error('Fehler beim Lesen/Entpacken der Datei – ist die Checksumme (sha256sum) korrekt?', err.message)
  process.exit(1)
})

const rl = createInterface({ input, crlfDelay: Infinity })

rl.on('line', (line) => {
  processed++
  if (processed % 200000 === 0) {
    console.log(`… ${processed.toLocaleString('de-DE')} Zeilen gelesen, ${kept.toLocaleString('de-DE')} übernommen`)
  }
  if (!line.trim()) return

  let doc
  try {
    doc = JSON.parse(line)
  } catch {
    malformed++
    return
  }

  // Dieselbe Mindestanforderung wie `mapProduct()` in openfoodfacts.ts,
  // damit jeder extrahierte Eintrag später auch tatsächlich verwertbar ist.
  const name = (doc.product_name_de || doc.product_name || '').trim()
  const carbs = doc.nutriments?.carbohydrates_100g
  if (!name || !doc.code || typeof carbs !== 'number') return
  if (requireGermanRelevance && !isGermanRelevant(doc)) return

  const score = completenessScore(doc.nutriments) * 10 + popularityScore(doc)

  candidates.push({
    score,
    product: {
      code: doc.code,
      product_name: doc.product_name,
      product_name_de: doc.product_name_de,
      brands: doc.brands,
      categories_tags: doc.categories_tags,
      labels_tags: doc.labels_tags,
      ingredients_text: doc.ingredients_text,
      nova_group: doc.nova_group,
      serving_quantity: doc.serving_quantity,
      nutriments: {
        carbohydrates_100g: doc.nutriments?.carbohydrates_100g,
        sugars_100g: doc.nutriments?.sugars_100g,
        fiber_100g: doc.nutriments?.fiber_100g,
        proteins_100g: doc.nutriments?.proteins_100g,
        fat_100g: doc.nutriments?.fat_100g,
      },
    },
  })
  kept++
})

rl.on('close', () => {
  console.log(
    `Fertig gelesen: ${processed.toLocaleString('de-DE')} Zeilen, ${kept.toLocaleString('de-DE')} Kandidaten, ${malformed.toLocaleString('de-DE')} defekte Zeilen übersprungen.`,
  )
  candidates.sort((a, b) => b.score - a.score)
  const top = candidates.slice(0, limit).map((c) => c.product)
  writeFileSync(values.output, JSON.stringify(top))
  console.log(`Geschrieben: ${top.length.toLocaleString('de-DE')} Produkte -> ${values.output}`)
})
