export type Tier = { min_qty: number; unit_price_piasters: number }

export type PricedItem = {
  product_id: string
  slug: string
  name: string
  color: string | null
  qty: number
  unit_price_piasters: number
}

export type PriceResult =
  | { ok: true; items: PricedItem[]; subtotalPiasters: number }
  | { ok: false; reason: 'unknown_item' | 'inactive' | 'min_qty' | 'no_price'; slug: string; minQty?: number }

/** Picks the highest tier the quantity qualifies for. Tiers are sorted ascending. */
export function unitPriceFor(tiers: Tier[], qty: number): number | null {
  const sorted = [...tiers].sort((a, b) => a.min_qty - b.min_qty)
  const tier = [...sorted].reverse().find((entry) => qty >= entry.min_qty)
  return tier ? tier.unit_price_piasters : null
}

export function depositFor(subtotalPiasters: number, percent: number): number {
  return Math.ceil((subtotalPiasters * percent) / 100)
}
