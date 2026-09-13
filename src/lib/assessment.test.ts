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
    omega: omega('unbekannt'),
    ...overrides,
  }
}

describe('assessFood – gewichteter Weight-Set-Point-Composite-Score', () => {
  it('ist "sehr günstig", wenn NOVA, GL und Zucker durchgehend positiv sind', () => {
    const food = baseFood({ nova: 1, gi: 30, carbsPer100g: 10, portionG: 100, sugarPer100g: 3, fatPer100g: 0 })
    const result = assessFood(food)
    expect(result.compositeScore).toBeCloseTo(1.6, 2)
    expect(result.signal).toBe('sehr_guenstig')
  })

  it('Regressionstest: Weißbrot (NOVA 4, GI/GL hoch, Ballaststoffe niedrig, Zucker unbekannt) landet bei "ungünstig"', () => {
    // Reale Produktdaten (data/foods.ts "Weißbrot (Toast)"): GI 75, Kohlenhydrate 49g/100g,
    // Ballaststoffe 2,7g/100g, NOVA 4. Zucker/Fett nicht gepflegt -> unbekannt, fließt nicht als
    // (fälschlich positiver) Freifahrtschein ein, sondern wird aus der Gewichtung ausgeklammert.
    const weissbrot: AssessableFood = {
      gi: 75,
      portionG: 100,
      carbsPer100g: 49,
      fiberPer100g: 2.7,
      nova: 4,
      omega: omega('unbekannt'),
    }
    const result = assessFood(weissbrot)

    expect(result.giCategory).toBe('hoch')
    expect(result.glCategory).toBe('hoch')
    expect(result.compositeScore).toBeCloseTo(-1.529, 2)
    expect(result.signal).toBe('unguenstig')
  })

  it('Regressionstest: handwerkliche Weißmehl-Baguette (NOVA 3, nicht 4) landet nur bei "leicht ungünstig"', () => {
    // GI 95, Kohlenhydrate 55g/100g, Ballaststoffe 2,4g/100g, NOVA 3 (handwerklich, nicht
    // industriell) -> das mildere NOVA-Minus (-1 statt -2 bei NOVA 4) reicht zusammen mit der
    // hohen GL allein noch nicht für die härteste Stufe.
    const baguette: AssessableFood = {
      gi: 95,
      portionG: 100,
      carbsPer100g: 55,
      fiberPer100g: 2.4,
      nova: 3,
      omega: omega('unbekannt'),
    }
    const result = assessFood(baguette)

    expect(result.glCategory).toBe('hoch')
    expect(result.compositeScore).toBeCloseTo(-1.118, 2)
    expect(result.signal).toBe('leicht_unguenstig')
  })

  it('Regressionstest: Kichererbsen-Fusilli (niedriger GI, hohe Ballaststoffe/Protein) landet bei "sehr günstig"', () => {
    // GI 28, Kohlenhydrate 50g/100g (trocken), realistische Trockenportion 60g -> GL 8,4 (niedrig,
    // nicht "hoch" wie bei einer fälschlichen 100g-Portion). Ballaststoffe 10g/100g, Protein
    // 20g/100g, Zucker 3g/100g, NOVA 1.
    const fusilli: AssessableFood = {
      gi: 28,
      portionG: 60,
      carbsPer100g: 50,
      fiberPer100g: 10,
      proteinPer100g: 20,
      sugarPer100g: 3,
      fatPer100g: 6,
      nova: 1,
      omega: omega('unbekannt'),
    }
    const result = assessFood(fusilli)

    expect(result.glCategory).toBe('niedrig')
    expect(result.compositeScore).toBeCloseTo(1.7, 2)
    expect(result.signal).toBe('sehr_guenstig')
  })

  it('Regressionstest: Vollkorn-Bulgur (realistische Trockenportion) landet bei "günstig"', () => {
    // GI 61 (mittel), Kohlenhydrate 78g/100g (trocken), Ballaststoffe 5,8g/100g, NOVA 1,
    // realistische trockene Portion 60g (nicht 100g). GL bleibt bei 60g zwar rechnerisch "hoch"
    // (28,5), wird aber durch den moderaten GI (nicht "hoch") auf -1 statt -2 gemildert.
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
    expect(result.giCategory).toBe('mittel')
    expect(result.compositeScore).toBeCloseTo(0.588, 2)
    expect(result.signal).toBe('guenstig')
  })

  it('mildert eine hohe GL bei niedrigem GI (-1 statt -2), auch ohne ausreichend Ballaststoffe', () => {
    const niedrigerGi = baseFood({ nova: 1, gi: 25, carbsPer100g: 90, portionG: 100 })
    const hoherGi = baseFood({ nova: 1, gi: 80, carbsPer100g: 90, portionG: 100 })

    const a = assessFood(niedrigerGi)
    const b = assessFood(hoherGi)

    expect(a.glCategory).toBe('hoch')
    expect(b.glCategory).toBe('hoch')
    expect(a.compositeScore).toBeCloseTo(0.471, 2)
    expect(b.compositeScore).toBeCloseTo(0.118, 2)
    expect(a.signal).toBe('guenstig')
    expect(b.signal).toBe('neutral')
  })

  it('Omega-6/3 fließt nur ein, wenn der Fettanteil relevant ist (>5g/100g) — sonst neutral, nie negativ', () => {
    const fettRelevant = baseFood({
      nova: 2,
      gi: 60,
      carbsPer100g: 20,
      portionG: 100,
      sugarPer100g: 10,
      fatPer100g: 10,
      omega: omega('unguenstig'),
    })
    const fettIrrelevant = baseFood({
      nova: 2,
      gi: 60,
      carbsPer100g: 20,
      portionG: 100,
      sugarPer100g: 10,
      fatPer100g: 3,
      omega: omega('unguenstig'),
    })

    expect(assessFood(fettRelevant).compositeScore).toBeCloseTo(0.05, 2)
    expect(assessFood(fettIrrelevant).compositeScore).toBeCloseTo(0.35, 2)
  })

  it('rechnet bei fehlendem NOVA mit den übrigen bekannten Faktoren weiter (Gewicht wird umgelegt)', () => {
    const food = baseFood({ nova: null, gi: 30, carbsPer100g: 10, portionG: 100, sugarPer100g: 3, fatPer100g: 0 })
    const result = assessFood(food)
    expect(result.compositeScore).toBeCloseTo(1.385, 2)
    expect(result.signal).toBe('sehr_guenstig')
    expect(result.signalIncomplete).toBe(true)
  })

  it('ergibt "neutral" (nicht "nicht_bewertbar"), wenn praktisch nichts über das Produkt bekannt ist', () => {
    const food: AssessableFood = {
      gi: null,
      portionG: 100,
      carbsPer100g: 0,
      nova: null,
      omega: omega('unbekannt'),
    }
    const result = assessFood(food)
    expect(result.compositeScore).toBeCloseTo(0, 5)
    expect(result.signal).toBe('neutral')
    expect(result.signalIncomplete).toBe(true)
  })

  it('liefert einen Kontext-Hinweis zu Jenkinsons Tagesbudget passend zur GL-Kategorie', () => {
    const niedrig = assessFood(baseFood({ gi: 30, carbsPer100g: 5, portionG: 100 }))
    const hoch = assessFood(baseFood({ gi: 90, carbsPer100g: 50, portionG: 100 }))
    expect(niedrig.glContextHint).toMatch(/Tagesbudget/)
    expect(hoch.glContextHint).toMatch(/Tagesbudget/)
    expect(niedrig.glContextHint).not.toBe(hoch.glContextHint)
  })

  it('Glykämische Last bezieht sich auf die tatsächliche Portion – der Wert je 100g bleibt zum Vergleich gleich', () => {
    const kleinePortion = baseFood({ gi: 80, carbsPer100g: 40, portionG: 20 })
    const grossePortion = baseFood({ gi: 80, carbsPer100g: 40, portionG: 300 })

    const a = assessFood(kleinePortion)
    const b = assessFood(grossePortion)

    expect(a.glValue).toBeCloseTo(6.4, 2)
    expect(b.glValue).toBeCloseTo(96, 2)
    expect(a.glValuePer100g).toBeCloseTo(32, 2)
    expect(a.glValuePer100g).toBe(b.glValuePer100g)
  })
})
