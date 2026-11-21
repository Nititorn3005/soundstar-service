import { _ as DialogTitle, a as Field, c as Panel, d as Input, f as Dialog, g as DialogHeader, h as DialogFooter, i as EmptyState, m as DialogDescription, o as JobNo, p as DialogContent, u as StatusBadge } from "./shell-DV0Ef7pI.js";
import { n as useAppStore, o as Button, s as cn } from "./store-HGwRtq6e.js";
import { t as Textarea } from "./textarea-BSikAOlL.js";
import { c as URGENCY_LABEL, f as fmtDateTime, i as STATUS_LABEL, l as allowedNextStatuses, p as isOverdue } from "./domain-BwIhFv2h.js";
import { n as Route } from "./router-xQJsEqrJ.js";
import * as React from "react";
import { Link } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { ArrowLeft, ArrowRightLeft, Camera, FileSearch, PackageMinus, Printer, Save } from "lucide-react";
import { toast } from "sonner";
// src/routes/_app/jobs.$jobId.tsx?tsr-split=component
function JobDetail() {
	const { jobId } = Route.useParams();
	const { jobs, currentUser } = useAppStore();
	const job = jobs.find((j) => j.id === jobId);
	const canSee = job && (currentUser?.role !== "TECH" || job.technicianId === currentUser.id);
	if (!job || !canSee) return /* @__PURE__ */ jsx(EmptyState, {
		icon: FileSearch,
		title: "ไม่พบใบงาน",
		description: "ใบงานนี้อาจไม่มีอยู่ หรือคุณไม่มีสิทธิ์เข้าถึง",
		action: /* @__PURE__ */ jsx(Button, {
			asChild: true,
			variant: "outline",
			children: /* @__PURE__ */ jsx(Link, {
				to: "/jobs",
				children: "กลับรายการงานซ่อม"
			})
		})
	});
	return /* @__PURE__ */ jsx(JobView, { job });
}
function JobView({ job }) {
	const { currentUser, profileName, inventory, company } = useAppStore();
	const role = currentUser.role;
	const [statusOpen, setStatusOpen] = React.useState(false);
	const [partOpen, setPartOpen] = React.useState(false);
	const next = allowedNextStatuses(job.status, role);
	const canWork = role === "ADMIN" || role === "TECH" && job.technicianId === currentUser.id;
	const closed = job.status === "COMPLETED" || job.status === "CANCELLED";
	return /* @__PURE__ */ jsxs(Fragment, { children: [
		/* @__PURE__ */ jsxs("div", {
			className: "hidden border-b-2 border-foreground pb-3 print:block",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "text-lg font-bold",
					children: company.nameTh
				}),
				/* @__PURE__ */ jsxs("p", {
					className: "text-xs",
					children: [
						company.nameEn,
						" · ",
						company.address,
						" · โทร ",
						company.phones
					]
				}),
				/* @__PURE__ */ jsx("p", {
					className: "mt-2 text-base font-bold",
					children: "ใบงานซ่อม / Service Job Sheet"
				})
			]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "no-print mb-4",
			children: /* @__PURE__ */ jsxs(Link, {
				to: "/jobs",
				className: "inline-flex min-h-11 items-center gap-1.5 text-sm text-muted-foreground hover:text-foreground",
				children: [/* @__PURE__ */ jsx(ArrowLeft, { className: "size-4" }), " รายการงานซ่อม"]
			})
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "ticket-edge relative mb-6 overflow-hidden rounded-2xl bg-sidebar p-5 text-sidebar-accent-foreground sm:p-6 print:bg-transparent print:p-0 print:text-foreground",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between",
				children: [/* @__PURE__ */ jsxs("div", { children: [
					/* @__PURE__ */ jsx("p", {
						className: "font-ticket text-2xl font-bold tracking-wide text-sidebar-primary print:text-foreground",
						children: job.jobNo
					}),
					/* @__PURE__ */ jsx("h1", {
						className: "mt-1 font-display text-2xl font-bold",
						children: job.customerName
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "text-sm text-sidebar-foreground/80 print:text-foreground",
						children: [
							"รับแจ้ง ",
							fmtDateTime(job.receivedAt),
							" · โดย ",
							profileName(job.receivedBy)
						]
					})
				] }), /* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap items-center gap-2",
					children: [/* @__PURE__ */ jsx(StatusBadge, {
						status: job.status,
						className: "px-3 py-1 text-sm"
					}), /* @__PURE__ */ jsx("span", {
						className: cn("rounded-full px-3 py-1 text-sm", job.urgency === "URGENT" || job.urgency === "HIGH" ? "bg-destructive text-white" : "bg-sidebar-accent"),
						children: URGENCY_LABEL[job.urgency]
					})]
				})]
			}), /* @__PURE__ */ jsxs("div", {
				className: "no-print mt-5 flex flex-wrap gap-2",
				children: [
					next.length > 0 && (canWork || role === "FRONT") ? /* @__PURE__ */ jsxs(Button, {
						onClick: () => setStatusOpen(true),
						className: "bg-sidebar-primary text-sidebar-primary-foreground hover:bg-sidebar-primary/90",
						children: [/* @__PURE__ */ jsx(ArrowRightLeft, {}), " เปลี่ยนสถานะ"]
					}) : null,
					canWork && !closed && /* @__PURE__ */ jsxs(Button, {
						variant: "secondary",
						onClick: () => setPartOpen(true),
						children: [/* @__PURE__ */ jsx(PackageMinus, {}), " เบิกอะไหล่"]
					}),
					/* @__PURE__ */ jsxs(Button, {
						variant: "secondary",
						onClick: () => window.print(),
						children: [/* @__PURE__ */ jsx(Printer, {}), " พิมพ์ / PDF (A4)"]
					})
				]
			})]
		}),
		/* @__PURE__ */ jsxs("div", {
			className: "grid gap-6 lg:grid-cols-[1.4fr_1fr] print:grid-cols-2",
			children: [/* @__PURE__ */ jsxs("div", {
				className: "grid gap-6",
				children: [
					/* @__PURE__ */ jsxs(Panel, {
						title: "ข้อมูลลูกค้าและเครื่อง",
						children: [/* @__PURE__ */ jsxs("dl", {
							className: "grid gap-x-6 gap-y-3 text-sm sm:grid-cols-2",
							children: [
								/* @__PURE__ */ jsx(Item, {
									label: "เบอร์โทรศัพท์",
									value: /* @__PURE__ */ jsx("a", {
										href: `tel:${job.phone}`,
										className: "font-ticket text-primary hover:underline",
										children: job.phone
									})
								}),
								/* @__PURE__ */ jsx(Item, {
									label: "ผู้ติดต่อ",
									value: job.contactName
								}),
								/* @__PURE__ */ jsx(Item, {
									label: "ที่อยู่ / สถานที่ติดตั้ง",
									value: job.address,
									wide: true
								}),
								/* @__PURE__ */ jsx(Item, {
									label: "ประเภทเครื่อง",
									value: job.machineType
								}),
								/* @__PURE__ */ jsx(Item, {
									label: "ยี่ห้อ / รุ่น",
									value: `${job.brand} ${job.model}`
								}),
								/* @__PURE__ */ jsx(Item, {
									label: "หมายเลขเครื่อง",
									value: job.serialNo && /* @__PURE__ */ jsx("span", {
										className: "font-ticket",
										children: job.serialNo
									})
								}),
								/* @__PURE__ */ jsx(Item, {
									label: "วันที่นัดหมาย",
									value: /* @__PURE__ */ jsxs("span", {
										className: cn(isOverdue(job) && "font-semibold text-destructive"),
										children: [fmtDateTime(job.appointmentAt), isOverdue(job) && " (เกินนัด)"]
									})
								}),
								/* @__PURE__ */ jsx(Item, {
									label: "อาการเสีย",
									value: job.symptom,
									wide: true
								}),
								/* @__PURE__ */ jsx(Item, {
									label: "รายละเอียดเพิ่มเติม",
									value: job.details,
									wide: true
								}),
								/* @__PURE__ */ jsx(Item, {
									label: "หมายเหตุ",
									value: job.note,
									wide: true
								})
							]
						}), job.photos > 0 && /* @__PURE__ */ jsxs("p", {
							className: "no-print mt-4 flex items-center gap-2 rounded-lg bg-secondary/60 px-3 py-2 text-xs text-muted-foreground",
							children: [
								/* @__PURE__ */ jsx(Camera, { className: "size-4" }),
								" รูปภาพประกอบ ",
								job.photos,
								" รูป"
							]
						})]
					}),
					/* @__PURE__ */ jsx(RepairNotes, {
						job,
						editable: canWork && !closed
					}),
					/* @__PURE__ */ jsx(Panel, {
						title: "อะไหล่ที่ใช้",
						children: job.parts.length === 0 ? /* @__PURE__ */ jsx("p", {
							className: "text-sm text-muted-foreground",
							children: "ยังไม่มีการเบิกอะไหล่สำหรับงานนี้"
						}) : /* @__PURE__ */ jsx("ul", {
							className: "divide-y divide-border text-sm",
							children: job.parts.map((p, i) => {
								const item = inventory.find((x) => x.id === p.partId);
								return /* @__PURE__ */ jsxs("li", {
									className: "flex items-center justify-between gap-3 py-2",
									children: [/* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("p", {
										className: "font-medium",
										children: item?.name
									}), /* @__PURE__ */ jsxs("p", {
										className: "font-ticket text-[11px] text-muted-foreground",
										children: [
											item?.code,
											" · ",
											fmtDateTime(p.at),
											" · ",
											profileName(p.by)
										]
									})] }), /* @__PURE__ */ jsxs("span", {
										className: "font-ticket",
										children: [
											"× ",
											p.qty,
											" ",
											item?.unit
										]
									})]
								}, i);
							})
						})
					})
				]
			}), /* @__PURE__ */ jsxs("div", {
				className: "grid h-fit gap-6",
				children: [/* @__PURE__ */ jsx(AssignPanel, { job }), /* @__PURE__ */ jsx(Panel, {
					title: "ประวัติการทำงาน",
					children: /* @__PURE__ */ jsx("ol", {
						className: "relative ml-2 border-l-2 border-border",
						children: [...job.history].reverse().map((h, i) => /* @__PURE__ */ jsxs("li", {
							className: "relative pb-5 pl-5 last:pb-0",
							children: [
								/* @__PURE__ */ jsx("span", { className: cn("absolute -left-[7px] top-1 size-3 rounded-full ring-4 ring-card", i === 0 ? "bg-highlight" : "bg-border") }),
								/* @__PURE__ */ jsxs("p", {
									className: "text-sm font-medium",
									children: [h.from ? /* @__PURE__ */ jsxs(Fragment, { children: [STATUS_LABEL[h.from], " → "] }) : null, STATUS_LABEL[h.to]]
								}),
								/* @__PURE__ */ jsxs("p", {
									className: "text-xs text-muted-foreground",
									children: [
										fmtDateTime(h.at),
										" · ",
										profileName(h.by)
									]
								}),
								h.note && /* @__PURE__ */ jsx("p", {
									className: "mt-1 rounded-md bg-muted px-2 py-1 text-xs",
									children: h.note
								})
							]
						}, h.id))
					})
				})]
			})]
		}),
		/* @__PURE__ */ jsx("div", {
			className: "mt-12 hidden grid-cols-3 gap-8 text-center text-xs print:grid",
			children: [
				"ลูกค้า",
				"ช่างผู้ซ่อม",
				"ผู้ตรวจรับ"
			].map((s) => /* @__PURE__ */ jsxs("div", { children: [/* @__PURE__ */ jsx("div", { className: "mb-1 border-b border-foreground pt-10" }), s] }, s))
		}),
		/* @__PURE__ */ jsx(StatusDialog, {
			job,
			options: next,
			open: statusOpen,
			onOpenChange: setStatusOpen
		}),
		/* @__PURE__ */ jsx(IssuePartDialog, {
			job,
			open: partOpen,
			onOpenChange: setPartOpen
		})
	] });
}
function Item({ label, value, wide }) {
	return /* @__PURE__ */ jsxs("div", {
		className: cn(wide && "sm:col-span-2"),
		children: [/* @__PURE__ */ jsx("dt", {
			className: "text-xs text-muted-foreground",
			children: label
		}), /* @__PURE__ */ jsx("dd", {
			className: "mt-0.5",
			children: value || "—"
		})]
	});
}
function RepairNotes({ job, editable }) {
	const { updateJob } = useAppStore();
	return /* @__PURE__ */ jsx(Panel, {
		title: "ผลการตรวจสอบและการซ่อม",
		children: /* @__PURE__ */ jsxs("form", {
			className: "grid gap-4",
			onSubmit: async (e) => {
				e.preventDefault();
				const f = new FormData(e.currentTarget);
				const res = await updateJob(job.id, {
					diagnosis: String(f.get("diagnosis")),
					resolution: String(f.get("resolution")),
					result: String(f.get("result"))
				});
				if (res.ok) toast.success("บันทึกผลการซ่อมแล้ว");
				else toast.error(res.error);
			},
			children: [[
				[
					"diagnosis",
					"ผลการตรวจสอบ",
					job.diagnosis
				],
				[
					"resolution",
					"วิธีแก้ไข",
					job.resolution
				],
				[
					"result",
					"ผลการซ่อม",
					job.result
				]
			].map(([name, label, value]) => editable ? /* @__PURE__ */ jsx(Field, {
				label,
				htmlFor: name,
				children: /* @__PURE__ */ jsx(Textarea, {
					id: name,
					name,
					defaultValue: value,
					rows: 2
				})
			}, name) : /* @__PURE__ */ jsx(Item, {
				label,
				value
			}, name)), editable && /* @__PURE__ */ jsxs(Button, {
				type: "submit",
				variant: "outline",
				className: "no-print w-fit",
				children: [/* @__PURE__ */ jsx(Save, {}), " บันทึกผล"]
			})]
		})
	});
}
function AssignPanel({ job }) {
	const { currentUser, profiles, profileName, assignTechnician } = useAppStore();
	const techs = profiles.filter((p) => p.role === "TECH" && p.active);
	const isAdmin = currentUser?.role === "ADMIN";
	const closed = job.status === "COMPLETED" || job.status === "CANCELLED";
	return /* @__PURE__ */ jsx(Panel, {
		title: "ช่างผู้รับผิดชอบ",
		children: isAdmin && !closed ? /* @__PURE__ */ jsxs("form", {
			className: "flex flex-col gap-2 sm:flex-row",
			onSubmit: async (e) => {
				e.preventDefault();
				const id = String(new FormData(e.currentTarget).get("tech"));
				if (!id) return toast.error("กรุณาเลือกช่าง");
				const res = await assignTechnician(job.id, id);
				if (!res.ok) return toast.error(res.error);
				toast.success(`มอบหมายให้ ${profileName(id)} แล้ว`);
			},
			children: [/* @__PURE__ */ jsxs("select", {
				name: "tech",
				"aria-label": "เลือกช่าง",
				className: "native-select",
				defaultValue: job.technicianId ?? "",
				children: [/* @__PURE__ */ jsx("option", {
					value: "",
					children: "— เลือกช่าง —"
				}), techs.map((t) => /* @__PURE__ */ jsx("option", {
					value: t.id,
					children: t.fullName
				}, t.id))]
			}), /* @__PURE__ */ jsx(Button, {
				type: "submit",
				className: "h-11 md:h-10",
				children: "มอบหมาย"
			})]
		}) : /* @__PURE__ */ jsx("p", {
			className: "text-sm",
			children: job.technicianId ? profileName(job.technicianId) : "ยังไม่มอบหมาย"
		})
	});
}
function StatusDialog({ job, options, open, onOpenChange }) {
	const { changeStatus } = useAppStore();
	const [to, setTo] = React.useState("");
	return /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ jsxs(DialogContent, { children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsx(DialogTitle, { children: "เปลี่ยนสถานะงาน" }), /* @__PURE__ */ jsxs(DialogDescription, { children: [
			"สถานะปัจจุบัน: ",
			STATUS_LABEL[job.status],
			" — ทุกการเปลี่ยนแปลงจะถูกบันทึกในประวัติพร้อมผู้ดำเนินการและเวลา"
		] })] }), /* @__PURE__ */ jsxs("form", {
			className: "grid gap-4",
			onSubmit: async (e) => {
				e.preventDefault();
				if (!to) return toast.error("กรุณาเลือกสถานะใหม่");
				const note = String(new FormData(e.currentTarget).get("note") ?? "");
				if (to === "CANCELLED" && !note.trim()) return toast.error("กรุณาระบุเหตุผลการยกเลิก");
				const res = await changeStatus(job.id, to, note || void 0);
				if (!res.ok) return toast.error(res.error);
				toast.success(`เปลี่ยนสถานะเป็น “${STATUS_LABEL[to]}” แล้ว`);
				setTo("");
				onOpenChange(false);
			},
			children: [
				/* @__PURE__ */ jsx("div", {
					className: "grid gap-2",
					role: "radiogroup",
					"aria-label": "สถานะใหม่",
					children: options.map((s) => /* @__PURE__ */ jsxs("button", {
						type: "button",
						role: "radio",
						"aria-checked": to === s,
						onClick: () => setTo(s),
						className: cn("flex min-h-11 items-center justify-between rounded-lg border px-3 text-left text-sm transition-colors", to === s ? "border-highlight bg-accent/40" : "border-border hover:bg-muted"),
						children: [/* @__PURE__ */ jsx(StatusBadge, { status: s }), to === s && /* @__PURE__ */ jsx("span", {
							className: "text-xs text-primary",
							children: "เลือกแล้ว"
						})]
					}, s))
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "หมายเหตุ",
					htmlFor: "status-note",
					hint: to === "CANCELLED" ? "จำเป็นสำหรับการยกเลิก" : void 0,
					children: /* @__PURE__ */ jsx(Textarea, {
						id: "status-note",
						name: "note",
						rows: 2
					})
				}),
				/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
					type: "submit",
					size: "lg",
					children: "ยืนยัน"
				}) })
			]
		})] })
	});
}
function IssuePartDialog({ job, open, onOpenChange }) {
	const { inventory, moveStock } = useAppStore();
	const [partId, setPartId] = React.useState("");
	const item = inventory.find((i) => i.id === partId);
	return /* @__PURE__ */ jsx(Dialog, {
		open,
		onOpenChange,
		children: /* @__PURE__ */ jsxs(DialogContent, { children: [/* @__PURE__ */ jsxs(DialogHeader, { children: [/* @__PURE__ */ jsxs(DialogTitle, { children: ["เบิกอะไหล่สำหรับ ", /* @__PURE__ */ jsx(JobNo, { children: job.jobNo })] }), /* @__PURE__ */ jsx(DialogDescription, { children: "ระบบจะตัดสต๊อกและผูกรายการกับใบงานนี้ เบิกเกินยอดคงเหลือไม่ได้" })] }), /* @__PURE__ */ jsxs("form", {
			className: "grid gap-4",
			onSubmit: async (e) => {
				e.preventDefault();
				const qty = Number(new FormData(e.currentTarget).get("qty"));
				const res = await moveStock({
					partId,
					type: "OUT",
					qty,
					jobId: job.id
				});
				if (!res.ok) return toast.error(res.error);
				toast.success(`เบิก ${item?.name} × ${qty} แล้ว คงเหลือ ${res.value.balanceAfter}`);
				setPartId("");
				onOpenChange(false);
			},
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: "อะไหล่",
					htmlFor: "issue-part",
					children: /* @__PURE__ */ jsxs("select", {
						id: "issue-part",
						className: "native-select",
						value: partId,
						onChange: (e) => setPartId(e.target.value),
						required: true,
						children: [/* @__PURE__ */ jsx("option", {
							value: "",
							children: "— เลือกอะไหล่ —"
						}), inventory.map((i) => /* @__PURE__ */ jsxs("option", {
							value: i.id,
							disabled: i.onHand === 0,
							children: [
								i.code,
								" · ",
								i.name,
								" (คงเหลือ ",
								i.onHand,
								")"
							]
						}, i.id))]
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "จำนวน",
					htmlFor: "issue-qty",
					hint: item ? `คงเหลือ ${item.onHand} ${item.unit}` : void 0,
					children: /* @__PURE__ */ jsx(Input, {
						id: "issue-qty",
						name: "qty",
						type: "number",
						min: 1,
						max: item?.onHand,
						defaultValue: 1,
						inputMode: "numeric",
						className: "h-11",
						required: true
					})
				}),
				/* @__PURE__ */ jsx(DialogFooter, { children: /* @__PURE__ */ jsx(Button, {
					type: "submit",
					size: "lg",
					disabled: !partId,
					children: "ยืนยันการเบิก"
				}) })
			]
		})] })
	});
}
export { JobDetail as component };
