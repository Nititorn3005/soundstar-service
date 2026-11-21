import { d as Input, i as EmptyState, o as JobNo, s as PageHeader, u as StatusBadge } from "./shell-DV0Ef7pI.js";
import { n as useAppStore, o as Button, s as cn } from "./store-HGwRtq6e.js";
import { a as TableHeader, i as TableHead, n as TableBody, o as TableRow, r as TableCell, t as Table } from "./table-CR3tRoMi.js";
import { a as STATUS_ORDER, c as URGENCY_LABEL, f as fmtDateTime, i as STATUS_LABEL, p as isOverdue } from "./domain-BwIhFv2h.js";
import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { ClipboardList, PlusCircle, Search, SearchX } from "lucide-react";
// src/routes/_app/jobs.index.tsx?tsr-split=component
function JobsList() {
	const { jobs: allJobs, currentUser, profileName } = useAppStore();
	const [q, setQ] = React.useState("");
	const [status, setStatus] = React.useState("");
	const isTech = currentUser?.role === "TECH";
	const jobs = isTech ? allJobs.filter((j) => j.technicianId === currentUser?.id) : allJobs;
	const needle = q.trim().toLowerCase();
	const rows = jobs.filter((j) => (!status || j.status === status) && (!needle || [
		j.jobNo,
		j.customerName,
		j.phone,
		j.brand,
		j.model
	].join(" ").toLowerCase().includes(needle)));
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			eyebrow: "Repair jobs",
			title: "รายการงานซ่อม",
			description: isTech ? "แสดงเฉพาะงานที่ได้รับมอบหมายให้คุณ" : `ทั้งหมด ${jobs.length} ใบงาน`,
			actions: !isTech && /* @__PURE__ */ jsx(Button, {
				asChild: true,
				size: "lg",
				children: /* @__PURE__ */ jsxs(Link, {
					to: "/jobs/new",
					children: [/* @__PURE__ */ jsx(PlusCircle, {}), " รับแจ้งงานซ่อม"]
				})
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mb-4 grid gap-3 sm:grid-cols-[1fr_14rem]",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "relative",
				children: [/* @__PURE__ */ jsx(Search, {
					className: "absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground",
					"aria-hidden": true
				}), /* @__PURE__ */ jsx(Input, {
					value: q,
					onChange: (e) => setQ(e.target.value),
					placeholder: "ค้นหาเลขที่ใบงาน ชื่อลูกค้า เบอร์โทร ยี่ห้อ รุ่น",
					"aria-label": "ค้นหางานซ่อม",
					className: "h-11 bg-card pl-9"
				})]
			}), /* @__PURE__ */ jsxs("select", {
				"aria-label": "กรองสถานะ",
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
			})]
		}),
		jobs.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
			icon: ClipboardList,
			title: "ยังไม่มีใบงาน",
			description: "เมื่อมีการรับแจ้งงานซ่อม ใบงานจะแสดงที่นี่"
		}) : rows.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
			icon: SearchX,
			title: "ไม่พบใบงานที่ตรงกับการค้นหา",
			action: /* @__PURE__ */ jsx(Button, {
				variant: "outline",
				onClick: () => {
					setQ("");
					setStatus("");
				},
				children: "ล้างตัวกรอง"
			})
		}) : /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx("ul", {
			className: "grid gap-3 md:hidden",
			children: rows.map((j) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, {
				to: "/jobs/$jobId",
				params: { jobId: j.id },
				className: "block rounded-2xl border border-border bg-card p-4 active:scale-[0.99] transition-transform",
				children: [
					/* @__PURE__ */ jsxs("div", {
						className: "flex items-center justify-between gap-2",
						children: [/* @__PURE__ */ jsx(JobNo, { children: j.jobNo }), /* @__PURE__ */ jsx(StatusBadge, { status: j.status })]
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-2 font-medium",
						children: j.customerName
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "text-sm text-muted-foreground",
						children: [
							j.brand,
							" ",
							j.model,
							" · ",
							j.symptom
						]
					}),
					/* @__PURE__ */ jsxs("div", {
						className: "mt-3 flex justify-between border-t border-dashed border-border pt-2 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ jsxs("span", { children: ["ช่าง: ", j.technicianId ? profileName(j.technicianId) : "ยังไม่มอบหมาย"] }), /* @__PURE__ */ jsxs("span", {
							className: cn(isOverdue(j) && "font-medium text-destructive"),
							children: ["นัด ", fmtDateTime(j.appointmentAt)]
						})]
					})
				]
			}) }, j.id))
		}), /* @__PURE__ */ jsx("div", {
			className: "hidden rounded-2xl border border-border bg-card md:block",
			children: /* @__PURE__ */ jsxs(Table, { children: [/* @__PURE__ */ jsx(TableHeader, { children: /* @__PURE__ */ jsxs(TableRow, { children: [
				/* @__PURE__ */ jsx(TableHead, { children: "เลขที่ใบงาน" }),
				/* @__PURE__ */ jsx(TableHead, { children: "ลูกค้า" }),
				/* @__PURE__ */ jsx(TableHead, { children: "เครื่อง / อาการ" }),
				/* @__PURE__ */ jsx(TableHead, { children: "ช่าง" }),
				/* @__PURE__ */ jsx(TableHead, { children: "นัดหมาย" }),
				/* @__PURE__ */ jsx(TableHead, { children: "ความเร่งด่วน" }),
				/* @__PURE__ */ jsx(TableHead, { children: "สถานะ" })
			] }) }), /* @__PURE__ */ jsx(TableBody, { children: rows.map((j) => /* @__PURE__ */ jsxs(TableRow, {
				className: "group",
				children: [
					/* @__PURE__ */ jsxs(TableCell, { children: [/* @__PURE__ */ jsx(Link, {
						to: "/jobs/$jobId",
						params: { jobId: j.id },
						className: "hover:underline",
						children: /* @__PURE__ */ jsx(JobNo, { children: j.jobNo })
					}), /* @__PURE__ */ jsx("p", {
						className: "text-[11px] text-muted-foreground",
						children: fmtDateTime(j.receivedAt)
					})] }),
					/* @__PURE__ */ jsxs(TableCell, { children: [/* @__PURE__ */ jsx("p", {
						className: "font-medium",
						children: j.customerName
					}), /* @__PURE__ */ jsx("p", {
						className: "font-ticket text-xs text-muted-foreground",
						children: j.phone
					})] }),
					/* @__PURE__ */ jsxs(TableCell, {
						className: "max-w-64",
						children: [/* @__PURE__ */ jsxs("p", { children: [
							j.brand,
							" ",
							j.model
						] }), /* @__PURE__ */ jsx("p", {
							className: "truncate text-xs text-muted-foreground",
							children: j.symptom
						})]
					}),
					/* @__PURE__ */ jsx(TableCell, {
						className: cn(!j.technicianId && "text-muted-foreground"),
						children: j.technicianId ? profileName(j.technicianId) : "—"
					}),
					/* @__PURE__ */ jsx(TableCell, {
						className: cn(isOverdue(j) && "font-medium text-destructive"),
						children: fmtDateTime(j.appointmentAt)
					}),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx("span", {
						className: cn("text-xs", (j.urgency === "URGENT" || j.urgency === "HIGH") && "font-semibold text-destructive"),
						children: URGENCY_LABEL[j.urgency]
					}) }),
					/* @__PURE__ */ jsx(TableCell, { children: /* @__PURE__ */ jsx(StatusBadge, { status: j.status }) })
				]
			}, j.id)) })] })
		})] })
	] });
}
export { JobsList as component };
