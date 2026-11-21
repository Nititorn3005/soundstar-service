import * as React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { ClipboardList, PlusCircle, Search, SearchX } from 'lucide-react'

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
import { STATUS_LABEL, STATUS_ORDER, URGENCY_LABEL, fmtDateTime, isOverdue, type JobStatus } from '@/lib/domain'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_app/jobs/')({
  head: () => ({ meta: [{ title: 'รายการงานซ่อม · Hatyai Soundstar' }] }),
  component: JobsList,
})

function JobsList() {
  const { jobs: allJobs, currentUser, profileName } = useAppStore()
  const [q, setQ] = React.useState('')
  const [status, setStatus] = React.useState<JobStatus | ''>('')
  const isTech = currentUser?.role === 'TECH'
  const jobs = isTech ? allJobs.filter((j) => j.technicianId === currentUser?.id) : allJobs

  const needle = q.trim().toLowerCase()
  const rows = jobs.filter(
    (j) =>
      (!status || j.status === status) &&
      (!needle ||
        [j.jobNo, j.customerName, j.phone, j.brand, j.model]
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

      <div className="mb-4 grid gap-3 sm:grid-cols-[1fr_14rem]">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="ค้นหาเลขที่ใบงาน ชื่อลูกค้า เบอร์โทร ยี่ห้อ รุ่น"
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
          action={<Button variant="outline" onClick={() => { setQ(''); setStatus('') }}>ล้างตัวกรอง</Button>}
        />
      ) : (
        <>
          {/* Mobile: ticket cards */}
          <ul className="grid gap-3 md:hidden">
            {rows.map((j) => (
              <li key={j.id}>
                <Link
                  to="/jobs/$jobId"
                  params={{ jobId: j.id }}
                  className="block rounded-2xl border border-border bg-card p-4 active:scale-[0.99] transition-transform"
                >
                  <div className="flex items-center justify-between gap-2">
                    <JobNo>{j.jobNo}</JobNo>
                    <StatusBadge status={j.status} />
                  </div>
                  <p className="mt-2 font-medium">{j.customerName}</p>
                  <p className="text-sm text-muted-foreground">{j.brand} {j.model} · {j.symptom}</p>
                  <div className="mt-3 flex justify-between border-t border-dashed border-border pt-2 text-xs text-muted-foreground">
                    <span>ช่าง: {j.technicianId ? profileName(j.technicianId) : 'ยังไม่มอบหมาย'}</span>
                    <span className={cn(isOverdue(j) && 'font-medium text-destructive')}>
                      นัด {fmtDateTime(j.appointmentAt)}
                    </span>
                  </div>
                </Link>
              </li>
            ))}
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
                {rows.map((j) => (
                  <TableRow key={j.id} className="group">
                    <TableCell>
                      <Link to="/jobs/$jobId" params={{ jobId: j.id }} className="hover:underline">
                        <JobNo>{j.jobNo}</JobNo>
                      </Link>
                      <p className="text-[11px] text-muted-foreground">{fmtDateTime(j.receivedAt)}</p>
                    </TableCell>
                    <TableCell>
                      <p className="font-medium">{j.customerName}</p>
                      <p className="font-ticket text-xs text-muted-foreground">{j.phone}</p>
                    </TableCell>
                    <TableCell className="max-w-64">
                      <p>{j.brand} {j.model}</p>
                      <p className="truncate text-xs text-muted-foreground">{j.symptom}</p>
                    </TableCell>
                    <TableCell className={cn(!j.technicianId && 'text-muted-foreground')}>
                      {j.technicianId ? profileName(j.technicianId) : '—'}
                    </TableCell>
                    <TableCell className={cn(isOverdue(j) && 'font-medium text-destructive')}>
                      {fmtDateTime(j.appointmentAt)}
                    </TableCell>
                    <TableCell>
                      <span className={cn('text-xs', (j.urgency === 'URGENT' || j.urgency === 'HIGH') && 'font-semibold text-destructive')}>
                        {URGENCY_LABEL[j.urgency]}
                      </span>
                    </TableCell>
                    <TableCell><StatusBadge status={j.status} /></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        </>
      )}
    </>
  )
}
