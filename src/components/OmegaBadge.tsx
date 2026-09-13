import type { OmegaAssessment, OmegaCategory } from '../types'

const STYLES: Record<OmegaCategory, string> = {
  guenstig:
    'bg-emerald-100 text-emerald-800 ring-emerald-600/20 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-400/30',
  neutral: 'bg-amber-100 text-amber-800 ring-amber-600/20 dark:bg-amber-500/15 dark:text-amber-300 dark:ring-amber-400/30',
  unguenstig: 'bg-rose-100 text-rose-800 ring-rose-600/20 dark:bg-rose-500/15 dark:text-rose-300 dark:ring-rose-400/30',
  unbekannt:
    'bg-stone-100 text-stone-500 ring-stone-500/20 dark:bg-stone-800 dark:text-stone-400 dark:ring-stone-500/30',
}

const DOT: Record<OmegaCategory, string> = {
  guenstig: 'bg-emerald-500',
  neutral: 'bg-amber-500',
  unguenstig: 'bg-rose-500',
  unbekannt: 'bg-stone-400',
}

const LABEL: Record<OmegaCategory, string> = {
  guenstig: 'günstig',
  neutral: 'neutral',
  unguenstig: 'ungünstig',
  unbekannt: 'unbekannt',
}

const PROVENANCE_HINT = 'Herkunft (Weide vs. Mast) nicht bekannt – Einordnung kann abweichen.'

export function OmegaBadge({ omega }: { omega: OmegaAssessment }) {
  return (
    <div className="flex flex-col items-center gap-1">
      <span
        className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${STYLES[omega.category]}`}
        title={omega.reasonLabel}
      >
        <span className={`h-2 w-2 rounded-full ${DOT[omega.category]}`} />
        Omega {LABEL[omega.category]}
        {omega.provenanceUnknown && (
          <span aria-hidden="true" className="opacity-70" title={PROVENANCE_HINT}>
            ❓
          </span>
        )}
      </span>
      {omega.isWalnutSpecialCase && (
        <span className="text-center text-[11px] leading-tight text-stone-500 dark:text-stone-400">
          Enthält auch hohen Omega-6-Anteil
        </span>
      )}
    </div>
  )
}
