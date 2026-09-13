import { useState } from 'react'

/**
 * Klick-Tooltip statt des nativen `title`-Attributs: Browser-Tooltips werden
 * je nach Fensterbreite abgeschnitten, verschwinden beim Wegbewegen der Maus
 * und funktionieren auf Touch-Geräten gar nicht. Öffnet/schließt per Klick
 * (statt Hover), damit der Text in Ruhe gelesen werden kann und es auch auf
 * dem Smartphone funktioniert.
 */
export function InfoTooltip({ text, label = 'Mehr Informationen' }: { text: string; label?: string }) {
  const [open, setOpen] = useState(false)

  return (
    <span className="relative inline-flex">
      <button
        type="button"
        aria-label={label}
        aria-expanded={open}
        onClick={(e) => {
          e.stopPropagation()
          setOpen((o) => !o)
        }}
        onBlur={() => setOpen(false)}
        className="opacity-60 hover:opacity-100 focus:opacity-100 focus:outline-none"
      >
        ⓘ
      </button>
      {open && (
        <span
          role="tooltip"
          className="absolute top-full left-1/2 z-20 mt-2 w-64 max-w-[80vw] -translate-x-1/2 rounded-lg border border-stone-200 bg-white p-2.5 text-left text-xs leading-relaxed font-normal text-stone-700 shadow-lg dark:border-stone-700 dark:bg-stone-800 dark:text-stone-300"
        >
          {text}
        </span>
      )}
    </span>
  )
}
