import { Link } from 'react-router'
import { Money } from '../../components/Money'
import { copy } from '../../lib/copy'
import { colorLabel } from '../catalog/colors'
import { useBasket } from './context'
import { basketKey, itemSubtotal, tierFor } from './types'

export default function BasketPage() {
  const { items, subtotalPiasters, setQty, remove } = useBasket()

  if (items.length === 0) {
    return (
      <section>
        <h1 className="mb-4 text-2xl font-bold">الطلب</h1>
        <p className="text-muted-foreground">السلة فاضية. اختار منتج وابدأ طلبك.</p>
        <Link
          to="/catalog"
          className="mt-4 inline-block min-h-[48px] rounded-md bg-primary px-4 py-3 text-primary-foreground"
        >
          {copy.nav.catalog}
        </Link>
      </section>
    )
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">الطلب</h1>

      <ul className="space-y-3">
        {items.map((item) => {
          const key = basketKey(item)
          const tier = tierFor(item)
          return (
            <li key={key} className="rounded-lg border border-border bg-card p-4">
              <div className="flex items-start justify-between gap-3">
                <div>
                  <h2 className="font-semibold">{item.name}</h2>
                  <p className="text-sm text-muted-foreground">
                    {item.color ? `اللون: ${colorLabel(item.color)}` : 'لون واحد'}
                  </p>
                </div>
                <button
                  onClick={() => remove(key)}
                  className="text-sm text-destructive underline underline-offset-4"
                  aria-label={`حذف ${item.name}`}
                >
                  حذف
                </button>
              </div>

              <div className="mt-3 flex flex-wrap items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setQty(key, item.qty - 1)}
                    aria-label="تقليل الكمية"
                    className="h-11 w-11 rounded-md border border-border"
                  >
                    −
                  </button>
                  <input
                    type="number"
                    inputMode="numeric"
                    min={item.minQty}
                    value={item.qty}
                    onChange={(e) => setQty(key, Number(e.target.value))}
                    aria-label={`كمية ${item.name}`}
                    className="h-11 w-20 rounded-md border border-border bg-background text-center font-mono"
                    dir="ltr"
                  />
                  <button
                    onClick={() => setQty(key, item.qty + 1)}
                    aria-label="زيادة الكمية"
                    className="h-11 w-11 rounded-md border border-border"
                  >
                    +
                  </button>
                </div>

                <div className="text-sm">
                  <p className="text-muted-foreground">
                    {tier ? (
                      <>
                        <Money piasters={tier.unitPricePiasters} /> للقطعة
                      </>
                    ) : (
                      'السعر عند الطلب'
                    )}
                  </p>
                  <p className="mt-1 font-semibold">
                    الإجمالي: <Money piasters={itemSubtotal(item)} />
                  </p>
                </div>
              </div>

              <p className="mt-2 text-xs text-muted-foreground">{copy.minQty(item.minQty)}</p>
            </li>
          )
        })}
      </ul>

      <div className="mt-4 rounded-lg border border-border bg-card p-4">
        <p className="flex items-center justify-between text-lg font-semibold">
          <span>الإجمالي التقديري</span>
          <Money piasters={subtotalPiasters} />
        </p>
        <p className="mt-2 text-xs text-muted-foreground">
          الأسعار تقديرية. التأكيد النهائي بعد مراجعة الطلب.
        </p>
        <Link
          to="/checkout"
          className="mt-4 flex min-h-[48px] w-full items-center justify-center rounded-md bg-primary px-4 py-3 text-primary-foreground"
        >
          كمّل الطلب
        </Link>
      </div>
    </section>
  )
}
