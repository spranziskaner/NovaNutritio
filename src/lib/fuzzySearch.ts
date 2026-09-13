function normalizeForMatch(s: string): string {
  return s
    .toLowerCase()
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/ß/g, 'ss') // NFD zerlegt "ß" nicht in Bestandteile, muss separat behandelt werden
    .replace(/[^a-z0-9]+/g, ' ')
    .trim()
}

function levenshtein(a: string, b: string): number {
  if (a === b) return 0
  if (a.length === 0) return b.length
  if (b.length === 0) return a.length

  let prev = Array.from({ length: b.length + 1 }, (_, j) => j)
  for (let i = 1; i <= a.length; i++) {
    const curr = [i]
    for (let j = 1; j <= b.length; j++) {
      const cost = a[i - 1] === b[j - 1] ? 0 : 1
      curr[j] = Math.min(curr[j - 1] + 1, prev[j] + 1, prev[j - 1] + cost)
    }
    prev = curr
  }
  return prev[b.length]
}

/**
 * Ähnlichkeit zweier Wörter zwischen 0 (verschieden) und 1 (identisch);
 * toleriert Tippfehler. Die Substring-Regel greift erst ab 3 Zeichen, sonst
 * würde z. B. ein einzelnes Buchstaben-Fragment fast jedes andere Wort
 * "treffen".
 */
function wordSimilarity(a: string, b: string): number {
  if (a === b) return 1
  if (a.length === 0 || b.length === 0) return 0
  if (Math.min(a.length, b.length) >= 3 && (a.includes(b) || b.includes(a))) return 0.85
  return Math.max(0, 1 - levenshtein(a, b) / Math.max(a.length, b.length))
}

/**
 * Fuzzy-Score zwischen Suchbegriff und Zieltext (z. B. Produktname + Marke):
 * für jedes Suchwort wird die beste Wort-Ähnlichkeit im Zieltext gesucht und
 * gemittelt. Damit werden Tippfehler, Umlaut-Schreibweisen und
 * Wortumstellungen toleriert, aber Ziele, die nur einen Bruchteil der
 * Suchwörter enthalten, werden abgewertet – sinnvoll, um aus vielen
 * OFF-Treffern die wirklich passenden herauszufiltern. 0 = kein Treffer,
 * 1 = perfekte Übereinstimmung.
 */
export function fuzzyScore(query: string, target: string): number {
  const queryWords = normalizeForMatch(query).split(' ').filter(Boolean)
  const targetWords = normalizeForMatch(target).split(' ').filter(Boolean)
  if (queryWords.length === 0 || targetWords.length === 0) return 0

  const total = queryWords.reduce((sum, qw) => {
    const best = targetWords.reduce((max, tw) => Math.max(max, wordSimilarity(qw, tw)), 0)
    return sum + best
  }, 0)
  return total / queryWords.length
}

/**
 * Bester Einzelwort-Treffer zwischen Suchbegriff und Zieltext, unabhängig
 * davon, wie viele der übrigen Suchwörter im Ziel fehlen. Gedacht für kleine,
 * generische Referenzlisten: wer "Granny Smith Apfel" sucht, soll den
 * generischen Eintrag "Apfel" trotzdem finden, auch wenn die Sortenwörter
 * dort fehlen – anders als bei `fuzzyScore` wird hier nicht gemittelt.
 */
export function bestWordSimilarity(query: string, target: string): number {
  const queryWords = normalizeForMatch(query).split(' ').filter(Boolean)
  const targetWords = normalizeForMatch(target).split(' ').filter(Boolean)
  if (queryWords.length === 0 || targetWords.length === 0) return 0

  let best = 0
  for (const qw of queryWords) {
    for (const tw of targetWords) {
      best = Math.max(best, wordSimilarity(qw, tw))
    }
  }
  return best
}
