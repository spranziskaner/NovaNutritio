import { describe, expect, it } from 'vitest'
import { assessFood } from './assessment'
import type { AssessableFood, OmegaAssessment } from '../types'

function omega(category: OmegaAssessment['category'], overrides: Partial<OmegaAssessment> = {}): OmegaAssessment {
  return { category, isWalnutSpecialCase: false, provenanceUnknown: false, reasonLabel: 'test', ...overrides }
}

function baseFood(overrides: Partial<AssessableFood>): AssessableFood {
  return {
    gi: 30,
    portionG: 100,
    carbsPer100g: 10,
    nova: 1,
    omega: omega('guenstig'),
    ...overrides,
  }
}

describe('assessFood – Weight-Set-Point-Signal', () => {
  it('ist grün, wenn GI/GL niedrig sind und NOVA/Omega unauffällig', () => {
    const food = baseFood({ nova: 1, gi: 30, carbsPer100g: 10, portionG: 100, omega: omega('guenstig') })
    expect(assessFood(food).signal).toBe('gruen')
  })

  it('ist gelb, wenn nur NOVA 4 als Modifikator dazukommt (GI/GL niedrig)', () => {
    const food = baseFood({ nova: 4, gi: 30, carbsPer100g: 10, portionG: 100, omega: omega('guenstig') })
    expect(assessFood(food).signal).toBe('gelb')
  })

  it('ist rot, wenn NOVA 4 UND hohe GL zusammentreffen', () => {
    const food = baseFood({ nova: 4, gi: 90, carbsPer100g: 50, portionG: 100, omega: omega('guenstig') })
    expect(assessFood(food).glCategory).toBe('hoch')
    expect(assessFood(food).signal).toBe('rot')
  })

  it('ist rot, wenn hohe GL UND ungünstiges Omega zusammentreffen, auch ohne NOVA 4', () => {
    const food = baseFood({ nova: 1, gi: 90, carbsPer100g: 50, portionG: 100, omega: omega('unguenstig') })
    expect(assessFood(food).signal).toBe('rot')
  })

  it('wird trotz fehlendem NOVA aus den übrigen bekannten Kriterien berechnet (grün + unvollständig markiert)', () => {
    const food = baseFood({ nova: null, gi: 30, carbsPer100g: 10, portionG: 100, omega: omega('guenstig') })
    const result = assessFood(food)
    expect(result.signal).toBe('gruen')
    expect(result.signalIncomplete).toBe(true)
  })

  it('wird trotz fehlender Omega-Einordnung aus GI/GL+NOVA berechnet', () => {
    const food = baseFood({ nova: 4, gi: 90, carbsPer100g: 50, portionG: 100, omega: omega('unbekannt') })
    const result = assessFood(food)
    expect(result.signal).toBe('rot')
    expect(result.signalIncomplete).toBe(true)
  })

  it('wird trotz fehlendem GI/GL aus NOVA+Omega berechnet', () => {
    const food = baseFood({ gi: null, nova: 4, omega: omega('guenstig') })
    const result = assessFood(food)
    expect(result.signal).toBe('gelb')
    expect(result.signalIncomplete).toBe(true)
  })

  it('ist nur dann "unvollstaendig", wenn wirklich kein einziges Kriterium bekannt ist', () => {
    const food = baseFood({ nova: null, gi: null, omega: omega('unbekannt') })
    const result = assessFood(food)
    expect(result.signal).toBe('unvollstaendig')
    expect(result.signalIncomplete).toBe(true)
  })

  it('GI allein bestimmt bereits die Basis-Einstufung, auch wenn die GL (geringe Kohlenhydratdichte) niedriger ausfällt', () => {
    // GI 70 (hoch) bei sehr geringer Kohlenhydratmenge pro 100g -> GL (immer auf 100g bezogen) bleibt niedrig, GI bleibt primär.
    const food = baseFood({ gi: 70, carbsPer100g: 5, nova: 1, omega: omega('guenstig') })
    const result = assessFood(food)
    expect(result.giCategory).toBe('hoch')
    expect(result.glCategory).toBe('niedrig')
    expect(result.signal).not.toBe('gruen')
  })

  it('NOVA/Omega können ein durch GI/GL ausgelöstes "auffällig" nicht auf "unauffällig" zurücksetzen', () => {
    const food = baseFood({ gi: 90, carbsPer100g: 50, portionG: 100, nova: 1, omega: omega('guenstig') })
    expect(assessFood(food).signal).not.toBe('gruen')
  })

  it('Regressionstest: Weißmehl-Baguette (GI 95) wird als auffällig eingestuft, nicht mehr als unauffällig', () => {
    // Reale Produktdaten: GI 95, Kohlenhydrate 55g/100g, Ballaststoffe 2,4g/100g, NOVA 3, Omega unbekannt.
    const baguette: AssessableFood = {
      gi: 95,
      portionG: 100,
      carbsPer100g: 55,
      fiberPer100g: 2.4,
      nova: 3,
      omega: omega('unbekannt'),
    }
    const result = assessFood(baguette)

    expect(result.giCategory).toBe('hoch')
    expect(result.glValue).toBeCloseTo(52.25, 2)
    expect(result.glCategory).toBe('hoch')
    expect(result.signal).toBe('rot')
    expect(result.signalIncomplete).toBe(true)
  })

  it('Ballaststoff-Verstärkung greift nur bei bereits auffälligem GI/GL, nicht eigenständig', () => {
    // Niedriges Ballaststoff-Verhältnis, aber GI/GL unauffällig (niedrig) -> keine Verstärkung, Signal bleibt grün.
    const food = baseFood({ gi: 30, carbsPer100g: 20, fiberPer100g: 1, portionG: 100, nova: 1, omega: omega('guenstig') })
    expect(assessFood(food).glCategory).toBe('niedrig')
    expect(assessFood(food).signal).toBe('gruen')
  })

  it('Glykämische Last ist immer auf 100g bezogen, unabhängig von der Portionsgröße', () => {
    const kleinePortion = baseFood({ gi: 80, carbsPer100g: 40, portionG: 20, nova: 1, omega: omega('guenstig') })
    const grossePortion = baseFood({ gi: 80, carbsPer100g: 40, portionG: 300, nova: 1, omega: omega('guenstig') })

    const a = assessFood(kleinePortion)
    const b = assessFood(grossePortion)

    expect(a.glValue).toBeCloseTo(32, 2)
    expect(a.glValue).toBe(b.glValue)
  })
})
