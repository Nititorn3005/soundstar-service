import { n as TSS_SERVER_FUNCTION, r as getServerFnById, t as createServerFn } from "../server.js";
import * as React from "react";
import { jsx } from "react/jsx-runtime";
import { z } from "zod";
import { cva } from "class-variance-authority";
import { clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { Slot } from "@radix-ui/react-slot";
// src/lib/utils.ts
function cn(...inputs) {
	return twMerge(clsx(inputs));
}
// src/components/ui/button.tsx
var buttonVariants = cva("inline-flex shrink-0 items-center justify-center gap-2 rounded-md text-sm font-medium whitespace-nowrap transition-all outline-none focus-visible:border-ring focus-visible:ring-[3px] focus-visible:ring-ring/50 disabled:pointer-events-none disabled:opacity-50 aria-invalid:border-destructive aria-invalid:ring-destructive/20 dark:aria-invalid:ring-destructive/40 [&_svg]:pointer-events-none [&_svg]:shrink-0 [&_svg:not([class*='size-'])]:size-4", {
	variants: {
		variant: {
			default: "bg-primary text-primary-foreground hover:bg-primary/90",
			destructive: "bg-destructive text-white hover:bg-destructive/90 focus-visible:ring-destructive/20 dark:bg-destructive/60 dark:focus-visible:ring-destructive/40",
			outline: "border bg-background shadow-xs hover:bg-accent hover:text-accent-foreground dark:border-input dark:bg-input/30 dark:hover:bg-input/50",
			secondary: "bg-secondary text-secondary-foreground hover:bg-secondary/80",
			ghost: "hover:bg-accent hover:text-accent-foreground dark:hover:bg-accent/50",
			link: "text-primary underline-offset-4 hover:underline"
		},
		size: {
			default: "h-9 px-4 py-2 has-[>svg]:px-3",
			xs: "h-6 gap-1 rounded-md px-2 text-xs has-[>svg]:px-1.5 [&_svg:not([class*='size-'])]:size-3",
			sm: "h-8 gap-1.5 rounded-md px-3 has-[>svg]:px-2.5",
			lg: "h-10 rounded-md px-6 has-[>svg]:px-4",
			icon: "size-9",
			"icon-xs": "size-6 rounded-md [&_svg:not([class*='size-'])]:size-3",
			"icon-sm": "size-8",
			"icon-lg": "size-10"
		}
	},
	defaultVariants: {
		variant: "default",
		size: "default"
	}
});
function Button({ className, variant = "default", size = "default", asChild = false, ...props }) {
	return /* @__PURE__ */ jsx(asChild ? Slot : "button", {
		"data-slot": "button",
		"data-variant": variant,
		"data-size": size,
		className: cn(buttonVariants({
			variant,
			size,
			className
		})),
		...props
	});
}
// node_modules/@tanstack/start-server-core/dist/esm/createSsrRpc.js
var createSsrRpc = (functionId) => {
	const url = "/_serverFn/" + functionId;
	const serverFnMeta = { id: functionId };
	const fn = async (...args) => {
		return (await getServerFnById(functionId, { origin: "server" }))(...args);
	};
	return Object.assign(fn, {
		url,
		serverFnMeta,
		[TSS_SERVER_FUNCTION]: true
	});
};
// src/lib/data.functions.ts
var getAppData = createServerFn({ method: "GET" }).handler(createSsrRpc("b1f1f2383165e5d211c8cb880f4bbdf495e73648e806c9ce47d2e792ef59791a"));
var jobInput = z.object({
	customerName: z.string().trim().min(1).max(200),
	phone: z.string().trim().min(1).max(40),
	contactName: z.string().max(200).optional(),
	address: z.string().trim().min(1).max(1e3),
	machineType: z.string().trim().min(1).max(120),
	brand: z.string().trim().min(1).max(120),
	model: z.string().trim().min(1).max(120),
	serialNo: z.string().max(120).optional(),
	symptom: z.string().trim().min(1).max(2e3),
	details: z.string().max(5e3).optional(),
	technicianId: z.string().uuid().optional(),
	appointmentAt: z.string().datetime().optional(),
	urgency: z.enum([
		"LOW",
		"NORMAL",
		"HIGH",
		"URGENT"
	]),
	note: z.string().max(5e3).optional(),
	photos: z.number().int().min(0).max(6).optional()
});
var createRepairJob = createServerFn({ method: "POST" }).validator(jobInput).handler(createSsrRpc("2846cbb31df64efcaa385c4b9abad8a77fffc986a522439a5a69329a20d3c211"));
var jobPatchSchema = z.object({
	diagnosis: z.string().max(5e3).optional(),
	resolution: z.string().max(5e3).optional(),
	result: z.string().max(5e3).optional(),
	note: z.string().max(5e3).optional(),
	appointmentAt: z.string().datetime().optional()
});
var updateRepairJob = createServerFn({ method: "POST" }).validator(z.object({
	id: z.string().uuid(),
	patch: jobPatchSchema
})).handler(createSsrRpc("c34a63767d29280c6895c4a7b2f637119a1dfb0c9337985fdc9ae00d2d99495b"));
var changeRepairJobStatus = createServerFn({ method: "POST" }).validator(z.object({
	id: z.string().uuid(),
	to: z.enum([
		"RECEIVED",
		"WAITING_ASSIGN",
		"ASSIGNED",
		"IN_PROGRESS",
		"WAITING_PARTS",
		"WAITING_APPROVAL",
		"COMPLETED",
		"CANCELLED"
	]),
	note: z.string().max(1e3).optional()
})).handler(createSsrRpc("2b74fbe40b93e930e1c95211d7707e622d088d1391154204752cec348c6203b5"));
var assignRepairTechnician = createServerFn({ method: "POST" }).validator(z.object({
	id: z.string().uuid(),
	technicianId: z.string().uuid()
})).handler(createSsrRpc("a8d17d0da5689078451d789debd079941b5a3fd40747d6f7a3a87ce1d497a7eb"));
var moveInventoryStock = createServerFn({ method: "POST" }).validator(z.object({
	partId: z.string().uuid(),
	type: z.enum([
		"IN",
		"OUT",
		"ADJUST"
	]),
	qty: z.number().int().refine((n) => n !== 0),
	jobId: z.string().uuid().optional(),
	reference: z.string().max(200).optional(),
	reason: z.string().max(1e3).optional()
})).handler(createSsrRpc("886cee72268a9b9fe324cf13263e0e1ce54d33229897563844eb5eb45a6dad45"));
var reverseInventoryTransaction = createServerFn({ method: "POST" }).validator(z.object({
	id: z.string().uuid(),
	reason: z.string().trim().min(1).max(1e3)
})).handler(createSsrRpc("cebcabd7536a01c0133e167d18159ba27aa0026cb7810e92895a50909217f17c"));
var itemSchema = z.object({
	id: z.string().uuid().optional(),
	code: z.string().trim().min(1).max(80),
	name: z.string().trim().min(1).max(200),
	category: z.string().max(120),
	compatible: z.string().max(300),
	unit: z.string().trim().min(1).max(40),
	minQty: z.number().min(0),
	cost: z.number().min(0),
	location: z.string().max(200),
	note: z.string().max(1e3).optional()
});
var saveInventoryItem = createServerFn({ method: "POST" }).validator(itemSchema).handler(createSsrRpc("7307fef306b31ec04829fd517fab9372a262264d6f367b129ea32159eb96115f"));
var createUserSchema = z.object({
	fullName: z.string().max(120),
	username: z.string().max(64),
	role: z.enum([
		"ADMIN",
		"FRONT",
		"TECH"
	]),
	active: z.boolean(),
	phone: z.string().max(40).optional(),
	password: z.string().max(200),
	confirm: z.string().max(200)
});
var createStaffUser = createServerFn({ method: "POST" }).validator(createUserSchema).handler(createSsrRpc("06ef03706d3defe4a34cc34fe82e9d89fb1de20cc1878fe84b1b3143d67375da"));
var updateStaffUser = createServerFn({ method: "POST" }).validator(z.object({
	id: z.string().uuid(),
	patch: z.object({
		fullName: z.string().max(120).optional(),
		phone: z.string().max(40).optional(),
		role: z.enum([
			"ADMIN",
			"FRONT",
			"TECH"
		]).optional(),
		active: z.boolean().optional()
	})
})).handler(createSsrRpc("e5e7e74df11fcba1a2476a182357c3d946b74704b026893d22555b0f490a6a1c"));
var resetStaffPassword = createServerFn({ method: "POST" }).validator(z.object({
	id: z.string().uuid(),
	password: z.string().max(200),
	confirm: z.string().max(200)
})).handler(createSsrRpc("3bdacb24b6f027f8e1b536bf5b60e4578809791522133a6414944169b59f0758"));
var saveCompany = createServerFn({ method: "POST" }).validator(z.object({
	id: z.string().uuid().optional(),
	nameTh: z.string().trim().min(1).max(200),
	nameEn: z.string().max(200),
	address: z.string().trim().min(1).max(1e3),
	phones: z.string().trim().min(1).max(200),
	taxId: z.string().max(40).optional()
})).handler(createSsrRpc("598c2fe1ff61f311bad2ba121b157b5718a8859cd40d128971c0e20352b18162"));
// src/lib/auth.functions.ts
var getSession = createServerFn({ method: "GET" }).handler(createSsrRpc("753fb13391a5b0328ea3344426a11caf1f07e6f28fcdc91937757498d31af961"));
var login = createServerFn({ method: "POST" }).validator(z.object({
	username: z.string().max(64),
	password: z.string().min(1).max(200)
})).handler(createSsrRpc("8df20e164b02e0f25b2f3ded46ca477870814adcef4eda397ae3f9dd4def87a1"));
var logout = createServerFn({ method: "POST" }).handler(createSsrRpc("452e3e86c202416aafc02a2b55b578ec43fec039a5a067befd21bb3ba85f5fd5"));
createServerFn({ method: "POST" }).validator(z.object({
	current: z.string().min(1).max(200),
	next: z.string().max(200),
	confirm: z.string().max(200)
})).handler(createSsrRpc("6a002c78d934e9579908104dc6268072d9172790791db1901caf901df0cf6199"));
var getPublicCompany = createServerFn({ method: "GET" }).handler(createSsrRpc("a2dc6ccf84d48e6db811229713ebe801b9f0a67be20537050eb1cfbe3910d729"));
var getSetupStatus = createServerFn({ method: "GET" }).handler(createSsrRpc("c24455af66764cc387ae4bbbd18fa591dfa8c55e18de078cb841da1a4b7bcf5c"));
var bootstrapAdmin = createServerFn({ method: "POST" }).validator(z.object({
	token: z.string().max(500),
	fullName: z.string().max(120),
	username: z.string().max(64),
	password: z.string().max(200),
	confirm: z.string().max(200),
	phone: z.string().max(40).optional()
})).handler(createSsrRpc("efeb6f7d14183f6e6850575cff078962035bd2c811649c44778cdca875f6262f"));
// src/lib/store.tsx
var Ctx = React.createContext(null);
var fail = (error) => ({
	ok: false,
	error
});
function AppStoreProvider({ children }) {
	const [currentUser, setCurrentUser] = React.useState(null);
	const [loading, setLoading] = React.useState(true);
	const [loadError, setLoadError] = React.useState("");
	const [company, setCompany] = React.useState({
		nameTh: "",
		nameEn: "",
		address: "",
		phones: ""
	});
	const [profiles, setProfiles] = React.useState([]);
	const [jobs, setJobs] = React.useState([]);
	const [inventory, setInventory] = React.useState([]);
	const [transactions, setTransactions] = React.useState([]);
	const refresh = React.useCallback(async () => {
		try {
			const data = await getAppData();
			setCurrentUser(data.currentUser);
			setCompany(data.company);
			setProfiles(data.profiles);
			setJobs(data.jobs);
			setInventory(data.inventory);
			setTransactions(data.transactions);
			setLoadError("");
		} catch {
			setCurrentUser(null);
			const publicCompany = await getPublicCompany().catch(() => null);
			if (publicCompany) setCompany(publicCompany);
			setLoadError("โหลดข้อมูลระบบไม่สำเร็จ กรุณาเข้าสู่ระบบอีกครั้ง");
		} finally {
			setLoading(false);
		}
	}, []);
	React.useEffect(() => {
		Promise.resolve().then(refresh);
	}, [refresh]);
	async function mutate(request) {
		try {
			const result = await request();
			if (result.ok) await refresh();
			return result;
		} catch {
			return fail("ดำเนินการไม่สำเร็จ กรุณาลองใหม่");
		}
	}
	const store = {
		currentUser,
		loading,
		loadError,
		company,
		profiles,
		jobs,
		inventory,
		transactions,
		async signIn(username, password) {
			try {
				const result = await login({ data: {
					username,
					password
				} });
				if (!result.ok) return result;
				setCurrentUser(result.value);
				await refresh();
				return result;
			} catch {
				return fail("เข้าสู่ระบบไม่สำเร็จ กรุณาลองใหม่");
			}
		},
		async signOut() {
			await logout().catch(() => {});
			setCurrentUser(null);
			setProfiles([]);
			setJobs([]);
			setInventory([]);
			setTransactions([]);
		},
		refresh,
		createJob(input) {
			return mutate(() => createRepairJob({ data: input }));
		},
		updateJob(id, patch) {
			return mutate(() => updateRepairJob({ data: {
				id,
				patch
			} }));
		},
		changeStatus(id, to, note) {
			return mutate(() => changeRepairJobStatus({ data: {
				id,
				to,
				note
			} }));
		},
		assignTechnician(id, technicianId) {
			return mutate(() => assignRepairTechnician({ data: {
				id,
				technicianId
			} }));
		},
		moveStock(input) {
			return mutate(() => moveInventoryStock({ data: input }));
		},
		reverseTx(txId, reason) {
			return mutate(() => reverseInventoryTransaction({ data: {
				id: txId,
				reason
			} }));
		},
		saveItem(item) {
			return mutate(() => saveInventoryItem({ data: item }));
		},
		createUser(input) {
			return mutate(() => createStaffUser({ data: input }));
		},
		updateUser(id, patch) {
			return mutate(() => updateStaffUser({ data: {
				id,
				patch
			} }));
		},
		resetUserPassword(id, password, confirm) {
			return mutate(() => resetStaffPassword({ data: {
				id,
				password,
				confirm
			} }));
		},
		updateCompany(c) {
			return mutate(() => saveCompany({ data: {
				...c,
				id: company.id
			} }));
		},
		profileName(id) {
			return profiles.find((p) => p.id === id)?.fullName ?? "—";
		}
	};
	return /* @__PURE__ */ jsx(Ctx.Provider, {
		value: store,
		children
	});
}
function useAppStore() {
	const s = React.useContext(Ctx);
	if (!s) throw new Error("useAppStore must be used inside AppStoreProvider");
	return s;
}
export { getSetupStatus as a, getSession as i, useAppStore as n, Button as o, bootstrapAdmin as r, cn as s, AppStoreProvider as t };
