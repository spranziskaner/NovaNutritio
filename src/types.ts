export type NovaGroup = 1 | 2 | 3 | 4

export type FoodCategory =
  | 'obst'
  | 'gemuese'
  | 'getreide'
  | 'huelsenfruechte'
  | 'nuesse-samen'
  | 'milchprodukte'
  | 'fleisch-fisch-eier'
  | 'suess-snacks'
  | 'getraenke'
  | 'fertiggerichte-fastfood'
  | 'oele-fette'
  | 'sonstiges'

export interface Food {
  id: string
  name: string
  category: FoodCategory
  /** Glykämischer Index, Glukose = 100. null = keine relevante Kohlenhydratmenge. */
  gi: number | null
  /** Referenzportion in Gramm, auf die sich die Nährwertangaben beziehen. */
  portionG: number
  /** Verfügbare Kohlenhydrate je 100 g. */
  carbsPer100g: number
  sugarPer100g?: number
  fiberPer100g?: number
  proteinPer100g?: number
  fatPer100g?: number
  nova: NovaGroup
  /** Kurzbegründung für die NOVA-Einstufung. */
  novaNote: string
  tags?: string[]
}

/** Dreistufige Einordnung des Omega-6/3-Verhältnisses (OFF liefert keine Omega-Rohdaten). */
export type OmegaCategory = 'guenstig' | 'neutral' | 'unguenstig' | 'unbekannt'

export interface OmegaAssessment {
  category: OmegaCategory
  /** Sonderfall Walnüsse: reich an Omega-3 UND Omega-6, nicht pauschal bewertet. */
  isWalnutSpecialCase: boolean
  /** true bei Fleisch/Fisch/Eiern ohne Weide-/Bio-/Wildfang-Label – Einordnung dann unsicher. */
  provenanceUnknown: boolean
  /** Kurzbegründung für die Einordnung (berechnetes Verhältnis, Kategorie- oder Zutatentreffer). */
  reasonLabel: string
  /** Omega-6/3-Verhältnis, wenn aus gemessenen Nährwerten berechnet (sonst null). */
  ratio: number | null
}

/** Minimale Datenbasis, die die GI/NOVA/Omega-Bewertung benötigt. */
export interface AssessableFood {
  gi: number | null
  portionG: number
  carbsPer100g: number
  fiberPer100g?: number
  proteinPer100g?: number
  /** null = von Open Food Facts nicht klassifiziert. */
  nova: NovaGroup | null
  omega: OmegaAssessment
}

/** Woher der angezeigte GI-Wert stammt. */
export type GiSource = 'referenz' | 'berechnet' | 'unbekannt'

/**
 * Leichtgewichtiges Suchergebnis von der Open-Food-Facts-Suche
 * (search-a-licious): nur Anzeigefelder, keine Nährwerte. GI/GL/NOVA/Omega
 * werden erst berechnet, wenn ein Eintrag ausgewählt wird (siehe
 * `loadFoodDetail.ts`) – die Volltextsuche selbst liefert diese Werte nicht.
 */
export interface FoodSummary {
  id: string
  barcode: string
  name: string
  brand?: string
  imageUrl?: string
  /** null = von Open Food Facts nicht klassifiziert. */
  nova: NovaGroup | null
}

/** Zur Laufzeit über die Open-Food-Facts-API geladenes Lebensmittel. */
export interface RemoteFood extends AssessableFood {
  id: string
  barcode: string
  name: string
  brand?: string
  category: FoodCategory
  imageUrl?: string
  giSource: GiSource
  sugarPer100g?: number
  fatPer100g?: number
  /** Kurzbegründung für die NOVA-Einstufung bzw. Hinweis, dass sie fehlt. */
  novaNote: string
}
