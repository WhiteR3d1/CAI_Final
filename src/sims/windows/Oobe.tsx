import { useEffect, useEffectEvent, useState } from 'react'
import { Icon } from '../../components/Icon'
import { PRIVACY_DEFAULTS, type PrivacyChoice } from './media'
import './windows.css'

export type OobeStep =
  | 'region'
  | 'keyboard'
  | 'second'
  | 'second-pick'
  | 'account'
  | 'offline-confirm'
  | 'name'
  | 'password'
  | 'confirm'
  | 'security'
  | 'pin'
  | 'phone'
  | 'onedrive'
  | 'privacy'
  | 'finishing'

const REGIONS = ['Sweden', 'Switzerland', 'Syria', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'United States']
const KEYBOARDS = ['US', 'Thai Kedmanee', 'United Kingdom', 'Canadian Multilingual Standard']
const SECOND_LAYOUTS = ['Thai Kedmanee', 'Thai Pattachote', 'Japanese', 'Chinese (Simplified)']
const SECURITY_QUESTIONS = [
  "What was your first pet's name?",
  "What's the name of the city where you were born?",
  'What was your childhood nickname?',
  "What's the name of the city where your parents met?",
  "What's the first name of your oldest cousin?",
  "What's the name of the first school you attended?",
]
const FINISH_TEXT = ['Hi', "We're getting everything ready for you", 'This might take several minutes', "Don't turn off your PC"]

interface Props {
  onStep?: (step: OobeStep) => void
  onRegion?: (region: string) => void
  onKeyboard?: (layout: string) => void
  onSecond?: (layout: string | null) => void
  /** Microsoft account (email typed or Create account) or Offline account (after "Limited experience"); call next() to continue or back() to stay */
  onAccount: (kind: 'microsoft' | 'offline', next: () => void, back: () => void) => void
  onName?: (name: string) => void
  /** the chosen password ('' = none); return false to stay on the password page */
  onPassword?: (password: string) => boolean
  onPrivacy?: (choices: PrivacyChoice[]) => void
  onDone: () => void
}

/** "Hi … Don't turn off your PC" shown after the last OOBE page. */
function Finishing({ onDone }: { onDone: () => void }) {
  const [index, setIndex] = useState(0)
  const done = useEffectEvent(() => onDone())
  useEffect(() => {
    if (index >= FINISH_TEXT.length) {
      done()
      return
    }
    const t = window.setTimeout(() => setIndex(i => i + 1), index === 0 ? 1600 : 2000)
    return () => window.clearTimeout(t)
  }, [index])
  return (
    <div className="oobe oobe-finish">
      <h2>{FINISH_TEXT[Math.min(index, FINISH_TEXT.length - 1)]}</h2>
      <span className="dt-spinner" aria-hidden />
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

/** Out-of-box experience after installation (content sheet steps 10–16), behaving like Windows 10. */
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
  const [question, setQuestion] = useState(0)
  const [answers, setAnswers] = useState<{ q: string; a: string }[]>([])
  const [q, setQ] = useState('')
  const [a, setA] = useState('')
  const [pin, setPin] = useState('')
  const [phone, setPhone] = useState('')
  const [privacy, setPrivacy] = useState<PrivacyChoice[]>(PRIVACY_DEFAULTS)

  const go = (next: OobeStep) => {
    setStep(next)
    onStep?.(next)
  }

  if (step === 'finishing') return <Finishing onDone={onDone} />

  const used = answers.map(x => x.q)

  return (
    <div className="oobe">
      <div className="oobe-steps" aria-hidden>
        <span className={['region', 'keyboard', 'second', 'second-pick'].includes(step) ? 'on' : undefined}>Basics</span>
        <span className={['account', 'offline-confirm', 'name', 'password', 'confirm', 'security', 'pin'].includes(step) ? 'on' : undefined}>Account</span>
        <span className={['phone', 'onedrive', 'privacy'].includes(step) ? 'on' : undefined}>Services</span>
      </div>

      <div className="oobe-page">
      {step === 'region' && (
        <>
          <h2>Let's start with region. Is this right?</h2>
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
          <button type="button" className="oobe-btn" disabled={!email.trim()} onClick={() => onAccount('microsoft', () => go('pin'), () => setEmail(''))}>
            Next
          </button>
          <div className="oobe-corner">
            <button type="button" className="oobe-link" onClick={() => go('offline-confirm')}>
              Offline account
            </button>
          </div>
        </>
      )}

      {step === 'offline-confirm' && (
        <>
          <h2>Sign in with Microsoft instead?</h2>
          <ul className="oobe-benefits">
            <li>Access your files from any device with OneDrive</li>
            <li>Get help from your digital assistant</li>
            <li>Sync your settings and apps across devices</li>
          </ul>
          <button type="button" className="oobe-btn" onClick={() => go('account')}>
            Yes
          </button>
          <div className="oobe-corner">
            <button type="button" className="oobe-link" onClick={() => onAccount('offline', () => go('name'), () => go('account'))}>
              Limited experience
            </button>
          </div>
        </>
      )}

      {step === 'name' && (
        <>
          <h2>Who's going to use this PC?</h2>
          <label className="oobe-field">
            <span>Name</span>
            <input value={name} onChange={e => setName(e.target.value)} maxLength={20} autoComplete="off" />
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
          <p>Make sure to pick something you'll absolutely remember.</p>
          <label className="oobe-field">
            <span>Password</span>
            <input type="password" value={pw} onChange={e => setPw(e.target.value)} autoComplete="new-password" />
          </label>
          <button
            type="button"
            className="oobe-btn"
            onClick={() => {
              if (onPassword?.(pw) === false) return
              go(pw ? 'confirm' : 'privacy')
            }}
          >
            Next
          </button>
        </>
      )}

      {step === 'confirm' && (
        <>
          <h2>Confirm your password</h2>
          <label className="oobe-field">
            <span>Password</span>
            <input type="password" value={pw2} onChange={e => setPw2(e.target.value)} autoComplete="new-password" />
          </label>
          {pwError && <p className="oobe-error">{pwError}</p>}
          <button
            type="button"
            className="oobe-btn"
            disabled={!pw2}
            onClick={() => {
              if (pw2 !== pw) {
                setPwError("The passwords you entered don't match. Please try again.")
                setPw2('')
                return
              }
              setPwError('')
              go('security')
            }}
          >
            Next
          </button>
        </>
      )}

      {step === 'security' && (
        <>
          <h2>Create security questions for this account</h2>
          <p>In case you forget your password, choose 3 security questions. Make sure your answers are unforgettable.</p>
          <label className="oobe-field">
            <span>Security question ({question + 1} of 3)</span>
            <select value={q} onChange={e => setQ(e.target.value)}>
              <option value="">Choose a security question</option>
              {SECURITY_QUESTIONS.filter(x => !used.includes(x)).map(x => (
                <option key={x}>{x}</option>
              ))}
            </select>
          </label>
          <label className="oobe-field">
            <span>Your answer</span>
            <input value={a} onChange={e => setA(e.target.value)} autoComplete="off" />
          </label>
          <button
            type="button"
            className="oobe-btn"
            disabled={!q || !a.trim()}
            onClick={() => {
              setAnswers(list => [...list, { q, a: a.trim() }])
              setQ('')
              setA('')
              if (question < 2) setQuestion(n => n + 1)
              else go('privacy')
            }}
          >
            Next
          </button>
        </>
      )}

      {step === 'pin' && (
        <>
          <h2>Create a PIN</h2>
          <p>Windows Hello PIN is a fast and secure way to sign in to this device.</p>
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
          <p>Your files will be backed up to OneDrive so you can get to them from any device.</p>
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
          <p>Microsoft puts you in control of your privacy. Choose your settings, then select Accept to save them. You can change these settings at any time.</p>
          <div className="oobe-toggles">
            {privacy.map(c => (
              <div key={c.id} className="oobe-toggle">
                <strong>{c.label}</strong>
                <small>{c.hint}</small>
                <button type="button" aria-pressed={c.on} onClick={() => setPrivacy(list => list.map(x => (x.id === c.id ? { ...x, on: !x.on } : x)))}>
                  {c.on ? 'Yes' : 'No'}
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
    </div>
  )
}
