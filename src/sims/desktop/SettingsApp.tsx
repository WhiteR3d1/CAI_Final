import { useState, type ReactNode } from 'react'
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

export type UpdateState = 'idle' | 'checking' | 'restart' | 'done'

/**
 * Settings > Update & Security > Windows Update (content sheet step 17).
 * Controlled: the job keeps the state because "Restart now" restarts the whole simulated PC.
 */
export function UpdatePage({ state, onCheck, onRestart }: { state: UpdateState; onCheck: () => void; onRestart: () => void }) {
  return (
    <div className="w-settings-page">
      <h2>Windows Update</h2>
      {state === 'done' && (
        <div className="w-update-ok">
          <Icon name="check" size={28} />
          <div>
            <strong>You're up to date</strong>
            <p className="w-small">ติดตั้งอัปเดต 3 รายการแล้ว Windows เป็นเวอร์ชันล่าสุด · Last checked: Today, 09:52</p>
          </div>
        </div>
      )}
      {state === 'idle' && <p className="w-small">Updates available? ตรวจสอบว่า Windows ที่เพิ่งติดตั้งเป็นเวอร์ชันล่าสุดหรือไม่</p>}
      {state === 'checking' && (
        <p className="w-small">
          <span className="dt-spinner dt-spinner-dark" aria-hidden /> Checking for updates… กำลังดาวน์โหลดและติดตั้งอัปเดต
        </p>
      )}
      {state === 'restart' && (
        <div className="w-update-restart">
          <Icon name="refresh" size={24} />
          <div>
            <strong>Restart required</strong>
            <p className="w-small">อัปเดตพร้อมแล้ว ต้องรีสตาร์ตเครื่องเพื่อให้การติดตั้งเสร็จสมบูรณ์</p>
          </div>
        </div>
      )}
      {state === 'restart' ? (
        <button type="button" className="w-btn w-btn-primary" onClick={onRestart}>
          Restart now
        </button>
      ) : (
        <button type="button" className="w-btn w-btn-primary" disabled={state === 'checking'} onClick={onCheck}>
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
