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

export type TicketItem = {
  name: string
  color: string | null
  qty: number
  unitPricePiasters: number
}

export type CreateOrderResponse = {
  code: string
  token: string
  status: OrderStatus
  subtotalPiasters: number
  depositPiasters: number
  expiresAt: string | null
  items: TicketItem[]
}
