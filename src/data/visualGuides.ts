import type { JobId } from '../game/types.ts'

export interface VisualGuide {
  title: string
  window: string
  theme: 'windows' | 'bios' | 'web'
  rows: string[]
  target: number
  action: string
  why: string
  key?: string
}

function screen(title: string, window: string, rows: string[], target: number, action: string, why: string, theme: VisualGuide['theme'] = 'windows', key?: string): VisualGuide {
  return { title, window, rows, target, action, why, theme, key }
}

// Original schematic drawings based on the game's UI, not screenshots copied from the course PDF.
export const VISUALS = {
  rufusDownload: screen('ดาวน์โหลดจากแหล่งของโปรแกรม', 'Browser · rufus.ie', ['Rufus — Create bootable USB drives', 'Download', 'rufus-1.4.12.exe', 'Downloads → เปิดไฟล์หลังตรวจ USB'], 2, 'เลือกไฟล์ Rufus จากเว็บของโปรแกรม', 'ใช้แหล่งที่เชื่อถือได้ และตรวจ USB ก่อนเปิดโปรแกรม รุ่นในภาพตรงกับเกม', 'web'),
  usb: screen('ตรวจชื่อและขนาดแฟลชไดรฟ์', 'File Explorer · This PC', ['Local Disk (C:)', 'SHOP-TOOLS (E:) · 32 GB', 'KINGSTON (F:) · 16 GB', 'ตรวจว่าเป็นแฟลชไดรฟ์ว่างของลูกค้า'], 2, 'เปิด This PC แล้วเปิด KINGSTON 16 GB', 'ใช้ชื่อและขนาดเทียบกับใบงาน เพื่อไม่เลือกอุปกรณ์ของร้านผิด'),
  rufus: screen('ตั้ง Rufus ให้ตรงเครื่อง BIOS เก่า', 'Rufus 1.4 · ตัวอย่างงาน 01', ['Device: KINGSTON (F:) [16GB]', 'MBR partition scheme for BIOS or UEFI computers', 'File system: NTFS · Cluster size: 4096', 'Create bootable disk: ISO Image → Windows 10', 'START'], 1, 'เลือก MBR for BIOS or UEFI แล้วตรวจ Device และ ISO ก่อน START', 'งาน 01 ใช้เครื่อง BIOS เก่า ตัวเลือกที่รองรับเฉพาะ UEFI จะใช้กับโจทย์นี้ไม่ได้'),
  usbReady: screen('ตรวจไฟล์ใน USB หลังสร้างเสร็จ', 'File Explorer · USB ติดตั้ง Windows', ['boot', 'efi', 'sources', 'setup.exe'], 3, 'เปิดแฟลชไดรฟ์ที่สร้างเสร็จและตรวจไฟล์ติดตั้ง', 'ตรวจผลหลังทำงาน ไม่สรุปจากการกด START เพียงอย่างเดียว'),
  biosEnter: screen('เข้า BIOS ตอนเปิดเครื่อง', 'POST · คอมห้องแล็บ', ['Memory Test: 2048 MB OK', 'USB Device: KINGSTON DataTraveler', 'Press F2 to enter SETUP', 'Press F12 for Boot Menu'], 2, 'กด F2 ขณะหน้าจอเปิดเครื่องแสดงอยู่', 'ต้องเข้าการตั้งค่าก่อนเครื่องบูตต่อ ถ้าไม่ทันให้รีสตาร์ตแล้วลองใหม่', 'bios', 'F2'),
  biosOrder: screen('ให้แฟลชไดรฟ์เป็นลำดับแรก', 'BIOS Setup · Boot → Hard Disk Drives', ['1st Drive: USB: KINGSTON DT (16GB)', '2nd Drive: SATA: Hard Disk', '↑ ↓ เลื่อนตัวเลือก · Enter เลือก', 'F10 Save and Exit'], 0, 'ใช้ปุ่มลูกศรและ Enter ตั้ง 1st Drive เป็น USB', 'เครื่องจะลองบูตจากสื่อติดตั้งก่อนฮาร์ดดิสก์', 'bios', '↑ ↓ Enter'),
  biosSave: screen('บันทึกก่อนออกจาก BIOS', 'BIOS Setup · Save & Exit', ['Save configuration changes and exit now?', '[ OK ]        [ Cancel ]', 'Enter = Confirm'], 1, 'กด F10 เลือก OK แล้วกด Enter', 'ถ้าออกโดยไม่บันทึก ลำดับบูตใหม่จะไม่ถูกนำไปใช้', 'bios', 'F10 → Enter'),
  boot: screen('เลือกบูตแฟลชไดรฟ์', 'Please select boot device', ['SATA: Hard Disk', 'KINGSTON DataTraveler 16GB', 'Enter Setup'], 1, 'เลือก USB ด้วยปุ่มลูกศร แล้วกด Enter', 'ใช้เข้าสู่ตัวติดตั้งจากแฟลชไดรฟ์ แทนระบบเดิมในฮาร์ดดิสก์', 'bios', '↓ Enter'),
  architecture: screen('เลือกบิตตามใบงาน', 'Windows Boot Manager · งาน 03', ['Windows Setup (64-bit)', 'Windows Setup (32-bit)', 'ใบงาน: RAM 2 GB · เครื่องห้องแล็บ'], 1, 'ในงาน 03 เลือก Windows Setup (32-bit)', 'ตัวอย่างนี้อิงเครื่อง RAM 2 GB ในใบงาน อย่าใช้คำตอบนี้กับทุกเครื่อง', 'bios', '↓ Enter'),
  custom: screen('เลือกการติดตั้งแบบกำหนดเอง', 'Windows Setup · Which type of installation?', ['Upgrade: Install Windows and keep files…', 'Custom: Install Windows only (advanced)'], 1, 'เลือก Custom เมื่อบูตจาก USB เพื่อติดตั้งใหม่', 'เราต้องเลือกพาร์ทิชันปลายทางเอง และตรวจว่าตรงกับข้อมูลลูกค้า'),
  partition: screen('สร้างพาร์ทิชันบนดิสก์ใหม่', 'Windows Setup · Where do you want to install Windows?', ['Drive 0 Unallocated Space · 500 GB', 'New → Size: 102400 MB → Apply', 'เลือกพาร์ทิชัน Primary ที่สร้างแล้ว → Next'], 1, 'เลือกพื้นที่ว่าง กด New ใส่ขนาด แล้ว Apply', 'แบ่งพื้นที่ติดตั้งตามใบงานก่อนเลือกพาร์ทิชันและกด Next'),
  restart: screen('หลังติดตั้ง รอให้เครื่องบูตต่อ', 'Windows Setup · Restarting', ['Windows needs to restart to continue', 'Press any key to boot from CD or DVD…', 'รอโดยไม่กดปุ่ม → บูต Windows ที่ติดตั้งแล้ว'], 2, 'ปล่อยให้เครื่องรีสตาร์ตและบูตต่อเอง', 'กดปุ่มที่ข้อความบูตจากสื่ออีกครั้งอาจวนกลับไปเริ่มติดตั้งใหม่', 'bios'),
  region: screen('เลือกภูมิภาคให้ตรงกับผู้ใช้', 'Windows OOBE · Is this the right region?', ['Taiwan', 'Tajikistan', 'Thailand', 'Yes'], 2, 'เลือก Thailand แล้วกด Yes', 'อ่านชื่อให้ครบก่อนยืนยัน เพราะชื่อประเทศใกล้กันอาจทำให้เลือกผิด'),
  account: screen('สร้างบัญชีในเครื่องตามใบงาน', 'Windows OOBE · Sign in with Microsoft', ['Email, phone, or Skype', 'Offline account', 'Limited experience → ชื่อผู้ใช้และรหัสผ่าน'], 1, 'เลือก Offline account แล้ว Limited experience', 'ใช้เมื่อลูกค้าระบุบัญชีในเครื่อง เช่น Lab01 ในงาน 04'),
  privacy: screen('เปิดเฉพาะสิทธิ์ที่ต้องใช้', 'Choose privacy settings for your device', ['Location: No', 'Advertising ID: No', 'ตรวจตัวเลือกอื่นตามใบงาน', 'Accept'], 0, 'งาน 04 ปิด Location และ Advertising ID แล้วตรวจตัวเลือกก่อน Accept', 'ตั้งความเป็นส่วนตัวตามความต้องการของลูกค้า ไม่กดยอมรับทุกค่าโดยไม่อ่าน'),
  update: screen('ตรวจอัปเดตจนจบกระบวนการ', 'Settings · Windows Update', ['Check for updates', 'Downloading / Installing updates', 'Restart now', "เปิดตรวจอีกครั้ง: You're up to date"], 0, 'Check for updates → รอ → Restart now → เปิดตรวจอีกครั้ง', 'การดาวน์โหลดเสร็จยังไม่เท่ากับติดตั้งเสร็จ ต้องตรวจผลหลังรีสตาร์ต'),
  backup: screen('สำรองข้อมูลไปอีกอุปกรณ์', 'File Explorer · ตัวอย่างเครื่องคุณเก่ง', ['PHOTOS (D:) → งานลูกค้า · 12,480 ไฟล์', 'คัดลอกไป SHOP-BACKUP (E:) · 2 TB', 'เปิดดูสำเนาในอุปกรณ์สำรอง'], 1, 'คัดลอกงานจาก D: ไปอุปกรณ์สำรองของร้าน', 'หากเลือกพาร์ทิชันผิดขณะติดตั้ง ยังมีสำเนาแยกจากดิสก์ต้นฉบับ'),
  gpt: screen('เครื่อง UEFI ใช้สื่อให้ตรงกับดิสก์', 'Rufus · ตัวอย่างงานท้าทายคุณเก่ง', ['Device: KINGSTON (F:) [16GB]', 'GPT partition scheme for UEFI computer', 'ISO Image: Windows 10', 'START'], 1, 'ตรวจใบงานแล้วเลือก GPT for UEFI ใน Rufus', 'เครื่องตัวอย่างนี้เป็น UEFI และดิสก์ 4 TB แบบ GPT จึงต่างจากงาน BIOS เก่า'),
  uefi: screen('บูตสื่อแบบ UEFI', 'Boot Menu · เครื่องคุณเก่ง', ['Windows Boot Manager (WDC 4TB)', 'UEFI: KINGSTON DataTraveler 16GB', 'Enter Setup'], 1, 'กด F12 แล้วเลือก UEFI: KINGSTON', 'ให้โหมดบูตตรงกับดิสก์ GPT ของเครื่องลูกค้า', 'bios', 'F12 → ↓ → Enter'),
  protect: screen('เลือกพาร์ทิชัน Windows ไม่แตะ PHOTOS', 'Windows Setup · เครื่องคุณเก่ง', ['Partition 1: System · 100 MB', 'Partition 3: Windows · 237.9 GB', 'Partition 5: PHOTOS · 3487.5 GB — ห้ามลบ'], 1, 'เลือกพาร์ทิชัน Windows เดิม ตรวจชื่อและขนาดก่อน Next', 'PHOTOS เป็นรูปงานลูกค้า ไม่ใช่พื้นที่ว่างสำหรับติดตั้ง'),
  microsoft: screen('เริ่มจากเว็บ Microsoft', 'Browser · www.microsoft.com/th-th/software-download/windows10', ['สร้างสื่อการติดตั้ง Windows 10', 'ดาวน์โหลดตอนนี้', 'MediaCreationTool_22H2.exe → เปิดเครื่องมือ'], 1, 'ตรวจโดเมน Microsoft แล้วกดดาวน์โหลดตอนนี้', 'เริ่มจากเครื่องมือของผู้ผลิต เพื่อเตรียมสื่อติดตั้งให้ลูกค้า', 'web'),
  mctTask: screen('สร้าง USB ให้เครื่องลูกค้า', 'Windows 10 Setup · What do you want to do?', ['○ Upgrade this PC now', '● Create installation media for another PC', 'Next'], 1, 'เลือก Create installation media for another PC แล้ว Next', 'Upgrade this PC now จะทำกับเครื่องร้านที่กำลังเปิดเครื่องมืออยู่'),
  mctOptions: screen('ไม่ใช้ค่าของเครื่องร้านแทนลูกค้า', 'Media Creation Tool · Language and architecture', ['☐ Use the recommended options for this PC', 'Language: ไทย', 'Edition: Windows 10', 'Architecture: 64-bit (x64)'], 0, 'เอาติ๊ก recommended options ออก แล้วเลือกตามใบงาน', 'เครื่องร้านใช้ English / 32-bit แต่โจทย์ลูกค้าต้องการภาษาไทยและ 64-bit'),
  mctUsb: screen('ตรวจ USB ก่อนเขียนข้อมูล', 'Media Creation Tool · Select a USB flash drive', ['USB flash drive · อย่างน้อย 8 GB', 'SHOP-BACKUP (E:) · 2 TB — มีข้อมูลสำรอง', 'KINGSTON (F:) · 16 GB — ว่างเปล่า', 'Next → รอ Your USB flash drive is ready'], 2, 'เลือก KINGSTON (F:) 16 GB และยืนยันหลังตรวจข้อมูล', 'ข้อมูลในอุปกรณ์ที่เลือกจะถูกลบ ห้ามใช้ไดรฟ์เก็บสำเนาลูกค้า'),
  readiness: screen('ตรวจความพร้อมจากหลายเครื่องมือ', 'Windows 11 · ตรวจเครื่องก่อนติดตั้ง', ['PC Health Check → ภาพรวมความพร้อม', 'msinfo32 → RAM / BIOS Mode / Secure Boot', 'tpm.msc → TPM specification version'], 0, 'เปิด PC Health Check แล้วตรวจรายละเอียดด้วยเครื่องมือที่เกี่ยวข้อง', 'ผลไม่ผ่านอาจเกิดจากการตั้งค่าหรือฮาร์ดแวร์ ต้องหาหลักฐานก่อนสรุป'),
  backup11: screen('ทดสอบไฟล์จากสำเนา', 'File Explorer · สำรองก่อนติดตั้ง Windows 11', ['โฟลเดอร์งานในเครื่องลูกค้า', 'คัดลอกไปอุปกรณ์สำรองที่แยกจากเครื่อง', 'เปิดไฟล์จากอุปกรณ์สำรองเพื่อตรวจ'], 2, 'เปิดไฟล์จากสำเนาหลังคัดลอกเสร็จ', 'มีชื่อไฟล์อย่างเดียวไม่พอ ต้องตรวจว่าสำเนาเปิดใช้งานได้'),
  bitlocker: screen('เก็บคีย์กู้คืนไว้นอกไดรฟ์ที่เข้ารหัส', 'BitLocker Drive Encryption', ['Back up your recovery key', 'Save to a file → อุปกรณ์สำรอง', 'อย่าเก็บไว้เฉพาะใน C: ที่เข้ารหัส'], 1, 'บันทึกคีย์กู้คืนไปที่เก็บแยกจากไดรฟ์ระบบ', 'ถ้าเข้า C: ไม่ได้ คีย์ที่เก็บอยู่ใน C: จะช่วยปลดล็อกไม่ได้'),
} satisfies Record<string, VisualGuide>

export type VisualId = keyof typeof VISUALS
export interface JobVisuals { stages: Record<string, VisualId[]>; demos: VisualId[] }

export const JOB_VISUALS: Partial<Record<JobId, JobVisuals>> = {
  'make-usb': { stages: { download: ['rufusDownload'], plug: ['usb'], rufus: ['rufus'], verify: ['usbReady'] }, demos: ['rufusDownload', 'usb', 'rufus'] },
  'bios-boot': { stages: { enter: ['biosEnter'], order: ['biosOrder'], save: ['biosSave'], test: ['boot'] }, demos: ['biosEnter', 'biosOrder', 'biosSave'] },
  'install-new': { stages: { boot: ['boot', 'architecture'], setup: ['custom'], disk: ['partition'], wait: ['restart'] }, demos: ['architecture', 'partition', 'restart'] },
  'first-setup': { stages: { region: ['region'], account: ['account'], privacy: ['privacy'], update: ['update'] }, demos: ['region', 'account', 'update'] },
  'microsoft-install': { stages: { backup: ['backup'], rufus: ['microsoft', 'mctTask', 'mctOptions', 'mctUsb'], bios: ['uefi'], setup: ['custom', 'protect', 'restart'], oobe: ['region', 'account', 'privacy'], verify: ['update'] }, demos: ['mctOptions'] },
  reinstall: { stages: { backup: ['backup'], rufus: ['gpt'], bios: ['uefi'], setup: ['custom', 'protect', 'restart'], oobe: ['region', 'account'], verify: ['update'] }, demos: ['gpt', 'protect'] },
  'w11-check': { stages: { spec: ['readiness'], decide: ['readiness'], backup: ['backup11'], key: ['bitlocker'] }, demos: ['readiness', 'backup11', 'bitlocker'] },
}

export function visualsFor(job: JobId, stage?: string): VisualId[] {
  const guide = JOB_VISUALS[job]
  if (!guide) return []
  return stage ? guide.stages[stage] ?? [] : [...new Set(Object.values(guide.stages).flat())]
}
