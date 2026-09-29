import type { JobDef, JobId, JobProgress, JobResult, SaveData, Settings } from './types.ts'

export function defaultSave(): SaveData {
  return {
    version: 3,
    coins: 0,
    owned: [],
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

/** Accepts anything read from storage and returns a valid save (unknown/old versions start fresh). */
export function normalizeSave(raw: unknown): SaveData {
  const base = defaultSave()
  if (!isObj(raw) || raw.version !== 3) return base
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
  return {
    version: 3,
    coins: num(raw.coins),
    owned: Array.isArray(raw.owned) ? raw.owned.filter((x): x is string => typeof x === 'string') : [],
    jobs,
    settings,
  }
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

export function reputation(save: SaveData): number {
  return Object.values(save.jobs).reduce((sum, p) => sum + (p?.best?.stars ?? 0), 0)
}

export function buyItem(save: SaveData, item: { id: string; price: number }): SaveData | null {
  if (save.owned.includes(item.id) || save.coins < item.price) return null
  return { ...save, coins: save.coins - item.price, owned: [...save.owned, item.id] }
}

// 5 jobs × 3 stars = 15 stars in total
export const LEVELS = [
  { min: 0, title: 'ช่างฝึกหัด' },
  { min: 5, title: 'ช่างประจำร้าน' },
  { min: 10, title: 'ช่างมือโปร' },
  { min: 14, title: 'หัวหน้าช่าง' },
] as const

export function shopLevel(rep: number) {
  let index = 0
  LEVELS.forEach((l, i) => {
    if (rep >= l.min) index = i
  })
  const next = LEVELS[index + 1]
  return { index, title: LEVELS[index].title, nextAt: next?.min ?? null }
}
