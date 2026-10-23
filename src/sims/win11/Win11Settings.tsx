// Windows 11 Settings pages (sheet Win11 p.1 "Settings > System > About", p.8–9 Activation, Windows Update,
// Optional updates > Driver updates). They plug into SettingsApp from sims/desktop.
import { useEffect, useState, type ReactNode } from 'react'
import { Icon } from '../../components/Icon'
import { Fact } from '../../screens/workbench/Fact'
import type { UpdateState } from '../desktop/SettingsApp'
import { WIN11_UPDATE_MS } from './media11'
import './win11.css'

const pin = (text: string, fact?: string): ReactNode => (fact ? <Fact id={fact}>{text}</Fact> : text)

export interface SpecRow {
  label: string
  value: string
  fact?: string
}

export function AboutPage11({ device, specs, windows }: { device: string; specs: SpecRow[]; windows: SpecRow[] }) {
  return (
    <div className="w-settings-page w11-page">
      <p className="w11-crumb">System › About</p>
      <h2>{device}</h2>
      <section className="w11-card">
        <h3>Device specifications</h3>
        <dl className="w11-specs">
          {specs.map(r => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd>{pin(r.value, r.fact)}</dd>
            </div>
          ))}
        </dl>
      </section>
      <section className="w11-card">
        <h3>Windows specifications</h3>
        <dl className="w11-specs">
          {windows.map(r => (
            <div key={r.label}>
              <dt>{r.label}</dt>
              <dd>{pin(r.value, r.fact)}</dd>
            </div>
          ))}
        </dl>
      </section>
    </div>
  )
}

export function ActivationPage11({ edition, active, fact }: { edition: string; active: boolean; fact?: string }) {
  return (
    <div className="w-settings-page w11-page">
      <p className="w11-crumb">System › Activation</p>
      <h2>{edition}</h2>
      <section className="w11-card w11-row-card">
        <Icon name={active ? 'check' : 'alert'} size={22} className={active ? 'w-ok' : 'w-fail'} />
        <div>
          <strong>Activation state</strong>
          <small>{pin(active ? 'Windows is activated with a digital license linked to your Microsoft account' : 'Windows reported that no product key was found on your device', fact)}</small>
        </div>
        <span className={`w11-pill ${active ? 'ok' : 'bad'}`}>{active ? 'Active' : 'Not active'}</span>
      </section>
    </div>
  )
}

export interface DriverUpdate {
  id: string
  name: string
}

const RUN_MS = WIN11_UPDATE_MS
const CHECK_MS = 1500
const UPDATES = [
  'Cumulative Update for Windows 11 for x64-based Systems',
  'Security Intelligence Update for Microsoft Defender Antivirus',
  '.NET Framework Cumulative Update for Windows 11 for x64',
]

function status(i: number, t: number) {
  const dlEnd = CHECK_MS + 2600 + i * 800
  const installStart = 5400 + i * 1000
  const installEnd = installStart + 1000
  if (t < dlEnd) return `Downloading - ${Math.max(0, Math.floor(((t - CHECK_MS) / (dlEnd - CHECK_MS)) * 100))}%`
  if (t < installStart) return 'Pending install'
  if (t < installEnd) return `Installing - ${Math.floor(((t - installStart) / (installEnd - installStart)) * 100)}%`
  return 'Pending restart'
}

type View = 'main' | 'advanced' | 'optional'

/**
 * Settings > Windows Update. Controlled by the job, because "Restart now" restarts the whole simulated PC.
 * `drivers` are offered under Advanced options > Optional updates > Driver updates.
 */
export function UpdatePage11({
  state,
  startedAt,
  onCheck,
  onRestart,
  drivers,
  onInstallDrivers,
  onView,
  upToDateFact,
}: {
  state: UpdateState
  startedAt: number | null
  onCheck: () => void
  onRestart: () => void
  drivers: DriverUpdate[]
  onInstallDrivers: (ids: string[]) => void
  onView?: (view: View) => void
  upToDateFact?: string
}) {
  const [view, setView] = useState<View>('main')
  const [now, setNow] = useState(0)
  const [picked, setPicked] = useState<string[]>([])
  const [driversOpen, setDriversOpen] = useState(true)
  useEffect(() => {
    if (state !== 'working') return
    const t = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(t)
  }, [state])
  const t = state === 'working' ? (startedAt && now ? Math.max(0, now - startedAt) : 0) : RUN_MS
  const go = (v: View) => {
    setView(v)
    onView?.(v)
  }

  if (view === 'advanced') {
    return (
      <div className="w-settings-page w11-page">
        <p className="w11-crumb">
          <button type="button" className="w11-link" onClick={() => go('main')}>
            Windows Update
          </button>{' '}
          › Advanced options
        </p>
        <h2>Advanced options</h2>
        <button type="button" className="w11-card w11-row-card w11-row-btn" onClick={() => go('optional')}>
          <Icon name="download" size={20} />
          <div>
            <strong>Optional updates</strong>
            <small>Feature, quality, and driver updates</small>
          </div>
          <span className="w11-pill">{drivers.length} available</span>
        </button>
        <div className="w11-card w11-row-card is-muted">
          <Icon name="refresh" size={20} />
          <div>
            <strong>Active hours</strong>
            <small>Currently 8:00 AM to 5:00 PM</small>
          </div>
        </div>
      </div>
    )
  }

  if (view === 'optional') {
    return (
      <div className="w-settings-page w11-page">
        <p className="w11-crumb">
          <button type="button" className="w11-link" onClick={() => go('main')}>
            Windows Update
          </button>{' '}
          ›{' '}
          <button type="button" className="w11-link" onClick={() => go('advanced')}>
            Advanced options
          </button>{' '}
          › Optional updates
        </p>
        <h2>Optional updates</h2>
        <section className="w11-card">
          <button type="button" className="w11-expander" aria-expanded={driversOpen} onClick={() => setDriversOpen(o => !o)}>
            <strong>Driver updates</strong>
            <Icon name={driversOpen ? 'chevronUp' : 'chevronDown'} size={16} />
          </button>
          {driversOpen &&
            (drivers.length ? (
              <>
                <p className="w-small">If you have a specific problem, one of these drivers might help. Otherwise, automatic updates will keep your drivers up to date.</p>
                {drivers.map(d => (
                  <label key={d.id} className="w11-check">
                    <input type="checkbox" checked={picked.includes(d.id)} onChange={e => setPicked(p => (e.target.checked ? [...p, d.id] : p.filter(x => x !== d.id)))} />
                    {d.name}
                  </label>
                ))}
                <button
                  type="button"
                  className="w-btn w-btn-primary"
                  disabled={picked.length === 0}
                  onClick={() => {
                    onInstallDrivers(picked)
                    setPicked([])
                  }}
                >
                  Download & install
                </button>
              </>
            ) : (
              <p className="w-small">No optional updates available right now.</p>
            ))}
        </section>
      </div>
    )
  }

  return (
    <div className="w-settings-page w11-page">
      <h2>Windows Update</h2>
      <section className="w11-card w11-update-head">
        <Icon name={state === 'done' ? 'check' : state === 'restart' ? 'refresh' : 'download'} size={30} className={state === 'done' ? 'w-ok' : undefined} />
        <div>
          {state === 'idle' && (
            <>
              <strong>Updates available</strong>
              <small>Last checked: Never</small>
            </>
          )}
          {state === 'working' && (
            <>
              <strong>{t < CHECK_MS ? 'Checking for updates…' : 'Updates are downloading and installing'}</strong>
              <small>Your device will restart when it's needed to finish.</small>
            </>
          )}
          {state === 'restart' && (
            <>
              <strong>Restart required</strong>
              <small>Your device needs to restart to install updates.</small>
            </>
          )}
          {state === 'done' && (
            <>
              <strong>{pin("You're up to date", upToDateFact)}</strong>
              <small>Last checked: Today, 10:12 AM</small>
            </>
          )}
        </div>
        {state === 'restart' ? (
          <button type="button" className="w-btn w-btn-primary" onClick={onRestart}>
            Restart now
          </button>
        ) : (
          <button type="button" className="w-btn w-btn-primary" disabled={state === 'working'} onClick={onCheck}>
            Check for updates
          </button>
        )}
      </section>
      {(state === 'restart' || (state === 'working' && t >= CHECK_MS)) && (
        <ul className="w11-update-list">
          {UPDATES.map((n, i) => (
            <li key={n}>
              <span>{n}</span>
              <small>{status(i, t)}</small>
            </li>
          ))}
        </ul>
      )}
      <h3 className="w11-sub">More options</h3>
      <div className="w11-card w11-row-card is-muted">
        <Icon name="clock" size={20} />
        <div>
          <strong>Pause updates</strong>
        </div>
        <span className="w11-pill">Pause for 1 week</span>
      </div>
      <button type="button" className="w11-card w11-row-card w11-row-btn" onClick={() => go('advanced')}>
        <Icon name="gear" size={20} />
        <div>
          <strong>Advanced options</strong>
          <small>Delivery optimization, optional updates, active hours, other update settings</small>
        </div>
        <Icon name="chevronRight" size={16} />
      </button>
    </div>
  )
}
