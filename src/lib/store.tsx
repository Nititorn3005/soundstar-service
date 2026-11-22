import * as React from "react";
import { toast } from "sonner";

import {
  getAppData,
  createRepairJob,
  updateRepairJob,
  changeRepairJobStatus,
  assignRepairTechnician,
  moveInventoryStock,
  reverseInventoryTransaction,
  saveInventoryItem,
  createStaffUser,
  updateStaffUser,
  resetStaffPassword,
  saveCompany,
} from "./data.functions";
import { getPublicCompany, login, logout } from "./auth.functions";
import type {
  Company,
  InventoryItem,
  InventoryTx,
  JobStatus,
  Profile,
  RepairJob,
} from "./domain";

type Result<T = void> = { ok: true; value: T } | { ok: false; error: string };
type NewUserInput = Omit<Profile, "id" | "createdAt"> & {
  password: string;
  confirm: string;
};

type NewJobInput = Omit<
  RepairJob,
  "id" | "jobNo" | "receivedAt" | "history" | "parts" | "status" | "receivedBy"
>;

type StockMoveInput = {
  partId: string;
  type: "IN" | "OUT" | "ADJUST";
  qty: number;
  jobId?: string;
  reference?: string;
  reason?: string;
  note?: string;
};

type AppStore = {
  currentUser: Profile | null;
  loading: boolean;
  loadError: string;
  company: Company;
  profiles: Profile[];
  jobs: RepairJob[];
  inventory: InventoryItem[];
  transactions: InventoryTx[];
  signIn: (username: string, password: string) => Promise<Result<Profile>>;
  signOut: () => Promise<void>;
  refresh: () => Promise<void>;
  createJob: (input: NewJobInput) => Promise<Result<RepairJob>>;
  updateJob: (id: string, patch: Partial<RepairJob>) => Promise<Result>;
  changeStatus: (id: string, to: JobStatus, note?: string) => Promise<Result>;
  assignTechnician: (id: string, technicianId: string) => Promise<Result>;
  moveStock: (input: StockMoveInput) => Promise<Result<InventoryTx>>;
  reverseTx: (txId: string, reason: string) => Promise<Result>;
  saveItem: (
    item: Omit<InventoryItem, "id"> & { id?: string },
  ) => Promise<Result>;
  createUser: (input: NewUserInput) => Promise<Result<Profile>>;
  updateUser: (id: string, patch: Partial<Profile>) => Promise<Result>;
  resetUserPassword: (
    id: string,
    password: string,
    confirm: string,
  ) => Promise<Result>;
  updateCompany: (c: Company) => Promise<Result>;
  profileName: (id?: string) => string;
};

const Ctx = React.createContext<AppStore | null>(null);
const fail = (error: string) => ({ ok: false as const, error });

export function AppStoreProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = React.useState<Profile | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [loadError, setLoadError] = React.useState("");
  const [company, setCompany] = React.useState<Company>({
    nameTh: "",
    nameEn: "",
    address: "",
    phones: "",
  });
  const [profiles, setProfiles] = React.useState<Profile[]>([]);
  const [jobs, setJobs] = React.useState<RepairJob[]>([]);
  const [inventory, setInventory] = React.useState<InventoryItem[]>([]);
  const [transactions, setTransactions] = React.useState<InventoryTx[]>([]);

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
      throw new Error("Refresh failed");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    void Promise.resolve().then(refresh).catch(() => {});
  }, [refresh]);

  async function mutate<T>(
    request: () => Promise<Result<T>>,
  ): Promise<Result<T>> {
    try {
      const result = await request();
      if (result.ok) {
        void refresh().catch(() => {
          toast.error("การเชื่อมต่อติดขัด: ระบบจะซิงค์ข้อมูลใหม่อีกครั้งเมื่ออินเทอร์เน็ตกลับมาใช้งานได้");
        });
      } else {
        toast.error(result.error || "ดำเนินการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
      return result;
    } catch {
      const err = "การเชื่อมต่อเครือข่ายล้มเหลว กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่";
      toast.error(err);
      return fail(err);
    }
  }

  const store: AppStore = {
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
        const result = await login({ data: { username, password } });
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

    // อัปเดตหน้าจอทันที (0ms) เมื่อกดบันทึกผลซ่อมหรือแก้ไขข้อมูลลูกค้า
    async updateJob(id, patch) {
      const oldJobs = [...jobs];
      const now = new Date().toISOString();
      const nextJobs = jobs.map((j) =>
        j.id === id ? { ...j, ...patch, updatedAt: now } : j
      ) as RepairJob[];
      setJobs(nextJobs);

      try {
        const result = await updateRepairJob({ data: { id, patch } });
        if (!result.ok) {
          setJobs(oldJobs);
          toast.error(result.error || "บันทึกข้อมูลไม่สำเร็จ");
          return result;
        }
        void refresh().catch(() => {});
        return result;
      } catch {
        setJobs(oldJobs);
        const err = "การเชื่อมต่อเครือข่ายล้มเหลว กรุณาตรวจสอบอินเทอร์เน็ต";
        toast.error(err);
        return fail(err);
      }
    },

    async changeStatus(id, to, note) {
      const oldJobs = [...jobs];
      const targetJob = jobs.find((j) => j.id === id);
      const now = new Date().toISOString();

      const nextJobs = jobs.map((job) => {
        if (job.id !== id) return job;
        const currentHistory = Array.isArray(job.history) ? job.history : [];
        const newHistoryItem = {
          id: crypto.randomUUID(),
          from: job.status,
          to: to,
          at: now,
          by: currentUser?.id ?? "",
          note: note ? note.trim() : null,
        };
        return {
          ...job,
          status: to,
          history: [...currentHistory, newHistoryItem],
          updatedAt: now,
        };
      }) as RepairJob[];

      setJobs(nextJobs);

      try {
        const result = await changeRepairJobStatus({ data: { id, to, note } });
        if (!result.ok) {
          setJobs(oldJobs);
          toast.error(result.error || "เปลี่ยนสถานะไม่สำเร็จ");
          return result;
        }

        if (to === "COMPLETED" && targetJob) {
          if (targetJob.parts && targetJob.parts.length > 0) {
            const summary = targetJob.parts
              .map((p) => {
                const inv = inventory.find((x) => x.id === p.partId);
                return `${inv?.name || "อะไหล่"} ×${p.qty}`;
              })
              .join(", ");
            toast.info(`สรุปอะไหล่ที่ตัดสต๊อกในใบงาน ${targetJob.jobNo}: ${summary}`);
          } else {
            toast.warning(`ใบงาน ${targetJob.jobNo} ปิดงานโดยไม่มีรายการเบิกอะไหล่`);
          }
        }

        void refresh().catch(() => {});
        return result;
      } catch {
        setJobs(oldJobs);
        const errMsg = "เปลี่ยนสถานะไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต";
        toast.error(errMsg);
        return fail(errMsg);
      }
    },

    async assignTechnician(id, technicianId) {
      const oldJobs = [...jobs];

      const nextJobs = jobs.map((j) =>
        j.id === id ? { ...j, technicianId, updatedAt: new Date().toISOString() } : j
      ) as RepairJob[];

      setJobs(nextJobs);

      try {
        const result = await assignRepairTechnician({ data: { id, technicianId } });
        if (!result.ok) {
          setJobs(oldJobs);
          toast.error(result.error || "มอบหมายช่างไม่สำเร็จ");
          return result;
        }
        void refresh().catch(() => {});
        return result;
      } catch {
        setJobs(oldJobs);
        const errMsg = "มอบหมายช่างไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต";
        toast.error(errMsg);
        return fail(errMsg);
      }
    },

    // อัปเดตทั้งสต๊อกและรายการอะไหล่ในใบงานทันที (0ms)
    async moveStock(input) {
      const oldInventory = [...inventory];
      const oldJobs = [...jobs];
      const targetItem = inventory.find((item) => item.id === input.partId);
      const now = new Date().toISOString();

      const nextInventory = inventory.map((item) => {
        if (item.id !== input.partId) return item;
        const delta = input.type === "IN" ? input.qty : input.type === "OUT" ? -input.qty : 0;
        return { ...item, onHand: Math.max(0, item.onHand + delta) };
      }) as InventoryItem[];

      setInventory(nextInventory);

      if (input.jobId) {
        const nextJobs = jobs.map((job) => {
          if (job.id !== input.jobId) return job;
          const currentParts = Array.isArray(job.parts) ? [...job.parts] : [];
          if (input.type === "OUT") {
            currentParts.push({
              partId: input.partId,
              qty: input.qty,
              at: now,
              by: currentUser?.id ?? "",
            });
          } else if (input.type === "IN") {
            const idx = currentParts.findIndex((p) => p.partId === input.partId && p.qty === input.qty);
            if (idx !== -1) currentParts.splice(idx, 1);
          }
          return { ...job, parts: currentParts, updatedAt: now };
        }) as RepairJob[];
        setJobs(nextJobs);
      }

      try {
        const result = await moveInventoryStock({ data: input });
        if (!result.ok) {
          setInventory(oldInventory);
          setJobs(oldJobs);
          toast.error(result.error || "เบิก/ปรับสต๊อกไม่สำเร็จ");
          return result;
        }

        if (targetItem && input.type !== "IN") {
          const threshold =
            (targetItem as InventoryItem & { minStock?: number; reorderPoint?: number }).minStock ??
            (targetItem as InventoryItem & { minStock?: number; reorderPoint?: number }).reorderPoint ??
            2;
          const remaining = result.value.balanceAfter;
          if (remaining === 0) {
            toast.error(`⚠️ อะไหล่หมดสต๊อก: ${targetItem.name} (${targetItem.code}) คงเหลือ 0 ${targetItem.unit}`);
          } else if (remaining <= threshold) {
            toast.warning(`⚠️ อะไหล่ใกล้หมด: ${targetItem.name} (${targetItem.code}) คงเหลือ ${remaining} ${targetItem.unit}`);
          }
        }

        void refresh().catch(() => {});
        return result;
      } catch {
        setInventory(oldInventory);
        setJobs(oldJobs);
        const errMsg = "เบิก/ปรับสต๊อกไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต";
        toast.error(errMsg);
        return fail(errMsg);
      }
    },

    reverseTx(txId, reason) {
      return mutate(() =>
        reverseInventoryTransaction({ data: { id: txId, reason } }),
      );
    },

    async saveItem(item) {
      const oldInventory = [...inventory];
      if (item.id) {
        setInventory(inventory.map((x) => (x.id === item.id ? { ...x, ...item } : x)) as InventoryItem[]);
      }
      try {
        const result = await saveInventoryItem({ data: item });
        if (!result.ok) {
          setInventory(oldInventory);
          toast.error(result.error || "บันทึกข้อมูลอะไหล่ไม่สำเร็จ");
          return result;
        }
        void refresh().catch(() => {});
        return result;
      } catch {
        setInventory(oldInventory);
        const err = "บันทึกข้อมูลอะไหล่ไม่สำเร็จ";
        toast.error(err);
        return fail(err);
      }
    },

    createUser(input) {
      return mutate(() => createStaffUser({ data: input }));
    },

    async updateUser(id, patch) {
      const oldProfiles = [...profiles];
      setProfiles(profiles.map((p) => (p.id === id ? { ...p, ...patch } : p)) as Profile[]);
      try {
        const result = await updateStaffUser({ data: { id, patch } });
        if (!result.ok) {
          setProfiles(oldProfiles);
          toast.error(result.error || "อัปเดตผู้ใช้งานไม่สำเร็จ");
          return result;
        }
        void refresh().catch(() => {});
        return result;
      } catch {
        setProfiles(oldProfiles);
        const err = "อัปเดตผู้ใช้งานไม่สำเร็จ";
        toast.error(err);
        return fail(err);
      }
    },

    resetUserPassword(id, password, confirm) {
      return mutate(() =>
        resetStaffPassword({ data: { id, password, confirm } }),
      );
    },

    async updateCompany(c) {
      const oldCompany = { ...company };
      setCompany(c);
      try {
        const result = await saveCompany({ data: { ...c, id: company.id } });
        if (!result.ok) {
          setCompany(oldCompany);
          toast.error(result.error || "บันทึกข้อมูลบริษัทไม่สำเร็จ");
          return result;
        }
        void refresh().catch(() => {});
        return result;
      } catch {
        setCompany(oldCompany);
        const err = "บันทึกข้อมูลบริษัทไม่สำเร็จ";
        toast.error(err);
        return fail(err);
      }
    },

    profileName(id) {
      return profiles.find((p) => p.id === id)?.fullName ?? "—";
    },
  };

  return <Ctx.Provider value={store}>{children}</Ctx.Provider>;
}

export function useAppStore() {
  const s = React.useContext(Ctx);
  if (!s) throw new Error("useAppStore must be used inside AppStoreProvider");
  return s;
}
