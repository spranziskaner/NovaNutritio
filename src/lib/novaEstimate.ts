import type { GiCategory, GlCategory } from './assessment'
import type { NovaGroup } from '../types'

const ULTRA_PROCESSING_MARKERS = [
  'aroma',
  'emulgator',
  'konservierungsstoff',
  'geschmacksverstärker',
  'stabilisator',
  'farbstoff',
  'säuerungsmittel',
  'verdickungsmittel',
  'süßungsmittel',
  'maltodextrin',
  'glukosesirup',
  'glukose-fruktose-sirup',
  'hydriert',
  'invertzuckersirup',
]

const CULINARY_MARKERS = ['zucker', 'salz', 'öl', 'butter', 'honig', 'mehl']

export interface NovaEstimateInput {
  ingredientsText?: string
  giCategory: GiCategory
  glCategory: GlCategory
  fiberPer100g?: number
}

/**
 * Grobe Schätzung der NOVA-Gruppe, wenn Open Food Facts für ein Produkt
 * keine eigene NOVA-Einstufung liefert (siehe `offProduct.ts`). Reine
 * Heuristik: Zutatenliste (Zusatzstoff-Schlagwörter) plus GI/GL als
 * Sekundärindiz – stark raffinierte Kohlenhydrate ohne nennenswerte
 * Ballaststoffe kommen überproportional häufig aus industriell
 * formulierten Produkten. Kein Ersatz für die echte NOVA-Klassifikation
 * nach Monteiro et al., die auf der tatsächlichen Herstellung/Zutatenliste
 * beruht – bewusst konservativ: liefert `null` (keine Schätzung), sobald die
 * Anhaltspunkte nicht eindeutig genug sind, statt zu raten.
 */
export function estimateNovaGroup(input: NovaEstimateInput): NovaGroup | null {
  const text = input.ingredientsText?.toLowerCase().trim() ?? ''

  if (ULTRA_PROCESSING_MARKERS.some((marker) => text.includes(marker))) {
    return 4
  }

  if (input.giCategory === 'hoch' && input.glCategory === 'hoch' && (input.fiberPer100g ?? 0) < 2) {
    return 4
  }

  if (text.length > 0) {
    const ingredientCount = text.split(',').length
    if (ingredientCount <= 4 && CULINARY_MARKERS.some((marker) => text.includes(marker))) {
      return 3
    }
  }

  return null
}
