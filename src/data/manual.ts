import type { JobId, KBlock, Track } from '../game/types.ts'

export interface ManualUnit {
  no: number
  track: Track
  title: string
  pages: string
  summary: string
  blocks: KBlock[]
  /** key terms with a short Thai gloss */
  terms: string[]
  jobs: JobId[]
  cautions?: string[]
}

// Parts 1–5: the Windows 10 content sheet "การติดตั้งระบบปฏิบัติการ Windows" (15 pages, "หน้า X/15").
// Parts 6–10: the Windows 11 content sheet "การติดตั้งระบบปฏิบัติการ Windows 11" (10 pages, "หน้า X/10").
// Summaries are written in our own words; no images from the sheets or the textbook are used.
export const MANUAL: ManualUnit[] = [
  {
    no: 1,
    track: 'win10',
    title: 'การสร้าง USB Boot ด้วยโปรแกรม Rufus',
    pages: 'ใบเนื้อหา Win10 หน้า 1–3',
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
          ['Partition scheme and target system type', 'รูปแบบของพาร์ทิชัน เลือกให้เหมาะกับเครื่องและฮาร์ดดิสก์'],
          ['File system / Cluster size', 'ตัวอย่างใช้ NTFS และ 4096'],
          ['Create a bootable disk using: ISO Image', 'กดปุ่มรูปแผ่นดิสก์เพื่อเลือกไฟล์ ISO ของ Windows 10'],
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
    cautions: [
      'ข้อความในใบเนื้อหาบอกว่าตัวอย่างใช้ Rufus เวอร์ชัน 3.4 แต่รูปประกอบเป็นเวอร์ชัน 1.4 หน้าจอในเกมทำตามรูป ถ้าใช้ Rufus รุ่นใหม่ หน้าตาจะต่างไปแต่ช่องที่ต้องตั้งยังเหมือนเดิม',
      'ในเกมนี้ Rufus อยู่ในสาย Windows 10 แบบ Legacy BIOS ส่วนสาย Windows 11 ทำ USB ด้วย Media Creation Tool ตามใบเนื้อหา Win11 หน้า 2–3',
    ],
  },
  {
    no: 2,
    track: 'win10',
    title: 'การกำหนดค่า BIOS ก่อนติดตั้ง',
    pages: 'ใบเนื้อหา Win10 หน้า 3–6',
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
    track: 'win10',
    title: 'ขั้นตอนการติดตั้ง Windows 10 (ขั้นที่ 1–9)',
    pages: 'ใบเนื้อหา Win10 หน้า 6–11',
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
          ['9', 'Installing Windows', 'รอจนเสร็จ เครื่อง Restart เอง ไม่ต้องทำอะไร (ถ้าขึ้น Press any key to boot from CD or DVD ก็ไม่ต้องกด)'],
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
    track: 'win10',
    title: 'ตั้งค่าหลังติดตั้ง (ขั้นที่ 10–16)',
    pages: 'ใบเนื้อหา Win10 หน้า 11–14',
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
      {
        kind: 'note',
        tone: 'extra',
        title: 'Windows 10 รุ่นใหม่ถามเพิ่ม',
        text: 'หลังกด Offline account จะถามว่า "Sign in with Microsoft instead?" ให้กด Limited experience และเมื่อตั้งรหัสผ่านจะให้ยืนยันรหัสผ่านกับตั้งคำถามความปลอดภัย 3 ข้อ',
      },
    ],
    terms: ['Region (ภูมิภาค)', 'Keyboard layout (แป้นพิมพ์)', 'Microsoft Account', 'Offline account (บัญชีในเครื่อง)', 'PIN (รหัสตัวเลข)', 'OneDrive (พื้นที่เก็บไฟล์ออนไลน์)', 'Privacy (ความเป็นส่วนตัว)'],
    jobs: ['first-setup', 'reinstall'],
  },
  {
    no: 5,
    track: 'win10',
    title: 'ตรวจสอบ Windows Update (ขั้นที่ 17)',
    pages: 'ใบเนื้อหา Win10 หน้า 15',
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
        text: 'หลังกด Restart เครื่องจะขึ้น Working on updates แล้วมาที่หน้าจอล็อก ต้องใส่รหัสผ่านที่ตั้งไว้ เปิด Windows Update อีกครั้ง ถ้าขึ้นว่า You\'re up to date แปลว่า Windows เป็นเวอร์ชันล่าสุดแล้ว',
      },
    ],
    terms: ['Windows Update', 'Version (เวอร์ชัน)', 'Restart (เริ่มเครื่องใหม่)'],
    jobs: ['first-setup', 'reinstall'],
  },
  {
    no: 6,
    track: 'win11',
    title: 'ตรวจความพร้อมและสำรองข้อมูลก่อนติดตั้ง Windows 11',
    pages: 'ใบเนื้อหา Win11 หน้า 1–2',
    summary: 'ตรวจว่ารุ่น CPU อยู่ในรายการที่ Microsoft รองรับและเครื่องผ่านข้อกำหนดขั้นต่ำ แล้วสำรองไฟล์สำคัญให้เปิดได้จริงก่อนลบหรือจัดพาร์ทิชัน',
    blocks: [
      {
        kind: 'table',
        title: 'ข้อกำหนดขั้นต่ำของ Windows 11',
        head: ['รายการ', 'ข้อกำหนด'],
        rows: [
          ['CPU', '64 บิตที่รองรับ 1 GHz ขึ้นไป 2 คอร์ขึ้นไป หรือ SoC ที่รองรับ (ดูรุ่นในรายการที่ Microsoft รองรับ ไม่ดูแค่ความเร็วหรือจำนวนคอร์)'],
          ['RAM / พื้นที่เก็บข้อมูล', 'RAM 4 GB ขึ้นไป / อุปกรณ์เก็บข้อมูล 64 GB ขึ้นไป เผื่อพื้นที่สำหรับอัปเดต'],
          ['เฟิร์มแวร์ / ความปลอดภัย', 'UEFI, Secure Boot capable และ TPM 2.0'],
          ['กราฟิก / จอภาพ', 'DirectX 12 พร้อม WDDM 2.0 / จอ 720p ขนาดมากกว่า 9 นิ้ว'],
        ],
      },
      {
        kind: 'table',
        title: 'เครื่องมือตรวจ',
        head: ['เครื่องมือ', 'ดูอะไร'],
        rows: [
          ['PC Health Check', 'ตรวจความพร้อมทั้งเครื่องว่าติดตั้ง Windows 11 ได้หรือไม่'],
          ['Settings > System > About', 'CPU, RAM, ชนิดระบบ 64 บิต และรุ่นของ Windows'],
          ['System Information (msinfo32)', 'BIOS Mode (UEFI) และ Secure Boot State'],
          ['tpm.msc', 'มี TPM หรือไม่ และเป็นเวอร์ชันใด'],
        ],
      },
      {
        kind: 'points',
        title: 'ก่อนลบหรือจัดพาร์ทิชัน',
        items: [
          'สำรองไฟล์สำคัญไปยังสื่อที่แยกจากดิสก์เป้าหมาย แล้ว**ทดสอบเปิดไฟล์สำรองได้จริง**',
          'บันทึกบัญชีและรหัสผ่านที่จำเป็น รวมทั้ง**คีย์กู้คืน BitLocker/Device Encryption** ถ้าเปิดใช้งาน',
          'ตรวจสิทธิ์การใช้งานและรุ่น Home/Pro ให้ตรงกับใบอนุญาต',
        ],
      },
      {
        kind: 'note',
        tone: 'warn',
        text: 'การติดตั้งใหม่และการลบพาร์ทิชันทำให้ไฟล์ แอป และการตั้งค่าบนดิสก์เป้าหมายสูญหาย ต้องยืนยันหมายเลขดิสก์ ความจุ และผลสำรองก่อนดำเนินการ',
      },
    ],
    terms: ['PC Health Check', 'msinfo32 (System Information)', 'tpm.msc', 'TPM 2.0 (ชิปความปลอดภัย)', 'Secure Boot', 'UEFI', 'BitLocker recovery key (คีย์กู้คืน)', 'Home / Pro'],
    jobs: ['w11-check'],
  },
  {
    no: 7,
    track: 'win11',
    title: 'เตรียมไฟล์และอุปกรณ์ สร้าง USB ด้วย Media Creation Tool',
    pages: 'ใบเนื้อหา Win11 หน้า 2–3',
    summary: 'ดาวน์โหลด Media Creation Tool จากหน้า Download Windows 11 ของ Microsoft แล้วสร้าง USB ติดตั้งลงแฟลชไดรฟ์ว่างอย่างน้อย 8 GB',
    blocks: [
      {
        kind: 'points',
        title: 'เตรียมก่อนสร้างสื่อ',
        items: [
          'หน้า **Microsoft Download Windows 11** เพื่อดาวน์โหลด Media Creation Tool หรือ ISO อย่างเป็นทางการ',
          'USB ว่าง**อย่างน้อย 8 GB** (ข้อมูลเดิมบน USB จะถูกลบระหว่างสร้างสื่อ)',
          'อินเทอร์เน็ตที่เสถียร และ**สิทธิ์ผู้ดูแลระบบ**บนเครื่องที่ใช้สร้างสื่อ',
          'อะแดปเตอร์ไฟฟ้า ไดรเวอร์เครือข่ายจากเว็บไซต์ผู้ผลิตเครื่อง (ถ้าจำเป็น)',
          'บัญชี Microsoft สำหรับ Windows 11 Home/Pro ที่ตั้งเป็นเครื่องส่วนตัว (การตั้งค่าครั้งแรกต้องใช้อินเทอร์เน็ตและบัญชี Microsoft)',
        ],
      },
      {
        kind: 'flow',
        title: 'สร้าง USB ติดตั้ง',
        steps: [
          { label: '1. Download Now', sub: 'หัวข้อ Create Windows 11 Installation Media' },
          { label: '2. เปิดเครื่องมือ', sub: 'เสียบ USB ที่ตรวจแล้ว ยอมรับเงื่อนไข' },
          { label: '3. ภาษาและรุ่น', sub: 'Use the recommended options for this PC' },
          { label: '4. USB flash drive', sub: 'เลือกตัวที่ถูก ตรวจชื่อและความจุ' },
          { label: '5. รอสร้างเสร็จ', sub: 'ถอดอย่างปลอดภัย ติดป้ายชื่อ' },
        ],
      },
      {
        kind: 'note',
        tone: 'tip',
        text: 'ทดลองให้เครื่องเป้าหมายเห็นรายการบูตแบบ **UEFI** ถ้าใช้ไฟล์ ISO แทน ให้ตรวจว่ามาจาก Microsoft และใช้วิธีสร้างสื่อที่รองรับ UEFI',
      },
      {
        kind: 'note',
        tone: 'warn',
        text: 'ในบทเรียนนี้ Media Creation Tool เป็นวิธีมาตรฐาน ไม่ใช่ตัวเลือกข้ามข้อกำหนดฮาร์ดแวร์',
      },
    ],
    terms: ['Media Creation Tool', 'ISO', 'USB flash drive (อย่างน้อย 8 GB)', 'Administrator (สิทธิ์ผู้ดูแลระบบ)', 'Microsoft account'],
    jobs: [],
  },
  {
    no: 8,
    track: 'win11',
    title: 'ตั้งค่า UEFI และเริ่มเครื่องจาก USB',
    pages: 'ใบเนื้อหา Win11 หน้า 4–5',
    summary: 'ตรวจ UEFI, Secure Boot และ TPM 2.0 ทั้งใน Windows และในเมนูเฟิร์มแวร์ แล้วเลือกบูตจาก USB ในรายการที่ระบุ UEFI',
    blocks: [
      {
        kind: 'points',
        title: 'ตรวจก่อนบูต (ถ้าเครื่องมี Windows อยู่)',
        items: [
          '**System Information (msinfo32)**: BIOS Mode ต้องเป็น UEFI และดู Secure Boot State',
          '**Windows Security > Device security**: ดู Security processor (TPM) และ Secure boot',
          'ถ้าไม่มีระบบเดิม ให้ตรวจจากเมนูเฟิร์มแวร์ตามคู่มือผู้ผลิต',
        ],
      },
      {
        kind: 'table',
        title: 'ในเมนูเฟิร์มแวร์ UEFI',
        head: ['เรื่อง', 'ทำอะไร'],
        rows: [
          ['ปุ่มเข้าเมนู', 'ดูคู่มือผู้ผลิต เช่น F2, Delete, F12 หรือ Esc (ไม่เหมือนกันทุกเครื่อง)'],
          ['ตรวจค่า', 'UEFI เปิดใช้งาน, Secure Boot พร้อมใช้ และ TPM 2.0 เปิดใช้งาน'],
          ['เลือกอุปกรณ์บูต', 'เลือก USB ในรายการที่ระบุ UEFI'],
        ],
      },
      {
        kind: 'note',
        tone: 'warn',
        text: 'ติดตั้งแบบใหม่บนเครื่อง UEFI ใช้ดิสก์ระบบแบบ GPT ถ้า Setup แจ้งว่าดิสก์ไม่ใช่ GPT อย่าลบดิสก์ทันที ให้ย้อนตรวจดิสก์เป้าหมายและข้อมูลสำรองก่อน',
      },
    ],
    terms: ['UEFI', 'Secure Boot', 'TPM 2.0', 'Boot Menu (เมนูเลือกอุปกรณ์บูต)', 'GPT', 'Windows Security', 'Device security'],
    jobs: [],
  },
  {
    no: 9,
    track: 'win11',
    title: 'Windows 11 Setup และ OOBE',
    pages: 'ใบเนื้อหา Win11 หน้า 5–8',
    summary: 'บูตจาก USB ทำตาม Windows 11 Setup จนติดตั้งเสร็จ แล้วตั้งค่าเริ่มต้น (OOBE) ประเทศ แป้นพิมพ์ เครือข่าย บัญชี PIN และความเป็นส่วนตัว',
    blocks: [
      {
        kind: 'table',
        title: 'Windows 11 Setup',
        head: ['ขั้น', 'หน้าจอ', 'ทำอะไร'],
        rows: [
          ['1', 'Select language settings', 'เลือกภาษา รูปแบบเวลาและสกุลเงิน และแป้นพิมพ์'],
          ['2', 'Select setup option', 'เลือก Install Windows 11 และติ๊กยอมรับว่าไฟล์ แอป และการตั้งค่าจะถูกลบ'],
          ['3', 'Product key', 'ใส่คีย์ที่ถูกต้อง หรือ I don\'t have a product key เฉพาะเมื่อมีสิทธิ์แบบดิจิทัล/คีย์ในเฟิร์มแวร์ที่ตรงรุ่น'],
          ['4', 'เลือกรุ่น และ license terms', 'เลือกรุ่นให้ตรงกับใบอนุญาต แล้วยอมรับเงื่อนไข'],
          ['5', 'Select location to install Windows 11', 'ตรวจดิสก์จากหมายเลขและความจุ ยืนยันผลสำรองก่อนลบพาร์ทิชัน เลือกพื้นที่ Unallocated ให้ Setup สร้างพาร์ทิชันระบบแบบ GPT ห้ามแตะดิสก์อื่น'],
          ['6', 'Ready to install', 'ตรวจรุ่นและตัวเลือกอีกครั้ง แล้วกด Install'],
          ['7', 'รีสตาร์ต', 'รอคัดลอกไฟล์และรีสตาร์ตหลายครั้ง อย่าบูตกลับเข้า USB จน Setup เริ่มใหม่'],
        ],
      },
      {
        kind: 'table',
        title: 'OOBE (ตั้งค่าเริ่มต้น)',
        head: ['เรื่อง', 'ทำอะไร'],
        rows: [
          ['ประเทศ/ภูมิภาค และแป้นพิมพ์', 'เลือกให้ตรงกับผู้ใช้'],
          ['เครือข่าย', 'เชื่อมต่ออินเทอร์เน็ต'],
          ['บัญชี', 'ลงชื่อเข้าใช้ด้วยบัญชีตามรุ่นและรูปแบบการจัดการ'],
          ['PIN / Windows Hello', 'ตั้ง PIN สำหรับเข้าเครื่อง'],
          ['ความเป็นส่วนตัว', 'ทบทวนสิทธิ์ความเป็นส่วนตัวทีละรายการ'],
        ],
      },
      {
        kind: 'note',
        tone: 'tip',
        text: 'ลำดับหน้าจอ OOBE อาจเปลี่ยนตามรุ่นและการอัปเดต ถ้าต้องการเก็บไฟล์และแอปในระบบเดิม ต้องเริ่ม setup.exe จาก Windows ที่ใช้งานอยู่ ส่วนงานนี้ฝึก clean install',
      },
    ],
    terms: ['Select setup option', 'Product key', 'Digital license (สิทธิ์แบบดิจิทัล)', 'Unallocated Space', 'GPT', 'Ready to install', 'OOBE', 'PIN (Windows Hello)'],
    jobs: [],
  },
  {
    no: 10,
    track: 'win11',
    title: 'ตรวจสอบหลังติดตั้ง Windows 11',
    pages: 'ใบเนื้อหา Win11 หน้า 8–10',
    summary: 'ตรวจสิทธิ์ใช้งาน อัปเดต ไดรเวอร์ ระบบป้องกัน และการสำรองข้อมูล จนผ่านเกณฑ์ก่อนส่งเครื่องคืน',
    blocks: [
      {
        kind: 'table',
        title: 'รายการตรวจ',
        head: ['ตรวจที่', 'ดูอะไร'],
        rows: [
          ['Settings > System > Activation', 'รุ่นและสถานะการเปิดใช้งาน'],
          ['Settings > Windows Update', 'Check for updates ติดตั้งที่จำเป็น และรีสตาร์ตจนไม่มีรายการค้าง'],
          ['Device Manager', 'ไม่มีอุปกรณ์ขาดไดรเวอร์ ถ้ามี ดู Optional updates > Driver updates หรือเว็บไซต์ผู้ผลิต'],
          ['Windows Security', 'Firewall, TPM/Secure Boot, Device Encryption หรือ BitLocker และบันทึกคีย์กู้คืนไว้ในที่ปลอดภัย'],
          ['Windows Backup', 'ตั้งค่าการสำรองข้อมูล และเปิดไฟล์ตัวอย่างจากชุดสำรอง'],
          ['อุปกรณ์', 'ทดสอบอินเทอร์เน็ต เสียง จอภาพ และอุปกรณ์ต่อพ่วง'],
        ],
      },
      {
        kind: 'note',
        tone: 'tip',
        title: 'เกณฑ์ผ่านงาน',
        text: 'เครื่องเข้าสู่เดสก์ท็อปได้ รุ่นและสิทธิ์ใช้งานตรงเป้าหมาย ไม่มีไดรเวอร์สำคัญขาด Windows Update ทำงาน ระบบป้องกันเปิดใช้ และมีหลักฐานการสำรองและการตรวจสอบหลังติดตั้ง',
      },
    ],
    terms: ['Activation', 'Windows Update', 'Optional updates / Driver updates', 'Device Manager', 'Windows Security', 'Device encryption / BitLocker', 'Windows Backup'],
    jobs: [],
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
    text: 'Microsoft ยุติการสนับสนุน Windows 10 เมื่อ 14 ต.ค. 2025 สาย Windows 10 ในเกมจำลองตามใบเนื้อหา Win10 ส่วนเครื่องใหม่ให้ฝึกในสาย Windows 11',
  },
]

export const SOURCES: Record<Track, { title: string; subject: string; pages: number }> = {
  win10: { title: 'ใบเนื้อหา เรื่องการติดตั้งระบบปฏิบัติการ Windows', subject: 'วิชาระบบปฏิบัติการคอมพิวเตอร์', pages: 15 },
  win11: { title: 'ใบเนื้อหา เรื่องการติดตั้งระบบปฏิบัติการ Windows 11', subject: 'วิชา 21910-2001 ระบบปฏิบัติการคอมพิวเตอร์', pages: 10 },
}
