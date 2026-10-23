import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { JOB_BY_ID, jobsOf } from '../src/data/jobs/index.ts'
import { coaching, learningMode } from '../src/game/learning.ts'
import { applyResult, defaultSave, isUnlocked, normalizeSave } from '../src/game/progress.ts'
import { scoreRun } from '../src/game/scoring.ts'
import { mediaIssue, type MediaOptions } from '../src/sims/microsoftInstall/mediaCreation.ts'

const job = JOB_BY_ID['microsoft-install']
describe('guided learning and paid challenge', () => {
  it('guides all four introductory customers and the Microsoft route', () => {
    for (const intro of jobsOf('win10').filter(j => j.order <= 5)) {
      assert.equal(learningMode(intro), 'guided')
      for (const stage of intro.stages) assert.ok(coaching(intro, stage.id).length > 0, `${intro.id}/${stage.id}`)
    }
    assert.deepEqual(coaching(JOB_BY_ID.reinstall, 'backup'), [])
    assert.ok(JOB_BY_ID.reinstall.reward > job.reward)
  })
  it('keeps old saves and unlocks both next choices after basic training', () => {
    const save = normalizeSave({ ...defaultSave(), jobs: { 'first-setup': { completions: 1 } } })
    assert.ok(isUnlocked(save, job))
    assert.ok(isUnlocked(save, JOB_BY_ID.reinstall))
    assert.equal(isUnlocked(defaultSave(), job), false)
  })
  it('pays the new job once, retains coins on reload, and caps repeat payment', () => {
    const result = scoreRun(job, { mistakes: [], hintsUsed: 0, reasons: [], checks: job.checks.map(c => c.id), quiz: job.quiz.map(q => ({ id: q.id, firstTry: true })) }, '2026-10-23T00:00:00Z')
    const first = applyResult(defaultSave(), job, result)
    assert.equal(first.paid, job.reward)
    const loaded = normalizeSave(JSON.parse(JSON.stringify(first.save)))
    assert.equal(loaded.coins, job.reward)
    assert.equal(applyResult(loaded, job, result).paid, 0)
  })
})

describe('Windows 10 media decisions', () => {
  const correct: MediaOptions = { task: 'create', language: 'Thai', architecture: '64', media: 'usb', drive: 'F' }
  it('accepts only the media required by the customer', () => {
    assert.equal(mediaIssue(correct), null)
    assert.equal(mediaIssue({ ...correct, task: 'upgrade' }), 'mct-task')
    assert.equal(mediaIssue({ ...correct, architecture: '32' }), 'mct-options')
    assert.equal(mediaIssue({ ...correct, language: 'English' }), 'mct-options')
    assert.equal(mediaIssue({ ...correct, media: 'iso' }), 'mct-media')
    assert.equal(mediaIssue({ ...correct, drive: 'E' }), 'mct-drive')
  })
  it('reduces the data-safety score when the backup drive is selected', () => {
    const result = scoreRun(job, { mistakes: ['mct-drive'], hintsUsed: 0, reasons: [], checks: [], quiz: [] }, 't')
    assert.equal(result.criteria.dataSafety, 0.5)
  })
})
