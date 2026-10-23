// Registry of job modules (src/sims/modules) and a builder for "module jobs": the Windows 11 story jobs
// W11-02..05 and all challenge jobs. Each module has a fixed set of stages, mistakes and checks that its
// sim file reports (tests compare the two), its own hints, learn card and a quiz bank drawn from the content sheets.
import type { ModuleId, Phase } from '../game/scenarios.ts'
import type { CheckDef, CriterionId, DemoFrame, JobDef, JobId, KnowledgeCard, MistakeDef, Objective, Person, QuizQuestion, StageDef, Track, WorkOrderRow } from '../game/types.ts'

interface ModuleDef {
  track: Track
  manualNo: number
  pages: string
  stages: StageDef[]
  hints: Record<string, string[]>
  mistakes: Record<string, MistakeDef>
  /** every check the module can record; `when` decides if a scenario needs it */
  checks: (CheckDef & { when?: (phase: Phase) => boolean })[]
  principles: string[]
  learn: KnowledgeCard
  quiz: QuizQuestion[]
}

const W10 = 'ใบเนื้อหา Win10 หน้า'
const W11 = 'ใบเนื้อหา Win11 หน้า'

export const MODULES: Record<ModuleId, ModuleDef> = {
  rufus: {
    track: 'win10',
    manualNo: 1,
    pages: `${W10} 1–3`,
    stages: [{ id: 'rufus', label: 'ตั้งค่า Rufus แล้วกด Start' }],
    hints: {
      rufus: [
        'อ่านใบงานก่อน: เครื่องปลายทางเป็น BIOS หรือ UEFI และดิสก์เป็น MBR หรือ GPT',
        'ช่อง Device ต้องเป็นแฟลชไดรฟ์ของงานนี้ ดูทั้งชื่อและขนาดให้ตรงกับใบงาน',
        'ติ๊ก Create a bootable disk using ISO Image แล้วกดปุ่มรูปแผ่นดิสก์เลือกไฟล์ ISO ของ Windows 10',
      ],
    },
    mistakes: {
      'rufus-device': {
        label: 'เลือก Device ผิด เขียนทับอุปกรณ์ที่มีข้อมูล',
        severity: 'critical',
        criterion: 'dataSafety',
        explain: 'ช่อง Device คืออุปกรณ์ที่ Rufus จะลบแล้วเขียนไฟล์ติดตั้งลงไป ต้องตรวจชื่อและขนาดให้ตรงกับแฟลชไดรฟ์ของงานก่อนกด Start',
        ref: `${W10} 2`,
      },
      'rufus-scheme': {
        label: 'Partition scheme ไม่ตรงกับเครื่องปลายทาง',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'เลือก Partition scheme ให้เหมาะกับเครื่องและฮาร์ดดิสก์: BIOS ใช้ MBR for BIOS or UEFI, เครื่อง UEFI ดิสก์ MBR ใช้ MBR for UEFI, เครื่อง UEFI ดิสก์ GPT ใช้ GPT for UEFI',
        ref: `${W10} 2`,
      },
      'rufus-iso': {
        label: 'เลือกไฟล์ ISO ที่ไม่ใช่ Windows 10',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'กดปุ่มรูปแผ่นดิสก์แล้วเลือกไฟล์ ISO ของ Windows 10 ที่จะติดตั้ง ไฟล์อื่นสร้างตัวติดตั้ง Windows ไม่ได้',
        ref: `${W10} 3`,
      },
      'rufus-boot': {
        label: 'ไม่ได้ตั้งให้สร้าง USB ที่บูตได้จาก ISO',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'ต้องติ๊ก Create a bootable disk using และเลือก ISO Image ไม่อย่างนั้น Rufus จะแค่ฟอร์แมตแฟลชไดรฟ์',
        ref: `${W10} 3`,
      },
    },
    checks: [{ id: 'rufus-done', label: 'Rufus ขึ้น DONE เขียน USB Boot สำเร็จ', required: true }],
    principles: [
      'ช่อง Device = อุปกรณ์ที่จะถูกลบ ตรวจชื่อและขนาดก่อนกด Start',
      'Partition scheme ต้องตรงกับเครื่องปลายทาง (BIOS / UEFI กับ MBR / GPT)',
      'Create a bootable disk using ISO Image แล้วเลือกไฟล์ ISO ของ Windows 10',
    ],
    learn: {
      title: 'ทบทวน: สร้าง USB Boot ด้วย Rufus',
      blocks: [
        {
          kind: 'table',
          title: 'เลือก Partition scheme ให้ตรงเครื่อง',
          head: ['เครื่องปลายทาง', 'Partition scheme'],
          rows: [
            ['BIOS (หรือ UEFI ก็ได้)', 'MBR partition scheme for BIOS or UEFI computers'],
            ['UEFI ดิสก์ MBR', 'MBR partition scheme for UEFI computer'],
            ['UEFI ดิสก์ GPT', 'GPT partition scheme for UEFI computer'],
          ],
        },
        { kind: 'note', tone: 'warn', text: 'ข้อมูลทั้งหมดในอุปกรณ์ที่เลือกในช่อง **Device** จะถูกลบ' },
      ],
      refs: [`${W10} 1–3 การสร้าง USB Boot ด้วยโปรแกรม Rufus`],
    },
    quiz: [
      {
        id: 'q-rufus-device',
        kind: 'reason',
        prompt: 'ทำไมต้องตรวจชื่อและขนาดในช่อง Device ก่อนกด Start ใน Rufus',
        choices: [
          { text: 'เพราะข้อมูลทั้งหมดในอุปกรณ์ที่เลือกจะถูกลบ', correct: true, feedback: 'ถูกต้อง Rufus จะฟอร์แมตอุปกรณ์นั้นก่อนเขียนไฟล์ติดตั้งลงไป' },
          { text: 'เพราะ Rufus จะเลือกไฟล์ ISO ให้เองตามขนาดอุปกรณ์', feedback: 'ไฟล์ ISO ต้องเลือกเองด้วยปุ่มรูปแผ่นดิสก์' },
          { text: 'เพราะอุปกรณ์ที่ใหญ่กว่าจะทำงานเร็วกว่า', feedback: 'ขนาดใช้ยืนยันว่าเลือกตัวที่ถูก ไม่เกี่ยวกับความเร็ว' },
        ],
        ref: `${W10} 2`,
      },
      {
        id: 'q-rufus-gpt',
        kind: 'transfer',
        prompt: 'เครื่องปลายทางบูตแบบ UEFI และฮาร์ดดิสก์เป็นแบบ GPT ควรเลือก Partition scheme แบบใด',
        choices: [
          { text: 'GPT partition scheme for UEFI computer', correct: true, feedback: 'ถูกต้อง ตรงกับเครื่อง UEFI และดิสก์ GPT' },
          { text: 'MBR partition scheme for BIOS or UEFI computers', feedback: 'แบบนี้เหมาะกับเครื่อง BIOS รุ่นเก่า' },
          { text: 'MBR partition scheme for UEFI computer', feedback: 'แบบนี้ใช้กับเครื่อง UEFI ที่ดิสก์เป็น MBR' },
        ],
        ref: `${W10} 2`,
      },
      {
        id: 'q-rufus-bios',
        kind: 'transfer',
        prompt: 'คอมพิวเตอร์รุ่นเก่าที่ใช้ BIOS แบบ Legacy ควรเลือก Partition scheme แบบใด',
        choices: [
          { text: 'MBR partition scheme for BIOS or UEFI computers', correct: true, feedback: 'ถูกต้อง ใช้กับเครื่อง BIOS ได้' },
          { text: 'GPT partition scheme for UEFI computer', feedback: 'GPT ใช้กับเครื่อง UEFI เท่านั้น' },
          { text: 'MBR partition scheme for UEFI computer', feedback: 'แบบนี้ใช้กับเครื่อง UEFI เท่านั้น' },
        ],
        ref: `${W10} 2`,
      },
    ],
  },

  boot: {
    track: 'win10',
    manualNo: 2,
    pages: `${W10} 3–6`,
    stages: [{ id: 'bios', label: 'ตั้งลำดับบูตใน BIOS แล้วบันทึก' }],
    hints: {
      bios: [
        'กด F2 ที่หน้าจอโลโก้เพื่อเข้าหน้าตั้งค่า BIOS',
        'ไปแท็บ Boot → Hard Disk Drives แล้วเลือก 1st Drive ให้เป็น USB ของงานนี้ (ดูชื่อให้ดี)',
        'กด F10 แล้วเลือก Ok เพื่อบันทึกและออก',
      ],
    },
    mistakes: {
      'boot-nosave': {
        label: 'ออกจาก BIOS โดยไม่บันทึก',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'ขั้นที่ 6–7 ให้กด F10 เพื่อบันทึกและออก ถ้าออกโดยไม่บันทึก ลำดับบูตที่ตั้งไว้จะไม่มีผล',
        ref: `${W10} 6`,
      },
      'boot-disable': {
        label: 'พยายามปิดการใช้งานไดรฟ์แทนการสลับลำดับ',
        severity: 'minor',
        criterion: 'accuracy',
        explain: 'ใบเนื้อหาให้เลือก USB เป็นลำดับแรกเท่านั้น ไม่ต้องปิดอุปกรณ์อื่น เพราะหลังติดตั้งเสร็จเครื่องยังต้องบูตจากฮาร์ดดิสก์',
        ref: `${W10} 5`,
      },
      'boot-wrong': {
        label: 'บันทึกลำดับบูตโดยอุปกรณ์แรกไม่ใช่ USB ของงาน',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'ขั้นที่ 4–5 ให้เลือก 1st Drive เป็น USB ที่เตรียมไว้ ถ้าเลือกอุปกรณ์อื่น เครื่องจะไม่บูตเข้าตัวติดตั้ง',
        ref: `${W10} 5`,
      },
    },
    checks: [{ id: 'boot-usb', label: 'เครื่องบูตจาก USB เข้าสู่ตัวติดตั้งได้', required: true }],
    principles: ['F2 → แท็บ Boot → Hard Disk Drives → 1st Drive = USB', 'กด F10 แล้ว Ok เพื่อบันทึกและออก', 'สลับลำดับแทนการปิดอุปกรณ์'],
    learn: {
      title: 'ทบทวน: ตั้งค่า BIOS ให้บูตจาก USB',
      blocks: [
        {
          kind: 'flow',
          steps: [
            { label: 'F2', sub: 'เข้าหน้าตั้งค่า BIOS' },
            { label: 'Boot', sub: 'Hard Disk Drives' },
            { label: '1st Drive', sub: 'เลือก USB' },
            { label: 'F10 → Ok', sub: 'บันทึกและออก' },
          ],
        },
      ],
      refs: [`${W10} 3–6 การกำหนดค่า BIOS ก่อนติดตั้ง`],
    },
    quiz: [
      {
        id: 'q-boot-f10',
        kind: 'reason',
        prompt: 'หลังตั้ง USB เป็นลำดับแรกแล้ว ทำไมต้องกด F10',
        choices: [
          { text: 'เพื่อบันทึกค่าและออก ถ้าไม่บันทึก เครื่องจะบูตแบบเดิม', correct: true, feedback: 'ถูกต้อง F10 คือ Save and Exit' },
          { text: 'เพื่อเปิดเมนู Boot Device Priority', feedback: 'เมนูนั้นอยู่ในแท็บ Boot เลือกด้วย Enter' },
          { text: 'เพื่อทดสอบ USB ว่าใช้งานได้', feedback: 'F10 ใช้บันทึกค่าและออก' },
        ],
        ref: `${W10} 6`,
      },
      {
        id: 'q-boot-menu',
        kind: 'reason',
        prompt: 'ตามใบเนื้อหา แฟลชไดรฟ์ USB อยู่ในเมนูใดของแท็บ Boot',
        choices: [
          { text: 'Hard Disk Drives', correct: true, feedback: 'ถูกต้อง เลือก 1st Drive ในเมนูนี้' },
          { text: 'CD/DVD Drives', feedback: 'เมนูนี้สำหรับไดรฟ์ซีดี/ดีวีดี' },
          { text: 'Security', feedback: 'แท็บ Security ใช้ตั้งรหัสผ่าน ไม่ใช่ลำดับบูต' },
        ],
        ref: `${W10} 4`,
      },
    ],
  },

  setup10: {
    track: 'win10',
    manualNo: 3,
    pages: `${W10} 6–11`,
    stages: [{ id: 'setup', label: 'ติดตั้ง Windows 10 ขั้นที่ 1–9' }],
    hints: {
      setup: [
        'ขั้นที่ 2: RAM น้อยกว่า 4 GB เลือก 32-bit ตั้งแต่ 4 GB เลือก 64-bit ดูขนาด RAM ในใบงาน',
        'ขั้นที่ 5: ใบงานมี Product Key ให้พิมพ์ ถ้าเครื่องเคยเปิดใช้งานแล้ว (สิทธิ์แบบดิจิทัล) ให้กด I don\'t have a product key',
        'ขั้นที่ 7–8: เลือก Custom แล้วติดตั้งลงพื้นที่ของ Windows ห้ามแตะพาร์ทิชันข้อมูลของลูกค้า',
      ],
    },
    mistakes: {
      'setup10-arch': {
        label: 'เลือก 32/64 บิตไม่ตรงกับ RAM',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'ขั้นที่ 2: RAM น้อยกว่า 4 GB เลือก Windows Setup (32-bit) ตั้งแต่ 4 GB ขึ้นไปเลือก Windows Setup (64-bit)',
        ref: `${W10} 7`,
      },
      'setup10-key': {
        label: 'จัดการ Product Key ไม่ตรงกับใบงาน',
        severity: 'minor',
        criterion: 'accuracy',
        explain: 'ขั้นที่ 5 ให้ป้อน Product Key ที่ได้มา ถ้าเครื่องเคยเปิดใช้งานแบบดิจิทัลแล้วจึงกด I don\'t have a product key',
        ref: `${W10} 8`,
      },
      'setup10-edition': {
        label: 'เลือกรุ่น Windows ไม่ตรงกับลิขสิทธิ์',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'ต้องติดตั้งรุ่นเดียวกับที่ลูกค้ามีสิทธิ์ใช้งาน ถ้าเลือกรุ่นอื่น Windows จะไม่ถูกเปิดใช้งาน',
        ref: `${W10} 8`,
      },
      'setup10-upgrade': {
        label: 'เลือก Upgrade ทั้งที่บูตจาก USB',
        severity: 'minor',
        criterion: 'accuracy',
        explain: 'ขั้นที่ 7 ให้เลือก Custom: Install Windows only (advanced) เพราะ Upgrade ใช้ได้เฉพาะตอนเริ่มจากใน Windows เดิม',
        ref: `${W10} 9`,
      },
      'setup10-data': {
        label: 'ลบหรือฟอร์แมตพาร์ทิชันข้อมูลของลูกค้า',
        severity: 'critical',
        criterion: 'dataSafety',
        explain: 'ขั้นที่ 8 ต้องดูให้ดีก่อนลบหรือฟอร์แมต พาร์ทิชันข้อมูลไม่เกี่ยวกับการติดตั้ง Windows ถ้าลบไป ข้อมูลของลูกค้าหายถาวร',
        ref: `${W10} 10`,
      },
      'setup10-target': {
        label: 'เลือกติดตั้งลงพาร์ทิชันข้อมูล',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'ขั้นที่ 8 ให้เลือกไดรฟ์ที่จะติดตั้ง Windows ไม่ใช่พาร์ทิชันที่เก็บข้อมูลของลูกค้า',
        ref: `${W10} 10`,
      },
      'setup10-keypress': {
        label: 'กดปุ่มตอนขึ้น Press any key to boot from CD or DVD',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'ขั้นที่ 9 เมื่อเครื่องรีสตาร์ตไม่ต้องกดอะไร ถ้ากดปุ่ม เครื่องจะบูตจาก USB และเริ่มติดตั้งใหม่ตั้งแต่ต้น',
        ref: `${W10} 11`,
      },
    },
    checks: [{ id: 'setup10-done', label: 'ติดตั้งจนเครื่องรีสตาร์ตเข้าสู่การตั้งค่าเริ่มต้น', required: true }],
    principles: ['32/64 บิตดูจาก RAM (ต่ำกว่า 4 GB = 32 บิต)', 'Custom: Install Windows only (advanced)', 'ติดตั้งลงพื้นที่ของ Windows ไม่แตะพาร์ทิชันข้อมูล', 'ตอนรีสตาร์ตไม่ต้องกดปุ่มใด'],
    learn: {
      title: 'ทบทวน: ติดตั้ง Windows 10 ขั้นที่ 1–9',
      blocks: [
        {
          kind: 'table',
          head: ['RAM ของเครื่อง', 'เลือก'],
          rows: [
            ['น้อยกว่า 4 GB', 'Windows Setup (32-bit)'],
            ['ตั้งแต่ 4 GB ขึ้นไป', 'Windows Setup (64-bit)'],
          ],
        },
        {
          kind: 'points',
          items: ['ขั้นที่ 5 ป้อน Product Key', 'ขั้นที่ 7 เลือก Custom', 'ขั้นที่ 8 เลือกไดรฟ์ (ดิสก์ใหม่ให้สร้าง Partition ก่อน)', 'ขั้นที่ 9 รอจนรีสตาร์ต ไม่ต้องกดปุ่ม'],
        },
      ],
      refs: [`${W10} 6–11 ขั้นตอนการติดตั้ง Windows 10 ขั้นที่ 1–9`],
    },
    quiz: [
      {
        id: 'q-setup10-arch',
        kind: 'transfer',
        prompt: 'เครื่องที่มี RAM 8 GB ควรเลือกตัวติดตั้งแบบใดในหน้า Windows Boot Manager',
        choices: [
          { text: 'Windows Setup (64-bit) เพราะ RAM ตั้งแต่ 4 GB ขึ้นไป', correct: true, feedback: 'ถูกต้อง ตามหลักในขั้นที่ 2' },
          { text: 'Windows Setup (32-bit) เพราะติดตั้งเร็วกว่า', feedback: 'ใบเนื้อหาให้ดูจาก RAM ไม่ใช่ความเร็ว' },
          { text: 'เลือกแบบไหนก็ได้ ผลเหมือนกัน', feedback: 'แบบ 32 บิตใช้ RAM ได้ไม่เกินประมาณ 4 GB' },
        ],
        ref: `${W10} 7`,
      },
      {
        id: 'q-setup10-custom',
        kind: 'reason',
        prompt: 'หน้า Which type of installation do you want? เมื่อบูตจาก USB ควรเลือกแบบใด',
        choices: [
          { text: 'Custom: Install Windows only (advanced)', correct: true, feedback: 'ถูกต้อง ตามขั้นที่ 7' },
          { text: 'Upgrade: Install Windows and keep files', feedback: 'Upgrade ใช้ได้เมื่อเริ่มจากใน Windows เดิม' },
          { text: 'ปิดหน้าต่างแล้วเริ่มใหม่', feedback: 'ไม่จำเป็น ให้เลือก Custom' },
        ],
        ref: `${W10} 9`,
      },
      {
        id: 'q-setup10-presskey',
        kind: 'reason',
        prompt: 'ติดตั้งเสร็จแล้วเครื่องรีสตาร์ต ขึ้นข้อความ Press any key to boot from CD or DVD ควรทำอย่างไร',
        choices: [
          { text: 'ไม่ต้องกดอะไร ปล่อยให้เครื่องบูตต่อ', correct: true, feedback: 'ถูกต้อง ถ้ากดปุ่มจะเริ่มติดตั้งใหม่' },
          { text: 'กดปุ่มใดก็ได้เพื่อไปต่อ', feedback: 'การกดปุ่มจะบูตจาก USB อีกครั้ง' },
          { text: 'ถอดปลั๊กแล้วเปิดใหม่', feedback: 'อาจทำให้การติดตั้งเสียหาย' },
        ],
        ref: `${W10} 11`,
      },
    ],
  },

  oobe10: {
    track: 'win10',
    manualNo: 4,
    pages: `${W10} 11–14`,
    stages: [{ id: 'oobe', label: 'ตั้งค่าเริ่มต้นขั้นที่ 10–16' }],
    hints: {
      oobe: [
        'อ่านใบงานก่อนตอบแต่ละหน้า: ภูมิภาค แป้นพิมพ์หลัก และแป้นที่สอง',
        'ดูว่าลูกค้าต้องการบัญชี Microsoft หรือบัญชีในเครื่อง (Offline account มุมซ้ายล่าง)',
        'หน้า Privacy ปิดเฉพาะรายการที่ลูกค้าขอแล้วกด Accept',
      ],
    },
    mistakes: {
      'oobe10-region': { label: 'เลือกภูมิภาคไม่ตรงกับใบงาน', severity: 'minor', criterion: 'accuracy', explain: 'ขั้นที่ 10 ให้เลือกภูมิภาคที่เครื่องใช้งาน', ref: `${W10} 11` },
      'oobe10-keyboard': { label: 'เลือกแป้นพิมพ์หลักไม่ตรงกับใบงาน', severity: 'minor', criterion: 'accuracy', explain: 'ขั้นที่ 11 ให้เลือกแป้นพิมพ์หลักตามที่ผู้ใช้ต้องการ', ref: `${W10} 11` },
      'oobe10-second': {
        label: 'จัดการแป้นพิมพ์ที่สองไม่ตรงกับใบงาน',
        severity: 'minor',
        criterion: 'accuracy',
        explain: 'ขั้นที่ 12 ถ้าต้องการแป้นที่สองให้กด Add layout ถ้าไม่ต้องการให้กด Skip',
        ref: `${W10} 12`,
      },
      'oobe10-account': {
        label: 'เลือกชนิดบัญชีไม่ตรงกับที่ลูกค้าต้องการ',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'ขั้นที่ 13–14 เลือกได้ว่าจะใช้ Microsoft Account หรือ Offline account ต้องเลือกตามความต้องการของผู้ใช้',
        ref: `${W10} 12`,
      },
      'oobe10-user': { label: 'ตั้งชื่อผู้ใช้ไม่ตรงกับใบงาน', severity: 'minor', criterion: 'accuracy', explain: 'ขั้นที่ 14 ให้ตั้งชื่อ User ตามที่ลูกค้าแจ้ง', ref: `${W10} 13` },
      'oobe10-nopass': {
        label: 'สร้างบัญชีโดยไม่ตั้งรหัสผ่าน',
        severity: 'major',
        criterion: 'dataSafety',
        explain: 'ขั้นที่ 14 ให้กำหนดทั้งชื่อ User และ Password ถ้าไม่มีรหัสผ่าน ใครก็เข้าเครื่องได้',
        ref: `${W10} 13`,
      },
      'oobe10-privacy': {
        label: 'ไม่ได้ปิดการตั้งค่าความเป็นส่วนตัวตามใบงาน',
        severity: 'minor',
        criterion: 'dataSafety',
        explain: 'ขั้นที่ 16 ให้เปิดเฉพาะฟังก์ชันที่ต้องใช้ ส่วนที่ลูกค้าไม่ต้องการให้ปิด',
        ref: `${W10} 14`,
      },
    },
    checks: [{ id: 'oobe10-done', label: 'ตั้งค่าเริ่มต้นครบจนเข้า Windows', required: true }],
    principles: ['ภูมิภาค → แป้นพิมพ์หลัก → แป้นที่สอง (Add layout / Skip)', 'เลือกชนิดบัญชีตามผู้ใช้ และตั้งรหัสผ่านเสมอ', 'เปิดเฉพาะความเป็นส่วนตัวที่ต้องใช้'],
    learn: {
      title: 'ทบทวน: ตั้งค่าหลังติดตั้ง ขั้นที่ 10–16',
      blocks: [
        {
          kind: 'table',
          head: ['ขั้น', 'หน้าจอ', 'ทำอะไร'],
          rows: [
            ['10', "Let's start with region", 'เลือกภูมิภาค'],
            ['11–12', 'Keyboard layout', 'แป้นหลัก แล้ว Add layout หรือ Skip'],
            ['13–14', 'Sign in / Offline account', 'เลือกชนิดบัญชี ตั้งชื่อและรหัสผ่าน'],
            ['16', 'Privacy settings', 'เปิดเฉพาะที่ต้องใช้ แล้ว Accept'],
          ],
        },
      ],
      refs: [`${W10} 11–14 ตั้งค่าหลังติดตั้ง ขั้นที่ 10–16`],
    },
    quiz: [
      {
        id: 'q-oobe10-skip',
        kind: 'reason',
        prompt: 'หน้า "Want to add a second keyboard layout?" ถ้าไม่ต้องการเพิ่มแป้นพิมพ์ควรกดปุ่มใด',
        choices: [
          { text: 'Skip', correct: true, feedback: 'ถูกต้อง ตามขั้นที่ 12' },
          { text: 'Add layout', feedback: 'Add layout ใช้เมื่อต้องการเพิ่มแป้นพิมพ์ที่สอง' },
          { text: 'ปิดเครื่องแล้วเริ่มใหม่', feedback: 'ไม่จำเป็น กด Skip ได้เลย' },
        ],
        ref: `${W10} 12`,
      },
      {
        id: 'q-oobe10-offline',
        kind: 'transfer',
        prompt: 'เครื่องที่หลายคนใช้ร่วมกันในร้าน ควรตั้งบัญชีแบบใด',
        choices: [
          { text: 'Offline account พร้อมรหัสผ่าน', correct: true, feedback: 'ถูกต้อง ไม่ผูกกับบัญชีส่วนตัวของใคร และมีรหัสผ่านป้องกัน' },
          { text: 'บัญชี Microsoft ของพนักงานคนแรก', feedback: 'ข้อมูลส่วนตัวจะปนกับคนอื่น' },
          { text: 'บัญชีในเครื่องแบบไม่มีรหัสผ่าน', feedback: 'ใบเนื้อหาให้ตั้งทั้งชื่อและรหัสผ่าน' },
        ],
        ref: `${W10} 12`,
      },
    ],
  },

  ready11: {
    track: 'win11',
    manualNo: 6,
    pages: `${W11} 1`,
    stages: [
      { id: 'check', label: 'ตรวจด้วยเครื่องมือในเครื่อง' },
      { id: 'decide', label: 'สรุปความพร้อม' },
    ],
    hints: {
      check: ['เปิด PC Health Check แล้วกด Check now', 'เปิด System Information (msinfo32) ดู BIOS Mode และ Secure Boot State ส่วน tpm.msc ดูสถานะ TPM'],
      decide: [
        'ผ่านครบทุกข้อ = ติดตั้งได้เลย',
        'ฮาร์ดแวร์รองรับแต่ TPM หรือ Secure Boot ถูกปิด = เปิดในเมนู UEFI ก่อน',
        'CPU ไม่อยู่ในรายการที่รองรับ หรือเครื่องเป็น Legacy BIOS ไม่มี TPM = ไม่ควรติดตั้ง Windows 11',
      ],
    },
    mistakes: {
      'ready-wrong': {
        label: 'สรุปความพร้อมของเครื่องผิด',
        severity: 'major',
        criterion: 'reasoning',
        explain: 'Windows 11 ต้องการ CPU 64 บิตที่รองรับ RAM 4 GB พื้นที่ 64 GB และเฟิร์มแวร์ UEFI ที่รองรับ Secure Boot กับ TPM 2.0 ต้องดูให้ครบจากเครื่องมือตรวจก่อนสรุป',
        ref: `${W11} 1`,
      },
    },
    checks: [
      { id: 'ready-health', label: 'รัน PC Health Check', required: true },
      { id: 'ready-msinfo', label: 'ดู BIOS Mode และ Secure Boot State ใน System Information', required: true },
    ],
    principles: ['ตรวจรุ่น CPU ไม่ดูแค่ความเร็ว', 'ต้องมี UEFI, Secure Boot capable และ TPM 2.0', 'ยืนยันจากหลายเครื่องมือก่อนสรุป'],
    learn: {
      title: 'ทบทวน: ข้อกำหนดขั้นต่ำของ Windows 11',
      blocks: [
        {
          kind: 'table',
          head: ['รายการ', 'ข้อกำหนด'],
          rows: [
            ['CPU', '64 บิตที่รองรับ 1 GHz ขึ้นไป 2 คอร์ขึ้นไป'],
            ['RAM / พื้นที่', '4 GB / 64 GB ขึ้นไป'],
            ['เฟิร์มแวร์', 'UEFI, Secure Boot capable และ TPM 2.0'],
          ],
        },
      ],
      refs: [`${W11} 1 การตรวจสอบความพร้อมและการสำรองข้อมูล`],
    },
    quiz: [
      {
        id: 'q-ready-cpu',
        kind: 'reason',
        prompt: 'ข้อใดเป็นข้อกำหนดขั้นต่ำด้าน CPU ของ Windows 11',
        choices: [
          { text: 'CPU 64 บิตที่รองรับ 1 GHz ขึ้นไป 2 คอร์ขึ้นไป', correct: true, feedback: 'ถูกต้อง' },
          { text: 'CPU 64 บิตที่รองรับ 800 MHz ขึ้นไป 2 คอร์ขึ้นไป', feedback: 'ต้องเร็ว 1 GHz ขึ้นไป' },
          { text: 'CPU 32 บิต 1 GHz ขึ้นไป 2 คอร์ขึ้นไป', feedback: 'Windows 11 ต้องใช้ CPU 64 บิต' },
        ],
        ref: `${W11} 1`,
      },
      {
        id: 'q-ready-fw',
        kind: 'reason',
        prompt: 'ข้อใดตรงกับข้อกำหนดด้านเฟิร์มแวร์และความปลอดภัยของ Windows 11',
        choices: [
          { text: 'UEFI รองรับ Secure Boot และ TPM 2.0', correct: true, feedback: 'ถูกต้อง' },
          { text: 'UEFI รองรับ Secure Boot และ TPM 1.2', feedback: 'ต้องเป็น TPM 2.0' },
          { text: 'Legacy BIOS รองรับ Secure Boot และ TPM 2.0', feedback: 'Windows 11 ต้องใช้ UEFI' },
        ],
        ref: `${W11} 1`,
      },
    ],
  },

  mct: {
    track: 'win11',
    manualNo: 7,
    pages: `${W11} 2–3`,
    stages: [{ id: 'media', label: 'สร้าง USB ด้วย Media Creation Tool' }],
    hints: {
      media: [
        'ยอมรับเงื่อนไข ใช้ตัวเลือกที่แนะนำ แล้วเลือก USB flash drive',
        'หน้า Select a USB flash drive ดูชื่อและความจุ ต้องอย่างน้อย 8 GB และไม่ใช่อุปกรณ์ที่มีข้อมูลของลูกค้า',
        'รอจนขึ้น Your USB flash drive is ready แล้วกด Finish',
      ],
    },
    mistakes: {
      'mct-data': {
        label: 'เลือก USB ที่มีข้อมูลสำคัญมาสร้างสื่อ',
        severity: 'critical',
        criterion: 'dataSafety',
        explain: 'ข้อมูลเดิมบน USB ที่เลือกจะถูกลบระหว่างสร้างสื่อ ต้องใช้ USB ว่างที่ตรวจแล้วว่าเป็นตัวที่ต้องการลบ',
        ref: `${W11} 2`,
      },
      'mct-small': {
        label: 'เลือก USB ที่ความจุไม่ถึง 8 GB',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'การสร้าง USB ติดตั้ง Windows 11 ต้องใช้ USB ว่างอย่างน้อย 8 GB',
        ref: `${W11} 2`,
      },
      'mct-iso': {
        label: 'เลือกสร้างไฟล์ ISO ทั้งที่งานต้องการ USB',
        severity: 'minor',
        criterion: 'accuracy',
        explain: 'ใบเนื้อหาให้เลือก USB flash drive แล้วเลือก USB ที่ตรวจแล้ว ไฟล์ ISO ต้องนำไปสร้างสื่ออีกขั้น',
        ref: `${W11} 3`,
      },
      'mct-assistant': {
        label: 'ดาวน์โหลด Installation Assistant แทน Media Creation Tool',
        severity: 'minor',
        criterion: 'accuracy',
        explain: 'ขั้นที่ 1 ให้เลือก Create Windows 11 Installation Media แล้วดาวน์โหลด Media Creation Tool ส่วน Installation Assistant ใช้อัปเกรดเครื่องที่กำลังใช้งาน ไม่ได้สร้าง USB',
        ref: `${W11} 2`,
      },
      'mct-noeject': {
        label: 'ไม่ได้ถอด USB อย่างปลอดภัย',
        severity: 'minor',
        criterion: 'dataSafety',
        explain: 'เมื่อสร้างสื่อเสร็จให้นำ USB ออกอย่างปลอดภัยและติดป้ายชื่อ ถ้าดึงออกเลยไฟล์อาจเสียหาย',
        ref: `${W11} 3`,
      },
    },
    checks: [
      { id: 'mct-ready', label: 'Media Creation Tool ขึ้น Your USB flash drive is ready', required: true },
      { id: 'mct-eject', label: 'ถอด USB อย่างปลอดภัยและติดป้ายชื่อ', required: true, when: p => p.module === 'mct' && !!p.eject },
    ],
    principles: ['ดาวน์โหลด Media Creation Tool จากหน้า Download Windows 11 ของ Microsoft', 'USB ว่างอย่างน้อย 8 GB และข้อมูลเดิมจะถูกลบ', 'ตรวจชื่อและความจุก่อนยืนยัน แล้วถอดอย่างปลอดภัย'],
    learn: {
      title: 'ทบทวน: สร้าง USB ด้วย Media Creation Tool',
      blocks: [
        {
          kind: 'flow',
          steps: [
            { label: 'Download Now', sub: 'Create Windows 11 Installation Media' },
            { label: 'Accept', sub: 'ภาษาและรุ่นที่แนะนำ' },
            { label: 'USB flash drive', sub: 'ตรวจชื่อ/ความจุ' },
            { label: 'Finish', sub: 'ถอดอย่างปลอดภัย' },
          ],
        },
        { kind: 'note', tone: 'warn', text: 'USB ต้องว่างอย่างน้อย **8 GB** ข้อมูลเดิมจะถูกลบ' },
      ],
      refs: [`${W11} 2–3 การเตรียมไฟล์และอุปกรณ์ และการสร้าง USB ติดตั้ง`],
    },
    quiz: [
      {
        id: 'q-mct-8gb',
        kind: 'reason',
        prompt: 'Microsoft ระบุความจุขั้นต่ำของ USB สำหรับ Media Creation Tool ไว้เท่าใด',
        choices: [
          { text: '8 GB', correct: true, feedback: 'ถูกต้อง' },
          { text: '4 GB', feedback: 'น้อยเกินไปสำหรับ Windows 11' },
          { text: '16 GB', feedback: 'ใช้ได้ แต่ขั้นต่ำคือ 8 GB' },
        ],
        ref: `${W11} 2`,
      },
      {
        id: 'q-mct-erase',
        kind: 'reason',
        prompt: 'ระหว่างสร้าง USB ติดตั้งด้วย Media Creation Tool ข้อมูลในอุปกรณ์ใดจะถูกลบ',
        choices: [
          { text: 'USB ที่เลือกเป็นสื่อสำหรับสร้างตัวติดตั้ง', correct: true, feedback: 'ถูกต้อง' },
          { text: 'ดิสก์ระบบของเครื่องที่สร้างสื่อ', feedback: 'ดิสก์ระบบไม่ถูกแตะ' },
          { text: 'USB อีกตัวที่ไม่ได้เลือก', feedback: 'ลบเฉพาะตัวที่เลือก จึงต้องเลือกให้ถูก' },
        ],
        ref: `${W11} 2`,
      },
      {
        id: 'q-mct-check',
        kind: 'transfer',
        prompt: 'ก่อนยืนยันการสร้างสื่อ ควรตรวจข้อมูลใดเพื่อไม่ให้ลบผิด USB',
        choices: [
          { text: 'ชื่อรุ่นและความจุของ USB ที่เลือกให้เครื่องมือเขียน', correct: true, feedback: 'ถูกต้อง' },
          { text: 'ชื่อรุ่นและความจุของดิสก์ที่จะติดตั้ง Windows', feedback: 'หน้านี้เลือก USB ไม่ใช่ดิสก์ปลายทาง' },
          { text: 'ชื่อรุ่นและความจุของดิสก์ในเครื่องที่สร้างสื่อ', feedback: 'ต้องดู USB ที่จะถูกเขียน' },
        ],
        ref: `${W11} 3`,
      },
      {
        id: 'q-mct-tool',
        kind: 'reason',
        prompt: 'เครื่องมือของ Microsoft ข้อใดใช้สร้าง USB ติดตั้ง Windows 11 ตามบทเรียน',
        choices: [
          { text: 'Windows 11 Media Creation Tool', correct: true, feedback: 'ถูกต้อง' },
          { text: 'Windows 11 Installation Assistant', feedback: 'ใช้อัปเกรดเครื่องที่กำลังใช้งาน' },
          { text: 'Windows Disk Management', feedback: 'ใช้จัดการดิสก์ ไม่ได้สร้างสื่อ' },
        ],
        ref: `${W11} 2`,
      },
    ],
  },

  uefi11: {
    track: 'win11',
    manualNo: 8,
    pages: `${W11} 4–5`,
    stages: [
      { id: 'firmware', label: 'ตั้งค่า UEFI (Secure Boot, TPM)' },
      { id: 'boot', label: 'บูตจาก USB แบบ UEFI' },
    ],
    hints: {
      firmware: [
        'กด F2 ที่หน้าโลโก้เพื่อเข้าเมนูเฟิร์มแวร์ (ดูปุ่มจากคู่มือผู้ผลิตในใบงาน)',
        'แท็บ Boot: Boot Mode Select ต้องเป็น UEFI (ไม่เปิด CSM) · แท็บ Security: เปิด Secure Boot และ TPM Device',
        'กด F10 แล้ว Ok เพื่อบันทึก',
      ],
      boot: ['รีสตาร์ตแล้วกด F12 เปิดเมนูบูต', 'เลือกรายการที่ขึ้นต้นด้วย UEFI: ตามด้วยชื่อ USB'],
    },
    mistakes: {
      'uefi-secureboot': {
        label: 'บูตเข้าตัวติดตั้งทั้งที่ Secure Boot ยังปิด',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'ต้องตรวจว่า Secure Boot พร้อมใช้ก่อนบูตจาก USB เพราะเป็นข้อกำหนดของ Windows 11',
        ref: `${W11} 4`,
      },
      'uefi-tpm': {
        label: 'บูตเข้าตัวติดตั้งทั้งที่ TPM 2.0 ยังปิด',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'ต้องเปิด TPM 2.0 ในเมนูเฟิร์มแวร์ก่อน ไม่อย่างนั้น Setup จะแจ้งว่าเครื่องติดตั้ง Windows 11 ไม่ได้',
        ref: `${W11} 4`,
      },
      'uefi-csm': {
        label: 'ยังเปิด CSM (Legacy) อยู่',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'ต้องตรวจว่าเครื่องบูตแบบ UEFI การเปิด CSM ทำให้กลับไปใช้แบบ Legacy และ Secure Boot ใช้ไม่ได้',
        ref: `${W11} 4`,
      },
      'uefi-legacy': {
        label: 'เลือกรายการ USB ที่ไม่ได้ระบุ UEFI',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'ในเมนูบูตให้เลือก USB ในรายการที่ระบุ UEFI การบูตแบบ Legacy ติดตั้งลงดิสก์ GPT ไม่ได้',
        ref: `${W11} 4`,
      },
      'uefi-discard': {
        label: 'ออกจากเมนูเฟิร์มแวร์โดยไม่บันทึก',
        severity: 'minor',
        criterion: 'accuracy',
        explain: 'การตั้งค่าที่เปลี่ยนจะมีผลเมื่อบันทึก (Save Changes and Exit / F10) เท่านั้น',
        extra: true,
      },
    },
    checks: [
      { id: 'uefi-precheck', label: 'ตรวจ msinfo32 และ Windows Security ก่อนเข้าเมนูเฟิร์มแวร์', required: true, when: p => p.module === 'uefi11' && !!p.precheck },
      { id: 'uefi-boot', label: 'บูต USB แบบ UEFI เข้า Windows 11 Setup ได้', required: true },
    ],
    principles: ['ปุ่มเข้าเมนูเฟิร์มแวร์ดูจากคู่มือผู้ผลิต', 'UEFI เปิดใช้งาน, Secure Boot พร้อมใช้, TPM 2.0 เปิดใช้งาน', 'เลือก USB ในรายการที่ระบุ UEFI'],
    learn: {
      title: 'ทบทวน: ตั้งค่า UEFI และเริ่มเครื่องจาก USB',
      blocks: [
        {
          kind: 'points',
          items: ['ตรวจใน Windows: msinfo32 (BIOS Mode, Secure Boot State) และ Windows Security > Device security', 'ในเมนูเฟิร์มแวร์: UEFI, Secure Boot, TPM 2.0', 'เมนูบูต: เลือก **UEFI:** ตามด้วยชื่อ USB'],
        },
      ],
      refs: [`${W11} 4–5 การตั้งค่า UEFI และเริ่มเครื่องจาก USB`],
    },
    quiz: [
      {
        id: 'q-uefi-keys',
        kind: 'reason',
        prompt: 'ควรดูปุ่มเข้า UEFI/Boot Menu ของเครื่องแต่ละรุ่นจากแหล่งใดเป็นหลัก',
        choices: [
          { text: 'คู่มือหรือหน้าสนับสนุนของผู้ผลิตเครื่องรุ่นนั้น', correct: true, feedback: 'ถูกต้อง ปุ่มไม่เหมือนกันทุกเครื่อง' },
          { text: 'รายการปุ่มลัดทั่วไปของ Windows ทุกรุ่น', feedback: 'ปุ่มเข้าเฟิร์มแวร์ขึ้นกับผู้ผลิต' },
          { text: 'คู่มือของเมนบอร์ดต่างรุ่นที่ใช้ CPU เดียวกัน', feedback: 'ต้องเป็นของเครื่องรุ่นนั้น' },
        ],
        ref: `${W11} 4`,
      },
      {
        id: 'q-uefi-gpt',
        kind: 'reason',
        prompt: 'เมื่อติดตั้ง Windows 11 โดยบูตแบบ UEFI ดิสก์ระบบควรใช้รูปแบบพาร์ทิชันใด',
        choices: [
          { text: 'GPT', correct: true, feedback: 'ถูกต้อง' },
          { text: 'MBR', feedback: 'MBR ใช้กับการบูตแบบ BIOS' },
          { text: 'APM', feedback: 'APM เป็นของเครื่อง Mac รุ่นเก่า' },
        ],
        ref: `${W11} 5`,
      },
      {
        id: 'q-uefi-notgpt',
        kind: 'transfer',
        prompt: 'หาก Setup แจ้งว่าดิสก์เป้าหมายไม่ใช่ GPT ควรทำขั้นตอนใดก่อนปรับพาร์ทิชัน',
        choices: [
          { text: 'ยืนยันดิสก์เป้าหมายและตรวจว่าไฟล์สำรองเปิดได้', correct: true, feedback: 'ถูกต้อง อย่าลบดิสก์ทันที' },
          { text: 'ยืนยันเฉพาะขนาดดิสก์ แล้วลบทุกพาร์ทิชันทันที', feedback: 'ข้อมูลอาจหายโดยไม่มีสำรอง' },
          { text: 'ยืนยันเฉพาะ USB ติดตั้ง แล้วปรับพาร์ทิชันทันที', feedback: 'ต้องดูดิสก์เป้าหมายและข้อมูลสำรอง' },
        ],
        ref: `${W11} 5`,
      },
    ],
  },

  setup11: {
    track: 'win11',
    manualNo: 9,
    pages: `${W11} 5–7`,
    stages: [
      { id: 'setup', label: 'Windows 11 Setup' },
      { id: 'restart', label: 'รีสตาร์ตและบูตต่อเอง' },
    ],
    hints: {
      setup: [
        'Select setup option: เลือก Install Windows 11 และติ๊กยอมรับว่าไฟล์จะถูกลบ',
        'ใบงานบอกว่ามีสิทธิ์แบบดิจิทัลไหม ถ้ามีให้กด I don\'t have a product key แล้วเลือกรุ่นให้ตรงสิทธิ์',
        'ดูหมายเลขดิสก์และความจุ ลบเฉพาะพาร์ทิชันของ Windows เดิมบนดิสก์เป้าหมาย แล้วเลือก Unallocated Space',
      ],
      restart: ['หลังรีสตาร์ตไม่ต้องกด F12 หรือบูต USB ซ้ำ ปล่อยให้เครื่องบูตต่อเอง'],
    },
    mistakes: {
      'setup11-repair': {
        label: 'เลือก Repair my PC แทนการติดตั้ง',
        severity: 'minor',
        criterion: 'accuracy',
        explain: 'ขั้นที่ 1 ให้เลือก Install Windows 11 และอ่านคำเตือนว่าไฟล์ แอป และการตั้งค่าจะถูกลบ',
        ref: `${W11} 5`,
      },
      'setup11-edition': {
        label: 'เลือกรุ่น Windows 11 ไม่ตรงกับสิทธิ์',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'ขั้นที่ 2 ให้เลือกรุ่น Windows 11 ให้ตรงกับใบอนุญาต ถ้าเลือกรุ่นอื่นจะเปิดใช้งานไม่ได้',
        ref: `${W11} 6`,
      },
      'setup11-data': {
        label: 'ลบหรือฟอร์แมตพาร์ทิชันที่มีข้อมูลของลูกค้า',
        severity: 'critical',
        criterion: 'dataSafety',
        explain: 'ขั้นที่ 3 ให้ตรวจดิสก์เป้าหมายจากหมายเลขและความจุ ยืนยันข้อมูลสำรองก่อนลบพาร์ทิชัน และห้ามแตะดิสก์อื่น',
        ref: `${W11} 6`,
      },
      'setup11-disk': {
        label: 'เลือกติดตั้งลงดิสก์ที่ไม่ใช่ดิสก์เป้าหมาย',
        severity: 'critical',
        criterion: 'dataSafety',
        explain: 'ขั้นที่ 3 ให้เลือกพื้นที่ว่างบนดิสก์ที่ต้องการติดตั้งเท่านั้น ห้ามแตะดิสก์อื่น',
        ref: `${W11} 6`,
      },
      'setup11-reboot': {
        label: 'บูตกลับเข้า USB ระหว่างติดตั้ง',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'ขั้นที่ 5 รอการคัดลอกไฟล์และรีสตาร์ตหลายครั้ง เมื่อเริ่มติดตั้งต่อ อย่าบูตกลับเข้า USB เพราะ Setup จะเริ่มใหม่',
        ref: `${W11} 7`,
      },
    },
    checks: [
      { id: 'setup11-ready', label: 'ตรวจรุ่นและตัวเลือกในหน้า Ready to install ก่อนกด Install', required: true },
      { id: 'setup11-done', label: 'ติดตั้งเสร็จและเครื่องบูตต่อเองจนเข้า OOBE', required: true },
    ],
    principles: ['Install Windows 11 + อ่านคำเตือนเรื่องไฟล์ถูกลบ', 'รุ่นตรงสิทธิ์ (I don\'t have a product key เฉพาะเมื่อมีสิทธิ์ดิจิทัล)', 'ลบเฉพาะพาร์ทิชันของดิสก์เป้าหมาย เลือก Unallocated ให้ Setup สร้าง GPT', 'อย่าบูต USB ซ้ำหลังรีสตาร์ต'],
    learn: {
      title: 'ทบทวน: Windows 11 Setup',
      blocks: [
        {
          kind: 'flow',
          steps: [
            { label: 'Install Windows 11', sub: 'ติ๊กยอมรับคำเตือน' },
            { label: 'Product key', sub: 'หรือ I don\'t have…' },
            { label: 'เลือกดิสก์', sub: 'Unallocated บนดิสก์เป้าหมาย' },
            { label: 'Ready to install', sub: 'ตรวจแล้ว Install' },
          ],
        },
      ],
      refs: [`${W11} 5–7 Windows 11 Setup`],
    },
    quiz: [
      {
        id: 'q-setup11-license',
        kind: 'transfer',
        prompt: 'หากมี digital license ตรงรุ่นและ Setup ขอ Product Key ควรทำอย่างไร',
        choices: [
          { text: "เลือก I don't have a product key แล้วเลือกรุ่นให้ตรงสิทธิ์", correct: true, feedback: 'ถูกต้อง' },
          { text: "เลือก I don't have a product key แล้วเลือกรุ่นที่สูงกว่า", feedback: 'รุ่นที่สูงกว่าจะเปิดใช้งานไม่ได้' },
          { text: 'ใส่ Product Key ของเครื่องอื่น แล้วเลือกรุ่นที่สูงกว่า', feedback: 'ผิดสิทธิ์การใช้งาน' },
        ],
        ref: `${W11} 6`,
      },
      {
        id: 'q-setup11-delete',
        kind: 'reason',
        prompt: 'หากลบพาร์ทิชันของดิสก์เป้าหมายเพื่อ clean install จะเกิดผลใด',
        choices: [
          { text: 'ไฟล์ แอป และการตั้งค่าเดิมบนดิสก์นั้นสูญหาย', correct: true, feedback: 'ถูกต้อง จึงต้องสำรองก่อน' },
          { text: 'ไฟล์เดิมหาย แต่แอปและการตั้งค่ายังอยู่', feedback: 'ทุกอย่างบนพาร์ทิชันนั้นหายหมด' },
          { text: 'ไฟล์และแอปยังอยู่ แต่การตั้งค่าหาย', feedback: 'ทุกอย่างบนพาร์ทิชันนั้นหายหมด' },
        ],
        ref: `${W11} 6`,
      },
    ],
  },

  oobe11: {
    track: 'win11',
    manualNo: 9,
    pages: `${W11} 7–8`,
    stages: [{ id: 'oobe', label: 'ตั้งค่าเริ่มต้น (OOBE)' }],
    hints: {
      oobe: [
        'ประเทศ แป้นพิมพ์ และแป้นที่สอง ตอบตามใบงาน',
        'เชื่อม Wi-Fi ของลูกค้า (Windows 11 Home/Pro ต้องใช้อินเทอร์เน็ตและบัญชี Microsoft)',
        'ให้ลูกค้าพิมพ์รหัสผ่านบัญชี Microsoft เอง แล้วตั้ง PIN และทบทวนความเป็นส่วนตัวทีละรายการ',
      ],
    },
    mistakes: {
      'oobe11-region': { label: 'เลือกประเทศ/ภูมิภาคไม่ตรงกับใบงาน', severity: 'minor', criterion: 'accuracy', explain: 'ใน OOBE ให้เลือกประเทศ/ภูมิภาคที่ใช้งานจริง', ref: `${W11} 7` },
      'oobe11-keyboard': { label: 'เลือกแป้นพิมพ์ไม่ตรงกับใบงาน', severity: 'minor', criterion: 'accuracy', explain: 'เลือกผังแป้นพิมพ์ตามที่ผู้ใช้ต้องการ', ref: `${W11} 7` },
      'oobe11-second': { label: 'จัดการแป้นพิมพ์ที่สองไม่ตรงกับใบงาน', severity: 'minor', criterion: 'accuracy', explain: 'เพิ่มแป้นที่สองเมื่อผู้ใช้ต้องการ ถ้าไม่ต้องการให้ Skip', ref: `${W11} 7` },
      'oobe11-nonet': {
        label: 'พยายามตั้งค่าโดยไม่เชื่อมอินเทอร์เน็ต',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'Windows 11 Home และ Pro ที่ตั้งค่าเป็นเครื่องส่วนตัว ต้องใช้อินเทอร์เน็ตและบัญชี Microsoft ในการตั้งค่าครั้งแรก',
        ref: `${W11} 2`,
      },
      'oobe11-setup': {
        label: 'เลือกรูปแบบการใช้งาน (ส่วนตัว/องค์กร) ไม่ตรงกับใบงาน',
        severity: 'major',
        criterion: 'accuracy',
        explain: 'ลงชื่อเข้าใช้ด้วยบัญชีตามรุ่นและรูปแบบการจัดการ เครื่องส่วนตัวใช้บัญชี Microsoft ส่วนเครื่ององค์กรใช้บัญชีงานหรือโรงเรียน',
        ref: `${W11} 7`,
      },
      'oobe11-account': {
        label: 'ลงชื่อเข้าใช้ด้วยบัญชีที่ไม่ใช่ของลูกค้า',
        severity: 'major',
        criterion: 'dataSafety',
        explain: 'ต้องลงชื่อเข้าใช้ด้วยบัญชีของผู้ใช้เครื่องตามใบงาน ไม่ใช่บัญชีของร้านหรือของคนอื่น',
        ref: `${W11} 7`,
      },
      'oobe11-privacy': {
        label: 'ไม่ได้ทบทวนความเป็นส่วนตัวตามที่ลูกค้าขอ',
        severity: 'minor',
        criterion: 'dataSafety',
        explain: 'ใน OOBE ให้ทบทวนสิทธิ์ความเป็นส่วนตัวทีละรายการ ปิดส่วนที่ผู้ใช้ไม่ต้องการ',
        ref: `${W11} 7`,
      },
    },
    checks: [{ id: 'oobe11-done', label: 'ตั้งค่า OOBE ครบจนเข้าเดสก์ท็อป', required: true }],
    principles: ['ประเทศ → แป้นพิมพ์ → เครือข่าย → บัญชี → PIN → ความเป็นส่วนตัว', 'Home/Pro ต้องใช้อินเทอร์เน็ตและบัญชี Microsoft', 'ให้เจ้าของเครื่องพิมพ์รหัสผ่านเอง'],
    learn: {
      title: 'ทบทวน: OOBE ของ Windows 11',
      blocks: [
        {
          kind: 'flow',
          steps: [
            { label: 'ประเทศ/แป้น', sub: 'ตามผู้ใช้' },
            { label: 'เครือข่าย', sub: 'ต่ออินเทอร์เน็ต' },
            { label: 'บัญชี', sub: 'ตามรุ่น/การจัดการ' },
            { label: 'PIN', sub: 'Windows Hello' },
            { label: 'Privacy', sub: 'ทบทวนทีละรายการ' },
          ],
        },
      ],
      refs: [`${W11} 7–8 การตั้งค่าเริ่มต้น OOBE`],
    },
    quiz: [
      {
        id: 'q-oobe11-net',
        kind: 'reason',
        prompt: 'ตามข้อกำหนด Microsoft การตั้งค่าเริ่มต้น Windows 11 Home และ Pro สำหรับใช้ส่วนบุคคลต้องมีสิ่งใด',
        choices: [
          { text: 'อินเทอร์เน็ตและบัญชี Microsoft', correct: true, feedback: 'ถูกต้อง' },
          { text: 'อินเทอร์เน็ตและบัญชีภายในเครื่องเท่านั้น', feedback: 'Home/Pro ส่วนตัวต้องใช้บัญชี Microsoft' },
          { text: 'บัญชีภายในเครื่องโดยไม่ต้องมีอินเทอร์เน็ต', feedback: 'ต้องใช้อินเทอร์เน็ต' },
        ],
        ref: `${W11} 2`,
      },
    ],
  },

  post11: {
    track: 'win11',
    manualNo: 10,
    pages: `${W11} 8–10`,
    stages: [{ id: 'verify', label: 'ตรวจสอบหลังติดตั้ง' }],
    hints: {
      verify: [
        'Settings > System > Activation ดูรุ่นและสถานะการเปิดใช้งาน',
        'Settings > Windows Update กด Check for updates แล้วรีสตาร์ตจนไม่มีรายการค้าง',
        'Device Manager ดูอุปกรณ์ที่มีเครื่องหมายเตือน แล้วแก้ผ่าน Advanced options > Optional updates > Driver updates',
        'Windows Security ดู Firewall และ Device security ส่วน Windows Backup ตั้งค่าการสำรองถ้าลูกค้าขอ',
      ],
    },
    mistakes: {
      'post-driver-site': {
        label: 'ดาวน์โหลดไดรเวอร์จากเว็บฝากไฟล์ที่ไม่ระบุผู้ผลิต',
        severity: 'critical',
        criterion: 'dataSafety',
        explain: 'ไดรเวอร์ควรมาจาก Windows Update (Optional updates > Driver updates) หรือเว็บไซต์ผู้ผลิตเครื่อง ไฟล์จากเว็บฝากไฟล์อาจมีมัลแวร์',
        ref: `${W11} 9`,
      },
    },
    checks: [
      { id: 'post-activation', label: 'ตรวจรุ่นและสถานะ Activation', required: true },
      { id: 'post-update', label: 'Windows Update ติดตั้งและรีสตาร์ตจนขึ้น You\'re up to date', required: true },
      { id: 'post-drivers', label: 'Device Manager ไม่มีอุปกรณ์ขาดไดรเวอร์', required: true, when: p => p.module === 'post11' && p.drivers.length > 0 },
      { id: 'post-security', label: 'Windows Security: Firewall เปิด และตรวจ Device security', required: true },
      { id: 'post-backup', label: 'ตั้งค่า Windows Backup ตามที่ลูกค้าขอ', required: true, when: p => p.module === 'post11' && !!p.backup },
    ],
    principles: ['Activation → Windows Update → Device Manager → Windows Security → Backup', 'ไดรเวอร์จาก Optional updates หรือเว็บไซต์ผู้ผลิตเท่านั้น', 'รีสตาร์ตจนไม่มีอัปเดตค้าง'],
    learn: {
      title: 'ทบทวน: ตรวจสอบหลังติดตั้ง',
      blocks: [
        {
          kind: 'table',
          head: ['ตรวจที่', 'ดูอะไร'],
          rows: [
            ['Settings > System > Activation', 'รุ่นและสถานะการเปิดใช้งาน'],
            ['Settings > Windows Update', 'อัปเดตจนไม่มีรายการค้าง'],
            ['Device Manager', 'อุปกรณ์ขาดไดรเวอร์ → Optional updates > Driver updates'],
            ['Windows Security', 'Firewall, TPM/Secure Boot, Device encryption'],
          ],
        },
      ],
      refs: [`${W11} 8–10 การตรวจสอบหลังติดตั้ง`],
    },
    quiz: [
      {
        id: 'q-post-update',
        kind: 'reason',
        prompt: 'หลังติดตั้ง Windows 11 ควรเข้าเมนูใดเพื่อตรวจอัปเดตระบบ',
        choices: [
          { text: 'Settings > Windows Update', correct: true, feedback: 'ถูกต้อง' },
          { text: 'Settings > Windows Security', feedback: 'ใช้ดูระบบป้องกัน' },
          { text: 'Settings > Apps > Installed apps', feedback: 'ใช้ดูแอปที่ติดตั้ง' },
        ],
        ref: `${W11} 8`,
      },
      {
        id: 'q-post-driver',
        kind: 'transfer',
        prompt: 'หาก Device Manager แสดงอุปกรณ์ขาดไดรเวอร์ ควรตรวจจากแหล่งใด',
        choices: [
          { text: 'Windows Update/Optional updates และเว็บผู้ผลิตอุปกรณ์', correct: true, feedback: 'ถูกต้อง' },
          { text: 'Windows Update และเว็บรวมไดรเวอร์ที่ไม่ระบุผู้ผลิต', feedback: 'เว็บที่ไม่ระบุผู้ผลิตไม่ปลอดภัย' },
          { text: 'ไฟล์ไดรเวอร์จากเครื่องต่างรุ่นและเว็บฝากไฟล์', feedback: 'ไม่ปลอดภัยและอาจไม่ตรงรุ่น' },
        ],
        ref: `${W11} 9`,
      },
      {
        id: 'q-post-list',
        kind: 'reason',
        prompt: 'ข้อใดเป็นชุดตรวจความพร้อมหลังติดตั้งที่ครบถ้วนที่สุด',
        choices: [
          { text: 'Activation, Windows Update, Device Manager, Windows Security และชุดสำรอง', correct: true, feedback: 'ถูกต้อง' },
          { text: 'Activation, Windows Update และภาพพื้นหลัง', feedback: 'ยังขาดไดรเวอร์ ระบบป้องกัน และสำรองข้อมูล' },
          { text: 'Activation, Device Manager, Windows Security และชุดสำรอง', feedback: 'ยังขาด Windows Update' },
        ],
        ref: `${W11} 10`,
      },
    ],
  },
}

export interface ModuleJobInput {
  id: JobId
  track: Track
  mode?: 'guided' | 'challenge'
  order: number
  code: string
  title: string
  tagline: string
  customer: Person
  intake: string[]
  workOrder: WorkOrderRow[]
  phases: Phase[]
  reward: number
  minutes: number
  requires?: JobId
  /** quiz bank ids from the modules (in display order of the bank is not used; Debrief shuffles choices) */
  quiz: string[]
  thanks: string
  learn?: KnowledgeCard
  demo?: DemoFrame[]
  objectives?: Objective[]
  units?: string[]
}

const CRITERIA: CriterionId[] = ['accuracy', 'reasoning', 'dataSafety', 'testing']

const DEFAULT_OBJECTIVES: Objective[] = [
  { id: 'o1', text: 'ทำงานตามขั้นตอนในใบเนื้อหาได้ถูกต้อง', rules: [{ criterion: 'accuracy', min: 0.75 }] },
  { id: 'o2', text: 'ไม่ทำให้ข้อมูลของลูกค้าเสียหาย', rules: [{ criterion: 'dataSafety', min: 0.8 }] },
  { id: 'o3', text: 'ตรวจผลงานครบก่อนส่ง', rules: [{ criterion: 'testing', min: 1 }] },
]

const unique = <T>(list: T[], key: (x: T) => string) => list.filter((x, i) => list.findIndex(y => key(y) === key(x)) === i)

/** builds a full JobDef from module phases: stages, hints, mistakes, checks, principles and quiz come from the modules */
export function moduleJob(input: ModuleJobInput): JobDef {
  const mods = input.phases.map(p => MODULES[p.module])
  const quizBank = mods.flatMap(m => m.quiz)
  const quiz = input.quiz.map(id => {
    const q = quizBank.find(x => x.id === id)
    if (!q) throw new Error(`quiz "${id}" is not in the modules of ${input.id}`)
    return q
  })
  const checks = unique(
    input.phases.flatMap(p => MODULES[p.module].checks.filter(c => !c.when || c.when(p)).map(({ id, label, required }) => ({ id, label, required }))),
    c => c.id,
  )
  const evidence = Object.fromEntries(input.workOrder.filter(r => r.fact).map(r => [r.fact as string, { label: `${r.label}: ${r.value}`, source: 'ใบสั่งงาน' }]))
  return {
    id: input.id,
    track: input.track,
    mode: input.mode,
    phases: input.phases,
    order: input.order,
    code: input.code,
    title: input.title,
    tagline: input.tagline,
    customer: input.customer,
    intake: input.intake,
    workOrder: input.workOrder,
    objectives: input.objectives ?? DEFAULT_OBJECTIVES,
    units: input.units ?? unique(mods.map(m => m.pages), x => x),
    manualNo: mods[0].manualNo,
    reward: input.reward,
    minutes: input.minutes,
    requires: input.requires,
    criteria: CRITERIA,
    learn: input.learn ?? mods[0].learn,
    demo: input.demo,
    stages: unique(mods.flatMap(m => m.stages), s => s.id),
    hints: Object.assign({}, ...mods.map(m => m.hints)),
    evidence,
    mistakes: Object.assign({}, ...mods.map(m => m.mistakes)),
    checks,
    principles: unique(mods.flatMap(m => m.principles), x => x),
    quiz,
    thanks: input.thanks,
  }
}
