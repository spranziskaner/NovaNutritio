import type { Food, RemoteFood } from '../types'
import { foods } from '../data/foods'
import { bestWordSimilarity } from './fuzzySearch'
import { assessOmega } from './omegaAssessment'

/**
 * Ab dieser Einzelwort-Ähnlichkeit (0..1) gilt ein Treffer in der lokalen
 * Tabelle als relevant. Bewusst hoch angesetzt (statt eines gemittelten
 * `fuzzyScore`s über alle Suchwörter): eine mehrwortige Sortenangabe wie
 * "Granny Smith Apfel" soll den generischen Eintrag "Apfel" trotzdem
 * finden, auch wenn "Granny"/"Smith" dort keine Entsprechung haben.
 */
const LOCAL_MATCH_THRESHOLD = 0.85

/** Kategorien, die laut Anforderungsdoku ohne weiteren Treffer als "neutral" gelten. */
const NEUTRAL_FALLBACK_CATEGORIES = new Set<Food['category']>(['obst', 'gemuese'])

function toRemoteFood(food: Food): RemoteFood {
  const omega = assessOmega({
    category: food.category,
    // Die lokale Tabelle hat keine OFF-`categories_tags`; der Produktname
    // dient stattdessen als Abgleichsgrundlage gegen die deutschen
    // Stichwörter in omegaCategories.json. Die interne Kategorie-Konstante
    // (z. B. "fleisch-fisch-eier") wird bewusst NICHT mit übergeben, da sie
    // selbst zufällige Substring-Treffer wie "eier" enthält.
    categoriesTags: [food.name],
    labelsTags: [],
  })
  // Unverarbeitetes Obst/Gemüse ohne spezifischen Zutaten-/Namenstreffer gilt
  // laut Anforderungsdoku (2.3) generell als neutral statt "unbekannt".
  if (omega.category === 'unbekannt' && NEUTRAL_FALLBACK_CATEGORIES.has(food.category)) {
    omega.category = 'neutral'
    omega.reasonLabel = 'Unverarbeitetes Obst/Gemüse ohne signifikanten Fettgehalt.'
  }

  return {
    id: `local:${food.id}`,
    barcode: '',
    name: food.name,
    category: food.category,
    gi: food.gi,
    giSource: food.gi === null ? 'unbekannt' : 'referenz',
    portionG: food.portionG,
    carbsPer100g: food.carbsPer100g,
    sugarPer100g: food.sugarPer100g,
    fiberPer100g: food.fiberPer100g,
    proteinPer100g: food.proteinPer100g,
    fatPer100g: food.fatPer100g,
    nova: food.nova,
    omega,
    novaNote: food.novaNote,
  }
}

/**
 * Durchsucht die lokale, handkuratierte Referenztabelle (`data/foods.ts`) per
 * Fuzzy-Matching. Diese Einträge sind immer vollständig (echter GI, volle
 * Nährwerte) – Ergänzung für generische Grundnahrungsmittel (z. B. Sorten wie
 * "Granny Smith"), die im Offline-Subset fehlen oder unvollständig gepflegt
 * sind.
 */
export function searchLocalFoods(query: string): RemoteFood[] {
  return foods
    .map((food) => ({ food, score: bestWordSimilarity(query, food.name) }))
    .filter(({ score }) => score >= LOCAL_MATCH_THRESHOLD)
    .sort((a, b) => b.score - a.score)
    .map(({ food }) => toRemoteFood(food))
}

/** Alle Einträge der handkuratierten Referenztabelle, z. B. als Startansicht ohne Suchbegriff. */
export function listLocalFoods(): RemoteFood[] {
  return foods.map(toRemoteFood)
}
