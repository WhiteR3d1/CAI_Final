import type { EvidenceRule } from './types.ts'

export type EvidenceVerdict = 'ok' | 'missing' | 'irrelevant'

export function judgeEvidence(attached: readonly string[], rule: EvidenceRule): EvidenceVerdict {
  if (rule.groups.some(group => !group.some(id => attached.includes(id)))) return 'missing'
  const allowed = new Set([...rule.groups.flat(), ...(rule.acceptable ?? [])])
  if (attached.some(id => !allowed.has(id))) return 'irrelevant'
  return 'ok'
}
