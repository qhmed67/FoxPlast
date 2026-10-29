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
      <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-clay">
          Order sheet
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">الطلب</h1>
        <div className="mt-8 border border-sand bg-white p-8 sm:p-12">
          <p className="text-sm text-coal/55">السلة فاضية. اختار منتج وابدأ طلبك.</p>
          <Link
            to="/catalog"
            className="mt-6 inline-flex min-h-12 items-center bg-coal px-7 text-xs font-semibold uppercase tracking-[0.14em] text-bone transition-colors hover:bg-black"
          >
            {copy.nav.catalog}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-[1200px] px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4 border-b border-sand pb-6">
        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-clay">
            Order sheet
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">الطلب</h1>
          <p className="mt-2 text-xs text-coal/50">
            {items.length} {items.length === 1 ? 'صنف' : 'أصناف'} في الطلب
          </p>
        </div>
        <Link
          to="/catalog"
          className="editorial-underline text-xs font-semibold uppercase tracking-[0.14em] text-coal"
        >
          أضف منتجات
        </Link>
      </header>

      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(280px,360px)]">
        <ul className="space-y-3">
          {items.map((item) => {
            const key = basketKey(item)
            const tier = tierFor(item)
            return (
              <li
                key={key}
                className="border border-sand bg-white p-5 transition-colors hover:border-coal/25 sm:p-6"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="min-w-0">
                    <h2 className="text-base font-semibold leading-6">{item.name}</h2>
                    <p className="mt-1 text-xs text-coal/50">
                      {item.color ? `اللون: ${colorLabel(item.color)}` : 'لون واحد'}
                    </p>
                  </div>
                  <button
                    onClick={() => remove(key)}
                    className="shrink-0 text-xs font-medium text-clay underline-offset-4 transition-opacity hover:underline"
                    aria-label={`حذف ${item.name}`}
                  >
                    حذف
                  </button>
                </div>

                <div className="mt-5 flex flex-wrap items-end justify-between gap-4 border-t border-sand/70 pt-4">
                  <div>
                    <p className="mb-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-coal/40">
                      الكمية
                    </p>
                    <div className="flex items-center">
                      <button
                        onClick={() => setQty(key, item.qty - 1)}
                        aria-label="تقليل الكمية"
                        className="grid h-11 w-11 place-items-center border border-sand bg-bone/40 text-lg transition-colors hover:border-coal active:scale-95"
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
                        className="h-11 w-24 border-y border-sand bg-white text-center font-mono text-sm outline-none focus:border-coal"
                        dir="ltr"
                      />
                      <button
                        onClick={() => setQty(key, item.qty + 1)}
                        aria-label="زيادة الكمية"
                        className="grid h-11 w-11 place-items-center border border-sand bg-bone/40 text-lg transition-colors hover:border-coal active:scale-95"
                      >
                        +
                      </button>
                    </div>
                  </div>

                  <div className="text-end text-sm">
                    <p className="text-coal/50">
                      {tier ? (
                        <>
                          <Money piasters={tier.unitPricePiasters} /> للقطعة
                        </>
                      ) : (
                        'السعر عند الطلب'
                      )}
                    </p>
                    <p className="mt-1 text-lg font-semibold">
                      <Money piasters={itemSubtotal(item)} />
                    </p>
                  </div>
                </div>

                <p className="mt-3 text-[11px] text-coal/40">{copy.minQty(item.minQty)}</p>
              </li>
            )
          })}
        </ul>

        <aside className="border border-sand bg-white p-5 lg:sticky lg:top-36 sm:p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-clay">
            Summary
          </p>
          <p className="mt-4 flex items-end justify-between gap-3 border-b border-sand pb-4">
            <span className="text-sm text-coal/55">الإجمالي التقديري</span>
            <span className="text-2xl font-bold">
              <Money piasters={subtotalPiasters} />
            </span>
          </p>
          <p className="mt-4 text-xs leading-6 text-coal/50">
            الأسعار تقديرية. التأكيد النهائي بعد مراجعة الطلب.
          </p>
          <Link
            to="/checkout"
            className="mt-5 flex min-h-12 w-full items-center justify-center bg-coal px-4 text-xs font-semibold uppercase tracking-[0.14em] text-bone transition-colors hover:bg-black active:scale-[0.99]"
          >
            كمّل الطلب
          </Link>
        </aside>
      </div>
    </section>
  )
}
