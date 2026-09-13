import type { FoodCategory, NovaGroup } from '../types'
import { CATEGORY_LABELS, CATEGORY_ORDER } from '../data/categories'

export function Filters({
  query,
  onQueryChange,
  category,
  onCategoryChange,
  nova,
  onNovaChange,
}: {
  query: string
  onQueryChange: (v: string) => void
  category: FoodCategory | 'alle'
  onCategoryChange: (v: FoodCategory | 'alle') => void
  nova: NovaGroup | 'alle'
  onNovaChange: (v: NovaGroup | 'alle') => void
}) {
  return (
    <div className="space-y-3">
      <input
        type="search"
        value={query}
        onChange={(e) => onQueryChange(e.target.value)}
        placeholder="Lebensmittel suchen …"
        className="w-full rounded-xl border border-neutral-300 bg-white px-4 py-2.5 text-neutral-900 placeholder-neutral-400 focus:border-teal-500 focus:outline-none focus:ring-2 focus:ring-teal-500/30 dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-100"
      />
      <div className="flex flex-wrap gap-2">
        <select
          value={category}
          onChange={(e) => onCategoryChange(e.target.value as FoodCategory | 'alle')}
          className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 focus:border-teal-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
        >
          <option value="alle">Alle Kategorien</option>
          {CATEGORY_ORDER.map((c) => (
            <option key={c} value={c}>
              {CATEGORY_LABELS[c]}
            </option>
          ))}
        </select>
        <select
          value={nova}
          onChange={(e) =>
            onNovaChange(e.target.value === 'alle' ? 'alle' : (Number(e.target.value) as NovaGroup))
          }
          className="rounded-lg border border-neutral-300 bg-white px-3 py-1.5 text-sm text-neutral-700 focus:border-teal-500 focus:outline-none dark:border-neutral-700 dark:bg-neutral-900 dark:text-neutral-300"
        >
          <option value="alle">Alle NOVA-Gruppen</option>
          <option value="1">NOVA 1 · unverarbeitet</option>
          <option value="2">NOVA 2 · Zutat</option>
          <option value="3">NOVA 3 · verarbeitet</option>
          <option value="4">NOVA 4 · ultra-verarbeitet</option>
        </select>
      </div>
    </div>
  )
}
