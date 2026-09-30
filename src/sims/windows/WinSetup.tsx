import { useEffect, useEffectEvent, useRef, useState, type ReactNode } from 'react'
import { Icon } from '../../components/Icon'
import { useRun } from '../../screens/workbench/runContext'
import { KeyPad } from '../common/Monitor'
import type { Part, SetupLang } from './media'
import './windows.css'

// Windows 10 Setup as it behaves on a real PC: on-screen texts are the real (English) messages,
// Thai explanations go to the mentor feed.

export type SetupStep =
  | 'bootmgr'
  | 'lang'
  | 'install'
  | 'starting'
  | 'key'
  | 'edition'
  | 'license'
  | 'type'
  | 'compat'
  | 'where'
  | 'installing'
  | 'restart'
  | 'reboot'
  | 'presskey'
  | 'devices'
  | 'ready'

const PHASES = [
  { text: 'Copying Windows files', ms: 5000 },
  { text: 'Getting files ready for installation', ms: 15000 },
  { text: 'Installing features', ms: 7000 },
  { text: 'Installing updates', ms: 5000 },
  { text: 'Getting finished', ms: 4000 },
]
/** when each phase starts, in ms from the beginning of "Installing Windows" */
const PHASE_STARTS = PHASES.map((_, i) => PHASES.slice(0, i).reduce((sum, p) => sum + p.ms, 0))
const LANG_OPTIONS: Record<keyof SetupLang, string[]> = {
  language: ['English (United States)', 'English (United Kingdom)', 'ไทย'],
  time: ['English (United States)', 'English (United Kingdom)', 'Thai (Thailand)'],
  keyboard: ['US', 'United Kingdom', 'Thai Kedmanee'],
}
const SYSTEM_RESERVED = 0.549
/** smallest partition Windows 10 accepts, in GB */
const MIN_SIZE = 20

const fmt = (gb: number) => (gb < 1 ? `${(gb * 1000).toFixed(1)} MB` : `${gb.toFixed(1)} GB`)
const keyChars = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 25)
const withDashes = (raw: string) => raw.match(/.{1,5}/g)?.join('-') ?? ''

export type BlockReason = 'gpt' | 'small' | 'esp' | 'unsupported'

const BLOCK_DETAIL: Record<BlockReason, string> = {
  gpt: 'Windows cannot be installed to this disk. The selected disk is of the GPT partition style.',
  small: 'Windows cannot be installed to this hard disk space. The partition is too small.',
  esp: 'Windows cannot be installed to this hard disk space. The partition is an EFI system partition (ESP).',
  unsupported: 'Windows cannot be installed to this hard disk space. The partition is of an unsupported type.',
}

interface Dialog {
  icon: 'warn' | 'info' | 'error'
  text: string
  actions: { label: string; primary?: boolean; onClick?: () => void }[]
}

interface Props {
  parts: Part[]
  /** "new" = empty disk where New creates partitions, "existing" = a disk that already has partitions */
  disk: 'new' | 'existing'
  /** how the PC booted the USB; legacy boot cannot install to a GPT disk */
  bootMode?: 'legacy' | 'uefi'
  diskStyle?: 'mbr' | 'gpt'
  /** a key that activates this PC (content sheet step 5); typed keys that do not match are rejected */
  productKey?: string
  /** editions shown after "I don't have a product key" */
  editions?: string[]
  onStep?: (step: SetupStep) => void
  /** Windows Boot Manager choice; call proceed() to continue */
  onArch: (arch: 32 | 64, proceed: () => void) => void
  onLanguage?: (lang: SetupLang) => void
  /** return false to stay on the product key page */
  onKey: (kind: 'key' | 'nokey') => boolean
  onKeyRejected?: () => void
  onEdition?: (edition: string) => boolean
  onUpgrade: () => void
  onCreate?: (sizeMb: number) => void
  onDestroy?: (part: Part, mode: 'delete' | 'format', undo: () => void) => void
  /** the player opened "Show details" under a partition Setup refuses */
  onBlocked?: (part: Part, reason: BlockReason) => void
  /** Next on "Where do you want to install Windows?"; return false to stay */
  onTarget: (part: Part) => boolean
  /** a key was pressed at "Press any key to boot from CD or DVD"; call retry() to show the prompt again */
  onPressKey: (retry: () => void) => void
  onInstalled: () => void
}

/** Windows Boot Manager: keyboard only, and it starts the highlighted entry by itself after 30 s. */
function BootManager({ onPick }: { onPick: (arch: 64 | 32) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  const [seconds, setSeconds] = useState<number | null>(30)
  const options: (64 | 32)[] = [64, 32]
  const autoStart = useEffectEvent(() => onPick(options[index]))

  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])

  useEffect(() => {
    if (seconds === null) return
    if (seconds <= 0) {
      autoStart()
      return
    }
    const t = window.setTimeout(() => setSeconds(s => (s === null ? null : s - 1)), 1000)
    return () => window.clearTimeout(t)
  }, [seconds])

  const press = (key: string) => {
    setSeconds(null)
    if (key === 'ArrowUp') setIndex(0)
    else if (key === 'ArrowDown') setIndex(1)
    else if (key === 'Enter') onPick(options[index])
  }
  return (
    <div className="bootmgr-wrap">
      <div
        ref={ref}
        className="bootmgr"
        tabIndex={0}
        role="listbox"
        aria-label="Windows Boot Manager"
        onMouseDown={e => {
          e.preventDefault()
          ref.current?.focus({ preventScroll: true })
        }}
        onKeyDown={e => {
          if (['ArrowUp', 'ArrowDown', 'Enter'].includes(e.key)) {
            e.preventDefault()
            press(e.key)
          }
        }}
      >
        <div className="bootmgr-head">Windows Boot Manager</div>
        <p>Choose an operating system to start, or press TAB to select a tool:</p>
        <p className="bootmgr-dim">(Use the arrow keys to highlight your choice, then press ENTER.)</p>
        {options.map((arch, i) => (
          <div key={arch} role="option" aria-selected={i === index} className={`bootmgr-item${i === index ? ' on' : ''}`}>
            Windows Setup ({arch}-bit)
          </div>
        ))}
        <p className="bootmgr-dim bootmgr-timer">
          {seconds !== null ? `Seconds until the highlighted choice will be started automatically: ${seconds}` : ' '}
        </p>
        <div className="bootmgr-foot">ENTER=Choose · TAB=Menu · ESC=Cancel</div>
      </div>
      <KeyPad
        keys={['ArrowUp', 'ArrowDown', 'Enter']}
        onKey={k => {
          press(k)
          ref.current?.focus({ preventScroll: true })
        }}
      />
    </div>
  )
}

/** A timed full-screen step (spinner or percentage) that calls onDone when it ends. */
function Waiting({ ms, onDone, children }: { ms: number; onDone: () => void; children: (percent: number) => ReactNode }) {
  const [percent, setPercent] = useState(0)
  const finish = useEffectEvent(() => onDone())
  useEffect(() => {
    const started = Date.now()
    const t = window.setInterval(() => {
      const p = Math.min(100, Math.round(((Date.now() - started) / ms) * 100))
      setPercent(p)
      if (p >= 100) {
        window.clearInterval(t)
        finish()
      }
    }, 120)
    return () => window.clearInterval(t)
  }, [ms])
  return <>{children(percent)}</>
}

function Installing({ onDone }: { onDone: () => void }) {
  const [elapsed, setElapsed] = useState(0)
  const finish = useEffectEvent(() => onDone())
  const total = PHASES.reduce((s, p) => s + p.ms, 0)
  useEffect(() => {
    const started = Date.now()
    const t = window.setInterval(() => {
      const e = Date.now() - started
      setElapsed(e)
      if (e >= total) {
        window.clearInterval(t)
        finish()
      }
    }, 150)
    return () => window.clearInterval(t)
  }, [total])

  return (
    <div className="ws-dialog">
      <div className="ws-dialog-title">Windows Setup</div>
      <div className="ws-dialog-body">
        <h2 className="ws-h">Installing Windows</h2>
        <p>Status</p>
        <ul className="ws-phases">
          {PHASES.map((p, i) => {
            const start = PHASE_STARTS[i]
            const state = elapsed >= start + p.ms ? 'done' : elapsed >= start ? 'now' : 'todo'
            const pct = Math.min(99, Math.floor(((elapsed - start) / p.ms) * 100))
            return (
              <li key={p.text} className={state === 'todo' ? undefined : state}>
                {state === 'done' ? <Icon name="check" size={14} /> : <span className="ws-dot" />}
                {p.text}
                {state === 'now' && <span className="ws-pct"> ({pct}%)</span>}
              </li>
            )
          })}
        </ul>
        <p className="ws-small">Your PC will restart several times. This might take a while.</p>
        <div className="w-buttons">
          <button type="button" className="w-btn" onClick={onDone} title="ปุ่มนี้มีเฉพาะในเกม เครื่องจริงต้องรอ">
            ⏩ ข้ามเวลารอ (จำลอง)
          </button>
        </div>
      </div>
    </div>
  )
}

/** "Windows needs to restart to continue" with the real 10-second countdown. */
function RestartCountdown({ onRestart }: { onRestart: () => void }) {
  const [seconds, setSeconds] = useState(10)
  const restart = useEffectEvent(() => onRestart())
  useEffect(() => {
    if (seconds <= 0) {
      restart()
      return
    }
    const t = window.setTimeout(() => setSeconds(s => s - 1), 1000)
    return () => window.clearTimeout(t)
  }, [seconds])
  return (
    <div className="ws-dialog">
      <div className="ws-dialog-title">Windows Setup</div>
      <div className="ws-dialog-body">
        <h2 className="ws-h">Windows needs to restart to continue</h2>
        <p>Restarting in {seconds} seconds</p>
        <div className="w-buttons">
          <button type="button" className="w-btn w-btn-primary" onClick={onRestart}>
            Restart now
          </button>
        </div>
      </div>
    </div>
  )
}

function PressAnyKey({ onKey, onTimeout }: { onKey: () => void; onTimeout: () => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const timeout = useEffectEvent(() => onTimeout())
  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
    const t = window.setTimeout(() => timeout(), 6000)
    return () => window.clearTimeout(t)
  }, [])
  return (
    <div
      ref={ref}
      className="presskey"
      tabIndex={0}
      role="application"
      aria-label="Press any key to boot from CD or DVD"
      onKeyDown={e => {
        e.preventDefault()
        onKey()
      }}
    >
      <p>
        Press any key to boot from CD or DVD<span className="presskey-dots">.....</span>
      </p>
      <KeyPad keys={['Enter', 'Space']} onKey={onKey} />
    </div>
  )
}

export function WinSetup(props: Props) {
  const { disk, bootMode = 'uefi', diskStyle = 'mbr', productKey, editions, onStep, onArch, onLanguage, onKey, onKeyRejected, onEdition, onUpgrade, onCreate, onDestroy, onBlocked, onTarget, onPressKey, onInstalled } = props
  const run = useRun()
  const [step, setStep] = useState<SetupStep>('bootmgr')
  const [lang, setLang] = useState<SetupLang>({ language: 'English (United States)', time: 'English (United States)', keyboard: 'US' })
  const [keyRaw, setKeyRaw] = useState('')
  const [keyError, setKeyError] = useState(false)
  const [edition, setEdition] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [parts, setParts] = useState<Part[]>(props.parts)
  const [selected, setSelected] = useState<string | null>(null)
  const [newSize, setNewSize] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState('')
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [warnedOnce, setWarnedOnce] = useState(false)
  const [round, setRound] = useState(0)

  const sel = parts.find(p => p.id === selected)
  const go = (next: SetupStep) => {
    setStep(next)
    onStep?.(next)
  }
  const closeThen = (fn?: () => void) => () => {
    setDialog(null)
    fn?.()
  }

  /* ---------- product key (typed with automatic dashes, like the real box) ---------- */
  const submitKey = () => {
    if (productKey && keyRaw === keyChars(productKey)) {
      setKeyError(false)
      if (onKey('key')) go('license')
      return
    }
    setKeyError(true)
    onKeyRejected?.()
  }
  const noKey = () => {
    if (onKey('nokey')) go(editions?.length ? 'edition' : 'license')
  }

  /* ---------- which partitions Setup refuses ---------- */
  const partNo = (p: Part) => {
    const n = parts.filter(x => x.kind !== 'unalloc').indexOf(p) + 1
    return p.kind === 'unalloc' ? 'drive 0 unallocated space' : `drive 0 partition ${n}`
  }
  const blockReason = (p: Part): BlockReason | null => {
    if (bootMode === 'legacy' && diskStyle === 'gpt') return 'gpt'
    if (p.kind === 'sys') return p.label.includes('System Reserved') ? 'small' : 'esp'
    if (p.kind === 'msr' || p.kind === 'rec') return 'unsupported'
    if (p.kind !== 'unalloc' && p.size < MIN_SIZE) return 'small'
    return null
  }
  const reason = sel ? blockReason(sel) : null

  const select = (p: Part) => {
    setSelected(p.id)
    setNewSize(null)
    if (blockReason(p) && !warnedOnce) {
      setWarnedOnce(true)
      run.say('info', 'สังเกตข้อความเตือนใต้ตาราง "Windows can\'t be installed on ..." แปลว่าติดตั้งลงตรงนี้ไม่ได้ กด Show details เพื่อดูสาเหตุ')
    }
  }

  const showDetails = () => {
    if (!sel || !reason) return
    setDialog({ icon: 'error', text: BLOCK_DETAIL[reason], actions: [{ label: 'OK', primary: true }] })
    onBlocked?.(sel, reason)
  }

  const openNew = () => {
    if (disk === 'existing' || !sel || sel.kind !== 'unalloc') {
      run.say('info', disk === 'existing' ? 'ดิสก์นี้ไม่มีพื้นที่ว่างให้สร้างพาร์ทิชันใหม่' : 'เลือกพื้นที่ว่าง (Unallocated Space) ก่อน แล้วค่อยกด New')
      return
    }
    setNewSize(String(Math.floor(sel.size * 1024)))
    setSizeError('')
  }

  const applyNew = () => {
    if (!sel || sel.kind !== 'unalloc' || newSize === null) return
    const max = Math.floor(sel.size * 1024)
    const mb = Number(newSize.replace(/[, ]/g, ''))
    if (!Number.isInteger(mb) || mb < 1 || mb > max) {
      setSizeError(`Enter a size between 1 and ${max} MB`)
      return
    }
    const create = () => {
      const gb = mb / 1024
      const needSystem = !parts.some(p => p.kind === 'sys')
      const primary = gb - (needSystem ? SYSTEM_RESERVED : 0)
      const made: Part[] = [
        ...(needSystem ? [{ id: 'p1', label: 'Drive 0 Partition 1: System Reserved', size: SYSTEM_RESERVED, free: 0.517, type: 'System', kind: 'sys' as const }] : []),
        { id: 'p2', label: 'Drive 0 Partition 2', size: primary, free: primary, type: 'Primary', kind: 'primary' },
      ]
      const rest = sel.size - gb
      if (rest > 0.01) made.push({ id: 'u1', label: 'Drive 0 Unallocated Space', size: rest, free: rest, type: '', kind: 'unalloc' })
      setParts(list => list.flatMap(p => (p.id === sel.id ? made : [p])))
      setSelected('p2')
      setNewSize(null)
      onCreate?.(mb)
    }
    if (parts.some(p => p.kind === 'sys')) create()
    else {
      setDialog({
        icon: 'info',
        text: 'To ensure that all Windows features work correctly, Windows might create additional partitions for system files.',
        actions: [
          { label: 'OK', primary: true, onClick: create },
          { label: 'Cancel' },
        ],
      })
      run.say('info', 'แปล: Windows จะสร้างพาร์ทิชันระบบขนาดเล็ก (System Reserved) เพิ่มให้อัตโนมัติ กด OK ได้')
    }
  }

  const destroy = (mode: 'delete' | 'format') => {
    if (!sel || sel.kind === 'unalloc') return
    const snapshot = parts
    const undo = () => {
      setParts(snapshot)
      setSelected(null)
      run.say('info', 'ย้อนกลับไปก่อนลบ/ฟอร์แมตแล้ว (ทำได้เฉพาะในโหมดฝึก เครื่องจริงย้อนไม่ได้)')
    }
    const apply = () => {
      if (disk === 'new') {
        if (mode === 'delete') {
          setParts(props.parts)
          setSelected(null)
        }
        return
      }
      setParts(
        parts.map(p =>
          p.id !== sel.id
            ? p
            : mode === 'delete'
              ? { ...p, id: `u-${p.id}`, label: 'Drive 0 Unallocated Space', free: p.size, type: '', kind: 'unalloc' as const }
              : { ...p, free: p.size },
        ),
      )
      setSelected(mode === 'delete' ? `u-${sel.id}` : sel.id)
      onDestroy?.(sel, mode, undo)
    }
    const special = sel.kind === 'sys' || sel.kind === 'msr' || sel.kind === 'rec'
    setDialog({
      icon: 'warn',
      text:
        mode === 'format'
          ? 'If you format this partition, any data stored on it will be lost.'
          : special
            ? 'This partition might contain recovery files, system files, or important software from your computer manufacturer. If you delete this partition, any data stored on it will be lost.'
            : 'This partition might contain important files or applications from your computer manufacturer. If you delete this partition, any data stored on it will be lost.',
      actions: [
        { label: 'OK', primary: true, onClick: apply },
        { label: 'Cancel' },
      ],
    })
    run.say('warn', `แปล: ถ้า${mode === 'format' ? 'ฟอร์แมต' : 'ลบ'} "${sel.label}" ข้อมูลทั้งหมดในพาร์ทิชันนี้จะหายไป ตรวจชื่อและขนาดก่อนกด OK`)
  }

  const next = () => {
    if (!sel || reason) return
    if (!onTarget(sel)) return
    const begin = () => go('installing')
    if (sel.kind === 'win' && sel.free < sel.size) {
      setDialog({
        icon: 'info',
        text: 'The partition you selected might contain files from a previous Windows installation. If it does, these files and folders will be moved to a folder named Windows.old. You will be able to access the information in Windows.old, but you will not be able to use your previous version of Windows.',
        actions: [
          { label: 'OK', primary: true, onClick: begin },
          { label: 'Cancel' },
        ],
      })
      run.say('info', 'แปล: ไฟล์ของ Windows เดิมจะถูกย้ายไปไว้ในโฟลเดอร์ Windows.old ไม่ได้ลบพาร์ทิชันอื่น')
      return
    }
    begin()
  }

  /* ---------- full-screen steps ---------- */
  if (step === 'bootmgr') return <BootManager onPick={arch => onArch(arch, () => go('lang'))} />
  if (step === 'reboot')
    return (
      <Waiting ms={1800} onDone={() => go('presskey')}>
        {() => (
          <div className="ws-black">
            <span className="dt-spinner" aria-hidden />
            <p>Restarting</p>
          </div>
        )}
      </Waiting>
    )
  if (step === 'presskey') return <PressAnyKey key={round} onKey={() => onPressKey(() => setRound(r => r + 1))} onTimeout={() => go('devices')} />
  if (step === 'devices')
    return (
      <Waiting ms={5500} onDone={() => go('ready')}>
        {p => (
          <div className="ws-black">
            <span className="dt-spinner" aria-hidden />
            <p>Getting devices ready {p}%</p>
          </div>
        )}
      </Waiting>
    )
  if (step === 'ready')
    return (
      <Waiting ms={3000} onDone={onInstalled}>
        {() => (
          <div className="ws-black">
            <span className="dt-spinner" aria-hidden />
            <p>Getting ready</p>
          </div>
        )}
      </Waiting>
    )

  return (
    <div className="ws">
      {step === 'installing' ? (
        <Installing onDone={() => go('restart')} />
      ) : step === 'restart' ? (
        <RestartCountdown onRestart={() => go('reboot')} />
      ) : step === 'starting' ? (
        <Waiting ms={2200} onDone={() => go('key')}>
          {() => (
            <div className="ws-starting">
              <span className="dt-spinner" aria-hidden />
              <p>Setup is starting</p>
            </div>
          )}
        </Waiting>
      ) : (
        <div className="ws-dialog">
          <div className="ws-dialog-title">
            {['key', 'edition', 'license', 'type', 'compat', 'where'].includes(step) && <Icon name="arrowLeft" size={14} />}
            Windows Setup
          </div>
          <div className="ws-dialog-body">
            {step === 'lang' && (
              <>
                <h2 className="ws-brand">Windows</h2>
                {(
                  [
                    ['language', 'Language to install'],
                    ['time', 'Time and currency format'],
                    ['keyboard', 'Keyboard or input method'],
                  ] as const
                ).map(([key, label]) => (
                  <label key={key} className="ws-field">
                    <span>{label}:</span>
                    <select value={lang[key]} onChange={e => setLang(l => ({ ...l, [key]: e.target.value }))}>
                      {LANG_OPTIONS[key].map(o => (
                        <option key={o}>{o}</option>
                      ))}
                    </select>
                  </label>
                ))}
                <p className="ws-small">Enter your language and other preferences and click "Next" to continue.</p>
                <div className="w-buttons">
                  <button
                    type="button"
                    className="w-btn w-btn-primary"
                    onClick={() => {
                      onLanguage?.(lang)
                      go('install')
                    }}
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {step === 'install' && (
              <div className="ws-install">
                <h2 className="ws-brand">Windows</h2>
                <button type="button" className="ws-install-btn" onClick={() => go('starting')}>
                  Install now
                </button>
                <button
                  type="button"
                  className="link-btn ws-repair"
                  onClick={() => run.say('info', 'Repair your computer ใช้กู้ระบบเดิมที่บูตไม่ขึ้น งานนี้ต้องติดตั้ง Windows จึงกด Install now ตามขั้นที่ 4')}
                >
                  Repair your computer
                </button>
              </div>
            )}

            {step === 'key' && (
              <>
                <h2 className="ws-h">Activate Windows</h2>
                <p>
                  If this is the first time you're installing Windows on this PC (or you're installing a different edition), you need to enter a valid Windows
                  product key. Your product key should be in the confirmation email you received after buying a digital copy of Windows or on a label inside
                  the box that Windows came in.
                </p>
                <p>The product key looks like this: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX</p>
                <p>If you're reinstalling Windows, select I don't have a product key. Your copy of Windows will be automatically activated later.</p>
                <input
                  className="ws-key"
                  value={withDashes(keyRaw)}
                  maxLength={29}
                  spellCheck={false}
                  autoComplete="off"
                  aria-label="Product key"
                  onChange={e => {
                    setKeyRaw(keyChars(e.target.value))
                    setKeyError(false)
                  }}
                  onKeyDown={e => e.key === 'Enter' && keyRaw.length === 25 && submitKey()}
                />
                {keyError && (
                  <p className="w-error" role="alert">
                    The product key didn't work. Check it and try again, or try a different key.
                  </p>
                )}
                <div className="ws-row">
                  <span className="link-btn ws-muted">Privacy statement</span>
                  <button type="button" className="link-btn" onClick={noKey}>
                    I don't have a product key
                  </button>
                  <button type="button" className="w-btn w-btn-primary" disabled={keyRaw.length !== 25} onClick={submitKey}>
                    Next
                  </button>
                </div>
              </>
            )}

            {step === 'edition' && (
              <>
                <h2 className="ws-h">Select the operating system you want to install</h2>
                <table className="ws-table">
                  <thead>
                    <tr>
                      <th>Operating system</th>
                      <th>Architecture</th>
                      <th>Date modified</th>
                    </tr>
                  </thead>
                  <tbody>
                    {(editions ?? []).map(e => (
                      <tr key={e} className={edition === e ? 'on' : undefined} onClick={() => setEdition(e)}>
                        <td>
                          <button type="button" onClick={() => setEdition(e)}>
                            {e}
                          </button>
                        </td>
                        <td>x64</td>
                        <td>9/8/2022</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="w-buttons">
                  <button type="button" className="w-btn w-btn-primary" disabled={!edition} onClick={() => edition && (onEdition?.(edition) ?? true) && go('license')}>
                    Next
                  </button>
                </div>
              </>
            )}

            {step === 'license' && (
              <>
                <h2 className="ws-h">Applicable notices and license terms</h2>
                <div className="ws-license" tabIndex={0}>
                  <p>
                    <strong>ข้อตกลงสัญญาอนุญาตใช้ซอฟต์แวร์ (ข้อความจำลองเพื่อการเรียนรู้)</strong>
                  </p>
                  <p>การติดตั้งและใช้ระบบปฏิบัติการนี้ ถือว่าผู้ใช้ยอมรับเงื่อนไขการใช้งานของผู้ผลิตทุกประการ เช่น ใช้ตามจำนวนเครื่องที่ได้รับอนุญาต และไม่ทำสำเนาเพื่อจำหน่าย</p>
                  <p>ในการติดตั้งจริง ควรอ่านข้อตกลงให้เข้าใจก่อนยอมรับ</p>
                </div>
                <label className="ws-check">
                  <input type="checkbox" checked={accepted} onChange={e => setAccepted(e.target.checked)} />I accept the license terms
                </label>
                <div className="w-buttons">
                  <button
                    type="button"
                    className="w-btn w-btn-primary"
                    disabled={!accepted}
                    onClick={() => {
                      run.log('ยอมรับข้อตกลงการใช้งาน (I accept the license terms) ขั้นที่ 6')
                      go('type')
                    }}
                  >
                    Next
                  </button>
                </div>
              </>
            )}

            {step === 'type' && (
              <>
                <h2 className="ws-h">Which type of installation do you want?</h2>
                <button
                  type="button"
                  className="w-bigopt"
                  onClick={() => {
                    go('compat')
                    onUpgrade()
                  }}
                >
                  <strong>Upgrade: Install Windows and keep files, settings, and applications</strong>
                  <span>The files, settings, and applications are moved to Windows with this option. This option is only available when a supported version of Windows is already running on the computer.</span>
                </button>
                <button
                  type="button"
                  className="w-bigopt"
                  onClick={() => {
                    run.log('เลือก Custom: Install Windows only (advanced) ขั้นที่ 7')
                    go('where')
                  }}
                >
                  <strong>Custom: Install Windows only (advanced)</strong>
                  <span>
                    The files, settings, and applications aren't moved to Windows with this option. If you want to make changes to partitions and drives, start the
                    computer using the installation disc. We recommend backing up your files before you continue.
                  </span>
                </button>
              </>
            )}

            {step === 'compat' && (
              <>
                <h2 className="ws-h">Compatibility report</h2>
                <p>
                  <strong>The following things need your attention</strong>
                </p>
                <p>
                  The upgrade option isn't available if you start your computer using Windows installation media. If you've started your computer using installation
                  media and you want to upgrade, remove the installation media and restart your computer. Then, start the installation from within Windows.
                </p>
                <div className="w-buttons">
                  <button type="button" className="w-btn w-btn-primary" onClick={() => go('type')}>
                    Close
                  </button>
                </div>
              </>
            )}

            {step === 'where' && (
              <>
                <h2 className="ws-h">Where do you want to install Windows?</h2>
                <div className="ws-parts" role="listbox" aria-label="พาร์ทิชันในดิสก์">
                  <div className="ws-parts-head">
                    <span>Name</span>
                    <span>Total size</span>
                    <span>Free space</span>
                    <span>Type</span>
                  </div>
                  {parts.map(p => (
                    <button key={p.id} type="button" role="option" aria-selected={selected === p.id} className={`ws-part${selected === p.id ? ' on' : ''}`} onClick={() => select(p)}>
                      <span>
                        <Icon name="hdd" size={15} /> {p.label}
                      </span>
                      <span>{fmt(p.size)}</span>
                      <span>{fmt(p.free)}</span>
                      <span>{p.type}</span>
                    </button>
                  ))}
                </div>
                <div className="ws-tools">
                  <button type="button" className="link-btn" onClick={() => undefined}>
                    <Icon name="refresh" size={14} /> Refresh
                  </button>
                  <button type="button" className="link-btn" disabled={!sel || sel.kind === 'unalloc'} onClick={() => destroy('delete')}>
                    <Icon name="x" size={14} /> Delete
                  </button>
                  <button type="button" className="link-btn" disabled={!sel || sel.kind === 'unalloc'} onClick={() => destroy('format')}>
                    <Icon name="trash" size={14} /> Format
                  </button>
                  <button type="button" className="link-btn" disabled={disk === 'existing' || !sel || sel.kind !== 'unalloc'} onClick={openNew}>
                    <Icon name="sparkle" size={14} /> New
                  </button>
                  <button type="button" className="link-btn" onClick={() => run.say('info', 'Load driver ใช้เมื่อตัวติดตั้งมองไม่เห็นดิสก์ ซึ่งงานนี้มองเห็นแล้ว')}>
                    Load driver
                  </button>
                  <button type="button" className="link-btn" disabled>
                    Extend
                  </button>
                </div>
                {newSize !== null && (
                  <div className="ws-newpart">
                    <label>
                      Size: <input value={newSize} inputMode="numeric" onChange={e => setNewSize(e.target.value)} aria-label="Size (MB)" /> MB
                    </label>
                    <button type="button" className="w-btn w-btn-primary" onClick={applyNew}>
                      Apply
                    </button>
                    <button type="button" className="w-btn" onClick={() => setNewSize(null)}>
                      Cancel
                    </button>
                    {sizeError && <small className="w-error">{sizeError}</small>}
                  </div>
                )}
                {sel && reason && (
                  <p className="ws-blocked">
                    <Icon name="alert" size={15} /> Windows can't be installed on {partNo(sel)}.{' '}
                    <button type="button" className="link-btn" onClick={showDetails}>
                      (Show details)
                    </button>
                  </p>
                )}
                <div className="w-buttons">
                  <button type="button" className="w-btn w-btn-primary" disabled={!sel || !!reason} onClick={next}>
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}

      {dialog && (
        <div className="ws-modal" role="alertdialog" aria-label="Windows Setup">
          <div className="ws-modal-box">
            <div className="ws-dialog-title">Windows Setup</div>
            <div className="ws-modal-body">
              <Icon name={dialog.icon === 'info' ? 'info' : 'alert'} size={26} className={`ws-modal-icon ws-modal-${dialog.icon}`} />
              <p>{dialog.text}</p>
            </div>
            <div className="w-buttons">
              {dialog.actions.map(a => (
                <button key={a.label} type="button" className={`w-btn${a.primary ? ' w-btn-primary' : ''}`} onClick={closeThen(a.onClick)}>
                  {a.label}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
