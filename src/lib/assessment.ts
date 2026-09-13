import type { AssessableFood, NovaGroup } from '../types'

export type GiCategory = 'niedrig' | 'mittel' | 'hoch' | 'n/a'
export type GlCategory = 'niedrig' | 'mittel' | 'hoch' | 'n/a'

export type SetPointVerdict =
  | 'freundlich'
  | 'neutral'
  | 'belastend'
  | 'stark-belastend'
  | 'unbekannt'

export interface Assessment {
  giCategory: GiCategory
  glCategory: GlCategory
  /** Glykämische Last für die angegebene Referenzportion. */
  glValue: number | null
  novaPoints: number | null
  glycemicPoints: number
  /** Gesamtscore 0 (am set-point-freundlichsten) bis 7 (am belastendsten), null wenn NOVA unbekannt. */
  score: number | null
  verdict: SetPointVerdict
  headline: string
  reasoning: string[]
}

const NOVA_POINTS: Record<NovaGroup, number> = {
  1: 0,
  2: 1,
  3: 2,
  4: 4,
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

function glycemicPointsOf(glCategory: GlCategory): number {
  switch (glCategory) {
    case 'n/a':
    case 'niedrig':
      return 0
    case 'mittel':
      return 1
    case 'hoch':
      return 3
  }
}

const VERDICT_HEADLINE: Record<SetPointVerdict, string> = {
  freundlich: 'Set-Point-freundlich',
  neutral: 'Neutral – in Maßen gut vertretbar',
  belastend: 'Set-Point-belastend',
  'stark-belastend': 'Stark Set-Point-belastend',
  unbekannt: 'Einschätzung unvollständig',
}

function verdictOf(score: number): SetPointVerdict {
  if (score <= 1) return 'freundlich'
  if (score <= 3) return 'neutral'
  if (score <= 5) return 'belastend'
  return 'stark-belastend'
}

/**
 * Vereinfachte, transparente Heuristik in Anlehnung an das
 * Weight-Set-Point-Konzept von Dr. Andrew Jenkinson ("Wie schlank
 * sein Körper sein möchte"): Ultra-verarbeitete Lebensmittel liefern
 * konzentrierte, schnell verfügbare Energie bei geringer Sättigung
 * und hebeln so die Sättigungssignale (u. a. Leptin) aus – das kann
 * den Sollwert der Körperfettregulation langfristig erhöhen. Starke
 * Blutzucker-/Insulinspitzen (hohe glykämische Last) verstärken diesen
 * Effekt zusätzlich. Der NOVA-Verarbeitungsgrad geht daher stärker
 * gewichtet ein als der glykämische Faktor.
 *
 * Dies ist ein didaktisches Hilfsmittel, keine medizinische Bewertung
 * und ersetzt keine individuelle Ernährungsberatung.
 */
export function assessFood(food: AssessableFood): Assessment {
  const giCategory = giCategoryOf(food.gi)
  const glValue = glycemicLoad(food)
  const glCategory = glCategoryOf(glValue)

  const novaPoints = food.nova === null ? null : NOVA_POINTS[food.nova]
  const glycemicPoints = glycemicPointsOf(glCategory)
  const score = novaPoints === null ? null : novaPoints + glycemicPoints
  const verdict = novaPoints === null ? 'unbekannt' : verdictOf(score as number)

  const reasoning: string[] = []

  if (food.nova === null) {
    reasoning.push(
      'NOVA-Verarbeitungsgrad für dieses Produkt nicht bekannt – die Gesamteinschätzung bezieht sich daher nur auf den glykämischen Faktor.',
    )
  } else if (food.nova === 1) {
    reasoning.push(
      'Unverarbeitet bzw. minimal verarbeitet – Ballaststoffe, Struktur und natürliche Sättigungssignale bleiben erhalten.',
    )
  } else if (food.nova === 2) {
    reasoning.push(
      'Verarbeitete kulinarische Zutat: in kleinen Mengen als Teil einer Zubereitung unproblematisch, liefert aber konzentrierte Kalorien.',
    )
  } else if (food.nova === 3) {
    reasoning.push(
      'Verarbeitetes Lebensmittel aus wenigen erkennbaren Zutaten – meist unproblematisch in normalen Mengen.',
    )
  } else {
    reasoning.push(
      'Ultra-verarbeitet: industrielle Formulierung mit Zusatzstoffen, die Sättigungssignale abschwächen und Überkonsum begünstigen können.',
    )
  }

  if (glCategory === 'niedrig' || glCategory === 'n/a') {
    reasoning.push(
      glValue === null
        ? 'Keine relevante Kohlenhydratmenge, daher kaum Einfluss auf Blutzucker/Insulin.'
        : 'Niedrige glykämische Last der Portion – moderater Blutzucker-/Insulinanstieg.',
    )
  } else if (glCategory === 'mittel') {
    reasoning.push('Mittlere glykämische Last der Portion – spürbarer, aber begrenzter Blutzuckeranstieg.')
  } else {
    reasoning.push('Hohe glykämische Last der Portion – deutlicher Blutzucker-/Insulinanstieg möglich.')
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
    novaPoints,
    glycemicPoints,
    score,
    verdict,
    headline: VERDICT_HEADLINE[verdict],
    reasoning,
  }
}
