// Data shared by the installer screens (kept out of component files for React fast refresh).

/** The three partition-scheme options named in the content sheet (page 2–3). */
export type Scheme = 'mbr-bios' | 'mbr-uefi' | 'gpt-uefi'

export const SCHEME_LABEL: Record<Scheme, string> = {
  'mbr-bios': 'MBR partition scheme for BIOS or UEFI computers',
  'mbr-uefi': 'MBR partition scheme for UEFI computer',
  'gpt-uefi': 'GPT partition scheme for UEFI computer',
}

export interface RufusDevice {
  id: string
  label: string
}

export interface RufusIso {
  name: string
  size: string
  kind: 'windows' | 'ubuntu' | 'office'
  /** volume label Rufus copies from the image */
  label: string
}

export interface RufusConfig {
  device: string
  /** null when "Create a bootable disk using" is unchecked or set to FreeDOS */
  iso: RufusIso | null
  /** what "Create a bootable disk using" produces */
  boot: 'iso' | 'freedos' | 'none'
  scheme: Scheme
  fileSystem: string
  cluster: string
  label: string
  quickFormat: boolean
  badBlocks: boolean
}

export const ISO_FILES: RufusIso[] = [
  { name: 'Win10_22H2_Thai_x32x64.iso', size: '5.6 GB', kind: 'windows', label: 'CCCOMA_X86FRE_TH-TH_DV9' },
  { name: 'ubuntu-20.04.6-desktop-amd64.iso', size: '4.1 GB', kind: 'ubuntu', label: 'Ubuntu 20.04.6 LTS amd64' },
  { name: 'Office_2019_Setup.iso', size: '3.2 GB', kind: 'office', label: 'OFFICE2019' },
]

/** text-mode POST of the old lab PC (jobs 02–03); the memory test line is added by PostScreen */
export const LAB_POST_LINES = [
  'Bloom Firmware BIOS v02.61 (C) 2008',
  'BLOOM G41M-P28 BIOS Date: 04/12/09',
  '',
  'CPU : Bloom Core 2 Duo E7500 @ 2.93GHz',
  ' Speed : 2.93 GHz',
  '',
]

/** how long Windows Update takes from "Check for updates" to "Restart required", in ms */
export const UPDATE_MS = 10000

/** Rufus version shown in the simulation: the one in the content sheet's figures. */
export const RUFUS_VERSION = '1.4.12.535'
export const RUFUS_FILE = 'rufus-1.4.12.exe'

/** A partition row in Windows Setup ("Where do you want to install Windows?"). Sizes are in GB. */
export interface Part {
  id: string
  label: string
  size: number
  free: number
  type: string
  kind: 'sys' | 'msr' | 'win' | 'rec' | 'data' | 'unalloc' | 'primary'
}

export interface SetupLang {
  language: string
  time: string
  keyboard: string
}

export interface PrivacyChoice {
  id: string
  label: string
  hint: string
  on: boolean
}

export const PRIVACY_DEFAULTS: PrivacyChoice[] = [
  { id: 'speech', label: 'Speech recognition', hint: 'สั่งงานด้วยเสียง', on: true },
  { id: 'location', label: 'Location', hint: 'ให้แอปรู้ตำแหน่งของเครื่อง', on: true },
  { id: 'find', label: 'Find my device', hint: 'ช่วยหาเครื่องเมื่อหาย', on: true },
  { id: 'diagnostic', label: 'Diagnostic data (Full)', hint: 'ส่งข้อมูลการใช้งานแบบละเอียด', on: true },
  { id: 'inking', label: 'Inking & typing', hint: 'ส่งข้อมูลการพิมพ์/เขียนเพื่อปรับปรุง', on: true },
  { id: 'tailored', label: 'Tailored experiences', hint: 'แนะนำเนื้อหาตามข้อมูลการใช้งาน', on: true },
  { id: 'ads', label: 'Advertising ID', hint: 'ใช้ติดตามเพื่อแสดงโฆษณา', on: true },
]
