import { Link, NavLink } from 'react-router'
import { BrandLogo } from '../BrandLogo'
import { useBasket } from '../../features/basket/context'
import { usePublicConfig, whatsappLink } from '../../features/config/api'
import { copy } from '../../lib/copy'

const NAV = [
  { to: '/', label: copy.nav.home },
  { to: '/catalog', label: copy.nav.catalog },
  { to: '/portfolio', label: 'أعمالنا' },
  { to: '/about', label: 'من نحن' },
  { to: '/contact', label: 'اتصل بنا' },
  // The order pages are real destinations too; keeping them here means the
  // mobile row always shows where the visitor actually is.
  { to: '/basket', label: copy.nav.basket },
  { to: '/checkout', label: 'إتمام الطلب' },
]

export function EditorialHeader() {
  const { count } = useBasket()
  const { data } = usePublicConfig()
  const quote = whatsappLink(data?.whatsappNumber ?? null, 'عايز عرض سعر لشنط دعاية من Fox Plast')

  return (
    <header className="sticky top-0 z-30 border-b border-sand bg-bone/95 backdrop-blur">
      <div className="bg-coal text-bone">
        <div className="mx-auto flex max-w-[1400px] items-center justify-between gap-4 px-4 py-2 text-[10px] font-medium uppercase tracking-[0.18em]">
          <span>مصنع شنط دعاية وتخزين — الإسكندرية</span>
          {quote ? (
            <a href={quote} target="_blank" rel="noreferrer" className="text-bone/80 hover:text-bone">
              اطلب عرض سعر ↗
            </a>
          ) : (
            <span className="text-bone/60">اطلب عرض سعر</span>
          )}
        </div>
      </div>

      {/* Holds the lockup and the bar, so the bar below can be its own row on
          narrow screens without the absolutely-placed brand riding into it. */}
      <div className="relative mx-auto max-w-[1400px] px-4">
        {/* Centred brand lockup, like the reference; absolutely placed so the
            uneven side widths never push it off-centre. */}
        <div className="absolute left-1/2 top-2 -translate-x-1/2 lg:top-1/2 lg:-translate-y-1/2">
          <BrandLogo />
        </div>
        <div className="mx-auto flex w-full flex-col gap-y-1 pt-14 lg:h-16 lg:flex-row lg:items-center lg:gap-x-5 lg:pt-0">
        <nav
          aria-label="التنقل الرئيسي"
          className="mobile-nav-row order-last text-[11px] font-medium lg:order-none lg:flex-1 lg:text-xs lg:tracking-wide lg:pe-[18rem]"
        >
          {NAV.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              end={/^\/[^/]*$/.test(item.to)}
              className={({ isActive }) =>
                `mobile-nav-link editorial-underline transition-colors ${
                  isActive ? 'is-active' : ''
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </nav>
        <Link
          to="/basket"
          aria-label={count > 0 ? `السلة، ${count} منتج` : 'السلة'}
          className="cart-action group absolute end-4 top-2.5 flex h-11 items-center gap-2.5 rounded-full px-3 text-coal transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coal lg:static lg:ms-auto"
        >
          <span className="relative grid place-items-center">
            <svg
              viewBox="0 0 24 24"
              className="h-[22px] w-[22px]"
              fill="none"
              stroke="currentColor"
              strokeWidth="1.4"
              strokeLinecap="round"
              strokeLinejoin="round"
              aria-hidden
            >
              <path d="M6.6 7.6h10.8l-1 11.9a1.6 1.6 0 0 1-1.6 1.5H9.2a1.6 1.6 0 0 1-1.6-1.5l-1-11.9Z" />
              <path d="M9.4 7.6V6.2a2.6 2.6 0 0 1 5.2 0v1.4" />
            </svg>
          </span>
          {count > 0 && (
            <span
              key={count}
              className="cart-count grid h-[18px] min-w-[18px] place-items-center rounded-full bg-coal px-1 text-[10px] font-semibold leading-none tabular-nums text-bone"
              dir="ltr"
            >
              {count}
            </span>
          )}
          <span className="hidden text-xs font-medium tracking-wide sm:inline">السلة</span>
        </Link>
        </div>
      </div>

    </header>
  )
}
