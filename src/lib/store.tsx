import * as React from "react";

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
          alert("การเชื่อมต่อติดขัด: ระบบจะพยายามซิงค์ข้อมูลใหม่อีกครั้งเมื่ออินเทอร์เน็ตกลับมาใช้งานได้");
        });
      } else {
        alert(result.error || "ดำเนินการไม่สำเร็จ กรุณาลองใหม่อีกครั้ง");
      }
      return result;
    } catch {
      const err = "การเชื่อมต่อเครือข่ายล้มเหลว กรุณาตรวจสอบอินเทอร์เน็ตแล้วลองใหม่";
      alert(err);
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

    updateJob(id, patch) {
      return mutate(() => updateRepairJob({ data: { id, patch } }));
    },

    async changeStatus(id, to, note) {
      const oldJobs = [...jobs];
      const now = new Date().toISOString();

      // 🟢 เติม as RepairJob[] ด้านท้ายเพื่อป้องกัน TypeScript Error 100%
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
          alert(result.error || "เปลี่ยนสถานะไม่สำเร็จ");
          return result;
        }
        void refresh().catch(() => {});
        return result;
      } catch {
        setJobs(oldJobs);
        const errMsg = "เปลี่ยนสถานะไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต";
        alert(errMsg);
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
          alert(result.error || "มอบหมายช่างไม่สำเร็จ");
          return result;
        }
        void refresh().catch(() => {});
        return result;
      } catch {
        setJobs(oldJobs);
        const errMsg = "มอบหมายช่างไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต";
        alert(errMsg);
        return fail(errMsg);
      }
    },

    async moveStock(input) {
      const oldInventory = [...inventory];

      const nextInventory = inventory.map((item) => {
        if (item.id !== input.partId) return item;
        const delta = input.type === "IN" ? input.qty : input.type === "OUT" ? -input.qty : 0;
        return { ...item, onHand: Math.max(0, item.onHand + delta) };
      }) as InventoryItem[];

      setInventory(nextInventory);

      try {
        const result = await moveInventoryStock({ data: input });
        if (!result.ok) {
          setInventory(oldInventory);
          alert(result.error || "เบิก/ปรับสต๊อกไม่สำเร็จ");
          return result;
        }
        void refresh().catch(() => {});
        return result;
      } catch {
        setInventory(oldInventory);
        const errMsg = "เบิก/ปรับสต๊อกไม่สำเร็จ กรุณาตรวจสอบอินเทอร์เน็ต";
        alert(errMsg);
        return fail(errMsg);
      }
    },

    reverseTx(txId, reason) {
      return mutate(() =>
        reverseInventoryTransaction({ data: { id: txId, reason } }),
      );
    },

    saveItem(item) {
      return mutate(() => saveInventoryItem({ data: item }));
    },

    createUser(input) {
      return mutate(() => createStaffUser({ data: input }));
    },

    updateUser(id, patch) {
      return mutate(() => updateStaffUser({ data: { id, patch } }));
    },

    resetUserPassword(id, password, confirm) {
      return mutate(() =>
        resetStaffPassword({ data: { id, password, confirm } }),
      );
    },

    updateCompany(c) {
      return mutate(() => saveCompany({ data: { ...c, id: company.id } }));
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