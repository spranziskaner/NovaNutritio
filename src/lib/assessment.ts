import type { AssessableFood, NovaGroup, OmegaCategory } from '../types'

export type GiCategory = 'niedrig' | 'mittel' | 'hoch' | 'n/a'
export type GlCategory = 'niedrig' | 'mittel' | 'hoch' | 'n/a'
/** Status des Weight-Set-Point-Signals (früher "Gesamtsignal" genannt). */
export type WeightSetPointStatus = 'gruen' | 'gelb' | 'rot' | 'unvollstaendig'

export const STATUS_DOT: Record<WeightSetPointStatus, string> = {
  gruen: 'bg-emerald-500',
  gelb: 'bg-amber-500',
  rot: 'bg-rose-500',
  unvollstaendig: 'bg-stone-400',
}

export interface Assessment {
  giCategory: GiCategory
  glCategory: GlCategory
  /** Glykämische Last für die tatsächliche Portion – Bewertungsgrundlage (siehe `glycemicLoad`). */
  glValue: number | null
  /** Glykämische Last je 100 g – nur zum Vergleich zwischen Lebensmitteln, NICHT die Bewertungsgrundlage. */
  glValuePer100g: number | null
  signal: WeightSetPointStatus
  /** true, wenn nicht alle drei Kriterien (NOVA, GL, Omega-6/3) bekannt waren. */
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
 * Bewusst gerichtete Formulierung statt neutraler Begriffe wie
 * "unauffällig/auffällig": das Weight-Set-Point-Konzept beschreibt eine
 * Richtungswirkung (der Körper reguliert sein "Wunschgewicht" hormonell nach
 * oben oder hält es stabil) – kein Lebensmittel senkt den Sollwert einzeln
 * nachweisbar ab, aber wiederkehrender Konsum kann ihn anheben. "günstig"
 * heißt daher: trägt nicht zu dieser Aufwärtsverschiebung bei; "ungünstig":
 * begünstigt sie.
 */
const SIGNAL_HEADLINE: Record<WeightSetPointStatus, string> = {
  gruen: 'Weight-Set-Point: günstige Wirkung',
  gelb: 'Weight-Set-Point: leicht ungünstige Wirkung',
  rot: 'Weight-Set-Point: ungünstige Wirkung',
  unvollstaendig: 'Weight-Set-Point: nicht bewertbar',
}

/** Score einer Status-Kategorie für die Weight-Set-Point-Aggregation (0 = niedrig … 2 = hoch). */
function categoryScore(category: GiCategory | GlCategory): number {
  if (category === 'mittel') return 1
  if (category === 'hoch') return 2
  return 0
}

/**
 * Ballaststoffgehalt, ab dem ein Lebensmittel nach EU-Verordnung (EG) Nr.
 * 1924/2006 als "Ballaststoffquelle" gelten darf (≥ 3 g je 100 g). Dient
 * hier als Schwelle für die Ballaststoff-Dämpfung: ein realer, anerkannter
 * Standard statt einer frei erfundenen Zahl.
 */
const FIBER_SOURCE_THRESHOLD_G = 3

/**
 * Weight-Set-Point-Signal. Reihenfolge/Gewichtung angelehnt an Jenkinsons
 * Modell ("Warum wir (zu viel) essen"):
 *
 * 1. NOVA 4 (ultra-verarbeitet) ist ein Basis-Filter: Zucker,
 *    Fruktose-Süßungsmittel und Industrie-Pflanzenöle ("die giftige
 *    Dreifaltigkeit") kommen in NOVA-1/2/3-Produkten praktisch nicht vor –
 *    NOVA 4 macht ein Lebensmittel daher unabhängig von GI/GL "ungünstig".
 * 2. Ist NOVA nicht 4, bestimmt die glykämische Last (GL) – nicht der GI –
 *    die Basis-Einstufung: entscheidend ist laut Jenkinson die gesamte
 *    freigesetzte Glukosemenge, nicht deren Geschwindigkeit. Der GI spielt
 *    nur eine Nebenrolle und wird ausschließlich als Fallback verwendet,
 *    wenn keine GL berechnet werden kann (z. B. kein GI-Wert vorhanden).
 * 3. Ballaststoffe wirken als Korrekturfaktor, nicht als Zusatzstrafe: ab
 *    einem Gehalt von 3 g/100 g ("Ballaststoffquelle") wird die
 *    GL-Einstufung um eine Stufe gedämpft – komplexe Kohlenhydrate mit
 *    intakter Ballaststoffmatrix setzen ihre Glukose langsamer frei, selbst
 *    bei gleicher rechnerischer GL. Niedrige Ballaststoffe verschärfen die
 *    Einstufung dagegen NICHT zusätzlich (das würde dieselbe Information
 *    doppelt bestrafen).
 * 4. Omega-6/3 bleibt ein reiner Zusatzfaktor: ein ungünstiges Verhältnis
 *    verschlechtert die Einstufung um eine Stufe. Ein unbekanntes
 *    Omega-6/3-Verhältnis (der Normalfall bei Getreide/Gemüse ohne
 *    relevante Fettquelle) fließt bewusst NICHT negativ ein.
 *
 * "Unvollständige Datenlage" gibt es nur, wenn wirklich kein einziges der
 * drei Kriterien (GI/GL, NOVA, Omega-6/3) bekannt ist.
 */
function signalOf(
  giCategory: GiCategory,
  glCategory: GlCategory,
  nova: NovaGroup | null,
  omegaCategory: OmegaCategory,
  fiberPer100g: number | undefined,
): { status: WeightSetPointStatus; incomplete: boolean } {
  const giGlKnown = giCategory !== 'n/a' || glCategory !== 'n/a'
  const novaKnown = nova !== null
  const omegaKnown = omegaCategory !== 'unbekannt'
  const incomplete = !giGlKnown || !novaKnown || !omegaKnown

  if (!giGlKnown && !novaKnown && !omegaKnown) {
    return { status: 'unvollstaendig', incomplete: true }
  }

  // Basis-Filter: NOVA 4 ist unabhängig von GI/GL "ungünstig".
  if (nova === 4) {
    return { status: 'rot', incomplete }
  }

  // GL ist die Basis, wenn bekannt; GI nur als Fallback (Nebenrolle).
  const fiberDampening = fiberPer100g !== undefined && fiberPer100g >= FIBER_SOURCE_THRESHOLD_G ? 1 : 0
  const basisScore =
    glCategory !== 'n/a' ? Math.max(0, categoryScore(glCategory) - fiberDampening) : categoryScore(giCategory)

  const omegaModifikator = omegaCategory === 'unguenstig' ? 1 : 0
  const gesamtScore = basisScore + omegaModifikator

  if (gesamtScore >= 2) return { status: 'rot', incomplete }
  if (gesamtScore === 1) return { status: 'gelb', incomplete }
  return { status: 'gruen', incomplete }
}

export function assessFood(food: AssessableFood): Assessment {
  const giCategory = giCategoryOf(food.gi)
  const glValue = glycemicLoad(food)
  const glValuePer100g = glycemicLoadPer100g(food)
  const glCategory = glCategoryOf(glValue)
  const omegaCategory = food.omega.category
  const fiberDampeningActive =
    glCategory !== 'n/a' && food.fiberPer100g !== undefined && food.fiberPer100g >= FIBER_SOURCE_THRESHOLD_G
  const { status: signal, incomplete: signalIncomplete } = signalOf(
    giCategory,
    glCategory,
    food.nova,
    omegaCategory,
    food.fiberPer100g,
  )

  // Begründung folgt der neuen Hierarchie: NOVA-4-Filter zuerst (falls
  // zutreffend), dann GL als Hauptgrund (GI nur informativ), danach die
  // Modifikatoren Ballaststoffe und Omega-6/3.
  const reasoning: string[] = []

  if (food.nova === 4) {
    reasoning.push(
      'NOVA-Gruppe 4 (ultra-verarbeitet) — macht das Lebensmittel unabhängig von GI/GL zum Ausschlussgrund für den Weight-Set-Point.',
    )
  }

  if (giCategory === 'n/a') {
    reasoning.push(
      food.gi === null
        ? 'GI/GL für dieses Produkt nicht verfügbar.'
        : 'Keine relevante Kohlenhydratmenge, daher kaum Einfluss auf Blutzucker/Insulin.',
    )
  } else {
    reasoning.push(`Glykämischer Index ${food.gi} (${giCategory}) — spielt für die Einstufung nur eine Nebenrolle.`)
  }

  if (glCategory !== 'n/a') {
    const glStatusLabel = glCategory === 'hoch' ? 'auffällig' : glCategory === 'mittel' ? 'mittel' : 'unauffällig'
    reasoning.push(
      `Glykämische Last bei realistischer Portion (${food.portionG} g): ${glValue?.toFixed(1)} — ${glStatusLabel} — Hauptgrund für die Einstufung (zum Vergleich: ${glValuePer100g?.toFixed(1)} je 100 g).`,
    )
  }

  if (fiberDampeningActive) {
    reasoning.push(
      `Ballaststoffgehalt (${food.fiberPer100g} g/100 g) mildert die glykämische Last – dämpft die Einstufung um eine Stufe.`,
    )
  }

  if (food.nova === null) {
    reasoning.push('NOVA-Verarbeitungsgrad für dieses Produkt nicht bekannt.')
  } else if (food.nova !== 4) {
    reasoning.push(`NOVA-Gruppe ${food.nova}: ${novaLabel(food.nova)}.`)
  }

  const omegaFromMeasurement = food.omega.ratio !== null
  if (omegaCategory === 'unbekannt') {
    reasoning.push('Omega-6/3-Verhältnis unbekannt — fließt nicht in die Bewertung ein.')
  } else if (food.omega.isWalnutSpecialCase) {
    reasoning.push('Enthält reichlich Omega-3 UND Omega-6 – Sonderfall, nicht pauschal bewertet.')
  } else if (omegaCategory === 'guenstig') {
    reasoning.push(
      omegaFromMeasurement
        ? `Günstiges Omega-6/3-Verhältnis (≈ ${food.omega.ratio?.toFixed(1)}:1), aus gemessenen Nährwerten berechnet.`
        : 'Günstiges Omega-6/3-Verhältnis laut Kategorie-Zuordnung.',
    )
  } else if (omegaCategory === 'unguenstig') {
    reasoning.push(
      omegaFromMeasurement
        ? `Ungünstiges Omega-6/3-Verhältnis (≈ ${food.omega.ratio?.toFixed(1)}:1), aus gemessenen Nährwerten berechnet — zusätzlicher Malus.`
        : 'Ungünstiges Omega-6/3-Verhältnis laut Kategorie-/Zutaten-Zuordnung — zusätzlicher Malus.',
    )
  } else {
    reasoning.push(
      omegaFromMeasurement
        ? `Neutrales Omega-6/3-Verhältnis (≈ ${food.omega.ratio?.toFixed(1)}:1), aus gemessenen Nährwerten berechnet.`
        : 'Neutrale Omega-6/3-Einordnung.',
    )
  }

  if (food.omega.provenanceUnknown) {
    reasoning.push('Herkunft (Weide vs. Mast) nicht bekannt – Einordnung kann abweichen.')
  }

  if ((food.proteinPer100g ?? 0) >= 15) {
    reasoning.push('Guter Proteingehalt unterstützt Sättigung und dämpft den Blutzuckeranstieg der Mahlzeit.')
  }

  if (signalIncomplete && signal !== 'unvollstaendig') {
    reasoning.push(
      'Weight-Set-Point basiert nur auf den bekannten Kriterien – nicht alle drei Werte (GI/GL, NOVA, Omega-6/3) liegen für dieses Produkt vor.',
    )
  }

  return {
    giCategory,
    glCategory,
    glValue,
    glValuePer100g,
    signal,
    signalIncomplete,
    headline: SIGNAL_HEADLINE[signal],
    reasoning,
  }
}
