import type { JobDef, MistakeDef } from '../../game/types.ts'
import { MICROSOFT_WIN10_URL } from '../../sims/microsoftInstall/mediaCreation.ts'
import { reinstallJob } from './reinstall.ts'

const mistake = (label: string, explain: string, safety = false): MistakeDef => ({
  label, explain, severity: 'major', criterion: safety ? 'dataSafety' : 'accuracy', extra: true,
})

/** Reuses the same customer PC as the capstone, with teaching and a different media workflow. */
export const microsoftInstallJob: JobDef = {
  ...reinstallJob,
  id: 'microsoft-install',
  mode: 'guided',
  order: 5,
  code: 'งานฝึก Microsoft',
  title: 'ฝึกลง Windows 10 จากเว็บ Microsoft',
  tagline: 'พี่บูตพาทำ: ดาวน์โหลด Media Creation Tool → สร้าง USB → บูตและติดตั้ง → ตรวจงาน',
  reward: 150,
  minutes: 25,
  intake: [
    'ก่อนรับงานจริง พี่บูตเตรียมเครื่องฝึกตามสเปกของคุณเก่งไว้ให้ลองทำครบกระบวนการครับ',
    'รอบนี้ดาวน์โหลดเครื่องมือจากเว็บ Microsoft แล้วสร้างแฟลชไดรฟ์ Windows 10 ภาษาไทย 64-bit ครับ',
    'เครื่องใช้ Windows 10 Home และมีรูปใน D: ต้องสำรองและเก็บรูปไว้ให้ครบ พี่บูตจะสอนไปด้วยทีละขั้นครับ',
  ],
  workOrder: [...reinstallJob.workOrder, { label: 'สื่อที่ต้องใช้', value: 'Media Creation Tool จาก Microsoft · Windows 10 ภาษาไทย · 64-bit · KINGSTON (F:) 16 GB ว่างเปล่า' }],
  units: ['ใบเนื้อหา Win10 หน้า 3–15', 'เสริม: Media Creation Tool จาก Microsoft'],
  learn: {
    title: 'ติดตั้ง Windows 10 โดยเริ่มจาก Microsoft',
    blocks: [
      { kind: 'note', tone: 'extra', text: 'เส้นทาง Media Creation Tool เป็นเนื้อหาเสริมจาก Microsoft ส่วนการบูต ติดตั้ง และตั้งค่าหลังติดตั้งเชื่อมกับใบเนื้อหา Win10 หน้า 3–15' },
      { kind: 'flow', steps: [
        { label: 'สำรองข้อมูลลูกค้า', sub: 'สำเนาอยู่คนละอุปกรณ์กับดิสก์ที่จะติดตั้ง' },
        { label: 'เปิดเว็บ Microsoft', sub: 'ดาวน์โหลด Media Creation Tool' },
        { label: 'สร้างสื่อสำหรับเครื่องอื่น', sub: 'ภาษา รุ่น และสถาปัตยกรรมตามเครื่องลูกค้า' },
        { label: 'เลือก USB', sub: 'ว่างเปล่า ขนาดอย่างน้อย 8 GB' },
        { label: 'บูต ติดตั้ง และตรวจงาน', sub: 'รักษาข้อมูล และตรวจการเปิดใช้งาน/อัปเดต' },
      ] },
      { kind: 'points', title: 'อ่านข้อมูลก่อนเลือก', items: [
        'เครื่องร้านกับเครื่องลูกค้าอาจใช้ภาษาและสถาปัตยกรรมต่างกัน อย่าใช้ recommended options ของเครื่องร้านโดยไม่ตรวจ',
        'เลือก Create installation media for another PC เพราะเรากำลังเตรียมสื่อให้เครื่องลูกค้า',
        'USB จะถูกลบข้อมูลทั้งหมด ตรวจชื่อ ขนาด และสิ่งที่อยู่ข้างในก่อนเริ่ม',
        'Media Creation Tool ไม่มีช่องเลือก MBR/GPT แบบ Rufus งานนี้บูต USB แบบ UEFI ให้ตรงกับดิสก์ GPT ของลูกค้า',
      ] },
    ],
    refs: ['ใบเนื้อหา Win10 หน้า 3–15: การบูต ติดตั้ง และตั้งค่า', `Microsoft: Download Windows 10 — ${MICROSOFT_WIN10_URL}`],
  },
  demo: [{ title: 'ข้อมูลของเครื่องลูกค้าสำคัญกว่าค่าเริ่มต้น', say: 'พี่ดูใบงานก่อน: ลูกค้าต้องการภาษาไทยและ CPU รองรับ x64 แต่เครื่องร้านตั้ง English / 32-bit ไว้ จึงเอาติ๊ก Use the recommended options for this PC ออก แล้วเลือกตามเครื่องลูกค้า' }],
  stages: reinstallJob.stages.map(stage => stage.id === 'rufus' ? { ...stage, label: 'ดาวน์โหลดจาก Microsoft และสร้าง USB' } : stage),
  hints: {
    ...reinstallJob.hints,
    rufus: [
      'เลือกเว็บ www.microsoft.com → ดาวน์โหลดตอนนี้ → เปิดเครื่องมือ → Accept',
      'เลือก Create installation media for another PC ไม่ใช่ Upgrade this PC now',
      'เอาติ๊ก recommended options ออก เลือกภาษาไทย, Windows 10 และ 64-bit ตามใบงาน',
      'เลือก USB flash drive แล้วเลือก KINGSTON (F:) 16 GB ตรวจว่าเป็นแฟลชไดรฟ์ว่างก่อนยืนยัน',
      'รอ Your USB flash drive is ready → Finish แล้วนำไปเสียบเครื่องลูกค้า',
    ],
    setup: reinstallJob.hints.setup.filter(text => !text.startsWith('RAM 16')),
  },
  mistakes: {
    ...reinstallJob.mistakes,
    'mct-source': mistake('เลือกแหล่งดาวน์โหลดที่ไม่ใช่ Microsoft', 'ตรวจชื่อโดเมน www.microsoft.com ก่อนดาวน์โหลดเครื่องมือ ไม่ตัดสินจากคำว่า Windows ในชื่อผลค้นหา'),
    'mct-task': mistake('เลือกอัปเกรดเครื่องร้าน', 'งานนี้ต้องสร้าง USB ให้เครื่องลูกค้า เลือก Create installation media for another PC'),
    'mct-options': mistake('ภาษา/สถาปัตยกรรมไม่ตรงกับเครื่องลูกค้า', 'เอาติ๊ก recommended options ออก แล้วเลือกภาษาไทยและ 64-bit ตามใบงาน ไม่ใช้ค่าของเครื่องร้าน'),
    'mct-media': mistake('เลือก ISO ทั้งที่ลูกค้าต้องการ USB พร้อมบูต', 'ISO เป็นไฟล์ภาพดิสก์ ยังไม่ใช่แฟลชไดรฟ์พร้อมใช้งาน งานนี้เลือก USB flash drive'),
    'mct-drive': mistake('เลือกไดรฟ์ที่เก็บข้อมูลสำรอง', 'SHOP-BACKUP (E:) มีข้อมูลลูกค้าอยู่ ให้เลือก KINGSTON (F:) 16 GB ที่ว่างเปล่า เกมหยุดก่อนเขียนเพื่อให้ตรวจใหม่', true),
    'mct-no-drive': mistake('ยังไม่ได้เลือกแฟลชไดรฟ์', 'ตรวจชื่อและขนาดอุปกรณ์แล้วเลือก KINGSTON (F:) 16 GB'),
  },
  checks: [...reinstallJob.checks,
    { id: 'check-microsoft', label: 'ตรวจแหล่งดาวน์โหลดเป็นเว็บ Microsoft', required: true },
    { id: 'check-media-options', label: 'ตรวจภาษา สถาปัตยกรรม และอุปกรณ์ก่อนสร้าง USB', required: true },
    { id: 'check-media-ready', label: 'สร้าง USB สำเร็จและตรวจหน้าพร้อมใช้งาน', required: true },
  ],
  principles: [
    'ดาวน์โหลดเครื่องมือจาก Microsoft และเลือกสร้างสื่อสำหรับเครื่องอื่น',
    'เลือกภาษาและสถาปัตยกรรมให้ตรงกับเครื่องลูกค้า ไม่ใช่เครื่องร้าน',
    'USB ต้องมีอย่างน้อย 8 GB และข้อมูลเดิมจะถูกลบ',
    ...reinstallJob.principles.slice(2),
  ],
  quiz: [{ id: 'q-mct', kind: 'transfer', prompt: 'ถ้าเครื่องร้านใช้ 32-bit แต่เครื่องลูกค้ารองรับ x64 และต้องการ 64-bit ควรทำอย่างไร?', choices: [
    { text: 'ยกเลิก recommended options แล้วเลือก 64-bit ตามเครื่องลูกค้า', correct: true, feedback: 'ถูกต้อง สื่อต้องตรงกับเครื่องที่จะนำไปติดตั้ง' },
    { text: 'ใช้ค่า recommended ของเครื่องร้านเสมอ', feedback: 'ค่านี้อิงเครื่องที่กำลังใช้เครื่องมือ ไม่จำเป็นต้องตรงกับเครื่องลูกค้า' },
    { text: 'เลือก Upgrade this PC now', feedback: 'นั่นจะอัปเกรดเครื่องร้าน ไม่ได้สร้าง USB ให้ลูกค้า' },
  ] }, ...reinstallJob.quiz],
  thanks: 'ฝึกครบตั้งแต่เว็บ Microsoft จนติดตั้งและตรวจงานแล้ว ลองงานท้าทายเพื่อรับค่าจ้างที่สูงขึ้นและซื้อของแต่งร้านกันครับ',
}
