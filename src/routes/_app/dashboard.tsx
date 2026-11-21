import { Link, createFileRoute } from '@tanstack/react-router'
import {
  AlertTriangle,
  CalendarClock,
  CheckCircle2,
  ClipboardList,
  Hammer,
  PackageX,
  PlusCircle,
  Sparkles,
  UserX,
  Wrench,
  type LucideIcon,
} from 'lucide-react'

import { EmptyState, JobNo, PageHeader, Panel, StatusBadge } from '@/components/app/shell'
import { Button } from '@/components/ui/button'
import { OPEN_STATUSES, fmtDateTime, isOverdue } from '@/lib/domain'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_app/dashboard')({
  head: () => ({ meta: [{ title: 'แดชบอร์ด · Hatyai Soundstar' }] }),
  component: Dashboard,
})

function sameDay(a: Date, b: Date) {
  return a.toDateString() === b.toDateString()
}

function Dashboard() {
  const { jobs: allJobs, inventory, profiles, currentUser } = useAppStore()
  const isTech = currentUser?.role === 'TECH'
  const jobs = isTech ? allJobs.filter((j) => j.technicianId === currentUser?.id) : allJobs
  const now = new Date()
  const lowStock = inventory.filter((i) => i.onHand < i.minQty || i.onHand === 0)

  const kpis: { label: string; value: number; icon: LucideIcon; tone?: string }[] = [
    { label: 'งานทั้งหมด', value: jobs.length, icon: ClipboardList },
    { label: 'งานใหม่วันนี้', value: jobs.filter((j) => sameDay(new Date(j.receivedAt), now)).length, icon: Sparkles },
    { label: 'ยังไม่มอบหมาย', value: jobs.filter((j) => !j.technicianId && OPEN_STATUSES.includes(j.status)).length, icon: UserX, tone: 'warn' },
    { label: 'กำลังดำเนินการ', value: jobs.filter((j) => j.status === 'IN_PROGRESS').length, icon: Hammer },
    { label: 'รออะไหล่', value: jobs.filter((j) => j.status === 'WAITING_PARTS').length, icon: PackageX, tone: 'warn' },
    { label: 'เกินกำหนดนัด', value: jobs.filter((j) => isOverdue(j, now)).length, icon: CalendarClock, tone: 'danger' },
    { label: 'ซ่อมสำเร็จ', value: jobs.filter((j) => j.status === 'COMPLETED').length, icon: CheckCircle2, tone: 'ok' },
    { label: 'อะไหล่ต่ำกว่าขั้นต่ำ', value: lowStock.length, icon: AlertTriangle, tone: 'danger' },
  ]

  const techs = profiles.filter((p) => p.role === 'TECH' && p.active)
  const workload = techs.map((t) => ({
    tech: t,
    open: allJobs.filter((j) => j.technicianId === t.id && OPEN_STATUSES.includes(j.status)).length,
    done: allJobs.filter((j) => j.technicianId === t.id && j.status === 'COMPLETED').length,
  }))
  const maxLoad = Math.max(1, ...workload.map((w) => w.open + w.done))
  const queue = jobs.filter((j) => OPEN_STATUSES.includes(j.status)).slice(0, 6)

  return (
    <>
      <PageHeader
        eyebrow={new Intl.DateTimeFormat('th-TH', { dateStyle: 'full', timeZone: 'Asia/Bangkok' }).format(now)}
        title={`สวัสดี ${currentUser?.fullName.split(' ')[0] ?? ''}`}
        description={isTech ? 'ภาพรวมงานที่ได้รับมอบหมายให้คุณ' : 'ภาพรวมงานซ่อมและสต๊อกอะไหล่วันนี้'}
        actions={
          !isTech && (
            <Button asChild size="lg">
              <Link to="/jobs/new">
                <PlusCircle /> รับแจ้งงานใหม่
              </Link>
            </Button>
          )
        }
      />

      <div className="grid grid-cols-2 gap-3 md:grid-cols-4">
        {kpis.map((k, i) => (
          <div
            key={k.label}
            style={{ animationDelay: `${i * 50}ms` }}
            className={cn(
              'relative overflow-hidden rounded-2xl border border-border bg-card p-4 animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 motion-reduce:animate-none',
              k.tone === 'danger' && k.value > 0 && 'border-destructive/40',
              k.tone === 'warn' && k.value > 0 && 'border-warn/60',
            )}
          >
            <k.icon
              aria-hidden
              className={cn(
                'size-5 text-muted-foreground',
                k.tone === 'danger' && k.value > 0 && 'text-destructive',
                k.tone === 'warn' && k.value > 0 && 'text-warn',
                k.tone === 'ok' && 'text-ok',
              )}
            />
            <p className="mt-3 font-display text-3xl font-bold tabular-nums">{k.value}</p>
            <p className="text-xs text-muted-foreground sm:text-sm">{k.label}</p>
          </div>
        ))}
      </div>

      <div className="mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]">
        <Panel
          title="คิวงานที่ยังเปิดอยู่"
          action={
            <Link to="/jobs" className="text-sm text-primary hover:underline">ดูทั้งหมด</Link>
          }
        >
          {queue.length === 0 ? (
            <EmptyState icon={Wrench} title="ไม่มีงานค้าง" description="งานทั้งหมดดำเนินการเสร็จแล้ว" />
          ) : (
            <ul className="divide-y divide-border">
              {queue.map((j) => (
                <li key={j.id}>
                  <Link
                    to="/jobs/$jobId"
                    params={{ jobId: j.id }}
                    className="flex flex-col gap-1 py-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-4 sm:px-2"
                  >
                    <div className="flex items-center gap-2 sm:w-36">
                      <JobNo>{j.jobNo}</JobNo>
                      {isOverdue(j, now) && (
                        <span className="rounded bg-destructive/10 px-1.5 text-[10px] font-medium text-destructive">เกินนัด</span>
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{j.customerName}</p>
                      <p className="truncate text-xs text-muted-foreground">
                        {j.brand} {j.model} · {j.symptom}
                      </p>
                    </div>
                    <div className="flex items-center justify-between gap-3 sm:justify-end">
                      <span className="text-xs text-muted-foreground">{fmtDateTime(j.appointmentAt)}</span>
                      <StatusBadge status={j.status} />
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </Panel>

        <div className="grid gap-6">
          <Panel title="อะไหล่ใกล้หมด" action={
            <Link to="/inventory" className="text-sm text-primary hover:underline">สต๊อก</Link>
          }>
            {lowStock.length === 0 ? (
              <p className="text-sm text-muted-foreground">ยอดอะไหล่ทุกรายการอยู่เหนือขั้นต่ำ</p>
            ) : (
              <ul className="grid gap-3">
                {lowStock.map((i) => (
                  <li key={i.id} className="flex items-center justify-between gap-3 text-sm">
                    <div className="min-w-0">
                      <p className="truncate font-medium">{i.name}</p>
                      <p className="font-ticket text-[11px] text-muted-foreground">{i.code}</p>
                    </div>
                    <span
                      className={cn(
                        'shrink-0 rounded-md px-2 py-0.5 font-ticket text-xs',
                        i.onHand === 0 ? 'bg-destructive text-white' : 'bg-warn/25',
                      )}
                    >
                      {i.onHand}/{i.minQty} {i.unit}
                    </span>
                  </li>
                ))}
              </ul>
            )}
          </Panel>

          {!isTech && (
            <Panel title="งานของช่างแต่ละคน">
              <ul className="grid gap-4">
                {workload.map((w) => (
                  <li key={w.tech.id}>
                    <div className="mb-1.5 flex justify-between text-sm">
                      <span className="font-medium">{w.tech.fullName}</span>
                      <span className="text-xs text-muted-foreground">
                        ค้าง {w.open} · เสร็จ {w.done}
                      </span>
                    </div>
                    <div className="flex h-2.5 overflow-hidden rounded-full bg-muted">
                      <div className="bg-highlight" style={{ width: `${(w.open / maxLoad) * 100}%` }} />
                      <div className="bg-ok" style={{ width: `${(w.done / maxLoad) * 100}%` }} />
                    </div>
                  </li>
                ))}
              </ul>
              <div className="mt-4 flex gap-4 text-xs text-muted-foreground">
                <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-highlight" />งานค้าง</span>
                <span className="flex items-center gap-1.5"><i className="size-2.5 rounded-full bg-ok" />ซ่อมสำเร็จ</span>
              </div>
            </Panel>
          )}
        </div>
      </div>
    </>
  )
}
