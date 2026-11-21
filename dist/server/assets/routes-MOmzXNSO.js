import { a as Field, d as Input, n as Brand, r as CompanyFooter } from "./shell-DV0Ef7pI.js";
import { n as useAppStore, o as Button, s as cn } from "./store-HGwRtq6e.js";
import * as React from "react";
import { Link, useNavigate } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { cva } from "class-variance-authority";
import { ArrowRight, Eye, EyeOff, Loader2, ShieldCheck } from "lucide-react";
import { toast } from "sonner";
// src/components/ui/alert.tsx
var alertVariants = cva("relative grid w-full grid-cols-[0_1fr] items-start gap-y-0.5 rounded-lg border px-4 py-3 text-sm has-[>svg]:grid-cols-[calc(var(--spacing)*4)_1fr] has-[>svg]:gap-x-3 [&>svg]:size-4 [&>svg]:translate-y-0.5 [&>svg]:text-current", {
	variants: { variant: {
		default: "bg-card text-card-foreground",
		destructive: "bg-card text-destructive *:data-[slot=alert-description]:text-destructive/90 [&>svg]:text-current"
	} },
	defaultVariants: { variant: "default" }
});
function Alert({ className, variant, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "alert",
		role: "alert",
		className: cn(alertVariants({ variant }), className),
		...props
	});
}
function AlertDescription({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "alert-description",
		className: cn("col-start-2 grid justify-items-start gap-1 text-sm text-muted-foreground [&_p]:leading-relaxed", className),
		...props
	});
}
// src/routes/index.tsx?tsr-split=component
function LoginPage() {
	const { signIn } = useAppStore();
	const navigate = useNavigate();
	const [error, setError] = React.useState("");
	const [pending, setPending] = React.useState(false);
	const [show, setShow] = React.useState(false);
	async function onSubmit(e) {
		e.preventDefault();
		const f = new FormData(e.currentTarget);
		setPending(true);
		const res = await signIn(String(f.get("username")), String(f.get("password")));
		setPending(false);
		if (!res.ok) return setError(res.error);
		toast.success(`ยินดีต้อนรับ ${res.value.fullName}`);
		navigate({ to: "/dashboard" });
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "flex min-h-screen flex-col lg:grid lg:grid-cols-[1.1fr_1fr]",
		children: [/* @__PURE__ */ jsxs("section", {
			className: "drum-rings relative overflow-hidden bg-sidebar px-6 py-10 text-sidebar-accent-foreground sm:px-10 lg:flex lg:flex-col lg:justify-between lg:py-14",
			children: [
				/* @__PURE__ */ jsx(Brand, {}),
				/* @__PURE__ */ jsxs("div", {
					className: "relative z-10 mt-10 max-w-lg animate-in fade-in slide-in-from-bottom-4 duration-700 motion-reduce:animate-none lg:mt-0",
					children: [
						/* @__PURE__ */ jsx("p", {
							className: "font-ticket text-xs uppercase tracking-[0.25em] text-sidebar-primary",
							children: "Service desk · Hat Yai"
						}),
						/* @__PURE__ */ jsxs("h1", {
							className: "mt-3 font-display text-4xl font-bold leading-[1.15] sm:text-5xl",
							children: [
								"ทุกใบงานซ่อม",
								/* @__PURE__ */ jsx("br", {}),
								"ทุกชิ้นอะไหล่",
								/* @__PURE__ */ jsx("br", {}),
								/* @__PURE__ */ jsx("span", {
									className: "text-sidebar-primary",
									children: "อยู่ในที่เดียว"
								})
							]
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-5 max-w-md text-sidebar-foreground/80",
							children: "รับแจ้งงาน มอบหมายช่าง ติดตามสถานะ และเบิกอะไหล่ ให้หน้าร้านและช่างหน้างาน เห็นข้อมูลชุดเดียวกันทุกอุปกรณ์"
						})
					]
				}),
				/* @__PURE__ */ jsx(TicketPreview, {})
			]
		}), /* @__PURE__ */ jsxs("section", {
			className: "flex flex-1 flex-col",
			children: [/* @__PURE__ */ jsx("div", {
				className: "flex flex-1 items-center justify-center px-6 py-12",
				children: /* @__PURE__ */ jsxs("div", {
					className: "w-full max-w-sm animate-in fade-in duration-700 motion-reduce:animate-none",
					children: [
						/* @__PURE__ */ jsx("h2", {
							className: "font-display text-2xl font-bold",
							children: "เข้าสู่ระบบ"
						}),
						/* @__PURE__ */ jsx("p", {
							className: "mt-1 text-sm text-muted-foreground",
							children: "ใช้ชื่อผู้ใช้และรหัสผ่านที่ได้รับจากผู้ดูแลระบบ"
						}),
						/* @__PURE__ */ jsxs("form", {
							onSubmit,
							className: "mt-8 grid gap-5",
							noValidate: true,
							children: [
								/* @__PURE__ */ jsx(Field, {
									label: "ชื่อผู้ใช้",
									htmlFor: "username",
									hint: "ระบบจะเข้าสู่ระบบด้วย <username>@staff.hatyai-soundstar.internal",
									children: /* @__PURE__ */ jsx(Input, {
										id: "username",
										name: "username",
										autoComplete: "username",
										autoCapitalize: "none",
										placeholder: "เช่น front01",
										className: "h-12 font-ticket",
										required: true
									})
								}),
								/* @__PURE__ */ jsx(Field, {
									label: "รหัสผ่าน",
									htmlFor: "password",
									children: /* @__PURE__ */ jsxs("div", {
										className: "relative",
										children: [/* @__PURE__ */ jsx(Input, {
											id: "password",
											name: "password",
											type: show ? "text" : "password",
											autoComplete: "current-password",
											className: "h-12 pr-12",
											required: true
										}), /* @__PURE__ */ jsx("button", {
											type: "button",
											onClick: () => setShow((v) => !v),
											"aria-label": show ? "ซ่อนรหัสผ่าน" : "แสดงรหัสผ่าน",
											className: "absolute inset-y-0 right-0 grid w-12 place-items-center text-muted-foreground hover:text-foreground",
											children: show ? /* @__PURE__ */ jsx(EyeOff, { className: "size-4" }) : /* @__PURE__ */ jsx(Eye, { className: "size-4" })
										})]
									})
								}),
								error && /* @__PURE__ */ jsx(Alert, {
									variant: "destructive",
									children: /* @__PURE__ */ jsx(AlertDescription, { children: error })
								}),
								/* @__PURE__ */ jsxs(Button, {
									type: "submit",
									size: "lg",
									className: "h-12 text-base",
									disabled: pending,
									children: [pending ? /* @__PURE__ */ jsx(Loader2, { className: "animate-spin" }) : /* @__PURE__ */ jsx(ArrowRight, {}), pending ? "กำลังตรวจสอบ…" : "เข้าสู่ระบบ"]
								})
							]
						}),
						/* @__PURE__ */ jsxs(Link, {
							to: "/setup",
							className: "mt-6 inline-flex items-center gap-1.5 text-sm text-primary hover:underline",
							children: [/* @__PURE__ */ jsx(ShieldCheck, { className: "size-4" }), " ตั้งค่าระบบครั้งแรก (สร้างผู้ดูแลระบบ)"]
						})
					]
				})
			}), /* @__PURE__ */ jsx(CompanyFooter, {})]
		})]
	});
}
function TicketPreview() {
	return /* @__PURE__ */ jsxs("div", {
		"aria-hidden": true,
		className: "relative z-10 mt-10 hidden max-w-md rotate-[-2deg] rounded-xl bg-card p-5 text-card-foreground shadow-2xl sm:block lg:mt-0 animate-in fade-in slide-in-from-bottom-6 duration-1000 motion-reduce:animate-none",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "flex items-center justify-between border-b border-dashed border-border pb-3",
			children: [/* @__PURE__ */ jsx("span", {
				className: "font-ticket text-sm font-bold text-primary",
				children: "HS-2610-0042"
			}), /* @__PURE__ */ jsx("span", {
				className: "rounded-full bg-warn/25 px-2 py-0.5 text-xs",
				children: "รอมอบหมายช่าง"
			})]
		}), /* @__PURE__ */ jsxs("dl", {
			className: "grid grid-cols-2 gap-3 pt-3 text-xs",
			children: [
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
					className: "text-muted-foreground",
					children: "ลูกค้า"
				}), /* @__PURE__ */ jsx("dd", {
					className: "font-medium",
					children: "ร้านซักรีดเพชรเกษม"
				})] }),
				/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("dt", {
					className: "text-muted-foreground",
					children: "เครื่อง"
				}), /* @__PURE__ */ jsx("dd", {
					className: "font-medium",
					children: "LG · หยอดเหรียญ"
				})] }),
				/* @__PURE__ */ jsxs("div", {
					className: "col-span-2",
					children: [/* @__PURE__ */ jsx("dt", {
						className: "text-muted-foreground",
						children: "อาการ"
					}), /* @__PURE__ */ jsx("dd", {
						className: "font-medium",
						children: "ไม่ปั่นหมาด มีเสียงดังที่ถัง"
					})]
				})
			]
		})]
	});
}
export { LoginPage as component };
