import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import './windows.css'

/** "Working on updates … Don't turn off your computer" → "Restarting" after Windows Update's Restart now. */
export function WorkingOnUpdates({ onDone }: { onDone: () => void }) {
  const [percent, setPercent] = useState(0)
  const [restarting, setRestarting] = useState(false)
  const done = useEffectEvent(() => onDone())

  useEffect(() => {
    if (restarting) {
      const t = window.setTimeout(() => done(), 1800)
      return () => window.clearTimeout(t)
    }
    if (percent >= 100) {
      const t = window.setTimeout(() => setRestarting(true), 400)
      return () => window.clearTimeout(t)
    }
    const t = window.setTimeout(() => setPercent(p => Math.min(100, p + 7)), 280)
    return () => window.clearTimeout(t)
  }, [percent, restarting])

  return (
    <div className="win-boot">
      <span className="dt-spinner" aria-hidden />
      {restarting ? (
        <p>Restarting</p>
      ) : (
        <p>
          Working on updates {percent}% complete.
          <br />
          Don't turn off your computer.
        </p>
      )}
    </div>
  )
}

/** Lock screen → sign-in with the account created in OOBE → "Welcome". */
export function SignIn({ user, password, onWrong, onDone }: { user: string; password: string; onWrong?: () => void; onDone: () => void }) {
  const [view, setView] = useState<'lock' | 'signin' | 'wrong' | 'welcome'>('lock')
  const [typed, setTyped] = useState('')
  const lockRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)
  const done = useEffectEvent(() => onDone())

  useEffect(() => {
    if (view === 'lock') lockRef.current?.focus({ preventScroll: true })
    if (view === 'signin') inputRef.current?.focus({ preventScroll: true })
    if (view !== 'welcome') return
    const t = window.setTimeout(() => done(), 1600)
    return () => window.clearTimeout(t)
  }, [view])

  const submit = () => {
    if (typed === password) setView('welcome')
    else {
      setView('wrong')
      setTyped('')
      onWrong?.()
    }
  }

  if (view === 'lock')
    return (
      <div
        ref={lockRef}
        className="win-lock"
        tabIndex={0}
        role="button"
        aria-label="หน้าจอล็อก คลิกหรือกดปุ่มใดก็ได้เพื่อเข้าสู่ระบบ"
        onClick={() => setView('signin')}
        onKeyDown={() => setView('signin')}
      >
        <div className="win-lock-clock">
          <strong>10:05</strong>
          <span>Wednesday, September 30</span>
        </div>
      </div>
    )

  return (
    <div className="win-signin">
      <span className="win-avatar">
        <Icon name="users" size={46} />
      </span>
      <strong className="win-user">{user}</strong>
      {view === 'welcome' && (
        <>
          <span className="dt-spinner" aria-hidden />
          <p>Welcome</p>
        </>
      )}
      {view === 'wrong' && (
        <>
          <p>The password is incorrect. Try again.</p>
          <button type="button" className="oobe-btn" autoFocus onClick={() => setView('signin')}>
            OK
          </button>
        </>
      )}
      {view === 'signin' &&
        (password ? (
          <form
            className="win-pw"
            onSubmit={e => {
              e.preventDefault()
              submit()
            }}
          >
            <input ref={inputRef} type="password" placeholder="Password" value={typed} onChange={e => setTyped(e.target.value)} aria-label="Password" autoComplete="off" />
            <button type="submit" aria-label="Submit">
              <Icon name="arrowRight" size={16} />
            </button>
          </form>
        ) : (
          <button type="button" className="oobe-btn" onClick={() => setView('welcome')}>
            Sign in
          </button>
        ))}
    </div>
  )
}
