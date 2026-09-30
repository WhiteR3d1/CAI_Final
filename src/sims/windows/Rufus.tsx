import { useEffect, useEffectEvent, useState } from 'react'
import { Icon } from '../../components/Icon'
import { ISO_FILES, RUFUS_VERSION, SCHEME_LABEL, type RufusConfig, type RufusDevice, type RufusIso, type Scheme } from './media'
import './windows.css'

// Layout follows Rufus 1.4 as pictured in the content sheet (figures 3–5).

interface Phase {
  text: string
  ms: number
  /** show the percentage of this phase in the status bar */
  percent?: boolean
}

type Dialog =
  | { kind: 'warn' }
  | { kind: 'about' }
  | { kind: 'log' }
  | { kind: 'message'; title: string; text: string }

interface Props {
  /** the first device is selected when Rufus opens */
  devices: RufusDevice[]
  isos?: RufusIso[]
  /** preselected partition scheme; each job picks one the player has to think about */
  defaultScheme?: Scheme
  /** Start was pressed with valid settings; call `next()` to show Rufus's own warning */
  onReview?: (config: RufusConfig, next: () => void) => void
  /** OK on the warning; return false when the sim stops the write (e.g. a mistake was made) */
  onStart: (config: RufusConfig) => boolean
  onDone: (config: RufusConfig) => void
  onClose?: () => void
}

function phasesFor(c: RufusConfig): Phase[] {
  return [
    ...(c.badBlocks ? [{ text: 'Bad Blocks: Testing with random pattern', ms: 6000, percent: true }] : []),
    { text: c.quickFormat ? `Formatting (${c.fileSystem})...` : `Formatting (${c.fileSystem}) - full format...`, ms: c.quickFormat ? 2200 : 7500, percent: !c.quickFormat },
    { text: 'Creating file system...', ms: 1300 },
    ...(c.boot === 'iso' ? [{ text: 'Copying ISO files', ms: 10500, percent: true }] : []),
    ...(c.boot === 'freedos' ? [{ text: 'Copying DOS files...', ms: 1500 }] : []),
    { text: 'Finalizing, please wait...', ms: 1200 },
  ]
}

export function Rufus({ devices, isos = ISO_FILES, defaultScheme = 'gpt-uefi', onReview, onStart, onDone, onClose }: Props) {
  const [device, setDevice] = useState(devices[0]?.id ?? '')
  const [scheme, setScheme] = useState<Scheme>(defaultScheme)
  const [fileSystem, setFileSystem] = useState('NTFS')
  const [cluster, setCluster] = useState('4096 bytes (Default)')
  const [label, setLabel] = useState('NO_LABEL')
  const [badBlocks, setBadBlocks] = useState(false)
  const [quickFormat, setQuickFormat] = useState(true)
  const [bootable, setBootable] = useState(true)
  const [bootType, setBootType] = useState<'iso' | 'freedos'>('iso')
  const [extLabel, setExtLabel] = useState(true)
  const [iso, setIso] = useState<RufusIso | null>(null)
  const [picker, setPicker] = useState(false)
  const [dialog, setDialog] = useState<Dialog | null>(null)
  const [writing, setWriting] = useState<{ config: RufusConfig; phases: Phase[]; started: number } | null>(null)
  const [elapsed, setElapsed] = useState(0)
  const [status, setStatus] = useState<string | null>(null)
  const [done, setDone] = useState(false)
  const [log, setLog] = useState<string[]>([`Rufus version ${RUFUS_VERSION}`, 'Windows version: Windows 10 64-bit'])

  const busy = writing !== null
  const deviceLabel = devices.find(d => d.id === device)?.label ?? ''
  const addLog = (line: string) => setLog(l => [...l, line])

  const finish = useEffectEvent((config: RufusConfig) => {
    setWriting(null)
    setDone(true)
    setStatus('DONE')
    addLog('DONE')
    onDone(config)
  })

  useEffect(() => {
    if (!writing) return
    const total = writing.phases.reduce((s, p) => s + p.ms, 0)
    const timer = window.setInterval(() => {
      const e = Date.now() - writing.started
      if (e >= total) {
        window.clearInterval(timer)
        finish(writing.config)
      } else setElapsed(e)
    }, 150)
    return () => window.clearInterval(timer)
  }, [writing])

  const config = (): RufusConfig => ({
    device,
    iso: bootable && bootType === 'iso' ? iso : null,
    boot: !bootable ? 'none' : bootType,
    scheme,
    fileSystem,
    cluster,
    label,
    quickFormat,
    badBlocks,
  })

  const pickIso = (f: RufusIso) => {
    setPicker(false)
    if (f.kind === 'office') {
      addLog(`ISO analysis: ${f.name} — no boot loader found`)
      setDialog({
        kind: 'message',
        title: 'Unsupported ISO',
        text: "This ISO image doesn't appear to use either of the bootmgr or isolinux/syslinux boot loaders, so it can't be used to create a bootable USB drive.",
      })
      return
    }
    setIso(f)
    setLabel(f.label)
    setStatus(`Using image: ${f.name}`)
    addLog(`Using image: ${f.name}`)
  }

  const start = () => {
    if (!device) return
    if (bootable && bootType === 'iso' && !iso) {
      setDialog({
        kind: 'message',
        title: 'No image selected',
        text: 'Please click on the disc button to select a bootable ISO, or uncheck the "Create a bootable disk..." checkbox.',
      })
      return
    }
    const next = () => setDialog({ kind: 'warn' })
    if (onReview) onReview(config(), next)
    else next()
  }

  const proceed = () => {
    setDialog(null)
    const c = config()
    if (!onStart(c)) {
      setStatus('Operation cancelled')
      addLog('Operation cancelled')
      return
    }
    addLog(`Format operation started on ${deviceLabel}`)
    setDone(false)
    setElapsed(0)
    setWriting({ config: c, phases: phasesFor(c), started: Date.now() })
  }

  // status bar + progress while writing
  let statusText = status ?? (devices.length === 1 ? '1 device found' : `${devices.length} devices found`)
  let progress = done ? 100 : 0
  if (writing) {
    const total = writing.phases.reduce((s, p) => s + p.ms, 0)
    let before = 0
    let current = writing.phases[writing.phases.length - 1]
    for (const p of writing.phases) {
      if (elapsed < before + p.ms) {
        current = p
        break
      }
      before += p.ms
    }
    const inPhase = Math.min(1, Math.max(0, (elapsed - before) / current.ms))
    statusText = current.percent ? `${current.text}: ${(inPhase * 100).toFixed(1)}%` : current.text
    progress = Math.min(99, (elapsed / total) * 100)
  }

  return (
    <div className="rufus14" role="group" aria-label="Rufus จำลอง">
      <header className="rufus14-title">
        <Icon name="usb" size={15} />
        <span>Rufus {RUFUS_VERSION}</span>
        <button type="button" className="rufus14-x" aria-label="ปิด Rufus" disabled={busy || !onClose} onClick={onClose}>
          <Icon name="x" size={14} />
        </button>
      </header>
      <div className="rufus14-body">
        <div className="rufus14-label-row">
          <span>Device</span>
          <Icon name="sparkle" size={13} />
        </div>
        <select value={device} disabled={busy} onChange={e => setDevice(e.target.value)} aria-label="Device">
          {devices.map(d => (
            <option key={d.id} value={d.id}>
              {d.label}
            </option>
          ))}
        </select>

        <span className="rufus14-label">Partition scheme and target system type</span>
        <select value={scheme} disabled={busy} onChange={e => setScheme(e.target.value as Scheme)} aria-label="Partition scheme and target system type">
          {(Object.keys(SCHEME_LABEL) as Scheme[]).map(s => (
            <option key={s} value={s}>
              {SCHEME_LABEL[s]}
            </option>
          ))}
        </select>

        <span className="rufus14-label">File system</span>
        <select value={fileSystem} disabled={busy} onChange={e => setFileSystem(e.target.value)} aria-label="File system">
          {['FAT32', 'NTFS', 'exFAT'].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>

        <span className="rufus14-label">Cluster size</span>
        <select value={cluster} disabled={busy} onChange={e => setCluster(e.target.value)} aria-label="Cluster size">
          {['4096 bytes (Default)', '8192 bytes', '16 kilobytes', '32 kilobytes'].map(o => (
            <option key={o}>{o}</option>
          ))}
        </select>

        <span className="rufus14-label">New volume label</span>
        <input value={label} disabled={busy} onChange={e => setLabel(e.target.value.slice(0, 32))} aria-label="New volume label" spellCheck={false} />

        <fieldset className="rufus14-options" disabled={busy}>
          <legend>Format Options</legend>
          <label className="rufus14-check">
            <input type="checkbox" checked={badBlocks} onChange={e => setBadBlocks(e.target.checked)} />
            Check device for bad blocks
            <select disabled={!badBlocks} aria-label="Bad block passes">
              <option>1 Pass</option>
              <option>2 Passes</option>
            </select>
          </label>
          <label className="rufus14-check">
            <input type="checkbox" checked={quickFormat} onChange={e => setQuickFormat(e.target.checked)} />
            Quick format
          </label>
          <div className="rufus14-check">
            <label>
              <input type="checkbox" checked={bootable} onChange={e => setBootable(e.target.checked)} />
              Create a bootable disk using
            </label>
            <select value={bootType} disabled={!bootable} onChange={e => setBootType(e.target.value as 'iso' | 'freedos')} aria-label="ชนิดของดิสก์บูต">
              <option value="iso">ISO Image</option>
              <option value="freedos">FreeDOS</option>
            </select>
            <button type="button" className="rufus14-disc" disabled={!bootable || bootType !== 'iso'} onClick={() => setPicker(true)} aria-label="เลือกไฟล์ ISO" title="Click to select an image...">
              <Icon name="disc" size={16} />
            </button>
          </div>
          <label className="rufus14-check">
            <input type="checkbox" checked={extLabel} onChange={e => setExtLabel(e.target.checked)} />
            Create extended label and icon files
          </label>
        </fieldset>

        <div className="rufus14-progress" role="progressbar" aria-valuemin={0} aria-valuemax={100} aria-valuenow={Math.round(progress)}>
          <span style={{ width: `${progress}%` }} />
        </div>

        <div className="rufus14-buttons">
          <button type="button" className="w-btn" disabled={busy} onClick={() => setDialog({ kind: 'about' })}>
            About...
          </button>
          <button type="button" className="w-btn" onClick={() => setDialog({ kind: 'log' })}>
            Log
          </button>
          <span />
          <button type="button" className="w-btn w-btn-primary" disabled={busy || !device} onClick={start}>
            Start
          </button>
          <button type="button" className="w-btn" disabled={busy || !onClose} onClick={onClose}>
            Close
          </button>
        </div>
      </div>
      <footer className="rufus14-status" role="status">
        {statusText}
      </footer>

      {picker && (
        <div className="rufus-dialog" role="dialog" aria-label="Open">
          <header>
            <Icon name="folder" size={15} /> Open — This PC › Downloads
          </header>
          <ul>
            {isos.map(f => (
              <li key={f.name}>
                <button type="button" onClick={() => pickIso(f)}>
                  <Icon name="disc" size={16} />
                  <span>{f.name}</span>
                  <small>{f.size}</small>
                </button>
              </li>
            ))}
          </ul>
          <div className="w-buttons">
            <button type="button" className="w-btn" onClick={() => setPicker(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {dialog?.kind === 'warn' && (
        <div className="rufus-dialog rufus-warn" role="alertdialog" aria-label="Rufus">
          <header>
            <Icon name="alert" size={16} /> Rufus
          </header>
          <p>
            WARNING: ALL DATA ON DEVICE '{deviceLabel}' WILL BE DESTROYED.
            <br />
            To continue with this operation, click OK. To quit click CANCEL.
          </p>
          <div className="w-buttons">
            <button type="button" className="w-btn w-btn-primary" onClick={proceed}>
              OK
            </button>
            <button type="button" className="w-btn" onClick={() => setDialog(null)}>
              Cancel
            </button>
          </div>
        </div>
      )}

      {dialog?.kind === 'message' && (
        <div className="rufus-dialog" role="alertdialog" aria-label={dialog.title}>
          <header>
            <Icon name="alert" size={16} /> {dialog.title}
          </header>
          <p>{dialog.text}</p>
          <div className="w-buttons">
            <button type="button" className="w-btn w-btn-primary" onClick={() => setDialog(null)}>
              OK
            </button>
          </div>
        </div>
      )}

      {dialog?.kind === 'about' && (
        <div className="rufus-dialog" role="dialog" aria-label="About Rufus">
          <header>About Rufus</header>
          <p>
            <strong>Rufus {RUFUS_VERSION}</strong>
            <br />
            The Reliable USB Formatting Utility (หน้าจอจำลองเพื่อการเรียนรู้)
          </p>
          <div className="w-buttons">
            <button type="button" className="w-btn w-btn-primary" onClick={() => setDialog(null)}>
              OK
            </button>
          </div>
        </div>
      )}

      {dialog?.kind === 'log' && (
        <div className="rufus-dialog" role="dialog" aria-label="Log">
          <header>Log</header>
          <pre className="rufus14-log">{log.join('\n')}</pre>
          <div className="w-buttons">
            <button type="button" className="w-btn w-btn-primary" onClick={() => setDialog(null)}>
              Close
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
