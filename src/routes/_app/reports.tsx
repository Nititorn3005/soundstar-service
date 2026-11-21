import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { CheckCircle2, Clock, Download, FileBarChart, HardDrive, PackageCheck, Printer, Wrench } from 'lucide-react'

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
  const url = URL.createObjectURL(new Blob(['﻿' + csv], { type: 'text/csv;charset=utf-8' }))
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

  // 🟢 คำนวณสรุปภาพรวม (ขั้นที่ 1)
  const summary = React.useMemo(() => {
    const periodJobs = jobs.filter((j) => inRange(j.receivedAt))
    const total = periodJobs.length
    const completed = periodJobs.filter((j) => j.status === 'COMPLETED').length
    const inProgress = periodJobs.filter((j) => ['IN_PROGRESS', 'WAITING_PARTS', 'WAITING_APPROVAL'].includes(j.status)).length
    const pending = periodJobs.filter((j) => ['RECEIVED', 'WAITING_ASSIGN', 'ASSIGNED'].includes(j.status)).length

    return { total, completed, inProgress, pending }
  }, [jobs, from, to])

  // 🟢 คำนวณสถิติยี่ห้อสินค้า + อะไหล่เบิกใช้ (ขั้นที่ 4 - แก้ไข Syntax Error วงเล็บแล้ว)
  const extraStats = React.useMemo(() => {
    const periodJobs = jobs.filter((j) => inRange(j.receivedAt))

    // นับสถิติยี่ห้อสินค้าที่ซ่อมบ่อย
    const brandCounts: Record<string, number> = {}
    periodJobs.forEach((j) => {
      const b = j.brand?.trim() || 'ไม่ระบุ'
      brandCounts[b] = (brandCounts[b] || 0) + 1
    })
    const topBrands = Object.entries(brandCounts)
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)

    // สรุปยอดเบิกอะไหล่ออก (แก้ไขวงเล็บ .filter((t) => t.type === 'ISSUE') เรียบร้อย)
    const totalIssuedParts = txRows
      .filter((t) => t.type === 'OUT')
      .reduce((sum, t) => sum + t.qty, 0)

    return { topBrands, totalIssuedParts }
  }, [jobs, txRows, from, to])

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

      {/* 🟢 การ์ดสรุปตัวเลขภาพรวม */}
      <div className="mb-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
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

      {/* 🟢 สถิติยี่ห้อและสรุปอะไหล่ด้านล่างสุด */}
      <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="rounded-2xl border border-border bg-card p-5">
          <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
            <Wrench className="h-4 w-4 text-primary" /> ยี่ห้อที่รับซ่อมบ่อยที่สุด 5 อันดับ
          </h3>
          <div className="space-y-2">
            {extraStats.topBrands.length > 0 ? (
              extraStats.topBrands.map(([brand, count]) => (
                <div key={brand} className="flex justify-between items-center text-sm border-b border-border/50 pb-1.5">
                  <span className="font-medium">{brand}</span>
                  <span className="text-xs px-2.5 py-0.5 rounded-full bg-secondary text-secondary-foreground font-semibold">{count} ใบงาน</span>
                </div>
              ))
            ) : (
              <p className="text-xs text-muted-foreground">ไม่มีข้อมูลสถิติ</p>
            )}
          </div>
        </div>

        <div className="rounded-2xl border border-border bg-card p-5 flex flex-col justify-between">
          <div>
            <h3 className="text-sm font-semibold text-foreground mb-3 flex items-center gap-2">
              <PackageCheck className="h-4 w-4 text-primary" /> การเบิกใช้อะไหล่รวม
            </h3>
            <p className="text-xs text-muted-foreground">จำนวนอะไหล่ทั้งหมดที่ถูกเบิกใช้งานตามช่วงเวลาที่เลือก</p>
          </div>
          <div className="mt-4 flex items-baseline gap-2">
            <span className="text-4xl font-bold text-primary">{extraStats.totalIssuedParts}</span>
            <span className="text-sm text-muted-foreground font-medium">ชิ้น</span>
          </div>
        </div>
      </div>
    </>
  )
}