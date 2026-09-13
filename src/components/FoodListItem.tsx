import type { FoodSummary } from '../types'

/**
 * Zeigt einen Suchtreffer als reine Vorschau (Name, Marke, Bild). GI/GL/NOVA/
 * Weight-Set-Point stehen an dieser Stelle bewusst nicht zur Verfügung bzw.
 * werden hier bewusst nicht angezeigt: die vollständige Bewertung erscheint
 * erst in der Detailansicht, wenn ein Treffer ausgewählt wird (siehe
 * `App.tsx`, `loadFoodDetail.ts`).
 */
export function FoodListItem({
  food,
  active,
  onSelect,
}: {
  food: FoodSummary
  active: boolean
  onSelect: () => void
}) {
  return (
    <button
      type="button"
      onClick={onSelect}
      className={`w-full rounded-xl border px-4 py-3 text-left transition-colors ${
        active
          ? 'border-amber-500 bg-amber-50 dark:border-amber-400 dark:bg-amber-500/10'
          : 'border-stone-200 bg-white hover:border-stone-300 hover:bg-stone-50 dark:border-stone-800 dark:bg-stone-900 dark:hover:border-stone-700 dark:hover:bg-stone-800/60'
      }`}
    >
      <div className="flex items-center gap-3">
        {food.imageUrl && (
          <img
            src={food.imageUrl}
            alt=""
            className="h-10 w-10 flex-none rounded-md border border-stone-200 object-contain dark:border-stone-800"
          />
        )}
        <span className="min-w-0 flex-1">
          <span className="block truncate font-medium text-stone-900 dark:text-stone-100">{food.name}</span>
          {food.brand && (
            <span className="block truncate text-xs text-stone-500 dark:text-stone-400">{food.brand}</span>
          )}
        </span>
      </div>
    </button>
  )
}
