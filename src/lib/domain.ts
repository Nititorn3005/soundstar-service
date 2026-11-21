import type { LucideIcon } from 'lucide-react'

export type Role = 'ADMIN' | 'RECEPTION' | 'TECH'

export interface Profile {
  id: string
  fullName: string
  role: Role
  phone?: string
}

export const ROLE_LABEL: Record<Role | string, string> = {
  ADMIN: 'ผู้ดูแลระบบ',
  RECEPTION: 'เจ้าหน้าที่รับงาน',
  TECH: 'ช่างซ่อม',
}

export type JobStatus =
  | 'RECEIVED'
  | 'WAITING_ASSIGN'
  | 'ASSIGNED'
  | 'IN_PROGRESS'
  | 'WAITING_PARTS'
  | 'WAITING_APPROVAL'
  | 'COMPLETED'
  | 'CANCELLED'

export const STATUS_ORDER: JobStatus[] = [
  'RECEIVED',
  'WAITING_ASSIGN',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_PARTS',
  'WAITING_APPROVAL',
  'COMPLETED',
  'CANCELLED',
]

export const OPEN_STATUSES: JobStatus[] = [
  'RECEIVED',
  'WAITING_ASSIGN',
  'ASSIGNED',
  'IN_PROGRESS',
  'WAITING_PARTS',
  'WAITING_APPROVAL',
]

export const STATUS_LABEL: Record<JobStatus, string> = {
  RECEIVED: 'รับแจ้งงาน',
  WAITING_ASSIGN: 'รอมอบหมายช่าง',
  ASSIGNED: 'มอบหมายช่างแล้ว',
  IN_PROGRESS: 'กำลังดำเนินการ',
  WAITING_PARTS: 'รออะไหล่',
  WAITING_APPROVAL: 'รออนุมัติ',
  COMPLETED: 'ซ่อมสำเร็จ',
  CANCELLED: 'ยกเลิกงาน',
}

export const STATUS_TONE: Record<JobStatus, 'default' | 'primary' | 'success' | 'warning' | 'danger' | 'info'> = {
  RECEIVED: 'info',
  WAITING_ASSIGN: 'warning',
  ASSIGNED: 'primary',
  IN_PROGRESS: 'primary',
  WAITING_PARTS: 'warning',
  WAITING_APPROVAL: 'warning',
  COMPLETED: 'success',
  CANCELLED: 'danger',
}

export type UrgencyLevel = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT'

export const URGENCY_LABEL: Record<UrgencyLevel | string, string> = {
  LOW: 'ปกติ',
  MEDIUM: 'ปานกลาง',
  HIGH: 'ด่วน',
  URGENT: 'ด่วนที่สุด',
}

export const MACHINE_TYPES = [
  'ฝาบน',
  'ฝาหน้า',
  'เครื่องอบผ้าเชิงพาณิชย์',
  'เครื่องซักผ้าเชิงพาณิชย์',
  'เครื่องแลกเหรียญ',
  'อื่นๆ',
]

export type TransactionType = 'IN' | 'OUT' | 'ADJUST'

export const TX_LABEL: Record<TransactionType, string> = {
  IN: 'รับเข้าสต๊อก',
  OUT: 'เบิกใช้งาน',
  ADJUST: 'ปรับปรุงสต๊อก',
}

export interface Job {
  id: string
  jobNo: string
  customerName: string
  phone: string
  brand: string
  model: string
  symptom: string
  technicianId?: string
  status: JobStatus
  receivedAt: string
  dueDate?: string
  notes?: string
  urgency?: UrgencyLevel
  machineType?: string
}

export interface InventoryItem {
  id: string
  code: string
  name: string
  qty: number
  minQty: number
  unit: string
  price: number
}

export interface InventoryTransaction {
  id: string
  partId: string
  type: TransactionType
  qty: number
  balanceAfter: number
  at: string
  by: string
}

export function fmtBaht(value: number): string {
  return new Intl.NumberFormat('th-TH', {
    style: 'currency',
    currency: 'THB',
    maximumFractionDigits: 2,
  }).format(value || 0)
}

export function fmtDate(iso: string): string {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleDateString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function fmtDateTime(iso: string) {
  if (!iso) return '-'
  const d = new Date(iso)
  return d.toLocaleString('th-TH', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function allowedNextStatuses(currentStatus: JobStatus): JobStatus[] {
  switch (currentStatus) {
    case 'RECEIVED':
      return ['WAITING_ASSIGN', 'ASSIGNED', 'CANCELLED']
    case 'WAITING_ASSIGN':
      return ['ASSIGNED', 'CANCELLED']
    case 'ASSIGNED':
      return ['IN_PROGRESS', 'WAITING_PARTS', 'CANCELLED']
    case 'IN_PROGRESS':
      return ['WAITING_PARTS', 'WAITING_APPROVAL', 'COMPLETED', 'CANCELLED']
    case 'WAITING_PARTS':
      return ['IN_PROGRESS', 'WAITING_APPROVAL', 'CANCELLED']
    case 'WAITING_APPROVAL':
      return ['IN_PROGRESS', 'COMPLETED', 'CANCELLED']
    case 'COMPLETED':
    case 'CANCELLED':
      return []
    default:
      return STATUS_ORDER
  }
}

export function isOverdue(dueDate?: string, status?: JobStatus): boolean {
  if (!dueDate || !status) return false
  if (status === 'COMPLETED' || status === 'CANCELLED') return false
  const due = new Date(dueDate).getTime()
  const now = new Date().getTime()
  return due < now
}

/**
 * 🟢 ฟังก์ชันเจเนอเรตเลขที่ใบงานซ่อม (Job No.)
 * โครงสร้าง: SS-YYMM-XXX (เช่น SS-6911-001)
 */
export function generateJobNo(existingJobs: Job[]): string {
  const now = new Date()
  const thYear = now.getFullYear() + 543
  const yy = String(thYear).slice(-2)
  const mm = String(now.getMonth() + 1).padStart(2, '0')

  const prefix = `SS-${yy}${mm}`
  const countInMonth = existingJobs.filter((j) => j.jobNo && j.jobNo.startsWith(prefix)).length
  const nextSeq = String(countInMonth + 1).padStart(3, '0')

  return `${prefix}-${nextSeq}`
}