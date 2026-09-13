// Die BarcodeDetector-API ist experimentell und fehlt in lib.dom.d.ts.
// Unterstützt aktuell u. a. Chrome/Edge/Android; Fallback ist die manuelle Eingabe.
interface DetectedBarcode {
  rawValue: string
}

declare class BarcodeDetector {
  constructor(options?: { formats?: string[] })
  detect(source: CanvasImageSource): Promise<DetectedBarcode[]>
}

interface Window {
  BarcodeDetector?: typeof BarcodeDetector
}
