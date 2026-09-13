import { useMemo, useState } from 'react'
import { foods } from './data/foods'
import type { FoodCategory, NovaGroup } from './types'
import { Filters } from './components/Filters'
import { FoodListItem } from './components/FoodListItem'
import { FoodDetail } from './components/FoodDetail'
import { AboutSection } from './components/AboutSection'

const sortedFoods = [...foods].sort((a, b) => a.name.localeCompare(b.name, 'de'))

function App() {
  const [query, setQuery] = useState('')
  const [category, setCategory] = useState<FoodCategory | 'alle'>('alle')
  const [nova, setNova] = useState<NovaGroup | 'alle'>('alle')
  const [selectedId, setSelectedId] = useState<string>(sortedFoods[0].id)

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase()
    return sortedFoods.filter((f) => {
      if (category !== 'alle' && f.category !== category) return false
      if (nova !== 'alle' && f.nova !== nova) return false
      if (q && !f.name.toLowerCase().includes(q)) return false
      return true
    })
  }, [query, category, nova])

  const selected = filtered.find((f) => f.id === selectedId) ?? filtered[0]

  return (
    <div className="min-h-screen bg-neutral-50 text-neutral-900 dark:bg-neutral-950 dark:text-neutral-100">
      <header className="border-b border-neutral-200 bg-white dark:border-neutral-800 dark:bg-neutral-900">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6">
          <h1 className="text-2xl font-bold tracking-tight">NovaNutritio</h1>
          <p className="mt-1 text-sm text-neutral-600 dark:text-neutral-400">
            Glykämischer Index, NOVA-Verarbeitungsgrad und Weight-Set-Point-Einschätzung für
            Lebensmittel.
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
            />
            <div className="max-h-[65vh] space-y-2 overflow-y-auto pr-1 lg:max-h-[70vh]">
              {filtered.length === 0 && (
                <p className="rounded-xl border border-dashed border-neutral-300 px-4 py-6 text-center text-sm text-neutral-500 dark:border-neutral-700 dark:text-neutral-400">
                  Kein Lebensmittel gefunden.
                </p>
              )}
              {filtered.map((f) => (
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
      </footer>
    </div>
  )
}

export default App
