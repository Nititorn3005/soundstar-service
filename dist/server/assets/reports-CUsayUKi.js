import { a as Field, d as Input, i as EmptyState, l as RoleGate, o as JobNo, s as PageHeader, u as StatusBadge } from "./shell-DV0Ef7pI.js";
import { n as useAppStore, o as Button } from "./store-HGwRtq6e.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CR3tRoMi.js";
import { i as TabsTrigger, r as TabsList, t as Tabs } from "./tabs-CRR8UEMr.js";
import { a as STATUS_ORDER, f as fmtDateTime, i as STATUS_LABEL, n as OPEN_STATUSES, s as TX_LABEL } from "./domain-BwIhFv2h.js";
import * as React from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Download, FileBarChart, Printer } from "lucide-react";
// src/routes/_app/reports.tsx?tsr-split=component
function downloadCsv(name, rows) {
	const csv = rows.map((r) => r.map((c) => `"${String(c).replace(/"/g, "\"\"")}"`).join(",")).join("\n");
	const url = URL.createObjectURL(new Blob(["﻿" + csv], { type: "text/csv;charset=utf-8" }));
	Object.assign(document.createElement("a"), {
		href: url,
		download: name
	}).click();
	URL.revokeObjectURL(url);
}
function Reports() {
	const { jobs, transactions, inventory, profiles, profileName } = useAppStore();
	const [kind, setKind] = React.useState("period");
	const [from, setFrom] = React.useState("");
	const [to, setTo] = React.useState("");
	const [status, setStatus] = React.useState("");
	const [tech, setTech] = React.useState("");
	const inRange = (iso) => {
		const d = iso.slice(0, 10);
		return (!from || d >= from) && (!to || d <= to);
	};
	const jobRows = jobs.filter((j) => inRange(j.receivedAt) && (!tech || j.technicianId === tech) && (kind === "open" ? OPEN_STATUSES.includes(j.status) : kind === "done" ? j.status === "COMPLETED" : !status || j.status === status));
	const txRows = transactions.filter((t) => inRange(t.at));
	function exportCsv() {
		if (kind === "stock") downloadCsv("stock-movements.csv", [[
			"วันเวลา",
			"ประเภท",
			"รหัส",
			"อะไหล่",
			"จำนวน",
			"คงเหลือ",
			"ผู้ทำรายการ"
		], ...txRows.map((t) => {
			const i = inventory.find((x) => x.id === t.partId);
			return [
				fmtDateTime(t.at),
				TX_LABEL[t.type],
				i?.code ?? "",
				i?.name ?? "",
				t.qty,
				t.balanceAfter,
				profileName(t.by)
			];
		})]);
		else downloadCsv(`repair-jobs-${kind}.csv`, [[
			"เลขที่ใบงาน",
			"วันที่รับ",
			"ลูกค้า",
			"โทร",
			"ยี่ห้อ",
			"รุ่น",
			"ช่าง",
			"สถานะ"
		], ...jobRows.map((j) => [
			j.jobNo,
			fmtDateTime(j.receivedAt),
			j.customerName,
			j.phone,
			j.brand,
			j.model,
			profileName(j.technicianId),
			STATUS_LABEL[j.status]
		])]);
	}
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			eyebrow: "Reports",
			title: "รายงาน",
			actions: /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsxs(Button, {
				variant: "outline",
				size: "lg",
				onClick: exportCsv,
				children: [/* @__PURE__ */ jsx(Download, {}), " ส่งออก CSV"]
			}), /* @__PURE__ */ jsxs(Button, {
				variant: "outline",
				size: "lg",
				onClick: () => window.print(),
				children: [/* @__PURE__ */ jsx(Printer, {}), " พิมพ์"]
			})] })
		}),
		/* @__PURE__ */ jsx(Tabs, {
			value: kind,
			onValueChange: (v) => setKind(v),
			className: "no-print mb-4",
			children: /* @__PURE__ */ jsxs(TabsList, {
				className: "h-auto flex-wrap",
				children: [
					/* @__PURE__ */ jsx(TabsTrigger, {
						value: "period",
						children: "งานซ่อมตามช่วงเวลา"
					}),
					/* @__PURE__ */ jsx(TabsTrigger, {
						value: "open",
						children: "งานค้าง"
					}),
					/* @__PURE__ */ jsx(TabsTrigger, {
						value: "done",
						children: "งานสำเร็จ"
					}),
					/* @__PURE__ */ jsx(TabsTrigger, {
						value: "stock",
						children: "การเคลื่อนไหวสต๊อก"
					})
				]
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "no-print mb-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4",
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: "ตั้งแต่วันที่",
					htmlFor: "r-from",
					children: /* @__PURE__ */ jsx(Input, {
						id: "r-from",
						type: "date",
						value: from,
						onChange: (e) => setFrom(e.target.value),
						className: "h-11 bg-card"
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "ถึงวันที่",
					htmlFor: "r-to",
					children: /* @__PURE__ */ jsx(Input, {
						id: "r-to",
						type: "date",
						value: to,
						onChange: (e) => setTo(e.target.value),
						className: "h-11 bg-card"
					})
				}),
				kind === "period" && /* @__PURE__ */ jsx(Field, {
					label: "สถานะ",
					htmlFor: "r-status",
					children: /* @__PURE__ */ jsxs("select", {
						id: "r-status",
						className: "native-select",
						value: status,
						onChange: (e) => setStatus(e.target.value),
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "ทุกสถานะ"
						}), STATUS_ORDER.map((s) => /* @__PURE__ */ jsx("option", {
							value: s,
							children: STATUS_LABEL[s]
						}, s))]
					})
				}),
				kind !== "stock" && /* @__PURE__ */ jsx(Field, {
					label: "ช่าง",
					htmlFor: "r-tech",
					children: /* @__PURE__ */ jsxs("select", {
						id: "r-tech",
						className: "native-select",
						value: tech,
						onChange: (e) => setTech(e.target.value),
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "ทุกคน"
						}), profiles.filter((p) => p.role === "TECH").map((p) => /* @__PURE__ */ jsx("option", {
							value: p.id,
							children: p.fullName
						}, p.id))]
					})
				})
			]
		}),
		/* @__PURE__ */ jsxs("p", {
			className: "mb-3 text-sm text-muted-foreground",
			children: [
				"พบ ",
				kind === "stock" ? txRows.length : jobRows.length,
				" รายการ"
			]
		}),
		(kind === "stock" ? txRows.length : jobRows.length) === 0 ? /* @__PURE__ */ jsx(EmptyState, {
			icon: FileBarChart,
			title: "ไม่มีข้อมูลในช่วงที่เลือก"
		}) : kind === "stock" ? /* @__PURE__ */ jsx("div", {
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
				/* @__PURE__ */ jsx(TableHead, { children: "ผู้ทำรายการ" })
			] }) }), /* @__PURE__ */ jsx(TableBody, { children: txRows.map((t) => /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableCell, {
					className: "text-xs",
					children: fmtDateTime(t.at)
				}),
				/* @__PURE__ */ jsx(TableCell, { children: TX_LABEL[t.type] }),
				/* @__PURE__ */ jsx(TableCell, { children: inventory.find((i) => i.id === t.partId)?.name }),
				/* @__PURE__ */ jsx(TableCell, {
					className: "text-right font-ticket",
					children: t.qty
				}),
				/* @__PURE__ */ jsx(TableCell, {
					className: "text-right font-ticket",
					children: t.balanceAfter
				}),
				/* @__PURE__ */ jsx(TableCell, { children: profileName(t.by) })
			] }, t.id)) })] })
		}) : /* @__PURE__ */ jsx("div", {
			className: "rounded-2xl border border-border bg-card",
			children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableHead, { children: "เลขที่ใบงาน" }),
				/* @__PURE__ */ jsx(TableHead, { children: "วันที่รับ" }),
				/* @__PURE__ */ jsx(TableHead, { children: "ลูกค้า" }),
				/* @__PURE__ */ jsx(TableHead, { children: "เครื่อง" }),
				/* @__PURE__ */ jsx(TableHead, { children: "ช่าง" }),
				/* @__PURE__ */ jsx(TableHead, { children: "สถานะ" })
			] }) }), /* @__PURE__ */ jsx(TableBody, { children: jobRows.map((j) => /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(JobNo, { children: j.jobNo }) }),
				/* @__PURE__ */ jsx(TableCell, {
					className: "text-xs",
					children: fmtDateTime(j.receivedAt)
				}),
				/* @__PURE__ */ jsx(TableCell, { children: j.customerName }),
				/* @__PURE__ */ jsxs(TableCell, { children: [
					j.brand,
					" ",
					j.model
				] }),
				/* @__PURE__ */ jsx(TableCell, { children: profileName(j.technicianId) }),
				/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusBadge, { status: j.status }) })
			] }, j.id)) })] })
		})
	] });
}
var SplitComponent = () => /* @__PURE__ */ jsx(RoleGate, {
	roles: ["ADMIN"],
	children: /* @__PURE__ */ jsx(Reports, {})
});
export { SplitComponent as component };
