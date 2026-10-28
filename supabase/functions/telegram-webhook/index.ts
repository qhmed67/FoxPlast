import { createClient } from 'npm:@supabase/supabase-js@^2'
import { json } from '../_shared/http.ts'
import { callTelegram } from '../_shared/telegram.ts'

// Staff buttons for the order state machine (docs/02 §1 and §3).
// Telegram calls this URL; every request must carry the secret set at setWebhook time.

const admin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false } },
)

type OrderStatus =
  | 'submitted'
  | 'quoted'
  | 'awaiting_payment'
  | 'proof_uploaded'
  | 'paid'
  | 'in_production'
  | 'ready'
  | 'delivered'
  | 'cancelled'
  | 'expired'

type CallbackQuery = {
  id: string
  from: { id: number; first_name?: string; username?: string }
  data?: string
  message?: {
    message_id: number
    chat: { id: number }
    text?: string
    caption?: string
    photo?: unknown[]
  }
}

type TelegramUpdate = { update_id: number; callback_query?: CallbackQuery }

const STATUS_LABEL: Record<OrderStatus, string> = {
  submitted: 'تم الاستلام',
  quoted: 'تم التسعير',
  awaiting_payment: 'في انتظار الدفع',
  proof_uploaded: 'بنراجع الدفع',
  paid: 'تم تأكيد الدفع',
  in_production: 'جاري التجهيز',
  ready: 'جاهز',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
  expired: 'منتهي',
}

const REJECT_REASONS: Record<string, string> = {
  amount: 'المبلغ مش مطابق للعربون',
  unclear: 'الصورة مش واضحة',
  fake: 'إيصال غير صالح',
}

type Button = { text: string; callback_data: string }

function keyboardFor(code: string, status: OrderStatus): { inline_keyboard: Button[][] } | undefined {
  const button = (action: string, text: string): Button => ({
    text,
    callback_data: `o:${code}:${action}`,
  })

  switch (status) {
    case 'proof_uploaded':
      return {
        inline_keyboard: [
          [button('confirm', '✅ تأكيد الدفع'), button('reject', '❌ رفض')],
        ],
      }
    case 'paid':
      return { inline_keyboard: [[button('produce', '🛠 بدء التجهيز')]] }
    case 'in_production':
      return { inline_keyboard: [[button('ready', '📦 جاهز')]] }
    case 'ready':
      return { inline_keyboard: [[button('deliver', '🚚 تم التسليم')]] }
    default:
      return undefined
  }
}

function rejectKeyboard(code: string): { inline_keyboard: Button[][] } {
  return {
    inline_keyboard: [
      ...Object.entries(REJECT_REASONS).map(([key, text]) => [
        { text, callback_data: `o:${code}:reason:${key}` },
      ]),
      [{ text: 'رجوع', callback_data: `o:${code}:back` }],
    ],
  }
}

async function isStaff(userId: number): Promise<{ allowed: boolean; name: string }> {
  const { data, error } = await admin
    .from('telegram_staff')
    .select('name,active')
    .eq('telegram_user_id', userId)
    .maybeSingle()

  if (!error && data) {
    return {
      allowed: data.active === true,
      name: typeof data.name === 'string' && data.name ? data.name : `tg:${userId}`,
    }
  }

  // Bootstrap before the allowlist table is seeded. Empty means "nobody", not "everybody".
  const envIds = (Deno.env.get('TELEGRAM_STAFF_IDS') ?? '')
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean)

  return { allowed: envIds.includes(String(userId)), name: `tg:${userId}` }
}

async function answer(id: string, text: string): Promise<void> {
  await callTelegram('answerCallbackQuery', { callback_query_id: id, text })
}

function statusLine(status: OrderStatus, actor: string): string {
  const at = new Intl.DateTimeFormat('ar-EG', {
    dateStyle: 'short',
    timeStyle: 'short',
    calendar: 'gregory',
    numberingSystem: 'latn',
    timeZone: 'Africa/Cairo',
  }).format(new Date())
  return `\n\n<b>${STATUS_LABEL[status]}</b> · ${actor} · ${at}`
}

async function editMessage(
  query: CallbackQuery,
  text: string,
  markup: { inline_keyboard: Button[][] } | undefined,
): Promise<void> {
  const message = query.message
  if (!message) return

  const payload: Record<string, unknown> = {
    chat_id: message.chat.id,
    message_id: message.message_id,
    // An empty keyboard explicitly removes the old buttons.
    reply_markup: markup ?? { inline_keyboard: [] },
  }

  if (Array.isArray(message.photo) && message.photo.length > 0) {
    await callTelegram('editMessageCaption', { ...payload, caption: text.slice(0, 1024) })
  } else {
    await callTelegram('editMessageText', { ...payload, text: text.slice(0, 4096) })
  }
}

Deno.serve(async (req) => {
  if (req.method !== 'POST') return json({ error: 'method_not_allowed' }, 405)

  const secret = Deno.env.get('TELEGRAM_WEBHOOK_SECRET')
  if (!secret || req.headers.get('x-telegram-bot-api-secret-token') !== secret) {
    return json({ error: 'unauthorized' }, 401)
  }

  let update: TelegramUpdate
  try {
    update = (await req.json()) as TelegramUpdate
  } catch {
    return json({ ok: true })
  }

  const query = update.callback_query
  if (!query?.data) {
    // Bootstrap: the first /start registers the sender as staff so the owner can
    // receive new orders and press status buttons. Later /start calls only greet
    // an already allow-listed account. Security: never register once staff exist.
    const message = (
      update as {
        message?: {
          chat: { id: number }
          from?: { id: number; first_name?: string; username?: string }
          text?: string
        }
      }
    ).message

    if (message?.text?.startsWith('/start')) {
      const id = message.from?.id ?? message.chat.id
      const name = message.from?.username || message.from?.first_name || `tg:${id}`

      const { data: existing, error: existingError } = await admin
        .from('telegram_staff')
        .select('telegram_user_id,active')
        .eq('telegram_user_id', id)
        .maybeSingle()

      if (!existingError && existing?.active) {
        await callTelegram('sendMessage', {
          chat_id: message.chat.id,
          text: 'أهلاً بيك تاني 👋\nحسابك متسجل بالفعل، وهتوصلك الطلبات الجديدة هنا.',
        })
        return json({ ok: true })
      }

      const { count, error: countError } = await admin
        .from('telegram_staff')
        .select('*', { count: 'exact', head: true })

      if (!countError && (count ?? 0) === 0) {
        const { error: insertError } = await admin.from('telegram_staff').insert({
          telegram_user_id: id,
          name,
          role: 'admin',
          active: true,
        })

        await callTelegram('sendMessage', {
          chat_id: message.chat.id,
          text: insertError
            ? 'حصل خطأ في التسجيل. جرّب /start تاني بعد شوية.'
            : '✅ تم تسجيلك كموظف.\nمن دلوقتي أي طلب جديد هيوصلك هنا، وتقدر تأكد الدفع وتغيّر حالة الطلب من الأزرار.',
        })
      } else {
        await callTelegram('sendMessage', {
          chat_id: message.chat.id,
          text: 'الحساب ده مش متسجل. كلّم صاحب المصنع عشان يضيفك لفريق العمل.',
        })
      }
    }
    return json({ ok: true })
  }

  const staff = await isStaff(query.from.id)
  if (!staff.allowed) {
    await answer(query.id, 'مش مسموح لك تغيّر حالة الطلب.')
    return json({ ok: true })
  }

  // o:<order code>:<action> — 19 bytes for the longest action, well under 64.
  const match = /^o:(FP-[A-Z0-9]{6}):(confirm|reject|back|produce|ready|deliver|reason:[a-z]+)$/.exec(
    query.data,
  )
  if (!match) {
    await answer(query.id, 'زر غير معروف.')
    return json({ ok: true })
  }

  const [, code, action] = match
  const base = query.message?.caption ?? query.message?.text ?? ''

  if (action === 'back') {
    const { data: current } = await admin
      .from('orders')
      .select('status')
      .eq('code', code)
      .maybeSingle()
    const status = (current?.status ?? 'proof_uploaded') as OrderStatus
    await editMessage(query, base, keyboardFor(code, status))
    await answer(query.id, 'رجعت للأزرار.')
    return json({ ok: true })
  }

  if (action === 'reject') {
    await editMessage(query, base, rejectKeyboard(code))
    await answer(query.id, 'اختار سبب الرفض.')
    return json({ ok: true })
  }

  const reasonKey = action.startsWith('reason:') ? action.slice('reason:'.length) : null
  const nextStatus: OrderStatus =
    action === 'confirm'
      ? 'paid'
      : reasonKey
        ? 'awaiting_payment'
        : action === 'produce'
          ? 'in_production'
          : action === 'ready'
            ? 'ready'
            : 'delivered'

  const note = reasonKey ? REJECT_REASONS[reasonKey] ?? 'مرفوض' : null

  const { data, error } = await admin.rpc('apply_order_transition', {
    p_code: code,
    p_to: nextStatus,
    p_actor: staff.name,
    p_note: note,
  })

  if (error) {
    console.error('[telegram-webhook] transition failed', error.message)
    await answer(query.id, 'حصل خطأ، جرّب تاني.')
    return json({ ok: true })
  }

  const result = data as { ok?: boolean; applied?: boolean; error?: string; status?: OrderStatus; id?: string }

  if (!result?.ok) {
    await answer(
      query.id,
      result?.error === 'not_found' ? 'الطلب مش موجود.' : 'الحالة اتغيّرت بالفعل.',
    )
    return json({ ok: true })
  }

  // Keep the proof row in sync with the decision.
  if (result.id && (action === 'confirm' || reasonKey)) {
    await admin
      .from('payment_proofs')
      .update(
        action === 'confirm'
          ? { status: 'accepted', reviewed_by: staff.name, reviewed_at: new Date().toISOString() }
          : { status: 'rejected', reject_reason: note, reviewed_by: staff.name, reviewed_at: new Date().toISOString() },
      )
      .eq('order_id', result.id)
      .eq('status', 'pending')
  }

  if (result.applied === false) {
    await answer(query.id, 'الحالة محدّثة بالفعل.')
    return json({ ok: true })
  }

  await editMessage(query, `${base}${statusLine(nextStatus, staff.name)}`, keyboardFor(code, nextStatus))
  await answer(query.id, `تم: ${STATUS_LABEL[nextStatus]}`)
  return json({ ok: true })
})
