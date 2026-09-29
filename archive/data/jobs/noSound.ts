import type { JobDef } from '../../game/types.ts'
import { ANN } from '../people.ts'

export const noSoundJob: JobDef = {
  id: 'no-sound',
  order: 3,
  code: 'งาน 03',
  title: 'สื่อการสอนไม่มีเสียง',
  tagline: 'ใช้เครื่องมือของระบบหาข้อมูลอุปกรณ์ แล้วติดตั้งไดรเวอร์ให้ตรงรุ่น',
  customer: ANN,
  intake: [
    'หลานเพิ่งลง Windows ใหม่ให้ครูเมื่อวาน ตอนนี้เปิดคลิปสื่อการสอนแล้วไม่มีเสียงเลยค่ะ',
    'ลำโพงครูลองเอาไปเสียบเครื่องอื่นแล้ว มีเสียงปกตินะ',
    'พรุ่งนี้ต้องใช้สอนแล้ว ช่วยดูให้หน่อยนะคะ',
  ],
  workOrder: [
    { label: 'เครื่อง', value: 'โน้ตบุ๊ก Bloom Book 14 เพิ่งลง Windows 10 ใหม่', fact: 'wo-fresh' },
    { label: 'อาการ', value: 'ไม่มีเสียงจากทุกโปรแกรม', fact: 'wo-nosound' },
    { label: 'ตรวจแล้ว', value: 'ลำโพงภายนอกเสียบเครื่องอื่นมีเสียงปกติ', fact: 'wo-spk' },
    { label: 'งาน', value: 'หาสาเหตุ แก้ไข และทดสอบเสียงก่อนส่งคืน' },
  ],
  objectives: [
    {
      id: 'o1',
      text: 'อธิบายหน้าที่ของไดรเวอร์ และหาข้อมูลรุ่นอุปกรณ์ด้วย Device Manager และ dxdiag',
      rules: [{ criterion: 'reasoning', min: 0.6 }],
    },
    {
      id: 'o2',
      text: 'ติดตั้งไดรเวอร์ที่ตรงรุ่นและตรงระบบ แล้วทดสอบผล',
      rules: [
        { criterion: 'accuracy', min: 0.6 },
        { criterion: 'testing', min: 1 },
      ],
    },
  ],
  units: ['หน่วย 4'],
  reward: 250,
  minutes: 15,
  requires: 'reinstall',
  criteria: ['accuracy', 'reasoning', 'dataSafety', 'testing'],
  learn: {
    title: 'ไดรเวอร์: ล่ามระหว่าง OS กับอุปกรณ์',
    blocks: [
      {
        kind: 'flow',
        steps: [
          { label: 'โปรแกรม', sub: 'เล่นคลิปสื่อการสอน' },
          { label: 'ระบบปฏิบัติการ', sub: 'Windows' },
          { label: 'ไดรเวอร์', sub: 'แปลคำสั่งให้ตรงรุ่นอุปกรณ์' },
          { label: 'ฮาร์ดแวร์', sub: 'การ์ดเสียง → ลำโพง' },
        ],
      },
      {
        kind: 'text',
        text: '**ไดรเวอร์ (Driver)** คือโปรแกรมที่ช่วยให้คอมพิวเตอร์มองเห็นอุปกรณ์ที่ต่อพ่วง และทำงานร่วมกันได้เต็มประสิทธิภาพ เช่น การ์ดเสียง การ์ดจอ เครื่องพิมพ์ ถ้าไดรเวอร์ไม่ตรงรุ่น อุปกรณ์อาจใช้งานไม่ได้แม้ฮาร์ดแวร์จะไม่เสีย',
      },
      {
        kind: 'points',
        title: 'เครื่องมือตามหนังสือ',
        items: [
          '**dxdiag** กด Windows + R พิมพ์ dxdiag แล้วดูแท็บ Sound ช่อง Name เพื่อหารุ่นการ์ดเสียง',
          '**Device Manager** คลิกขวาปุ่ม Start ดูอุปกรณ์ที่มีเครื่องหมายเตือน และสั่ง Update driver',
          'นำชื่อรุ่นไปค้นหาไดรเวอร์จากเว็บไซต์ผู้ผลิต แตกไฟล์ แล้วดับเบิลคลิก setup.exe',
        ],
      },
      { kind: 'note', tone: 'tip', text: 'ติดตั้งเสร็จแล้วรีสตาร์ตเครื่อง และทดสอบเล่นเสียงจริงทุกครั้งก่อนส่งคืน' },
      {
        kind: 'note',
        tone: 'extra',
        title: 'เสริมนอกเล่ม',
        text: 'แท็บ System ของ dxdiag บอกรุ่น Windows และจำนวนบิต (32/64-bit) ใช้ประกอบการเลือกไฟล์ไดรเวอร์ให้ตรงระบบ',
      },
    ],
    more: [
      {
        kind: 'points',
        title: 'Update driver มี 2 วิธี',
        items: [
          'Search automatically ให้ Windows ค้นหาไดรเวอร์ผ่านอินเทอร์เน็ต',
          'Browse my computer เลือกไฟล์ไดรเวอร์ที่ดาวน์โหลดมาเก็บไว้เอง',
        ],
      },
      {
        kind: 'note',
        tone: 'warn',
        title: 'เสริมนอกเล่ม',
        text: 'เว็บที่รวมไดรเวอร์ฟรีทุกยี่ห้อ หรือโปรแกรมอัปเดตไดรเวอร์อัตโนมัติจากแหล่งที่ไม่รู้จัก อาจแฝงมัลแวร์ ใช้เว็บของผู้ผลิตเป็นหลัก',
      },
    ],
    refs: [
      'หน่วย 4 หัวข้อ 4.1 ความหมายของไดรเวอร์ หน้า 72',
      'หน่วย 4 หัวข้อ 4.3.2 ไดรเวอร์การ์ดเสียง หน้า 83–85',
      'หน่วย 4 หัวข้อ 4.3.4 อัปเดตไดรเวอร์ผ่าน Device Manager หน้า 92–93',
    ],
  },
  demo: [
    {
      title: 'ตั้งสมมติฐาน แล้วหาหลักฐาน',
      say: 'สมมติเครื่องหนึ่งภาพบนจอไม่คมชัดหลังลงระบบใหม่ พี่สงสัยไดรเวอร์การ์ดจอ แต่ยังไม่ลงมือจนกว่าจะมีหลักฐาน',
    },
    {
      title: 'หารุ่นด้วย dxdiag',
      say: 'พี่กด Windows + R พิมพ์ dxdiag แล้วดูแท็บ Display ช่อง Name ได้ชื่อรุ่นการ์ดจอ และดูแท็บ System ว่าเป็น Windows กี่บิต',
      visual: {
        kind: 'table',
        head: ['dxdiag', 'ค่าที่อ่านได้'],
        rows: [
          ['Display > Name', 'Bloom Graphics BG-2000'],
          ['System > Operating System', 'Windows 10 Home 64-bit'],
        ],
      },
    },
    {
      title: 'ดาวน์โหลดจากผู้ผลิตให้ตรงรุ่น',
      say: 'พี่ค้นชื่อรุ่นแล้วเข้าเว็บไซต์ของผู้ผลิต เลือกไฟล์ที่ตรงทั้งรุ่นการ์ด ตรง Windows 10 และตรง 64 บิต จากนั้นติดตั้งแบบ Express ตามที่หนังสือแนะนำ',
    },
    {
      title: 'รีสตาร์ตแล้วทดสอบจริง',
      say: 'ติดตั้งเสร็จพี่รีสตาร์ต เปิด Device Manager ดูว่าเครื่องหมายเตือนหายไป แล้วทดสอบใช้งานจริงก่อนส่งคืนทุกครั้ง',
    },
  ],
  stages: [
    { id: 'investigate', label: 'หาหลักฐาน' },
    { id: 'fix', label: 'ติดตั้งไดรเวอร์' },
    { id: 'verify', label: 'ทดสอบก่อนส่ง' },
  ],
  hints: {
    investigate: [
      'คลิกไอคอนลำโพงที่มุมขวาล่างเพื่อดูสถานะเสียง',
      'คลิกขวาที่ปุ่ม Start แล้วเปิด Device Manager ดูหมวด Sound, video and game controllers',
      'กด Run (Windows + R) พิมพ์ dxdiag แล้วดูแท็บ Sound (ชื่อรุ่น) กับแท็บ System (Windows กี่บิต)',
    ],
    fix: [
      'เปิดเว็บเบราว์เซอร์ ค้นหาด้วยชื่อรุ่นการ์ดเสียงที่ได้จาก dxdiag',
      'เลือกเว็บไซต์ของผู้ผลิต nimbus-audio.example และไฟล์สำหรับ Windows 10 64-bit',
      'เปิด File Explorer > Downloads แตกไฟล์ (Extract All) แล้วดับเบิลคลิก setup.exe หรือใช้ Update driver > Browse my computer',
      'ติดตั้งเสร็จให้รีสตาร์ตเครื่อง',
    ],
    verify: ['เปิด Device Manager ดูว่าเครื่องหมายเตือนหายไปแล้ว', 'คลิกไอคอนลำโพงแล้วกดทดสอบเสียง'],
  },
  evidence: {
    'wo-fresh': { label: 'เพิ่งลง Windows 10 ใหม่เมื่อวาน', source: 'ใบสั่งงาน' },
    'wo-nosound': { label: 'ไม่มีเสียงจากทุกโปรแกรม', source: 'ใบสั่งงาน' },
    'wo-spk': { label: 'ลำโพงภายนอกใช้กับเครื่องอื่นได้ปกติ', source: 'ใบสั่งงาน' },
    'vol-x': { label: 'ไอคอนลำโพงขึ้นกากบาท ไม่พบอุปกรณ์ส่งออกเสียง', source: 'แถบงาน' },
    'dm-warn': { label: 'Nimbus HD Audio NA-892 มีเครื่องหมายเตือนใน Device Manager', source: 'Device Manager' },
    'dm-code10': { label: 'สถานะอุปกรณ์: This device cannot start. (Code 10)', source: 'Device Manager' },
    'dm-generic': { label: 'ไดรเวอร์ที่ใช้อยู่เป็นแบบทั่วไปของ Microsoft ปี 2015', source: 'Device Manager' },
    'dx-name': { label: 'การ์ดเสียงรุ่น Nimbus HD Audio NA-892', source: 'dxdiag แท็บ Sound' },
    'dx-os': { label: 'ระบบ Windows 10 Home 64-bit', source: 'dxdiag แท็บ System' },
    'dx-ram': { label: 'หน่วยความจำ 8192MB RAM', source: 'dxdiag แท็บ System' },
    'dx-model': { label: 'รุ่นเครื่อง Bloom Book 14', source: 'dxdiag แท็บ System' },
    'ts-driver': { label: 'ตัวแก้ไขปัญหาแนะนำให้อัปเดตไดรเวอร์เสียง', source: 'Settings > Sound' },
  },
  mistakes: {
    'drv-unsafe': {
      label: 'ดาวน์โหลดไดรเวอร์จากเว็บที่ไม่เป็นทางการ',
      severity: 'major',
      criterion: 'dataSafety',
      explain: 'หนังสือแนะนำให้ใช้ไดรเวอร์รุ่นล่าสุดจากผู้ผลิตอุปกรณ์ เว็บรวมไดรเวอร์หรือโปรแกรมอัปเดตอัตโนมัติจากแหล่งที่ไม่รู้จักอาจแฝงมัลแวร์',
      ref: 'หน่วย 4 หน้า 80',
    },
    'drv-arch': {
      label: 'ติดตั้งไดรเวอร์ 32 บิตบน Windows 64 บิต',
      severity: 'major',
      criterion: 'accuracy',
      explain: 'ไดรเวอร์ต้องตรงกับจำนวนบิตของระบบ dxdiag แท็บ System บอกว่าเครื่องนี้เป็น 64-bit',
    },
    'drv-model': {
      label: 'ติดตั้งไดรเวอร์ผิดรุ่นอุปกรณ์',
      severity: 'major',
      criterion: 'accuracy',
      explain: 'การ์ดเสียงของเครื่องนี้คือ NA-892 ตามที่ dxdiag แท็บ Sound แสดง ไดรเวอร์ของรุ่นอื่นใช้แทนกันไม่ได้',
      ref: 'หน่วย 4 หน้า 83–84',
    },
    'drv-os': {
      label: 'ติดตั้งไดรเวอร์ที่ทำมาสำหรับ Windows 7',
      severity: 'major',
      criterion: 'accuracy',
      explain: 'ต้องเลือกไฟล์ที่ผู้ผลิตระบุว่ารองรับระบบปฏิบัติการของเครื่อง (Windows 10)',
    },
    'ev-missing': {
      label: 'เลือกไฟล์ไดรเวอร์โดยยังไม่มีหลักฐานรุ่นอุปกรณ์หรือรุ่นระบบ',
      severity: 'minor',
      criterion: 'reasoning',
      explain: 'ก่อนดาวน์โหลดควรรู้ทั้งชื่อรุ่นการ์ดเสียงและรุ่น Windows (กี่บิต) จาก dxdiag หรือ Device Manager',
    },
    'ev-irrelevant': {
      label: 'ใช้หลักฐานที่ไม่เกี่ยวข้องในการเลือกไดรเวอร์',
      severity: 'minor',
      criterion: 'reasoning',
      explain: 'ขนาดหน่วยความจำไม่ได้บอกว่าต้องใช้ไดรเวอร์ไฟล์ไหน ให้ใช้ชื่อรุ่นอุปกรณ์และรุ่นระบบ',
    },
  },
  checks: [
    { id: 'check-devmgr', label: 'ตรวจ Device Manager หลังติดตั้ง ไม่มีเครื่องหมายเตือน', required: true },
    { id: 'check-sound', label: 'ทดสอบเล่นเสียงหลังแก้', required: true },
  ],
  principles: [
    'ไดรเวอร์ทำให้ระบบปฏิบัติการสั่งงานอุปกรณ์ได้ ถ้าไดรเวอร์ไม่ตรงรุ่น อุปกรณ์ก็ใช้งานไม่ได้',
    'ใช้ Device Manager หาอุปกรณ์ที่มีปัญหา และใช้ dxdiag ดูชื่อรุ่นกับรุ่นระบบ',
    'เลือกไดรเวอร์จากผู้ผลิต ให้ตรงรุ่นอุปกรณ์ ตรง Windows และตรง 32/64 บิต',
    'ติดตั้งแล้วรีสตาร์ต และทดสอบจริงก่อนส่งคืน',
  ],
  quiz: [
    {
      id: 'q-driver',
      kind: 'reason',
      prompt: 'ข้อใดอธิบายความหมายของไดรเวอร์ได้ถูกต้องที่สุด',
      choices: [
        { text: 'โปรแกรมที่ช่วยให้คอมพิวเตอร์มองเห็นและใช้งานอุปกรณ์ได้', correct: true, feedback: 'ถูกต้อง ตรงกับความหมายในหน่วย 4' },
        { text: 'โปรแกรมที่ช่วยให้อุปกรณ์มองเห็นคอมพิวเตอร์', feedback: 'สลับทิศทาง ไดรเวอร์ช่วยให้คอมพิวเตอร์มองเห็นอุปกรณ์' },
        { text: 'อุปกรณ์ฮาร์ดแวร์ที่ต่อเพิ่มบนเมนบอร์ด', feedback: 'ไดรเวอร์เป็นซอฟต์แวร์ ไม่ใช่ฮาร์ดแวร์' },
      ],
      ref: 'หน่วย 4 หัวข้อ 4.1 หน้า 72',
    },
    {
      id: 'q-display',
      kind: 'transfer',
      prompt: 'หลังลง Windows ใหม่ ภาพไม่คมชัดและปรับความละเอียดไม่ได้ ควรดูชื่อรุ่นการ์ดจอจากที่ใดก่อนดาวน์โหลดไดรเวอร์',
      choices: [
        { text: 'dxdiag แท็บ Display', correct: true, feedback: 'ถูกต้อง ตรงกับขั้นตอนดูรุ่นการ์ดจอในหนังสือ' },
        { text: 'dxdiag แท็บ Sound', feedback: 'แท็บ Sound ใช้ดูการ์ดเสียง ไม่ใช่การ์ดจอ' },
        { text: 'โปรแกรม Snipping Tool', feedback: 'Snipping Tool ใช้จับภาพหน้าจอ (หน่วย 6)' },
      ],
      ref: 'หน่วย 4 หัวข้อ 4.3.1 หน้า 81',
    },
    {
      id: 'q-unsafe',
      kind: 'reason',
      prompt: 'ทำไมไม่ควรดาวน์โหลดไดรเวอร์จากเว็บที่โฆษณาว่า "ไดรเวอร์ฟรีทุกยี่ห้อ"',
      choices: [
        {
          text: 'อาจได้ไฟล์ไม่ตรงรุ่นหรือแฝงมัลแวร์ ควรใช้ไฟล์จากผู้ผลิต',
          correct: true,
          feedback: 'ถูกต้อง แหล่งที่เชื่อถือได้ที่สุดคือผู้ผลิตอุปกรณ์',
        },
        { text: 'เพราะไดรเวอร์ฟรีทำงานช้ากว่าเสมอ', feedback: 'ไดรเวอร์ส่วนใหญ่ฟรีอยู่แล้ว ปัญหาอยู่ที่แหล่งที่มา' },
        { text: 'เพราะ Windows ห้ามติดตั้งไดรเวอร์จากอินเทอร์เน็ต', feedback: 'ติดตั้งได้ แต่ต้องมาจากแหล่งที่เชื่อถือได้' },
      ],
      ref: 'หน่วย 4 หน้า 80',
    },
  ],
  thanks: 'เสียงมาแล้ว! ชัดด้วย พรุ่งนี้สอนได้สบายเลย ขอบคุณมากนะคะ',
}
