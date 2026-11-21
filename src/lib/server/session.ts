// Server-only session handling. Sessions are Supabase Auth tokens kept in
// httpOnly cookies; every request re-reads the caller's profile from the
// database so a suspended or deleted account loses access immediately.
import { deleteCookie, getCookie, setCookie } from '@tanstack/react-start/server'
import type { Session } from '@supabase/supabase-js'

import type { Profile } from '../domain'
import { toProfile } from './mappers'
import { supabaseAdmin, supabaseAnon } from './supabase'

const ACCESS = 'hs_at'
const REFRESH = 'hs_rt'
const MAX_AGE = 60 * 60 * 24 * 14 // refresh token cookie lifetime (14 days)

const cookieOpts = (maxAge: number) => ({
  httpOnly: true,
  secure: process.env.NODE_ENV === 'production',
  sameSite: 'lax' as const,
  path: '/',
  maxAge,
})

export function writeSession(s: Pick<Session, 'access_token' | 'refresh_token' | 'expires_in'>) {
  setCookie(ACCESS, s.access_token, cookieOpts(s.expires_in || 3600))
  setCookie(REFRESH, s.refresh_token, cookieOpts(MAX_AGE))
}

export function clearSession() {
  deleteCookie(ACCESS, { path: '/' })
  deleteCookie(REFRESH, { path: '/' })
}

export type Viewer = { profile: Profile; accessToken: string }

export class AuthError extends Error {}

/** Resolve the current user from cookies, refreshing the access token if needed. */
async function resolveUserId(): Promise<{ userId: string; accessToken: string } | null> {
  const admin = supabaseAdmin()
  const at = getCookie(ACCESS)
  if (at) {
    const { data } = await admin.auth.getUser(at)
    if (data.user) return { userId: data.user.id, accessToken: at }
  }
  const rt = getCookie(REFRESH)
  if (!rt) return null
  const { data, error } = await supabaseAnon().auth.refreshSession({ refresh_token: rt })
  if (error || !data.session || !data.user) {
    clearSession()
    return null
  }
  writeSession(data.session)
  return { userId: data.user.id, accessToken: data.session.access_token }
}

/** Load an active profile by auth user id, or null if missing/suspended/deleted. */
export async function loadActiveProfile(userId: string): Promise<Profile | null> {
  const { data, error } = await supabaseAdmin()
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()
  if (error) throw new Error('โหลดข้อมูลผู้ใช้ไม่สำเร็จ')
  if (!data || !data.is_active || data.deleted_at) return null
  return toProfile(data)
}

/** Current viewer, or null when signed out or the account is no longer active. */
export async function getViewer(): Promise<Viewer | null> {
  const resolved = await resolveUserId()
  if (!resolved) return null
  const profile = await loadActiveProfile(resolved.userId)
  if (!profile) {
    clearSession()
    return null
  }
  return { profile, accessToken: resolved.accessToken }
}

export async function requireViewer(): Promise<Viewer> {
  const v = await getViewer()
  if (!v) throw new AuthError('กรุณาเข้าสู่ระบบอีกครั้ง')
  return v
}
