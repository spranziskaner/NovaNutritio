import type { FoodCategory, GiSource, NovaGroup, RemoteFood } from '../types'
import { lookupGi } from './giReference'
import { estimateGiFromMacros } from './giEstimate'
import { assessOmega } from './omegaAssessment'
import { resolvePortionDefault } from './portionDefaults'

interface OffNutriments {
  carbohydrates_100g?: number
  sugars_100g?: number
  fiber_100g?: number
  proteins_100g?: number
  fat_100g?: number
}

/**
 * Produktformat, wie es von der Open-Food-Facts-API v3 für die von uns
 * angefragten `fields` zurückkommt (siehe `loadFoodDetail.ts`). Bewusst als
 * einfaches, eigenes Interface modelliert statt die generierten SDK-Typen
 * direkt zu verwenden: die SDK (Stand 2.0.0-alpha) bildet das Rückgabeformat
 * als tief verschachtelten bedingten Typ ab, der von den angefragten Feldern
 * abhängt – für unsere feste Feldauswahl ist ein flaches Interface robuster
 * und entkoppelt uns von internen Typänderungen der (noch instabilen) SDK.
 */
export interface OffProductV3 {
  code: string
  product_name?: string
  product_name_de?: string
  brands?: string
  categories_tags?: string[]
  labels_tags?: string[]
  ingredients_text?: string
  nova_group?: number
  serving_quantity?: number
  image_front_url?: string
  nutriments?: OffNutriments
}

/**
 * Wandelt ein von der Open-Food-Facts-API v3 geladenes Produkt
 * (`loadFoodDetail.ts`) in ein `RemoteFood` um: GI-Referenzabgleich bzw.
 * Formel-Schätzung, Omega-6/3-Einordnung und Kategorie-Zuordnung.
 */
export function mapOffProduct(p: OffProductV3): RemoteFood | null {
  const name = (p.product_name_de || p.product_name)?.trim()
  const carbsPer100g = p.nutriments?.carbohydrates_100g
  if (!name || !p.code || carbsPer100g === undefined) return null

  const nova: NovaGroup | null =
    p.nova_group === 1 || p.nova_group === 2 || p.nova_group === 3 || p.nova_group === 4 ? p.nova_group : null
  const category = guessCategory(p.categories_tags ?? [])
  const giMatch = lookupGi(name)
  const portionG =
    p.serving_quantity && p.serving_quantity > 0
      ? Math.round(p.serving_quantity)
      : (giMatch?.portionG ?? resolvePortionDefault(p.categories_tags ?? [], category))

  const omega = assessOmega({
    category,
    categoriesTags: p.categories_tags ?? [],
    labelsTags: p.labels_tags ?? [],
    ingredientsText: p.ingredients_text,
  })

  let gi: number | null
  let giSource: GiSource
  if (giMatch) {
    gi = giMatch.gi
    giSource = 'referenz'
  } else {
    const estimated = estimateGiFromMacros({
      category,
      carbsPer100g,
      sugarPer100g: p.nutriments?.sugars_100g,
      fiberPer100g: p.nutriments?.fiber_100g,
      proteinPer100g: p.nutriments?.proteins_100g,
      fatPer100g: p.nutriments?.fat_100g,
    })
    gi = estimated
    giSource = estimated === null ? 'unbekannt' : 'berechnet'
  }

  return {
    id: p.code,
    barcode: p.code,
    name,
    brand: p.brands?.split(',')[0]?.trim() || undefined,
    category,
    imageUrl: p.image_front_url,
    gi,
    giSource,
    portionG,
    carbsPer100g,
    sugarPer100g: p.nutriments?.sugars_100g,
    fiberPer100g: p.nutriments?.fiber_100g,
    proteinPer100g: p.nutriments?.proteins_100g,
    fatPer100g: p.nutriments?.fat_100g,
    nova,
    omega,
    novaNote: nova
      ? `NOVA-Gruppe ${nova} laut Open Food Facts (automatisch aus der Zutatenliste ermittelt).`
      : 'Für dieses Produkt liegt keine NOVA-Einstufung vor.',
  }
}

const CATEGORY_KEYWORDS: Array<[FoodCategory, string[]]> = [
  ['obst', ['fruits', 'fruit', 'obst']],
  ['gemuese', ['vegetables', 'gemuese', 'gemüse', 'potatoes', 'kartoffel']],
  [
    'getreide',
    ['cereals', 'breads', 'pastas', 'rice', 'getreide', 'brot', 'nudeln', 'reis', 'flakes', 'mueslis', 'müsli'],
  ],
  ['huelsenfruechte', ['legumes', 'hulsenfruchte', 'huelsenfruchte', 'tofu', 'lentils', 'linsen']],
  ['nuesse-samen', ['nuts', 'seeds', 'nuesse', 'nüsse', 'samen']],
  ['milchprodukte', ['dairies', 'milk', 'cheeses', 'yogurts', 'milchprodukte', 'joghurt', 'kaese', 'käse']],
  ['fleisch-fisch-eier', ['meats', 'fishes', 'eggs', 'poultry', 'fleisch', 'fisch', 'eier', 'wurst']],
  ['suess-snacks', ['sweets', 'chocolates', 'snacks', 'biscuits', 'candies', 'suess', 'süß', 'kuchen', 'cookies']],
  ['getraenke', ['beverages', 'waters', 'juices', 'sodas', 'getraenke', 'getränke']],
  ['fertiggerichte-fastfood', ['meals', 'pizzas', 'fast-foods', 'ready', 'fertiggerichte']],
  ['oele-fette', ['fats', 'oils', 'butters', 'oele', 'öle', 'fette']],
]

function guessCategory(categoriesTags: string[]): FoodCategory {
  const joined = categoriesTags.join(' ').toLowerCase()
  for (const [category, keywords] of CATEGORY_KEYWORDS) {
    if (keywords.some((k) => joined.includes(k))) return category
  }
  return 'sonstiges'
}
