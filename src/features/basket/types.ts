import type { PriceTier } from '../catalog/types'

export type BasketItem = {
  /** Catalog slug. */
  slug: string
  name: string
  /** Selected color key, or null when the product has no colors. */
  color: string | null
  minQty: number
  qty: number
  /** Price tiers snapshotted at add time; the server recomputes the real total. */
  tiers: PriceTier[]
}

export function basketKey(item: Pick<BasketItem, 'slug' | 'color'>): string {
  return `${item.slug}::${item.color ?? ''}`
}

/** Highest tier whose minQty is satisfied. Tiers are sorted ascending. */
export function tierFor(item: BasketItem): PriceTier | null {
  return [...item.tiers].reverse().find((t) => item.qty >= t.minQty) ?? item.tiers[0] ?? null
}

export function itemSubtotal(item: BasketItem): number {
  const tier = tierFor(item)
  return tier ? tier.unitPricePiasters * item.qty : 0
}
