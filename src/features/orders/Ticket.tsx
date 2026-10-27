import { useState } from 'react'
import { BrandMark } from '../../components/BrandLogo'
import { Money } from '../../components/Money'
import { copyText } from '../../lib/clipboard'
import { formatMoney } from '../../lib/money'
import type { PaymentMethod } from '../config/api'
import type { OrderStatus, TicketItem } from './types'

type TicketProps = {
  code: string | null
  items: TicketItem[]
  subtotalPiasters: number
  depositPiasters: number
  paymentMethods: PaymentMethod[]
  status?: OrderStatus
  expiresAt?: string | null
  businessHours?: string | null
  trackingUrl?: string | null
  preview?: boolean
}

function CopyButton({ value, label }: { value: string; label: string }) {
  const [copied, setCopied] = useState(false)
  return (
    <button
      type="button"
      onClick={async () => {
        const ok = await copyText(value)
        if (!ok) return
        setCopied(true)
        window.setTimeout(() => setCopied(false), 1600)
      }}
      className="rounded-md border border-kraft-200 px-2 py-1 text-xs text-ink-900"
      aria-label={`نسخ ${label}`}
    >
      {copied ? 'تم النسخ' : 'نسخ'}
    </button>
  )
}

function formatExpiry(value: string | null | undefined): string | null {
  if (!value) return null
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return null
  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    calendar: 'gregory',
    numberingSystem: 'latn',
  }).format(date)
}

export function Ticket({
  code,
  items,
  subtotalPiasters,
  depositPiasters,
  paymentMethods,
  status = 'awaiting_payment',
  expiresAt,
  businessHours,
  trackingUrl,
  preview = false,
}: TicketProps) {
  const expiry = formatExpiry(expiresAt)

  return (
    <div className="ticket-shadow mx-auto w-full max-w-[360px]">
      <article className="ticket-paper px-5 py-6 text-ink-900">
        <header className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <BrandMark size={30} />
            <div>
              <p className="text-sm font-bold leading-tight">Fox Plast</p>
              <p className="text-[11px] leading-tight text-kraft-700">تذكرة طلب</p>
            </div>
          </div>
          <div className="text-end">
            <p className="text-[11px] text-kraft-700">{preview ? 'معاينة' : 'رقم الطلب'}</p>
            <p className="font-mono text-sm font-bold [unicode-bidi:isolate]" dir="ltr">
              {code ?? '—'}
            </p>
          </div>
        </header>

        <div className="my-4 border-t border-dashed border-kraft-400" />

        <ul className="space-y-2 text-sm">
          {items.map((item, index) => (
            <li key={`${item.name}-${item.color ?? ''}-${index}`}>
              <div className="flex items-start justify-between gap-2">
                <span className="leading-snug">{item.name}</span>
                <span className="shrink-0 font-mono [unicode-bidi:isolate]" dir="ltr">
                  ×{item.qty}
                </span>
              </div>
              <div className="flex justify-between text-xs text-kraft-700">
                <span>{item.color ?? ''}</span>
                <Money piasters={item.unitPricePiasters} />
              </div>
            </li>
          ))}
        </ul>

        <div className="my-4 border-t border-dashed border-kraft-400" />

        <dl className="space-y-1 text-sm">
          <div className="flex justify-between">
            <dt className="text-kraft-700">الإجمالي</dt>
            <dd>
              <Money piasters={subtotalPiasters} />
            </dd>
          </div>
          <div className="flex justify-between text-base font-bold">
            <dt>العربون المطلوب</dt>
            <dd>
              <Money piasters={depositPiasters} />
            </dd>
          </div>
        </dl>

        <div className="my-4 border-t border-dashed border-kraft-400" />

        <section aria-labelledby="ticket-payment">
          <h2 id="ticket-payment" className="text-sm font-bold">
            الدفع
          </h2>
          {paymentMethods.length === 0 ? (
            <p className="mt-2 text-xs text-kraft-700">
              بيانات التحويل هتظهر هنا بعد تأكيد الطلب.
            </p>
          ) : (
            <ul className="mt-2 space-y-3">
              {paymentMethods.map((method) => (
                <li key={`${method.label}-${method.number}`} className="text-xs">
                  <p className="font-semibold">{method.label}</p>
                  <div className="mt-1 flex items-center justify-between gap-2">
                    <span className="font-mono [unicode-bidi:isolate]" dir="ltr">
                      {method.number}
                    </span>
                    <CopyButton value={method.number} label={method.label} />
                  </div>
                  {method.holder && <p className="text-kraft-700">{method.holder}</p>}
                  {method.note && <p className="text-kraft-700">{method.note}</p>}
                </li>
              ))}
            </ul>
          )}
          <div className="mt-3 flex items-center justify-between gap-2 text-xs">
            <span className="text-kraft-700">مبلغ العربون</span>
            <div className="flex items-center gap-2">
              <span className="font-mono [unicode-bidi:isolate]" dir="ltr">
                {formatMoney(depositPiasters)}
              </span>
              <CopyButton value={String(depositPiasters / 100)} label="مبلغ العربون" />
            </div>
          </div>
        </section>

        <div className="my-4 border-t border-dashed border-kraft-400" />

        <div className="flex items-end justify-between gap-3 text-xs text-kraft-700">
          <div>
            {expiry && (
              <p>
                محجوز حتى: <span className="font-mono [unicode-bidi:isolate]" dir="ltr">{expiry}</span>
              </p>
            )}
            {businessHours && <p>{businessHours}</p>}
            <p className="mt-1">الأسعار تقديرية حتى تأكيد الطلب.</p>
          </div>
          {trackingUrl && !preview && (
            <div
              className="flex h-16 w-16 shrink-0 items-center justify-center border border-kraft-400 text-[10px] text-kraft-700"
              aria-label="رمز QR للطلب"
            >
              QR
            </div>
          )}
        </div>

        {status === 'paid' && (
          <p className="mt-4 -rotate-6 border-2 border-green-600 px-3 py-1 text-center text-lg font-bold text-green-600">
            تم الدفع
          </p>
        )}
      </article>
    </div>
  )
}
