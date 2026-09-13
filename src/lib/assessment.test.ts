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

describe('assessFood – Gesamtsignal', () => {
  it('ist grün, wenn NOVA, GL und Omega alle unauffällig sind', () => {
    const food = baseFood({ nova: 1, gi: 30, carbsPer100g: 10, portionG: 100, omega: omega('guenstig') })
    expect(assessFood(food).signal).toBe('gruen')
  })

  it('ist gelb, wenn genau ein Kriterium schlecht ist (nur NOVA 4)', () => {
    const food = baseFood({ nova: 4, gi: 30, carbsPer100g: 10, portionG: 100, omega: omega('guenstig') })
    expect(assessFood(food).signal).toBe('gelb')
  })

  it('ist rot, wenn NOVA 4 UND hohe GL zusammentreffen (Spezifikationsfall)', () => {
    const food = baseFood({ nova: 4, gi: 90, carbsPer100g: 50, portionG: 100, omega: omega('guenstig') })
    expect(assessFood(food).glCategory).toBe('hoch')
    expect(assessFood(food).signal).toBe('rot')
  })

  it('ist rot, wenn hohe GL UND ungünstiges Omega zusammentreffen, auch ohne NOVA 4', () => {
    const food = baseFood({ nova: 1, gi: 90, carbsPer100g: 50, portionG: 100, omega: omega('unguenstig') })
    expect(assessFood(food).signal).toBe('rot')
  })

  it('ist "unvollstaendig", wenn NOVA nicht bekannt ist', () => {
    const food = baseFood({ nova: null })
    expect(assessFood(food).signal).toBe('unvollstaendig')
  })

  it('ist "unvollstaendig", wenn keine Omega-Einordnung verfügbar ist', () => {
    const food = baseFood({ omega: omega('unbekannt') })
    expect(assessFood(food).signal).toBe('unvollstaendig')
  })

  it('ist "unvollstaendig", wenn kein GI/GL vorliegt', () => {
    const food = baseFood({ gi: null })
    expect(assessFood(food).signal).toBe('unvollstaendig')
  })
})
