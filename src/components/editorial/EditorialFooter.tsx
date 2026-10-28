import { Link } from 'react-router'
import { BrandMark } from '../BrandLogo'
import { usePublicConfig, whatsappLink } from '../../features/config/api'

const CURRENT_YEAR = new Date().getFullYear()

export function EditorialFooter() {
  const { data } = usePublicConfig()
  const link = whatsappLink(data?.whatsappNumber ?? null, 'عايز أستفسر عن شنط Fox Plast')

  return (
    <footer className="bg-coal text-bone">
      <div className="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 sm:grid-cols-2 lg:grid-cols-[1.4fr_1fr_1fr]">
        <div>
          <div className="flex items-center gap-3">
            <BrandMark size={34} />
            <span className="text-lg font-bold" style={{ fontFamily: 'Readex Pro, sans-serif' }}>
              Fox Plast
            </span>
          </div>
          <p className="mt-4 max-w-[38ch] text-sm leading-7 text-bone/60">
            شنط دعاية وتخزين من مصنع مصري. خامات قوية، طباعة لوجو، وأسعار جملة حسب الكمية.
          </p>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bone/40">تنقل</p>
          <ul className="mt-4 space-y-2 text-sm text-bone/75">
            <li><Link to="/catalog" className="hover:text-bone">المنتجات</Link></li>
            <li><Link to="/portfolio" className="hover:text-bone">أعمالنا</Link></li>
            <li><Link to="/about" className="hover:text-bone">من نحن</Link></li>
            <li><Link to="/contact" className="hover:text-bone">اتصل بنا</Link></li>
          </ul>
        </div>

        <div>
          <p className="text-[10px] font-semibold uppercase tracking-[0.22em] text-bone/40">تواصل</p>
          <ul className="mt-4 space-y-2 text-sm text-bone/75">
            <li>
              {link ? (
                <a href={link} target="_blank" rel="noreferrer" className="hover:text-bone">
                  واتساب ↗
                </a>
              ) : (
                <span>واتساب</span>
              )}
            </li>
            <li><Link to="/privacy" className="hover:text-bone">سياسة الخصوصية</Link></li>
          </ul>
        </div>
      </div>

      <div className="border-t border-white/10">
        <div className="mx-auto flex max-w-[1400px] flex-wrap items-center justify-between gap-3 px-4 py-5 text-[11px] text-bone/45">
          <span>© {CURRENT_YEAR} Fox Plast</span>
          <span>صُنع في مصر</span>
        </div>
      </div>
    </footer>
  )
}
