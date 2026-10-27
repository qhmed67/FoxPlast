import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { copy } from './lib/copy'
import CatalogPage from './features/catalog/CatalogPage'
import ProductPage from './features/catalog/ProductPage'

function SeoHead() {
  const { pathname } = useLocation()
  useEffect(() => {
    const titles: Record<string, string> = {
      '/': 'Fox Plast — شنط دعاية صديقة للبيئة',
      '/catalog': 'المنتجات — Fox Plast',
      '/portfolio': 'أعمالنا — Fox Plast',
      '/about': 'من نحن — Fox Plast',
      '/contact': 'اتصل بنا — Fox Plast',
      '/privacy': 'سياسة الخصوصية — Fox Plast',
    }
    document.title = titles[pathname] ?? 'Fox Plast'
  }, [pathname])
  return null
}

function Layout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SeoHead />
      <header className="border-b border-border px-4 py-3 flex items-center justify-between">
        <Link to="/" className="font-bold text-lg" style={{ fontFamily: 'Readex Pro, sans-serif' }}>
          Fox Plast
        </Link>
        <nav className="flex gap-4 text-sm">
          <Link to="/">{copy.nav.home}</Link>
          <Link to="/catalog">{copy.nav.catalog}</Link>
          <Link to="/portfolio">أعمالنا</Link>
          <Link to="/about">من نحن</Link>
          <Link to="/contact">اتصل بنا</Link>
        </nav>
      </header>
      <main className="max-w-[1200px] mx-auto px-4 py-6">{children}</main>
      <footer className="border-t border-border px-4 py-6 text-sm text-muted-foreground text-center">
        © Fox Plast
      </footer>
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
        <Link to="/catalog" className="inline-block bg-primary text-primary-foreground px-4 py-3 rounded-md min-h-[48px]">
          {copy.primaryCta}
        </Link>
      </div>
    </section>
  )
}

function Portfolio() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">أعمالنا</h1>
      <p className="text-muted-foreground">TODO(asset): portfolio gallery — real production photos with per-item approved flag.</p>
    </section>
  )
}

function About() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">من نحن</h1>
      <p className="text-muted-foreground">TODO(client): factory story, address, working hours, social links.</p>
    </section>
  )
}

function Contact() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">اتصل بنا</h1>
      <p className="text-muted-foreground">TODO(client): WhatsApp number, Telegram usernames, factory address.</p>
    </section>
  )
}

function Privacy() {
  return (
    <section>
      <h1 className="text-2xl font-bold mb-4">سياسة الخصوصية</h1>
      <p className="text-muted-foreground">TODO(client): privacy page copy.</p>
    </section>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Layout>
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/catalog" element={<CatalogPage />} />
          <Route path="/product/:slug" element={<ProductPage />} />
          <Route path="/portfolio" element={<Portfolio />} />
          <Route path="/about" element={<About />} />
          <Route path="/contact" element={<Contact />} />
          <Route path="/privacy" element={<Privacy />} />
        </Routes>
      </Layout>
    </BrowserRouter>
  )
}
