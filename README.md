# Hatyai Soundstar — ระบบบริหารงานซ่อมเครื่องซักผ้า

เว็บแอปสำหรับ บริษัท หาดใหญ่ซาวด์สตาร์ จำกัด ใช้รับแจ้งงานซ่อม มอบหมายช่าง ติดตามสถานะ
บริหารสต๊อกอะไหล่ จัดการบัญชีพนักงาน และดูรายงาน ใช้งานได้ทั้งมือถือ แท็บเล็ต และคอมพิวเตอร์ ภาษาไทยทั้งระบบ

## สถานะปัจจุบัน

หน้าจอทั้งหมดเปิดใช้และคลิกใช้งานได้ โดยใช้ข้อมูลตัวอย่างในหน่วยความจำ (`src/lib/fixtures.ts`)
ข้อมูลจะรีเซ็ตเมื่อรีเฟรชหน้า ขั้นต่อไปคือเชื่อม Supabase, ระบบ Login จริง และ Setup Token ฝั่งเซิร์ฟเวอร์ — ดู [PLAN.md](PLAN.md)

บัญชีทดลอง: `admin01`, `front01`, `tech01` (รหัสผ่านใดก็ได้ในโหมดตัวอย่าง)

## เทคโนโลยี

- React 19 + TypeScript + Vite 8 ผ่าน TanStack Start (file-based routing, server functions)
- Tailwind CSS 4 + shadcn/ui (Radix), lucide-react, sonner
- ฟอนต์ Anuphan / IBM Plex Sans Thai / JetBrains Mono
- Deploy บน Netlify (`@netlify/vite-plugin-tanstack-start`)
- แผนต่อไป: Supabase PostgreSQL, Auth, Storage

## รันบนเครื่อง

```bash
pnpm install
pnpm dev          # http://localhost:3000
# หรือใช้ Netlify CLI เพื่อจำลองฟีเจอร์ของ Netlify
netlify dev
```

คำสั่งอื่น: `pnpm typecheck`, `pnpm lint`, `pnpm test`, `pnpm build`

## หน้าจอ

| เส้นทาง | หน้าจอ | บทบาท |
| --- | --- | --- |
| `/` | เข้าสู่ระบบ | ทุกคน |
| `/setup` | สร้างผู้ดูแลระบบคนแรก | ครั้งแรกเท่านั้น |
| `/dashboard` | แดชบอร์ด | ทุกบทบาท |
| `/jobs/new` | รับแจ้งงานซ่อม | ADMIN, FRONT |
| `/jobs` | รายการงานซ่อม | ทุกบทบาท (TECH เห็นเฉพาะงานตน) |
| `/jobs/:id` | รายละเอียดงานซ่อม / พิมพ์ A4 | ตามสิทธิ์ |
| `/inventory` | สต๊อกอะไหล่ | ADMIN, TECH |
| `/inventory/receive` | รับอะไหล่เข้า / ปรับยอด | ADMIN |
| `/inventory/issue` | เบิกอะไหล่ออก | ADMIN, TECH |
| `/inventory/history` | ประวัติสต๊อก | ADMIN, TECH |
| `/users` | จัดการผู้ใช้งาน | ADMIN |
| `/reports` | รายงาน | ADMIN |
| `/settings` | ตั้งค่าบริษัท | ADMIN |

## Roadmap

ดูรายละเอียดใน [PLAN.md](PLAN.md): ฐานข้อมูล Supabase → Login ด้วยชื่อผู้ใช้ + Setup Token →
จัดการผู้ใช้จริง → งานซ่อม/สต๊อกบน RPC แบบ transaction → Storage รูปภาพ → รายงาน → ทดสอบและคู่มือ


