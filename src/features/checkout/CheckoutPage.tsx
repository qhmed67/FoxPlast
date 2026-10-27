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

const contactSchema = z.object({
  name: z.string().trim().min(2, 'اكتب اسمك بالكامل').max(80, 'الاسم طويل'),
  phone: z
    .string()
    .trim()
    .refine((value) => normalizePhone(value) !== null, 'اكتب رقم موبايل مصري صحيح'),
  governorate: z.string().min(1, 'اختار المحافظة'),
  address: z.string().trim().max(300, 'العنوان طويل').optional(),
  notes: z.string().trim().max(500, 'الملاحظات طويلة').optional(),
  website: z.string().max(0).optional(),
})

type ContactValues = z.infer<typeof contactSchema>

type Contact = {
  name: string
  phone: string
  governorate: string
  address?: string
  notes?: string
}

const STEPS = ['المنتجات', 'بياناتك', 'المراجعة'] as const

function StepIndicator({ step }: { step: number }) {
  return (
    <ol className="mb-6 flex items-center gap-2 text-xs" aria-label="خطوات الطلب">
      {STEPS.map((label, index) => {
        const number = index + 1
        const active = step === number
        const done = step > number
        return (
          <li key={label} className="flex flex-1 items-center gap-2">
            <span
              aria-current={active ? 'step' : undefined}
              className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full border ${
                active || done
                  ? 'border-secondary bg-secondary text-secondary-foreground'
                  : 'border-border text-muted-foreground'
              }`}
            >
              {done ? '✓' : number}
            </span>
            <span className={active ? 'font-semibold' : 'text-muted-foreground'}>{label}</span>
            {index < STEPS.length - 1 && <span className="h-px flex-1 bg-border" />}
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
      address: values.address?.trim() || undefined,
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
          turnstile_token: null,
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
    } finally {
      setSubmitting(false)
    }
  }

  if (order) {
    return (
      <section>
        <h1 className="mb-2 text-2xl font-bold">تم استلام طلبك</h1>
        <p className="mb-6 text-sm text-muted-foreground">{copy.waiting}</p>
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
        <p className="mx-auto mt-4 max-w-[360px] text-center text-xs text-muted-foreground">
          احفظ رقم الطلب. التتبع وصورة التحويل في الخطوة الجاية.
        </p>
      </section>
    )
  }

  if (items.length === 0) {
    return (
      <section>
        <h1 className="mb-4 text-2xl font-bold">بيانات الطلب</h1>
        <p className="text-muted-foreground">السلة فاضية. اختار منتج الأول.</p>
        <Link
          to="/catalog"
          className="mt-4 inline-block min-h-[48px] rounded-md bg-primary px-4 py-3 text-primary-foreground"
        >
          {copy.nav.catalog}
        </Link>
      </section>
    )
  }

  return (
    <section>
      <h1 className="mb-4 text-2xl font-bold">بيانات الطلب</h1>
      <StepIndicator step={step} />

      {step === 1 && (
        <div>
          <ul className="space-y-3">
            {items.map((item) => {
              const key = basketKey(item)
              return (
                <li key={key} className="rounded-lg border border-border bg-card p-4">
                  <div className="flex items-start justify-between gap-3">
                    <div>
                      <h2 className="font-semibold">{item.name}</h2>
                      <p className="text-sm text-muted-foreground">
                        {item.color ? `اللون: ${colorLabel(item.color)}` : 'لون واحد'}
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={() => remove(key)}
                      className="text-sm text-destructive underline underline-offset-4"
                    >
                      حذف
                    </button>
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => setQty(key, item.qty - 1)}
                        aria-label="تقليل الكمية"
                        className="h-11 w-11 rounded-md border border-border"
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
                        className="h-11 w-20 rounded-md border border-border bg-background text-center font-mono"
                        dir="ltr"
                      />
                      <button
                        type="button"
                        onClick={() => setQty(key, item.qty + 1)}
                        aria-label="زيادة الكمية"
                        className="h-11 w-11 rounded-md border border-border"
                      >
                        +
                      </button>
                    </div>
                    <Money piasters={itemSubtotal(item)} />
                  </div>
                </li>
              )
            })}
          </ul>
          <p className="mt-4 flex items-center justify-between text-lg font-semibold">
            <span>الإجمالي التقديري</span>
            <Money piasters={subtotalPiasters} />
          </p>
          <button
            type="button"
            onClick={() => setStep(2)}
            className="mt-4 w-full rounded-md bg-primary px-4 py-3 text-primary-foreground min-h-[48px]"
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
                className="h-12 w-full rounded-md border border-border bg-background px-3"
                aria-invalid={Boolean(form.formState.errors.name)}
                aria-describedby={form.formState.errors.name ? 'name-error' : undefined}
              />
              {form.formState.errors.name && (
                <p id="name-error" role="alert" className="mt-1 text-sm text-destructive">
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
                className="h-12 w-full rounded-md border border-border bg-background px-3 text-start font-mono"
                aria-invalid={Boolean(form.formState.errors.phone)}
                aria-describedby={form.formState.errors.phone ? 'phone-error' : undefined}
              />
              {form.formState.errors.phone && (
                <p id="phone-error" role="alert" className="mt-1 text-sm text-destructive">
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
                className="h-12 w-full rounded-md border border-border bg-background px-3"
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
                <p role="alert" className="mt-1 text-sm text-destructive">
                  {form.formState.errors.governorate.message}
                </p>
              )}
            </div>

            <div>
              <label htmlFor="address" className="mb-1 block text-sm font-semibold">
                العنوان <span className="text-muted-foreground">(اختياري)</span>
              </label>
              <input
                id="address"
                {...form.register('address')}
                autoComplete="street-address"
                className="h-12 w-full rounded-md border border-border bg-background px-3"
              />
            </div>

            <div>
              <label htmlFor="notes" className="mb-1 block text-sm font-semibold">
                ملاحظات <span className="text-muted-foreground">(اختياري)</span>
              </label>
              <textarea
                id="notes"
                {...form.register('notes')}
                rows={3}
                className="w-full rounded-md border border-border bg-background px-3 py-2"
              />
            </div>

            {/* Honeypot: hidden from people, tempting to bots. */}
            <div className="hidden" aria-hidden="true">
              <label htmlFor="website">Website</label>
              <input id="website" tabIndex={-1} autoComplete="off" {...form.register('website')} />
            </div>
          </div>

          <div className="mt-6 flex gap-3">
            <button
              type="button"
              onClick={() => setStep(1)}
              className="min-h-[48px] rounded-md border border-secondary px-4 py-3 text-secondary"
            >
              رجوع
            </button>
            <button
              type="submit"
              className="min-h-[48px] flex-1 rounded-md bg-primary px-4 py-3 text-primary-foreground"
            >
              التالي
            </button>
          </div>
        </form>
      )}

      {step === 3 && contact && (
        <div>
          <div className="rounded-lg border border-border bg-card p-4 text-sm">
            <p className="font-semibold">{contact.name}</p>
            <p className="font-mono [unicode-bidi:isolate]" dir="ltr">
              {contact.phone}
            </p>
            <p className="text-muted-foreground">
              {contact.governorate}
              {contact.address ? ` — ${contact.address}` : ''}
            </p>
            {contact.notes && <p className="mt-2 text-muted-foreground">{contact.notes}</p>}
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
            <div className="mb-4 rounded-md border border-destructive/40 bg-card p-3 text-sm" role="alert">
              <p>{copy.error}</p>
              {helpLink && (
                <a
                  href={helpLink}
                  target="_blank"
                  rel="noreferrer"
                  className="mt-2 inline-block text-secondary underline underline-offset-4"
                >
                  كلمنا واتساب
                </a>
              )}
            </div>
          )}

          <div className="flex gap-3">
            <button
              type="button"
              onClick={() => setStep(2)}
              className="min-h-[48px] rounded-md border border-secondary px-4 py-3 text-secondary"
            >
              رجوع
            </button>
            <button
              type="button"
              onClick={() => void submitOrder()}
              disabled={submitting}
              className="min-h-[48px] flex-1 rounded-md bg-primary px-4 py-3 text-primary-foreground disabled:opacity-60"
            >
              {submitting ? 'بنرسل…' : 'أكد الطلب'}
            </button>
          </div>
        </div>
      )}
    </section>
  )
}
