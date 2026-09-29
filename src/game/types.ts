// Shared game types. This file (and other pure logic in src/game) must not touch the DOM,
// so the node test runner can import it directly.

export type JobId = 'make-usb' | 'bios-boot' | 'install-new' | 'first-setup' | 'reinstall'
export type CriterionId = 'accuracy' | 'reasoning' | 'dataSafety' | 'testing'
export type Severity = 'minor' | 'major' | 'critical'
export type Tone = 'info' | 'good' | 'warn' | 'bad'

export interface MistakeDef {
  label: string
  severity: Severity
  criterion: CriterionId
  explain: string
  ref?: string
  /** true when the explanation is supplementary knowledge that is not in the content sheet */
  extra?: boolean
}

export interface EvidenceDef {
  label: string
  source: string
}

/** Attached evidence must hit at least one id in every group; ids outside groups ∪ acceptable are irrelevant. */
export interface EvidenceRule {
  groups: string[][]
  acceptable?: string[]
}

export interface CheckDef {
  id: string
  label: string
  required: boolean
}

export interface QuizChoice {
  text: string
  correct?: boolean
  feedback: string
}

export interface QuizQuestion {
  id: string
  kind: 'reason' | 'transfer'
  prompt: string
  choices: QuizChoice[]
  ref?: string
}

export interface ObjectiveRule {
  criterion: CriterionId
  min: number
}

export interface Objective {
  id: string
  text: string
  rules: ObjectiveRule[]
}

export type HairStyle = 'short' | 'bob' | 'long' | 'bun' | 'cap' | 'spiky'
export type Accessory = 'none' | 'glasses' | 'camera' | 'headset'

export interface AvatarLook {
  skin: string
  hair: string
  hairStyle: HairStyle
  shirt: string
  accessory?: Accessory
}

export interface Person {
  name: string
  role: string
  look: AvatarLook
}

export type KBlock =
  | { kind: 'text'; text: string }
  | { kind: 'points'; title?: string; items: string[] }
  | { kind: 'table'; title?: string; head: string[]; rows: string[][] }
  | { kind: 'flow'; title?: string; steps: { label: string; sub?: string }[] }
  | { kind: 'note'; tone: 'extra' | 'warn' | 'tip'; title?: string; text: string }

export interface KnowledgeCard {
  title: string
  blocks: KBlock[]
  more?: KBlock[]
  refs: string[]
}

export interface DemoFrame {
  title: string
  say: string
  visual?: KBlock
}

export interface StageDef {
  id: string
  label: string
}

export interface WorkOrderRow {
  label: string
  value: string
  /** evidence id when the row can be pinned to the notebook */
  fact?: string
}

export interface JobDef {
  id: JobId
  order: number
  code: string
  title: string
  tagline: string
  customer: Person
  intake: string[]
  workOrder: WorkOrderRow[]
  objectives: Objective[]
  /** content-sheet pages shown as chips, e.g. "ใบเนื้อหา หน้า 1–3" */
  units: string[]
  /** manual section opened from the workbench drawer */
  manualNo: number
  reward: number
  minutes: number
  requires?: JobId
  criteria: CriterionId[]
  learn: KnowledgeCard
  demo?: DemoFrame[]
  stages: StageDef[]
  hints: Record<string, string[]>
  evidence: Record<string, EvidenceDef>
  mistakes: Record<string, MistakeDef>
  checks: CheckDef[]
  principles: string[]
  quiz: QuizQuestion[]
  thanks: string
}

export interface RunSummary {
  mistakes: string[]
  hintsUsed: number
  checks: string[]
  /** evidence-backed decisions; only the first attempt of each id counts */
  reasons: { id: string; ok: boolean }[]
  quiz: { id: string; firstTry: boolean }[]
}

export interface JobResult {
  finishedAt: string
  score: number
  criteria: Partial<Record<CriterionId, number>>
  stars: 1 | 2 | 3
  objectives: { id: string; passed: boolean }[]
  mistakes: string[]
  hintsUsed: number
  /** coin value of this run before the per-job cap is applied */
  coinsEarned: number
}

export interface JobProgress {
  attempts: number
  completions: number
  /** coins already paid for this job; total payout is capped at the job reward */
  paid: number
  best?: JobResult
  last?: JobResult
}

export interface Settings {
  sfx: boolean
  unlockAll: boolean
  playerName: string
}

export interface SaveData {
  version: 3
  coins: number
  owned: string[]
  jobs: Partial<Record<JobId, JobProgress>>
  settings: Settings
}
