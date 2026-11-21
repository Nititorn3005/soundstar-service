// src/lib/domain.ts
var ROLE_LABEL = {
	ADMIN: "ผู้ดูแลระบบ",
	FRONT: "พนักงานหน้าร้าน",
	TECH: "ช่างซ่อม"
};
var STATUS_ORDER = [
	"RECEIVED",
	"WAITING_ASSIGN",
	"ASSIGNED",
	"IN_PROGRESS",
	"WAITING_PARTS",
	"WAITING_APPROVAL",
	"COMPLETED",
	"CANCELLED"
];
var STATUS_LABEL = {
	RECEIVED: "รับแจ้งงาน",
	WAITING_ASSIGN: "รอมอบหมายช่าง",
	ASSIGNED: "มอบหมายช่างแล้ว",
	IN_PROGRESS: "กำลังดำเนินการ",
	WAITING_PARTS: "รออะไหล่",
	WAITING_APPROVAL: "รออนุมัติ",
	COMPLETED: "ซ่อมสำเร็จ",
	CANCELLED: "ยกเลิกงาน"
};
/** Tailwind classes for the status pill. */
var STATUS_TONE = {
	RECEIVED: "bg-secondary text-secondary-foreground",
	WAITING_ASSIGN: "bg-warn/20 text-foreground ring-1 ring-warn/50",
	ASSIGNED: "bg-accent text-accent-foreground",
	IN_PROGRESS: "bg-highlight/20 text-primary ring-1 ring-highlight/50",
	WAITING_PARTS: "bg-warn/30 text-foreground",
	WAITING_APPROVAL: "bg-primary/10 text-primary",
	COMPLETED: "bg-ok/15 text-foreground ring-1 ring-ok/40",
	CANCELLED: "bg-muted text-muted-foreground line-through"
};
var TRANSITIONS = {
	RECEIVED: [
		"WAITING_ASSIGN",
		"ASSIGNED",
		"CANCELLED"
	],
	WAITING_ASSIGN: ["ASSIGNED", "CANCELLED"],
	ASSIGNED: [
		"IN_PROGRESS",
		"WAITING_ASSIGN",
		"CANCELLED"
	],
	IN_PROGRESS: [
		"WAITING_PARTS",
		"WAITING_APPROVAL",
		"COMPLETED",
		"CANCELLED"
	],
	WAITING_PARTS: ["IN_PROGRESS", "CANCELLED"],
	WAITING_APPROVAL: [
		"IN_PROGRESS",
		"COMPLETED",
		"CANCELLED"
	],
	COMPLETED: [],
	CANCELLED: []
};
/** Statuses a TECH may move a job into (only on jobs assigned to them). */
var TECH_ALLOWED = [
	"IN_PROGRESS",
	"WAITING_PARTS",
	"WAITING_APPROVAL",
	"COMPLETED"
];
function allowedNextStatuses(from, role) {
	const next = TRANSITIONS[from];
	if (role === "ADMIN") return next;
	if (role === "TECH") return next.filter((s) => TECH_ALLOWED.includes(s));
	return next.filter((s) => s === "WAITING_ASSIGN" || s === "CANCELLED");
}
var OPEN_STATUSES = [
	"RECEIVED",
	"WAITING_ASSIGN",
	"ASSIGNED",
	"IN_PROGRESS",
	"WAITING_PARTS",
	"WAITING_APPROVAL"
];
var URGENCY_LABEL = {
	LOW: "ไม่เร่งด่วน",
	NORMAL: "ปกติ",
	HIGH: "ด่วน",
	URGENT: "ด่วนมาก"
};
var MACHINE_TYPES = [
	"ฝาบน",
	"ฝาหน้า",
	"2 ถัง",
	"เครื่องซักอุตสาหกรรม",
	"เครื่องซักหยอดเหรียญ",
	"เครื่องอบผ้า"
];
var TX_LABEL = {
	IN: "รับเข้า",
	OUT: "เบิกออก",
	ADJUST: "ปรับยอด",
	REVERSAL: "ย้อนรายการ"
};
function isOverdue(job, now = /* @__PURE__ */ new Date()) {
	return !!job.appointmentAt && OPEN_STATUSES.includes(job.status) && new Date(job.appointmentAt) < now;
}
var dateFmt = new Intl.DateTimeFormat("th-TH", {
	day: "numeric",
	month: "short",
	year: "2-digit",
	timeZone: "Asia/Bangkok"
});
var dateTimeFmt = new Intl.DateTimeFormat("th-TH", {
	day: "numeric",
	month: "short",
	year: "2-digit",
	hour: "2-digit",
	minute: "2-digit",
	timeZone: "Asia/Bangkok"
});
var fmtDate = (iso) => iso ? dateFmt.format(new Date(iso)) : "—";
var fmtDateTime = (iso) => iso ? dateTimeFmt.format(new Date(iso)) : "—";
var fmtBaht = (n) => n.toLocaleString("th-TH", {
	style: "currency",
	currency: "THB"
});
export { STATUS_ORDER as a, URGENCY_LABEL as c, fmtDate as d, fmtDateTime as f, STATUS_LABEL as i, allowedNextStatuses as l, OPEN_STATUSES as n, STATUS_TONE as o, isOverdue as p, ROLE_LABEL as r, TX_LABEL as s, MACHINE_TYPES as t, fmtBaht as u };
