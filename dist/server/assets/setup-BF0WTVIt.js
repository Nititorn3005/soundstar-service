import { a as Field, d as Input, n as Brand, r as CompanyFooter } from "./shell-DV0Ef7pI.js";
import { o as Button, r as bootstrapAdmin } from "./store-HGwRtq6e.js";
import { r as validateNewAccount } from "./validation-UYwavGYK.js";
import { r as Route } from "./router-xQJsEqrJ.js";
import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { CheckCircle2, KeyRound, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
// src/routes/setup.tsx?tsr-split=component
function SetupPage() {
	const setup = Route.useLoaderData();
	const navigate = useNavigate();
	const [errors, setErrors] = React.useState({});
	const [pending, setPending] = React.useState(false);
	async function onSubmit(ev) {
		ev.preventDefault();
		const f = new FormData(ev.currentTarget);
		const e = validateNewAccount(f);
		if (String(f.get("token") ?? "").length < 16) e.token = "กรุณากรอกรหัสตั้งค่าครั้งแรกที่กำหนดไว้ในระบบ";
		setErrors(e);
		if (Object.keys(e).length) return;
		setPending(true);
		try {
			const result = await bootstrapAdmin({ data: {
				token: String(f.get("token") ?? ""),
				fullName: String(f.get("fullName") ?? ""),
				username: String(f.get("username") ?? ""),
				password: String(f.get("password") ?? ""),
				confirm: String(f.get("confirm") ?? ""),
				phone: String(f.get("phone") ?? "") || void 0
			} });
			if (!result.ok) {
				setPending(false);
				setErrors({ token: result.error });
				return;
			}
			toast.success("สร้างผู้ดูแลระบบเรียบร้อย ขั้นตอนตั้งค่าครั้งแรกถูกปิดแล้ว");
			navigate({ to: "/" });
		} catch {
			setPending(false);
			setErrors({ token: "สร้างผู้ดูแลระบบไม่สำเร็จ กรุณาลองใหม่" });
		}
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "flex min-h-screen flex-col bg-background",
		children: [
			/* @__PURE__ */ jsx("header", {
				className: "bg-sidebar px-4 py-4 text-sidebar-accent-foreground sm:px-6",
				children: /* @__PURE__ */ jsx(Brand, { className: "mx-auto max-w-content" })
			}),
			/* @__PURE__ */ jsxs("main", {
				className: "mx-auto grid w-full max-w-content flex-1 gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[1fr_1.2fr]",
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("p", {
						className: "font-ticket text-xs uppercase tracking-[0.2em] text-highlight",
						children: "First-run setup"
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "mt-1 font-display text-3xl font-bold",
						children: "สร้างผู้ดูแลระบบคนแรก"
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 text-muted-foreground",
						children: "ขั้นตอนนี้ทำได้เพียงครั้งเดียว หลังสร้างสำเร็จ ระบบจะปิดหน้านี้อัตโนมัติ และผู้ดูแลระบบสามารถเพิ่มบัญชีพนักงานได้จากเมนู “จัดการผู้ใช้งาน”"
					}),
					/* @__PURE__ */ jsx("ol", {
						className: "mt-6 grid gap-4 text-sm",
						children: [
							["รหัสตั้งค่าครั้งแรก", "ผู้ติดตั้งระบบกำหนดไว้ฝั่งเซิร์ฟเวอร์ ไม่ปรากฏในเบราว์เซอร์ ป้องกันบุคคลภายนอกแย่งสร้างบัญชี"],
							["ตรวจสอบฝั่งเซิร์ฟเวอร์", "ระบบตรวจว่ายังไม่มีผู้ดูแลและสร้างบัญชีในขั้นตอนเดียว (Atomic)"],
							["ปิดหน้า Setup อัตโนมัติ", "เมื่อมีผู้ดูแลแล้ว คำขอสร้างซ้ำทุกครั้งจะถูกปฏิเสธ"]
						].map(([t, d], i) => /* @__PURE__ */ jsxs("li", {
							className: "flex gap-3",
							children: [/* @__PURE__ */ jsx("span", {
								className: "grid size-7 shrink-0 place-items-center rounded-full bg-primary font-ticket text-xs text-primary-foreground",
								children: i + 1
							}), /* @__PURE__ */ jsxs("span", { children: [/* @__PURE__ */ jsx("span", {
								className: "block font-medium",
								children: t
							}), /* @__PURE__ */ jsx("span", {
								className: "text-muted-foreground",
								children: d
							})] })]
						}, t))
					})
				] }), !setup.open || !setup.configured ? /* @__PURE__ */ jsxs("div", {
					role: "status",
					className: "h-fit rounded-xl border border-border bg-card p-5 text-sm",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "font-semibold",
							children: !setup.open ? "ระบบตั้งค่าเรียบร้อยแล้ว" : "ยังไม่พร้อมตั้งค่า"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-muted-foreground",
							children: !setup.open ? "ขั้นตอนสร้างผู้ดูแลระบบถูกปิดแล้ว กรุณาเข้าสู่ระบบ" : "ผู้ติดตั้งระบบต้องกำหนด SETUP_TOKEN ฝั่งเซิร์ฟเวอร์ก่อน"
						}),
						/* @__PURE__ */ jsx(Link, {
							to: "/",
							className: "mt-3 inline-flex text-primary hover:underline",
							children: "กลับไปหน้าเข้าสู่ระบบ"
						})
					]
				}) : /* @__PURE__ */ jsxs("form", {
					onSubmit,
					noValidate: true,
					className: "grid h-fit gap-5 rounded-2xl border border-border bg-card p-5 shadow-sm sm:p-7",
					children: [
						/* @__PURE__ */ jsx(Field, {
							label: "รหัสตั้งค่าครั้งแรก (Setup Token)",
							htmlFor: "token",
							error: errors.token,
							required: true,
							children: /* @__PURE__ */ jsxs("div", {
								className: "relative",
								children: [/* @__PURE__ */ jsx(KeyRound, { className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" }), /* @__PURE__ */ jsx(Input, {
									id: "token",
									name: "token",
									type: "password",
									className: "h-11 pl-9 font-ticket",
									autoComplete: "off"
								})]
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "ชื่อผู้ดูแล",
							htmlFor: "fullName",
							error: errors.fullName,
							required: true,
							children: /* @__PURE__ */ jsx(Input, {
								id: "fullName",
								name: "fullName",
								className: "h-11",
								autoComplete: "name"
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "ชื่อผู้ใช้",
							htmlFor: "username",
							error: errors.username,
							hint: "เช่น admin01",
							required: true,
							children: /* @__PURE__ */ jsx(Input, {
								id: "username",
								name: "username",
								className: "h-11 font-ticket",
								autoCapitalize: "none",
								autoComplete: "username"
							})
						}),
						/* @__PURE__ */ jsxs("div", {
							className: "grid gap-5 sm:grid-cols-2",
							children: [/* @__PURE__ */ jsx(Field, {
								label: "รหัสผ่าน",
								htmlFor: "password",
								error: errors.password,
								required: true,
								children: /* @__PURE__ */ jsx(Input, {
									id: "password",
									name: "password",
									type: "password",
									className: "h-11",
									autoComplete: "new-password"
								})
							}), /* @__PURE__ */ jsx(Field, {
								label: "ยืนยันรหัสผ่าน",
								htmlFor: "confirm",
								error: errors.confirm,
								required: true,
								children: /* @__PURE__ */ jsx(Input, {
									id: "confirm",
									name: "confirm",
									type: "password",
									className: "h-11",
									autoComplete: "new-password"
								})
							})]
						}),
						/* @__PURE__ */ jsxs(Button, {
							type: "submit",
							size: "lg",
							className: "h-12",
							disabled: pending,
							children: [pending ? /* @__PURE__ */ jsx(Loader2, { className: "animate-spin" }) : /* @__PURE__ */ jsx(ShieldCheck, {}), pending ? "กำลังสร้างบัญชี…" : "สร้างผู้ดูแลระบบ"]
						}),
						/* @__PURE__ */ jsxs("p", {
							className: "flex items-center gap-1.5 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ jsx(CheckCircle2, { className: "size-3.5 text-ok" }),
								" มีบัญชีแล้ว?",
								" ",
								/* @__PURE__ */ jsx(Link, {
									to: "/",
									className: "text-primary hover:underline",
									children: "กลับไปหน้าเข้าสู่ระบบ"
								})
							]
						})
					]
				})]
			}),
			/* @__PURE__ */ jsx(CompanyFooter, {})
		]
	});
}
export { SetupPage as component };
