import { STATUS_DOT, STATUS_EMOJI, type WeightSetPointStatus } from '../lib/assessment'
import { InfoTooltip } from './InfoTooltip'

const STYLES: Record<WeightSetPointStatus, string> = {
  sehr_guenstig:
    'bg-emerald-100 text-emerald-900 ring-emerald-600/30 dark:bg-emerald-500/20 dark:text-emerald-200 dark:ring-emerald-400/40',
  guenstig:
    'bg-emerald-50 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-400/30',
  neutral: 'bg-stone-100 text-stone-600 ring-stone-500/20 dark:bg-stone-800 dark:text-stone-400 dark:ring-stone-500/30',
  leicht_unguenstig:
    'bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/30',
  unguenstig: 'bg-rose-100 text-rose-800 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/30',
  nicht_bewertbar:
    'bg-stone-100 text-stone-500 ring-stone-500/20 dark:bg-stone-800 dark:text-stone-400 dark:ring-stone-500/30',
}

const DOT = STATUS_DOT
const EMOJI = STATUS_EMOJI

export function WeightSetPointBadge({
  signal,
  headline,
  incomplete = false,
  compositeScore = null,
}: {
  signal: WeightSetPointStatus
  headline: string
  incomplete?: boolean
  /** Gewichteter Composite-Score (-2 … +2), zur Info im Tooltip. */
  compositeScore?: number | null
}) {
  const incompleteNote =
    incomplete && signal !== 'nicht_bewertbar'
      ? ' Basiert nur auf den bekannten Faktoren – nicht alle (NOVA, GL, Zucker, Omega-6/3) liegen für dieses Produkt vor.'
      : ''
  const scoreNote = compositeScore !== null ? ` Gewichteter Score: ${compositeScore.toFixed(2)} (-2 bis +2).` : ''

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-sm font-semibold ring-1 ring-inset ${STYLES[signal]}`}
    >
      <span aria-hidden="true">{EMOJI[signal]}</span>
      <span className={`hidden h-2 w-2 rounded-full sm:inline-block ${DOT[signal]}`} />
      {headline}
      {incomplete && signal !== 'nicht_bewertbar' && <span aria-hidden="true">*</span>}
      <InfoTooltip
        text={`Gewichteter Composite-Score aus NOVA (35%), glykämischer Last inkl. GI/Ballaststoff-Modifikator (30%), Zuckeranteil (15%), Omega-6/3 (15%) und Protein-/Ballaststoff-Bonus (5%) – erst die Kombination mehrerer Signale ergibt die Einstufung, kein Einzelfaktor allein.${scoreNote}${incompleteNote}`}
        label="Mehr zum Weight-Set-Point-Signal"
      />
    </span>
  )
}
