import type { NovaGroup } from '../types'
import { novaLabel } from '../lib/assessment'

const STYLES: Record<NovaGroup, string> = {
  1: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/30',
  2: 'bg-sky-100 text-sky-800 ring-sky-600/20 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-400/30',
  3: 'bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/30',
  4: 'bg-rose-100 text-rose-800 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/30',
}

export function NovaBadge({ nova, withLabel = false }: { nova: NovaGroup; withLabel?: boolean }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STYLES[nova]}`}
      title={novaLabel(nova)}
    >
      NOVA {nova}
      {withLabel && <span className="hidden font-normal sm:inline">· {novaLabel(nova)}</span>}
    </span>
  )
}
