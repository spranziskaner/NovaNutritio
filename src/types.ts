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

/** Minimale Datenbasis, die die GI/NOVA/Set-Point-Bewertung benötigt. */
export interface AssessableFood {
  gi: number | null
  portionG: number
  carbsPer100g: number
  fiberPer100g?: number
  proteinPer100g?: number
  /** null = von Open Food Facts nicht klassifiziert. */
  nova: NovaGroup | null
}

/** Woher der angezeigte GI-Wert stammt. */
export type GiSource = 'referenz' | 'berechnet' | 'unbekannt'

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
