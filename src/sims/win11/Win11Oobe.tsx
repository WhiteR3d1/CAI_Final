// Windows 11 out-of-box experience (sheet Win11 p.7–8, figures 12–14): country/region, keyboard, network,
// account, PIN (Windows Hello) and privacy. Real English screen texts; the job judges the choices.
import { useEffect, useEffectEvent, useState } from 'react'
import { Icon, type IconName } from '../../components/Icon'
import './win11.css'

export type Oobe11Step =
  | 'region'
  | 'keyboard'
  | 'second'
  | 'second-pick'
  | 'network'
  | 'updates'
  | 'name'
  | 'setup-type'
  | 'account'
  | 'password'
  | 'pin'
  | 'privacy'
  | 'customize'
  | 'finishing'

export interface WifiNetwork {
  ssid: string
  secured: boolean
}

export interface Privacy11 {
  id: string
  label: string
  on: boolean
}

const REGIONS = ['United States', 'Taiwan', 'Tajikistan', 'Tanzania', 'Thailand', 'Timor-Leste', 'Togo', 'Tonga']
const KEYBOARDS = ['US', 'Thai Kedmanee', 'Thai Pattachote', 'United Kingdom']
const PRIVACY: Privacy11[] = [
  { id: 'location', label: 'Location', on: true },
  { id: 'find', label: 'Find my device', on: true },
  { id: 'diag', label: 'Send optional diagnostic data', on: true },
  { id: 'inking', label: 'Improve inking & typing', on: true },
  { id: 'tailored', label: 'Tailored experiences', on: true },
  { id: 'ads', label: 'Advertising ID', on: true },
]

interface Props {
  networks: WifiNetwork[]
  /** true when the Wi-Fi password is right */
  onConnect: (ssid: string, password: string) => boolean
  /** "I don't have internet"; call back() to return to the network page */
  onNoInternet: (back: () => void) => void
  /** the customer has typed the Microsoft account password (handled by the job) */
  passwordEntered: boolean
  onStep?: (step: Oobe11Step) => void
  onRegion?: (region: string) => void
  onKeyboard?: (layout: string) => void
  onSecond?: (layout: string | null) => void
  onName?: (name: string | null) => void
  /** return false to stay */
  onSetupType: (kind: 'personal' | 'work') => boolean
  /** return false to stay */
  onAccount: (email: string) => boolean
  /** return false to stay */
  onPin: (pin: string) => boolean
  onPrivacy?: (choices: Privacy11[]) => void
  onDone: () => void
}

function Art({ icon }: { icon: IconName }) {
  return (
    <div className="w11-oobe-art" aria-hidden>
      <span>
        <Icon name={icon} size={56} />
      </span>
    </div>
  )
}

function Timed({ ms, onDone }: { ms: number; onDone: () => void }) {
  const done = useEffectEvent(() => onDone())
  useEffect(() => {
    const t = window.setTimeout(() => done(), ms)
    return () => window.clearTimeout(t)
  }, [ms])
  return <span className="dt-spinner dt-spinner-dark" aria-hidden />
}

export function Win11Oobe(props: Props) {
  const { networks, onConnect, onNoInternet, passwordEntered, onStep, onRegion, onKeyboard, onSecond, onName, onSetupType, onAccount, onPin, onPrivacy, onDone } = props
  const [step, setStep] = useState<Oobe11Step>('region')
  const [region, setRegion] = useState('United States')
  const [keyboard, setKeyboard] = useState('US')
  const [second, setSecond] = useState('Thai Kedmanee')
  const [wifi, setWifi] = useState<string | null>(null)
  const [wifiPw, setWifiPw] = useState('')
  const [wifiError, setWifiError] = useState(false)
  const [connected, setConnected] = useState<string | null>(null)
  const [name, setName] = useState('')
  const [setupType, setSetupType] = useState<'personal' | 'work'>('personal')
  const [email, setEmail] = useState('')
  const [pin, setPin] = useState('')
  const [pin2, setPin2] = useState('')
  const [letters, setLetters] = useState(false)
  const [pinError, setPinError] = useState('')
  const [privacy, setPrivacy] = useState(PRIVACY)
  const [finishing, setFinishing] = useState(0)

  const go = (next: Oobe11Step) => {
    setStep(next)
    onStep?.(next)
  }

  const footer = (primary: { label: string; onClick: () => void; disabled?: boolean } | null, secondary?: { label: string; onClick: () => void }) => (
    <div className="w11-oobe-foot">
      {secondary && (
        <button type="button" className="w-btn" onClick={secondary.onClick}>
          {secondary.label}
        </button>
      )}
      {primary && (
        <button type="button" className="w-btn w-btn-primary" disabled={primary.disabled} onClick={primary.onClick}>
          {primary.label}
        </button>
      )}
    </div>
  )

  const connect = () => {
    if (!wifi) return
    if (onConnect(wifi, wifiPw)) {
      setConnected(wifi)
      setWifiError(false)
    } else setWifiError(true)
  }

  const submitPin = () => {
    const okChars = letters ? /^[A-Za-z0-9!@#$%^&*]+$/.test(pin) : /^\d+$/.test(pin)
    if (pin.length < 4 || !okChars) {
      setPinError(letters ? 'Your PIN must be at least 4 characters long.' : 'Your PIN must be at least 4 digits long and contain only numbers.')
      return
    }
    if (pin !== pin2) {
      setPinError('The PINs you entered do not match.')
      return
    }
    setPinError('')
    if (onPin(pin)) go('privacy')
  }

  const list = (items: string[], value: string, set: (v: string) => void, label: string) => (
    <div className="w11-oobe-list" role="listbox" aria-label={label}>
      {items.map(i => (
        <button key={i} type="button" role="option" aria-selected={value === i} className={value === i ? 'on' : undefined} onClick={() => set(i)}>
          {i}
        </button>
      ))}
    </div>
  )

  let art: IconName = 'monitor'
  let body = null
  switch (step) {
    case 'region':
      art = 'flag'
      body = (
        <>
          <h2>Is this the right country or region?</h2>
          {list(REGIONS, region, setRegion, 'Country or region')}
          {footer({
            label: 'Yes',
            onClick: () => {
              onRegion?.(region)
              go('keyboard')
            },
          })}
        </>
      )
      break
    case 'keyboard':
      art = 'keyboard'
      body = (
        <>
          <h2>Is this the right keyboard layout or input method?</h2>
          <p className="w-small">If you also use another keyboard layout, you can add that next.</p>
          {list(KEYBOARDS, keyboard, setKeyboard, 'Keyboard layout')}
          {footer({
            label: 'Yes',
            onClick: () => {
              onKeyboard?.(keyboard)
              go('second')
            },
          })}
        </>
      )
      break
    case 'second':
      art = 'keyboard'
      body = (
        <>
          <h2>Want to add a second keyboard layout?</h2>
          {footer(
            { label: 'Add layout', onClick: () => go('second-pick') },
            {
              label: 'Skip',
              onClick: () => {
                onSecond?.(null)
                go('network')
              },
            },
          )}
        </>
      )
      break
    case 'second-pick':
      art = 'keyboard'
      body = (
        <>
          <h2>Which second keyboard layout do you want to add?</h2>
          {list(
            KEYBOARDS.filter(k => k !== keyboard),
            second,
            setSecond,
            'Second keyboard layout',
          )}
          {footer(
            {
              label: 'Add layout',
              onClick: () => {
                onSecond?.(second)
                go('network')
              },
            },
            { label: 'Back', onClick: () => go('second') },
          )}
        </>
      )
      break
    case 'network':
      art = 'wifi'
      body = (
        <>
          <h2>Let's connect you to a network</h2>
          <p className="w-small">You'll need an internet connection to continue setting up your device.</p>
          <div className="w11-oobe-wifi">
            {networks.map(n => (
              <div key={n.ssid} className={`w11-oobe-net${wifi === n.ssid ? ' on' : ''}`}>
                <button type="button" onClick={() => setWifi(n.ssid)}>
                  <Icon name="wifi" size={18} /> {n.ssid}
                  <small>{connected === n.ssid ? 'Connected, secured' : n.secured ? 'Secured' : 'Open'}</small>
                </button>
                {wifi === n.ssid && connected !== n.ssid && (
                  <div className="w11-oobe-net-pw">
                    {n.secured && (
                      <input
                        type="password"
                        value={wifiPw}
                        placeholder="Enter the network security key"
                        aria-label="Network security key"
                        onChange={e => {
                          setWifiPw(e.target.value)
                          setWifiError(false)
                        }}
                        onKeyDown={e => e.key === 'Enter' && connect()}
                      />
                    )}
                    <button type="button" className="w-btn w-btn-primary" onClick={connect}>
                      Connect
                    </button>
                    {wifiError && <small className="w-error">The network security key isn't correct. Please try again.</small>}
                  </div>
                )}
              </div>
            ))}
          </div>
          <button type="button" className="w11-link w11-oobe-nonet" onClick={() => onNoInternet(() => go('network'))}>
            I don't have internet
          </button>
          {footer({ label: 'Next', disabled: !connected, onClick: () => go('updates') })}
        </>
      )
      break
    case 'updates':
      art = 'refresh'
      body = (
        <div className="w11-oobe-wait">
          <h2>Checking for updates.</h2>
          <p className="w-small">This might take a few minutes.</p>
          <Timed ms={2500} onDone={() => go('name')} />
        </div>
      )
      break
    case 'name':
      art = 'monitor'
      body = (
        <>
          <h2>Let's name your device</h2>
          <p className="w-small">Make it yours with a unique name that's easy to recognize when connecting to it from other devices. Your device will restart after you name it.</p>
          <input className="w11-oobe-input" value={name} maxLength={15} onChange={e => setName(e.target.value.replace(/\s/g, ''))} aria-label="Device name" />
          <small className="w-small">Can't be longer than 15 characters, contain spaces, or certain special characters.</small>
          {footer(
            {
              label: 'Next',
              disabled: !name,
              onClick: () => {
                onName?.(name)
                go('setup-type')
              },
            },
            {
              label: 'Skip for now',
              onClick: () => {
                onName?.(null)
                go('setup-type')
              },
            },
          )}
        </>
      )
      break
    case 'setup-type':
      art = 'users'
      body = (
        <>
          <h2>How would you like to set up this device?</h2>
          <label className={`w11-oobe-choice${setupType === 'personal' ? ' on' : ''}`}>
            <input type="radio" name="setup-type" checked={setupType === 'personal'} onChange={() => setSetupType('personal')} />
            <span>
              <strong>Set up for personal use</strong>
              <small>We'll help you set it up with a personal Microsoft account. You'll have full control over this device.</small>
            </span>
          </label>
          <label className={`w11-oobe-choice${setupType === 'work' ? ' on' : ''}`}>
            <input type="radio" name="setup-type" checked={setupType === 'work'} onChange={() => setSetupType('work')} />
            <span>
              <strong>Set up for work or school</strong>
              <small>You'll get access to resources like email, network, apps, and services. Your organization will have full control over this device.</small>
            </span>
          </label>
          {footer({ label: 'Next', onClick: () => onSetupType(setupType) && go('account') })}
        </>
      )
      break
    case 'account':
      art = 'users'
      body = (
        <>
          <h2>Let's add your Microsoft account</h2>
          <p className="w11-oobe-ms">
            <span className="w11-ms-logo" aria-hidden /> Microsoft
          </p>
          <h3>Sign in</h3>
          <input className="w11-oobe-input" value={email} placeholder="Email, phone, or Skype" aria-label="Email, phone, or Skype" onChange={e => setEmail(e.target.value.trim())} />
          <div className="w11-oobe-links">
            <span className="w11-link is-muted">No account? Create one!</span>
            <span className="w11-link is-muted">Sign in with another device</span>
            <span className="w11-link is-muted">Sign-in options</span>
          </div>
          {footer({ label: 'Next', disabled: !email, onClick: () => onAccount(email) && go('password') })}
        </>
      )
      break
    case 'password':
      art = 'lock'
      body = (
        <>
          <h2>Enter password</h2>
          <p className="w-small">{email}</p>
          <div className="w11-oobe-input w11-oobe-masked" aria-label="Password">
            {passwordEntered ? '••••••••••••' : <span className="w-small">Password</span>}
          </div>
          <span className="w11-link is-muted">Forgot password?</span>
          {footer({ label: 'Sign in', disabled: !passwordEntered, onClick: () => go('pin') })}
        </>
      )
      break
    case 'pin':
      art = 'lock'
      body = (
        <>
          <h2>Set up a PIN</h2>
          <p className="w-small">A Windows Hello PIN is a fast, secure way to sign in to your device, apps, and services.</p>
          <input className="w11-oobe-input" type="password" inputMode={letters ? 'text' : 'numeric'} value={pin} placeholder="New PIN" aria-label="New PIN" onChange={e => setPin(e.target.value)} />
          <input className="w11-oobe-input" type="password" inputMode={letters ? 'text' : 'numeric'} value={pin2} placeholder="Confirm PIN" aria-label="Confirm PIN" onChange={e => setPin2(e.target.value)} />
          <label className="w11-check">
            <input type="checkbox" checked={letters} onChange={e => setLetters(e.target.checked)} />
            Include letters and symbols
          </label>
          {pinError && <small className="w-error">{pinError}</small>}
          {footer({ label: 'OK', disabled: !pin || !pin2, onClick: submitPin }, { label: 'Cancel', onClick: () => go('password') })}
        </>
      )
      break
    case 'privacy':
      art = 'shield'
      body = (
        <>
          <h2>Choose privacy settings for your device</h2>
          <p className="w-small">Microsoft puts you in control of your privacy. Choose your settings, then select 'Accept' to save them. You can change these settings at any time.</p>
          <div className="w11-oobe-privacy">
            {privacy.map(p => (
              <label key={p.id} className="w11-oobe-toggle">
                <span>{p.label}</span>
                <span className="w11-toggle-wrap">
                  <small>{p.on ? 'Yes' : 'No'}</small>
                  <input type="checkbox" role="switch" checked={p.on} onChange={e => setPrivacy(list => list.map(x => (x.id === p.id ? { ...x, on: e.target.checked } : x)))} />
                </span>
              </label>
            ))}
          </div>
          {footer({
            label: 'Accept',
            onClick: () => {
              onPrivacy?.(privacy)
              go('customize')
            },
          })}
        </>
      )
      break
    case 'customize':
      art = 'sparkle'
      body = (
        <>
          <h2>Let's customize your experience</h2>
          <p className="w-small">Select all the ways you plan to use your device to get personalized tips, ads, and recommendations within Microsoft experiences.</p>
          <div className="w11-oobe-tiles" aria-hidden>
            {['Gaming', 'Family', 'Creativity', 'Schoolwork', 'Entertainment', 'Business'].map(t => (
              <span key={t}>{t}</span>
            ))}
          </div>
          {footer({ label: 'Accept', onClick: () => go('finishing') }, { label: 'Skip', onClick: () => go('finishing') })}
        </>
      )
      break
    case 'finishing':
      body = null
  }

  if (step === 'finishing') {
    return (
      <div className="w11-oobe w11-oobe-full" role="status">
        <h2>{finishing === 0 ? 'This might take a few minutes' : "Don't turn off your PC"}</h2>
        <Timed key={finishing} ms={2500} onDone={() => (finishing === 0 ? setFinishing(1) : onDone())} />
      </div>
    )
  }

  return (
    <div className="w11-oobe">
      <div className="w11-oobe-card">
        <Art icon={art} />
        <div className="w11-oobe-body">{body}</div>
      </div>
    </div>
  )
}
