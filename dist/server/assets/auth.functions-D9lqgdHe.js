import { a as writeSession, d as toCompany, g as createServerRpc, i as requireViewer, l as usernameToEmail, n as getViewer, o as supabaseAdmin, r as loadActiveProfile, s as supabaseAnon, t as clearSession } from "./session-Do42_4ZC.js";
import { l as setResponseStatus, o as getRequestHeader, s as getRequestIP, t as createServerFn } from "../server.js";
import { i as validatePassword, n as checkNewAccount, t as USERNAME_RE } from "./validation-UYwavGYK.js";
import { createHash, timingSafeEqual } from "node:crypto";
import { z } from "zod";
// src/lib/auth.functions.ts?tss-serverfn-split
var MAX_FAILS_PER_USER = 5;
var MAX_FAILS_PER_IP = 20;
var WINDOW_MS = 9e5;
var SETUP_ATTEMPT_KEY = "__setup__";
var fail = (error) => ({
	ok: false,
	error
});
var BAD_LOGIN = "ชื่อผู้ใช้หรือรหัสผ่านไม่ถูกต้อง";
var SUSPENDED = "บัญชีนี้ถูกระงับการใช้งาน กรุณาติดต่อผู้ดูแลระบบ";
function clientIp() {
	return getRequestHeader("x-nf-client-connection-ip") || getRequestIP({ xForwardedFor: true }) || "unknown";
}
async function recentFailures(column, value) {
	const since = (/* @__PURE__ */ new Date(Date.now() - WINDOW_MS)).toISOString();
	const { count } = await supabaseAdmin().from("login_attempts").select("id", {
		count: "exact",
		head: true
	}).eq(column, value).eq("is_success", false).gte("attempted_at", since);
	return count ?? 0;
}
async function recordAttempt(username, ip, success) {
	await supabaseAdmin().from("login_attempts").insert({
		username,
		ip_address: ip,
		is_success: success
	});
}
async function isLockedOut(username, ip) {
	const [byUser, byIp] = await Promise.all([recentFailures("username", username), recentFailures("ip_address", ip)]);
	return byUser >= MAX_FAILS_PER_USER || byIp >= MAX_FAILS_PER_IP;
}
var getSession_createServerFn_handler = createServerRpc({
	id: "753fb13391a5b0328ea3344426a11caf1f07e6f28fcdc91937757498d31af961",
	name: "getSession",
	filename: "src/lib/auth.functions.ts"
}, (opts) => getSession.__executeServer(opts));
var getSession = createServerFn({ method: "GET" }).handler(getSession_createServerFn_handler, async () => (await getViewer())?.profile ?? null);
var login_createServerFn_handler = createServerRpc({
	id: "8df20e164b02e0f25b2f3ded46ca477870814adcef4eda397ae3f9dd4def87a1",
	name: "login",
	filename: "src/lib/auth.functions.ts"
}, (opts) => login.__executeServer(opts));
var login = createServerFn({ method: "POST" }).validator(z.object({
	username: z.string().max(64),
	password: z.string().min(1).max(200)
})).handler(login_createServerFn_handler, async ({ data }) => {
	const username = data.username.trim().toLowerCase();
	if (!USERNAME_RE.test(username)) return fail(BAD_LOGIN);
	const ip = clientIp();
	if (await isLockedOut(username, ip)) return fail("เข้าสู่ระบบผิดหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่");
	const { data: auth, error } = await supabaseAnon().auth.signInWithPassword({
		email: usernameToEmail(username),
		password: data.password
	});
	if (error || !auth.session || !auth.user) {
		await recordAttempt(username, ip, false);
		return fail(BAD_LOGIN);
	}
	const profile = await loadActiveProfile(auth.user.id);
	if (!profile) {
		await supabaseAdmin().auth.admin.signOut(auth.session.access_token).catch(() => {});
		await recordAttempt(username, ip, false);
		const { data: row } = await supabaseAdmin().from("profiles").select("id").eq("id", auth.user.id).maybeSingle();
		return fail(row ? SUSPENDED : BAD_LOGIN);
	}
	await recordAttempt(username, ip, true);
	writeSession(auth.session);
	return {
		ok: true,
		value: profile
	};
});
var logout_createServerFn_handler = createServerRpc({
	id: "452e3e86c202416aafc02a2b55b578ec43fec039a5a067befd21bb3ba85f5fd5",
	name: "logout",
	filename: "src/lib/auth.functions.ts"
}, (opts) => logout.__executeServer(opts));
var logout = createServerFn({ method: "POST" }).handler(logout_createServerFn_handler, async () => {
	const viewer = await getViewer().catch(() => null);
	if (viewer) await supabaseAdmin().auth.admin.signOut(viewer.accessToken).catch(() => {});
	clearSession();
	return {
		ok: true,
		value: void 0
	};
});
var changeOwnPassword_createServerFn_handler = createServerRpc({
	id: "6a002c78d934e9579908104dc6268072d9172790791db1901caf901df0cf6199",
	name: "changeOwnPassword",
	filename: "src/lib/auth.functions.ts"
}, (opts) => changeOwnPassword.__executeServer(opts));
var changeOwnPassword = createServerFn({ method: "POST" }).validator(z.object({
	current: z.string().min(1).max(200),
	next: z.string().max(200),
	confirm: z.string().max(200)
})).handler(changeOwnPassword_createServerFn_handler, async ({ data }) => {
	const { profile } = await requireViewer();
	const errs = validatePassword(data.next, data.confirm);
	if (errs.password || errs.confirm) return fail(errs.password ?? errs.confirm ?? "");
	if (data.current === data.next) return fail("รหัสผ่านใหม่ต้องไม่ซ้ำกับรหัสผ่านเดิม");
	const email = usernameToEmail(profile.username);
	const check = await supabaseAnon().auth.signInWithPassword({
		email,
		password: data.current
	});
	if (check.error) return fail("รหัสผ่านปัจจุบันไม่ถูกต้อง");
	const admin = supabaseAdmin();
	const { error } = await admin.auth.admin.updateUserById(profile.id, { password: data.next });
	if (error) return fail("เปลี่ยนรหัสผ่านไม่สำเร็จ กรุณาลองใหม่");
	await admin.from("profiles").update({ must_change_password: false }).eq("id", profile.id);
	if (check.data.session) await admin.auth.admin.signOut(check.data.session.access_token, "others").catch(() => {});
	const fresh = await supabaseAnon().auth.signInWithPassword({
		email,
		password: data.next
	});
	if (fresh.data.session) writeSession(fresh.data.session);
	return {
		ok: true,
		value: void 0
	};
});
var getPublicCompany_createServerFn_handler = createServerRpc({
	id: "a2dc6ccf84d48e6db811229713ebe801b9f0a67be20537050eb1cfbe3910d729",
	name: "getPublicCompany",
	filename: "src/lib/auth.functions.ts"
}, (opts) => getPublicCompany.__executeServer(opts));
var getPublicCompany = createServerFn({ method: "GET" }).handler(getPublicCompany_createServerFn_handler, async () => {
	const { data } = await supabaseAdmin().from("companies").select("*").order("created_at").limit(1).maybeSingle();
	return toCompany(data);
});
async function adminExists() {
	const { count, error } = await supabaseAdmin().from("profiles").select("id", {
		count: "exact",
		head: true
	}).eq("role", "ADMIN").is("deleted_at", null);
	if (error) throw new Error("ตรวจสอบสถานะระบบไม่สำเร็จ");
	return (count ?? 0) > 0;
}
var getSetupStatus_createServerFn_handler = createServerRpc({
	id: "c24455af66764cc387ae4bbbd18fa591dfa8c55e18de078cb841da1a4b7bcf5c",
	name: "getSetupStatus",
	filename: "src/lib/auth.functions.ts"
}, (opts) => getSetupStatus.__executeServer(opts));
var getSetupStatus = createServerFn({ method: "GET" }).handler(getSetupStatus_createServerFn_handler, async () => {
	const closed = await adminExists();
	if (closed) setResponseStatus(410);
	return {
		open: !closed,
		configured: !!process.env.SETUP_TOKEN
	};
});
function tokenMatches(given, expected) {
	const a = createHash("sha256").update(given).digest();
	const b = createHash("sha256").update(expected).digest();
	return timingSafeEqual(a, b);
}
var SETUP_CLOSED = "ระบบตั้งค่าเรียบร้อยแล้ว ขั้นตอนนี้ถูกปิดถาวร";
var bootstrapAdmin_createServerFn_handler = createServerRpc({
	id: "efeb6f7d14183f6e6850575cff078962035bd2c811649c44778cdca875f6262f",
	name: "bootstrapAdmin",
	filename: "src/lib/auth.functions.ts"
}, (opts) => bootstrapAdmin.__executeServer(opts));
var bootstrapAdmin = createServerFn({ method: "POST" }).validator(z.object({
	token: z.string().max(500),
	fullName: z.string().max(120),
	username: z.string().max(64),
	password: z.string().max(200),
	confirm: z.string().max(200),
	phone: z.string().max(40).optional()
})).handler(bootstrapAdmin_createServerFn_handler, async ({ data }) => {
	const expected = process.env.SETUP_TOKEN;
	if (!expected || expected.length < 16) return fail("ยังไม่ได้ตั้งค่า SETUP_TOKEN ฝั่งเซิร์ฟเวอร์ กรุณาติดต่อผู้ติดตั้งระบบ");
	if (await adminExists()) {
		setResponseStatus(410);
		return fail(SETUP_CLOSED);
	}
	const ip = clientIp();
	if (await isLockedOut(SETUP_ATTEMPT_KEY, ip)) return fail("ลองรหัสตั้งค่าผิดหลายครั้งเกินไป กรุณารอ 15 นาทีแล้วลองใหม่");
	if (!tokenMatches(data.token, expected)) {
		await recordAttempt(SETUP_ATTEMPT_KEY, ip, false);
		return fail("รหัสตั้งค่าครั้งแรกไม่ถูกต้อง");
	}
	const username = data.username.trim().toLowerCase();
	const fullName = data.fullName.trim();
	const errs = checkNewAccount({
		...data,
		username,
		fullName
	});
	const firstError = Object.values(errs)[0];
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
	if (created.error || !created.data.user) return fail(/already|registered|exists/i.test(created.error?.message ?? "") ? "ชื่อผู้ใช้นี้ถูกใช้แล้ว" : "สร้างบัญชีไม่สำเร็จ กรุณาลองใหม่");
	const userId = created.data.user.id;
	const { error } = await admin.rpc("bootstrap_first_admin", {
		p_user_id: userId,
		p_username: username,
		p_full_name: fullName,
		p_phone: data.phone?.trim() || null
	});
	if (error) {
		await admin.auth.admin.deleteUser(userId).catch(() => {});
		if (await adminExists()) {
			setResponseStatus(410);
			return fail(SETUP_CLOSED);
		}
		console.error("bootstrap_first_admin failed", error.message);
		return fail("สร้างผู้ดูแลระบบไม่สำเร็จ กรุณาลองใหม่");
	}
	await recordAttempt(SETUP_ATTEMPT_KEY, ip, true);
	return {
		ok: true,
		value: { username }
	};
});
export { bootstrapAdmin_createServerFn_handler, changeOwnPassword_createServerFn_handler, getPublicCompany_createServerFn_handler, getSession_createServerFn_handler, getSetupStatus_createServerFn_handler, login_createServerFn_handler, logout_createServerFn_handler };
