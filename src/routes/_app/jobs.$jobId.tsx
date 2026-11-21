import * as React from 'react'
import { Link, createFileRoute } from '@tanstack/react-router'
import {
  ArrowLeft,
  ArrowRightLeft,
  Camera,
  FileCheck2,
  FileSearch,
  PackageMinus,
  Pencil,
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

export const Route = createFileRoute('/_app/jobs/$jobId')({
  head: () => ({ meta: [{ title: 'รายละเอียดงานซ่อม · Hatyai Soundstar' }] }),
  component: JobDetail,
})

function JobDetail() {
  const { jobId } = Route.useParams()
  const { jobs, currentUser } = useAppStore()
  const job = jobs.find((j) => j.id === jobId)
  const canSee =
    job && (currentUser?.role !== 'TECH' || job.technicianId === currentUser.id)

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
  const { currentUser, profileName, inventory, company } = useAppStore()
  const role = currentUser!.role
  const [statusOpen, setStatusOpen] = React.useState(false)
  const [partOpen, setPartOpen] = React.useState(false)
  const [editCustomerOpen, setEditCustomerOpen] = React.useState(false)

  // สถานะเลือกรูปแบบการพิมพ์: 'FIELD' = ใบช่างออกหน้างาน, 'COMPLETE' = ใบซ่อมเสร็จ/ส่งคืน
  const [printMode, setPrintMode] = React.useState<'FIELD' | 'COMPLETE'>('FIELD')

  const next = allowedNextStatuses(job.status, role)
  const canWork = role === 'ADMIN' || (role === 'TECH' && job.technicianId === currentUser!.id)
  const canEditCustomer = role === 'ADMIN' || role === 'FRONT'
  const closed = job.status === 'COMPLETED' || job.status === 'CANCELLED'

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

  return (
    <div className="mx-auto max-w-4xl print:m-0 print:box-border print:w-full print:p-0">
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Sarabun:wght@400;500;600;700&display=swap');

        @media print {
          @page {
            size: A4 portrait;
            margin: 4mm 6mm !important;
          }
          html, body {
            height: 100% !important;
            overflow: hidden !important;
          }
          html, body, * {
            font-family: 'Sarabun', 'TH Sarabun New', sans-serif !important;
            background: white !important;
            color: black !important;
          }
          aside, nav, header, button, select, iframe, [class*="netlify"], .no-print {
            display: none !important;
          }
          .grid {
            gap: 8px !important;
          }
          [class*="rounded-"], .border {
