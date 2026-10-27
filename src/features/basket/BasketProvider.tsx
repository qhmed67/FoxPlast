import { useCallback, useEffect, useMemo, useState } from 'react'
import type { ReactNode } from 'react'
import { BasketContext, type BasketContextValue } from './context'
import { readBasket, writeBasket } from './storage'
import { basketKey, itemSubtotal, type BasketItem } from './types'

export function BasketProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<BasketItem[]>(() => readBasket())

  useEffect(() => {
    writeBasket(items)
  }, [items])

  const add = useCallback((item: BasketItem) => {
    setItems((prev) => {
      const key = basketKey(item)
      const existing = prev.find((entry) => basketKey(entry) === key)
      if (existing) {
        return prev.map((entry) =>
          basketKey(entry) === key ? { ...entry, qty: entry.qty + item.qty } : entry,
        )
      }
      return [...prev, item]
    })
  }, [])

  const setQty = useCallback((key: string, qty: number) => {
    setItems((prev) =>
      prev.map((entry) =>
        basketKey(entry) === key
          ? { ...entry, qty: Math.max(entry.minQty, Math.round(qty)) }
          : entry,
      ),
    )
  }, [])

  const remove = useCallback((key: string) => {
    setItems((prev) => prev.filter((entry) => basketKey(entry) !== key))
  }, [])

  const clear = useCallback(() => setItems([]), [])

  const value = useMemo<BasketContextValue>(() => {
    const count = items.reduce((total, item) => total + item.qty, 0)
    const subtotalPiasters = items.reduce((total, item) => total + itemSubtotal(item), 0)
    return { items, count, subtotalPiasters, add, setQty, remove, clear }
  }, [items, add, setQty, remove, clear])

  return <BasketContext.Provider value={value}>{children}</BasketContext.Provider>
}
