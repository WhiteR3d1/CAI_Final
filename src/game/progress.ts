import { defaultDecor, migrateOwned, normalizeShop } from './decor.ts'
import type { JobDef, JobId, JobProgress, JobResult, SaveData, Settings, Track } from './types.ts'

export function defaultSave(): SaveData {
  return {
    version: 4,
    coins: 0,
    inventory: {},
    decor: defaultDecor(),
    jobs: {},
    settings: { sfx: true, unlockAll: false, playerName: '' },
  }
}

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null
const num = (v: unknown, fallback = 0) => (typeof v === 'number' && Number.isFinite(v) && v >= 0 ? Math.floor(v) : fallback)

function cleanResult(v: unknown): JobResult | undefined {
  if (!isObj(v) || typeof v.score !== 'number' || typeof v.finishedAt !== 'string') return undefined
  const stars = v.stars === 1 || v.stars === 2 || v.stars === 3 ? v.stars : 1
  return {
    finishedAt: v.finishedAt,
    score: Math.min(100, num(v.score)),
    criteria: isObj(v.criteria) ? (v.criteria as JobResult['criteria']) : {},
    stars,
    objectives: Array.isArray(v.objectives) ? (v.objectives as JobResult['objectives']) : [],
    mistakes: Array.isArray(v.mistakes) ? v.mistakes.filter((m): m is string => typeof m === 'string') : [],
    hintsUsed: num(v.hintsUsed),
    coinsEarned: num(v.coinsEarned),
  }
}

/**
 * Accepts anything read from storage and returns a valid save.
 * v3 (five fixed decorations) is migrated; unknown/older versions start fresh.
 */
export function normalizeSave(raw: unknown): SaveData {
  const base = defaultSave()
  if (!isObj(raw) || (raw.version !== 3 && raw.version !== 4)) return base
  const jobs: SaveData['jobs'] = {}
  if (isObj(raw.jobs)) {
    for (const [id, value] of Object.entries(raw.jobs)) {
      if (!isObj(value)) continue
      jobs[id as JobId] = {
        attempts: num(value.attempts),
        completions: num(value.completions),
        paid: num(value.paid),
        best: cleanResult(value.best),
        last: cleanResult(value.last),
      }
    }
  }
  const s = isObj(raw.settings) ? raw.settings : {}
  const settings: Settings = {
    sfx: typeof s.sfx === 'boolean' ? s.sfx : base.settings.sfx,
    unlockAll: typeof s.unlockAll === 'boolean' ? s.unlockAll : base.settings.unlockAll,
    playerName: typeof s.playerName === 'string' ? s.playerName.slice(0, 60) : '',
  }
  const shop = raw.version === 3 ? migrateOwned(raw.owned) : normalizeShop(raw.inventory, raw.decor)
  return { version: 4, coins: num(raw.coins), ...shop, jobs, settings }
}

export function jobProgress(save: SaveData, id: JobId): JobProgress {
  return save.jobs[id] ?? { attempts: 0, completions: 0, paid: 0 }
}

export function startAttempt(save: SaveData, id: JobId): SaveData {
  const prev = jobProgress(save, id)
  return { ...save, jobs: { ...save.jobs, [id]: { ...prev, attempts: prev.attempts + 1 } } }
}

/** Records a finished run. Coins are only paid for improvement, so replays cannot farm money. */
export function applyResult(save: SaveData, job: JobDef, result: JobResult): { save: SaveData; paid: number } {
  const prev = jobProgress(save, job.id)
  const paid = Math.max(0, Math.min(job.reward, result.coinsEarned) - prev.paid)
  const better =
    !prev.best || result.score > prev.best.score || (result.score === prev.best.score && result.stars > prev.best.stars)
  const next: JobProgress = {
    ...prev,
    completions: prev.completions + 1,
    paid: prev.paid + paid,
    best: better ? result : prev.best,
    last: result,
  }
  return { save: { ...save, coins: save.coins + paid, jobs: { ...save.jobs, [job.id]: next } }, paid }
}

export function isUnlocked(save: SaveData, job: JobDef): boolean {
  if (save.settings.unlockAll || !job.requires) return true
  return jobProgress(save, job.requires).completions > 0
}

/** the track of the most recently finished job (null before any job is finished) */
export function lastTrack(save: SaveData, jobs: JobDef[]): Track | null {
  let latest: { at: string; track: Track } | null = null
  for (const j of jobs) {
    const at = save.jobs[j.id]?.last?.finishedAt
    if (at && (!latest || at > latest.at)) latest = { at, track: j.track }
  }
  return latest?.track ?? null
}

/** the first unlocked job not yet finished, looking in the preferred track first */
export function nextJob(save: SaveData, jobs: JobDef[], prefer: Track = 'win10'): JobDef | undefined {
  const open = (j: JobDef) => isUnlocked(save, j) && jobProgress(save, j.id).completions === 0
  const sorted = [...jobs].sort((a, b) => a.order - b.order)
  return sorted.find(j => j.track === prefer && open(j)) ?? sorted.find(open)
}

export function reputation(save: SaveData): number {
  return Object.values(save.jobs).reduce((sum, p) => sum + (p?.best?.stars ?? 0), 0)
}

// Shop levels over the best stars of all jobs (35 jobs × 3 = 105 stars: story jobs of both tracks + challenges).
// Shop levels also unlock special decorations (DecorItem.level is an index into this list).
export const LEVELS = [
  { min: 0, title: 'ช่างฝึกหัด' },
  { min: 15, title: 'ช่างประจำร้าน' },
  { min: 35, title: 'ช่างมือโปร' },
  { min: 60, title: 'หัวหน้าช่าง' },
  { min: 90, title: 'เจ้าของร้านระดับตำนาน' },
] as const

export function shopLevel(rep: number) {
  let index = 0
  LEVELS.forEach((l, i) => {
    if (rep >= l.min) index = i
  })
  const next = LEVELS[index + 1]
  return { index, title: LEVELS[index].title, nextAt: next?.min ?? null }
}
