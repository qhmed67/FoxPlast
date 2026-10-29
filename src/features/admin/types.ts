export type OrderStatus =
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

export const STATUS_LABELS: Record<OrderStatus, string> = {
  submitted: 'تم الاستلام',
  quoted: 'تم التسعير',
  awaiting_payment: 'بانتظار الدفع',
  proof_uploaded: 'مراجعة الدفع',
  paid: 'تم تأكيد الدفع',
  in_production: 'جاري التجهيز',
  ready: 'جاهز',
  delivered: 'تم التسليم',
  cancelled: 'ملغي',
  expired: 'منتهي',
}

export type StatusAction = { to: OrderStatus; label: string }

/**
 * Mirrors the state machine in `apply_order_transition` (0002_orders.sql), so the
 * buttons the admin sees are exactly the moves the database will accept.
 */
export const NEXT_ACTIONS: Partial<Record<OrderStatus, StatusAction[]>> = {
  submitted: [
    { to: 'quoted', label: 'تم التسعير' },
    { to: 'awaiting_payment', label: 'في انتظار الدفع' },
    { to: 'cancelled', label: 'إلغاء' },
  ],
  quoted: [
    { to: 'awaiting_payment', label: 'في انتظار الدفع' },
    { to: 'cancelled', label: 'إلغاء' },
  ],
  awaiting_payment: [
    { to: 'proof_uploaded', label: 'وصل إيصال' },
    { to: 'expired', label: 'منتهي' },
    { to: 'cancelled', label: 'إلغاء' },
  ],
  proof_uploaded: [
    { to: 'paid', label: 'تأكيد الدفع' },
    { to: 'awaiting_payment', label: 'طلب إعادة الإيصال' },
    { to: 'cancelled', label: 'إلغاء' },
  ],
  paid: [
    { to: 'in_production', label: 'بدء التجهيز' },
    { to: 'cancelled', label: 'إلغاء' },
  ],
  in_production: [
    { to: 'ready', label: 'جاهز' },
    { to: 'cancelled', label: 'إلغاء' },
  ],
  ready: [{ to: 'delivered', label: 'تم التسليم' }],
}

export const STATUS_STYLES: Record<OrderStatus, string> = {
  submitted: 'bg-coal/10 text-coal',
  quoted: 'bg-amber-100 text-amber-800',
  awaiting_payment: 'bg-orange-100 text-orange-800',
  proof_uploaded: 'bg-sky-100 text-sky-800',
  paid: 'bg-emerald-100 text-emerald-800',
  in_production: 'bg-indigo-100 text-indigo-800',
  ready: 'bg-teal-100 text-teal-800',
  delivered: 'bg-coal/10 text-coal/70',
  cancelled: 'bg-rose-100 text-rose-800',
  expired: 'bg-coal/10 text-coal/50',
}

export type AdminOrderItem = {
  id: string
  product_name: string
  variant: { color?: string | null } | null
  qty: number
  unit_price_piasters: number
  line_total_piasters: number | null
}

export type AdminOrderEvent = {
  id: number
  from_status: OrderStatus | null
  to_status: OrderStatus
  actor: string
  note: string | null
  at: string
}

export type AdminProof = {
  id: string
  file_path: string
  status: 'pending' | 'accepted' | 'rejected'
  amount_claimed_piasters: number | null
  sender_hint: string | null
  created_at: string
}

export type AdminOrder = {
  id: string
  code: string
  status: OrderStatus
  customer_name: string
  phone: string
  governorate: string
  address: string | null
  notes: string | null
  subtotal_piasters: number
  deposit_piasters: number
  requires_manual_quote: boolean
  expires_at: string | null
  created_at: string
  updated_at: string
  order_items: AdminOrderItem[] | null
  order_events: AdminOrderEvent[] | null
  payment_proofs: AdminProof[] | null
}
