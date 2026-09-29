import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import { useRun } from '../../screens/workbench/runContext'
import { KeyPad } from '../common/Monitor'
import type { Part, SetupLang } from './media'
import './windows.css'

export type SetupStep = 'bootmgr' | 'lang' | 'install' | 'key' | 'edition' | 'license' | 'type' | 'where' | 'installing' | 'reboot' | 'presskey'

const PHASES = ['Copying Windows files', 'Getting files ready for installation', 'Installing features', 'Installing updates', 'Getting finished']
const LANG_OPTIONS: Record<keyof SetupLang, string[]> = {
  language: ['English (United States)', 'English (United Kingdom)', 'ไทย'],
  time: ['English (United States)', 'English (United Kingdom)', 'Thai (Thailand)'],
  keyboard: ['US', 'United Kingdom', 'Thai Kedmanee'],
}
const SYSTEM_RESERVED = 0.549

const fmt = (gb: number) => (gb < 1 ? `${(gb * 1000).toFixed(1)} MB` : `${gb.toFixed(1)} GB`)
const normKey = (s: string) => s.toUpperCase().replace(/[^A-Z0-9]/g, '')

interface Props {
  parts: Part[]
  /** "new" = empty disk where New creates partitions, "existing" = a disk that already has partitions */
  disk: 'new' | 'existing'
  /** a key that activates this PC (content sheet step 5); typed keys that do not match are rejected */
  productKey?: string
  /** extra sentence shown when a typed key is rejected */
  keyHint?: string
  /** editions shown after "I don't have a product key" */
  editions?: string[]
  onStep?: (step: SetupStep) => void
  /** Windows Boot Manager choice; call proceed() to continue */
  onArch: (arch: 32 | 64, proceed: () => void) => void
  onLanguage?: (lang: SetupLang) => void
  /** return false to stay on the product key page */
  onKey: (kind: 'key' | 'nokey') => boolean
  onEdition?: (edition: string) => boolean
  onUpgrade: () => void
  onCreate?: (sizeMb: number) => void
  onDestroy?: (part: Part, mode: 'delete' | 'format', undo: () => void) => void
  /** Next on "Where do you want to install Windows?"; return false to stay */
  onTarget: (part: Part) => boolean
  /** a key was pressed at "Press any key to boot from USB"; call retry() to show the prompt again */
  onPressKey: (retry: () => void) => void
  onInstalled: () => void
}

function BootManager({ onPick }: { onPick: (arch: 64 | 32) => void }) {
  const ref = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)
  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])
  const options: (64 | 32)[] = [64, 32]
  const press = (key: string) => {
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
          <button
            key={arch}
            type="button"
            tabIndex={-1}
            role="option"
            aria-selected={i === index}
            className={i === index ? 'on' : undefined}
            onClick={() => {
              setIndex(i)
              onPick(arch)
            }}
          >
            Windows Setup ({arch}-bit)
          </button>
        ))}
        <div className="bootmgr-foot">ENTER=Choose · TAB=Menu · ESC=Cancel</div>
      </div>
      <KeyPad keys={['ArrowUp', 'ArrowDown', 'Enter']} onKey={press} />
    </div>
  )
}

function Installing({ onDone }: { onDone: () => void }) {
  const [done, setDone] = useState(0)
  const finish = useEffectEvent(() => onDone())
  useEffect(() => {
    const timers = PHASES.map((_, i) => window.setTimeout(() => setDone(i + 1), (i + 1) * 1300))
    const end = window.setTimeout(() => finish(), PHASES.length * 1300 + 700)
    return () => {
      timers.forEach(t => window.clearTimeout(t))
      window.clearTimeout(end)
    }
  }, [])
  return (
    <div className="ws-dialog">
      <div className="ws-dialog-title">Windows Setup</div>
      <div className="ws-dialog-body">
        <h2 className="ws-h">Installing Windows</h2>
        <p>Status</p>
        <ul className="ws-phases">
          {PHASES.map((p, i) => (
            <li key={p} className={i < done ? 'done' : i === done ? 'now' : undefined}>
              {i < done ? <Icon name="check" size={14} /> : <span className="ws-dot" />}
              {p}
              {i === done && <span className="ws-pct"> ({Math.min(99, 20 + i * 15)}%)</span>}
            </li>
          ))}
        </ul>
        <p className="ws-small">Your PC will restart several times. This might take a while. (จำลอง: ใช้เวลาไม่กี่วินาที ระหว่างนี้ไม่ต้องทำอะไร)</p>
        <div className="w-buttons">
          <button type="button" className="w-btn" onClick={onDone}>
            ⏩ เร่งเวลา
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
      aria-label="Press any key to boot from USB"
      onKeyDown={e => {
        e.preventDefault()
        onKey()
      }}
    >
      <p>
        Press any key to boot from USB<span className="presskey-dots">.....</span>
      </p>
      <KeyPad keys={['Enter', 'Space']} onKey={onKey} />
    </div>
  )
}

export function WinSetup(props: Props) {
  const { disk, productKey, keyHint, editions, onStep, onArch, onLanguage, onKey, onEdition, onUpgrade, onCreate, onDestroy, onTarget, onPressKey, onInstalled } = props
  const run = useRun()
  const [step, setStep] = useState<SetupStep>('bootmgr')
  const [lang, setLang] = useState<SetupLang>({ language: 'English (United States)', time: 'English (United States)', keyboard: 'US' })
  const [keyText, setKeyText] = useState('')
  const [keyError, setKeyError] = useState(false)
  const [edition, setEdition] = useState<string | null>(null)
  const [accepted, setAccepted] = useState(false)
  const [parts, setParts] = useState<Part[]>(props.parts)
  const [selected, setSelected] = useState<string | null>(null)
  const [newSize, setNewSize] = useState<string | null>(null)
  const [sizeError, setSizeError] = useState('')
  const [round, setRound] = useState(0)

  const sel = parts.find(p => p.id === selected)
  const go = (next: SetupStep) => {
    setStep(next)
    onStep?.(next)
  }

  /* ---------- product key ---------- */
  const submitKey = () => {
    if (productKey && normKey(keyText) === normKey(productKey)) {
      setKeyError(false)
      if (onKey('key')) go('license')
      return
    }
    setKeyError(true)
  }
  const noKey = () => {
    if (onKey('nokey')) go(editions?.length ? 'edition' : 'license')
  }

  /* ---------- partitions ---------- */
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
    if (!Number.isInteger(mb) || mb < 1024 || mb > max) {
      setSizeError(`ใส่ขนาดเป็นตัวเลข MB ระหว่าง 1024 ถึง ${max.toLocaleString('en-US')}`)
      return
    }
    const create = () => {
      const gb = mb / 1024
      const needSystem = !parts.some(p => p.kind === 'sys')
      const made: Part[] = [
        ...(needSystem
          ? [{ id: 'p1', label: 'Drive 0 Partition 1: System Reserved', size: SYSTEM_RESERVED, free: 0.517, type: 'System', kind: 'sys' as const }]
          : []),
        { id: 'p2', label: 'Drive 0 Partition 2', size: gb - (needSystem ? SYSTEM_RESERVED : 0), free: gb - (needSystem ? SYSTEM_RESERVED : 0), type: 'Primary', kind: 'primary' },
      ]
      const rest = sel.size - gb
      if (rest > 0.01) made.push({ id: 'u1', label: 'Drive 0 Unallocated Space', size: rest, free: rest, type: '', kind: 'unalloc' })
      setParts(list => list.flatMap(p => (p.id === sel.id ? made : [p])))
      setSelected('p2')
      setNewSize(null)
      onCreate?.(mb)
    }
    if (parts.some(p => p.kind === 'sys')) create()
    else
      run.alert({
        tone: 'info',
        title: 'Windows Setup',
        text: 'To ensure that all Windows features work correctly, Windows might create additional partitions for system files. — Windows จะสร้างพาร์ทิชันระบบขนาดเล็ก (System Reserved) เพิ่มให้อัตโนมัติ',
        actions: [{ label: 'Cancel' }, { label: 'OK', variant: 'primary', onClick: create }],
      })
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
          run.say('info', 'ลบพาร์ทิชันแล้ว ดิสก์ใหม่กลับเป็นพื้นที่ว่างทั้งหมด สร้างใหม่ด้วยปุ่ม New ได้')
        } else run.say('info', 'ฟอร์แมตแล้ว พาร์ทิชันนี้ว่างอยู่แล้ว จึงไม่มีอะไรเปลี่ยน')
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
    run.alert({
      tone: 'warn',
      title: 'Windows Setup',
      text:
        mode === 'delete'
          ? `ถ้าลบ "${sel.label}" ข้อมูลทั้งหมดในพาร์ทิชันนี้จะหายไป (This partition might contain important files. If you delete this partition, any data stored on it will be lost.)`
          : `ถ้าฟอร์แมต "${sel.label}" ข้อมูลทั้งหมดในพาร์ทิชันนี้จะหายไป (If you format this partition, any data stored on it will be lost.)`,
      actions: [{ label: 'Cancel' }, { label: 'OK', variant: 'primary', onClick: apply }],
    })
  }

  const next = () => {
    if (!sel) return
    if (sel.kind === 'sys' || sel.kind === 'msr' || sel.kind === 'rec') {
      run.alert({ tone: 'info', title: 'Windows Setup', text: "Windows can't be installed on this drive. — พาร์ทิชันนี้เป็นพาร์ทิชันระบบขนาดเล็ก ติดตั้ง Windows ไม่ได้" })
      return
    }
    if (!onTarget(sel)) return
    const begin = () => go('installing')
    if (sel.kind === 'win' && sel.free < sel.size) {
      run.alert({
        tone: 'info',
        title: 'Windows Setup',
        text: 'The partition you selected might contain files from a previous Windows installation. If it does, these files and folders will be moved to a folder named Windows.old.',
        actions: [{ label: 'Cancel' }, { label: 'OK', variant: 'primary', onClick: begin }],
      })
      return
    }
    begin()
  }

  if (step === 'bootmgr') return <BootManager onPick={arch => onArch(arch, () => go('lang'))} />
  if (step === 'presskey')
    return <PressAnyKey key={round} onKey={() => onPressKey(() => setRound(r => r + 1))} onTimeout={onInstalled} />
  if (step === 'reboot')
    return (
      <div className="ws-black">
        <span className="dt-spinner" aria-hidden />
        <p>Restarting…</p>
      </div>
    )

  return (
    <div className="ws">
      {step === 'installing' ? (
        <Installing
          onDone={() => {
            go('reboot')
            window.setTimeout(() => go('presskey'), 1400)
          }}
        />
      ) : (
        <div className="ws-dialog">
          <div className="ws-dialog-title">Windows Setup</div>
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
                <button type="button" className="ws-install-btn" onClick={() => go('key')}>
                  Install now
                </button>
                <button
                  type="button"
                  className="link-btn ws-repair"
                  onClick={() =>
                    run.alert({
                      tone: 'info',
                      title: 'Repair your computer',
                      text: 'โหมดซ่อมแซมใช้กู้ระบบเดิมที่บูตไม่ขึ้น งานนี้ต้องติดตั้ง Windows จึงกด Install now ตามขั้นที่ 4',
                    })
                  }
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
                  product key.
                </p>
                <p>If you're reinstalling Windows, select I don't have a product key. Your copy of Windows will be automatically activated later.</p>
                <label className="ws-field">
                  <span>Product key:</span>
                  <input
                    value={keyText}
                    placeholder="XXXXX-XXXXX-XXXXX-XXXXX-XXXXX"
                    maxLength={29}
                    spellCheck={false}
                    onChange={e => {
                      setKeyText(e.target.value)
                      setKeyError(false)
                    }}
                    onKeyDown={e => e.key === 'Enter' && keyText.trim() && submitKey()}
                  />
                </label>
                {productKey && (
                  <div className="ws-sticker">
                    <Icon name="clipboard" size={15} /> สติกเกอร์ Product Key ในใบงาน: <strong>{productKey}</strong>
                    <button type="button" className="w-btn" onClick={() => setKeyText(productKey)}>
                      พิมพ์ตามสติกเกอร์
                    </button>
                  </div>
                )}
                {keyError && (
                  <p className="w-error" role="alert">
                    The product key didn't work. Check it and try again, or try a different key. {keyHint ?? '(ตรวจตัวอักษรให้ตรงกับสติกเกอร์อีกครั้ง)'}
                  </p>
                )}
                <div className="ws-row">
                  <button type="button" className="link-btn" onClick={noKey}>
                    I don't have a product key
                  </button>
                  <button type="button" className="w-btn w-btn-primary" disabled={!keyText.trim()} onClick={submitKey}>
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
                      </tr>
                    ))}
                  </tbody>
                </table>
                <div className="w-buttons">
                  <button
                    type="button"
                    className="w-btn w-btn-primary"
                    disabled={!edition}
                    onClick={() => edition && (onEdition?.(edition) ?? true) && go('license')}
                  >
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
                <button type="button" className="w-bigopt" onClick={onUpgrade}>
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
                    <button
                      key={p.id}
                      type="button"
                      role="option"
                      aria-selected={selected === p.id}
                      className={`ws-part${selected === p.id ? ' on' : ''}`}
                      onClick={() => {
                        setSelected(p.id)
                        setNewSize(null)
                      }}
                    >
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
                  <button type="button" className="link-btn" onClick={() => run.say('info', 'Refresh: รายการพาร์ทิชันเป็นปัจจุบันแล้ว')}>
                    <Icon name="refresh" size={14} /> Refresh
                  </button>
                  <button type="button" className="link-btn" disabled={!sel || sel.kind === 'unalloc'} onClick={() => destroy('delete')}>
                    <Icon name="x" size={14} /> Delete
                  </button>
                  <button type="button" className="link-btn" disabled={!sel || sel.kind === 'unalloc'} onClick={() => destroy('format')}>
                    <Icon name="trash" size={14} /> Format
                  </button>
                  <button type="button" className="link-btn" onClick={openNew}>
                    <Icon name="sparkle" size={14} /> New
                  </button>
                  <button type="button" className="link-btn" onClick={() => run.say('info', 'Load driver ใช้เมื่อตัวติดตั้งมองไม่เห็นดิสก์ ซึ่งงานนี้มองเห็นแล้ว')}>
                    Load driver
                  </button>
                </div>
                {newSize !== null && (
                  <div className="ws-newpart">
                    <label>
                      Size: <input value={newSize} inputMode="numeric" onChange={e => setNewSize(e.target.value)} aria-label="ขนาดพาร์ทิชัน (MB)" /> MB
                    </label>
                    <button type="button" className="w-btn w-btn-primary" onClick={applyNew}>
                      Apply
                    </button>
                    <button type="button" className="w-btn" onClick={() => setNewSize(null)}>
                      Cancel
                    </button>
                    <small>{sizeError || '1 GB = 1024 MB'}</small>
                  </div>
                )}
                <div className="w-buttons">
                  <button type="button" className="w-btn w-btn-primary" disabled={!sel} onClick={next}>
                    Next
                  </button>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
