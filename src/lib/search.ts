import type { FoodSummary } from '../types'

const SEARCH_URL = 'https://world.openfoodfacts.org/cgi/search.pl'
const SEARCH_FIELDS = 'code,product_name,product_name_de,brands,image_front_small_url,nova_group'

interface SearchHit {
  code?: string
  product_name?: string
  product_name_de?: string
  brands?: string
  image_front_small_url?: string
  nova_group?: number
}

interface SearchResponse {
  products?: SearchHit[]
}

/**
 * Durchsucht Open Food Facts über die klassische Volltextsuche
 * (`world.openfoodfacts.org/cgi/search.pl`, JSON-Modus). Bewusst NICHT über
 * die SDK-Klasse für die neuere search-a-licious-API: die sendet keine
 * `Access-Control-Allow-Origin`-Freigabe für beliebige Browser-Origins –
 * Anfragen direkt aus dem Browser schlagen mit einem CORS-Fehler fehl
 * (empirisch geprüft). `/api/v2/search` der SDK wiederum unterstützt laut
 * generierter OpenAPI-Spezifikation keine freie Textsuche (`search_terms`),
 * nur Tag-/Nährwert-Filter. `/cgi/search.pl` ist daher (noch) nicht Teil der
 * generierten SDK-Typen, aber die einzige Open-Food-Facts-Volltextsuche, die
 * seit Jahren direkt aus dem Browser funktioniert.
 *
 * Der Server durchsucht Produktname/Marke/Schlagwörter bereits selbst
 * (MongoDB-Textsuche) – ein eigenes clientseitiges Fuzzy-Matching (frühere
 * `fuzzySearch.ts`) ist damit nicht nötig, auch wenn diese klassische Suche
 * (anders als search-a-licious) keine Tippfehlertoleranz bietet.
 *
 * Liefert bewusst nur Anzeigefelder (`FoodSummary`): GI/GL/NOVA/Omega werden
 * erst berechnet, wenn ein Treffer ausgewählt wird (siehe `loadFoodDetail.ts`).
 */
export async function searchFoods(query: string, pageSize = 30): Promise<FoodSummary[]> {
  const url = new URL(SEARCH_URL)
  url.searchParams.set('search_terms', query)
  url.searchParams.set('search_simple', '1')
  url.searchParams.set('action', 'process')
  url.searchParams.set('json', '1')
  url.searchParams.set('page_size', String(pageSize))
  url.searchParams.set('fields', SEARCH_FIELDS)

  const response = await fetch(url)
  if (!response.ok) {
    console.error('OFF-Suche: Fehlerstatus', response.status, response.statusText)
    throw new Error(`Open-Food-Facts-Suche fehlgeschlagen (Status ${response.status}).`)
  }

  const data = (await response.json()) as SearchResponse

  return (data.products ?? [])
    .filter((hit): hit is SearchHit & { code: string } => Boolean(hit.code))
    .map(toFoodSummary)
}

function toFoodSummary(hit: SearchHit & { code: string }): FoodSummary {
  const nova: FoodSummary['nova'] =
    hit.nova_group === 1 || hit.nova_group === 2 || hit.nova_group === 3 || hit.nova_group === 4
      ? hit.nova_group
      : null

  return {
    id: hit.code,
    barcode: hit.code,
    name: (hit.product_name_de || hit.product_name || hit.code).trim(),
    brand: hit.brands?.split(',')[0]?.trim() || undefined,
    imageUrl: hit.image_front_small_url,
    nova,
  }
}
