export type PriceTier = {
  minQty: number
  unitPricePiasters: number
}

export type Product = {
  slug: string
  name: string
  description?: string
  /** Category slug (see Category). */
  category: string
  material: string
  minQty: number
  colors: string[]
  tiers: PriceTier[]
  sort: number
}

export type Category = {
  slug: string
  name: string
  sort: number
}
