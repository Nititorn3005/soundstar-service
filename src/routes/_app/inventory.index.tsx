import * as React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, ArrowDownToLine, Package, Pencil, Plus, Search, SearchX } from 'lucide-react'
import { toast } from 'sonner'

import { EmptyState, Field, PageHeader, Panel, RoleGate } from '@/components/app/shell'
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
import { fmtBaht, type InventoryItem } from '@/lib/domain'
import { useAppStore } from '@/lib/store'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_app/inventory/')({
  head: () => ({ meta: [{ title: 'สต๊อกอะไหล่ · Hatyai Soundstar' }] }),
  component: () => (
    <RoleGate roles={['ADMIN', 'TECH']}>
      <Inventory />
    </RoleGate>
  ),
})

const isLow = (i: InventoryItem) => i.onHand < i.minQty

function Inventory() {
  const { inventory, currentUser } = useAppStore()
  const isAdmin = currentUser?.role === 'ADMIN'
  const [q, setQ] = React.useState('')
  const [onlyLow, setOnlyLow] = React.useState(false)
  const [editing, setEditing] = React.useState<InventoryItem | 'new' | null>(null)
  const needle = q.trim().toLowerCase()
  const rows = inventory.filter(
    (i) =>
      (!onlyLow || isLow(i)) &&
      (!needle ||
        [i.code, i.name, i.category, i.compatible].join(' ').toLowerCase().includes(needle)),
  )
  const reorder = inventory.filter(isLow)

  return (
    <>
      <PageHeader
        eyebrow="Inventory"
        title="สต๊อกอะไหล่"
        description={`${inventory.length} รายการ · ต่ำกว่าขั้นต่ำ ${reorder.length} รายการ`}
        actions={
          isAdmin && (
            <>
              <Button asChild variant="outline" size="lg">
                <Link to="/inventory/receive"><ArrowDownToLine /> รับอะไหล่เข้า</Link>
              </Button>
              <Button size="lg" onClick={() => setEditing('new')}><Plus /> เพิ่มอะไหล่</Button>
            </>
          )
        }
      />

      {reorder.length > 0 && (
        <Panel className="mb-6 border-warn/60 bg-warn/10">
          <div className="flex items-start gap-3">
            <AlertTriangle className="mt-0.5 size-5 shrink-0 text-warn" aria-hidden />
            <div className="min-w-0 flex-1">
              <p className="font-display font-semibold">รายการที่ควรสั่งซื้อ</p>
              <ul className="mt-2 flex flex-wrap gap-2">
                {reorder.map((i) => (
                  <li key={i.id} className="rounded-lg bg-card px-2.5 py-1 text-xs">
                    {i.name} — สั่งเพิ่มอย่างน้อย{' '}
                    <b className="font-ticket">{i.minQty * 2 - i.onHand} {i.unit}</b>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </Panel>
      )}

      <div className="mb-4 flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" aria-hidden />
          <Input value={q} onChange={(e) => setQ(e.target.value)} placeholder="ค้นหารหัส ชื่อ หมวดหมู่ หรือรุ่นที่รองรับ" aria-label="ค้นหาอะไหล่" className="h-11 bg-card pl-9" />
        </div>
        <Button variant={onlyLow ? 'default' : 'outline'} className="h-11" onClick={() => setOnlyLow((v) => !v)} aria-pressed={onlyLow}>
          <AlertTriangle /> เฉพาะใกล้หมด
        </Button>
      </div>

      {rows.length === 0 ? (
        inventory.length === 0 ? (
          <EmptyState icon={Package} title="ยังไม่มีอะไหล่ในระบบ" description="เพิ่มรายการอะไหล่เพื่อเริ่มบันทึกสต๊อก" />
        ) : (
          <EmptyState icon={SearchX} title="ไม่พบอะไหล่ที่ค้นหา" />
        )
      ) : (
        <div className="rounded-2xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>รหัส / ชื่ออะไหล่</TableHead>
                <TableHead className="hidden md:table-cell">หมวดหมู่</TableHead>
                <TableHead className="hidden lg:table-cell">รองรับ</TableHead>
                <TableHead className="text-right">คงเหลือ</TableHead>
                <TableHead className="hidden sm:table-cell">ตำแหน่ง</TableHead>
                {isAdmin && <TableHead className="hidden text-right md:table-cell">ราคาทุน</TableHead>}
                {isAdmin && <TableHead className="w-10"><span className="sr-only">แก้ไข</span></TableHead>}
              </TableRow>
            </TableHeader>
            <TableBody>
              {rows.map((i) => (
                <TableRow key={i.id}>
                  <TableCell className="max-w-48 whitespace-normal">
                    <p className="font-ticket text-[11px] text-primary">{i.code}</p>
                    <p className="font-medium">{i.name}</p>
                  </TableCell>
                  <TableCell className="hidden md:table-cell">{i.category}</TableCell>
                  <TableCell className="hidden max-w-48 truncate text-muted-foreground lg:table-cell">{i.compatible}</TableCell>
                  <TableCell className="text-right">
                    <span className={cn('inline-block rounded-md px-2 py-0.5 font-ticket', i.onHand === 0 ? 'bg-destructive text-white' : isLow(i) ? 'bg-warn/30' : '')}>
                      {i.onHand}
                    </span>
                    <p className="text-[11px] text-muted-foreground">ขั้นต่ำ {i.minQty} {i.unit}</p>
                  </TableCell>
                  <TableCell className="hidden sm:table-cell">{i.location}</TableCell>
                  {isAdmin && <TableCell className="hidden text-right font-ticket md:table-cell">{fmtBaht(i.cost)}</TableCell>}
                  {isAdmin && (
                    <TableCell>
                      <Button variant="ghost" size="icon" aria-label={`แก้ไข ${i.name}`} onClick={() => setEditing(i)}>
                        <Pencil />
                      </Button>
                    </TableCell>
                  )}
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      {editing && (
        <ItemDialog item={editing === 'new' ? null : editing} onClose={() => setEditing(null)} />
      )}
    </>
  )
}

function ItemDialog({ item, onClose }: { item: InventoryItem | null; onClose: () => void }) {
  const { saveItem } = useAppStore()
  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-xl">
        <DialogHeader>
          <DialogTitle>{item ? 'แก้ไขข้อมูลอะไหล่' : 'เพิ่มอะไหล่ใหม่'}</DialogTitle>
          <DialogDescription>
            ยอดคงเหลือเปลี่ยนได้ผ่านการรับเข้า เบิกออก หรือปรับยอดเท่านั้น เพื่อให้ตรวจสอบย้อนหลังได้
          </DialogDescription>
        </DialogHeader>
        <form
          className="grid gap-4 sm:grid-cols-2"
          onSubmit={async (e) => {
            e.preventDefault()
            const f = new FormData(e.currentTarget)
            const v = (k: string) => String(f.get(k) ?? '').trim()
            if (!v('code') || !v('name')) return toast.error('กรุณากรอกรหัสและชื่ออะไหล่')
            const res = await saveItem({
              id: item?.id,
              code: v('code').toUpperCase(),
              name: v('name'),
              category: v('category'),
              compatible: v('compatible'),
              unit: v('unit') || 'ชิ้น',
              onHand: item?.onHand ?? 0,
              minQty: Math.max(0, Number(v('minQty')) || 0),
              cost: Math.max(0, Number(v('cost')) || 0),
              location: v('location'),
              note: v('note') || undefined,
            })
            if (!res.ok) return toast.error(res.error)
            toast.success(item ? 'บันทึกการแก้ไขแล้ว' : 'เพิ่มอะไหล่แล้ว')
            onClose()
          }}
        >
          <Field label="รหัสอะไหล่" htmlFor="code" required>
            <Input id="code" name="code" defaultValue={item?.code} className="h-11 font-ticket uppercase" />
          </Field>
          <Field label="ชื่ออะไหล่" htmlFor="name" required>
            <Input id="name" name="name" defaultValue={item?.name} className="h-11" />
          </Field>
          <Field label="หมวดหมู่" htmlFor="category">
            <Input id="category" name="category" defaultValue={item?.category} className="h-11" />
          </Field>
          <Field label="หน่วยนับ" htmlFor="unit">
            <Input id="unit" name="unit" defaultValue={item?.unit ?? 'ชิ้น'} className="h-11" />
          </Field>
          <Field label="ยี่ห้อหรือรุ่นที่รองรับ" htmlFor="compatible" className="sm:col-span-2">
            <Input id="compatible" name="compatible" defaultValue={item?.compatible} className="h-11" />
          </Field>
          <Field label="จำนวนขั้นต่ำ" htmlFor="minQty">
            <Input id="minQty" name="minQty" type="number" min={0} defaultValue={item?.minQty ?? 1} className="h-11" />
          </Field>
          <Field label="ราคาทุน (บาท)" htmlFor="cost">
            <Input id="cost" name="cost" type="number" min={0} step="0.01" defaultValue={item?.cost} className="h-11" />
          </Field>
          <Field label="ตำแหน่งจัดเก็บ" htmlFor="location">
            <Input id="location" name="location" defaultValue={item?.location} className="h-11" />
          </Field>
          <Field label="หมายเหตุ" htmlFor="note">
            <Input id="note" name="note" defaultValue={item?.note} className="h-11" />
          </Field>
          <DialogFooter className="sm:col-span-2">
            <Button type="submit" size="lg">บันทึก</Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}
