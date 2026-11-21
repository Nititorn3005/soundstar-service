import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'

import { PageHeader, RoleGate } from '@/components/app/shell'
import { StockMoveForm } from '@/components/app/stock-form'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'

export const Route = createFileRoute('/_app/inventory/receive')({
  head: () => ({ meta: [{ title: 'รับอะไหล่เข้า · Hatyai Soundstar' }] }),
  component: () => (
    <RoleGate roles={['ADMIN']}>
      <Receive />
    </RoleGate>
  ),
})

function Receive() {
  const [tab, setTab] = React.useState('IN')
  return (
    <>
      <PageHeader eyebrow="Stock in" title="รับอะไหล่เข้า" description="บันทึกอะไหล่ที่รับเข้าคลัง หรือปรับยอดหลังตรวจนับพร้อมระบุเหตุผล" />
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList className="mb-4">
          <TabsTrigger value="IN">รับเข้า</TabsTrigger>
          <TabsTrigger value="ADJUST">ปรับยอด</TabsTrigger>
        </TabsList>
        <TabsContent value="IN"><StockMoveForm mode="IN" /></TabsContent>
        <TabsContent value="ADJUST"><StockMoveForm mode="ADJUST" /></TabsContent>
      </Tabs>
    </>
  )
}
