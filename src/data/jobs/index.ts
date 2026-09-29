import type { JobDef, JobId } from '../../game/types.ts'
import { biosBootJob } from './biosBoot.ts'
import { firstSetupJob } from './firstSetup.ts'
import { installNewJob } from './installNew.ts'
import { makeUsbJob } from './makeUsb.ts'
import { reinstallJob } from './reinstall.ts'

// Jobs follow the content sheet in order: USB (p.1–3) → BIOS (p.3–6) → install (p.6–11) → setup & update (p.11–15) → capstone.
export const JOBS: JobDef[] = [makeUsbJob, biosBootJob, installNewJob, firstSetupJob, reinstallJob]

export const JOB_BY_ID = Object.fromEntries(JOBS.map(j => [j.id, j])) as Record<JobId, JobDef>
