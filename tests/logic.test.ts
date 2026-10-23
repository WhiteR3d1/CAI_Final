import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { JOBS, JOB_BY_ID } from '../src/data/jobs/index.ts'
import { judgeEvidence } from '../src/game/evidence.ts'
import { applyResult, defaultSave, isUnlocked, LEVELS, normalizeSave, reputation, shopLevel, startAttempt } from '../src/game/progress.ts'
import { quizOrder } from '../src/game/shuffle.ts'
import { coinsFor, scoreRun } from '../src/game/scoring.ts'
import type { RunSummary } from '../src/game/types.ts'

const job = JOB_BY_ID['reinstall']
const allChecks = job.checks.filter(c => c.required).map(c => c.id)
const clean: RunSummary = { mistakes: [], hintsUsed: 0, checks: allChecks, reasons: [], quiz: job.quiz.map(q => ({ id: q.id, firstTry: true })) }

describe('scoreRun', () => {
  it('gives a perfect run full marks, three stars and every objective', () => {
    const r = scoreRun(job, clean, 't')
    assert.equal(r.score, 100)
    assert.equal(r.stars, 3)
    assert.ok(r.objectives.every(o => o.passed))
    assert.equal(r.coinsEarned, job.reward)
  })

  it('zeroes data safety and caps stars after a critical mistake', () => {
    const r = scoreRun(job, { ...clean, mistakes: ['setup-wipe-photos'] }, 't')
    assert.equal(r.criteria.dataSafety, 0)
    assert.ok(r.stars <= 2)
    assert.equal(r.objectives.find(o => o.id === 'o2')?.passed, false)
  })

  it('counts a repeated mistake once and ignores unknown ids', () => {
    const once = scoreRun(job, { ...clean, mistakes: ['rufus-mbr'] }, 't')
    const twice = scoreRun(job, { ...clean, mistakes: ['rufus-mbr', 'rufus-mbr', 'nope'] }, 't')
    assert.equal(once.score, twice.score)
    assert.deepEqual(twice.mistakes, ['rufus-mbr'])
  })

  it('scores only the first attempt of an evidence decision', () => {
    const usb = JOB_BY_ID['make-usb']
    const base: RunSummary = { mistakes: [], hintsUsed: 0, checks: ['check-usb-seen', 'check-usb-files'], reasons: [], quiz: [] }
    const r = scoreRun(usb, { ...base, reasons: [{ id: 'usb-setup', ok: false }, { id: 'usb-setup', ok: true }, { id: 'other', ok: true }] }, 't')
    assert.equal(r.criteria.reasoning, 0.5)
  })

  it('lowers the testing criterion when required checks are skipped', () => {
    const r = scoreRun(job, { ...clean, checks: [allChecks[0]] }, 't')
    assert.equal(r.criteria.testing, 0.5)
    assert.ok(r.score < 100)
  })
})

describe('coins and progress', () => {
  it('rounds coins to tens', () => {
    assert.equal(coinsFor(250, 1), 80)
    assert.equal(coinsFor(250, 2), 170)
    assert.equal(coinsFor(250, 3), 250)
  })

  it('pays only for improvement, capped at the job reward', () => {
    let save = startAttempt(defaultSave(), job.id)
    const two = scoreRun(job, { ...clean, mistakes: ['no-backup', 'rufus-mbr'] }, 'a')
    const first = applyResult(save, job, two)
    save = first.save
    assert.equal(first.paid, two.coinsEarned)
    const again = applyResult(save, job, two)
    assert.equal(again.paid, 0)
    const best = applyResult(again.save, job, scoreRun(job, clean, 'b'))
    assert.equal(best.paid, job.reward - two.coinsEarned)
    assert.equal(best.save.coins, job.reward)
    assert.equal(best.save.jobs[job.id]?.completions, 3)
    assert.equal(best.save.jobs[job.id]?.attempts, 1)
    assert.equal(best.save.jobs[job.id]?.best?.score, 100)
  })

  it('unlocks jobs in order unless the teacher unlocks everything', () => {
    const save = defaultSave()
    assert.equal(isUnlocked(save, JOB_BY_ID['make-usb']), true)
    assert.equal(isUnlocked(save, JOB_BY_ID['bios-boot']), false)
    assert.equal(isUnlocked(save, JOB_BY_ID['reinstall']), false)
    assert.equal(isUnlocked({ ...save, settings: { ...save.settings, unlockAll: true } }, JOB_BY_ID['reinstall']), true)
    const usb = JOB_BY_ID['make-usb']
    const done = applyResult(save, usb, scoreRun(usb, { mistakes: [], hintsUsed: 0, checks: [], reasons: [], quiz: [] }, 't')).save
    assert.equal(isUnlocked(done, JOB_BY_ID['bios-boot']), true)
  })

  it('derives reputation and shop level from best stars of every job', () => {
    const r = applyResult(defaultSave(), job, scoreRun(job, clean, 't')).save
    assert.equal(reputation(r), 3)
    assert.equal(shopLevel(0).title, 'ช่างฝึกหัด')
    assert.equal(shopLevel(14).title, 'ช่างฝึกหัด')
    assert.equal(shopLevel(15).title, 'ช่างประจำร้าน')
    assert.equal(shopLevel(89).nextAt, 90)
    // the top level must be reachable with three stars on every job
    assert.ok(JOBS.length * 3 >= LEVELS[LEVELS.length - 1].min)
    assert.equal(shopLevel(JOBS.length * 3).nextAt, null)
  })
})

describe('quiz choice order', () => {
  const questions = JOBS.flatMap(j => j.quiz.map(q => ({ job: j.id, q })))

  it('is a permutation that stays the same for the same attempt', () => {
    for (const { q } of questions) {
      const order = quizOrder(q.id, q.choices.length, 1)
      assert.deepEqual([...order].sort(), q.choices.map((_, i) => i))
      assert.deepEqual(quizOrder(q.id, q.choices.length, 1), order)
    }
  })

  it('does not always put the correct answer first (the data lists it first)', () => {
    for (const attempt of [1, 2, 3]) {
      const positions = questions.map(({ q }) => quizOrder(q.id, q.choices.length, attempt).findIndex(i => q.choices[i].correct))
      for (const pos of [0, 1, 2]) assert.ok(positions.includes(pos), `attempt ${attempt}: the answer is never shown at ${'กขค'[pos]}`)
      assert.ok(positions.filter(p => p === 0).length < questions.length * 0.6, `attempt ${attempt}: ก is right too often`)
    }
  })
})

describe('normalizeSave', () => {
  it('starts fresh from garbage or old versions', () => {
    assert.deepEqual(normalizeSave(null), defaultSave())
    assert.deepEqual(normalizeSave({ completed: true }), defaultSave())
    assert.deepEqual(normalizeSave({ version: 1, coins: 50 }), defaultSave())
    // v2 saves belong to the old textbook jobs, so they are dropped too
    assert.deepEqual(normalizeSave({ version: 2, coins: 50, jobs: { 'choose-os': { attempts: 1 } } }), defaultSave())
  })

  it('cleans invalid fields but keeps valid progress', () => {
    const s = normalizeSave({
      version: 3,
      coins: -5,
      owned: ['fern', 3, 'no-such-item'],
      jobs: { reinstall: { attempts: 2, completions: 'x', paid: 100 }, broken: 7 },
      settings: { sfx: false, playerName: 42 },
    })
    assert.equal(s.version, 4)
    assert.equal(s.coins, 0)
    assert.deepEqual(s.inventory, { fern: 1 })
    assert.deepEqual(s.jobs.reinstall, { attempts: 2, completions: 0, paid: 100, best: undefined, last: undefined })
    assert.equal(s.settings.sfx, false)
    assert.equal(s.settings.playerName, '')
  })
})

describe('judgeEvidence', () => {
  const rule = { groups: [['a', 'b'], ['c']], acceptable: ['d'] }
  it('needs one item from every group', () => {
    assert.equal(judgeEvidence(['a'], rule), 'missing')
    assert.equal(judgeEvidence(['b', 'c'], rule), 'ok')
    assert.equal(judgeEvidence(['a', 'c', 'd'], rule), 'ok')
  })
  it('flags evidence that does not support the decision', () => {
    assert.equal(judgeEvidence(['a', 'c', 'z'], rule), 'irrelevant')
  })
})
