import { moduleJob } from '../modules.ts'
import { PLOY } from '../people.ts'

// Windows 11 story jobs W11-02..05 for คุณพลอย's notebook PLOY-NB (W11-01 checked it and backed it up).
// They are module jobs: src/sims/modules plays the phases; texts follow the Windows 11 content sheet.

const PC = 'PLOY-NB'
const USB = 'KingstonDataTraveler 3.0'

/** Win11 sheet p.2–3 */
export const w11UsbJob = moduleJob({
  id: 'w11-usb',
  track: 'win11',
  order: 2,
  code: 'งาน W11-02',
  title: 'สร้าง USB ติดตั้ง Windows 11',
  tagline: 'ดาวน์โหลด Media Creation Tool จากเว็บ Microsoft แล้วสร้าง USB ลงแฟลชไดรฟ์ที่ตรวจแล้ว',
  customer: PLOY,
  intake: [
    'พี่ที่ร้านบอกว่าต้องทำ USB สำหรับติดตั้ง Windows 11 ก่อนใช่ไหมคะ',
    'ฮาร์ดดิสก์ BACKUP-PLOY ที่มีไฟล์สำรองยังเสียบอยู่ที่เครื่องร้านนะคะ ระวังด้วย',
  ],
  workOrder: [
    { label: 'เครื่องที่ใช้สร้างสื่อ', value: 'คอมของร้าน (มีอินเทอร์เน็ตและสิทธิ์ผู้ดูแลระบบ)' },
    { label: 'เครื่องมือ', value: 'Media Creation Tool จากหน้า Download Windows 11 ของ Microsoft' },
    { label: 'USB ที่ใช้', value: 'SHOP-USB 16 GB (ว่าง)', fact: 'wo-usb-shop' },
    { label: 'ห้ามแตะ', value: 'BACKUP-PLOY (E:) มีไฟล์สำรองของลูกค้า', fact: 'wo-usb-backup' },
    { label: 'หลังสร้างเสร็จ', value: 'ถอดอย่างปลอดภัยและติดป้ายชื่อ' },
  ],
  phases: [
    {
      module: 'mct',
      download: true,
      eject: true,
      drives: [
        { id: 'E', label: 'BACKUP-PLOY', sizeGb: 931.5, data: 'ไฟล์สำรองของคุณพลอย 1,240 ไฟล์' },
        { id: 'F', label: 'SHOP-USB', sizeGb: 14.9 },
        { id: 'G', label: 'OLD-USB', sizeGb: 3.7 },
      ],
      target: 'F',
    },
  ],
  reward: 100,
  minutes: 10,
  requires: 'w11-check',
  quiz: ['q-mct-tool', 'q-mct-erase', 'q-mct-check'],
  demo: [
    {
      title: 'เลือกหัวข้อให้ถูกในหน้าเว็บ',
      say: 'หน้า Download Windows 11 มีสามหัวข้อ งานนี้เราสร้าง USB ไปติดตั้งเครื่องอื่น จึงใช้ Create Windows 11 Installation Media แล้วกด Download Now',
    },
    {
      title: 'ดูชื่อและความจุก่อน Next',
      say: 'หน้า Select a USB flash drive จะลบทุกอย่างใน USB ที่เลือก พี่ดูชื่อกับความจุเทียบใบงาน ต้องอย่างน้อย 8 GB และไม่ใช่ตัวที่มีไฟล์ลูกค้า',
    },
  ],
  thanks: 'ได้ USB ติดตั้งแล้ว ขอบคุณค่ะ ต่อไปตั้งค่าเครื่องให้บูตจาก USB เลยนะคะ',
})

/** Win11 sheet p.4–5 */
export const w11UefiJob = moduleJob({
  id: 'w11-uefi',
  track: 'win11',
  order: 3,
  code: 'งาน W11-03',
  title: 'เปิด TPM / Secure Boot แล้วบูต USB แบบ UEFI',
  tagline: 'ตรวจใน Windows ก่อน แล้วเข้าเมนูเฟิร์มแวร์เปิด TPM 2.0 และ Secure Boot จากนั้นบูต USB ในรายการ UEFI',
  customer: PLOY,
  intake: ['จากงานแรก พี่บอกว่าเครื่องต้องเปิด TPM ในเฟิร์มแวร์ก่อนใช่ไหมคะ ฝากด้วยนะคะ'],
  workOrder: [
    { label: 'เครื่อง', value: `${PC} · BloomBook 14 G3 (บูตแบบ UEFI)` },
    { label: 'คู่มือผู้ผลิต', value: 'F2 = เข้าเมนูเฟิร์มแวร์ · F12 = เมนูบูต', fact: 'wo-fw-keys' },
    { label: 'ผลตรวจจากงาน W11-01', value: 'TPM ไม่พบ (ปิดในเฟิร์มแวร์) · Secure Boot State: Off', fact: 'wo-fw-state' },
    { label: 'USB ติดตั้ง', value: `SHOP-USB (${USB}) จากงาน W11-02` },
  ],
  phases: [
    {
      module: 'uefi11',
      precheck: true,
      start: { secureBoot: false, tpm: false, csm: false },
      usb: USB,
      disk: 'NVMe BLOOM 256GB',
      info: [
        { label: 'Product Name', value: 'BloomBook 14 G3' },
        { label: 'BIOS Version', value: '1.08' },
        { label: 'Processor', value: 'Bloom Core 5 1240U' },
        { label: 'Memory', value: '8192 MB' },
      ],
    },
  ],
  reward: 100,
  minutes: 10,
  requires: 'w11-usb',
  quiz: ['q-uefi-keys', 'q-uefi-gpt', 'q-uefi-notgpt'],
  demo: [
    {
      title: 'ตรวจในระบบเดิมก่อน',
      say: 'ก่อนรีสตาร์ต พี่เปิด msinfo32 ดู BIOS Mode กับ Secure Boot State แล้วเปิด Windows Security > Device security ดูว่ามี Security processor (TPM) ไหม',
    },
    {
      title: 'แก้ในเมนูเฟิร์มแวร์',
      say: 'คู่มือผู้ผลิตบอกว่าเข้าเมนูด้วย F2 แท็บ Security เปิด Secure Boot และ TPM Device แท็บ Boot ให้เป็น UEFI แล้ว F10 บันทึก จากนั้นรีสตาร์ตกด F12 เลือกรายการ UEFI: ตามด้วยชื่อ USB',
    },
  ],
  thanks: 'เครื่องพร้อมติดตั้งแล้ว เยี่ยมเลยค่ะ',
})

/** Win11 sheet p.5–8 */
export const w11InstallJob = moduleJob({
  id: 'w11-install',
  track: 'win11',
  order: 4,
  code: 'งาน W11-04',
  title: 'ติดตั้ง Windows 11 และตั้งค่าเริ่มต้น',
  tagline: 'Windows 11 Setup ลงดิสก์ที่ถูกต้องตามสิทธิ์ แล้วตั้งค่า OOBE ด้วยบัญชี Microsoft และ PIN ของลูกค้า',
  customer: PLOY,
  intake: [
    'เครื่องมีสิทธิ์ Windows 11 Pro แบบดิจิทัลนะคะ ไม่มี Product Key',
    'BACKUP-PLOY ยังเสียบอยู่เผื่อต้องใช้ ห้ามโดนเด็ดขาด',
    'ตั้งค่าตอนท้ายพลอยจะพิมพ์รหัสผ่านบัญชี Microsoft เองค่ะ',
  ],
  workOrder: [
    { label: 'สิทธิ์', value: 'Windows 11 Pro แบบดิจิทัล (ไม่มี Product Key)', fact: 'wo-ins-license' },
    { label: 'ดิสก์เป้าหมาย', value: 'Disk 0 · NVMe 256 GB (Windows 10 เดิม สำรองแล้ว)', fact: 'wo-ins-disk' },
    { label: 'ห้ามแตะ', value: 'Disk 1 · BACKUP-PLOY 931 GB', fact: 'wo-ins-backup' },
    { label: 'OOBE', value: 'ประเทศไทย · แป้น US + Thai Kedmanee · Wi-Fi PLOYJAI-OFFICE (รหัส ploy2026!)' },
    { label: 'บัญชี', value: 'ใช้ส่วนตัว · ploy@ployjai.example · ปิด Location และ Advertising ID' },
  ],
  phases: [
    {
      module: 'setup11',
      parts: [
        { id: 'd0p1', disk: 0, label: 'Disk 0 Partition 1: System', size: 0.1, free: 0.07, type: 'System', kind: 'sys' },
        { id: 'd0p2', disk: 0, label: 'Disk 0 Partition 2', size: 0.016, free: 0.016, type: 'MSR (Reserved)', kind: 'msr' },
        { id: 'd0p3', disk: 0, label: 'Disk 0 Partition 3', size: 237.6, free: 96.4, type: 'Primary', kind: 'win' },
        { id: 'd0p4', disk: 0, label: 'Disk 0 Partition 4', size: 0.7, free: 0.1, type: 'Recovery', kind: 'rec' },
        { id: 'd1p1', disk: 1, label: 'Disk 1 Partition 1: BACKUP-PLOY', size: 931.5, free: 812.0, type: 'Primary', kind: 'data' },
      ],
      editions: ['Windows 11 Home', 'Windows 11 Education', 'Windows 11 Pro', 'Windows 11 Pro for Workstations'],
      edition: 'Windows 11 Pro',
      targetDisk: 0,
    },
    {
      module: 'oobe11',
      region: 'Thailand',
      keyboard: 'US',
      second: 'Thai Kedmanee',
      networks: [
        { ssid: 'PLOYJAI-OFFICE', secured: true },
        { ssid: 'PLOYJAI-GUEST', secured: false },
        { ssid: 'Neighbor-5G', secured: true },
      ],
      wifi: { ssid: 'PLOYJAI-OFFICE', password: 'ploy2026!' },
      setup: 'personal',
      email: 'ploy@ployjai.example',
      privacyOff: ['location', 'ads'],
    },
  ],
  reward: 160,
  minutes: 15,
  requires: 'w11-uefi',
  quiz: ['q-setup11-license', 'q-setup11-delete', 'q-oobe11-net'],
  demo: [
    {
      title: 'ดูหมายเลขดิสก์',
      say: 'หน้า Select location พี่จะเห็นทั้ง Disk 0 และ Disk 1 ดูความจุให้ดี Disk 0 คือ 256 GB ของเครื่อง ลบเฉพาะพาร์ทิชันของ Disk 0 แล้วเลือก Unallocated Space ส่วน Disk 1 ไม่แตะเลย',
    },
    {
      title: 'รหัสผ่านเป็นของลูกค้า',
      say: 'ตอน OOBE ใส่อีเมลบัญชี Microsoft ของลูกค้าแล้วให้ลูกค้าพิมพ์รหัสผ่านเอง ช่างไม่ควรขอรหัสผ่านลูกค้า',
    },
  ],
  thanks: 'Windows 11 ขึ้นแล้ว ดีใจมากค่ะ!',
})

/** Win11 sheet p.8–10 */
export const w11VerifyJob = moduleJob({
  id: 'w11-verify',
  track: 'win11',
  order: 5,
  code: 'งาน W11-05',
  title: 'ตรวจสอบหลังติดตั้งก่อนส่งเครื่อง',
  tagline: 'ตรวจ Activation อัปเดต ไดรเวอร์ ระบบป้องกัน และตั้งค่าสำรองข้อมูลให้ครบตามเกณฑ์ผ่านงาน',
  customer: PLOY,
  intake: ['ก่อนรับเครื่องคืน ช่วยเช็กให้ครบนะคะ Wi-Fi กับเสียงยังใช้ไม่ได้เลย และอยากให้ตั้งสำรองข้อมูลอัตโนมัติด้วยค่ะ'],
  workOrder: [
    { label: 'อาการ', value: 'Wi-Fi และเสียงยังไม่ทำงาน (ขาดไดรเวอร์)', fact: 'wo-ver-drivers' },
    { label: 'สิทธิ์', value: 'Windows 11 Pro ต้องเปิดใช้งานแล้ว' },
    { label: 'สำรองข้อมูล', value: 'ตั้ง Windows Backup', fact: 'wo-ver-backup' },
    { label: 'เข้าเครื่อง', value: 'ผู้ใช้ Ploy · PIN 2580' },
  ],
  phases: [
    {
      module: 'post11',
      pc: PC,
      edition: 'Windows 11 Pro',
      drivers: [
        { id: 'net', name: 'Network Controller', category: 'Other devices', update: 'Bloom Wireless - Network - 22.250.1.2' },
        { id: 'audio', name: 'Multimedia Audio Controller', category: 'Other devices', update: 'Bloom Audio - Sound - 6.0.9541.1' },
      ],
      backup: true,
      user: 'Ploy',
      pin: '2580',
    },
  ],
  reward: 130,
  minutes: 12,
  requires: 'w11-install',
  quiz: ['q-post-update', 'q-post-driver', 'q-post-list'],
  demo: [
    {
      title: 'ไดรเวอร์จากแหล่งที่เชื่อถือได้',
      say: 'ถ้า Device Manager มีเครื่องหมายเตือน พี่ไปที่ Windows Update > Advanced options > Optional updates > Driver updates ก่อน ถ้าไม่มีค่อยไปเว็บผู้ผลิต ไม่โหลดจากเว็บฝากไฟล์',
    },
  ],
  thanks: 'ครบทุกอย่างเลย ขอบคุณมากค่ะ จะบอกเพื่อน ๆ ให้มาใช้ร้านนี้!',
})
