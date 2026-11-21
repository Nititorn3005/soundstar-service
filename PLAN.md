# Hatyai Soundstar — แผนพัฒนาระบบ (Product Roadmap)

ระบบบริหารงานซ่อมเครื่องซักผ้าของ บริษัท หาดใหญ่ซาวด์สตาร์ จำกัด เป็นระบบขนาดใหญ่หลายส่วน
จึงเริ่มจากหน้าจอที่ใช้งานได้จริงทั้งหมดก่อน แล้วค่อยต่อฐานข้อมูล ระบบยืนยันตัวตน และความปลอดภัยฝั่งเซิร์ฟเวอร์เป็นลำดับ
แต่ละ Milestone ส่งมอบได้ในตัวเอง

Stack ที่ตกลงไว้: React + TypeScript + Vite (TanStack Start), Supabase (PostgreSQL / Auth / Storage),
Server Functions บน Netlify, GitHub, Netlify

---

## ✅ Milestone 1 — หน้าจอผลิตภัณฑ์ (เสร็จแล้ว)

- หน้าเข้าสู่ระบบด้วยชื่อผู้ใช้ + หน้า Setup Wizard สร้างผู้ดูแลระบบคนแรก
- App shell ภาษาไทย: แถบเมนูด้านข้าง (เดสก์ท็อป) / เมนูสไลด์ (มือถือ) ครบ 12 เมนู กรองตามบทบาท
- แดชบอร์ด, รับแจ้งงานซ่อม, รายการงานซ่อม, รายละเอียดงาน (เปลี่ยนสถานะ มอบหมายช่าง เบิกอะไหล่ ประวัติ พิมพ์ A4)
- สต๊อกอะไหล่, รับเข้า/ปรับยอด, เบิกออก, ประวัติสต๊อก (ย้อนรายการแบบไม่ลบประวัติ)
- จัดการผู้ใช้งาน (เพิ่ม แก้ไข ระงับ รีเซ็ตรหัสผ่าน), รายงาน (CSV/พิมพ์), ตั้งค่าบริษัท
- Loading / Empty / Error / Toast ครบ
- ข้อมูลยังเป็นข้อมูลตัวอย่างในหน่วยความจำ (`src/lib/fixtures.ts` ผ่าน `src/lib/store.tsx`) — รีเฟรชแล้วรีเซ็ต

## Milestone 2 — โครงสร้างฐานข้อมูล Supabase

- Migration SQL ใน `supabase/migrations/`:
  `companies`, `profiles` (FK → `auth.users`, `username` unique, `role` enum, `is_active`, `deleted_at`),
  `repair_jobs`, `repair_job_history`, `repair_job_parts`, `repair_job_photos`,
  `inventory_items`, `inventory_transactions`, `notifications`, `audit_logs`, `login_attempts`, `idempotency_keys`
- เลขที่ใบงาน: sequence + ฟังก์ชัน `next_job_no()` รูปแบบ `HS-YYMM-NNNN` พร้อม unique constraint
- Check constraints: `on_hand >= 0`, สถานะเป็น enum, qty ≠ 0
- Indexes สำหรับค้นหา (job_no, phone, customer_name trigram, status, technician_id, created_at)
- Soft delete (`deleted_at`) บนข้อมูลหลัก; ประวัติ/ธุรกรรมเป็น append-only (REVOKE UPDATE/DELETE)
- Trigger เขียน `audit_logs` เมื่อแก้ไข profiles, repair_jobs, inventory_items, companies
- Seed ข้อมูลบริษัทเริ่มต้น
- `.env.example` (เฉพาะชื่อตัวแปร), อัปเดต `.gitignore`

## Milestone 3 — Auth ด้วยชื่อผู้ใช้ + Setup Wizard ที่ปลอดภัย

- Server function `login(username, password)`: แปลงเป็นอีเมลภายใน `<username>@staff.hatyai-soundstar.internal`
  แล้วเรียก Supabase Auth ฝั่งเซิร์ฟเวอร์ ส่ง session กลับเป็น cookie แบบ httpOnly
- Rate limiting: นับความล้มเหลวต่อ username + IP ในตาราง `login_attempts` (เช่น 5 ครั้ง / 15 นาที แล้วล็อกชั่วคราว)
- ตรวจ `profiles.is_active` ทุก request; ระงับบัญชี = revoke sessions ทันที
- เปลี่ยนรหัสผ่านของตัวเอง; บังคับเปลี่ยนรหัสหลังรีเซ็ต (`must_change_password`)
- Setup Wizard: server function ตรวจ `SETUP_TOKEN` (env ฝั่งเซิร์ฟเวอร์เท่านั้น, เทียบแบบ constant-time)
  และเรียก RPC `bootstrap_first_admin()` ที่ใช้ advisory lock ตรวจว่ายังไม่มี ADMIN แล้วสร้างใน transaction เดียว
  หลังสำเร็จ endpoint จะตอบ 410 ทุกครั้ง
- Route guard ฝั่งเซิร์ฟเวอร์ (`beforeLoad`) แทนการ redirect ฝั่ง client

## Milestone 4 — จัดการผู้ใช้งานจริง

- Server functions (ADMIN เท่านั้น, ตรวจ role จากฐานข้อมูล ไม่เชื่อ client) ใช้ Supabase Admin API ด้วย Service Role Key ฝั่งเซิร์ฟเวอร์
  สร้างผู้ใช้ → สร้าง `auth.users` + `profiles` คู่กัน (rollback ถ้าขั้นใดล้มเหลว) โดยไม่กระทบ session ของ ADMIN
- แก้ไขข้อมูล, เปลี่ยนบทบาท, ระงับ/เปิดใช้งาน, รีเซ็ตรหัสผ่าน
- ห้ามแก้ role/สถานะของตัวเอง, ห้ามลด ADMIN คนสุดท้าย
- RLS: ผู้ใช้อ่าน profile ตัวเองได้ แต่ห้าม UPDATE คอลัมน์ `role`/`is_active`
- แสดง audit log การเปลี่ยนแปลงบัญชีในหน้า “จัดการผู้ใช้งาน”

## Milestone 5 — งานซ่อมบนฐานข้อมูลจริง

- แทนที่ action ใน `store.tsx` ด้วย server functions + route loaders
- RPC `create_repair_job()` พร้อม idempotency key กันกดซ้ำ
- RPC `change_job_status()` ตรวจตาราง transition + สิทธิ์ (ตรรกะเดียวกับ `src/lib/domain.ts`) และเขียน history ใน transaction เดียว
- RLS: TECH เห็นเฉพาะงานที่ได้รับมอบหมาย; FRONT แก้ได้เฉพาะข้อมูลการรับงาน
- ค้นหา/กรองฝั่งเซิร์ฟเวอร์ + pagination

## Milestone 6 — สต๊อกอะไหล่บนฐานข้อมูลจริง

- RPC `move_stock()` ใช้ `SELECT … FOR UPDATE` บนแถวอะไหล่ ป้องกันยอดติดลบเมื่อหลายคนเบิกพร้อมกัน + idempotency key
- RPC `reverse_transaction()` สร้างรายการย้อนกลับ (ห้ามย้อนซ้ำด้วย unique `reverses_id`)
- ซ่อนคอลัมน์ราคาทุนจาก non-ADMIN ด้วย view/column privileges
- แจ้งเตือนอะไหล่ต่ำกว่าขั้นต่ำลงตาราง `notifications`

## Milestone 7 — รูปภาพและไฟล์แนบ (Supabase Storage)

- Bucket ส่วนตัว `job-photos` (ไม่ public), จำกัด JPG/PNG/WebP/HEIC ≤ 5 MB, ตรวจ MIME ฝั่งเซิร์ฟเวอร์
- อัปโหลดผ่าน signed upload URL; แสดงผลด้วย signed URL อายุสั้น
- Storage policies ผูกกับสิทธิ์ดูใบงาน; แยกรูปก่อนซ่อม / หลังซ่อม

## Milestone 8 — แดชบอร์ด รายงาน และใบงาน PDF

- Query สรุป (views / RPC) สำหรับตัวเลขแดชบอร์ดและงานของช่างแต่ละคน
- รายงานกรองวันที่/สถานะ/ช่างฝั่งเซิร์ฟเวอร์, ส่งออก CSV
- ปรับ print stylesheet ใบงาน A4 (มีอยู่แล้ว) + ตัวเลือกดาวน์โหลด PDF

## Milestone 9 — ทดสอบ ความปลอดภัย และส่งมอบ

- Unit tests: transition rules, validation; integration tests สำหรับ RPC (สต๊อกพร้อมกัน, bootstrap ครั้งเดียว, ยกระดับสิทธิ์ไม่ได้)
- ตรวจ client bundle ไม่มี secret; ตรวจ RLS ด้วยบัญชีแต่ละบทบาท
- คู่มือภาษาไทย: ตั้งค่า Supabase + Environment Variables บน Netlify, สร้าง ADMIN คนแรก, สำรอง/กู้คืนข้อมูล (pg_dump / Supabase backups)

---

### สิ่งที่ต้องเตรียมจากเจ้าของระบบ (ก่อน Milestone 2)

1. สร้าง Supabase project
2. ตั้ง Environment Variables บน Netlify: `SUPABASE_URL`, `SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY` (ฝั่งเซิร์ฟเวอร์เท่านั้น), `SETUP_TOKEN` (สุ่มยาว ≥ 32 ตัวอักษร)
   — ตั้งผ่านหน้า Netlify โดยตรง ไม่ต้องส่งค่าในแชต
