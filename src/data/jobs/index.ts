import type { JobDef, JobId, Track } from '../../game/types.ts'
import { biosBootJob } from './biosBoot.ts'
import { firstSetupJob } from './firstSetup.ts'
import { installNewJob } from './installNew.ts'
import { makeUsbJob } from './makeUsb.ts'
import { reinstallJob } from './reinstall.ts'
import { w11CheckJob } from './w11Check.ts'
import { w11InstallJob, w11UefiJob, w11UsbJob, w11VerifyJob } from './w11Story.ts'
import { microsoftInstallJob } from './microsoftInstall.ts'
import { CHALLENGES } from './challenges.ts'

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
    title: 'Windows 10 · ฝึกพื้นฐานและงานท้าทาย',
    subtitle: 'ฝึก Rufus/BIOS → ติดตั้งและตั้งค่า → ฝึกผ่าน Microsoft → งานท้าทายรับเหรียญ',
    sheet: 'ใบเนื้อหา Win10 (15 หน้า)',
  },
  {
    id: 'win11',
    title: 'Windows 11 · UEFI',
    subtitle: 'ตรวจความพร้อม → Media Creation Tool → UEFI/Secure Boot/TPM → ติดตั้งและตรวจหลังติดตั้ง → งานท้าทายรับเหรียญ',
    sheet: 'ใบเนื้อหา Win11 (10 หน้า)',
  },
]

// Win10 follows its content sheet in order: USB (p.1–3) → BIOS (p.3–6) → install (p.6–11) → setup & update (p.11–15) → capstone.
// Win11 follows its sheet's six topics: readiness & backup (p.1–2) → files & USB (p.2–3) → UEFI (p.4–5) → Setup & OOBE (p.5–8) → checks (p.8–10).
// Challenge jobs (order 101+) unlock after the story job that teaches their topic.
export const JOBS: JobDef[] = [
  makeUsbJob,
  biosBootJob,
  installNewJob,
  firstSetupJob,
  microsoftInstallJob,
  reinstallJob,
  w11CheckJob,
  w11UsbJob,
  w11UefiJob,
  w11InstallJob,
  w11VerifyJob,
  ...CHALLENGES,
]

export const JOB_BY_ID = Object.fromEntries(JOBS.map(j => [j.id, j])) as Record<JobId, JobDef>

export const jobsOf = (track: Track) => JOBS.filter(j => j.track === track).sort((a, b) => a.order - b.order)
