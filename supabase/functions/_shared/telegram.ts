import { escapeHtml } from './http.ts'

export type NotifyItem = {
  name: string
  color: string | null
  qty: number
}

export type NotifyOrder = {
  code: string
  name: string
  phone: string
  governorate: string
  address: string
  items: NotifyItem[]
  subtotalPiasters: number
  depositPiasters: number
  createdAt: string
}

function money(piasters: number): string {
  return `${(piasters / 100).toLocaleString('en-US')} ج.م`
}

function orderTime(value: string): string {
  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return ''
  return new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'medium',
    timeStyle: 'short',
    calendar: 'gregory',
    numberingSystem: 'latn',
    timeZone: 'Africa/Cairo',
  }).format(date)
}

/** Egyptian mobile (01xxxxxxxxx) → international digits for wa.me. */
function whatsappNumber(phone: string): string {
  const digits = phone.replace(/\D/g, '')
  return digits.startsWith('20') ? digits : `20${digits.replace(/^0/, '')}`
}

type TelegramResult<T> = { ok: true; result: T } | { ok: false; description: string }

/** Thin Bot API call. Returns ok:false instead of throwing so callers can answer Telegram. */
export async function callTelegram<T = unknown>(
  method: string,
  payload: Record<string, unknown>,
): Promise<TelegramResult<T>> {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
  if (!token) return { ok: false, description: 'TELEGRAM_BOT_TOKEN missing' }

  try {
    const response = await fetch(`https://api.telegram.org/bot${token}/${method}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload),
      signal: AbortSignal.timeout(5_000),
    })
    const body = (await response.json().catch(() => ({}))) as {
      ok?: boolean
      result?: T
      description?: string
    }
    if (!response.ok || body.ok !== true) {
      return { ok: false, description: body.description ?? `HTTP ${response.status}` }
    }
    return { ok: true, result: body.result as T }
  } catch (error) {
    return {
      ok: false,
      description: error instanceof Error ? error.message : 'telegram request failed',
    }
  }
}

/**
 * Sends the new-order message to every staff chat. Never throws.
 * `staffChats` comes from the `telegram_staff` allowlist; the env var stays as
 * a manual fallback for a chat the bot cannot DM yet.
 *
 * The card is deliberately compact: customer first, then the order, then money.
 * Times are formatted in Cairo local time — never a raw ISO string.
 */
export async function notifyNewOrder(
  order: NotifyOrder,
  staffChats: string[] = [],
): Promise<boolean> {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const chats = [
    ...staffChats,
    ...(Deno.env.get('TELEGRAM_STAFF_CHAT_ID') ?? '').split(','),
  ]
    .map((chat) => chat.trim())
    .filter(Boolean)
  const uniqueChats = [...new Set(chats)]

  if (!token || uniqueChats.length === 0) {
    console.warn('[notify] TELEGRAM_BOT_TOKEN or a staff chat id is missing; skipped')
    return false
  }

  const when = orderTime(order.createdAt)
  const items = order.items
    .map(
      (item) =>
        `• <b>${item.qty}×</b> ${escapeHtml(item.name)}${
          item.color ? ` (${escapeHtml(item.color)})` : ''
        }`,
    )
    .join('\n')

  const lines = [
    '🧾 <b>طلب جديد</b>',
    `<code>${escapeHtml(order.code)}</code>`,
    '',
    '👤 <b>العميل</b>',
    escapeHtml(order.name),
    `<code>${escapeHtml(order.phone)}</code>`,
    `📍 ${escapeHtml(order.governorate)}`,
    `<blockquote>🏠 ${escapeHtml(order.address)}</blockquote>`,
    '',
    '📦 <b>الأصناف</b>',
    items,
    '',
    `الإجمالي  <b>${money(order.subtotalPiasters)}</b>`,
    `العربون المطلوب  <b>${money(order.depositPiasters)}</b>`,
    when ? `\n🕒 ${escapeHtml(when)}` : '',
  ].filter((line) => line !== '')

  const text = lines.join('\n')

  const results = await Promise.all(
    uniqueChats.map(async (chatId) => {
      try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
            reply_markup: {
              inline_keyboard: [
                [
                  {
                    text: '💬 تواصل مع العميل',
                    url: `https://wa.me/${whatsappNumber(order.phone)}?text=${encodeURIComponent(
                      `مرحباً ${order.name}، بخصوص طلبك ${order.code} من Fox Plast — عايزين نأكد الدفع والعنوان.`,
                    )}`,
                  },
                ],
                [
                  {
                    text: '🦊 لوحة الإدارة',
                    url: 'https://fox-plast.vercel.app/admin',
                  },
                ],
              ],
            },
          }),
          signal: AbortSignal.timeout(5_000),
        })
        if (!response.ok) {
          console.error('[notify] telegram responded', response.status)
          return false
        }
        return true
      } catch (error) {
        console.error('[notify] telegram failed', error instanceof Error ? error.message : 'unknown')
        return false
      }
    }),
  )

  return results.some(Boolean)
}
