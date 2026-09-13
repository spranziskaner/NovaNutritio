import type { GlCategory } from '../lib/assessment'

const STYLES: Record<GlCategory, string> = {
  niedrig:
    'bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/30',
  mittel: 'bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/30',
  hoch: 'bg-rose-100 text-rose-800 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/30',
  'n/a': 'bg-stone-100 text-stone-500 ring-stone-500/20 dark:bg-stone-800 dark:text-stone-400 dark:ring-stone-500/30',
}

const DOT: Record<GlCategory, string> = {
  niedrig: 'bg-emerald-500',
  mittel: 'bg-amber-500',
  hoch: 'bg-rose-500',
  'n/a': 'bg-stone-400',
}

const LABEL: Record<GlCategory, string> = {
  niedrig: 'niedrig',
  mittel: 'mittel',
  hoch: 'hoch',
  'n/a': 'nicht verfügbar',
}

const INFO_TEXT =
  'Glykämische Last (GL) = GI × Kohlenhydratmenge / 100, immer auf 100 g bezogen. Bildet anders als der GI allein die tatsächliche Blutzucker-/Insulin-Gesamtbelastung ab.'

export function GlBadge({ category, value }: { category: GlCategory; value: number | null }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STYLES[category]}`}
        title={INFO_TEXT}
      >
        <span className={`h-2 w-2 rounded-full ${DOT[category]}`} />
        GL {LABEL[category]}
        <span aria-hidden="true" className="opacity-60">
          ⓘ
        </span>
      </span>
      {value !== null && <span className="text-xs text-stone-500 dark:text-stone-400">{value.toFixed(1)}</span>}
    </div>
  )
}
