import type { GiCategory } from '../lib/assessment'
import type { GiSource } from '../types'
import { InfoTooltip } from './InfoTooltip'

const STYLES: Record<GiCategory, string> = {
  niedrig:
    'bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/30',
  mittel: 'bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/30',
  hoch: 'bg-rose-100 text-rose-800 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/30',
  'n/a': 'bg-stone-100 text-stone-500 ring-stone-500/20 dark:bg-stone-800 dark:text-stone-400 dark:ring-stone-500/30',
}

const DOT: Record<GiCategory, string> = {
  niedrig: 'bg-emerald-500',
  mittel: 'bg-amber-500',
  hoch: 'bg-rose-500',
  'n/a': 'bg-stone-400',
}

const LABEL: Record<GiCategory, string> = {
  niedrig: 'niedrig',
  mittel: 'mittel',
  hoch: 'hoch',
  'n/a': 'nicht verfügbar',
}

const SOURCE_TEXT: Record<GiSource, string> = {
  referenz: 'Wert aus einer handkuratierten Referenztabelle (gemessener/dokumentierter GI).',
  berechnet:
    'Kein Messwert vorhanden – per Formel aus Zucker-, Ballaststoff-, Fett- und Proteingehalt geschätzt (grobe Näherung, kein Laborwert).',
  unbekannt:
    'Open Food Facts führt keinen glykämischen Index für dieses Produkt; auch keine Formel-Schätzung möglich.',
}

const INFO_PREFIX =
  'Glykämischer Index (GI, Glukose = 100): wie schnell ein Lebensmittel den Blutzucker ansteigen lässt.'

/**
 * Gleiche Darstellung wie `GlBadge` (Pill mit Punkt + Info-Icon): die
 * Herkunft des Werts (Referenztabelle/Formel-Schätzung/unbekannt) steht
 * bewusst nur im Tooltip statt als immer sichtbarer Zusatztext darunter.
 */
export function GiPill({ gi, category, source }: { gi: number | null; category: GiCategory; source: GiSource }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STYLES[category]}`}
    >
      <span className={`h-2 w-2 rounded-full ${DOT[category]}`} />
      GI {gi === null ? 'n/a' : gi}
      {gi !== null && ` (${LABEL[category]})`}
      <InfoTooltip text={`${INFO_PREFIX} ${SOURCE_TEXT[source]}`} label="Mehr zum glykämischen Index" />
    </span>
  )
}
