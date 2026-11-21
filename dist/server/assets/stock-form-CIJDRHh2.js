import { a as Field, c as Panel, d as Input, o as JobNo } from "./shell-DV0Ef7pI.js";
import { n as useAppStore, o as Button, s as cn } from "./store-HGwRtq6e.js";
import { t as Textarea } from "./textarea-BSikAOlL.js";
import { f as fmtDateTime, n as OPEN_STATUSES, s as TX_LABEL } from "./domain-BwIhFv2h.js";
import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";
// src/components/app/stock-form.tsx
var COPY = {
	IN: {
		submit: "บันทึกรับเข้า",
		qtyLabel: "จำนวนที่รับเข้า"
	},
	OUT: {
		submit: "ยืนยันการเบิก",
		qtyLabel: "จำนวนที่เบิก"
	},
	ADJUST: {
		submit: "บันทึกการปรับยอด",
		qtyLabel: "จำนวนที่ปรับ (+/−)",
		qtyHint: "ใส่ค่าลบเพื่อลดยอด เช่น -2"
	}
};
function StockMoveForm({ mode }) {
	const { inventory, jobs, currentUser, moveStock, transactions } = useAppStore();
	const [partId, setPartId] = React.useState("");
	const [pending, setPending] = React.useState(false);
	const formRef = React.useRef(null);
	const item = inventory.find((i) => i.id === partId);
	const isTech = currentUser?.role === "TECH";
	const openJobs = jobs.filter((j) => OPEN_STATUSES.includes(j.status) && (!isTech || j.technicianId === currentUser?.id));
	const recent = transactions.filter((t) => t.type === mode).slice(0, 5);
	async function onSubmit(e) {
		e.preventDefault();
		if (pending) return;
		const f = new FormData(e.currentTarget);
		const v = (k) => String(f.get(k) ?? "").trim();
		setPending(true);
		const res = await moveStock({
			partId,
			type: mode,
			qty: Number(v("qty")),
			jobId: v("jobId") || void 0,
			reference: v("reference") || void 0,
			reason: v("reason") || void 0
		});
		setPending(false);
		if (!res.ok) return toast.error(res.error);
		toast.success(`${TX_LABEL[mode]} ${item?.name} เรียบร้อย · คงเหลือ ${res.value.balanceAfter} ${item?.unit}`);
		formRef.current?.reset();
		setPartId("");
	}
	return /* @__PURE__ */ jsxs("div", {
		className: "grid gap-6 lg:grid-cols-[1fr_22rem]",
		children: [/* @__PURE__ */ jsx(Panel, { children: /* @__PURE__ */ jsxs("form", {
			ref: formRef,
			onSubmit,
			className: "grid gap-4 sm:grid-cols-2",
			noValidate: true,
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: "อะไหล่",
					htmlFor: "partId",
					required: true,
					className: "sm:col-span-2",
					children: /* @__PURE__ */ jsxs("select", {
						id: "partId",
						className: "native-select",
						value: partId,
						onChange: (e) => setPartId(e.target.value),
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "— เลือกอะไหล่ —"
						}), inventory.map((i) => /* @__PURE__ */ jsxs("option", {
							value: i.id,
							disabled: mode === "OUT" && i.onHand === 0,
							children: [
								i.code,
								" · ",
								i.name,
								" (คงเหลือ ",
								i.onHand,
								" ",
								i.unit,
								")"
							]
						}, i.id))]
					})
				}),
				item && /* @__PURE__ */ jsxs("div", {
					className: "grid grid-cols-3 gap-2 rounded-xl bg-secondary/60 p-3 text-center text-xs sm:col-span-2",
					children: [
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-muted-foreground",
							children: "คงเหลือ"
						}), /* @__PURE__ */ jsx("p", {
							className: "font-ticket text-lg font-bold",
							children: item.onHand
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-muted-foreground",
							children: "ขั้นต่ำ"
						}), /* @__PURE__ */ jsx("p", {
							className: "font-ticket text-lg",
							children: item.minQty
						})] }),
						/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
							className: "text-muted-foreground",
							children: "ตำแหน่ง"
						}), /* @__PURE__ */ jsx("p", {
							className: "text-sm font-medium",
							children: item.location
						})] })
					]
				}),
				/* @__PURE__ */ jsx(Field, {
					label: COPY[mode].qtyLabel,
					htmlFor: "qty",
					required: true,
					hint: COPY[mode].qtyHint ?? (item ? `หน่วย: ${item.unit}` : void 0),
					children: /* @__PURE__ */ jsx(Input, {
						id: "qty",
						name: "qty",
						type: "number",
						inputMode: "numeric",
						min: mode === "ADJUST" ? void 0 : 1,
						max: mode === "OUT" ? item?.onHand : void 0,
						defaultValue: mode === "ADJUST" ? "" : 1,
						className: "h-11 font-ticket"
					})
				}),
				mode === "IN" && /* @__PURE__ */ jsx(Field, {
					label: "เลขที่เอกสาร / ใบสั่งซื้อ",
					htmlFor: "reference",
					children: /* @__PURE__ */ jsx(Input, {
						id: "reference",
						name: "reference",
						className: "h-11 font-ticket",
						placeholder: "PO-xxxx"
					})
				}),
				mode === "OUT" && /* @__PURE__ */ jsx(Field, {
					label: "ใบงานซ่อม",
					htmlFor: "jobId",
					required: isTech,
					hint: isTech ? "ช่างต้องผูกการเบิกกับใบงานเสมอ" : "ไม่บังคับสำหรับผู้ดูแลระบบ",
					children: /* @__PURE__ */ jsxs("select", {
						id: "jobId",
						name: "jobId",
						className: "native-select",
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "— ไม่ผูกใบงาน —"
						}), openJobs.map((j) => /* @__PURE__ */ jsxs("option", {
							value: j.id,
							children: [
								j.jobNo,
								" · ",
								j.customerName
							]
						}, j.id))]
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: mode === "ADJUST" ? "เหตุผลการปรับยอด" : "หมายเหตุ",
					htmlFor: "reason",
					required: mode === "ADJUST",
					className: "sm:col-span-2",
					children: /* @__PURE__ */ jsx(Textarea, {
						id: "reason",
						name: "reason",
						rows: 2
					})
				}),
				/* @__PURE__ */ jsxs(Button, {
					type: "submit",
					size: "lg",
					className: "h-12 sm:col-span-2",
					disabled: !partId || pending,
					children: [pending && /* @__PURE__ */ jsx(Loader2, { className: "animate-spin" }), COPY[mode].submit]
				})
			]
		}) }), /* @__PURE__ */ jsx(Panel, {
			title: `${TX_LABEL[mode]}ล่าสุด`,
			action: /* @__PURE__ */ jsx(Link, {
				to: "/inventory/history",
				className: "text-sm text-primary hover:underline",
				children: "ทั้งหมด"
			}),
			children: /* @__PURE__ */ jsx(RecentTx, { rows: recent })
		})]
	});
}
function RecentTx({ rows }) {
	const { inventory, jobs, profileName } = useAppStore();
	if (rows.length === 0) return /* @__PURE__ */ jsx("p", {
		className: "text-sm text-muted-foreground",
		children: "ยังไม่มีรายการ"
	});
	return /* @__PURE__ */ jsx("ul", {
		className: "grid gap-3 text-sm",
		children: rows.map((t) => {
			const item = inventory.find((i) => i.id === t.partId);
			const job = jobs.find((j) => j.id === t.jobId);
			return /* @__PURE__ */ jsxs("li", {
				className: "flex items-start justify-between gap-3",
				children: [/* @__PURE__ */ jsxs("div", {
					className: "min-w-0",
					children: [/* @__PURE__ */ jsx("p", {
						className: "truncate font-medium",
						children: item?.name
					}), /* @__PURE__ */ jsxs("p", {
						className: "text-xs text-muted-foreground",
						children: [
							fmtDateTime(t.at),
							" · ",
							profileName(t.by),
							job && /* @__PURE__ */ jsxs(Fragment, { children: [" · ", /* @__PURE__ */ jsx(JobNo, { children: job.jobNo })] })
						]
					})]
				}), /* @__PURE__ */ jsxs("span", {
					className: cn("shrink-0 font-ticket", t.qty > 0 ? "text-ok" : "text-destructive"),
					children: [t.qty > 0 ? "+" : "", t.qty]
				})]
			}, t.id);
		})
	});
}
export { StockMoveForm as t };
