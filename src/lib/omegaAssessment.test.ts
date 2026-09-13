import { describe, expect, it } from 'vitest'
import { assessOmega } from './omegaAssessment'

describe('assessOmega', () => {
  it('ordnet Walnüsse als Sonderfall ein (viel Omega-3 UND Omega-6)', () => {
    const result = assessOmega({
      category: 'nuesse-samen',
      categoriesTags: ['en:nuts', 'en:walnuts'],
      labelsTags: [],
    })
    expect(result.category).toBe('neutral')
    expect(result.isWalnutSpecialCase).toBe(true)
  })

  it('ordnet Sonnenblumenkerne als ungünstig ein', () => {
    const result = assessOmega({
      category: 'nuesse-samen',
      categoriesTags: ['en:seeds', 'en:sunflower-seeds'],
      labelsTags: [],
    })
    expect(result.category).toBe('unguenstig')
    expect(result.isWalnutSpecialCase).toBe(false)
  })

  it('ordnet Weidefleisch (mit grass-fed-Label) als günstig ein', () => {
    const result = assessOmega({
      category: 'fleisch-fisch-eier',
      categoriesTags: ['en:meats', 'en:beef'],
      labelsTags: ['en:grass-fed'],
    })
    expect(result.category).toBe('guenstig')
    expect(result.provenanceUnknown).toBe(false)
  })

  it('ordnet dieselbe Rindfleisch-Kategorie ohne Label als ungünstig ein und markiert Herkunft als unbekannt', () => {
    const result = assessOmega({
      category: 'fleisch-fisch-eier',
      categoriesTags: ['en:meats', 'en:beef'],
      labelsTags: [],
    })
    expect(result.category).toBe('unguenstig')
    expect(result.provenanceUnknown).toBe(true)
  })

  it('markiert Eier immer als neutral, unabhängig vom Label', () => {
    const withLabel = assessOmega({
      category: 'fleisch-fisch-eier',
      categoriesTags: ['en:eggs'],
      labelsTags: ['en:free-range'],
    })
    const withoutLabel = assessOmega({
      category: 'fleisch-fisch-eier',
      categoriesTags: ['en:eggs'],
      labelsTags: [],
    })
    expect(withLabel.category).toBe('neutral')
    expect(withoutLabel.category).toBe('neutral')
    expect(withoutLabel.provenanceUnknown).toBe(true)
  })

  it('erkennt Pflanzenöl in der Zutatenliste und überschreibt eine neutrale Kategorie mit ungünstig', () => {
    const result = assessOmega({
      category: 'sonstiges',
      categoriesTags: ['en:snacks'],
      labelsTags: [],
      ingredientsText: 'Kartoffeln, Sonnenblumenöl, Salz',
    })
    expect(result.category).toBe('unguenstig')
  })

  it('gibt "unbekannt" zurück, wenn weder Kategorie noch Zutatenliste einen Treffer liefern', () => {
    const result = assessOmega({
      category: 'sonstiges',
      categoriesTags: ['en:exotic-regional-product'],
      labelsTags: [],
    })
    expect(result.category).toBe('unbekannt')
  })

  it('berechnet das Verhältnis aus gemessenen Omega-3/6-Werten, wenn vorhanden, statt zu raten', () => {
    const result = assessOmega({
      category: 'nuesse-samen',
      categoriesTags: ['en:seeds', 'en:sunflower-seeds'], // würde per Kategorie als "ungünstig" gelten
      labelsTags: [],
      omega3Per100g: 2,
      omega6Per100g: 6,
    })
    expect(result.ratio).toBeCloseTo(3, 5)
    expect(result.category).toBe('guenstig')
  })

  it('ordnet ein gemessenes Verhältnis über 10:1 als ungünstig ein', () => {
    const result = assessOmega({
      category: 'oele-fette',
      categoriesTags: [],
      labelsTags: [],
      omega3Per100g: 1,
      omega6Per100g: 15,
    })
    expect(result.category).toBe('unguenstig')
  })

  it('fällt auf die Kategorie-Heuristik zurück, wenn Omega-3 mit 0 angegeben ist (Division durch 0 vermeiden)', () => {
    const result = assessOmega({
      category: 'nuesse-samen',
      categoriesTags: ['en:seeds', 'en:sunflower-seeds'],
      labelsTags: [],
      omega3Per100g: 0,
      omega6Per100g: 6,
    })
    expect(result.ratio).toBeNull()
    expect(result.category).toBe('unguenstig')
  })
})
