import { createBrowserClient } from '@supabase/ssr'
import type { SupabaseClient } from '@supabase/supabase-js'

// This app is a Vite SPA (D1), so only the browser client is used.
// The publishable key is public by design; the service-role key never reaches the browser.
const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const key = (import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ||
  import.meta.env.VITE_SUPABASE_ANON_KEY) as string | undefined

let client: SupabaseClient | null = null

/** Lazily creates the singleton browser client. Returns null when env is missing. */
export function getSupabase(): SupabaseClient | null {
  if (!url || !key) return null
  if (!client) client = createBrowserClient(url, key)
  return client
}

export const supabase = getSupabase()

export function hasBackend(): boolean {
  return supabase !== null
}
