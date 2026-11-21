import { l as RoleGate, s as PageHeader } from "./shell-DV0Ef7pI.js";
import { t as StockMoveForm } from "./stock-form-CIJDRHh2.js";
import { jsx, jsxs } from "react/jsx-runtime";
// src/routes/_app/inventory.issue.tsx?tsr-split=component
var SplitComponent = () => /* @__PURE__ */ jsxs(RoleGate, {
	roles: ["ADMIN", "TECH"],
	children: [/* @__PURE__ */ jsx(PageHeader, {
		eyebrow: "Stock out",
		title: "เบิกอะไหล่ออก",
		description: "เบิกอะไหล่และผูกกับใบงานซ่อม ระบบไม่อนุญาตให้เบิกเกินยอดคงเหลือ"
	}), /* @__PURE__ */ jsx(StockMoveForm, { mode: "OUT" })]
});
export { SplitComponent as component };
