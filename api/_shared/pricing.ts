import { getDataStore } from './datastore'
import type { PricedItem, PricingResult } from './datastore'

export async function calculatePricing(items: { product_id: string; quantity: number }[]): Promise<PricingResult> {
  const dataStore = getDataStore()
  return dataStore.getCatalogForPricing(items)
}

export type { PricedItem, PricingResult }
