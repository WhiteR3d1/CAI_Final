import { useEffect, useEffectEvent, useRef } from 'react'
import { KeyPad } from './Monitor'

interface Props {
  seconds: number
  keys: string[]
  onKey: (key: string) => void
  onTimeout: () => void
  vendor?: string
  firmware?: string
  /** practice mode: no countdown, the player lets the PC continue with a button */
  untimed?: boolean
}

const KEY_TEXT: Record<string, string> = { F2: 'to enter SETUP', F12: 'for Boot Menu' }

/** Power-on self test screen with a short window to press a setup key. Remount (key prop) to restart. */
export function PostScreen({ seconds, keys, onKey, onTimeout, vendor = 'BLOOM BOARD', firmware = 'UEFI BIOS v2.14', untimed = false }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const fireTimeout = useEffectEvent(() => onTimeout())

  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
    if (untimed) return
    const t = window.setTimeout(() => fireTimeout(), seconds * 1000)
    return () => window.clearTimeout(t)
  }, [seconds, untimed])

  return (
    <div
      ref={ref}
      className="post"
      tabIndex={0}
      role="application"
      aria-label={`หน้าจอเปิดเครื่อง กด ${keys.join(' หรือ ')}`}
      onKeyDown={e => {
        if (keys.includes(e.key)) {
          e.preventDefault()
          onKey(e.key)
        }
      }}
    >
      <div className="post-logo">
        <span className="post-mark">❀</span>
        <strong>{vendor}</strong>
        <small>{firmware}</small>
      </div>
      <div className="post-lines">
        <p>
          {keys.map((k, i) => (
            <span key={k}>
              {i === 0 ? 'Press ' : ', '}
              <b>{k}</b> {KEY_TEXT[k] ?? ''}
            </span>
          ))}
        </p>
        {untimed ? (
          <button type="button" className="post-continue" onClick={onTimeout}>
            ปล่อยให้เครื่องบูตต่อ (ไม่กดปุ่ม) ▶
          </button>
        ) : (
          <div className="post-bar" aria-hidden>
            <span style={{ animationDuration: `${seconds}s` }} />
          </div>
        )}
      </div>
      <KeyPad keys={keys} onKey={onKey} />
    </div>
  )
}
