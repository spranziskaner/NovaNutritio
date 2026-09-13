import { lazy, Suspense, useEffect, useMemo, useState } from 'react'
import type { FoodCategory, NovaGroup, RemoteFood } from './types'
import { Filters } from './components/Filters'
import { FoodListItem } from './components/FoodListItem'
import { FoodDetail } from './components/FoodDetail'
import { AboutSection } from './components/AboutSection'
import { getProductByBarcode, searchProductsByName, OpenFoodFactsError } from './lib/openfoodfacts'

// Zieht die vergleichsweise große ZXing-Scan-Bibliothek erst nach, wenn der
// Scanner tatsächlich geöffnet wird, statt sie in jedes initiale Laden der
// App einzurechnen.
const BarcodeScanner = lazy(() => import('./components/BarcodeScanner').then((m) => ({ default: m.BarcodeScanner })))

const SEARCH_DEBOUNCE_MS = 450
const MIN_QUERY_LENGTH = 2

const canScan = typeof navigator !== 'undefined' && !!navigator.mediaDevices?.getUserMedia

function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FoodCategory | 'alle'>('alle')
  const [nova, setNova] = useState<NovaGroup | 'alle'>('alle')
  const [results, setResults] = useState<RemoteFood[]>([])
  const [selectedId, setSelectedId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [scannerOpen, setScannerOpen] = useState(false)

  useEffect(() => {
    const trimmed = query.trim()
    if (trimmed.length < MIN_QUERY_LENGTH) {
      setResults([])
      setError(null)
      setLoading(false)
      return
    }

    const controller = new AbortController()
    const timer = setTimeout(() => {
      setLoading(true)
      setError(null)
      searchProductsByName(trimmed, { signal: controller.signal })
        .then((foods) => {
          setResults(foods)
          setSelectedId((current) => current ?? foods[0]?.id ?? null)
        })
        .catch((err: unknown) => {
          if (err instanceof DOMException && err.name === 'AbortError') return
          setError(err instanceof OpenFoodFactsError ? err.message : 'Suche ist fehlgeschlagen.')
        })
        .finally(() => setLoading(false))
    }, SEARCH_DEBOUNCE_MS)

    return () => {
      controller.abort()
      clearTimeout(timer)
    }
  }, [query])

  async function handleBarcode(barcode: string) {
    setScannerOpen(false)
    setLoading(true)
    setError(null)
    try {
      const food = await getProductByBarcode(barcode)
      if (!food) {
        setError(`Kein Produkt mit Barcode ${barcode} bei Open Food Facts gefunden.`)
        return
      }
      setResults((prev) => [food, ...prev.filter((f) => f.id !== food.id)])
      setSelectedId(food.id)
    } catch (err) {
      setError(err instanceof OpenFoodFactsError ? err.message : 'Barcode-Abfrage ist fehlgeschlagen.')
    } finally {
      setLoading(false)
    }
  }

  const filtered = useMemo(() => {
    return results.filter((f) => {
      if (category !== 'alle' && f.category !== category) return false
      if (nova !== 'alle' && f.nova !== nova) return false
      return true
    })
  }, [results, category, nova])

  const selected = filtered.find((f) => f.id === selectedId) ?? filtered[0]

  return (
    <div className="min-h-screen bg-stone-50 text-stone-900 dark:bg-stone-950 dark:text-stone-100">
      <header className="border-b-2 border-amber-700/40 bg-white dark:border-amber-500/30 dark:bg-stone-900">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <h1 className="font-display text-3xl font-bold tracking-[0.08em] text-stone-900 uppercase dark:text-stone-50">
            NovaNutritio
          </h1>
          <p className="mt-2 text-sm text-stone-600 dark:text-stone-400">
            Glykämischer Index & Last, NOVA-Verarbeitungsgrad und Omega-6/3-Einordnung – live über die{' '}
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
          <div className="space-y-4">
            <Filters
              query={query}
              onQueryChange={setQuery}
              category={category}
              onCategoryChange={setCategory}
              nova={nova}
              onNovaChange={setNova}
              canScan={canScan}
              onScanClick={() => setScannerOpen(true)}
              onBarcodeSubmit={handleBarcode}
            />

            {scannerOpen && (
              <Suspense
                fallback={
                  <p className="rounded-xl border border-dashed border-stone-300 px-4 py-3 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                    Scanner wird geladen …
                  </p>
                }
              >
                <BarcodeScanner onDetected={handleBarcode} onClose={() => setScannerOpen(false)} />
              </Suspense>
            )}

            <div className="max-h-[65vh] space-y-2 overflow-y-auto pr-1 lg:max-h-[70vh]">
              {loading && (
                <p className="rounded-xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                  Suche läuft …
                </p>
              )}
              {!loading && error && (
                <p className="rounded-xl border border-dashed border-rose-300 px-4 py-6 text-center text-sm text-rose-600 dark:border-rose-800 dark:text-rose-400">
                  {error}
                </p>
              )}
              {!loading && !error && query.trim().length < MIN_QUERY_LENGTH && results.length === 0 && (
                <p className="rounded-xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                  Lebensmittel oder Marke eingeben, oder einen Barcode scannen/eingeben, um die
                  Open-Food-Facts-Datenbank zu durchsuchen.
                </p>
              )}
              {!loading && !error && query.trim().length >= MIN_QUERY_LENGTH && filtered.length === 0 && (
                <p className="rounded-xl border border-dashed border-stone-300 px-4 py-6 text-center text-sm text-stone-500 dark:border-stone-700 dark:text-stone-400">
                  Kein Lebensmittel gefunden.
                </p>
              )}
              {!loading &&
                !error &&
                filtered.map((f) => (
                  <FoodListItem
                    key={f.id}
                    food={f}
                    active={f.id === selected?.id}
                    onSelect={() => setSelectedId(f.id)}
                  />
                ))}
            </div>
          </div>

          <div>{selected && <FoodDetail food={selected} />}</div>
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
