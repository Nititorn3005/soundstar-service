import { a as getCookie, c as setCookie, i as deleteCookie, n as TSS_SERVER_FUNCTION } from "../server.js";
import { createClient } from "@supabase/supabase-js";
// node_modules/@tanstack/start-server-core/dist/esm/createServerRpc.js
var createServerRpc = (serverFnMeta, splitImportFn) => {
	const url = "/_serverFn/" + serverFnMeta.id;
	return Object.assign(splitImportFn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
// src/lib/server/mappers.ts
var str = (v) => v == null ? void 0 : String(v);
function toStatus(s) {
	if (s === "DELIVERED") return "COMPLETED";
	return s;
}
function toProfile(r) {
	return {
		id: r.id,
		fullName: r.full_name,
		username: r.username,
		role: r.role,
		active: !!r.is_active && !r.deleted_at,
		phone: str(r.phone) || void 0,
		createdAt: r.created_at,
		mustChangePassword: !!r.must_change_password
	};
}
function toCompany(r) {
	return {
		id: r?.id,
		nameTh: r?.name ?? "บริษัท หาดใหญ่ซาวด์สตาร์ จำกัด",
		nameEn: r?.name_en ?? "Hatyai Soundstar Co., Ltd.",
		address: r?.address ?? "",
		phones: r?.phone ?? "",
		taxId: str(r?.tax_id) || void 0
	};
}
function toItem(r, showCost) {
	return {
		id: r.id,
		code: r.code,
		name: r.name,
		category: r.category ?? "",
		compatible: r.compatible ?? "",
		unit: r.unit,
		onHand: Number(r.on_hand ?? 0),
		minQty: Number(r.min_threshold ?? 0),
		cost: showCost ? Number(r.cost_price ?? 0) : 0,
		location: r.location ?? "",
		note: str(r.note) || void 0
	};
}
var TX_TYPE = {
	IN: "IN",
	OUT: "OUT",
	ADJUST: "ADJUST",
	REVERSAL: "REVERSAL",
	REVERSE: "REVERSAL"
};
/**
* Transactions newest first. The signed delta is normalised by type (IN adds,
* OUT removes, ADJUST keeps its sign, REVERSAL negates the original), and the
* running balance is rebuilt backwards from each item's current on-hand.
*/
function toTransactions(rows, items) {
	const byId = new Map(rows.map((r) => [r.id, r]));
	const delta = (r, depth = 0) => {
		const q = Number(r.qty);
		const type = TX_TYPE[r.type] ?? "ADJUST";
		if (type === "IN") return Math.abs(q);
		if (type === "OUT") return -Math.abs(q);
		if (type === "REVERSAL" && r.reverses_id && depth < 4) {
			const orig = byId.get(r.reverses_id);
			if (orig) return -delta(orig, depth + 1);
		}
		return q;
	};
	const balance = new Map(items.map((i) => [i.id, Number(i.on_hand ?? 0)]));
	return rows.map((r) => {
		const type = TX_TYPE[r.type] ?? "ADJUST";
		const d = delta(r);
		const after = balance.get(r.item_id) ?? 0;
		balance.set(r.item_id, after - d);
		const note = str(r.note) || void 0;
		return {
			id: r.id,
			at: r.created_at,
			type,
			partId: r.item_id,
			qty: d,
			balanceAfter: after,
			by: r.created_by,
			jobId: str(r.job_id),
			reference: type === "IN" ? note : void 0,
			reason: type === "IN" ? void 0 : note,
			reversesId: str(r.reverses_id)
		};
	});
}
/** Parts used on each job: OUT transactions tied to the job that were not reversed. */
function partsByJob(txs) {
	const reversed = new Set(txs.filter((t) => t.reversesId).map((t) => t.reversesId));
	const out = /* @__PURE__ */ new Map();
	for (const t of [...txs].reverse()) {
		if (t.type !== "OUT" || !t.jobId || reversed.has(t.id)) continue;
		const list = out.get(t.jobId) ?? [];
		list.push({
			partId: t.partId,
			qty: -t.qty,
			at: t.at,
			by: t.by
		});
		out.set(t.jobId, list);
	}
	return out;
}
function splitBrandModel(r) {
	if (r.brand || r.model) return {
		brand: r.brand ?? "",
		model: r.model ?? ""
	};
	const bm = String(r.brand_model ?? "").trim();
	const i = bm.indexOf(" ");
	return i < 0 ? {
		brand: bm,
		model: ""
	} : {
		brand: bm.slice(0, i),
		model: bm.slice(i + 1)
	};
}
function toJob(r, parts) {
	const history = (r.repair_job_history ?? []).map((h) => ({
		id: h.id,
		at: h.created_at,
		by: h.created_by,
		from: h.from_status ? toStatus(h.from_status) : null,
		to: toStatus(h.to_status),
		note: str(h.note) || void 0
	})).sort((a, b) => a.at.localeCompare(b.at));
	return {
		id: r.id,
		jobNo: r.job_no,
		receivedAt: r.created_at,
		customerName: r.customer_name,
		phone: r.customer_phone,
		contactName: str(r.contact_name) || void 0,
		address: r.customer_address ?? "",
		machineType: r.appliance_type ?? "",
		...splitBrandModel(r),
		serialNo: str(r.serial_number) || void 0,
		symptom: r.symptom,
		details: str(r.details) || void 0,
		receivedBy: r.created_by,
		technicianId: str(r.technician_id),
		appointmentAt: str(r.appointment_at),
		urgency: r.urgency ?? "NORMAL",
		status: toStatus(r.status),
		note: str(r.note) || void 0,
		diagnosis: str(r.diagnosis) || void 0,
		resolution: str(r.resolution) || void 0,
		result: str(r.result) || void 0,
		photos: Array.isArray(r.repair_job_photos) ? r.repair_job_photos.length : 0,
		history,
		parts
	};
}
// src/lib/server/supabase.ts
var STAFF_EMAIL_DOMAIN = "staff.hatyai-soundstar.internal";
var usernameToEmail = (username) => `${username.trim().toLowerCase()}@${STAFF_EMAIL_DOMAIN}`;
function env(name) {
	const v = process.env[name];
	if (!v) throw new Error(`ยังไม่ได้ตั้งค่า ${name} ฝั่งเซิร์ฟเวอร์`);
	return v;
}
var noPersist = {
	persistSession: false,
	autoRefreshToken: false,
	detectSessionInUrl: false
};
var adminClient;
/** Service-role client. Bypasses RLS: callers must authorize first. */
function supabaseAdmin() {
	adminClient ??= createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), { auth: noPersist });
	return adminClient;
}
/** Fresh anon client for sign-in / refresh (no shared session state between requests). */
function supabaseAnon() {
	return createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY"), { auth: noPersist });
}
/** Client acting as the signed-in user, so RLS and `auth.uid()` inside RPCs apply. */
function supabaseAsUser(accessToken) {
	return createClient(env("SUPABASE_URL"), env("SUPABASE_ANON_KEY"), {
		auth: noPersist,
		global: { headers: { Authorization: `Bearer ${accessToken}` } }
	});
}
// src/lib/server/session.ts
var ACCESS = "hs_at";
var REFRESH = "hs_rt";
var MAX_AGE = 1209600;
var cookieOpts = (maxAge) => ({
	httpOnly: true,
	secure: true,
	sameSite: "lax",
	path: "/",
	maxAge
});
function writeSession(s) {
	setCookie(ACCESS, s.access_token, cookieOpts(s.expires_in || 3600));
	setCookie(REFRESH, s.refresh_token, cookieOpts(MAX_AGE));
}
function clearSession() {
	deleteCookie(ACCESS, { path: "/" });
	deleteCookie(REFRESH, { path: "/" });
}
var AuthError = class extends Error {};
/** Resolve the current user from cookies, refreshing the access token if needed. */
async function resolveUserId() {
	const admin = supabaseAdmin();
	const at = getCookie(ACCESS);
	if (at) {
		const { data } = await admin.auth.getUser(at);
		if (data.user) return {
			userId: data.user.id,
			accessToken: at
		};
	}
	const rt = getCookie(REFRESH);
	if (!rt) return null;
	const { data, error } = await supabaseAnon().auth.refreshSession({ refresh_token: rt });
	if (error || !data.session || !data.user) {
		clearSession();
		return null;
	}
	writeSession(data.session);
	return {
		userId: data.user.id,
		accessToken: data.session.access_token
	};
}
/** Load an active profile by auth user id, or null if missing/suspended/deleted. */
async function loadActiveProfile(userId) {
	const { data, error } = await supabaseAdmin().from("profiles").select("*").eq("id", userId).maybeSingle();
	if (error) throw new Error("โหลดข้อมูลผู้ใช้ไม่สำเร็จ");
	if (!data || !data.is_active || data.deleted_at) return null;
	return toProfile(data);
}
/** Current viewer, or null when signed out or the account is no longer active. */
async function getViewer() {
	const resolved = await resolveUserId();
	if (!resolved) return null;
	const profile = await loadActiveProfile(resolved.userId);
	if (!profile) {
		clearSession();
		return null;
	}
	return {
		profile,
		accessToken: resolved.accessToken
	};
}
async function requireViewer() {
	const v = await getViewer();
	if (!v) throw new AuthError("กรุณาเข้าสู่ระบบอีกครั้ง");
	return v;
}
export { writeSession as a, supabaseAsUser as c, toCompany as d, toItem as f, createServerRpc as g, toTransactions as h, requireViewer as i, usernameToEmail as l, toProfile as m, getViewer as n, supabaseAdmin as o, toJob as p, loadActiveProfile as r, supabaseAnon as s, clearSession as t, partsByJob as u };
