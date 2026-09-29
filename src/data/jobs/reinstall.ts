import type { JobDef } from '../../game/types.ts'
import { KENG } from '../people.ts'

// Capstone: every part of the content sheet (pages 1–15) on a customer PC that still has data on it.
export const reinstallJob: JobDef = {
  id: 'reinstall',
  order: 5,
  code: 'งาน 05',
  title: 'ลง Windows ใหม่ ห้ามรูปหาย (งานรวม)',
  tagline: 'ใช้ทุกขั้นตอนในใบเนื้อหากับเครื่องจริงของลูกค้า: สำรองข้อมูล ทำ USB ตั้ง BIOS ติดตั้ง และตรวจงาน',
  customer: KENG,
  intake: [
    'เครื่องผมช้ามาก มีหน้าต่างแปลก ๆ เด้งขึ้นมาตลอด อยากให้ล้างเครื่องลง Windows ใหม่เลยครับ',
    'แต่รูปงานลูกค้าทั้งหมดอยู่ในไดรฟ์ D: นะ หายไม่ได้เด็ดขาด',
    'เครื่องนี้เคยเปิดใช้งาน Windows 10 Home ถูกลิขสิทธิ์อยู่แล้วครับ',
  ],
  workOrder: [
    { label: 'เครื่อง', value: 'PC ตัดต่อภาพ หน่วยความจำ (RAM) 16 GB', fact: 'wo-ram16' },
    { label: 'ฮาร์ดดิสก์', value: '4 TB บนเมนบอร์ดแบบ UEFI', fact: 'wo-disk' },
    { label: 'ลิขสิทธิ์', value: 'Windows 10 Home (เคยเปิดใช้งานแล้ว)', fact: 'wo-home' },
    { label: 'ห้ามแตะ', value: 'ไดรฟ์ D: ชื่อ PHOTOS งานลูกค้า 12,480 ไฟล์', fact: 'wo-photos' },
    { label: 'อุปกรณ์ร้าน', value: 'แฟลชไดรฟ์ 16 GB และฮาร์ดดิสก์สำรอง 2 TB', fact: 'wo-tools' },
    { label: 'งาน', value: 'ล้างเครื่อง ติดตั้ง Windows 10 ใหม่ลงไดรฟ์ C: เท่านั้น' },
  ],
  objectives: [
    {
      id: 'o1',
      text: 'ทำ USB Boot ตั้ง BIOS และติดตั้ง Windows ได้ถูกต้องครบทุกขั้น',
      rules: [{ criterion: 'accuracy', min: 0.6 }],
    },
    {
      id: 'o2',
      text: 'ติดตั้งลงพาร์ทิชันที่ถูกต้องโดยไม่ทำข้อมูลของลูกค้าหาย',
      rules: [{ criterion: 'dataSafety', min: 1 }],
    },
  ],
  units: ['ใบเนื้อหา หน้า 1–15', 'งานรวม'],
  manualNo: 3,
  reward: 300,
  minutes: 20,
  requires: 'first-setup',
  criteria: ['accuracy', 'reasoning', 'dataSafety', 'testing'],
  learn: {
    title: 'ติดตั้ง Windows 10 ใหม่ทั้งกระบวนการ',
    blocks: [
      {
        kind: 'flow',
        steps: [
          { label: 'สร้าง USB Boot', sub: 'Rufus (หน้า 1–3)' },
          { label: 'ตั้งค่า BIOS', sub: 'USB มาก่อน (หน้า 3–6)' },
          { label: 'ติดตั้ง', sub: 'ขั้นที่ 1–9 (หน้า 6–11)' },
          { label: 'ตั้งค่าและอัปเดต', sub: 'ขั้นที่ 10–17 (หน้า 11–15)' },
        ],
      },
      {
        kind: 'points',
        title: 'จุดที่ต่างจากงาน 01–04',
        items: [
          'เครื่องนี้เป็น **UEFI** และฮาร์ดดิสก์ **4 TB** ต้องเลือก Partition scheme ให้เหมาะกับเครื่องและฮาร์ดดิสก์',
          'RAM 16 GB ตั้งแต่ 4 GB ขึ้นไป จึงเลือก Windows Setup **(64-bit)**',
          'เครื่องเคยเปิดใช้งานแล้ว หน้า Activate Windows บอกว่าถ้าติดตั้งใหม่ให้เลือก **I don\'t have a product key** แล้วเลือกรุ่นให้ตรงลิขสิทธิ์เดิม',
          'ขั้นที่ 8 ต้องเลือกไดรฟ์ให้ถูก ติดตั้งลงพาร์ทิชัน Windows เดิม **ห้ามลบหรือฟอร์แมตพาร์ทิชัน PHOTOS**',
        ],
      },
      {
        kind: 'note',
        tone: 'extra',
        title: 'สำรองข้อมูลก่อนเสมอ',
        text: 'ใบเนื้อหาไม่ได้พูดถึงการสำรองข้อมูล แต่ข้อความบนหน้าจอ Custom ของตัวติดตั้งแนะนำไว้ว่า "We recommend backing up your files before you continue" เครื่องที่มีงานของลูกค้าจึงต้องสำรองก่อน',
      },
    ],
    more: [
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
        tone: 'extra',
        text: 'MBR ใช้กับฮาร์ดดิสก์ได้ไม่เกิน 2 TB ฮาร์ดดิสก์ 4 TB ของเครื่องนี้เป็นแบบ GPT จึงต้องบูตแบบ UEFI และใช้ GPT partition scheme for UEFI computer',
      },
    ],
    refs: ['ใบเนื้อหา หน้า 1–15 (การสร้าง USB Boot, การกำหนดค่า BIOS และขั้นตอนการติดตั้ง 1–17)'],
  },
  demo: [
    {
      title: 'Rufus ลบทุกอย่างในอุปกรณ์ที่เลือก',
      say: 'ร้านเราต่อฮาร์ดดิสก์สำรองไว้ด้วย ก่อนกด START พี่ดูชื่อและขนาดของ Device ทุกครั้ง แฟลชไดรฟ์มีขนาดไม่กี่ GB ถ้าเห็นหลัก TB นั่นไม่ใช่แฟลชไดรฟ์แน่นอน',
    },
    {
      title: 'เลือกพาร์ทิชันอย่างมีสติ',
      say: 'หน้า Where do you want to install Windows? จะแสดงทุกพาร์ทิชัน ให้ดูชื่อและขนาด พาร์ทิชันใหญ่ที่ชื่อ DATA หรือ PHOTOS มักเป็นข้อมูลลูกค้า ห้ามลบเด็ดขาด',
    },
  ],
  stages: [
    { id: 'backup', label: 'สำรองข้อมูล' },
    { id: 'rufus', label: 'สร้าง USB Boot' },
    { id: 'bios', label: 'ตั้งค่า BIOS' },
    { id: 'setup', label: 'ติดตั้ง Windows (ขั้นที่ 1–9)' },
    { id: 'oobe', label: 'ตั้งค่าเริ่มต้น (ขั้นที่ 10–16)' },
    { id: 'verify', label: 'ตรวจงานก่อนส่ง (ขั้นที่ 17)' },
  ],
  hints: {
    backup: [
      'ก่อนล้างเครื่อง ให้คัดลอกโฟลเดอร์งานลูกค้าจากไดรฟ์ D: ไปเก็บในฮาร์ดดิสก์สำรองของร้าน',
      'เปิด PHOTOS (D:) เลือกโฟลเดอร์ งานลูกค้า แล้วกดปุ่มคัดลอกไป SHOP-BACKUP (E:)',
    ],
    rufus: [
      'ดูขนาดอุปกรณ์ในช่อง Device แฟลชไดรฟ์ของร้านคือ 16 GB',
      'ใบงานบอกว่าเครื่องเป็น UEFI และฮาร์ดดิสก์ 4 TB จึงควรเลือก GPT partition scheme for UEFI computer',
      'ไฟล์ ISO ต้องเป็น Windows 10 ไม่ใช่ Ubuntu หรือ Office',
    ],
    bios: [
      'กด F2 ตอนหน้าจอโลโก้เพื่อเข้า BIOS หรือกด F12 เพื่อเลือกอุปกรณ์บูตเฉพาะครั้งนี้',
      'ไปที่แท็บ Boot → Hard Disk Drives → 1st Drive แล้วเลือก USB',
      'กด F10 แล้วเลือก Ok เพื่อบันทึกและออก',
    ],
    setup: [
      'RAM 16 GB จึงเลือก Windows Setup (64-bit)',
      'เครื่องเคยเปิดใช้งานแล้ว กด I don\'t have a product key แล้วเลือกรุ่นให้ตรงลิขสิทธิ์เดิม (Home)',
      'เลือก Custom แล้วเลือกพาร์ทิชัน Windows ขนาด 237.9 GB ห้ามแตะ PHOTOS',
      'หลังติดตั้งเสร็จ ถ้าขึ้นให้กดปุ่มเพื่อบูตจาก USB ให้รอเฉย ๆ',
    ],
    oobe: ['เลือก Thailand และแป้นพิมพ์ แล้วใช้ Offline account ตั้งชื่อผู้ใช้ให้คุณเก่ง'],
    verify: [
      'เปิด This PC ตรวจว่า PHOTOS (D:) ยังมีงานครบ 12,480 ไฟล์',
      'พิมพ์ Windows Update ในช่องค้นหา กด Check for updates แล้ว Restart now ตามขั้นที่ 17',
    ],
  },
  evidence: {
    'wo-ram16': { label: 'หน่วยความจำ 16 GB', source: 'ใบสั่งงาน' },
    'wo-disk': { label: 'ฮาร์ดดิสก์ 4 TB เมนบอร์ดแบบ UEFI', source: 'ใบสั่งงาน' },
    'wo-home': { label: 'ลิขสิทธิ์เดิม Windows 10 Home', source: 'ใบสั่งงาน' },
    'wo-photos': { label: 'งานลูกค้าอยู่ในไดรฟ์ D: (PHOTOS) 12,480 ไฟล์', source: 'ใบสั่งงาน' },
    'wo-tools': { label: 'แฟลชไดรฟ์ของร้าน 16 GB, ฮาร์ดดิสก์สำรอง 2 TB', source: 'ใบสั่งงาน' },
  },
  mistakes: {
    'no-backup': {
      label: 'ติดตั้งใหม่โดยไม่สำรองข้อมูลลูกค้า',
      severity: 'major',
      criterion: 'dataSafety',
      explain: 'การติดตั้งใหม่มีความเสี่ยงเสมอ ควรสำรองข้อมูลสำคัญก่อน หน้าจอ Custom ของตัวติดตั้งเองก็แนะนำให้สำรองไฟล์',
      ref: 'ใบเนื้อหา หน้า 10 (ข้อความบนหน้าจอในรูปที่ 18)',
      extra: true,
    },
    'rufus-backup-drive': {
      label: 'เลือกฮาร์ดดิสก์สำรอง E: ใน Rufus จนข้อมูลสำรองถูกลบ',
      severity: 'critical',
      criterion: 'dataSafety',
      explain: 'Rufus จะลบข้อมูลทั้งหมดในอุปกรณ์ที่เลือก ต้องตรวจชื่อและขนาดของ Device (แฟลชไดรฟ์ 16 GB) ก่อนกด START',
      ref: 'ใบเนื้อหา หน้า 2',
    },
    'rufus-wrong-iso': {
      label: 'เลือกไฟล์ ISO ไม่ตรงกับระบบที่ลูกค้าต้องการ',
      severity: 'major',
      criterion: 'accuracy',
      explain: 'ลูกค้าต้องการ Windows 10 จึงต้องใช้ไฟล์ ISO ของ Windows 10',
      ref: 'ใบเนื้อหา หน้า 3',
    },
    'rufus-scheme': {
      label: 'เลือก Partition scheme ไม่เหมาะกับฮาร์ดดิสก์ 4 TB',
      severity: 'minor',
      criterion: 'accuracy',
      explain: 'ใบเนื้อหาให้เลือก Partition scheme ให้เหมาะกับเครื่องและฮาร์ดดิสก์ เครื่องนี้เป็น UEFI และดิสก์ 4 TB (เกินขีดจำกัดของ MBR ที่ 2 TB) จึงควรใช้ GPT partition scheme for UEFI computer',
      ref: 'ใบเนื้อหา หน้า 2–3',
    },
    'rufus-mbr': {
      label: 'ใช้ MBR partition scheme for BIOS or UEFI กับดิสก์ 4 TB ที่เป็น UEFI',
      severity: 'major',
      criterion: 'accuracy',
      explain: 'แฟลชไดรฟ์แบบนี้บูตเครื่องนี้แบบเดิม (BIOS) ตัวติดตั้งจึงติดตั้งลงดิสก์ GPT ขนาด 4 TB ไม่ได้ ต้องใช้ GPT partition scheme for UEFI computer',
      ref: 'ใบเนื้อหา หน้า 2–3',
    },
    'bios-no-save': {
      label: 'ออกจาก BIOS โดยไม่บันทึกการตั้งค่า',
      severity: 'minor',
      criterion: 'accuracy',
      explain: 'ลำดับบูตที่เปลี่ยนจะมีผลก็ต่อเมื่อกด F10 แล้วเลือก OK เพื่อบันทึกและออก',
      ref: 'ใบเนื้อหา หน้า 5–6',
    },
    'setup-32bit': {
      label: 'เลือกติดตั้ง 32 บิตกับเครื่อง RAM 16 GB',
      severity: 'major',
      criterion: 'accuracy',
      explain: 'ใบเนื้อหาให้เลือก 64 บิตเมื่อ RAM ตั้งแต่ 4 GB ขึ้นไป',
      ref: 'ใบเนื้อหา หน้า 7',
    },
    'setup-edition': {
      label: 'เลือกรุ่น Windows ไม่ตรงกับลิขสิทธิ์เดิมของเครื่อง',
      severity: 'minor',
      criterion: 'accuracy',
      explain: 'เครื่องนี้มีลิขสิทธิ์ Windows 10 Home ถ้าติดตั้งรุ่นอื่น Windows จะเปิดใช้งานอัตโนมัติไม่ได้',
      extra: true,
    },
    'setup-upgrade': {
      label: 'เลือก Upgrade ตอนบูตจากแฟลชไดรฟ์',
      severity: 'minor',
      criterion: 'accuracy',
      explain: 'ใบเนื้อหาให้เลือก Custom: Install Windows only (advanced) เพราะงานนี้ต้องเลือกพาร์ทิชันเอง ส่วน Upgrade ใช้ได้เมื่อเริ่มติดตั้งจากใน Windows ที่กำลังทำงานอยู่',
      ref: 'ใบเนื้อหา หน้า 9–10',
    },
    'setup-wipe-photos': {
      label: 'ลบหรือฟอร์แมตพาร์ทิชัน PHOTOS ของลูกค้า',
      severity: 'critical',
      criterion: 'dataSafety',
      explain: 'พาร์ทิชัน PHOTOS คือไดรฟ์ D: ที่เก็บงานลูกค้า การลบหรือฟอร์แมตทำให้ไฟล์หายทั้งหมด ขั้นที่ 8 ต้องเลือกเฉพาะพาร์ทิชัน Windows เดิม',
      ref: 'ใบเนื้อหา หน้า 10',
    },
    'setup-wrong-target': {
      label: 'เลือกติดตั้ง Windows ลงพาร์ทิชัน PHOTOS',
      severity: 'major',
      criterion: 'dataSafety',
      explain: 'ติดตั้งลงพาร์ทิชันข้อมูลจะทำให้ไฟล์ระบบปนกับงานลูกค้า และพาร์ทิชันระบบเดิมที่ติดไวรัสยังค้างอยู่',
      ref: 'ใบเนื้อหา หน้า 10',
    },
    'setup-delete-system': {
      label: 'ลบพาร์ทิชันระบบหรือพาร์ทิชันกู้คืนโดยไม่จำเป็น',
      severity: 'major',
      criterion: 'accuracy',
      explain: 'พาร์ทิชันเล็ก ๆ อย่าง System, MSR และ Recovery ใช้สำหรับบูตและกู้คืนระบบ งานนี้ไม่จำเป็นต้องแตะ',
      extra: true,
    },
    'reboot-keypress': {
      label: 'กดปุ่มตอนขึ้น Press any key to boot from USB',
      severity: 'minor',
      criterion: 'accuracy',
      explain: 'ขั้นที่ 9 เครื่องจะรีสตาร์ตเอง ช่วงนี้ไม่ต้องทำอะไร ถ้ากดปุ่ม เครื่องจะบูตจากแฟลชไดรฟ์และเริ่มติดตั้งใหม่อีกรอบ',
      ref: 'ใบเนื้อหา หน้า 10',
    },
  },
  checks: [
    { id: 'check-photos', label: 'ตรวจว่างานลูกค้าใน PHOTOS (D:) ยังอยู่ครบ', required: true },
    { id: 'check-update', label: 'ตรวจ Windows Update และ Restart จนขึ้น You\'re up to date (ขั้นที่ 17)', required: true },
    { id: 'check-activation', label: 'ตรวจว่า Windows เปิดใช้งานแล้ว', required: false },
  ],
  principles: [
    'สำรองข้อมูลก่อนติดตั้งใหม่ และตรวจชื่อกับขนาดอุปกรณ์ก่อนให้ Rufus เขียนทับ',
    'เลือก Partition scheme ให้เหมาะกับเครื่องและฮาร์ดดิสก์ เครื่อง UEFI ดิสก์ใหญ่กว่า 2 TB ใช้ GPT',
    'ตั้งลำดับบูตใน BIOS ให้ USB มาก่อน แล้วกด F10 บันทึก (หรือใช้เมนูบูตครั้งเดียวด้วย F12)',
    'เลือก Custom แล้วติดตั้งลงพาร์ทิชัน Windows เดิม ไม่แตะพาร์ทิชันข้อมูล',
    'ติดตั้งเสร็จแล้วตรวจข้อมูลลูกค้าและ Windows Update ก่อนส่งมอบ',
  ],
  quiz: [
    {
      id: 'q-custom',
      kind: 'reason',
      prompt: 'ทำไมงานนี้ต้องเลือก Custom: Install Windows only แทน Upgrade',
      choices: [
        {
          text: 'เพราะบูตจากแฟลชไดรฟ์ และต้องเลือกพาร์ทิชันที่จะติดตั้งเอง',
          correct: true,
          feedback: 'ถูกต้อง Custom ให้เราเลือกพาร์ทิชันเอง ส่วน Upgrade ใช้ได้เมื่อเริ่มติดตั้งจากใน Windows เดิม',
        },
        { text: 'เพราะ Custom ติดตั้งเร็วกว่าเสมอ', feedback: 'ความเร็วไม่ใช่เหตุผล จุดสำคัญคือการเลือกพาร์ทิชันเอง' },
        { text: 'เพราะ Upgrade จะลบไดรฟ์ D: ทุกครั้ง', feedback: 'ไม่ใช่ ความเสี่ยงต่อไดรฟ์ D: มาจากการเลือกพาร์ทิชันผิด' },
      ],
      ref: 'ใบเนื้อหา หน้า 9–10',
    },
    {
      id: 'q-key',
      kind: 'reason',
      prompt: 'ติดตั้ง Windows ใหม่ให้เครื่องที่เคยเปิดใช้งานแล้ว ควรทำอย่างไรที่หน้า Activate Windows',
      choices: [
        {
          text: 'กด I don\'t have a product key แล้วเลือกรุ่นให้ตรงลิขสิทธิ์เดิม',
          correct: true,
          feedback: 'ถูกต้อง ข้อความบนหน้าจอบอกว่า Windows จะเปิดใช้งานอัตโนมัติภายหลัง',
        },
        { text: 'ใส่คีย์ของเครื่องอื่นไปก่อน', feedback: 'ใช้คีย์ของเครื่องอื่นไม่ถูกต้องตามลิขสิทธิ์' },
        { text: 'เลือกรุ่นอะไรก็ได้ เพราะเปิดใช้งานแล้ว', feedback: 'ต้องเลือกรุ่นให้ตรงกับลิขสิทธิ์เดิม ไม่อย่างนั้นจะเปิดใช้งานอัตโนมัติไม่ได้' },
      ],
      ref: 'ใบเนื้อหา หน้า 8–9',
    },
    {
      id: 'q-anykey',
      kind: 'transfer',
      prompt: 'หลังติดตั้งเสร็จ เครื่องรีสตาร์ตแล้วขึ้น "Press any key to boot from USB..." ควรทำอย่างไร',
      choices: [
        {
          text: 'รอเฉย ๆ ให้เครื่องบูตจากฮาร์ดดิสก์ต่อเอง',
          correct: true,
          feedback: 'ถูกต้อง ตรงกับขั้นที่ 9: เครื่องจะ Restart เอง ช่วงนี้ไม่ต้องทำอะไร',
        },
        { text: 'กดปุ่มใดก็ได้ทันที', feedback: 'ถ้ากด เครื่องจะบูตจากแฟลชไดรฟ์และเริ่มติดตั้งใหม่อีกรอบ' },
        { text: 'ถอดปลั๊กแล้วเสียบใหม่', feedback: 'การตัดไฟระหว่างติดตั้งเสี่ยงทำให้ระบบเสียหาย' },
      ],
      ref: 'ใบเนื้อหา หน้า 10',
    },
  ],
  thanks: 'เครื่องลื่นขึ้นเยอะเลย แล้วรูปงานก็อยู่ครบ ขอบคุณมากครับที่ระวังให้ขนาดนี้',
}
