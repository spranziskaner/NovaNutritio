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
 */
export async function loadFoodDetail(barcode: string): Promise<RemoteFood | null> {
  const { data } = await off.getProductV3(barcode, { fields: [...PRODUCT_FIELDS] })
  if (!data || data.status === 'failure' || !('product' in data)) return null

  // Siehe Kommentar an `OffProductV3`: bewusste Entkopplung von den
  // generierten, feldabhängigen SDK-Typen.
  return mapOffProduct(data.product as unknown as OffProductV3)
}
