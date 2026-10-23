// Scenario data for "module" jobs: the four Windows 11 story jobs W11-02..05 and every challenge job.
// A job lists one or more phases; each phase is played by a module in src/sims/modules and has a fixed set
// of mistakes, checks and stages (src/data/modules.ts). Pure types only (no JSX) so tests can import them.

export type SchemeId = 'mbr-bios' | 'mbr-uefi' | 'gpt-uefi'

/** content sheet Win10 p.1–3: create a USB boot drive in Rufus */
export interface RufusPhase {
  module: 'rufus'
  devices: { id: string; label: string }[]
  /** device id that belongs to the customer's job */
  target: string
  scheme: SchemeId
  /** file name of the right Windows ISO */
  iso: string
  isos: { name: string; size: string; kind: 'windows' | 'ubuntu' | 'office'; label: string }[]
}

/** content sheet Win10 p.3–6: put the USB first in the legacy BIOS boot order and save with F10 */
export interface BootPhase {
  module: 'boot'
  info: { label: string; value: string }[]
  /** boot order as found when entering Setup */
  drives: string[]
  usb: string
}

export interface Part10 {
  id: string
  label: string
  size: number
  free: number
  type: string
  kind: 'sys' | 'msr' | 'win' | 'rec' | 'data' | 'unalloc' | 'primary'
}

/** content sheet Win10 p.6–11: Windows 10 Setup steps 1–9 */
export interface Setup10Phase {
  module: 'setup10'
  ramGb: number
  disk: 'new' | 'existing'
  parts: Part10[]
  bootMode: 'legacy' | 'uefi'
  diskStyle: 'mbr' | 'gpt'
  /** the key printed on the work order; none = digital licence ("I don't have a product key") */
  productKey?: string
  editions?: string[]
  edition?: string
}

/** content sheet Win10 p.11–14: setup steps 10–16 */
export interface Oobe10Phase {
  module: 'oobe10'
  region: string
  keyboard: string
  /** second layout to add, or null for Skip */
  second: string | null
  account: 'offline' | 'microsoft'
  /** offline account name */
  user?: string
  /** privacy switches the customer wants off */
  privacyOff: string[]
}

export interface HealthRowData {
  ok: boolean
  text: string
  detail: string
}

/** content sheet Win11 p.1: is this PC ready for Windows 11? */
export interface Ready11Phase {
  module: 'ready11'
  pc: string
  health: HealthRowData[]
  info: { label: string; value: string }[]
  tpmReady: boolean
  answer: 'ready' | 'firmware' | 'unsupported'
}

/** content sheet Win11 p.2–3: create the USB with the Media Creation Tool */
export interface MctPhase {
  module: 'mct'
  drives: { id: string; label: string; sizeGb: number; /** what is stored on it, when it is not a spare drive */ data?: string }[]
  target: string
  /** story job: start from the Microsoft download page (and a UAC prompt) */
  download?: boolean
  /** story job: safely remove and label the USB afterwards */
  eject?: boolean
}

export interface FirmwareState {
  secureBoot: boolean
  tpm: boolean
  csm: boolean
}

/** content sheet Win11 p.4–5: turn on UEFI security in the firmware and boot the USB in UEFI mode */
export interface Uefi11Phase {
  module: 'uefi11'
  start: FirmwareState
  usb: string
  disk: string
  info: { label: string; value: string }[]
  /** story job: check msinfo32 and Windows Security in the old Windows first */
  precheck?: boolean
}

export interface DiskPart11 {
  id: string
  disk: number
  label: string
  size: number
  free: number
  type: string
  kind: 'sys' | 'msr' | 'win' | 'rec' | 'data' | 'unalloc'
}

/** content sheet Win11 p.5–7: Windows 11 Setup up to the restart */
export interface Setup11Phase {
  module: 'setup11'
  parts: DiskPart11[]
  editions: string[]
  /** edition the licence covers */
  edition: string
  /** disk Windows must go to; every other disk must stay untouched */
  targetDisk: number
}

/** content sheet Win11 p.7–8: OOBE */
export interface Oobe11Phase {
  module: 'oobe11'
  region: string
  keyboard: string
  second: string | null
  networks: { ssid: string; secured: boolean }[]
  wifi: { ssid: string; password: string }
  setup: 'personal' | 'work'
  email: string
  privacyOff: string[]
}

/** content sheet Win11 p.8–10: checks after installing */
export interface Post11Phase {
  module: 'post11'
  pc: string
  edition: string
  /** devices without a driver; they are fixed through Optional updates > Driver updates */
  drivers: { id: string; name: string; category: string; update: string }[]
  firewallOff?: boolean
  /** the customer wants Windows Backup turned on */
  backup?: boolean
  user: string
  pin: string
}

export type Phase = RufusPhase | BootPhase | Setup10Phase | Oobe10Phase | Ready11Phase | MctPhase | Uefi11Phase | Setup11Phase | Oobe11Phase | Post11Phase
export type ModuleId = Phase['module']
