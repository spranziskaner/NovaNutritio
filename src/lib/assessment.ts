import type { AssessableFood, NovaGroup, OmegaCategory } from '../types'

export type GiCategory = 'niedrig' | 'mittel' | 'hoch' | 'n/a'
export type GlCategory = 'niedrig' | 'mittel' | 'hoch' | 'n/a'
export type GesamtsignalStatus = 'gruen' | 'gelb' | 'rot' | 'unvollstaendig'

export interface Assessment {
  giCategory: GiCategory
  glCategory: GlCategory
  /** Glykämische Last für die angegebene Referenzportion. */
  glValue: number | null
  signal: GesamtsignalStatus
  headline: string
  reasoning: string[]
}

const NOVA_LABEL: Record<NovaGroup, string> = {
  1: 'unverarbeitet / minimal verarbeitet',
  2: 'verarbeitete kulinarische Zutat',
  3: 'verarbeitetes Lebensmittel',
  4: 'ultra-verarbeitetes Lebensmittel',
}

export function novaLabel(nova: NovaGroup): string {
  return NOVA_LABEL[nova]
}

export function giCategoryOf(gi: number | null): GiCategory {
  if (gi === null) return 'n/a'
  if (gi < 55) return 'niedrig'
  if (gi < 70) return 'mittel'
  return 'hoch'
}

export function glycemicLoad(food: Pick<AssessableFood, 'gi' | 'carbsPer100g' | 'portionG'>): number | null {
  if (food.gi === null) return null
  const carbsPerPortion = (food.carbsPer100g * food.portionG) / 100
  return (food.gi * carbsPerPortion) / 100
}

export function glCategoryOf(gl: number | null): GlCategory {
  if (gl === null) return 'n/a'
  if (gl < 10) return 'niedrig'
  if (gl < 20) return 'mittel'
  return 'hoch'
}

const SIGNAL_HEADLINE: Record<GesamtsignalStatus, string> = {
  gruen: 'Gesamtsignal: unauffällig',
  gelb: 'Gesamtsignal: teilweise auffällig',
  rot: 'Gesamtsignal: mehrfach auffällig',
  unvollstaendig: 'Gesamtsignal: unvollständige Datenlage',
}

/**
 * Kombiniertes Gesamtsignal aus NOVA-Verarbeitungsgrad, glykämischer Last
 * und Omega-6/3-Einordnung. Wird nur berechnet, wenn alle drei Werte
 * bekannt sind – bei einem fehlenden Wert gibt es bewusst kein
 * optimistisches Auffüllen, sondern "unvollständige Datenlage". Die
 * Spezifikation nennt nur "NOVA 4 UND (GL hoch ODER Omega ungünstig)" für
 * Rot; den Fall zweier schlechter Kriterien ohne NOVA 4 lässt sie offen –
 * hier gilt daher allgemein: zwei oder mehr schlechte Kriterien = Rot,
 * genau eines = Gelb, keines = Grün.
 */
function signalOf(nova: NovaGroup | null, glCategory: GlCategory, omegaCategory: OmegaCategory): GesamtsignalStatus {
  if (nova === null || glCategory === 'n/a' || omegaCategory === 'unbekannt') return 'unvollstaendig'

  const badCount = [nova === 4, glCategory === 'hoch', omegaCategory === 'unguenstig'].filter(Boolean).length
  if (badCount >= 2) return 'rot'
  if (badCount === 1) return 'gelb'
  return 'gruen'
}

export function assessFood(food: AssessableFood): Assessment {
  const giCategory = giCategoryOf(food.gi)
  const glValue = glycemicLoad(food)
  const glCategory = glCategoryOf(glValue)
  const omegaCategory = food.omega.category
  const signal = signalOf(food.nova, glCategory, omegaCategory)

  const reasoning: string[] = []

  if (food.nova === null) {
    reasoning.push('NOVA-Verarbeitungsgrad für dieses Produkt nicht bekannt.')
  } else if (food.nova === 4) {
    reasoning.push(
      'Ultra-verarbeitet (NOVA 4): industrielle Formulierung, die Sättigungssignale abschwächen kann.',
    )
  } else {
    reasoning.push(`NOVA-Gruppe ${food.nova}: ${novaLabel(food.nova)}.`)
  }

  if (glCategory === 'n/a') {
    reasoning.push(
      food.gi === null
        ? 'GI/GL für dieses Produkt nicht verfügbar.'
        : 'Keine relevante Kohlenhydratmenge, daher kaum Einfluss auf Blutzucker/Insulin.',
    )
  } else if (glCategory === 'niedrig') {
    reasoning.push('Niedrige glykämische Last der Portion – moderater Blutzucker-/Insulinanstieg.')
  } else if (glCategory === 'mittel') {
    reasoning.push('Mittlere glykämische Last der Portion – spürbarer, aber begrenzter Blutzuckeranstieg.')
  } else {
    reasoning.push('Hohe glykämische Last der Portion – deutlicher Blutzucker-/Insulinanstieg möglich.')
  }

  if (omegaCategory === 'unbekannt') {
    reasoning.push('Keine Omega-6/3-Einordnung verfügbar.')
  } else if (food.omega.isWalnutSpecialCase) {
    reasoning.push('Enthält reichlich Omega-3 UND Omega-6 – Sonderfall, nicht pauschal bewertet.')
  } else if (omegaCategory === 'guenstig') {
    reasoning.push('Günstiges Omega-6/3-Verhältnis laut Kategorie-Zuordnung.')
  } else if (omegaCategory === 'unguenstig') {
    reasoning.push('Ungünstiges Omega-6/3-Verhältnis laut Kategorie-/Zutaten-Zuordnung.')
  } else {
    reasoning.push('Neutrale Omega-6/3-Einordnung.')
  }

  if (food.omega.provenanceUnknown) {
    reasoning.push('Herkunft (Weide vs. Mast) nicht bekannt – Einordnung kann abweichen.')
  }

  if ((food.fiberPer100g ?? 0) >= 5) {
    reasoning.push('Hoher Ballaststoffgehalt bremst die Verdauung und unterstützt die Sättigung.')
  }
  if ((food.proteinPer100g ?? 0) >= 15) {
    reasoning.push('Guter Proteingehalt unterstützt Sättigung und dämpft den Blutzuckeranstieg der Mahlzeit.')
  }

  return {
    giCategory,
    glCategory,
    glValue,
    signal,
    headline: SIGNAL_HEADLINE[signal],
    reasoning,
  }
}
