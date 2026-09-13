import { useEffect, useRef, useState } from 'react'

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
    if (!('BarcodeDetector' in window) || !window.BarcodeDetector) {
      setError('Barcode-Scan wird von diesem Browser nicht unterstützt. Bitte Barcode manuell eingeben.')
      return
    }

    let stream: MediaStream | null = null
    let frameHandle = 0
    let stopped = false
    const detector = new window.BarcodeDetector({ formats: ['ean_13', 'ean_8', 'upc_a', 'upc_e'] })

    async function tick() {
      if (stopped || !videoRef.current) return
      try {
        const codes = await detector.detect(videoRef.current)
        if (codes.length > 0) {
          onDetected(codes[0].rawValue)
          return
        }
      } catch {
        // einzelne fehlgeschlagene Frame-Erkennungen ignorieren, nächster Frame folgt
      }
      frameHandle = requestAnimationFrame(tick)
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: 'environment' } })
      .then((s) => {
        if (stopped) {
          s.getTracks().forEach((t) => t.stop())
          return
        }
        stream = s
        if (videoRef.current) {
          videoRef.current.srcObject = s
          videoRef.current.play().catch(() => {})
        }
        frameHandle = requestAnimationFrame(tick)
      })
      .catch(() => {
        setError('Kamera konnte nicht gestartet werden. Bitte Zugriff erlauben oder Barcode manuell eingeben.')
      })

    return () => {
      stopped = true
      cancelAnimationFrame(frameHandle)
      stream?.getTracks().forEach((t) => t.stop())
    }
  }, [onDetected])

  return (
    <div className="rounded-xl border border-neutral-200 bg-white p-3 dark:border-neutral-800 dark:bg-neutral-900">
      {error ? (
        <p className="text-sm text-amber-700 dark:text-amber-400">{error}</p>
      ) : (
        <video ref={videoRef} className="aspect-video w-full rounded-lg bg-black object-cover" muted playsInline />
      )}
      <button
        type="button"
        onClick={onClose}
        className="mt-2 text-sm font-medium text-neutral-500 underline hover:text-neutral-700 dark:text-neutral-400 dark:hover:text-neutral-200"
      >
        Scanner schließen
      </button>
    </div>
  )
}
