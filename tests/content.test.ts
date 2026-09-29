import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { JOBS, JOB_BY_ID } from '../src/data/jobs/index.ts'
import { MANUAL } from '../src/data/manual.ts'
import type { JobId } from '../src/game/types.ts'

const SIM_DIRS: Record<JobId, string> = {
  'make-usb': 'src/sims/makeUsb',
  'bios-boot': 'src/sims/biosBoot',
  'install-new': 'src/sims/installNew',
  'first-setup': 'src/sims/firstSetup',
  reinstall: 'src/sims/reinstall',
}

// evidence ids: wo- = work order, fe- = File Explorer, bs- = BIOS screen
const EVIDENCE_ID = /['"]((?:wo|fe|bs)-[a-z0-9-]+)['"]/g

function simSource(id: JobId) {
  const dir = SIM_DIRS[id]
  return readdirSync(dir)
    .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
    .map(f => readFileSync(join(dir, f), 'utf8'))
    .join('\n')
}

const matches = (src: string, re: RegExp) => [...src.matchAll(re)].map(m => m[1])

describe('job data', () => {
  for (const job of JOBS) {
    describe(job.id, () => {
      it('has consistent stages, hints, checks and objectives', () => {
        const stageIds = job.stages.map(s => s.id)
        for (const key of Object.keys(job.hints)) assert.ok(stageIds.includes(key), `hint stage "${key}" is not a stage`)
        assert.equal(new Set(job.checks.map(c => c.id)).size, job.checks.length, 'duplicate check ids')
        for (const o of job.objectives) for (const r of o.rules) assert.ok(job.criteria.includes(r.criterion), `objective uses ${r.criterion}`)
        if (job.requires) assert.ok(JOB_BY_ID[job.requires], 'requires an unknown job')
      })

      it('has pinnable work-order facts defined as evidence', () => {
        for (const row of job.workOrder) if (row.fact) assert.ok(job.evidence[row.fact], `missing evidence ${row.fact}`)
      })

      it('has exactly one correct answer per quiz question', () => {
        for (const q of job.quiz) assert.equal(q.choices.filter(c => c.correct).length, 1, q.id)
      })

      it('only references ids that exist in the job definition', () => {
        const src = simSource(job.id)
        for (const id of matches(src, /mistake\(\s*'([a-z0-9-]+)'/g)) assert.ok(job.mistakes[id], `unknown mistake "${id}"`)
        for (const id of matches(src, /mistake:\s*'([a-z0-9-]+)'/g)) assert.ok(job.mistakes[id], `unknown mistake "${id}"`)
        for (const id of matches(src, /(?:check|hasCheck)\(\s*'([a-z0-9-]+)'/g)) assert.ok(job.checks.some(c => c.id === id), `unknown check "${id}"`)
        for (const id of matches(src, /setStage\(\s*'([a-z]+)'/g)) assert.ok(job.stages.some(s => s.id === id), `unknown stage "${id}"`)
        for (const id of matches(src, EVIDENCE_ID)) assert.ok(job.evidence[id], `unknown evidence "${id}"`)
      })

      it('uses every evidence item it defines', () => {
        const used = new Set([...matches(simSource(job.id), EVIDENCE_ID), ...job.workOrder.flatMap(r => (r.fact ? [r.fact] : []))])
        for (const id of Object.keys(job.evidence)) assert.ok(used.has(id), `evidence "${id}" is never shown`)
      })

      it('can be reached by every required check', () => {
        const src = simSource(job.id)
        for (const c of job.checks) assert.match(src, new RegExp(`check\\(\\s*'${c.id}'`), `nothing records check "${c.id}"`)
      })
    })
  }
})

describe('manual', () => {
  it('covers the five parts of the content sheet in order and links real jobs', () => {
    assert.deepEqual(
      MANUAL.map(u => u.no),
      [1, 2, 3, 4, 5],
    )
    for (const u of MANUAL) for (const id of u.jobs) assert.ok(JOB_BY_ID[id], `part ${u.no} links unknown job ${id}`)
  })

  it('gives every job a manual part that exists and is linked back', () => {
    for (const job of JOBS) {
      const part = MANUAL.find(u => u.no === job.manualNo)
      assert.ok(part, `${job.id} opens missing manual part ${job.manualNo}`)
      assert.ok(MANUAL.some(u => u.jobs.includes(job.id)), `${job.id} is not listed in any manual part`)
    }
  })

  it('cites the content sheet in every job', () => {
    for (const job of JOBS) {
      assert.ok(job.learn.refs.every(r => r.includes('ใบเนื้อหา')), `${job.id} has a reference outside the content sheet`)
      for (const [id, m] of Object.entries(job.mistakes)) if (m.ref) assert.match(m.ref, /^ใบเนื้อหา หน้า \d/, `${job.id}/${id}`)
    }
  })
})
