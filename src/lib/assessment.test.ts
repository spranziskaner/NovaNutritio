import { describe, expect, it } from 'vitest'
import { assessFood } from './assessment'
import type { AssessableFood, OmegaAssessment } from '../types'

function omega(category: OmegaAssessment['category'], overrides: Partial<OmegaAssessment> = {}): OmegaAssessment {
  return { category, isWalnutSpecialCase: false, provenanceUnknown: false, reasonLabel: 'test', ratio: null, ...overrides }
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

  it('NOVA 4 ist ein Basis-Filter: macht ein Lebensmittel auch bei niedriger GI/GL automatisch "ungünstig"', () => {
    const food = baseFood({ nova: 4, gi: 20, carbsPer100g: 5, portionG: 100, omega: omega('guenstig') })
    expect(assessFood(food).glCategory).toBe('niedrig')
    expect(assessFood(food).signal).toBe('rot')
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

  it('NOVA 4 entscheidet auch dann, wenn GI/GL gar nicht bekannt sind', () => {
    const food = baseFood({ gi: null, nova: 4, omega: omega('guenstig') })
    const result = assessFood(food)
    expect(result.signal).toBe('rot')
    expect(result.signalIncomplete).toBe(true)
  })

  it('ist nur dann "unvollstaendig", wenn wirklich kein einziges Kriterium bekannt ist', () => {
    const food = baseFood({ nova: null, gi: null, omega: omega('unbekannt') })
    const result = assessFood(food)
    expect(result.signal).toBe('unvollstaendig')
    expect(result.signalIncomplete).toBe(true)
  })

  it('GL (nicht GI) bestimmt die Basis-Einstufung, wenn beide bekannt sind', () => {
    // GI 70 (hoch), aber sehr geringe Kohlenhydratmenge -> GL bleibt niedrig. GI spielt laut
    // Jenkinson nur eine Nebenrolle (Geschwindigkeit statt Gesamtmenge) und darf ein durch GL
    // niedrig eingestuftes Lebensmittel nicht in eine schlechtere Kategorie ziehen.
    const food = baseFood({ gi: 70, carbsPer100g: 5, portionG: 100, nova: 1, omega: omega('guenstig') })
    const result = assessFood(food)
    expect(result.giCategory).toBe('hoch')
    expect(result.glCategory).toBe('niedrig')
    expect(result.signal).toBe('gruen')
  })

  it('NOVA/Omega können eine durch GL ausgelöste "ungünstige Wirkung" nicht auf "günstig" zurücksetzen', () => {
    const food = baseFood({ gi: 90, carbsPer100g: 50, portionG: 100, nova: 1, omega: omega('guenstig') })
    expect(assessFood(food).signal).not.toBe('gruen')
  })

  it('Regressionstest: Weißmehl-Baguette (GI 95) wird als ungünstig eingestuft', () => {
    // Reale Produktdaten: GI 95, Kohlenhydrate 55g/100g, Ballaststoffe 2,4g/100g (unter der
    // 3g-Ballaststoffquelle-Schwelle, keine Dämpfung), NOVA 3, Omega unbekannt.
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

  it('hoher Ballaststoffgehalt (≥3g/100g) dämpft eine hohe GL um eine Stufe', () => {
    const withFiber = baseFood({ gi: 70, carbsPer100g: 30, portionG: 100, fiberPer100g: 5, nova: 1, omega: omega('guenstig') })
    const withoutFiber = baseFood({ gi: 70, carbsPer100g: 30, portionG: 100, fiberPer100g: 1, nova: 1, omega: omega('guenstig') })

    expect(assessFood(withFiber).glCategory).toBe('hoch')
    expect(assessFood(withFiber).signal).toBe('gelb')
    expect(assessFood(withoutFiber).signal).toBe('rot')
  })

  it('niedriger Ballaststoffgehalt verschärft eine bereits niedrige GL nicht zusätzlich', () => {
    const food = baseFood({ gi: 30, carbsPer100g: 20, fiberPer100g: 1, portionG: 100, nova: 1, omega: omega('guenstig') })
    expect(assessFood(food).glCategory).toBe('niedrig')
    expect(assessFood(food).signal).toBe('gruen')
  })

  it('Glykämische Last bezieht sich auf die tatsächliche Portion – der Wert je 100g bleibt zum Vergleich gleich', () => {
    const kleinePortion = baseFood({ gi: 80, carbsPer100g: 40, portionG: 20, nova: 1, omega: omega('guenstig') })
    const grossePortion = baseFood({ gi: 80, carbsPer100g: 40, portionG: 300, nova: 1, omega: omega('guenstig') })

    const a = assessFood(kleinePortion)
    const b = assessFood(grossePortion)

    expect(a.glValue).toBeCloseTo(6.4, 2)
    expect(b.glValue).toBeCloseTo(96, 2)
    expect(a.glValuePer100g).toBeCloseTo(32, 2)
    expect(a.glValuePer100g).toBe(b.glValuePer100g)
  })

  it('Regressionstest: Vollkorn-Bulgur (realistische Trockenportion) wird trotz hoher GL nicht automatisch "ungünstig"', () => {
    // GI 61, Kohlenhydrate 78g/100g (trocken), Ballaststoffe 5,8g/100g, NOVA 1, Omega unbekannt
    // (Getreide ohne relevante Fettquelle), realistische trockene Portion 60g (nicht 100g).
    const bulgur: AssessableFood = {
      gi: 61,
      portionG: 60,
      carbsPer100g: 78,
      fiberPer100g: 5.8,
      nova: 1,
      omega: omega('unbekannt'),
    }
    const result = assessFood(bulgur)

    expect(result.glCategory).toBe('hoch')
    expect(result.signal).not.toBe('rot')
  })
})
