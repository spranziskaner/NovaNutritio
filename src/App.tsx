import { useEffect, useRef, useState } from 'react'
import type { FoodSummary, RemoteFood } from './types'
import { Filters } from './components/Filters'
import { FoodListItem } from './components/FoodListItem'
import { FoodDetail } from './components/FoodDetail'
import { AboutSection } from './components/AboutSection'
import { searchFoods } from './lib/search'
import { loadFoodDetail } from './lib/loadFoodDetail'

const SEARCH_DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 2

function App() {
  const [query, setQuery] = useState('')
  const [results, setResults] = useState<FoodSummary[]>([])
  const [searchError, setSearchError] = useState<string | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  // Vollständige Bewertung (GI/GL/NOVA/Omega) wird erst nachgeladen, wenn ein
  // Treffer ausgewählt wird – die Suche selbst liefert nur Anzeigefelder.
  const [detail, setDetail] = useState<RemoteFood | null>(null)
  const [detailError, setDetailError] = useState<string | null>(null)
  const [searchLoading, setSearchLoading] = useState(false)
  const [detailLoading, setDetailLoading] = useState(false)
  // Steuert auf schmalen Bildschirmen, ob Liste oder Detailansicht sichtbar
  // ist (auf breiten Bildschirmen stehen beide immer nebeneinander).
  const [mobileView, setMobileView] = useState<'liste' | 'detail'>('liste')
  // Verwirft die Antwort einer überholten Anfrage, falls eine neuere
  // schneller zurückkommt.
  const searchRequestIdRef = useRef(0)
  const detailRequestIdRef = useRef(0)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      searchRequestIdRef.current++
      setResults([])
      setSearchLoading(false)
      return
    }

    const timer = setTimeout(() => {
      const requestId = ++searchRequestIdRef.current
      setSearchLoading(true)
      setSearchError(null)
      searchFoods(trimmed)
        .then((foods) => {
          if (searchRequestIdRef.current !== requestId) return
          setResults(foods)
          setSelectedId((current) => (current && foods.some((f) => f.id === current) ? current : (foods[0]?.id ?? null)))
        })
        .catch((err: unknown) => {
          if (searchRequestIdRef.current !== requestId) return
          console.error('Suche fehlgeschlagen:', err)
          setResults([])
          setSearchError(err instanceof Error ? err.message : 'Suche fehlgeschlagen.')
        })
        .finally(() => {
          if (searchRequestIdRef.current === requestId) setSearchLoading(false)
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query])

  useEffect(() => {
    if (!selectedId) {
      detailRequestIdRef.current++
      setDetail(null)
      setDetailError(null)
      setDetailLoading(false)
      return
    }

    const requestId = ++detailRequestIdRef.current
    setDetail(null)
    setDetailError(null)
    setDetailLoading(true)
    loadFoodDetail(selectedId)
      .then((food) => {
        if (detailRequestIdRef.current !== requestId) return
        setDetail(food)
      })
      .catch((err: unknown) => {
        if (detailRequestIdRef.current !== requestId) return
        console.error('Produktdetails laden fehlgeschlagen:', err)
        setDetail(null)
        setDetailError(err instanceof Error ? err.message : 'Produktdetails konnten nicht geladen werden.')
      })
      .finally(() => {
        if (detailRequestIdRef.current === requestId) setDetailLoading(false)
      })
  }, [selectedId])

  function handleQueryChange(value: string) {
    setQuery(value)
    setMobileView('liste')
  }

  function handleSelect(id: string) {
    setSelectedId(id)
    setMobileView('detail')
  }

  const trimmedQuery = query.trim()
  const queryTooShort = trimmedQuery.length < MIN_QUERY_LENGTH

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="border-b-2 border-amber-700/40 bg-white dark:border-amber-500/30 dark:bg-stone-900">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <h1 className="font-display text-3xl font-bold tracking-[0.08em] text-stone-900 uppercase dark:text-stone-50">
            Nova Nutritio
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Glykämischer Index & Last, NOVA-Verarbeitungsgrad und Omega-6/3-Einordnung als
            Weight-Set-Point-Signal – Suche und Produktdaten kommen live über die offizielle{' '}
            <a
              href="https://github.com/openfoodfacts/openfoodfacts-js"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-amber-600 dark:hover:text-amber-400"
            >
              Open-Food-Facts-SDK
            </a>
            .
          </p>
        </div>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
        <div className="mb-6">
          <AboutSection />
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-[minmax(0,22rem)_1fr]">
          <div className={`space-y-4 ${mobileView === 'detail' ? 'hidden lg:block' : ''}`}>
            <Filters query={query} onQueryChange={handleQueryChange} />

            <div className="space-y-2">
              {queryTooShort && (
                <p className="rounded-xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                  Mindestens {MIN_QUERY_LENGTH} Zeichen eingeben, um Open Food Facts zu durchsuchen.
                </p>
              )}
              {!queryTooShort && searchLoading && (
                <p className="rounded-xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                  Suche läuft …
                </p>
              )}
              {!queryTooShort && !searchLoading && searchError && (
                <p className="rounded-xl border border-dashed border-rose-300 px-4 py-6 text-center text-sm text-rose-600 dark:border-rose-800 dark:text-rose-400">
                  Suche fehlgeschlagen: {searchError}
                </p>
              )}
              {!queryTooShort && !searchLoading && !searchError && results.length === 0 && (
                <p className="rounded-xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                  Kein Lebensmittel gefunden.
                </p>
              )}
              {!queryTooShort &&
                !searchLoading &&
                !searchError &&
                results.map((f) => (
                  <FoodListItem key={f.id} food={f} active={f.id === selectedId} onSelect={() => handleSelect(f.id)} />
                ))}
            </div>
          </div>

          <div className={mobileView === 'detail' ? 'block' : 'hidden lg:block'}>
            <button
              type="button"
              onClick={() => setMobileView('liste')}
              className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 lg:hidden dark:text-stone-400 dark:hover:text-stone-100"
            >
              ← Zurück zur Liste
            </button>
            {detailLoading && (
              <p className="rounded-xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                Produktdetails werden geladen …
              </p>
            )}
            {!detailLoading && detail && <FoodDetail food={detail} />}
            {!detailLoading && !detail && selectedId && (
              <p className="rounded-xl border border-dashed border-rose-300 px-4 py-6 text-center text-sm text-rose-600 dark:border-rose-800 dark:text-rose-400">
                {detailError ?? 'Produktdetails konnten nicht geladen werden.'}
              </p>
            )}
          </div>
        </div>
      </main>

      <footer className="mx-auto max-w-5xl px-4 pb-8 pt-2 text-xs text-stone-400 sm:px-6 dark:text-stone-600">
        Inspiriert vom Weight-Set-Point-Konzept nach Dr. Andrew Jenkinson. Kein medizinischer Rat.
        Produktdaten © Open Food Facts Mitwirkende (ODbL).
      </footer>
    </div>
  )
}

export default App
