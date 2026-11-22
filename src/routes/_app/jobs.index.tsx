import * as React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, ClipboardList, Clock, PlusCircle, Search, SearchX } from 'lucide-react'

import { EmptyState, JobNo, PageHeader, StatusBadge } from '@/components/app/shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import {
  STATUS_LABEL,
  STATUS_ORDER,
  URGENCY_LABEL,
  fmtDateTime,
  isOverdue,
  type JobStatus,
  type RepairJob,
} from '@/lib/domain'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_app/jobs/')({
  head: () => ({ meta: [{ title: 'รายการงานซ่อม · Hatyai Soundstar' }] }),
  component: JobsList,
})

function getStaleDays(job: RepairJob): number {
  if (job.status === 'COMPLETED' || job.status === 'CANCELLED') return 0
  const received = new Date(job.receivedAt).getTime()
  if (Number.isNaN(received)) return 0
  const diffDays = Math.floor((Date.now() - received) / (1000 * 60 * 60 * 24))
  return diffDays >= 2 ? diffDays : 0
}

function isAttentionNeeded(job: RepairJob): boolean {
  return isOverdue(job) || getStaleDays(job) >= 2
}

function formatMachineTitle(job: RepairJob): string {
  const brand = job.brand?.trim() || ''
  const model = job.model && job.model.trim() !== '-' ? job.model.trim() : ''
  const type = job.applianceType?.trim() || ''
  const main = [brand, model].filter(Boolean).join(' ')
  if (main && type) return `${main} (${type})`
  return main || type || '—'
}

function JobsList() {
  const { jobs: allJobs, currentUser, profileName } = useAppStore()
  const [q, setQ] = React.useState('')
  const [status, setStatus] = React.useState<JobStatus | ''>('')
  const [onlyAttention, setOnlyAttention] = React.useState(false)

  const isTech = currentUser?.role === 'TECH'
  const jobs = isTech ? allJobs.filter((j) => j.technicianId === currentUser?.id) : allJobs

  const overdueCount = jobs.filter((j) => isOverdue(j)).length
  const attentionCount = jobs.filter((j) => isAttentionNeeded(j)).length

  const needle = q.trim().toLowerCase()
  const rows = jobs.filter(
    (j) =>
      (!status || j.status === status) &&
      (!onlyAttention || isAttentionNeeded(j)) &&
      (!needle ||
        [j.jobNo, j.customerName, j.phone, j.applianceType, j.brand, j.model, j.serialNo]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()
          .includes(needle)),
  )

  return (
    <>
      <PageHeader
        eyebrow="Repair jobs"
        title="รายการงานซ่อม"
        description={isTech ? 'แสดงเฉพาะงานที่ได้รับมอบหมายให้คุณ' : `ทั้งหมด ${jobs.length} ใบงาน`}
        actions={
          !isTech && (
            <Button asChild size="lg">
              <Link to="/jobs/new"><PlusCircle /> รับแจ้งงานซ่อม</Link>
            </Button>
          )
        }
      />

      {attentionCount > 0 && (
        <div className="mb-4 flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-amber-300 bg-amber-50/90 px-4 py-3 text-xs text-amber-950">
          <div className="flex items-center gap-2.5">
            <AlertTriangle className="size-4 shrink-0 text-amber-600" aria-hidden />
            <span>
              พบงานที่ต้องติดตามเร่งด่วน <strong className="font-bold">{attentionCount} ใบงาน</strong>
              {overdueCount > 0 && (
                <> (เกินกำหนดนัด <strong className="text-destructive">{overdueCount} งาน</strong>)</>
              )}
            </span>
          </div>
          <Button
            type="button"
            size="sm"
            variant={onlyAttention ? 'default' : 'outline'}
            className="h-8 text-xs"
            onClick={() => setOnlyAttention((v) => !v)}
          >
            {onlyAttention ? 'แสดงงานทั้งหมด' : `กรองเฉพาะงานค้าง / เกินนัด (${attentionCount})`}
          </Button>
        </div>
      )}

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_14rem]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาเลขที่ใบงาน ชื่อลูกค้า เบอร์โทร ประเภทเครื่อง ยี่ห้อ รุ่น S/N"
            aria-label="ค้นหางานซ่อม"
            className="h-11 bg-card pl-9"
          />
        </div>
        <select
          aria-label="กรองสถานะ"
          className="native-select"
          value={status}
          onChange={(e) => setStatus(e.target.value as JobStatus | '')}
        >
          <option value="">ทุกสถานะ</option>
          {STATUS_ORDER.map((s) => (
            <option key={s} value={s}>{STATUS_LABEL[s]}</option>
          ))}
        </select>
      </div>

      {jobs.length === 0 ? (
        <EmptyState icon={ClipboardList} title="ยังไม่มีใบงาน" description="เมื่อมีการรับแจ้งงานซ่อม ใบงานจะแสดงที่นี่" />
      ) : rows.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="ไม่พบใบงานที่ตรงกับการค้นหา"
          action={
            <Button
              variant="outline"
              onClick={() => {
                setQ('')
                setStatus('')
                setOnlyAttention(false)
              }}
            >
              ล้างตัวกรอง
            </Button>
          }
        />
      ) : (
        <>
          {/* Mobile: ticket cards */}
          <ul className="grid gap-3 md:hidden">
            {rows.map((j) => {
              const overdue = isOverdue(j)
              const staleDays = getStaleDays(j)
              return (
                <li key={j.id}>
                  <Link
                    to="/jobs/$jobId"
                    params={{ jobId: j.id }}
                    className={cn(
                      'block rounded-2xl border bg-card p-4 active:scale-[0.99] transition-transform',
                      overdue ? 'border-destructive/60 bg-destructive/[0.03]' : 'border-border',
                    )}
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-1.5">
                        <JobNo>{j.jobNo}</JobNo>
                        {overdue && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-semibold text-white">
                            <AlertTriangle className="size-2.5" /> เกินนัด
                          </span>
                        )}
                        {!overdue && staleDays > 0 && (
                          <span className="inline-flex items-center gap-1 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                            <Clock className="size-2.5" /> ค้าง {staleDays} วัน
                          </span>
                        )}
                      </div>
                      <StatusBadge status={j.status} />
                    </div>
                    <p className="mt-2 font-medium">{j.customerName}</p>
                    <p className="text-sm text-muted-foreground">{formatMachineTitle(j)} · {j.symptom}</p>
                    <div className="mt-3 flex justify-between border-t border-dashed border-border pt-2 text-xs text-muted-foreground">
                      <span>ช่าง: {j.technicianId ? profileName(j.technicianId) : 'ยังไม่มอบหมาย'}</span>
                      <span className={cn(overdue && 'font-semibold text-destructive')}>
                        {j.appointmentAt ? `นัด ${fmtDateTime(j.appointmentAt)}` : 'ยังไม่ระบุนัด'}
                      </span>
                    </div>
                  </Link>
                </li>
              )
            })}
          </ul>

          {/* Desktop: table */}
          <div className="hidden rounded-2xl border border-border bg-card md:block">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>เลขที่ใบงาน</TableHead>
                  <TableHead>ลูกค้า</TableHead>
                  <TableHead>เครื่อง / อาการ</TableHead>
                  <TableHead>ช่าง</TableHead>
                  <TableHead>นัดหมาย</TableHead>
                  <TableHead>ความเร่งด่วน</TableHead>
                  <TableHead>สถานะ</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {rows.map((j) => {
                  const overdue = isOverdue(j)
                  const staleDays = getStaleDays(j)
                  return (
                    <TableRow
                      key={j.id}
                      className={cn('group', overdue && 'bg-destructive/[0.04] hover:bg-destructive/[0.08]')}
                    >
                      <TableCell>
                        <div className="flex flex-wrap items-center gap-1.5">
                          <Link to="/jobs/$jobId" params={{ jobId: j.id }} className="hover:underline">
                            <JobNo>{j.jobNo}</JobNo>
                          </Link>
                          {overdue && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-destructive px-2 py-0.5 text-[10px] font-semibold text-white">
                              <AlertTriangle className="size-2.5" /> เกินนัด
                            </span>
                          )}
                          {!overdue && staleDays > 0 && (
                            <span className="inline-flex items-center gap-0.5 rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-semibold text-amber-800">
                              <Clock className="size-2.5" /> ค้าง {staleDays} วัน
                            </span>
                          )}
                        </div>
                        <p className="text-[11px] text-muted-foreground">{fmtDateTime(j.receivedAt)}</p>
                      </TableCell>
                      <TableCell>
                        <p className="font-medium">{j.customerName}</p>
                        <p className="font-ticket text-xs text-muted-foreground">{j.phone}</p>
                      </TableCell>
                      <TableCell className="max-w-64">
                        <p className="font-medium">{formatMachineTitle(j)}</p>
                        <p className="truncate text-xs text-muted-foreground">{j.symptom}</p>
                      </TableCell>
                      <TableCell className={cn(!j.technicianId && 'text-muted-foreground')}>
                        {j.technicianId ? profileName(j.technicianId) : '—'}
                      </TableCell>
                      <TableCell className={cn(overdue && 'font-semibold text-destructive')}>
                        {j.appointmentAt ? fmtDateTime(j.appointmentAt) : '—'}
                      </TableCell>
                      <TableCell>
                        <span
                          className={cn(
                            'text-xs',
                            (j.urgency === 'URGENT' || j.urgency === 'HIGH') && 'font-semibold text-destructive',
                          )}
                        >
                          {URGENCY_LABEL[j.urgency]}
                        </span>
                      </TableCell>
                      <TableCell><StatusBadge status={j.status} /></TableCell>
                    </TableRow>
                  )
                })}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </>
  )
}
