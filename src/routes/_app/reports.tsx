import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import {
  AlertCircle,
  CheckCircle2,
  Clock,
  Download,
  FileBarChart,
  HardDrive,
  PackageCheck,
  Printer,
  Wrench,
} from 'lucide-react'

import { EmptyState, Field, JobNo, PageHeader, RoleGate, StatusBadge } from '@/components/app/shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { OPEN_STATUSES, STATUS_LABEL, STATUS_ORDER, TX_LABEL, fmtDateTime, type JobStatus } from '@/lib/domain'
import { useAppStore } from '@/lib/store'

export const Route = createFileRoute('/_app/reports')({
  head: () => ({ meta: [{ title: 'รายงาน · Hatyai Soundstar' }] }),
  component: () => (
    <RoleGate roles={['ADMIN']}>
      <Reports />
    </RoleGate>
  ),
})

type Kind = 'period' | 'open' | 'done' | 'stock'

function downloadCsv(name: string, rows: (string | number)[][]) {
  const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, '""')}"`).join(',')).join('\n')
  const url = URL.createObjectURL(new Blob(['\ufeff' + csv], { type: 'text/csv;charset=utf-8' }))
  const a = Object.assign(document.createElement('a'), { href: url, download: name })
  a.click()
  URL.revokeObjectURL(url)
}

function Reports() {
  const { jobs, transactions, inventory, profiles, profileName } = useAppStore()
  const [kind, setKind] = React.useState<Kind>('period')
  const [from, setFrom] = React.useState('')
  const [to, setTo] = React.useState('')
  const [status, setStatus] = React.useState<JobStatus | ''>('')
  const [tech, setTech] = React.useState('')

  const inRange = (iso: string) => {
    const d = iso.slice(0, 10)
    return (!from || d >= from) && (!to || d <= to)
  }

  const jobRows = jobs.filter(
    (j) =>
      inRange(j.receivedAt) &&
      (!tech || j.technicianId === tech) &&
      (kind === 'open' ? OPEN_STATUSES.includes(j.status) : kind === 'done' ? j.status === 'COMPLETED' : !status || j.status === status),
  )
  const txRows = transactions.filter((t) => inRange(t.at))

  // สรุปตัวเลขภาพรวม
  const summary = React.useMemo(() => {
    const periodJobs = jobs.filter((j) => inRange(j.receivedAt))
    const total = periodJobs.length
    const completed = periodJobs.filter((j) => j.status === 'COMPLETED').length
    const inProgress = periodJobs.filter((j) => ['IN_PROGRESS', 'WAITING_PARTS', 'WAITING_APPROVAL'].includes(j.status)).length
    const pending = periodJobs.filter((j) => ['RECEIVED', 'WAITING_ASSIGN', 'ASSIGNED'].includes(j.status)).length

    return { total, completed, inProgress, pending }
  }, [jobs, from, to])

  // สถิติเชิงลึก: ยี่ห้อ/รุ่นยอดฮิต, อะไหล่เบิกใช้บ่อย, อาการเสียยอดฮิต
  const extraStats = React.useMemo(() => {
    const periodJobs = jobs.filter((j) => inRange(j.receivedAt))

    // 1. ยี่ห้อ / รุ่นที่ซ่อมบ่อย 5 อันดับ
    const modelCounts: Record<string, number> = {}
    periodJobs.forEach((j) => {
      const brand = j.brand?.trim() || 'ไม่ระบุยี่ห้อ'
      const model = j.model && j.model.trim() !== '-' ? ` ${j.model.trim()}` : ''
      const type = j.applianceType?.trim() ? ` (${j.applianceType.trim()})` : ''
      const label = `${brand}${model}${type}`
      modelCounts[label] = (modelCounts[label] || 0) + 1
    })
    const topModels = Object.entries(modelCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // 2. อะไหล่ที่ถูกเบิกใช้บ่อย 5 อันดับ
    const outTxs = txRows.filter((t) => t.type === 'OUT')
    const totalIssuedParts = outTxs.reduce((sum, t) => sum + t.qty, 0)
    const partCounts: Record<string, { code: string; name: string; unit: string; qty: number }> = {}
    outTxs.forEach((t) => {
      const item = inventory.find((x) => x.id === t.partId)
      const key = t.partId
      if (!partCounts[key]) {
        partCounts[key] = {
          code: item?.code || '-',
          name: item?.name || 'อะไหล่ไม่ระบุชื่อ',
          unit: item?.unit || 'ชิ้น',
          qty: 0,
        }
      }
      partCounts[key].qty += t.qty
    })
    const topParts = Object.values(partCounts)
      .sort((a, b) => b.qty - a.qty)
      .slice(0, 5)

    // 3. อาการเสียยอดฮิต 5 อันดับ
    const symptomCounts: Record<string, number> = {}
    periodJobs.forEach((j) => {
      const s = j.symptom?.trim()
      if (!s) return
      symptomCounts[s] = (symptomCounts[s] || 0) + 1
    })
    const topSymptoms = Object.entries(symptomCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    return { topModels, topParts, totalIssuedParts, topSymptoms }
  }, [jobs, txRows, inventory, from, to])

  function exportCsv() {
    if (kind === 'stock') {
      downloadCsv('stock-movements.csv', [
        ['วันเวลา', 'ประเภท', 'รหัส', 'อะไหล่', 'จำนวน', 'คงเหลือ', 'ผู้ทำรายการ'],
        ...txRows.map((t) => {
          const i = inventory.find((x) => x.id === t.partId)
          return [fmtDateTime(t.at), TX_LABEL[t.type], i?.code ?? '', i?.name ?? '', t.qty, t.balanceAfter, profileName(t.by)]
        }),
      ])
    } else {
      downloadCsv(`repair-jobs-${kind}.csv`, [
        ['เลขที่ใบงาน', 'วันที่รับ', 'ลูกค้า', 'โทร', 'ยี่ห้อ', 'รุ่น', 'ช่าง', 'สถานะ'],
        ...jobRows.map((j) => [j.jobNo, fmtDateTime(j.receivedAt), j.customerName, j.phone, j.brand, j.model, profileName(j.technicianId), STATUS_LABEL[j.status]]),
      ])
    }
  }

  return (
    <>
      <PageHeader
        eyebrow="Reports"
        title="รายงานภาพรวมและสถิติ"
        actions={
          <>
            <Button variant="outline" size="lg" onClick={exportCsv}><Download /> ส่งออก CSV</Button>
            <Button variant="outline" size="lg" onClick={() => window.print()}><Printer /> พิมพ์</Button>
          </>
        }
      />

      {/* การ์ดสรุปตัวเลขภาพรวม */}
      <div className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <div className="rounded-2xl border border-border bg-card p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-muted-foreground">งานซ่อมทั้งหมด</span>
            <div className="rounded-xl bg-primary/10 p-2.5 text-primary">
              <Wrench className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold">{summary.total}</span>
            <span className="text-xs text-muted-foreground">ใบงาน</span>
          </div>
        </div>

        <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-emerald-700 dark:text-emerald-400">ซ่อมสำเร็จ</span>
            <div className="rounded-xl bg-emerald-500/20 p-2.5 text-emerald-600 dark:text-emerald-400">
              <CheckCircle2 className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-emerald-700 dark:text-emerald-400">{summary.completed}</span>
            <span className="text-xs text-emerald-600/80 dark:text-emerald-400/80">ใบงาน</span>
          </div>
        </div>

        <div className="rounded-2xl border border-amber-500/20 bg-amber-500/5 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-amber-700 dark:text-amber-400">กำลังซ่อม / รออะไหล่</span>
            <div className="rounded-xl bg-amber-500/20 p-2.5 text-amber-600 dark:text-amber-400">
              <Clock className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-amber-700 dark:text-amber-400">{summary.inProgress}</span>
            <span className="text-xs text-amber-600/80 dark:text-amber-400/80">ใบงาน</span>
          </div>
        </div>

        <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-5 shadow-sm">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium text-blue-700 dark:text-blue-400">รับแจ้ง / รอมอบหมาย</span>
            <div className="rounded-xl bg-blue-500/20 p-2.5 text-blue-600 dark:text-blue-400">
              <HardDrive className="h-5 w-5" />
            </div>
          </div>
          <div className="mt-3 flex items-baseline gap-2">
            <span className="text-3xl font-bold text-blue-700 dark:text-blue-400">{summary.pending}</span>
            <span className="text-xs text-blue-600/80 dark:text-blue-400/80">ใบงาน</span>
          </div>
        </div>
      </div>

      <Tabs value={kind} onValueChange={(v) => setKind(v as Kind)} className="no-print mb-4">
        <TabsList className="h-auto flex-wrap">
          <TabsTrigger value="period">งานซ่อมตามช่วงเวลา</TabsTrigger>
          <TabsTrigger value="open">งานค้าง</TabsTrigger>
          <TabsTrigger value="done">งานสำเร็จ</TabsTrigger>
          <TabsTrigger value="stock">การเคลื่อนไหวสต๊อก</TabsTrigger>
        </TabsList>
      </Tabs>

      <div className="no-print mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="ตั้งแต่วันที่" htmlFor="r-from">
          <Input id="r-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-11 bg-card" />
        </Field>
        <Field label="ถึงวันที่" htmlFor="r-to">
          <Input id="r-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-11 bg-card" />
        </Field>
        {kind === 'period' && (
          <Field label="สถานะ" htmlFor="r-status">
            <select id="r-status" className="native-select" value={status} onChange={(e) => setStatus(e.target.value as JobStatus | '')}>
              <option value="">ทุกสถานะ</option>
              {STATUS_ORDER.map((s) => <option key={s} value={s}>{STATUS_LABEL[s]}</option>)}
            </select>
          </Field>
        )}
        {kind !== 'stock' && (
          <Field label="ช่าง" htmlFor="r-tech">
            <select id="r-tech" className="native-select" value={tech} onChange={(e) => setTech(e.target.value)}>
              <option value="">ทุกคน</option>
              {profiles.filter((p) => p.role === 'TECH').map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
            </select>
          </Field>
        )}
      </div>

      <p className="mb-3 text-sm text-muted-foreground">
        พบ {kind === 'stock' ? txRows.length : jobRows.length} รายการ
      </p>

      {(kind === 'stock' ? txRows.length : jobRows.length) === 0 ? (
        <EmptyState icon={FileBarChart} title="ไม่มีข้อมูลในช่วงที่เลือก" />
      ) : kind === 'stock' ? (
        <div className="rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันเวลา</TableHead><TableHead>ประเภท</TableHead><TableHead>อะไหล่</TableHead>
                <TableHead className="text-right">จำนวน</TableHead><TableHead className="text-right">คงเหลือ</TableHead><TableHead>ผู้ทำรายการ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {txRows.map((t) => (
                <TableRow key={t.id}>
                  <TableCell className="text-xs">{fmtDateTime(t.at)}</TableCell>
                  <TableCell>{TX_LABEL[t.type]}</TableCell>
                  <TableCell>{inventory.find((i) => i.id === t.partId)?.name}</TableCell>
                  <TableCell className="text-right font-ticket">{t.qty}</TableCell>
                  <TableCell className="text-right font-ticket">{t.balanceAfter}</TableCell>
                  <TableCell>{profileName(t.by)}</TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>เลขที่ใบงาน</TableHead><TableHead>วันที่รับ</TableHead><TableHead>ลูกค้า</TableHead>
                <TableHead>เครื่อง</TableHead><TableHead>ช่าง</TableHead><TableHead>สถานะ</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {jobRows.map((j) => (
                <TableRow key={j.id}>
                  <TableCell><JobNo>{j.jobNo}</JobNo></TableCell>
                  <TableCell className="text-xs">{fmtDateTime(j.receivedAt)}</TableCell>
                  <TableCell>{j.customerName}</TableCell>
                  <TableCell>{j.brand} {j.model}</TableCell>
                  <TableCell>{profileName(j.technicianId)}</TableCell>
                  <TableCell><StatusBadge status={j.status} /></TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {/* สถิติเชิงลึกด้านล่างสุด: ยี่ห้อ/รุ่นยอดฮิต + อะไหล่เบิกบ่อย + อาการเสียยอดฮิต */}
      <div className="mt-6 grid grid-cols-1 gap-4 lg:grid-cols-3">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <Wrench className="h-4 w-4 text-primary" /> Top 5 ยี่ห้อ / รุ่นที่ซ่อมบ่อย
          </h3>
          <div className="space-y-2">
            {extraStats.topModels.length > 0 ? (
              extraStats.topModels.map(([label, count], idx) => (
                <div key={label} className="flex items-center justify-between gap-2 border-b border-border/50 pb-1.5 text-xs last:border-b-0">
                  <span className="truncate font-medium">
                    <span className="mr-1.5 font-ticket text-muted-foreground">#{idx + 1}</span>
                    {label}
                  </span>
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 font-semibold text-secondary-foreground">
                    {count} งาน
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">ไม่มีข้อมูลสถิติ</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <div className="mb-3 flex items-center justify-between">
            <h3 className="flex items-center gap-2 text-sm font-semibold text-foreground">
              <PackageCheck className="h-4 w-4 text-primary" /> Top 5 อะไหล่ที่เบิกใช้บ่อย
            </h3>
            <span className="rounded-md bg-primary/10 px-2 py-0.5 text-[11px] font-bold text-primary">
              รวม {extraStats.totalIssuedParts} ชิ้น
            </span>
          </div>
          <div className="space-y-2">
            {extraStats.topParts.length > 0 ? (
              extraStats.topParts.map((part, idx) => (
                <div key={`${part.code}-${idx}`} className="flex items-center justify-between gap-2 border-b border-border/50 pb-1.5 text-xs last:border-b-0">
                  <div className="min-w-0">
                    <p className="truncate font-medium">
                      <span className="mr-1.5 font-ticket text-muted-foreground">#{idx + 1}</span>
                      {part.name}
                    </p>
                    <p className="font-ticket text-[10px] text-muted-foreground">{part.code}</p>
                  </div>
                  <span className="shrink-0 rounded-full bg-amber-100 px-2.5 py-0.5 font-ticket font-bold text-amber-900">
                    {part.qty} {part.unit}
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">ยังไม่มีรายการเบิกอะไหล่ในช่วงเวลานี้</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-foreground">
            <AlertCircle className="h-4 w-4 text-primary" /> Top 5 อาการเสียยอดฮิต
          </h3>
          <div className="space-y-2">
            {extraStats.topSymptoms.length > 0 ? (
              extraStats.topSymptoms.map(([symptom, count], idx) => (
                <div key={symptom} className="flex items-center justify-between gap-2 border-b border-border/50 pb-1.5 text-xs last:border-b-0">
                  <span className="truncate font-medium">
                    <span className="mr-1.5 font-ticket text-muted-foreground">#{idx + 1}</span>
                    {symptom}
                  </span>
                  <span className="shrink-0 rounded-full bg-secondary px-2.5 py-0.5 font-semibold text-secondary-foreground">
                    {count} งาน
                  </span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">ไม่มีข้อมูลสถิติ</p>
            )}
          </div>
        </div>
      </div>
    </>
  )
}
