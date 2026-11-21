import { t as AppShell } from "./shell-DV0Ef7pI.js";
import { n as useAppStore } from "./store-HGwRtq6e.js";
import { Navigate, Outlet } from "@tanstack/react-router";
import { jsx } from "react/jsx-runtime";
// src/routes/_app.tsx?tsr-split=component
function AppLayout() {
	const { currentUser, loading } = useAppStore();
	if (loading) return /* @__PURE__ */ jsx("p", {
		role: "status",
		className: "p-6 text-sm text-muted-foreground",
		children: "กำลังตรวจสอบการเข้าสู่ระบบ…"
	});
	if (!currentUser) return /* @__PURE__ */ jsx(Navigate, {
		to: "/",
		replace: true
	});
	return /* @__PURE__ */ jsx(AppShell, { children: /* @__PURE__ */ jsx(Outlet, {}) });
}
export { AppLayout as component };
