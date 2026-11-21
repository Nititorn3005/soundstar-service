import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { KeyRound, Pencil, Search, UserPlus, Users } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState, Field, PageHeader, RoleGate } from '@/components/app/shell'
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
import { Switch } from '@/components/ui/switch'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { ROLE_LABEL, fmtDate, type Profile, type Role } from '@/lib/domain'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'
import { validateNewAccount, validatePassword, type AccountErrors } from '@/lib/validation'

export const Route = createFileRoute('/_app/users')({
  head: () => ({ meta: [{ title: 'จัดการผู้ใช้งาน · Hatyai Soundstar' }] }),
  component: () => (
    <RoleGate roles={['ADMIN']}>
      <UsersPage />
    </RoleGate>
  ),
})

const ROLES: Role[] = ['ADMIN', 'FRONT', 'TECH']

function UsersPage() {
  const { profiles, currentUser, updateUser } = useAppStore()
  const [q, setQ] = React.useState('')
  const [dialog, setDialog] = React.useState<
    { kind: 'add' } | { kind: 'edit'; p: Profile } | { kind: 'reset'; p: Profile } | null
  >(null)
  const needle = q.trim().toLowerCase()
  const rows = profiles.filter(
    (p) => !needle || `${p.fullName} ${p.username}`.toLowerCase().includes(needle),
  )

  return (
    <>
      <PageHeader
        eyebrow="Staff accounts"
        title="จัดการผู้ใช้งาน"
        description="สร้างบัญชีพนักงาน กำหนดบทบาท และระงับการใช้งานได้จากหน้านี้ ทุกการเปลี่ยนแปลงถูกบันทึกในประวัติ"
        actions={
          <Button size="lg" onClick={() => setDialog({ kind: 'add' })}>
            <UserPlus /> เพิ่มผู้ใช้งาน
          </Button>
        }
      />
      <div className="relative mb-4">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
        <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหาชื่อหรือชื่อผู้ใช้" aria-label="ค้นหาผู้ใช้งาน" className="h-11 bg-card pl-9" />
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={Users} title="ไม่พบผู้ใช้งาน" />
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ชื่อ-นามสกุล</TableHead>
                <TableHead>บทบาท</TableHead>
                <TableHead className="hidden sm:table-cell">สร้างเมื่อ</TableHead>
                <TableHead>สถานะ</TableHead>
                <TableHead className="text-right"><span className="sr-only">การจัดการ</span></TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((p) => {
                const self = p.id === currentUser?.id
                return (
                  <TableRow key={p.id}>
                    <TableCell>
                      <p className="font-medium">{p.fullName}{self && <span className="ml-1.5 text-xs text-muted-foreground">(คุณ)</span>}</p>
                      <p className="font-ticket text-xs text-muted-foreground">@{p.username}</p>
                    </TableCell>
                    <TableCell>
                      <span className={cn('rounded-md px-2 py-0.5 text-xs', p.role === 'ADMIN' ? 'bg-primary text-primary-foreground' : p.role === 'TECH' ? 'bg-accent text-accent-foreground' : 'bg-secondary')}>
                        {ROLE_LABEL[p.role]}
                      </span>
                    </TableCell>
                    <TableCell className="hidden text-xs sm:table-cell">{fmtDate(p.createdAt)}</TableCell>
                    <TableCell>
                      <label className="flex items-center gap-2 text-xs">
                        <Switch
                          checked={p.active}
                          disabled={self}
                          aria-label={p.active ? `ระงับบัญชี ${p.username}` : `เปิดใช้งานบัญชี ${p.username}`}
                          onCheckedChange={async (v) => {
                            const res = await updateUser(p.id, { active: v })
                            if (!res.ok) return toast.error(res.error)
                            toast.success(v ? `เปิดใช้งาน ${p.username} แล้ว` : `ระงับ ${p.username} แล้ว — ออกจากระบบทุกอุปกรณ์`)
                          }}
                        />
                        <span className={cn(!p.active && 'text-destructive')}>{p.active ? 'ใช้งาน' : 'ระงับ'}</span>
                      </label>
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end">
                        <Button variant="ghost" size="icon" aria-label={`แก้ไข ${p.username}`} onClick={() => setDialog({ kind: 'edit', p })}><Pencil /></Button>
                        <Button variant="ghost" size="icon" aria-label={`รีเซ็ตรหัสผ่าน ${p.username}`} disabled={self} onClick={() => setDialog({ kind: 'reset', p })}><KeyRound /></Button>
                      </div>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      {dialog?.kind === 'add' && <AddUserDialog onClose={() => setDialog(null)} />}
      {dialog?.kind === 'edit' && <EditUserDialog p={dialog.p} onClose={() => setDialog(null)} />}
      {dialog?.kind === 'reset' && <ResetDialog p={dialog.p} onClose={() => setDialog(null)} />}
    </>
  )
}

function AddUserDialog({ onClose }: { onClose: () => void }) {
  const { createUser } = useAppStore()
  const [errors, setErrors] = React.useState<AccountErrors>({})
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>เพิ่มผู้ใช้งาน</DialogTitle>
          <DialogDescription>พนักงานเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านนี้ ไม่ต้องใช้อีเมล</DialogDescription>
        </DialogHeader>
        <form
          noValidate
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            const errs = validateNewAccount(f)
            setErrors(errs)
            if (Object.keys(errs).length) return
            const res = await createUser({
              fullName: String(f.get('fullName')).trim(),
              username: String(f.get('username')),
              role: f.get('role') as Role,
              active: f.get('active') === 'on',
              phone: String(f.get('phone') ?? '') || undefined,
              password: String(f.get('password') ?? ''),
              confirm: String(f.get('confirm') ?? ''),
            })
            if (!res.ok) return setErrors({ username: res.error })
            toast.success(`สร้างบัญชี ${res.value.username} เรียบร้อย`)
            onClose()
          }}
        >
          <Field label="ชื่อ-นามสกุล" htmlFor="u-name" error={errors.fullName} required className="sm:col-span-2">
            <Input id="u-name" name="fullName" className="h-11" />
          </Field>
          <Field label="ชื่อผู้ใช้" htmlFor="u-username" error={errors.username} hint="เช่น tech03" required>
            <Input id="u-username" name="username" autoCapitalize="none" className="h-11 font-ticket" />
          </Field>
          <Field label="เบอร์โทร" htmlFor="u-phone">
            <Input id="u-phone" name="phone" type="tel" className="h-11 font-ticket" />
          </Field>
          <Field label="รหัสผ่าน" htmlFor="u-pw" error={errors.password} required>
            <Input id="u-pw" name="password" type="password" autoComplete="new-password" className="h-11" />
          </Field>
          <Field label="ยืนยันรหัสผ่าน" htmlFor="u-confirm" error={errors.confirm} required>
            <Input id="u-confirm" name="confirm" type="password" autoComplete="new-password" className="h-11" />
          </Field>
          <Field label="บทบาท" htmlFor="u-role" required>
            <select id="u-role" name="role" className="native-select" defaultValue="FRONT">
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </Field>
          <Field label="สถานะบัญชี" htmlFor="u-active">
            <label className="flex h-11 items-center gap-2 text-sm">
              <input id="u-active" name="active" type="checkbox" defaultChecked className="size-5 accent-[var(--primary)]" />
              เปิดใช้งานทันที
            </label>
          </Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" size="lg"><UserPlus /> สร้างบัญชี</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function EditUserDialog({ p, onClose }: { p: Profile; onClose: () => void }) {
  const { updateUser, currentUser } = useAppStore()
  const self = p.id === currentUser?.id
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลพนักงาน</DialogTitle>
          <DialogDescription className="font-ticket">@{p.username}</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            const patch: Partial<Profile> = {
              fullName: String(f.get('fullName')).trim(),
              phone: String(f.get('phone') ?? '') || undefined,
            }
            if (!self) patch.role = f.get('role') as Role
            const res = await updateUser(p.id, patch)
            if (!res.ok) return toast.error(res.error)
            toast.success('บันทึกข้อมูลแล้ว')
            onClose()
          }}
        >
          <Field label="ชื่อ-นามสกุล" htmlFor="e-name" required>
            <Input id="e-name" name="fullName" defaultValue={p.fullName} className="h-11" />
          </Field>
          <Field label="เบอร์โทร" htmlFor="e-phone">
            <Input id="e-phone" name="phone" defaultValue={p.phone} className="h-11 font-ticket" />
          </Field>
          <Field label="บทบาท" htmlFor="e-role" hint={self ? 'ไม่สามารถเปลี่ยนบทบาทของตัวเองได้' : undefined}>
            <select id="e-role" name="role" className="native-select" defaultValue={p.role} disabled={self}>
              {ROLES.map((r) => <option key={r} value={r}>{ROLE_LABEL[r]}</option>)}
            </select>
          </Field>
          <DialogFooter>
            <Button type="submit" size="lg">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function ResetDialog({ p, onClose }: { p: Profile; onClose: () => void }) {
  const { resetUserPassword } = useAppStore()
  const [error, setError] = React.useState('')
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>รีเซ็ตรหัสผ่าน</DialogTitle>
          <DialogDescription>
            ตั้งรหัสผ่านชั่วคราวให้ {p.fullName} ระบบจะบังคับให้เปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งถัดไป และออกจากระบบทุกอุปกรณ์เดิม
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            const errs = validatePassword(String(f.get('password')), String(f.get('confirm')))
            if (errs.password || errs.confirm) return setError(errs.password ?? errs.confirm ?? '')
            const res = await resetUserPassword(
              p.id,
              String(f.get('password') ?? ''),
              String(f.get('confirm') ?? ''),
            )
            if (!res.ok) return setError(res.error)
            toast.success(`รีเซ็ตรหัสผ่านของ ${p.username} แล้ว`)
            onClose()
          }}
        >
          <Field label="รหัสผ่านชั่วคราว" htmlFor="r-pw" required>
            <Input id="r-pw" name="password" type="password" autoComplete="new-password" className="h-11" />
          </Field>
          <Field label="ยืนยันรหัสผ่าน" htmlFor="r-confirm" error={error} required>
            <Input id="r-confirm" name="confirm" type="password" autoComplete="new-password" className="h-11" />
          </Field>
          <DialogFooter>
            <Button type="submit" size="lg"><KeyRound /> รีเซ็ตรหัสผ่าน</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
