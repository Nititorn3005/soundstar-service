import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import {
  AlertTriangle,
  ArrowRight,
  Camera,
  Check,
  CheckCircle2,
  Copy,
  History,
  Loader2,
  Plus,
  Save,
  ShieldCheck,
  Trash2,
  UserCheck,
  X,
} from 'lucide-react'
import { toast } from 'sonner'

import { Field, PageHeader, Panel, RoleGate } from '@/components/app/shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MACHINE_TYPES, URGENCY_LABEL, fmtDateTime, type RepairJob, type UrgencyLevel } from '@/lib/domain'
import { useAppStore } from '@/lib/store'

export const Route = createFileRoute('/_app/jobs/new')({
  head: () => ({ meta: [{ title: 'รับแจ้งงานซ่อม · Hatyai Soundstar' }] }),
  component: () => (
    <RoleGate roles={['ADMIN', 'FRONT', 'TECH']}>
      <NewJob />
    </RoleGate>
  ),
})

const MAX_PHOTOS = 6
const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']
const WARRANTY_DAYS = 30
const UNKNOWN_VALUE = '__UNKNOWN__'

interface ThaiAddressEntry {
  district: string // ตำบล/แขวง
  amphoe: string // อำเภอ/เขต
  province: string // จังหวัด
  zipcode: number | string
}

interface JobItemState {
  applianceType: string
  brand: string
  model: string
  serialNumber?: string
  purchaseDate?: string
  symptom: string
  details?: string
}

interface WarrantyMatch {
  job: RepairJob
  completedAt: string
  daysSince: number
  daysRemaining: number
  matchedBy: 'เบอร์โทร' | 'Serial No.' | 'เบอร์โทรและ Serial No.'
}

type Errors = Partial<Record<'customerName' | 'phone' | 'address' | 'items' | 'photos', string>>

function getCompletedTimestamp(job: RepairJob): string | null {
  if (job.status !== 'COMPLETED') return null
  if (Array.isArray(job.history)) {
    const completedEntry = [...job.history].reverse().find((h) => h.to === 'COMPLETED')
    if (completedEntry?.at) return completedEntry.at
  }
  return (job as RepairJob & { updatedAt?: string }).updatedAt || job.receivedAt
}

function checkWarranty30Days(job: RepairJob): { completedAt: string; daysSince: number; daysRemaining: number } | null {
  const completedAt = getCompletedTimestamp(job)
  if (!completedAt) return null
  const completedMs = new Date(completedAt).getTime()
  if (Number.isNaN(completedMs)) return null
  const diffDays = Math.floor((Date.now() - completedMs) / (1000 * 60 * 60 * 24))
  if (diffDays < 0 || diffDays > WARRANTY_DAYS) return null
  return {
    completedAt,
    daysSince: diffDays,
    daysRemaining: Math.max(0, WARRANTY_DAYS - diffDays),
  }
}

function buildTechLineMessage(params: {
  job: RepairJob
  items: JobItemState[]
  techName: string
  note?: string
}): string {
  const { job, items, techName, note } = params
  const origin = typeof window !== 'undefined' ? window.location.origin : 'https://soundstar-service-01.netlify.app'
  const jobUrl = `${origin}/jobs/${job.id}`
  const urgencyText = URGENCY_LABEL[job.urgency] || 'ปกติ'
  const apptText = job.appointmentAt ? fmtDateTime(job.appointmentAt) : 'ตามสะดวก / นัดเพิ่ม'

  const machineLines = items.map((item, idx) => {
    const modelPart = item.model.trim() && item.model.trim() !== '-' ? ` รุ่น ${item.model.trim()}` : ''
    const snPart = item.serialNumber?.trim() ? ` (S/N: ${item.serialNumber.trim()})` : ''
    const prefix = items.length > 1 ? `  ${idx + 1}. ` : '  • '
    return `${prefix}${item.brand.trim()}${modelPart} (${item.applianceType})${snPart}\n     อาการ: ${item.symptom.trim()}`
  })

  return [
    `🔧 แจ้งงานซ่อมใหม่ · Hatyai Soundstar`,
    `เลขที่ใบงาน: ${job.jobNo}`,
    `ความเร่งด่วน: ${urgencyText} | นัดหมาย: ${apptText}`,
    `ช่างผู้รับผิดชอบ: ${techName}`,
    ``,
    `👤 ลูกค้า: ${job.customerName}`,
    `📞 โทร: ${job.phone}`,
    `📍 ที่อยู่: ${job.address}`,
    ``,
    `🧺 รายการเครื่องซ่อม (${items.length} เครื่อง):`,
    ...machineLines,
    ...(note?.trim() ? [``, `📝 หมายเหตุ: ${note.trim()}`] : []),
    ``,
    `🔗 ดูรายละเอียด/อัปเดตงาน: ${jobUrl}`,
  ].join('\n')
}

function NewJob() {
  const { createJob, profiles, currentUser, jobs } = useAppStore()
  const navigate = useNavigate()
  const [errors, setErrors] = React.useState<Errors>({})
  const [photos, setPhotos] = React.useState<File[]>([])
  const [pending, setPending] = React.useState(false)

  // เก็บข้อมูลใบงานที่เพิ่งสร้างสำเร็จเพื่อแสดงปุ่มคัดลอกส่ง LINE ช่างทันที
  const [createdSummary, setCreatedSummary] = React.useState<{
    job: RepairJob
    lineText: string
  } | null>(null)
  const [copiedLine, setCopiedLine] = React.useState(false)

  // ข้อมูลลูกค้า (controlled เพื่อรองรับการดึงประวัติลูกค้าเดิมอัตโนมัติ)
  const [customerName, setCustomerName] = React.useState('')
  const [phone, setPhone] = React.useState('')
  const [contactName, setContactName] = React.useState('')
  const [note, setNote] = React.useState('')
  const [selectedHistoryCustomer, setSelectedHistoryCustomer] = React.useState<{
    customerName: string
    phone: string
    pastJobs: RepairJob[]
  } | null>(null)

  // ฐานข้อมูล จังหวัด / อำเภอ / ตำบล ของประเทศไทย
  const [thaiDb, setThaiDb] = React.useState<ThaiAddressEntry[]>([])
  const [loadingThaiDb, setLoadingThaiDb] = React.useState(true)
  const [addressDetail, setAddressDetail] = React.useState('')
  const [province, setProvince] = React.useState('สงขลา')
  const [amphoe, setAmphoe] = React.useState('หาดใหญ่')
  const [district, setDistrict] = React.useState('')
  const [zipcode, setZipcode] = React.useState('')

  React.useEffect(() => {
    let active = true
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
  }, [])

  // รายชื่อจังหวัดทั้งหมด (เรียงตามตัวอักษร)
  const provinces = React.useMemo(() => {
    const set = new Set(thaiDb.map((d) => d.province))
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'))
  }, [thaiDb])

  // รายชื่ออำเภอตามจังหวัดที่เลือก
  const amphoes = React.useMemo(() => {
    if (!province || province === UNKNOWN_VALUE) return []
    const set = new Set(thaiDb.filter((d) => d.province === province).map((d) => d.amphoe))
    return Array.from(set).sort((a, b) => a.localeCompare(b, 'th'))
  }, [thaiDb, province])

  // รายชื่อตำบลตามจังหวัดและอำเภอที่เลือก
  const districts = React.useMemo(() => {
    if (!province || province === UNKNOWN_VALUE || !amphoe || amphoe === UNKNOWN_VALUE) return []
    return thaiDb
      .filter((d) => d.province === province && d.amphoe === amphoe)
      .sort((a, b) => a.district.localeCompare(b.district, 'th'))
  }, [thaiDb, province, amphoe])

  // อัปเดตรหัสไปรษณีย์อัตโนมัติเมื่อเลือกตำบล
  const handleDistrictChange = (selectedDistrict: string) => {
    setDistrict(selectedDistrict)
    if (!selectedDistrict || selectedDistrict === UNKNOWN_VALUE) {
      setZipcode('')
      return
    }
    const found = districts.find((d) => d.district === selectedDistrict)
    if (found) {
      setZipcode(String(found.zipcode))
    } else {
      setZipcode('')
    }
  }

  // รายการเครื่องแจ้งซ่อม (เริ่มต้น 1 เครื่อง)
  const [items, setItems] = React.useState<JobItemState[]>([
    { applianceType: MACHINE_TYPES[0] || 'เครื่องซักฝาบน', brand: '', model: '', symptom: '' },
  ])

  // ตรวจจับประกันซ่อมซ้ำ 30 วันอัตโนมัติ (เช็กทั้งเบอร์โทรและ Serial No.)
  const warrantyMatches = React.useMemo<WarrantyMatch[]>(() => {
    const cleanPhone = phone.replace(/[-\s]/g, '')
    const serialNeedles = items
      .map((i) => (i.serialNumber || '').trim().toLowerCase())
      .filter((sn) => sn.length >= 4)

    if (cleanPhone.length < 9 && serialNeedles.length === 0) return []

    const results: WarrantyMatch[] = []
    for (const j of jobs) {
      const warrantyInfo = checkWarranty30Days(j)
      if (!warrantyInfo) continue

      const jPhone = j.phone.replace(/[-\s]/g, '')
      const jSn = (j.serialNo || '').trim().toLowerCase()

      const phoneMatched = cleanPhone.length >= 9 && jPhone === cleanPhone
      const snMatched = Boolean(jSn && jSn !== '-' && serialNeedles.some((sn) => jSn === sn || jSn.includes(sn)))

      if (!phoneMatched && !snMatched) continue

      results.push({
        job: j,
        completedAt: warrantyInfo.completedAt,
        daysSince: warrantyInfo.daysSince,
        daysRemaining: warrantyInfo.daysRemaining,
        matchedBy: phoneMatched && snMatched ? 'เบอร์โทรและ Serial No.' : snMatched ? 'Serial No.' : 'เบอร์โทร',
      })
    }
    return results.sort((a, b) => a.daysSince - b.daysSince)
  }, [jobs, phone, items])

  // ค้นหาประวัติลูกค้าเดิมจากชื่อหรือเบอร์โทรที่กำลังพิมพ์
  const matchingCustomers = React.useMemo(() => {
    const cleanPhone = phone.replace(/[-\s]/g, '')
    const cleanName = customerName.trim().toLowerCase()
    if (cleanPhone.length < 3 && cleanName.length < 2) return []

    const grouped = new Map<string, { customerName: string; phone: string; latestJob: RepairJob; pastJobs: RepairJob[] }>()
    for (const j of jobs) {
      const jPhone = j.phone.replace(/[-\s]/g, '')
      const jName = j.customerName.toLowerCase()
      const matchPhone = cleanPhone.length >= 3 && jPhone.includes(cleanPhone)
      const matchName = cleanName.length >= 2 && jName.includes(cleanName)
      if (!matchPhone && !matchName) continue

      const key = `${j.customerName.trim()}|${jPhone}`
      const existing = grouped.get(key)
      if (!existing) {
        grouped.set(key, { customerName: j.customerName, phone: j.phone, latestJob: j, pastJobs: [j] })
      } else {
        existing.pastJobs.push(j)
      }
    }
    return Array.from(grouped.values()).slice(0, 4)
  }, [jobs, customerName, phone])

  // ฟังก์ชันดึงข้อมูลลูกค้าเก่าลงฟอร์ม (พร้อมแยกที่อยู่ ต./อ./จ./รหัสไปรษณีย์ อัตโนมัติ)
  const applyCustomerHistory = (entry: {
    customerName: string
    phone: string
    latestJob: RepairJob
    pastJobs: RepairJob[]
  }) => {
    const j = entry.latestJob
    setCustomerName(j.customerName)
    setPhone(j.phone)
    setContactName(j.contactName || '')
    setSelectedHistoryCustomer({
      customerName: j.customerName,
      phone: j.phone,
      pastJobs: entry.pastJobs,
    })

    let rawAddr = j.address || ''
    const zipMatch = rawAddr.match(/\b(\d{5})\b/)
    if (zipMatch) {
      setZipcode(zipMatch[1])
      rawAddr = rawAddr.replace(zipMatch[0], '').trim()
    } else {
      setZipcode('')
    }

    const provMatch = rawAddr.match(/(?:จ\.|จังหวัด)\s*([^\s]+)/)
    if (provMatch) {
      setProvince(provMatch[1])
      rawAddr = rawAddr.replace(provMatch[0], '').trim()
    } else if (rawAddr.includes('กรุงเทพมหานคร')) {
      setProvince('กรุงเทพมหานคร')
      rawAddr = rawAddr.replace('กรุงเทพมหานคร', '').trim()
    } else {
      setProvince(UNKNOWN_VALUE)
    }

    const ampMatch = rawAddr.match(/(?:อ\.|อำเภอ|เขต)\s*([^\s]+)/)
    if (ampMatch) {
      setAmphoe(ampMatch[1])
      rawAddr = rawAddr.replace(ampMatch[0], '').trim()
    } else {
      setAmphoe(UNKNOWN_VALUE)
    }

    const distMatch = rawAddr.match(/(?:ต\.|ตำบล|แขวง)\s*([^\s]+)/)
    if (distMatch) {
      setDistrict(distMatch[1])
      rawAddr = rawAddr.replace(distMatch[0], '').trim()
    } else {
      setDistrict(UNKNOWN_VALUE)
    }

    setAddressDetail(rawAddr.trim())
    toast.success(`ดึงข้อมูลลูกค้า "${j.customerName}" เรียบร้อย`)
  }

  // ดึงข้อมูลเครื่องจากประวัติเก่าลงในรายการแจ้งซ่อม
  const applyMachineFromHistory = (pastJob: RepairJob) => {
    const newItem: JobItemState = {
      applianceType: pastJob.applianceType || MACHINE_TYPES[0] || 'เครื่องซักฝาบน',
      brand: pastJob.brand || '',
      model: pastJob.model && pastJob.model !== '-' ? pastJob.model : '',
      serialNumber: pastJob.serialNo && pastJob.serialNo !== '-' ? pastJob.serialNo : '',
      symptom: '',
    }
    setItems((prev) => {
      if (prev.length === 1 && !prev[0].brand && !prev[0].model && !prev[0].symptom) {
        return [newItem]
      }
      return [...prev, newItem]
    })
    toast.success(`เพิ่มข้อมูลเครื่อง ${pastJob.brand} ${pastJob.model || ''} ลงฟอร์มแล้ว`)
  }

  // กดปุ่มรับสิทธิ์เคลมประกัน 30 วัน
  const applyWarrantyClaim = (match: WarrantyMatch) => {
    const pastJob = match.job
    const customerJobs = jobs.filter((x) => x.phone.replace(/[-\s]/g, '') === pastJob.phone.replace(/[-\s]/g, ''))
    applyCustomerHistory({
      customerName: pastJob.customerName,
      phone: pastJob.phone,
      latestJob: pastJob,
      pastJobs: customerJobs.length > 0 ? customerJobs : [pastJob],
    })
    applyMachineFromHistory(pastJob)
    const claimTag = `[งานเคลมประกัน 30 วัน อ้างอิงใบงาน ${pastJob.jobNo} (ซ่อมเสร็จเมื่อ ${fmtDateTime(match.completedAt)})]`
    setNote((prev) => (prev.includes(pastJob.jobNo) ? prev : prev ? `${claimTag}\n${prev}` : claimTag))
    toast.success(`ติดป้ายงานเคลมประกันจากใบงาน ${pastJob.jobNo} เรียบร้อย`)
  }

  const techs = profiles.filter((p) => p.role === 'TECH')
  const isAdmin = currentUser?.role === 'ADMIN'

  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { applianceType: MACHINE_TYPES[0] || 'เครื่องซักฝาบน', brand: '', model: '', symptom: '' },
    ])
  }

  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      toast.error('ต้องมีรายการเครื่องแจ้งซ่อมอย่างน้อย 1 รายการ')
      return
    }
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  const handleItemChange = (index: number, field: keyof JobItemState, value: string) => {
    setItems((prev) =>
      prev.map((item, i) => (i === index ? { ...item, [field]: value } : item)),
    )
  }

  function addPhotos(list: FileList | null) {
    if (!list) return
    const incoming = Array.from(list)
    const bad = incoming.find((f) => !ACCEPT.includes(f.type) || f.size > MAX_BYTES)
    if (bad) {
      setErrors((e) => ({ ...e, photos: `ไฟล์ ${bad.name} ไม่รองรับ (JPG/PNG/WebP/HEIC ไม่เกิน 5 MB)` }))
      return
    }
    setErrors((e) => ({ ...e, photos: undefined }))
    setPhotos((p) => [...p, ...incoming].slice(0, MAX_PHOTOS))
  }

  async function handleCopyLineText(text: string) {
    try {
      await navigator.clipboard.writeText(text)
      setCopiedLine(true)
      toast.success('คัดลอกข้อความแจ้งช่างแล้ว นำไปวางใน LINE ได้ทันที')
      setTimeout(() => setCopiedLine(false), 3000)
    } catch {
      toast.error('ไม่สามารถคัดลอกอัตโนมัติได้ กรุณากดคัดลอกจากกล่องข้อความ')
    }
  }

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (pending) return

    const f = new FormData(ev.currentTarget)
    const v = (k: string) => String(f.get(k) ?? '').trim()
    const e: Errors = {}

    if (!customerName.trim()) e.customerName = 'กรุณากรอกชื่อลูกค้า'
    if (!/^0\d{8,9}$/.test(phone.replace(/[-\s]/g, ''))) e.phone = 'เบอร์โทรไม่ถูกต้อง'

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
      e.address = 'กรุณากรอกที่อยู่หรือสถานที่ติดตั้ง'
    } else if (thaiDb.length > 0 && (!province || !amphoe || !district)) {
      e.address = 'กรุณาเลือกจังหวัด อำเภอ และตำบล (หรือเลือก "ไม่ทราบข้อมูล / ข้าม")'
    }

    let hasItemError = false
    items.forEach((item) => {
      if (!item.brand.trim() || !item.symptom.trim()) {
        hasItemError = true
      }
    })
    if (hasItemError) {
      e.items = 'กรุณากรอกยี่ห้อ และอาการเสีย ของเครื่องแจ้งซ่อมให้ครบถ้วน'
    }

    setErrors(e)
    if (Object.keys(e).length) {
      toast.error(e.items || e.address || 'กรุณาตรวจสอบข้อมูลที่ไฮไลต์')
      return
    }

    const assignedTechId = (isAdmin && v('technicianId')) || undefined
    const noteText = note.trim() || undefined

    setPending(true)
    const res = await createJob({
      customerName: customerName.trim(),
      phone: phone.trim(),
      contactName: contactName.trim() || undefined,
      address: fullAddress,
      items: items.map((i) => ({
        applianceType: i.applianceType,
        brand: i.brand.trim(),
        model: i.model.trim() || '',
        serialNumber: i.serialNumber?.trim() || undefined,
        purchaseDate: i.purchaseDate || undefined,
        symptom: i.symptom.trim(),
        details: i.details?.trim() || undefined,
      })),
      technicianId: assignedTechId,
      appointmentAt: v('appointmentAt') ? new Date(v('appointmentAt')).toISOString() : undefined,
      urgency: v('urgency') as UrgencyLevel,
      note: noteText,
      photos: photos.length,
    })
    setPending(false)

    if (!res.ok) return toast.error(res.error)

    const techName = assignedTechId
      ? profiles.find((p) => p.id === assignedTechId)?.fullName || 'มอบหมายแล้ว'
      : 'รอมอบหมายช่าง'

    const lineText = buildTechLineMessage({
      job: res.value,
      items,
      techName,
      note: noteText,
    })

    toast.success(`สร้างใบงาน ${res.value.jobNo} เรียบร้อย (${items.length} เครื่อง)`)
    setCreatedSummary({ job: res.value, lineText })
  }

  return (
    <>
      <PageHeader
        eyebrow="New job"
        title="รับแจ้งงานซ่อม"
        description="เลขที่ใบงานจะถูกสร้างอัตโนมัติเมื่อบันทึก (รองรับการแจ้งซ่อมหลายเครื่องใน 1 ใบงาน)"
      />

      {/* หน้าต่างแจ้งผลสำเร็จ + ปุ่มคัดลอกข้อความแจ้งช่างใน LINE ทันที */}
      {createdSummary && (
        <div
          role="dialog"
          aria-modal="true"
          aria-labelledby="created-job-title"
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4 backdrop-blur-xs"
        >
          <div className="w-full max-w-lg rounded-2xl border border-border bg-card p-6 shadow-xl">
            <div className="flex items-start gap-3">
              <div className="flex size-10 shrink-0 items-center justify-center rounded-full bg-emerald-100 text-emerald-700">
                <CheckCircle2 className="size-6" />
              </div>
              <div>
                <h2 id="created-job-title" className="text-lg font-bold text-foreground">
                  บันทึกใบงาน {createdSummary.job.jobNo} สำเร็จ!
                </h2>
                <p className="text-xs text-muted-foreground">
                  กดปุ่มด้านล่างเพื่อคัดลอกรายละเอียดงานส่งเข้ากลุ่ม LINE ช่างได้ทันที
                </p>
              </div>
            </div>

            <div className="mt-4">
              <label className="mb-1.5 block text-xs font-semibold text-muted-foreground">
                ตัวอย่างข้อความแจ้งช่าง (สำหรับส่ง LINE)
              </label>
              <Textarea
                readOnly
                rows={11}
                value={createdSummary.lineText}
                className="bg-muted/50 font-sans text-xs leading-relaxed"
                onFocus={(e) => e.currentTarget.select()}
              />
            </div>

            <div className="mt-5 flex flex-col gap-2.5 sm:flex-row sm:justify-end">
              <Button
                type="button"
                size="lg"
                className="bg-[#06C755] text-white hover:bg-[#05b34c]"
                onClick={() => handleCopyLineText(createdSummary.lineText)}
              >
                {copiedLine ? <Check className="mr-1.5 size-4" /> : <Copy className="mr-1.5 size-4" />}
                {copiedLine ? 'คัดลอกข้อความแล้ว!' : 'คัดลอกข้อความแจ้งช่าง (ส่ง LINE)'}
              </Button>
              <Button
                type="button"
                size="lg"
                variant="outline"
                onClick={() =>
                  navigate({ to: '/jobs/$jobId', params: { jobId: createdSummary.job.id } })
                }
              >
                ไปหน้ารายละเอียดใบงาน <ArrowRight className="ml-1.5 size-4" />
              </Button>
            </div>
          </div>
        </div>
      )}

      {/* แถบเตือนประกันซ่อมซ้ำ 30 วันอัตโนมัติ (Warranty Claim Alert) */}
      {warrantyMatches.length > 0 && (
        <div
          role="alert"
          className="mb-6 rounded-2xl border-2 border-amber-400 bg-amber-50 p-4 shadow-xs"
        >
          <div className="flex items-start gap-3">
            <div className="flex size-9 shrink-0 items-center justify-center rounded-full bg-amber-200 text-amber-900">
              <AlertTriangle className="size-5" />
            </div>
            <div className="flex-1">
              <h2 className="text-sm font-bold text-amber-950">
                ⚠️ แจ้งเตือน: พบประวัติซ่อมเสร็จภายใน 30 วัน (อยู่ระหว่างรับประกันงานซ่อมเดิม)
              </h2>
              <p className="mt-0.5 text-xs text-amber-900">
                ตรวจพบจาก <strong>{warrantyMatches[0].matchedBy}</strong> — กรุณาตรวจสอบว่าอาการเสียและอะไหล่ตรงกับงานเดิมหรือไม่
              </p>

              <div className="mt-3 grid gap-2">
                {warrantyMatches.map((m) => (
                  <div
                    key={m.job.id}
                    className="flex flex-col justify-between gap-2 rounded-xl border border-amber-300 bg-white p-3 text-xs sm:flex-row sm:items-center"
                  >
                    <div className="space-y-0.5">
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-ticket text-sm font-bold text-primary">{m.job.jobNo}</span>
                        <span className="rounded-full bg-amber-100 px-2 py-0.5 text-[11px] font-bold text-amber-900">
                          ซ่อมเสร็จเมื่อ {m.daysSince === 0 ? 'วันนี้' : `${m.daysSince} วันที่แล้ว`} · เหลือประกัน {m.daysRemaining} วัน
                        </span>
                      </div>
                      <p className="font-medium text-foreground">
                        ลูกค้า: {m.job.customerName} ({m.job.phone}) · เครื่อง: {m.job.applianceType} {m.job.brand} {m.job.model && m.job.model !== '-' ? m.job.model : ''}
                        {m.job.serialNo && m.job.serialNo !== '-' ? ` (S/N: ${m.job.serialNo})` : ''}
                      </p>
                      <p className="text-[11px] text-muted-foreground">
                        อาการเดิม: <strong>{m.job.symptom}</strong>
                        {m.job.resolution ? ` · วิธีแก้ไขเดิม: ${m.job.resolution}` : ''}
                      </p>
                    </div>
                    <Button
                      type="button"
                      size="sm"
                      className="shrink-0 bg-amber-600 text-white hover:bg-amber-700"
                      onClick={() => applyWarrantyClaim(m)}
                    >
                      <ShieldCheck className="mr-1 size-4" /> ติดป้ายงานเคลมประกัน
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}

      <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-6">
          {/* ข้อมูลลูกค้า */}
          <Panel title="ข้อมูลลูกค้า">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ชื่อลูกค้า" htmlFor="customerName" error={errors.customerName} required>
                <Input
                  id="customerName"
                  name="customerName"
                  className="h-11"
                  value={customerName}
                  onChange={(e) => {
                    setCustomerName(e.target.value)
                    setSelectedHistoryCustomer(null)
                  }}
                />
              </Field>
              <Field label="เบอร์โทรศัพท์" htmlFor="phone" error={errors.phone} required>
                <Input
                  id="phone"
                  name="phone"
                  type="tel"
                  inputMode="tel"
                  className="h-11 font-ticket"
                  placeholder="08x-xxx-xxxx"
                  value={phone}
                  onChange={(e) => {
                    setPhone(e.target.value)
                    setSelectedHistoryCustomer(null)
                  }}
                />
              </Field>

              {/* กล่องแนะนำลูกค้าเดิมที่ตรงกับชื่อหรือเบอร์โทร */}
              {!selectedHistoryCustomer && matchingCustomers.length > 0 && (
                <div className="rounded-xl border border-blue-200 bg-blue-50/80 p-3 text-xs sm:col-span-2">
                  <div className="mb-2 flex items-center gap-1.5 font-semibold text-blue-900">
                    <UserCheck className="size-4 text-blue-600" />
                    พบประวัติลูกค้าเดิมในระบบ ({matchingCustomers.length} รายการ) — คลิกเพื่อดึงข้อมูลอัตโนมัติ
                  </div>
                  <div className="grid gap-2">
                    {matchingCustomers.map((entry, idx) => (
                      <div
                        key={idx}
                        className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-blue-200/80 bg-white px-3 py-2"
                      >
                        <div>
                          <p className="font-semibold text-foreground">
                            {entry.customerName} <span className="font-ticket text-primary">({entry.phone})</span>
                          </p>
                          <p className="text-[11px] text-muted-foreground">
                            {entry.latestJob.address} · เคยแจ้งซ่อม {entry.pastJobs.length} ครั้ง
                          </p>
                        </div>
                        <Button
                          type="button"
                          size="sm"
                          variant="secondary"
                          className="h-8 text-xs"
                          onClick={() => applyCustomerHistory(entry)}
                        >
                          ใช้ข้อมูลลูกค้านี้
                        </Button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* แสดงประวัติการซ่อมที่ผ่านมาของลูกค้าที่เลือก */}
              {selectedHistoryCustomer && selectedHistoryCustomer.pastJobs.length > 0 && (
                <div className="rounded-xl border border-emerald-200 bg-emerald-50/70 p-3 text-xs sm:col-span-2">
                  <div className="mb-2 flex items-center justify-between">
                    <span className="flex items-center gap-1.5 font-semibold text-emerald-900">
                      <History className="size-4 text-emerald-600" />
                      ประวัติเครื่องที่เคยซ่อมของลูกค้านี้ ({selectedHistoryCustomer.pastJobs.length} รายการ)
                    </span>
                    <button
                      type="button"
                      className="text-[11px] text-muted-foreground hover:underline"
                      onClick={() => setSelectedHistoryCustomer(null)}
                    >
                      ซ่อนประวัติ
                    </button>
                  </div>
                  <div className="grid gap-1.5">
                    {selectedHistoryCustomer.pastJobs.slice(0, 5).map((pj) => {
                      const w = checkWarranty30Days(pj)
                      return (
                        <div
                          key={pj.id}
                          className="flex flex-wrap items-center justify-between gap-2 rounded-lg border border-emerald-200/80 bg-white px-2.5 py-1.5"
                        >
                          <div>
                            <span className="font-ticket font-bold text-primary">{pj.jobNo}</span>{' '}
                            <span className="font-medium">
                              {pj.applianceType} {pj.brand} {pj.model && pj.model !== '-' ? pj.model : ''}
                            </span>
                            {pj.serialNo && pj.serialNo !== '-' ? <span className="font-ticket text-muted-foreground"> (S/N: {pj.serialNo})</span> : null}
                            {w && (
                              <span className="ml-1.5 rounded bg-amber-100 px-1.5 py-0.5 text-[10px] font-bold text-amber-900">
                                ประกัน 30 วัน (เหลือ {w.daysRemaining} วัน)
                              </span>
                            )}
                            <p className="text-[11px] text-muted-foreground">
                              วันที่ {fmtDateTime(pj.receivedAt)} · อาการ: {pj.symptom}
                              {pj.resolution ? ` · ผล: ${pj.resolution}` : ''}
                            </p>
                          </div>
                          <Button
                            type="button"
                            size="sm"
                            variant="outline"
                            className="h-7 text-[11px]"
                            onClick={() => applyMachineFromHistory(pj)}
                          >
                            + ดึงเครื่องนี้เข้าใบงาน
                          </Button>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )}

              <Field label="ชื่อผู้ติดต่อ" htmlFor="contactName" className="sm:col-span-2">
                <Input
                  id="contactName"
                  name="contactName"
                  className="h-11"
                  value={contactName}
                  onChange={(e) => setContactName(e.target.value)}
                />
              </Field>

              {/* ที่อยู่แบบเลือก จังหวัด / อำเภอ / ตำบล (รองรับ "ไม่ทราบข้อมูล / ข้าม") */}
              <Field label="บ้านเลขที่ / ซอย / ถนน / ชื่อสถานที่" htmlFor="addressDetail" error={errors.address} required className="sm:col-span-2">
                <Textarea
                  id="addressDetail"
                  rows={2}
                  placeholder="เช่น 123/4 หมู่ 2 ถ.เพชรเกษม (ร้านซักอบรีด...)"
                  value={addressDetail}
                  onChange={(e) => setAddressDetail(e.target.value)}
                />
              </Field>

              <Field label="จังหวัด" htmlFor="province" required>
                <select
                  id="province"
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
                      setAmphoe('')
                      setDistrict('')
                    }
                    setZipcode('')
                  }}
                >
                  <option value="">{loadingThaiDb ? 'กำลังโหลดข้อมูลจังหวัด...' : '— เลือกจังหวัด —'}</option>
                  <option value={UNKNOWN_VALUE}>— ไม่ทราบข้อมูล / ข้าม —</option>
                  {provinces.map((p) => (
                    <option key={p} value={p}>{p}</option>
                  ))}
                </select>
              </Field>

              <Field label="อำเภอ / เขต" htmlFor="amphoe" required>
                <select
                  id="amphoe"
                  className="native-select"
                  value={amphoe}
                  disabled={!province || loadingThaiDb}
                  onChange={(e) => {
                    const val = e.target.value
                    setAmphoe(val)
                    if (val === UNKNOWN_VALUE) {
                      setDistrict(UNKNOWN_VALUE)
                    } else {
                      setDistrict('')
                    }
                    setZipcode('')
                  }}
                >
                  <option value="">— เลือกอำเภอ / เขต —</option>
                  <option value={UNKNOWN_VALUE}>— ไม่ทราบข้อมูล / ข้าม —</option>
                  {amphoes.map((a) => (
                    <option key={a} value={a}>{a}</option>
                  ))}
                </select>
              </Field>

              <Field label="ตำบล / แขวง" htmlFor="district" required>
                <select
                  id="district"
                  className="native-select"
                  value={district}
                  disabled={!amphoe || loadingThaiDb}
                  onChange={(e) => handleDistrictChange(e.target.value)}
                >
                  <option value="">— เลือกตำบล / แขวง —</option>
                  <option value={UNKNOWN_VALUE}>— ไม่ทราบข้อมูล / ข้าม —</option>
                  {districts.map((d, idx) => (
                    <option key={`${d.district}-${idx}`} value={d.district}>
                      {d.district}
                    </option>
                  ))}
                </select>
              </Field>

              <Field label="รหัสไปรษณีย์" htmlFor="zipcode">
                <Input
                  id="zipcode"
                  className="h-11 font-ticket"
                  placeholder="รหัสไปรษณีย์ (ถ้าทราบ)"
                  value={zipcode}
                  onChange={(e) => setZipcode(e.target.value)}
                />
              </Field>
            </div>
          </Panel>

          {/* ข้อมูลเครื่องและอาการ (รองรับหลายเครื่อง) */}
          <Panel title="รายการเครื่องและอาการเสีย">
            {errors.items && <p className="mb-4 text-xs font-semibold text-destructive">{errors.items}</p>}

            <div className="divide-y divide-border">
              {items.map((item, index) => {
                const snNeedle = (item.serialNumber || '').trim().toLowerCase()
                const snHistory =
                  snNeedle.length >= 4
                    ? jobs.filter((j) => (j.serialNo || '').toLowerCase().includes(snNeedle))
                    : []

                return (
                  <div key={index} className="py-4 first:pt-0 last:pb-0">
                    <div className="mb-3 flex items-center justify-between">
                      <span className="rounded-md bg-secondary px-2.5 py-1 text-xs font-semibold text-secondary-foreground">
                        เครื่องที่ {index + 1}
                      </span>
                      {items.length > 1 && (
                        <Button
                          type="button"
                          variant="ghost"
                          size="sm"
                          onClick={() => handleRemoveItem(index)}
                          className="h-8 text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                        >
                          <Trash2 className="mr-1 size-3.5" /> ลบเครื่องนี้
                        </Button>
                      )}
                    </div>

                    <div className="grid gap-4 sm:grid-cols-2">
                      <Field label="ประเภทเครื่อง" htmlFor={`type-${index}`} required>
                        <select
                          id={`type-${index}`}
                          className="native-select"
                          value={item.applianceType}
                          onChange={(e) => handleItemChange(index, 'applianceType', e.target.value)}
                        >
                          {MACHINE_TYPES.map((m) => (
                            <option key={m} value={m}>{m}</option>
                          ))}
                        </select>
                      </Field>

                      <Field label="ยี่ห้อ" htmlFor={`brand-${index}`} required>
                        <Input
                          id={`brand-${index}`}
                          list="brands"
                          className="h-11"
                          value={item.brand}
                          onChange={(e) => handleItemChange(index, 'brand', e.target.value)}
                        />
                        <datalist id="brands">
                          {['LG', 'Samsung', 'Electrolux', 'Toshiba', 'Hitachi', 'Panasonic', 'Sharp', 'Haier', 'Beko'].map((b) => (
                            <option key={b} value={b} />
                          ))}
                        </datalist>
                      </Field>

                      <Field label="รุ่น" htmlFor={`model-${index}`} hint="ถ้ามี / ไม่บังคับกรอก">
                        <Input
                          id={`model-${index}`}
                          className="h-11 font-ticket"
                          placeholder="ไม่ทราบรุ่นเว้นว่างได้"
                          value={item.model}
                          onChange={(e) => handleItemChange(index, 'model', e.target.value)}
                        />
                      </Field>

                      <Field label="หมายเลขเครื่อง" htmlFor={`serial-${index}`} hint="ถ้ามี (ระบบเช็กประกัน 30 วันอัตโนมัติ)">
                        <Input
                          id={`serial-${index}`}
                          className="h-11 font-ticket"
                          value={item.serialNumber || ''}
                          onChange={(e) => handleItemChange(index, 'serialNumber', e.target.value)}
                        />
                      </Field>

                      {snHistory.length > 0 && (
                        <div className="rounded-xl border border-amber-300 bg-amber-50/80 p-3 text-xs sm:col-span-2">
                          <p className="mb-1 flex items-center gap-1.5 font-semibold text-amber-900">
                            <History className="size-4 text-amber-600" />
                            พบประวัติการซ่อมของ Serial No. นี้ ({snHistory.length} ครั้ง)
                          </p>
                          <ul className="space-y-1 text-[11px] text-amber-950">
                            {snHistory.slice(0, 3).map((h) => {
                              const w = checkWarranty30Days(h)
                              return (
                                <li key={h.id}>
                                  • <span className="font-ticket font-bold">{h.jobNo}</span> ({fmtDateTime(h.receivedAt)}) — อาการ:{' '}
                                  <strong>{h.symptom}</strong>
                                  {h.resolution ? ` · แก้ไข: ${h.resolution}` : ''}
                                  {w && (
                                    <span className="ml-1.5 rounded bg-amber-200 px-1.5 py-0.5 text-[10px] font-bold text-amber-950">
                                      อยู่ระหว่างประกัน 30 วัน (เหลือ {w.daysRemaining} วัน)
                                    </span>
                                  )}
                                </li>
                              )
                            })}
                          </ul>
                        </div>
                      )}

                      <Field label="วันที่ซื้อ" htmlFor={`purchaseDate-${index}`} hint="ถ้ามี / ไม่บังคับกรอก">
                        <Input
                          id={`purchaseDate-${index}`}
                          type="date"
                          className="h-11"
                          value={item.purchaseDate || ''}
                          onChange={(e) => handleItemChange(index, 'purchaseDate', e.target.value)}
                        />
                      </Field>

                      <Field label="อาการเสีย" htmlFor={`symptom-${index}`} required className="sm:col-span-2">
                        <Input
                          id={`symptom-${index}`}
                          className="h-11"
                          value={item.symptom}
                          onChange={(e) => handleItemChange(index, 'symptom', e.target.value)}
                        />
                      </Field>

                      <Field label="รายละเอียดเพิ่มเติม" htmlFor={`details-${index}`} className="sm:col-span-2">
                        <Textarea
                          id={`details-${index}`}
                          rows={2}
                          value={item.details || ''}
                          onChange={(e) => handleItemChange(index, 'details', e.target.value)}
                        />
                      </Field>
                    </div>
                  </div>
                )
              })}
            </div>

            <Button
              type="button"
              variant="outline"
              className="mt-4 w-full border-dashed"
              onClick={handleAddItem}
            >
              <Plus className="mr-1 size-4" /> เพิ่มเครื่องแจ้งซ่อมอีก
            </Button>
          </Panel>

          {/* รูปภาพประกอบ */}
          <Panel title="รูปภาพประกอบ">
            <label
              htmlFor="photos"
              className="flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-8 text-center transition-colors hover:border-highlight hover:bg-accent/30"
            >
              <Camera className="size-6 text-primary" aria-hidden />
              <span className="text-sm font-medium">ถ่ายรูปหรือเลือกไฟล์</span>
              <span className="text-xs text-muted-foreground">
                JPG, PNG, WebP, HEIC · ไม่เกิน 5 MB ต่อรูป · สูงสุด {MAX_PHOTOS} รูป
              </span>
            </label>
            <input
              id="photos"
              type="file"
              accept={ACCEPT.join(',')}
              multiple
              capture="environment"
              className="sr-only"
              onChange={(e) => {
                addPhotos(e.target.files)
                e.target.value = ''
              }}
            />
            {errors.photos && <p role="alert" className="mt-2 text-xs text-destructive">{errors.photos}</p>}
            {photos.length > 0 && (
              <ul className="mt-3 flex flex-wrap gap-2">
                {photos.map((p, i) => (
                  <li key={i} className="flex items-center gap-2 rounded-lg bg-secondary px-2.5 py-1.5 text-xs">
                    <span className="max-w-40 truncate">{p.name}</span>
                    <button type="button" aria-label={`ลบ ${p.name}`} onClick={() => setPhotos((xs) => xs.filter((_, j) => j !== i))}>
                      <X className="size-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        {/* แถบการรับงานและปุ่มบันทึก */}
        <div className="grid h-fit gap-6 lg:sticky lg:top-6">
          <Panel title="การรับงาน">
            <div className="grid gap-4">
              <div className="rounded-lg bg-secondary/60 p-3 text-sm">
                <p className="text-xs text-muted-foreground">วันที่และเวลารับแจ้ง</p>
                <p className="font-medium">{fmtDateTime(new Date().toISOString())}</p>
                <p className="mt-2 text-xs text-muted-foreground">ผู้รับงาน</p>
                <p className="font-medium">{currentUser?.fullName}</p>
              </div>
              <Field
                label="ช่างผู้รับผิดชอบ"
                htmlFor="technicianId"
                hint={isAdmin ? 'เว้นว่างได้ สถานะจะเป็น “รอมอบหมายช่าง”' : 'ผู้ดูแลระบบเป็นผู้มอบหมายช่าง'}
              >
                <select id="technicianId" name="technicianId" className="native-select" disabled={!isAdmin}>
                  <option value="">— ยังไม่มอบหมาย —</option>
                  {techs.map((t) => <option key={t.id} value={t.id}>{t.fullName}</option>)}
                </select>
              </Field>
              <Field label="วันที่นัดหมาย" htmlFor="appointmentAt">
                <Input id="appointmentAt" name="appointmentAt" type="datetime-local" className="h-11" />
              </Field>
              <Field label="ระดับความเร่งด่วน" htmlFor="urgency">
                <select id="urgency" name="urgency" className="native-select" defaultValue="LOW">
                  {(Object.keys(URGENCY_LABEL) as UrgencyLevel[]).map((u) => <option key={u} value={u}>{URGENCY_LABEL[u]}</option>)}
                </select>
              </Field>
              <Field label="หมายเหตุ" htmlFor="note">
                <Textarea
                  id="note"
                  name="note"
                  rows={2}
                  value={note}
                  onChange={(e) => setNote(e.target.value)}
                />
              </Field>
            </div>
          </Panel>
          <Button type="submit" size="lg" className="h-12 text-base" disabled={pending}>
            {pending ? <Loader2 className="animate-spin" /> : <Save />}
            {pending ? 'กำลังบันทึก…' : `บันทึกใบงาน (${items.length} เครื่อง)`}
          </Button>
        </div>
      </form>
    </>
  )
}
