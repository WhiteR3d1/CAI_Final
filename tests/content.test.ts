import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { JOBS, JOB_BY_ID } from '../src/data/jobs/index.ts'
import { MANUAL } from '../src/data/manual.ts'
import type { JobId, Track } from '../src/game/types.ts'

const SIM_DIRS: Record<JobId, string> = {
  'make-usb': 'src/sims/makeUsb',
  'bios-boot': 'src/sims/biosBoot',
  'install-new': 'src/sims/installNew',
  'first-setup': 'src/sims/firstSetup',
  reinstall: 'src/sims/reinstall',
  'w11-check': 'src/sims/w11Check',
}

// evidence ids: wo- = work order, fe- = File Explorer, bs- = BIOS screen, si- = system tools (PC Health Check, msinfo32, tpm.msc, Settings, Windows Security)
const EVIDENCE_ID = /['"]((?:wo|fe|bs|si)-[a-z0-9-]+)['"]/g

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

const SHEET: Record<Track, string> = { win10: 'ใบเนื้อหา Win10', win11: 'ใบเนื้อหา Win11' }

describe('manual', () => {
  it('covers the parts of both content sheets in order and links real jobs of the same track', () => {
    assert.deepEqual(
      MANUAL.map(u => u.no),
      [1, 2, 3, 4, 5, 6, 7, 8, 9, 10],
    )
    assert.deepEqual(
      MANUAL.map(u => u.track),
      ['win10', 'win10', 'win10', 'win10', 'win10', 'win11', 'win11', 'win11', 'win11', 'win11'],
    )
    for (const u of MANUAL) {
      assert.ok(u.pages.startsWith(`${SHEET[u.track]} หน้า `), `part ${u.no} pages "${u.pages}"`)
      for (const id of u.jobs) {
        assert.ok(JOB_BY_ID[id], `part ${u.no} links unknown job ${id}`)
        assert.equal(JOB_BY_ID[id].track, u.track, `part ${u.no} links ${id} from the other track`)
      }
    }
  })

  it('gives every job a manual part of its track that exists and is linked back', () => {
    for (const job of JOBS) {
      const part = MANUAL.find(u => u.no === job.manualNo)
      assert.ok(part, `${job.id} opens missing manual part ${job.manualNo}`)
      assert.equal(part.track, job.track, `${job.id} opens a manual part of the other track`)
      assert.ok(MANUAL.some(u => u.jobs.includes(job.id)), `${job.id} is not listed in any manual part`)
    }
  })

  it('cites the content sheet of its own track in every job', () => {
    for (const job of JOBS) {
      const sheet = SHEET[job.track]
      const page = new RegExp(`^${sheet} หน้า \\d`)
      assert.ok(job.learn.refs.every(r => r.includes(sheet)), `${job.id} has a reference outside its content sheet`)
      for (const [id, m] of Object.entries(job.mistakes)) if (m.ref) assert.match(m.ref, page, `${job.id}/${id}`)
      for (const q of job.quiz) if (q.ref) assert.match(q.ref, page, `${job.id}/${q.id}`)
    }
  })
})
