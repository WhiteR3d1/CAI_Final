import type { JobId, KBlock } from '../game/types.ts'

export interface ManualUnit {
  no: number
  title: string
  pages: string
  summary: string
  blocks: KBlock[]
  /** key terms with a short Thai gloss */
  terms: string[]
  jobs: JobId[]
  cautions?: string[]
}

// Summaries of the user's content sheet "การติดตั้งระบบปฏิบัติการ Windows" (15 pages).
// Page numbers refer to the sheet's own "หน้า X/15". No images from the sheet or the textbook are used.
export const MANUAL: ManualUnit[] = [
  {
    no: 1,
    title: 'การสร้าง USB Boot ด้วยโปรแกรม Rufus',
    pages: 'ใบเนื้อหา หน้า 1–3',
    summary: 'ติดตั้ง Windows 10 ด้วย USB เริ่มจากสร้าง USB Boot ด้วยโปรแกรม Rufus: ดาวน์โหลด → เสียบ USB → เปิด Rufus ตั้งค่าแล้วกด Start',
    blocks: [
      {
        kind: 'text',
        text: 'ระบบปฏิบัติการ**มาตรฐานปิด**ต้องมีลิขสิทธิ์จึงนำมาติดตั้งและใช้งานได้ ระบบที่ได้รับความนิยมและพัฒนาโดยบริษัทไมโครซอฟท์ เช่น Windows 7 และ Windows 10 เนื้อหานี้เป็นการติดตั้ง **Windows 10 ด้วย USB**',
      },
      {
        kind: 'flow',
        title: 'สร้าง USB Boot 3 ขั้น',
        steps: [
          { label: '1. ดาวน์โหลด Rufus', sub: 'ค้นหาด้วยเครื่องมือค้นหา เช่น Google' },
          { label: '2. เสียบ USB', sub: 'ตรวจว่าเครื่องมองเห็น' },
          { label: '3. เปิด Rufus', sub: 'จาก Taskbar หรือที่เก็บไฟล์ดาวน์โหลด' },
        ],
      },
      {
        kind: 'table',
        title: 'ส่วนที่ต้องกำหนดใน Rufus',
        head: ['ช่อง', 'ใช้ทำอะไร'],
        rows: [
          ['Device', 'แสดงชื่อ USB Flash Drive ที่เลือกใช้ (ข้อมูลในอุปกรณ์นี้จะถูกลบ)'],
          ['Partition scheme', 'รูปแบบของพาร์ทิชัน เลือกให้เหมาะกับเครื่องและฮาร์ดดิสก์'],
          ['File system / Cluster size', 'ตัวอย่างใช้ NTFS และ 4096'],
          ['ไฟล์ ISO', 'ไฟล์ Windows 10 ที่จะนำไปสร้างเป็น USB Boot'],
        ],
      },
      {
        kind: 'table',
        title: 'ตัวเลือก Partition scheme',
        head: ['ตัวเลือก', 'ใช้กับเครื่องแบบ'],
        rows: [
          ['MBR partition scheme for BIOS or UEFI computers', 'BIOS หรือ UEFI ก็ได้'],
          ['MBR partition scheme for UEFI computer', 'UEFI เท่านั้น'],
          ['GPT partition scheme for UEFI computer', 'UEFI เท่านั้น'],
        ],
      },
      {
        kind: 'note',
        tone: 'tip',
        text: 'ตั้งค่าเสร็จกด **Start** เมื่อสร้างเสร็จ USB นี้ใช้ติดตั้ง Windows 10 ได้ แต่ก่อนติดตั้งต้องตั้งค่า BIOS ให้เครื่องบูตจาก USB ก่อน',
      },
    ],
    terms: ['USB Boot (แฟลชไดรฟ์สำหรับติดตั้ง)', 'Rufus', 'ISO (ไฟล์ติดตั้งระบบ)', 'Device (อุปกรณ์)', 'Partition scheme (รูปแบบพาร์ทิชัน)', 'MBR / GPT', 'NTFS', 'Cluster size'],
    jobs: ['make-usb', 'reinstall'],
    cautions: ['ใบเนื้อหาระบุว่าตัวอย่างใช้ Rufus เวอร์ชัน 3.4 แต่ภาพประกอบเป็นเวอร์ชันเก่ากว่า หน้าตาโปรแกรมจึงต่างกันได้ ให้ดูชื่อช่องเป็นหลัก'],
  },
  {
    no: 2,
    title: 'การกำหนดค่า BIOS ก่อนติดตั้ง',
    pages: 'ใบเนื้อหา หน้า 3–6',
    summary: 'ตั้งให้เครื่องบูต (เริ่มระบบ) จาก USB ก่อนฮาร์ดดิสก์: F2 → แท็บ Boot → Hard Disk Drives → 1st Drive = USB → F10 → OK',
    blocks: [
      {
        kind: 'table',
        title: 'ขั้นที่ 1–7',
        head: ['ขั้น', 'ทำอะไร'],
        rows: [
          ['1', 'Restart เครื่อง แล้วกดปุ่มเข้าหน้าตั้งค่า BIOS (ตัวอย่างใช้ F2)'],
          ['2', 'ใช้ปุ่มลูกศรไปที่แท็บ Boot แล้วเข้าเมนู Boot Device Priority'],
          ['3', 'เลือก Hard Disk Drives แล้วกด Enter'],
          ['4', 'เลือก 1st Drive (อุปกรณ์บูตลำดับแรก)'],
          ['5', 'เลือก USB ที่เตรียมไว้ แล้วกด Enter'],
          ['6', 'USB ขึ้นเป็นลำดับแรกแล้ว กด F10 เพื่อบันทึกและออก'],
          ['7', 'เลือก OK แล้วกด Enter เครื่องจะบูตจาก USB เข้าสู่การติดตั้ง'],
        ],
      },
      {
        kind: 'table',
        title: 'ปุ่มในหน้า BIOS',
        head: ['ปุ่ม', 'หน้าที่'],
        rows: [
          ['← →', 'Select Screen เลือกแท็บ'],
          ['↑ ↓', 'Select Item เลือกรายการ'],
          ['Enter', 'เข้าเมนูย่อย / เลือกค่า'],
          ['F10', 'Save and Exit บันทึกและออก'],
          ['Esc', 'Exit ย้อนกลับหรือออก'],
        ],
      },
      {
        kind: 'note',
        tone: 'warn',
        text: 'ถ้าออกโดยไม่บันทึก ลำดับบูตที่ตั้งไว้จะไม่มีผล เครื่องจะบูตจากฮาร์ดดิสก์เหมือนเดิม',
      },
    ],
    terms: ['BIOS (โปรแกรมพื้นฐานของเมนบอร์ด)', 'Boot (บูต = เริ่มระบบ)', 'Boot Device Priority (ลำดับอุปกรณ์บูต)', 'Hard Disk Drives', '1st Drive (ลำดับแรก)', 'Save and Exit'],
    jobs: ['bios-boot', 'reinstall'],
    cautions: ['ขั้นที่ 2 ในใบเนื้อหาเข้าเมนู Boot Device Priority ก่อน แล้วขั้นที่ 3 จึงเลือก Hard Disk Drives ทั้งสองเมนูอยู่ในแท็บ Boot เหมือนกัน'],
  },
  {
    no: 3,
    title: 'ขั้นตอนการติดตั้ง Windows 10 (ขั้นที่ 1–9)',
    pages: 'ใบเนื้อหา หน้า 6–11',
    summary: 'บูตจาก USB แล้วทำตามตัวติดตั้ง: 32/64 บิต → ภาษา → Install now → Product Key → ยอมรับข้อตกลง → Custom → เลือกไดรฟ์ → รอ Restart',
    blocks: [
      {
        kind: 'table',
        head: ['ขั้น', 'หน้าจอ', 'ทำอะไร'],
        rows: [
          ['1', 'Please select boot device', 'เสียบ USB แล้ว Restart ให้เครื่องบูตจาก USB'],
          ['2', 'Windows Boot Manager', 'เลือก 32-bit หรือ 64-bit ตาม RAM'],
          ['3', 'Language / Time and currency / Keyboard', 'ตั้งภาษา รูปแบบเวลาและเงิน และแป้นพิมพ์ แล้วกด Next'],
          ['4', 'Install now', 'กดเพื่อเริ่มติดตั้ง'],
          ['5', 'Activate Windows', 'ป้อน Product Key หรือ CD Key แล้วกด Next'],
          ['6', 'License terms', 'ติ๊ก I accept the license terms แล้วกด Next'],
          ['7', 'Type of installation', 'เลือก Custom: Install Windows only (advanced)'],
          ['8', 'Where do you want to install Windows?', 'เลือกไดรฟ์ ถ้าเป็นฮาร์ดดิสก์ใหม่ให้สร้าง Partition ก่อน แล้วกด Next'],
          ['9', 'Installing Windows', 'รอจนเสร็จ เครื่อง Restart เอง ไม่ต้องทำอะไร'],
        ],
      },
      {
        kind: 'table',
        title: 'เลือก 32 บิต หรือ 64 บิต',
        head: ['RAM ของเครื่อง', 'เลือก'],
        rows: [
          ['น้อยกว่า 4 GB', 'Windows Setup (32-bit)'],
          ['ตั้งแต่ 4 GB ขึ้นไป', 'Windows Setup (64-bit)'],
        ],
      },
    ],
    terms: ['Windows Boot Manager', '32-bit / 64-bit', 'RAM (หน่วยความจำ)', 'Product Key (รหัสลิขสิทธิ์)', 'License terms (ข้อตกลงการใช้งาน)', 'Custom install', 'Partition (ส่วนแบ่งของฮาร์ดดิสก์)', 'Unallocated Space (พื้นที่ว่างที่ยังไม่แบ่ง)'],
    jobs: ['install-new', 'reinstall'],
  },
  {
    no: 4,
    title: 'ตั้งค่าหลังติดตั้ง (ขั้นที่ 10–16)',
    pages: 'ใบเนื้อหา หน้า 11–14',
    summary: 'หลังเครื่องรีสตาร์ต ตั้งภูมิภาค แป้นพิมพ์ บัญชีผู้ใช้ และความเป็นส่วนตัว',
    blocks: [
      {
        kind: 'table',
        head: ['ขั้น', 'หน้าจอ', 'ทำอะไร'],
        rows: [
          ['10', "Let's start with region", 'เลือกภูมิภาค ตัวอย่างเลือก Thailand แล้วกด Yes'],
          ['11', 'Keyboard layout', 'ตั้งแป้นพิมพ์หลัก ตัวอย่างเลือก US แล้วกด Yes'],
          ['12', 'Second keyboard layout', 'ถ้าไม่ต้องการเพิ่มกด Skip (ต้องการเพิ่มกด Add layout)'],
          ['13', 'Sign in with Microsoft', 'กำหนด Microsoft Account หรือ Create account แล้วกด Next'],
          ['14', 'Offline account', 'ตั้งชื่อ User และ Password ถ้าเข้าด้วย Microsoft Account อาจต้องตั้ง PIN'],
          ['15', 'Phone / OneDrive', 'ส่วนของ Microsoft Account ถ้าไม่ต้องการเชื่อมเบอร์โทรหรือ OneDrive ให้กด Next'],
          ['16', 'Privacy settings', 'เปิด (On) ฟังก์ชันที่ต้องใช้ ภายหลังเปลี่ยนเป็น Off ได้ แล้วกด Accept'],
        ],
      },
      {
        kind: 'note',
        tone: 'tip',
        text: '**Offline account** (บัญชีในเครื่อง) ไม่ต้องใช้อีเมล เหมาะกับเครื่องที่หลายคนใช้ร่วมกัน ลิงก์อยู่มุมซ้ายล่างของหน้า Sign in with Microsoft',
      },
    ],
    terms: ['Region (ภูมิภาค)', 'Keyboard layout (แป้นพิมพ์)', 'Microsoft Account', 'Offline account (บัญชีในเครื่อง)', 'PIN (รหัสตัวเลข)', 'OneDrive (พื้นที่เก็บไฟล์ออนไลน์)', 'Privacy (ความเป็นส่วนตัว)'],
    jobs: ['first-setup', 'reinstall'],
  },
  {
    no: 5,
    title: 'ตรวจสอบ Windows Update (ขั้นที่ 17)',
    pages: 'ใบเนื้อหา หน้า 15',
    summary: 'ติดตั้งเสร็จแล้วตรวจว่า Windows 10 เป็นเวอร์ชันล่าสุด',
    blocks: [
      {
        kind: 'flow',
        steps: [
          { label: 'คลิกช่องค้นหา', sub: 'ที่ Taskbar' },
          { label: 'พิมพ์ Windows Update', sub: 'แล้วเปิด' },
          { label: 'ทำตามหน้าจอ', sub: 'Check for updates' },
          { label: 'กด Restart', sub: 'ในขั้นตอนการอัปเดต' },
        ],
      },
      {
        kind: 'note',
        tone: 'tip',
        text: 'ถ้าขึ้นว่า You\'re up to date แปลว่า Windows เป็นเวอร์ชันล่าสุดแล้ว',
      },
    ],
    terms: ['Windows Update', 'Version (เวอร์ชัน)', 'Restart (เริ่มเครื่องใหม่)'],
    jobs: ['first-setup', 'reinstall'],
  },
]

export const EXTRA_NOTES: { title: string; text: string }[] = [
  {
    title: 'สำรองข้อมูลก่อนติดตั้งใหม่',
    text: 'ถ้าเครื่องมีข้อมูลสำคัญ ให้คัดลอกไปเก็บที่อื่นก่อน หน้าจอ Custom ของตัวติดตั้งเองก็แนะนำไว้ (We recommend backing up your files before you continue)',
  },
  {
    title: 'MBR รองรับฮาร์ดดิสก์ไม่เกิน 2 TB',
    text: 'ฮาร์ดดิสก์ใหญ่กว่า 2 TB ต้องใช้ GPT และบูตแบบ UEFI จึงใช้ GPT partition scheme for UEFI computer',
  },
  {
    title: 'ปุ่มเข้า BIOS ต่างกันตามยี่ห้อ',
    text: 'เช่น F2, Del, F10 หรือ Esc ดูได้จากข้อความบนจอตอนเปิดเครื่อง บางเครื่องมีปุ่มเปิดเมนูบูตครั้งเดียว เช่น F12',
  },
  {
    title: 'หน่วยของขนาดพาร์ทิชัน',
    text: 'ตัวติดตั้งใช้หน่วย MB และ 1 GB = 1024 MB เช่น 100 GB = 102400 MB',
  },
  {
    title: 'Upgrade กับ Custom',
    text: 'Upgrade ใช้ได้เมื่อเริ่มติดตั้งจากใน Windows เดิมที่กำลังทำงาน ส่วน Custom ใช้เมื่อบูตจาก USB และต้องเลือกพาร์ทิชันเอง',
  },
  {
    title: 'Windows 10 หมดระยะสนับสนุน',
    text: 'Microsoft ยุติการสนับสนุน Windows 10 เมื่อ 14 ต.ค. 2025 เกมนี้จำลองตามใบเนื้อหา เครื่องใหม่มักใช้ Windows 11 ซึ่งขั้นตอนติดตั้งคล้ายกัน',
  },
]

export const SOURCE = {
  title: 'ใบเนื้อหา เรื่องการติดตั้งระบบปฏิบัติการ Windows',
  subject: 'วิชาระบบปฏิบัติการคอมพิวเตอร์',
  pages: 15,
}
