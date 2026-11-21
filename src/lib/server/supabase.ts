// Server-only Supabase clients. Never import this module from client code:
// it reads the service role key. Only server functions and server routes use it.
import { createClient, type SupabaseClient } from '@supabase/supabase-js'

export const STAFF_EMAIL_DOMAIN = 'staff.hatyai-soundstar.internal'

export const usernameToEmail = (username: string) =>
  `${username.trim().toLowerCase()}@${STAFF_EMAIL_DOMAIN}`

function env(name: 'SUPABASE_URL' | 'SUPABASE_ANON_KEY' | 'SUPABASE_SERVICE_ROLE_KEY') {
  const v = process.env[name]
  if (!v) throw new Error(`ยังไม่ได้ตั้งค่า ${name} ฝั่งเซิร์ฟเวอร์`)
  return v
}

const noPersist = { persistSession: false, autoRefreshToken: false, detectSessionInUrl: false }

let adminClient: SupabaseClient | undefined

/** Service-role client. Bypasses RLS: callers must authorize first. */
export function supabaseAdmin(): SupabaseClient {
  adminClient ??= createClient(env('SUPABASE_URL'), env('SUPABASE_SERVICE_ROLE_KEY'), {
    auth: noPersist,
  })
  return adminClient
}

/** Fresh anon client for sign-in / refresh (no shared session state between requests). */
export function supabaseAnon(): SupabaseClient {
  return createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), { auth: noPersist })
}

/** Client acting as the signed-in user, so RLS and `auth.uid()` inside RPCs apply. */
export function supabaseAsUser(accessToken: string): SupabaseClient {
  return createClient(env('SUPABASE_URL'), env('SUPABASE_ANON_KEY'), {
    auth: noPersist,
    global: { headers: { Authorization: `Bearer ${accessToken}` } },
  })
}
