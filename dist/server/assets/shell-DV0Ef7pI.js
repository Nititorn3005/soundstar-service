import { n as useAppStore, o as Button, s as cn } from "./store-HGwRtq6e.js";
import { i as STATUS_LABEL, o as STATUS_TONE, r as ROLE_LABEL } from "./domain-BwIhFv2h.js";
import { i as validatePassword } from "./validation-UYwavGYK.js";
import * as React from "react";
import { Link, useNavigate, useRouterState } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { ArrowDownToLine, ArrowUpFromLine, BarChart3, Building2, ClipboardList, FileSearch, History, KeyRound, LayoutDashboard, LogOut, Menu, Package, PlusCircle, ShieldAlert, Users, WashingMachine, XIcon } from "lucide-react";
import { toast } from "sonner";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import * as LabelPrimitive from "@radix-ui/react-label";
// src/components/ui/dialog.tsx
function Dialog({ ...props }) {
	return /* @__PURE__ */ jsx(DialogPrimitive.Root, {
		"data-slot": "dialog",
		...props
	});
}
function DialogPortal({ ...props }) {
	return /* @__PURE__ */ jsx(DialogPrimitive.Portal, {
		"data-slot": "dialog-portal",
		...props
	});
}
function DialogOverlay({ className, ...props }) {
	return /* @__PURE__ */ jsx(DialogPrimitive.Overlay, {
		"data-slot": "dialog-overlay",
		className: cn("fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", className),
		...props
	});
}
function DialogContent({ className, children, showCloseButton = true, ...props }) {
	return /* @__PURE__ */ jsxs(DialogPortal, {
		"data-slot": "dialog-portal",
		children: [/* @__PURE__ */ jsx(DialogOverlay, {}), /* @__PURE__ */ jsxs(DialogPrimitive.Content, {
			"data-slot": "dialog-content",
			className: cn("fixed top-[50%] left-[50%] z-50 grid w-full max-w-[calc(100%-2rem)] translate-x-[-50%] translate-y-[-50%] gap-4 rounded-lg border bg-background p-6 shadow-lg duration-200 outline-none data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=closed]:zoom-out-95 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=open]:zoom-in-95 sm:max-w-lg", className),
			...props,
			children: [children, showCloseButton && /* @__PURE__ */ jsxs(DialogPrimitive.Close, {
				"data-slot": "dialog-close",
				className: "absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4",
				children: [/* @__PURE__ */ jsx(XIcon, {}), /* @__PURE__ */ jsx("span", {
					className: "sr-only",
					children: "Close"
				})]
			})]
		})]
	});
}
function DialogHeader({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "dialog-header",
		className: cn("flex flex-col gap-2 text-center sm:text-left", className),
		...props
	});
}
function DialogFooter({ className, showCloseButton = false, children, ...props }) {
	return /* @__PURE__ */ jsxs("div", {
		"data-slot": "dialog-footer",
		className: cn("flex flex-col-reverse gap-2 sm:flex-row sm:justify-end", className),
		...props,
		children: [children, showCloseButton && /* @__PURE__ */ jsx(DialogPrimitive.Close, {
			asChild: true,
			children: /* @__PURE__ */ jsx(Button, {
				variant: "outline",
				children: "Close"
			})
		})]
	});
}
function DialogTitle({ className, ...props }) {
	return /* @__PURE__ */ jsx(DialogPrimitive.Title, {
		"data-slot": "dialog-title",
		className: cn("text-lg leading-none font-semibold", className),
		...props
	});
}
function DialogDescription({ className, ...props }) {
	return /* @__PURE__ */ jsx(DialogPrimitive.Description, {
		"data-slot": "dialog-description",
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
// src/components/ui/input.tsx
function Input({ className, type, ...props }) {
	return /* @__PURE__ */ jsx("input", {
		type,
		"data-slot": "input",
		className: cn("h-9 w-full min-w-0 rounded-md border border-input bg-transparent px-3 py-1 text-base shadow-xs transition-[color,box-shadow] outline-none selection:bg-primary selection:text-primary-foreground file:inline-flex file:h-7 file:border-0 file:bg-transparent file:text-sm file:font-medium file:text-foreground placeholder:text-muted-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 md:text-sm dark:bg-input/30", "focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50", "aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40", className),
		...props
	});
}
// src/components/ui/label.tsx
function Label({ className, ...props }) {
	return /* @__PURE__ */ jsx(LabelPrimitive.Root, {
		"data-slot": "label",
		className: cn("flex items-center gap-2 text-sm leading-none font-medium select-none group-data-[disabled=true]:pointer-events-none group-data-[disabled=true]:opacity-50 peer-disabled:cursor-not-allowed peer-disabled:opacity-50", className),
		...props
	});
}
// src/components/ui/sheet.tsx
function Sheet({ ...props }) {
	return /* @__PURE__ */ jsx(DialogPrimitive.Root, {
		"data-slot": "sheet",
		...props
	});
}
function SheetPortal({ ...props }) {
	return /* @__PURE__ */ jsx(DialogPrimitive.Portal, {
		"data-slot": "sheet-portal",
		...props
	});
}
function SheetOverlay({ className, ...props }) {
	return /* @__PURE__ */ jsx(DialogPrimitive.Overlay, {
		"data-slot": "sheet-overlay",
		className: cn("fixed inset-0 z-50 bg-black/50 data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:animate-in data-[state=open]:fade-in-0", className),
		...props
	});
}
function SheetContent({ className, children, side = "right", showCloseButton = true, ...props }) {
	return /* @__PURE__ */ jsxs(SheetPortal, { children: [/* @__PURE__ */ jsx(SheetOverlay, {}), /* @__PURE__ */ jsxs(DialogPrimitive.Content, {
		"data-slot": "sheet-content",
		className: cn("fixed z-50 flex flex-col gap-4 bg-background shadow-lg transition ease-in-out data-[state=closed]:animate-out data-[state=closed]:duration-300 data-[state=open]:animate-in data-[state=open]:duration-500", side === "right" && "inset-y-0 right-0 h-full w-3/4 border-l data-[state=closed]:slide-out-to-right data-[state=open]:slide-in-from-right sm:max-w-sm", side === "left" && "inset-y-0 left-0 h-full w-3/4 border-r data-[state=closed]:slide-out-to-left data-[state=open]:slide-in-from-left sm:max-w-sm", side === "top" && "inset-x-0 top-0 h-auto border-b data-[state=closed]:slide-out-to-top data-[state=open]:slide-in-from-top", side === "bottom" && "inset-x-0 bottom-0 h-auto border-t data-[state=closed]:slide-out-to-bottom data-[state=open]:slide-in-from-bottom", className),
		...props,
		children: [children, showCloseButton && /* @__PURE__ */ jsxs(DialogPrimitive.Close, {
			className: "absolute top-4 right-4 rounded-xs opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:outline-hidden disabled:pointer-events-none data-[state=open]:bg-secondary",
			children: [/* @__PURE__ */ jsx(XIcon, { className: "size-4" }), /* @__PURE__ */ jsx("span", {
				className: "sr-only",
				children: "Close"
			})]
		})]
	})] });
}
function SheetHeader({ className, ...props }) {
	return /* @__PURE__ */ jsx("div", {
		"data-slot": "sheet-header",
		className: cn("flex flex-col gap-1.5 p-4", className),
		...props
	});
}
function SheetTitle({ className, ...props }) {
	return /* @__PURE__ */ jsx(DialogPrimitive.Title, {
		"data-slot": "sheet-title",
		className: cn("font-semibold text-foreground", className),
		...props
	});
}
function SheetDescription({ className, ...props }) {
	return /* @__PURE__ */ jsx(DialogPrimitive.Description, {
		"data-slot": "sheet-description",
		className: cn("text-sm text-muted-foreground", className),
		...props
	});
}
// src/components/app/shell.tsx
var ALL = [
	"ADMIN",
	"FRONT",
	"TECH"
];
var NAV = [
	{
		to: "/dashboard",
		label: "แดชบอร์ด",
		icon: LayoutDashboard,
		roles: ALL
	},
	{
		to: "/jobs/new",
		label: "รับแจ้งงานซ่อม",
		icon: PlusCircle,
		roles: ["ADMIN", "FRONT"]
	},
	{
		to: "/jobs",
		label: "รายการงานซ่อม",
		icon: ClipboardList,
		roles: ALL
	},
	{
		to: "/jobs/latest",
		label: "รายละเอียดงานซ่อม",
		icon: FileSearch,
		roles: ALL
	},
	{
		to: "/inventory",
		label: "สต๊อกอะไหล่",
		icon: Package,
		roles: ["ADMIN", "TECH"]
	},
	{
		to: "/inventory/receive",
		label: "รับอะไหล่เข้า",
		icon: ArrowDownToLine,
		roles: ["ADMIN"]
	},
	{
		to: "/inventory/issue",
		label: "เบิกอะไหล่ออก",
		icon: ArrowUpFromLine,
		roles: ["ADMIN", "TECH"]
	},
	{
		to: "/inventory/history",
		label: "ประวัติสต๊อก",
		icon: History,
		roles: ["ADMIN", "TECH"]
	},
	{
		to: "/users",
		label: "จัดการผู้ใช้งาน",
		icon: Users,
		roles: ["ADMIN"]
	},
	{
		to: "/reports",
		label: "รายงาน",
		icon: BarChart3,
		roles: ["ADMIN"]
	},
	{
		to: "/settings",
		label: "ตั้งค่าบริษัท",
		icon: Building2,
		roles: ["ADMIN"]
	}
];
function Brand({ className }) {
	return /* @__PURE__ */ jsxs("span", {
		className: cn("flex items-center gap-3", className),
		children: [/* @__PURE__ */ jsx("span", {
			className: "grid size-10 place-items-center rounded-xl bg-sidebar-primary text-sidebar-primary-foreground shadow-[inset_0_-3px_0_oklch(0_0_0/0.15)]",
			children: /* @__PURE__ */ jsx(WashingMachine, {
				className: "size-5",
				"aria-hidden": true
			})
		}), /* @__PURE__ */ jsxs("span", {
			className: "leading-tight",
			children: [/* @__PURE__ */ jsx("span", {
				className: "block font-display text-base font-bold tracking-tight",
				children: "Hatyai Soundstar"
			}), /* @__PURE__ */ jsx("span", {
				className: "block text-xs opacity-70",
				children: "ระบบบริหารงานซ่อม"
			})]
		})]
	});
}
function NavList({ onNavigate }) {
	const { currentUser, jobs, signOut } = useAppStore();
	const navigate = useNavigate();
	const pathname = useRouterState({ select: (s) => s.location.pathname });
	const role = currentUser?.role ?? "FRONT";
	const latestJob = role === "TECH" ? jobs.find((j) => j.technicianId === currentUser?.id) : jobs[0];
	return /* @__PURE__ */ jsxs("nav", {
		"aria-label": "เมนูหลัก",
		className: "flex flex-1 flex-col gap-0.5",
		children: [NAV.filter((n) => n.roles.includes(role)).map((n) => {
			const isDetail = n.to === "/jobs/latest";
			const active = n.to === "/jobs/latest" ? /^\/jobs\/(?!new)[^/]+$/.test(pathname) : pathname === n.to || pathname === n.to + "/";
			const className = cn("group flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm transition-colors motion-reduce:transition-none", active ? "bg-sidebar-accent text-sidebar-accent-foreground" : "text-sidebar-foreground/80 hover:bg-sidebar-accent/60 hover:text-sidebar-accent-foreground");
			const body = /* @__PURE__ */ jsxs(Fragment, { children: [
				/* @__PURE__ */ jsx("span", {
					className: "w-5 font-ticket text-[10px] opacity-40",
					children: String(NAV.indexOf(n) + 1).padStart(2, "0")
				}),
				/* @__PURE__ */ jsx(n.icon, {
					className: cn("size-4", active && "text-sidebar-primary"),
					"aria-hidden": true
				}),
				n.label
			] });
			if (isDetail && latestJob) return /* @__PURE__ */ jsx(Link, {
				to: "/jobs/$jobId",
				params: { jobId: latestJob.id },
				onClick: onNavigate,
				className,
				children: body
			}, n.to);
			return /* @__PURE__ */ jsx(Link, {
				to: isDetail ? "/jobs" : n.to,
				onClick: onNavigate,
				className,
				children: body
			}, n.to);
		}), /* @__PURE__ */ jsxs("button", {
			type: "button",
			onClick: async () => {
				await signOut();
				onNavigate?.();
				toast.success("ออกจากระบบแล้ว");
				navigate({ to: "/" });
			},
			className: "mt-2 flex min-h-11 items-center gap-3 rounded-lg px-3 text-sm text-sidebar-foreground/80 transition-colors hover:bg-destructive/20 hover:text-sidebar-accent-foreground",
			children: [
				/* @__PURE__ */ jsx("span", {
					className: "w-5 font-ticket text-[10px] opacity-40",
					children: "12"
				}),
				/* @__PURE__ */ jsx(LogOut, {
					className: "size-4",
					"aria-hidden": true
				}),
				"ออกจากระบบ"
			]
		})]
	});
}
function UserChip({ onChangePassword }) {
	const { currentUser } = useAppStore();
	if (!currentUser) return null;
	return /* @__PURE__ */ jsxs("div", {
		className: "rounded-xl border border-sidebar-border bg-sidebar-accent/40 p-3",
		children: [
			/* @__PURE__ */ jsx("p", {
				className: "truncate text-sm font-medium text-sidebar-accent-foreground",
				children: currentUser.fullName
			}),
			/* @__PURE__ */ jsxs("p", {
				className: "font-ticket text-xs text-sidebar-foreground/70",
				children: [
					"@",
					currentUser.username,
					" · ",
					ROLE_LABEL[currentUser.role]
				]
			}),
			/* @__PURE__ */ jsxs("button", {
				type: "button",
				onClick: onChangePassword,
				className: "mt-2 inline-flex items-center gap-1.5 text-xs text-sidebar-primary hover:underline",
				children: [/* @__PURE__ */ jsx(KeyRound, {
					className: "size-3",
					"aria-hidden": true
				}), " เปลี่ยนรหัสผ่าน"]
			})
		]
	});
}
function AppShell({ children }) {
	const [open, setOpen] = React.useState(false);
	const [pwOpen, setPwOpen] = React.useState(false);
	const { currentUser } = useAppStore();
	return /* @__PURE__ */ jsxs("div", {
		className: "min-h-screen bg-background lg:grid lg:grid-cols-[17rem_1fr]",
		children: [
			/* @__PURE__ */ jsxs("aside", {
				className: "no-print drum-rings sticky top-0 hidden h-screen flex-col gap-6 overflow-y-auto bg-sidebar p-4 text-sidebar-foreground lg:flex",
				children: [
					/* @__PURE__ */ jsx(Brand, { className: "px-1 pt-2 text-sidebar-accent-foreground" }),
					/* @__PURE__ */ jsx(NavList, {}),
					/* @__PURE__ */ jsx(UserChip, { onChangePassword: () => setPwOpen(true) })
				]
			}),
			/* @__PURE__ */ jsxs("header", {
				className: "no-print sticky top-0 z-30 flex items-center justify-between bg-sidebar px-4 py-3 text-sidebar-accent-foreground lg:hidden",
				children: [/* @__PURE__ */ jsx(Brand, {}), /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "icon-lg",
					"aria-label": "เปิดเมนู",
					className: "text-sidebar-accent-foreground hover:bg-sidebar-accent",
					onClick: () => setOpen(true),
					children: /* @__PURE__ */ jsx(Menu, {})
				})]
			}),
			/* @__PURE__ */ jsx(Sheet, {
				open,
				onOpenChange: setOpen,
				children: /* @__PURE__ */ jsxs(SheetContent, {
					side: "left",
					className: "drum-rings flex w-[85vw] max-w-xs flex-col gap-4 overflow-y-auto border-sidebar-border bg-sidebar p-4 text-sidebar-foreground",
					children: [
						/* @__PURE__ */ jsxs(SheetHeader, {
							className: "p-0",
							children: [/* @__PURE__ */ jsx(SheetTitle, {
								className: "text-sidebar-accent-foreground",
								children: /* @__PURE__ */ jsx(Brand, {})
							}), /* @__PURE__ */ jsx(SheetDescription, {
								className: "sr-only",
								children: "เมนูหลักของระบบ"
							})]
						}),
						/* @__PURE__ */ jsx(NavList, { onNavigate: () => setOpen(false) }),
						/* @__PURE__ */ jsx(UserChip, { onChangePassword: () => {
							setOpen(false);
							setPwOpen(true);
						} })
					]
				})
			}),
			/* @__PURE__ */ jsxs("div", {
				className: "flex min-w-0 flex-col",
				children: [/* @__PURE__ */ jsx("main", {
					className: "mx-auto w-full max-w-content flex-1 px-4 py-6 sm:px-6 lg:py-10",
					children
				}), /* @__PURE__ */ jsx(CompanyFooter, {})]
			}),
			currentUser && /* @__PURE__ */ jsx(ChangePasswordDialog, {
				open: pwOpen,
				onOpenChange: setPwOpen
			})
		]
	});
}
function CompanyFooter({ className }) {
	const { company } = useAppStore();
	return /* @__PURE__ */ jsx("footer", {
		className: cn("no-print border-t border-border px-4 py-5 text-xs text-muted-foreground sm:px-6", className),
		children: /* @__PURE__ */ jsxs("div", {
			className: "mx-auto flex max-w-content flex-col gap-1 sm:flex-row sm:items-center sm:justify-between",
			children: [/* @__PURE__ */ jsxs("p", { children: [
				/* @__PURE__ */ jsx("span", {
					className: "font-medium text-foreground",
					children: company.nameTh
				}),
				" ",
				"(",
				company.nameEn,
				")"
			] }), /* @__PURE__ */ jsxs("p", { children: [
				company.address,
				" · โทร ",
				company.phones
			] })]
		})
	});
}
function ChangePasswordDialog({ open, onOpenChange }) {
	const [error, setError] = React.useState("");
	return /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ jsxs(DialogContent, { children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "เปลี่ยนรหัสผ่าน" }), /* @__PURE__ */ jsx(DialogDescription, { children: "รหัสผ่านใหม่ต้องมีอย่างน้อย 10 ตัวอักษร ประกอบด้วยตัวอักษรและตัวเลข" })] }), /* @__PURE__ */ jsxs("form", {
			className: "grid gap-4",
			onSubmit: (e) => {
				e.preventDefault();
				const f = new FormData(e.currentTarget);
				const errs = validatePassword(String(f.get("next")), String(f.get("confirm")));
				if (errs.password || errs.confirm) return setError(errs.password ?? errs.confirm ?? "");
				setError("");
				onOpenChange(false);
				toast.success("เปลี่ยนรหัสผ่านเรียบร้อย");
			},
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: "รหัสผ่านปัจจุบัน",
					htmlFor: "pw-current",
					children: /* @__PURE__ */ jsx(Input, {
						id: "pw-current",
						name: "current",
						type: "password",
						required: true,
						autoComplete: "current-password"
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "รหัสผ่านใหม่",
					htmlFor: "pw-next",
					children: /* @__PURE__ */ jsx(Input, {
						id: "pw-next",
						name: "next",
						type: "password",
						required: true,
						autoComplete: "new-password"
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "ยืนยันรหัสผ่านใหม่",
					htmlFor: "pw-confirm",
					error,
					children: /* @__PURE__ */ jsx(Input, {
						id: "pw-confirm",
						name: "confirm",
						type: "password",
						required: true,
						autoComplete: "new-password"
					})
				}),
				/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
					type: "submit",
					size: "lg",
					children: "บันทึกรหัสผ่าน"
				}) })
			]
		})] })
	});
}
function Field({ label, htmlFor, hint, error, required, className, children }) {
	return /* @__PURE__ */ jsxs("div", {
		className: cn("grid gap-1.5", className),
		children: [
			/* @__PURE__ */ jsxs(Label, {
				htmlFor,
				children: [label, required && /* @__PURE__ */ jsx("span", {
					className: "text-destructive",
					children: "*"
				})]
			}),
			children,
			error ? /* @__PURE__ */ jsx("p", {
				role: "alert",
				className: "text-xs text-destructive",
				children: error
			}) : hint ? /* @__PURE__ */ jsx("p", {
				className: "text-xs text-muted-foreground",
				children: hint
			}) : null
		]
	});
}
function PageHeader({ eyebrow, title, description, actions }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between animate-in fade-in slide-in-from-bottom-2 duration-500 motion-reduce:animate-none",
		children: [/* @__PURE__ */ jsxs("div", { children: [
			eyebrow && /* @__PURE__ */ jsx("p", {
				className: "mb-1 font-ticket text-xs uppercase tracking-[0.2em] text-highlight",
				children: eyebrow
			}),
			/* @__PURE__ */ jsx("h1", {
				className: "font-display text-2xl font-bold tracking-tight sm:text-3xl",
				children: title
			}),
			description && /* @__PURE__ */ jsx("p", {
				className: "mt-1 max-w-reading text-sm text-muted-foreground",
				children: description
			})
		] }), actions && /* @__PURE__ */ jsx("div", {
			className: "no-print flex flex-wrap gap-2",
			children: actions
		})]
	});
}
function StatusBadge({ status, className }) {
	return /* @__PURE__ */ jsx("span", {
		className: cn("inline-flex items-center whitespace-nowrap rounded-full px-2.5 py-0.5 text-xs font-medium", STATUS_TONE[status], className),
		children: STATUS_LABEL[status]
	});
}
function JobNo({ children }) {
	return /* @__PURE__ */ jsx("span", {
		className: "font-ticket text-xs font-bold tracking-wide text-primary",
		children
	});
}
function EmptyState({ icon: Icon, title, description, action }) {
	return /* @__PURE__ */ jsxs("div", {
		className: "flex flex-col items-center rounded-2xl border border-dashed border-border bg-card/60 px-6 py-12 text-center",
		children: [
			/* @__PURE__ */ jsx("span", {
				className: "mb-4 grid size-14 place-items-center rounded-full bg-secondary text-primary",
				children: /* @__PURE__ */ jsx(Icon, {
					className: "size-6",
					"aria-hidden": true
				})
			}),
			/* @__PURE__ */ jsx("p", {
				className: "font-display text-lg font-semibold",
				children: title
			}),
			description && /* @__PURE__ */ jsx("p", {
				className: "mt-1 max-w-sm text-sm text-muted-foreground",
				children: description
			}),
			action && /* @__PURE__ */ jsx("div", {
				className: "mt-5",
				children: action
			})
		]
	});
}
function RoleGate({ roles, children }) {
	const { currentUser } = useAppStore();
	if (!currentUser || !roles.includes(currentUser.role)) return /* @__PURE__ */ jsx(EmptyState, {
		icon: ShieldAlert,
		title: "ไม่มีสิทธิ์เข้าถึงหน้านี้",
		description: "หน้านี้สงวนไว้สำหรับบทบาทที่ได้รับอนุญาต หากคิดว่าเป็นข้อผิดพลาด กรุณาติดต่อผู้ดูแลระบบ",
		action: /* @__PURE__ */ jsx(Button, {
			asChild: true,
			variant: "outline",
			children: /* @__PURE__ */ jsx(Link, {
				to: "/dashboard",
				children: "กลับแดชบอร์ด"
			})
		})
	});
	return /* @__PURE__ */ jsx(Fragment, { children });
}
function Panel({ title, action, className, children }) {
	return /* @__PURE__ */ jsxs("section", {
		className: cn("rounded-2xl border border-border bg-card p-4 shadow-xs sm:p-5", className),
		children: [title && /* @__PURE__ */ jsxs("div", {
			className: "mb-4 flex items-center justify-between gap-2",
			children: [/* @__PURE__ */ jsx("h2", {
				className: "font-display text-base font-semibold",
				children: title
			}), action]
		}), children]
	});
}
export { DialogTitle as _, Field as a, Panel as c, Input as d, Dialog as f, DialogHeader as g, DialogFooter as h, EmptyState as i, RoleGate as l, DialogDescription as m, Brand as n, JobNo as o, DialogContent as p, CompanyFooter as r, PageHeader as s, AppShell as t, StatusBadge as u };
