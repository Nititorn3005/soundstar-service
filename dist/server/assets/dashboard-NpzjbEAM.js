import { c as Panel, i as EmptyState, o as JobNo, s as PageHeader, u as StatusBadge } from "./shell-DV0Ef7pI.js";
import { n as useAppStore, o as Button, s as cn } from "./store-HGwRtq6e.js";
import { f as fmtDateTime, n as OPEN_STATUSES, p as isOverdue } from "./domain-BwIhFv2h.js";
import { Link } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { AlertTriangle, CalendarClock, CheckCircle2, ClipboardList, Hammer, PackageX, PlusCircle, Sparkles, UserX, Wrench } from "lucide-react";
// src/routes/_app/dashboard.tsx?tsr-split=component
function sameDay(a, b) {
	return a.toDateString() === b.toDateString();
}
function Dashboard() {
	const { jobs: allJobs, inventory, profiles, currentUser } = useAppStore();
	const isTech = currentUser?.role === "TECH";
	const jobs = isTech ? allJobs.filter((j) => j.technicianId === currentUser?.id) : allJobs;
	const now = /* @__PURE__ */ new Date();
	const lowStock = inventory.filter((i) => i.onHand < i.minQty || i.onHand === 0);
	const kpis = [
		{
			label: "งานทั้งหมด",
			value: jobs.length,
			icon: ClipboardList
		},
		{
			label: "งานใหม่วันนี้",
			value: jobs.filter((j) => sameDay(new Date(j.receivedAt), now)).length,
			icon: Sparkles
		},
		{
			label: "ยังไม่มอบหมาย",
			value: jobs.filter((j) => !j.technicianId && OPEN_STATUSES.includes(j.status)).length,
			icon: UserX,
			tone: "warn"
		},
		{
			label: "กำลังดำเนินการ",
			value: jobs.filter((j) => j.status === "IN_PROGRESS").length,
			icon: Hammer
		},
		{
			label: "รออะไหล่",
			value: jobs.filter((j) => j.status === "WAITING_PARTS").length,
			icon: PackageX,
			tone: "warn"
		},
		{
			label: "เกินกำหนดนัด",
			value: jobs.filter((j) => isOverdue(j, now)).length,
			icon: CalendarClock,
			tone: "danger"
		},
		{
			label: "ซ่อมสำเร็จ",
			value: jobs.filter((j) => j.status === "COMPLETED").length,
			icon: CheckCircle2,
			tone: "ok"
		},
		{
			label: "อะไหล่ต่ำกว่าขั้นต่ำ",
			value: lowStock.length,
			icon: AlertTriangle,
			tone: "danger"
		}
	];
	const workload = profiles.filter((p) => p.role === "TECH" && p.active).map((t) => ({
		tech: t,
		open: allJobs.filter((j) => j.technicianId === t.id && OPEN_STATUSES.includes(j.status)).length,
		done: allJobs.filter((j) => j.technicianId === t.id && j.status === "COMPLETED").length
	}));
	const maxLoad = Math.max(1, ...workload.map((w) => w.open + w.done));
	const queue = jobs.filter((j) => OPEN_STATUSES.includes(j.status)).slice(0, 6);
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsx(PageHeader, {
			eyebrow: new Intl.DateTimeFormat("th-TH", {
				dateStyle: "full",
				timeZone: "Asia/Bangkok"
			}).format(now),
			title: `สวัสดี ${currentUser?.fullName.split(" ")[0] ?? ""}`,
			description: isTech ? "ภาพรวมงานที่ได้รับมอบหมายให้คุณ" : "ภาพรวมงานซ่อมและสต๊อกอะไหล่วันนี้",
			actions: !isTech && /* @__PURE__ */ jsx(Button, {
				asChild: true,
				size: "lg",
				children: /* @__PURE__ */ jsxs(Link, {
					to: "/jobs/new",
					children: [/* @__PURE__ */ jsx(PlusCircle, {}), " รับแจ้งงานใหม่"]
				})
			})
		}),
		/* @__PURE__ */ jsx("div", {
			className: "grid grid-cols-2 gap-3 md:grid-cols-4",
			children: kpis.map((k, i) => /* @__PURE__ */ jsxs("div", {
				style: { animationDelay: `${i * 50}ms` },
				className: cn("relative overflow-hidden rounded-2xl border border-border bg-card p-4 animate-in fade-in slide-in-from-bottom-2 fill-mode-both duration-500 motion-reduce:animate-none", k.tone === "danger" && k.value > 0 && "border-destructive/40", k.tone === "warn" && k.value > 0 && "border-warn/60"),
				children: [
					/* @__PURE__ */ jsx(k.icon, {
						"aria-hidden": true,
						className: cn("size-5 text-muted-foreground", k.tone === "danger" && k.value > 0 && "text-destructive", k.tone === "warn" && k.value > 0 && "text-warn", k.tone === "ok" && "text-ok")
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-3 font-display text-3xl font-bold tabular-nums",
						children: k.value
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-xs text-muted-foreground sm:text-sm",
						children: k.label
					})
				]
			}, k.label))
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "mt-6 grid gap-6 lg:grid-cols-[1.6fr_1fr]",
			children: [/* @__PURE__ */ jsx(Panel, {
				title: "คิวงานที่ยังเปิดอยู่",
				action: /* @__PURE__ */ jsx(Link, {
					to: "/jobs",
					className: "text-sm text-primary hover:underline",
					children: "ดูทั้งหมด"
				}),
				children: queue.length === 0 ? /* @__PURE__ */ jsx(EmptyState, {
					icon: Wrench,
					title: "ไม่มีงานค้าง",
					description: "งานทั้งหมดดำเนินการเสร็จแล้ว"
				}) : /* @__PURE__ */ jsx("ul", {
					className: "divide-y divide-border",
					children: queue.map((j) => /* @__PURE__ */ jsx("li", { children: /* @__PURE__ */ jsxs(Link, {
						to: "/jobs/$jobId",
						params: { jobId: j.id },
						className: "flex flex-col gap-1 py-3 transition-colors hover:bg-muted/50 sm:flex-row sm:items-center sm:gap-4 sm:px-2",
						children: [
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center gap-2 sm:w-36",
								children: [/* @__PURE__ */ jsx(JobNo, { children: j.jobNo }), isOverdue(j, now) && /* @__PURE__ */ jsx("span", {
									className: "rounded bg-destructive/10 px-1.5 text-[10px] font-medium text-destructive",
									children: "เกินนัด"
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "min-w-0 flex-1",
								children: [/* @__PURE__ */ jsx("p", {
									className: "truncate text-sm font-medium",
									children: j.customerName
								}), /* @__PURE__ */ jsxs("p", {
									className: "truncate text-xs text-muted-foreground",
									children: [
										j.brand,
										" ",
										j.model,
										" · ",
										j.symptom
									]
								})]
							}),
							/* @__PURE__ */ jsxs("div", {
								className: "flex items-center justify-between gap-3 sm:justify-end",
								children: [/* @__PURE__ */ jsx("span", {
									className: "text-xs text-muted-foreground",
									children: fmtDateTime(j.appointmentAt)
								}), /* @__PURE__ */ jsx(StatusBadge, { status: j.status })]
							})
						]
					}) }, j.id))
				})
			}), /* @__PURE__ */ jsxs("div", {
				className: "grid gap-6",
				children: [/* @__PURE__ */ jsx(Panel, {
					title: "อะไหล่ใกล้หมด",
					action: /* @__PURE__ */ jsx(Link, {
						to: "/inventory",
						className: "text-sm text-primary hover:underline",
						children: "สต๊อก"
					}),
					children: lowStock.length === 0 ? /* @__PURE__ */ jsx("p", {
						className: "text-sm text-muted-foreground",
						children: "ยอดอะไหล่ทุกรายการอยู่เหนือขั้นต่ำ"
					}) : /* @__PURE__ */ jsx("ul", {
						className: "grid gap-3",
						children: lowStock.map((i) => /* @__PURE__ */ jsxs("li", {
							className: "flex items-center justify-between gap-3 text-sm",
							children: [/* @__PURE__ */ jsxs("div", {
								className: "min-w-0",
								children: [/* @__PURE__ */ jsx("p", {
									className: "truncate font-medium",
									children: i.name
								}), /* @__PURE__ */ jsx("p", {
									className: "font-ticket text-[11px] text-muted-foreground",
									children: i.code
								})]
							}), /* @__PURE__ */ jsxs("span", {
								className: cn("shrink-0 rounded-md px-2 py-0.5 font-ticket text-xs", i.onHand === 0 ? "bg-destructive text-white" : "bg-warn/25"),
								children: [
									i.onHand,
									"/",
									i.minQty,
									" ",
									i.unit
								]
							})]
						}, i.id))
					})
				}), !isTech && /* @__PURE__ */ jsxs(Panel, {
					title: "งานของช่างแต่ละคน",
					children: [/* @__PURE__ */ jsx("ul", {
						className: "grid gap-4",
						children: workload.map((w) => /* @__PURE__ */ jsxs("li", { children: [/* @__PURE__ */ jsxs("div", {
							className: "mb-1.5 flex justify-between text-sm",
							children: [/* @__PURE__ */ jsx("span", {
								className: "font-medium",
								children: w.tech.fullName
							}), /* @__PURE__ */ jsxs("span", {
								className: "text-xs text-muted-foreground",
								children: [
									"ค้าง ",
									w.open,
									" · เสร็จ ",
									w.done
								]
							})]
						}), /* @__PURE__ */ jsxs("div", {
							className: "flex h-2.5 overflow-hidden rounded-full bg-muted",
							children: [/* @__PURE__ */ jsx("div", {
								className: "bg-highlight",
								style: { width: `${w.open / maxLoad * 100}%` }
							}), /* @__PURE__ */ jsx("div", {
								className: "bg-ok",
								style: { width: `${w.done / maxLoad * 100}%` }
							})]
						})] }, w.tech.id))
					}), /* @__PURE__ */ jsxs("div", {
						className: "mt-4 flex gap-4 text-xs text-muted-foreground",
						children: [/* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ jsx("i", { className: "size-2.5 rounded-full bg-highlight" }), "งานค้าง"]
						}), /* @__PURE__ */ jsxs("span", {
							className: "flex items-center gap-1.5",
							children: [/* @__PURE__ */ jsx("i", { className: "size-2.5 rounded-full bg-ok" }), "ซ่อมสำเร็จ"]
						})]
					})]
				})]
			})]
		})
	] });
}
export { Dashboard as component };
