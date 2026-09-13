import { useEffect, useMemo, useState } from 'react'
import type { FoodCategory, NovaGroup, RemoteFood } from './types'
import { Filters } from './components/Filters'
import { FoodListItem } from './components/FoodListItem'
import { FoodDetail } from './components/FoodDetail'
import { AboutSection } from './components/AboutSection'
import { BarcodeScanner } from './components/BarcodeScanner'
import { getProductByBarcode, searchProductsByName, OpenFoodFactsError } from './lib/openfoodfacts'

const SEARCH_DEBOUNCE_MS = 450
const MIN_QUERY_LENGTH = 2

const canScan = typeof window !== 'undefined' && 'BarcodeDetector' in window

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
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight">NovaNutritio</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Glykämischer Index, NOVA-Verarbeitungsgrad und Weight-Set-Point-Einschätzung – live über die{' '}
            <a
              href="https://world.openfoodfacts.org"
              target="_blank"
              rel="noreferrer"
              className="underline hover:text-teal-600 dark:hover:text-teal-400"
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
              <BarcodeScanner onDetected={handleBarcode} onClose={() => setScannerOpen(false)} />
            )}

            <div className="max-h-[65vh] space-y-2 overflow-y-auto pr-1 lg:max-h-[70vh]">
              {loading && (
                <p className="rounded-xl border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                  Suche läuft …
                </p>
              )}
              {!loading && error && (
                <p className="rounded-xl border border-dashed border-rose-300 px-4 py-6 text-center text-sm text-rose-600 dark:border-rose-800 dark:text-rose-400">
                  {error}
                </p>
              )}
              {!loading && !error && query.trim().length < MIN_QUERY_LENGTH && results.length === 0 && (
                <p className="rounded-xl border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                  Lebensmittel oder Marke eingeben, oder einen Barcode scannen/eingeben, um die
                  Open-Food-Facts-Datenbank zu durchsuchen.
                </p>
              )}
              {!loading && !error && query.trim().length >= MIN_QUERY_LENGTH && filtered.length === 0 && (
                <p className="rounded-xl border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
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

      <footer className="mx-auto max-w-5xl px-4 pb-8 pt-2 text-xs text-neutral-400 sm:px-6 dark:text-neutral-600">
        Inspiriert vom Weight-Set-Point-Konzept nach Dr. Andrew Jenkinson. Kein medizinischer Rat.
        Produktdaten © Open Food Facts Mitwirkende (ODbL).
      </footer>
    </div>
  )
}

export default App
