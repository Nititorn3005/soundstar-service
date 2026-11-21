import { describe, expect, it } from "vitest";

import { allowedNextStatuses, isOverdue, type RepairJob } from "./domain";
import { validatePassword } from "./validation";

const testJob = (
  status: RepairJob["status"],
  appointmentAt?: string,
): RepairJob => ({
  id: status,
  jobNo: "HS-2610-0001",
  receivedAt: "2026-10-27T08:42:00+07:00",
  customerName: "ลูกค้าทดสอบ",
  phone: "0800000000",
  address: "หาดใหญ่",
  machineType: "ฝาบน",
  brand: "LG",
  model: "Test",
  symptom: "ทดสอบ",
  receivedBy: "test-user",
  appointmentAt,
  urgency: "NORMAL",
  status,
  photos: 0,
  history: [],
  parts: [],
});

describe("job status transitions", () => {
  it("lets ADMIN cancel from any open status but not reopen closed jobs", () => {
    expect(allowedNextStatuses("IN_PROGRESS", "ADMIN")).toContain("CANCELLED");
    expect(allowedNextStatuses("COMPLETED", "ADMIN")).toEqual([]);
    expect(allowedNextStatuses("CANCELLED", "ADMIN")).toEqual([]);
  });

  it("limits TECH to repair-progress statuses", () => {
    expect(allowedNextStatuses("IN_PROGRESS", "TECH")).toEqual([
      "WAITING_PARTS",
      "WAITING_APPROVAL",
      "COMPLETED",
    ]);
    expect(allowedNextStatuses("RECEIVED", "TECH")).toEqual([]);
  });

  it("limits FRONT to intake statuses", () => {
    expect(allowedNextStatuses("RECEIVED", "FRONT")).toEqual([
      "WAITING_ASSIGN",
      "CANCELLED",
    ]);
    expect(allowedNextStatuses("IN_PROGRESS", "FRONT")).toEqual(["CANCELLED"]);
  });
});

describe("overdue jobs", () => {
  it("flags open jobs past their appointment only", () => {
    const now = new Date("2026-10-28T00:00:00+07:00");
    const appointmentAt = "2026-10-27T14:00:00+07:00";
    const open = testJob("WAITING_PARTS", appointmentAt);
    const done = testJob("COMPLETED");
    expect(isOverdue(open, now)).toBe(true);
    expect(isOverdue({ ...done, appointmentAt: open.appointmentAt }, now)).toBe(
      false,
    );
  });
});

describe("password rules", () => {
  it("rejects short or letter-only passwords and mismatched confirmations", () => {
    expect(validatePassword("abc123", "abc123").password).toBeDefined();
    expect(
      validatePassword("abcdefghijk", "abcdefghijk").password,
    ).toBeDefined();
    expect(
      validatePassword("Washer2026ok", "Washer2026no").confirm,
    ).toBeDefined();
    expect(validatePassword("Washer2026ok", "Washer2026ok")).toEqual({});
  });
});
