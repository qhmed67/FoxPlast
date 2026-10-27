// Dev-only fake catalog (mirrors supabase/seed.sql). Replace with real data in Phase 7.
export type Product = {
  slug: string
  name: string
  material: string
  minQty: number
  colors: string[]
  tiers: { minQty: number; unitPricePiasters: number }[]
}

export const seedProducts: Product[] = [
  { slug: 'nw-dcut-small', name: 'شنطة D-cut صغيرة (نموذج)', material: 'non-woven', minQty: 100, colors: ['yellow','orange','black','red','pink','blue','green','white','natural'], tiers: [{ minQty: 100, unitPricePiasters: 15000 }, { minQty: 500, unitPricePiasters: 12000 }, { minQty: 1000, unitPricePiasters: 10000 }] },
  { slug: 'nw-loop-medium', name: 'شنطة loop handle (نموذج)', material: 'non-woven', minQty: 100, colors: ['yellow','orange','black','red','pink','blue','green','white','natural'], tiers: [{ minQty: 100, unitPricePiasters: 17000 }, { minQty: 500, unitPricePiasters: 14000 }] },
  { slug: 'kraft-brown-rope', name: 'شنطة كرافت بنية (نموذج)', material: 'kraft', minQty: 50, colors: ['brown','white'], tiers: [{ minQty: 50, unitPricePiasters: 25000 }, { minQty: 200, unitPricePiasters: 20000 }] },
  { slug: 'storage-70x60x20', name: 'شنطة خزين 70×60×20 (نموذج)', material: 'storage', minQty: 10, colors: ['green','blue','gray','red'], tiers: [{ minQty: 10, unitPricePiasters: 45000 }, { minQty: 50, unitPricePiasters: 40000 }] },
  { slug: 'garment-cover-black', name: 'غطاء ملابس أسود (نموذج)', material: 'fabric', minQty: 50, colors: ['black'], tiers: [{ minQty: 50, unitPricePiasters: 30000 }] },
]

export function findProduct(slug: string): Product | undefined {
  return seedProducts.find((p) => p.slug === slug)
}
