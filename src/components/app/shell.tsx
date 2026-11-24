import * as React from 'react'
import { Link, useNavigate, useRouterState } from '@tanstack/react-router'
import {
  ArrowDownToLine,
  ArrowUpFromLine,
  BarChart3,
  BookOpen,
  Building2,
  ClipboardList,
  FileSearch,
  History,
  KeyRound,
  LayoutDashboard,
  LogOut,
  Menu,
  Moon,
  Package,
  PlusCircle,
  ShieldAlert,
  Sun,
  Users,
  WashingMachine,
  type LucideIcon,
} from 'lucide-react'
import { toast } from 'sonner'

import { Button } from '@/components/ui/button'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
} from '@/components/ui/sheet'
import { ROLE_LABEL, STATUS_LABEL, STATUS_TONE, type JobStatus, type Role } from '@/lib/domain'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { validatePassword } from '@/lib/validation'

type NavPath =
  | '/dashboard'
  | '/jobs/new'
  | '/jobs'
  | '/inventory'
  | '/inventory/receive'
  | '/inventory/issue'
  | '/inventory/history'
  | '/error-codes'
  | '/users'
  | '/reports'
  | '/settings'
type NavItem = {
  to: NavPath | '/jobs/latest'
  label: string
  icon: LucideIcon
  roles: Role[]
}

const ALL: Role[] = ['ADMIN', 'FRONT', 'TECH']

export const NAV: NavItem[] = [
  { to: '/dashboard', label: 'แดชบอร์ด', icon: LayoutDashboard, roles: ALL },
  { to: '/jobs/new', label: 'รับแจ้งงานซ่อม', icon: PlusCircle, roles: ['ADMIN', 'FRONT'] },
  { to: '/jobs', label: 'รายการงานซ่อม', icon: ClipboardList, roles: ALL },
  { to: '/jobs/latest', label: 'รายละเอียดงานซ่อม', icon: FileSearch, roles: ALL },
  { to: '/inventory', label: 'สต๊อกอะไหล่', icon: Package, roles: ['ADMIN', 'TECH'] },
  { to: '/inventory/receive', label: 'รับอะไหล่เข้า', icon: ArrowDownToLine, roles: ['ADMIN'] },
  { to: '/inventory/issue', label: 'เบิกอะไหล่ออก', icon: ArrowUpFromLine, roles: ['ADMIN', 'TECH'] },
  { to: '/inventory/history', label: 'ประวัติสต๊อก', icon: History, roles: ['ADMIN', 'TECH'] },
  { to: '/error-codes', label: 'คู่มือโค้ด Error', icon: BookOpen, roles: ALL },
  { to: '/users', label: 'จัดการผู้ใช้งาน', icon: Users, roles: ['ADMIN'] },
  { to: '/reports', label: 'รายงาน', icon: BarChart3, roles: ['ADMIN'] },
  { to: '/settings', label: 'ตั้งค่าบริษัท', icon: Building2, roles: ['ADMIN'] },
]

export function Brand({ className }: { className?: string }) {
  const [logoFailed, setLogoFailed] = React.useState(false)

  return (
    <span className={cn('flex items-center gap-3', className)}>
      {!logoFailed ? (
        <span className="grid size-10 shrink-0 place-items-center overflow-hidden rounded-xl bg-white p-1 shadow-[inset_0_-3px_0_oklch(0_0_0/0.12)]">
          <img
            src="/logo.png"
            alt="Hatyai Soundstar"
            className="size-full object-contain"
            onError={() => setLogoFailed(true)}
          />
        </span>
      ) : (
        <span className="grid size-10 shrink-0 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-[inset_0_-3px_0_oklch(0_0_0/0.15)]">
          <WashingMachine className="size-5" aria-hidden />
        </span>
      )}
      <span className="leading-tight">
        <span className="block font-display text-base font-bold tracking-tight">
          Hatyai Soundstar
        </span>
        <span className="block text-xs opacity-70">ระบบบริหารงานซ่อม</span>
      </span>
    </span>
  )
}

function NavList({ onNavigate }: { onNavigate?: () => void }) {
  const { currentUser, jobs, signOut } = useAppStore()
  const navigate = useNavigate()
  const pathname = useRouterState({ select: (s) => s.location.pathname })
  const role = currentUser?.role ?? 'FRONT'
  const latestJob =
    role === 'TECH' ? jobs.find((j) => j.technicianId === currentUser?.id) : jobs[0]

  return (
    <nav aria-label="เมนูหลัก" className="flex flex-1 flex-col gap-0.5">
      {NAV.filter((n) => n.roles.includes(role)).map((n) => {
        const isDetail = n.to === '/jobs/latest'
        const active =
          n.to === '/jobs/latest'
            ? /^\/jobs\/(?!new)[^/]+$/.test(pathname)
            : pathname === n.to || pathname === n.to + '/'
        const className = cn(
          'group flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors motion-reduce:transition-none',
          active
            ? 'bg-sidebar-accent text-sidebar-accent-foreground'
            : 'text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground',
        )
        const body = (
          <>
            <span className="w-5 font-ticket text-[10px] opacity-40">
              {String(NAV.indexOf(n) + 1).padStart(2, '0')}
            </span>
            <n.icon
              className={cn('size-4', active && 'text-sidebar-primary')}
              aria-hidden
            />
            {n.label}
          </>
        )
        if (isDetail && latestJob)
          return (
            <Link
              key={n.to}
              to="/jobs/$jobId"
              params={{ jobId: latestJob.id }}
              onClick={onNavigate}
              className={className}
            >
              {body}
            </Link>
          )
        return (
          <Link
            key={n.to}
            to={isDetail ? '/jobs' : (n.to as NavPath)}
            onClick={onNavigate}
            className={className}
          >
            {body}
          </Link>
        )
      })}
      <button
        type="button"
        onClick={async () => {
          await signOut()
          onNavigate?.()
          toast.success('ออกจากระบบแล้ว')
          navigate({ to: '/' })
        }}
        className="mt-2 flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-sidebar-foreground/80 transition-colors hover:bg-destructive/20 hover:text-sidebar-accent-foreground"
      >
        <span className="w-5 font-ticket text-[10px] opacity-40">
          {String(NAV.length + 1).padStart(2, '0')}
        </span>
        <LogOut className="size-4" aria-hidden />
        ออกจากระบบ
      </button>
    </nav>
  )
}

function useThemeMode() {
  const [dark, setDark] = React.useState(false)

  React.useEffect(() => {
    const saved = localStorage.getItem('soundstar-theme')
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches
    const isDark = saved ? saved === 'dark' : prefersDark
    setDark(isDark)
    document.documentElement.classList.toggle('dark', isDark)
  }, [])

  const toggle = React.useCallback(() => {
    setDark((prev) => {
      const next = !prev
      document.documentElement.classList.toggle('dark', next)
      localStorage.setItem('soundstar-theme', next ? 'dark' : 'light')
      return next
    })
  }, [])

  return { dark, toggle }
}

function UserChip({
  onChangePassword,
  dark,
  onToggleTheme,
}: {
  onChangePassword: () => void
  dark: boolean
  onToggleTheme: () => void
}) {
  const { currentUser } = useAppStore()
  if (!currentUser) return null
  return (
    <div className="rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3">
      <p className="truncate text-sm font-medium text-sidebar-accent-foreground">
        {currentUser.fullName}
      </p>
      <p className="font-ticket text-xs text-sidebar-foreground/70">
        @{currentUser.username} · {ROLE_LABEL[currentUser.role]}
      </p>
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-2 border-t border-sidebar-border/60 pt-2">
        <button
          type="button"
          onClick={onChangePassword}
          className="inline-flex items-center gap-1.5 text-xs text-sidebar-primary hover:underline"
        >
          <KeyRound className="size-3" aria-hidden /> เปลี่ยนรหัสผ่าน
        </button>
        <button
          type="button"
          onClick={onToggleTheme}
          aria-label={dark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
          className="inline-flex items-center gap-1.5 rounded-lg border border-sidebar-border bg-sidebar-accent px-2.5 py-1 text-xs font-medium text-sidebar-accent-foreground transition-colors hover:bg-sidebar-primary hover:text-sidebar-primary-foreground"
        >
          {dark ? (
            <>
              <Sun className="size-3.5 text-amber-300" aria-hidden /> โหมดสว่าง
            </>
          ) : (
            <>
              <Moon className="size-3.5 text-sky-300" aria-hidden /> โหมดมืด
            </>
          )}
        </button>
      </div>
    </div>
  )
}

export function AppShell({ children }: { children: React.ReactNode }) {
  const [open, setOpen] = React.useState(false)
  const [pwOpen, setPwOpen] = React.useState(false)
  const { currentUser } = useAppStore()
  const { dark, toggle } = useThemeMode()

  return (
    <div className="min-h-screen bg-background lg:grid lg:grid-cols-[17rem_1fr]">
      <aside className="no-print drum-rings sticky top-0 hidden h-screen flex-col gap-6 overflow-y-auto bg-sidebar p-4 text-sidebar-foreground lg:flex">
        <Brand className="px-1 pt-2 text-sidebar-accent-foreground" />
        <NavList />
        <UserChip
          onChangePassword={() => setPwOpen(true)}
          dark={dark}
          onToggleTheme={toggle}
        />
      </aside>

      <header className="no-print sticky top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-3 text-sidebar-accent-foreground lg:hidden">
        <Brand />
        <div className="flex items-center gap-1">
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label={dark ? 'สลับเป็นโหมดสว่าง' : 'สลับเป็นโหมดมืด'}
            className="text-sidebar-accent-foreground hover:bg-sidebar-accent"
            onClick={toggle}
          >
            {dark ? <Sun className="size-5 text-amber-300" /> : <Moon className="size-5 text-sky-300" />}
          </Button>
          <Button
            variant="ghost"
            size="icon-lg"
            aria-label="เปิดเมนู"
            className="text-sidebar-accent-foreground hover:bg-sidebar-accent"
            onClick={() => setOpen(true)}
          >
            <Menu />
          </Button>
        </div>
      </header>
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetContent
          side="left"
          className="drum-rings flex w-[85vw] max-w-xs flex-col gap-4 overflow-y-auto border-sidebar-border bg-sidebar p-4 text-sidebar-foreground"
        >
          <SheetHeader className="p-0">
            <SheetTitle className="text-sidebar-accent-foreground">
              <Brand />
            </SheetTitle>
            <SheetDescription className="sr-only">เมนูหลักของระบบ</SheetDescription>
          </SheetHeader>
          <NavList onNavigate={() => setOpen(false)} />
          <UserChip
            onChangePassword={() => {
              setOpen(false)
              setPwOpen(true)
            }}
            dark={dark}
            onToggleTheme={toggle}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-col">
        <main className="mx-auto w-full max-w-content flex-1 px-4 py-6 sm:px-6 lg:py-10">
          {children}
        </main>
        <CompanyFooter />
      </div>
      {currentUser && <ChangePasswordDialog open={pwOpen} onOpenChange={setPwOpen} />}
    </div>
  )
}

export function CompanyFooter({ className }: { className?: string }) {
  const { company } = useAppStore()
  return (
    <footer
      className={cn(
        'no-print border-t border-border px-4 py-5 text-xs text-muted-foreground sm:px-6',
        className,
      )}
    >
      <div className="mx-auto flex max-w-content flex-col gap-1 sm:flex-row sm:items-center sm:justify-between">
        <p>
          <span className="font-medium text-foreground">{company.nameTh}</span>{' '}
          ({company.nameEn})
        </p>
        <p>
          {company.address} · โทร {company.phones}
        </p>
      </div>
    </footer>
  )
}

function ChangePasswordDialog({
  open,
  onOpenChange,
}: {
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const [error, setError] = React.useState('')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เปลี่ยนรหัสผ่าน</DialogTitle>
          <DialogDescription>
            รหัสผ่านใหม่ต้องมีอย่างน้อย 10 ตัวอักษร ประกอบด้วยตัวอักษรและตัวเลข
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={(e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            const errs = validatePassword(String(f.get('next')), String(f.get('confirm')))
            if (errs.password || errs.confirm) return setError(errs.password ?? errs.confirm ?? '')
            setError('')
            onOpenChange(false)
            toast.success('เปลี่ยนรหัสผ่านเรียบร้อย')
          }}
        >
          <Field label="รหัสผ่านปัจจุบัน" htmlFor="pw-current">
            <Input id="pw-current" name="current" type="password" required autoComplete="current-password" />
          </Field>
          <Field label="รหัสผ่านใหม่" htmlFor="pw-next">
            <Input id="pw-next" name="next" type="password" required autoComplete="new-password" />
          </Field>
          <Field label="ยืนยันรหัสผ่านใหม่" htmlFor="pw-confirm" error={error}>
            <Input id="pw-confirm" name="confirm" type="password" required autoComplete="new-password" />
          </Field>
          <DialogFooter>
            <Button type="submit" size="lg">บันทึกรหัสผ่าน</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export function Field({
  label,
  htmlFor,
  hint,
  error,
  required,
  className,
  children,
}: {
  label: string
  htmlFor: string
  hint?: string
  error?: string
  required?: boolean
  className?: string
  children: React.ReactNode
}) {
  return (
    <div className={cn('grid gap-1.5', className)}>
      <Label htmlFor={htmlFor}>
        {label}
        {required && <span className="text-destructive">*</span>}
      </Label>
      {children}
      {error ? (
        <p role="alert" className="text-xs text-destructive">{error}</p>
      ) : hint ? (
        <p className="text-xs text-muted-foreground">{hint}</p>
      ) : null}
    </div>
  )
}

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
}: {
  eyebrow?: string
  title: string
  description?: string
  actions?: React.ReactNode
}) {
  return (
    <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none">
      <div>
        {eyebrow && (
          <p className="mb-1 font-ticket text-xs uppercase tracking-[0.2em] text-highlight">
            {eyebrow}
          </p>
        )}
        <h1 className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
          {title}
        </h1>
        {description && (
          <p className="mt-1 max-w-reading text-sm text-muted-foreground">{description}</p>
        )}
      </div>
      {actions && <div className="no-print flex flex-wrap gap-2">{actions}</div>}
    </div>
  )
}

const STATUS_BADGE_STYLE: Record<string, { badge: string; dot: string }> = {
  UNASSIGNED: {
    badge: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700',
    dot: 'bg-slate-500 dark:bg-slate-400',
  },
  WAITING_ASSIGN: {
    badge: 'bg-slate-100 text-slate-700 border-slate-300 dark:bg-slate-800/80 dark:text-slate-200 dark:border-slate-700',
    dot: 'bg-slate-500 dark:bg-slate-400',
  },
  ASSIGNED: {
    badge: 'bg-blue-50 text-blue-700 border-blue-300 dark:bg-blue-950/70 dark:text-blue-200 dark:border-blue-800',
    dot: 'bg-blue-600 dark:bg-blue-400',
  },
  IN_PROGRESS: {
    badge: 'bg-sky-50 text-sky-700 border-sky-300 dark:bg-sky-950/70 dark:text-sky-200 dark:border-sky-800',
    dot: 'bg-sky-500 dark:bg-sky-400',
  },
  WAITING_PARTS: {
    badge: 'bg-amber-50 text-amber-800 border-amber-300 dark:bg-amber-950/70 dark:text-amber-200 dark:border-amber-800',
    dot: 'bg-amber-500 dark:bg-amber-400',
  },
  COMPLETED: {
    badge: 'bg-emerald-50 text-emerald-700 border-emerald-300 dark:bg-emerald-950/70 dark:text-emerald-200 dark:border-emerald-800',
    dot: 'bg-emerald-600 dark:bg-emerald-400',
  },
  CANCELLED: {
    badge: 'bg-rose-50 text-rose-700 border-rose-300 dark:bg-rose-950/70 dark:text-rose-200 dark:border-rose-800',
    dot: 'bg-rose-600 dark:bg-rose-400',
  },
}

export function StatusBadge({ status, className }: { status: JobStatus; className?: string }) {
  const style = STATUS_BADGE_STYLE[status]
  return (
    <span
      className={cn(
        'inline-flex items-center gap-1.5 whitespace-nowrap rounded-full border px-2.5 py-0.5 text-xs font-semibold',
        style ? style.badge : STATUS_TONE[status],
        className,
      )}
    >
      <span className={cn('size-1.5 rounded-full shrink-0', style ? style.dot : 'bg-current')} />
      {STATUS_LABEL[status]}
    </span>
  )
}

export function JobNo({ children }: { children: React.ReactNode }) {
  return (
    <span className="font-ticket text-xs font-bold tracking-wide text-primary">{children}</span>
  )
}

export function EmptyState({
  icon: Icon,
  title,
  description,
  action,
}: {
  icon: LucideIcon
  title: string
  description?: string
  action?: React.ReactNode
}) {
  return (
    <div className="flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center">
      <span className="mb-4 grid size-14 place-items-center rounded-full bg-secondary text-primary">
        <Icon className="size-6" aria-hidden />
      </span>
      <p className="font-display text-lg font-semibold">{title}</p>
      {description && (
        <p className="mt-1 max-w-sm text-sm text-muted-foreground">{description}</p>
      )}
      {action && <div className="mt-5">{action}</div>}
    </div>
  )
}

export function RoleGate({ roles, children }: { roles: Role[]; children: React.ReactNode }) {
  const { currentUser } = useAppStore()
  if (!currentUser || !roles.includes(currentUser.role)) {
    return (
      <EmptyState
        icon={ShieldAlert}
        title="ไม่มีสิทธิ์เข้าถึงหน้านี้"
        description="หน้านี้สงวนไว้สำหรับบทบาทที่ได้รับอนุญาต หากคิดว่าเป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ"
        action={
          <Button asChild variant="outline">
            <Link to="/dashboard">กลับแดชบอร์ด</Link>
          </Button>
        }
      />
    )
  }
  return <>{children}</>
}

export function Panel({
  title,
  action,
  className,
  children,
}: {
  title?: string
  action?: React.ReactNode
  className?: string
  children: React.ReactNode
}) {
  return (
    <section className={cn('rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5', className)}>
      {title && (
        <div className="mb-4 flex items-center justify-between gap-2">
          <h2 className="font-display text-base font-semibold">{title}</h2>
          {action}
        </div>
      )}
      {children}
    </section>
  )
}
