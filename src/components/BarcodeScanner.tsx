import { useEffect, useRef, useState } from 'react'
import { BrowserMultiFormatReader } from '@zxing/browser'
import type { IScannerControls } from '@zxing/browser'

export function BarcodeScanner({
  onDetected,
  onClose,
}: {
  onDetected: (barcode: string) => void
  onClose: () => void
}) {
  const videoRef = useRef<HTMLVideoElement>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (!navigator.mediaDevices?.getUserMedia) {
      setError(
        'Kamera-Zugriff wird in diesem Kontext nicht unterstützt (benötigt HTTPS oder localhost). Bitte Barcode manuell eingeben.',
      )
      return
    }

    let stopped = false
    let controls: IScannerControls | undefined
    const reader = new BrowserMultiFormatReader()

    reader
      .decodeFromConstraints({ video: { facingMode: 'environment' } }, videoRef.current ?? undefined, (result, _err, ctrl) => {
        if (stopped || !result) return
        ctrl.stop()
        onDetected(result.getText())
      })
      .then((c) => {
        if (stopped) {
          c.stop()
          return
        }
        controls = c
      })
      .catch(() => {
        setError('Kamera konnte nicht gestartet werden. Bitte Zugriff erlauben oder Barcode manuell eingeben.')
      })

    return () => {
      stopped = true
      controls?.stop()
    }
  }, [onDetected])

  return (
    <div className="rounded-xl border border-stone-200 bg-white p-3 dark:border-stone-800 dark:bg-stone-900">
      {error ? (
        <p className="text-sm text-amber-700 dark:text-amber-400">{error}</p>
      ) : (
        <video ref={videoRef} className="aspect-video w-full rounded-lg bg-black object-cover" muted playsInline />
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-2 text-sm font-medium text-stone-500 underline hover:text-stone-700 dark:text-stone-400 dark:hover:text-stone-200"
      >
        Scanner schließen
      </button>
    </div>
  )
}
