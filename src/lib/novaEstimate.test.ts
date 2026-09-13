import { describe, expect, it } from 'vitest'
import { estimateNovaGroup } from './novaEstimate'

describe('estimateNovaGroup', () => {
  it('schätzt NOVA 4 bei Zusatzstoff-Schlagwörtern in der Zutatenliste', () => {
    const result = estimateNovaGroup({
      ingredientsText: 'Zucker, Palmöl, Emulgator (Sojalecithin), Aroma',
      giCategory: 'mittel',
      glCategory: 'niedrig',
    })
    expect(result).toBe(4)
  })

  it('schätzt NOVA 4 bei hohem GI UND hoher GL ohne nennenswerte Ballaststoffe', () => {
    const result = estimateNovaGroup({
      giCategory: 'hoch',
      glCategory: 'hoch',
      fiberPer100g: 0.5,
    })
    expect(result).toBe(4)
  })

  it('schätzt NOVA 3 bei kurzer Zutatenliste mit kulinarischen Grundzutaten', () => {
    const result = estimateNovaGroup({
      ingredientsText: 'Mehl, Wasser, Salz',
      giCategory: 'niedrig',
      glCategory: 'niedrig',
    })
    expect(result).toBe(3)
  })

  it('gibt null zurück, wenn die Anhaltspunkte nicht eindeutig genug sind', () => {
    const result = estimateNovaGroup({
      giCategory: 'niedrig',
      glCategory: 'niedrig',
    })
    expect(result).toBeNull()
  })
})
