import { useQuery } from '@tanstack/react-query'
import { supabase } from '../../lib/supabase'

export type PaymentMethod = {
  label: string
  number: string
  holder?: string
  note?: string
}

export type PublicConfig = {
  whatsappNumber: string | null
  depositPercent: number
  orderExpiryHours: number
  requiresManualQuote: boolean
  paymentMethods: PaymentMethod[]
  businessHours: string | null
}

// Safe defaults when the config row is missing. No payment numbers are ever invented.
export const configDefaults: PublicConfig = {
  whatsappNumber: null,
  depositPercent: 30,
  orderExpiryHours: 72,
  requiresManualQuote: false,
  paymentMethods: [],
  businessHours: null,
}

type ConfigRow = { key: string; value: unknown }

function isPaymentMethod(value: unknown): value is PaymentMethod {
  if (typeof value !== 'object' || value === null) return false
  const m = value as Record<string, unknown>
  return typeof m.label === 'string' && typeof m.number === 'string'
}

function mapConfig(rows: ConfigRow[]): PublicConfig {
  const get = (key: string) => rows.find((row) => row.key === key)?.value

  const whatsapp = get('whatsapp_number')
  const deposit = get('deposit_percent')
  const expiry = get('order_expiry_hours')
  const manual = get('requires_manual_quote')
  const methods = get('payment_methods')
  const hours = get('business_hours')

  return {
    whatsappNumber: typeof whatsapp === 'string' ? whatsapp : null,
    depositPercent: typeof deposit === 'number' ? deposit : configDefaults.depositPercent,
    orderExpiryHours: typeof expiry === 'number' ? expiry : configDefaults.orderExpiryHours,
    requiresManualQuote: typeof manual === 'boolean' ? manual : configDefaults.requiresManualQuote,
    paymentMethods: Array.isArray(methods) ? methods.filter(isPaymentMethod) : [],
    businessHours: typeof hours === 'string' ? hours : null,
  }
}

async function loadPublicConfig(): Promise<PublicConfig> {
  if (!supabase) return configDefaults

  const { data, error } = await supabase
    .from('app_config')
    .select('key,value')
    .eq('is_public', true)

  if (error) {
    if (import.meta.env.DEV) {
      console.warn('[config] falling back to defaults:', error.message)
      return configDefaults
    }
    throw error
  }

  return mapConfig((data ?? []) as ConfigRow[])
}

export function usePublicConfig() {
  return useQuery({ queryKey: ['public-config'], queryFn: loadPublicConfig, staleTime: 10 * 60_000 })
}

/** Egypt international format without `+` (20 + 10 digits). */
export function isValidWhatsAppNumber(value: string | null): value is string {
  return value !== null && /^20[0-9]{10}$/.test(value)
}

export function whatsappLink(number: string | null, message: string): string | null {
  if (!isValidWhatsAppNumber(number)) return null
  return `https://wa.me/${number}?text=${encodeURIComponent(message)}`
}
