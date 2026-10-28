import type { Product } from '../features/catalog/types'

/**
 * Real client photos only. The storage bag images are cropped from the supplied
 * poster; other families have no originals yet, so they get a drawn glyph
 * instead of a fake photo.
 */
const IMAGES: Record<string, Record<string, string>> = {
  'storage-70x60x20': {
    default: '/products/storage-green.png',
    green: '/products/storage-green.png',
    blue: '/products/storage-blue.png',
    gray: '/products/storage-gray.png',
    red: '/products/storage-red.png',
  },
}

export function productImage(slug: string, color?: string | null): string | null {
  const set = IMAGES[slug]
  if (!set) return null
  if (color && set[color]) return set[color]
  return set.default ?? null
}

export function productGlyphColor(product: Product): string | undefined {
  return product.colors[0]
}
