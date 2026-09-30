import { useEffect, useEffectEvent, useRef, useState, type KeyboardEvent } from 'react'
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
  /** text-mode POST of an older legacy-BIOS PC (memory test, detected drives) instead of a logo */
  textLines?: string[]
  /** total memory counted by the text-mode memory test, in MB */
  memoryMb?: number
}

const KEY_TEXT: Record<string, string> = { F2: 'to enter SETUP', F12: 'for Boot Menu' }
const TEXT_KEY: Record<string, string> = { F2: 'Press F2 to run Setup', F12: 'Press F12 for BBS POPUP (boot menu)' }

/** Power-on self test screen with a short window to press a setup key. Remount (key prop) to restart. */
export function PostScreen({ seconds, keys, onKey, onTimeout, vendor = 'BLOOM BOARD', firmware = 'UEFI BIOS v2.14', untimed = false, textLines, memoryMb = 2048 }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const fireTimeout = useEffectEvent(() => onTimeout())
  const [memory, setMemory] = useState(0)

  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
    if (untimed) return
    const t = window.setTimeout(() => fireTimeout(), seconds * 1000)
    return () => window.clearTimeout(t)
  }, [seconds, untimed])

  // the memory test counts up like a real text-mode POST
  useEffect(() => {
    if (!textLines) return
    const t = window.setInterval(() => setMemory(m => (m >= memoryMb ? m : Math.min(memoryMb, m + 128))), 60)
    return () => window.clearInterval(t)
  }, [textLines, memoryMb])

  const keyDown = (e: KeyboardEvent) => {
    if (keys.includes(e.key)) {
      e.preventDefault()
      onKey(e.key)
    }
  }

  const continueButton = untimed && (
    <button type="button" className="post-continue" onClick={onTimeout}>
      ปล่อยให้เครื่องบูตต่อ (ไม่กดปุ่ม) ▶
    </button>
  )

  if (textLines) {
    const tested = memory >= memoryMb
    return (
      <div ref={ref} className="post post-text" tabIndex={0} role="application" aria-label={`หน้าจอเปิดเครื่อง กด ${keys.join(' หรือ ')}`} onKeyDown={keyDown} onMouseDown={() => ref.current?.focus({ preventScroll: true })}>
        <div className="post-text-lines">
          {textLines.map((line, i) => (
            <p key={i}>{line || ' '}</p>
          ))}
          <p>Memory Test : {memory}M {tested ? 'OK' : ''}</p>
          {tested && (
            <>
              <p>&nbsp;</p>
              <p>Auto-Detecting SATA Port 1...SATA Hard Disk</p>
              <p>USB Device(s): 1 Keyboard, 1 Mouse, 1 Storage Device</p>
              <p>Auto-detecting USB Mass Storage Devices ..</p>
              <p>01 USB mass storage devices found and configured.</p>
            </>
          )}
        </div>
        <div className="post-lines">
          {keys.map(k => (
            <p key={k}>{TEXT_KEY[k] ?? `Press ${k}`}</p>
          ))}
          {untimed ? (
            continueButton
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

  return (
    <div ref={ref} className="post" tabIndex={0} role="application" aria-label={`หน้าจอเปิดเครื่อง กด ${keys.join(' หรือ ')}`} onKeyDown={keyDown} onMouseDown={() => ref.current?.focus({ preventScroll: true })}>
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
          continueButton
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
