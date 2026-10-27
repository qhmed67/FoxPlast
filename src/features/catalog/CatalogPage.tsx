import { useMemo, useState } from 'react'
import { Link } from 'react-router'
import { copy } from '../../lib/copy'
import { Money } from '../../components/Money'
import { useCategories, useProducts } from './api'

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
    <section>
      <h1 className="text-2xl font-bold mb-4">{copy.nav.catalog}</h1>

      <div className="flex flex-wrap gap-2 mb-3" role="group" aria-label="التصنيف">
        <button
          onClick={() => setCategory('all')}
          aria-pressed={category === 'all'}
          className={`px-3 py-2 rounded-full text-sm border transition-colors ${category === 'all' ? 'bg-secondary text-secondary-foreground border-secondary' : 'border-border'}`}
        >
          الكل
        </button>
        {categories.map((c) => (
          <button
            key={c.slug}
            onClick={() => setCategory(c.slug)}
            aria-pressed={category === c.slug}
            className={`px-3 py-2 rounded-full text-sm border transition-colors ${category === c.slug ? 'bg-secondary text-secondary-foreground border-secondary' : 'border-border'}`}
          >
            {c.name}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-6" role="group" aria-label="اللون">
        <button
          onClick={() => setColor('all')}
          aria-label="كل الألوان"
          aria-pressed={color === 'all'}
          className={`w-8 h-8 rounded-full border-2 text-sm ${color === 'all' ? 'border-foreground ring-2 ring-primary' : 'border-border'}`}
        >
          ×
        </button>
        {colorOptions.map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            aria-label={c}
            aria-pressed={color === c}
            className={`w-8 h-8 rounded-full border-2 ${color === c ? 'border-foreground ring-2 ring-primary' : 'border-border'}`}
            style={{ backgroundColor: COLORS[c] }}
          />
        ))}
      </div>

      {isPending && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4" aria-busy="true">
          {[0, 1, 2].map((i) => (
            <li key={i} className="bg-card rounded-lg p-4 border border-border animate-pulse">
              <div className="aspect-[4/5] bg-muted rounded-md mb-3" />
              <div className="h-4 bg-muted rounded w-2/3" />
              <div className="h-3 bg-muted rounded w-1/3 mt-2" />
            </li>
          ))}
        </ul>
      )}

      {isError && (
        <div className="bg-card border border-border rounded-lg p-4">
          <p className="text-sm">{copy.error}</p>
          <button
            onClick={() => void refetch()}
            className="mt-3 border border-secondary text-secondary px-4 py-2 rounded-md min-h-[48px]"
          >
            جرّب تاني
          </button>
        </div>
      )}

      {!isPending && !isError && (
        <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((p) => {
            const fromPrice = p.tiers.at(-1)?.unitPricePiasters
            return (
              <li key={p.slug} className="bg-card rounded-lg p-4 border border-border">
                <Link to={`/product/${p.slug}`} className="block">
                  <div className="aspect-[4/5] bg-muted rounded-md mb-3 flex items-center justify-center text-muted-foreground text-sm">
                    TODO(asset)
                  </div>
                  <h2 className="font-semibold">{p.name}</h2>
                  <p className="text-sm text-muted-foreground mt-1">{p.material}</p>
                  <p className="text-sm mt-2">{copy.minQty(p.minQty)}</p>
                  {fromPrice !== undefined && (
                    <p className="mt-2 text-sm">
                      من <Money piasters={fromPrice} /> للقطعة
                    </p>
                  )}
                  <div className="flex gap-1 mt-2">
                    {p.colors.slice(0, 6).map((c) => (
                      <span
                        key={c}
                        className="w-4 h-4 rounded-full border border-border"
                        style={{ backgroundColor: COLORS[c] ?? '#ccc' }}
                        title={c}
                      />
                    ))}
                  </div>
                </Link>
              </li>
            )
          })}
        </ul>
      )}

      {!isPending && !isError && filtered.length === 0 && (
        <p className="text-muted-foreground mt-6">لا توجد نتائج.</p>
      )}
    </section>
  )
}
