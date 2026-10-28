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
 * `staffChats` comes from the `telegram_staff` allowlist (filled by /start);
 * the env var stays as a manual fallback for a chat the bot cannot DM yet.
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
