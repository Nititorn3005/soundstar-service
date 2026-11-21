// src/lib/validation.ts
var USERNAME_RE = /^[a-z0-9._-]{3,20}$/;
function checkNewAccount(a) {
	const e = {};
	if (a.fullName.trim().length < 2) e.fullName = "กรุณากรอกชื่อ";
	if (!USERNAME_RE.test(a.username)) e.username = "ใช้ a–z, 0–9, จุด, ขีด 3–20 ตัวอักษร";
	return {
		...e,
		...validatePassword(a.password, a.confirm)
	};
}
function validateNewAccount(f) {
	return checkNewAccount({
		fullName: String(f.get("fullName") ?? ""),
		username: String(f.get("username") ?? ""),
		password: String(f.get("password") ?? ""),
		confirm: String(f.get("confirm") ?? "")
	});
}
function validatePassword(password, confirm) {
	const e = {};
	if (password.length < 10 || !/\d/.test(password) || !/[a-zA-Z]/.test(password)) e.password = "อย่างน้อย 10 ตัวอักษร มีทั้งตัวอักษรและตัวเลข";
	if (password !== confirm) e.confirm = "ยืนยันรหัสผ่านไม่ตรงกัน";
	return e;
}
export { validatePassword as i, checkNewAccount as n, validateNewAccount as r, USERNAME_RE as t };
