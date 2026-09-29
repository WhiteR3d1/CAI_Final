import type { EvidenceRule } from '../../game/types'

export type DecisionId = 'std' | 'os' | 'edition' | 'arch'

export interface DecisionOption {
  value: string
  label: string
  sub?: string
  mistake?: string
}

export interface Decision {
  id: DecisionId
  title: string
  question: string
  options: DecisionOption[]
  correct: string
  rule: EvidenceRule
  ok: string
  /** feedback when the choice is right but evidence is missing/irrelevant */
  evidenceTip: string
}

export const DECISIONS: Decision[] = [
  {
    id: 'std',
    title: 'มาตรฐานของ OS',
    question: 'ควรใช้ระบบปฏิบัติการมาตรฐานแบบใด',
    options: [
      { value: 'closed', label: 'มาตรฐานปิด', sub: 'Proprietary · ต้องซื้อลิขสิทธิ์' },
      { value: 'open', label: 'มาตรฐานเปิด', sub: 'Open Standard · ใช้ฟรี แก้ไขได้', mistake: 'std-open' },
    ],
    correct: 'closed',
    rule: { groups: [['wo-app', 'wo-budget']] },
    ok: 'ถูกต้อง โปรแกรมบัญชีต้องใช้ Windows ซึ่งเป็นมาตรฐานปิด และลูกค้ามีงบซื้อลิขสิทธิ์',
    evidenceTip: 'หลักฐานที่ดีคือเรื่องโปรแกรมบัญชีที่ใช้ได้เฉพาะ Windows หรือเรื่องงบซื้อลิขสิทธิ์',
  },
  {
    id: 'os',
    title: 'ระบบปฏิบัติการ',
    question: 'จะติดตั้งระบบปฏิบัติการตัวใด',
    options: [
      { value: 'win10', label: 'Windows 10', sub: 'Microsoft · มาตรฐานปิด' },
      { value: 'ubuntu', label: 'Ubuntu', sub: 'Linux · มาตรฐานเปิด', mistake: 'os-linux' },
      { value: 'freebsd', label: 'FreeBSD', sub: 'แบบยูนิกซ์ · มาตรฐานเปิด', mistake: 'os-linux' },
      { value: 'ios', label: 'iOS', sub: 'Apple · อุปกรณ์พกพา', mistake: 'os-ios' },
      { value: 'android', label: 'Android', sub: 'Google · อุปกรณ์พกพา', mistake: 'os-android' },
    ],
    correct: 'win10',
    rule: { groups: [['wo-app']], acceptable: ['wo-budget'] },
    ok: 'ถูกต้อง โปรแกรมบัญชีของลูกค้าทำงานบน Windows เท่านั้น',
    evidenceTip: 'หลักฐานสำคัญคือโปรแกรมบัญชีรองรับเฉพาะ Windows',
  },
  {
    id: 'edition',
    title: 'รุ่นของ Windows 10',
    question: 'รุ่นใดตรงกับการใช้งานของสำนักงาน',
    options: [
      { value: 'home', label: 'Home', sub: 'ผู้ใช้ทั่วไป/ครอบครัว', mistake: 'ed-home' },
      { value: 'pro', label: 'Pro', sub: 'ธุรกิจ · Remote Desktop' },
      { value: 'enterprise', label: 'Enterprise', sub: 'องค์กรกลาง–ใหญ่', mistake: 'ed-enterprise' },
      { value: 'education', label: 'Education', sub: 'สถานศึกษา', mistake: 'ed-education' },
    ],
    correct: 'pro',
    rule: { groups: [['wo-remote', 'wo-secure']], acceptable: ['wo-staff'] },
    ok: 'ถูกต้อง Pro มี Remote Desktop และระบบปกป้องข้อมูลธุรกิจ เหมาะกับสำนักงานเล็ก',
    evidenceTip: 'หลักฐานที่ชี้ไปที่รุ่น Pro คือความต้องการรีโมตเข้าเครื่องและความปลอดภัยของข้อมูล',
  },
  {
    id: 'arch',
    title: 'สถาปัตยกรรม',
    question: 'ติดตั้งแบบกี่บิต',
    options: [
      { value: '32', label: '32 บิต', sub: 'x86', mistake: 'arch-32' },
      { value: '64', label: '64 บิต', sub: 'x64' },
    ],
    correct: '64',
    rule: { groups: [['hw-ram', 'hw-cpu']] },
    ok: 'ถูกต้อง RAM 8 GB มากกว่า 4 GB และซีพียูรองรับ 64 บิต',
    evidenceTip: 'ใช้ข้อมูลหน่วยความจำหรือซีพียูจากหน้า Main ของ BIOS เป็นหลักฐาน',
  },
]

export interface Requirement {
  id: string
  need: string
  answer: DecisionId
}

export const REQUIREMENTS: Requirement[] = [
  { id: 'r-app', need: 'ใช้โปรแกรมบัญชีที่รองรับเฉพาะ Windows ได้', answer: 'os' },
  { id: 'r-remote', need: 'รีโมตเข้าเครื่องจากบ้านได้', answer: 'edition' },
  { id: 'r-secure', need: 'ปกป้องข้อมูลลูกค้าที่เป็นความลับ', answer: 'edition' },
  { id: 'r-ram', need: 'ใช้หน่วยความจำ 8 GB ได้เต็มที่', answer: 'arch' },
]

export const ANSWER_LABEL: Record<DecisionId, string> = {
  std: 'มาตรฐานปิด',
  os: 'Windows 10',
  edition: 'รุ่น Pro',
  arch: '64 บิต',
}
