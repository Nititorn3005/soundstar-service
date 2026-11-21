// Map Supabase rows to the domain types the UI uses (src/lib/domain.ts).
import type {
  Company,
  InventoryItem,
  InventoryTx,
  JobHistory,
  JobPart,
  JobStatus,
  Profile,
  RepairJob,
  Role,
  TxType,
  Urgency,
} from '../domain'

/* eslint-disable @typescript-eslint/no-explicit-any */
type Row = Record<string, any>

const str = (v: unknown) => (v == null ? undefined : String(v))

export function toStatus(s: unknown): JobStatus {
  // DELIVERED exists in the database enum; the UI treats it as completed.
  if (s === 'DELIVERED') return 'COMPLETED'
  return s as JobStatus
}

export function toProfile(r: Row): Profile {
  return {
    id: r.id,
    fullName: r.full_name,
    username: r.username,
    role: r.role as Role,
    active: !!r.is_active && !r.deleted_at,
    phone: str(r.phone) || undefined,
    createdAt: r.created_at,
    mustChangePassword: !!r.must_change_password,
  }
}

export function toCompany(r: Row | null | undefined): Company {
  return {
    id: r?.id,
    nameTh: r?.name ?? 'บริษัท หาดใหญ่ซาวด์สตาร์ จำกัด',
    nameEn: r?.name_en ?? 'Hatyai Soundstar Co., Ltd.',
    address: r?.address ?? '',
    phones: r?.phone ?? '',
    taxId: str(r?.tax_id) || undefined,
  }
}

export function toItem(r: Row, showCost: boolean): InventoryItem {
  return {
    id: r.id,
    code: r.code,
    name: r.name,
    category: r.category ?? '',
    compatible: r.compatible ?? '',
    unit: r.unit,
    onHand: Number(r.on_hand ?? 0),
    minQty: Number(r.min_threshold ?? 0),
    cost: showCost ? Number(r.cost_price ?? 0) : 0,
    location: r.location ?? '',
    note: str(r.note) || undefined,
  }
}

const TX_TYPE: Record<string, TxType> = {
  IN: 'IN',
  OUT: 'OUT',
  ADJUST: 'ADJUST',
  REVERSAL: 'REVERSAL',
  REVERSE: 'REVERSAL',
}

/**
 * Transactions newest first. The signed delta is normalised by type (IN adds,
 * OUT removes, ADJUST keeps its sign, REVERSAL negates the original), and the
 * running balance is rebuilt backwards from each item's current on-hand.
 */
export function toTransactions(rows: Row[], items: Row[]): InventoryTx[] {
  const byId = new Map(rows.map((r) => [r.id, r]))
  const delta = (r: Row, depth = 0): number => {
    const q = Number(r.qty)
    const type = TX_TYPE[r.type] ?? 'ADJUST'
    if (type === 'IN') return Math.abs(q)
    if (type === 'OUT') return -Math.abs(q)
    if (type === 'REVERSAL' && r.reverses_id && depth < 4) {
      const orig = byId.get(r.reverses_id)
      if (orig) return -delta(orig, depth + 1)
    }
    return q
  }
  const balance = new Map(items.map((i) => [i.id, Number(i.on_hand ?? 0)]))
  return rows.map((r) => {
    const type = TX_TYPE[r.type] ?? 'ADJUST'
    const d = delta(r)
    const after = balance.get(r.item_id) ?? 0
    balance.set(r.item_id, after - d)
    const note = str(r.note) || undefined
    return {
      id: r.id,
      at: r.created_at,
      type,
      partId: r.item_id,
      qty: d,
      balanceAfter: after,
      by: r.created_by,
      jobId: str(r.job_id),
      reference: type === 'IN' ? note : undefined,
      reason: type === 'IN' ? undefined : note,
      reversesId: str(r.reverses_id),
    }
  })
}

/** Parts used on each job: OUT transactions tied to the job that were not reversed. */
export function partsByJob(txs: InventoryTx[]): Map<string, JobPart[]> {
  const reversed = new Set(txs.filter((t) => t.reversesId).map((t) => t.reversesId))
  const out = new Map<string, JobPart[]>()
  for (const t of [...txs].reverse()) {
    if (t.type !== 'OUT' || !t.jobId || reversed.has(t.id)) continue
    const list = out.get(t.jobId) ?? []
    list.push({ partId: t.partId, qty: -t.qty, at: t.at, by: t.by })
    out.set(t.jobId, list)
  }
  return out
}

function splitBrandModel(r: Row) {
  if (r.brand || r.model) return { brand: r.brand ?? '', model: r.model ?? '' }
  const bm = String(r.brand_model ?? '').trim()
  const i = bm.indexOf(' ')
  return i < 0 ? { brand: bm, model: '' } : { brand: bm.slice(0, i), model: bm.slice(i + 1) }
}

export function toJob(r: Row, parts: JobPart[]): RepairJob {
  const history: JobHistory[] = ((r.repair_job_history ?? []) as Row[])
    .map((h) => ({
      id: h.id,
      at: h.created_at,
      by: h.created_by,
      from: h.from_status ? toStatus(h.from_status) : null,
      to: toStatus(h.to_status),
      note: str(h.note) || undefined,
    }))
    .sort((a, b) => a.at.localeCompare(b.at))
  return {
    id: r.id,
    jobNo: r.job_no,
    receivedAt: r.created_at,
    customerName: r.customer_name,
    phone: r.customer_phone,
    contactName: str(r.contact_name) || undefined,
    address: r.customer_address ?? '',
    machineType: r.appliance_type ?? '',
    ...splitBrandModel(r),
    serialNo: str(r.serial_number) || undefined,
    symptom: r.symptom,
    details: str(r.details) || undefined,
    receivedBy: r.created_by,
    technicianId: str(r.technician_id),
    appointmentAt: str(r.appointment_at),
    urgency: ((r.urgency as Urgency) ?? 'NORMAL') as Urgency,
    status: toStatus(r.status),
    note: str(r.note) || undefined,
    diagnosis: str(r.diagnosis) || undefined,
    resolution: str(r.resolution) || undefined,
    result: str(r.result) || undefined,
    photos: Array.isArray(r.repair_job_photos) ? r.repair_job_photos.length : 0,
    history,
    parts,
  }
}
