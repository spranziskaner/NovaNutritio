import type { FoodCategory } from '../types'

export const CATEGORY_LABELS: Record<FoodCategory, string> = {
  obst: 'Obst',
  gemuese: 'Gemüse',
  getreide: 'Getreide & Getreideprodukte',
  huelsenfruechte: 'Hülsenfrüchte & Tofu',
  'nuesse-samen': 'Nüsse & Samen',
  milchprodukte: 'Milchprodukte',
  'fleisch-fisch-eier': 'Fleisch, Fisch & Eier',
  'suess-snacks': 'Süßes & Snacks',
  getraenke: 'Getränke',
  'fertiggerichte-fastfood': 'Fertiggerichte & Fast Food',
  'oele-fette': 'Öle & Fette',
  sonstiges: 'Sonstiges',
}
