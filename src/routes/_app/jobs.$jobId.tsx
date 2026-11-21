import * as React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowRightLeft,
  Camera,
  FileCheck2,
  FileSearch,
  PackageMinus,
  Pencil,
  Save,
  Wrench,
} from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState, Field, JobNo, Panel, StatusBadge } from '@/components/app/shell'
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
import { Textarea } from '@/components/ui/textarea'
import {
  STATUS_LABEL,
  URGENCY_LABEL,
  allowedNextStatuses,
  fmtDateTime,
  isOverdue,
  type JobStatus,
  type RepairJob,
} from '@/lib/domain'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

const REPAIR_RESULT_OPTIONS = [
  'ซ่อมสำเร็จ / ใช้งานได้ปกติ',
  'เปลี่ยนอะไหล่แล้ว / ทดสอบผ่าน',
  'ปรับจูนและทำความสะอาด / ใช้งานได้ปกติ',
  'รออะไหล่ / นัดเข้าซ่อมซ้ำ',
  'ส่งซ่อมศูนย์ / ส่งซ่อมต่อ',
  'ลูกค้าไม่ประสงค์ซ่อม / ยกเลิกซ่อม',
  'ซ่อมไม่ได้ / ไม่คุ้มค่าซ่อม',
  'อื่นๆ',
]

export const Route = createFileRoute('/_app/jobs/$jobId')({
  head: () => ({ meta: [{ title: 'รายละเอียดงานซ่อม · Hatyai Soundstar' }] }),
  component: JobDetail,
})

function JobDetail() {
  const { jobId } = Route.useParams()
  const { jobs, currentUser } = useAppStore()
  const job = jobs.find((j) => j.id === jobId)
  const canSee =
    job && (currentUser?.role !== 'TECH' || job.technicianId === currentUser.id)

  if (!job || !canSee) {
    return (
      <EmptyState
        icon={FileSearch}
        title="ไม่พบใบงาน"
        description="ใบงานนี้อาจไม่มีอยู่ หรือคุณไม่มีสิทธิ์เข้าถึง"
        action={
          <Button asChild variant="outline">
            <Link to="/jobs">กลับรายการงานซ่อม</Link>
          </Button>
        }
      />
    )
  }
  return <JobView job={job} />
}

function JobView({ job }: { job: RepairJob }) {
  const { currentUser, profileName, inventory, company } = useAppStore()
  const role = currentUser!.role
  const [statusOpen, setStatusOpen] = React.useState(false)
  const [partOpen, setPartOpen] = React.useState(false)
  const [editCustomerOpen, setEditCustomerOpen] = React.useState(false)

  // สถานะเลือกรูปแบบการพิมพ์: 'FIELD' = ใบช่างออกหน้างาน, 'COMPLETE' = ใบซ่อมเสร็จ/ส่งคืน
  const [printMode, setPrintMode] = React.useState<'FIELD' | 'COMPLETE'>('FIELD')

  const next = allowedNextStatuses(job.status, role)
  const canWork = role === 'ADMIN' || (role === 'TECH' && job.technicianId === currentUser!.id)
  const canEditCustomer = role === 'ADMIN' || role === 'FRONT'
  const closed = job.status === 'COMPLETED' || job.status === 'CANCELLED'

  const historyList =
    Array.isArray(job.history) && job.history.length > 0
      ? [...job.history].reverse()
      : [
          {
            id: 'init',
            from: null,
            to: job.status,
            at: job.receivedAt,
            by: job.receivedBy,
            note: 'รับแจ้งงานซ่อมเข้าระบบ',
          },
        ]

  const handlePrint = (mode: 'FIELD' | 'COMPLETE') => {
    setPrintMode(mode)
    setTimeout(() => {
      window.print()
    }, 150)
  }

  return (
    <div className="mx-auto max-w-4xl print:m-0 print:box-border print:w-full print:p-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap');

        @media print {
          @page {
            size: A4 portrait;
            margin: 4mm 6mm !important;
          }
          html, body {
            height: 100% !important;
            overflow: hidden !important;
          }
          html, body, * {
            font-family: 'Sarabun', 'TH Sarabun New', sans-serif !important;
            background: white !important;
            color: black !important;
          }
          aside, nav, header, button, select, iframe, [class*="netlify"], .no-print {
            display: none !important;
          }
          .grid {
            gap: 8px !important;
          }
          [class*="rounded-"], .border {
            padding: 6px 10px !important;
            margin-bottom: 4px !important;
            border-color: #000 !important;
          }
          .print-header-title {
            font-size: 18px !important;
            font-weight: 700 !important;
            line-height: 1.1 !important;
          }
          .print-header-sub {
            font-size: 12px !important;
            line-height: 1.2 !important;
          }
          .print-job-no {
            font-size: 18px !important;
            font-weight: 700 !important;
          }
          h1.customer-name { 
            font-size: 22px !important; 
            line-height: 1.15 !important; 
            margin: 2px 0 !important; 
            font-weight: 700 !important;
          }
          h2, h3 { 
            font-size: 15px !important; 
            font-weight: 700 !important; 
            margin-bottom: 4px !important; 
            border-bottom: 1px solid #000 !important;
            padding-bottom: 1px !important;
          }
          p, span, li { 
            font-size: 13px !important; 
            line-height: 1.3 !important; 
          }
          dt {
            font-size: 11px !important;
            color: #333 !important;
            font-weight: 600 !important;
          }
          dd {
            font-size: 13.5px !important;
            font-weight: 700 !important;
          }
          .print-sig {
            font-size: 12px !important;
            font-weight: 600 !important;
          }
        }
      `}</style>

      {/* Header สำหรับพิมพ์ออกกระดาษ A4 */}
      <div className="hidden border-b border-black pb-1.5 print:block">
        <div className="flex justify-between items-start">
          <div>
            <p className="print-header-title font-bold">{company.nameTh}</p>
            <p className="print-header-sub">{company.nameEn} · {company.address} · โทร {company.phones}</p>
          </div>
          <div className="text-right">
            <p className="print-header-title font-bold">
              {printMode === 'FIELD' ? 'ใบปฏิบัติงานซ่อมหน้างาน' : 'ใบส่งคืนสินค้าและรับประกันซ่อม'}
            </p>
            <p className="print-header-sub">{printMode === 'FIELD' ? 'Field Service Sheet' : 'Completion Receipt'}</p>
          </div>
        </div>
      </div>

      <div className="no-print mb-4">
        <Link to="/jobs" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="size-4" /> รายการงานซ่อม
        </Link>
      </div>

      <div className="ticket-edge relative mb-4 overflow-hidden rounded-2xl bg-sidebar p-4 text-sidebar-accent-foreground sm:p-5 print:mb-1 print:bg-transparent print:p-0 print:text-foreground">
        <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
          <div>
            <p className="print-job-no font-ticket text-xl font-bold tracking-wide text-sidebar-primary print:text-foreground">{job.jobNo}</p>
            <h1 className="customer-name mt-0.5 font-display text-3xl font-bold tracking-tight">{job.customerName}</h1>
            <p className="text-xs text-sidebar-foreground/80 print:text-xs print:text-foreground">
              รับแจ้ง {fmtDateTime(job.receivedAt)} · โดย {profileName(job.receivedBy)}
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <StatusBadge status={job.status} className="px-3 py-1 text-sm print:text-xs print:font-bold" />
            <span className={cn('rounded-full px-3 py-1 text-sm print:text-xs print:font-bold', job.urgency === 'URGENT' || job.urgency === 'HIGH' ? 'bg-destructive text-white' : 'bg-sidebar-accent')}>
              {URGENCY_LABEL[job.urgency]}
            </span>
          </div>
        </div>

        {/* ปุ่มสั่งพิมพ์ 2 แบบ */}
        <div className="no-print mt-4 flex flex-wrap gap-2">
          {next.length > 0 && (canWork || role === 'FRONT') ? (
            <Button onClick={() => setStatusOpen(true)} className="bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90">
              <ArrowRightLeft /> เปลี่ยนสถานะ
            </Button>
          ) : null}
          {canWork && !closed && (
            <Button variant="secondary" onClick={() => setPartOpen(true)}>
              <PackageMinus /> เบิกอะไหล่
            </Button>
          )}
          <Button variant="secondary" onClick={() => handlePrint('FIELD')}>
            <Wrench className="size-4 mr-1" /> พิมพ์ใบช่างออกหน้างาน
          </Button>
          <Button variant="secondary" onClick={() => handlePrint('COMPLETE')}>
            <FileCheck2 className="size-4 mr-1" /> พิมพ์ใบซ่อมเสร็จ/ส่งคืน
          </Button>
        </div>
      </div>

      <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr] print:grid-cols-1 print:gap-1.5">
        <div className="grid gap-4 print:gap-1.5">
          {/* ข้อมูลลูกค้าและเครื่อง */}
          <Panel
            title="ข้อมูลลูกค้าและเครื่อง"
            action={
              canEditCustomer && !closed ? (
                <Button variant="ghost" size="sm" onClick={() => setEditCustomerOpen(true)} className="no-print h-8 text-xs">
                  <Pencil className="mr-1 size-3.5" /> แก้ไขข้อมูล
                </Button>
              ) : undefined
            }
          >
            <dl className="grid gap-x-4 gap-y-1.5 text-xs sm:grid-cols-2">
              <Item label="เบอร์โทรศัพท์" value={<a href={`tel:${job.phone}`} className="font-ticket text-primary hover:underline print:text-sm print:font-bold">{job.phone}</a>} />
              <Item label="ผู้ติดต่อ" value={job.contactName} printHideIfEmpty />
              <Item label="ที่อยู่ / สถานที่ติดตั้ง" value={job.address} wide />
              <Item label="ประเภทเครื่อง" value={job.machineType} />
              <Item label="ยี่ห้อ / รุ่น" value={`${job.brand} ${job.model}`} />
              <Item label="หมายเลขเครื่อง" value={job.serialNo ? <span className="font-ticket">{job.serialNo}</span> : undefined} printHideIfEmpty />
              <Item label="วันที่นัดหมาย" value={job.appointmentAt ? <span className={cn(isOverdue(job) && 'font-semibold text-destructive')}>{fmtDateTime(job.appointmentAt)}{isOverdue(job) && ' (เกินนัด)'}</span> : undefined} printHideIfEmpty />
              <Item label="อาการเสีย" value={job.symptom} wide />
              <Item label="รายละเอียดเพิ่มเติม" value={job.details} wide printHideIfEmpty />
              <Item label="หมายเหตุ" value={job.note} wide printHideIfEmpty />
            </dl>
            {job.photos > 0 && (
              <p className="no-print mt-3 flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-1.5 text-xs text-muted-foreground">
                <Camera className="size-4" /> รูปภาพประกอบ {job.photos} รูป
              </p>
            )}
          </Panel>

          <RepairNotes job={job} editable={canWork && !closed} />

          {/* อะไหล่ที่ใช้ (ซ่อนตอนพิมพ์) */}
          <div className="print:hidden">
            <Panel title="อะไหล่ที่ใช้">
              {job.parts.length === 0 ? (
                <p className="text-xs text-muted-foreground">ยังไม่มีการเบิกอะไหล่สำหรับงานนี้</p>
              ) : (
                <ul className="divide-y divide-border text-xs">
                  {job.parts.map((p, i) => {
                    const item = inventory.find((x) => x.id === p.partId)
                    return (
                      <li key={i} className="flex items-center justify-between gap-2 py-1.5">
                        <div>
                          <p className="font-medium">{item?.name}</p>
                          <p className="font-ticket text-[10px] text-muted-foreground">{item?.code} · {fmtDateTime(p.at)} · {profileName(p.by)}</p>
                        </div>
                        <span className="font-ticket">× {p.qty} {item?.unit}</span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Panel>
          </div>
        </div>

        <div className="grid h-fit gap-4 print:hidden">
          <AssignPanel job={job} />

          <Panel title="ประวัติการทำงาน">
            <ol className="relative ml-2 border-l-2 border-border pt-1">
              {historyList.map((h, i) => (
                <li key={h.id || i} className="relative pb-4 pl-4 last:pb-1">
                  <span
                    className={cn(
                      'absolute -left-[7px] top-1 size-3 rounded-full ring-4 ring-card',
                      i === 0 ? 'bg-highlight' : 'bg-border',
                    )}
                  />
                  <p className="text-xs font-semibold">
                    {h.from ? <>{STATUS_LABEL[h.from as JobStatus]} → </> : null}
                    {STATUS_LABEL[h.to as JobStatus] || h.to}
                  </p>
                  <p className="mt-0.5 text-[11px] text-muted-foreground">
                    {fmtDateTime(h.at)} {h.by ? `· ${profileName(h.by)}` : ''}
                  </p>
                  {h.note && (
                    <p className="mt-1 rounded-md bg-muted px-2 py-1 text-[11px] text-foreground/80">
                      {h.note}
                    </p>
                  )}
                </li>
              ))}
            </ol>
          </Panel>
        </div>
      </div>

      {/* สลับลายเซ็นต์ท้ายกระดาษตามประเภทใบงาน */}
      {printMode === 'FIELD' ? (
        <div className="mt-6 hidden grid-cols-3 gap-6 text-center text-xs print:grid print:text-xs">
          <div className="print-sig">
            <div className="mb-1 border-b border-black pt-8" />
            ( ลูกค้า / ผู้ยินยอมให้เข้าตรวจซ่อม )
          </div>
          <div className="print-sig">
            <div className="mb-1 border-b border-black pt-8" />
            ( ช่างผู้เข้าปฏิบัติงาน )
          </div>
          <div className="print-sig">
            <div className="mb-1 border-b border-black pt-8" />
            ( ผู้รับแจ้งงาน / เจ้าหน้าที่ )
          </div>
        </div>
      ) : (
        <div className="mt-6 hidden grid-cols-3 gap-6 text-center text-xs print:grid print:text-xs">
          <div className="print-sig">
            <div className="mb-1 border-b border-black pt-8" />
            ( ลูกค้าผู้ตรวจรับมอบสินค้าคืน )
          </div>
          <div className="print-sig">
            <div className="mb-1 border-b border-black pt-8" />
            ( ช่างผู้ดำเนินการซ่อม )
          </div>
          <div className="print-sig">
            <div className="mb-1 border-b border-black pt-8" />
            ( ผู้ส่งมอบสินค้า / ผู้ตรวจสอบ )
          </div>
        </div>
      )}

      <EditCustomerDialog job={job} open={editCustomerOpen} onOpenChange={setEditCustomerOpen} />
      <StatusDialog job={job} options={next} open={statusOpen} onOpenChange={setStatusOpen} />
      <IssuePartDialog job={job} open={partOpen} onOpenChange={setPartOpen} />
    </div>
  )
}

function Item({ label, value, wide, printHideIfEmpty }: { label: string; value?: React.ReactNode; wide?: boolean; printHideIfEmpty?: boolean }) {
  const isEmpty = !value
  return (
    <div className={cn(wide && 'sm:col-span-2', isEmpty && printHideIfEmpty && 'print:hidden')}>
      <dt className="text-xs text-muted-foreground">{label}</dt>
      <dd className="mt-0.5 font-medium">{value || '—'}</dd>
    </div>
  )
}

function RepairNotes({ job, editable }: { job: RepairJob; editable: boolean }) {
  const { updateJob } = useAppStore()
  const hasCustomResult = Boolean(job.result && !REPAIR_RESULT_OPTIONS.includes(job.result))

  return (
    <Panel title="ผลการตรวจสอบและการซ่อม">
      <form
        className="grid gap-4"
        onSubmit={async (e) => {
          e.preventDefault()
          const f = new FormData(e.currentTarget)
          const res = await updateJob(job.id, {
            diagnosis: String(f.get('diagnosis')),
            resolution: String(f.get('resolution')),
            result: String(f.get('result')),
          })
          if (res.ok) toast.success('บันทึกผลการซ่อมแล้ว')
          else toast.error(res.error)
        }}
      >
        {editable ? (
          <>
            <Field label="ผลการตรวจสอบ" htmlFor="diagnosis">
              <Textarea id="diagnosis" name="diagnosis" defaultValue={job.diagnosis} rows={2} />
            </Field>
            <Field label="วิธีแก้ไข" htmlFor="resolution">
              <Textarea id="resolution" name="resolution" defaultValue={job.resolution} rows={2} />
            </Field>
            <Field label="ผลการซ่อม" htmlFor="result">
              <select
                id="result"
                name="result"
                className="native-select"
                defaultValue={job.result ?? ''}
              >
                <option value="">— เลือกผลการซ่อม —</option>
                {hasCustomResult && (
                  <option value={job.result}>{job.result}</option>
                )}
                {REPAIR_RESULT_OPTIONS.map((opt) => (
                  <option key={opt} value={opt}>
                    {opt}
                  </option>
                ))}
              </select>
            </Field>
            <Button type="submit" variant="outline" className="no-print w-fit">
              <Save /> บันทึกผล
            </Button>
          </>
        ) : (
          <>
            <Item label="ผลการตรวจสอบ" value={job.diagnosis} printHideIfEmpty />
            <Item label="วิธีแก้ไข" value={job.resolution} printHideIfEmpty />
            <Item label="ผลการซ่อม" value={job.result} printHideIfEmpty />
          </>
        )}
      </form>
    </Panel>
  )
}

function AssignPanel({ job }: { job: RepairJob }) {
  const { currentUser, profiles, profileName, assignTechnician } = useAppStore()
  const techs = profiles.filter((p) => p.role === 'TECH' && p.active)
  const isAdmin = currentUser?.role === 'ADMIN'
  const closed = job.status === 'COMPLETED' || job.status === 'CANCELLED'

  return (
    <Panel title="ช่างผู้รับผิดชอบ">
      {isAdmin && !closed ? (
        <form
          className="flex flex-col gap-2 sm:flex-row"
          onSubmit={async (e) => {
            e.preventDefault()
            const id = String(new FormData(e.currentTarget).get('tech'))
            if (!id) return toast.error('กรุณาเลือกช่าง')
            const res = await assignTechnician(job.id, id)
            if (!res.ok) return toast.error(res.error)
            toast.success(`มอบหมายให้ ${profileName(id)} แล้ว`)
          }}
        >
          <select name="tech" aria-label="เลือกช่าง" className="native-select" defaultValue={job.technicianId ?? ''}>
            <option value="">— เลือกช่าง —</option>
            {techs.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
          </select>
          <Button type="submit" className="h-11 md:h-10">มอบหมาย</Button>
        </form>
      ) : (
        <p className="text-sm">{job.technicianId ? profileName(job.technicianId) : 'ยังไม่มอบหมาย'}</p>
      )}
    </Panel>
  )
}

function EditCustomerDialog({
  job,
  open,
  onOpenChange,
}: {
  job: RepairJob
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { updateJob } = useAppStore()
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลลูกค้าและเครื่อง</DialogTitle>
          <DialogDescription>
            ปรับปรุงรายละเอียดข้อมูลลูกค้าและเครื่องซ่อมสำหรับใบงาน <JobNo>{job.jobNo}</JobNo>
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            const res = await updateJob(job.id, {
              customerName: String(f.get('customerName')),
              phone: String(f.get('phone')),
              contactName: String(f.get('contactName') || ''),
              address: String(f.get('address') || ''),
              machineType: String(f.get('machineType')),
              brand: String(f.get('brand')),
              model: String(f.get('model')),
              serialNo: String(f.get('serialNo') || ''),
              symptom: String(f.get('symptom')),
              details: String(f.get('details') || ''),
              note: String(f.get('note') || ''),
            })
            if (!res.ok) return toast.error(res.error)
            toast.success('บันทึกการแก้ไขข้อมูลลูกค้าแล้ว')
            onOpenChange(false)
          }}
        >
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="ชื่อลูกค้า" htmlFor="customerName">
              <Input id="customerName" name="customerName" defaultValue={job.customerName} required />
            </Field>
            <Field label="เบอร์โทรศัพท์" htmlFor="phone">
              <Input id="phone" name="phone" defaultValue={job.phone} required />
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="ผู้ติดต่อ" htmlFor="contactName">
              <Input id="contactName" name="contactName" defaultValue={job.contactName || ''} />
            </Field>
            <Field label="ประเภทเครื่อง" htmlFor="machineType">
              <Input id="machineType" name="machineType" defaultValue={job.machineType} required />
            </Field>
          </div>
          <Field label="ที่อยู่ / สถานที่ติดตั้ง" htmlFor="address">
            <Input id="address" name="address" defaultValue={job.address || ''} />
          </Field>
          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="ยี่ห้อ" htmlFor="brand">
              <Input id="brand" name="brand" defaultValue={job.brand} required />
            </Field>
            <Field label="รุ่น" htmlFor="model">
              <Input id="model" name="model" defaultValue={job.model} required />
            </Field>
            <Field label="Serial No." htmlFor="serialNo">
              <Input id="serialNo" name="serialNo" defaultValue={job.serialNo || ''} />
            </Field>
          </div>
          <Field label="อาการเสีย" htmlFor="symptom">
            <Textarea id="symptom" name="symptom" defaultValue={job.symptom} rows={2} required />
          </Field>
          <Field label="รายละเอียดเพิ่มเติม" htmlFor="details">
            <Textarea id="details" name="details" defaultValue={job.details || ''} rows={2} />
          </Field>
          <DialogFooter className="mt-2">
            <Button type="submit">บันทึกการเปลี่ยนแปลง</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function StatusDialog({
  job,
  options,
  open,
  onOpenChange,
}: {
  job: RepairJob
  options: JobStatus[]
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { changeStatus } = useAppStore()
  const [to, setTo] = React.useState<JobStatus | ''>('')
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เปลี่ยนสถานะงาน</DialogTitle>
          <DialogDescription>
            สถานะปัจจุบัน: {STATUS_LABEL[job.status]} — ทุกการเปลี่ยนแปลงจะถูกบันทึกในประวัติพร้อมผู้ดำเนินการและเวลา
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            if (!to) return toast.error('กรุณาเลือกสถานะใหม่')
            const note = String(new FormData(e.currentTarget).get('note') ?? '')
            if (to === 'CANCELLED' && !note.trim()) return toast.error('กรุณาระบุเหตุผลการยกเลิก')
            const res = await changeStatus(job.id, to, note || undefined)
            if (!res.ok) return toast.error(res.error)
            toast.success(`เปลี่ยนสถานะเป็น “${STATUS_LABEL[to]}” แล้ว`)
            setTo('')
            onOpenChange(false)
          }}
        >
          <div className="grid gap-2" role="radiogroup" aria-label="สถานะใหม่">
            {options.map((s) => (
              <button
                key={s}
                type="button"
                role="radio"
                aria-checked={to === s}
                onClick={() => setTo(s)}
                className={cn(
                  'flex min-h-11 items-center justify-between rounded-lg border px-3 text-left text-sm transition-colors',
                  to === s ? 'border-highlight bg-accent/40' : 'border-border hover:bg-muted',
                )}
              >
                <StatusBadge status={s} />
                {to === s && <span className="text-xs text-primary">เลือกแล้ว</span>}
              </button>
            ))}
          </div>
          <Field label="หมายเหตุ" htmlFor="status-note" hint={to === 'CANCELLED' ? 'จำเป็นสำหรับการยกเลิก' : undefined}>
            <Textarea id="status-note" name="note" rows={2} />
          </Field>
          <DialogFooter>
            <Button type="submit" size="lg">ยืนยัน</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

function IssuePartDialog({
  job,
  open,
  onOpenChange,
}: {
  job: RepairJob
  open: boolean
  onOpenChange: (v: boolean) => void
}) {
  const { inventory, moveStock } = useAppStore()
  const [partId, setPartId] = React.useState('')
  const item = inventory.find((i) => i.id === partId)
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>เบิกอะไหล่สำหรับ <JobNo>{job.jobNo}</JobNo></DialogTitle>
          <DialogDescription>ระบบจะตัดสต๊อกและผูกรายการกับใบงานนี้ เบิกเกินยอดคงเหลือไม่ได้</DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const qty = Number(new FormData(e.currentTarget).get('qty'))
            const res = await moveStock({ partId, type: 'OUT', qty, jobId: job.id })
            if (!res.ok) return toast.error(res.error)
            toast.success(`เบิก ${item?.name} × ${qty} แล้ว คงเหลือ ${res.value.balanceAfter}`)
            setPartId('')
            onOpenChange(false)
          }}
        >
          <Field label="อะไหล่" htmlFor="issue-part">
            <select id="issue-part" className="native-select" value={partId} onChange={(e) => setPartId(e.target.value)} required>
              <option value="">— เลือกอะไหล่ —</option>
              {inventory.map((i) => (
                <option key={i.id} value={i.id} disabled={i.onHand === 0}>
                  {i.code} · {i.name} (คงเหลือ {i.onHand})
                </option>
              ))}
            </select>
          </Field>
          <Field label="จำนวน" htmlFor="issue-qty" hint={item ? `คงเหลือ ${item.onHand} ${item.unit}` : undefined}>
            <Input id="issue-qty" name="qty" type="number" min={1} max={item?.onHand} defaultValue={1} inputMode="numeric" className="h-11" required />
          </Field>
          <DialogFooter>
            <Button type="submit" size="lg" disabled={!partId}>ยืนยันการเบิก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
