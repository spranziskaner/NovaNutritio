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
})
