import { _ as DialogTitle, a as Field, c as Panel, d as Input, f as Dialog, g as DialogHeader, h as DialogFooter, i as EmptyState, l as RoleGate, m as DialogDescription, p as DialogContent, s as PageHeader } from "./shell-DV0Ef7pI.js";
import { n as useAppStore, o as Button, s as cn } from "./store-HGwRtq6e.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CR3tRoMi.js";
import { u as fmtBaht } from "./domain-BwIhFv2h.js";
import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AlertTriangle, ArrowDownToLine, Package, Pencil, Plus, Search, SearchX } from "lucide-react";
import { toast } from "sonner";
// src/routes/_app/inventory.index.tsx?tsr-split=component
var isLow = (i) => i.onHand < i.minQty;
function Inventory() {
	const { inventory, currentUser } = useAppStore();
	const isAdmin = currentUser?.role === "ADMIN";
	const [q, setQ] = React.useState("");
	const [onlyLow, setOnlyLow] = React.useState(false);
	const [editing, setEditing] = React.useState(null);
	const needle = q.trim().toLowerCase();
	const rows = inventory.filter((i) => (!onlyLow || isLow(i)) && (!needle || [
		i.code,
		i.name,
		i.category,
		i.compatible
	].join(" ").toLowerCase().includes(needle)));
	const reorder = inventory.filter(isLow);
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			eyebrow: "Inventory",
			title: "สต๊อกอะไหล่",
			description: `${inventory.length} รายการ · ต่ำกว่าขั้นต่ำ ${reorder.length} รายการ`,
			actions: isAdmin && /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(Button, {
				asChild: true,
				variant: "outline",
				size: "lg",
				children: /* @__PURE__ */ jsxs(Link, {
					to: "/inventory/receive",
					children: [/* @__PURE__ */ jsx(ArrowDownToLine, {}), " รับอะไหล่เข้า"]
				})
			}), /* @__PURE__ */ jsxs(Button, {
				size: "lg",
				onClick: () => setEditing("new"),
				children: [/* @__PURE__ */ jsx(Plus, {}), " เพิ่มอะไหล่"]
			})] })
		}),
		reorder.length > 0 && /* @__PURE__ */ jsx(Panel, {
			className: "mb-6 border-warn/60 bg-warn/10",
			children: /* @__PURE__ */ jsxs("div", {
				className: "flex items-start gap-3",
				children: [/* @__PURE__ */ jsx(AlertTriangle, {
					className: "mt-0.5 size-5 shrink-0 text-warn",
					"aria-hidden": true
				}), /* @__PURE__ */ jsxs("div", {
					className: "min-w-0 flex-1",
					children: [/* @__PURE__ */ jsx("p", {
						className: "font-display font-semibold",
						children: "รายการที่ควรสั่งซื้อ"
					}), /* @__PURE__ */ jsx("ul", {
						className: "mt-2 flex flex-wrap gap-2",
						children: reorder.map((i) => /* @__PURE__ */ jsxs("li", {
							className: "rounded-lg bg-card px-2.5 py-1 text-xs",
							children: [
								i.name,
								" — สั่งเพิ่มอย่างน้อย",
								" ",
								/* @__PURE__ */ jsxs("b", {
									className: "font-ticket",
									children: [
										i.minQty * 2 - i.onHand,
										" ",
										i.unit
									]
								})
							]
						}, i.id))
					})]
				})]
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mb-4 flex flex-col gap-3 sm:flex-row",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "relative flex-1",
				children: [/* @__PURE__ */ jsx(Search, {
					className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
					"aria-hidden": true
				}), /* @__PURE__ */ jsx(Input, {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "ค้นหารหัส ชื่อ หมวดหมู่ หรือรุ่นที่รองรับ",
					"aria-label": "ค้นหาอะไหล่",
					className: "h-11 bg-card pl-9"
				})]
			}), /* @__PURE__ */ jsxs(Button, {
				variant: onlyLow ? "default" : "outline",
				className: "h-11",
				onClick: () => setOnlyLow((v) => !v),
				"aria-pressed": onlyLow,
				children: [/* @__PURE__ */ jsx(AlertTriangle, {}), " เฉพาะใกล้หมด"]
			})]
		}),
		rows.length === 0 ? inventory.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
			icon: Package,
			title: "ยังไม่มีอะไหล่ในระบบ",
			description: "เพิ่มรายการอะไหล่เพื่อเริ่มบันทึกสต๊อก"
		}) : /* @__PURE__ */ jsx(EmptyState, {
			icon: SearchX,
			title: "ไม่พบอะไหล่ที่ค้นหา"
		}) : /* @__PURE__ */ jsx("div", {
			className: "rounded-2xl border border-border bg-card",
			children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableHead, { children: "รหัส / ชื่ออะไหล่" }),
				/* @__PURE__ */ jsx(TableHead, {
					className: "hidden md:table-cell",
					children: "หมวดหมู่"
				}),
				/* @__PURE__ */ jsx(TableHead, {
					className: "hidden lg:table-cell",
					children: "รองรับ"
				}),
				/* @__PURE__ */ jsx(TableHead, {
					className: "text-right",
					children: "คงเหลือ"
				}),
				/* @__PURE__ */ jsx(TableHead, {
					className: "hidden sm:table-cell",
					children: "ตำแหน่ง"
				}),
				isAdmin && /* @__PURE__ */ jsx(TableHead, {
					className: "hidden text-right md:table-cell",
					children: "ราคาทุน"
				}),
				isAdmin && /* @__PURE__ */ jsx(TableHead, {
					className: "w-10",
					children: /* @__PURE__ */ jsx("span", {
						className: "sr-only",
						children: "แก้ไข"
					})
				})
			] }) }), /* @__PURE__ */ jsx(TableBody, { children: rows.map((i) => /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsxs(TableCell, {
					className: "max-w-48 whitespace-normal",
					children: [/* @__PURE__ */ jsx("p", {
						className: "font-ticket text-[11px] text-primary",
						children: i.code
					}), /* @__PURE__ */ jsx("p", {
						className: "font-medium",
						children: i.name
					})]
				}),
				/* @__PURE__ */ jsx(TableCell, {
					className: "hidden md:table-cell",
					children: i.category
				}),
				/* @__PURE__ */ jsx(TableCell, {
					className: "hidden max-w-48 truncate text-muted-foreground lg:table-cell",
					children: i.compatible
				}),
				/* @__PURE__ */ jsxs(TableCell, {
					className: "text-right",
					children: [/* @__PURE__ */ jsx("span", {
						className: cn("inline-block rounded-md px-2 py-0.5 font-ticket", i.onHand === 0 ? "bg-destructive text-white" : isLow(i) ? "bg-warn/30" : ""),
						children: i.onHand
					}), /* @__PURE__ */ jsxs("p", {
						className: "text-[11px] text-muted-foreground",
						children: [
							"ขั้นต่ำ ",
							i.minQty,
							" ",
							i.unit
						]
					})]
				}),
				/* @__PURE__ */ jsx(TableCell, {
					className: "hidden sm:table-cell",
					children: i.location
				}),
				isAdmin && /* @__PURE__ */ jsx(TableCell, {
					className: "hidden text-right font-ticket md:table-cell",
					children: fmtBaht(i.cost)
				}),
				isAdmin && /* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(Button, {
					variant: "ghost",
					size: "icon",
					"aria-label": `แก้ไข ${i.name}`,
					onClick: () => setEditing(i),
					children: /* @__PURE__ */ jsx(Pencil, {})
				}) })
			] }, i.id)) })] })
		}),
		editing && /* @__PURE__ */ jsx(ItemDialog, {
			item: editing === "new" ? null : editing,
			onClose: () => setEditing(null)
		})
	] });
}
function ItemDialog({ item, onClose }) {
	const { saveItem } = useAppStore();
	return /* @__PURE__ */ jsx(Dialog, {
		open: true,
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ jsxs(DialogContent, {
			className: "max-h-[90vh] overflow-y-auto sm:max-w-xl",
			children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: item ? "แก้ไขข้อมูลอะไหล่" : "เพิ่มอะไหล่ใหม่" }), /* @__PURE__ */ jsx(DialogDescription, { children: "ยอดคงเหลือเปลี่ยนได้ผ่านการรับเข้า เบิกออก หรือปรับยอดเท่านั้น เพื่อให้ตรวจสอบย้อนหลังได้" })] }), /* @__PURE__ */ jsxs("form", {
				className: "grid gap-4 sm:grid-cols-2",
				onSubmit: async (e) => {
					e.preventDefault();
					const f = new FormData(e.currentTarget);
					const v = (k) => String(f.get(k) ?? "").trim();
					if (!v("code") || !v("name")) return toast.error("กรุณากรอกรหัสและชื่ออะไหล่");
					const res = await saveItem({
						id: item?.id,
						code: v("code").toUpperCase(),
						name: v("name"),
						category: v("category"),
						compatible: v("compatible"),
						unit: v("unit") || "ชิ้น",
						onHand: item?.onHand ?? 0,
						minQty: Math.max(0, Number(v("minQty")) || 0),
						cost: Math.max(0, Number(v("cost")) || 0),
						location: v("location"),
						note: v("note") || void 0
					});
					if (!res.ok) return toast.error(res.error);
					toast.success(item ? "บันทึกการแก้ไขแล้ว" : "เพิ่มอะไหล่แล้ว");
					onClose();
				},
				children: [
					/* @__PURE__ */ jsx(Field, {
						label: "รหัสอะไหล่",
						htmlFor: "code",
						required: true,
						children: /* @__PURE__ */ jsx(Input, {
							id: "code",
							name: "code",
							defaultValue: item?.code,
							className: "h-11 font-ticket uppercase"
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "ชื่ออะไหล่",
						htmlFor: "name",
						required: true,
						children: /* @__PURE__ */ jsx(Input, {
							id: "name",
							name: "name",
							defaultValue: item?.name,
							className: "h-11"
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "หมวดหมู่",
						htmlFor: "category",
						children: /* @__PURE__ */ jsx(Input, {
							id: "category",
							name: "category",
							defaultValue: item?.category,
							className: "h-11"
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "หน่วยนับ",
						htmlFor: "unit",
						children: /* @__PURE__ */ jsx(Input, {
							id: "unit",
							name: "unit",
							defaultValue: item?.unit ?? "ชิ้น",
							className: "h-11"
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "ยี่ห้อหรือรุ่นที่รองรับ",
						htmlFor: "compatible",
						className: "sm:col-span-2",
						children: /* @__PURE__ */ jsx(Input, {
							id: "compatible",
							name: "compatible",
							defaultValue: item?.compatible,
							className: "h-11"
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "จำนวนขั้นต่ำ",
						htmlFor: "minQty",
						children: /* @__PURE__ */ jsx(Input, {
							id: "minQty",
							name: "minQty",
							type: "number",
							min: 0,
							defaultValue: item?.minQty ?? 1,
							className: "h-11"
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "ราคาทุน (บาท)",
						htmlFor: "cost",
						children: /* @__PURE__ */ jsx(Input, {
							id: "cost",
							name: "cost",
							type: "number",
							min: 0,
							step: "0.01",
							defaultValue: item?.cost,
							className: "h-11"
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "ตำแหน่งจัดเก็บ",
						htmlFor: "location",
						children: /* @__PURE__ */ jsx(Input, {
							id: "location",
							name: "location",
							defaultValue: item?.location,
							className: "h-11"
						})
					}),
					/* @__PURE__ */ jsx(Field, {
						label: "หมายเหตุ",
						htmlFor: "note",
						children: /* @__PURE__ */ jsx(Input, {
							id: "note",
							name: "note",
							defaultValue: item?.note,
							className: "h-11"
						})
					}),
					/* @__PURE__ */ jsx(DialogFooter, {
						className: "sm:col-span-2",
						children: /* @__PURE__ */ jsx(Button, {
							type: "submit",
							size: "lg",
							children: "บันทึก"
						})
					})
				]
			})]
		})
	});
}
var SplitComponent = () => /* @__PURE__ */ jsx(RoleGate, {
	roles: ["ADMIN", "TECH"],
	children: /* @__PURE__ */ jsx(Inventory, {})
});
export { SplitComponent as component };
