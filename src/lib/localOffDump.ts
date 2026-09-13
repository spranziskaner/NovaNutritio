import type { RemoteFood } from '../types'
import { mapOffProduct, type OffProduct } from './openfoodfacts'
import { rankByFuzzyMatch } from './fuzzySearch'

const DUMP_URL = `${import.meta.env.BASE_URL}off-subset.json`

/** Ab diesem Fuzzy-Score (0..1) gilt ein Treffer im Offline-Subset als relevant. */
const DUMP_MATCH_THRESHOLD = 0.45

let dumpPromise: Promise<RemoteFood[]> | null = null

function loadDump(): Promise<RemoteFood[]> {
  if (!dumpPromise) {
    dumpPromise = fetch(DUMP_URL)
      .then((res) => {
        if (!res.ok) throw new Error(`Offline-Datensatz konnte nicht geladen werden (Status ${res.status}).`)
        return res.json() as Promise<OffProduct[]>
      })
      .then((raw) => raw.map(mapOffProduct).filter((f): f is RemoteFood => f !== null))
      .catch((err: unknown) => {
        // Nicht dauerhaft cachen: beim nächsten Suchversuch erneut probieren
        // (z. B. falls die Datei nur kurzzeitig nicht erreichbar war).
        dumpPromise = null
        throw err
      })
  }
  return dumpPromise
}

/**
 * Durchsucht das aus dem OpenFoodFacts-Bulk-Export extrahierte Offline-Subset
 * (siehe `scripts/extract-off-subset.mjs`, Datei unter `public/off-subset.json`).
 * Läuft unabhängig von der Live-API und funktioniert daher auch ohne
 * Internetverbindung bzw. wenn world.openfoodfacts.org nicht erreichbar ist.
 * Wird nur einmal pro Seitenaufruf geladen und danach im Speicher gehalten.
 * Fehler (Datei fehlt, Netzwerkproblem) werden nicht nach außen gereicht –
 * die Suche funktioniert dann einfach ohne diese Quelle weiter.
 */
export async function searchLocalOffDump(query: string): Promise<RemoteFood[]> {
  let entries: RemoteFood[]
  try {
    entries = await loadDump()
  } catch {
    return []
  }
  return rankByFuzzyMatch(query, entries, (f) => `${f.name} ${f.brand ?? ''}`, DUMP_MATCH_THRESHOLD, false)
}
