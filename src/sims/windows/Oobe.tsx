import { useEffect, useEffectEvent, useState } from 'react'
import { Icon } from '../../components/Icon'
import { PRIVACY_DEFAULTS, type PrivacyChoice } from './media'
import './windows.css'

export type OobeStep = 'region' | 'keyboard' | 'second' | 'second-pick' | 'account' | 'name' | 'password' | 'pin' | 'phone' | 'onedrive' | 'privacy' | 'finishing'

const REGIONS = ['Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'United States']
const KEYBOARDS = ['US', 'Thai Kedmanee', 'United Kingdom', 'Canadian Multilingual Standard']
const SECOND_LAYOUTS = ['Thai Kedmanee', 'Thai Pattachote', 'Japanese', 'Chinese (Simplified)']

interface Props {
  onStep?: (step: OobeStep) => void
  onRegion?: (region: string) => void
  onKeyboard?: (layout: string) => void
  onSecond?: (layout: string | null) => void
  /** Microsoft account (email typed or Create account) or Offline account; call next() to continue or back() to stay */
  onAccount: (kind: 'microsoft' | 'offline', next: () => void, back: () => void) => void
  onName?: (name: string) => void
  /** return false to stay on the password page */
  onPassword?: (hasPassword: boolean) => boolean
  onPrivacy?: (choices: PrivacyChoice[]) => void
  onDone: () => void
}

function Finishing({ onDone }: { onDone: () => void }) {
  const done = useEffectEvent(() => onDone())
  useEffect(() => {
    const t = window.setTimeout(() => done(), 2200)
    return () => window.clearTimeout(t)
  }, [])
  return (
    <div className="oobe oobe-finish">
      <span className="dt-spinner" aria-hidden />
      <h2>Hi.</h2>
      <p>We're setting things up for you</p>
    </div>
  )
}

function Choices({ items, value, onPick, label }: { items: string[]; value: string; onPick: (v: string) => void; label: string }) {
  return (
    <div className="oobe-list" role="listbox" aria-label={label}>
      {items.map(r => (
        <button key={r} type="button" role="option" aria-selected={value === r} className={value === r ? 'on' : undefined} onClick={() => onPick(r)}>
          {r}
        </button>
      ))}
    </div>
  )
}

/** Out-of-box experience after installation (content sheet steps 10–16). */
export function Oobe({ onStep, onRegion, onKeyboard, onSecond, onAccount, onName, onPassword, onPrivacy, onDone }: Props) {
  const [step, setStep] = useState<OobeStep>('region')
  const [region, setRegion] = useState('United States')
  const [keyboard, setKeyboard] = useState('US')
  const [second, setSecond] = useState('Thai Kedmanee')
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')
  const [pw, setPw] = useState('')
  const [pw2, setPw2] = useState('')
  const [pwError, setPwError] = useState('')
  const [pin, setPin] = useState('')
  const [phone, setPhone] = useState('')
  const [privacy, setPrivacy] = useState<PrivacyChoice[]>(PRIVACY_DEFAULTS)

  const go = (next: OobeStep) => {
    setStep(next)
    onStep?.(next)
  }

  if (step === 'finishing') return <Finishing onDone={onDone} />

  return (
    <div className="oobe">
      {step === 'region' && (
        <>
          <h2>Let's start with region. Is this right?</h2>
          <p>เลือกอยู่: {region}</p>
          <Choices items={REGIONS} value={region} onPick={setRegion} label="Region" />
          <button
            type="button"
            className="oobe-btn"
            onClick={() => {
              onRegion?.(region)
              go('keyboard')
            }}
          >
            Yes
          </button>
        </>
      )}

      {step === 'keyboard' && (
        <>
          <h2>Is this the right keyboard layout?</h2>
          <p>If you also use another keyboard layout, you can add that next.</p>
          <Choices items={KEYBOARDS} value={keyboard} onPick={setKeyboard} label="Keyboard" />
          <button
            type="button"
            className="oobe-btn"
            onClick={() => {
              onKeyboard?.(keyboard)
              go('second')
            }}
          >
            Yes
          </button>
        </>
      )}

      {step === 'second' && (
        <>
          <h2>Do you want to add a second keyboard layout?</h2>
          <Icon name="keyboard" size={54} />
          <div className="oobe-row">
            <button type="button" className="oobe-btn oobe-ghost" onClick={() => go('second-pick')}>
              Add layout
            </button>
            <button
              type="button"
              className="oobe-btn"
              onClick={() => {
                onSecond?.(null)
                go('account')
              }}
            >
              Skip
            </button>
          </div>
        </>
      )}

      {step === 'second-pick' && (
        <>
          <h2>Choose a second keyboard layout</h2>
          <Choices items={SECOND_LAYOUTS} value={second} onPick={setSecond} label="Second keyboard" />
          <div className="oobe-row">
            <button type="button" className="oobe-btn oobe-ghost" onClick={() => go('second')}>
              Back
            </button>
            <button
              type="button"
              className="oobe-btn"
              onClick={() => {
                onSecond?.(second)
                go('account')
              }}
            >
              Add layout
            </button>
          </div>
        </>
      )}

      {step === 'account' && (
        <>
          <h2>Sign in with Microsoft</h2>
          <span className="oobe-avatar">
            <Icon name="users" size={30} />
          </span>
          <label className="oobe-field">
            <span>Email, phone, or Skype</span>
            <input value={email} onChange={e => setEmail(e.target.value)} placeholder="someone@example.com" />
          </label>
          <button type="button" className="oobe-link" onClick={() => onAccount('microsoft', () => go('pin'), () => setEmail(''))}>
            Create account
          </button>
          <button
            type="button"
            className="oobe-btn"
            disabled={!email.trim()}
            onClick={() => onAccount('microsoft', () => go('pin'), () => setEmail(''))}
          >
            Next
          </button>
          <div className="oobe-corner">
            <button type="button" className="oobe-link" onClick={() => onAccount('offline', () => go('name'), () => undefined)}>
              Offline account
            </button>
          </div>
        </>
      )}

      {step === 'name' && (
        <>
          <h2>Who's going to use this PC?</h2>
          <p>ตั้งชื่อผู้ใช้สำหรับเข้าสู่ระบบ (Offline account)</p>
          <label className="oobe-field">
            <span>User name</span>
            <input value={name} onChange={e => setName(e.target.value)} maxLength={20} />
          </label>
          <button
            type="button"
            className="oobe-btn"
            disabled={!name.trim()}
            onClick={() => {
              onName?.(name.trim())
              go('password')
            }}
          >
            Next
          </button>
        </>
      )}

      {step === 'password' && (
        <>
          <h2>Create a super memorable password</h2>
          <p>ตั้งรหัสผ่านสำหรับเข้าสู่ระบบ (รหัสผ่านในเกมเป็นแบบจำลอง)</p>
          <label className="oobe-field">
            <span>Password</span>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" />
          </label>
          <label className="oobe-field">
            <span>Confirm password</span>
            <input type="password" value={pw2} onChange={e => setPw2(e.target.value)} autoComplete="new-password" />
          </label>
          {pwError && <p className="oobe-error">{pwError}</p>}
          <button
            type="button"
            className="oobe-btn"
            onClick={() => {
              if (pw !== pw2) {
                setPwError('รหัสผ่านทั้งสองช่องไม่ตรงกัน')
                return
              }
              setPwError('')
              if (onPassword?.(pw.length > 0) === false) return
              go('privacy')
            }}
          >
            Next
          </button>
        </>
      )}

      {step === 'pin' && (
        <>
          <h2>Create a PIN</h2>
          <p>บัญชี Microsoft จะให้ตั้ง PIN (ตัวเลขอย่างน้อย 4 หลัก) ไว้เข้าเครื่องนี้</p>
          <label className="oobe-field">
            <span>New PIN</span>
            <input type="password" inputMode="numeric" value={pin} onChange={e => setPin(e.target.value.replace(/\D/g, ''))} autoComplete="off" />
          </label>
          <button type="button" className="oobe-btn" disabled={pin.length < 4} onClick={() => go('phone')}>
            OK
          </button>
        </>
      )}

      {step === 'phone' && (
        <>
          <h2>Link your phone and PC</h2>
          <p>เชื่อมโทรศัพท์กับเครื่อง (ไม่ต้องการก็ข้ามได้)</p>
          <label className="oobe-field">
            <span>Phone number</span>
            <input value={phone} onChange={e => setPhone(e.target.value)} inputMode="tel" />
          </label>
          <button type="button" className="oobe-btn" onClick={() => go('onedrive')}>
            Next
          </button>
          <div className="oobe-corner">
            <button type="button" className="oobe-link" onClick={() => go('onedrive')}>
              Do it later
            </button>
          </div>
        </>
      )}

      {step === 'onedrive' && (
        <>
          <h2>Protect your files with OneDrive</h2>
          <p>OneDrive สำรองไฟล์ขึ้นคลาวด์ของบัญชี Microsoft</p>
          <button type="button" className="oobe-btn" onClick={() => go('privacy')}>
            Next
          </button>
          <div className="oobe-corner">
            <button type="button" className="oobe-link" onClick={() => go('privacy')}>
              Only save files to this PC
            </button>
          </div>
        </>
      )}

      {step === 'privacy' && (
        <>
          <h2>Choose privacy settings for your device</h2>
          <p>เปิด (On) เฉพาะที่ต้องใช้ เปลี่ยนภายหลังได้ใน Settings</p>
          <div className="oobe-toggles">
            {privacy.map(c => (
              <div key={c.id} className="oobe-toggle">
                <strong>{c.label}</strong>
                <small>{c.hint}</small>
                <button
                  type="button"
                  aria-pressed={c.on}
                  onClick={() => setPrivacy(list => list.map(x => (x.id === c.id ? { ...x, on: !x.on } : x)))}
                >
                  {c.on ? 'Yes (On)' : 'No (Off)'}
                </button>
              </div>
            ))}
          </div>
          <button
            type="button"
            className="oobe-btn"
            onClick={() => {
              onPrivacy?.(privacy)
              go('finishing')
            }}
          >
            Accept
          </button>
        </>
      )}
    </div>
  )
}
