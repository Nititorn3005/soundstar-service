import { a as getSetupStatus, i as getSession, o as Button, t as AppStoreProvider } from "./store-HGwRtq6e.js";
import "react";
import { HeadContent, Link, Scripts, createFileRoute, createRootRoute, createRouter, lazyRouteComponent, redirect, useRouter } from "@tanstack/react-router";
import { jsx, jsxs } from "react/jsx-runtime";
import { CircleCheckIcon, InfoIcon, Loader2Icon, OctagonXIcon, TriangleAlertIcon } from "lucide-react";
import { Toaster } from "sonner";
import * as TooltipPrimitive from "@radix-ui/react-tooltip";
// \0rolldown/runtime.js
var __defProp = Object.defineProperty;
var __exportAll = (all, no_symbols) => {
	let target = {};
	for (var name in all) __defProp(target, name, {
		get: all[name],
		enumerable: true
	});
	if (!no_symbols) __defProp(target, Symbol.toStringTag, { value: "Module" });
	return target;
};
// src/components/error-pages.tsx
function NotFoundPage() {
	return /* @__PURE__ */ jsx("main", {
		className: "grid min-h-svh place-items-center px-6 py-16",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md space-y-6 text-center",
			children: [
				/* @__PURE__ */ jsx("p", {
					className: "text-sm font-medium text-muted-foreground",
					children: "404"
				}),
				/* @__PURE__ */ jsx("h1", {
					className: "text-3xl font-semibold tracking-tight",
					children: "ไม่พบหน้านี้"
				}),
				/* @__PURE__ */ jsx("p", {
					className: "text-muted-foreground",
					children: "ไม่พบหน้าที่คุณต้องการ กรุณาตรวจสอบที่อยู่ หรือกลับไปหน้าแรก"
				}),
				/* @__PURE__ */ jsx(Button, {
					asChild: true,
					children: /* @__PURE__ */ jsx(Link, {
						to: "/",
						children: "กลับหน้าแรก"
					})
				})
			]
		})
	});
}
function RouteErrorPage({ reset }) {
	const router = useRouter();
	return /* @__PURE__ */ jsx("main", {
		className: "grid min-h-svh place-items-center px-6 py-16",
		children: /* @__PURE__ */ jsxs("div", {
			className: "max-w-md space-y-6 text-center",
			children: [
				/* @__PURE__ */ jsx("h1", {
					className: "text-3xl font-semibold tracking-tight",
					children: "ไม่สามารถโหลดหน้านี้ได้"
				}),
				/* @__PURE__ */ jsx("p", {
					role: "alert",
					className: "text-muted-foreground",
					children: "กรุณาลองใหม่อีกครั้ง หรือกลับไปหน้าแรก"
				}),
				/* @__PURE__ */ jsxs("div", {
					className: "flex flex-wrap justify-center gap-3",
					children: [/* @__PURE__ */ jsx(Button, {
						onClick: () => {
							router.invalidate();
							reset();
						},
						children: "ลองอีกครั้ง"
					}), /* @__PURE__ */ jsx(Button, {
						variant: "outline",
						asChild: true,
						children: /* @__PURE__ */ jsx("a", {
							href: "/",
							children: "กลับหน้าแรก"
						})
					})]
				})
			]
		})
	});
}
// src/components/ui/sonner.tsx
var Toaster$1 = ({ ...props }) => {
	return /* @__PURE__ */ jsx(Toaster, {
		theme: "light",
		className: "toaster group",
		icons: {
			success: /* @__PURE__ */ jsx(CircleCheckIcon, { className: "size-4" }),
			info: /* @__PURE__ */ jsx(InfoIcon, { className: "size-4" }),
			warning: /* @__PURE__ */ jsx(TriangleAlertIcon, { className: "size-4" }),
			error: /* @__PURE__ */ jsx(OctagonXIcon, { className: "size-4" }),
			loading: /* @__PURE__ */ jsx(Loader2Icon, { className: "size-4 animate-spin" })
		},
		style: {
			"--normal-bg": "var(--popover)",
			"--normal-text": "var(--popover-foreground)",
			"--normal-border": "var(--border)",
			"--border-radius": "var(--radius)"
		},
		...props
	});
};
// src/components/ui/tooltip.tsx
function TooltipProvider({ delayDuration = 0, ...props }) {
	return /* @__PURE__ */ jsx(TooltipPrimitive.Provider, {
		"data-slot": "tooltip-provider",
		delayDuration,
		...props
	});
}
// src/routes/__root.tsx
var siteName = "Hatyai Soundstar · ระบบบริหารงานซ่อม";
var siteDescription = "ระบบรับแจ้งงานซ่อมเครื่องซักผ้า ติดตามสถานะ และบริหารสต๊อกอะไหล่ ของบริษัท หาดใหญ่ซาวด์สตาร์ จำกัด";
var Route$14 = createRootRoute({
	head: () => ({
		meta: [
			{ charSet: "utf-8" },
			{
				name: "viewport",
				content: "width=device-width, initial-scale=1"
			},
			{ title: siteName },
			{
				name: "description",
				content: siteDescription
			},
			{
				property: "og:title",
				content: siteName
			},
			{
				property: "og:description",
				content: siteDescription
			},
			{
				property: "og:type",
				content: "website"
			},
			{
				name: "twitter:card",
				content: "summary_large_image"
			},
			{
				name: "theme-color",
				content: "#0f2a44"
			}
		],
		links: [
			{
				rel: "preconnect",
				href: "https://fonts.googleapis.com"
			},
			{
				rel: "preconnect",
				href: "https://fonts.gstatic.com",
				crossOrigin: "anonymous"
			},
			{
				rel: "stylesheet",
				href: "https://fonts.googleapis.com/css2?family=Anuphan:wght@500;600;700&family=IBM+Plex+Sans+Thai:wght@400;500;600&family=JetBrains+Mono:wght@500;700&display=swap"
			}
		]
	}),
	shellComponent: RootDocument,
	notFoundComponent: NotFoundPage
});
function RootDocument({ children }) {
	return /* @__PURE__ */ jsxs("html", {
		lang: "th",
		children: [/* @__PURE__ */ jsx("head", { children: /* @__PURE__ */ jsx(HeadContent, {}) }), /* @__PURE__ */ jsxs("body", { children: [
			/* @__PURE__ */ jsx(TooltipProvider, { children: /* @__PURE__ */ jsx(AppStoreProvider, { children }) }),
			/* @__PURE__ */ jsx(Toaster$1, {}),
			/* @__PURE__ */ jsx(Scripts, {})
		] })]
	});
}
// src/routes/index.tsx
var $$splitComponentImporter$13 = () => import("./routes-MOmzXNSO.js");
var Route$13 = createFileRoute("/")({ component: lazyRouteComponent($$splitComponentImporter$13, "component") });
// src/routes/_app.tsx
var $$splitComponentImporter$12 = () => import("./_app-C592aCnN.js");
var Route$12 = createFileRoute("/_app")({
	beforeLoad: async () => {
		if (!await getSession()) throw redirect({ to: "/" });
	},
	component: lazyRouteComponent($$splitComponentImporter$12, "component")
});
// src/routes/setup.tsx
var $$splitComponentImporter$11 = () => import("./setup-BF0WTVIt.js");
var Route$11 = createFileRoute("/setup")({
	head: () => ({ meta: [{ title: "ตั้งค่าระบบครั้งแรก · Hatyai Soundstar" }] }),
	loader: () => getSetupStatus(),
	component: lazyRouteComponent($$splitComponentImporter$11, "component")
});
// src/routes/_app/dashboard.tsx
var $$splitComponentImporter$10 = () => import("./dashboard-NpzjbEAM.js");
var Route$10 = createFileRoute("/_app/dashboard")({
	head: () => ({ meta: [{ title: "แดชบอร์ด · Hatyai Soundstar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$10, "component")
});
// src/routes/_app/reports.tsx
var $$splitComponentImporter$9 = () => import("./reports-CUsayUKi.js");
var Route$9 = createFileRoute("/_app/reports")({
	head: () => ({ meta: [{ title: "รายงาน · Hatyai Soundstar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$9, "component")
});
// src/routes/_app/settings.tsx
var $$splitComponentImporter$8 = () => import("./settings-Br4Hgn-v.js");
var Route$8 = createFileRoute("/_app/settings")({
	head: () => ({ meta: [{ title: "ตั้งค่าบริษัท · Hatyai Soundstar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$8, "component")
});
// src/routes/_app/users.tsx
var $$splitComponentImporter$7 = () => import("./users-CWq6qsb4.js");
var Route$7 = createFileRoute("/_app/users")({
	head: () => ({ meta: [{ title: "จัดการผู้ใช้งาน · Hatyai Soundstar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$7, "component")
});
// src/routes/_app/inventory.index.tsx
var $$splitComponentImporter$6 = () => import("./inventory.index-BK-JgeMu.js");
var Route$6 = createFileRoute("/_app/inventory/")({
	head: () => ({ meta: [{ title: "สต๊อกอะไหล่ · Hatyai Soundstar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$6, "component")
});
// src/routes/_app/inventory.history.tsx
var $$splitComponentImporter$5 = () => import("./inventory.history-DiNnH3nc.js");
var Route$5 = createFileRoute("/_app/inventory/history")({
	head: () => ({ meta: [{ title: "ประวัติสต๊อก · Hatyai Soundstar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$5, "component")
});
// src/routes/_app/inventory.issue.tsx
var $$splitComponentImporter$4 = () => import("./inventory.issue-5yTDLV9G.js");
var Route$4 = createFileRoute("/_app/inventory/issue")({
	head: () => ({ meta: [{ title: "เบิกอะไหล่ออก · Hatyai Soundstar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$4, "component")
});
// src/routes/_app/inventory.receive.tsx
var $$splitComponentImporter$3 = () => import("./inventory.receive-Sf-QVgU4.js");
var Route$3 = createFileRoute("/_app/inventory/receive")({
	head: () => ({ meta: [{ title: "รับอะไหล่เข้า · Hatyai Soundstar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$3, "component")
});
// src/routes/_app/jobs.index.tsx
var $$splitComponentImporter$2 = () => import("./jobs.index-BKV3rcFh.js");
var Route$2 = createFileRoute("/_app/jobs/")({
	head: () => ({ meta: [{ title: "รายการงานซ่อม · Hatyai Soundstar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$2, "component")
});
// src/routes/_app/jobs.$jobId.tsx
var $$splitComponentImporter$1 = () => import("./jobs._jobId-CZMVp19F.js");
var Route$1 = createFileRoute("/_app/jobs/$jobId")({
	head: () => ({ meta: [{ title: "รายละเอียดงานซ่อม · Hatyai Soundstar" }] }),
	component: lazyRouteComponent($$splitComponentImporter$1, "component")
});
// src/routes/_app/jobs.new.tsx
var $$splitComponentImporter = () => import("./jobs.new-CG4qBAQa.js");
var Route = createFileRoute("/_app/jobs/new")({
	head: () => ({ meta: [{ title: "รับแจ้งงานซ่อม · Hatyai Soundstar" }] }),
	component: lazyRouteComponent($$splitComponentImporter, "component")
});
// src/routeTree.gen.ts
var IndexRoute = Route$13.update({
	id: "/",
	path: "/",
	getParentRoute: () => Route$14
});
var AppRoute = Route$12.update({
	id: "/_app",
	getParentRoute: () => Route$14
});
var SetupRoute = Route$11.update({
	id: "/setup",
	path: "/setup",
	getParentRoute: () => Route$14
});
var AppDashboardRoute = Route$10.update({
	id: "/dashboard",
	path: "/dashboard",
	getParentRoute: () => AppRoute
});
var AppReportsRoute = Route$9.update({
	id: "/reports",
	path: "/reports",
	getParentRoute: () => AppRoute
});
var AppSettingsRoute = Route$8.update({
	id: "/settings",
	path: "/settings",
	getParentRoute: () => AppRoute
});
var AppUsersRoute = Route$7.update({
	id: "/users",
	path: "/users",
	getParentRoute: () => AppRoute
});
var AppInventoryIndexRoute = Route$6.update({
	id: "/inventory/",
	path: "/inventory/",
	getParentRoute: () => AppRoute
});
var AppInventoryHistoryRoute = Route$5.update({
	id: "/inventory/history",
	path: "/inventory/history",
	getParentRoute: () => AppRoute
});
var AppInventoryIssueRoute = Route$4.update({
	id: "/inventory/issue",
	path: "/inventory/issue",
	getParentRoute: () => AppRoute
});
var AppInventoryReceiveRoute = Route$3.update({
	id: "/inventory/receive",
	path: "/inventory/receive",
	getParentRoute: () => AppRoute
});
var AppJobsIndexRoute = Route$2.update({
	id: "/jobs/",
	path: "/jobs/",
	getParentRoute: () => AppRoute
});
var AppRouteChildren = {
	AppDashboardRoute,
	AppReportsRoute,
	AppSettingsRoute,
	AppUsersRoute,
	AppInventoryHistoryRoute,
	AppInventoryIssueRoute,
	AppInventoryReceiveRoute,
	AppJobsJobIdRoute: Route$1.update({
		id: "/jobs/$jobId",
		path: "/jobs/$jobId",
		getParentRoute: () => AppRoute
	}),
	AppJobsNewRoute: Route.update({
		id: "/jobs/new",
		path: "/jobs/new",
		getParentRoute: () => AppRoute
	}),
	AppInventoryIndexRoute,
	AppJobsIndexRoute
};
var rootRouteChildren = {
	IndexRoute,
	AppRoute: AppRoute._addFileChildren(AppRouteChildren),
	SetupRoute
};
var routeTree = Route$14._addFileChildren(rootRouteChildren)._addFileTypes();
// src/router.tsx
var router_exports = /* @__PURE__ */ __exportAll({ getRouter: () => getRouter });
var getRouter = () => {
	return createRouter({
		routeTree,
		defaultErrorComponent: RouteErrorPage,
		scrollRestoration: true,
		defaultPreloadStaleTime: 0
	});
};
export { getRouter, Route$1 as n, Route$11 as r, router_exports as t };
