import { Link } from 'react-router'
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

      <div className="mx-auto flex h-16 max-w-[1400px] items-center gap-5 px-4">
        <BrandLogo />
        <nav aria-label="التنقل الرئيسي" className="ms-4 hidden flex-1 gap-7 text-xs font-medium tracking-wide md:flex">
          {NAV.map((item) => (
            <Link key={item.to} to={item.to} className="editorial-underline text-coal/80 hover:text-coal">
              {item.label}
            </Link>
          ))}
        </nav>
        <Link
          to="/basket"
          aria-label={count > 0 ? `السلة، ${count} منتج` : 'السلة'}
          className="cart-action group relative -me-2 ms-auto flex h-11 items-center gap-2.5 rounded-full px-3 text-coal transition-colors hover:bg-white focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-coal"
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
            {count > 0 && (
              <span
                key={count}
                className="cart-count absolute -start-1.5 -top-1.5 grid h-4 min-w-4 place-items-center rounded-full border border-coal/15 bg-white px-1 text-[9px] font-semibold leading-none text-coal"
                dir="ltr"
              >
                {count}
              </span>
            )}
          </span>
          <span className="hidden text-xs font-medium tracking-wide sm:inline">السلة</span>
        </Link>
      </div>

      <nav
        aria-label="تنقل الموبايل"
        className="flex gap-5 overflow-x-auto border-t border-sand px-4 py-2 text-[11px] font-medium text-coal/75 md:hidden"
      >
        {NAV.map((item) => (
          <Link key={item.to} to={item.to} className="whitespace-nowrap">
            {item.label}
          </Link>
        ))}
      </nav>
    </header>
  )
}
