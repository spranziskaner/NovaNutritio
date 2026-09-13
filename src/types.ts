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
