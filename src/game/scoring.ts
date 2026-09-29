import type { CriterionId, JobDef, JobResult, RunSummary, Severity } from './types.ts'

/** How much one mistake lowers the criterion it belongs to (criteria are 0..1). */
export const PENALTY: Record<CriterionId, Record<Severity, number>> = {
  accuracy: { minor: 0.1, major: 0.25, critical: 0.4 },
  reasoning: { minor: 0.1, major: 0.2, critical: 0.3 },
  dataSafety: { minor: 0.2, major: 0.5, critical: 1 },
  testing: { minor: 0.1, major: 0.25, critical: 0.4 },
}

export const CRITERION_LABEL: Record<CriterionId, string> = {
  accuracy: 'ความถูกต้อง',
  reasoning: 'เหตุผลและหลักฐาน',
  dataSafety: 'การรักษาข้อมูลและความปลอดภัย',
  testing: 'การทดสอบหลังแก้',
}

const clamp01 = (n: number) => Math.min(1, Math.max(0, n))
const round2 = (n: number) => Math.round(n * 100) / 100

function firstAttempts(list: RunSummary['reasons']) {
  const seen = new Map<string, boolean>()
  for (const r of list) if (!seen.has(r.id)) seen.set(r.id, r.ok)
  return [...seen.values()]
}

export function criterionScores(job: JobDef, run: RunSummary): Partial<Record<CriterionId, number>> {
  const penalties: Record<CriterionId, number> = { accuracy: 0, reasoning: 0, dataSafety: 0, testing: 0 }
  for (const id of new Set(run.mistakes)) {
    const def = job.mistakes[id]
    if (def) penalties[def.criterion] += PENALTY[def.criterion][def.severity]
  }

  const out: Partial<Record<CriterionId, number>> = {}
  for (const c of job.criteria) {
    let base = 1
    if (c === 'reasoning') {
      const reasons = firstAttempts(run.reasons)
      const total = reasons.length + run.quiz.length
      const ok = reasons.filter(Boolean).length + run.quiz.filter(q => q.firstTry).length
      base = total === 0 ? 1 : ok / total
    } else if (c === 'testing') {
      const required = job.checks.filter(ch => ch.required)
      base = required.length === 0 ? 1 : required.filter(ch => run.checks.includes(ch.id)).length / required.length
    }
    out[c] = round2(clamp01(base - penalties[c]))
  }
  return out
}

export function coinsFor(reward: number, stars: 1 | 2 | 3): number {
  return Math.round((reward * stars) / 3 / 10) * 10
}

export function scoreRun(job: JobDef, run: RunSummary, finishedAt: string): JobResult {
  const criteria = criterionScores(job, run)
  const values = job.criteria.map(c => criteria[c] ?? 0)
  const score = Math.round((100 * values.reduce((a, b) => a + b, 0)) / Math.max(1, values.length))
  const mistakes = [...new Set(run.mistakes)].filter(id => job.mistakes[id])
  const critical = mistakes.some(id => job.mistakes[id].severity === 'critical')
  const stars: 1 | 2 | 3 = score >= 85 && !critical ? 3 : score >= 60 ? 2 : 1
  const objectives = job.objectives.map(o => ({
    id: o.id,
    passed: o.rules.every(r => (criteria[r.criterion] ?? 0) >= r.min),
  }))
  return {
    finishedAt,
    score,
    criteria,
    stars,
    objectives,
    mistakes,
    hintsUsed: run.hintsUsed,
    coinsEarned: coinsFor(job.reward, stars),
  }
}
