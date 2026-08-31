import { createClient, type SupabaseClient } from '@supabase/supabase-js'
import { getSupabaseKey, getSupabaseUrl } from './env'

let client: SupabaseClient | null = null

export function getSupabase(): SupabaseClient | null {
  const url = getSupabaseUrl()
  const key = getSupabaseKey()
  if (!url || !key) return null
  if (!client) {
    client = createClient(url, key, {
      auth: {
        persistSession: true,
        autoRefreshToken: true,
        detectSessionInUrl: true,
      },
    })
  }
  return client
}
