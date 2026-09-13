import type { FoodSummary } from '../types'

// Über den Vite-Dev-Proxy (`vite.config.ts`) statt direkt gegen
// `world.openfoodfacts.org`: die Domain sendet keine
// `Access-Control-Allow-Origin`-Freigabe für Browser-Anfragen (siehe
// Kommentar an `offClient.ts`).
const SEARCH_URL = '/off-api/cgi/search.pl'
const SEARCH_FIELDS = 'code,product_name,product_name_de,brands,image_front_small_url,nova_group,countries_tags'
/** Rohe Trefferzahl je Anfrage, bevor clientseitig auf Deutschland-Bezug gefiltert wird. */
const RAW_RESULT_MULTIPLIER = 3

interface SearchHit {
  code?: string
  product_name?: string
  product_name_de?: string
  brands?: string
  image_front_small_url?: string
  nova_group?: number
  countries_tags?: string[]
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
 *
 * Auf den deutschen Markt eingeschränkt – aber bewusst clientseitig per
 * `countries_tags`-Filter statt über zusätzliche Facetten-Query-Parameter
 * (`tagtype_0`/`tag_0` o. Ä.) an `/cgi/search.pl`: dieser (nicht offiziell
 * typisierte) Legacy-Endpunkt reagierte auf die Kombination aus freiem
 * `search_terms` und Facetten-Parametern im Test mit HTTP 503. Stattdessen
 * wird ein größerer Rohpool angefragt und die Deutschland-Eingrenzung danach
 * im Browser angewendet – Open Food Facts ist eine globale Datenbank, ohne
 * Eingrenzung kommen bei generischen Suchbegriffen sehr viele, für den
 * deutschsprachigen Anwendungsfall irrelevante Treffer zurück.
 */
export async function searchFoods(query: string, pageSize = 30): Promise<FoodSummary[]> {
  const params = new URLSearchParams({
    search_terms: query,
    search_simple: '1',
    action: 'process',
    json: '1',
    page_size: String(pageSize * RAW_RESULT_MULTIPLIER),
    fields: SEARCH_FIELDS,
  })

  const response = await fetch(`${SEARCH_URL}?${params}`)
  if (!response.ok) {
    console.error('OFF-Suche: Fehlerstatus', response.status, response.statusText)
    throw new Error(`Open-Food-Facts-Suche fehlgeschlagen (Status ${response.status}).`)
  }

  const data = (await response.json()) as SearchResponse

  return (data.products ?? [])
    .filter((hit): hit is SearchHit & { code: string } => Boolean(hit.code))
    .filter(isGermanProduct)
    .slice(0, pageSize)
    .map(toFoodSummary)
}

function isGermanProduct(hit: SearchHit): boolean {
  return (hit.countries_tags ?? []).some((tag) => tag.toLowerCase().includes('germany'))
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
