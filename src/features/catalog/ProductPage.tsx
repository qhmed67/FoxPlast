import { useState } from 'react'
import { useParams, Link } from 'react-router'
import { findProduct } from './seed'
import { formatMoney } from '../../lib/money'
import { copy } from '../../lib/copy'

const COLORS: Record<string, string> = {
  yellow: '#E8C547', orange: '#F28A1E', black: '#1a1a1a', red: '#C62828',
  pink: '#E8A0BF', blue: '#2F63B5', green: '#1F7A3E', white: '#F5F5F5',
  natural: '#D9C9A3', brown: '#7A5C2E', gray: '#9CA3AF',
}

export default function ProductPage() {
  const { slug } = useParams()
  const p = findProduct(slug ?? '')
  const [qty, setQty] = useState(p?.minQty ?? 1)
  const [color, setColor] = useState(p?.colors[0] ?? '')

  if (!p) {
    return (
      <section>
        <p className="text-muted-foreground">TODO(asset): product not found.</p>
        <Link to="/catalog" className="text-primary underline">العودة للمنتجات</Link>
      </section>
    )
  }

  const tier = [...p.tiers].reverse().find((t) => qty >= t.minQty) ?? p.tiers[0]
  const subtotal = tier.unitPricePiasters * qty

  return (
    <section className="grid md:grid-cols-2 gap-6">
      <div className="aspect-[4/5] bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        TODO(asset): صورة المنتج
      </div>
      <div>
        <h1 className="text-2xl font-bold">{p.name}</h1>
        <p className="text-muted-foreground mt-1">{p.material}</p>
        <p className="mt-2 text-sm">{copy.minQty(p.minQty)}</p>

        <div className="mt-4">
          <p className="font-semibold mb-2">اللون</p>
          <div className="flex gap-2 flex-wrap">
            {p.colors.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={c}
                className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-foreground ring-2 ring-primary' : 'border-border'}`}
                style={{ backgroundColor: COLORS[c] ?? '#ccc' }}
              />
            ))}
          </div>
        </div>

        <div className="mt-4">
          <p className="font-semibold mb-2">الكمية</p>
          <div className="flex items-center gap-2">
            <button onClick={() => setQty((q) => Math.max(p.minQty, q - 1))} className="w-10 h-10 rounded-md border border-border">−</button>
            <span className="w-12 text-center font-mono" dir="ltr">{qty}</span>
            <button onClick={() => setQty((q) => q + 1)} className="w-10 h-10 rounded-md border border-border">+</button>
          </div>
        </div>

        <div className="mt-4">
          <p className="font-semibold mb-2">الأسعار حسب الكمية</p>
          <ul className="space-y-1">
            {p.tiers.map((t) => (
              <li key={t.minQty} className={`flex justify-between border-b border-border py-1 ${tier.minQty === t.minQty ? 'font-semibold' : ''}`}>
                <span>{t.minQty}+ قطعة</span>
                <span className="font-mono" dir="ltr">{formatMoney(t.unitPricePiasters)}</span>
              </li>
            ))}
          </ul>
        </div>

        <div className="mt-4 p-3 bg-muted rounded-md">
          <p className="text-sm">الإجمالي: <span className="font-mono" dir="ltr">{formatMoney(subtotal)}</span></p>
        </div>

        <button className="mt-4 bg-primary text-primary-foreground px-4 py-3 rounded-md min-h-[48px] w-full">
          {copy.addToBasket}
        </button>
      </div>
    </section>
  )
}
