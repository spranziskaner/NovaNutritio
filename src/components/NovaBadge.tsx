import type { NovaGroup } from '../types'
import { novaLabel } from '../lib/assessment'
import { InfoTooltip } from './InfoTooltip'

const STYLES: Record<NovaGroup, string> = {
  1: 'bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/30',
  2: 'bg-sky-100 text-sky-800 ring-sky-600/20 dark:bg-sky-500/15 dark:text-sky-300 dark:ring-sky-400/30',
  3: 'bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/30',
  4: 'bg-rose-100 text-rose-800 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/30',
}

const UNKNOWN_STYLE =
  'bg-stone-100 text-stone-600 ring-stone-500/20 dark:bg-stone-800 dark:text-stone-400 dark:ring-stone-500/30'

/**
 * Die NOVA-Gruppe kommt ausschließlich von Open Food Facts – die App schätzt
 * sie nicht. `showInfo` per default an; muss auf `false` gesetzt werden, wenn
 * das Badge innerhalb eines anderen klickbaren Elements steht (z. B.
 * `FoodListItem`s `<button>`) – verschachtelte Buttons sind ungültiges HTML.
 */
export function NovaBadge({
  nova,
  withLabel = false,
  showInfo = true,
}: {
  nova: NovaGroup | null
  withLabel?: boolean
  showInfo?: boolean
}) {
  if (nova === null) {
    return (
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${UNKNOWN_STYLE}`}
      >
        NOVA unbestimmt
        {showInfo && (
          <InfoTooltip
            text="Open Food Facts hat für dieses Produkt keine NOVA-Einstufung hinterlegt."
            label="Mehr zur NOVA-Einstufung"
          />
        )}
      </span>
    )
  }

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STYLES[nova]}`}
    >
      NOVA {nova}
      {withLabel && <span className="hidden font-normal sm:inline">· {novaLabel(nova)}</span>}
      {showInfo && <InfoTooltip text={novaLabel(nova)} label="Mehr zur NOVA-Einstufung" />}
    </span>
  )
}
