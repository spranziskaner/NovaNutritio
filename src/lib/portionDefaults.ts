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
 *
 * Wichtig für Trockenprodukte (Getreide, Hülsenfrüchte, Reis): deren
 * Nährwertangabe (`carbsPer100g` etc.) bezieht sich bei Open Food Facts auf
 * die trockene Rohware, nicht auf die gekochte/verzehrfertige Form. Die
 * Portionsgröße muss daher ebenfalls die realistische TROCKENE Menge pro
 * Mahlzeit sein (z. B. ~60 g trockener Bulgur, nicht 100 g) – sonst wird die
 * glykämische Last massiv überschätzt (100 g trocken entsprechen je nach
 * Produkt etwa 250–300 g gekocht). Die "canned"/"conserve"-Regel greift
 * bewusst vor der generischen Hülsenfrüchte-Regel: Konserven-Hülsenfrüchte
 * (z. B. Kidneybohnen aus der Dose) sind bereits gegart, ihre Nährwerte
 * beziehen sich auf den abgetropften, verzehrfertigen Zustand – dafür passt
 * die größere, "cooked"-artige Portion.
 */
export function resolvePortionDefault(categoriesTags: string[], category: FoodCategory): number {
  const joined = categoriesTags.join(' ').toLowerCase()
  const specific = data.byCategoryTagKeywords.find((rule) => rule.keywords.some((k) => joined.includes(k)))
  if (specific) return specific.portionG
  return data.byFoodCategory[category] ?? FALLBACK_PORTION_G
}
