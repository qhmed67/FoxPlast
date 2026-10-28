import { createClient } from 'npm:@supabase/supabase-js@^2'
import { z } from 'npm:zod@^4'
import { corsHeaders } from '../_shared/cors.ts'
import {
  clientIp,
  json,
  randomOrderCode,
  randomToken,
  sha256Hex,
} from '../_shared/http.ts'
import { depositFor, unitPriceFor, type Tier } from '../_shared/pricing.ts'
import { notifyNewOrder } from '../_shared/telegram.ts'

const admin = createClient(
  Deno.env.get('SUPABASE_URL') ?? '',
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
  { auth: { persistSession: false } },
)

const itemSchema = z
  .object({
    slug: z.string().min(1).max(120),
    color: z.string().max(40).nullable().optional(),
    qty: z.number().int().positive().max(100_000),
  })
  .strict()

const bodySchema = z
  .object({
    idempotency_key: z.string().uuid(),
    customer: z
      .object({
        name: z.string().trim().min(2).max(80),
        phone: z.string().regex(/^01[0125][0-9]{8}$/),
        governorate: z.string().trim().min(1).max(80),
        address: z.string().trim().max(300).optional(),
        notes: z.string().trim().max(500).optional(),
      })
      .strict(),
    items: z.array(itemSchema).min(1).max(20),
    turnstile_token: z.string().max(2048).nullable().optional(),
    utm: z.record(z.string(), z.string().max(120)).optional(),
    website: z.string().max(0).optional(),
  })
  .strict()

type ProductRow = {
  id: string
  slug: string
  name_ar: string
  min_qty: number
  active: boolean
  price_tiers: Tier[] | null
}

type ExistingOrder = {
  id: string
  code: string
  public_token: string
  status: string
  subtotal_piasters: number
  deposit_piasters: number
  expires_at: string | null
  order_items: {
    product_name: string
    variant: { color?: string | null } | null
    qty: number
    unit_price_piasters: number
  }[]
}

function ticketFromExisting(order: ExistingOrder) {
  return {
    code: order.code,
    token: order.public_token,
    status: order.status,
    subtotalPiasters: order.subtotal_piasters,
    depositPiasters: order.deposit_piasters,
    expiresAt: order.expires_at,
    items: order.order_items.map((item) => ({
      name: item.product_name,
      color: item.variant?.color ?? null,
      qty: item.qty,
      unitPricePiasters: item.unit_price_piasters,
    })),
  }
}

async function verifyTurnstile(token: string | null | undefined, ip: string): Promise<boolean> {
  const secret = Deno.env.get('TURNSTILE_SECRET')
  if (!secret) {
    // No secret configured (local/dev): skip. Production must set it.
    return true
  }
  if (!token) return false

  try {
    const response = await fetch('https://challenges.cloudflare.com/turnstile/v0/siteverify', {
      method: 'POST',
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      body: new URLSearchParams({ secret, response: token, remoteip: ip }),
      signal: AbortSignal.timeout(10_000),
    })
    if (!response.ok) return false
    const result = (await response.json()) as { success?: boolean }
    return result.success === true
  } catch {
    return false
  }
}

Deno.serve(async (req) => {
  const cors = corsHeaders(req)

  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: cors })
  }
  if (req.method !== 'POST') {
    return json({ error: 'method_not_allowed' }, 405, cors)
  }
  if (Number(req.headers.get('content-length') ?? '0') > 32_768) {
    return json({ error: 'body_too_large' }, 413, cors)
  }

  try {
    const parsed = bodySchema.safeParse(await req.json())
    if (!parsed.success) {
      return json(
        {
          error: 'invalid_input',
          fields: parsed.error.issues.map((issue) => issue.path.join('.')),
        },
        400,
        cors,
      )
    }

    const body = parsed.data
    if (body.website) {
      return json({ error: 'invalid_input' }, 400, cors)
    }

    const ip = clientIp(req)
    const turnstileOk = await verifyTurnstile(body.turnstile_token, ip)
    if (!turnstileOk) {
      return json({ error: 'turnstile_failed' }, 403, cors)
    }

    // Idempotency: a retry returns the original ticket instead of a second order.
    const { data: existing } = await admin
      .from('orders')
      .select(
        'id,code,public_token,status,subtotal_piasters,deposit_piasters,expires_at,order_items(product_name,variant,qty,unit_price_piasters)',
      )
      .eq('idempotency_key', body.idempotency_key)
      .maybeSingle()

    if (existing) {
      return json(ticketFromExisting(existing as ExistingOrder), 200, cors)
    }

    // Fixed-window rate limit: 5 orders per IP hash per hour.
    const salt = Deno.env.get('IP_HASH_SALT') ?? 'dev-salt'
    const ipHash = await sha256Hex(`${salt}:${ip}`)
    const windowStart = new Date(Math.floor(Date.now() / 3_600_000) * 3_600_000).toISOString()
    const { data: hits, error: rateError } = await admin.rpc('bump_rate_limit', {
      p_key: `create-order:${ipHash}`,
      p_window_start: windowStart,
    })
    if (rateError) {
      console.error('[create-order] rate limit failed', rateError.message)
      return json({ error: 'server_error' }, 500, cors)
    }
    if (typeof hits === 'number' && hits > 5) {
      return json({ error: 'rate_limited' }, 429, cors)
    }

    // Server-side pricing: never trust client totals.
    const slugs = [...new Set(body.items.map((item) => item.slug))]
    const { data: products, error: productError } = await admin
      .from('products')
      .select('id,slug,name_ar,min_qty,active,price_tiers(min_qty,unit_price_piasters)')
      .in('slug', slugs)

    if (productError) {
      console.error('[create-order] products failed', productError.message)
      return json({ error: 'server_error' }, 500, cors)
    }

    const bySlug = new Map((products as ProductRow[] | null ?? []).map((p) => [p.slug, p]))
    const priced: {
      product_id: string
      slug: string
      name: string
      color: string | null
      qty: number
      unit_price_piasters: number
    }[] = []

    for (const item of body.items) {
      const product = bySlug.get(item.slug)
      if (!product) return json({ error: 'unknown_item', slug: item.slug }, 400, cors)
      if (!product.active) return json({ error: 'inactive_item', slug: item.slug }, 400, cors)
      if (item.qty < product.min_qty) {
        return json({ error: 'min_qty', slug: item.slug, minQty: product.min_qty }, 400, cors)
      }
      const unitPrice = unitPriceFor(product.price_tiers ?? [], item.qty)
      if (unitPrice === null) {
        return json({ error: 'no_price', slug: item.slug }, 400, cors)
      }
      priced.push({
        product_id: product.id,
        slug: product.slug,
        name: product.name_ar,
        color: item.color ?? null,
        qty: item.qty,
        unit_price_piasters: unitPrice,
      })
    }

    const subtotal = priced.reduce((sum, item) => sum + item.qty * item.unit_price_piasters, 0)

    const { data: configRows } = await admin
      .from('app_config')
      .select('key,value')
      .in('key', ['deposit_percent', 'order_expiry_hours', 'requires_manual_quote'])

    const config = new Map((configRows ?? []).map((row) => [row.key as string, row.value]))
    const depositPercent = typeof config.get('deposit_percent') === 'number' ? config.get('deposit_percent') as number : 30
    const expiryHours = typeof config.get('order_expiry_hours') === 'number' ? config.get('order_expiry_hours') as number : 72
    const requiresManualQuote = config.get('requires_manual_quote') === true

    const deposit = depositFor(subtotal, depositPercent)
    const status = requiresManualQuote ? 'submitted' : 'awaiting_payment'
    const expiresAt = new Date(Date.now() + expiryHours * 3_600_000).toISOString()
    const createdAt = new Date().toISOString()

    let order: {
      id: string
      code: string
      public_token: string
      status: string
      subtotal_piasters: number
      deposit_piasters: number
      expires_at: string | null
    } | null = null

    for (let attempt = 0; attempt < 5 && !order; attempt += 1) {
      const { data, error } = await admin
        .from('orders')
        .insert({
          code: `FP-${randomOrderCode()}`,
          public_token: randomToken(),
          status,
          customer_name: body.customer.name,
          phone: body.customer.phone,
          governorate: body.customer.governorate,
          address: body.customer.address ?? null,
          notes: body.customer.notes ?? null,
          subtotal_piasters: subtotal,
          deposit_piasters: deposit,
          idempotency_key: body.idempotency_key,
          requires_manual_quote: requiresManualQuote,
          expires_at: expiresAt,
          utm: body.utm ?? {},
          ip_hash: ipHash,
        })
        .select('id,code,public_token,status,subtotal_piasters,deposit_piasters,expires_at')
        .single()

      if (!error) {
        order = data
        break
      }

      if (error.code === '23505' && error.message.includes('idempotency_key')) {
        const { data: raced } = await admin
          .from('orders')
          .select(
            'id,code,public_token,status,subtotal_piasters,deposit_piasters,expires_at,order_items(product_name,variant,qty,unit_price_piasters)',
          )
          .eq('idempotency_key', body.idempotency_key)
          .maybeSingle()
        if (raced) return json(ticketFromExisting(raced as ExistingOrder), 200, cors)
      }

      if (error.code !== '23505') {
        console.error('[create-order] insert failed', error.message)
        return json({ error: 'server_error' }, 500, cors)
      }
    }

    if (!order) {
      console.error('[create-order] could not allocate an order code')
      return json({ error: 'server_error' }, 500, cors)
    }

    const { error: itemsError } = await admin.from('order_items').insert(
      priced.map((item) => ({
        order_id: order!.id,
        product_id: item.product_id,
        product_name: item.name,
        variant: { color: item.color },
        qty: item.qty,
        unit_price_piasters: item.unit_price_piasters,
      })),
    )

    if (itemsError) {
      console.error('[create-order] items failed', itemsError.message)
      await admin.from('orders').delete().eq('id', order.id)
      return json({ error: 'server_error' }, 500, cors)
    }

    await admin.from('order_events').insert({
      order_id: order.id,
      from_status: null,
      to_status: status,
      actor: 'system',
      note: 'created via create-order',
    })

    const { data: staffRows } = await admin
      .from('telegram_staff')
      .select('telegram_user_id')
      .eq('active', true)

    const staffChats = (staffRows ?? [])
      .map((row) => row.telegram_user_id)
      .filter((id): id is number => typeof id === 'number')
      .map(String)

    await notifyNewOrder(
      {
        code: order.code,
        name: body.customer.name,
        phone: body.customer.phone,
        governorate: body.customer.governorate,
        items: priced.map((item) => ({ name: item.name, color: item.color, qty: item.qty })),
        subtotalPiasters: subtotal,
        depositPiasters: deposit,
        createdAt,
      },
      staffChats,
    )

    return json(
      {
        code: order.code,
        token: order.public_token,
        status: order.status,
        subtotalPiasters: order.subtotal_piasters,
        depositPiasters: order.deposit_piasters,
        expiresAt: order.expires_at,
        items: priced.map((item) => ({
          name: item.name,
          color: item.color,
          qty: item.qty,
          unitPricePiasters: item.unit_price_piasters,
        })),
      },
      201,
      cors,
    )
  } catch (error) {
    // Log the message only; never log customer PII or the body.
    console.error('[create-order] unhandled', error instanceof Error ? error.message : 'unknown')
    return json({ error: 'server_error' }, 500, cors)
  }
})
