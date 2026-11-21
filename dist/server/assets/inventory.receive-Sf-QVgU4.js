import { l as RoleGate, s as PageHeader } from "./shell-DV0Ef7pI.js";
import { t as StockMoveForm } from "./stock-form-CIJDRHh2.js";
import { i as TabsTrigger, n as TabsContent, r as TabsList, t as Tabs } from "./tabs-CRR8UEMr.js";
import * as React from "react";
import { Fragment, jsx, jsxs } from "react/jsx-runtime";
// src/routes/_app/inventory.receive.tsx?tsr-split=component
function Receive() {
	const [tab, setTab] = React.useState("IN");
	return /* @__PURE__ */ jsxs(Fragment, { children: [/* @__PURE__ */ jsx(PageHeader, {
		eyebrow: "Stock in",
		title: "รับอะไหล่เข้า",
		description: "บันทึกอะไหล่ที่รับเข้าคลัง หรือปรับยอดหลังตรวจนับพร้อมระบุเหตุผล"
	}), /* @__PURE__ */ jsxs(Tabs, {
		value: tab,
		onValueChange: setTab,
		children: [
			/* @__PURE__ */ jsxs(TabsList, {
				className: "mb-4",
				children: [/* @__PURE__ */ jsx(TabsTrigger, {
					value: "IN",
					children: "รับเข้า"
				}), /* @__PURE__ */ jsx(TabsTrigger, {
					value: "ADJUST",
					children: "ปรับยอด"
				})]
			}),
			/* @__PURE__ */ jsx(TabsContent, {
				value: "IN",
				children: /* @__PURE__ */ jsx(StockMoveForm, { mode: "IN" })
			}),
			/* @__PURE__ */ jsx(TabsContent, {
				value: "ADJUST",
				children: /* @__PURE__ */ jsx(StockMoveForm, { mode: "ADJUST" })
			})
		]
	})] });
}
var SplitComponent = () => /* @__PURE__ */ jsx(RoleGate, {
	roles: ["ADMIN"],
	children: /* @__PURE__ */ jsx(Receive, {})
});
export { SplitComponent as component };
