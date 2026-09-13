import type { AssessableFood, NovaGroup, OmegaCategory } from '../types'

export type GiCategory = 'niedrig' | 'mittel' | 'hoch' | 'n/a'
export type GlCategory = 'niedrig' | 'mittel' | 'hoch' | 'n/a'
export type GesamtsignalStatus = 'gruen' | 'gelb' | 'rot' | 'unvollstaendig'

export const SIGNAL_DOT: Record<GesamtsignalStatus, string> = {
  gruen: 'bg-emerald-500',
  gelb: 'bg-amber-500',
  rot: 'bg-rose-500',
  unvollstaendig: 'bg-stone-400',
}

export interface Assessment {
  giCategory: GiCategory
  glCategory: GlCategory
  /** Glykämische Last für die angegebene Referenzportion. */
  glValue: number | null
  signal: GesamtsignalStatus
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
  gelb: 'Gesamtsignal: mittel',
  rot: 'Gesamtsignal: auffällig',
  unvollstaendig: 'Gesamtsignal: unvollständige Datenlage',
}

/** Score einer Status-Kategorie für die Gesamtsignal-Aggregation (0 = unauffällig … 2 = hoch/auffällig). */
function categoryScore(category: GiCategory | GlCategory): number {
  if (category === 'mittel') return 1
  if (category === 'hoch') return 2
  return 0
}

/**
 * Gesamtsignal nach der Weight-Set-Point-Bewertung: GI und GL sind die
 * primären, schwellenwertbasierten Signale (die jeweils strengere der
 * beiden Einstufungen bildet die Basis). NOVA, das Ballaststoff-Verhältnis
 * und Omega-6/3 sind reine Modifikatoren – sie können die Basis-Einstufung
 * nur verschlechtern oder gleich lassen, nie verbessern. Ein unbekannter
 * Omega-Wert fließt dabei bewusst NICHT als neutraler/positiver Wert ein,
 * sondern wird komplett aus der Rechnung ausgeklammert. "Unvollständige
 * Datenlage" gibt es nur, wenn wirklich kein einziges der drei Kriterien
 * (GI/GL, NOVA, Omega-6/3) bekannt ist.
 */
function signalOf(
  giCategory: GiCategory,
  glCategory: GlCategory,
  nova: NovaGroup | null,
  omegaCategory: OmegaCategory,
  ballaststoffRatio: number | null,
): { status: GesamtsignalStatus; incomplete: boolean } {
  const giGlKnown = giCategory !== 'n/a' || glCategory !== 'n/a'
  const novaKnown = nova !== null
  const omegaKnown = omegaCategory !== 'unbekannt'

  if (!giGlKnown && !novaKnown && !omegaKnown) {
    return { status: 'unvollstaendig', incomplete: true }
  }

  const basisScore = Math.max(categoryScore(giCategory), categoryScore(glCategory))

  const auffaellig = giCategory === 'hoch' || glCategory === 'hoch'
  const verstaerkung = ballaststoffRatio !== null && ballaststoffRatio < 0.1 && auffaellig ? 1 : 0

  const novaModifikator = nova === 4 ? 1 : 0
  const omegaModifikator = omegaCategory === 'unguenstig' ? 1 : 0

  const gesamtScore = basisScore + verstaerkung + novaModifikator + omegaModifikator
  const incomplete = !giGlKnown || !novaKnown || !omegaKnown

  if (gesamtScore >= 2) return { status: 'rot', incomplete }
  if (gesamtScore === 1) return { status: 'gelb', incomplete }
  return { status: 'gruen', incomplete }
}

export function assessFood(food: AssessableFood): Assessment {
  const giCategory = giCategoryOf(food.gi)
  const glValue = glycemicLoad(food)
  const glCategory = glCategoryOf(glValue)
  const omegaCategory = food.omega.category
  const ballaststoffRatio =
    food.carbsPer100g > 0 && food.fiberPer100g !== undefined ? food.fiberPer100g / food.carbsPer100g : null
  const { status: signal, incomplete: signalIncomplete } = signalOf(
    giCategory,
    glCategory,
    food.nova,
    omegaCategory,
    ballaststoffRatio,
  )

  const verstaerkungAktiv =
    ballaststoffRatio !== null && ballaststoffRatio < 0.1 && (giCategory === 'hoch' || glCategory === 'hoch')

  // Begründung folgt der neuen Hierarchie: GI/GL zuerst als Hauptgrund, danach
  // die Modifikatoren Ballaststoff-Verhältnis, NOVA und Omega-6/3.
  const reasoning: string[] = []

  if (giCategory === 'n/a') {
    reasoning.push(
      food.gi === null
        ? 'GI/GL für dieses Produkt nicht verfügbar.'
        : 'Keine relevante Kohlenhydratmenge, daher kaum Einfluss auf Blutzucker/Insulin.',
    )
  } else if (giCategory === 'hoch') {
    reasoning.push(`Hoher glykämischer Index (${food.gi}) — Hauptgrund für die Einstufung.`)
  } else if (giCategory === 'mittel') {
    reasoning.push(`Mittlerer glykämischer Index (${food.gi}).`)
  } else {
    reasoning.push(`Niedriger glykämischer Index (${food.gi}).`)
  }

  if (glCategory !== 'n/a') {
    const glStatusLabel = glCategory === 'hoch' ? 'auffällig' : glCategory === 'mittel' ? 'mittel' : 'unauffällig'
    reasoning.push(
      `Glykämische Last bei realistischer Portion (${food.portionG} g): ${glValue?.toFixed(1)} — ${glStatusLabel}.`,
    )
  }

  if (verstaerkungAktiv && ballaststoffRatio !== null) {
    reasoning.push(
      `Niedriges Ballaststoff-Verhältnis (${Math.round(ballaststoffRatio * 100)} %) verstärkt die Einstufung.`,
    )
  }

  if (food.nova === null) {
    reasoning.push('NOVA-Verarbeitungsgrad für dieses Produkt nicht bekannt.')
  } else if (food.nova === 4) {
    reasoning.push('NOVA-Gruppe 4 (ultra-verarbeitet): zusätzlicher Malus auf das Gesamtsignal.')
  } else {
    reasoning.push(`NOVA-Gruppe ${food.nova}: ${novaLabel(food.nova)} — leichter Zusatzfaktor, nicht ausschlaggebend.`)
  }

  if (omegaCategory === 'unbekannt') {
    reasoning.push('Omega-6/3-Verhältnis unbekannt — fließt nicht in die Bewertung ein.')
  } else if (food.omega.isWalnutSpecialCase) {
    reasoning.push('Enthält reichlich Omega-3 UND Omega-6 – Sonderfall, nicht pauschal bewertet.')
  } else if (omegaCategory === 'guenstig') {
    reasoning.push('Günstiges Omega-6/3-Verhältnis laut Kategorie-Zuordnung.')
  } else if (omegaCategory === 'unguenstig') {
    reasoning.push('Ungünstiges Omega-6/3-Verhältnis laut Kategorie-/Zutaten-Zuordnung — zusätzlicher Malus.')
  } else {
    reasoning.push('Neutrale Omega-6/3-Einordnung.')
  }

  if (food.omega.provenanceUnknown) {
    reasoning.push('Herkunft (Weide vs. Mast) nicht bekannt – Einordnung kann abweichen.')
  }

  if ((food.proteinPer100g ?? 0) >= 15) {
    reasoning.push('Guter Proteingehalt unterstützt Sättigung und dämpft den Blutzuckeranstieg der Mahlzeit.')
  }

  if (signalIncomplete && signal !== 'unvollstaendig') {
    reasoning.push(
      'Gesamtsignal basiert nur auf den bekannten Kriterien – nicht alle drei Werte (GI/GL, NOVA, Omega-6/3) liegen für dieses Produkt vor.',
    )
  }

  return {
    giCategory,
    glCategory,
    glValue,
    signal,
    signalIncomplete,
    headline: SIGNAL_HEADLINE[signal],
    reasoning,
  }
}
