import assert from 'node:assert/strict'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'
import { describe, it } from 'node:test'
import { DECOR } from '../src/data/decor.ts'
import { JOBS, JOB_BY_ID } from '../src/data/jobs/index.ts'
import { MANUAL } from '../src/data/manual.ts'
import { MODULES } from '../src/data/modules.ts'
import type { ModuleId } from '../src/game/scenarios.ts'
import type { JobDef, JobId, Track } from '../src/game/types.ts'

// jobs with their own sim folder; module jobs (job.phases) are played by src/sims/modules
const SIM_DIRS: Partial<Record<JobId, string>> = {
  'make-usb': 'src/sims/makeUsb',
  'bios-boot': 'src/sims/biosBoot',
  'install-new': 'src/sims/installNew',
  'first-setup': 'src/sims/firstSetup',
  reinstall: 'src/sims/reinstall',
  'w11-check': 'src/sims/w11Check',
  'microsoft-install': 'src/sims/microsoftInstall',
}

// evidence ids: wo- = work order, fe- = File Explorer, bs- = BIOS screen, si- = system tools (PC Health Check, msinfo32, tpm.msc, Settings, Windows Security)
const EVIDENCE_ID = /['"]((?:wo|fe|bs|si)-[a-z0-9-]+)['"]/g

const MODULE_FILES: Record<ModuleId, string> = {
  rufus: 'src/sims/modules/RufusModule.tsx',
  boot: 'src/sims/modules/BootModule.tsx',
  setup10: 'src/sims/modules/Setup10Module.tsx',
  oobe10: 'src/sims/modules/Oobe10Module.tsx',
  ready11: 'src/sims/modules/Ready11Module.tsx',
  mct: 'src/sims/modules/MctModule.tsx',
  uefi11: 'src/sims/modules/Uefi11Module.tsx',
  setup11: 'src/sims/modules/Setup11Module.tsx',
  oobe11: 'src/sims/modules/Oobe11Module.tsx',
  post11: 'src/sims/modules/Post11Module.tsx',
}

function dirSource(id: JobId): string {
  const dir = SIM_DIRS[id]
  assert.ok(dir, `${id} has neither a sim folder nor phases`)
  const own = readdirSync(dir)
    .filter(f => f.endsWith('.ts') || f.endsWith('.tsx'))
    .map(f => readFileSync(join(dir, f), 'utf8'))
    .join('\n')
  return id === 'microsoft-install' ? own + '\n' + dirSource('reinstall') : own
}

function simSource(job: JobDef): string {
  if (job.phases) return [...new Set(job.phases.map(p => MODULE_FILES[p.module]))].map(f => readFileSync(f, 'utf8')).join('\n')
  return dirSource(job.id)
}

/** ids a job may legally see in its sim source: module jobs may reach every check of their modules */
function knownChecks(job: JobDef): string[] {
  if (!job.phases) return job.checks.map(c => c.id)
  return job.phases.flatMap(p => MODULES[p.module].checks.map(c => c.id))
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
        const src = simSource(job)
        const checks = knownChecks(job)
        for (const id of matches(src, /mistake\(\s*'([a-z0-9-]+)'/g)) assert.ok(job.mistakes[id], `unknown mistake "${id}"`)
        for (const id of matches(src, /mistake:\s*'([a-z0-9-]+)'/g)) assert.ok(job.mistakes[id], `unknown mistake "${id}"`)
        for (const id of matches(src, /(?:check|hasCheck)\(\s*'([a-z0-9-]+)'/g)) assert.ok(checks.includes(id), `unknown check "${id}"`)
        for (const id of matches(src, /setStage\(\s*'([a-z]+)'/g)) assert.ok(job.stages.some(s => s.id === id), `unknown stage "${id}"`)
        for (const id of matches(src, EVIDENCE_ID)) assert.ok(job.evidence[id], `unknown evidence "${id}"`)
      })

      it('uses every evidence item it defines', () => {
        const used = new Set([...matches(simSource(job), EVIDENCE_ID), ...job.workOrder.flatMap(r => (r.fact ? [r.fact] : []))])
        for (const id of Object.keys(job.evidence)) assert.ok(used.has(id), `evidence "${id}" is never shown`)
      })

      it('can be reached by every required check', () => {
        const src = simSource(job)
        for (const c of job.checks) assert.match(src, new RegExp(`check\\(\\s*'${c.id}'`), `nothing records check "${c.id}"`)
      })

      const phases = job.phases
      if (phases) {
        it('only uses modules of its own track', () => {
          for (const p of phases) assert.equal(MODULES[p.module].track, job.track, `${p.module} belongs to the other track`)
        })
      }
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

  it('gives every job a manual part of its track that exists, and links every story job back', () => {
    for (const job of JOBS) {
      const part = MANUAL.find(u => u.no === job.manualNo)
      assert.ok(part, `${job.id} opens missing manual part ${job.manualNo}`)
      assert.equal(part.track, job.track, `${job.id} opens a manual part of the other track`)
      // the many short challenge jobs are reached from the board, not listed in the manual
      if (!job.id.startsWith('ch-')) assert.ok(MANUAL.some(u => u.jobs.includes(job.id)), `${job.id} is not listed in any manual part`)
    }
  })

  it('cites the content sheet of its own track in every job', () => {
    for (const job of JOBS) {
      const sheet = SHEET[job.track]
      const page = new RegExp(`^${sheet} หน้า \\d`)
      assert.ok(job.learn.refs.every(r => r.includes(sheet) || (job.id === 'microsoft-install' && r.startsWith('Microsoft:') && r.includes('https://www.microsoft.com/th-th/software-download/windows10'))), `${job.id} has an undocumented external reference`)
      for (const [id, m] of Object.entries(job.mistakes)) if (m.ref) assert.match(m.ref, page, `${job.id}/${id}`)
      for (const q of job.quiz) if (q.ref) assert.match(q.ref, page, `${job.id}/${q.id}`)
    }
  })
})

describe('job modules', () => {
  for (const [id, mod] of Object.entries(MODULES) as [ModuleId, (typeof MODULES)[ModuleId]][]) {
    it(`${id}: the module file reports exactly the registry's mistakes and checks`, () => {
      const src = readFileSync(MODULE_FILES[id], 'utf8')
      const used = new Set(matches(src, /mistake\(\s*'([a-z0-9-]+)'/g))
      // mistakes can also be passed through a variable (lists of problems), so look for the quoted id anywhere
      for (const m of Object.keys(mod.mistakes)) assert.ok(used.has(m) || src.includes(`'${m}'`), `${id} never reports "${m}"`)
      for (const m of used) assert.ok(mod.mistakes[m], `${id} reports unknown mistake "${m}"`)
      for (const c of mod.checks) assert.match(src, new RegExp(`check\\(\\s*'${c.id}'`), `${id} never records "${c.id}"`)
      for (const s of matches(src, /setStage\(\s*'([a-z]+)'/g)) assert.ok(mod.stages.some(x => x.id === s), `${id} sets unknown stage "${s}"`)
    })
  }
})

describe('challenges and economy', () => {
  const challenges = JOBS.filter(j => j.id.startsWith('ch-'))

  it('has challenge jobs in both tracks, each unlocked by a story job of its track', () => {
    for (const track of ['win10', 'win11'] as const) assert.ok(challenges.filter(j => j.track === track).length >= 10, `${track} needs challenges`)
    for (const job of challenges) {
      assert.equal(job.mode, 'challenge', job.id)
      assert.ok(job.requires && !job.requires.startsWith('ch-'), `${job.id} must be unlocked by a story job`)
      assert.equal(JOB_BY_ID[job.requires].track, job.track, `${job.id} is unlocked from the other track`)
      assert.ok(job.reward < Math.min(...JOBS.filter(j => j.mode !== 'challenge' && j.track === job.track).map(j => j.reward)) + 1, `${job.id} pays more than a story job`)
    }
  })

  it('lets a student buy the whole decoration catalog with a little to spare when every job gets three stars', () => {
    const coins = JOBS.reduce((sum, j) => sum + Math.round(j.reward / 10) * 10, 0)
    const catalog = DECOR.reduce((sum, d) => sum + d.price * d.max, 0)
    assert.ok(coins >= catalog, `jobs pay ${coins} but the catalog costs ${catalog}`)
    assert.ok(coins <= catalog * 1.15, `jobs pay ${coins}, far more than the catalog (${catalog})`)
  })

  it('pays less per job than before (story jobs at most 220 coins)', () => {
    for (const job of JOBS) assert.ok(job.reward <= 220, `${job.id} pays ${job.reward}`)
  })
})
