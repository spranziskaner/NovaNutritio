import type { FoodCategory } from '../types'
import portionData from '../data/portionDefaults.json'

interface PortionRule {
  keywords: string[]
  portionG: number
}

interface PortionReferenceData {
  byCategoryTagKeywords: PortionRule[]
  byFoodCategory: Record<FoodCategory, number>
}

const data = portionData as PortionReferenceData
const FALLBACK_PORTION_G = 100

/**
 * Ermittelt eine Standardportionsgröße, wenn Open Food Facts keine
 * `serving_quantity` liefert und kein Treffer in der GI-Referenztabelle
 * vorliegt (Anforderungsdoku 1.5). Reihenfolge: spezifische
 * OFF-Kategorie-Keywords vor grober interner Kategorie vor absolutem
 * Fallback.
 */
export function resolvePortionDefault(categoriesTags: string[], category: FoodCategory): number {
  const joined = categoriesTags.join(' ').toLowerCase()
  const specific = data.byCategoryTagKeywords.find((rule) => rule.keywords.some((k) => joined.includes(k)))
  if (specific) return specific.portionG
  return data.byFoodCategory[category] ?? FALLBACK_PORTION_G
}
