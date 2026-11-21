// Account/password checks shared by the browser forms and the server functions.
// The server repeats every check; the browser runs them for instant feedback.

export type AccountErrors = Partial<Record<'fullName' | 'username' | 'password' | 'confirm' | 'token', string>>

export const USERNAME_RE = /^[a-z0-9._-]{3,20}$/

export type AccountInput = { fullName: string; username: string; password: string; confirm: string }

export function checkNewAccount(a: AccountInput): AccountErrors {
  const e: AccountErrors = {}
  if (a.fullName.trim().length < 2) e.fullName = 'กรุณากรอกชื่อ'
  if (!USERNAME_RE.test(a.username)) e.username = 'ใช้ a–z, 0–9, จุด, ขีด 3–20 ตัวอักษร'
  return { ...e, ...validatePassword(a.password, a.confirm) }
}

export function validateNewAccount(f: FormData): AccountErrors {
  return checkNewAccount({
    fullName: String(f.get('fullName') ?? ''),
    username: String(f.get('username') ?? ''),
    password: String(f.get('password') ?? ''),
    confirm: String(f.get('confirm') ?? ''),
  })
}

export function validatePassword(password: string, confirm: string): AccountErrors {
  const e: AccountErrors = {}
  if (password.length < 10 || !/\d/.test(password) || !/[a-zA-Z]/.test(password))
    e.password = 'อย่างน้อย 10 ตัวอักษร มีทั้งตัวอักษรและตัวเลข'
  if (password !== confirm) e.confirm = 'ยืนยันรหัสผ่านไม่ตรงกัน'
  return e
}
