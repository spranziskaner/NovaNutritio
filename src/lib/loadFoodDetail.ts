import type { RemoteFood } from '../types'
import { off } from './offClient'
import { mapOffProduct, type OffProductV3 } from './offProduct'

const PRODUCT_FIELDS = [
  'code',
  'product_name',
  'product_name_de',
  'brands',
  'categories_tags',
  'labels_tags',
  'ingredients_text',
  'nova_group',
  'serving_quantity',
  'image_front_url',
  'nutriments',
] as const

/**
 * Lädt die vollständigen Produktdaten zu einem Barcode über die Open-Food-
 * Facts-API v3 (SDK-Methode `getProductV3`) und berechnet daraus GI/GL/NOVA/
 * Omega-Bewertung. Wird bewusst erst aufgerufen, wenn ein Suchtreffer
 * ausgewählt wird – nicht für jeden Eintrag der Trefferliste –, um pro
 * Tastendruck nicht unnötig viele Detail-Anfragen auszulösen.
 *
 * Wirft statt still `null` zurückzugeben gezielte Fehler – damit App.tsx die
 * tatsächliche Ursache anzeigen kann (Request fehlgeschlagen / Produkt
 * unbekannt / Nährwertangaben unvollständig), statt immer dieselbe generische
 * Meldung.
 */
export async function loadFoodDetail(barcode: string): Promise<RemoteFood> {
  const { data, error } = await off.getProductV3(barcode, { fields: [...PRODUCT_FIELDS] })
  if (error !== undefined) {
    console.error('Produktabruf: Fehlerantwort von Open Food Facts', error)
    throw new Error('Anfrage an Open Food Facts fehlgeschlagen.')
  }
  if (!data || data.status === 'failure' || !('product' in data)) {
    throw new Error('Produkt nicht in der Open-Food-Facts-Datenbank gefunden.')
  }

  // Siehe Kommentar an `OffProductV3`: bewusste Entkopplung von den
  // generierten, feldabhängigen SDK-Typen.
  const food = mapOffProduct(data.product as unknown as OffProductV3)
  if (!food) {
    throw new Error('Open Food Facts liefert für dieses Produkt keine vollständigen Nährwertangaben.')
  }
  return food
}
