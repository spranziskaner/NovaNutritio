import type { FoodSummary } from '../types'
import { search } from './offClient'

const SEARCH_FIELDS = 'code,product_name,product_name_de,brands,image_front_small_url,nova_group'

interface SearchHit {
  code?: string
  product_name?: string
  product_name_de?: string
  brands?: string
  image_front_small_url?: string
  nova_group?: number
}

/**
 * Durchsucht ausschließlich Open Food Facts über die offizielle SDK
 * (`@openfoodfacts/openfoodfacts-nodejs`, https://github.com/openfoodfacts/openfoodfacts-js).
 * Die search-a-licious-API (`search.openfoodfacts.org`) übernimmt Volltextsuche,
 * Relevanz-Ranking und Tippfehlertoleranz bereits server-seitig – ein eigenes
 * clientseitiges Fuzzy-Matching (frühere `fuzzySearch.ts`) ist damit nicht
 * mehr nötig.
 *
 * Liefert bewusst nur Anzeigefelder (`FoodSummary`): GI/GL/NOVA/Omega werden
 * erst berechnet, wenn ein Treffer ausgewählt wird (siehe `loadFoodDetail.ts`),
 * statt für jeden Treffer der Liste unnötig Nährwerte anzufragen.
 */
export async function searchFoods(query: string, pageSize = 30): Promise<FoodSummary[]> {
  const { data } = await search.searchGet({
    q: query,
    langs: 'de,en',
    page_size: pageSize,
    fields: SEARCH_FIELDS,
  })

  if (!data || !('hits' in data)) return []

  return (data.hits as SearchHit[])
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
