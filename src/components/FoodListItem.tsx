import type { RemoteFood } from '../types'
import { assessFood } from '../lib/assessment'
import { NovaBadge } from './NovaBadge'
import { GiPill } from './GiPill'

export function FoodListItem({
  food,
  active,
  onSelect,
}: {
  food: RemoteFood
  active: boolean
  onSelect: () => void
}) {
  const assessment = assessFood(food)

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
      <div className="flex items-center justify-between gap-3">
        <span className="min-w-0">
          <span className="block truncate font-medium text-stone-900 dark:text-stone-100">{food.name}</span>
          {food.brand && (
            <span className="block truncate text-xs text-stone-500 dark:text-stone-400">{food.brand}</span>
          )}
        </span>
        <NovaBadge nova={food.nova} />
      </div>
      <div className="mt-1.5 flex items-center gap-4 text-sm text-stone-600 dark:text-stone-400">
        <span>
          GI <GiPill gi={food.gi} category={assessment.giCategory} />
        </span>
        <span className="truncate">{assessment.headline}</span>
      </div>
    </button>
  )
}
