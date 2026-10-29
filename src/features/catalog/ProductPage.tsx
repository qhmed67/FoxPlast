import { useEffect, useMemo, useState } from 'react'
import { Link, useParams, useSearchParams } from 'react-router'
import { copy } from '../../lib/copy'
import { Money } from '../../components/Money'
import { BagGlyph } from '../../components/productImages'
import { productImage } from '../../components/productMedia'
import { useBasket } from '../basket/context'
import { useProduct } from './api'
import { colorHex, colorLabel } from './colors'

export default function ProductPage() {
  const { slug } = useParams()
  const [searchParams] = useSearchParams()
  const requestedColor = searchParams.get('color')
  const { data: product, isPending, isError, refetch } = useProduct(slug ?? '')
  const { add } = useBasket()
  const [qty, setQty] = useState<number | null>(null)
  const [qtyText, setQtyText] = useState<string | null>(null)
  const [colorInput, setColorInput] = useState<string | null>(requestedColor)
  const [added, setAdded] = useState(false)
  // Reset the local form state when navigating to another product or variant.
  // Done during render (the React-recommended "adjust state on prop change"
  // pattern) so it stays synchronous with the route.
  const resetKey = `${slug ?? ''}|${requestedColor ?? ''}`
  const [lastKey, setLastKey] = useState(resetKey)
  if (resetKey !== lastKey) {
    setLastKey(resetKey)
    setQty(null)
    setQtyText(null)
    setAdded(false)
    setColorInput(requestedColor)
  }

  useEffect(() => {
    if (!added) return
    const id = window.setTimeout(() => setAdded(false), 2500)
    return () => window.clearTimeout(id)
  }, [added])

  const quantity = product ? Math.max(product.minQty, qty ?? product.minQty) : 0
  const color = useMemo(() => {
    if (!product) return ''
    if (colorInput && product.colors.includes(colorInput)) return colorInput
    return product.colors[0] ?? ''
  }, [product, colorInput])

  if (isPending) {
    return (
      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-10 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-16" aria-busy="true">
        <div className="aspect-[4/5] animate-pulse bg-[#EFEAE1]" />
        <div className="space-y-3">
          <div className="h-10 w-2/3 animate-pulse bg-[#EFEAE1]" />
          <div className="h-4 w-1/3 animate-pulse bg-[#EFEAE1]" />
          <div className="h-4 w-1/2 animate-pulse bg-[#EFEAE1]" />
        </div>
      </div>
    )
  }

  if (isError) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6">
        <div className="border border-sand bg-white/40 p-6">
          <p className="text-sm">{copy.error}</p>
          <button
            onClick={() => void refetch()}
            className="mt-4 min-h-11 border border-coal/25 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-coal"
          >
            جرّب تاني
          </button>
        </div>
      </div>
    )
  }

  if (!product) {
    return (
      <div className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6">
        <p className="text-coal/60">المنتج غير موجود.</p>
        <Link
          to="/catalog"
          className="editorial-underline mt-4 inline-block text-xs font-semibold uppercase tracking-[0.16em] text-coal"
        >
          العودة للمنتجات
        </Link>
      </div>
    )
  }

  const tier =
    [...product.tiers].reverse().find((t) => quantity >= t.minQty) ?? product.tiers[0] ?? null
  const subtotal = tier ? tier.unitPricePiasters * quantity : null
  const typedQty = qtyText === null ? null : Number(qtyText)
  const showMinError =
    typedQty !== null && Number.isFinite(typedQty) && typedQty > 0 && typedQty < product.minQty
  const image = productImage(product.slug, color)
  const isStorage = product.category === 'storage'

  return (
    <div className="bg-bone text-coal">
      <div className="mx-auto max-w-[1400px] px-4 pt-6 sm:px-6">
        <Link
          to="/catalog"
          className="inline-flex items-center gap-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-coal/50 transition-colors hover:text-coal"
        >
          <span aria-hidden>→</span> المنتجات
        </Link>
      </div>

      <div className="mx-auto grid max-w-[1400px] gap-8 px-4 py-8 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-12">
        {/* Gallery */}
        <div className="lg:sticky lg:top-[105px] lg:self-start">
          <div className="relative aspect-[4/5] overflow-hidden bg-[#EFEAE1]">
            {image ? (
              <img
                src={image}
                alt={`${product.name} — ${colorLabel(color)}`}
                className="h-full w-full object-contain p-8 transition-opacity duration-300"
                fetchPriority="high"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <BagGlyph color={color} className="h-[66%] w-auto drop-shadow-sm" />
              </div>
            )}
            <span className="absolute start-4 top-4 bg-coal px-2.5 py-1.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-bone">
              {isStorage ? 'خزين' : 'دعاية'}
            </span>
            {image && (
              <span className="absolute bottom-4 end-4 bg-bone/90 px-2 py-1 text-[10px] uppercase tracking-[0.14em] text-coal/60">
                صورة المنتج
              </span>
            )}
          </div>
        </div>

        {/* Details */}
        <div className="max-w-[560px]">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-kraft-700">
            {product.material}
          </p>
          <h1 className="mt-3 text-[clamp(1.8rem,3.6vw,3rem)] font-bold leading-[1.08] tracking-[-0.02em]">
            {product.name}
          </h1>
          {product.description && !product.description.startsWith('TODO') && (
            <p className="mt-4 text-sm leading-8 text-coal/60">{product.description}</p>
          )}
          <p className="mt-3 text-xs text-coal/45">{copy.minQty(product.minQty)}</p>

          {product.tiers.length > 0 && (
            <p className="mt-6 flex items-baseline gap-2 border-t border-sand pt-5">
              <span className="text-2xl font-bold">
                من <Money piasters={product.tiers.at(-1)!.unitPricePiasters} />
              </span>
              <span className="text-xs text-coal/45">/ القطعة</span>
            </p>
          )}

          {product.colors.length > 0 && (
            <div className="mt-7">
              <div className="flex items-baseline justify-between">
                <p className="text-xs font-semibold uppercase tracking-[0.16em]">اللون</p>
                <p className="text-xs text-coal/50">{colorLabel(color)}</p>
              </div>
              <div className="mt-3 flex flex-wrap gap-2.5">
                {product.colors.map((c) => (
                  <button
                    key={c}
                    onClick={() => setColorInput(c)}
                    aria-label={colorLabel(c)}
                    aria-pressed={color === c}
                    className={`h-9 w-9 rounded-full ring-offset-2 ring-offset-bone transition-shadow ${
                      color === c ? 'ring-2 ring-coal' : 'ring-1 ring-black/15 hover:ring-coal/40'
                    }`}
                    style={{ backgroundColor: colorHex(c) }}
                  />
                ))}
              </div>
            </div>
          )}

          <div className="mt-7">
            <label htmlFor="qty" className="block text-xs font-semibold uppercase tracking-[0.16em]">
              الكمية
            </label>
            <div className="mt-3 flex items-center gap-2">
              <button
                onClick={() => {
                  setQtyText(null)
                  setQty(Math.max(product.minQty, quantity - 1))
                }}
                aria-label="تقليل الكمية"
                className="h-12 w-12 border border-coal/20 text-lg transition-colors hover:border-coal"
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
                className="h-12 w-20 border border-coal/20 bg-transparent text-center font-mono"
                dir="ltr"
              />
              <button
                onClick={() => {
                  setQtyText(null)
                  setQty(quantity + 1)
                }}
                aria-label="زيادة الكمية"
                className="h-12 w-12 border border-coal/20 text-lg transition-colors hover:border-coal"
              >
                +
              </button>
            </div>
            {showMinError && (
              <p id="qty-error" className="mt-2 text-xs text-destructive">
                {copy.minQty(product.minQty)}
              </p>
            )}
          </div>

          <button
            onClick={() => {
              add({
                slug: product.slug,
                name: product.name,
                color: color || null,
                minQty: product.minQty,
                qty: quantity,
                tiers: product.tiers,
              })
              setAdded(true)
            }}
            className="mt-7 flex min-h-13 w-full items-center justify-center bg-coal px-6 text-xs font-semibold uppercase tracking-[0.16em] text-bone transition-colors hover:bg-black"
          >
            {copy.addToBasket}
          </button>

          <div role="status" aria-live="polite" className="mt-3 min-h-6 text-xs">
            {added && (
              <span className="flex items-center gap-2 text-coal/70">
                <span>تمت الإضافة للطلب ✓</span>
                <Link to="/basket" className="text-coal underline underline-offset-4">
                  شوف الطلب
                </Link>
              </span>
            )}
          </div>

          {subtotal !== null && (
            <p className="mt-4 flex items-center justify-between border-t border-sand pt-4 text-sm">
              <span className="text-coal/55">الإجمالي التقديري</span>
              <Money piasters={subtotal} />
            </p>
          )}

          {product.tiers.length > 0 && (
            <div className="mt-8 border-t border-sand pt-6">
              <p className="text-xs font-semibold uppercase tracking-[0.16em]">الأسعار حسب الكمية</p>
              <ul className="mt-3">
                {product.tiers.map((t) => (
                  <li
                    key={t.minQty}
                    className={`flex items-center justify-between border-b border-sand py-2.5 text-sm ${
                      tier?.minQty === t.minQty ? 'font-semibold text-coal' : 'text-coal/60'
                    }`}
                  >
                    <span>{t.minQty}+ قطعة</span>
                    <Money piasters={t.unitPricePiasters} />
                  </li>
                ))}
              </ul>
            </div>
          )}

          <p className="mt-6 text-[11px] leading-6 text-coal/40">
            الأسعار تقديرية. التأكيد النهائي بعد مراجعة الطلب مع المصنع.
          </p>
        </div>
      </div>
    </div>
  )
}
