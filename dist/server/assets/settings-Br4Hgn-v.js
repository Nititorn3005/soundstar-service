import { a as Field, c as Panel, d as Input, l as RoleGate, s as PageHeader } from "./shell-DV0Ef7pI.js";
import { n as useAppStore, o as Button } from "./store-HGwRtq6e.js";
import { t as Textarea } from "./textarea-BSikAOlL.js";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
import { Save } from "lucide-react";
import { toast } from "sonner";
// src/routes/_app/settings.tsx?tsr-split=component
function Settings() {
	const { company, updateCompany } = useAppStore();
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(PageHeader, {
		eyebrow: "Company",
		title: "ตั้งค่าบริษัท",
		description: "ข้อมูลนี้แสดงในส่วนท้ายเว็บไซต์และหัวใบงานซ่อมที่พิมพ์"
	}), /* @__PURE__ */ jsxs("div", {
		className: "grid gap-6 lg:grid-cols-[1fr_22rem]",
		children: [/* @__PURE__ */ jsx(Panel, { children: /* @__PURE__ */ jsxs("form", {
			className: "grid gap-4",
			onSubmit: async (e) => {
				e.preventDefault();
				const f = new FormData(e.currentTarget);
				const v = (k) => String(f.get(k) ?? "").trim();
				if (!v("nameTh") || !v("address") || !v("phones")) return toast.error("กรุณากรอกชื่อบริษัท ที่อยู่ และเบอร์โทร");
				const res = await updateCompany({
					nameTh: v("nameTh"),
					nameEn: v("nameEn"),
					address: v("address"),
					phones: v("phones"),
					taxId: v("taxId") || void 0
				});
				if (!res.ok) return toast.error(res.error);
				toast.success("บันทึกข้อมูลบริษัทแล้ว");
			},
			children: [
				/* @__PURE__ */ jsx(Field, {
					label: "ชื่อบริษัท (ภาษาไทย)",
					htmlFor: "nameTh",
					required: true,
					children: /* @__PURE__ */ jsx(Input, {
						id: "nameTh",
						name: "nameTh",
						defaultValue: company.nameTh,
						className: "h-11"
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "ชื่อบริษัท (ภาษาอังกฤษ)",
					htmlFor: "nameEn",
					children: /* @__PURE__ */ jsx(Input, {
						id: "nameEn",
						name: "nameEn",
						defaultValue: company.nameEn,
						className: "h-11"
					})
				}),
				/* @__PURE__ */ jsx(Field, {
					label: "ที่อยู่",
					htmlFor: "address",
					required: true,
					children: /* @__PURE__ */ jsx(Textarea, {
						id: "address",
						name: "address",
						defaultValue: company.address,
						rows: 2
					})
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "grid gap-4 sm:grid-cols-2",
					children: [/* @__PURE__ */ jsx(Field, {
						label: "โทรศัพท์",
						htmlFor: "phones",
						hint: "คั่นหลายเบอร์ด้วยจุลภาค",
						required: true,
						children: /* @__PURE__ */ jsx(Input, {
							id: "phones",
							name: "phones",
							defaultValue: company.phones,
							className: "h-11 font-ticket"
						})
					}), /* @__PURE__ */ jsx(Field, {
						label: "เลขประจำตัวผู้เสียภาษี",
						htmlFor: "taxId",
						children: /* @__PURE__ */ jsx(Input, {
							id: "taxId",
							name: "taxId",
							defaultValue: company.taxId,
							inputMode: "numeric",
							className: "h-11 font-ticket"
						})
					})]
				}),
				/* @__PURE__ */ jsxs(Button, {
					type: "submit",
					size: "lg",
					className: "w-fit",
					children: [/* @__PURE__ */ jsx(Save, {}), " บันทึก"]
				})
			]
		}) }), /* @__PURE__ */ jsx(Panel, {
			title: "ตัวอย่างหัวใบงาน",
			children: /* @__PURE__ */ jsxs("div", {
				className: "rounded-lg border-2 border-foreground p-3 text-sm",
				children: [
					/* @__PURE__ */ jsx("p", {
						className: "font-bold",
						children: company.nameTh
					}),
					/* @__PURE__ */ jsx("p", {
						className: "text-xs",
						children: company.nameEn
					}),
					/* @__PURE__ */ jsx("p", {
						className: "mt-1 text-xs",
						children: company.address
					}),
					/* @__PURE__ */ jsxs("p", {
						className: "text-xs",
						children: ["โทร ", company.phones]
					})
				]
			})
		})]
	})] });
}
var SplitComponent = () => /* @__PURE__ */ jsx(RoleGate, {
	roles: ["ADMIN"],
	children: /* @__PURE__ */ jsx(Settings, {})
});
export { SplitComponent as component };
