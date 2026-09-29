import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { ISO_FILES, SCHEME_LABEL, type RufusConfig, type RufusDevice, type RufusIso, type Scheme } from './media'
import './windows.css'

const VOLUME_LABEL: Record<RufusIso['kind'], string> = { windows: 'WIN10_TH', ubuntu: 'Ubuntu 20.04.6 LTS amd64', office: 'OFFICE2019' }

interface Props {
  /** the first device is selected when Rufus opens */
  devices: RufusDevice[]
  isos?: RufusIso[]
  /** preselected partition scheme; each job picks one the player has to think about */
  defaultScheme?: Scheme
  /** START was pressed with a bootable image; call `next()` to show Rufus's own warning */
  onReview?: (config: RufusConfig, next: () => void) => void
  /** OK on the warning; return false when the sim stops the write (e.g. a mistake was made) */
  onStart: (config: RufusConfig) => boolean
  onDone: (config: RufusConfig) => void
  onClose?: () => void
}

export function Rufus({ devices, isos = ISO_FILES, defaultScheme = 'gpt-uefi', onReview, onStart, onDone, onClose }: Props) {
  const [device, setDevice] = useState(devices[0]?.id ?? '')
  const [iso, setIso] = useState<RufusIso | null>(null)
  const [scheme, setScheme] = useState<Scheme>(defaultScheme)
  const [picker, setPicker] = useState(false)
  const [confirm, setConfirm] = useState(false)
  const [status, setStatus] = useState<{ text: string; tone: 'ready' | 'busy' | 'error' | 'done' }>({ text: 'READY', tone: 'ready' })

  const busy = status.tone === 'busy'
  const deviceLabel = devices.find(d => d.id === device)?.label ?? 'NO DEVICE'
  const config = (): RufusConfig | null => (iso ? { device, iso, scheme } : null)

  const start = () => {
    const c = config()
    if (!c) {
      setStatus({ text: 'ยังไม่ได้เลือกไฟล์ ISO — กดปุ่ม SELECT', tone: 'error' })
      return
    }
    if (c.iso.kind === 'office') {
      setStatus({ text: 'This image is not bootable — ไฟล์นี้เป็นโปรแกรม Office ไม่ใช่ระบบที่บูตได้', tone: 'error' })
      return
    }
    if (onReview) onReview(c, () => setConfirm(true))
    else setConfirm(true)
  }

  const proceed = () => {
    setConfirm(false)
    const c = config()
    if (!c) return
    if (!onStart(c)) {
      setStatus({ text: 'หยุดการทำงาน', tone: 'error' })
      return
    }
    setStatus({ text: 'Copying ISO files...', tone: 'busy' })
    window.setTimeout(() => {
      setStatus({ text: 'READY — เสร็จแล้ว', tone: 'done' })
      onDone(c)
    }, 3400)
  }

  return (
    <div className="rufus" role="group" aria-label="Rufus จำลอง">
      <header className="rufus-title">
        <Icon name="usb" size={15} /> Rufus 3.4 (จำลอง)
        {onClose && (
          <button type="button" className="rufus-x" aria-label="ปิด Rufus" disabled={busy} onClick={onClose}>
            <Icon name="x" size={14} />
          </button>
        )}
      </header>
      <div className="rufus-body">
        <h3>Drive Properties</h3>
        <label className="rufus-field">
          <span>Device</span>
          <select value={device} disabled={busy} onChange={e => setDevice(e.target.value)}>
            {devices.map(d => (
              <option key={d.id} value={d.id}>
                {d.label}
              </option>
            ))}
          </select>
        </label>
        <div className="rufus-field">
          <span>Boot selection</span>
          <div className="rufus-row">
            <output className="rufus-out">{iso?.name ?? 'Disk or ISO image (Please select)'}</output>
            <button type="button" className="w-btn" disabled={busy} onClick={() => setPicker(true)}>
              SELECT
            </button>
          </div>
        </div>
        <label className="rufus-field">
          <span>Partition scheme and target system type</span>
          <select value={scheme} disabled={busy} onChange={e => setScheme(e.target.value as Scheme)}>
            {(Object.keys(SCHEME_LABEL) as Scheme[]).map(s => (
              <option key={s} value={s}>
                {SCHEME_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <h3>Format Options</h3>
        <div className="rufus-field">
          <span>Volume label</span>
          <output className="rufus-out">{iso ? VOLUME_LABEL[iso.kind] : 'NO_LABEL'}</output>
        </div>
        <div className="rufus-grid">
          <div className="rufus-field">
            <span>File system</span>
            <output className="rufus-out" title="ตัวอย่างในใบเนื้อหาใช้ NTFS">
              NTFS
            </output>
          </div>
          <div className="rufus-field">
            <span>Cluster size</span>
            <output className="rufus-out" title="ตัวอย่างในใบเนื้อหาใช้ 4096">
              4096 bytes (Default)
            </output>
          </div>
        </div>
        <h3>Status</h3>
        <div className={`rufus-status rufus-${status.tone}`} role="status">
          <span className="rufus-fill" />
          <em>{status.text}</em>
        </div>
        <div className="w-buttons">
          <button type="button" className="w-btn w-btn-primary" disabled={busy || status.tone === 'done' || !device} onClick={start}>
            START
          </button>
          <button type="button" className="w-btn" disabled={busy || !onClose} onClick={onClose}>
            CLOSE
          </button>
        </div>
      </div>

      {picker && (
        <div className="rufus-dialog" role="dialog" aria-label="เลือกไฟล์ ISO">
          <header>Open — C:\Users\Shop\Downloads</header>
          <ul>
            {isos.map(f => (
              <li key={f.name}>
                <button
                  type="button"
                  onClick={() => {
                    setIso(f)
                    setPicker(false)
                    setStatus({ text: 'READY', tone: 'ready' })
                  }}
                >
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

      {confirm && (
        <div className="rufus-dialog rufus-warn" role="alertdialog" aria-label="คำเตือน">
          <header>
            <Icon name="alert" size={16} /> Rufus
          </header>
          <p>
            WARNING: ALL DATA ON DEVICE <strong>'{deviceLabel}'</strong> WILL BE DESTROYED.
            <br />
            To continue with this operation, click OK. To quit click CANCEL.
          </p>
          <p className="rufus-thai">คำเตือน: ข้อมูลทั้งหมดในอุปกรณ์นี้จะถูกลบ</p>
          <div className="w-buttons">
            <button type="button" className="w-btn w-btn-primary" onClick={proceed}>
              OK
            </button>
            <button type="button" className="w-btn" onClick={() => setConfirm(false)}>
              Cancel
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
