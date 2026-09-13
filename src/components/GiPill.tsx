import type { GiCategory } from '../lib/assessment'

const STYLES: Record<GiCategory, string> = {
  niedrig: 'text-emerald-700 dark:text-emerald-300',
  mittel: 'text-amber-700 dark:text-amber-300',
  hoch: 'text-rose-700 dark:text-rose-300',
  'n/a': 'text-stone-500 dark:text-stone-400',
}

export function GiPill({ gi, category }: { gi: number | null; category: GiCategory }) {
  return (
    <span className={`font-semibold ${STYLES[category]}`}>
      {gi === null ? 'n/a' : gi}
      {gi !== null && <span className="ml-1 text-xs font-normal opacity-80">({category})</span>}
    </span>
  )
}
