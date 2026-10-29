import { supabase } from '../../lib/supabase'
import type { AdminOrder, OrderStatus } from './types'

const ORDER_COLUMNS = [
  'id',
  'code',
  'status',
  'customer_name',
  'phone',
  'governorate',
  'address',
  'notes',
  'subtotal_piasters',
  'deposit_piasters',
  'requires_manual_quote',
  'expires_at',
  'created_at',
  'updated_at',
  'order_items(id,product_name,variant,qty,unit_price_piasters,line_total_piasters)',
  'order_events(id,from_status,to_status,actor,note,at)',
  'payment_proofs(id,file_path,status,amount_claimed_piasters,sender_hint,created_at)',
].join(',')

export async function fetchAdminOrders(): Promise<AdminOrder[]> {
  if (!supabase) throw new Error('Supabase is not configured')

  const { data, error } = await supabase
    .from('orders')
    .select(ORDER_COLUMNS)
    .order('created_at', { ascending: false })
    .limit(200)

  if (error) throw error
  return (data ?? []) as unknown as AdminOrder[]
}

export type TransitionResult = {
  ok?: boolean
  applied?: boolean
  status?: OrderStatus
  error?: string
  id?: string
}

export async function setOrderStatus(
  code: string,
  to: OrderStatus,
  note: string | null,
): Promise<TransitionResult> {
  if (!supabase) throw new Error('Supabase is not configured')

  const { data, error } = await supabase.rpc('admin_set_order_status', {
    p_code: code,
    p_to: to,
    p_note: note,
  })

  if (error) throw error
  return (data ?? {}) as TransitionResult
}

export async function signProof(filePath: string): Promise<string> {
  if (!supabase) throw new Error('Supabase is not configured')

  const { data, error } = await supabase.storage
    .from('payment-proofs')
    .createSignedUrl(filePath, 60 * 60)

  if (error || !data?.signedUrl) throw error ?? new Error('signed URL failed')
  return data.signedUrl
}

/**
 * Usernames log in through a deterministic admin address, so the owner never
 * has to type an email. A full email still works for anyone who prefers it.
 */
export function adminEmailFor(username: string): string {
  const value = username.trim().toLowerCase()
  return value.includes('@') ? value : `${value}@admin.foxplast.app`
}

export function whatsappUrl(phone: string, text: string): string {
  const digits = phone.replace(/\D/g, '')
  const international = digits.startsWith('20') ? digits : `20${digits.replace(/^0/, '')}`
  return `https://wa.me/${international}?text=${encodeURIComponent(text)}`
}
