import type { JobDef, JobId, Track } from '../../game/types.ts'
import { biosBootJob } from './biosBoot.ts'
import { firstSetupJob } from './firstSetup.ts'
import { installNewJob } from './installNew.ts'
import { makeUsbJob } from './makeUsb.ts'
import { reinstallJob } from './reinstall.ts'
import { w11CheckJob } from './w11Check.ts'

export interface TrackInfo {
  id: Track
  title: string
  subtitle: string
  sheet: string
}

/** Two tracks, playable in any order (user's choice, 23 Oct 2026). */
export const TRACKS: TrackInfo[] = [
  {
    id: 'win10',
    title: 'Windows 10 · Legacy BIOS',
    subtitle: 'ทำ USB ด้วย Rufus → ตั้ง BIOS → ติดตั้งและตั้งค่า Windows 10',
    sheet: 'ใบเนื้อหา Win10 (15 หน้า)',
  },
  {
    id: 'win11',
    title: 'Windows 11 · UEFI',
    subtitle: 'ตรวจความพร้อม → Media Creation Tool → UEFI/Secure Boot/TPM → ติดตั้งและตรวจหลังติดตั้ง',
    sheet: 'ใบเนื้อหา Win11 (10 หน้า)',
  },
]

// Win10 follows its content sheet in order: USB (p.1–3) → BIOS (p.3–6) → install (p.6–11) → setup & update (p.11–15) → capstone.
// Win11 follows its sheet's six topics: readiness & backup (p.1–2) → files & USB (p.2–3) → UEFI (p.4–5) → Setup & OOBE (p.5–8) → checks (p.8–10).
export const JOBS: JobDef[] = [makeUsbJob, biosBootJob, installNewJob, firstSetupJob, reinstallJob, w11CheckJob]

export const JOB_BY_ID = Object.fromEntries(JOBS.map(j => [j.id, j])) as Record<JobId, JobDef>

export const jobsOf = (track: Track) => JOBS.filter(j => j.track === track).sort((a, b) => a.order - b.order)
