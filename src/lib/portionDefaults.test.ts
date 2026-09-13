import { describe, expect, it } from 'vitest'
import { resolvePortionDefault } from './portionDefaults'

describe('resolvePortionDefault', () => {
  it('liefert 150g für weiße Kartoffeln über den OFF-Kategorie-Keyword-Treffer', () => {
    expect(resolvePortionDefault(['en:vegetables', 'en:potatoes'], 'gemuese')).toBe(150)
  })

  it('liefert 100g für Brot (realistische Referenzportion statt 30g)', () => {
    expect(resolvePortionDefault(['en:breads', 'en:white-breads'], 'getreide')).toBe(100)
  })

  it('fällt auf die interne Kategorie zurück, wenn kein spezifisches Keyword passt', () => {
    expect(resolvePortionDefault(['en:some-unmapped-tag'], 'obst')).toBe(120)
  })

  it('fällt auf den absoluten Standardwert zurück, wenn nichts passt', () => {
    expect(resolvePortionDefault([], 'sonstiges')).toBe(100)
  })
})
