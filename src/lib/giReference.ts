import { foods } from '../data/foods'

export interface GiReferenceMatch {
  gi: number
  portionG: number
  /** Name des Referenz-Lebensmittels, dem der GI entnommen wurde. */
  matchedName: string
}

function normalize(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/\(.*?\)/g, ' ')
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

const STOPWORDS = new Set(['bio', 'frisch', 'natur', 'classic', 'original', 'de', 'la', 'le'])

function tokensOf(name: string): string[] {
  return normalize(name)
    .split(' ')
    .filter((t) => t.length > 2 && !STOPWORDS.has(t))
}

const referenceEntries = foods
  .filter((f): f is typeof f & { gi: number } => f.gi !== null)
  .map((f) => ({ food: f, tokens: tokensOf(f.name) }))

/**
 * Sucht per Keyword-Überlappung ein passendes Lebensmittel aus der lokalen
 * GI-Referenztabelle. Best-effort-Heuristik für unverarbeitete/naturbelassene
 * Treffer (Obst, Gemüse, Getreide …) – bei Markenprodukten liefert Open Food
 * Facts meist keinen sinnvollen Treffer, dann bleibt der GI unbekannt.
 */
export function lookupGi(productName: string): GiReferenceMatch | null {
  const tokens = tokensOf(productName)
  if (tokens.length === 0) return null

  let best: { food: (typeof referenceEntries)[number]['food']; score: number } | null = null
  for (const entry of referenceEntries) {
    if (entry.tokens.length === 0) continue
    const overlap = entry.tokens.filter((t) => tokens.includes(t)).length
    const score = overlap / entry.tokens.length
    if (overlap > 0 && (!best || score > best.score)) {
      best = { food: entry.food, score }
    }
  }

  if (!best || best.score < 0.6) return null
  return { gi: best.food.gi as number, portionG: best.food.portionG, matchedName: best.food.name }
}
