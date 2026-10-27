import { createClient } from '@supabase/supabase-js'

const url = import.meta.env.VITE_SUPABASE_URL as string | undefined
const anon = import.meta.env.VITE_SUPABASE_ANON_KEY as string | undefined

// Returns null when env is missing (dev without a backend). Callers fall back to seed data.
export const supabase = url && anon ? createClient(url, anon) : null

export function hasBackend(): boolean {
  return supabase !== null
}
