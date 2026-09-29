import { useCallback, useMemo, useReducer, useState, type ComponentType } from 'react'
import { Stepper } from '../../components/Bits'
import { Icon } from '../../components/Icon'
import { KnowledgeView } from '../../components/KnowledgeView'
import { Modal } from '../../components/Modal'
import { RichText } from '../../components/RichText'
import { useGame } from '../../game/gameContext'
import { scoreRun } from '../../game/scoring'
import type { JobDef, JobId, RunSummary } from '../../game/types'
import { BiosBootSim } from '../../sims/biosBoot/BiosBootSim'
import { FirstSetupSim } from '../../sims/firstSetup/FirstSetupSim'
import { InstallNewSim } from '../../sims/installNew/InstallNewSim'
import { MakeUsbSim } from '../../sims/makeUsb/MakeUsbSim'
import { ReinstallSim } from '../../sims/reinstall/ReinstallSim'
import { Manual } from '../Manual'
import { CasePanel } from './CasePanel'
import { Drawer } from './Drawer'
import { Intake } from './Intake'
import { Demo, Learn } from './Learn'
import { RunContext, createRunApi } from './runContext'
import { initRun, runReducer, type Phase } from './runState'
import { Debrief, Handover, ResultView } from './Wrapup'
import './workbench.css'

const SIMS: Record<JobId, ComponentType> = {
  'make-usb': MakeUsbSim,
  'bios-boot': BiosBootSim,
  'install-new': InstallNewSim,
  'first-setup': FirstSetupSim,
  reinstall: ReinstallSim,
}

interface Props {
  job: JobDef
  onExit: () => void
  onOpenJob: (id: JobId) => void
}

export function Workbench({ job, onExit, onOpenJob }: Props) {
  const game = useGame()
  const [state, dispatch] = useReducer(runReducer, job, initRun)
  const run = useMemo(() => createRunApi(job, state, dispatch, game.play), [job, state, game.play])
  const [drawer, setDrawer] = useState<'manual' | 'card' | null>(null)
  const [confirmExit, setConfirmExit] = useState(false)
  const closeDrawer = useCallback(() => setDrawer(null), [])

  const order: Phase[] = ['intake', 'learn', ...(job.demo ? (['demo'] as Phase[]) : []), 'practice', 'handover', 'debrief']
  const steps = ['รับงาน', 'เรียนก่อนทำ', ...(job.demo ? ['ดูตัวอย่าง'] : []), 'ลงมือ', 'ส่งงาน', 'สรุป']
  const current = state.phase === 'result' ? order.length : order.indexOf(state.phase)

  const goPhase = (phase: Phase) => {
    dispatch({ type: 'phase', phase })
    window.scrollTo({ top: 0 })
  }
  const accept = () => {
    game.startJob(job.id)
    goPhase('learn')
  }
  const startPractice = () => {
    if (state.feed.length === 0) {
      run.say('info', `เริ่มที่ "${job.stages[0].label}" ก่อนนะ ติดตรงไหนกดขอคำใบ้ได้ คำใบ้ไม่หักคะแนนวิชา`)
    }
    goPhase('practice')
  }
  const finish = () => {
    const summary: RunSummary = {
      mistakes: state.mistakes,
      hintsUsed: state.hintsUsed,
      checks: state.checks,
      reasons: state.reasons,
      quiz: job.quiz.map(q => ({ id: q.id, firstTry: state.quiz[q.id]?.firstTry ?? false })),
    }
    const result = scoreRun(job, summary, new Date().toISOString())
    const paid = game.finishJob(job, result)
    dispatch({ type: 'outcome', outcome: { result, paid } })
    game.play(paid > 0 ? 'coin' : 'success')
    window.scrollTo({ top: 0 })
  }
  const requestExit = () => (state.phase === 'intake' || state.phase === 'result' ? onExit() : setConfirmExit(true))

  const Sim = SIMS[job.id]
  const atBench = state.phase === 'practice' || state.phase === 'handover'

  return (
    <RunContext.Provider value={run}>
      <div className="wb">
        <header className="wb-head">
          <button type="button" className="btn btn-ghost btn-sm" onClick={requestExit}>
            <Icon name="arrowLeft" size={16} /> ออกจากงาน
          </button>
          <div className="wb-title">
            <span className="job-code">{job.code}</span>
            <h1>{job.title}</h1>
          </div>
          <Stepper steps={steps} current={current} />
        </header>

        {state.phase === 'intake' && <Intake onAccept={accept} onBack={onExit} />}
        {state.phase === 'learn' && <Learn onNext={() => (job.demo ? goPhase('demo') : startPractice())} />}
        {state.phase === 'demo' && <Demo onDone={startPractice} />}
        {atBench && (
          <div className="wb-practice" hidden={state.phase !== 'practice'}>
            <CasePanel onManual={() => setDrawer('manual')} onCard={() => setDrawer('card')} />
            <section className="wb-bench" aria-label="โต๊ะซ่อม">
              <Sim />
            </section>
          </div>
        )}
        {state.phase === 'handover' && <Handover onBack={() => goPhase('practice')} onSubmit={() => goPhase('debrief')} />}
        {state.phase === 'debrief' && <Debrief dispatch={dispatch} onFinish={finish} />}
        {state.phase === 'result' && <ResultView onExit={onExit} onOpenJob={onOpenJob} />}
      </div>

      {state.modal && (
        <Modal title={state.modal.title} tone={state.modal.tone} actions={state.modal.actions ?? []}>
          <p>
            <RichText text={state.modal.text} />
          </p>
          {(state.modal.ref || state.modal.extra) && (
            <p className="modal-ref">
              <Icon name="book" size={15} />
              {state.modal.ref && <span>อ้างอิง: {state.modal.ref}</span>}
              {state.modal.extra && <span className="chip chip-extra">เสริมนอกใบเนื้อหา</span>}
            </p>
          )}
        </Modal>
      )}

      {drawer === 'manual' && (
        <Drawer title="คู่มือช่าง" onClose={closeDrawer}>
          <Manual compact initialUnit={job.manualNo} />
        </Drawer>
      )}
      {drawer === 'card' && (
        <Drawer title={job.learn.title} onClose={closeDrawer}>
          <KnowledgeView blocks={[...job.learn.blocks, ...(job.learn.more ?? [])]} />
          <ul className="ref-list">
            {job.learn.refs.map(r => (
              <li key={r}>
                <Icon name="book" size={15} /> {r}
              </li>
            ))}
          </ul>
        </Drawer>
      )}

      {confirmExit && (
        <Modal
          title="ออกจากงานนี้?"
          tone="warn"
          onClose={() => setConfirmExit(false)}
          actions={[
            { label: 'ทำงานต่อ', variant: 'primary', onClick: () => setConfirmExit(false) },
            { label: 'ออกไปหน้าร้าน', onClick: onExit },
          ]}
        >
          <p>ความคืบหน้าของรอบนี้จะหาย เปิดงานใหม่ได้ภายหลังจากกระดานงาน</p>
        </Modal>
      )}
    </RunContext.Provider>
  )
}
