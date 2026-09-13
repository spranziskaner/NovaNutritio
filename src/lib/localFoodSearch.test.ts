import { describe, expect, it } from 'vitest'
import { searchLocalFoods } from './localFoodSearch'

describe('searchLocalFoods', () => {
  it('findet den generischen Apfel-Eintrag auch bei einer Sortenangabe wie "Granny Smith Apfel"', () => {
    const results = searchLocalFoods('Granny Smith Apfel')
    expect(results.some((f) => f.name === 'Apfel')).toBe(true)
  })

  it('liefert vollständige Nährwerte und einen echten (nicht geschätzten) GI', () => {
    const [apfel] = searchLocalFoods('Apfel')
    expect(apfel.giSource).toBe('referenz')
    expect(apfel.carbsPer100g).toBeGreaterThan(0)
  })

  it('liefert für Nüsse eine Omega-Einordnung ohne OFF-Daten', () => {
    const [walnuss] = searchLocalFoods('Walnüsse')
    expect(walnuss.omega.isWalnutSpecialCase).toBe(true)
  })
})
