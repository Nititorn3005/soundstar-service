import { createFileRoute } from '@tanstack/react-router'
import { Save } from 'lucide-react'
import { toast } from 'sonner'

import { Field, PageHeader, Panel, RoleGate } from '@/components/app/shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { useAppStore } from '@/lib/store'

export const Route = createFileRoute('/_app/settings')({
  head: () => ({ meta: [{ title: 'ตั้งค่าบริษัท · Hatyai Soundstar' }] }),
  component: () => (
    <RoleGate roles={['ADMIN']}>
      <Settings />
    </RoleGate>
  ),
})

function Settings() {
  const { company, updateCompany } = useAppStore()
  return (
    <>
      <PageHeader eyebrow="Company" title="ตั้งค่าบริษัท" description="ข้อมูลนี้แสดงในส่วนท้ายเว็บไซต์และหัวใบงานซ่อมที่พิมพ์" />
      <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
        <Panel>
          <form
            className="grid gap-4"
            onSubmit={async (e) => {
              e.preventDefault()
              const f = new FormData(e.currentTarget)
              const v = (k: string) => String(f.get(k) ?? '').trim()
              if (!v('nameTh') || !v('address') || !v('phones')) return toast.error('กรุณากรอกชื่อบริษัท ที่อยู่ และเบอร์โทร')
              const res = await updateCompany({ nameTh: v('nameTh'), nameEn: v('nameEn'), address: v('address'), phones: v('phones'), taxId: v('taxId') || undefined })
              if (!res.ok) return toast.error(res.error)
              toast.success('บันทึกข้อมูลบริษัทแล้ว')
            }}
          >
            <Field label="ชื่อบริษัท (ภาษาไทย)" htmlFor="nameTh" required>
              <Input id="nameTh" name="nameTh" defaultValue={company.nameTh} className="h-11" />
            </Field>
            <Field label="ชื่อบริษัท (ภาษาอังกฤษ)" htmlFor="nameEn">
              <Input id="nameEn" name="nameEn" defaultValue={company.nameEn} className="h-11" />
            </Field>
            <Field label="ที่อยู่" htmlFor="address" required>
              <Textarea id="address" name="address" defaultValue={company.address} rows={2} />
            </Field>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="โทรศัพท์" htmlFor="phones" hint="คั่นหลายเบอร์ด้วยจุลภาค" required>
                <Input id="phones" name="phones" defaultValue={company.phones} className="h-11 font-ticket" />
              </Field>
              <Field label="เลขประจำตัวผู้เสียภาษี" htmlFor="taxId">
                <Input id="taxId" name="taxId" defaultValue={company.taxId} inputMode="numeric" className="h-11 font-ticket" />
              </Field>
            </div>
            <Button type="submit" size="lg" className="w-fit"><Save /> บันทึก</Button>
          </form>
        </Panel>
        <Panel title="ตัวอย่างหัวใบงาน">
          <div className="rounded-lg border-2 border-foreground p-3 text-sm">
            <p className="font-bold">{company.nameTh}</p>
            <p className="text-xs">{company.nameEn}</p>
            <p className="mt-1 text-xs">{company.address}</p>
            <p className="text-xs">โทร {company.phones}</p>
          </div>
        </Panel>
      </div>
    </>
  )
}
