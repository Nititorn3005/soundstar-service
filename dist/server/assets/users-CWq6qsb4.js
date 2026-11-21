import { _ as DialogTitle, a as Field, d as Input, f as Dialog, g as DialogHeader, h as DialogFooter, i as EmptyState, l as RoleGate, m as DialogDescription, p as DialogContent, s as PageHeader } from "./shell-DV0Ef7pI.js";
import { n as useAppStore, o as Button, s as cn } from "./store-HGwRtq6e.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CR3tRoMi.js";
import { d as fmtDate, r as ROLE_LABEL } from "./domain-BwIhFv2h.js";
import { i as validatePassword, r as validateNewAccount } from "./validation-UYwavGYK.js";
import * as React from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { KeyRound, Pencil, Search, UserPlus, Users } from "lucide-react";
import { toast } from "sonner";
import * as SwitchPrimitive from "@radix-ui/react-switch";
// src/components/ui/switch.tsx
function Switch({ className, size = "default", ...props }) {
	return /* @__PURE__ */ jsx(SwitchPrimitive.Root, {
		"data-slot": "switch",
		"data-size": size,
		className: cn("peer group/switch inline-flex shrink-0 items-center rounded-full border border-transparent shadow-xs transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:cursor-not-allowed disabled:opacity-50 data-[size=default]:h-[1.15rem] data-[size=default]:w-8 data-[size=sm]:h-3.5 data-[size=sm]:w-6 data-[state=checked]:bg-primary data-[state=unchecked]:bg-input dark:data-[state=unchecked]:bg-input/80", className),
		...props,
		children: /* @__PURE__ */ jsx(SwitchPrimitive.Thumb, {
			"data-slot": "switch-thumb",
			className: cn("pointer-events-none block rounded-full bg-background ring-0 transition-transform group-data-[size=default]/switch:size-4 group-data-[size=sm]/switch:size-3 data-[state=checked]:translate-x-[calc(100%-2px)] data-[state=unchecked]:translate-x-0 dark:data-[state=checked]:bg-primary-foreground dark:data-[state=unchecked]:bg-foreground")
		})
	});
}
// src/routes/_app/users.tsx?tsr-split=component
var ROLES = [
	"ADMIN",
	"FRONT",
	"TECH"
];
function UsersPage() {
	const { profiles, currentUser, updateUser } = useAppStore();
	const [q, setQ] = React.useState("");
	const [dialog, setDialog] = React.useState(null);
	const needle = q.trim().toLowerCase();
	const rows = profiles.filter((p) => !needle || `${p.fullName} ${p.username}`.toLowerCase().includes(needle));
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			eyebrow: "Staff accounts",
			title: "จัดการผู้ใช้งาน",
			description: "สร้างบัญชีพนักงาน กำหนดบทบาท และระงับการใช้งานได้จากหน้านี้ ทุกการเปลี่ยนแปลงถูกบันทึกในประวัติ",
			actions: /* @__PURE__ */ jsxs(Button, {
				size: "lg",
				onClick: () => setDialog({ kind: "add" }),
				children: [/* @__PURE__ */ jsx(UserPlus, {}), " เพิ่มผู้ใช้งาน"]
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "relative mb-4",
			children: [/* @__PURE__ */ jsx(Search, {
				className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
				"aria-hidden": true
			}), /* @__PURE__ */ jsx(Input, {
				value: q,
				onChange: (e) => setQ(e.target.value),
				placeholder: "ค้นหาชื่อหรือชื่อผู้ใช้",
				"aria-label": "ค้นหาผู้ใช้งาน",
				className: "h-11 bg-card pl-9"
			})]
		}),
		rows.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
			icon: Users,
			title: "ไม่พบผู้ใช้งาน"
		}) : /* @__PURE__ */ jsx("div", {
			className: "rounded-2xl border border-border bg-card",
			children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableHead, { children: "ชื่อ-นามสกุล" }),
				/* @__PURE__ */ jsx(TableHead, { children: "บทบาท" }),
				/* @__PURE__ */ jsx(TableHead, {
					className: "hidden sm:table-cell",
					children: "สร้างเมื่อ"
				}),
				/* @__PURE__ */ jsx(TableHead, { children: "สถานะ" }),
				/* @__PURE__ */ jsx(TableHead, {
					className: "text-right",
					children: /* @__PURE__ */ jsx("span", {
						className: "sr-only",
						children: "การจัดการ"
					})
				})
			] }) }), /* @__PURE__ */ jsx(TableBody, { children: rows.map((p) => {
				const self = p.id === currentUser?.id;
				return /* @__PURE__ */ jsxs(TableRow, { children: [
					/* @__PURE__ */ jsxs(TableCell, { children: [/* @__PURE__ */ jsxs("p", {
						className: "font-medium",
						children: [p.fullName, self && /* @__PURE__ */ jsx("span", {
							className: "ml-1.5 text-xs text-muted-foreground",
							children: "(คุณ)"
						})]
					}), /* @__PURE__ */ jsxs("p", {
						className: "font-ticket text-xs text-muted-foreground",
						children: ["@", p.username]
					})] }),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", {
						className: cn("rounded-md px-2 py-0.5 text-xs", p.role === "ADMIN" ? "bg-primary text-primary-foreground" : p.role === "TECH" ? "bg-accent text-accent-foreground" : "bg-secondary"),
						children: ROLE_LABEL[p.role]
					}) }),
					/* @__PURE__ */ jsx(TableCell, {
						className: "hidden text-xs sm:table-cell",
						children: fmtDate(p.createdAt)
					}),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsxs("label", {
						className: "flex items-center gap-2 text-xs",
						children: [/* @__PURE__ */ jsx(Switch, {
							checked: p.active,
							disabled: self,
							"aria-label": p.active ? `ระงับบัญชี ${p.username}` : `เปิดใช้งานบัญชี ${p.username}`,
							onCheckedChange: async (v) => {
								const res = await updateUser(p.id, { active: v });
								if (!res.ok) return toast.error(res.error);
								toast.success(v ? `เปิดใช้งาน ${p.username} แล้ว` : `ระงับ ${p.username} แล้ว — ออกจากระบบทุกอุปกรณ์`);
							}
						}), /* @__PURE__ */ jsx("span", {
							className: cn(!p.active && "text-destructive"),
							children: p.active ? "ใช้งาน" : "ระงับ"
						})]
					}) }),
					/* @__PURE__ */ jsx(TableCell, {
						className: "text-right",
						children: /* @__PURE__ */ jsxs("div", {
							className: "flex justify-end",
							children: [/* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": `แก้ไข ${p.username}`,
								onClick: () => setDialog({
									kind: "edit",
									p
								}),
								children: /* @__PURE__ */ jsx(Pencil, {})
							}), /* @__PURE__ */ jsx(Button, {
								variant: "ghost",
								size: "icon",
								"aria-label": `รีเซ็ตรหัสผ่าน ${p.username}`,
								disabled: self,
								onClick: () => setDialog({
									kind: "reset",
									p
								}),
								children: /* @__PURE__ */ jsx(KeyRound, {})
							})]
						})
					})
				] }, p.id);
			}) })] })
		}),
		dialog?.kind === "add" && /* @__PURE__ */ jsx(AddUserDialog, { onClose: () => setDialog(null) }),
		dialog?.kind === "edit" && /* @__PURE__ */ jsx(EditUserDialog, {
			p: dialog.p,
			onClose: () => setDialog(null)
		}),
		dialog?.kind === "reset" && /* @__PURE__ */ jsx(ResetDialog, {
			p: dialog.p,
			onClose: () => setDialog(null)
		})
	] });
}
function AddUserDialog({ onClose }) {
	const { createUser } = useAppStore();
	const [errors, setErrors] = React.useState({});
	return /* @__PURE__ */ jsx(Dialog, {
		open: true,
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto",
			children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "เพิ่มผู้ใช้งาน" }), /* @__PURE__ */ jsx(DialogDescription, { children: "พนักงานเข้าสู่ระบบด้วยชื่อผู้ใช้และรหัสผ่านนี้ ไม่ต้องใช้อีเมล" })] }), /* @__PURE__ */ jsxs("form", {
				noValidate: true,
				className: "grid gap-4 sm:grid-cols-2",
				onSubmit: async (e) => {
					e.preventDefault();
					const f = new FormData(e.currentTarget);
					const errs = validateNewAccount(f);
					setErrors(errs);
					if (Object.keys(errs).length) return;
					const res = await createUser({
						fullName: String(f.get("fullName")).trim(),
						username: String(f.get("username")),
						role: f.get("role"),
						active: f.get("active") === "on",
						phone: String(f.get("phone") ?? "") || void 0,
						password: String(f.get("password") ?? ""),
						confirm: String(f.get("confirm") ?? "")
					});
					if (!res.ok) return setErrors({ username: res.error });
					toast.success(`สร้างบัญชี ${res.value.username} เรียบร้อย`);
					onClose();
				},
				children: [
					/* @__PURE__ */ jsx(Field, {
						label: "ชื่อ-นามสกุล",
						htmlFor: "u-name",
						error: errors.fullName,
						required: true,
						className: "sm:col-span-2",
						children: /* @__PURE__ */ jsx(Input, {
							id: "u-name",
							name: "fullName",
							className: "h-11"
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "ชื่อผู้ใช้",
						htmlFor: "u-username",
						error: errors.username,
						hint: "เช่น tech03",
						required: true,
						children: /* @__PURE__ */ jsx(Input, {
							id: "u-username",
							name: "username",
							autoCapitalize: "none",
							className: "h-11 font-ticket"
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "เบอร์โทร",
						htmlFor: "u-phone",
						children: /* @__PURE__ */ jsx(Input, {
							id: "u-phone",
							name: "phone",
							type: "tel",
							className: "h-11 font-ticket"
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "รหัสผ่าน",
						htmlFor: "u-pw",
						error: errors.password,
						required: true,
						children: /* @__PURE__ */ jsx(Input, {
							id: "u-pw",
							name: "password",
							type: "password",
							autoComplete: "new-password",
							className: "h-11"
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "ยืนยันรหัสผ่าน",
						htmlFor: "u-confirm",
						error: errors.confirm,
						required: true,
						children: /* @__PURE__ */ jsx(Input, {
							id: "u-confirm",
							name: "confirm",
							type: "password",
							autoComplete: "new-password",
							className: "h-11"
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "บทบาท",
						htmlFor: "u-role",
						required: true,
						children: /* @__PURE__ */ jsx("select", {
							id: "u-role",
							name: "role",
							className: "native-select",
							defaultValue: "FRONT",
							children: ROLES.map((r) => /* @__PURE__ */ jsx("option", {
								value: r,
								children: ROLE_LABEL[r]
							}, r))
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "สถานะบัญชี",
						htmlFor: "u-active",
						children: /* @__PURE__ */ jsxs("label", {
							className: "flex h-11 items-center gap-2 text-sm",
							children: [/* @__PURE__ */ jsx("input", {
								id: "u-active",
								name: "active",
								type: "checkbox",
								defaultChecked: true,
								className: "size-5 accent-[var(--primary)]"
							}), "เปิดใช้งานทันที"]
						})
					}),
					/* @__PURE__ */ jsx(DialogFooter, {
						className: "sm:col-span-2",
						children: /* @__PURE__ */ jsxs(Button, {
							type: "submit",
							size: "lg",
							children: [/* @__PURE__ */ jsx(UserPlus, {}), " สร้างบัญชี"]
						})
					})
				]
			})]
		})
	});
}
function EditUserDialog({ p, onClose }) {
	const { updateUser, currentUser } = useAppStore();
	const self = p.id === currentUser?.id;
	return /* @__PURE__ */ jsx(Dialog, {
		open: true,
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ jsxs(DialogContent, { children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "แก้ไขข้อมูลพนักงาน" }), /* @__PURE__ */ jsxs(DialogDescription, {
			className: "font-ticket",
			children: ["@", p.username]
		})] }), /* @__PURE__ */ jsxs("form", {
			className: "grid gap-4",
			onSubmit: async (e) => {
				e.preventDefault();
				const f = new FormData(e.currentTarget);
				const patch = {
					fullName: String(f.get("fullName")).trim(),
					phone: String(f.get("phone") ?? "") || void 0
				};
				if (!self) patch.role = f.get("role");
				const res = await updateUser(p.id, patch);
				if (!res.ok) return toast.error(res.error);
				toast.success("บันทึกข้อมูลแล้ว");
				onClose();
			},
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: "ชื่อ-นามสกุล",
					htmlFor: "e-name",
					required: true,
					children: /* @__PURE__ */ jsx(Input, {
						id: "e-name",
						name: "fullName",
						defaultValue: p.fullName,
						className: "h-11"
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "เบอร์โทร",
					htmlFor: "e-phone",
					children: /* @__PURE__ */ jsx(Input, {
						id: "e-phone",
						name: "phone",
						defaultValue: p.phone,
						className: "h-11 font-ticket"
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "บทบาท",
					htmlFor: "e-role",
					hint: self ? "ไม่สามารถเปลี่ยนบทบาทของตัวเองได้" : void 0,
					children: /* @__PURE__ */ jsx("select", {
						id: "e-role",
						name: "role",
						className: "native-select",
						defaultValue: p.role,
						disabled: self,
						children: ROLES.map((r) => /* @__PURE__ */ jsx("option", {
							value: r,
							children: ROLE_LABEL[r]
						}, r))
					})
				}),
				/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
					type: "submit",
					size: "lg",
					children: "บันทึก"
				}) })
			]
		})] })
	});
}
function ResetDialog({ p, onClose }) {
	const { resetUserPassword } = useAppStore();
	const [error, setError] = React.useState("");
	return /* @__PURE__ */ jsx(Dialog, {
		open: true,
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ jsxs(DialogContent, { children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "รีเซ็ตรหัสผ่าน" }), /* @__PURE__ */ jsxs(DialogDescription, { children: [
			"ตั้งรหัสผ่านชั่วคราวให้ ",
			p.fullName,
			" ระบบจะบังคับให้เปลี่ยนรหัสผ่านเมื่อเข้าสู่ระบบครั้งถัดไป และออกจากระบบทุกอุปกรณ์เดิม"
		] })] }), /* @__PURE__ */ jsxs("form", {
			className: "grid gap-4",
			onSubmit: async (e) => {
				e.preventDefault();
				const f = new FormData(e.currentTarget);
				const errs = validatePassword(String(f.get("password")), String(f.get("confirm")));
				if (errs.password || errs.confirm) return setError(errs.password ?? errs.confirm ?? "");
				const res = await resetUserPassword(p.id, String(f.get("password") ?? ""), String(f.get("confirm") ?? ""));
				if (!res.ok) return setError(res.error);
				toast.success(`รีเซ็ตรหัสผ่านของ ${p.username} แล้ว`);
				onClose();
			},
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: "รหัสผ่านชั่วคราว",
					htmlFor: "r-pw",
					required: true,
					children: /* @__PURE__ */ jsx(Input, {
						id: "r-pw",
						name: "password",
						type: "password",
						autoComplete: "new-password",
						className: "h-11"
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "ยืนยันรหัสผ่าน",
					htmlFor: "r-confirm",
					error,
					required: true,
					children: /* @__PURE__ */ jsx(Input, {
						id: "r-confirm",
						name: "confirm",
						type: "password",
						autoComplete: "new-password",
						className: "h-11"
					})
				}),
				/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsxs(Button, {
					type: "submit",
					size: "lg",
					children: [/* @__PURE__ */ jsx(KeyRound, {}), " รีเซ็ตรหัสผ่าน"]
				}) })
			]
		})] })
	});
}
var SplitComponent = () => /* @__PURE__ */ jsx(RoleGate, {
	roles: ["ADMIN"],
	children: /* @__PURE__ */ jsx(UsersPage, {})
});
export { SplitComponent as component };
