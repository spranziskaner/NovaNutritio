import type { FoodCategory, OmegaAssessment, OmegaCategory } from '../types'
import omegaData from '../data/omegaCategories.json'
import plantOilKeywords from '../data/plantOilKeywords.json'

interface OmegaCategoryEntry {
  id: string
  categoryTagKeywords: string[]
  isWalnut?: boolean
  category?: OmegaCategory
  labelDependent?: boolean
  withLabel?: OmegaCategory
  withoutLabel?: OmegaCategory
}

interface OmegaReferenceData {
  favorableProvenanceLabelKeywords: string[]
  entries: OmegaCategoryEntry[]
}

const data = omegaData as OmegaReferenceData
const oilKeywords = plantOilKeywords as string[]

export interface OmegaAssessmentInput {
  category: FoodCategory
  categoriesTags: string[]
  labelsTags: string[]
  ingredientsText?: string
  /** Gemessene Omega-3-Fettsäuren je 100g (OFF-Nutriment `omega-3-fat_100g`), falls vorhanden. */
  omega3Per100g?: number
  /** Gemessene Omega-6-Fettsäuren je 100g (OFF-Nutriment `omega-6-fat_100g`), falls vorhanden. */
  omega6Per100g?: number
}

/**
 * Schwellenwerte für die Einordnung eines gemessenen Omega-6/3-Verhältnisses.
 * Traditionelle/historische Ernährung lag bei etwa 1:1 bis 4:1 (günstig,
 * entzündungsarm); moderne, pflanzenölreiche Ernährung liegt häufig bei
 * 15:1 oder höher (Simopoulos, "The importance of the ratio of omega-6/
 * omega-3 essential fatty acids", 2002/2016) – grobe Orientierung nach
 * gängiger Ernährungswissenschaft, kein Laborstandard.
 */
const RATIO_FAVORABLE_MAX = 4
const RATIO_NEUTRAL_MAX = 10

function categoryFromRatio(ratio: number): OmegaCategory {
  if (ratio <= RATIO_FAVORABLE_MAX) return 'guenstig'
  if (ratio <= RATIO_NEUTRAL_MAX) return 'neutral'
  return 'unguenstig'
}

function hasFavorableProvenanceLabel(labelsTags: string[]): boolean {
  const joined = labelsTags.join(' ').toLowerCase()
  return data.favorableProvenanceLabelKeywords.some((k) => joined.includes(k))
}

function matchesPlantOilKeyword(ingredientsText: string | undefined): boolean {
  if (!ingredientsText) return false
  const lower = ingredientsText.toLowerCase()
  return oilKeywords.some((k) => lower.includes(k.toLowerCase()))
}

/**
 * Ordnet ein Lebensmittel einer Omega-6/3-Einschätzung zu. Priorität 1: Open
 * Food Facts liefert für manche Produkte tatsächlich gemessene Omega-3/6-
 * Fettsäurewerte (`omega-3-fat_100g`/`omega-6-fat_100g`) – wenn vorhanden,
 * wird das reale Verhältnis berechnet statt geraten. Nur wenn diese Werte
 * fehlen (der weit überwiegende Teil der Produkte), greift die bisherige
 * Heuristik per Kategorie-/Label-/Zutaten-Abgleich (Anforderungsdoku
 * Abschnitt 2): lokale Referenztabelle (`omegaCategories.json`) auf Basis von
 * `categories_tags`/`labels_tags` sowie ein Pflanzenöl-Keyword-Scan über
 * `ingredients_text`. Reihenfolge dabei: Zutatenliste schlägt (falls
 * Treffer) immer zu "ungünstig" durch, sonst entscheidet die
 * Kategorie-Zuordnung, sonst "unbekannt".
 */
export function assessOmega(input: OmegaAssessmentInput): OmegaAssessment {
  if (input.omega3Per100g !== undefined && input.omega6Per100g !== undefined && input.omega3Per100g > 0) {
    const ratio = input.omega6Per100g / input.omega3Per100g
    return {
      category: categoryFromRatio(ratio),
      isWalnutSpecialCase: false,
      provenanceUnknown: false,
      reasonLabel: `Berechnet aus gemessenen Nährwerten: Omega-6/3-Verhältnis ≈ ${ratio.toFixed(1)}:1.`,
      ratio,
    }
  }

  const joinedTags = input.categoriesTags.join(' ').toLowerCase()
  const favorableLabel = hasFavorableProvenanceLabel(input.labelsTags)

  let category: OmegaCategory = 'unbekannt'
  let isWalnutSpecialCase = false
  let reasonLabel = 'Keine passende Kategorie in der lokalen Referenztabelle gefunden.'

  for (const entry of data.entries) {
    if (!entry.categoryTagKeywords.some((k) => joinedTags.includes(k))) continue
    category = entry.labelDependent
      ? (favorableLabel ? entry.withLabel : entry.withoutLabel) ?? 'unbekannt'
      : (entry.category ?? 'unbekannt')
    isWalnutSpecialCase = entry.isWalnut ?? false
    reasonLabel = `Kategorie „${entry.id}" laut Open-Food-Facts-Kategorien.`
    break
  }

  if (matchesPlantOilKeyword(input.ingredientsText)) {
    category = 'unguenstig'
    isWalnutSpecialCase = false
    reasonLabel = 'Zutatenliste enthält ein Omega-6-lastiges Pflanzenöl.'
  }

  const provenanceUnknown = input.category === 'fleisch-fisch-eier' && !favorableLabel

  return { category, isWalnutSpecialCase, provenanceUnknown, reasonLabel, ratio: null }
}
