import type { ModuleId } from '../../game/scenarios.ts'
import type { JobDef } from '../../game/types.ts'
import { moduleJob, type ModuleJobInput } from '../modules.ts'
import { BANK, DECH, FAH, JUNE, KAI, MALI, NAM, OAT, PRAE, TON } from '../people.ts'

// Challenge jobs: short tasks inside the content sheets, unlocked by the story job that teaches them.
// They skip the learn/demo steps (mode "challenge") and pay less than story jobs, so students take many of them
// to earn coins for decorating the shop.

/** coins at three stars, by module */
const PAY: Record<ModuleId, number> = {
  rufus: 60,
  boot: 50,
  setup10: 90,
  oobe10: 60,
  ready11: 50,
  mct: 60,
  uefi11: 80,
  setup11: 90,
  oobe11: 70,
  post11: 90,
}

const MINUTES: Record<ModuleId, number> = { rufus: 4, boot: 3, setup10: 6, oobe10: 4, ready11: 3, mct: 4, uefi11: 5, setup11: 6, oobe11: 5, post11: 6 }

const UNLOCK: Record<ModuleId, ModuleJobInput['requires']> = {
  rufus: 'make-usb',
  boot: 'bios-boot',
  setup10: 'install-new',
  oobe10: 'first-setup',
  ready11: 'w11-check',
  mct: 'w11-usb',
  uefi11: 'w11-uefi',
  setup11: 'w11-install',
  oobe11: 'w11-install',
  post11: 'w11-verify',
}

let order = { win10: 100, win11: 100 }

type ChallengeInput = Omit<ModuleJobInput, 'track' | 'order' | 'code' | 'reward' | 'minutes' | 'requires' | 'mode'>

function challenge(track: 'win10' | 'win11', input: ChallengeInput): JobDef {
  const module = input.phases[0].module
  order = { ...order, [track]: order[track] + 1 }
  const n = order[track] - 100
  return moduleJob({
    ...input,
    track,
    mode: 'challenge',
    order: order[track],
    code: `ท้าทาย ${track === 'win10' ? 'W10' : 'W11'}-${String(n).padStart(2, '0')}`,
    reward: PAY[module],
    minutes: MINUTES[module],
    requires: UNLOCK[module],
  })
}

const WIN10_ISO = { name: 'Win10_22H2_Thai_x32x64.iso', size: '5.6 GB', kind: 'windows' as const, label: 'CCCOMA_X86FRE_TH-TH_DV9' }
const WIN10_EN_ISO = { name: 'Win10_22H2_English_x64.iso', size: '5.8 GB', kind: 'windows' as const, label: 'CCCOMA_X64FRE_EN-US_DV9' }
const UBUNTU_ISO = { name: 'ubuntu-22.04.4-desktop-amd64.iso', size: '4.7 GB', kind: 'ubuntu' as const, label: 'Ubuntu 22.04.4 LTS amd64' }
const OFFICE_ISO = { name: 'Office_2021_Setup.iso', size: '3.9 GB', kind: 'office' as const, label: 'OFFICE2021' }

const BIOS_INFO = (cpu: string, ram: string) => [
  { label: 'BIOS Version', value: 'v02.61' },
  { label: 'Processor Type', value: cpu },
  { label: 'Total Memory', value: ram },
]

const EDITIONS_10 = ['Windows 10 Home', 'Windows 10 Home N', 'Windows 10 Education', 'Windows 10 Pro']
const EDITIONS_11 = ['Windows 11 Home', 'Windows 11 Education', 'Windows 11 Pro', 'Windows 11 Pro for Workstations']

export const CHALLENGES: JobDef[] = [
  /* ---------------- Windows 10 · Rufus (sheet p.1–3) ---------------- */
  challenge('win10', {
    id: 'ch-rufus-cafe',
    title: 'USB ติดตั้งให้คอมเก็บเงินร้านกาแฟ',
    tagline: 'เครื่องเก่าบูตแบบ BIOS และมีแฟลชไดรฟ์ของร้านเสียบอยู่สองตัว',
    customer: KAI,
    intake: ['คอมเก็บเงินที่ร้านรุ่นเก่ามากแล้วค่ะ ขอ USB ลง Windows 10 ใหม่ แฟลชไดรฟ์เมนูร้านอย่าโดนนะคะ'],
    workOrder: [
      { label: 'เครื่องปลายทาง', value: 'คอมเก็บเงินรุ่นเก่า บูตแบบ BIOS (Legacy)', fact: 'wo-ch-target' },
      { label: 'แฟลชไดรฟ์ที่ใช้', value: 'SANDISK 16 GB (ว่าง)', fact: 'wo-ch-usb' },
      { label: 'ห้ามแตะ', value: 'CAFE-MENU 32 GB มีไฟล์เมนูและรูปร้าน' },
      { label: 'ไฟล์ติดตั้ง', value: 'Windows 10 22H2 ภาษาไทย' },
    ],
    phases: [
      {
        module: 'rufus',
        devices: [
          { id: 'E', label: 'CAFE-MENU (E:) [32GB]' },
          { id: 'F', label: 'SANDISK (F:) [16GB]' },
        ],
        target: 'F',
        scheme: 'mbr-bios',
        iso: WIN10_ISO.name,
        isos: [WIN10_ISO, OFFICE_ISO, UBUNTU_ISO],
      },
    ],
    quiz: ['q-rufus-bios'],
    thanks: 'ได้ USB แล้ว ขอบคุณค่ะ เดี๋ยวเลี้ยงกาแฟนะคะ',
  }),
  challenge('win10', {
    id: 'ch-rufus-gamer',
    title: 'USB ติดตั้งให้เครื่องเล่นเกมรุ่นใหม่',
    tagline: 'เครื่อง UEFI ดิสก์ GPT 2 TB และมี SSD ภายนอกที่เต็มไปด้วยเกม',
    customer: BANK,
    intake: ['เครื่องใหม่ผมเป็น UEFI ดิสก์ 2 TB แบบ GPT ครับ อย่าไปฟอร์แมต SSD เกมผมนะ 1 TB นั่นเล่นมาสามปี'],
    workOrder: [
      { label: 'เครื่องปลายทาง', value: 'UEFI · ดิสก์ GPT 2 TB', fact: 'wo-ch-target' },
      { label: 'แฟลชไดรฟ์ที่ใช้', value: 'TOSHIBA 32 GB (ว่าง)', fact: 'wo-ch-usb' },
      { label: 'ห้ามแตะ', value: 'GAMES-SSD 1 TB' },
      { label: 'ไฟล์ติดตั้ง', value: 'Windows 10 22H2 ภาษาไทย' },
    ],
    phases: [
      {
        module: 'rufus',
        devices: [
          { id: 'D', label: 'GAMES-SSD (D:) [1TB]' },
          { id: 'G', label: 'TOSHIBA (G:) [32GB]' },
        ],
        target: 'G',
        scheme: 'gpt-uefi',
        iso: WIN10_ISO.name,
        isos: [UBUNTU_ISO, WIN10_ISO, OFFICE_ISO],
      },
    ],
    quiz: ['q-rufus-gpt'],
    thanks: 'เยี่ยมครับ ไลฟ์คืนนี้ทันแน่นอน',
  }),
  challenge('win10', {
    id: 'ch-rufus-library',
    title: 'USB ติดตั้งให้คอมห้องสมุดโรงเรียน',
    tagline: 'เครื่อง UEFI ที่ดิสก์เป็น MBR และมีไฟล์ ISO ภาษาอังกฤษหลอกอยู่',
    customer: PRAE,
    intake: ['คอมห้องสมุดเป็น UEFI แต่ดิสก์ยังเป็น MBR ค่ะ ฝ่ายไอทีให้คงแบบ MBR ไว้ ขอ Windows 10 ภาษาไทยนะคะ'],
    workOrder: [
      { label: 'เครื่องปลายทาง', value: 'UEFI · ดิสก์ MBR (คงรูปแบบเดิม)', fact: 'wo-ch-target' },
      { label: 'แฟลชไดรฟ์ที่ใช้', value: 'KINGSTON 8 GB (ว่าง)', fact: 'wo-ch-usb' },
      { label: 'ห้ามแตะ', value: 'LIBRARY-DATA 64 GB ข้อมูลยืมคืนหนังสือ' },
      { label: 'ไฟล์ติดตั้ง', value: 'Windows 10 22H2 ภาษาไทย' },
    ],
    phases: [
      {
        module: 'rufus',
        devices: [
          { id: 'E', label: 'LIBRARY-DATA (E:) [64GB]' },
          { id: 'F', label: 'KINGSTON (F:) [8GB]' },
        ],
        target: 'F',
        scheme: 'mbr-uefi',
        iso: WIN10_ISO.name,
        isos: [WIN10_EN_ISO, WIN10_ISO, UBUNTU_ISO],
      },
    ],
    quiz: ['q-rufus-device'],
    thanks: 'ขอบคุณมากค่ะ เด็ก ๆ จะได้ใช้คอมห้องสมุดเร็ว ๆ นี้',
  }),

  /* ---------------- Windows 10 · BIOS boot order (sheet p.3–6) ---------------- */
  challenge('win10', {
    id: 'ch-boot-cafe',
    title: 'ตั้งให้คอมร้านกาแฟบูตจาก USB',
    tagline: 'ฮาร์ดดิสก์อยู่ลำดับแรก ต้องย้าย USB ขึ้นมาก่อนแล้วบันทึก',
    customer: KAI,
    intake: ['เสียบ USB แล้วแต่เครื่องยังเข้า Windows เดิมทุกทีเลยค่ะ'],
    workOrder: [
      { label: 'ปุ่มเข้า BIOS', value: 'F2' },
      { label: 'USB ติดตั้ง', value: 'USB: SANDISK Cruzer (16GB)', fact: 'wo-ch-usb' },
    ],
    phases: [{ module: 'boot', info: BIOS_INFO('Intel Pentium G3220 @ 3.00GHz', '4096 MB'), drives: ['SATA: ST500DM002 (500GB)', 'USB: SANDISK Cruzer (16GB)'], usb: 'USB: SANDISK Cruzer (16GB)' }],
    quiz: ['q-boot-f10'],
    thanks: 'เข้าหน้าติดตั้งได้แล้ว เก่งมากค่ะ',
  }),
  challenge('win10', {
    id: 'ch-boot-school',
    title: 'บูต USB ทั้งที่มีฮาร์ดดิสก์สำรองเสียบอยู่',
    tagline: 'มีอุปกรณ์ USB สองตัว ตัวหนึ่งเป็นฮาร์ดดิสก์สำรอง 2 TB',
    customer: PRAE,
    intake: ['ครูเสียบฮาร์ดดิสก์สำรองไว้ด้วย เพราะเพิ่งก๊อปไฟล์ออกมา ฝากตั้งให้บูตจากแฟลชไดรฟ์ติดตั้งนะคะ'],
    workOrder: [
      { label: 'ปุ่มเข้า BIOS', value: 'F2' },
      { label: 'USB ติดตั้ง', value: 'USB: KINGSTON DT (8GB)', fact: 'wo-ch-usb' },
      { label: 'อีกตัวที่เสียบอยู่', value: 'USB: SEAGATE Backup Plus (2TB) = ฮาร์ดดิสก์สำรอง' },
    ],
    phases: [
      {
        module: 'boot',
        info: BIOS_INFO('Intel Core i3-4130 @ 3.40GHz', '8192 MB'),
        drives: ['SATA: WDC WD10EZEX (1TB)', 'USB: SEAGATE Backup Plus (2TB)', 'USB: KINGSTON DT (8GB)'],
        usb: 'USB: KINGSTON DT (8GB)',
      },
    ],
    quiz: ['q-boot-menu'],
    thanks: 'ขอบคุณค่ะ ครูไม่รู้เลยว่าต้องดูชื่อให้ดีแบบนี้',
  }),
  challenge('win10', {
    id: 'ch-boot-garage',
    title: 'คอมอู่ซ่อมรถที่มีฮาร์ดดิสก์สองลูก',
    tagline: 'มีฮาร์ดดิสก์ SATA สองลูก ต้องเลือก USB ให้เป็นลำดับแรก',
    customer: DECH,
    intake: ['เครื่องลุงมีฮาร์ดดิสก์สองลูก ลุงงงไปหมดแล้ว ช่วยตั้งให้บูตแฟลชไดรฟ์ทีนะ'],
    workOrder: [
      { label: 'ปุ่มเข้า BIOS', value: 'F2' },
      { label: 'USB ติดตั้ง', value: 'USB: SANDISK Ultra (16GB)', fact: 'wo-ch-usb' },
    ],
    phases: [
      {
        module: 'boot',
        info: BIOS_INFO('AMD A8-6600K APU', '8192 MB'),
        drives: ['SATA: HITACHI HDS721032 (320GB)', 'SATA: WDC WD10EZRZ (1TB)', 'USB: SANDISK Ultra (16GB)'],
        usb: 'USB: SANDISK Ultra (16GB)',
      },
    ],
    quiz: ['q-boot-f10'],
    thanks: 'ขอบใจมากหลาน ลุงจะได้เปิดบิลลูกค้าได้',
  }),

  /* ---------------- Windows 10 · Setup steps 1–9 (sheet p.6–11) ---------------- */
  challenge('win10', {
    id: 'ch-setup-cafe',
    title: 'ติดตั้ง Windows 10 ลงคอมร้านกาแฟ (RAM 3 GB)',
    tagline: 'RAM ไม่ถึง 4 GB ฮาร์ดดิสก์ใหม่ยังว่าง และมี Product Key',
    customer: KAI,
    intake: ['เปลี่ยนฮาร์ดดิสก์ใหม่แล้วค่ะ มีคีย์ Windows ติดกล่องมาด้วย'],
    workOrder: [
      { label: 'RAM', value: '3 GB', fact: 'wo-ch-ram' },
      { label: 'ดิสก์', value: 'ฮาร์ดดิสก์ใหม่ 500 GB (ว่าง)' },
      { label: 'Product Key', value: 'CAFE2-6BLOO-MKEY0-THAIL-WIN10' },
    ],
    phases: [
      {
        module: 'setup10',
        ramGb: 3,
        disk: 'new',
        parts: [{ id: 'u0', label: 'Drive 0 Unallocated Space', size: 465.8, free: 465.8, type: '', kind: 'unalloc' }],
        bootMode: 'legacy',
        diskStyle: 'mbr',
        productKey: 'CAFE2-6BLOO-MKEY0-THAIL-WIN10',
      },
    ],
    quiz: ['q-setup10-arch', 'q-setup10-presskey'],
    thanks: 'ร้านกลับมาเปิดบิลได้แล้ว ขอบคุณค่ะ',
  }),
  challenge('win10', {
    id: 'ch-setup-photo',
    title: 'ลง Windows 10 ใหม่ ห้ามโดนไฟล์งานแต่ง',
    tagline: 'ดิสก์เดียวมีทั้ง Windows เดิมและพาร์ทิชันงานถ่ายภาพ 1.6 TB',
    customer: OAT,
    intake: ['เครื่องช้ามากครับ ขอลง Windows 10 Pro ใหม่ แต่พาร์ทิชัน WEDDING ห้ามหายเด็ดขาด เครื่องนี้เคยเปิดใช้งาน Pro แล้ว'],
    workOrder: [
      { label: 'RAM', value: '16 GB', fact: 'wo-ch-ram' },
      { label: 'สิทธิ์', value: 'Windows 10 Pro แบบดิจิทัล (ไม่มี Product Key)' },
      { label: 'ห้ามแตะ', value: 'Partition 5: WEDDING (งานลูกค้า)', fact: 'wo-ch-data' },
    ],
    phases: [
      {
        module: 'setup10',
        ramGb: 16,
        disk: 'existing',
        parts: [
          { id: 'p1', label: 'Drive 0 Partition 1: System', size: 0.1, free: 0.07, type: 'System', kind: 'sys' },
          { id: 'p2', label: 'Drive 0 Partition 2', size: 0.016, free: 0.016, type: 'MSR (Reserved)', kind: 'msr' },
          { id: 'p3', label: 'Drive 0 Partition 3: Windows', size: 237.9, free: 52.3, type: 'Primary', kind: 'win' },
          { id: 'p4', label: 'Drive 0 Partition 4', size: 0.5, free: 0.08, type: 'Recovery', kind: 'rec' },
          { id: 'p5', label: 'Drive 0 Partition 5: WEDDING', size: 1624.4, free: 210.7, type: 'Primary', kind: 'data' },
        ],
        bootMode: 'uefi',
        diskStyle: 'gpt',
        editions: EDITIONS_10,
        edition: 'Windows 10 Pro',
      },
    ],
    quiz: ['q-setup10-custom', 'q-setup10-arch'],
    thanks: 'งานแต่งอยู่ครบ เครื่องก็เร็วขึ้น ขอบคุณครับ',
  }),
  challenge('win10', {
    id: 'ch-setup-student',
    title: 'ลง Windows 10 ให้โน้ตบุ๊กนักเรียน (RAM 4 GB)',
    tagline: 'RAM พอดี 4 GB SSD ใหม่ยังว่าง และมี Product Key',
    customer: NAM,
    intake: ['เปลี่ยนเป็น SSD ใหม่แล้วค่ะ มีคีย์อยู่บนใบเสร็จ RAM 4 GB เลือกแบบไหนดีคะ'],
    workOrder: [
      { label: 'RAM', value: '4 GB', fact: 'wo-ch-ram' },
      { label: 'ดิสก์', value: 'SSD ใหม่ 256 GB (ว่าง)' },
      { label: 'Product Key', value: 'NAM05-STUDY-HARD0-THAIL-WIN10' },
    ],
    phases: [
      {
        module: 'setup10',
        ramGb: 4,
        disk: 'new',
        parts: [{ id: 'u0', label: 'Drive 0 Unallocated Space', size: 238.5, free: 238.5, type: '', kind: 'unalloc' }],
        bootMode: 'legacy',
        diskStyle: 'mbr',
        productKey: 'NAM05-STUDY-HARD0-THAIL-WIN10',
      },
    ],
    quiz: ['q-setup10-arch', 'q-setup10-custom'],
    thanks: 'ขอบคุณค่ะ พรุ่งนี้มีส่งงานพอดีเลย',
  }),

  /* ---------------- Windows 10 · setup steps 10–16 (sheet p.11–14) ---------------- */
  challenge('win10', {
    id: 'ch-oobe-cafe',
    title: 'ตั้งค่าเริ่มต้นคอมเก็บเงิน',
    tagline: 'พนักงานหลายคนใช้ร่วมกัน ต้องพิมพ์ไทยได้ และปิดการติดตาม',
    customer: KAI,
    intake: ['พนักงานผลัดกันใช้ค่ะ ขอบัญชีในเครื่องชื่อ Cashier พิมพ์ไทยได้ แล้วปิดตำแหน่งกับโฆษณาด้วยนะคะ'],
    workOrder: [
      { label: 'ภูมิภาค / แป้นพิมพ์', value: 'Thailand · US + Thai Kedmanee' },
      { label: 'บัญชี', value: 'Offline account ชื่อ Cashier พร้อมรหัสผ่าน', fact: 'wo-ch-account' },
      { label: 'ความเป็นส่วนตัว', value: 'ปิด Location และ Advertising ID' },
    ],
    phases: [{ module: 'oobe10', region: 'Thailand', keyboard: 'US', second: 'Thai Kedmanee', account: 'offline', user: 'Cashier', privacyOff: ['location', 'ads'] }],
    quiz: ['q-oobe10-offline'],
    thanks: 'พร้อมเปิดร้านแล้วค่ะ',
  }),
  challenge('win10', {
    id: 'ch-oobe-student',
    title: 'ตั้งค่าโน้ตบุ๊กส่วนตัวของนักเรียน',
    tagline: 'ใช้แป้นไทยเป็นหลัก ไม่เพิ่มแป้นที่สอง และใช้บัญชี Microsoft',
    customer: NAM,
    intake: ['หนูใช้แป้นไทยอย่างเดียวค่ะ อยากใช้บัญชี Microsoft ของหนูเพื่อเปิดงานจาก OneDrive แล้วไม่เอาโฆษณากับการแนะนำเนื้อหานะคะ'],
    workOrder: [
      { label: 'ภูมิภาค / แป้นพิมพ์', value: 'Thailand · Thai Kedmanee (ไม่เพิ่มแป้นที่สอง)' },
      { label: 'บัญชี', value: 'บัญชี Microsoft ของน้องน้ำ', fact: 'wo-ch-account' },
      { label: 'ความเป็นส่วนตัว', value: 'ปิด Tailored experiences และ Advertising ID' },
    ],
    phases: [{ module: 'oobe10', region: 'Thailand', keyboard: 'Thai Kedmanee', second: null, account: 'microsoft', privacyOff: ['tailored', 'ads'] }],
    quiz: ['q-oobe10-skip'],
    thanks: 'ไฟล์ใน OneDrive ขึ้นมาครบเลย ขอบคุณค่ะ',
  }),
  challenge('win10', {
    id: 'ch-oobe-garage',
    title: 'ตั้งค่าคอมหน้าร้านอู่ซ่อมรถ',
    tagline: 'บัญชีในเครื่องชื่อ Garage01 และปิดการส่งข้อมูลหลายรายการ',
    customer: DECH,
    intake: ['ลูกน้องใช้เครื่องนี้พิมพ์ใบเสร็จ ขอบัญชีในเครื่องชื่อ Garage01 พิมพ์ไทยได้ แล้วปิดตำแหน่ง ข้อมูลการใช้งาน กับโฆษณาให้หมด'],
    workOrder: [
      { label: 'ภูมิภาค / แป้นพิมพ์', value: 'Thailand · US + Thai Kedmanee' },
      { label: 'บัญชี', value: 'Offline account ชื่อ Garage01 พร้อมรหัสผ่าน', fact: 'wo-ch-account' },
      { label: 'ความเป็นส่วนตัว', value: 'ปิด Location, Diagnostic data และ Advertising ID' },
    ],
    phases: [{ module: 'oobe10', region: 'Thailand', keyboard: 'US', second: 'Thai Kedmanee', account: 'offline', user: 'Garage01', privacyOff: ['location', 'diagnostic', 'ads'] }],
    quiz: ['q-oobe10-offline'],
    thanks: 'ขอบใจหลาน พรุ่งนี้ลูกน้องใช้ได้เลย',
  }),

  /* ---------------- Windows 11 · readiness (sheet p.1) ---------------- */
  challenge('win11', {
    id: 'ch-ready-office',
    title: 'คอมฝ่ายบัญชีพร้อมขึ้น Windows 11 ไหม',
    tagline: 'ตรวจด้วย PC Health Check, msinfo32 และ tpm.msc แล้วสรุปความพร้อม',
    customer: JUNE,
    intake: ['หัวหน้าถามว่าเครื่องจูนขึ้น Windows 11 ได้หรือยังคะ ช่วยตรวจให้หน่อย'],
    workOrder: [{ label: 'งาน', value: 'ตรวจความพร้อมและสรุปผล (ยังไม่ติดตั้ง)' }],
    phases: [
      {
        module: 'ready11',
        pc: 'JUNE-PC · 16 GB RAM · 512 GB SSD',
        health: [
          { ok: true, text: 'The processor is supported for Windows 11.', detail: 'Processor: Bloom Core 7 1360P' },
          { ok: true, text: 'There is at least 4 GB of system memory (RAM).', detail: 'System memory: 16 GB' },
          { ok: true, text: 'The system disk is 64 GB or larger.', detail: 'Storage: 512 GB' },
          { ok: true, text: 'This PC supports Secure Boot.', detail: 'Secure Boot is enabled' },
          { ok: true, text: 'TPM 2.0 is enabled on this PC.', detail: 'TPM: TPM 2.0' },
        ],
        info: [
          { label: 'OS Name', value: 'Microsoft Windows 10 Pro' },
          { label: 'Processor', value: 'Bloom Core 7 1360P @ 2.20GHz (12 cores)' },
          { label: 'BIOS Mode', value: 'UEFI' },
          { label: 'Secure Boot State', value: 'On' },
          { label: 'Installed Physical Memory (RAM)', value: '16.0 GB' },
        ],
        tpmReady: true,
        answer: 'ready',
      },
    ],
    quiz: ['q-ready-fw'],
    thanks: 'ดีจังค่ะ จะได้บอกหัวหน้าว่าพร้อมแล้ว',
  }),
  challenge('win11', {
    id: 'ch-ready-old',
    title: 'คอมรุ่นเก่าของร้านขายของชำ',
    tagline: 'เครื่องเก่า บูตแบบ Legacy BIOS ลองดูว่าขึ้น Windows 11 ได้ไหม',
    customer: MALI,
    intake: ['หลานบอกให้ลง Windows 11 ป้าก็ไม่รู้ว่าเครื่องเก่าแบบนี้ได้ไหม ช่วยดูหน่อยนะลูก'],
    workOrder: [{ label: 'งาน', value: 'ตรวจความพร้อมและสรุปผลให้ลูกค้า' }],
    phases: [
      {
        module: 'ready11',
        pc: 'MALI-PC · 4 GB RAM · 500 GB HDD',
        health: [
          { ok: false, text: 'The processor isn\'t currently supported for Windows 11.', detail: 'Processor: Bloom Core 2 Duo E8400' },
          { ok: true, text: 'There is at least 4 GB of system memory (RAM).', detail: 'System memory: 4 GB' },
          { ok: true, text: 'The system disk is 64 GB or larger.', detail: 'Storage: 500 GB' },
          { ok: false, text: 'This PC must support Secure Boot.', detail: 'Secure Boot: Not supported' },
          { ok: false, text: 'TPM 2.0 must be supported and enabled on this PC.', detail: 'TPM: TPM not detected.' },
        ],
        info: [
          { label: 'OS Name', value: 'Microsoft Windows 10 Home' },
          { label: 'Processor', value: 'Bloom Core 2 Duo E8400 @ 3.00GHz (2 cores)' },
          { label: 'BIOS Mode', value: 'Legacy' },
          { label: 'Secure Boot State', value: 'Unsupported' },
          { label: 'Installed Physical Memory (RAM)', value: '4.00 GB' },
        ],
        tpmReady: false,
        answer: 'unsupported',
      },
    ],
    quiz: ['q-ready-cpu'],
    thanks: 'เข้าใจแล้วลูก ป้าใช้ Windows 10 ไปก่อน แล้วค่อยเก็บเงินซื้อเครื่องใหม่',
  }),

  /* ---------------- Windows 11 · Media Creation Tool (sheet p.2–3) ---------------- */
  challenge('win11', {
    id: 'ch-mct-design',
    title: 'สร้าง USB Windows 11 ให้นักออกแบบ',
    tagline: 'มี USB สามตัว ตัวหนึ่งมีงานออกแบบ อีกตัวเล็กเกินไป',
    customer: FAH,
    intake: ['ฟ้าเสียบ USB มาสามอันเลยค่ะ อันที่มีงานออกแบบห้ามลบนะคะ ส่งงานพรุ่งนี้'],
    workOrder: [
      { label: 'USB ที่ใช้ได้', value: 'KINGSTON 16 GB (ว่าง)', fact: 'wo-ch-usb' },
      { label: 'ห้ามแตะ', value: 'FAH-WORKS 64 GB งานออกแบบ' },
    ],
    phases: [
      {
        module: 'mct',
        drives: [
          { id: 'E', label: 'FAH-WORKS', sizeGb: 59.6, data: 'ไฟล์งานออกแบบของคุณฟ้า' },
          { id: 'F', label: 'SANDISK', sizeGb: 3.7 },
          { id: 'G', label: 'KINGSTON', sizeGb: 14.9 },
        ],
        target: 'G',
      },
    ],
    quiz: ['q-mct-8gb'],
    thanks: 'ขอบคุณค่ะ งานออกแบบยังอยู่ครบ',
  }),
  challenge('win11', {
    id: 'ch-mct-hotel',
    title: 'สร้าง USB Windows 11 ให้ฝ่ายไอทีโรงแรม',
    tagline: 'แฟลชไดรฟ์ไฟล์กล้องวงจรปิดก็เสียบอยู่ด้วย',
    customer: TON,
    intake: ['USB ไฟล์กล้องวงจรปิดต้องส่งตำรวจพรุ่งนี้นะครับ ใช้อันใหม่ 32 GB สร้างตัวติดตั้งได้เลย'],
    workOrder: [
      { label: 'USB ที่ใช้ได้', value: 'SHOP-USB2 32 GB (ว่าง)', fact: 'wo-ch-usb' },
      { label: 'ห้ามแตะ', value: 'CCTV-EXPORT ไฟล์กล้องวงจรปิด' },
    ],
    phases: [
      {
        module: 'mct',
        drives: [
          { id: 'E', label: 'HOTEL-KEYS', sizeGb: 7.5 },
          { id: 'F', label: 'SHOP-USB2', sizeGb: 28.9 },
          { id: 'H', label: 'CCTV-EXPORT', sizeGb: 58.6, data: 'ไฟล์กล้องวงจรปิดที่ต้องส่งตำรวจ' },
        ],
        target: 'F',
      },
    ],
    quiz: ['q-mct-erase'],
    thanks: 'ไฟล์กล้องยังอยู่ ขอบคุณครับ',
  }),

  /* ---------------- Windows 11 · UEFI (sheet p.4–5) ---------------- */
  challenge('win11', {
    id: 'ch-uefi-hotel',
    title: 'เครื่องโรงแรมที่เปิด CSM ไว้',
    tagline: 'Boot Mode ยังเป็น Legacy + UEFI (CSM) และ Secure Boot ปิดอยู่',
    customer: TON,
    intake: ['ช่างคนก่อนเปิดโหมด Legacy ไว้ครับ ตอนนี้จะลง Windows 11 ช่วยตั้งให้ถูกที'],
    workOrder: [
      { label: 'คู่มือผู้ผลิต', value: 'F2 = เมนูเฟิร์มแวร์ · F12 = เมนูบูต' },
      { label: 'USB ติดตั้ง', value: 'SanDisk Ultra (สร้างด้วย Media Creation Tool)', fact: 'wo-ch-usb' },
    ],
    phases: [
      {
        module: 'uefi11',
        start: { secureBoot: false, tpm: true, csm: true },
        usb: 'SanDisk Ultra',
        disk: 'SAMSUNG SSD 512GB',
        info: [
          { label: 'Product Name', value: 'Bloom Desk 600' },
          { label: 'Processor', value: 'Bloom Core 5 12400' },
          { label: 'Memory', value: '16384 MB' },
        ],
      },
    ],
    quiz: ['q-uefi-gpt'],
    thanks: 'ขึ้นหน้าติดตั้ง Windows 11 แล้วครับ',
  }),
  challenge('win11', {
    id: 'ch-uefi-student',
    title: 'โน้ตบุ๊กนักเรียนที่ TPM ปิดอยู่',
    tagline: 'Secure Boot เปิดแล้ว แต่ TPM Device ยังเป็น Disabled',
    customer: NAM,
    intake: ['เพื่อนบอกว่าต้องเปิดอะไรสักอย่างก่อนลง Windows 11 หนูไม่กล้ากดเองค่ะ'],
    workOrder: [
      { label: 'คู่มือผู้ผลิต', value: 'F2 = เมนูเฟิร์มแวร์ · F12 = เมนูบูต' },
      { label: 'USB ติดตั้ง', value: 'KingstonDataTraveler 3.0', fact: 'wo-ch-usb' },
    ],
    phases: [
      {
        module: 'uefi11',
        start: { secureBoot: true, tpm: false, csm: false },
        usb: 'KingstonDataTraveler 3.0',
        disk: 'NVMe BLOOM 512GB',
        info: [
          { label: 'Product Name', value: 'BloomBook 13 S' },
          { label: 'Processor', value: 'Bloom Core 3 1215U' },
          { label: 'Memory', value: '8192 MB' },
        ],
      },
    ],
    quiz: ['q-uefi-keys'],
    thanks: 'ขอบคุณค่ะ ทีนี้ลงต่อได้แล้ว',
  }),

  /* ---------------- Windows 11 · Setup (sheet p.5–7) ---------------- */
  challenge('win11', {
    id: 'ch-setup11-design',
    title: 'ลง Windows 11 Home ให้เครื่องที่มีสองดิสก์',
    tagline: 'Disk 1 เก็บงานออกแบบ ห้ามแตะ และสิทธิ์เป็นรุ่น Home',
    customer: FAH,
    intake: ['ดิสก์ลูกที่สองเก็บงานทั้งหมดของฟ้าค่ะ ลงแค่ดิสก์ระบบนะคะ เครื่องนี้เป็น Windows 11 Home แบบดิจิทัล'],
    workOrder: [
      { label: 'สิทธิ์', value: 'Windows 11 Home แบบดิจิทัล (ไม่มี Product Key)', fact: 'wo-ch-license' },
      { label: 'ดิสก์เป้าหมาย', value: 'Disk 0 · SSD 512 GB' },
      { label: 'ห้ามแตะ', value: 'Disk 1 · WORKS 1 TB', fact: 'wo-ch-data' },
    ],
    phases: [
      {
        module: 'setup11',
        parts: [
          { id: 'a1', disk: 0, label: 'Disk 0 Partition 1: System', size: 0.1, free: 0.07, type: 'System', kind: 'sys' },
          { id: 'a2', disk: 0, label: 'Disk 0 Partition 2', size: 0.016, free: 0.016, type: 'MSR (Reserved)', kind: 'msr' },
          { id: 'a3', disk: 0, label: 'Disk 0 Partition 3', size: 475.9, free: 210.4, type: 'Primary', kind: 'win' },
          { id: 'a4', disk: 0, label: 'Disk 0 Partition 4', size: 0.9, free: 0.1, type: 'Recovery', kind: 'rec' },
          { id: 'b1', disk: 1, label: 'Disk 1 Partition 1: WORKS', size: 931.5, free: 402.6, type: 'Primary', kind: 'data' },
        ],
        editions: EDITIONS_11,
        edition: 'Windows 11 Home',
        targetDisk: 0,
      },
    ],
    quiz: ['q-setup11-license'],
    thanks: 'งานบน Disk 1 อยู่ครบ ขอบคุณค่ะ',
  }),
  challenge('win11', {
    id: 'ch-setup11-hotel',
    title: 'ลง Windows 11 Pro ทั้งที่มีพาร์ทิชัน DATA ในดิสก์เดียวกัน',
    tagline: 'ลบเฉพาะพาร์ทิชันของ Windows เดิม เก็บพาร์ทิชัน DATA ไว้',
    customer: TON,
    intake: ['ดิสก์มีพาร์ทิชัน DATA เก็บรายงานโรงแรมไว้ครับ ขอลง Windows 11 Pro ใหม่โดยไม่โดน DATA'],
    workOrder: [
      { label: 'สิทธิ์', value: 'Windows 11 Pro แบบดิจิทัล', fact: 'wo-ch-license' },
      { label: 'ดิสก์เป้าหมาย', value: 'Disk 0 · ลบเฉพาะพาร์ทิชันของ Windows เดิม' },
      { label: 'ห้ามแตะ', value: 'Disk 0 Partition 5: DATA (รายงานโรงแรม)', fact: 'wo-ch-data' },
    ],
    phases: [
      {
        module: 'setup11',
        parts: [
          { id: 'h1', disk: 0, label: 'Disk 0 Partition 1: System', size: 0.1, free: 0.07, type: 'System', kind: 'sys' },
          { id: 'h2', disk: 0, label: 'Disk 0 Partition 2', size: 0.016, free: 0.016, type: 'MSR (Reserved)', kind: 'msr' },
          { id: 'h3', disk: 0, label: 'Disk 0 Partition 3', size: 175.3, free: 61.2, type: 'Primary', kind: 'win' },
          { id: 'h4', disk: 0, label: 'Disk 0 Partition 4', size: 0.7, free: 0.1, type: 'Recovery', kind: 'rec' },
          { id: 'h5', disk: 0, label: 'Disk 0 Partition 5: DATA', size: 300.4, free: 120.9, type: 'Primary', kind: 'data' },
        ],
        editions: EDITIONS_11,
        edition: 'Windows 11 Pro',
        targetDisk: 0,
      },
    ],
    quiz: ['q-setup11-delete'],
    thanks: 'รายงานยังอยู่ครบ เยี่ยมมากครับ',
  }),

  /* ---------------- Windows 11 · OOBE (sheet p.7–8) ---------------- */
  challenge('win11', {
    id: 'ch-oobe11-design',
    title: 'ตั้งค่า Windows 11 ให้คุณฟ้า',
    tagline: 'เลือก Wi-Fi ให้ถูกบ้าน ใช้บัญชี Microsoft ของลูกค้า และปิดความเป็นส่วนตัวตามที่ขอ',
    customer: FAH,
    intake: ['Wi-Fi บ้านฟ้าชื่อ FAH-HOME-5G รหัส fah12345 ค่ะ ใช้บัญชี fah.design@outlook.example แล้วปิดตำแหน่ง การแนะนำเนื้อหา กับโฆษณานะคะ'],
    workOrder: [
      { label: 'ภูมิภาค / แป้นพิมพ์', value: 'Thailand · US + Thai Kedmanee' },
      { label: 'Wi-Fi', value: 'FAH-HOME-5G (รหัส fah12345)' },
      { label: 'บัญชี', value: 'ใช้ส่วนตัว · fah.design@outlook.example', fact: 'wo-ch-account' },
      { label: 'ความเป็นส่วนตัว', value: 'ปิด Location, Tailored experiences และ Advertising ID' },
    ],
    phases: [
      {
        module: 'oobe11',
        region: 'Thailand',
        keyboard: 'US',
        second: 'Thai Kedmanee',
        networks: [
          { ssid: 'FAH-HOME-2.4G', secured: true },
          { ssid: 'FAH-HOME-5G', secured: true },
          { ssid: 'Neighbor-Free-WiFi', secured: false },
        ],
        wifi: { ssid: 'FAH-HOME-5G', password: 'fah12345' },
        setup: 'personal',
        email: 'fah.design@outlook.example',
        privacyOff: ['location', 'tailored', 'ads'],
      },
    ],
    quiz: ['q-oobe11-net'],
    thanks: 'พร้อมใช้งานแล้ว ขอบคุณค่ะ',
  }),
  challenge('win11', {
    id: 'ch-oobe11-student',
    title: 'ตั้งค่า Windows 11 ให้น้องน้ำ',
    tagline: 'แป้นหลักภาษาไทย เพิ่ม US เป็นแป้นที่สอง',
    customer: NAM,
    intake: ['หนูถนัดแป้นไทยค่ะ แต่ต้องพิมพ์อังกฤษด้วย Wi-Fi บ้านชื่อ NAM-HOME รหัส nam2550 ใช้บัญชี nam.student@outlook.example แล้วปิดข้อมูลวินิจฉัยกับโฆษณานะคะ'],
    workOrder: [
      { label: 'ภูมิภาค / แป้นพิมพ์', value: 'Thailand · Thai Kedmanee + US' },
      { label: 'Wi-Fi', value: 'NAM-HOME (รหัส nam2550)' },
      { label: 'บัญชี', value: 'ใช้ส่วนตัว · nam.student@outlook.example', fact: 'wo-ch-account' },
      { label: 'ความเป็นส่วนตัว', value: 'ปิด Send optional diagnostic data และ Advertising ID' },
    ],
    phases: [
      {
        module: 'oobe11',
        region: 'Thailand',
        keyboard: 'Thai Kedmanee',
        second: 'US',
        networks: [
          { ssid: 'NAM-HOME', secured: true },
          { ssid: 'TrueMove-5G-7788', secured: true },
        ],
        wifi: { ssid: 'NAM-HOME', password: 'nam2550' },
        setup: 'personal',
        email: 'nam.student@outlook.example',
        privacyOff: ['diag', 'ads'],
      },
    ],
    quiz: ['q-oobe11-net'],
    thanks: 'ขอบคุณค่ะ พิมพ์ได้ทั้งไทยและอังกฤษเลย',
  }),

  /* ---------------- Windows 11 · checks after installing (sheet p.8–10) ---------------- */
  challenge('win11', {
    id: 'ch-post-design',
    title: 'ตรวจเครื่องคุณฟ้าก่อนส่งคืน',
    tagline: 'การ์ดจอยังไม่มีไดรเวอร์ และ Firewall ถูกปิดไว้',
    customer: FAH,
    intake: ['โปรแกรมออกแบบเปิดแล้วกระตุกค่ะ แล้วก็อยากให้สำรองไฟล์อัตโนมัติด้วย'],
    workOrder: [
      { label: 'อาการ', value: 'ภาพกระตุก (การ์ดจอขาดไดรเวอร์)', fact: 'wo-ch-symptom' },
      { label: 'สำรองข้อมูล', value: 'ตั้ง Windows Backup' },
      { label: 'เข้าเครื่อง', value: 'ผู้ใช้ Fah · PIN 1357' },
    ],
    phases: [
      {
        module: 'post11',
        pc: 'FAH-PC',
        edition: 'Windows 11 Home',
        drivers: [{ id: 'gpu', name: 'Video Controller', category: 'Other devices', update: 'Bloom Graphics - Display - 31.0.101.5' }],
        firewallOff: true,
        backup: true,
        user: 'Fah',
        pin: '1357',
      },
    ],
    quiz: ['q-post-driver'],
    thanks: 'ลื่นขึ้นเยอะเลยค่ะ ขอบคุณค่ะ',
  }),
  challenge('win11', {
    id: 'ch-post-hotel',
    title: 'ตรวจเครื่องเคาน์เตอร์โรงแรม',
    tagline: 'สายแลนกับบลูทูธยังไม่มีไดรเวอร์ และยังไม่ได้อัปเดต',
    customer: TON,
    intake: ['เครื่องเคาน์เตอร์ต่อแลนไม่ติดครับ เครื่องสแกนบัตรแบบบลูทูธก็ใช้ไม่ได้'],
    workOrder: [
      { label: 'อาการ', value: 'แลนและบลูทูธไม่ทำงาน (ขาดไดรเวอร์)', fact: 'wo-ch-symptom' },
      { label: 'เข้าเครื่อง', value: 'ผู้ใช้ FrontDesk · PIN 4826' },
    ],
    phases: [
      {
        module: 'post11',
        pc: 'FRONTDESK-01',
        edition: 'Windows 11 Pro',
        drivers: [
          { id: 'eth', name: 'Ethernet Controller', category: 'Other devices', update: 'Bloom Ethernet - Net - 10.1.2.3' },
          { id: 'bt', name: 'Bluetooth Device', category: 'Other devices', update: 'Bloom Bluetooth - 22.240.0.2' },
        ],
        user: 'FrontDesk',
        pin: '4826',
      },
    ],
    quiz: ['q-post-list'],
    thanks: 'แลนกับเครื่องสแกนใช้ได้แล้ว ขอบคุณครับ',
  }),
]
