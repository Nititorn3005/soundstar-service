import * as React from 'react'
import { Link } from '@tanstack/react-router'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

import { Field, JobNo, Panel } from '@/components/app/shell'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { OPEN_STATUSES, TX_LABEL, fmtDateTime, type InventoryTx } from '@/lib/domain'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

type Mode = 'IN' | 'OUT' | 'ADJUST'

const COPY: Record<Mode, { submit: string; qtyLabel: string; qtyHint?: string }> = {
  IN: { submit: 'บันทึกรับเข้า', qtyLabel: 'จำนวนที่รับเข้า' },
  OUT: { submit: 'ยืนยันการเบิก', qtyLabel: 'จำนวนที่เบิก' },
  ADJUST: { submit: 'บันทึกการปรับยอด', qtyLabel: 'จำนวนที่ปรับ (+/−)', qtyHint: 'ใส่ค่าลบเพื่อลดยอด เช่น -2' },
}

export function StockMoveForm({ mode }: { mode: Mode }) {
  const { inventory, jobs, currentUser, moveStock, transactions } = useAppStore()
  const [partId, setPartId] = React.useState('')
  const [pending, setPending] = React.useState(false)
  const formRef = React.useRef<HTMLFormElement>(null)
  const item = inventory.find((i) => i.id === partId)
  const isTech = currentUser?.role === 'TECH'
  const openJobs = jobs.filter(
    (j) => OPEN_STATUSES.includes(j.status) && (!isTech || j.technicianId === currentUser?.id),
  )
  const recent = transactions.filter((t) => t.type === mode).slice(0, 5)

  async function onSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault()
    if (pending) return
    const f = new FormData(e.currentTarget)
    const v = (k: string) => String(f.get(k) ?? '').trim()
    setPending(true)
    const res = await moveStock({
      partId,
      type: mode,
      qty: Number(v('qty')),
      jobId: v('jobId') || undefined,
      reference: v('reference') || undefined,
      reason: v('reason') || undefined,
    })
    setPending(false)
    if (!res.ok) return toast.error(res.error)
    toast.success(`${TX_LABEL[mode]} ${item?.name} เรียบร้อย · คงเหลือ ${res.value.balanceAfter} ${item?.unit}`)
    formRef.current?.reset()
    setPartId('')
  }

  return (
    <div className="grid gap-6 lg:grid-cols-[1fr_22rem]">
      <Panel>
        <form ref={formRef} onSubmit={onSubmit} className="grid gap-4 sm:grid-cols-2" noValidate>
          <Field label="อะไหล่" htmlFor="partId" required className="sm:col-span-2">
            <select id="partId" className="native-select" value={partId} onChange={(e) => setPartId(e.target.value)}>
              <option value="">— เลือกอะไหล่ —</option>
              {inventory.map((i) => (
                <option key={i.id} value={i.id} disabled={mode === 'OUT' && i.onHand === 0}>
                  {i.code} · {i.name} (คงเหลือ {i.onHand} {i.unit})
                </option>
              ))}
            </select>
          </Field>
          {item && (
            <div className="grid grid-cols-3 gap-2 rounded-xl bg-secondary/60 p-3 text-center text-xs sm:col-span-2">
              <div><p className="text-muted-foreground">คงเหลือ</p><p className="font-ticket text-lg font-bold">{item.onHand}</p></div>
              <div><p className="text-muted-foreground">ขั้นต่ำ</p><p className="font-ticket text-lg">{item.minQty}</p></div>
              <div><p className="text-muted-foreground">ตำแหน่ง</p><p className="text-sm font-medium">{item.location}</p></div>
            </div>
          )}
          <Field label={COPY[mode].qtyLabel} htmlFor="qty" required hint={COPY[mode].qtyHint ?? (item ? `หน่วย: ${item.unit}` : undefined)}>
            <Input id="qty" name="qty" type="number" inputMode="numeric" min={mode === 'ADJUST' ? undefined : 1} max={mode === 'OUT' ? item?.onHand : undefined} defaultValue={mode === 'ADJUST' ? '' : 1} className="h-11 font-ticket" />
          </Field>
          {mode === 'IN' && (
            <Field label="เลขที่เอกสาร / ใบสั่งซื้อ" htmlFor="reference">
              <Input id="reference" name="reference" className="h-11 font-ticket" placeholder="PO-xxxx" />
            </Field>
          )}
          {mode === 'OUT' && (
            <Field label="ใบงานซ่อม" htmlFor="jobId" required={isTech} hint={isTech ? 'ช่างต้องผูกการเบิกกับใบงานเสมอ' : 'ไม่บังคับสำหรับผู้ดูแลระบบ'}>
              <select id="jobId" name="jobId" className="native-select">
                <option value="">— ไม่ผูกใบงาน —</option>
                {openJobs.map((j) => <option key={j.id} value={j.id}>{j.jobNo} · {j.customerName}</option>)}
              </select>
            </Field>
          )}
          <Field label={mode === 'ADJUST' ? 'เหตุผลการปรับยอด' : 'หมายเหตุ'} htmlFor="reason" required={mode === 'ADJUST'} className="sm:col-span-2">
            <Textarea id="reason" name="reason" rows={2} />
          </Field>
          <Button type="submit" size="lg" className="h-12 sm:col-span-2" disabled={!partId || pending}>
            {pending && <Loader2 className="animate-spin" />}
            {COPY[mode].submit}
          </Button>
        </form>
      </Panel>

      <Panel title={`${TX_LABEL[mode]}ล่าสุด`} action={<Link to="/inventory/history" className="text-sm text-primary hover:underline">ทั้งหมด</Link>}>
        <RecentTx rows={recent} />
      </Panel>
    </div>
  )
}

export function RecentTx({ rows }: { rows: InventoryTx[] }) {
  const { inventory, jobs, profileName } = useAppStore()
  if (rows.length === 0) return <p className="text-sm text-muted-foreground">ยังไม่มีรายการ</p>
  return (
    <ul className="grid gap-3 text-sm">
      {rows.map((t) => {
        const item = inventory.find((i) => i.id === t.partId)
        const job = jobs.find((j) => j.id === t.jobId)
        return (
          <li key={t.id} className="flex items-start justify-between gap-3">
            <div className="min-w-0">
              <p className="truncate font-medium">{item?.name}</p>
              <p className="text-xs text-muted-foreground">
                {fmtDateTime(t.at)} · {profileName(t.by)}
                {job && <> · <JobNo>{job.jobNo}</JobNo></>}
              </p>
            </div>
            <span className={cn('shrink-0 font-ticket', t.qty > 0 ? 'text-ok' : 'text-destructive')}>
              {t.qty > 0 ? '+' : ''}{t.qty}
            </span>
          </li>
        )
      })}
    </ul>
  )
}
