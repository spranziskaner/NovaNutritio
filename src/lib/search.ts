import type { RemoteFood } from '../types'
import { searchLocalFoods } from './localFoodSearch'
import { searchLocalOffDump } from './localOffDump'

/**
 * Durchsucht ausschließlich lokale Datenquellen und führt sie zusammen: die
 * handkuratierte Referenztabelle (`localFoodSearch.ts`, echte GI-Werte) und
 * das aus dem OpenFoodFacts-Bulk-Export extrahierte Offline-Subset
 * (`localOffDump.ts`). Kein Netzwerkzugriff auf einen externen Dienst.
 */
export async function searchFoods(query: string, pageSize = 30): Promise<RemoteFood[]> {
  const localMatches = searchLocalFoods(query)
  const dumpMatches = await searchLocalOffDump(query)
  return mergeByBarcode([localMatches, dumpMatches]).slice(0, pageSize)
}

/** Führt mehrere Ergebnislisten zusammen, priorisiert nach Reihenfolge der Listen bei doppeltem Barcode. */
function mergeByBarcode(sources: RemoteFood[][]): RemoteFood[] {
  const seenBarcodes = new Set<string>()
  const result: RemoteFood[] = []
  for (const list of sources) {
    for (const food of list) {
      if (food.barcode) {
        if (seenBarcodes.has(food.barcode)) continue
        seenBarcodes.add(food.barcode)
      }
      result.push(food)
    }
  }
  return result
}
