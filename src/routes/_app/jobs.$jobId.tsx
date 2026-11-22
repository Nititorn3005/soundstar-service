import * as React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowRightLeft,
  Camera,
  Check,
  Copy,
  FileCheck2,
  FileSearch,
  PackageMinus,
  Pencil,
  RotateCcw,
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
  type Urgency,
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

const UNKNOWN_VALUE = '__UNKNOWN__'

interface ThaiAddressEntry {
  district: string // ตำบล/แขวง
  amphoe: string // อำเภอ/เขต
  province: string // จังหวัด
  zipcode: number | string
}

export const Route = createFileRoute('/_app/jobs/$jobId')({
  head: () => ({ meta: [{ title: 'รายละเอียดงานซ่อม · Hatyai Soundstar' }] }),
  component: JobDetail,
})

function cleanModel(model?: string): string {
  if (!model) return ''
  const trimmed = model.trim()
  return trimmed === '-' ? '' : trimmed
}

function formatBrandModel(job: RepairJob): string {
  const brand = job.brand?.trim() || ''
  const model = cleanModel(job.model)
  return [brand, model].filter(Boolean).join(' ') || '—'
}

function toLocalDateTimeInput(iso?: string): string {
  if (!iso) return ''
  const d = new Date(iso)
  if (Number.isNaN(d.getTime())) return ''
  const pad = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`
}

function parseThaiAddress(rawAddress?: string) {
  let rawAddr = rawAddress || ''
  let zipcode = ''
  let province = UNKNOWN_VALUE
  let amphoe = UNKNOWN_VALUE
  let district = UNKNOWN_VALUE

  const zipMatch = rawAddr.match(/\b(\d{5})\b/)
  if (zipMatch) {
    zipcode = zipMatch[1]
    rawAddr = rawAddr.replace(zipMatch[0], '').trim()
  }

  const provMatch = rawAddr.match(/(?:จ\.|จังหวัด)\s*([^\s]+)/)
  if (provMatch) {
    province = provMatch[1]
    rawAddr = rawAddr.replace(provMatch[0], '').trim()
  } else if (rawAddr.includes('กรุงเทพมหานคร')) {
    province = 'กรุงเทพมหานคร'
    rawAddr = rawAddr.replace('กรุงเทพมหานคร', '').trim()
  }

  const ampMatch = rawAddr.match(/(?:อ\.|อำเภอ|เขต)\s*([^\s]+)/)
  if (ampMatch) {
    amphoe = ampMatch[1]
    rawAddr = rawAddr.replace(ampMatch[0], '').trim()
  }

  const distMatch = rawAddr.match(/(?:ต\.|ตำบล|แขวง)\s*([^\s]+)/)
  if (distMatch) {
    district = distMatch[1]
    rawAddr = rawAddr.replace(distMatch[0], '').trim()
  }

  return {
    addressDetail: rawAddr.trim(),
    province,
    amphoe,
    district,
    zipcode,
  }
}

function JobDetail() {
  const { jobId } = Route.useParams()
  const { jobs, currentUser } = useAppStore()
  const job = jobs.find((j) => j.id === jobId)
  const canSee = job && (currentUser?.role !== 'TECH' || job.technicianId === currentUser.id)
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
  const { currentUser, profileName, inventory, company, moveStock } = useAppStore()
  const role = currentUser!.role
  const [statusOpen, setStatusOpen] = React.useState(false)
  const [partOpen, setPartOpen] = React.useState(false)
  const [editCustomerOpen, setEditCustomerOpen] = React.useState(false)
  const [copiedLine, setCopiedLine] = React.useState(false)
  const [returningPartIdx, setReturningPartIdx] = React.useState<number | null>(null)
  const [printMode, setPrintMode] = React.useState<'FIELD' | 'COMPLETE'>('FIELD')

  const next = allowedNextStatuses(job.status, role)
  const canWork = role === 'ADMIN' || (role === 'TECH' && job.technicianId === currentUser!.id)
  const canEditCustomer = role === 'ADMIN' || role === 'FRONT'
  const closed = job.status === 'COMPLETED' || job.status === 'CANCELLED'
  const brandLabel = job.brand?.trim() || 'ผู้ผลิต'
  const machineTypeLabel = job.applianceType || job.machineType || '—'
  const brandModelText = formatBrandModel(job)

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

  const handleCopyTechLine = async () => {
    const origin = typeof window !== 'undefined' ? window.location.origin : 'https://soundstar-service-01.netlify.app'
    const jobUrl = `${origin}/jobs/${job.id}`
    const techText = job.technicianId ? profileName(job.technicianId) : 'รอมอบหมายช่าง'
    const apptText = job.appointmentAt ? fmtDateTime(job.appointmentAt) : 'ตามสะดวก / นัดเพิ่ม'
    const snPart = job.serialNo && job.serialNo.trim() !== '-' ? ` (S/N: ${job.serialNo.trim()})` : ''

    const message = [
      `🔧 แจ้งงานซ่อม · Hatyai Soundstar`,
      `เลขที่ใบงาน: ${job.jobNo} (${STATUS_LABEL[job.status]})`,
      `ความเร่งด่วน: ${URGENCY_LABEL[job.urgency]} | นัดหมาย: ${apptText}`,
      `ช่างผู้รับผิดชอบ: ${techText}`,
      ``,
      `👤 ลูกค้า: ${job.customerName}${job.contactName ? ` (ติดต่อ: ${job.contactName})` : ''}`,
      `📞 โทร: ${job.phone}`,
      `📍 ที่อยู่: ${job.address}`,
      ``,
      `🧺 เครื่องซ่อม: ${brandModelText} (${machineTypeLabel})${snPart}`,
      `⚠️ อาการเสีย: ${job.symptom}`,
      ...(job.details ? [`📋 รายละเอียด: ${job.details}`] : []),
      ...(job.note ? [`📝 หมายเหตุ: ${job.note}`] : []),
      ``,
      `🔗 ดูรายละเอียด/อัปเดตงาน: ${jobUrl}`,
    ].join('\n')

    try {
      await navigator.clipboard.writeText(message)
      setCopiedLine(true)
      toast.success('คัดลอกข้อความแจ้งช่างแล้ว นำไปวางใน LINE ได้ทันที')
      setTimeout(() => setCopiedLine(false), 3000)
    } catch {
      toast.error('ไม่สามารถคัดลอกอัตโนมัติได้ กรุณาลองใหม่อีกครั้ง')
    }
  }

  const handleReturnPart = async (partId: string, qty: number, partName: string, idx: number) => {
    const confirmed = window.confirm(`ยืนยันคืนอะไหล่ "${partName}" จำนวน ${qty} ชิ้น กลับเข้าสต๊อกสำหรับใบงาน ${job.jobNo}?`)
    if (!confirmed) return
    setReturningPartIdx(idx)
    try {
      const res = await moveStock({
        partId,
        type: 'IN',
        qty,
        jobId: job.id,
        note: `คืนอะไหล่จากใบงาน ${job.jobNo}`,
      })
      if (!res.ok) return toast.error(res.error)
      toast.success(`คืน ${partName} × ${qty} เข้าสต๊อกแล้ว (คงเหลือ ${res.value.balanceAfter})`)
    } finally {
      setReturningPartIdx(null)
    }
  }

  return (
    <div className="mx-auto max-w-4xl print:m-0 print:max-w-none print:w-full print:p-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap');

        @media print {
          @page {
            size: A4 portrait;
            margin: 8mm 10mm !important;
          }
          html, body {
            height: auto !important;
            overflow: visible !important;
            background: white !important;
            color: black !important;
            font-family: 'Sarabun', 'TH Sarabun New', sans-serif !important;
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
          aside, nav, header, button, select, iframe, [class*="netlify"], .no-print {
            display: none !important;
          }
          main, [class*="sidebar"] {
            padding: 0 !important;
            margin: 0 !important;
            background: white !important;
          }
        }
      `}</style>

      {/* ==================== ฟอร์มพิมพ์: ใบช่างออกหน้างาน (FIELD) ==================== */}
      {printMode === 'FIELD' && (
        <div className="hidden print:block text-black" style={{ fontFamily: "'Sarabun', sans-serif" }}>
          <div className="flex items-start justify-between border-b-2 border-black pb-2">
            <div className="flex items-start gap-3">
              <img
                src="/logo.png"
                alt="โลโก้บริษัท หาดใหญ่ซาวด์สตาร์ จำกัด"
                className="h-14 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div>
                <h1 className="text-[19px] font-bold leading-tight">{company.nameTh}</h1>
                <p className="text-[11px] font-semibold text-gray-700">{company.nameEn}</p>
                <p className="text-[11px] leading-snug">{company.address}</p>
                <p className="text-[11px] font-semibold">โทร. {company.phones}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="inline-block border-2 border-black px-3 py-1 text-center">
                <p className="text-[16px] font-bold leading-tight">ใบปฏิบัติงานซ่อมหน้างาน</p>
                <p className="text-[10px] tracking-wider uppercase">FIELD SERVICE JOB SHEET</p>
              </div>
              <p className="mt-1.5 text-[15px] font-bold">
                เลขที่ใบงาน: <span className="underline">{job.jobNo}</span>
              </p>
              <p className="text-[11px]">
                ความเร่งด่วน: <span className="font-bold">{URGENCY_LABEL[job.urgency]}</span>
              </p>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-3 border border-black bg-gray-100 px-2.5 py-1.5 text-[12px]">
            <div>
              <span className="font-semibold">วันที่รับแจ้ง:</span> {fmtDateTime(job.receivedAt)}
            </div>
            <div>
              <span className="font-semibold">วันที่นัดหมาย:</span>{' '}
              <span className="font-bold">{job.appointmentAt ? fmtDateTime(job.appointmentAt) : 'ตามสะดวก / นัดเพิ่ม'}</span>
            </div>
            <div>
              <span className="font-semibold">ช่างผู้รับผิดชอบ:</span>{' '}
              <span className="font-bold">{job.technicianId ? profileName(job.technicianId) : '..............................'}</span>
            </div>
          </div>

          <div className="mt-2 grid grid-cols-2 gap-2.5">
            <div className="border border-black p-2.5">
              <h2 className="border-b border-black pb-1 text-[13px] font-bold">1. ข้อมูลลูกค้าและสถานที่ปฏิบัติงาน</h2>
              <div className="mt-1.5 space-y-1 text-[12px] leading-snug">
                <p>
                  <span className="font-semibold">ชื่อลูกค้า:</span>{' '}
                  <span className="text-[14px] font-bold">{job.customerName}</span>
                </p>
                <p>
                  <span className="font-semibold">เบอร์โทรศัพท์:</span>{' '}
                  <span className="text-[14px] font-bold">{job.phone}</span>
                  {job.contactName ? <span className="ml-2">(ติดต่อ: {job.contactName})</span> : null}
                </p>
                <p>
                  <span className="font-semibold">ที่อยู่ / สถานที่ติดตั้ง:</span> {job.address}
                </p>
              </div>
            </div>

            <div className="border border-black p-2.5">
              <h2 className="border-b border-black pb-1 text-[13px] font-bold">2. ข้อมูลเครื่องซ่อมและอาการเสีย</h2>
              <div className="mt-1.5 space-y-1 text-[12px] leading-snug">
                <p>
                  <span className="font-semibold">ประเภทเครื่อง:</span> <span className="font-bold">{machineTypeLabel}</span>
                </p>
                <p>
                  <span className="font-semibold">ยี่ห้อ / รุ่น:</span>{' '}
                  <span className="font-bold">{brandModelText}</span>
                  {job.serialNo && job.serialNo !== '-' ? <span className="ml-2">· S/N: {job.serialNo}</span> : null}
                </p>
                <p>
                  <span className="font-semibold">อาการเสียที่แจ้ง:</span>{' '}
                  <span className="font-bold underline">{job.symptom}</span>
                </p>
                {(job.details || job.note) && (
                  <p className="text-[11px]">
                    <span className="font-semibold">เพิ่มเติม/หมายเหตุ:</span>{' '}
                    {[job.details, job.note].filter(Boolean).join(' · ')}
                  </p>
                )}
              </div>
            </div>
          </div>

          <div className="mt-2 border border-black p-2.5">
            <div className="flex items-center justify-between border-b border-black pb-1">
              <h2 className="text-[13px] font-bold">3. บันทึกการตรวจเช็กและการปฏิบัติงานของช่าง (สำหรับช่างกรอกหน้างาน)</h2>
              <div className="text-[11px] font-semibold">
                เวลาเข้า: _____:_____ น. &nbsp;|&nbsp; เวลาเสร็จ: _____:_____ น.
              </div>
            </div>

            <div className="mt-2 space-y-2 text-[12px]">
              <div>
                <p className="font-semibold">สาเหตุ / อาการเสียที่ตรวจพบจริง:</p>
                <div className="mt-1 border-b border-dotted border-black pt-4" />
                <div className="mt-1 border-b border-dotted border-black pt-4" />
              </div>
              <div>
                <p className="font-semibold">รายละเอียดการซ่อม / การแก้ไข:</p>
                <div className="mt-1 border-b border-dotted border-black pt-4" />
                <div className="mt-1 border-b border-dotted border-black pt-4" />
              </div>
            </div>

            <div className="mt-2.5">
              <p className="mb-1 text-[12px] font-bold">รายการอะไหล่ที่เปลี่ยน / ค่าบริการหน้างาน:</p>
              <table className="w-full border-collapse border border-black text-[11px]">
                <thead>
                  <tr className="bg-gray-100">
                    <th className="w-10 border border-black py-1 text-center">ลำดับ</th>
                    <th className="border border-black px-2 py-1 text-left">รายการอะไหล่ / รายละเอียดค่าบริการ</th>
                    <th className="w-16 border border-black py-1 text-center">จำนวน</th>
                    <th className="w-24 border border-black py-1 text-right px-2">ราคา/หน่วย</th>
                    <th className="w-24 border border-black py-1 text-right px-2">จำนวนเงิน</th>
                  </tr>
                </thead>
                <tbody>
                  {[1, 2, 3, 4, 5].map((row) => (
                    <tr key={row}>
                      <td className="border border-black py-2 text-center">{row}</td>
                      <td className="border border-black px-2 py-2"></td>
                      <td className="border border-black py-2 text-center"></td>
                      <td className="border border-black px-2 py-2 text-right"></td>
                      <td className="border border-black px-2 py-2 text-right"></td>
                    </tr>
                  ))}
                  <tr className="bg-gray-50 font-bold">
                    <td colSpan={4} className="border border-black px-2 py-1 text-right">
                      รวมค่าใช้จ่ายทั้งสิ้น (บาท)
                    </td>
                    <td className="border border-black px-2 py-1 text-right"></td>
                  </tr>
                </tbody>
              </table>
            </div>

            <div className="mt-2.5 border-t border-black pt-2 text-[11.5px]">
              <p className="font-bold mb-1">สรุปผลการปฏิบัติงาน:</p>
              <div className="grid grid-cols-2 gap-1.5">
                <div>☐ ซ่อมสำเร็จ / ทดสอบเครื่องใช้งานได้ปกติ</div>
                <div>☐ รออะไหล่ / นัดเข้าดำเนินการซ่อมซ้ำ</div>
                <div>☐ ยกเครื่องกลับซ่อมที่ศูนย์บริการ</div>
                <div>☐ ลูกค้าไม่ประสงค์ซ่อม / ยกเลิกซ่อม</div>
              </div>
            </div>
          </div>

          <div className="mt-2 border border-black bg-gray-50 px-2.5 py-1.5 text-[11px] leading-snug">
            <p>
              <span className="font-bold">เงื่อนไขการรับประกัน:</span> อะไหล่แท้จาก{' '}
              <span className="font-bold underline">ศูนย์ {brandLabel}</span> รับประกัน 1 เดือน นับจากวันที่ส่งมอบงานซ่อม
              (เฉพาะอะไหล่รายการเดิมและอาการเสียเดิมเท่านั้น ไม่ครอบคลุมความเสียหายจากภัยธรรมชาติ ไฟตก/ไฟเกิน หรือการใช้งานผิดประเภท)
            </p>
          </div>

          <div className="mt-2.5 grid grid-cols-3 gap-4 border border-black p-2.5 text-center text-[11.5px]">
            <div>
              <p className="font-semibold">ผู้รับบริการ / ลูกค้า</p>
              <div className="mx-auto mt-7 w-4/5 border-b border-black" />
              <p className="mt-1">( ...................................................... )</p>
              <p className="mt-0.5 text-[10.5px]">วันที่ ........ / ........ / ............</p>
            </div>
            <div>
              <p className="font-semibold">ช่างผู้เข้าปฏิบัติงาน</p>
              <div className="mx-auto mt-7 w-4/5 border-b border-black" />
              <p className="mt-1">
                ( {job.technicianId ? profileName(job.technicianId) : '......................................................'} )
              </p>
              <p className="mt-0.5 text-[10.5px]">วันที่ ........ / ........ / ............</p>
            </div>
            <div>
              <p className="font-semibold">ผู้รับแจ้งงาน / เจ้าหน้าที่</p>
              <div className="mx-auto mt-7 w-4/5 border-b border-black" />
              <p className="mt-1">( {profileName(job.receivedBy)} )</p>
              <p className="mt-0.5 text-[10.5px]">วันที่ ........ / ........ / ............</p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== ฟอร์มพิมพ์: ใบซ่อมเสร็จ/ส่งคืน (COMPLETE) ==================== */}
      {printMode === 'COMPLETE' && (
        <div className="hidden print:block text-black" style={{ fontFamily: "'Sarabun', sans-serif" }}>
          <div className="flex items-start justify-between border-b-2 border-black pb-2">
            <div className="flex items-start gap-3">
              <img
                src="/logo.png"
                alt="โลโก้บริษัท หาดใหญ่ซาวด์สตาร์ จำกัด"
                className="h-14 w-auto object-contain"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
              <div>
                <h1 className="text-[19px] font-bold leading-tight">{company.nameTh}</h1>
                <p className="text-[11px] font-semibold text-gray-700">{company.nameEn}</p>
                <p className="text-[11px] leading-snug">{company.address}</p>
                <p className="text-[11px] font-semibold">โทร. {company.phones}</p>
              </div>
            </div>
            <div className="text-right shrink-0">
              <div className="inline-block border-2 border-black px-3 py-1 text-center">
                <p className="text-[16px] font-bold leading-tight">ใบส่งคืนสินค้าและรับประกันซ่อม</p>
                <p className="text-[10px] tracking-wider uppercase">COMPLETION &amp; DELIVERY RECEIPT</p>
              </div>
              <p className="mt-1.5 text-[15px] font-bold">
                เลขที่ใบงาน: <span className="underline">{job.jobNo}</span>
              </p>
              <p className="text-[11px]">สถานะ: <span className="font-bold">{STATUS_LABEL[job.status]}</span></p>
            </div>
          </div>

          <div className="mt-2.5 border border-black p-3 text-[12px]">
            <h2 className="border-b border-black pb-1 text-[13.5px] font-bold">ข้อมูลลูกค้าและเครื่องซ่อม</h2>
            <div className="mt-2 grid grid-cols-2 gap-x-4 gap-y-1.5">
              <p><span className="font-semibold">ชื่อลูกค้า:</span> <span className="font-bold text-[14px]">{job.customerName}</span></p>
              <p><span className="font-semibold">เบอร์โทรศัพท์:</span> <span className="font-bold">{job.phone}</span></p>
              <p className="col-span-2"><span className="font-semibold">ที่อยู่:</span> {job.address}</p>
              <p><span className="font-semibold">ประเภทเครื่อง:</span> {machineTypeLabel}</p>
              <p><span className="font-semibold">ยี่ห้อ / รุ่น:</span> {brandModelText} {job.serialNo && job.serialNo !== '-' ? `(S/N: ${job.serialNo})` : ''}</p>
              <p className="col-span-2"><span className="font-semibold">อาการเสียที่แจ้ง:</span> {job.symptom}</p>
            </div>
          </div>

          <div className="mt-2.5 border border-black p-3 text-[12px]">
            <h2 className="border-b border-black pb-1 text-[13.5px] font-bold">รายละเอียดผลการตรวจเช็กและการซ่อม</h2>
            <div className="mt-2 space-y-2">
              <p><span className="font-semibold">ผลการตรวจสอบ:</span> {job.diagnosis || '—'}</p>
              <p><span className="font-semibold">วิธีแก้ไข:</span> {job.resolution || '—'}</p>
              <p><span className="font-semibold">ผลการซ่อม:</span> <span className="font-bold">{job.result || '—'}</span></p>
            </div>

            {job.parts.length > 0 && (
              <div className="mt-3">
                <p className="mb-1 font-bold">รายการอะไหล่ที่ใช้:</p>
                <table className="w-full border-collapse border border-black text-[11.5px]">
                  <thead>
                    <tr className="bg-gray-100">
                      <th className="w-12 border border-black py-1 text-center">ลำดับ</th>
                      <th className="w-28 border border-black px-2 py-1 text-left">รหัสอะไหล่</th>
                      <th className="border border-black px-2 py-1 text-left">ชื่ออะไหล่</th>
                      <th className="w-20 border border-black py-1 text-center">จำนวน</th>
                    </tr>
                  </thead>
                  <tbody>
                    {job.parts.map((p, idx) => {
                      const item = inventory.find((x) => x.id === p.partId)
                      return (
                        <tr key={idx}>
                          <td className="border border-black py-1 text-center">{idx + 1}</td>
                          <td className="border border-black px-2 py-1">{item?.code || '-'}</td>
                          <td className="border border-black px-2 py-1">{item?.name || '-'}</td>
                          <td className="border border-black py-1 text-center">{p.qty} {item?.unit || ''}</td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            )}
          </div>

          <div className="mt-2.5 border border-black bg-gray-50 px-3 py-2 text-[11px] leading-snug">
            <p>
              <span className="font-bold">เงื่อนไขการรับประกัน:</span> อะไหล่แท้จาก{' '}
              <span className="font-bold underline">ศูนย์ {brandLabel}</span> รับประกัน 1 เดือน นับจากวันที่ส่งมอบงานซ่อม
              (เฉพาะอะไหล่รายการเดิมและอาการเสียเดิมเท่านั้น ไม่ครอบคลุมความเสียหายจากภัยธรรมชาติ ไฟตก/ไฟเกิน หรือการใช้งานผิดประเภท)
            </p>
          </div>

          <div className="mt-3 grid grid-cols-3 gap-4 border border-black p-3 text-center text-[11.5px]">
            <div>
              <p className="font-semibold">ลูกค้าผู้ตรวจรับมอบสินค้าคืน</p>
              <div className="mx-auto mt-8 w-4/5 border-b border-black" />
              <p className="mt-1">( ...................................................... )</p>
              <p className="mt-0.5 text-[10.5px]">วันที่ ........ / ........ / ............</p>
            </div>
            <div>
              <p className="font-semibold">ช่างผู้ดำเนินการซ่อม</p>
              <div className="mx-auto mt-8 w-4/5 border-b border-black" />
              <p className="mt-1">
                ( {job.technicianId ? profileName(job.technicianId) : '......................................................'} )
              </p>
              <p className="mt-0.5 text-[10.5px]">วันที่ ........ / ........ / ............</p>
            </div>
            <div>
              <p className="font-semibold">ผู้ส่งมอบสินค้า / ผู้ตรวจสอบ</p>
              <div className="mx-auto mt-8 w-4/5 border-b border-black" />
              <p className="mt-1">( {profileName(currentUser?.id || job.receivedBy)} )</p>
              <p className="mt-0.5 text-[10.5px]">วันที่ ........ / ........ / ............</p>
            </div>
          </div>
        </div>
      )}

      {/* ==================== หน้าจอปกติบนเว็บ (ซ่อนตอนพิมพ์) ==================== */}
      <div className="print:hidden">
        <div className="no-print mb-4">
          <Link to="/jobs" className="inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="size-4" /> รายการงานซ่อม
          </Link>
        </div>

        <div className="ticket-edge relative mb-4 overflow-hidden rounded-2xl bg-sidebar p-4 text-sidebar-accent-foreground sm:p-5">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div>
              <p className="font-ticket text-xl font-bold tracking-wide text-sidebar-primary">{job.jobNo}</p>
              <h1 className="mt-0.5 font-display text-3xl font-bold tracking-tight">{job.customerName}</h1>
              <p className="text-xs text-sidebar-foreground/80">
                รับแจ้ง {fmtDateTime(job.receivedAt)} · โดย {profileName(job.receivedBy)}
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <StatusBadge status={job.status} className="px-3 py-1 text-sm" />
              <span className={cn('rounded-full px-3 py-1 text-sm', job.urgency === 'URGENT' || job.urgency === 'HIGH' ? 'bg-destructive text-white' : 'bg-sidebar-accent')}>
                {URGENCY_LABEL[job.urgency]}
              </span>
            </div>
          </div>
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
            <Button
              type="button"
              onClick={handleCopyTechLine}
              className="bg-[#06C755] text-white hover:bg-[#05b34c]"
            >
              {copiedLine ? <Check className="size-4 mr-1" /> : <Copy className="size-4 mr-1" />}
              {copiedLine ? 'คัดลอกแล้ว!' : 'คัดลอกแจ้งช่างใน LINE'}
            </Button>
            <Button variant="secondary" onClick={() => handlePrint('FIELD')}>
              <Wrench className="size-4 mr-1" /> พิมพ์ใบช่างออกหน้างาน
            </Button>
            <Button variant="secondary" onClick={() => handlePrint('COMPLETE')}>
              <FileCheck2 className="size-4 mr-1" /> พิมพ์ใบซ่อมเสร็จ/ส่งคืน
            </Button>
          </div>
        </div>

        <div className="grid gap-4 lg:grid-cols-[1.4fr_1fr]">
          <div className="grid gap-4">
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
                <Item label="เบอร์โทรศัพท์" value={<a href={`tel:${job.phone}`} className="font-ticket text-primary hover:underline">{job.phone}</a>} />
                <Item label="ผู้ติดต่อ" value={job.contactName} />
                <Item label="ที่อยู่ / สถานที่ติดตั้ง" value={job.address} wide />
                <Item label="ประเภทเครื่อง" value={machineTypeLabel} />
                <Item label="ยี่ห้อ / รุ่น" value={brandModelText} />
                <Item label="หมายเลขเครื่อง" value={job.serialNo && job.serialNo !== '-' ? <span className="font-ticket">{job.serialNo}</span> : undefined} />
                <Item label="วันที่นัดหมาย" value={job.appointmentAt ? <span className={cn(isOverdue(job) && 'font-semibold text-destructive')}>{fmtDateTime(job.appointmentAt)}{isOverdue(job) && ' (เกินนัด)'}</span> : undefined} />
                <Item label="อาการเสีย" value={job.symptom} wide />
                <Item label="รายละเอียดเพิ่มเติม" value={job.details} wide />
                <Item label="หมายเหตุ" value={job.note} wide />
              </dl>
              {job.photos > 0 && (
                <p className="no-print mt-3 flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-1.5 text-xs text-muted-foreground">
                  <Camera className="size-4" /> รูปภาพประกอบ {job.photos} รูป
                </p>
              )}
            </Panel>

            <RepairNotes job={job} editable={canWork && !closed} />

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
                          <p className="font-medium">{item?.name || 'อะไหล่'}</p>
                          <p className="font-ticket text-[10px] text-muted-foreground">{item?.code} · {fmtDateTime(p.at)} · {profileName(p.by)}</p>
                        </div>
                        <div className="flex items-center gap-2">
                          <span className="font-ticket">× {p.qty} {item?.unit}</span>
                          {canWork && !closed && p.qty > 0 && (
                            <Button
                              type="button"
                              variant="ghost"
                              size="sm"
                              disabled={returningPartIdx === i}
                              onClick={() => handleReturnPart(p.partId, p.qty, item?.name || 'อะไหล่', i)}
                              className="no-print h-7 px-2 text-[11px] text-amber-700 hover:bg-amber-50 hover:text-amber-800"
                              title="คืนอะไหล่รายการนี้กลับเข้าสต๊อก"
                            >
                              <RotateCcw className="mr-1 size-3" />
                              {returningPartIdx === i ? 'กำลังคืน...' : 'คืนสต๊อก'}
                            </Button>
                          )}
                        </div>
                      </li>
                    )
                  })}
                </ul>
              )}
            </Panel>
          </div>

          <div className="grid h-fit gap-4">
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
      </div>

      <EditCustomerDialog job={job} open={editCustomerOpen} onOpenChange={setEditCustomerOpen} />
      <StatusDialog job={job} options={next} open={statusOpen} onOpenChange={setStatusOpen} />
      <IssuePartDialog job={job} open={partOpen} onOpenChange={setPartOpen} />
    </div>
  )
}

function Item({ label, value, wide }: { label: string; value?: React.ReactNode; wide?: boolean }) {
  return (
    <div className={cn(wide && 'sm:col-span-2')}>
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
            <Item label="ผลการตรวจสอบ" value={job.diagnosis} />
            <Item label="วิธีแก้ไข" value={job.resolution} />
            <Item label="ผลการซ่อม" value={job.result} />
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
  const [thaiDb, setThaiDb] = React.useState<ThaiAddressEntry[]>([])
  const [loadingThaiDb, setLoadingThaiDb] = React.useState(false)

  const initialParsed = React.useMemo(() => parseThaiAddress(job.address), [job.address])
  const [addressDetail, setAddressDetail] = React.useState(initialParsed.addressDetail)
  const [province, setProvince] = React.useState(initialParsed.province)
  const [amphoe, setAmphoe] = React.useState(initialParsed.amphoe)
  const [district, setDistrict] = React.useState(initialParsed.district)
  const [zipcode, setZipcode] = React.useState(initialParsed.zipcode)

  React.useEffect(() => {
    if (!open) return
    const parsed = parseThaiAddress(job.address)
    setAddressDetail(parsed.addressDetail)
    setProvince(parsed.province)
    setAmphoe(parsed.amphoe)
    setDistrict(parsed.district)
    setZipcode(parsed.zipcode)

    if (thaiDb.length > 0) return
    let active = true
    setLoadingThaiDb(true)
    fetch('https://raw.githubusercontent.com/earthchie/jquery.Thailand.js/master/jquery.Thailand.js/database/raw_database/raw_database.json')
      .then((res) => res.json())
      .then((data: ThaiAddressEntry[]) => {
        if (!active) return
        setThaiDb(data)
        setLoadingThaiDb(false)
      })
      .catch(() => {
        if (!active) return
        setLoadingThaiDb(false)
      })
    return () => {
      active = false
    }
  }, [open, job.address, thaiDb.length])

  const provinces = React.useMemo(() => {
    const set = new Set(thaiDb.map((d) => d.province))
    if (province && province !== UNKNOWN_VALUE) set.add(province)
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'))
  }, [thaiDb, province])

  const amphoes = React.useMemo(() => {
    if (!province || province === UNKNOWN_VALUE) return []
    const set = new Set(thaiDb.filter((d) => d.province === province).map((d) => d.amphoe))
    if (amphoe && amphoe !== UNKNOWN_VALUE) set.add(amphoe)
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'))
  }, [thaiDb, province, amphoe])

  const districts = React.useMemo(() => {
    if (!province || province === UNKNOWN_VALUE || !amphoe || amphoe === UNKNOWN_VALUE) return []
    const list = thaiDb
      .filter((d) => d.province === province && d.amphoe === amphoe)
      .sort((a, b) => a.district.localeCompare(b.district, 'th'))
    if (district && district !== UNKNOWN_VALUE && !list.some((d) => d.district === district)) {
      list.unshift({ district, amphoe, province, zipcode })
    }
    return list
  }, [thaiDb, province, amphoe, district, zipcode])

  const handleDistrictChange = (selectedDistrict: string) => {
    setDistrict(selectedDistrict)
    if (!selectedDistrict || selectedDistrict === UNKNOWN_VALUE) {
      setZipcode('')
      return
    }
    const found = districts.find((d) => d.district === selectedDistrict)
    if (found && found.zipcode) {
      setZipcode(String(found.zipcode))
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-h-[90vh] max-w-lg overflow-y-auto">
        <DialogHeader>
          <DialogTitle>แก้ไขข้อมูลลูกค้าและเครื่อง</DialogTitle>
          <DialogDescription>
            ปรับปรุงรายละเอียดข้อมูลลูกค้า วันนัดหมาย และเครื่องซ่อมสำหรับใบงาน <JobNo>{job.jobNo}</JobNo>
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-3"
          onSubmit={async (e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            const rawAppt = String(f.get('appointmentAt') || '').trim()
            const appointmentAt = rawAppt ? new Date(rawAppt).toISOString() : undefined

            const validProvince = province && province !== UNKNOWN_VALUE ? province : ''
            const validAmphoe = amphoe && amphoe !== UNKNOWN_VALUE ? amphoe : ''
            const validDistrict = district && district !== UNKNOWN_VALUE ? district : ''

            const isBkk = validProvince === 'กรุงเทพมหานคร'
            const subdistrictPrefix = isBkk ? 'แขวง' : 'ต.'
            const districtPrefix = isBkk ? 'เขต' : 'อ.'
            const provincePrefix = isBkk ? '' : 'จ.'

            const fullAddress = [
              addressDetail.trim(),
              validDistrict ? `${subdistrictPrefix}${validDistrict}` : '',
              validAmphoe ? `${districtPrefix}${validAmphoe}` : '',
              validProvince ? `${provincePrefix}${validProvince}` : '',
              zipcode.trim(),
            ]
              .filter(Boolean)
              .join(' ')

            if (!addressDetail.trim() && !validProvince) {
              return toast.error('กรุณากรอกที่อยู่หรือสถานที่ติดตั้ง')
            }

            const res = await updateJob(job.id, {
              customerName: String(f.get('customerName')),
              phone: String(f.get('phone')),
              contactName: String(f.get('contactName') || ''),
              address: fullAddress,
              urgency: String(f.get('urgency') || job.urgency) as Urgency,
              appointmentAt,
              machineType: String(f.get('machineType')),
              brand: String(f.get('brand')),
              model: String(f.get('model') || ''),
              serialNo: String(f.get('serialNo') || ''),
              symptom: String(f.get('symptom')),
              details: String(f.get('details') || ''),
              note: String(f.get('note') || ''),
            })
            if (!res.ok) return toast.error(res.error)
            toast.success('บันทึกการแก้ไขข้อมูลเรียบร้อยแล้ว')
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
            <Field label="ระดับความเร่งด่วน" htmlFor="urgency">
              <select id="urgency" name="urgency" className="native-select" defaultValue={job.urgency}>
                {(Object.keys(URGENCY_LABEL) as Urgency[]).map((u) => (
                  <option key={u} value={u}>
                    {URGENCY_LABEL[u]}
                  </option>
                ))}
              </select>
            </Field>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="วันที่นัดหมาย" htmlFor="appointmentAt">
              <Input
                id="appointmentAt"
                name="appointmentAt"
                type="datetime-local"
                defaultValue={toLocalDateTimeInput(job.appointmentAt)}
              />
            </Field>
            <Field label="ประเภทเครื่อง" htmlFor="machineType">
              <Input id="machineType" name="machineType" defaultValue={job.applianceType || job.machineType} required />
            </Field>
          </div>

          <Field label="บ้านเลขที่ / ซอย / ถนน / ชื่อสถานที่" htmlFor="edit-addressDetail">
            <Input
              id="edit-addressDetail"
              value={addressDetail}
              onChange={(e) => setAddressDetail(e.target.value)}
              placeholder="เช่น 123/4 หมู่ 2 ถ.เพชรเกษม"
            />
          </Field>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="จังหวัด" htmlFor="edit-province">
              <select
                id="edit-province"
                className="native-select"
                value={province}
                disabled={loadingThaiDb}
                onChange={(e) => {
                  const val = e.target.value
                  setProvince(val)
                  if (val === UNKNOWN_VALUE) {
                    setAmphoe(UNKNOWN_VALUE)
                    setDistrict(UNKNOWN_VALUE)
                  } else {
                    setAmphoe(UNKNOWN_VALUE)
                    setDistrict(UNKNOWN_VALUE)
                  }
                  setZipcode('')
                }}
              >
                <option value={UNKNOWN_VALUE}>— ไม่ทราบข้อมูล / ข้าม —</option>
                {provinces.map((p) => (
                  <option key={p} value={p}>{p}</option>
                ))}
              </select>
            </Field>

            <Field label="อำเภอ / เขต" htmlFor="edit-amphoe">
              <select
                id="edit-amphoe"
                className="native-select"
                value={amphoe}
                disabled={loadingThaiDb}
                onChange={(e) => {
                  const val = e.target.value
                  setAmphoe(val)
                  setDistrict(UNKNOWN_VALUE)
                  setZipcode('')
                }}
              >
                <option value={UNKNOWN_VALUE}>— ไม่ทราบข้อมูล / ข้าม —</option>
                {amphoes.map((a) => (
                  <option key={a} value={a}>{a}</option>
                ))}
              </select>
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-2">
            <Field label="ตำบล / แขวง" htmlFor="edit-district">
              <select
                id="edit-district"
                className="native-select"
                value={district}
                disabled={loadingThaiDb}
                onChange={(e) => handleDistrictChange(e.target.value)}
              >
                <option value={UNKNOWN_VALUE}>— ไม่ทราบข้อมูล / ข้าม —</option>
                {districts.map((d, idx) => (
                  <option key={`${d.district}-${idx}`} value={d.district}>
                    {d.district}
                  </option>
                ))}
              </select>
            </Field>

            <Field label="รหัสไปรษณีย์" htmlFor="edit-zipcode">
              <Input
                id="edit-zipcode"
                className="font-ticket"
                value={zipcode}
                onChange={(e) => setZipcode(e.target.value)}
                placeholder="รหัสไปรษณีย์ (ถ้าทราบ)"
              />
            </Field>
          </div>

          <div className="grid gap-3 sm:grid-cols-3">
            <Field label="ยี่ห้อ" htmlFor="brand">
              <Input id="brand" name="brand" defaultValue={job.brand} required />
            </Field>
            <Field label="รุ่น (ถ้ามี)" htmlFor="model">
              <Input id="model" name="model" defaultValue={cleanModel(job.model)} />
            </Field>
            <Field label="Serial No." htmlFor="serialNo">
              <Input id="serialNo" name="serialNo" defaultValue={job.serialNo === '-' ? '' : (job.serialNo || '')} />
            </Field>
          </div>
          <Field label="อาการเสีย" htmlFor="symptom">
            <Textarea id="symptom" name="symptom" defaultValue={job.symptom} rows={2} required />
          </Field>
          <Field label="รายละเอียดเพิ่มเติม" htmlFor="details">
            <Textarea id="details" name="details" defaultValue={job.details || ''} rows={2} />
          </Field>
          <Field label="หมายเหตุ" htmlFor="note">
            <Input id="note" name="note" defaultValue={job.note || ''} />
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
  const missingRepairNotes = !job.diagnosis?.trim() && !job.resolution?.trim() && !job.result?.trim()

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
            if (to === 'COMPLETED' && missingRepairNotes) {
              return toast.error('กรุณากรอกผลการตรวจสอบ วิธีแก้ไข หรือผลการซ่อม และกด "บันทึกผล" ก่อนปิดงาน')
            }
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
          {to === 'COMPLETED' && missingRepairNotes && (
            <p className="rounded-lg border border-amber-300 bg-amber-50 px-3 py-2 text-xs text-amber-800">
              ⚠️ ยังไม่ได้บันทึกผลการตรวจสอบ / วิธีแก้ไข / ผลการซ่อม กรุณากรอกและกด <strong>บันทึกผล</strong> ก่อนปิดงาน
            </p>
          )}
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
