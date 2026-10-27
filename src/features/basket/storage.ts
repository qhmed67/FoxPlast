import type { BasketItem } from './types'

const KEY = 'fox-plast:basket:v1'

function isBasketItem(value: unknown): value is BasketItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as Record<string, unknown>
  return (
    typeof item.slug === 'string' &&
    typeof item.name === 'string' &&
    (typeof item.color === 'string' || item.color === null) &&
    typeof item.minQty === 'number' &&
    typeof item.qty === 'number' &&
    Array.isArray(item.tiers)
  )
}

/** Reads and sanitises the persisted basket. Never throws. */
export function readBasket(): BasketItem[] {
  try {
    const raw = localStorage.getItem(KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter(isBasketItem)
      .map((item) => ({ ...item, qty: Math.max(item.minQty, Math.round(item.qty)) }))
  } catch {
    return []
  }
}

export function writeBasket(items: BasketItem[]): void {
  try {
    localStorage.setItem(KEY, JSON.stringify(items))
  } catch {
    // Storage can be unavailable (private mode/quota); the in-memory basket still works.
  }
}
