import type { ModalAction } from '../../components/Modal'
import type { JobDef, JobResult, Tone } from '../../game/types'

export type Phase = 'intake' | 'learn' | 'demo' | 'practice' | 'handover' | 'debrief' | 'result'

export interface FeedItem {
  id: number
  tone: Tone
  text: string
  ref?: string
}

export interface RunModal {
  tone: Tone
  title: string
  text: string
  ref?: string
  extra?: boolean
  actions?: ModalAction[]
}

export interface RunState {
  phase: Phase
  stage: string
  evidence: string[]
  mistakes: string[]
  checks: string[]
  reasons: { id: string; ok: boolean }[]
  hintsUsed: number
  hintLevel: Record<string, number>
  feed: FeedItem[]
  log: string[]
  quiz: Record<string, { firstTry: boolean; picked: number[] }>
  modal: RunModal | null
  outcome: { result: JobResult; paid: number } | null
  seq: number
}

export type RunAction =
  | { type: 'phase'; phase: Phase }
  | { type: 'stage'; stage: string }
  | { type: 'pin'; id: string }
  | { type: 'unpin'; id: string }
  | { type: 'say'; tone: Tone; text: string; ref?: string }
  | { type: 'mistake'; id: string }
  | { type: 'check'; id: string }
  | { type: 'reason'; id: string; ok: boolean }
  | { type: 'hint'; max: number }
  | { type: 'log'; text: string }
  | { type: 'quiz'; qid: string; choice: number; correct: boolean }
  | { type: 'modal'; modal: RunModal | null }
  | { type: 'outcome'; outcome: { result: JobResult; paid: number } }

export function initRun(job: JobDef): RunState {
  return {
    phase: 'intake',
    stage: job.stages[0]?.id ?? '',
    evidence: [],
    mistakes: [],
    checks: [],
    reasons: [],
    hintsUsed: 0,
    hintLevel: {},
    feed: [],
    log: [],
    quiz: {},
    modal: null,
    outcome: null,
    seq: 0,
  }
}

export function runReducer(state: RunState, action: RunAction): RunState {
  switch (action.type) {
    case 'phase':
      return { ...state, phase: action.phase }
    case 'stage':
      return state.stage === action.stage ? state : { ...state, stage: action.stage }
    case 'pin':
      return state.evidence.includes(action.id) ? state : { ...state, evidence: [...state.evidence, action.id] }
    case 'unpin':
      return { ...state, evidence: state.evidence.filter(e => e !== action.id) }
    case 'say': {
      const seq = state.seq + 1
      const item: FeedItem = { id: seq, tone: action.tone, text: action.text, ref: action.ref }
      return { ...state, seq, feed: [item, ...state.feed].slice(0, 40) }
    }
    case 'mistake':
      return state.mistakes.includes(action.id) ? state : { ...state, mistakes: [...state.mistakes, action.id] }
    case 'check':
      return state.checks.includes(action.id) ? state : { ...state, checks: [...state.checks, action.id] }
    case 'reason':
      return { ...state, reasons: [...state.reasons, { id: action.id, ok: action.ok }] }
    case 'hint': {
      const current = state.hintLevel[state.stage] ?? 0
      if (current >= action.max) return state
      return { ...state, hintsUsed: state.hintsUsed + 1, hintLevel: { ...state.hintLevel, [state.stage]: current + 1 } }
    }
    case 'log':
      return state.log.includes(action.text) ? state : { ...state, log: [...state.log, action.text] }
    case 'quiz': {
      const prev = state.quiz[action.qid]
      if (prev?.picked.includes(action.choice)) return state
      const firstTry = prev ? prev.firstTry : action.correct
      return { ...state, quiz: { ...state.quiz, [action.qid]: { firstTry, picked: [...(prev?.picked ?? []), action.choice] } } }
    }
    case 'modal':
      return { ...state, modal: action.modal }
    case 'outcome':
      return { ...state, outcome: action.outcome, phase: 'result' }
  }
}
