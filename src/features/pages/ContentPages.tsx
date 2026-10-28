import { Link } from 'react-router'
import { usePublicConfig, whatsappLink } from '../config/api'

function PageIntro({
  eyebrow,
  title,
  children,
}: {
  eyebrow: string
  title: string
  children?: React.ReactNode
}) {
  return (
    <section className="border-b border-sand">
      <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-kraft-700">
          {eyebrow}
        </p>
        <h1 className="mt-4 max-w-[22ch] text-[clamp(2.4rem,6vw,4.5rem)] font-bold leading-[1.02] tracking-[-0.03em]">
          {title}
        </h1>
        {children && <div className="mt-6 max-w-[56ch] text-sm leading-8 text-coal/60">{children}</div>}
      </div>
    </section>
  )
}

const GALLERY = [
  { src: '/products/storage-green.png', label: 'شنطة خزين — أخضر' },
  { src: '/products/storage-blue.png', label: 'شنطة خزين — أزرق' },
  { src: '/products/storage-hero.jpg', label: 'المقاس 70 × 60 × 20 سم' },
  { src: '/products/storage-gray.png', label: 'شنطة خزين — رمادي' },
  { src: '/products/storage-detail.jpg', label: 'تفاصيل المقابض' },
  { src: '/products/storage-red.png', label: 'شنطة خزين — أحمر' },
]

export function PortfolioPage() {
  return (
    <div className="bg-bone text-coal">
      <PageIntro eyebrow="Selected work" title="شنط خرجت من المصنع.">
        صور حقيقية من إنتاج Fox Plast. كل شنطة بتتقص وتتخيط وتتراجع قبل التسليم.
      </PageIntro>

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:py-16">
        <ul className="grid grid-cols-2 gap-4 lg:grid-cols-3 lg:gap-6">
          {GALLERY.map((item, i) => (
            <li key={item.src}>
              <div className="aspect-[4/3] overflow-hidden bg-[#EFEAE1]">
                <img
                  src={item.src}
                  alt={item.label}
                  loading={i < 2 ? 'eager' : 'lazy'}
                  className="h-full w-full object-contain p-4 transition-transform duration-500 ease-out hover:scale-[1.03]"
                />
              </div>
              <p className="mt-3 text-[11px] uppercase tracking-[0.14em] text-coal/50">
                {item.label}
              </p>
            </li>
          ))}
        </ul>

        <div className="mt-14 flex flex-wrap items-center justify-between gap-6 border-t border-sand pt-10">
          <p className="max-w-[34ch] text-xl font-bold leading-snug">
            عايز تشوف خامات تانية على الطبيعة؟
          </p>
          <Link
            to="/contact"
            className="inline-flex min-h-12 items-center border border-coal/25 px-7 text-xs font-semibold uppercase tracking-[0.14em] text-coal transition-colors hover:border-coal"
          >
            اتصل بنا
          </Link>
        </div>
      </section>
    </div>
  )
}

const VALUES = [
  {
    title: 'خامة بنختارها',
    body: 'غير منسوج، كرافت، أو قماش خزين تقيل — الخامة بتتحدد حسب الاستخدام والميزانية.',
  },
  {
    title: 'طباعة لوجو',
    body: 'اللوجو بيتطبع على الشنطة بجودة تتحمل الشيل والاستخدام اليومي.',
  },
  {
    title: 'أسعار بالكمية',
    body: 'سعر القطعة بيقل مع الكمية. عرض السعر بيوضح كل شريحة قبل الطلب.',
  },
]

export function AboutPage() {
  return (
    <div className="bg-bone text-coal">
      <PageIntro eyebrow="The factory" title="بنصنع الشنطة اللي بتشيل اسمك.">
        Fox Plast مصنع في الإسكندرية متخصص في شنط الدعاية والخزين. من اختيار الخامة لحد آخر
        غرزة، الشغل كله تحت سقف واحد.
      </PageIntro>

      <section className="mx-auto grid max-w-[1400px] items-center gap-10 px-4 py-14 sm:px-6 lg:grid-cols-2 lg:gap-16 lg:py-20">
        <div className="overflow-hidden bg-[#EFEAE1]">
          <img
            src="/products/storage-detail.jpg"
            alt="تفاصيل خياطة ومقابض شنطة الخزين"
            loading="lazy"
            className="aspect-[4/3] w-full object-cover"
          />
        </div>
        <div>
          <h2 className="text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-4xl">
            تفاصيل صغيرة بتفرق في الاستخدام.
          </h2>
          <p className="mt-5 max-w-[48ch] text-sm leading-8 text-coal/60">
            المقابض بتتخيط مش بتتلزق، القص بيتظبط بالمقاس، والشنطة بتتراجع قبل ما تتحزم.
            الطريقة دي بتخلي الشنطة تستحمل الشيل اليومي وتفضل شكلها كويس.
          </p>
          <p className="mt-4 max-w-[48ch] text-sm leading-8 text-coal/60">
            TODO(client): نضيف عنوان المصنع وسنوات الخبرة وأسماء العملاء بعد التأكيد.
          </p>
        </div>
      </section>

      <section className="bg-coal text-bone">
        <div className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-bone/40">
            How we work
          </p>
          <ul className="mt-8 grid gap-8 sm:grid-cols-3">
            {VALUES.map((value, i) => (
              <li key={value.title} className="border-t border-white/15 pt-5">
                <span className="font-mono text-[11px] text-bone/40">0{i + 1}</span>
                <h3 className="mt-3 text-lg font-bold">{value.title}</h3>
                <p className="mt-2 text-sm leading-7 text-bone/55">{value.body}</p>
              </li>
            ))}
          </ul>
        </div>
      </section>

      <section className="mx-auto max-w-[1400px] px-4 py-14 sm:px-6 lg:py-20">
        <div className="flex flex-wrap items-center justify-between gap-6">
          <h2 className="max-w-[22ch] text-3xl font-bold leading-tight tracking-[-0.02em] sm:text-4xl">
            جاهزين نشتغل على شنط براندك.
          </h2>
          <Link
            to="/catalog"
            className="inline-flex min-h-12 items-center bg-coal px-7 text-xs font-semibold uppercase tracking-[0.14em] text-bone"
          >
            شوف المنتجات
          </Link>
        </div>
      </section>
    </div>
  )
}

export function ContactPage() {
  const { data } = usePublicConfig()
  const link = whatsappLink(data?.whatsappNumber ?? null, 'عايز أستفسر عن شنط الدعاية من Fox Plast')

  return (
    <div className="bg-bone text-coal">
      <PageIntro eyebrow="Get in touch" title="ابعتلنا المقاس والكمية.">
        أسرع طريقة لعرض سعر هي واتساب: ابعت المقاس، الكمية، ونوع الخامة، وهنرد عليك.
      </PageIntro>

      <section className="mx-auto grid max-w-[1400px] gap-10 px-4 py-14 sm:px-6 lg:grid-cols-[1.2fr_0.8fr] lg:gap-16 lg:py-20">
        <div>
          <h2 className="text-2xl font-bold">واتساب المصنع</h2>
          {link ? (
            <a
              href={link}
              target="_blank"
              rel="noreferrer"
              className="mt-5 inline-flex min-h-13 items-center gap-3 bg-[#25D366] px-7 text-xs font-semibold uppercase tracking-[0.14em] text-[#052e16] transition-colors hover:bg-[#1fbe5b]"
            >
              <span className="h-2 w-2 rounded-full bg-[#052e16]" aria-hidden />
              افتح محادثة واتساب
            </a>
          ) : (
            <p className="mt-3 text-sm text-coal/50">TODO(client): رقم واتساب المصنع.</p>
          )}

          <div className="mt-10 border-t border-sand pt-6">
            <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-kraft-700">
              ابعت معاك
            </p>
            <ul className="mt-4 space-y-2 text-sm text-coal/60">
              <li>— المقاس المطلوب بالسنتيمتر</li>
              <li>— الكمية التقريبية</li>
              <li>— نوع الخامة أو صورة مرجعية</li>
              <li>— اللوجو بصيغة PNG أو AI إن وجد</li>
            </ul>
          </div>
        </div>

        <div className="border border-sand p-6">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-kraft-700">
            بيانات المصنع
          </p>
          <dl className="mt-4 space-y-4 text-sm">
            <div>
              <dt className="text-xs text-coal/40">الموقع</dt>
              <dd className="mt-1">الإسكندرية، مصر</dd>
              <dd className="mt-1 text-xs text-coal/40">TODO(client): العنوان بالتفصيل</dd>
            </div>
            <div>
              <dt className="text-xs text-coal/40">ساعات العمل</dt>
              <dd className="mt-1">TODO(client): ساعات العمل</dd>
            </div>
            <div>
              <dt className="text-xs text-coal/40">التوصيل</dt>
              <dd className="mt-1">TODO(client): نطاق التوصيل والمدد</dd>
            </div>
            <div>
              <dt className="text-xs text-coal/40">فيسبوك</dt>
              <dd className="mt-1">
                <a
                  href="https://www.facebook.com/p/Fox-Plast-100076493018855"
                  target="_blank"
                  rel="noreferrer"
                  className="text-coal underline underline-offset-4"
                >
                  Fox Plast | Alexandria ↗
                </a>
              </dd>
            </div>
          </dl>
        </div>
      </section>
    </div>
  )
}

export function PrivacyPage() {
  return (
    <div className="bg-bone text-coal">
      <PageIntro eyebrow="Privacy" title="سياسة الخصوصية">
        بنستخدم بيانات الطلب (الاسم، الرقم، العنوان) بس لتنفيذ الطلب والتواصل معاك.
        مش بنشاركها مع أي طرف تالت غير خدمة التوصيل.
      </PageIntro>

      <section className="mx-auto max-w-[1400px] px-4 py-12 sm:px-6 lg:py-16">
        <div className="grid gap-8 lg:grid-cols-[0.45fr_1fr] lg:gap-16">
          <p className="text-[10px] font-semibold uppercase tracking-[0.24em] text-kraft-700">
            Fox Plast — Privacy
          </p>
          <div className="max-w-[68ch] space-y-8 text-sm leading-8 text-coal/60">
            <div>
              <h2 className="text-lg font-bold text-coal">البيانات اللي بنحفظها</h2>
              <p className="mt-2">
                اسمك، رقم الموبايل، المحافظة والعنوان، وتفاصيل الطلب. بيانات الدفع بتتأكد
                يدويًا عن طريق إثبات التحويل، ومش بنحفظ أرقام كروت.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-coal">مدة الاحتفاظ</h2>
              <p className="mt-2">
                بنحتفظ ببيانات الطلب للمراجعة والمتابعة. لو عايز نحذف بياناتك، كلمنا على
                واتساب وهنراجع الطلب.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-coal">ملفات تعريف الارتباط</h2>
              <p className="mt-2">
                الموقع بيحفظ سلة الطلب على جهازك عشان تفضل موجودة لو رجعت تاني.
              </p>
            </div>
            <div>
              <h2 className="text-lg font-bold text-coal">تواصل</h2>
              <p className="mt-2">
                لأي استفسار عن الخصوصية، استخدم صفحة{' '}
                <Link to="/contact" className="text-coal underline underline-offset-4">
                  اتصل بنا
                </Link>
                .
              </p>
            </div>
          </div>
        </div>
      </section>
    </div>
  )
}
