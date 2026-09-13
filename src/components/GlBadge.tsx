import type { GlCategory } from '../lib/assessment'
import { InfoTooltip } from './InfoTooltip'

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
  'Glykämische Last (GL) = GI × Kohlenhydratmenge der Portion / 100. Bildet anders als der GI allein die tatsächliche Blutzucker-/Insulin-Gesamtbelastung der Portion ab – Bewertungsgrundlage dieser App, nicht auf 100 g bezogen (der Wert je 100 g dient nur zum Vergleich).'

export function GlBadge({
  category,
  value,
  valuePer100g,
}: {
  category: GlCategory
  /** Glykämische Last der tatsächlichen Portion – Bewertungsgrundlage. */
  value: number | null
  /** Glykämische Last je 100 g – nur zum Vergleich, nicht die Bewertungsgrundlage. */
  valuePer100g?: number | null
}) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STYLES[category]}`}
      >
        <span className={`h-2 w-2 rounded-full ${DOT[category]}`} />
        GL {LABEL[category]}
        <InfoTooltip text={INFO_TEXT} label="Mehr zur glykämischen Last" />
      </span>
      {value !== null && <span className="text-xs text-stone-500 dark:text-stone-400">{value.toFixed(1)}</span>}
      {valuePer100g != null && (
        <span className="text-[11px] text-stone-400 dark:text-stone-500">({valuePer100g.toFixed(1)} je 100 g)</span>
      )}
    </div>
  )
}
