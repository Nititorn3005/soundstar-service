import * as React from 'react'
import { createFileRoute, useNavigate } from '@tanstack/react-router'
import { Camera, Loader2, Plus, Save, Trash2, X } from 'lucide-react'
import { toast } from 'sonner'

import { Field, PageHeader, Panel, RoleGate } from '@/components/app/shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { MACHINE_TYPES, URGENCY_LABEL, fmtDateTime, type UrgencyLevel } from '@/lib/domain'
import { useAppStore } from '@/lib/store'

export const Route = createFileRoute('/_app/jobs/new')({
  head: () => ({ meta: [{ title: 'รับแจ้งงานซ่อม · Hatyai Soundstar' }] }),
  component: () => (
    <RoleGate roles={['ADMIN', 'RECEPTION', 'TECH']}>
      <NewJob />
    </RoleGate>
  ),
})

const MAX_PHOTOS = 6
const MAX_BYTES = 5 * 1024 * 1024
const ACCEPT = ['image/jpeg', 'image/png', 'image/webp', 'image/heic']

interface JobItemState {
  applianceType: string
  brand: string
  model: string
  serialNumber?: string
  purchaseDate?: string
  symptom: string
  details?: string
}

type Errors = Partial<Record<'customerName' | 'phone' | 'address' | 'items' | 'photos', string>>

function NewJob() {
  const { createJob, profiles, currentUser } = useAppStore()
  const navigate = useNavigate()
  const [errors, setErrors] = React.useState<Errors>({})
  const [photos, setPhotos] = React.useState<File[]>([])
  const [pending, setPending] = React.useState(false)

  // รายการเครื่องแจ้งซ่อม (เริ่มต้น 1 เครื่อง)
  const [items, setItems] = React.useState<JobItemState[]>([
    { applianceType: MACHINE_TYPES[0] || 'เครื่องซักผ้าฝาบน', brand: '', model: '', symptom: '' },
  ])

  const techs = profiles.filter((p) => p.role === 'TECH')
  const isAdmin = currentUser?.role === 'ADMIN'

  // ฟังก์ชันเพิ่มเครื่องซ่อม
  const handleAddItem = () => {
    setItems((prev) => [
      ...prev,
      { applianceType: MACHINE_TYPES[0] || 'เครื่องซักผ้าฝาบน', brand: '', model: '', symptom: '' },
    ])
  }

  // ฟังก์ชันลบเครื่องซ่อม
  const handleRemoveItem = (index: number) => {
    if (items.length === 1) {
      toast.error('ต้องมีรายการเครื่องแจ้งซ่อมอย่างน้อย 1 รายการ')
      return
    }
    setItems((prev) => prev.filter((_, i) => i !== index))
  }

  // ฟังก์ชันอัปเดตข้อมูลเครื่องตาม Index
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

  async function onSubmit(ev: React.FormEvent<HTMLFormElement>) {
    ev.preventDefault()
    if (pending) return

    const f = new FormData(ev.currentTarget)
    const v = (k: string) => String(f.get(k) ?? '').trim()
    const e: Errors = {}

    if (!v('customerName')) e.customerName = 'กรุณากรอกชื่อลูกค้า'
    if (!/^0\d{8,9}$/.test(v('phone').replace(/[-\s]/g, ''))) e.phone = 'เบอร์โทรไม่ถูกต้อง'
    if (!v('address')) e.address = 'กรุณากรอกที่อยู่หรือสถานที่ติดตั้ง'

    // ตรวจสอบความถูกต้องของรายการเครื่องซ่อมทุกชิ้น
    let hasItemError = false
    items.forEach((item, index) => {
      if (!item.brand.trim() || !item.model.trim() || !item.symptom.trim()) {
        hasItemError = true
      }
    })
    if (hasItemError) {
      e.items = 'กรุณากรอกยี่ห้อ รุ่น และอาการเสีย ของเครื่องแจ้งซ่อมให้ครบถ้วน'
    }

    setErrors(e)
    if (Object.keys(e).length) {
      toast.error(e.items || 'กรุณาตรวจสอบข้อมูลที่ไฮไลต์')
      return
    }

    setPending(true)
    const res = await createJob({
      customerName: v('customerName'),
      phone: v('phone'),
      contactName: v('contactName') || undefined,
      address: v('address'),
      // ส่งรายการเครื่องทั้งหมดไปบันทึก
      items: items.map((i) => ({
        applianceType: i.applianceType,
        brand: i.brand.trim(),
        model: i.model.trim(),
        serialNumber: i.serialNumber?.trim() || undefined,
        purchaseDate: i.purchaseDate || undefined,
        symptom: i.symptom.trim(),
        details: i.details?.trim() || undefined,
      })),
      technicianId: (isAdmin && v('technicianId')) || undefined,
      appointmentAt: v('appointmentAt') ? new Date(v('appointmentAt')).toISOString() : undefined,
      urgency: v('urgency') as UrgencyLevel,
      note: v('note') || undefined,
      photos: photos.length,
    })
    setPending(false)

    if (!res.ok) return toast.error(res.error)
    toast.success(`สร้างใบงาน ${res.value.jobNo} เรียบร้อย (${items.length} เครื่อง)`)
    navigate({ to: '/jobs/$jobId', params: { jobId: res.value.id } })
  }

  return (
    <>
      <PageHeader
        eyebrow="New job"
        title="รับแจ้งงานซ่อม"
        description="เลขที่ใบงานจะถูกสร้างอัตโนมัติเมื่อบันทึก (รองรับการแจ้งซ่อมหลายเครื่องใน 1 ใบงาน)"
      />
      <form onSubmit={onSubmit} noValidate className="grid gap-6 lg:grid-cols-[1fr_20rem]">
        <div className="grid gap-6">
          {/* ข้อมูลลูกค้า */}
          <Panel title="ข้อมูลลูกค้า">
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="ชื่อลูกค้า" htmlFor="customerName" error={errors.customerName} required>
                <Input id="customerName" name="customerName" className="h-11" />
              </Field>
              <Field label="เบอร์โทรศัพท์" htmlFor="phone" error={errors.phone} required>
                <Input id="phone" name="phone" type="tel" inputMode="tel" className="h-11 font-ticket" placeholder="08x-xxx-xxxx" />
              </Field>
              <Field label="ชื่อผู้ติดต่อ" htmlFor="contactName">
                <Input id="contactName" name="contactName" className="h-11" />
              </Field>
              <Field label="ที่อยู่หรือสถานที่ติดตั้ง" htmlFor="address" error={errors.address} required className="sm:col-span-2">
                <Textarea id="address" name="address" rows={2} />
              </Field>
            </div>
          </Panel>

          {/* ข้อมูลเครื่องและอาการ (รองรับหลายเครื่อง) */}
          <Panel title="รายการเครื่องและอาการเสีย">
            {errors.items && <p className="mb-4 text-xs font-semibold text-destructive">{errors.items}</p>}
            
            <div className="divide-y divide-border">
              {items.map((item, index) => (
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

                    <Field label="รุ่น" htmlFor={`model-${index}`} required>
                      <Input
                        id={`model-${index}`}
                        className="h-11 font-ticket"
                        value={item.model}
                        onChange={(e) => handleItemChange(index, 'model', e.target.value)}
                      />
                    </Field>

                    <Field label="หมายเลขเครื่อง" htmlFor={`serial-${index}`} hint="ถ้ามี">
                      <Input
                        id={`serial-${index}`}
                        className="h-11 font-ticket"
                        value={item.serialNumber || ''}
                        onChange={(e) => handleItemChange(index, 'serialNumber', e.target.value)}
                      />
                    </Field>

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
              ))}
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
                <select id="urgency" name="urgency" className="native-select" defaultValue="NORMAL">
                  {(Object.keys(URGENCY_LABEL) as UrgencyLevel[]).map((u) => <option key={u} value={u}>{URGENCY_LABEL[u]}</option>)}
                </select>
              </Field>
              <Field label="หมายเหตุ" htmlFor="note">
                <Textarea id="note" name="note" rows={2} />
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