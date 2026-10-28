import { useMemo, useState } from 'react'
import { copy } from '../../lib/copy'
import { ProductCard } from '../../components/ProductCard'
import { useCategories, useProducts } from './api'
import { COLORS, colorHex, colorLabel } from './colors'

function FilterButton({
  active,
  children,
  onClick,
}: {
  active: boolean
  children: React.ReactNode
  onClick: () => void
}) {
  return (
    <button
      onClick={onClick}
      aria-pressed={active}
      className={`editorial-underline whitespace-nowrap pb-1 text-xs font-semibold uppercase tracking-[0.14em] transition-colors ${
        active ? 'text-coal' : 'text-coal/45 hover:text-coal'
      }`}
    >
      {children}
    </button>
  )
}

export default function CatalogPage() {
  const [category, setCategory] = useState('all')
  const [color, setColor] = useState('all')
  const { data: products = [], isPending, isError, refetch } = useProducts()
  const { data: categories = [] } = useCategories()

  const colorOptions = useMemo(() => {
    const used = new Set(products.flatMap((p) => p.colors))
    return Object.keys(COLORS).filter((c) => used.has(c))
  }, [products])

  const filtered = useMemo(
    () =>
      products.filter((p) => {
        if (category !== 'all' && p.category !== category) return false
        if (color !== 'all' && !p.colors.includes(color)) return false
        return true
      }),
    [products, category, color],
  )

  return (
    <div className="bg-bone text-coal">
      <section className="border-b border-sand">
        <div className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:py-16">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-kraft-700">
            The Collection
          </p>
          <h1 className="mt-4 max-w-[18ch] text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.03em]">
            كل شنطة، بكل خامة.
          </h1>
          <p className="mt-5 max-w-[52ch] text-sm leading-8 text-coal/60">
            شنط قماش غير منسوج، كرافت، وخزين. اختار العائلة أو اللون، وشوف السعر بيقل
            إزاي مع الكمية.
          </p>
        </div>
      </section>

      <div className="border-b border-sand bg-bone lg:sticky lg:top-[104px] lg:z-20 lg:bg-bone/95 lg:backdrop-blur">
        <div className="mx-auto flex max-w-[1400px] flex-col gap-3 px-4 py-4 sm:px-6 lg:flex-row lg:items-center lg:gap-8">
          <div className="flex flex-wrap gap-x-6 gap-y-2" role="group" aria-label="التصنيف">
            <FilterButton active={category === 'all'} onClick={() => setCategory('all')}>
              الكل
            </FilterButton>
            {categories.map((c) => (
              <FilterButton
                key={c.slug}
                active={category === c.slug}
                onClick={() => setCategory(c.slug)}
              >
                {c.name}
              </FilterButton>
            ))}
          </div>

          <div
            className="flex flex-wrap items-center gap-2.5 lg:ms-auto"
            role="group"
            aria-label="اللون"
          >
            <button
              onClick={() => setColor('all')}
              aria-label="كل الألوان"
              aria-pressed={color === 'all'}
              className={`grid h-6 w-6 place-items-center rounded-full border text-[11px] leading-none ${
                color === 'all' ? 'border-coal text-coal' : 'border-coal/25 text-coal/40'
              }`}
            >
              ×
            </button>
            {colorOptions.map((c) => (
              <button
                key={c}
                onClick={() => setColor(c)}
                aria-label={colorLabel(c)}
                aria-pressed={color === c}
                style={{ backgroundColor: colorHex(c) }}
                className={`h-6 w-6 rounded-full ring-offset-2 ring-offset-bone transition-shadow ${
                  color === c ? 'ring-1 ring-coal' : 'ring-1 ring-black/10'
                }`}
              />
            ))}
          </div>
        </div>
      </div>

      <section className="mx-auto max-w-[1400px] px-4 py-10 sm:px-6 lg:py-14">
        <p className="mb-6 text-[11px] uppercase tracking-[0.18em] text-coal/40">
          {filtered.length} منتج
        </p>

        {isPending && (
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6" aria-busy="true">
            {[0, 1, 2, 3].map((i) => (
              <li key={i}>
                <div className="aspect-[4/5] animate-pulse bg-[#EFEAE1]" />
                <div className="mt-3 h-4 w-2/3 animate-pulse bg-[#EFEAE1]" />
                <div className="mt-2 h-3 w-1/3 animate-pulse bg-[#EFEAE1]" />
              </li>
            ))}
          </ul>
        )}

        {isError && (
          <div className="border border-sand bg-white/40 p-6">
            <p className="text-sm">{copy.error}</p>
            <button
              onClick={() => void refetch()}
              className="mt-4 min-h-11 border border-coal/25 px-5 text-xs font-semibold uppercase tracking-[0.14em] text-coal"
            >
              جرّب تاني
            </button>
          </div>
        )}

        {!isPending && !isError && filtered.length > 0 && (
          <ul className="grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {filtered.map((p) => (
              <ProductCard key={p.slug} product={p} />
            ))}
          </ul>
        )}

        {!isPending && !isError && filtered.length === 0 && (
          <div className="border border-sand p-10 text-center">
            <p className="text-sm text-coal/60">لا توجد نتائج بالفلتر ده.</p>
            <button
              onClick={() => {
                setCategory('all')
                setColor('all')
              }}
              className="mt-4 text-xs font-semibold uppercase tracking-[0.14em] text-coal underline underline-offset-4"
            >
              مسح الفلاتر
            </button>
          </div>
        )}
      </section>
    </div>
  )
}
