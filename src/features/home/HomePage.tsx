import { Link } from 'react-router'
import { ProductCard } from '../../components/ProductCard'
import { usePublicConfig, whatsappLink } from '../config/api'
import { useProducts } from '../catalog/api'

const STORAGE_COLORS = [
  { key: 'green', label: 'أخضر' },
  { key: 'blue', label: 'أزرق' },
  { key: 'gray', label: 'رمادي' },
  { key: 'red', label: 'أحمر' },
]

function Eyebrow({ children }: { children: string }) {
  return (
    <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-kraft-700">
      {children}
    </p>
  )
}

export default function HomePage() {
  const { data: products = [], isPending } = useProducts()
  const { data: config } = usePublicConfig()
  const quote = whatsappLink(config?.whatsappNumber ?? null, 'عايز عرض سعر لشنط دعاية من Fox Plast')

  const storage = products.find((p) => p.slug === 'storage-70x60x20')
  const rest = products.filter((p) => p.slug !== 'storage-70x60x20').slice(0, 3)

  return (
    <div className="bg-bone text-coal">
      {/* Hero */}
      <section className="editorial-hero relative overflow-hidden bg-coal text-bone">
        <div className="relative z-10 mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-12 sm:px-6 lg:grid-cols-[1.05fr_0.95fr] lg:gap-16 lg:py-20">
          <div className="order-2 lg:order-1">
            <p className="text-[10px] font-semibold uppercase tracking-[0.32em] text-bone/45">
              Fox Plast — Cairo
            </p>
            <h1 className="mt-5 text-[clamp(2.9rem,8vw,6.5rem)] font-bold leading-[0.98] tracking-[-0.03em]">
              شنط بتحمل
              <br />
              <span className="text-orange-500">اسمك.</span>
            </h1>
            <p className="mt-6 max-w-[46ch] text-sm leading-8 text-bone/65 sm:text-base">
              من شنط الدعاية القماش والكرافت، لشنط الخزين القوية. بنصنع الخامة، بنطبع اللوجو،
              وبنسلّم لبراندات بتكبر.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                to="/catalog"
                className="inline-flex min-h-12 items-center bg-bone px-7 text-xs font-semibold uppercase tracking-[0.14em] text-coal transition-colors hover:bg-white"
              >
                تسوّق المنتجات
              </Link>
              <Link
                to="/contact"
                className="inline-flex min-h-12 items-center border border-white/25 px-7 text-xs font-semibold uppercase tracking-[0.14em] text-bone transition-colors hover:border-bone"
              >
                اطلب عرض سعر
              </Link>
            </div>
          </div>

          <div className="order-1 lg:order-2">
            <div className="relative overflow-hidden bg-[#DCD3C4]">
              <img
                src="/products/storage-hero.jpg"
                alt="شنطة خزين خضراء من Fox Plast"
                className="aspect-[4/3] w-full object-cover lg:aspect-[5/4]"
                fetchPriority="high"
              />
              <span className="absolute bottom-4 start-4 bg-bone px-3 py-2 text-[10px] font-semibold uppercase tracking-[0.16em] text-coal">
                70 × 60 × 20 سم
              </span>
            </div>
          </div>
        </div>
      </section>

      {/* Ticker */}
      <div className="overflow-hidden border-b border-sand bg-bone py-3">
        <div className="editorial-marquee gap-10 whitespace-nowrap px-4 text-[10px] font-semibold uppercase tracking-[0.28em] text-coal/55">
          {[0, 1].map((copyIndex) => (
            <div key={copyIndex} className="flex shrink-0 items-center gap-10" aria-hidden={copyIndex === 1}>
              {['شنط قماش غير منسوج', 'شنط كرافت', 'شنط خزين', 'أغطية ملابس', 'طباعة لوجو'].map((item) => (
                <span key={item} className="flex items-center gap-10">
                  {item}
                  <span className="h-1 w-1 rounded-full bg-orange-500" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </div>

      {/* Storage collection */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>Storage Collection</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
              شنطة الخزين — أربع ألوان
            </h2>
          </div>
          <Link
            to="/catalog"
            className="editorial-underline text-xs font-semibold uppercase tracking-[0.16em] text-coal"
          >
            كل المنتجات
          </Link>
        </div>

        {isPending ? (
          <div className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4">
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="aspect-[4/5] animate-pulse bg-[#EFEAE1]" />
            ))}
          </div>
        ) : (
          <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-4 lg:gap-6">
            {storage &&
              STORAGE_COLORS.map((color, index) => (
                <ProductCard
                  key={color.key}
                  product={storage}
                  imageColor={color.key}
                  title={`شنطة خزين — ${color.label}`}
                  href={`/product/${storage.slug}?color=${color.key}`}
                  eager={index < 2}
                />
              ))}
          </ul>
        )}
      </section>

      {/* Story */}
      <section className="bg-coal text-bone">
        <div className="mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-16 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-24">
          <div className="overflow-hidden bg-[#1A1A18]">
            <img
              src="/products/storage-detail.jpg"
              alt="تفاصيل حزام ومقابض شنطة الخزين"
              loading="lazy"
              className="aspect-[4/3] w-full object-cover"
            />
          </div>
          <div>
            <Eyebrow>Inside the factory</Eyebrow>
            <h2 className="mt-4 text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-5xl">
              خامة تستحمل.
              <br />
              تفاصيل بتفرق.
            </h2>
            <p className="mt-6 max-w-[46ch] text-sm leading-8 text-bone/60">
              كل شنطة بتخرج من المصنع بعد ما الخامة والمقاسات والمقابض تتظبط. نفس الفريق
              اللي بيقص وبيخيط هو اللي بيراجع الشكل النهائي قبل التسليم.
            </p>
            <Link
              to="/about"
              className="mt-8 inline-flex min-h-12 items-center border border-white/25 px-6 text-xs font-semibold uppercase tracking-[0.14em] transition-colors hover:border-bone"
            >
              اعرف أكتر عن المصنع
            </Link>
          </div>
        </div>
      </section>

      {/* Other families */}
      <section className="mx-auto max-w-[1400px] px-4 py-16 sm:px-6 lg:py-20">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <Eyebrow>The Collection</Eyebrow>
            <h2 className="mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
              من عائلة Fox Plast
            </h2>
          </div>
          <Link
            to="/catalog"
            className="editorial-underline text-xs font-semibold uppercase tracking-[0.16em] text-coal"
          >
            استكشف الكل
          </Link>
        </div>

        <ul className="mt-8 grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
          {rest.map((product) => (
            <ProductCard key={product.slug} product={product} />
          ))}
        </ul>
      </section>

      {/* CTA */}
      <section className="border-t border-sand bg-bone">
        <div className="mx-auto flex max-w-[1400px] flex-col items-start justify-between gap-8 px-4 py-16 sm:px-6 lg:flex-row lg:items-center lg:py-20">
          <div>
            <Eyebrow>Start a project</Eyebrow>
            <h2 className="mt-3 max-w-[20ch] text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-5xl">
              عندك براند؟ خلّي شنطته تتشال.
            </h2>
            <p className="mt-4 max-w-[48ch] text-sm leading-8 text-kraft-700">
              ابعتلنا المقاس والكمية واللوجو، وهنرجعلك بعرض سعر واضح.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            {quote && (
              <a
                href={quote}
                target="_blank"
                rel="noreferrer"
                className="inline-flex min-h-12 items-center bg-coal px-7 text-xs font-semibold uppercase tracking-[0.14em] text-bone"
              >
                واتساب
              </a>
            )}
            <Link
              to="/contact"
              className="inline-flex min-h-12 items-center border border-coal/25 px-7 text-xs font-semibold uppercase tracking-[0.14em] text-coal"
            >
              اتصل بنا
            </Link>
          </div>
        </div>
      </section>
    </div>
  )
}
