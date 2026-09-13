import type { Food } from '../types'
import { assessFood } from '../lib/assessment'
import { NovaBadge } from './NovaBadge'
import { GiPill } from './GiPill'

export function FoodListItem({
  food,
  active,
  onSelect,
}: {
  food: Food
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
          ? 'border-teal-500 bg-teal-50 dark:border-teal-400 dark:bg-teal-500/10'
          : 'border-neutral-200 bg-white hover:border-neutral-300 hover:bg-neutral-50 dark:border-neutral-800 dark:bg-neutral-900 dark:hover:border-neutral-700 dark:hover:bg-neutral-800/60'
      }`}
    >
      <div className="flex items-center justify-between gap-3">
        <span className="font-medium text-neutral-900 dark:text-neutral-100">{food.name}</span>
        <NovaBadge nova={food.nova} />
      </div>
      <div className="mt-1.5 flex items-center gap-4 text-sm text-neutral-600 dark:text-neutral-400">
        <span>
          GI <GiPill gi={food.gi} category={assessment.giCategory} />
        </span>
        <span className="truncate">{assessment.headline}</span>
      </div>
    </button>
  )
}
