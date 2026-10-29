import { BrowserRouter, Routes, Route, useLocation } from 'react-router'
import { lazy, Suspense, useEffect } from 'react'
import type { ReactNode } from 'react'
import { WhatsAppButton } from './components/WhatsAppButton'
import { EditorialHeader } from './components/editorial/EditorialHeader'
import { EditorialFooter } from './components/editorial/EditorialFooter'
import { BasketProvider } from './features/basket/BasketProvider'
import BasketPage from './features/basket/BasketPage'
import CatalogPage from './features/catalog/CatalogPage'
import ProductPage from './features/catalog/ProductPage'
import HomePage from './features/home/HomePage'
import { AboutPage, ContactPage, PortfolioPage, PrivacyPage } from './features/pages/ContentPages'

const CheckoutPage = lazy(() => import('./features/checkout/CheckoutPage'))
const AdminPage = lazy(() => import('./features/admin/AdminPage'))

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
      '/admin': 'الإدارة — Fox Plast',
    }
    document.title = titles[pathname] ?? 'Fox Plast'
  }, [pathname])
  return null
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

  // The admin has its own chrome; it never renders the storefront header/footer.
  if (pathname.startsWith('/admin')) {
    return (
      <>
        <SeoHead />
        {children}
      </>
    )
  }

  return (
    <>
      <SeoHead />
      <EditorialLayout>{children}</EditorialLayout>
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
            <Route
              path="/admin/*"
              element={
                <Suspense fallback={<p className="p-8 text-muted-foreground">بنحمّل…</p>}>
                  <AdminPage />
                </Suspense>
              }
            />
          </Routes>
        </Layout>
      </BasketProvider>
    </BrowserRouter>
  )
}
