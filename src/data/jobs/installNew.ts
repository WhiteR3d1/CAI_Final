import type { JobDef } from '../../game/types.ts'
import { ANN } from '../people.ts'

/** Fictional key (letters such as L and O never appear in real Windows keys). */
export const LAB_KEY = 'LAB10-BLOOM-7QK2P-W9TXR-4HD6M'

// Content sheet (ใบเนื้อหา) pages 6–11: ขั้นตอนการติดตั้ง Windows 10 ด้วย USB Drive ขั้นที่ 1–9
export const installNewJob: JobDef = {
  id: 'install-new',
  order: 3,
  code: 'งาน 03',
  title: 'ติดตั้ง Windows 10 ลงเครื่องห้องแล็บ',
  tagline: 'เลือก 32/64 บิตตาม RAM ใส่ Product Key สร้างพาร์ทิชัน แล้วรอให้ติดตั้งจนจบ',
  customer: ANN,
  intake: [
    'ตอนนี้เครื่องบูตจาก USB ได้แล้ว ช่วยติดตั้ง Windows 10 ต่อเลยนะคะ',
    'โรงเรียนซื้อ Product Key มาแล้ว ครูจดไว้ในใบงานให้ค่ะ',
    'ครูอยากแบ่งไดรฟ์ C: ให้ Windows ประมาณ 100 GB ที่เหลือจะเก็บงานของนักเรียนค่ะ',
  ],
  workOrder: [
    { label: 'หน่วยความจำ (RAM)', value: '2 GB', fact: 'wo-ram2' },
    { label: 'ฮาร์ดดิสก์', value: '500 GB ลูกใหม่ ยังไม่ได้แบ่งพาร์ทิชัน', fact: 'wo-newdisk' },
    { label: 'Product Key', value: LAB_KEY, fact: 'wo-key' },
    { label: 'ไดรฟ์ C:', value: 'ประมาณ 100 GB (102400 MB) สำหรับ Windows', fact: 'wo-size' },
    { label: 'รูปแบบวันที่และเงิน', value: 'แบบไทย', fact: 'wo-thai' },
    { label: 'งาน', value: 'ติดตั้ง Windows 10 ขั้นที่ 1–9 จนเครื่องรีสตาร์ตเข้าหน้าตั้งค่าเริ่มต้น' },
  ],
  objectives: [
    {
      id: 'o1',
      text: 'เลือก Windows Setup แบบ 32 หรือ 64 บิตให้ตรงกับ RAM ของเครื่อง',
      rules: [
        { criterion: 'accuracy', min: 0.6 },
        { criterion: 'reasoning', min: 0.5 },
      ],
    },
    { id: 'o2', text: 'ทำตามขั้นตอนติดตั้ง 1–9 ได้ครบ รวมถึงสร้างพาร์ทิชันตามที่ลูกค้าต้องการ', rules: [{ criterion: 'accuracy', min: 0.75 }] },
    { id: 'o3', text: 'ปล่อยให้เครื่องรีสตาร์ตเองจนเข้าหน้าตั้งค่าเริ่มต้น', rules: [{ criterion: 'testing', min: 1 }] },
  ],
  units: ['ใบเนื้อหา หน้า 6–11'],
  manualNo: 3,
  reward: 250,
  minutes: 15,
  requires: 'bios-boot',
  criteria: ['accuracy', 'reasoning', 'testing'],
  learn: {
    title: 'ติดตั้ง Windows 10 ด้วย USB ขั้นที่ 1–9',
    blocks: [
      {
        kind: 'flow',
        title: 'ภาพรวม',
        steps: [
          { label: '1. บูตจาก USB' },
          { label: '2. 32/64-bit', sub: 'ดูจาก RAM' },
          { label: '3. ภาษา', sub: 'Next' },
          { label: '4. Install now' },
          { label: '5. Product Key', sub: 'Next' },
          { label: '6. ยอมรับข้อตกลง', sub: 'Next' },
          { label: '7. Custom' },
          { label: '8. เลือก/สร้างไดรฟ์', sub: 'Next' },
          { label: '9. รอ Restart', sub: 'ไม่ต้องทำอะไร' },
        ],
      },
      {
        kind: 'table',
        title: 'ขั้นที่ 2: เลือก 32 บิต หรือ 64 บิต',
        head: ['RAM ของเครื่อง', 'เลือก'],
        rows: [
          ['น้อยกว่า 4 GB', 'Windows Setup (32-bit)'],
          ['ตั้งแต่ 4 GB ขึ้นไป', 'Windows Setup (64-bit)'],
        ],
      },
      {
        kind: 'points',
        title: 'ขั้นที่ 3–7',
        items: [
          '**Language to install** ภาษาที่ติดตั้ง · **Time and currency format** รูปแบบเวลาและเงิน · **Keyboard or input method** ภาษาของแป้นพิมพ์ แล้วกด Next',
          'กด **Install now** เพื่อเริ่มติดตั้ง',
          'หน้า Activate Windows ใส่ **Product Key** หรือ CD Key (รหัสลิขสิทธิ์ 25 ตัว) แล้วกด Next',
          'ติ๊ก **I accept the license terms** (ยอมรับข้อตกลงการใช้งาน) แล้วกด Next',
          'เลือก **Custom: Install Windows only (advanced)**',
        ],
      },
      {
        kind: 'points',
        title: 'ขั้นที่ 8–9',
        items: [
          'เลือกไดรฟ์ที่จะติดตั้ง ถ้าเป็น**ฮาร์ดดิสก์ใหม่ ให้สร้าง Partition ก่อน** (Partition = ส่วนแบ่งของฮาร์ดดิสก์) ด้วยปุ่ม New แล้วกด Next',
          'ระหว่างติดตั้งให้รอจนเสร็จ เครื่องจะ **Restart เอง** ช่วงนี้ไม่ต้องทำอะไร',
        ],
      },
      {
        kind: 'note',
        tone: 'extra',
        title: 'หน่วยของขนาดพาร์ทิชัน',
        text: 'ช่อง Size ใช้หน่วย MB และ 1 GB = 1024 MB เช่น ต้องการ 100 GB ให้ใส่ 102400',
      },
    ],
    more: [
      {
        kind: 'note',
        tone: 'extra',
        text: 'ตอนสร้างพาร์ทิชันบนดิสก์ใหม่ Windows จะสร้างพาร์ทิชันเล็ก ๆ ชื่อ System Reserved เพิ่มให้อัตโนมัติ เป็นพาร์ทิชันสำหรับไฟล์บูต ไม่ต้องลบ และติดตั้งลงไม่ได้',
      },
    ],
    refs: ['ใบเนื้อหา หน้า 6–11 ขั้นตอนการติดตั้ง Windows 10 ด้วย USB Drive ขั้นที่ 1–9'],
  },
  demo: [
    {
      title: 'ดู RAM ก่อนเลือกบิต',
      say: 'หน้าแรกของตัวติดตั้งให้เลือก 32 หรือ 64 บิต ใบเนื้อหาบอกว่า RAM น้อยกว่า 4 GB เลือก 32 บิต ตั้งแต่ 4 GB เลือก 64 บิต เปิดใบงานดูว่าเครื่องนี้มี RAM เท่าไร',
    },
    {
      title: 'สร้างพาร์ทิชันบนดิสก์ใหม่',
      say: 'ดิสก์ใหม่จะขึ้นเป็น Unallocated Space (พื้นที่ว่างที่ยังไม่แบ่ง) พี่เลือกแล้วกด New ใส่ขนาดเป็น MB แล้วกด Apply จากนั้นเลือกพาร์ทิชันที่สร้าง แล้วกด Next',
      visual: {
        kind: 'table',
        head: ['ต้องการ (ตัวอย่าง)', 'ใส่ในช่อง Size'],
        rows: [
          ['50 GB', '51200 MB'],
          ['200 GB', '204800 MB'],
        ],
      },
    },
    {
      title: 'รอให้เครื่องรีสตาร์ตเอง',
      say: 'ติดตั้งเสร็จเครื่องจะรีสตาร์ต ถ้ามีข้อความให้กดปุ่มเพื่อบูตจาก USB ให้ปล่อยไว้เฉย ๆ ไม่อย่างนั้นเครื่องจะวนกลับไปเริ่มติดตั้งใหม่',
    },
  ],
  stages: [
    { id: 'boot', label: 'บูตจาก USB (ขั้นที่ 1)' },
    { id: 'setup', label: 'ตั้งค่าตัวติดตั้ง (ขั้นที่ 2–7)' },
    { id: 'disk', label: 'สร้างพาร์ทิชันแล้วติดตั้ง (ขั้นที่ 8)' },
    { id: 'wait', label: 'รอให้เครื่องรีสตาร์ต (ขั้นที่ 9)' },
  ],
  hints: {
    boot: ['กดปุ่ม "เปิดเครื่อง" แล้วปล่อยให้เครื่องบูตต่อ BIOS ตั้งให้ USB มาก่อนแล้วจากงาน 02', 'หรือกด F12 เพื่อเลือกอุปกรณ์บูต แล้วเลือก KINGSTON'],
    setup: [
      'RAM 2 GB น้อยกว่า 4 GB จึงเลือก Windows Setup (32-bit)',
      'ช่อง Time and currency format เลือก Thai (Thailand) ตามใบงาน',
      'ใส่ Product Key ตามใบงาน (กดปุ่ม "พิมพ์ตามสติกเกอร์" ได้) แล้วติ๊กยอมรับข้อตกลง จากนั้นเลือก Custom',
    ],
    disk: ['เลือก Drive 0 Unallocated Space แล้วกด New', 'ใส่ขนาด 102400 แล้วกด Apply และ OK จากนั้นเลือก Drive 0 Partition 2 แล้วกด Next'],
    wait: ['ตอนขึ้นข้อความ Press any key... ไม่ต้องกดอะไร รอให้เครื่องบูตต่อเอง'],
  },
  evidence: {
    'wo-ram2': { label: 'เครื่องมี RAM 2 GB', source: 'ใบสั่งงาน' },
    'wo-newdisk': { label: 'ฮาร์ดดิสก์ 500 GB ลูกใหม่', source: 'ใบสั่งงาน' },
    'wo-key': { label: 'Product Key ของโรงเรียน', source: 'ใบสั่งงาน' },
    'wo-size': { label: 'ครูแอนต้องการไดรฟ์ C: ประมาณ 100 GB', source: 'ใบสั่งงาน' },
    'wo-thai': { label: 'ใช้รูปแบบวันที่และเงินแบบไทย', source: 'ใบสั่งงาน' },
  },
  mistakes: {
    'arch-64': {
      label: 'เลือก 64 บิตกับเครื่อง RAM 2 GB',
      severity: 'major',
      criterion: 'accuracy',
      explain: 'ใบเนื้อหาให้เลือก 32 บิตเมื่อ RAM น้อยกว่า 4 GB และเลือก 64 บิตเมื่อ RAM ตั้งแต่ 4 GB ขึ้นไป เครื่องนี้มี RAM 2 GB',
      ref: 'ใบเนื้อหา หน้า 7',
    },
    'lang-format': {
      label: 'ไม่ได้ตั้งรูปแบบเวลาและเงินเป็นแบบไทยตามใบงาน',
      severity: 'minor',
      criterion: 'accuracy',
      explain: 'ช่อง Time and currency format กำหนดรูปแบบวันที่ เวลา และสกุลเงิน ครูแอนต้องการแบบไทย จึงควรเลือก Thai (Thailand)',
      ref: 'ใบเนื้อหา หน้า 7–8',
    },
    'no-key': {
      label: 'ข้ามการใส่ Product Key ทั้งที่มีคีย์ในใบงาน',
      severity: 'minor',
      criterion: 'accuracy',
      explain: 'ขั้นที่ 5 ให้ใส่ Product Key เครื่องนี้ติดตั้งครั้งแรกและโรงเรียนมีคีย์แล้ว ถ้าข้าม Windows จะยังไม่ได้เปิดใช้งาน (Activate)',
      ref: 'ใบเนื้อหา หน้า 8–9',
    },
    'setup-upgrade': {
      label: 'เลือก Upgrade แทน Custom',
      severity: 'minor',
      criterion: 'accuracy',
      explain: 'ใบเนื้อหาให้เลือก Custom: Install Windows only (advanced) ส่วน Upgrade ใช้ได้เฉพาะตอนเริ่มติดตั้งจากใน Windows เดิมที่กำลังทำงานอยู่',
      ref: 'ใบเนื้อหา หน้า 9–10',
    },
    'part-size': {
      label: 'พาร์ทิชันไม่ตรงกับขนาดที่ลูกค้าต้องการ (ประมาณ 100 GB)',
      severity: 'minor',
      criterion: 'accuracy',
      explain: 'ขั้นที่ 8 ถ้าเป็นฮาร์ดดิสก์ใหม่ให้สร้าง Partition ก่อน และครูแอนต้องการไดรฟ์ C: ประมาณ 100 GB เพื่อเหลือพื้นที่เก็บงาน จึงใส่ 102400 MB ในช่อง Size',
      ref: 'ใบเนื้อหา หน้า 10',
    },
    'reboot-keypress': {
      label: 'กดปุ่มตอนเครื่องรีสตาร์ตหลังติดตั้ง',
      severity: 'minor',
      criterion: 'accuracy',
      explain: 'ขั้นที่ 9 เครื่องจะรีสตาร์ตเอง ช่วงนี้ไม่ต้องทำอะไร ถ้ากดปุ่มตอนขึ้น Press any key... เครื่องจะบูตจาก USB และเริ่มติดตั้งใหม่อีกรอบ',
      ref: 'ใบเนื้อหา หน้า 10',
    },
    'ev-missing': {
      label: 'เลือกจำนวนบิตโดยยังไม่มีหลักฐานเรื่อง RAM',
      severity: 'minor',
      criterion: 'reasoning',
      explain: 'การเลือก 32 หรือ 64 บิตตามใบเนื้อหาต้องดูจาก RAM ของเครื่อง จึงควรจดขนาด RAM ไว้เป็นหลักฐาน',
    },
    'ev-irrelevant': {
      label: 'ใช้หลักฐานที่ไม่เกี่ยวกับการเลือกจำนวนบิต',
      severity: 'minor',
      criterion: 'reasoning',
      explain: 'การเลือก 32 หรือ 64 บิตขึ้นกับ RAM อย่างเดียว ขนาดฮาร์ดดิสก์หรือ Product Key ไม่เกี่ยว',
    },
  },
  checks: [{ id: 'check-reach-oobe', label: 'เครื่องรีสตาร์ตเองจนเข้าหน้าตั้งค่าเริ่มต้น (ขั้นที่ 10)', required: true }],
  principles: [
    'RAM น้อยกว่า 4 GB เลือก 32 บิต ตั้งแต่ 4 GB ขึ้นไปเลือก 64 บิต',
    'ขั้นที่ 3–7: ตั้งภาษา → Install now → Product Key → ยอมรับข้อตกลง → Custom',
    'ฮาร์ดดิสก์ใหม่ให้สร้างพาร์ทิชันก่อน แล้วเลือกพาร์ทิชันนั้นเพื่อติดตั้ง',
    'ติดตั้งเสร็จเครื่องจะรีสตาร์ตเอง ไม่ต้องกดปุ่มใด ๆ',
  ],
  quiz: [
    {
      id: 'q-arch',
      kind: 'transfer',
      prompt: 'เครื่องที่มี RAM 8 GB ควรเลือก Windows Setup แบบใด',
      choices: [
        { text: 'Windows Setup (64-bit) เพราะ RAM ตั้งแต่ 4 GB ขึ้นไป', correct: true, feedback: 'ถูกต้อง ตามหลักในขั้นที่ 2 ของใบเนื้อหา' },
        { text: 'Windows Setup (32-bit) เพราะติดตั้งเร็วกว่า', feedback: 'ใบเนื้อหาให้ดูจาก RAM ไม่ใช่ความเร็วในการติดตั้ง' },
        { text: 'แบบใดก็ได้ ไม่มีผล', feedback: 'ต้องเลือกให้ตรงกับ RAM ของเครื่อง' },
      ],
      ref: 'ใบเนื้อหา หน้า 7',
    },
    {
      id: 'q-custom',
      kind: 'reason',
      prompt: 'หน้า Which type of installation do you want? ตามใบเนื้อหาให้เลือกแบบใด',
      choices: [
        { text: 'Custom: Install Windows only (advanced)', correct: true, feedback: 'ถูกต้อง ขั้นที่ 7 ให้เลือก Custom เพื่อเลือกไดรฟ์ที่จะติดตั้งเอง' },
        { text: 'Upgrade: Install Windows and keep files', feedback: 'Upgrade ใช้ได้เฉพาะตอนติดตั้งจากใน Windows เดิม' },
        { text: 'Repair your computer', feedback: 'Repair ใช้ซ่อมระบบเดิม ไม่ใช่การติดตั้ง' },
      ],
      ref: 'ใบเนื้อหา หน้า 9–10',
    },
    {
      id: 'q-newdisk',
      kind: 'transfer',
      prompt: 'ติดตั้งลงฮาร์ดดิสก์ใหม่ที่ขึ้นว่า Unallocated Space ตามใบเนื้อหาควรทำอะไรก่อนกด Next',
      choices: [
        { text: 'สร้าง Partition ด้วยปุ่ม New แล้วเลือกพาร์ทิชันนั้น', correct: true, feedback: 'ถูกต้อง ขั้นที่ 8 ให้สร้าง Partition ก่อนเมื่อเป็นฮาร์ดดิสก์ใหม่' },
        { text: 'กด Load driver', feedback: 'Load driver ใช้เมื่อตัวติดตั้งมองไม่เห็นดิสก์' },
        { text: 'กด Delete', feedback: 'พื้นที่ว่างไม่มีอะไรให้ลบ' },
      ],
      ref: 'ใบเนื้อหา หน้า 10',
    },
  ],
  thanks: 'ติดตั้งเสร็จแล้ว เร็วกว่าที่คิดอีกค่ะ งานสุดท้ายช่วยตั้งค่าเริ่มต้นให้นักเรียนใช้ได้เลยนะคะ',
}
