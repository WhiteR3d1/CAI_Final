import type { JobDef } from '../../game/types.ts'
import { PLOY } from '../people.ts'

// Windows 11 content sheet pages 1–2: 1 การตรวจสอบความพร้อมและการสำรองข้อมูล
export const w11CheckJob: JobDef = {
  id: 'w11-check',
  track: 'win11',
  order: 1,
  code: 'งาน W11-01',
  title: 'ตรวจความพร้อมก่อนลง Windows 11',
  tagline: 'ใช้ PC Health Check, msinfo32 และ tpm.msc ตรวจว่าโน้ตบุ๊กพร้อมไหม แล้วสำรองไฟล์และคีย์กู้คืนก่อนล้างเครื่อง',
  customer: PLOY,
  intake: [
    'โน้ตบุ๊กของสำนักงานยังเป็น Windows 10 อยู่เลยค่ะ ได้ยินว่าหมดระยะสนับสนุนแล้ว อยากลง Windows 11 Pro ใหม่ทั้งเครื่อง',
    'ในเครื่องมีไฟล์บัญชีลูกค้าเยอะมาก อยู่ในโฟลเดอร์ "บัญชีลูกค้า 2026" ใน Documents ห้ามหายเด็ดขาดนะคะ',
    'พี่ที่ร้านเคยเปิด BitLocker ให้ไดรฟ์ C: ไว้ด้วย พลอยเอาฮาร์ดดิสก์สำรอง BACKUP-PLOY มาเสียบไว้ให้แล้วค่ะ',
  ],
  workOrder: [
    { label: 'เครื่อง', value: 'โน้ตบุ๊ก PLOY-NB · Windows 10 Pro (สิทธิ์แบบดิจิทัล)', fact: 'wo-ploy-pc' },
    { label: 'งานที่ลูกค้าขอ', value: 'ติดตั้ง Windows 11 Pro ใหม่ทั้งเครื่อง (clean install)', fact: 'wo-ploy-win11' },
    { label: 'ข้อมูลสำคัญ', value: 'โฟลเดอร์ "บัญชีลูกค้า 2026" ใน Documents', fact: 'wo-ploy-files' },
    { label: 'ความปลอดภัย', value: 'ไดรฟ์ C: เปิด BitLocker ไว้', fact: 'wo-bitlocker' },
    { label: 'สื่อสำรอง', value: 'ฮาร์ดดิสก์ภายนอก BACKUP-PLOY (E:) 931 GB' },
    { label: 'งานรอบนี้', value: 'ตรวจความพร้อม สำรองข้อมูล ยังไม่ต้องติดตั้ง' },
  ],
  objectives: [
    { id: 'o1', text: 'บอกข้อกำหนดของเครื่องและตัดสินความพร้อมของ Windows 11 จากหลักฐาน', rules: [{ criterion: 'reasoning', min: 0.6 }] },
    { id: 'o2', text: 'สำรองไฟล์ไปยังสื่อแยกและเก็บคีย์กู้คืน BitLocker ก่อนล้างเครื่อง', rules: [{ criterion: 'dataSafety', min: 0.8 }] },
    { id: 'o3', text: 'ทดสอบว่าเปิดไฟล์สำรองได้จริง', rules: [{ criterion: 'testing', min: 0.75 }] },
  ],
  units: ['ใบเนื้อหา Win11 หน้า 1–2'],
  manualNo: 6,
  reward: 90,
  minutes: 10,
  criteria: ['accuracy', 'reasoning', 'dataSafety', 'testing'],
  learn: {
    title: 'ตรวจความพร้อมและสำรองข้อมูลก่อนติดตั้ง Windows 11',
    blocks: [
      {
        kind: 'table',
        title: 'ข้อกำหนดขั้นต่ำของ Windows 11',
        head: ['รายการ', 'ข้อกำหนด'],
        rows: [
          ['CPU', '64 บิตที่รองรับ 1 GHz ขึ้นไป 2 คอร์ขึ้นไป (ดูรุ่นในรายการที่ Microsoft รองรับ ไม่ดูแค่ความเร็ว)'],
          ['RAM / พื้นที่', 'RAM 4 GB ขึ้นไป / พื้นที่ 64 GB ขึ้นไป'],
          ['เฟิร์มแวร์', 'UEFI, Secure Boot capable และ TPM 2.0'],
          ['กราฟิก / จอ', 'DirectX 12 พร้อม WDDM 2.0 / 720p ขนาดมากกว่า 9 นิ้ว'],
        ],
      },
      {
        kind: 'flow',
        title: 'ตรวจด้วยเครื่องมือในเครื่อง',
        steps: [
          { label: 'PC Health Check', sub: 'ตรวจทั้งเครื่อง' },
          { label: 'Settings > System > About', sub: 'CPU, RAM, รุ่น Windows' },
          { label: 'msinfo32', sub: 'BIOS Mode, Secure Boot State' },
          { label: 'tpm.msc', sub: 'มี TPM 2.0 หรือไม่' },
        ],
      },
      {
        kind: 'points',
        title: 'ก่อนลบพาร์ทิชัน',
        items: [
          'สำรองไฟล์สำคัญไปยัง**สื่อที่แยกจากดิสก์เป้าหมาย** แล้ว**ลองเปิดไฟล์สำรอง**ให้แน่ใจ',
          'บันทึก**คีย์กู้คืน BitLocker** ไว้นอกไดรฟ์ที่เข้ารหัส',
          'ตรวจสิทธิ์และรุ่น Home/Pro ให้ตรงกับใบอนุญาต',
        ],
      },
    ],
    more: [
      {
        kind: 'note',
        tone: 'extra',
        text: 'TPM อาจ "มีในเครื่องแต่ปิดอยู่ในเฟิร์มแวร์" ทำให้ PC Health Check และ tpm.msc บอกว่าไม่พบ TPM ถ้ารุ่น CPU รองรับ ให้ลองเปิด TPM ในเมนู UEFI ก่อนตัดสินว่าต้องเปลี่ยนเครื่อง (ฝึกในงาน W11-03)',
      },
    ],
    refs: ['ใบเนื้อหา Win11 หน้า 1–2 หัวข้อที่ 1 การตรวจสอบความพร้อมและการสำรองข้อมูล'],
  },
  demo: [
    {
      title: 'ตรวจหลายแหล่ง',
      say: 'พี่จะเปิด PC Health Check ก่อนเพื่อดูภาพรวม แล้วยืนยันรายละเอียดจาก msinfo32 กับ tpm.msc ถ้าเจอข้อที่ไม่ผ่าน อย่าเพิ่งสรุป ให้ดูว่าเป็นเพราะฮาร์ดแวร์ไม่รองรับ หรือแค่ปิดไว้',
    },
    {
      title: 'สำรองแล้วต้องลองเปิด',
      say: 'คัดลอกโฟลเดอร์งานไปไดรฟ์สำรองที่แยกจากเครื่อง แล้วเปิดไฟล์จากไดรฟ์สำรองดูสักไฟล์ ถ้าเปิดไม่ได้ ก็เท่ากับยังไม่ได้สำรอง',
    },
    {
      title: 'คีย์กู้คืนอยู่นอกไดรฟ์ที่เข้ารหัส',
      say: 'เครื่องที่เปิด BitLocker ต้องเก็บคีย์กู้คืนไว้ที่อื่น เช่น แฟลชไดรฟ์หรือไดรฟ์สำรอง ห้ามเก็บไว้ในไดรฟ์ C: ที่เข้ารหัสอยู่',
    },
  ],
  stages: [
    { id: 'spec', label: 'ตรวจสเปกและความพร้อม' },
    { id: 'decide', label: 'สรุปความพร้อม' },
    { id: 'backup', label: 'สำรองและทดสอบเปิดไฟล์' },
    { id: 'key', label: 'เก็บคีย์กู้คืน BitLocker' },
  ],
  hints: {
    spec: [
      'พิมพ์ health ในช่องค้นหาที่ Taskbar เพื่อเปิด PC Health Check แล้วกด Check now',
      'พิมพ์ msinfo32 เพื่อดู BIOS Mode และ Secure Boot State และพิมพ์ tpm.msc เพื่อดูสถานะ TPM',
      'กดหมุดที่ข้อมูลสำคัญ (CPU, RAM, ดิสก์, TPM, BIOS Mode) เก็บไว้เป็นหลักฐาน',
    ],
    decide: ['CPU, RAM และดิสก์ผ่าน BIOS Mode เป็น UEFI แต่ TPM ไม่พบ ลองคิดว่า TPM ไม่มีจริง หรือแค่ถูกปิดในเฟิร์มแวร์'],
    backup: [
      'เปิด File Explorer ไปที่ Documents แล้วคัดลอกโฟลเดอร์ "บัญชีลูกค้า 2026" ไปที่ BACKUP-PLOY (E:)',
      'เปิด BACKUP-PLOY (E:) แล้วดับเบิลคลิกไฟล์ในโฟลเดอร์สำรองเพื่อทดสอบว่าเปิดได้',
    ],
    key: ['พิมพ์ bitlocker ในช่องค้นหา เลือก Back up your recovery key แล้วบันทึกลง BACKUP-PLOY (E:)'],
  },
  evidence: {
    'wo-ploy-pc': { label: 'PLOY-NB เป็น Windows 10 Pro สิทธิ์แบบดิจิทัล', source: 'ใบสั่งงาน' },
    'wo-ploy-win11': { label: 'ลูกค้าต้องการติดตั้ง Windows 11 Pro ใหม่ทั้งเครื่อง', source: 'ใบสั่งงาน' },
    'wo-ploy-files': { label: 'ไฟล์สำคัญอยู่ในโฟลเดอร์ "บัญชีลูกค้า 2026"', source: 'ใบสั่งงาน' },
    'wo-bitlocker': { label: 'ไดรฟ์ C: เปิด BitLocker', source: 'ใบสั่งงาน' },
    'si-cpu': { label: 'CPU 64 บิต 4 คอร์ 2.4 GHz อยู่ในรายการที่รองรับ', source: 'PC Health Check / About' },
    'si-ram': { label: 'RAM 8 GB', source: 'PC Health Check / About' },
    'si-disk': { label: 'ดิสก์ 256 GB', source: 'PC Health Check' },
    'si-uefi': { label: 'BIOS Mode: UEFI', source: 'System Information' },
    'si-secureboot': { label: 'Secure Boot State: Off (เครื่องรองรับ Secure Boot)', source: 'System Information' },
    'si-tpm': { label: 'ไม่พบ TPM (tpm.msc / PC Health Check)', source: 'tpm.msc' },
  },
  mistakes: {
    'ready-now': {
      label: 'สรุปว่าติดตั้ง Windows 11 ได้ทันที ทั้งที่ยังไม่พบ TPM 2.0',
      severity: 'major',
      criterion: 'reasoning',
      explain: 'ข้อกำหนดของ Windows 11 ต้องมี UEFI, Secure Boot capable และ TPM 2.0 เครื่องนี้ PC Health Check และ tpm.msc ยังไม่พบ TPM จึงต้องเปิด TPM ในเฟิร์มแวร์ก่อน',
      ref: 'ใบเนื้อหา Win11 หน้า 1',
    },
    'ready-never': {
      label: 'สรุปว่าต้องเปลี่ยนเครื่อง ทั้งที่ CPU, RAM และดิสก์ผ่าน',
      severity: 'major',
      criterion: 'reasoning',
      explain: 'CPU อยู่ในรายการที่รองรับ RAM 8 GB ดิสก์ 256 GB และบูตแบบ UEFI ผ่านหมด ปัญหาเหลือแค่ TPM ที่ระบบมองไม่เห็น ซึ่งมักแก้ได้ด้วยการเปิด TPM ในเมนู UEFI ตามคู่มือผู้ผลิต',
      ref: 'ใบเนื้อหา Win11 หน้า 1',
    },
    'no-backup': {
      label: 'จบงานโดยยังไม่ได้สำรองไฟล์สำคัญ',
      severity: 'critical',
      criterion: 'dataSafety',
      explain: 'ก่อนลบหรือจัดพาร์ทิชันให้สำรองไฟล์สำคัญไปยังสื่อแยกจากดิสก์เป้าหมาย การติดตั้งใหม่ทำให้ไฟล์บนดิสก์เป้าหมายหายทั้งหมด',
      ref: 'ใบเนื้อหา Win11 หน้า 1',
    },
    'backup-same-disk': {
      label: 'สำรองไฟล์ไว้ในไดรฟ์ C: ซึ่งเป็นดิสก์ที่จะถูกล้าง',
      severity: 'major',
      criterion: 'dataSafety',
      explain: 'สำเนาที่อยู่ในดิสก์เดียวกับที่จะลบพาร์ทิชันจะหายไปพร้อมกัน ต้องสำรองไปยังสื่อที่แยกจากดิสก์เป้าหมาย เช่น BACKUP-PLOY (E:)',
      ref: 'ใบเนื้อหา Win11 หน้า 1',
    },
    'no-recovery-key': {
      label: 'ไม่ได้เก็บคีย์กู้คืน BitLocker ก่อนล้างเครื่อง',
      severity: 'major',
      criterion: 'dataSafety',
      explain: 'เครื่องที่เปิด BitLocker/Device Encryption ต้องบันทึกคีย์กู้คืนไว้ในที่ปลอดภัยก่อน ถ้าเกิดปัญหาระหว่างทาง จะไม่มีทางเปิดไดรฟ์ได้อีก',
      ref: 'ใบเนื้อหา Win11 หน้า 1',
    },
    'ev-missing': {
      label: 'สรุปความพร้อมโดยหลักฐานยังไม่ครบ',
      severity: 'minor',
      criterion: 'reasoning',
      explain: 'การสรุปความพร้อมต้องดูทั้ง CPU, TPM และโหมดเฟิร์มแวร์ (UEFI/Secure Boot) ควรจดหลักฐานจากเครื่องมือตรวจให้ครบก่อน',
    },
    'ev-irrelevant': {
      label: 'ใช้หลักฐานที่ไม่เกี่ยวกับความพร้อมของเครื่อง',
      severity: 'minor',
      criterion: 'reasoning',
      explain: 'ความต้องการของลูกค้าหรือที่เก็บไฟล์ไม่ได้บอกว่าเครื่องผ่านข้อกำหนดหรือไม่ หลักฐานที่ตรงคือผลจากเครื่องมือตรวจ',
    },
  },
  checks: [
    { id: 'check-health', label: 'รัน PC Health Check ดูภาพรวมความพร้อม', required: true },
    { id: 'check-msinfo', label: 'เปิด System Information (msinfo32) ดู BIOS Mode และ Secure Boot State', required: true },
    { id: 'check-tpm', label: 'เปิด tpm.msc ดูสถานะ TPM', required: false },
    { id: 'check-backup-open', label: 'เปิดไฟล์จากไดรฟ์สำรองได้จริง', required: true },
  ],
  principles: [
    'ตรวจรุ่น CPU กับรายการที่ Microsoft รองรับ ไม่ดูแค่ความเร็วหรือจำนวนคอร์',
    'ยืนยันความพร้อมจากหลายแหล่ง: PC Health Check, About, msinfo32, tpm.msc',
    'สำรองไปยังสื่อแยกจากดิสก์เป้าหมาย แล้วทดสอบเปิดไฟล์สำรอง',
    'เก็บคีย์กู้คืน BitLocker ไว้นอกไดรฟ์ที่เข้ารหัส',
  ],
  quiz: [
    {
      id: 'q-cpu',
      kind: 'reason',
      prompt: 'ข้อใดเป็นข้อกำหนดขั้นต่ำด้าน CPU ของ Windows 11',
      choices: [
        { text: 'CPU 64 บิตที่รองรับ 1 GHz ขึ้นไป 2 คอร์ขึ้นไป', correct: true, feedback: 'ถูกต้อง และต้องเป็นรุ่นที่อยู่ในรายการที่ Microsoft รองรับด้วย' },
        { text: 'CPU 64 บิตที่รองรับ 1 GHz ขึ้นไป 1 คอร์ขึ้นไป', feedback: 'ต้องมีอย่างน้อย 2 คอร์' },
        { text: 'CPU 32 บิต 1 GHz ขึ้นไป 2 คอร์ขึ้นไป', feedback: 'Windows 11 ต้องใช้ CPU 64 บิต' },
      ],
      ref: 'ใบเนื้อหา Win11 หน้า 1',
    },
    {
      id: 'q-before-delete',
      kind: 'transfer',
      prompt: 'ก่อนลบพาร์ทิชันเพื่อติดตั้งใหม่ ควรตรวจสิ่งใด',
      choices: [
        { text: 'สำรองและทดสอบเปิดไฟล์แล้ว พร้อมยืนยันดิสก์เป้าหมาย', correct: true, feedback: 'ถูกต้อง ต้องครบทั้งสำรอง ทดสอบเปิด และยืนยันดิสก์' },
        { text: 'สำรองไฟล์แล้ว แต่ยังไม่ได้ทดสอบเปิดและยังไม่ยืนยันดิสก์', feedback: 'ถ้าไฟล์สำรองเปิดไม่ได้ หรือลบผิดดิสก์ ข้อมูลก็หาย' },
        { text: 'ยืนยันดิสก์แล้ว แต่ยังไม่ได้สำรองข้อมูล', feedback: 'ไม่มีสำเนา ข้อมูลหายถาวร' },
      ],
      ref: 'ใบเนื้อหา Win11 หน้า 1',
    },
    {
      id: 'q-firmware',
      kind: 'reason',
      prompt: 'ข้อใดตรงกับข้อกำหนดด้านเฟิร์มแวร์และความปลอดภัยของ Windows 11',
      choices: [
        { text: 'UEFI รองรับ Secure Boot และ TPM 2.0', correct: true, feedback: 'ถูกต้อง' },
        { text: 'UEFI รองรับ Secure Boot และ TPM 1.2', feedback: 'Windows 11 ต้องใช้ TPM 2.0' },
        { text: 'Legacy BIOS รองรับ Secure Boot และ TPM 2.0', feedback: 'Windows 11 ต้องใช้ UEFI' },
      ],
      ref: 'ใบเนื้อหา Win11 หน้า 1',
    },
  ],
  thanks: 'ไฟล์ลูกค้าปลอดภัยแล้ว ขอบคุณมากค่ะ งั้นขั้นต่อไปเตรียม USB ติดตั้งเลยนะคะ',
}
