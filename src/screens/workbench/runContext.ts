import { createContext, useContext, type Dispatch } from 'react'
import type { ModalAction } from '../../components/Modal'
import type { SoundName } from '../../game/audio'
import type { JobDef, Tone } from '../../game/types'
import type { RunAction, RunModal, RunState } from './runState'

export interface MistakeOptions {
  /** buttons for the feedback dialog (they close it automatically) */
  actions?: ModalAction[]
  /** force a dialog even for minor mistakes, or suppress it for major ones */
  modal?: boolean
  /** extra sentence shown before the general explanation */
  lead?: string
  /** record the mistake without a dialog or feed message (the sim shows its own feedback) */
  quiet?: boolean
}

export interface RunApi {
  job: JobDef
  state: RunState
  isPinned(id: string): boolean
  pin(id: string): void
  unpin(id: string): void
  say(tone: Tone, text: string, ref?: string): void
  mistake(id: string, options?: MistakeOptions): void
  reason(id: string, ok: boolean): void
  check(id: string): void
  hasCheck(id: string): boolean
  setStage(id: string): void
  requestHint(max: number): void
  log(text: string): void
  alert(modal: RunModal): void
  complete(): void
  play(name: SoundName): void
}

export const RunContext = createContext<RunApi | null>(null)

export function useRun(): RunApi {
  const run = useContext(RunContext)
  if (!run) throw new Error('useRun must be used inside the workbench')
  return run
}

export function createRunApi(job: JobDef, state: RunState, dispatch: Dispatch<RunAction>, play: (name: SoundName) => void): RunApi {
  const close = () => dispatch({ type: 'modal', modal: null })
  const fallback: ModalAction[] = [{ label: 'เข้าใจแล้ว', variant: 'primary' }]
  const wrap = (actions: ModalAction[] | undefined): ModalAction[] =>
    (actions?.length ? actions : fallback).map(a => ({
      ...a,
      onClick: () => {
        close()
        a.onClick?.()
      },
    }))

  return {
    job,
    state,
    isPinned: id => state.evidence.includes(id),
    pin: id => {
      if (!job.evidence[id] && import.meta.env.DEV) console.warn(`unknown evidence id "${id}" in job ${job.id}`)
      dispatch({ type: 'pin', id })
      play('click')
    },
    unpin: id => dispatch({ type: 'unpin', id }),
    say: (tone, text, ref) => dispatch({ type: 'say', tone, text, ref }),
    mistake: (id, options = {}) => {
      const def = job.mistakes[id]
      if (!def) {
        if (import.meta.env.DEV) console.warn(`unknown mistake id "${id}" in job ${job.id}`)
        return
      }
      dispatch({ type: 'mistake', id })
      if (options.quiet) return
      play('error')
      const text = options.lead ? `${options.lead} ${def.explain}` : def.explain
      const showModal = options.modal ?? def.severity !== 'minor'
      if (showModal) {
        dispatch({
          type: 'modal',
          modal: {
            tone: def.severity === 'critical' ? 'bad' : 'warn',
            title: def.label,
            text,
            ref: def.ref,
            extra: def.extra,
            actions: wrap(options.actions),
          },
        })
      } else {
        dispatch({ type: 'say', tone: 'warn', text: `${def.label} — ${text}`, ref: def.ref })
      }
    },
    reason: (id, ok) => dispatch({ type: 'reason', id, ok }),
    check: id => {
      if (state.checks.includes(id)) return
      const def = job.checks.find(c => c.id === id)
      if (!def && import.meta.env.DEV) console.warn(`unknown check id "${id}" in job ${job.id}`)
      dispatch({ type: 'check', id })
      dispatch({ type: 'say', tone: 'good', text: `ตรวจแล้ว: ${def?.label ?? id}` })
      play('success')
    },
    hasCheck: id => state.checks.includes(id),
    setStage: id => dispatch({ type: 'stage', stage: id }),
    requestHint: max => {
      dispatch({ type: 'hint', max })
      play('click')
    },
    log: text => dispatch({ type: 'log', text }),
    alert: modal => dispatch({ type: 'modal', modal: { ...modal, actions: wrap(modal.actions) } }),
    complete: () => dispatch({ type: 'phase', phase: 'handover' }),
    play,
  }
}
