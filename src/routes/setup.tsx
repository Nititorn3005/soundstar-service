import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { CheckCircle2, KeyRound, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Brand, CompanyFooter, Field } from '@/components/app/shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { bootstrapAdmin, getSetupStatus } from '@/lib/auth.functions'
import { validateNewAccount, type AccountErrors as Errors } from '@/lib/validation'

export const Route = createFileRoute('/setup')({
  head: () => ({ meta: [{ title: 'ตั้งค่าระบบครั้งแรก · Hatyai Soundstar' }] }),
  loader: () => getSetupStatus(),
  component: SetupPage,
})

function SetupPage() {
  const setup = Route.useLoaderData()
  const navigate = useNavigate()
  const [errors, setErrors] = React.useState<Errors>({})
  const [pending, setPending] = React.useState(false)

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    const f = new FormData(ev.currentTarget)
    const e = validateNewAccount(f)
    if (String(f.get('token') ?? '').length < 16)
      e.token = 'กรุณากรอกรหัสตั้งค่าครั้งแรกที่กำหนดไว้ในระบบ'
    setErrors(e)
    if (Object.keys(e).length) return
    setPending(true)
    try {
      const result = await bootstrapAdmin({
        data: {
          token: String(f.get('token') ?? ''),
          fullName: String(f.get('fullName') ?? ''),
          username: String(f.get('username') ?? ''),
          password: String(f.get('password') ?? ''),
          confirm: String(f.get('confirm') ?? ''),
          phone: String(f.get('phone') ?? '') || undefined,
        },
      })
      if (!result.ok) {
        setPending(false)
        setErrors({ token: result.error })
        return
      }
      toast.success('สร้างผู้ดูแลระบบเรียบร้อย ขั้นตอนตั้งค่าครั้งแรกถูกปิดแล้ว')
      navigate({ to: '/' })
    } catch {
      setPending(false)
      setErrors({ token: 'สร้างผู้ดูแลระบบไม่สำเร็จ กรุณาลองใหม่' })
    }
  }

  return (
    <div className="flex min-h-screen flex-col bg-background">
      <header className="bg-sidebar px-4 py-4 text-sidebar-accent-foreground sm:px-6">
        <Brand className="mx-auto max-w-content" />
      </header>
      <main className="mx-auto grid w-full max-w-content flex-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.2fr]">
        <div>
          <p className="font-ticket text-xs uppercase tracking-[0.2em] text-highlight">
            First-run setup
          </p>
          <h1 className="mt-1 font-display text-3xl font-bold">สร้างผู้ดูแลระบบคนแรก</h1>
          <p className="mt-2 text-muted-foreground">
            ขั้นตอนนี้ทำได้เพียงครั้งเดียว หลังสร้างสำเร็จ ระบบจะปิดหน้านี้อัตโนมัติ
            และผู้ดูแลระบบสามารถเพิ่มบัญชีพนักงานได้จากเมนู “จัดการผู้ใช้งาน”
          </p>
          <ol className="mt-6 grid gap-4 text-sm">
            {[
              ['รหัสตั้งค่าครั้งแรก', 'ผู้ติดตั้งระบบกำหนดไว้ฝั่งเซิร์ฟเวอร์ ไม่ปรากฏในเบราว์เซอร์ ป้องกันบุคคลภายนอกแย่งสร้างบัญชี'],
              ['ตรวจสอบฝั่งเซิร์ฟเวอร์', 'ระบบตรวจว่ายังไม่มีผู้ดูแลและสร้างบัญชีในขั้นตอนเดียว (Atomic)'],
              ['ปิดหน้า Setup อัตโนมัติ', 'เมื่อมีผู้ดูแลแล้ว คำขอสร้างซ้ำทุกครั้งจะถูกปฏิเสธ'],
            ].map(([t, d], i) => (
              <li key={t} className="flex gap-3">
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-primary font-ticket text-xs text-primary-foreground">
                  {i + 1}
                </span>
                <span>
                  <span className="block font-medium">{t}</span>
                  <span className="text-muted-foreground">{d}</span>
                </span>
              </li>
            ))}
          </ol>
        </div>

        {!setup.open || !setup.configured ? (
          <div role="status" className="h-fit rounded-xl border border-border bg-card p-5 text-sm">
            <p className="font-semibold">{!setup.open ? 'ระบบตั้งค่าเรียบร้อยแล้ว' : 'ยังไม่พร้อมตั้งค่า'}</p>
            <p className="mt-1 text-muted-foreground">
              {!setup.open
                ? 'ขั้นตอนสร้างผู้ดูแลระบบถูกปิดแล้ว กรุณาเข้าสู่ระบบ'
                : 'ผู้ติดตั้งระบบต้องกำหนด SETUP_TOKEN ฝั่งเซิร์ฟเวอร์ก่อน'}
            </p>
            <Link to="/" className="mt-3 inline-flex text-primary hover:underline">กลับไปหน้าเข้าสู่ระบบ</Link>
          </div>
        ) : <form
          onSubmit={onSubmit}
          noValidate
          className="grid h-fit gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7"
        >
          <Field label="รหัสตั้งค่าครั้งแรก (Setup Token)" htmlFor="token" error={errors.token} required>
            <div className="relative">
              <KeyRound className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
              <Input id="token" name="token" type="password" className="h-11 pl-9 font-ticket" autoComplete="off" />
            </div>
          </Field>
          <Field label="ชื่อผู้ดูแล" htmlFor="fullName" error={errors.fullName} required>
            <Input id="fullName" name="fullName" className="h-11" autoComplete="name" />
          </Field>
          <Field label="ชื่อผู้ใช้" htmlFor="username" error={errors.username} hint="เช่น admin01" required>
            <Input id="username" name="username" className="h-11 font-ticket" autoCapitalize="none" autoComplete="username" />
          </Field>
          <div className="grid gap-5 sm:grid-cols-2">
            <Field label="รหัสผ่าน" htmlFor="password" error={errors.password} required>
              <Input id="password" name="password" type="password" className="h-11" autoComplete="new-password" />
            </Field>
            <Field label="ยืนยันรหัสผ่าน" htmlFor="confirm" error={errors.confirm} required>
              <Input id="confirm" name="confirm" type="password" className="h-11" autoComplete="new-password" />
            </Field>
          </div>
          <Button type="submit" size="lg" className="h-12" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <ShieldCheck />}
            {pending ? 'กำลังสร้างบัญชี…' : 'สร้างผู้ดูแลระบบ'}
          </Button>
          <p className="flex items-center gap-1.5 text-xs text-muted-foreground">
            <CheckCircle2 className="size-3.5 text-ok" /> มีบัญชีแล้ว?{' '}
            <Link to="/" className="text-primary hover:underline">กลับไปหน้าเข้าสู่ระบบ</Link>
          </p>
        </form>}
      </main>
      <CompanyFooter />
    </div>
  )
}
