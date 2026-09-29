import type { ReactNode } from 'react'
import './sims.css'

export function Monitor({ label, children, className, tone = 'dark' }: { label: string; children: ReactNode; className?: string; tone?: 'dark' | 'light' }) {
  return (
    <div className={`monitor monitor-${tone}${className ? ` ${className}` : ''}`}>
      <div className="monitor-screen">{children}</div>
      <div className="monitor-chin">
        <span className="monitor-label">{label}</span>
        <span className="monitor-led" aria-hidden />
      </div>
    </div>
  )
}

/** On-screen keys so touch devices (and anyone) can drive keyboard-only screens. */
export function KeyPad({ keys, onKey, label = 'ปุ่มคีย์บอร์ดบนจอ' }: { keys: string[]; onKey: (key: string) => void; label?: string }) {
  const text: Record<string, string> = {
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Enter: 'Enter',
    Escape: 'Esc',
  }
  return (
    <div className="keypad" role="group" aria-label={label}>
      {keys.map(k => (
        <button key={k} type="button" className="keypad-key" onClick={() => onKey(k)} aria-label={`กดปุ่ม ${k}`}>
          {text[k] ?? k}
        </button>
      ))}
    </div>
  )
}

export function BenchBar({ children }: { children: ReactNode }) {
  return <div className="bench-bar">{children}</div>
}
