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
          className="ms-auto flex min-h-10 items-center gap-2 bg-coal px-3 text-xs font-semibold text-bone transition-colors hover:bg-black"
        >
          <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.6" aria-hidden>
            <path d="M6 8h12l-1 12H7L6 8Z" />
            <path d="M9 8a3 3 0 0 1 6 0" />
          </svg>
          السلة
          {count > 0 && (
            <span className="min-w-5 bg-bone px-1.5 text-center text-[10px] leading-5 text-coal" dir="ltr">
              {count}
            </span>
          )}
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
