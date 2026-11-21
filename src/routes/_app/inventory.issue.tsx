import { createFileRoute } from '@tanstack/react-router'

import { PageHeader, RoleGate } from '@/components/app/shell'
import { StockMoveForm } from '@/components/app/stock-form'

export const Route = createFileRoute('/_app/inventory/issue')({
  head: () => ({ meta: [{ title: 'เบิกอะไหล่ออก · Hatyai Soundstar' }] }),
  component: () => (
    <RoleGate roles={['ADMIN', 'TECH']}>
      <PageHeader eyebrow="Stock out" title="เบิกอะไหล่ออก" description="เบิกอะไหล่และผูกกับใบงานซ่อม ระบบไม่อนุญาตให้เบิกเกินยอดคงเหลือ" />
      <StockMoveForm mode="OUT" />
    </RoleGate>
  ),
})
