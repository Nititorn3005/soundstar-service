import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";

import {
  allowedNextStatuses,
  generateJobNo,
  type InventoryItem,
  type InventoryTx,
  type Profile,
  type RepairJob,
  type Role,
} from "./domain";
import {
  partsByJob,
  toCompany,
  toItem,
  toJob,
  toProfile,
  toTransactions,
} from "./server/mappers";
import { requireViewer } from "./server/session";
import {
  supabaseAdmin,
  supabaseAsUser,
  usernameToEmail,
} from "./server/supabase";
import { checkNewAccount } from "./validation";

type Result<T = void> = { ok: true; value: T } | { ok: false; error: string };
type Row = Record<string, unknown>;

const fail = (error: string): Result<never> => ({ ok: false, error });
const dbError = "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่";

async function viewerWithRole(roles?: Role[]) {
  const viewer = await requireViewer();
  if (roles && !roles.includes(viewer.profile.role))
    throw new Error("ไม่มีสิทธิ์ดำเนินการ");
  return viewer;
}

async function loadJob(id: string): Promise<RepairJob | null> {
  const { data, error } = await supabaseAdmin()
    .from("repair_jobs")
    .select("*, repair_job_history(*), repair_job_photos(id)")
    .eq("id", id)
    .is("deleted_at", null)
    .maybeSingle();
  if (error) throw new Error(dbError);
  if (!data) return null;
  const { data: txRows, error: txError } = await supabaseAdmin()
    .from("inventory_transactions")
    .select("*")
    .eq("job_id", id)
    .order("created_at");
  if (txError) throw new Error(dbError);
  const txs = toTransactions(txRows ?? [], []);
  return toJob(data, partsByJob(txs).get(id) ?? []);
}

export const getAppData = createServerFn({ method: "GET" }).handler(
  async () => {
    const { profile } = await viewerWithRole();
    const admin = supabaseAdmin();
    const [companyResult, profilesResult, jobsResult, itemsResult, txResult] =
      await Promise.all([
        admin
          .from("companies")
          .select("*")
          .order("created_at")
          .limit(1)
          .maybeSingle(),
        admin
          .from("profiles")
          .select("*")
          .is("deleted_at", null)
          .order("full_name"),
        admin
          .from("repair_jobs")
          .select("*, repair_job_history(*), repair_job_photos(id)")
          .is("deleted_at", null)
          .order("created_at", { ascending: false }),
        admin
          .from("inventory_items")
          .select("*")
          .is("deleted_at", null)
          .order("code"),
        admin
          .from("inventory_transactions")
          .select("*")
          .order("created_at", { ascending: false }),
      ]);
    if (
      companyResult.error ||
      profilesResult.error ||
      jobsResult.error ||
      itemsResult.error ||
      txResult.error
    )
      throw new Error("โหลดข้อมูลระบบไม่สำเร็จ");

    const profiles: Profile[] = (profilesResult.data ?? []).map(toProfile);
    const items: InventoryItem[] = (itemsResult.data ?? []).map((r) =>
      toItem(r, profile.role === "ADMIN"),
    );
    const transactions: InventoryTx[] = toTransactions(
      txResult.data ?? [],
      itemsResult.data ?? [],
    );
    const jobRows =
      profile.role === "TECH"
        ? (jobsResult.data ?? []).filter((r) => r.technician_id === profile.id)
        : (jobsResult.data ?? []);
    const jobParts = partsByJob(transactions);
    const jobs = jobRows.map((r) => toJob(r, jobParts.get(r.id) ?? []));

    return {
      currentUser: profile,
      company: toCompany(companyResult.data),
      profiles,
      jobs,
      inventory: items,
      transactions,
    };
  },
);

const jobItemSchema = z.object({
  applianceType: z.string().trim().min(1).max(120),
  brand: z.string().trim().min(1).max(120),
  model: z.string().trim().min(1).max(120),
  serialNumber: z.string().max(120).optional(),
  purchaseDate: z.string().optional(),
  symptom: z.string().trim().min(1).max(2000),
  details: z.string().max(5000).optional(),
});

const jobInput = z.object({
  customerName: z.string().trim().min(1).max(200),
  phone: z.string().trim().min(1).max(40),
  contactName: z.string().max(200).optional(),
  address: z.string().trim().min(1).max(1000),
  items: z.array(jobItemSchema).min(1).optional(),
  machineType: z.string().max(120).optional(),
  brand: z.string().max(120).optional(),
  model: z.string().max(120).optional(),
  serialNo: z.string().max(120).optional(),
  symptom: z.string().max(2000).optional(),
  details: z.string().max(5000).optional(),
  technicianId: z.string().uuid().optional(),
  appointmentAt: z.string().optional(),
  urgency: z.string().default("LOW"),
  note: z.string().max(5000).optional(),
  photos: z.number().int().min(0).max(6).optional(),
});

export const createRepairJob = createServerFn({ method: "POST" })
  .validator(jobInput)
  .handler(async ({ data }): Promise<Result<RepairJob>> => {
    try {
      const viewer = await viewerWithRole(["ADMIN", "FRONT", "RECEPTION"]);
      const { profile } = viewer;
      if (profile.role !== "ADMIN" && data.technicianId)
        return fail("เฉพาะผู้ดูแลระบบที่มอบหมายช่างได้");

      const admin = supabaseAdmin();
      const firstItem = data.items?.[0];
      const applianceType = firstItem?.applianceType || data.machineType || "อื่นๆ";
      const brand = firstItem?.brand || data.brand || "-";
      const model = firstItem?.model || data.model || "-";
      const serialNumber = firstItem?.serialNumber || data.serialNo || null;
      const purchaseDate = firstItem?.purchaseDate || null;
      const symptom = firstItem?.symptom || data.symptom || "-";
      const details = firstItem?.details || data.details || null;

      const combinedNote = [data.note, details ? `รายละเอียดเพิ่มเติม: ${details}` : null]
        .filter(Boolean)
        .join("\n") || null;

      const { data: existingJobs } = await admin
        .from("repair_jobs")
        .select("job_no");
      const mappedExisting = (existingJobs ?? []).map((r) => ({
        jobNo: r.job_no,
      })) as unknown as RepairJob[];
      const jobNo = generateJobNo(mappedExisting);

      const initialStatus = data.technicianId ? "ASSIGNED" : "WAITING_ASSIGN";
      const now = new Date().toISOString();

      const { data: createdJob, error: insertError } = await admin
        .from("repair_jobs")
        .insert({
          job_no: jobNo,
          customer_name: data.customerName,
          customer_phone: data.phone,
          contact_name: data.contactName ?? null,
          customer_address: data.address,
          appliance_type: applianceType,
          brand,
          model,
          brand_model: `${brand} ${model}`.trim(),
          serial_number: serialNumber,
          purchase_date: purchaseDate,
          symptom,
          status: initialStatus,
          technician_id: data.technicianId ?? null,
          appointment_at: data.appointmentAt ?? null,
          urgency: data.urgency || "LOW",
          note: combinedNote,
          created_by: profile.id,
          history: [
            {
              id: crypto.randomUUID(),
              from: null,
              to: initialStatus,
              at: now,
              by: profile.id,
              note: "รับแจ้งงานซ่อมเข้าระบบ",
            },
          ],
        })
        .select("id")
        .single();

      if (insertError || !createdJob)
        return fail(insertError?.message || dbError);

      if (data.items && data.items.length > 0) {
        const itemRows = data.items.map((item) => ({
          job_id: createdJob.id,
          appliance_type: item.applianceType,
          brand: item.brand,
          model: item.model,
          serial_number: item.serialNumber ?? null,
          purchase_date: item.purchaseDate || null,
          symptom: item.symptom,
          details: item.details ?? null,
        }));
        await admin.from("repair_job_items").insert(itemRows);
      }

      const job = await loadJob(createdJob.id);
      return job
        ? { ok: true, value: job }
        : fail("สร้างใบงานแล้วแต่โหลดข้อมูลไม่สำเร็จ");
    } catch (error) {
      return fail(error instanceof Error ? error.message : dbError);
    }
  });

const jobPatchSchema = z.object({
  diagnosis: z.string().max(5000).optional(),
  resolution: z.string().max(5000).optional(),
  result: z.string().max(5000).optional(),
  note: z.string().max(5000).optional(),
  appointmentAt: z.string().datetime().optional(),
});

export const updateRepairJob = createServerFn({ method: "POST" })
  .validator(z.object({ id: z.string().uuid(), patch: jobPatchSchema }))
  .handler(async ({ data }): Promise<Result> => {
    try {
      const viewer = await viewerWithRole();
      const { profile } = viewer;
      const current = await loadJob(data.id);
      if (!current) return fail("ไม่พบใบงาน");
      if (profile.role === "FRONT") return fail("ไม่มีสิทธิ์แก้ไขผลการซ่อม");
      if (profile.role === "TECH" && current.technicianId !== profile.id)
        return fail("แก้ไขได้เฉพาะงานที่ได้รับมอบหมาย");
      const dbPatch: Row = {};
      if (data.patch.diagnosis !== undefined)
        dbPatch.diagnosis = data.patch.diagnosis;
      if (data.patch.resolution !== undefined)
        dbPatch.resolution = data.patch.resolution;
      if (data.patch.result !== undefined) dbPatch.result = data.patch.result;
      if (data.patch.note !== undefined) dbPatch.note = data.patch.note;
      if (data.patch.appointmentAt !== undefined)
        dbPatch.appointment_at = data.patch.appointmentAt;
      const { error } = await supabaseAdmin()
        .from("repair_jobs")
        .update(dbPatch)
        .eq("id", data.id);
      return error
        ? fail(error.message || dbError)
        : { ok: true, value: undefined };
    } catch (error) {
      return fail(error instanceof Error ? error.message : dbError);
    }
  });

export const changeRepairJobStatus = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid(),
      to: z.enum([
        "RECEIVED",
        "WAITING_ASSIGN",
        "ASSIGNED",
        "IN_PROGRESS",
        "WAITING_PARTS",
        "WAITING_APPROVAL",
        "COMPLETED",
        "CANCELLED",
      ]),
      note: z.string().max(1000).optional(),
    }),
  )
  .handler(async ({ data }): Promise<Result> => {
    try {
      const viewer = await viewerWithRole();
      const { profile } = viewer;
      const job = await loadJob(data.id);
      if (!job) return fail("ไม่พบใบงาน");
      if (profile.role === "TECH" && job.technicianId !== profile.id)
        return fail("เปลี่ยนสถานะได้เฉพาะงานที่ได้รับมอบหมาย");

      const isNoteOnlyLog = data.to === job.status && Boolean(data.note?.trim());
      if (
        !isNoteOnlyLog &&
        !allowedNextStatuses(job.status, profile.role).includes(data.to)
      ) {
        return fail("ไม่สามารถเปลี่ยนเป็นสถานะนี้ได้");
      }

      const admin = supabaseAdmin();
      const { data: currentJob } = await admin
        .from("repair_jobs")
        .select("history")
        .eq("id", data.id)
        .single();

      const currentHistory = Array.isArray(currentJob?.history)
        ? currentJob.history
        : [];
      const now = new Date().toISOString();
      const trimmedNote = data.note ? data.note.trim() : null;

      const newHistoryItem = {
        id: crypto.randomUUID(),
        from: job.status,
        to: data.to,
        at: now,
        by: profile.id,
        note: trimmedNote,
      };

      const { error } = await admin
        .from("repair_jobs")
        .update({
          status: data.to,
          history: [...currentHistory, newHistoryItem],
          updated_at: now,
        })
        .eq("id", data.id);

      if (error) return fail(error.message || dbError);

      await admin
        .from("repair_job_history")
        .insert({
          job_id: data.id,
          from_status: job.status,
          to_status: data.to,
          changed_by: profile.id,
          note: trimmedNote,
          created_at: now,
        })
        .then(() => {})
        .catch(() => {});

      return { ok: true, value: undefined };
    } catch (error) {
      return fail(error instanceof Error ? error.message : dbError);
    }
  });

export const assignRepairTechnician = createServerFn({ method: "POST" })
  .validator(
    z.object({ id: z.string().uuid(), technicianId: z.string().uuid() }),
  )
  .handler(async ({ data }): Promise<Result> => {
    try {
      const viewer = await viewerWithRole(["ADMIN"]);
      const { error } = await supabaseAsUser(viewer.accessToken).rpc(
        "assign_repair_technician",
        {
          p_job_id: data.id,
          p_technician_id: data.technicianId,
        },
      );
      return error
        ? fail(error.message || dbError)
        : { ok: true, value: undefined };
    } catch (error) {
      return fail(error instanceof Error ? error.message : dbError);
    }
  });

export const moveInventoryStock = createServerFn({ method: "POST" })
  .validator(
    z.object({
      partId: z.string().uuid(),
      type: z.enum(["IN", "OUT", "ADJUST"]),
      qty: z
        .number()
        .int()
        .refine((n) => n !== 0),
      jobId: z.string().uuid().optional(),
      reference: z.string().max(200).optional(),
      reason: z.string().max(1000).optional(),
    }),
  )
  .handler(async ({ data }): Promise<Result<InventoryTx>> => {
    try {
      const viewer = await viewerWithRole();
      const { profile } = viewer;
      if (profile.role === "FRONT") return fail("ไม่มีสิทธิ์จัดการสต๊อก");
      if (profile.role === "TECH" && (data.type !== "OUT" || !data.jobId))
        return fail("ช่างเบิกอะไหล่ได้เท่านั้นและต้องระบุใบงาน");

      const admin = supabaseAdmin();

      const { data: item } = await admin
        .from("inventory_items")
        .select("*")
        .eq("id", data.partId)
        .single();

      if (!item) return fail("ไม่พบข้อมูลอะไหล่");

      const currentQty = Number(item.on_hand || 0);
      let newQty = currentQty;
      if (data.type === "IN") newQty += data.qty;
      else if (data.type === "OUT") newQty -= data.qty;
      else if (data.type === "ADJUST") newQty = data.qty;

      if (newQty < 0) return fail("จำนวนอะไหล่คงเหลือไม่เพียงพอ");

      await admin
        .from("inventory_items")
        .update({ on_hand: newQty, updated_at: new Date().toISOString() })
        .eq("id", data.partId);

      const { data: tx, error: txError } = await admin
        .from("inventory_transactions")
        .insert({
          item_id: data.partId,
          type: data.type,
          qty: data.qty,
          job_id: data.jobId ?? null,
          reference: data.reference ?? null,
          reason: data.reason ?? null,
          created_by: profile.id,
        })
        .select()
        .single();

      if (txError || !tx) return fail(txError?.message || dbError);

      const mapped = toTransactions([tx], [item])[0];
      return {
        ok: true,
        value: { ...mapped, balanceAfter: newQty },
      };
    } catch (error) {
      return fail(error instanceof Error ? error.message : dbError);
    }
  });

export const reverseInventoryTransaction = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid(),
      reason: z.string().trim().min(1).max(1000),
    }),
  )
  .handler(async ({ data }): Promise<Result> => {
    try {
      const viewer = await viewerWithRole(["ADMIN"]);
      const { error } = await supabaseAsUser(viewer.accessToken).rpc(
        "reverse_transaction",
        {
          p_transaction_id: data.id,
          p_reason: data.reason,
        },
      );
      return error
        ? fail(error.message || dbError)
        : { ok: true, value: undefined };
    } catch (error) {
      return fail(error instanceof Error ? error.message : dbError);
    }
  });

const itemSchema = z.object({
  id: z.string().uuid().optional(),
  code: z.string().trim().min(1).max(80),
  name: z.string().trim().min(1).max(200),
  category: z.string().max(120),
  compatible: z.string().max(300),
  unit: z.string().trim().min(1).max(40),
  minQty: z.number().min(0),
  cost: z.number().min(0),
  location: z.string().max(200),
  note: z.string().max(1000).optional(),
});

export const saveInventoryItem = createServerFn({ method: "POST" })
  .validator(itemSchema)
  .handler(async ({ data }): Promise<Result> => {
    try {
      await viewerWithRole(["ADMIN"]);
      const values = {
        code: data.code,
        name: data.name,
        category: data.category,
        compatible: data.compatible,
        unit: data.unit,
        min_threshold: data.minQty,
        cost_price: data.cost,
        location: data.location,
        note: data.note ?? null,
      };
      const query = data.id
        ? supabaseAdmin()
            .from("inventory_items")
            .update(values)
            .eq("id", data.id)
        : supabaseAdmin().from("inventory_items").insert(values);
      const { error } = await query;
      return error
        ? fail(error.message || dbError)
        : { ok: true, value: undefined };
    } catch (error) {
      return fail(error instanceof Error ? error.message : dbError);
    }
  });

const createUserSchema = z.object({
  fullName: z.string().max(120),
  username: z.string().max(64),
  role: z.enum(["ADMIN", "FRONT", "TECH"]),
  active: z.boolean(),
  phone: z.string().max(40).optional(),
  password: z.string().max(200),
  confirm: z.string().max(200),
});

export const createStaffUser = createServerFn({ method: "POST" })
  .validator(createUserSchema)
  .handler(async ({ data }): Promise<Result<Profile>> => {
    try {
      await viewerWithRole(["ADMIN"]);
      const username = data.username.trim().toLowerCase();
      const fullName = data.fullName.trim();
      const errors = checkNewAccount({ ...data, username, fullName });
      const firstError = Object.values(errors)[0];
      if (firstError) return fail(firstError);
      const admin = supabaseAdmin();
      const created = await admin.auth.admin.createUser({
        email: usernameToEmail(username),
        password: data.password,
        email_confirm: true,
        user_metadata: { username, full_name: fullName },
      });
      if (created.error || !created.data.user)
        return fail("สร้างบัญชีไม่สำเร็จ กรุณาตรวจสอบชื่อผู้ใช้");
      const id = created.data.user.id;
      const { data: row, error } = await admin
        .from("profiles")
        .insert({
          id,
          username,
          full_name: fullName,
          role: data.role,
          is_active: data.active,
          phone: data.phone || null,
          must_change_password: false,
        })
        .select("*")
        .single();
      if (error || !row) {
        await admin.auth.admin.deleteUser(id).catch(() => {});
        return fail(
          error?.code === "23505" ? "ชื่อผู้ใช้นี้ถูกใช้แล้ว" : dbError,
        );
      }
      return { ok: true, value: toProfile(row) };
    } catch (error) {
      return fail(error instanceof Error ? error.message : dbError);
    }
  });

export const updateStaffUser = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid(),
      patch: z.object({
        fullName: z.string().max(120).optional(),
        phone: z.string().max(40).optional(),
        role: z.enum(["ADMIN", "FRONT", "TECH"]).optional(),
        active: z.boolean().optional(),
      }),
    }),
  )
  .handler(async ({ data }): Promise<Result> => {
    try {
      const { profile: actor } = await viewerWithRole(["ADMIN"]);
      if (
        data.id === actor.id &&
        (data.patch.role || data.patch.active === false)
      )
        return fail("ไม่สามารถเปลี่ยนบทบาทหรือระงับบัญชีของตัวเองได้");
      const admin = supabaseAdmin();
      const { data: target, error: targetError } = await admin
        .from("profiles")
        .select("id, role, is_active")
        .eq("id", data.id)
        .is("deleted_at", null)
        .maybeSingle();
      if (targetError || !target) return fail("ไม่พบผู้ใช้งาน");
      if (
        target.role === "ADMIN" &&
        target.is_active &&
        ((data.patch.role && data.patch.role !== "ADMIN") ||
          data.patch.active === false)
      ) {
        const { count } = await admin
          .from("profiles")
          .select("id", { count: "exact", head: true })
          .eq("role", "ADMIN")
          .eq("is_active", true)
          .is("deleted_at", null);
        if ((count ?? 0) <= 1)
          return fail("ไม่สามารถลดจำนวนผู้ดูแลระบบคนสุดท้ายได้");
      }
      const patch: Row = {};
      if (data.patch.fullName !== undefined)
        patch.full_name = data.patch.fullName.trim();
      if (data.patch.phone !== undefined)
        patch.phone = data.patch.phone || null;
      if (data.patch.role !== undefined) patch.role = data.patch.role;
      if (data.patch.active !== undefined) patch.is_active = data.patch.active;
      const { error } = await admin
        .from("profiles")
        .update(patch)
        .eq("id", data.id);
      if (error) return fail(error.message || dbError);
      return { ok: true, value: undefined };
    } catch (error) {
      return fail(error instanceof Error ? error.message : dbError);
    }
  });

export const resetStaffPassword = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid(),
      password: z.string().max(200),
      confirm: z.string().max(200),
    }),
  )
  .handler(async ({ data }): Promise<Result> => {
    try {
      const { profile: actor } = await viewerWithRole(["ADMIN"]);
      if (data.id === actor.id)
        return fail("ไม่สามารถรีเซ็ตรหัสผ่านของตัวเองจากเมนูนี้ได้");
      const errors = checkNewAccount({
        fullName: "ผู้ใช้",
        username: "validuser",
        password: data.password,
        confirm: data.confirm,
      });
      if (errors.password || errors.confirm)
        return fail(errors.password ?? errors.confirm ?? "");
      const { error } = await supabaseAdmin().auth.admin.updateUserById(
        data.id,
        {
          password: data.password,
          user_metadata: { must_change_password: true },
        },
      );
      if (error) return fail(dbError);
      await supabaseAdmin()
        .from("profiles")
        .update({ must_change_password: true })
        .eq("id", data.id);
      return { ok: true, value: undefined };
    } catch (error) {
      return fail(error instanceof Error ? error.message : dbError);
    }
  });

export const saveCompany = createServerFn({ method: "POST" })
  .validator(
    z.object({
      id: z.string().uuid().optional(),
      nameTh: z.string().trim().min(1).max(200),
      nameEn: z.string().max(200),
      address: z.string().trim().min(1).max(1000),
      phones: z.string().trim().min(1).max(200),
      taxId: z.string().max(40).optional(),
    }),
  )
  .handler(async ({ data }): Promise<Result> => {
    try {
      await viewerWithRole(["ADMIN"]);
      const admin = supabaseAdmin();
      const values = {
        name: data.nameTh,
        name_en: data.nameEn,
        address: data.address,
        phone: data.phones,
        tax_id: data.taxId ?? null,
      };
      const result = data.id
        ? await admin.from("companies").update(values).eq("id", data.id)
        : await admin.from("companies").insert(values);
      if (result.error) return fail(result.error.message || dbError);
      return { ok: true, value: undefined };
    } catch (error) {
      return fail(error instanceof Error ? error.message : dbError);
    }
  });
