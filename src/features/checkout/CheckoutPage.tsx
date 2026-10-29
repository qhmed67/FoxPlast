import { useState } from 'react'
import { Link } from 'react-router'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Money } from '../../components/Money'
import { copy } from '../../lib/copy'
import { ceilDeposit } from '../../lib/money'
import { normalizePhone } from '../../lib/phone'
import { trackLead } from '../../lib/meta'
import { getUtm } from '../../lib/utm'
import { supabase } from '../../lib/supabase'
import { useBasket } from '../basket/context'
import { basketKey, itemSubtotal, tierFor } from '../basket/types'
import { colorLabel } from '../catalog/colors'
import { usePublicConfig, whatsappLink } from '../config/api'
import { Ticket } from '../orders/Ticket'
import type { CreateOrderResponse } from '../orders/types'
import { GOVERNORATES } from './governorates'
import { TurnstileWidget } from './TurnstileWidget'

const contactSchema = z.object({
  name: z.string().trim().min(2, 'اكتب اسمك بالكامل').max(80, 'الاسم طويل'),
  phone: z
    .string()
    .trim()
    .refine((value) => normalizePhone(value) !== null, 'اكتب رقم موبايل مصري صحيح'),
  governorate: z.string().min(1, 'اختار المحافظة'),
  address: z
    .string()
    .trim()
    .min(5, 'اكتب العنوان بالتفصيل: الشارع ورقم المبنى')
    .max(300, 'العنوان طويل'),
  notes: z.string().trim().max(500, 'الملاحظات طويلة').optional(),
  website: z.string().max(0).optional(),
})

type ContactValues = z.infer<typeof contactSchema>

type Contact = {
  name: string
  phone: string
  governorate: string
  address: string
  notes?: string
}

const STEPS = ['المنتجات', 'بياناتك', 'المراجعة'] as const

function StepIndicator({ step }: { step: number }) {
  return (
    <ol className="mb-8 flex items-center gap-2 text-xs" aria-label="خطوات الطلب">
      {STEPS.map((label, index) => {
        const number = index + 1
        const active = step === number
        const done = step > number
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              aria-current={active ? 'step' : undefined}
              className={`grid h-8 w-8 shrink-0 place-items-center border text-[11px] font-semibold transition-colors ${
                active
                  ? 'border-coal bg-coal text-bone'
                  : done
                    ? 'border-clay bg-clay text-white'
                    : 'border-sand bg-white text-coal/45'
              }`}
            >
              {done ? '✓' : number}
            </span>
            <span
              className={
                active
                  ? 'font-semibold text-coal'
                  : done
                    ? 'text-coal/70'
                    : 'text-coal/40'
              }
            >
              {label}
            </span>
            {index < STEPS.length - 1 && (
              <span className={`h-px flex-1 ${done ? 'bg-clay/40' : 'bg-sand'}`} />
            )}
          </li>
        )
      })}
    </ol>
  )
}

export default function CheckoutPage() {
  const { items, subtotalPiasters, setQty, remove, clear } = useBasket()
  const { data: config } = usePublicConfig()
  const [step, setStep] = useState(1)
  const [contact, setContact] = useState<Contact | null>(null)
  const [order, setOrder] = useState<CreateOrderResponse | null>(null)
  const [submitting, setSubmitting] = useState(false)
  const [submitError, setSubmitError] = useState<string | null>(null)
  const [turnstileToken, setTurnstileToken] = useState<string | null>(null)
  const [turnstileKey, setTurnstileKey] = useState(0)
  const turnstileSiteKey = import.meta.env.VITE_TURNSTILE_SITE_KEY as string | undefined
  // One key per order attempt: retries after a timeout must return the same order,
  // not create a second one (docs/02 §2.3).
  const [idempotencyKey, setIdempotencyKey] = useState<string | null>(null)

  const form = useForm<ContactValues>({
    resolver: zodResolver(contactSchema),
    defaultValues: { name: '', phone: '', governorate: '', address: '', notes: '', website: '' },
  })

  const depositPercent = config?.depositPercent ?? 30
  const depositPiasters = ceilDeposit(subtotalPiasters, depositPercent)
  const helpLink = whatsappLink(
    config?.whatsappNumber ?? null,
    'محتاج مساعدة في طلب من Fox Plast',
  )

  const ticketItems = items.map((item) => ({
    name: item.name,
    color: item.color ?? null,
    qty: item.qty,
    unitPricePiasters: tierFor(item)?.unitPricePiasters ?? 0,
  }))

  function onContact(values: ContactValues) {
    const phone = normalizePhone(values.phone)
    if (!phone) return
    // A fresh review step is a fresh attempt: a new key.
    setIdempotencyKey(crypto.randomUUID())
    setContact({
      name: values.name.trim(),
      phone,
      governorate: values.governorate,
      address: values.address.trim(),
      notes: values.notes?.trim() || undefined,
    })
    setStep(3)
  }

  async function submitOrder() {
    if (!contact || items.length === 0) return
    setSubmitting(true)
    setSubmitError(null)
    try {
      if (!supabase || !idempotencyKey) throw new Error('backend-not-configured')
      const { data, error } = await supabase.functions.invoke('create-order', {
        body: {
          idempotency_key: idempotencyKey,
          customer: contact,
          items: items.map((item) => ({
            slug: item.slug,
            color: item.color,
            qty: item.qty,
          })),
          turnstile_token: turnstileToken,
          utm: getUtm(),
        },
      })
      if (error) throw error
      if (!data || typeof data.code !== 'string') throw new Error('bad-response')
      setOrder(data as CreateOrderResponse)
      trackLead()
      setIdempotencyKey(null)
      clear()
    } catch (error) {
      setSubmitError(error instanceof Error ? error.message : String(error))
      // Turnstile tokens are single-use; remount the widget for the retry.
      if (turnstileSiteKey) {
        setTurnstileToken(null)
        setTurnstileKey((value) => value + 1)
      }
    } finally {
      setSubmitting(false)
    }
  }

  if (order) {
    return (
      <section className="mx-auto max-w-[820px] px-4 py-10 sm:px-6 lg:py-14">
        <header className="mb-7 border-b border-sand pb-5">
          <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-clay">
            Order received
          </p>
          <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">
            تم استلام طلبك
          </h1>
          <p className="mt-2 text-sm text-coal/55">{copy.waiting}</p>
        </header>
        <Ticket
          code={order.code}
          items={order.items}
          subtotalPiasters={order.subtotalPiasters}
          depositPiasters={order.depositPiasters}
          paymentMethods={config?.paymentMethods ?? []}
          status={order.status}
          expiresAt={order.expiresAt}
          businessHours={config?.businessHours}
          helpUrl={helpLink}
        />
        <p className="mx-auto mt-5 max-w-[360px] text-center text-xs leading-6 text-coal/45">
          احفظ رقم الطلب. التتبع وصورة التحويل في الخطوة الجاية.
        </p>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section className="mx-auto max-w-[1200px] px-4 py-12 sm:px-6 lg:py-16">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-clay">
          Checkout
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">بيانات الطلب</h1>
        <div className="mt-8 border border-sand bg-white p-8 sm:p-12">
          <p className="text-sm text-coal/55">السلة فاضية. اختار منتج الأول.</p>
          <Link
            to="/catalog"
            className="mt-6 inline-flex min-h-12 items-center bg-coal px-7 text-xs font-semibold uppercase tracking-[0.14em] text-bone transition-colors hover:bg-black"
          >
            {copy.nav.catalog}
          </Link>
        </div>
      </section>
    )
  }

  return (
    <section className="mx-auto max-w-[820px] px-4 py-10 sm:px-6 lg:py-14">
      <header className="mb-7">
        <p className="text-[10px] font-semibold uppercase tracking-[0.28em] text-clay">
          Checkout
        </p>
        <h1 className="mt-3 text-3xl font-bold tracking-[-0.02em] sm:text-4xl">بيانات الطلب</h1>
        <p className="mt-2 text-xs text-coal/50">{copy.waiting}</p>
      </header>
      <StepIndicator step={step} />

      {step === 1 && (
        <div>
          <ul className="space-y-3">
            {items.map((item) => {
              const key = basketKey(item)
              return (
                <li
                  key={key}
                  className="border border-sand bg-white p-5 transition-colors hover:border-coal/25 sm:p-6"
                >
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">{item.name}</h2>
                      <p className="mt-1 text-xs text-coal/50">
                        {item.color ? `اللون: ${colorLabel(item.color)}` : 'لون واحد'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(key)}
                      className="text-xs font-medium text-clay underline-offset-4 transition-opacity hover:underline"
                    >
                      حذف
                    </button>
                  </div>
                  <div className="mt-4 flex flex-wrap items-end justify-between gap-4 border-t border-sand/70 pt-4">
                    <div className="flex items-center">
                      <button
                        type="button"
                        onClick={() => setQty(key, item.qty - 1)}
                        aria-label="تقليل الكمية"
                        className="grid h-11 w-11 place-items-center border border-sand bg-bone/40 text-lg transition-colors hover:border-coal active:scale-95"
                      >
                        −
                      </button>
                      <input
                        type="number"
                        inputMode="numeric"
                        min={item.minQty}
                        value={item.qty}
                        onChange={(e) => setQty(key, Number(e.target.value))}
                        aria-label={`كمية ${item.name}`}
                        className="h-11 w-24 border-y border-sand bg-white text-center font-mono text-sm outline-none focus:border-coal"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setQty(key, item.qty + 1)}
                        aria-label="زيادة الكمية"
                        className="grid h-11 w-11 place-items-center border border-sand bg-bone/40 text-lg transition-colors hover:border-coal active:scale-95"
                      >
                        +
                      </button>
                    </div>
                    <span className="text-lg font-semibold">
                      <Money piasters={itemSubtotal(item)} />
                    </span>
                  </div>
                </li>
              )
            })}
          </ul>
          <div className="mt-5 flex items-center justify-between border border-sand bg-white px-5 py-4">
            <span className="text-sm text-coal/55">الإجمالي التقديري</span>
            <span className="text-xl font-bold">
              <Money piasters={subtotalPiasters} />
            </span>
          </div>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="mt-4 min-h-12 w-full bg-coal px-4 text-xs font-semibold uppercase tracking-[0.14em] text-bone transition-colors hover:bg-black active:scale-[0.99]"
          >
            التالي
          </button>
        </div>
      )}

      {step === 2 && (
        <form onSubmit={form.handleSubmit(onContact)} noValidate>
          <div className="space-y-4">
            <div>
              <label htmlFor="name" className="mb-1 block text-sm font-semibold">
                الاسم
              </label>
              <input
                id="name"
                {...form.register('name')}
                autoComplete="name"
                className="h-12 w-full border border-sand bg-white px-3 text-sm outline-none transition-colors focus:border-coal"
                aria-invalid={Boolean(form.formState.errors.name)}
                aria-describedby={form.formState.errors.name ? 'name-error' : undefined}
              />
              {form.formState.errors.name && (
                <p id="name-error" role="alert" className="mt-1 text-xs font-medium text-clay">
                  {form.formState.errors.name.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="phone" className="mb-1 block text-sm font-semibold">
                الموبايل
              </label>
              <input
                id="phone"
                {...form.register('phone')}
                type="tel"
                inputMode="tel"
                autoComplete="tel"
                placeholder="01xxxxxxxxx"
                dir="ltr"
                className="h-12 w-full border border-sand bg-white px-3 text-start font-mono text-sm outline-none transition-colors focus:border-coal"
                aria-invalid={Boolean(form.formState.errors.phone)}
                aria-describedby={form.formState.errors.phone ? 'phone-error' : undefined}
              />
              {form.formState.errors.phone && (
                <p id="phone-error" role="alert" className="mt-1 text-xs font-medium text-clay">
                  {form.formState.errors.phone.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="governorate" className="mb-1 block text-sm font-semibold">
                المحافظة
              </label>
              <select
                id="governorate"
                {...form.register('governorate')}
                className="h-12 w-full border border-sand bg-white px-3 text-sm outline-none transition-colors focus:border-coal"
                aria-invalid={Boolean(form.formState.errors.governorate)}
              >
                <option value="">اختار المحافظة</option>
                {GOVERNORATES.map((governorate) => (
                  <option key={governorate} value={governorate}>
                    {governorate}
                  </option>
                ))}
              </select>
              {form.formState.errors.governorate && (
                <p role="alert" className="mt-1 text-xs font-medium text-clay">
                  {form.formState.errors.governorate.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="mb-1 block text-sm font-semibold">
                العنوان{' '}
                <span className="text-xs font-normal text-coal/45">
                  (الشارع، رقم المبنى، علامة مميزة)
                </span>
              </label>
              <input
                id="address"
                {...form.register('address')}
                autoComplete="street-address"
                required
                className="h-12 w-full border border-sand bg-white px-3 text-sm outline-none transition-colors focus:border-coal"
              />
              {form.formState.errors.address && (
                <p role="alert" className="mt-1 text-xs font-medium text-clay">
                  {form.formState.errors.address.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="notes" className="mb-1 block text-sm font-semibold">
                ملاحظات <span className="text-coal/45">(اختياري)</span>
              </label>
              <textarea
                id="notes"
                {...form.register('notes')}
                rows={3}
                className="w-full border border-sand bg-white px-3 py-2 text-sm outline-none transition-colors focus:border-coal"
              />
            </div>

            {/* Honeypot: hidden from people, tempting to bots. */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" tabIndex={-1} autoComplete="off" {...form.register('website')} />
            </div>
          </div>

          <div className="mt-7 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="min-h-12 border border-sand bg-white px-5 text-xs font-semibold uppercase tracking-[0.14em] text-coal/70 transition-colors hover:border-coal hover:text-coal active:scale-[0.99]"
            >
              رجوع
            </button>
            <button
              type="submit"
              className="min-h-12 flex-1 bg-coal px-5 text-xs font-semibold uppercase tracking-[0.14em] text-bone transition-colors hover:bg-black active:scale-[0.99]"
            >
              التالي
            </button>
          </div>
        </form>
      )}

      {step === 3 && contact && (
        <div>
          <div className="border border-sand bg-white p-5 text-sm">
            <p className="font-semibold">{contact.name}</p>
            <p className="mt-1 font-mono text-xs text-coal/70 [unicode-bidi:isolate]" dir="ltr">
              {contact.phone}
            </p>
            <p className="mt-1 text-coal/55">
              {contact.governorate}
              {contact.address ? ` — ${contact.address}` : ''}
            </p>
            {contact.notes && <p className="mt-2 border-s-2 border-clay/60 bg-bone/60 px-3 py-2 text-coal/70">{contact.notes}</p>}
          </div>

          <div className="my-6">
            <Ticket
              code={null}
              items={ticketItems}
              subtotalPiasters={subtotalPiasters}
              depositPiasters={depositPiasters}
              paymentMethods={config?.paymentMethods ?? []}
              businessHours={config?.businessHours}
              helpUrl={helpLink}
              preview
            />
          </div>

          {submitError && (
            <div className="mb-4 border border-clay/40 bg-white p-4 text-sm" role="alert">
              <p>{copy.error}</p>
              {helpLink && (
                <a
                  href={helpLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-clay underline underline-offset-4"
                >
                  كلمنا واتساب
                </a>
              )}
            </div>
          )}

          <TurnstileWidget key={turnstileKey} siteKey={turnstileSiteKey} onToken={setTurnstileToken} />

          <div className="mt-2 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="min-h-12 border border-sand bg-white px-5 text-xs font-semibold uppercase tracking-[0.14em] text-coal/70 transition-colors hover:border-coal hover:text-coal active:scale-[0.99]"
            >
              رجوع
            </button>
            <button
              type="button"
              onClick={() => void submitOrder()}
              disabled={submitting || (Boolean(turnstileSiteKey) && !turnstileToken)}
              className="min-h-12 flex-1 bg-coal px-5 text-xs font-semibold uppercase tracking-[0.14em] text-bone transition-colors hover:bg-black active:scale-[0.99] disabled:opacity-50"
            >
              {submitting ? 'بنرسل…' : 'أكد الطلب'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
