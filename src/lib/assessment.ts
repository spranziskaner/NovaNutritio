import type { AssessableFood, NovaGroup, OmegaCategory } from '../types'

export type GiCategory = 'niedrig' | 'mittel' | 'hoch' | 'n/a'
export type GlCategory = 'niedrig' | 'mittel' | 'hoch' | 'n/a'

/**
 * 5-stufiges Weight-Set-Point-Ergebnis (plus technischer Sonderfall
 * `nicht_bewertbar`, wenn wirklich gar nichts bekannt ist). Ergebnis eines
 * gewichteten Composite-Scores (siehe `assessFood`) statt eines
 * Einzelfaktor-Triggers: Jenkinsons Modell beschreibt den Sollwert-Effekt
 * ausdrücklich als Zusammenspiel mehrerer Faktoren (Insulin/Leptin, NOVA,
 * Omega-6/3), nicht als Resultat eines einzelnen "schlechten" Werts.
 */
export type WeightSetPointStatus =
  | 'sehr_guenstig'
  | 'guenstig'
  | 'neutral'
  | 'leicht_unguenstig'
  | 'unguenstig'
  | 'nicht_bewertbar'

export const STATUS_DOT: Record<WeightSetPointStatus, string> = {
  sehr_guenstig: 'bg-emerald-600',
  guenstig: 'bg-emerald-400',
  neutral: 'bg-stone-400',
  leicht_unguenstig: 'bg-amber-500',
  unguenstig: 'bg-rose-500',
  nicht_bewertbar: 'bg-stone-300',
}

export const STATUS_EMOJI: Record<WeightSetPointStatus, string> = {
  sehr_guenstig: '🟢🟢',
  guenstig: '🟢',
  neutral: '⚪',
  leicht_unguenstig: '🟡',
  unguenstig: '🔴',
  nicht_bewertbar: '⚪',
}

export interface Assessment {
  giCategory: GiCategory
  glCategory: GlCategory
  /** Glykämische Last für die tatsächliche Portion – Bewertungsgrundlage (siehe `glycemicLoad`). */
  glValue: number | null
  /** Glykämische Last je 100 g – nur zum Vergleich, NICHT die Bewertungsgrundlage. */
  glValuePer100g: number | null
  /** Kontext-Hinweis zu Jenkinsons Tagesbudget (80–150 GL/Tag), passend zu `glCategory`. */
  glContextHint: string | null
  signal: WeightSetPointStatus
  /** Gewichteter Composite-Score (-2 … +2), auf dem `signal` beruht. null nur bei `nicht_bewertbar`. */
  compositeScore: number | null
  /** true, wenn mindestens einer der ausschlaggebenden Faktoren (NOVA, GL, Zucker, Omega) nicht bekannt war. */
  signalIncomplete: boolean
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

/**
 * Glykämische Last für die tatsächliche Portion (GI × verfügbare
 * Kohlenhydrate der Portion / 100) – die in der Literatur (und bei
 * Jenkinson) übliche Definition, und die Bewertungsgrundlage dieser App.
 * Eine 100-g-Bezugsgröße wäre bei Trockenprodukten (Getreide,
 * Hülsenfrüchte) irreführend: deren Nährwertangabe bezieht sich meist auf
 * die trockene Rohware, die aber niemand portionsweise trocken isst – siehe
 * `resolvePortionDefault` für die realistischen Portionsgrößen.
 */
export function glycemicLoad(food: Pick<AssessableFood, 'gi' | 'carbsPer100g' | 'portionG'>): number | null {
  if (food.gi === null) return null
  const carbsPerPortion = (food.carbsPer100g * food.portionG) / 100
  return (food.gi * carbsPerPortion) / 100
}

/**
 * Glykämische Last je 100 g – rein informativ zum Vergleich zwischen
 * Lebensmitteln unabhängig von der Portionsgröße. Fließt NICHT in die
 * Weight-Set-Point-Bewertung ein (siehe `glycemicLoad`).
 */
export function glycemicLoadPer100g(food: Pick<AssessableFood, 'gi' | 'carbsPer100g'>): number | null {
  if (food.gi === null) return null
  return (food.gi * food.carbsPer100g) / 100
}

export function glCategoryOf(gl: number | null): GlCategory {
  if (gl === null) return 'n/a'
  if (gl < 10) return 'niedrig'
  if (gl < 20) return 'mittel'
  return 'hoch'
}

/**
 * Kontext-Hinweis zu Jenkinsons Tagesbudget: Step 5 seines Plans nennt eine
 * tägliche glykämische Last von anfangs max. 100, langfristig 80 als Ziel –
 * keine Einzelprodukt-Grenzwerte. Eine einzelne "hohe" GL-Portion ist damit
 * kein Alarmsignal für sich, sondern eine von mehreren Portionen, die ins
 * Tagesbudget passen müssen.
 */
const GL_CONTEXT_HINT: Record<'niedrig' | 'mittel' | 'hoch', string> = {
  niedrig: 'Passt beliebig oft in Jenkinsons Tagesbudget (80–150 GL/Tag).',
  mittel: 'Im Rahmen von Jenkinsons Tagesbudget (80–150 GL/Tag) etwa 3–5× täglich vertretbar.',
  hoch: 'Bewusst einplanen und idealerweise mit Gemüse/Eiweiß kombinieren, um im Tagesbudget (80–150 GL/Tag) zu bleiben.',
}

/**
 * Bewusst gerichtete Formulierung statt neutraler Begriffe wie
 * "unauffällig/auffällig": das Weight-Set-Point-Konzept beschreibt eine
 * Richtungswirkung (der Körper reguliert sein "Wunschgewicht" hormonell nach
 * oben oder hält es stabil) – kein Lebensmittel senkt den Sollwert einzeln
 * nachweisbar ab, aber wiederkehrender Konsum kann ihn anheben.
 */
const SIGNAL_HEADLINE: Record<WeightSetPointStatus, string> = {
  sehr_guenstig: 'Weight-Set-Point: sehr günstige Wirkung',
  guenstig: 'Weight-Set-Point: günstige Wirkung',
  neutral: 'Weight-Set-Point: neutral',
  leicht_unguenstig: 'Weight-Set-Point: leicht ungünstige Wirkung',
  unguenstig: 'Weight-Set-Point: ungünstige Wirkung',
  nicht_bewertbar: 'Weight-Set-Point: nicht bewertbar',
}

// Reale, anerkannte Schwellenwerte statt frei erfundener Zahlen:
/** EU-Verordnung (EG) Nr. 1924/2006: "Ballaststoffquelle" ab 3g/100g. */
const FIBER_SOURCE_THRESHOLD_G = 3
/** Etablierte Lebensmittel-Kennzeichnung (u. a. UK/EU-Ampel): "kein/niedriger Zucker" bis 5g/100g. */
const SUGAR_LOW_THRESHOLD_G = 5
/** Etablierte Lebensmittel-Kennzeichnung (u. a. UK/EU-Ampel): "hoher Zucker" ab 22,5g/100g. */
const SUGAR_HIGH_THRESHOLD_G = 22.5
/** Fettanteil, ab dem Omega-6/3 laut Anforderung überhaupt eine relevante Fettquelle darstellt. */
const FAT_RELEVANT_THRESHOLD_G = 5
/** Bereits an anderer Stelle der App verwendete Schwelle für "guten Proteingehalt". */
const PROTEIN_HIGH_THRESHOLD_G = 15

/** Gewichtung der fünf Faktoren im Composite-Score (Summe = 1). */
const WEIGHTS = {
  nova: 0.35,
  gl: 0.3,
  sugar: 0.15,
  omega: 0.15,
  proteinFiber: 0.05,
}

/** NOVA 1–2 = Plus (kaum/keine Zusatzstoffe), NOVA 4 = härtestes Minus ("giftige Dreifaltigkeit"). */
function novaPoints(nova: NovaGroup): number {
  if (nova === 1) return 2
  if (nova === 2) return 1
  if (nova === 3) return -1
  return -2
}

/**
 * GL ist die Basis, GI und Ballaststoffe wirken als Modifikatoren: eine hohe
 * GL ist nur dann stark negativ ("das eigentliche Problem" laut Jenkinson –
 * eine schnelle Insulinspitze), wenn zusätzlich der GI hoch UND die
 * Ballaststoffe niedrig sind. Ist der GI dagegen niedrig/mittel oder liegen
 * genug Ballaststoffe vor, wird dieselbe GL nur noch milde negativ bewertet
 * (z. B. Kichererbsen-Fusilli: hohe GL, aber niedriger GI).
 */
function glPoints(glCategory: GlCategory, giCategory: GiCategory, fiberPer100g: number | undefined): number {
  if (glCategory === 'niedrig') return 2
  if (glCategory === 'mittel') return 0
  if (glCategory === 'n/a') return 0
  const giHigh = giCategory === 'hoch'
  const fiberLow = (fiberPer100g ?? 0) < FIBER_SOURCE_THRESHOLD_G
  return giHigh && fiberLow ? -2 : -1
}

function sugarPoints(sugarPer100g: number): number {
  if (sugarPer100g <= SUGAR_LOW_THRESHOLD_G) return 2
  if (sugarPer100g >= SUGAR_HIGH_THRESHOLD_G) return -2
  return 0
}

/** Omega-6/3 nur werten, wenn der Fettanteil überhaupt relevant ist – sonst neutral (0), nie negativ. */
function omegaPoints(omegaCategory: OmegaCategory, fatPer100g: number | undefined): number {
  if ((fatPer100g ?? 0) <= FAT_RELEVANT_THRESHOLD_G) return 0
  if (omegaCategory === 'guenstig') return 2
  if (omegaCategory === 'unguenstig') return -2
  return 0
}

/** Reiner Bonus (nie negativ): hoher Protein- ODER Ballaststoffgehalt unterstützt die Sättigung (PYY-Signal). */
function proteinFiberPoints(proteinPer100g: number | undefined, fiberPer100g: number | undefined): number {
  const highProtein = (proteinPer100g ?? 0) >= PROTEIN_HIGH_THRESHOLD_G
  const highFiber = (fiberPer100g ?? 0) >= FIBER_SOURCE_THRESHOLD_G
  return highProtein || highFiber ? 2 : 0
}

/** Bucket-Grenzen für den Composite-Score (-2 … +2) auf die 5-stufige Skala. */
function statusFromScore(score: number): WeightSetPointStatus {
  if (score >= 1.2) return 'sehr_guenstig'
  if (score >= 0.4) return 'guenstig'
  if (score > -0.4) return 'neutral'
  if (score >= -1.2) return 'leicht_unguenstig'
  return 'unguenstig'
}

export function assessFood(food: AssessableFood): Assessment {
  const giCategory = giCategoryOf(food.gi)
  const glValue = glycemicLoad(food)
  const glValuePer100g = glycemicLoadPer100g(food)
  const glCategory = glCategoryOf(glValue)
  const glContextHint = glCategory === 'n/a' ? null : GL_CONTEXT_HINT[glCategory]
  const omegaCategory = food.omega.category

  const novaKnown = food.nova !== null
  const glKnown = glCategory !== 'n/a'
  const sugarKnown = food.sugarPer100g !== undefined
  const fatRelevant = (food.fatPer100g ?? 0) > FAT_RELEVANT_THRESHOLD_G
  const omegaDataMissing = fatRelevant && omegaCategory === 'unbekannt'

  const factors: { weight: number; points: number; known: boolean }[] = [
    { weight: WEIGHTS.nova, points: novaKnown ? novaPoints(food.nova as NovaGroup) : 0, known: novaKnown },
    { weight: WEIGHTS.gl, points: glKnown ? glPoints(glCategory, giCategory, food.fiberPer100g) : 0, known: glKnown },
    { weight: WEIGHTS.sugar, points: sugarKnown ? sugarPoints(food.sugarPer100g as number) : 0, known: sugarKnown },
    { weight: WEIGHTS.omega, points: omegaPoints(omegaCategory, food.fatPer100g), known: true },
    {
      weight: WEIGHTS.proteinFiber,
      points: proteinFiberPoints(food.proteinPer100g, food.fiberPer100g),
      known: true,
    },
  ]

  const knownWeightSum = factors.filter((f) => f.known).reduce((sum, f) => sum + f.weight, 0)
  const signalIncomplete = !novaKnown || !glKnown || !sugarKnown || omegaDataMissing

  let signal: WeightSetPointStatus
  let compositeScore: number | null

  if (knownWeightSum === 0) {
    signal = 'nicht_bewertbar'
    compositeScore = null
  } else {
    compositeScore = factors.filter((f) => f.known).reduce((sum, f) => sum + f.weight * f.points, 0) / knownWeightSum
    signal = statusFromScore(compositeScore)
  }

  // Begründung: jeder Faktor einzeln, in Gewichtungsreihenfolge, plus
  // GL-Kontext-Hinweis (Jenkinsons Tagesbudget) und ggf. Hinweis auf die
  // GI-bedingte Milderung.
  const reasoning: string[] = []

  if (food.nova === null) {
    reasoning.push('NOVA-Verarbeitungsgrad nicht bekannt (35% Gewichtung, fließt nicht in den Score ein).')
  } else if (food.nova === 4) {
    reasoning.push('NOVA-Gruppe 4 (ultra-verarbeitet) — stärkstes Minus (35% Gewichtung).')
  } else if (food.nova <= 2) {
    reasoning.push(`NOVA-Gruppe ${food.nova}: ${novaLabel(food.nova)} — Plus (35% Gewichtung).`)
  } else {
    reasoning.push(`NOVA-Gruppe ${food.nova}: ${novaLabel(food.nova)} — leichtes Minus (35% Gewichtung).`)
  }

  if (giCategory !== 'n/a') {
    reasoning.push(`Glykämischer Index ${food.gi} (${giCategory}) — wirkt als Modifikator der GL, kein Einzelfaktor.`)
  }

  if (glCategory !== 'n/a') {
    const softened = glCategory === 'hoch' && glPoints(glCategory, giCategory, food.fiberPer100g) === -1
    reasoning.push(
      `Glykämische Last bei realistischer Portion (${food.portionG} g): ${glValue?.toFixed(1)} (${glCategory}, zum Vergleich: ${glValuePer100g?.toFixed(1)} je 100 g) — 30% Gewichtung. ${glContextHint}`,
    )
    if (softened) {
      reasoning.push(
        'Hohe GL, aber moderater GI und/oder ausreichend Ballaststoffe — mildert das Risiko einer schnellen Insulinspitze, daher nur leicht negativ bewertet statt stark negativ.',
      )
    }
  } else {
    reasoning.push('GL nicht bekannt (30% Gewichtung, fließt nicht in den Score ein).')
  }

  if (sugarKnown) {
    const s = food.sugarPer100g as number
    const label = s <= SUGAR_LOW_THRESHOLD_G ? 'niedrig' : s >= SUGAR_HIGH_THRESHOLD_G ? 'hoch' : 'moderat'
    reasoning.push(`Zuckeranteil ${s} g/100 g (${label}) — 15% Gewichtung.`)
  } else {
    reasoning.push('Zuckeranteil nicht bekannt (15% Gewichtung, fließt nicht in den Score ein).')
  }

  const omegaFromMeasurement = food.omega.ratio !== null
  if (!fatRelevant) {
    reasoning.push('Kein relevanter Fettanteil (≤5 g/100 g) — Omega-6/3 daher neutral gewertet (15% Gewichtung).')
  } else if (omegaCategory === 'unbekannt') {
    reasoning.push('Omega-6/3-Verhältnis unbekannt — neutral gewertet (15% Gewichtung).')
  } else if (food.omega.isWalnutSpecialCase) {
    reasoning.push('Enthält reichlich Omega-3 UND Omega-6 – Sonderfall, neutral gewertet (15% Gewichtung).')
  } else if (omegaCategory === 'guenstig') {
    reasoning.push(
      omegaFromMeasurement
        ? `Günstiges Omega-6/3-Verhältnis (≈ ${food.omega.ratio?.toFixed(1)}:1, aus gemessenen Nährwerten) — Plus (15% Gewichtung).`
        : 'Günstiges Omega-6/3-Verhältnis laut Kategorie-Zuordnung — Plus (15% Gewichtung).',
    )
  } else if (omegaCategory === 'unguenstig') {
    reasoning.push(
      omegaFromMeasurement
        ? `Ungünstiges Omega-6/3-Verhältnis (≈ ${food.omega.ratio?.toFixed(1)}:1, aus gemessenen Nährwerten) — Minus (15% Gewichtung).`
        : 'Ungünstiges Omega-6/3-Verhältnis laut Kategorie-/Zutaten-Zuordnung — Minus (15% Gewichtung).',
    )
  } else {
    reasoning.push('Neutrale Omega-6/3-Einordnung (15% Gewichtung).')
  }

  if (food.omega.provenanceUnknown) {
    reasoning.push('Herkunft (Weide vs. Mast) nicht bekannt – Omega-Einordnung kann abweichen.')
  }

  const highProtein = (food.proteinPer100g ?? 0) >= PROTEIN_HIGH_THRESHOLD_G
  const highFiber = (food.fiberPer100g ?? 0) >= FIBER_SOURCE_THRESHOLD_G
  if (highProtein || highFiber) {
    reasoning.push('Guter Protein- und/oder Ballaststoffgehalt unterstützt die Sättigung — kleiner Bonus (5% Gewichtung).')
  }

  if (compositeScore !== null) {
    reasoning.push(`Gewichteter Gesamtscore: ${compositeScore.toFixed(2)} (Skala -2 bis +2).`)
  }

  if (signalIncomplete && signal !== 'nicht_bewertbar') {
    reasoning.push(
      'Der Score basiert nur auf den bekannten Faktoren – nicht alle (NOVA, GL, Zucker, Omega-6/3) liegen für dieses Produkt vor, ihr Gewicht wurde auf die bekannten Faktoren umgelegt.',
    )
  }

  return {
    giCategory,
    glCategory,
    glValue,
    glValuePer100g,
    glContextHint,
    signal,
    compositeScore,
    signalIncomplete,
    headline: SIGNAL_HEADLINE[signal],
    reasoning,
  }
}
