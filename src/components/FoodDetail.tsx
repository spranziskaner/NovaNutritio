import type { RemoteFood } from '../types'
import { assessFood } from '../lib/assessment'
import { CATEGORY_LABELS } from '../data/categories'
import { NovaBadge } from './NovaBadge'
import { WeightSetPointBadge } from './WeightSetPointBadge'
import { GiPill } from './GiPill'
import { GlBadge } from './GlBadge'
import { OmegaBadge } from './OmegaBadge'

function MacroStat({ label, value, unit = 'g' }: { label: string; value?: number; unit?: string }) {
  if (value === undefined) return null
  return (
    <div className="rounded-lg bg-stone-50 px-3 py-2 text-center dark:bg-stone-800/60">
      <div className="text-lg font-semibold text-stone-900 dark:text-stone-100">
        {value}
        <span className="text-xs font-normal text-stone-500 dark:text-stone-400">{unit}</span>
      </div>
      <div className="text-xs text-stone-500 dark:text-stone-400">{label}</div>
    </div>
  )
}

export function FoodDetail({ food }: { food: RemoteFood }) {
  const a = assessFood(food)

  return (
    <div className="rounded-2xl border border-stone-200 border-t-4 border-t-amber-700/70 bg-white p-5 dark:border-stone-800 dark:border-t-amber-500/60 dark:bg-stone-900 sm:p-6">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="flex items-start gap-3">
          {food.imageUrl && (
            <img
              src={food.imageUrl}
              alt=""
              className="h-24 w-24 flex-none rounded-lg border border-stone-200 object-contain sm:h-32 sm:w-32 dark:border-stone-800"
            />
          )}
          <div>
            <p className="text-sm text-stone-500 dark:text-stone-400">
              {CATEGORY_LABELS[food.category]}
              {food.brand && ` · ${food.brand}`}
            </p>
            <h2 className="font-serif text-2xl font-semibold text-stone-900 dark:text-stone-50">{food.name}</h2>
          </div>
        </div>
        <WeightSetPointBadge
          signal={a.signal}
          headline={a.headline}
          incomplete={a.signalIncomplete}
          compositeScore={a.compositeScore}
        />
      </div>

      <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-stone-50 px-3 py-2 text-center dark:bg-stone-800/60">
          <GiPill gi={food.gi} category={a.giCategory} source={food.giSource} />
          <div className="text-xs text-stone-500 dark:text-stone-400">Glykämischer Index</div>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-stone-50 px-3 py-2 text-center dark:bg-stone-800/60">
          <GlBadge category={a.glCategory} value={a.glValue} valuePer100g={a.glValuePer100g} />
          <div className="text-xs text-stone-500 dark:text-stone-400">Glykämische Last · {food.portionG} g Portion</div>
        </div>
        <div className="flex flex-col items-center justify-center gap-1 rounded-lg bg-stone-50 px-3 py-2 text-center dark:bg-stone-800/60">
          <OmegaBadge omega={food.omega} />
          <div className="text-xs text-stone-500 dark:text-stone-400">Omega-6/3-Verhältnis</div>
        </div>
        <div className="flex items-center justify-center gap-2 rounded-lg bg-stone-50 px-3 py-2 dark:bg-stone-800/60">
          <NovaBadge nova={food.nova} />
        </div>
      </div>

      <p className="mt-3 text-sm text-stone-600 dark:text-stone-400">
        <span className="font-medium text-stone-800 dark:text-stone-200">NOVA-Einstufung: </span>
        {food.novaNote}
      </p>
      <p className="mt-1 text-xs text-stone-400 dark:text-stone-600">
        Quelle: Open Food Facts · Barcode {food.barcode}
      </p>

      <div className="mt-5 grid grid-cols-2 gap-2 sm:grid-cols-5">
        <MacroStat label="Kohlenhydrate /100g" value={food.carbsPer100g} />
        <MacroStat label="davon Zucker" value={food.sugarPer100g} />
        <MacroStat label="Ballaststoffe" value={food.fiberPer100g} />
        <MacroStat label="Protein" value={food.proteinPer100g} />
        <MacroStat label="Fett" value={food.fatPer100g} />
      </div>

      <div className="mt-6">
        <h3 className="font-serif text-base font-semibold text-stone-800 dark:text-stone-200">
          Begründung zum Weight-Set-Point
        </h3>
        <ul className="mt-2 space-y-1.5">
          {a.reasoning.map((r) => (
            <li key={r} className="flex gap-2 text-sm text-stone-600 dark:text-stone-400">
              <span className="mt-1.5 h-1 w-1 flex-none rounded-full bg-stone-400 dark:bg-stone-600" />
              {r}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}
