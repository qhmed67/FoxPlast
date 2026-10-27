import { useState } from 'react'
import { Link, useParams } from 'react-router'
import { copy } from '../../lib/copy'
import { Money } from '../../components/Money'
import { useProduct } from './api'

const COLORS: Record<string, string> = {
  yellow: '#E8C547',
  orange: '#F28A1E',
  black: '#1a1a1a',
  red: '#C62828',
  pink: '#E8A0BF',
  blue: '#2F63B5',
  green: '#1F7A3E',
  white: '#F5F5F5',
  natural: '#D9C9A3',
  brown: '#7A5C2E',
  gray: '#9CA3AF',
}

export default function ProductPage() {
  const { slug } = useParams()
  const { data: product, isPending, isError, refetch } = useProduct(slug ?? '')
  const [qty, setQty] = useState<number | null>(null)
  const [qtyText, setQtyText] = useState<string | null>(null)
  const [colorInput, setColorInput] = useState<string | null>(null)

  if (isPending) {
    return (
      <section className="grid md:grid-cols-2 gap-6" aria-busy="true">
        <div className="aspect-[4/5] bg-muted rounded-lg animate-pulse" />
        <div className="space-y-3">
          <div className="h-7 bg-muted rounded w-2/3" />
          <div className="h-4 bg-muted rounded w-1/3" />
          <div className="h-4 bg-muted rounded w-1/2" />
        </div>
      </section>
    )
  }

  if (isError) {
    return (
      <section className="bg-card border border-border rounded-lg p-4">
        <p className="text-sm">{copy.error}</p>
        <button
          onClick={() => void refetch()}
          className="mt-3 border border-secondary text-secondary px-4 py-2 rounded-md min-h-[48px]"
        >
          جرّب تاني
        </button>
      </section>
    )
  }

  if (!product) {
    return (
      <section>
        <p className="text-muted-foreground">المنتج غير موجود.</p>
        <Link to="/catalog" className="text-secondary underline underline-offset-4">
          العودة للمنتجات
        </Link>
      </section>
    )
  }

  const quantity = Math.max(product.minQty, qty ?? product.minQty)
  const color =
    colorInput && product.colors.includes(colorInput) ? colorInput : (product.colors[0] ?? '')
  const tier =
    [...product.tiers].reverse().find((t) => quantity >= t.minQty) ?? product.tiers[0] ?? null
  const subtotal = tier ? tier.unitPricePiasters * quantity : null
  const typedQty = qtyText === null ? null : Number(qtyText)
  const showMinError =
    typedQty !== null && Number.isFinite(typedQty) && typedQty > 0 && typedQty < product.minQty

  return (
    <section className="grid md:grid-cols-2 gap-6">
      <div className="aspect-[4/5] bg-muted rounded-lg flex items-center justify-center text-muted-foreground">
        TODO(asset): صورة المنتج
      </div>
      <div>
        <Link to="/catalog" className="text-sm text-muted-foreground underline underline-offset-4">
          <span aria-hidden>→</span> المنتجات
        </Link>
        <h1 className="text-2xl font-bold mt-2">{product.name}</h1>
        <p className="text-muted-foreground mt-1">{product.material}</p>
        {product.description && <p className="mt-2 text-sm">{product.description}</p>}
        <p className="mt-2 text-sm">{copy.minQty(product.minQty)}</p>

        {product.colors.length > 0 && (
          <div className="mt-4">
            <p className="font-semibold mb-2">اللون</p>
            <div className="flex gap-2 flex-wrap">
              {product.colors.map((c) => (
                <button
                  key={c}
                  onClick={() => setColorInput(c)}
                  aria-label={c}
                  aria-pressed={color === c}
                  className={`w-9 h-9 rounded-full border-2 ${color === c ? 'border-foreground ring-2 ring-primary' : 'border-border'}`}
                  style={{ backgroundColor: COLORS[c] ?? '#ccc' }}
                />
              ))}
            </div>
          </div>
        )}

        <div className="mt-4">
          <label htmlFor="qty" className="font-semibold mb-2 block">
            الكمية
          </label>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                setQtyText(null)
                setQty(Math.max(product.minQty, quantity - 1))
              }}
              aria-label="تقليل الكمية"
              className="w-11 h-11 rounded-md border border-border"
            >
              −
            </button>
            <input
              id="qty"
              type="number"
              inputMode="numeric"
              min={product.minQty}
              value={qtyText ?? String(quantity)}
              onChange={(e) => {
                setQtyText(e.target.value)
                const next = Number(e.target.value)
                if (Number.isFinite(next) && next >= product.minQty) setQty(next)
              }}
              onBlur={() => {
                setQtyText(null)
                if (qty === null || qty < product.minQty) setQty(product.minQty)
              }}
              aria-invalid={showMinError}
              aria-describedby={showMinError ? 'qty-error' : undefined}
              className="w-20 h-11 text-center font-mono rounded-md border border-border bg-background"
              dir="ltr"
            />
            <button
              onClick={() => {
                setQtyText(null)
                setQty(quantity + 1)
              }}
              aria-label="زيادة الكمية"
              className="w-11 h-11 rounded-md border border-border"
            >
              +
            </button>
          </div>
          {showMinError && (
            <p id="qty-error" className="text-sm text-destructive mt-1">
              {copy.minQty(product.minQty)}
            </p>
          )}
        </div>

        <div className="mt-4">
          <p className="font-semibold mb-2">الأسعار حسب الكمية</p>
          <ul className="space-y-1">
            {product.tiers.map((t) => (
              <li
                key={t.minQty}
                className={`flex justify-between border-b border-border py-1 ${tier?.minQty === t.minQty ? 'font-semibold' : ''}`}
              >
                <span>{t.minQty}+ قطعة</span>
                <Money piasters={t.unitPricePiasters} />
              </li>
            ))}
          </ul>
        </div>

        {subtotal !== null && (
          <div className="mt-4 p-3 bg-muted rounded-md">
            <p className="text-sm">
              الإجمالي:{' '}
              <Money piasters={subtotal} />
            </p>
          </div>
        )}

        <button className="mt-4 bg-primary text-primary-foreground px-4 py-3 rounded-md min-h-[48px] w-full">
          {copy.addToBasket}
        </button>
      </div>
    </section>
  )
}
