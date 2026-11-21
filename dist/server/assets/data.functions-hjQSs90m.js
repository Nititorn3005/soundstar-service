import { c as supabaseAsUser, d as toCompany, f as toItem, g as createServerRpc, h as toTransactions, i as requireViewer, l as usernameToEmail, m as toProfile, o as supabaseAdmin, p as toJob, u as partsByJob } from "./session-Do42_4ZC.js";
import { t as createServerFn } from "../server.js";
import { l as allowedNextStatuses } from "./domain-BwIhFv2h.js";
import { n as checkNewAccount } from "./validation-UYwavGYK.js";
import { z } from "zod";
// src/lib/data.functions.ts?tss-serverfn-split
var fail = (error) => ({
	ok: false,
	error
});
var dbError = "บันทึกข้อมูลไม่สำเร็จ กรุณาลองใหม่";
async function viewerWithRole(roles) {
	const viewer = await requireViewer();
	if (roles && !roles.includes(viewer.profile.role)) throw new Error("ไม่มีสิทธิ์ดำเนินการ");
	return viewer;
}
async function loadJob(id) {
	const { data, error } = await supabaseAdmin().from("repair_jobs").select("*, repair_job_history(*), repair_job_photos(id)").eq("id", id).is("deleted_at", null).maybeSingle();
	if (error) throw new Error(dbError);
	if (!data) return null;
	const { data: txRows, error: txError } = await supabaseAdmin().from("inventory_transactions").select("*").eq("job_id", id).order("created_at");
	if (txError) throw new Error(dbError);
	const txs = toTransactions(txRows ?? [], []);
	return toJob(data, partsByJob(txs).get(id) ?? []);
}
var getAppData_createServerFn_handler = createServerRpc({
	id: "b1f1f2383165e5d211c8cb880f4bbdf495e73648e806c9ce47d2e792ef59791a",
	name: "getAppData",
	filename: "src/lib/data.functions.ts"
}, (opts) => getAppData.__executeServer(opts));
var getAppData = createServerFn({ method: "GET" }).handler(getAppData_createServerFn_handler, async () => {
	const { profile } = await viewerWithRole();
	const admin = supabaseAdmin();
	const [companyResult, profilesResult, jobsResult, itemsResult, txResult] = await Promise.all([
		admin.from("companies").select("*").order("created_at").limit(1).maybeSingle(),
		admin.from("profiles").select("*").is("deleted_at", null).order("full_name"),
		admin.from("repair_jobs").select("*, repair_job_history(*), repair_job_photos(id)").is("deleted_at", null).order("created_at", { ascending: false }),
		admin.from("inventory_items").select("*").is("deleted_at", null).order("code"),
		admin.from("inventory_transactions").select("*").order("created_at", { ascending: false })
	]);
	if (companyResult.error || profilesResult.error || jobsResult.error || itemsResult.error || txResult.error) throw new Error("โหลดข้อมูลระบบไม่สำเร็จ");
	const profiles = (profilesResult.data ?? []).map(toProfile);
	const items = (itemsResult.data ?? []).map((r) => toItem(r, profile.role === "ADMIN"));
	const transactions = toTransactions(txResult.data ?? [], itemsResult.data ?? []);
	const jobRows = profile.role === "TECH" ? (jobsResult.data ?? []).filter((r) => r.technician_id === profile.id) : jobsResult.data ?? [];
	const jobParts = partsByJob(transactions);
	const jobs = jobRows.map((r) => toJob(r, jobParts.get(r.id) ?? []));
	return {
		currentUser: profile,
		company: toCompany(companyResult.data),
		profiles,
		jobs,
		inventory: items,
		transactions
	};
});
var jobInput = z.object({
	customerName: z.string().trim().min(1).max(200),
	phone: z.string().trim().min(1).max(40),
	contactName: z.string().max(200).optional(),
	address: z.string().trim().min(1).max(1e3),
	machineType: z.string().trim().min(1).max(120),
	brand: z.string().trim().min(1).max(120),
	model: z.string().trim().min(1).max(120),
	serialNo: z.string().max(120).optional(),
	symptom: z.string().trim().min(1).max(2e3),
	details: z.string().max(5e3).optional(),
	technicianId: z.string().uuid().optional(),
	appointmentAt: z.string().datetime().optional(),
	urgency: z.enum([
		"LOW",
		"NORMAL",
		"HIGH",
		"URGENT"
	]),
	note: z.string().max(5e3).optional(),
	photos: z.number().int().min(0).max(6).optional()
});
var createRepairJob_createServerFn_handler = createServerRpc({
	id: "2846cbb31df64efcaa385c4b9abad8a77fffc986a522439a5a69329a20d3c211",
	name: "createRepairJob",
	filename: "src/lib/data.functions.ts"
}, (opts) => createRepairJob.__executeServer(opts));
var createRepairJob = createServerFn({ method: "POST" }).validator(jobInput).handler(createRepairJob_createServerFn_handler, async ({ data }) => {
	try {
		const viewer = await viewerWithRole(["ADMIN", "FRONT"]);
		const { profile } = viewer;
		if (profile.role !== "ADMIN" && data.technicianId) return fail("เฉพาะผู้ดูแลระบบที่มอบหมายช่างได้");
		const { data: id, error } = await supabaseAsUser(viewer.accessToken).rpc("create_repair_job", {
			p_customer_name: data.customerName,
			p_customer_phone: data.phone,
			p_contact_name: data.contactName ?? null,
			p_customer_address: data.address,
			p_appliance_type: data.machineType,
			p_brand: data.brand,
			p_model: data.model,
			p_serial_number: data.serialNo ?? null,
			p_symptom: data.symptom,
			p_details: data.details ?? null,
			p_technician_id: data.technicianId ?? null,
			p_appointment_at: data.appointmentAt ?? null,
			p_urgency: data.urgency,
			p_note: data.note ?? null,
			p_idempotency_key: crypto.randomUUID()
		});
		if (error) return fail(error.message || dbError);
		const job = await loadJob(typeof id === "string" ? id : String(id?.id ?? ""));
		return job ? {
			ok: true,
			value: job
		} : fail("สร้างใบงานแล้วแต่โหลดข้อมูลไม่สำเร็จ");
	} catch (error) {
		return fail(error instanceof Error ? error.message : dbError);
	}
});
var jobPatchSchema = z.object({
	diagnosis: z.string().max(5e3).optional(),
	resolution: z.string().max(5e3).optional(),
	result: z.string().max(5e3).optional(),
	note: z.string().max(5e3).optional(),
	appointmentAt: z.string().datetime().optional()
});
var updateRepairJob_createServerFn_handler = createServerRpc({
	id: "c34a63767d29280c6895c4a7b2f637119a1dfb0c9337985fdc9ae00d2d99495b",
	name: "updateRepairJob",
	filename: "src/lib/data.functions.ts"
}, (opts) => updateRepairJob.__executeServer(opts));
var updateRepairJob = createServerFn({ method: "POST" }).validator(z.object({
	id: z.string().uuid(),
	patch: jobPatchSchema
})).handler(updateRepairJob_createServerFn_handler, async ({ data }) => {
	try {
		const { profile } = await viewerWithRole();
		const current = await loadJob(data.id);
		if (!current) return fail("ไม่พบใบงาน");
		if (profile.role === "FRONT") return fail("ไม่มีสิทธิ์แก้ไขผลการซ่อม");
		if (profile.role === "TECH" && current.technicianId !== profile.id) return fail("แก้ไขได้เฉพาะงานที่ได้รับมอบหมาย");
		const dbPatch = {};
		if (data.patch.diagnosis !== void 0) dbPatch.diagnosis = data.patch.diagnosis;
		if (data.patch.resolution !== void 0) dbPatch.resolution = data.patch.resolution;
		if (data.patch.result !== void 0) dbPatch.result = data.patch.result;
		if (data.patch.note !== void 0) dbPatch.note = data.patch.note;
		if (data.patch.appointmentAt !== void 0) dbPatch.appointment_at = data.patch.appointmentAt;
		const { error } = await supabaseAdmin().from("repair_jobs").update(dbPatch).eq("id", data.id);
		return error ? fail(error.message || dbError) : {
			ok: true,
			value: void 0
		};
	} catch (error) {
		return fail(error instanceof Error ? error.message : dbError);
	}
});
var changeRepairJobStatus_createServerFn_handler = createServerRpc({
	id: "2b74fbe40b93e930e1c95211d7707e622d088d1391154204752cec348c6203b5",
	name: "changeRepairJobStatus",
	filename: "src/lib/data.functions.ts"
}, (opts) => changeRepairJobStatus.__executeServer(opts));
var changeRepairJobStatus = createServerFn({ method: "POST" }).validator(z.object({
	id: z.string().uuid(),
	to: z.enum([
		"RECEIVED",
		"WAITING_ASSIGN",
		"ASSIGNED",
		"IN_PROGRESS",
		"WAITING_PARTS",
		"WAITING_APPROVAL",
		"COMPLETED",
		"CANCELLED"
	]),
	note: z.string().max(1e3).optional()
})).handler(changeRepairJobStatus_createServerFn_handler, async ({ data }) => {
	try {
		const viewer = await viewerWithRole();
		const { profile } = viewer;
		const job = await loadJob(data.id);
		if (!job) return fail("ไม่พบใบงาน");
		if (profile.role === "TECH" && job.technicianId !== profile.id) return fail("เปลี่ยนสถานะได้เฉพาะงานที่ได้รับมอบหมาย");
		if (!allowedNextStatuses(job.status, profile.role).includes(data.to)) return fail("ไม่สามารถเปลี่ยนเป็นสถานะนี้ได้");
		const { error } = await supabaseAsUser(viewer.accessToken).rpc("change_job_status", {
			p_job_id: data.id,
			p_to_status: data.to,
			p_note: data.note ?? null
		});
		return error ? fail(error.message || dbError) : {
			ok: true,
			value: void 0
		};
	} catch (error) {
		return fail(error instanceof Error ? error.message : dbError);
	}
});
var assignRepairTechnician_createServerFn_handler = createServerRpc({
	id: "a8d17d0da5689078451d789debd079941b5a3fd40747d6f7a3a87ce1d497a7eb",
	name: "assignRepairTechnician",
	filename: "src/lib/data.functions.ts"
}, (opts) => assignRepairTechnician.__executeServer(opts));
var assignRepairTechnician = createServerFn({ method: "POST" }).validator(z.object({
	id: z.string().uuid(),
	technicianId: z.string().uuid()
})).handler(assignRepairTechnician_createServerFn_handler, async ({ data }) => {
	try {
		const viewer = await viewerWithRole(["ADMIN"]);
		const { error } = await supabaseAsUser(viewer.accessToken).rpc("assign_repair_technician", {
			p_job_id: data.id,
			p_technician_id: data.technicianId
		});
		return error ? fail(error.message || dbError) : {
			ok: true,
			value: void 0
		};
	} catch (error) {
		return fail(error instanceof Error ? error.message : dbError);
	}
});
var moveInventoryStock_createServerFn_handler = createServerRpc({
	id: "886cee72268a9b9fe324cf13263e0e1ce54d33229897563844eb5eb45a6dad45",
	name: "moveInventoryStock",
	filename: "src/lib/data.functions.ts"
}, (opts) => moveInventoryStock.__executeServer(opts));
var moveInventoryStock = createServerFn({ method: "POST" }).validator(z.object({
	partId: z.string().uuid(),
	type: z.enum([
		"IN",
		"OUT",
		"ADJUST"
	]),
	qty: z.number().int().refine((n) => n !== 0),
	jobId: z.string().uuid().optional(),
	reference: z.string().max(200).optional(),
	reason: z.string().max(1e3).optional()
})).handler(moveInventoryStock_createServerFn_handler, async ({ data }) => {
	try {
		const viewer = await viewerWithRole();
		const { profile } = viewer;
		if (profile.role === "FRONT") return fail("ไม่มีสิทธิ์จัดการสต๊อก");
		if (profile.role === "TECH" && (data.type !== "OUT" || !data.jobId)) return fail("ช่างเบิกอะไหล่ได้เท่านั้นและต้องระบุใบงาน");
		const { data: id, error } = await supabaseAsUser(viewer.accessToken).rpc("move_stock", {
			p_item_id: data.partId,
			p_type: data.type,
			p_qty: data.qty,
			p_job_id: data.jobId ?? null,
			p_reference: data.reference ?? null,
			p_reason: data.reason ?? null,
			p_idempotency_key: crypto.randomUUID()
		});
		if (error) return fail(error.message || dbError);
		const txId = typeof id === "string" ? id : String(id?.id ?? "");
		const admin = supabaseAdmin();
		const [{ data: tx, error: txError }, { data: item, error: itemError }] = await Promise.all([admin.from("inventory_transactions").select("*").eq("id", txId).single(), admin.from("inventory_items").select("*").eq("id", data.partId).single()]);
		if (txError || itemError) return fail(dbError);
		return {
			ok: true,
			value: {
				...toTransactions([tx], [item])[0],
				balanceAfter: Number(item.on_hand)
			}
		};
	} catch (error) {
		return fail(error instanceof Error ? error.message : dbError);
	}
});
var reverseInventoryTransaction_createServerFn_handler = createServerRpc({
	id: "cebcabd7536a01c0133e167d18159ba27aa0026cb7810e92895a50909217f17c",
	name: "reverseInventoryTransaction",
	filename: "src/lib/data.functions.ts"
}, (opts) => reverseInventoryTransaction.__executeServer(opts));
var reverseInventoryTransaction = createServerFn({ method: "POST" }).validator(z.object({
	id: z.string().uuid(),
	reason: z.string().trim().min(1).max(1e3)
})).handler(reverseInventoryTransaction_createServerFn_handler, async ({ data }) => {
	try {
		const viewer = await viewerWithRole(["ADMIN"]);
		const { error } = await supabaseAsUser(viewer.accessToken).rpc("reverse_transaction", {
			p_transaction_id: data.id,
			p_reason: data.reason
		});
		return error ? fail(error.message || dbError) : {
			ok: true,
			value: void 0
		};
	} catch (error) {
		return fail(error instanceof Error ? error.message : dbError);
	}
});
var itemSchema = z.object({
	id: z.string().uuid().optional(),
	code: z.string().trim().min(1).max(80),
	name: z.string().trim().min(1).max(200),
	category: z.string().max(120),
	compatible: z.string().max(300),
	unit: z.string().trim().min(1).max(40),
	minQty: z.number().min(0),
	cost: z.number().min(0),
	location: z.string().max(200),
	note: z.string().max(1e3).optional()
});
var saveInventoryItem_createServerFn_handler = createServerRpc({
	id: "7307fef306b31ec04829fd517fab9372a262264d6f367b129ea32159eb96115f",
	name: "saveInventoryItem",
	filename: "src/lib/data.functions.ts"
}, (opts) => saveInventoryItem.__executeServer(opts));
var saveInventoryItem = createServerFn({ method: "POST" }).validator(itemSchema).handler(saveInventoryItem_createServerFn_handler, async ({ data }) => {
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
			note: data.note ?? null
		};
		const { error } = await (data.id ? supabaseAdmin().from("inventory_items").update(values).eq("id", data.id) : supabaseAdmin().from("inventory_items").insert(values));
		return error ? fail(error.message || dbError) : {
			ok: true,
			value: void 0
		};
	} catch (error) {
		return fail(error instanceof Error ? error.message : dbError);
	}
});
var createUserSchema = z.object({
	fullName: z.string().max(120),
	username: z.string().max(64),
	role: z.enum([
		"ADMIN",
		"FRONT",
		"TECH"
	]),
	active: z.boolean(),
	phone: z.string().max(40).optional(),
	password: z.string().max(200),
	confirm: z.string().max(200)
});
var createStaffUser_createServerFn_handler = createServerRpc({
	id: "06ef03706d3defe4a34cc34fe82e9d89fb1de20cc1878fe84b1b3143d67375da",
	name: "createStaffUser",
	filename: "src/lib/data.functions.ts"
}, (opts) => createStaffUser.__executeServer(opts));
var createStaffUser = createServerFn({ method: "POST" }).validator(createUserSchema).handler(createStaffUser_createServerFn_handler, async ({ data }) => {
	try {
		await viewerWithRole(["ADMIN"]);
		const username = data.username.trim().toLowerCase();
		const fullName = data.fullName.trim();
		const errors = checkNewAccount({
			...data,
			username,
			fullName
		});
		const firstError = Object.values(errors)[0];
		if (firstError) return fail(firstError);
		const admin = supabaseAdmin();
		const created = await admin.auth.admin.createUser({
			email: usernameToEmail(username),
			password: data.password,
			email_confirm: true,
			user_metadata: {
				username,
				full_name: fullName
			}
		});
		if (created.error || !created.data.user) return fail("สร้างบัญชีไม่สำเร็จ กรุณาตรวจสอบชื่อผู้ใช้");
		const id = created.data.user.id;
		const { data: row, error } = await admin.from("profiles").insert({
			id,
			username,
			full_name: fullName,
			role: data.role,
			is_active: data.active,
			phone: data.phone || null,
			must_change_password: false
		}).select("*").single();
		if (error || !row) {
			await admin.auth.admin.deleteUser(id).catch(() => {});
			return fail(error?.code === "23505" ? "ชื่อผู้ใช้นี้ถูกใช้แล้ว" : dbError);
		}
		return {
			ok: true,
			value: toProfile(row)
		};
	} catch (error) {
		return fail(error instanceof Error ? error.message : dbError);
	}
});
var updateStaffUser_createServerFn_handler = createServerRpc({
	id: "e5e7e74df11fcba1a2476a182357c3d946b74704b026893d22555b0f490a6a1c",
	name: "updateStaffUser",
	filename: "src/lib/data.functions.ts"
}, (opts) => updateStaffUser.__executeServer(opts));
var updateStaffUser = createServerFn({ method: "POST" }).validator(z.object({
	id: z.string().uuid(),
	patch: z.object({
		fullName: z.string().max(120).optional(),
		phone: z.string().max(40).optional(),
		role: z.enum([
			"ADMIN",
			"FRONT",
			"TECH"
		]).optional(),
		active: z.boolean().optional()
	})
})).handler(updateStaffUser_createServerFn_handler, async ({ data }) => {
	try {
		const { profile: actor } = await viewerWithRole(["ADMIN"]);
		if (data.id === actor.id && (data.patch.role || data.patch.active === false)) return fail("ไม่สามารถเปลี่ยนบทบาทหรือระงับบัญชีของตัวเองได้");
		const admin = supabaseAdmin();
		const { data: target, error: targetError } = await admin.from("profiles").select("id, role, is_active").eq("id", data.id).is("deleted_at", null).maybeSingle();
		if (targetError || !target) return fail("ไม่พบผู้ใช้งาน");
		if (target.role === "ADMIN" && target.is_active && (data.patch.role && data.patch.role !== "ADMIN" || data.patch.active === false)) {
			const { count } = await admin.from("profiles").select("id", {
				count: "exact",
				head: true
			}).eq("role", "ADMIN").eq("is_active", true).is("deleted_at", null);
			if ((count ?? 0) <= 1) return fail("ไม่สามารถลดจำนวนผู้ดูแลระบบคนสุดท้ายได้");
		}
		const patch = {};
		if (data.patch.fullName !== void 0) patch.full_name = data.patch.fullName.trim();
		if (data.patch.phone !== void 0) patch.phone = data.patch.phone || null;
		if (data.patch.role !== void 0) patch.role = data.patch.role;
		if (data.patch.active !== void 0) patch.is_active = data.patch.active;
		const { error } = await admin.from("profiles").update(patch).eq("id", data.id);
		if (error) return fail(error.message || dbError);
		return {
			ok: true,
			value: void 0
		};
	} catch (error) {
		return fail(error instanceof Error ? error.message : dbError);
	}
});
var resetStaffPassword_createServerFn_handler = createServerRpc({
	id: "3bdacb24b6f027f8e1b536bf5b60e4578809791522133a6414944169b59f0758",
	name: "resetStaffPassword",
	filename: "src/lib/data.functions.ts"
}, (opts) => resetStaffPassword.__executeServer(opts));
var resetStaffPassword = createServerFn({ method: "POST" }).validator(z.object({
	id: z.string().uuid(),
	password: z.string().max(200),
	confirm: z.string().max(200)
})).handler(resetStaffPassword_createServerFn_handler, async ({ data }) => {
	try {
		const { profile: actor } = await viewerWithRole(["ADMIN"]);
		if (data.id === actor.id) return fail("ไม่สามารถรีเซ็ตรหัสผ่านของตัวเองจากเมนูนี้ได้");
		const errors = checkNewAccount({
			fullName: "ผู้ใช้",
			username: "validuser",
			password: data.password,
			confirm: data.confirm
		});
		if (errors.password || errors.confirm) return fail(errors.password ?? errors.confirm ?? "");
		const { error } = await supabaseAdmin().auth.admin.updateUserById(data.id, {
			password: data.password,
			user_metadata: { must_change_password: true }
		});
		if (error) return fail(dbError);
		await supabaseAdmin().from("profiles").update({ must_change_password: true }).eq("id", data.id);
		return {
			ok: true,
			value: void 0
		};
	} catch (error) {
		return fail(error instanceof Error ? error.message : dbError);
	}
});
var saveCompany_createServerFn_handler = createServerRpc({
	id: "598c2fe1ff61f311bad2ba121b157b5718a8859cd40d128971c0e20352b18162",
	name: "saveCompany",
	filename: "src/lib/data.functions.ts"
}, (opts) => saveCompany.__executeServer(opts));
var saveCompany = createServerFn({ method: "POST" }).validator(z.object({
	id: z.string().uuid().optional(),
	nameTh: z.string().trim().min(1).max(200),
	nameEn: z.string().max(200),
	address: z.string().trim().min(1).max(1e3),
	phones: z.string().trim().min(1).max(200),
	taxId: z.string().max(40).optional()
})).handler(saveCompany_createServerFn_handler, async ({ data }) => {
	try {
		await viewerWithRole(["ADMIN"]);
		const admin = supabaseAdmin();
		const values = {
			name: data.nameTh,
			name_en: data.nameEn,
			address: data.address,
			phone: data.phones,
			tax_id: data.taxId ?? null
		};
		const result = data.id ? await admin.from("companies").update(values).eq("id", data.id) : await admin.from("companies").insert(values);
		if (result.error) return fail(result.error.message || dbError);
		return {
			ok: true,
			value: void 0
		};
	} catch (error) {
		return fail(error instanceof Error ? error.message : dbError);
	}
});
export { assignRepairTechnician_createServerFn_handler, changeRepairJobStatus_createServerFn_handler, createRepairJob_createServerFn_handler, createStaffUser_createServerFn_handler, getAppData_createServerFn_handler, moveInventoryStock_createServerFn_handler, resetStaffPassword_createServerFn_handler, reverseInventoryTransaction_createServerFn_handler, saveCompany_createServerFn_handler, saveInventoryItem_createServerFn_handler, updateRepairJob_createServerFn_handler, updateStaffUser_createServerFn_handler };
