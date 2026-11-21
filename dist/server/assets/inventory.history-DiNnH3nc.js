import { _ as DialogTitle, a as Field, d as Input, f as Dialog, g as DialogHeader, h as DialogFooter, i as EmptyState, l as RoleGate, m as DialogDescription, o as JobNo, p as DialogContent, s as PageHeader } from "./shell-DV0Ef7pI.js";
import { n as useAppStore, o as Button, s as cn } from "./store-HGwRtq6e.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CR3tRoMi.js";
import { t as Textarea } from "./textarea-BSikAOlL.js";
import { f as fmtDateTime, s as TX_LABEL } from "./domain-BwIhFv2h.js";
import * as React from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { History, Undo2 } from "lucide-react";
import { toast } from "sonner";
// src/routes/_app/inventory.history.tsx?tsr-split=component
var TYPE_TONE = {
	IN: "bg-ok/15",
	OUT: "bg-highlight/15",
	ADJUST: "bg-warn/25",
	REVERSAL: "bg-muted text-muted-foreground"
};
function StockHistory() {
	const { transactions, inventory, profiles, jobs, profileName, currentUser } = useAppStore();
	const isAdmin = currentUser?.role === "ADMIN";
	const [from, setFrom] = React.useState("");
	const [to, setTo] = React.useState("");
	const [part, setPart] = React.useState("");
	const [by, setBy] = React.useState("");
	const [reversing, setReversing] = React.useState(null);
	const rows = (currentUser?.role === "TECH" ? transactions.filter((t) => t.by === currentUser.id) : transactions).filter((t) => {
		const d = t.at.slice(0, 10);
		return (!from || d >= from) && (!to || d <= to) && (!part || t.partId === part) && (!by || t.by === by);
	});
	const reversed = new Set(transactions.map((t) => t.reversesId).filter(Boolean));
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			eyebrow: "Stock ledger",
			title: "ประวัติสต๊อก",
			description: "ทุกการเคลื่อนไหวถูกบันทึกถาวร การยกเลิกจะสร้างรายการย้อนกลับแทนการลบ"
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: "ตั้งแต่วันที่",
					htmlFor: "h-from",
					children: /* @__PURE__ */ jsx(Input, {
						id: "h-from",
						type: "date",
						value: from,
						onChange: (e) => setFrom(e.target.value),
						className: "h-11 bg-card"
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "ถึงวันที่",
					htmlFor: "h-to",
					children: /* @__PURE__ */ jsx(Input, {
						id: "h-to",
						type: "date",
						value: to,
						onChange: (e) => setTo(e.target.value),
						className: "h-11 bg-card"
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "อะไหล่",
					htmlFor: "h-part",
					children: /* @__PURE__ */ jsxs("select", {
						id: "h-part",
						className: "native-select",
						value: part,
						onChange: (e) => setPart(e.target.value),
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "ทั้งหมด"
						}), inventory.map((i) => /* @__PURE__ */ jsxs("option", {
							value: i.id,
							children: [
								i.code,
								" · ",
								i.name
							]
						}, i.id))]
					})
				}),
				isAdmin && /* @__PURE__ */ jsx(Field, {
					label: "ผู้ทำรายการ",
					htmlFor: "h-by",
					children: /* @__PURE__ */ jsxs("select", {
						id: "h-by",
						className: "native-select",
						value: by,
						onChange: (e) => setBy(e.target.value),
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "ทั้งหมด"
						}), profiles.map((p) => /* @__PURE__ */ jsx("option", {
							value: p.id,
							children: p.fullName
						}, p.id))]
					})
				})
			]
		}),
		rows.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
			icon: History,
			title: "ไม่พบรายการเคลื่อนไหว",
			description: "ลองเปลี่ยนช่วงวันที่หรือตัวกรอง"
		}) : /* @__PURE__ */ jsx("div", {
			className: "rounded-2xl border border-border bg-card",
			children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableHead, { children: "วันเวลา" }),
				/* @__PURE__ */ jsx(TableHead, { children: "ประเภท" }),
				/* @__PURE__ */ jsx(TableHead, { children: "อะไหล่" }),
				/* @__PURE__ */ jsx(TableHead, {
					className: "text-right",
					children: "จำนวน"
				}),
				/* @__PURE__ */ jsx(TableHead, {
					className: "text-right",
					children: "คงเหลือ"
				}),
				/* @__PURE__ */ jsx(TableHead, {
					className: "hidden md:table-cell",
					children: "อ้างอิง"
				}),
				/* @__PURE__ */ jsx(TableHead, {
					className: "hidden sm:table-cell",
					children: "ผู้ทำรายการ"
				}),
				isAdmin && /* @__PURE__ */ jsx(TableHead, {
					className: "w-10",
					children: /* @__PURE__ */ jsx("span", {
						className: "sr-only",
						children: "ย้อนรายการ"
					})
				})
			] }) }), /* @__PURE__ */ jsx(TableBody, { children: rows.map((t) => {
				const item = inventory.find((i) => i.id === t.partId);
				const job = jobs.find((j) => j.id === t.jobId);
				const isReversed = reversed.has(t.id);
				return /* @__PURE__ */ jsxs(TableRow, {
					className: cn(isReversed && "opacity-60"),
					children: [
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-xs",
							children: fmtDateTime(t.at)
						}),
						/* @__PURE__ */ jsxs(TableCell, { children: [/* @__PURE__ */ jsx("span", {
							className: cn("rounded-md px-2 py-0.5 text-xs", TYPE_TONE[t.type]),
							children: TX_LABEL[t.type]
						}), isReversed && /* @__PURE__ */ jsx("p", {
							className: "mt-1 text-[10px] text-muted-foreground",
							children: "ถูกย้อนแล้ว"
						})] }),
						/* @__PURE__ */ jsxs(TableCell, {
							className: "max-w-44 whitespace-normal",
							children: [/* @__PURE__ */ jsx("p", {
								className: "font-ticket text-[11px] text-primary",
								children: item?.code
							}), /* @__PURE__ */ jsx("p", {
								className: "text-sm",
								children: item?.name
							})]
						}),
						/* @__PURE__ */ jsxs(TableCell, {
							className: cn("text-right font-ticket", t.qty > 0 ? "text-ok" : "text-destructive"),
							children: [t.qty > 0 ? "+" : "", t.qty]
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "text-right font-ticket",
							children: t.balanceAfter
						}),
						/* @__PURE__ */ jsxs(TableCell, {
							className: "hidden max-w-48 whitespace-normal text-xs md:table-cell",
							children: [
								job && /* @__PURE__ */ jsx(JobNo, { children: job.jobNo }),
								" ",
								t.reference,
								" ",
								t.reason
							]
						}),
						/* @__PURE__ */ jsx(TableCell, {
							className: "hidden text-xs sm:table-cell",
							children: profileName(t.by)
						}),
						isAdmin && /* @__PURE__ */ jsx(TableCell, { children: t.type !== "REVERSAL" && !isReversed && /* @__PURE__ */ jsx(Button, {
							variant: "ghost",
							size: "icon",
							"aria-label": "ย้อนรายการ",
							onClick: () => setReversing(t),
							children: /* @__PURE__ */ jsx(Undo2, {})
						}) })
					]
				}, t.id);
			}) })] })
		}),
		/* @__PURE__ */ jsx(ReverseDialog, {
			tx: reversing,
			onClose: () => setReversing(null)
		})
	] });
}
function ReverseDialog({ tx, onClose }) {
	const { reverseTx } = useAppStore();
	return /* @__PURE__ */ jsx(Dialog, {
		open: !!tx,
		onOpenChange: (o) => !o && onClose(),
		children: /* @__PURE__ */ jsxs(DialogContent, { children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "ย้อนรายการสต๊อก" }), /* @__PURE__ */ jsxs(DialogDescription, { children: [
			"ระบบจะสร้างรายการย้อนกลับจำนวน ",
			tx ? -tx.qty : 0,
			" หน่วย รายการเดิมยังคงอยู่ในประวัติ"
		] })] }), /* @__PURE__ */ jsxs("form", {
			className: "grid gap-4",
			onSubmit: async (e) => {
				e.preventDefault();
				const reason = String(new FormData(e.currentTarget).get("reason") ?? "").trim();
				if (!reason) return toast.error("กรุณาระบุเหตุผล");
				const res = await reverseTx(tx.id, reason);
				if (!res.ok) return toast.error(res.error);
				toast.success("สร้างรายการย้อนกลับแล้ว");
				onClose();
			},
			children: [/* @__PURE__ */ jsx(Field, {
				label: "เหตุผล",
				htmlFor: "rev-reason",
				required: true,
				children: /* @__PURE__ */ jsx(Textarea, {
					id: "rev-reason",
					name: "reason",
					rows: 2
				})
			}), /* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
				type: "submit",
				variant: "destructive",
				size: "lg",
				children: "ยืนยันการย้อนรายการ"
			}) })]
		})] })
	});
}
var SplitComponent = () => /* @__PURE__ */ jsx(RoleGate, {
	roles: ["ADMIN", "TECH"],
	children: /* @__PURE__ */ jsx(StockHistory, {})
});
export { SplitComponent as component };
