import { describe, expect, it } from 'vitest'
import { bestWordSimilarity, fuzzyScore } from './fuzzySearch'

describe('fuzzyScore', () => {
  it('toleriert Tippfehler', () => {
    expect(fuzzyScore('bananne', 'Banane')).toBeGreaterThan(0.7)
  })

  it('toleriert Wortumstellungen', () => {
    expect(fuzzyScore('joghurtt griechisch', 'Griechischer Joghurt')).toBeGreaterThan(0.7)
  })

  it('bewertet völlig unpassende Begriffe niedrig', () => {
    expect(fuzzyScore('xyz', 'Banane')).toBeLessThan(0.3)
  })

  it('zerlegt "ß" nicht in ein bedeutungsloses Ein-Buchstaben-Fragment, das zufällig alles trifft', () => {
    // Regressionstest: "gesüßt" wurde vorher zu ["gesu", "t"] normalisiert;
    // das einzelne "t" matchte dann per Substring-Regel fast jedes Wort mit
    // einem "t" darin (z. B. "Smith") mit einem falschen Hochscore.
    expect(fuzzyScore('Granny Smith Apfel', 'Cornflakes (gesüßt)')).toBeLessThan(0.5)
  })
})

describe('bestWordSimilarity', () => {
  it('findet einen generischen Begriff auch mit zusätzlichen, nicht passenden Sortenwörtern', () => {
    expect(bestWordSimilarity('Granny Smith Apfel', 'Apfel')).toBeGreaterThanOrEqual(0.85)
  })

  it('matched nicht allein wegen kurzer Ein-/Zwei-Buchstaben-Fragmente', () => {
    expect(bestWordSimilarity('Granny Smith Apfel', 'Cornflakes (gesüßt)')).toBeLessThan(0.85)
  })
})
