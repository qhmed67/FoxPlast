import { createContext, useContext } from 'react'
import type { BasketItem } from './types'

export type BasketContextValue = {
  items: BasketItem[]
  count: number
  subtotalPiasters: number
  add: (item: BasketItem) => void
  setQty: (key: string, qty: number) => void
  remove: (key: string) => void
  clear: () => void
}

export const BasketContext = createContext<BasketContextValue | null>(null)

export function useBasket(): BasketContextValue {
  const ctx = useContext(BasketContext)
  if (!ctx) throw new Error('useBasket must be used inside <BasketProvider>')
  return ctx
}
