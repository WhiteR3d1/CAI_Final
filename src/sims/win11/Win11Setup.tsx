// Windows 11 Setup (sheet Win11 p.5–7, figures 7–11). On-screen texts are the real English messages;
// the job decides what counts as a mistake through the callbacks, Thai explanations go to the mentor feed.
import { useEffect, useEffectEvent, useState, type ReactNode } from 'react'
import { Icon } from '../../components/Icon'
import { useRun } from '../../screens/workbench/runContext'
import '../windows/windows.css'
import './win11.css'

export type Win11Step = 'lang' | 'keyboard' | 'option' | 'blocked' | 'key' | 'image' | 'license' | 'location' | 'ready' | 'installing' | 'restart'

export interface DiskPart {
  id: string
  disk: number
  label: string
  /** GB */
  size: number
  free: number
  type: string
  kind: 'sys' | 'msr' | 'win' | 'rec' | 'data' | 'unalloc'
}

interface Dialog {
  text: string
  actions: { label: string; primary?: boolean; onClick?: () => void }[]
}

interface Props {
  parts: DiskPart[]
  editions: string[]
  /** false = the PC fails the hardware check (Setup stops with "This PC can't run Windows 11") */
  requirementsOk?: boolean
  onStep?: (step: Win11Step) => void
  onLanguage?: (language: string, time: string) => void
  onKeyboard?: (keyboard: string) => void
  /** Next on "Select setup option"; return false to stay */
  onOption: (option: 'install' | 'repair') => boolean
  onBlocked?: () => void
  onNoKey: () => void
  onKeyRejected?: () => void
  /** return false to stay on the edition page */
  onEdition: (edition: string) => boolean
  /** before the first delete/format: call proceed() to go on (e.g. after the mentor asks for evidence) */
  beforeDestroy?: (part: DiskPart, proceed: () => void) => void
  onDestroy?: (part: DiskPart, mode: 'delete' | 'format', undo: () => void) => void
  /** Next on "Select location to install Windows 11"; return false to stay */
  onTarget: (part: DiskPart) => boolean
  onReady?: () => void
  /** the countdown after installing ended: the PC restarts */
  onRestart: () => void
}

const INSTALL_MS = 30000
const fmt = (gb: number) => (gb < 1 ? `${Math.round(gb * 1000)} MB` : `${gb.toFixed(1)} GB`)
const keyChars = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '').slice(0, 25)
const withDashes = (raw: string) => raw.match(/.{1,5}/g)?.join('-') ?? ''

/** merges neighbouring unallocated rows of the same disk, like Setup shows them */
function mergeFree(list: DiskPart[]): DiskPart[] {
  const out: DiskPart[] = []
  for (const p of list) {
    const last = out[out.length - 1]
    if (last && p.kind === 'unalloc' && last.kind === 'unalloc' && last.disk === p.disk) {
      out[out.length - 1] = { ...last, size: last.size + p.size, free: last.free + p.free }
    } else out.push(p)
  }
  return out
}

const unallocLabel = (disk: number) => `Disk ${disk} Unallocated Space`

function Installing({ onDone }: { onDone: () => void }) {
  const [elapsed, setElapsed] = useState(0)
  const finish = useEffectEvent(() => onDone())
  useEffect(() => {
    const started = Date.now()
    const t = window.setInterval(() => {
      const e = Date.now() - started
      setElapsed(e)
      if (e >= INSTALL_MS) {
        window.clearInterval(t)
        finish()
      }
    }, 200)
    return () => window.clearInterval(t)
  }, [])
  const pct = Math.min(100, Math.floor((elapsed / INSTALL_MS) * 100))
  return (
    <div className="w11-setup-page w11-setup-installing">
      <h2>Installing Windows 11</h2>
      <p className="w11-setup-big">{pct}% complete</p>
      <div className="w11-bar">
        <span style={{ transform: `scaleX(${pct / 100})` }} />
      </div>
      <p className="w-small">Your PC will restart several times. This might take a while.</p>
      <button type="button" className="btn btn-ghost btn-sm w11-skip" onClick={onDone} title="ปุ่มนี้มีเฉพาะในเกม เครื่องจริงต้องรอ">
        ⏩ ข้ามเวลารอ (จำลอง)
      </button>
    </div>
  )
}

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
    <div className="w11-setup-page">
      <h2>Windows needs to restart to continue</h2>
      <p>Restarting in {seconds} seconds</p>
      <div className="w11-setup-foot">
        <span />
        <button type="button" className="w-btn w-btn-primary" onClick={onRestart}>
          Restart now
        </button>
      </div>
    </div>
  )
}

export function Win11Setup(props: Props) {
  const { editions, requirementsOk = true, onStep, onLanguage, onKeyboard, onOption, onBlocked, onNoKey, onKeyRejected, onEdition, beforeDestroy, onDestroy, onTarget, onReady, onRestart } = props
  const run = useRun()
  const [step, setStep] = useState<Win11Step>('lang')
  const [language, setLanguage] = useState('English (United States)')
  const [time, setTime] = useState('English (United States)')
  const [keyboard, setKeyboard] = useState('US')
  const [option, setOption] = useState<'install' | 'repair'>('install')
  const [agree, setAgree] = useState(false)
  const [keyRaw, setKeyRaw] = useState('')
  const [keyError, setKeyError] = useState(false)
  const [edition, setEdition] = useState<string | null>(null)
  const [parts, setParts] = useState<DiskPart[]>(props.parts)
  const [selected, setSelected] = useState<string | null>(null)
  const [cleared, setCleared] = useState(false)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const sel = parts.find(p => p.id === selected) ?? null

  const go = (next: Win11Step) => {
    setStep(next)
    onStep?.(next)
  }

  const blockedHere = (p: DiskPart) => p.kind === 'sys' || p.kind === 'msr' || p.kind === 'rec'

  const destroy = (mode: 'delete' | 'format') => {
    if (!sel || sel.kind === 'unalloc') return
    const target = sel
    const snapshot = parts
    const undo = () => {
      setParts(snapshot)
      setSelected(null)
      run.say('info', 'ย้อนกลับไปก่อนลบ/ฟอร์แมตแล้ว (ทำได้เฉพาะในโหมดฝึก เครื่องจริงย้อนไม่ได้)')
    }
    const apply = () => {
      if (mode === 'delete') {
        const next = mergeFree(parts.map(p => (p.id === target.id ? { ...p, id: `u-${p.id}`, label: unallocLabel(p.disk), free: p.size, type: 'Unallocated Space', kind: 'unalloc' as const } : p)))
        setParts(next)
        setSelected(next.find(p => p.kind === 'unalloc' && p.disk === target.disk)?.id ?? null)
      } else {
        setParts(parts.map(p => (p.id === target.id ? { ...p, free: p.size } : p)))
      }
      onDestroy?.(target, mode, undo)
    }
    const ask = () =>
      setDialog({
        text:
          mode === 'format'
            ? 'If you format this partition, any data stored on it will be lost.'
            : 'If you delete this partition, any data stored on it will be lost.',
        actions: [{ label: 'OK', primary: true, onClick: apply }, { label: 'Cancel' }],
      })
    if (!cleared && beforeDestroy) {
      beforeDestroy(target, () => {
        setCleared(true)
        ask()
      })
    } else ask()
    run.say('warn', `แปล: ถ้า${mode === 'format' ? 'ฟอร์แมต' : 'ลบ'} "${target.label}" ข้อมูลทั้งหมดในพาร์ทิชันนี้จะหายไป ตรวจหมายเลขดิสก์และขนาดก่อนกด OK`)
  }

  const closeThen = (fn?: () => void) => () => {
    setDialog(null)
    fn?.()
  }

  const submitKey = () => {
    setKeyError(true)
    onKeyRejected?.()
  }

  const head = (title: string, sub?: string) => (
    <>
      <h2 className="w11-setup-title">{title}</h2>
      {sub && <p className="w11-setup-sub">{sub}</p>}
    </>
  )
  const foot = (next: (() => void) | null, opts: { back?: () => void; label?: string; disabled?: boolean; left?: ReactNode } = {}) => (
    <div className="w11-setup-foot">
      <span className="w11-setup-brand">
        <span className="w11-ms-logo" aria-hidden />
        Microsoft&nbsp;&nbsp;Support&nbsp;&nbsp;Legal
        {opts.left}
      </span>
      <span className="w11-setup-btns">
        {opts.back && (
          <button type="button" className="w-btn" onClick={opts.back}>
            Back
          </button>
        )}
        {next && (
          <button type="button" className="w-btn w-btn-primary" disabled={opts.disabled} onClick={next}>
            {opts.label ?? 'Next'}
          </button>
        )}
      </span>
    </div>
  )

  const disks = [...new Set(parts.map(p => p.disk))]

  return (
    <div className="w11-setup">
      <div className="w11-setup-window">
        <div className="w11-setup-bar">
          <Icon name="start" size={14} /> Windows 11 Setup
        </div>

        {step === 'lang' && (
          <div className="w11-setup-page">
            {head('Select language settings')}
            <label className="w11-setup-field">
              <span>Language to install</span>
              <select value={language} onChange={e => setLanguage(e.target.value)}>
                <option>English (United States)</option>
                <option>English (United Kingdom)</option>
                <option>ไทย</option>
              </select>
            </label>
            <label className="w11-setup-field">
              <span>Time and currency format</span>
              <select value={time} onChange={e => setTime(e.target.value)}>
                <option>English (United States)</option>
                <option>English (United Kingdom)</option>
                <option>Thai (Thailand)</option>
              </select>
            </label>
            {foot(() => {
              onLanguage?.(language, time)
              go('keyboard')
            })}
          </div>
        )}

        {step === 'keyboard' && (
          <div className="w11-setup-page">
            {head('Select keyboard settings', 'Select the keyboard layout or input method you want to use.')}
            <label className="w11-setup-field">
              <span>Keyboard or input method</span>
              <select value={keyboard} onChange={e => setKeyboard(e.target.value)}>
                <option>US</option>
                <option>United Kingdom</option>
                <option>Thai Kedmanee</option>
              </select>
            </label>
            {foot(
              () => {
                onKeyboard?.(keyboard)
                go('option')
              },
              { back: () => go('lang') },
            )}
          </div>
        )}

        {step === 'option' && (
          <div className="w11-setup-page">
            {head(
              'Select setup option',
              "Install the latest version of Windows 11, or repair your PC. If you're installing Windows 11, please note your files, apps, and settings will be deleted.",
            )}
            <div className="w11-setup-options" role="radiogroup" aria-label="I would like to">
              <span>I would like to</span>
              <label className="w11-radio">
                <input type="radio" name="w11-option" checked={option === 'install'} onChange={() => setOption('install')} />
                Install Windows 11
              </label>
              <label className="w11-radio">
                <input type="radio" name="w11-option" checked={option === 'repair'} onChange={() => setOption('repair')} />
                Repair my PC
              </label>
            </div>
            {option === 'install' && (
              <label className="w11-check">
                <input type="checkbox" checked={agree} onChange={e => setAgree(e.target.checked)} />I agree everything will be deleted including files, apps, and settings
              </label>
            )}
            {foot(
              () => {
                if (!onOption(option)) return
                if (!requirementsOk) {
                  go('blocked')
                  onBlocked?.()
                } else go('key')
              },
              { back: () => go('keyboard'), disabled: option === 'install' && !agree, left: <span className="w11-link is-muted w11-prev">Previous Version of Setup</span> },
            )}
          </div>
        )}

        {step === 'blocked' && (
          <div className="w11-setup-page">
            {head("This PC can't run Windows 11", "This PC doesn't currently meet Windows 11 system requirements.")}
            <ul className="w11-setup-req">
              <li>
                <Icon name="x" size={14} /> The PC must support TPM 2.0.
              </li>
              <li>
                <Icon name="x" size={14} /> The PC must support Secure Boot.
              </li>
            </ul>
            {foot(null, { back: () => go('option') })}
          </div>
        )}

        {step === 'key' && (
          <div className="w11-setup-page">
            {head('Product key', 'The product key should be with the box the DVD came in or in your email receipt.')}
            <p className="w-small">It looks similar to this: XXXXX-XXXXX-XXXXX-XXXXX-XXXXX</p>
            <label className="w11-setup-field">
              <span>Enter Product key</span>
              <input
                value={withDashes(keyRaw)}
                placeholder="Dashes will be added automatically"
                spellCheck={false}
                onChange={e => {
                  setKeyRaw(keyChars(e.target.value))
                  setKeyError(false)
                }}
              />
            </label>
            {keyError && (
              <p className="w-error" role="alert">
                This product key didn't work. Please check it and try again, or try a different key.
              </p>
            )}
            <div className="w11-setup-links">
              <button
                type="button"
                className="w11-link"
                onClick={() => {
                  onNoKey()
                  go('image')
                }}
              >
                I don't have a product key
              </button>
              <span className="w11-link is-muted">Privacy statement</span>
            </div>
            {foot(submitKey, { back: () => go('option'), disabled: keyRaw.length !== 25 })}
          </div>
        )}

        {step === 'image' && (
          <div className="w11-setup-page">
            {head('Select Image', 'Select the image you want to install.')}
            <div className="w11-setup-images" role="radiogroup" aria-label="Windows 11 editions">
              {editions.map(e => (
                <label key={e} className={`w11-radio${edition === e ? ' on' : ''}`}>
                  <input type="radio" name="w11-edition" checked={edition === e} onChange={() => setEdition(e)} />
                  {e}
                </label>
              ))}
            </div>
            {foot(() => edition && onEdition(edition) && go('license'), { back: () => go('key'), disabled: !edition })}
          </div>
        )}

        {step === 'license' && (
          <div className="w11-setup-page">
            {head('Applicable notices and license terms')}
            <div className="w11-mct-terms" tabIndex={0}>
              <p>
                <strong>MICROSOFT SOFTWARE LICENSE TERMS · WINDOWS OPERATING SYSTEM</strong>
              </p>
              <p>(ข้อความสัญญาอนุญาตฉบับเต็ม — ในการติดตั้งจริงควรอ่านก่อนยอมรับ)</p>
            </div>
            <div className="w11-setup-foot">
              <span className="w11-setup-brand">
                <span className="w11-ms-logo" aria-hidden />
                Microsoft&nbsp;&nbsp;Support&nbsp;&nbsp;Legal
              </span>
              <span className="w11-setup-btns">
                <button type="button" className="w-btn" onClick={() => run.say('info', 'ถ้ากด Decline จะติดตั้งต่อไม่ได้ ต้องยอมรับเงื่อนไขก่อน')}>
                  Decline
                </button>
                <button
                  type="button"
                  className="w-btn w-btn-primary"
                  onClick={() => {
                    run.log('ยอมรับเงื่อนไขการใช้งาน (Accept)')
                    go('location')
                  }}
                >
                  Accept
                </button>
              </span>
            </div>
          </div>
        )}

        {step === 'location' && (
          <div className="w11-setup-page">
            {head('Select location to install Windows 11')}
            <div className="w11-setup-tools">
              <button type="button" className="w11-link" onClick={() => setParts(p => [...p])}>
                <Icon name="refresh" size={13} /> Refresh
              </button>
              <button type="button" className="w11-link" onClick={() => run.say('info', 'Load Driver ใช้เมื่อ Setup มองไม่เห็นดิสก์ ซึ่งเครื่องนี้มองเห็นแล้ว')}>
                Load Driver
              </button>
              <span className="w11-link is-muted">Bring Disk Online</span>
              <button type="button" className="w11-link" disabled={!sel || sel.kind === 'unalloc'} onClick={() => destroy('delete')}>
                <Icon name="x" size={13} /> Delete Partition
              </button>
              <button type="button" className="w11-link" disabled={!sel || sel.kind === 'unalloc'} onClick={() => destroy('format')}>
                <Icon name="trash" size={13} /> Format Partition
              </button>
              <button type="button" className="w11-link" disabled={!sel || sel.kind !== 'unalloc'} onClick={() => run.say('info', 'ไม่ต้องสร้างพาร์ทิชันเอง ใบเนื้อหาให้เลือกพื้นที่ว่าง (Unallocated) แล้วกด Next ให้ Setup สร้างพาร์ทิชันระบบแบบ GPT ให้')}>
                <Icon name="sparkle" size={13} /> Create Partition
              </button>
              <span className="w11-link is-muted">Extend Partition</span>
            </div>
            <div className="w11-parts" role="listbox" aria-label="Disks and partitions">
              <div className="w11-parts-head">
                <span>Name</span>
                <span>Total Size</span>
                <span>Free Space</span>
                <span>Type</span>
              </div>
              {disks.map(d =>
                parts
                  .filter(p => p.disk === d)
                  .map(p => (
                    <button key={p.id} type="button" role="option" aria-selected={selected === p.id} className={`w11-part${selected === p.id ? ' on' : ''}`} onClick={() => setSelected(p.id)}>
                      <span>
                        <Icon name={p.kind === 'unalloc' ? 'drive' : 'hdd'} size={14} /> {p.label}
                      </span>
                      <span>{fmt(p.size)}</span>
                      <span>{fmt(p.free)}</span>
                      <span>{p.type}</span>
                    </button>
                  )),
              )}
            </div>
            {sel && blockedHere(sel) && (
              <p className="ws-blocked">
                <Icon name="alert" size={15} /> Windows can't be installed on this drive.{' '}
                <button
                  type="button"
                  className="w11-link"
                  onClick={() =>
                    setDialog({
                      text:
                        sel.kind === 'sys'
                          ? 'Windows cannot be installed to this hard disk space. The partition is an EFI system partition (ESP).'
                          : 'Windows cannot be installed to this hard disk space. The partition is of an unsupported type.',
                      actions: [{ label: 'OK', primary: true }],
                    })
                  }
                >
                  (Show details)
                </button>
              </p>
            )}
            {foot(() => sel && onTarget(sel) && go('ready'), { back: () => go('license'), disabled: !sel || blockedHere(sel) })}
          </div>
        )}

        {step === 'ready' && (
          <div className="w11-setup-page">
            {head('Ready to install', "You won't be able to use your PC during installation. Save and close your files before you begin.")}
            <p>To recap, you've chosen to:</p>
            <ul className="w11-setup-recap">
              <li>
                <Icon name="check" size={15} /> Install {edition}
              </li>
              <li>
                <Icon name="check" size={15} /> Keep nothing
              </li>
            </ul>
            <p className="w-small">
              Note: Certain apps and features may have additional requirements above the Windows 11 minimum system requirements. Some features from previous versions of Windows
              aren't available in Windows 11.
            </p>
            <span className="w11-link is-muted">Check device specifications</span>
            {foot(
              () => {
                onReady?.()
                go('installing')
              },
              { back: () => go('location'), label: 'Install' },
            )}
          </div>
        )}

        {step === 'installing' && <Installing onDone={() => go('restart')} />}
        {step === 'restart' && <RestartCountdown onRestart={onRestart} />}
      </div>

      {dialog && (
        <div className="ws-modal" role="alertdialog" aria-label="Windows 11 Setup">
          <div className="ws-modal-box">
            <div className="ws-dialog-title">Windows 11 Setup</div>
            <div className="ws-modal-body">
              <Icon name="alert" size={26} className="ws-modal-icon ws-modal-warn" />
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
