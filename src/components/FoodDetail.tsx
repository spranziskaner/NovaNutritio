import type { Food } from '../types'
import { assessFood } from '../lib/assessment'
import { CATEGORY_LABELS } from '../data/categories'
import { NovaBadge } from './NovaBadge'
import { VerdictBadge } from './VerdictBadge'
import { GiPill } from './GiPill'

function MacroStat({ label, value, unit = 'g' }: { label: string; value?: number; unit?: string }) {
  if (value === undefined) return null
  return (
    <div className="rounded-lg bg-neutral-50 px-3 py-2 text-center dark:bg-neutral-800/60">
      <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
        {value}
        <span className="text-xs font-normal text-neutral-500 dark:text-neutral-400">{unit}</span>
      </div>
      <div className="text-xs text-neutral-500 dark:text-neutral-400">{label}</div>
    </div>
  )
}

export function FoodDetail({ food }: { food: Food }) {
  const a = assessFood(food)

  return (
    <div className="rounded-2xl border border-neutral-200 bg-white p-5 dark:border-neutral-800 dark:bg-neutral-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="text-sm text-neutral-500 dark:text-neutral-400">{CATEGORY_LABELS[food.category]}</p>
          <h2 className="text-2xl font-bold text-neutral-900 dark:text-neutral-50">{food.name}</h2>
        </div>
        <VerdictBadge verdict={a.verdict} headline={a.headline} />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="rounded-lg bg-neutral-50 px-3 py-2 text-center dark:bg-neutral-800/60">
          <div className="text-lg font-semibold">
            <GiPill gi={food.gi} category={a.giCategory} />
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">Glykämischer Index</div>
        </div>
        <div className="rounded-lg bg-neutral-50 px-3 py-2 text-center dark:bg-neutral-800/60">
          <div className="text-lg font-semibold text-neutral-900 dark:text-neutral-100">
            {a.glValue === null ? 'n/a' : a.glValue.toFixed(1)}
            {a.glValue !== null && (
              <span className="ml-1 text-xs font-normal opacity-80">({a.glCategory})</span>
            )}
          </div>
          <div className="text-xs text-neutral-500 dark:text-neutral-400">
            Glykämische Last · {food.portionG} g Portion
          </div>
        </div>
        <div className="col-span-2 flex items-center justify-center gap-2 rounded-lg bg-neutral-50 px-3 py-2 dark:bg-neutral-800/60 sm:col-span-2">
          <NovaBadge nova={food.nova} />
        </div>
      </div>

      <p className="mt-3 text-sm text-neutral-600 dark:text-neutral-400">
        <span className="font-medium text-neutral-800 dark:text-neutral-200">NOVA-Einstufung: </span>
        {food.novaNote}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <MacroStat label="Kohlenhydrate /100g" value={food.carbsPer100g} />
        <MacroStat label="davon Zucker" value={food.sugarPer100g} />
        <MacroStat label="Ballaststoffe" value={food.fiberPer100g} />
        <MacroStat label="Protein" value={food.proteinPer100g} />
        <MacroStat label="Fett" value={food.fatPer100g} />
      </div>

      <div className="mt-6">
        <h3 className="text-sm font-semibold text-neutral-800 dark:text-neutral-200">
          Einschätzung zum Weight-Set-Point
        </h3>
        <ul className="mt-2 space-y-1.5">
          {a.reasoning.map((r) => (
            <li key={r} className="flex gap-2 text-sm text-neutral-600 dark:text-neutral-400">
              <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-neutral-400 dark:bg-neutral-600" />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
