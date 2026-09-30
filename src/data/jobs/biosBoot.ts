import type { JobDef } from '../../game/types.ts'
import { ANN } from '../people.ts'

// Content sheet (ใบเนื้อหา) pages 3–6: การกำหนดค่า Bios ก่อนติดตั้ง Windows 10 (ขั้นที่ 1–7)
export const biosBootJob: JobDef = {
  id: 'bios-boot',
  order: 2,
  code: 'งาน 02',
  title: 'ตั้งค่า BIOS ให้บูตจาก USB',
  tagline: 'เข้า BIOS ด้วย F2 ให้ USB เป็นลำดับแรก แล้วบันทึกด้วย F10',
  customer: ANN,
  intake: [
    'ครูยกเครื่องห้องแล็บมาแล้วค่ะ เสียบ USB ที่ทำไว้เมื่อวานไว้ให้แล้วด้วย',
    'ครูลองเปิดเครื่องแล้ว มันขึ้นว่า Reboot and Select proper Boot device อะไรสักอย่าง ครูไม่เข้าใจเลย',
    'ฮาร์ดดิสก์ลูกนี้เพิ่งซื้อมาใหม่ ข้างในยังว่างอยู่ค่ะ',
  ],
  workOrder: [
    { label: 'เครื่อง', value: 'คอมห้องแล็บ เมนบอร์ด BIOS แบบเก่า', fact: 'wo-bios' },
    { label: 'ฮาร์ดดิสก์', value: 'SATA 500 GB ลูกใหม่ ยังไม่มีระบบปฏิบัติการ', fact: 'wo-newdisk' },
    { label: 'USB', value: 'USB Boot Windows 10 จากงาน 01 (KINGSTON 16 GB) เสียบอยู่', fact: 'wo-usb' },
    { label: 'ปุ่มเข้า BIOS', value: 'F2 (ตามตัวอย่างในใบเนื้อหา)' },
    { label: 'งาน', value: 'ตั้งให้เครื่องบูตจาก USB เป็นลำดับแรก แล้วเปิดเครื่องให้เข้าหน้าติดตั้ง Windows' },
  ],
  objectives: [
    { id: 'o1', text: 'เข้า BIOS และตั้ง USB เป็นอุปกรณ์บูตลำดับแรกได้', rules: [{ criterion: 'accuracy', min: 0.75 }] },
    { id: 'o2', text: 'บันทึกการตั้งค่า แล้วทดสอบว่าเครื่องบูตจาก USB ได้จริง', rules: [{ criterion: 'testing', min: 1 }] },
  ],
  units: ['ใบเนื้อหา หน้า 3–6'],
  manualNo: 2,
  reward: 150,
  minutes: 8,
  requires: 'make-usb',
  criteria: ['accuracy', 'reasoning', 'testing'],
  learn: {
    title: 'กำหนดค่า BIOS ก่อนติดตั้ง Windows 10',
    blocks: [
      {
        kind: 'text',
        text: 'ก่อนติดตั้งผ่าน USB ต้องกำหนดค่า **BIOS** (โปรแกรมพื้นฐานของเมนบอร์ดที่ทำงานก่อน Windows) ให้เครื่อง**บูต** (Boot = เริ่มระบบ) จาก USB ก่อนฮาร์ดดิสก์',
      },
      {
        kind: 'flow',
        title: 'ขั้นที่ 1–7 ในใบเนื้อหา',
        steps: [
          { label: '1. Restart แล้วกด F2', sub: 'เข้าหน้าตั้งค่า BIOS' },
          { label: '2. แท็บ Boot', sub: 'เมนู Boot Device Priority' },
          { label: '3. Hard Disk Drives', sub: 'กด Enter' },
          { label: '4. 1st Drive', sub: 'อุปกรณ์ลำดับแรก' },
          { label: '5. เลือก USB', sub: 'กด Enter' },
          { label: '6. กด F10', sub: 'บันทึกและออก' },
          { label: '7. เลือก OK', sub: 'เครื่องบูตจาก USB' },
        ],
      },
      {
        kind: 'table',
        title: 'ปุ่มที่ใช้ใน BIOS',
        head: ['ปุ่ม', 'หน้าที่'],
        rows: [
          ['F2', 'เข้าหน้าตั้งค่า BIOS ตอนเปิดเครื่อง (ตัวอย่างในใบเนื้อหา)'],
          ['← →', 'เลื่อนแท็บ เช่น ไปที่แท็บ Boot'],
          ['↑ ↓', 'เลื่อนเลือกรายการ'],
          ['Enter', 'เข้าเมนูหรือเลือกค่า'],
          ['F10', 'บันทึกการตั้งค่าและออก (Save and Exit)'],
          ['Esc', 'ย้อนกลับ หรือออก'],
        ],
      },
      {
        kind: 'note',
        tone: 'warn',
        title: 'ต้องบันทึกก่อนออก',
        text: 'ถ้าออกโดยไม่บันทึก (Discard changes and exit) ค่าที่ตั้งไว้จะไม่มีผล เครื่องจะบูตจากฮาร์ดดิสก์เหมือนเดิม',
      },
      {
        kind: 'note',
        tone: 'tip',
        title: 'BIOS ใช้คีย์บอร์ดเท่านั้น',
        text: 'หน้า BIOS ของจริงใช้เมาส์ไม่ได้ ต้องกดปุ่มลูกศร Enter F10 และ Esc บนคีย์บอร์ด (ในเกมกดปุ่มบนจอด้านล่างแทนได้) หลังบันทึกด้วย F10 เครื่องจะรีสตาร์ตเอง',
      },
    ],
    more: [
      {
        kind: 'note',
        tone: 'extra',
        text: 'ปุ่มเข้า BIOS ต่างกันตามยี่ห้อเครื่อง เช่น F2, Del, F10 ให้ดูข้อความบนจอตอนเปิดเครื่อง',
      },
      {
        kind: 'note',
        tone: 'extra',
        text: 'ข้อความ "Reboot and Select proper Boot device" แปลว่าเครื่องหาอุปกรณ์ที่มีระบบให้บูตไม่เจอ เช่น ฮาร์ดดิสก์ใหม่ที่ยังว่าง',
      },
    ],
    refs: ['ใบเนื้อหา หน้า 3–6 การกำหนดค่า BIOS ก่อนติดตั้ง Windows 10'],
  },
  demo: [
    {
      title: 'จังหวะกด F2',
      say: 'ต้องกด F2 ตอนหน้าจอโลโก้ขึ้น ถ้ากดไม่ทัน เครื่องจะบูตต่อไปเลย ไม่เป็นไร รีสตาร์ตแล้วลองใหม่ได้ ในเกมนี้ปิดการจับเวลาได้ด้วย จะได้อ่านจอให้ทัน',
    },
    {
      title: 'หาเมนูลำดับบูต',
      say: 'ในแท็บ Boot มีเมนูลำดับบูต แฟลชไดรฟ์ USB อยู่ในกลุ่ม Hard Disk Drives ต้องเลื่อนขึ้นไปเป็น 1st Drive ก่อน แล้วค่อยดูใน Boot Device Priority ว่า USB ขึ้นเป็นลำดับแรกแล้ว',
      visual: {
        kind: 'flow',
        steps: [
          { label: 'แท็บ Boot', sub: '← →' },
          { label: 'Hard Disk Drives', sub: '↑ ↓ + Enter' },
          { label: '1st Drive = USB', sub: 'Enter' },
        ],
      },
    },
    {
      title: 'จบด้วย F10',
      say: 'ตั้งเสร็จแล้วกด F10 เครื่องจะถามว่า Save configuration changes and exit now? ให้เลือก OK แล้วกด Enter เครื่องจะรีสตาร์ต ขึ้นหน้าจอเปิดเครื่องอีกรอบ แล้วบูตจาก USB',
    },
  ],
  stages: [
    { id: 'enter', label: 'รีสตาร์ตแล้วกด F2 เข้า BIOS (ขั้นที่ 1)' },
    { id: 'order', label: 'ตั้ง USB เป็น 1st Drive (ขั้นที่ 2–5)' },
    { id: 'save', label: 'กด F10 แล้วเลือก OK (ขั้นที่ 6–7)' },
    { id: 'test', label: 'ทดสอบว่าเครื่องบูตจาก USB' },
  ],
  hints: {
    enter: ['กดปุ่ม "เปิดเครื่อง" แล้วกด F2 ระหว่างหน้าจอเปิดเครื่อง (กดปุ่ม F2 บนจอได้)', 'ถ้าเปิดการจับเวลาไว้แล้วกดไม่ทัน ให้รีสตาร์ตแล้วลองใหม่'],
    order: ['หน้า BIOS คลิกเมาส์ไม่ได้ ใช้ปุ่มลูกศร → ไปที่แท็บ Boot', 'เลือก Hard Disk Drives กด Enter จากนั้นเลือก 1st Drive กด Enter แล้วใช้ลูกศรเลือก USB: KINGSTON กด Enter'],
    save: ['กด F10 แล้วเลือก [Ok] กด Enter', 'อย่าเลือก Discard Changes and Exit เพราะค่าที่ตั้งจะไม่ถูกบันทึก', 'หลังบันทึก เครื่องจะรีสตาร์ตและขึ้นหน้าจอเปิดเครื่องอีกครั้ง ปล่อยให้บูตต่อ ไม่ต้องกด F2'],
    test: ['ถ้าเห็นหน้า Windows Boot Manager แปลว่าเครื่องบูตจาก USB สำเร็จแล้ว กดส่งงานได้เลย'],
  },
  evidence: {
    'wo-bios': { label: 'เครื่องห้องแล็บเป็น BIOS แบบเก่า', source: 'ใบสั่งงาน' },
    'wo-newdisk': { label: 'ฮาร์ดดิสก์ 500 GB ลูกใหม่ ยังไม่มีระบบ', source: 'ใบสั่งงาน' },
    'wo-usb': { label: 'USB Boot Windows 10 (KINGSTON 16 GB)', source: 'ใบสั่งงาน' },
    'bs-usb': { label: 'BIOS มองเห็น USB: KINGSTON DT (16GB)', source: 'BIOS แท็บ Main' },
  },
  mistakes: {
    'bios-no-save': {
      label: 'ออกจาก BIOS โดยไม่บันทึกการตั้งค่า',
      severity: 'major',
      criterion: 'accuracy',
      explain: 'ลำดับบูตที่ตั้งจะมีผลเมื่อกด F10 แล้วเลือก OK เท่านั้น ถ้าออกโดยไม่บันทึก เครื่องจะบูตจากฮาร์ดดิสก์เหมือนเดิม',
      ref: 'ใบเนื้อหา หน้า 5–6',
    },
    'bios-disable': {
      label: 'ปิด (Disabled) อุปกรณ์ในลำดับบูต',
      severity: 'minor',
      criterion: 'accuracy',
      explain: 'ใบเนื้อหาให้เลือก USB เป็นลำดับแรกเท่านั้น ไม่ต้องปิดอุปกรณ์อื่น เพราะหลังติดตั้งเสร็จ เครื่องยังต้องบูตจากฮาร์ดดิสก์',
      ref: 'ใบเนื้อหา หน้า 5',
    },
  },
  checks: [
    { id: 'check-order', label: 'เปิด Boot Device Priority ตรวจว่า USB ขึ้นเป็นลำดับแรกก่อนบันทึก', required: false },
    { id: 'check-boot-usb', label: 'รีสตาร์ตแล้วเครื่องบูตจาก USB เข้าหน้าติดตั้ง Windows', required: true },
  ],
  principles: [
    'Restart แล้วกดปุ่มเข้า BIOS ตอนหน้าจอโลโก้ (ตัวอย่างในใบเนื้อหาใช้ F2)',
    'แท็บ Boot → Hard Disk Drives → 1st Drive → เลือก USB',
    'กด F10 แล้วเลือก OK เพื่อบันทึกและออก ถ้าไม่บันทึก ค่าที่ตั้งจะไม่มีผล',
    'เห็นหน้าเลือก Windows Setup แปลว่าเครื่องบูตจาก USB สำเร็จ',
  ],
  quiz: [
    {
      id: 'q-f10',
      kind: 'reason',
      prompt: 'ตั้ง USB เป็น 1st Drive แล้ว ทำไมต้องกด F10 ก่อนออกจาก BIOS',
      choices: [
        { text: 'เพื่อบันทึกค่า ถ้าไม่บันทึก เครื่องจะบูตแบบเดิม', correct: true, feedback: 'ถูกต้อง F10 คือ Save and Exit ตามขั้นที่ 6 ในใบเนื้อหา' },
        { text: 'เพื่อล้างการตั้งค่าทั้งหมดกลับเป็นค่าเริ่มต้น', feedback: 'ไม่ใช่ F10 ใช้บันทึกการตั้งค่าและออก' },
        { text: 'ไม่จำเป็น ออกด้วย Esc ก็ได้ผลเหมือนกัน', feedback: 'ถ้าออกโดยไม่บันทึก ลำดับบูตที่ตั้งไว้จะไม่มีผล' },
      ],
      ref: 'ใบเนื้อหา หน้า 5–6',
    },
    {
      id: 'q-where',
      kind: 'reason',
      prompt: 'ตามใบเนื้อหา แฟลชไดรฟ์ USB อยู่ในเมนูใดของ BIOS',
      choices: [
        { text: 'Hard Disk Drives ในแท็บ Boot', correct: true, feedback: 'ถูกต้อง ขั้นที่ 3 ให้เลือก Hard Disk Drives แล้วตั้ง 1st Drive' },
        { text: 'แท็บ Main', feedback: 'แท็บ Main แสดงข้อมูลเครื่อง ไม่ได้ใช้ตั้งลำดับบูต' },
        { text: 'แท็บ Security', feedback: 'แท็บ Security ใช้ตั้งรหัสผ่าน BIOS' },
      ],
      ref: 'ใบเนื้อหา หน้า 4',
    },
    {
      id: 'q-late',
      kind: 'transfer',
      prompt: 'เปิดเครื่องแล้วกด F2 ไม่ทัน เครื่องขึ้นว่า Reboot and Select proper Boot device ควรทำอย่างไร',
      choices: [
        { text: 'รีสตาร์ตแล้วกด F2 ใหม่ตอนเห็นโลโก้', correct: true, feedback: 'ถูกต้อง ลองใหม่ได้เลย ข้อความนี้แปลว่ายังไม่มีอุปกรณ์ที่บูตได้อยู่ลำดับแรก' },
        { text: 'ถอดฮาร์ดดิสก์ออกจากเครื่อง', feedback: 'ไม่จำเป็น ฮาร์ดดิสก์ไม่ได้เสีย แค่ยังไม่มีระบบ' },
        { text: 'กลับไปทำ USB ใหม่ด้วย Rufus', feedback: 'USB ไม่ได้ผิด ปัญหาคือยังเข้า BIOS ไปตั้งลำดับบูตไม่ทัน' },
      ],
      ref: 'ใบเนื้อหา หน้า 3',
    },
  ],
  thanks: 'เครื่องขึ้นหน้าติดตั้ง Windows แล้ว! งานต่อไปช่วยติดตั้งให้ครบเลยนะคะ',
}
