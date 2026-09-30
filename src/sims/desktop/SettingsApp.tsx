import { useEffect, useState, type ReactNode } from 'react'
import { Icon, type IconName } from '../../components/Icon'

export interface SettingsPage {
  id: string
  label: string
  icon: IconName
  render: () => ReactNode
}

export function SettingsApp({ pages, initial, onPage }: { pages: SettingsPage[]; initial?: string; onPage?: (id: string) => void }) {
  const [pageId, setPageId] = useState(initial ?? pages[0].id)
  const page = pages.find(p => p.id === pageId) ?? pages[0]
  return (
    <div className="w-app w-settings">
      <nav className="w-settings-nav" aria-label="Settings">
        <strong>Settings</strong>
        {pages.map(p => (
          <button
            key={p.id}
            type="button"
            className={p.id === page.id ? 'on' : undefined}
            onClick={() => {
              setPageId(p.id)
              onPage?.(p.id)
            }}
          >
            <Icon name={p.icon} size={16} />
            {p.label}
          </button>
        ))}
      </nav>
      <div className="w-settings-main">{page.render()}</div>
    </div>
  )
}

export type UpdateState = 'idle' | 'working' | 'restart' | 'done'

/** duration of the whole check → download → install run; keep in sync with UPDATE_MS in sims/windows/media.ts */
const RUN_MS = 10000
const CHECK_MS = 1500

function updateNames(arch: 'x86' | 'x64') {
  return [
    `Cumulative Update for Windows 10 Version 22H2 for ${arch}-based Systems`,
    `Security Intelligence Update for Microsoft Defender Antivirus`,
    `Windows Malicious Software Removal Tool ${arch}`,
  ]
}

/** status text of update i at time t (ms since "Check for updates") */
function updateStatus(i: number, t: number) {
  const dlEnd = CHECK_MS + 3000 + i * 900
  const installStart = 6200 + i * 1100
  const installEnd = installStart + 1100
  if (t < dlEnd) return `Downloading - ${Math.max(0, Math.floor(((t - CHECK_MS) / (dlEnd - CHECK_MS)) * 100))}%`
  if (t < installStart) return 'Pending install'
  if (t < installEnd) return `Installing - ${Math.floor(((t - installStart) / (installEnd - installStart)) * 100)}%`
  return 'Pending restart'
}

/**
 * Settings > Update & Security > Windows Update (content sheet step 17).
 * Controlled: the job keeps the state because "Restart now" restarts the whole simulated PC;
 * `startedAt` lets the progress continue correctly even if the window is closed and reopened.
 */
export function UpdatePage({
  state,
  startedAt,
  arch = 'x64',
  onCheck,
  onRestart,
}: {
  state: UpdateState
  startedAt: number | null
  arch?: 'x86' | 'x64'
  onCheck: () => void
  onRestart: () => void
}) {
  const [now, setNow] = useState(0)
  useEffect(() => {
    if (state !== 'working') return
    const t = window.setInterval(() => setNow(Date.now()), 250)
    return () => window.clearInterval(t)
  }, [state])

  const t = state === 'working' ? (startedAt && now ? Math.max(0, now - startedAt) : 0) : RUN_MS
  const names = updateNames(arch)

  return (
    <div className="w-settings-page">
      <h2>Windows Update</h2>
      {state === 'done' && (
        <div className="w-update-ok">
          <Icon name="check" size={28} />
          <div>
            <strong>You're up to date</strong>
            <p className="w-small">Last checked: Today, 10:05</p>
          </div>
        </div>
      )}
      {state === 'idle' && <p className="w-small">Last checked: Never</p>}
      {state === 'working' && t < CHECK_MS && (
        <p className="w-small">
          <span className="dt-spinner dt-spinner-dark" aria-hidden /> Checking for updates...
        </p>
      )}
      {state === 'restart' && (
        <div className="w-update-restart">
          <Icon name="refresh" size={24} />
          <div>
            <strong>Restart required</strong>
            <p className="w-small">Your device will restart outside of active hours.</p>
          </div>
        </div>
      )}
      {(state === 'restart' || (state === 'working' && t >= CHECK_MS)) && (
        <ul className="w-update-list">
          {names.map((n, i) => (
            <li key={n}>
              <span>{n}</span>
              <small>Status: {updateStatus(i, t)}</small>
            </li>
          ))}
        </ul>
      )}
      {state === 'restart' ? (
        <button type="button" className="w-btn w-btn-primary" onClick={onRestart}>
          Restart now
        </button>
      ) : (
        <button type="button" className="w-btn w-btn-primary" disabled={state === 'working'} onClick={onCheck}>
          Check for updates
        </button>
      )}
    </div>
  )
}

export function ActivationPage({ activated, edition }: { activated: boolean; edition: string }) {
  return (
    <div className="w-settings-page">
      <h2>Activation</h2>
      <dl className="w-dl">
        <div>
          <dt>Edition:</dt>
          <dd>{edition}</dd>
        </div>
        <div>
          <dt>Activation:</dt>
          <dd className={activated ? 'w-ok' : 'w-fail'}>{activated ? 'Windows is activated with a digital license' : 'Windows is not activated'}</dd>
        </div>
      </dl>
    </div>
  )
}
