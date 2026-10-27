import { useQuery } from '@tanstack/react-query'
import { hasBackend, supabase } from '../../lib/supabase'
import { seedCategories, seedProducts } from './seed'
import type { Category, Product } from './types'

type TierRow = { min_qty: number; unit_price_piasters: number }

type ProductRow = {
  slug: string
  name_ar: string
  description_ar: string | null
  material: string | null
  min_qty: number
  colors: string[] | null
  sort: number
  category: { slug: string; name_ar: string } | null
  price_tiers: TierRow[] | null
}

const PRODUCT_COLUMNS =
  'slug,name_ar,description_ar,material,min_qty,colors,sort,category:categories(slug,name_ar),price_tiers(min_qty,unit_price_piasters)'

function toProduct(row: ProductRow): Product {
  const tiers = [...(row.price_tiers ?? [])]
    .map((t) => ({ minQty: t.min_qty, unitPricePiasters: t.unit_price_piasters }))
    .sort((a, b) => a.minQty - b.minQty)

  return {
    slug: row.slug,
    name: row.name_ar,
    description: row.description_ar ?? undefined,
    category: row.category?.slug ?? 'uncategorized',
    material: row.material ?? '—',
    minQty: row.min_qty,
    colors: row.colors ?? [],
    tiers,
    sort: row.sort,
  }
}

async function loadProducts(): Promise<Product[]> {
  if (!supabase) {
    if (import.meta.env.DEV) return seedProducts
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('active', true)
    .order('sort')

  if (error) {
    // Migrations may not be applied yet in local/dev; keep the UI usable with seed data.
    if (import.meta.env.DEV) {
      console.warn('[catalog] falling back to seed data:', error.message)
      return seedProducts
    }
    throw error
  }

  const products = ((data ?? []) as unknown as ProductRow[]).map(toProduct)
  if (import.meta.env.DEV && products.length === 0) {
    console.warn('[catalog] remote catalog is empty; using seed data')
    return seedProducts
  }
  return products
}

async function loadProduct(slug: string): Promise<Product | null> {
  if (!supabase) {
    if (import.meta.env.DEV) return seedProducts.find((p) => p.slug === slug) ?? null
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase
    .from('products')
    .select(PRODUCT_COLUMNS)
    .eq('active', true)
    .eq('slug', slug)
    .maybeSingle()

  if (error) {
    if (import.meta.env.DEV) {
      console.warn('[catalog] falling back to seed data:', error.message)
      return seedProducts.find((p) => p.slug === slug) ?? null
    }
    throw error
  }

  if (!data) {
    if (import.meta.env.DEV) return seedProducts.find((p) => p.slug === slug) ?? null
    return null
  }
  return toProduct(data as unknown as ProductRow)
}

async function loadCategories(): Promise<Category[]> {
  if (!supabase) {
    if (import.meta.env.DEV) return seedCategories
    throw new Error('Supabase is not configured')
  }

  const { data, error } = await supabase
    .from('categories')
    .select('slug,name_ar,sort')
    .eq('active', true)
    .order('sort')

  if (error) {
    if (import.meta.env.DEV) {
      console.warn('[catalog] falling back to seed categories:', error.message)
      return seedCategories
    }
    throw error
  }

  const categories = ((data ?? []) as { slug: string; name_ar: string; sort: number }[]).map(
    (c) => ({ slug: c.slug, name: c.name_ar, sort: c.sort }),
  )
  if (import.meta.env.DEV && categories.length === 0) return seedCategories
  return categories
}

export function useProducts() {
  return useQuery({ queryKey: ['products'], queryFn: loadProducts })
}

export function useProduct(slug: string) {
  return useQuery({
    queryKey: ['product', slug],
    queryFn: () => loadProduct(slug),
    enabled: Boolean(slug),
  })
}

export function useCategories() {
  return useQuery({ queryKey: ['categories'], queryFn: loadCategories })
}

export function backendConfigured(): boolean {
  return hasBackend()
}
