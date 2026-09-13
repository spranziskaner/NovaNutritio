import { describe, expect, it } from 'vitest'
import { bestWordSimilarity, fuzzyScore, rankByFuzzyMatch } from './fuzzySearch'

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

  it('gibt einem kurzen, zufällig als Teilstring enthaltenen Wort keinen hohen Score, wenn der Rest komplett anders ist', () => {
    // Regressionstest: eine lange, ansonsten unpassende Zeichenkette enthielt
    // zufällig "produkt" als Teilstring und bekam dadurch per Substring-Regel
    // einen Score von 0.85, obwohl der Rest der Anfrage nichts mit dem Ziel
    // zu tun hat.
    expect(fuzzyScore('xyzzynichtvorhandenprodukt123', 'Bio-Produkt')).toBeLessThan(0.45)
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

describe('rankByFuzzyMatch', () => {
  const items = ['Apfel', 'Banane', 'Vollkornbrot']

  it('gibt bei fallbackToFullList=false eine leere Liste zurück, wenn nichts passt', () => {
    expect(rankByFuzzyMatch('xyz völlig unpassend', items, (i) => i, 0.45, false)).toEqual([])
  })

  it('gibt bei fallbackToFullList=true (Default) trotzdem die sortierte Gesamtliste zurück', () => {
    expect(rankByFuzzyMatch('xyz völlig unpassend', items, (i) => i, 0.45)).toHaveLength(items.length)
  })

  it('filtert auf die tatsächlich passenden Treffer, wenn welche existieren', () => {
    expect(rankByFuzzyMatch('Apfel', items, (i) => i, 0.45, false)).toEqual(['Apfel'])
  })
})
