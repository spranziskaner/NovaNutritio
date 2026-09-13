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
 * Ordnet ein Lebensmittel per Kategorie-/Label-/Zutaten-Abgleich einer
 * Omega-6/3-Einschätzung zu (Anforderungsdoku Abschnitt 2). OFF liefert
 * keine getrennten Omega-6/3-Werte, daher wird ausschließlich über die
 * lokale Referenztabelle (`omegaCategories.json`) auf Basis von
 * `categories_tags`/`labels_tags` sowie einen Pflanzenöl-Keyword-Scan über
 * `ingredients_text` eingeordnet – nie durch Schätzung aus Nährwerten.
 * Reihenfolge: Zutatenliste schlägt (falls Treffer) immer zu "ungünstig"
 * durch, sonst entscheidet die Kategorie-Zuordnung, sonst "unbekannt".
 */
export function assessOmega(input: OmegaAssessmentInput): OmegaAssessment {
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

  return { category, isWalnutSpecialCase, provenanceUnknown, reasonLabel }
}
