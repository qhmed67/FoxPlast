import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router'
import { useEffect } from 'react'
import type { ReactNode } from 'react'
import { copy } from './lib/copy'
import { BrandLogo, BrandMark } from './components/BrandLogo'
import { BasketProvider } from './features/basket/BasketProvider'
import { useBasket } from './features/basket/context'
import BasketPage from './features/basket/BasketPage'
import CatalogPage from './features/catalog/CatalogPage'
import ProductPage from './features/catalog/ProductPage'
import CheckoutPage from './features/checkout/CheckoutPage'

const CURRENT_YEAR = new Date().getFullYear()

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
      '/basket': 'الطلب — Fox Plast',
      '/checkout': 'بيانات الطلب — Fox Plast',
    }
    document.title = titles[pathname] ?? 'Fox Plast'
  }, [pathname])
  return null
}

function Layout({ children }: { children: ReactNode }) {
  const { count } = useBasket()
  return (
    <div className="min-h-screen bg-background text-foreground">
      <SeoHead />
      <header className="border-b border-border px-4 py-3">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center gap-x-3 gap-y-2">
          <BrandLogo />
          <nav
            aria-label="التنقل الرئيسي"
            className="order-3 flex w-full flex-wrap gap-x-4 gap-y-1 text-sm whitespace-nowrap sm:order-none sm:w-auto sm:flex-1"
          >
            <Link to="/">{copy.nav.home}</Link>
            <Link to="/catalog">{copy.nav.catalog}</Link>
            <Link to="/portfolio">أعمالنا</Link>
            <Link to="/about">من نحن</Link>
            <Link to="/contact">اتصل بنا</Link>
          </nav>
          <Link
            to="/basket"
            className="ms-auto flex min-h-11 items-center gap-1.5 rounded-full border border-border px-3 text-sm"
          >
            السلة
            {count > 0 && (
              <span
                className="min-w-5 rounded-full bg-secondary px-1.5 text-center text-xs text-secondary-foreground"
                dir="ltr"
              >
                {count}
              </span>
            )}
          </Link>
        </div>
      </header>
      <main className="max-w-[1200px] mx-auto px-4 py-6">{children}</main>
      <footer className="border-t border-border px-4 py-6 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-foreground">
            <BrandMark size={28} />
            <span style={{ fontFamily: 'Readex Pro, sans-serif' }}>Fox Plast</span>
          </span>
          <span>© {CURRENT_YEAR} Fox Plast</span>
        </div>
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
      <BasketProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<Home />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/portfolio" element={<Portfolio />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/privacy" element={<Privacy />} />
            <Route path="/basket" element={<BasketPage />} />
            <Route path="/checkout" element={<CheckoutPage />} />
          </Routes>
        </Layout>
      </BasketProvider>
    </BrowserRouter>
  )
}
