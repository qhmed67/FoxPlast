import { useState, useMemo } from 'react'
import { Link } from 'react-router'
import { seedProducts, type Product } from './seed'
import { formatMoney } from '../../lib/money'
import { copy } from '../../lib/copy'

const COLORS: Record<string, string> = {
  yellow: '#E8C547', orange: '#F28A1E', black: '#1a1a1a', red: '#C62828',
  pink: '#E8A0BF', blue: '#2F63B5', green: '#1F7A3E', white: '#F5F5F5',
  natural: '#D9C9A3', brown: '#7A5C2E', gray: '#9CA3AF',
}

export default function CatalogPage() {
  const [category, setCategory] = useState<string>('all')
  const [color, setColor] = useState<string>('all')

  const filtered = useMemo(() => {
    return seedProducts.filter((p: Product) => {
      if (category !== 'all' && p.material !== category) return false
      if (color !== 'all' && !p.colors.includes(color)) return false
      return true
    })
  }, [category, color])

  const categories = ['all', ...Array.from(new Set(seedProducts.map((p) => p.material)))]

  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">{copy.nav.catalog}</h1>
      <div className="flex flex-wrap gap-2 mb-4">
        {categories.map((c) => (
          <button
            key={c}
            onClick={() => setCategory(c)}
            className={`px-3 py-1 rounded-full text-sm border ${category === c ? 'bg-primary text-primary-foreground border-primary' : 'border-border'}`}
          >
            {c === 'all' ? 'الكل' : c}
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2 mb-6">
        {['all', ...Object.keys(COLORS)].filter((c) => c === 'all' || seedProducts.some((p) => p.colors.includes(c))).map((c) => (
          <button
            key={c}
            onClick={() => setColor(c)}
            aria-label={c}
            className={`w-7 h-7 rounded-full border-2 ${color === c ? 'border-foreground ring-2 ring-primary' : 'border-border'}`}
            style={{ backgroundColor: c === 'all' ? 'transparent' : COLORS[c] }}
          >
            {c === 'all' ? '×' : ''}
          </button>
        ))}
      </div>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {filtered.map((p) => (
          <li key={p.slug} className="bg-card rounded-lg p-4 border border-border">
            <Link to={`/product/${p.slug}`} className="block">
              <div className="aspect-[4/5] bg-muted rounded-md mb-3 flex items-center justify-center text-muted-foreground text-sm">
                TODO(asset)
              </div>
              <h2 className="font-semibold">{p.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{p.material}</p>
              <p className="text-sm mt-2">{copy.minQty(p.minQty)}</p>
              <p className="mt-2 font-mono text-sm" dir="ltr">{formatMoney(p.tiers[0].unitPricePiasters)}</p>
              <div className="flex gap-1 mt-2">
                {p.colors.slice(0, 6).map((c) => (
                  <span key={c} className="w-4 h-4 rounded-full border border-border" style={{ backgroundColor: COLORS[c] ?? '#ccc' }} title={c} />
                ))}
              </div>
            </Link>
          </li>
        ))}
      </ul>
      {filtered.length === 0 && <p className="text-muted-foreground mt-6">لا توجد نتائج.</p>}
    </section>
  )
}
