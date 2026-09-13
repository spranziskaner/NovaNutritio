import type { SetPointVerdict } from '../lib/assessment'

const STYLES: Record<SetPointVerdict, string> = {
  freundlich:
    'bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/30',
  neutral:
    'bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/30',
  belastend:
    'bg-orange-100 text-orange-800 ring-orange-600/20 dark:bg-orange-500/15 dark:text-orange-300 dark:ring-orange-400/30',
  'stark-belastend':
    'bg-rose-100 text-rose-800 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/30',
  unbekannt:
    'bg-neutral-100 text-neutral-600 ring-neutral-500/20 dark:bg-neutral-800 dark:text-neutral-400 dark:ring-neutral-500/30',
}

const DOT: Record<SetPointVerdict, string> = {
  freundlich: 'bg-emerald-500',
  neutral: 'bg-amber-500',
  belastend: 'bg-orange-500',
  'stark-belastend': 'bg-rose-500',
  unbekannt: 'bg-neutral-400',
}

export function VerdictBadge({ verdict, headline }: { verdict: SetPointVerdict; headline: string }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${STYLES[verdict]}`}
    >
      <span className={`h-2 w-2 rounded-full ${DOT[verdict]}`} />
      {headline}
    </span>
  )
}
