import * as React from 'react'
import { Link, createFileRoute, useNavigate } from '@tanstack/react-router'
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from 'lucide-react'
import { toast } from 'sonner'

import { Brand, CompanyFooter, Field } from '@/components/app/shell'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { useAppStore } from '@/lib/store'

export const Route = createFileRoute('/')({
  component: LoginPage,
})

function LoginPage() {
  const { signIn } = useAppStore()
  const navigate = useNavigate()
  const [error, setError] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const [show, setShow] = React.useState(false)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    const f = new FormData(e.currentTarget)
    setPending(true)
    const res = await signIn(String(f.get('username')), String(f.get('password')))
    setPending(false)
    if (!res.ok) return setError(res.error)
    toast.success(`ยินดีต้อนรับ ${res.value.fullName}`)
    navigate({ to: '/dashboard' })
  }

  return (
    <div className="flex min-h-screen flex-col lg:grid lg:grid-cols-[1.1fr_1fr]">
      <section className="drum-rings relative overflow-hidden bg-sidebar px-6 py-10 text-sidebar-accent-foreground sm:px-10 lg:flex lg:flex-col lg:justify-between lg:py-14">
        <Brand />
        <div className="relative z-10 mt-10 max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700 motion-reduce:animate-none lg:mt-0">
          <p className="font-ticket text-xs uppercase tracking-[0.25em] text-sidebar-primary">
            Service desk · Hat Yai
          </p>
          <h1 className="mt-3 font-display text-4xl font-bold leading-[1.15] sm:text-5xl">
            ทุกใบงานซ่อม
            <br />
            ทุกชิ้นอะไหล่
            <br />
            <span className="text-sidebar-primary">อยู่ในที่เดียว</span>
          </h1>
          <p className="mt-5 max-w-md text-sidebar-foreground/80">
            รับแจ้งงาน มอบหมายช่าง ติดตามสถานะ และเบิกอะไหล่ ให้หน้าร้านและช่างหน้างาน
            เห็นข้อมูลชุดเดียวกันทุกอุปกรณ์
          </p>
        </div>
        <TicketPreview />
      </section>

      <section className="flex flex-1 flex-col">
        <div className="flex flex-1 items-center justify-center px-6 py-12">
          <div className="w-full max-w-sm animate-in fade-in duration-700 motion-reduce:animate-none">
            <h2 className="font-display text-2xl font-bold">เข้าสู่ระบบ</h2>
            <p className="mt-1 text-sm text-muted-foreground">
              ใช้ชื่อผู้ใช้และรหัสผ่านที่ได้รับจากผู้ดูแลระบบ
            </p>

            <form onSubmit={onSubmit} className="mt-8 grid gap-5" noValidate>
              <Field
                label="ชื่อผู้ใช้"
                htmlFor="username"
                hint="ระบบจะเข้าสู่ระบบด้วย <username>@staff.hatyai-soundstar.internal"
              >
                <Input
                  id="username"
                  name="username"
                  autoComplete="username"
                  autoCapitalize="none"
                  placeholder="เช่น front01"
                  className="h-12 font-ticket"
                  required
                />
              </Field>
              <Field label="รหัสผ่าน" htmlFor="password">
                <div className="relative">
                  <Input
                    id="password"
                    name="password"
                    type={show ? 'text' : 'password'}
                    autoComplete="current-password"
                    className="h-12 pr-12"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShow((v) => !v)}
                    aria-label={show ? 'ซ่อนรหัสผ่าน' : 'แสดงรหัสผ่าน'}
                    className="absolute inset-y-0 right-0 grid w-12 place-items-center text-muted-foreground hover:text-foreground"
                  >
                    {show ? <EyeOff className="size-4" /> : <Eye className="size-4" />}
                  </button>
                </div>
              </Field>
              {error && (
                <Alert variant="destructive">
                  <AlertDescription>{error}</AlertDescription>
                </Alert>
              )}
              <Button type="submit" size="lg" className="h-12 text-base" disabled={pending}>
                {pending ? <Loader2 className="animate-spin" /> : <ArrowRight />}
                {pending ? 'กำลังตรวจสอบ…' : 'เข้าสู่ระบบ'}
              </Button>
            </form>

            <Link
              to="/setup"
              className="mt-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline"
            >
              <ShieldCheck className="size-4" /> ตั้งค่าระบบครั้งแรก (สร้างผู้ดูแลระบบ)
            </Link>
          </div>
        </div>
        <CompanyFooter />
      </section>
    </div>
  )
}

function TicketPreview() {
  return (
    <div
      aria-hidden
      className="relative z-10 mt-10 hidden max-w-md rotate-[-2deg] rounded-xl bg-card p-5 text-card-foreground shadow-2xl sm:block lg:mt-0 animate-in fade-in slide-in-from-bottom-6 duration-1000 motion-reduce:animate-none"
    >
      <div className="flex items-center justify-between border-b border-dashed border-border pb-3">
        <span className="font-ticket text-sm font-bold text-primary">HS-2610-0042</span>
        <span className="rounded-full bg-warn/25 px-2 py-0.5 text-xs">รอมอบหมายช่าง</span>
      </div>
      <dl className="grid grid-cols-2 gap-3 pt-3 text-xs">
        <div>
          <dt className="text-muted-foreground">ลูกค้า</dt>
          <dd className="font-medium">ร้านซักรีดเพชรเกษม</dd>
        </div>
        <div>
          <dt className="text-muted-foreground">เครื่อง</dt>
          <dd className="font-medium">LG · หยอดเหรียญ</dd>
        </div>
        <div className="col-span-2">
          <dt className="text-muted-foreground">อาการ</dt>
          <dd className="font-medium">ไม่ปั่นหมาด มีเสียงดังที่ถัง</dd>
        </div>
      </dl>
    </div>
  )
}
