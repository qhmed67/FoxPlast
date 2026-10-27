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
  items: NotifyItem[]
  subtotalPiasters: number
  depositPiasters: number
  createdAt: string
}

function money(piasters: number): string {
  return `${(piasters / 100).toLocaleString('en-US')} ج.م`
}

/** Sends the new-order message to every configured staff chat. Never throws. */
export async function notifyNewOrder(order: NotifyOrder): Promise<boolean> {
  const token = Deno.env.get('TELEGRAM_BOT_TOKEN')
  const chats = (Deno.env.get('TELEGRAM_STAFF_CHAT_ID') ?? '')
    .split(',')
    .map((chat) => chat.trim())
    .filter(Boolean)

  if (!token || chats.length === 0) {
    console.warn('[notify] TELEGRAM_BOT_TOKEN or TELEGRAM_STAFF_CHAT_ID missing; skipped')
    return false
  }

  const lines = [
    `🧾 طلب جديد  <b>${escapeHtml(order.code)}</b>`,
    `👤 ${escapeHtml(order.name)} — <code>${escapeHtml(order.phone)}</code>`,
    `📍 ${escapeHtml(order.governorate)}`,
    '────────────',
    ...order.items.map(
      (item) =>
        `${item.qty} × ${escapeHtml(item.name)}${item.color ? ` (${escapeHtml(item.color)})` : ''}`,
    ),
    '────────────',
    `الإجمالي: <b>${money(order.subtotalPiasters)}</b>`,
    `العربون المطلوب: <b>${money(order.depositPiasters)}</b>`,
    `🕒 ${escapeHtml(order.createdAt)}`,
  ]

  const text = lines.join('\n')

  const results = await Promise.all(
    chats.map(async (chatId) => {
      try {
        const response = await fetch(`https://api.telegram.org/bot${token}/sendMessage`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            chat_id: chatId,
            text,
            parse_mode: 'HTML',
            disable_web_page_preview: true,
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
