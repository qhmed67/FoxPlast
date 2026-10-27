import { BrowserRouter, Routes, Route, Link, useParams } from 'react-router'
import type { ReactNode } from 'react'
import { copy } from './lib/copy'
import { seedProducts, findProduct } from './features/catalog/seed'
import { formatMoney } from './lib/money'

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg" style={{ fontFamily: 'Readex Pro, sans-serif' }}>
          Fox Plast
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link to="/">{copy.nav.home}</Link>
          <Link to="/catalog">{copy.nav.catalog}</Link>
        </nav>
      </header>
      <main className="max-w-[1200px] mx-auto px-4 py-6">{children}</main>
    </div>
  )
}

function Home() {
  return (
    <section>
      <h1 className="text-3xl font-bold" style={{ fontFamily: 'Readex Pro, sans-serif' }}>
        {copy.heroLine}
      </h1>
      <p className="mt-2 text-muted-foreground">{copy.secondaryCta}</p>
      <div className="mt-6">
        <Link to="/catalog" className="inline-block bg-primary text-primary-foreground px-4 py-2 rounded-md min-h-[48px]">
          {copy.primaryCta}
        </Link>
      </div>
    </section>
  )
}

function Catalog() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">{copy.nav.catalog}</h1>
      <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {seedProducts.map((p) => (
          <li key={p.slug} className="bg-card rounded-lg p-4 border border-border">
            <Link to={`/product/${p.slug}`} className="block">
              <h2 className="font-semibold">{p.name}</h2>
              <p className="text-sm text-muted-foreground mt-1">{p.material}</p>
              <p className="text-sm mt-2">{copy.minQty(p.minQty)}</p>
              <p className="mt-2 font-mono text-sm" dir="ltr">
                {formatMoney(p.tiers[0].unitPricePiasters)}
              </p>
            </Link>
          </li>
        ))}
      </ul>
    </section>
  )
}

function Product() {
  const { slug } = useParams()
  const p = findProduct(slug ?? '')
  if (!p) return <p>TODO(asset): product not found</p>
  return (
    <section>
      <h1 className="text-2xl font-bold">{p.name}</h1>
      <p className="text-muted-foreground mt-1">{p.material}</p>
      <h2 className="mt-4 font-semibold">الأسعار حسب الكمية</h2>
      <ul className="mt-2 space-y-1">
        {p.tiers.map((t) => (
          <li key={t.minQty} className="flex justify-between border-b border-border py-1">
            <span>{t.minQty}+ قطعة</span>
            <span className="font-mono" dir="ltr">{formatMoney(t.unitPricePiasters)}</span>
          </li>
        ))}
      </ul>
      <p className="mt-3 text-sm">{copy.minQty(p.minQty)}</p>
      <button className="mt-4 bg-primary text-primary-foreground px-4 py-2 rounded-md min-h-[48px]">
        {copy.addToBasket}
      </button>
    </section>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<Catalog />} />
          <Route path="/product/:slug" element={<Product />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
