import { a as Field, c as Panel, d as Input, l as RoleGate, s as PageHeader } from "./shell-DV0Ef7pI.js";
import { n as useAppStore, o as Button } from "./store-HGwRtq6e.js";
import { t as Textarea } from "./textarea-BSikAOlL.js";
import { c as URGENCY_LABEL, f as fmtDateTime, t as MACHINE_TYPES } from "./domain-BwIhFv2h.js";
import * as React from "react";
import { useNavigate } from "@tanstack/react-router";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Camera, Loader2, Save, X } from "lucide-react";
import { toast } from "sonner";
// src/routes/_app/jobs.new.tsx?tsr-split=component
var MAX_PHOTOS = 6;
var MAX_BYTES = 5242880;
var ACCEPT = [
	"image/jpeg",
	"image/png",
	"image/webp",
	"image/heic"
];
function NewJob() {
	const { createJob, profiles, currentUser } = useAppStore();
	const navigate = useNavigate();
	const [errors, setErrors] = React.useState({});
	const [photos, setPhotos] = React.useState([]);
	const [pending, setPending] = React.useState(false);
	const techs = profiles.filter((p) => p.role === "TECH" && p.active);
	const isAdmin = currentUser?.role === "ADMIN";
	function addPhotos(list) {
		if (!list) return;
		const incoming = Array.from(list);
		const bad = incoming.find((f) => !ACCEPT.includes(f.type) || f.size > MAX_BYTES);
		if (bad) {
			setErrors((e) => ({
				...e,
				photos: `ไฟล์ ${bad.name} ไม่รองรับ (JPG/PNG/WebP/HEIC ไม่เกิน 5 MB)`
			}));
			return;
		}
		setErrors((e) => ({
			...e,
			photos: void 0
		}));
		setPhotos((p) => [...p, ...incoming].slice(0, MAX_PHOTOS));
	}
	async function onSubmit(ev) {
		ev.preventDefault();
		if (pending) return;
		const f = new FormData(ev.currentTarget);
		const v = (k) => String(f.get(k) ?? "").trim();
		const e = {};
		if (!v("customerName")) e.customerName = "กรุณากรอกชื่อลูกค้า";
		if (!/^0\d{8,9}$/.test(v("phone").replace(/[-\s]/g, ""))) e.phone = "เบอร์โทรไม่ถูกต้อง";
		if (!v("address")) e.address = "กรุณากรอกที่อยู่หรือสถานที่ติดตั้ง";
		if (!v("brand")) e.brand = "กรุณาระบุยี่ห้อ";
		if (!v("model")) e.model = "กรุณาระบุรุ่น";
		if (!v("symptom")) e.symptom = "กรุณาระบุอาการเสีย";
		setErrors(e);
		if (Object.keys(e).length) {
			toast.error("กรุณาตรวจสอบข้อมูลที่ไฮไลต์");
			return;
		}
		setPending(true);
		const res = await createJob({
			customerName: v("customerName"),
			phone: v("phone"),
			contactName: v("contactName") || void 0,
			address: v("address"),
			machineType: v("machineType"),
			brand: v("brand"),
			model: v("model"),
			serialNo: v("serialNo") || void 0,
			symptom: v("symptom"),
			details: v("details") || void 0,
			technicianId: isAdmin && v("technicianId") || void 0,
			appointmentAt: v("appointmentAt") ? new Date(v("appointmentAt")).toISOString() : void 0,
			urgency: v("urgency"),
			note: v("note") || void 0,
			photos: photos.length
		});
		setPending(false);
		if (!res.ok) return toast.error(res.error);
		toast.success(`สร้างใบงาน ${res.value.jobNo} เรียบร้อย`);
		navigate({
			to: "/jobs/$jobId",
			params: { jobId: res.value.id }
		});
	}
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(PageHeader, {
		eyebrow: "New job",
		title: "รับแจ้งงานซ่อม",
		description: "เลขที่ใบงานจะถูกสร้างอัตโนมัติเมื่อบันทึก"
	}), /* @__PURE__ */ jsxs("form", {
		onSubmit,
		noValidate: true,
		className: "grid gap-6 lg:grid-cols-[1fr_20rem]",
		children: [/* @__PURE__ */ jsxs("div", {
			className: "grid gap-6",
			children: [
				/* @__PURE__ */ jsx(Panel, {
					title: "ข้อมูลลูกค้า",
					children: /* @__PURE__ */ jsxs("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ jsx(Field, {
								label: "ชื่อลูกค้า",
								htmlFor: "customerName",
								error: errors.customerName,
								required: true,
								children: /* @__PURE__ */ jsx(Input, {
									id: "customerName",
									name: "customerName",
									className: "h-11"
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "เบอร์โทรศัพท์",
								htmlFor: "phone",
								error: errors.phone,
								required: true,
								children: /* @__PURE__ */ jsx(Input, {
									id: "phone",
									name: "phone",
									type: "tel",
									inputMode: "tel",
									className: "h-11 font-ticket",
									placeholder: "08x-xxx-xxxx"
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "ชื่อผู้ติดต่อ",
								htmlFor: "contactName",
								children: /* @__PURE__ */ jsx(Input, {
									id: "contactName",
									name: "contactName",
									className: "h-11"
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "ที่อยู่หรือสถานที่ติดตั้ง",
								htmlFor: "address",
								error: errors.address,
								required: true,
								className: "sm:col-span-2",
								children: /* @__PURE__ */ jsx(Textarea, {
									id: "address",
									name: "address",
									rows: 2
								})
							})
						]
					})
				}),
				/* @__PURE__ */ jsx(Panel, {
					title: "ข้อมูลเครื่องและอาการ",
					children: /* @__PURE__ */ jsxs("div", {
						className: "grid gap-4 sm:grid-cols-2",
						children: [
							/* @__PURE__ */ jsx(Field, {
								label: "ประเภทเครื่องซักผ้า",
								htmlFor: "machineType",
								required: true,
								children: /* @__PURE__ */ jsx("select", {
									id: "machineType",
									name: "machineType",
									className: "native-select",
									children: MACHINE_TYPES.map((m) => /* @__PURE__ */ jsx("option", { children: m }, m))
								})
							}),
							/* @__PURE__ */ jsxs(Field, {
								label: "ยี่ห้อ",
								htmlFor: "brand",
								error: errors.brand,
								required: true,
								children: [/* @__PURE__ */ jsx(Input, {
									id: "brand",
									name: "brand",
									list: "brands",
									className: "h-11"
								}), /* @__PURE__ */ jsx("datalist", {
									id: "brands",
									children: [
										"LG",
										"Samsung",
										"Electrolux",
										"Toshiba",
										"Hitachi",
										"Panasonic",
										"Sharp",
										"Haier",
										"Beko"
									].map((b) => /* @__PURE__ */ jsx("option", { value: b }, b))
								})]
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "รุ่น",
								htmlFor: "model",
								error: errors.model,
								required: true,
								children: /* @__PURE__ */ jsx(Input, {
									id: "model",
									name: "model",
									className: "h-11 font-ticket"
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "หมายเลขเครื่อง",
								htmlFor: "serialNo",
								hint: "ถ้ามี",
								children: /* @__PURE__ */ jsx(Input, {
									id: "serialNo",
									name: "serialNo",
									className: "h-11 font-ticket"
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "อาการเสีย",
								htmlFor: "symptom",
								error: errors.symptom,
								required: true,
								className: "sm:col-span-2",
								children: /* @__PURE__ */ jsx(Input, {
									id: "symptom",
									name: "symptom",
									className: "h-11"
								})
							}),
							/* @__PURE__ */ jsx(Field, {
								label: "รายละเอียดเพิ่มเติม",
								htmlFor: "details",
								className: "sm:col-span-2",
								children: /* @__PURE__ */ jsx(Textarea, {
									id: "details",
									name: "details",
									rows: 3
								})
							})
						]
					})
				}),
				/* @__PURE__ */ jsxs(Panel, {
					title: "รูปภาพประกอบ",
					children: [
						/* @__PURE__ */ jsxs("label", {
							htmlFor: "photos",
							className: "flex cursor-pointer flex-col items-center gap-2 rounded-xl border-2 border-dashed border-border bg-muted/40 px-4 py-8 text-center transition-colors hover:border-highlight hover:bg-accent/30",
							children: [
								/* @__PURE__ */ jsx(Camera, {
									className: "size-6 text-primary",
									"aria-hidden": true
								}),
								/* @__PURE__ */ jsx("span", {
									className: "text-sm font-medium",
									children: "ถ่ายรูปหรือเลือกไฟล์"
								}),
								/* @__PURE__ */ jsxs("span", {
									className: "text-xs text-muted-foreground",
									children: [
										"JPG, PNG, WebP, HEIC · ไม่เกิน 5 MB ต่อรูป · สูงสุด ",
										MAX_PHOTOS,
										" รูป"
									]
								})
							]
						}),
						/* @__PURE__ */ jsx("input", {
							id: "photos",
							type: "file",
							accept: ACCEPT.join(","),
							multiple: true,
							capture: "environment",
							className: "sr-only",
							onChange: (e) => {
								addPhotos(e.target.files);
								e.target.value = "";
							}
						}),
						errors.photos && /* @__PURE__ */ jsx("p", {
							role: "alert",
							className: "mt-2 text-xs text-destructive",
							children: errors.photos
						}),
						photos.length > 0 && /* @__PURE__ */ jsx("ul", {
							className: "mt-3 flex flex-wrap gap-2",
							children: photos.map((p, i) => /* @__PURE__ */ jsxs("li", {
								className: "flex items-center gap-2 rounded-lg bg-secondary px-2.5 py-1.5 text-xs",
								children: [/* @__PURE__ */ jsx("span", {
									className: "max-w-40 truncate",
									children: p.name
								}), /* @__PURE__ */ jsx("button", {
									type: "button",
									"aria-label": `ลบ ${p.name}`,
									onClick: () => setPhotos((xs) => xs.filter((_, j) => j !== i)),
									children: /* @__PURE__ */ jsx(X, { className: "size-3.5" })
								})]
							}, i))
						})
					]
				})
			]
		}), /* @__PURE__ */ jsxs("div", {
			className: "grid h-fit gap-6 lg:sticky lg:top-6",
			children: [/* @__PURE__ */ jsx(Panel, {
				title: "การรับงาน",
				children: /* @__PURE__ */ jsxs("div", {
					className: "grid gap-4",
					children: [
						/* @__PURE__ */ jsxs("div", {
							className: "rounded-lg bg-secondary/60 p-3 text-sm",
							children: [
								/* @__PURE__ */ jsx("p", {
									className: "text-xs text-muted-foreground",
									children: "วันที่และเวลารับแจ้ง"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "font-medium",
									children: fmtDateTime((/* @__PURE__ */ new Date()).toISOString())
								}),
								/* @__PURE__ */ jsx("p", {
									className: "mt-2 text-xs text-muted-foreground",
									children: "ผู้รับงาน"
								}),
								/* @__PURE__ */ jsx("p", {
									className: "font-medium",
									children: currentUser?.fullName
								})
							]
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "ช่างผู้รับผิดชอบ",
							htmlFor: "technicianId",
							hint: isAdmin ? "เว้นว่างได้ สถานะจะเป็น “รอมอบหมายช่าง”" : "ผู้ดูแลระบบเป็นผู้มอบหมายช่าง",
							children: /* @__PURE__ */ jsxs("select", {
								id: "technicianId",
								name: "technicianId",
								className: "native-select",
								disabled: !isAdmin,
								children: [/* @__PURE__ */ jsx("option", {
									value: "",
									children: "— ยังไม่มอบหมาย —"
								}), techs.map((t) => /* @__PURE__ */ jsx("option", {
									value: t.id,
									children: t.fullName
								}, t.id))]
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "วันที่นัดหมาย",
							htmlFor: "appointmentAt",
							children: /* @__PURE__ */ jsx(Input, {
								id: "appointmentAt",
								name: "appointmentAt",
								type: "datetime-local",
								className: "h-11"
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "ระดับความเร่งด่วน",
							htmlFor: "urgency",
							children: /* @__PURE__ */ jsx("select", {
								id: "urgency",
								name: "urgency",
								className: "native-select",
								defaultValue: "NORMAL",
								children: Object.keys(URGENCY_LABEL).map((u) => /* @__PURE__ */ jsx("option", {
									value: u,
									children: URGENCY_LABEL[u]
								}, u))
							})
						}),
						/* @__PURE__ */ jsx(Field, {
							label: "หมายเหตุ",
							htmlFor: "note",
							children: /* @__PURE__ */ jsx(Textarea, {
								id: "note",
								name: "note",
								rows: 2
							})
						})
					]
				})
			}), /* @__PURE__ */ jsxs(Button, {
				type: "submit",
				size: "lg",
				className: "h-12 text-base",
				disabled: pending,
				children: [pending ? /* @__PURE__ */ jsx(Loader2, { className: "animate-spin" }) : /* @__PURE__ */ jsx(Save, {}), pending ? "กำลังบันทึก…" : "บันทึกใบงาน"]
			})]
		})]
	})] });
}
var SplitComponent = () => /* @__PURE__ */ jsx(RoleGate, {
	roles: ["ADMIN", "FRONT"],
	children: /* @__PURE__ */ jsx(NewJob, {})
});
export { SplitComponent as component };
