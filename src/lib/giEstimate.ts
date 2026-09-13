import type { FoodCategory } from '../types'

export interface GiEstimateInput {
  category: FoodCategory
  carbsPer100g: number
  sugarPer100g?: number
  fiberPer100g?: number
  proteinPer100g?: number
  fatPer100g?: number
}

const MIN_RELEVANT_CARBS_G = 5

/**
 * Schätzt den glykämischen Index aus den bei Open Food Facts verfügbaren
 * Nährwerten, wenn kein gemessener Referenzwert vorliegt (siehe
 * `giReference.ts`). Der GI ist physiologisch definiert (Blutzuckerverlauf
 * nach Verzehr) und lässt sich aus Nährwerten nicht exakt herleiten – die
 * Formel bildet daher nur bekannte Trends ab: ein hoher Anteil an Zucker in
 * den Kohlenhydraten sowie eine hohe Kohlenhydratdichte beschleunigen die
 * Verdauung (↑ GI), während Ballaststoffe sowie Fett/Protein die
 * Magenentleerung und Glukoseaufnahme verlangsamen (↓ GI). Bei Obst/Gemüse
 * wird der Zuckeranteil schwächer gewichtet, da hier meist Fruchtzucker
 * überwiegt, der den Blutzucker weniger stark anhebt als Haushaltszucker
 * oder Stärke. Ausgangspunkt ist der GI durchschnittlicher stärkehaltiger
 * Grundnahrungsmittel (55). Ergebnis ist eine grobe Näherung, kein
 * Laborwert.
 */
export function estimateGiFromMacros(food: GiEstimateInput): number | null {
  const carbs = food.carbsPer100g
  if (!Number.isFinite(carbs) || carbs < MIN_RELEVANT_CARBS_G) return null

  const sugar = Math.min(food.sugarPer100g ?? carbs * 0.3, carbs)
  const fiber = Math.min(food.fiberPer100g ?? 0, carbs)
  const protein = Math.max(food.proteinPer100g ?? 0, 0)
  const fat = Math.max(food.fatPer100g ?? 0, 0)

  const sugarRatio = sugar / carbs
  const fiberRatio = fiber / carbs
  const carbDensity = Math.min(carbs, 80) / 80

  const isFruitOrVeg = food.category === 'obst' || food.category === 'gemuese'
  const sugarWeight = isFruitOrVeg ? 15 : 30

  const baseline = 40 + carbDensity * 25
  const sugarAdjustment = sugarRatio * sugarWeight
  const fiberAdjustment = fiberRatio * -35
  const satietyAdjustment = -Math.min(protein + fat, 40) * 0.4

  const gi = baseline + sugarAdjustment + fiberAdjustment + satietyAdjustment
  return Math.round(Math.min(100, Math.max(10, gi)))
}
