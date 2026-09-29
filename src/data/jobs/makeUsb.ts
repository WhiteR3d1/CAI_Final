import type { JobDef } from '../../game/types.ts'
import { ANN } from '../people.ts'

// Content sheet (ใบเนื้อหา) pages 1–3: การสร้าง USB Boot Windows ด้วยโปรแกรม Rufus
export const makeUsbJob: JobDef = {
  id: 'make-usb',
  order: 1,
  code: 'งาน 01',
  title: 'ทำแฟลชไดรฟ์ติดตั้ง Windows 10',
  tagline: 'ดาวน์โหลด Rufus ตรวจว่าเครื่องเห็น USB แล้วสร้าง USB Boot ให้ตรงกับเครื่องปลายทาง',
  customer: ANN,
  intake: [
    'โรงเรียนได้คอมพิวเตอร์เครื่องเก่ามาไว้ในห้องคอม ครูอยากลง Windows 10 ให้นักเรียนใช้ค่ะ',
    'นี่แฟลชไดรฟ์ของครู 16 GB ช่วยทำเป็นตัวติดตั้ง Windows 10 ให้หน่อยนะคะ',
    'ช่างของโรงเรียนบอกว่าเครื่องนั้นรุ่นเก่ามาก เมนบอร์ดเป็น BIOS แบบเก่า ไม่รองรับ UEFI ค่ะ',
  ],
  workOrder: [
    { label: 'อุปกรณ์ที่ได้รับ', value: 'แฟลชไดรฟ์ของครูแอน KINGSTON 16 GB (ว่างเปล่า)', fact: 'wo-usb' },
    { label: 'เครื่องปลายทาง', value: 'คอมห้องแล็บรุ่นเก่า เมนบอร์ดแบบ BIOS ไม่รองรับ UEFI', fact: 'wo-bios' },
    { label: 'ระบบที่ต้องการ', value: 'Windows 10', fact: 'wo-win10' },
    { label: 'ข้อควรระวัง', value: 'เครื่องร้านเสียบแฟลชไดรฟ์ SHOP-TOOLS 32 GB ที่เก็บโปรแกรมของร้านไว้อยู่แล้ว', fact: 'wo-tools' },
    { label: 'งาน', value: 'ดาวน์โหลด Rufus แล้วสร้าง USB Boot Windows 10 ลงแฟลชไดรฟ์ของครูแอน' },
  ],
  objectives: [
    {
      id: 'o1',
      text: 'เลือก Device และ Partition scheme ใน Rufus ให้ตรงกับแฟลชไดรฟ์และเครื่องปลายทาง',
      rules: [
        { criterion: 'accuracy', min: 0.75 },
        { criterion: 'reasoning', min: 0.5 },
      ],
    },
    { id: 'o2', text: 'สร้าง USB Boot โดยไม่ทำให้ข้อมูลในอุปกรณ์อื่นหาย', rules: [{ criterion: 'dataSafety', min: 1 }] },
    { id: 'o3', text: 'ตรวจว่าเครื่องเห็น USB ก่อนเริ่ม และตรวจไฟล์ติดตั้งหลังสร้างเสร็จ', rules: [{ criterion: 'testing', min: 1 }] },
  ],
  units: ['ใบเนื้อหา หน้า 1–3'],
  manualNo: 1,
  reward: 150,
  minutes: 8,
  criteria: ['accuracy', 'reasoning', 'dataSafety', 'testing'],
  learn: {
    title: 'สร้าง USB Boot Windows ด้วยโปรแกรม Rufus',
    blocks: [
      {
        kind: 'text',
        text: 'การติดตั้ง Windows 10 ด้วย USB เริ่มจากสร้าง **USB Boot** (แฟลชไดรฟ์ที่ใช้เปิดเครื่องเข้าสู่ตัวติดตั้ง) ด้วยโปรแกรม **Rufus** ก่อน แล้วจึงตั้งค่า BIOS และติดตั้ง Windows',
      },
      {
        kind: 'flow',
        title: 'ขั้นตอนตามใบเนื้อหา',
        steps: [
          { label: '1. ดาวน์โหลด Rufus', sub: 'ค้นหาด้วยเครื่องมือค้นหา' },
          { label: '2. เสียบ USB', sub: 'ตรวจว่าเครื่องมองเห็น' },
          { label: '3. เปิด Rufus', sub: 'จาก Taskbar หรือที่เก็บไฟล์ดาวน์โหลด' },
          { label: '4. ตั้งค่าแล้วกด Start', sub: 'Device · Partition scheme · ISO' },
        ],
      },
      {
        kind: 'points',
        title: 'ช่องที่ต้องตั้งใน Rufus',
        items: [
          '**Device** (อุปกรณ์) ชื่อแฟลชไดรฟ์ที่จะใช้ ต้องตรวจชื่อและขนาดให้ถูก เพราะข้อมูลในอุปกรณ์นี้จะถูกลบทั้งหมด',
          '**Partition scheme** (รูปแบบพาร์ทิชัน) เลือกให้เหมาะกับเครื่องและฮาร์ดดิสก์ที่จะติดตั้ง',
          '**File system** ตัวอย่างในใบเนื้อหาใช้ NTFS และ **Cluster size** 4096',
          '**Boot selection** กด SELECT แล้วเลือกไฟล์ ISO (ไฟล์ติดตั้งระบบ) ของ Windows 10',
        ],
      },
      {
        kind: 'table',
        title: 'Partition scheme 3 แบบในใบเนื้อหา',
        head: ['ตัวเลือก', 'ใช้กับเครื่องแบบ'],
        rows: [
          ['MBR partition scheme for BIOS or UEFI computers', 'BIOS หรือ UEFI ก็ได้'],
          ['MBR partition scheme for UEFI computer', 'UEFI เท่านั้น'],
          ['GPT partition scheme for UEFI computer', 'UEFI เท่านั้น'],
        ],
      },
      {
        kind: 'note',
        tone: 'warn',
        title: 'ข้อมูลในอุปกรณ์ที่เลือกจะถูกลบทั้งหมด',
        text: 'ก่อนกด Start ดูชื่อและขนาดในช่อง Device ทุกครั้ง ถ้าเสียบแฟลชไดรฟ์ไว้หลายอัน ต้องเลือกอันที่ถูกต้องเท่านั้น',
      },
    ],
    more: [
      {
        kind: 'note',
        tone: 'tip',
        text: 'ใบเนื้อหาระบุว่าใช้ Rufus ได้หลายเวอร์ชัน ตัวอย่างใช้เวอร์ชัน 3.4 หน้าจอในเกมเป็นแบบจำลอง อาจต่างจากโปรแกรมจริงเล็กน้อย',
      },
      {
        kind: 'note',
        tone: 'extra',
        text: 'MBR ใช้กับฮาร์ดดิสก์ได้ไม่เกิน 2 TB ดิสก์ที่ใหญ่กว่านั้นต้องใช้ GPT และบูตแบบ UEFI (จะได้ใช้ในงาน 05)',
      },
    ],
    refs: ['ใบเนื้อหา หน้า 1–3 การสร้าง USB Boot Windows ด้วยโปรแกรม Rufus'],
  },
  demo: [
    {
      title: 'ดาวน์โหลดแล้วเปิดจากแถบดาวน์โหลด',
      say: 'พี่ค้นคำว่า rufus แล้วเลือกผลลัพธ์ที่เป็นเว็บของโปรแกรม ดาวน์โหลดเสร็จ ไฟล์จะขึ้นที่แถบดาวน์โหลดด้านล่างของเบราว์เซอร์ พอเสียบ USB แล้วค่อยกดเปิด',
    },
    {
      title: 'เสียบแล้วดูว่าเครื่องเห็นไหม',
      say: 'เสียบแฟลชไดรฟ์แล้วเปิด This PC ต้องเห็นไดรฟ์ใหม่ พี่จดชื่อกับขนาดไว้ เพื่อไปเทียบกับช่อง Device ใน Rufus อย่าดูแค่ตัวอักษรไดรฟ์',
      visual: {
        kind: 'table',
        head: ['ไดรฟ์ที่เห็นใน This PC (ตัวอย่าง)', 'คืออะไร'],
        rows: [
          ['NO_LABEL (G:) 8 GB', 'แฟลชไดรฟ์เปล่าที่ลูกค้าเอามา'],
          ['WORK (H:) 64 GB', 'แฟลชไดรฟ์ที่มีงานอยู่ ห้ามเลือก'],
        ],
      },
    },
    {
      title: 'อ่านชื่อตัวเลือก Partition scheme',
      say: 'ชื่อตัวเลือกบอกอยู่แล้วว่าใช้กับเครื่องแบบไหน "for BIOS or UEFI" ใช้ได้ทั้งสองแบบ ส่วน "for UEFI" ใช้ได้เฉพาะเครื่อง UEFI ลองอ่านใบงานว่าเครื่องปลายทางเป็นแบบไหน แล้วตัดสินใจเอง',
    },
  ],
  stages: [
    { id: 'download', label: 'ดาวน์โหลด Rufus (ขั้นที่ 1)' },
    { id: 'plug', label: 'เสียบ USB และตรวจว่าเครื่องเห็น (ขั้นที่ 2)' },
    { id: 'rufus', label: 'เปิด Rufus ตั้งค่าแล้วกด Start (ขั้นที่ 3)' },
    { id: 'verify', label: 'ตรวจ USB ที่สร้างเสร็จ' },
  ],
  hints: {
    download: ['เปิด Browser บนหน้าจอ แล้วค้นหาคำว่า rufus', 'เลือกผลลัพธ์ rufus.ie ซึ่งเป็นเว็บของโปรแกรม แล้วกดดาวน์โหลดไฟล์ rufus-3.4.exe'],
    plug: ['กดปุ่ม "เสียบแฟลชไดรฟ์ของครูแอน" ใต้จอ', 'เปิด This PC แล้วดับเบิลคลิกไดรฟ์ KINGSTON (F:) 16 GB เพื่อตรวจว่าเครื่องเห็น จากนั้นจดเป็นหลักฐาน'],
    rufus: [
      'เปิด Rufus จากแถบดาวน์โหลดในเบราว์เซอร์ หรือไอคอน rufus-3.4 บนเดสก์ท็อป',
      'ช่อง Device ต้องเป็น KINGSTON (F:) 16 GB ไม่ใช่ SHOP-TOOLS (E:) 32 GB',
      'เครื่องปลายทางเป็น BIOS แบบเก่า จึงเลือก MBR partition scheme for BIOS or UEFI computers แล้วกด SELECT เลือกไฟล์ Windows 10',
    ],
    verify: ['เปิด This PC แล้วเปิดไดรฟ์ WIN10_TH (F:) ดูว่ามีไฟล์ติดตั้ง เช่น setup.exe'],
  },
  evidence: {
    'wo-usb': { label: 'แฟลชไดรฟ์ของครูแอน KINGSTON 16 GB', source: 'ใบสั่งงาน' },
    'wo-bios': { label: 'เครื่องปลายทางเป็น BIOS แบบเก่า ไม่รองรับ UEFI', source: 'ใบสั่งงาน' },
    'wo-win10': { label: 'ครูแอนต้องการ Windows 10', source: 'ใบสั่งงาน' },
    'wo-tools': { label: 'SHOP-TOOLS 32 GB เก็บโปรแกรมของร้าน', source: 'ใบสั่งงาน' },
    'fe-usb': { label: 'This PC เห็นแฟลชไดรฟ์ KINGSTON (F:) 16 GB', source: 'File Explorer' },
    'fe-tools': { label: 'SHOP-TOOLS (E:) 32 GB มีโปรแกรมของร้านอยู่', source: 'File Explorer' },
  },
  mistakes: {
    'rufus-wrong-device': {
      label: 'เลือก SHOP-TOOLS (E:) ใน Rufus จนโปรแกรมของร้านถูกลบ',
      severity: 'critical',
      criterion: 'dataSafety',
      explain: 'Rufus ลบข้อมูลทั้งหมดในอุปกรณ์ที่เลือกในช่อง Device ต้องตรวจชื่อและขนาดให้ตรงกับแฟลชไดรฟ์ที่จะใช้ (KINGSTON 16 GB) ก่อนกด Start',
      ref: 'ใบเนื้อหา หน้า 2',
    },
    'rufus-wrong-scheme': {
      label: 'เลือก Partition scheme แบบ UEFI ให้เครื่อง BIOS แบบเก่า',
      severity: 'major',
      criterion: 'accuracy',
      explain: 'ตัวเลือกที่ลงท้ายว่า "for UEFI computer" ใช้ได้เฉพาะเครื่อง UEFI เครื่องห้องแล็บเป็น BIOS แบบเก่า จึงบูตจาก USB นี้ไม่ได้ ต้องเลือก MBR partition scheme for BIOS or UEFI computers',
      ref: 'ใบเนื้อหา หน้า 2–3',
    },
    'rufus-wrong-iso': {
      label: 'เลือกไฟล์ ISO ที่ไม่ใช่ Windows 10',
      severity: 'major',
      criterion: 'accuracy',
      explain: 'ครูแอนต้องการ Windows 10 จึงต้องเลือกไฟล์ ISO ของ Windows 10 ในช่อง Boot selection',
      ref: 'ใบเนื้อหา หน้า 3',
    },
    'ev-missing': {
      label: 'ยืนยันการตั้งค่า Rufus โดยยังไม่มีหลักฐานครบ',
      severity: 'minor',
      criterion: 'reasoning',
      explain: 'ก่อนเขียนทับ ควรมีหลักฐานทั้งอุปกรณ์ที่จะใช้ (แฟลชไดรฟ์ 16 GB) และชนิดของเครื่องปลายทาง (BIOS แบบเก่า)',
    },
    'ev-irrelevant': {
      label: 'แนบหลักฐานที่ไม่เกี่ยวกับการตั้งค่า Rufus',
      severity: 'minor',
      criterion: 'reasoning',
      explain: 'หลักฐานบางข้อไม่ได้ช่วยยืนยันว่าเลือก Device หรือ Partition scheme ถูก',
    },
  },
  checks: [
    { id: 'check-usb-seen', label: 'เปิด This PC ตรวจว่าเครื่องเห็นแฟลชไดรฟ์ก่อนเปิด Rufus (ขั้นที่ 2)', required: true },
    { id: 'check-usb-files', label: 'เปิดแฟลชไดรฟ์ที่สร้างเสร็จ ตรวจว่ามีไฟล์ติดตั้ง Windows', required: true },
  ],
  principles: [
    'สร้าง USB Boot 3 ขั้น: ดาวน์โหลด Rufus → เสียบ USB และตรวจว่าเครื่องเห็น → เปิด Rufus ตั้งค่าแล้วกด Start',
    'ตรวจชื่อและขนาดในช่อง Device ก่อนกด Start เพราะข้อมูลในอุปกรณ์นั้นจะถูกลบทั้งหมด',
    'เลือก Partition scheme ให้เหมาะกับเครื่องปลายทาง เครื่อง BIOS แบบเก่าใช้ MBR partition scheme for BIOS or UEFI computers',
    'ตัวอย่างในใบเนื้อหาใช้ File system แบบ NTFS และ Cluster size 4096',
  ],
  quiz: [
    {
      id: 'q-device',
      kind: 'reason',
      prompt: 'ทำไมต้องตรวจชื่อและขนาดในช่อง Device ก่อนกด Start ใน Rufus',
      choices: [
        { text: 'เพราะข้อมูลทั้งหมดในอุปกรณ์ที่เลือกจะถูกลบ', correct: true, feedback: 'ถูกต้อง Rufus จะฟอร์แมตอุปกรณ์นั้นก่อนเขียนไฟล์ติดตั้งลงไป' },
        { text: 'เพราะ Rufus จะเลือกไฟล์ ISO ให้เองตามขนาดอุปกรณ์', feedback: 'ไม่ใช่ ไฟล์ ISO เราเลือกเองด้วยปุ่ม SELECT' },
        { text: 'เพราะอุปกรณ์ที่ใหญ่กว่าจะทำงานเร็วกว่า', feedback: 'ความเร็วไม่ใช่ประเด็น ประเด็นคือข้อมูลในอุปกรณ์ที่เลือกจะหายทั้งหมด' },
      ],
      ref: 'ใบเนื้อหา หน้า 2',
    },
    {
      id: 'q-scheme',
      kind: 'transfer',
      prompt: 'Partition scheme แบบใดใช้ได้ทั้งกับเครื่อง BIOS และเครื่อง UEFI',
      choices: [
        { text: 'MBR partition scheme for BIOS or UEFI computers', correct: true, feedback: 'ถูกต้อง ชื่อตัวเลือกบอกไว้ว่า "for BIOS or UEFI"' },
        { text: 'MBR partition scheme for UEFI computer', feedback: 'ตัวเลือกนี้ใช้ได้เฉพาะเครื่อง UEFI' },
        { text: 'GPT partition scheme for UEFI computer', feedback: 'ตัวเลือกนี้ใช้ได้เฉพาะเครื่อง UEFI' },
      ],
      ref: 'ใบเนื้อหา หน้า 2–3',
    },
    {
      id: 'q-order',
      kind: 'reason',
      prompt: 'ตามใบเนื้อหา หลังดาวน์โหลด Rufus แล้ว ควรทำอะไรก่อนเปิดโปรแกรม',
      choices: [
        { text: 'เสียบ USB แล้วตรวจว่าเครื่องมองเห็น', correct: true, feedback: 'ถูกต้อง ขั้นที่ 2 ให้ตรวจว่าเครื่องเห็น USB ก่อน จึงเปิด Rufus ในขั้นที่ 3' },
        { text: 'เข้า BIOS แล้วกด F10', feedback: 'การตั้งค่า BIOS ทำหลังจากสร้าง USB Boot เสร็จแล้ว' },
        { text: 'เริ่มติดตั้ง Windows ทันที', feedback: 'ยังติดตั้งไม่ได้ เพราะยังไม่มี USB Boot' },
      ],
      ref: 'ใบเนื้อหา หน้า 1',
    },
  ],
  thanks: 'ได้ USB ติดตั้งแล้ว ขอบคุณค่ะ พรุ่งนี้ครูจะยกเครื่องห้องแล็บมาให้ตั้งค่าต่อนะคะ',
}
