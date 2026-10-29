import { useEffect, useState } from 'react'
import { Link, useLocation } from 'react-router'
import { BrandMark } from '../BrandLogo'
import { useBasket } from '../../features/basket/context'
import { usePublicConfig, whatsappLink } from '../../features/config/api'
import { copy } from '../../lib/copy'

const NAV = [
  { to: '/', label: copy.nav.home },
  { to: '/catalog', label: copy.nav.catalog },
  { to: '/portfolio', label: 'أعمالنا' },
  { to: '/about', label: 'من نحن' },
  { to: '/contact', label: 'اتصل بنا' },
]

export function EditorialHeader() {
  const { count } = useBasket()
  const { data } = usePublicConfig()
  const quote = whatsappLink(data?.whatsappNumber ?? null, 'عايز عرض سعر لشنط دعاية من Fox Plast')
  const { pathname } = useLocation()
  const [open, setOpen] = useState(false)
  const [lastPath, setLastPath] = useState(pathname)

  // Close the menu after navigating, during render (no effect needed).
  if (pathname !== lastPath) {
    setLastPath(pathname)
    setOpen(false)
  }

  useEffect(() => {
    if (!open) return
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'Escape') setOpen(false)
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open])

  return (
    <header className="sticky top-0 z-40 border-b border-sand bg-bone/95 backdrop-blur">
      <div className="relative mx-auto flex h-[72px] max-w-[1400px] items-center justify-between gap-3 px-4 sm:px-6">
        {/* Start: menu, mirroring the reference header's hamburger + Shop. */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="site-menu"
            aria-label={open ? 'إغلاق القائمة' : 'فتح القائمة'}
            className="group -ms-2 grid h-11 w-11 place-items-center text-coal"
          >
            <span className="relative block h-3.5 w-5" aria-hidden>
              <span
                className={`absolute inset-x-0 top-0 h-px bg-current transition-transform duration-200 ${
                  open ? 'translate-y-[7px] rotate-45' : ''
                }`}
              />
              <span
                className={`absolute inset-x-0 top-[7px] h-px bg-current transition-opacity duration-200 ${
                  open ? 'opacity-0' : 'opacity-100'
                }`}
              />
              <span
                className={`absolute inset-x-0 bottom-0 h-px bg-current transition-transform duration-200 ${
                  open ? '-translate-y-[6px] -rotate-45' : ''
                }`}
              />
            </span>
          </button>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            aria-expanded={open}
            aria-controls="site-menu"
            className="hidden items-center gap-1.5 text-xs font-medium tracking-wide text-coal sm:flex"
          >
            تسوّق
            <svg
              viewBox="0 0 12 8"
              className={`h-2 w-2.5 transition-transform duration-200 ${open ? 'rotate-180' : ''}`}
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              aria-hidden
            >
              <path d="m1 1.5 5 5 5-5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </button>
        </div>

        {/* Center: the mark alone, like the reference. */}
        <Link
          to="/"
          aria-label="Fox Plast — الرئيسية"
          className="absolute start-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2"
        >
          <BrandMark size={40} />
          <span className="sr-only">Fox Plast</span>
        </Link>

        {/* End: cart action. */}
        <Link
          to="/basket"
          aria-label={count > 0 ? `السلة، ${count} منتج` : 'السلة'}
          className="cart-action flex min-h-11 items-center gap-2 border border-coal/25 bg-white px-3 text-xs font-semibold text-coal hover:border-coal hover:bg-[#F1EAE0] hover:shadow-[0_8px_18px_-12px_rgba(13,13,11,0.55)]"
        >
          <svg viewBox="0 0 24 24" className="h-[18px] w-[18px]" fill="none" stroke="currentColor" strokeWidth="1.5" aria-hidden>
            <path d="M6 8h12l-1 12H7L6 8Z" />
            <path d="M9 8a3 3 0 0 1 6 0" />
          </svg>
          <span className="hidden sm:inline">السلة</span>
          {count > 0 && (
            <span
              key={count}
              className="cart-count min-w-5 border border-coal/25 bg-white px-1.5 text-center text-[10px] leading-5 text-coal"
              dir="ltr"
            >
              {count}
            </span>
          )}
        </Link>
      </div>

      {/* Menu panel */}
      {open && (
        <>
          <button
            type="button"
            tabIndex={-1}
            aria-hidden
            onClick={() => setOpen(false)}
            className="fixed inset-0 top-[73px] z-30 cursor-default bg-coal/25"
          />
          <div
            id="site-menu"
            className="site-menu absolute inset-x-0 top-full z-40 border-b border-sand bg-bone shadow-[0_24px_60px_-30px_rgba(13,13,11,0.45)]"
          >
            <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-10 sm:px-6 lg:grid-cols-[1.2fr_0.8fr]">
              <nav aria-label="التنقل الرئيسي">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-kraft-700">
                  تنقل
                </p>
                <ul className="mt-5 space-y-1">
                  {NAV.map((item) => (
                    <li key={item.to}>
                      <Link
                        to={item.to}
                        className={`group flex items-baseline gap-3 py-1.5 text-[clamp(1.5rem,4vw,2.25rem)] font-bold leading-tight tracking-[-0.02em] transition-colors ${
                          pathname === item.to ? 'text-coal' : 'text-coal/55 hover:text-coal'
                        }`}
                      >
                        <span className="font-mono text-[10px] font-normal text-coal/30 group-hover:text-coal/60">
                          0{NAV.indexOf(item) + 1}
                        </span>
                        {item.label}
                      </Link>
                    </li>
                  ))}
                </ul>
              </nav>

              <div className="border-t border-sand pt-6 lg:border-s lg:border-t-0 lg:ps-8 lg:pt-0">
                <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-kraft-700">
                  المصنع
                </p>
                <p className="mt-4 max-w-[32ch] text-sm leading-7 text-coal/60">
                  شنط دعاية وتخزين من مصنع في الإسكندرية. خامات قوية، طباعة لوجو، وأسعار جملة
                  حسب الكمية.
                </p>
                {quote && (
                  <a
                    href={quote}
                    target="_blank"
                    rel="noreferrer"
                    className="mt-6 inline-flex min-h-11 items-center bg-[#25D366] px-5 text-xs font-semibold text-[#052e16] transition-colors hover:bg-[#1fbe5b]"
                  >
                    اطلب عرض سعر على واتساب ↗
                  </a>
                )}
                <p className="mt-6 text-xs text-coal/40">الإسكندرية، مصر</p>
              </div>
            </div>
          </div>
        </>
      )}
    </header>
  )
}
