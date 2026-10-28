import { BrowserRouter, Routes, Route, Link, useLocation } from 'react-router'
import { lazy, Suspense, useEffect } from 'react'
import type { ReactNode } from 'react'
import { copy } from './lib/copy'
import { BrandLogo, BrandMark } from './components/BrandLogo'
import { WhatsAppButton } from './components/WhatsAppButton'
import { EditorialHeader } from './components/editorial/EditorialHeader'
import { EditorialFooter } from './components/editorial/EditorialFooter'
import { BasketProvider } from './features/basket/BasketProvider'
import { useBasket } from './features/basket/context'
import BasketPage from './features/basket/BasketPage'
import CatalogPage from './features/catalog/CatalogPage'
import ProductPage from './features/catalog/ProductPage'
import HomePage from './features/home/HomePage'
import { AboutPage, ContactPage, PortfolioPage, PrivacyPage } from './features/pages/ContentPages'

const CheckoutPage = lazy(() => import('./features/checkout/CheckoutPage'))

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

/**
 * The order flow keeps the original layout untouched: the approved checkout and
 * the basket that feeds it must never pick up the editorial redesign.
 */
const ORDER_FLOW_PATHS = ['/checkout', '/basket']

function isOrderFlow(pathname: string) {
  return ORDER_FLOW_PATHS.includes(pathname)
}

function LegacyLayout({ children }: { children: ReactNode }) {
  const { count } = useBasket()
  return (
    <div className="min-h-screen bg-background text-foreground">
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
      <main className="mx-auto max-w-[1200px] px-4 py-6 pb-24">{children}</main>
      <footer className="border-t border-border px-4 py-6 text-sm text-muted-foreground">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-3">
          <span className="flex items-center gap-2 text-foreground">
            <BrandMark size={28} />
            <span style={{ fontFamily: 'Readex Pro, sans-serif' }}>Fox Plast</span>
          </span>
          <span>© {CURRENT_YEAR} Fox Plast</span>
        </div>
      </footer>
      <WhatsAppButton />
    </div>
  )
}

function EditorialLayout({ children }: { children: ReactNode }) {
  return (
    <div className="min-h-screen bg-bone text-coal">
      <EditorialHeader />
      <main className="pb-16">{children}</main>
      <EditorialFooter />
      <WhatsAppButton variant="editorial" />
    </div>
  )
}

function Layout({ children }: { children: ReactNode }) {
  const { pathname } = useLocation()
  return (
    <>
      <SeoHead />
      {isOrderFlow(pathname) ? (
        <LegacyLayout>{children}</LegacyLayout>
      ) : (
        <EditorialLayout>{children}</EditorialLayout>
      )}
    </>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <BasketProvider>
        <Layout>
          <Routes>
            <Route path="/" element={<HomePage />} />
            <Route path="/catalog" element={<CatalogPage />} />
            <Route path="/product/:slug" element={<ProductPage />} />
            <Route path="/portfolio" element={<PortfolioPage />} />
            <Route path="/about" element={<AboutPage />} />
            <Route path="/contact" element={<ContactPage />} />
            <Route path="/privacy" element={<PrivacyPage />} />
            <Route path="/basket" element={<BasketPage />} />
            <Route
              path="/checkout"
              element={
                <Suspense fallback={<p className="text-muted-foreground">بنحمّل…</p>}>
                  <CheckoutPage />
                </Suspense>
              }
            />
          </Routes>
        </Layout>
      </BasketProvider>
    </BrowserRouter>
  )
}
