import type { Category, Product } from './types'

// Dev-only fallback catalog (mirrors supabase/seed.sql). Replaced by live data in Phase 7.
// Every name/price is TODO(client); these exist only so every screen has data during development.

export const seedCategories: Category[] = [
  { slug: 'non-woven', name: 'شنط قماش غير منسوج', sort: 1 },
  { slug: 'kraft', name: 'شنط كرافت', sort: 2 },
  { slug: 'storage', name: 'شنط خزين', sort: 3 },
  { slug: 'garment', name: 'أغطية ملابس', sort: 4 },
]

export const seedProducts: Product[] = [
  {
    slug: 'nw-dcut-small',
    name: 'شنطة D-cut صغيرة (نموذج)',
    category: 'non-woven',
    material: 'non-woven',
    minQty: 100,
    colors: ['yellow', 'orange', 'black', 'red', 'pink', 'blue', 'green', 'white', 'natural'],
    tiers: [
      { minQty: 100, unitPricePiasters: 15000 },
      { minQty: 500, unitPricePiasters: 12000 },
      { minQty: 1000, unitPricePiasters: 10000 },
    ],
    sort: 10,
  },
  {
    slug: 'nw-loop-medium',
    name: 'شنطة loop handle (نموذج)',
    category: 'non-woven',
    material: 'non-woven',
    minQty: 100,
    colors: ['yellow', 'orange', 'black', 'red', 'pink', 'blue', 'green', 'white', 'natural'],
    tiers: [
      { minQty: 100, unitPricePiasters: 17000 },
      { minQty: 500, unitPricePiasters: 14000 },
    ],
    sort: 20,
  },
  {
    slug: 'kraft-brown-rope',
    name: 'شنطة كرافت بنية (نموذج)',
    category: 'kraft',
    material: 'kraft',
    minQty: 50,
    colors: ['brown', 'white'],
    tiers: [
      { minQty: 50, unitPricePiasters: 25000 },
      { minQty: 200, unitPricePiasters: 20000 },
    ],
    sort: 30,
  },
  {
    slug: 'storage-70x60x20',
    name: 'شنطة خزين 70×60×20 (نموذج)',
    category: 'storage',
    material: 'storage',
    minQty: 10,
    colors: ['green', 'blue', 'gray', 'red'],
    tiers: [
      { minQty: 10, unitPricePiasters: 45000 },
      { minQty: 50, unitPricePiasters: 40000 },
    ],
    sort: 40,
  },
  {
    slug: 'garment-cover-black',
    name: 'غطاء ملابس أسود (نموذج)',
    category: 'garment',
    material: 'fabric',
    minQty: 50,
    colors: ['black'],
    tiers: [{ minQty: 50, unitPricePiasters: 30000 }],
    sort: 50,
  },
]

export function findProduct(slug: string): Product | undefined {
  return seedProducts.find((p) => p.slug === slug)
}
