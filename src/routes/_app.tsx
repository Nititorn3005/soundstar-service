import { Navigate, Outlet, createFileRoute, redirect } from '@tanstack/react-router'

import { AppShell } from '@/components/app/shell'
import { getSession } from '@/lib/auth.functions'
import { useAppStore } from '@/lib/store'

export const Route = createFileRoute('/_app')({
  beforeLoad: async () => {
    if (!(await getSession())) throw redirect({ to: '/' })
  },
  component: AppLayout,
})

function AppLayout() {
  const { currentUser, loading } = useAppStore()
  if (loading) return <p role="status" className="p-6 text-sm text-muted-foreground">กำลังตรวจสอบการเข้าสู่ระบบ…</p>
  if (!currentUser) return <Navigate to="/" replace />
  return (
    <AppShell>
      <Outlet />
    </AppShell>
  )
}
