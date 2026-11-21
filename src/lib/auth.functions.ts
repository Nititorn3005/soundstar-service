// Authentication and first-run setup. Staff sign in with a username; it maps to
// the internal Supabase Auth e-mail `<username>@staff.hatyai-soundstar.internal`.
import { createHash, timingSafeEqual } from 'node:crypto'
import { createServerFn } from '@tanstack/react-start'
import { getRequestHeader, getRequestIP, setResponseStatus } from '@tanstack/react-start/server'
import { z } from 'zod'

import type { Company, Profile, Result } from './domain'
import { toCompany } from './server/mappers'
import { clearSession, getViewer, loadActiveProfile, requireViewer, writeSession } from './server/session'
import { supabaseAdmin, supabaseAnon, usernameToEmail } from './server/supabase'
import { USERNAME_RE, checkNewAccount, validatePassword } from './validation'

const MAX_FAILS_PER_USER = 5
const MAX_FAILS_PER_IP = 20
const WINDOW_MS = 15 * 60 * 1000
const SETUP_ATTEMPT_KEY = '__setup__'

const fail = (error: string) => ({ ok: false as const, error })
const BAD_LOGIN = 'ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง'
const SUSPENDED = 'บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ'

function clientIp() {
  return (
    getRequestHeader('x-nf-client-connection-ip') ||
    getRequestIP({ xForwardedFor: true }) ||
    'unknown'
  )
}

async function recentFailures(column: 'username' | 'ip_address', value: string) {
  const since = new Date(Date.now() - WINDOW_MS).toISOString()
  const { count } = await supabaseAdmin()
    .from('login_attempts')
    .select('id', { count: 'exact', head: true })
    .eq(column, value)
    .eq('is_success', false)
    .gte('attempted_at', since)
  return count ?? 0
}

async function recordAttempt(username: string, ip: string, success: boolean) {
  await supabaseAdmin()
    .from('login_attempts')
    .insert({ username, ip_address: ip, is_success: success })
}

async function isLockedOut(username: string, ip: string) {
  const [byUser, byIp] = await Promise.all([
    recentFailures('username', username),
    recentFailures('ip_address', ip),
  ])
  return byUser >= MAX_FAILS_PER_USER || byIp >= MAX_FAILS_PER_IP
}

/* ---------- session ---------- */

export const getSession = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Profile | null> => (await getViewer())?.profile ?? null,
)

export const login = createServerFn({ method: 'POST' })
  .validator(z.object({ username: z.string().max(64), password: z.string().min(1).max(200) }))
  .handler(async ({ data }): Promise<Result<Profile>> => {
    const username = data.username.trim().toLowerCase()
    if (!USERNAME_RE.test(username)) return fail(BAD_LOGIN)
    const ip = clientIp()
    if (await isLockedOut(username, ip))
      return fail('เข้าสู่ระบบผิดหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่')

    const { data: auth, error } = await supabaseAnon().auth.signInWithPassword({
      email: usernameToEmail(username),
      password: data.password,
    })
    if (error || !auth.session || !auth.user) {
      await recordAttempt(username, ip, false)
      return fail(BAD_LOGIN)
    }

    const profile = await loadActiveProfile(auth.user.id)
    if (!profile) {
      // Valid password but no active profile: revoke the session we just created.
      await supabaseAdmin().auth.admin.signOut(auth.session.access_token).catch(() => {})
      await recordAttempt(username, ip, false)
      const { data: row } = await supabaseAdmin()
        .from('profiles')
        .select('id')
        .eq('id', auth.user.id)
        .maybeSingle()
      return fail(row ? SUSPENDED : BAD_LOGIN)
    }

    await recordAttempt(username, ip, true)
    writeSession(auth.session)
    return { ok: true, value: profile }
  })

export const logout = createServerFn({ method: 'POST' }).handler(async () => {
  const viewer = await getViewer().catch(() => null)
  if (viewer) await supabaseAdmin().auth.admin.signOut(viewer.accessToken).catch(() => {})
  clearSession()
  return { ok: true as const, value: undefined }
})

export const changeOwnPassword = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      current: z.string().min(1).max(200),
      next: z.string().max(200),
      confirm: z.string().max(200),
    }),
  )
  .handler(async ({ data }): Promise<Result> => {
    const { profile } = await requireViewer()
    const errs = validatePassword(data.next, data.confirm)
    if (errs.password || errs.confirm) return fail(errs.password ?? errs.confirm ?? '')
    if (data.current === data.next) return fail('รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม')

    const email = usernameToEmail(profile.username)
    const check = await supabaseAnon().auth.signInWithPassword({ email, password: data.current })
    if (check.error) return fail('รหัสผ่านปัจจุบันไม่ถูกต้อง')

    const admin = supabaseAdmin()
    const { error } = await admin.auth.admin.updateUserById(profile.id, { password: data.next })
    if (error) return fail('เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่')
    await admin.from('profiles').update({ must_change_password: false }).eq('id', profile.id)

    // Sign out other devices, then issue a fresh session for this one.
    if (check.data.session)
      await admin.auth.admin.signOut(check.data.session.access_token, 'others').catch(() => {})
    const fresh = await supabaseAnon().auth.signInWithPassword({ email, password: data.next })
    if (fresh.data.session) writeSession(fresh.data.session)
    return { ok: true, value: undefined }
  })

/* ---------- public company info (login / setup footers) ---------- */

export const getPublicCompany = createServerFn({ method: 'GET' }).handler(
  async (): Promise<Company> => {
    const { data } = await supabaseAdmin()
      .from('companies')
      .select('*')
      .order('created_at')
      .limit(1)
      .maybeSingle()
    return toCompany(data)
  },
)

/* ---------- first-run setup ---------- */

async function adminExists() {
  const { count, error } = await supabaseAdmin()
    .from('profiles')
    .select('id', { count: 'exact', head: true })
    .eq('role', 'ADMIN')
    .is('deleted_at', null)
  if (error) throw new Error('ตรวจสอบสถานะระบบไม่สำเร็จ')
  return (count ?? 0) > 0
}

export const getSetupStatus = createServerFn({ method: 'GET' }).handler(async () => {
  const closed = await adminExists()
  if (closed) setResponseStatus(410)
  return { open: !closed, configured: !!process.env.SETUP_TOKEN }
})

function tokenMatches(given: string, expected: string) {
  // Hash both sides so lengths match, then compare in constant time.
  const a = createHash('sha256').update(given).digest()
  const b = createHash('sha256').update(expected).digest()
  return timingSafeEqual(a, b)
}

const SETUP_CLOSED = 'ระบบตั้งค่าเรียบร้อยแล้ว ขั้นตอนนี้ถูกปิดถาวร'

export const bootstrapAdmin = createServerFn({ method: 'POST' })
  .validator(
    z.object({
      token: z.string().max(500),
      fullName: z.string().max(120),
      username: z.string().max(64),
      password: z.string().max(200),
      confirm: z.string().max(200),
      phone: z.string().max(40).optional(),
    }),
  )
  .handler(async ({ data }): Promise<Result<{ username: string }>> => {
    const expected = process.env.SETUP_TOKEN
    if (!expected || expected.length < 16)
      return fail('ยังไม่ได้ตั้งค่า SETUP_TOKEN ฝั่งเซิร์ฟเวอร์ กรุณาติดต่อผู้ติดตั้งระบบ')
    if (await adminExists()) {
      setResponseStatus(410)
      return fail(SETUP_CLOSED)
    }

    const ip = clientIp()
    if (await isLockedOut(SETUP_ATTEMPT_KEY, ip))
      return fail('ลองรหัสตั้งค่าผิดหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่')
    if (!tokenMatches(data.token, expected)) {
      await recordAttempt(SETUP_ATTEMPT_KEY, ip, false)
      return fail('รหัสตั้งค่าครั้งแรกไม่ถูกต้อง')
    }

    const username = data.username.trim().toLowerCase()
    const fullName = data.fullName.trim()
    const errs = checkNewAccount({ ...data, username, fullName })
    const firstError = Object.values(errs)[0]
    if (firstError) return fail(firstError)

    const admin = supabaseAdmin()
    const created = await admin.auth.admin.createUser({
      email: usernameToEmail(username),
      password: data.password,
      email_confirm: true,
      user_metadata: { username, full_name: fullName },
    })
    if (created.error || !created.data.user) {
      const taken = /already|registered|exists/i.test(created.error?.message ?? '')
      return fail(taken ? 'ชื่อผู้ใช้นี้ถูกใช้แล้ว' : 'สร้างบัญชีไม่สำเร็จ กรุณาลองใหม่')
    }

    const userId = created.data.user.id
    // The RPC takes an advisory lock, re-checks that no ADMIN exists and creates
    // the profile in one transaction, so two concurrent wizards cannot both win.
    const { error } = await admin.rpc('bootstrap_first_admin', {
      p_user_id: userId,
      p_username: username,
      p_full_name: fullName,
      p_phone: data.phone?.trim() || null,
    })
    if (error) {
      await admin.auth.admin.deleteUser(userId).catch(() => {})
      if (await adminExists()) {
        setResponseStatus(410)
        return fail(SETUP_CLOSED)
      }
      console.error('bootstrap_first_admin failed', error.message)
      return fail('สร้างผู้ดูแลระบบไม่สำเร็จ กรุณาลองใหม่')
    }

    await recordAttempt(SETUP_ATTEMPT_KEY, ip, true)
    return { ok: true, value: { username } }
  })
