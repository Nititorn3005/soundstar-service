import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { History, Undo2 } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState, Field, JobNo, PageHeader, RoleGate } from '@/components/app/shell'
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
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Textarea } from '@/components/ui/textarea'
import { TX_LABEL, fmtDateTime, type InventoryTx, type TxType } from '@/lib/domain'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_app/inventory/history')({
  head: () => ({ meta: [{ title: 'ประวัติสต๊อก · Hatyai Soundstar' }] }),
  component: () => (
    <RoleGate roles={['ADMIN', 'TECH']}>
      <StockHistory />
    </RoleGate>
  ),
})

const TYPE_TONE: Record<TxType, string> = {
  IN: 'bg-ok/15',
  OUT: 'bg-highlight/15',
  ADJUST: 'bg-warn/25',
  REVERSAL: 'bg-muted text-muted-foreground',
}

function StockHistory() {
  const { transactions, inventory, profiles, jobs, profileName, currentUser } = useAppStore()
  const isAdmin = currentUser?.role === 'ADMIN'
  const [from, setFrom] = React.useState('')
  const [to, setTo] = React.useState('')
  const [part, setPart] = React.useState('')
  const [by, setBy] = React.useState('')
  const [reversing, setReversing] = React.useState<InventoryTx | null>(null)

  const scoped =
    currentUser?.role === 'TECH' ? transactions.filter((t) => t.by === currentUser.id) : transactions
  const rows = scoped.filter((t) => {
    const d = t.at.slice(0, 10)
    return (!from || d >= from) && (!to || d <= to) && (!part || t.partId === part) && (!by || t.by === by)
  })
  const reversed = new Set(transactions.map((t) => t.reversesId).filter(Boolean))

  return (
    <>
      <PageHeader
        eyebrow="Stock ledger"
        title="ประวัติสต๊อก"
        description="ทุกการเคลื่อนไหวถูกบันทึกถาวร การยกเลิกจะสร้างรายการย้อนกลับแทนการลบ"
      />
      <div className="mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        <Field label="ตั้งแต่วันที่" htmlFor="h-from">
          <Input id="h-from" type="date" value={from} onChange={(e) => setFrom(e.target.value)} className="h-11 bg-card" />
        </Field>
        <Field label="ถึงวันที่" htmlFor="h-to">
          <Input id="h-to" type="date" value={to} onChange={(e) => setTo(e.target.value)} className="h-11 bg-card" />
        </Field>
        <Field label="อะไหล่" htmlFor="h-part">
          <select id="h-part" className="native-select" value={part} onChange={(e) => setPart(e.target.value)}>
            <option value="">ทั้งหมด</option>
            {inventory.map((i) => <option key={i.id} value={i.id}>{i.code} · {i.name}</option>)}
          </select>
        </Field>
        {isAdmin && (
          <Field label="ผู้ทำรายการ" htmlFor="h-by">
            <select id="h-by" className="native-select" value={by} onChange={(e) => setBy(e.target.value)}>
              <option value="">ทั้งหมด</option>
              {profiles.map((p) => <option key={p.id} value={p.id}>{p.fullName}</option>)}
            </select>
          </Field>
        )}
      </div>

      {rows.length === 0 ? (
        <EmptyState icon={History} title="ไม่พบรายการเคลื่อนไหว" description="ลองเปลี่ยนช่วงวันที่หรือตัวกรอง" />
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>วันเวลา</TableHead>
                <TableHead>ประเภท</TableHead>
                <TableHead>อะไหล่</TableHead>
                <TableHead className="text-right">จำนวน</TableHead>
                <TableHead className="text-right">คงเหลือ</TableHead>
                <TableHead className="hidden md:table-cell">อ้างอิง</TableHead>
                <TableHead className="hidden sm:table-cell">ผู้ทำรายการ</TableHead>
                {isAdmin && <TableHead className="w-10"><span className="sr-only">ย้อนรายการ</span></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((t) => {
                const item = inventory.find((i) => i.id === t.partId)
                const job = jobs.find((j) => j.id === t.jobId)
                const isReversed = reversed.has(t.id)
                return (
                  <TableRow key={t.id} className={cn(isReversed && 'opacity-60')}>
                    <TableCell className="text-xs">{fmtDateTime(t.at)}</TableCell>
                    <TableCell>
                      <span className={cn('rounded-md px-2 py-0.5 text-xs', TYPE_TONE[t.type])}>{TX_LABEL[t.type]}</span>
                      {isReversed && <p className="mt-1 text-[10px] text-muted-foreground">ถูกย้อนแล้ว</p>}
                    </TableCell>
                    <TableCell className="max-w-44 whitespace-normal">
                      <p className="font-ticket text-[11px] text-primary">{item?.code}</p>
                      <p className="text-sm">{item?.name}</p>
                    </TableCell>
                    <TableCell className={cn('text-right font-ticket', t.qty > 0 ? 'text-ok' : 'text-destructive')}>
                      {t.qty > 0 ? '+' : ''}{t.qty}
                    </TableCell>
                    <TableCell className="text-right font-ticket">{t.balanceAfter}</TableCell>
                    <TableCell className="hidden max-w-48 whitespace-normal text-xs md:table-cell">
                      {job && <JobNo>{job.jobNo}</JobNo>} {t.reference} {t.reason}
                    </TableCell>
                    <TableCell className="hidden text-xs sm:table-cell">{profileName(t.by)}</TableCell>
                    {isAdmin && (
                      <TableCell>
                        {t.type !== 'REVERSAL' && !isReversed && (
                          <Button variant="ghost" size="icon" aria-label="ย้อนรายการ" onClick={() => setReversing(t)}>
                            <Undo2 />
                          </Button>
                        )}
                      </TableCell>
                    )}
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </div>
      )}

      <ReverseDialog tx={reversing} onClose={() => setReversing(null)} />
    </>
  )
}

function ReverseDialog({ tx, onClose }: { tx: InventoryTx | null; onClose: () => void }) {
  const { reverseTx } = useAppStore()
  return (
    <Dialog open={!!tx} onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>ย้อนรายการสต๊อก</DialogTitle>
          <DialogDescription>
            ระบบจะสร้างรายการย้อนกลับจำนวน {tx ? -tx.qty : 0} หน่วย รายการเดิมยังคงอยู่ในประวัติ
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4"
          onSubmit={async (e) => {
            e.preventDefault()
            const reason = String(new FormData(e.currentTarget).get('reason') ?? '').trim()
            if (!reason) return toast.error('กรุณาระบุเหตุผล')
            const res = await reverseTx(tx!.id, reason)
            if (!res.ok) return toast.error(res.error)
            toast.success('สร้างรายการย้อนกลับแล้ว')
            onClose()
          }}
        >
          <Field label="เหตุผล" htmlFor="rev-reason" required>
            <Textarea id="rev-reason" name="reason" rows={2} />
          </Field>
          <DialogFooter>
            <Button type="submit" variant="destructive" size="lg">ยืนยันการย้อนรายการ</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
