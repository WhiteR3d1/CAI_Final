// Windows tools the Windows 11 content sheet uses to check a PC (sheet p.1 and p.4):
// System Information (msinfo32), TPM Management (tpm.msc), PC Health Check, BitLocker recovery key, UAC.
// Screens show real English text; the job decides what counts as a mistake.
import { useEffect, useEffectEvent, useState, type ReactNode } from 'react'
import { Icon } from '../../components/Icon'
import { Fact } from '../../screens/workbench/Fact'
import './win11.css'

export interface InfoRow {
  label: string
  value: string
  /** evidence id the player can pin */
  fact?: string
}

const shown = (value: string, fact?: string): ReactNode => (fact ? <Fact id={fact}>{value}</Fact> : value)

/** System Information → System Summary */
export function SystemInfo({ rows }: { rows: InfoRow[] }) {
  return (
    <div className="w-app w11-msinfo">
      <div className="w11-menubar" aria-hidden>
        <span>File</span>
        <span>Edit</span>
        <span>View</span>
        <span>Help</span>
      </div>
      <div className="w11-msinfo-body">
        <ul className="w11-msinfo-tree" aria-label="หมวดข้อมูล">
          <li className="on">System Summary</li>
          <li>+ Hardware Resources</li>
          <li>+ Components</li>
          <li>+ Software Environment</li>
        </ul>
        <div className="w11-msinfo-scroll">
          <table className="w11-table">
            <thead>
              <tr>
                <th>Item</th>
                <th>Value</th>
              </tr>
            </thead>
            <tbody>
              {rows.map(r => (
                <tr key={r.label}>
                  <td>{r.label}</td>
                  <td>{shown(r.value, r.fact)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}

/** TPM Management on Local Computer (tpm.msc) */
export function TpmConsole({ ready, fact }: { ready: boolean; fact?: string }) {
  const status = ready
    ? 'The TPM is ready for use.'
    : 'Compatible TPM cannot be found on this computer. Verify that this computer has a 1.2 TPM or later and it is turned on in the BIOS.'
  return (
    <div className="w-app w11-mmc">
      <h3 className="w11-mmc-title">TPM Management on Local Computer</h3>
      <p className="w-small">Configures the TPM and its support by the Windows platform</p>
      <section className="w11-mmc-box">
        <h4>Status</h4>
        <p>{shown(status, fact)}</p>
      </section>
      {ready && (
        <section className="w11-mmc-box">
          <h4>TPM Manufacturer Information</h4>
          <dl className="w-dl">
            <div>
              <dt>Manufacturer Name:</dt>
              <dd>BLOOM</dd>
            </div>
            <div>
              <dt>Specification Version:</dt>
              <dd>2.0</dd>
            </div>
          </dl>
        </section>
      )}
    </div>
  )
}

export interface HealthRow {
  ok: boolean
  text: string
  detail: string
  fact?: string
}

/** PC Health Check: "Introducing Windows 11 · Check now" then the requirement list. */
export function PcHealthCheck({ rows, onChecked, device = 'PLOY-NB · 8 GB RAM · 256 GB SSD' }: { rows: HealthRow[]; onChecked?: () => void; device?: string }) {
  const [state, setState] = useState<'intro' | 'checking' | 'result'>('intro')
  const done = useEffectEvent(() => onChecked?.())
  useEffect(() => {
    if (state !== 'checking') return
    const t = window.setTimeout(() => {
      setState('result')
      done()
    }, 1600)
    return () => window.clearTimeout(t)
  }, [state])
  const pass = rows.every(r => r.ok)

  return (
    <div className="w-app w11-health">
      <div className="w11-health-head">
        <span className="w11-health-logo" aria-hidden />
        <div>
          <strong>PC health at a glance</strong>
          <p className="w-small">{device}</p>
        </div>
      </div>
      {state !== 'result' ? (
        <div className="w11-health-card">
          <strong>Introducing Windows 11</strong>
          <p className="w-small">Let's check if this PC meets the system requirements. If it does, you can get the free upgrade when it's available.</p>
          <button type="button" className="w-btn w-btn-primary" disabled={state === 'checking'} onClick={() => setState('checking')}>
            {state === 'checking' ? 'Checking…' : 'Check now'}
          </button>
        </div>
      ) : (
        <div className={`w11-health-result${pass ? ' is-pass' : ''}`} role="status">
          <h3>
            <Icon name={pass ? 'check' : 'alert'} size={20} />
            {pass ? 'This PC meets Windows 11 requirements' : "This PC doesn't currently meet Windows 11 system requirements"}
          </h3>
          <ul>
            {rows.map(r => (
              <li key={r.text} className={r.ok ? 'ok' : 'no'}>
                <Icon name={r.ok ? 'check' : 'x'} size={16} />
                <div>
                  <span>{r.text}</span>
                  <small>{shown(r.detail, r.fact)}</small>
                </div>
              </li>
            ))}
          </ul>
          <button type="button" className="w-btn" onClick={() => setState('checking')}>
            Check again
          </button>
        </div>
      )}
    </div>
  )
}

export type KeyBackup = 'account' | 'usb' | 'file' | 'print'

interface KeyDrive {
  id: string
  label: string
  /** removable drives are offered for "Save to a USB flash drive" */
  removable: boolean
}

/**
 * Control Panel → BitLocker Drive Encryption → Back up your recovery key.
 * `onBackup` returns null when the key was saved, or the error text Windows shows.
 */
export function BitLockerPanel({ drives, accountSignedIn, onBackup }: { drives: KeyDrive[]; accountSignedIn: boolean; onBackup: (method: KeyBackup, drive?: string) => string | null }) {
  const [panel, setPanel] = useState<null | 'how' | 'usb' | 'file' | { done: string } | { error: string }>(null)
  const [drive, setDrive] = useState('')
  const choices = panel === 'usb' ? drives.filter(d => d.removable) : drives

  const save = (method: KeyBackup, where?: string) => {
    const error = onBackup(method, where)
    setPanel(error ? { error } : { done: method === 'print' ? 'The recovery key was sent to the printer.' : 'Your recovery key has been saved.' })
  }

  return (
    <div className="w-app w11-cpl">
      <p className="w-small">Control Panel › System and Security › BitLocker Drive Encryption</p>
      <h3 className="w11-cpl-title">BitLocker Drive Encryption</h3>
      <p className="w-small">Help protect your files and folders from unauthorized access by protecting your drives with BitLocker.</p>
      <section className="w11-cpl-drive">
        <h4>Operating system drive</h4>
        <div className="w11-cpl-row">
          <Icon name="hdd" size={22} />
          <strong>C: BitLocker on</strong>
        </div>
        <div className="w11-cpl-links">
          <span className="w11-link is-muted">Suspend protection</span>
          <button type="button" className="w11-link" onClick={() => setPanel('how')}>
            Back up your recovery key
          </button>
          <span className="w11-link is-muted">Turn off BitLocker</span>
        </div>
      </section>

      {panel && (
        <div className="w-sheet" role="dialog" aria-label="Back up your recovery key">
          <header className="w-sheet-head">
            <span>BitLocker Drive Encryption (C:)</span>
            <button type="button" className="dt-close" aria-label="ปิด" onClick={() => setPanel(null)}>
              <Icon name="x" size={14} />
            </button>
          </header>
          <div className="w-sheet-body">
            {panel === 'how' && (
              <>
                <h3 className="w-h">How do you want to back up your recovery key?</h3>
                <p className="w-small">A recovery key can be used to access your files and folders if you're having problems unlocking your PC.</p>
                <button type="button" className="w-bigopt" disabled={!accountSignedIn} onClick={() => save('account')}>
                  <strong>→ Save to your Microsoft account</strong>
                  {!accountSignedIn && <span>Sign in with a Microsoft account to use this option.</span>}
                </button>
                <button type="button" className="w-bigopt" onClick={() => setPanel('usb')}>
                  <strong>→ Save to a USB flash drive</strong>
                </button>
                <button type="button" className="w-bigopt" onClick={() => setPanel('file')}>
                  <strong>→ Save to a file</strong>
                </button>
                <button type="button" className="w-bigopt" onClick={() => save('print')}>
                  <strong>→ Print the recovery key</strong>
                </button>
              </>
            )}
            {(panel === 'usb' || panel === 'file') && (
              <>
                <h3 className="w-h">{panel === 'usb' ? 'Save your recovery key to a USB flash drive' : 'Save BitLocker recovery key as'}</h3>
                <div className="w-radio-list" role="radiogroup" aria-label="ตำแหน่งที่บันทึก">
                  {choices.map(d => (
                    <label key={d.id}>
                      <input type="radio" name="bl-drive" checked={drive === d.id} onChange={() => setDrive(d.id)} />
                      <Icon name={d.removable ? 'usb' : 'hdd'} size={15} /> {d.label}
                      {panel === 'file' && <small className="w-small"> \BitLocker Recovery Key 4F2A9C1E.TXT</small>}
                    </label>
                  ))}
                </div>
                <div className="w-buttons">
                  <button type="button" className="w-btn" onClick={() => setPanel('how')}>
                    Back
                  </button>
                  <button type="button" className="w-btn w-btn-primary" disabled={!drive} onClick={() => save(panel, drive)}>
                    Save
                  </button>
                </div>
              </>
            )}
            {typeof panel === 'object' && (
              <>
                <h3 className={`w-h ${'done' in panel ? 'w-ok' : 'w-fail'}`}>
                  <Icon name={'done' in panel ? 'check' : 'alert'} size={18} /> {'done' in panel ? panel.done : 'BitLocker Drive Encryption'}
                </h3>
                {'error' in panel && <p>{panel.error}</p>}
                <div className="w-buttons">
                  {'error' in panel && (
                    <button type="button" className="w-btn" onClick={() => setPanel('how')}>
                      Back
                    </button>
                  )}
                  <button type="button" className="w-btn w-btn-primary" onClick={() => setPanel(null)}>
                    {'done' in panel ? 'Finish' : 'OK'}
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

/** User Account Control prompt (needs administrator rights). */
export function UacPrompt({ app, onYes, onNo }: { app: string; onYes: () => void; onNo: () => void }) {
  return (
    <div className="w11-uac-backdrop">
      <div className="w11-uac" role="alertdialog" aria-label="User Account Control">
        <div className="w11-uac-head">
          <small>User Account Control</small>
          <strong>Do you want to allow this app to make changes to your device?</strong>
        </div>
        <div className="w11-uac-body">
          <div className="w11-uac-app">
            <Icon name="app" size={26} />
            <strong>{app}</strong>
          </div>
          <p className="w-small">
            Verified publisher: Microsoft Corporation
            <br />
            File origin: Downloaded from the Internet
          </p>
        </div>
        <div className="w11-uac-btns">
          <button type="button" className="w-btn w-btn-primary" onClick={onYes}>
            Yes
          </button>
          <button type="button" className="w-btn" onClick={onNo}>
            No
          </button>
        </div>
      </div>
    </div>
  )
}

/** File copy progress, sped up for class time. */
export function CopyProgress({ title, ms = 6000, onDone }: { title: string; ms?: number; onDone: () => void }) {
  const [percent, setPercent] = useState(0)
  const done = useEffectEvent(() => onDone())
  useEffect(() => {
    const started = Date.now()
    const t = window.setInterval(() => {
      const p = Math.min(100, Math.floor(((Date.now() - started) / ms) * 100))
      setPercent(p)
      if (p >= 100) {
        window.clearInterval(t)
        done()
      }
    }, 150)
    return () => window.clearInterval(t)
  }, [ms])
  return (
    <div className="w11-copy" role="status">
      <strong>{title}</strong>
      <small>{percent}% complete</small>
      <div className="w11-copy-bar">
        <span style={{ transform: `scaleX(${percent / 100})` }} />
      </div>
      <small className="muted">(เกมเร่งเวลาให้ ของจริงใช้เวลานานกว่านี้)</small>
    </div>
  )
}
