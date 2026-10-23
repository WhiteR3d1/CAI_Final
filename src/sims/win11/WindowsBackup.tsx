// Windows Backup "Let's back up your PC" (sheet Win11 p.9, figure 16).
import { useEffect, useEffectEvent, useState } from 'react'
import { Icon, type IconName } from '../../components/Icon'
import './win11.css'

const ROWS: { icon: IconName; title: string; text: string }[] = [
  { icon: 'folder', title: 'Folders', text: 'Back up files from Desktop, Documents, and Pictures folders to OneDrive' },
  { icon: 'app', title: 'Apps', text: 'Remember installed apps and pinned app preferences' },
  { icon: 'gear', title: 'Settings', text: 'Remember Windows settings and preferences' },
  { icon: 'lock', title: 'Credentials', text: 'Remember Accounts, Wi-Fi networks and other passwords' },
]

export function WindowsBackup({ device, onBackedUp, onCancel }: { device: string; onBackedUp: () => void; onCancel?: () => void }) {
  const [state, setState] = useState<'idle' | 'working' | 'done'>('idle')
  const [percent, setPercent] = useState(0)
  const done = useEffectEvent(() => onBackedUp())
  useEffect(() => {
    if (state !== 'working') return
    const started = Date.now()
    const t = window.setInterval(() => {
      const p = Math.min(100, Math.floor(((Date.now() - started) / 4000) * 100))
      setPercent(p)
      if (p >= 100) {
        window.clearInterval(t)
        setState('done')
        done()
      }
    }, 150)
    return () => window.clearInterval(t)
  }, [state])

  return (
    <div className="w-app w11-backup">
      <h2>{state === 'done' ? "You're backed up" : "Let's back up your PC"}</h2>
      <p className="w-small">We'll back up your info in the cloud so you can have peace of mind knowing it's protected, even if something happens to this PC.</p>
      <section className="w11-card w11-backup-device">
        <Icon name="monitor" size={30} />
        <div>
          <strong>{device}</strong>
          <small>Last backup: {state === 'done' ? 'Just now' : 'Never'}</small>
        </div>
        {state === 'done' && <Icon name="check" size={22} className="w-ok" />}
      </section>
      {ROWS.map(r => (
        <div key={r.title} className="w11-card w11-row-card">
          <Icon name={r.icon} size={20} />
          <div>
            <strong>{r.title}</strong>
            <small>{r.text}</small>
          </div>
          {state === 'done' && <Icon name="check" size={16} className="w-ok" />}
        </div>
      ))}
      {state === 'working' && (
        <div className="w11-bar" role="progressbar" aria-valuenow={percent} aria-valuemin={0} aria-valuemax={100}>
          <span style={{ transform: `scaleX(${percent / 100})` }} />
        </div>
      )}
      <div className="w11-backup-foot">
        <small className="w-small">Storage used: 2.1 GB of 5 GB</small>
        {state === 'idle' && (
          <span className="w-buttons">
            <button type="button" className="w-btn" onClick={onCancel}>
              Cancel
            </button>
            <button type="button" className="w-btn w-btn-primary" onClick={() => setState('working')}>
              Back up
            </button>
          </span>
        )}
        {state === 'working' && <small>Backing up… {percent}%</small>}
      </div>
    </div>
  )
}
