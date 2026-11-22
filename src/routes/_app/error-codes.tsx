import * as React from 'react'
import { createFileRoute } from '@tanstack/react-router'
import { AlertTriangle, BookOpen, Cpu, Search, SearchX, Wrench } from 'lucide-react'

import { EmptyState, PageHeader, Panel } from '@/components/app/shell'
import { Input } from '@/components/ui/input'
import { cn } from '@/lib/utils'

export const Route = createFileRoute('/_app/error-codes')({
  head: () => ({ meta: [{ title: 'คู่มือโค้ด Error · Hatyai Soundstar' }] }),
  component: ErrorCodesPage,
})

interface ErrorCodeEntry {
  brand: 'LG' | 'Samsung' | 'Electrolux' | 'Toshiba' | 'Hitachi' | 'Haier'
  code: string
  category: 'เครื่องซักผ้า' | 'ตู้เย็น'
  title: string
  cause: string
  checkPoints: string[]
  commonParts: string
}

const ERROR_CODES: ErrorCodeEntry[] = [
  // ==================== LG ====================
  {
    brand: 'LG',
    code: 'OE',
    category: 'เครื่องซักผ้า',
    title: 'น้ำไม่ระบายออก / ระบายช้า (Drain Error)',
    cause: 'ท่อน้ำทิ้งอุดตัน ปั๊มเดรนเสีย หรือเซ็นเซอร์ระดับน้ำค้าง',
    checkPoints: [
      'ถอดกรองเศษผ้าด้านล่างขวาตรวจดูเหรียญ/กิ๊บ/เศษผ้าอุดตัน',
      'เช็กสายท่อน้ำทิ้งว่าพับงอหรือวางสูงเกิน 100 ซม. หรือไม่',
      'วัดไฟ 220V ที่ขั้วปั๊มเดรนขณะสั่งปั่นหมาด (ถ้าไฟมาแต่ปั๊มไม่หมุนให้เปลี่ยนปั๊ม)',
    ],
    commonParts: 'ปั๊มเดรนน้ำทิ้ง (Drain Pump), เพรสเชอร์สวิตช์',
  },
  {
    brand: 'LG',
    code: 'IE / 1E',
    category: 'เครื่องซักผ้า',
    title: 'น้ำไม่เข้าเครื่อง / เข้าช้า (Water Inlet Error)',
    cause: 'วาล์วน้ำเข้าเสีย ตะแกรงกรองน้ำตัน หรือแรงดันน้ำประปาอ่อน',
    checkPoints: [
      'ปิดก๊อกน้ำ ถอดสายน้ำดีล้างตะแกรงกรองตรงวาล์วน้ำเข้า',
      'วัดค่าโอห์มคอยล์วาล์วน้ำเข้า (ปกติประมาณ 3.5–4.5 kΩ)',
      'เช็กไฟ AC 220V ที่จ่ายมาจากบอร์ดหลักไปยังวาล์วน้ำ',
    ],
    commonParts: 'วาล์วน้ำเข้า (Inlet Valve)',
  },
  {
    brand: 'LG',
    code: 'dE / dE1 / dE2',
    category: 'เครื่องซักผ้า',
    title: 'ประตูปิดไม่สนิท / สวิตช์ล็อกประตูเสีย (Door Error)',
    cause: 'ตัวล็อกประตู (Door Lock) ชำรุด สลักประตูหัก หรือรีเลย์บนบอร์ดเสีย',
    checkPoints: [
      'ตรวจสอบสลักขอเกี่ยวบานประตูว่าหักหรือบิดเบี้ยวหรือไม่',
      'วัดการทำงานของ Door Lock Switch (ฝาหน้า) หรือสวิตช์แม่เหล็กฝาบน',
      'ตรวจเช็กสายไฟจากบอร์ดไปยังชุดล็อกประตูว่าหนูกัดขาดหรือไม่',
    ],
    commonParts: 'ชุดล็อกประตู (Door Lock Switch)',
  },
  {
    brand: 'LG',
    code: 'UE',
    category: 'เครื่องซักผ้า',
    title: 'ผ้าไม่สมดุลขณะปั่นหมาด (Unbalance Error)',
    cause: 'ผ้ากองรวมกันด้านเดียว ขาตั้งเครื่องไม่เสมอกัน หรือโช้ค/สปริงแขวนถังล้า',
    checkPoints: [
      'จัดกระจายผ้าในถังให้สมดุล แล้วลองสั่งปั่นหมาดใหม่',
      'ปรับระดับขาตั้งทั้ง 4 มุมให้แน่นแนบพื้นไม่โยก',
      'กดถังซักลงเพื่อทดสอบความหนืดของโช้คอัพ (ฝาหน้า) หรือสปริงแขวนถัง (ฝาบน)',
    ],
    commonParts: 'โช้คอัพถังซัก (Shock Absorber), ชุดแขวนถัง (Suspension Rod)',
  },
  {
    brand: 'LG',
    code: 'LE',
    category: 'เครื่องซักผ้า',
    title: 'มอเตอร์ล็อก / หมุนไม่ได้ (Locked Motor Error)',
    cause: 'เซ็นเซอร์ฮอลล์ (Hall Sensor) เสีย ลูกปืนถังแตก หรือผ้าติดซอกถัง',
    checkPoints: [
      'ลองหมุนถังซักด้วยมือเปล่าว่าฝืดหรือมีเสียงลูกปืนแตกหรือไม่',
      'ถอดฝาหลังวัดค่า Hall Sensor บนขดลวดสเตเตอร์ (รุ่น Direct Drive)',
      'ตรวจดูปลั๊กสายไฟเข้ามอเตอร์ว่าหลวมหรือเกิดคราบออกไซด์หรือไม่',
    ],
    commonParts: 'Hall Sensor (6501KW2002A), ชุดลูกปืนและซีลกันน้ำ',
  },
  {
    brand: 'LG',
    code: 'PE',
    category: 'เครื่องซักผ้า',
    title: 'เซ็นเซอร์ระดับน้ำผิดปกติ (Pressure Sensor Error)',
    cause: 'เพรสเชอร์สวิตช์เสีย สายยางลมรั่ว/หลุด หรือปลั๊กสายไฟขึ้นสนิม',
    checkPoints: [
      'ตรวจสายยางลมที่ต่อจากก้นถังขึ้นมาที่ตัวเพรสเชอร์ว่าหลุดหรือรั่วหรือไม่',
      'ถอดปลั๊ก 3 ขาของเพรสเชอร์สวิตช์ทำความสะอาดคราบออกไซด์',
      'ลองเปลี่ยนเพรสเชอร์สวิตช์ตัวใหม่ทดสอบ',
    ],
    commonParts: 'เพรสเชอร์สวิตช์ (Water Level Sensor)',
  },
  {
    brand: 'LG',
    code: 'Er FF / Er dH',
    category: 'ตู้เย็น',
    title: 'พัดลมช่องฟรีซไม่หมุน / ระบบละลายน้ำแข็งขัดข้อง',
    cause: 'มอเตอร์พัดลมช่องฟรีซเสีย น้ำแข็งเกาะคอยล์เย็นหนา หรือฮีตเตอร์/ฟิวส์ขาด',
    checkPoints: [
      'เปิดฝาครอบคอยล์เย็นช่องฟรีซ เช็กว่ามีน้ำแข็งเกาะพัดลมหรือไม่',
      'วัดค่าความต้านทานฮีตเตอร์ละลายน้ำแข็ง และเทอร์โมฟิวส์',
      'เช็กไฟ DC 12V ที่จ่ายเข้ามอเตอร์พัดลมช่องฟรีซ',
    ],
    commonParts: 'มอเตอร์พัดลมช่องฟรีซ, ชุดเซ็นเซอร์ + เทอร์โมฟิวส์, ฮีตเตอร์',
  },

  // ==================== Samsung ====================
  {
    brand: 'Samsung',
    code: '5E / SE / 5C',
    category: 'เครื่องซักผ้า',
    title: 'ระบบระบายน้ำทิ้งขัดข้อง (Drain Error)',
    cause: 'ปั๊มเดรนอุดตันหรือเสีย ท่อน้ำทิ้งพับงอ',
    checkPoints: [
      'เปิดฝาเล็กด้านล่างหน้าเครื่อง ระบายน้ำฉุกเฉินและหมุนกรองเศษผ้าออกมาล้าง',
      'ตรวจดูใบพัดปั๊มเดรนด้านในว่ามีเศษเหรียญหรือไม้จิ้มฟันขัดอยู่หรือไม่',
      'วัดไฟเลี้ยงปั๊มเดรน 220V ขณะสั่งโหมด Spin',
    ],
    commonParts: 'ปั๊มเดรนน้ำทิ้ง Samsung (DC31-00054A / DC31-00181A)',
  },
  {
    brand: 'Samsung',
    code: '4E / 4C',
    category: 'เครื่องซักผ้า',
    title: 'น้ำไม่เข้าเครื่อง (Water Supply Error)',
    cause: 'วาล์วน้ำเข้าเสีย ตะแกรงกรองตัน หรือต่อสายน้ำร้อน/เย็นสลับกัน',
    checkPoints: [
      'เช็กวาล์วน้ำประปาและตะแกรงกรองตรงจุดต่อสายน้ำเข้า',
      'ทดสอบวัดค่าโอห์มวาล์วน้ำเข้า (ต้องมีทั้งวาล์วน้ำซักและน้ำยาปรับผ้านุ่ม)',
    ],
    commonParts: 'วาล์วน้ำเข้าคู่/เดี่ยว Samsung',
  },
  {
    brand: 'Samsung',
    code: 'dE / dC / Ed',
    category: 'เครื่องซักผ้า',
    title: 'ประตูปิดไม่ล็อก (Door Error)',
    cause: 'สวิตช์ล็อกประตูเสีย (ฝาหน้า) หรือสวิตช์ฝาถัง/แม่เหล็กหลุด (ฝาบน)',
    checkPoints: [
      'เช็กบานพับประตูว่าตกทำให้สลักไม่ตรงรูหรือไม่',
      'เปลี่ยนตัวล็อกประตู (Door Lock) หรือเช็กสายไฟเข้าสวิตช์ประตู',
    ],
    commonParts: 'สวิตช์ล็อกประตู Samsung (DC64-00519D / DC34-00025A)',
  },
  {
    brand: 'Samsung',
    code: 'UE / Ub / E4',
    category: 'เครื่องซักผ้า',
    title: 'ถังปั่นเสียสมดุล (Unbalance Error)',
    cause: 'โช้คอัพ/แกนแขวนถังเสื่อมสภาพ หรือผ้าพันกันเป็นก้อน',
    checkPoints: [
      'กดถังซักฝาบนลงแล้วปล่อย ถ้าถังเด้งขึ้นลงหลายครั้งแสดงว่าโช้คแขวนถังเสื่อม',
      'ตรวจสอบระดับน้ำหล่อสมดุลในขอบถังซักด้านบนว่ามีรอยรั่วซึมหรือไม่',
    ],
    commonParts: 'ชุดโช้คแขวนถังซัก 4 ต้น (Suspension Rod)',
  },
  {
    brand: 'Samsung',
    code: '3E / 3C',
    category: 'เครื่องซักผ้า',
    title: 'มอเตอร์ไม่หมุน / รอบมอเตอร์ผิดปกติ (Motor Error)',
    cause: 'บอร์ดอินเวอร์เตอร์เสีย สายไฟมอเตอร์ขาด หรือมอเตอร์ช็อต',
    checkPoints: [
      'วัดค่าความต้านทานขดลวดมอเตอร์ทั้ง 3 เฟส (U-V-W) ต้องเท่ากัน',
      'ตรวจดูสายไฟใต้ถังว่าถูกหนูกัดหรือหลุดจากตัวล็อกหรือไม่',
    ],
    commonParts: 'บอร์ดควบคุมหลัก / ชุดสายไฟมอเตอร์',
  },
  {
    brand: 'Samsung',
    code: '22E / 22C',
    category: 'ตู้เย็น',
    title: 'พัดลมช่องแช่เย็นขัดข้อง (Fridge Fan Error)',
    cause: 'พัดลมช่องแช่เย็นไม่หมุน น้ำแข็งเกาะใบพัด หรือเซ็นเซอร์อุณหภูมิเพี้ยน',
    checkPoints: [
      'ตรวจดูน้ำแข็งเกาะบริเวณช่องลมเย็นด้านหลังแผงควบคุมในตู้เย็น',
      'วัดไฟ DC 12V เข้าพัดลมและทดสอบหมุนใบพัดด้วยมือ',
    ],
    commonParts: 'มอเตอร์พัดลมช่องแช่เย็น, เซ็นเซอร์น้ำแข็ง (Defrost Sensor)',
  },

  // ==================== Electrolux ====================
  {
    brand: 'Electrolux',
    code: 'E10 / E11',
    category: 'เครื่องซักผ้า',
    title: 'น้ำเข้าเครื่องช้าหรือน้ำไม่เข้า (Water Fill Error)',
    cause: 'วาล์วน้ำเข้าเสีย ตะแกรงอุดตัน หรือแรงดันน้ำต่ำกว่าเกณฑ์',
    checkPoints: [
      'ล้างตะแกรงกรองตรงข้อต่อสายน้ำเข้าทั้งฝั่งก๊อกและฝั่งเครื่อง',
      'เช็กการทำงานของวาล์วน้ำเข้าทั้ง 2 คอยล์ (Pre-wash และ Main-wash)',
    ],
    commonParts: 'วาล์วน้ำเข้าคู่ Electrolux',
  },
  {
    brand: 'Electrolux',
    code: 'E20 / E21',
    category: 'เครื่องซักผ้า',
    title: 'ระบายน้ำทิ้งไม่ได้ (Drain Error)',
    cause: 'ปั๊มเดรนเสีย กรองเศษผ้าตัน หรือเพรสเชอร์สวิตช์ค้าง',
    checkPoints: [
      'เปิดฝาด้านล่างขวาหมุนไส้กรองปั๊มเดรนออกมาทำความสะอาด',
      'ลองสั่งโหมด Drain แล้วฟังเสียงปั๊มเดรน (ถ้าเสียงดังครืดๆ แต่ไม่สูบน้ำให้เปลี่ยนปั๊ม)',
    ],
    commonParts: 'มอเตอร์ปั๊มเดรน Electrolux (Askoll)',
  },
  {
    brand: 'Electrolux',
    code: 'E40 / E41 / E42',
    category: 'เครื่องซักผ้า',
    title: 'ประตูไม่ล็อก (Door Lock Error)',
    cause: 'ตัวล็อกประตู (Door Interlock) เสีย หรือไตรแอคคุมประตูบนบอร์ดช็อต',
    checkPoints: [
      'ตรวจดูร่องล็อกประตูและหัวล็อกว่าสึกหรอหรือไม่',
      'ถอดชุดล็อกประตูตรวจเช็กปลั๊กเสียบ (มักพบรอยไหม้หากไตรแอคบนบอร์ดช็อต)',
    ],
    commonParts: 'สวิตช์ล็อกประตู Electrolux (PTC / Solenoid)',
  },
  {
    brand: 'Electrolux',
    code: 'EHO / EH0',
    category: 'เครื่องซักผ้า',
    title: 'แรงดันไฟฟ้าผิดปกติ (Power Supply Error)',
    cause: 'ไฟตก ไฟเกิน หรือวงจรตรวจจับแรงดันไฟบนบอร์ดหลักมีปัญหา',
    checkPoints: [
      'วัดแรงดันไฟบ้านลูกค้า (ต้องอยู่ในช่วง 200V–240V)',
      'หากไฟบ้านปกติแต่ยังขึ้น EHO แสดงว่าวงจร Sense ไฟบนเมนบอร์ดเสีย',
    ],
    commonParts: 'เมนบอร์ดหลัก (Main PCB)',
  },

  // ==================== Toshiba / Hitachi / Haier ====================
  {
    brand: 'Toshiba',
    code: 'E1',
    category: 'เครื่องซักผ้า',
    title: 'น้ำไม่ระบายออกภายในเวลาที่กำหนด',
    cause: 'มอเตอร์เดรน (Drain Motor) ไม่ดึงวาล์วน้ำทิ้ง หรือท่อน้ำทิ้งตัน',
    checkPoints: [
      'ตรวจเช็กสายพาน/สลิงของมอเตอร์เดรนใต้ถังว่าดึงสุดระยะหรือไม่',
      'ถอดลูกยางวาล์วน้ำทิ้งใต้ถังตรวจดูเหรียญหรือกิ๊บติดผม',
    ],
    commonParts: 'มอเตอร์เดรน Toshiba (2 สาย / 3 สาย), ลูกยางวาล์วน้ำทิ้ง',
  },
  {
    brand: 'Toshiba',
    code: 'E2 / E21',
    category: 'เครื่องซักผ้า',
    title: 'ฝาถังเปิดอยู่ / สวิตช์ฝาถังเสีย',
    cause: 'แม่เหล็กฝาถังหลุดหาย หรือ Reed Switch / Safety Switch เสีย',
    checkPoints: [
      'เช็กแม่เหล็กตรงขอบฝาถังด้านหน้าขวาว่ายังอยู่ครบหรือไม่',
      'วัดความต่อเนื่องของสวิตช์ประตูขณะปิดฝาถัง',
    ],
    commonParts: 'สวิตช์ฝาถัง Toshiba',
  },
  {
    brand: 'Hitachi',
    code: 'C01 / C02',
    category: 'เครื่องซักผ้า',
    title: 'น้ำไม่เข้า (C01) / น้ำไม่ระบายออก (C02)',
    cause: 'วาล์วน้ำเข้าเสีย (C01) หรือปั๊มเดรน/มอเตอร์ดึงน้ำทิ้งเสีย (C02)',
    checkPoints: [
      'C01: ตรวจก๊อกน้ำ ตะแกรงกรอง และวัดไฟเข้าวาล์วน้ำ',
      'C02: ตรวจกรองเศษผ้า ท่อน้ำทิ้ง และวัดการทำงานของปั๊มเดรน',
    ],
    commonParts: 'วาล์วน้ำเข้า Hitachi, ปั๊มเดรนน้ำทิ้ง',
  },
  {
    brand: 'Hitachi',
    code: 'C04',
    category: 'เครื่องซักผ้า',
    title: 'ผ้าไม่สมดุลขณะปั่นหมาด (Unbalance)',
    cause: 'โช้คแขวนถังล้า หรือเครื่องตั้งเอียงไม่ได้ระดับ',
    checkPoints: [
      'เช็กลูกน้ำวัดระดับที่ขอบเครื่องให้อยู่ตรงกลางวงกลม',
      'ตรวจสอบโช้คแขวนถังทั้ง 4 ต้นว่ามีน้ำมันรั่วซึมหรือสปริงล้าหรือไม่',
    ],
    commonParts: 'ชุดโช้คแขวนถังซัก Hitachi',
  },
  {
    brand: 'Haier',
    code: 'E1 / E2',
    category: 'เครื่องซักผ้า',
    title: 'E1 น้ำไม่ระบายออก / E2 ฝาถังเปิดอยู่',
    cause: 'E1 ปั๊มเดรนหรือมอเตอร์เดรนเสีย / E2 สวิตช์แม่เหล็กฝาถังเสีย',
    checkPoints: [
      'E1: ตรวจท่อน้ำทิ้งและวัดไฟเข้าชุดเดรนน้ำทิ้ง',
      'E2: ตรวจแม่เหล็กฝาถังและสายไฟสวิตช์ฝาถังด้านหลังแผงควบคุม',
    ],
    commonParts: 'มอเตอร์เดรน Haier, สวิตช์ฝาถัง',
  },
]

const BRANDS = ['ทั้งหมด', 'LG', 'Samsung', 'Electrolux', 'Toshiba', 'Hitachi', 'Haier'] as const

function ErrorCodesPage() {
  const [query, setQuery] = React.useState('')
  const [selectedBrand, setSelectedBrand] = React.useState<(typeof BRANDS)[number]>('ทั้งหมด')

  const needle = query.trim().toLowerCase()
  const filtered = React.useMemo(() => {
    return ERROR_CODES.filter((item) => {
      if (selectedBrand !== 'ทั้งหมด' && item.brand !== selectedBrand) return false
      if (!needle) return true
      return [item.brand, item.code, item.category, item.title, item.cause, item.commonParts, ...item.checkPoints]
        .join(' ')
        .toLowerCase()
        .includes(needle)
    })
  }, [query, selectedBrand, needle])

  return (
    <>
      <PageHeader
        eyebrow="Field technician guide"
        title="คู่มือโค้ด Error เครื่องซักผ้าและตู้เย็น"
        description="ค้นหารหัส Error เพื่อดูสาเหตุ จุดตรวจเช็กหน้างาน และอะไหล่ที่มักเสียได้ทันที"
      />

      <div className="mb-4 flex flex-col gap-3">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="พิมพ์โค้ด Error เช่น OE, 5E, dE, E20, UE, น้ำไม่ทิ้ง, ประตูไม่ล็อก..."
            className="h-11 bg-card pl-9 font-ticket"
          />
        </div>

        <div className="flex flex-wrap gap-1.5">
          {BRANDS.map((brand) => (
            <button
              key={brand}
              type="button"
              onClick={() => setSelectedBrand(brand)}
              className={cn(
                'rounded-full border px-3 py-1 text-xs font-semibold transition-colors',
                selectedBrand === brand
                  ? 'border-primary bg-primary text-primary-foreground'
                  : 'border-border bg-card text-foreground hover:bg-muted',
              )}
            >
              {brand}
            </button>
          ))}
        </div>
      </div>

      <p className="mb-3 text-xs text-muted-foreground">
        แสดง {filtered.length} จากทั้งหมด {ERROR_CODES.length} รายการ
      </p>

      {filtered.length === 0 ? (
        <EmptyState
          icon={SearchX}
          title="ไม่พบโค้ด Error ที่ค้นหา"
          description="ลองค้นหาด้วยรหัสสั้นๆ เช่น OE, 5E, E10 หรือพิมพ์อาการเสีย เช่น น้ำไม่เข้า"
        />
      ) : (
        <div className="grid gap-4 md:grid-cols-2">
          {filtered.map((item, idx) => (
            <Panel key={`${item.brand}-${item.code}-${idx}`} className="flex flex-col justify-between">
              <div>
                <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border pb-2.5">
                  <div className="flex items-center gap-2">
                    <span className="rounded-lg bg-primary px-2.5 py-1 font-ticket text-base font-bold text-primary-foreground">
                      {item.code}
                    </span>
                    <span className="rounded-md bg-secondary px-2 py-0.5 text-xs font-bold text-secondary-foreground">
                      {item.brand}
                    </span>
                  </div>
                  <span className="text-[11px] font-medium text-muted-foreground">{item.category}</span>
                </div>

                <h3 className="mt-3 text-sm font-bold text-foreground">{item.title}</h3>
                <p className="mt-1 flex items-start gap-1.5 text-xs text-amber-800 dark:text-amber-300">
                  <AlertTriangle className="mt-0.5 size-3.5 shrink-0 text-amber-600" />
                  <span>
                    <strong>สาเหตุ:</strong> {item.cause}
                  </span>
                </p>

                <div className="mt-3">
                  <p className="mb-1 flex items-center gap-1 text-xs font-semibold text-foreground">
                    <Wrench className="size-3.5 text-primary" /> จุดตรวจเช็กหน้างาน:
                  </p>
                  <ul className="list-disc space-y-1 pl-5 text-xs text-muted-foreground">
                    {item.checkPoints.map((pt, i) => (
                      <li key={i}>{pt}</li>
                    ))}
                  </ul>
                </div>
              </div>

              <div className="mt-4 flex items-center gap-2 rounded-xl border border-border bg-muted/50 px-3 py-2 text-xs">
                <Cpu className="size-4 shrink-0 text-primary" />
                <span>
                  <strong className="text-foreground">อะไหล่ที่มักเสีย:</strong>{' '}
                  <span className="text-muted-foreground">{item.commonParts}</span>
                </span>
              </div>
            </Panel>
          ))}
        </div>
      )}

      <div className="mt-6 flex items-center gap-2 rounded-xl border border-border bg-card px-4 py-3 text-xs text-muted-foreground">
        <BookOpen className="size-4 shrink-0 text-primary" />
        <span>
          หมายเหตุ: รหัส Error อาจแตกต่างกันเล็กน้อยตามรุ่นย่อยและปีผลิต ควรตรวจสอบร่วมกับวงจรไฟฟ้าที่ฝาหลังเครื่องทุกครั้ง
        </span>
      </div>
    </>
  )
}
