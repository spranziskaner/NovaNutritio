import { useEffect, useRef, useState } from 'react'
import type { RemoteFood } from './types'
import { Filters } from './components/Filters'
import { FoodListItem } from './components/FoodListItem'
import { FoodDetail } from './components/FoodDetail'
import { AboutSection } from './components/AboutSection'
import { searchFoods } from './lib/search'
import { listLocalFoods } from './lib/localFoodSearch'

const SEARCH_DEBOUNCE_MS = 300
const MIN_QUERY_LENGTH = 2

function App() {
  const [query, setQuery] = useState('')
  // null = keine Suchanfrage aktiv, der lokale Grundbestand wird angezeigt.
  const [searchResults, setSearchResults] = useState<RemoteFood[] | null>(null)
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  // Steuert auf schmalen Bildschirmen, ob Liste oder Detailansicht sichtbar
  // ist (auf breiten Bildschirmen stehen beide immer nebeneinander).
  const [mobileView, setMobileView] = useState<'liste' | 'detail'>('liste')
  // Verwirft die Antwort einer überholten Suchanfrage, falls eine neuere
  // schneller zurückkommt (z. B. weil der Offline-Datensatz erst geladen
  // werden musste).
  const requestIdRef = useRef(0)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      requestIdRef.current++
      setLoading(false)
      return
    }

    const timer = setTimeout(() => {
      const requestId = ++requestIdRef.current
      setLoading(true)
      searchFoods(trimmed)
        .then((foods) => {
          if (requestIdRef.current !== requestId) return
          setSearchResults(foods)
          setSelectedId((current) => current ?? foods[0]?.id ?? null)
        })
        .finally(() => {
          if (requestIdRef.current === requestId) setLoading(false)
        })
    }, SEARCH_DEBOUNCE_MS)

    return () => clearTimeout(timer)
  }, [query])

  function handleQueryChange(value: string) {
    setQuery(value)
    setMobileView('liste')
  }

  function handleSelect(id: string) {
    setSelectedId(id)
    setMobileView('detail')
  }

  const trimmedQuery = query.trim()
  const filtered = trimmedQuery.length < MIN_QUERY_LENGTH ? listLocalFoods() : (searchResults ?? [])

  const selected = filtered.find((f) => f.id === selectedId) ?? filtered[0]

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="border-b-2 border-amber-700/40 bg-white dark:border-amber-500/30 dark:bg-stone-900">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <h1 className="font-display text-3xl font-bold tracking-[0.08em] text-stone-900 uppercase dark:text-stone-50">
            Nova Nutritio
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Glykämischer Index & Last, NOVA-Verarbeitungsgrad und Omega-6/3-Einordnung – vollständig lokal,
            ohne Live-Abfrage: aus einer handkuratierten Referenztabelle sowie einem lokalen Offline-Auszug
            der{' '}
            <a
              href="https://world.openfoodfacts.org"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-amber-600 dark:hover:text-amber-400"
            >
              Open-Food-Facts-Datenbank
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
              {loading && (
                <p className="rounded-xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                  Suche läuft …
                </p>
              )}
              {!loading && filtered.length === 0 && (
                <p className="rounded-xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                  Kein Lebensmittel gefunden.
                </p>
              )}
              {!loading &&
                filtered.map((f) => (
                  <FoodListItem
                    key={f.id}
                    food={f}
                    active={f.id === selected?.id}
                    onSelect={() => handleSelect(f.id)}
                  />
                ))}
            </div>
          </div>

          <div className={mobileView === 'detail' ? 'block' : 'hidden lg:block'}>
            {selected && (
              <>
                <button
                  type="button"
                  onClick={() => setMobileView('liste')}
                  className="mb-3 inline-flex items-center gap-1.5 text-sm font-medium text-stone-600 hover:text-stone-900 lg:hidden dark:text-stone-400 dark:hover:text-stone-100"
                >
                  ← Zurück zur Liste
                </button>
                <FoodDetail food={selected} />
              </>
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
