import type { FoodCategory, NovaGroup, RemoteFood } from '../types'
import { lookupGi } from './giReference'

const API_BASE = 'https://world.openfoodfacts.org'

const FIELDS = [
  'code',
  'product_name',
  'product_name_de',
  'brands',
  'categories_tags',
  'nova_group',
  'serving_quantity',
  'image_front_small_url',
  'nutriments',
].join(',')

interface OffNutriments {
  carbohydrates_100g?: number
  sugars_100g?: number
  fiber_100g?: number
  proteins_100g?: number
  fat_100g?: number
}

interface OffProduct {
  code: string
  product_name?: string
  product_name_de?: string
  brands?: string
  categories_tags?: string[]
  nova_group?: number
  serving_quantity?: number
  image_front_small_url?: string
  nutriments?: OffNutriments
}

export class OpenFoodFactsError extends Error {}

async function offFetch(url: string, signal?: AbortSignal): Promise<unknown> {
  let res: Response
  try {
    res = await fetch(url, { signal })
  } catch (err) {
    if (err instanceof DOMException && err.name === 'AbortError') throw err
    throw new OpenFoodFactsError('Open Food Facts ist gerade nicht erreichbar. Bitte Internetverbindung prüfen.')
  }
  if (!res.ok) {
    throw new OpenFoodFactsError(`Open Food Facts antwortete mit Status ${res.status}.`)
  }
  return res.json()
}

/** Sucht Produkte über die Open-Food-Facts-Volltextsuche nach Produktname/Marke. */
export async function searchProductsByName(
  query: string,
  opts?: { signal?: AbortSignal; pageSize?: number },
): Promise<RemoteFood[]> {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: String(opts?.pageSize ?? 24),
    fields: FIELDS,
    lc: 'de',
  })
  const data = (await offFetch(`${API_BASE}/cgi/search.pl?${params.toString()}`, opts?.signal)) as {
    products?: OffProduct[]
  }
  return mapProducts(data.products ?? [])
}

/** Lädt genau ein Produkt anhand seines EAN/UPC-Barcodes (z. B. per Scanner ermittelt). */
export async function getProductByBarcode(
  barcode: string,
  opts?: { signal?: AbortSignal },
): Promise<RemoteFood | null> {
  const params = new URLSearchParams({ fields: FIELDS })
  const data = (await offFetch(
    `${API_BASE}/api/v2/product/${encodeURIComponent(barcode)}.json?${params.toString()}`,
    opts?.signal,
  )) as { status?: number; product?: OffProduct }
  if (data.status !== 1 || !data.product) return null
  return mapProduct(data.product)
}

function mapProducts(products: OffProduct[]): RemoteFood[] {
  const seen = new Set<string>()
  const result: RemoteFood[] = []
  for (const p of products) {
    const mapped = mapProduct(p)
    if (mapped && !seen.has(mapped.id)) {
      seen.add(mapped.id)
      result.push(mapped)
    }
  }
  return result
}

function mapProduct(p: OffProduct): RemoteFood | null {
  const name = (p.product_name_de || p.product_name)?.trim()
  const carbsPer100g = p.nutriments?.carbohydrates_100g
  if (!name || !p.code || carbsPer100g === undefined) return null

  const nova: NovaGroup | null =
    p.nova_group === 1 || p.nova_group === 2 || p.nova_group === 3 || p.nova_group === 4 ? p.nova_group : null
  const category = guessCategory(p.categories_tags ?? [])
  const giMatch = lookupGi(name)
  const portionG =
    p.serving_quantity && p.serving_quantity > 0 ? Math.round(p.serving_quantity) : (giMatch?.portionG ?? 100)

  return {
    id: p.code,
    barcode: p.code,
    name,
    brand: p.brands?.split(',')[0]?.trim() || undefined,
    category,
    imageUrl: p.image_front_small_url,
    gi: giMatch?.gi ?? null,
    giSource: giMatch ? 'referenz' : 'unbekannt',
    portionG,
    carbsPer100g,
    sugarPer100g: p.nutriments?.sugars_100g,
    fiberPer100g: p.nutriments?.fiber_100g,
    proteinPer100g: p.nutriments?.proteins_100g,
    fatPer100g: p.nutriments?.fat_100g,
    nova,
    novaNote: nova
      ? `NOVA-Gruppe ${nova} laut Open Food Facts (automatisch aus der Zutatenliste ermittelt).`
      : 'Open Food Facts hat für dieses Produkt (noch) keine NOVA-Einstufung hinterlegt.',
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
