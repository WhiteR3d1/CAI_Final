import type { JobDef } from './types.ts'

export function learningMode(job: JobDef): 'guided' | 'challenge' {
  return job.mode ?? (job.track === 'win10' && job.order <= 4 ? 'guided' : 'challenge')
}

export function coaching(job: JobDef, stage: string): string[] {
  return learningMode(job) === 'guided' ? job.hints[stage] ?? [] : []
}
