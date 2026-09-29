import type { ReactNode } from 'react'
import type { AvatarLook } from '../game/types'
import { Avatar } from './Avatar'
import { Icon } from './Icon'

export function Stars({ value, max = 3, size = 18 }: { value: number; max?: number; size?: number }) {
  return (
    <span className="stars" role="img" aria-label={`${value} จาก ${max} ดาว`}>
      {Array.from({ length: max }, (_, i) => (
        <Icon key={i} name="star" size={size} filled={i < value} className={i < value ? 'star-on' : 'star-off'} />
      ))}
    </span>
  )
}

export function ScoreRing({ score, size = 132, label = 'คะแนนวิชา' }: { score: number; size?: number; label?: string }) {
  const r = 52
  const c = 2 * Math.PI * r
  const tone = score >= 85 ? 'good' : score >= 60 ? 'warn' : 'bad'
  return (
    <div className={`score-ring score-${tone}`} style={{ width: size, height: size }}>
      <svg viewBox="0 0 120 120" width={size} height={size} aria-hidden>
        <circle cx="60" cy="60" r={r} className="score-track" />
        <circle
          cx="60"
          cy="60"
          r={r}
          className="score-bar"
          strokeDasharray={c}
          strokeDashoffset={c * (1 - score / 100)}
          transform="rotate(-90 60 60)"
        />
      </svg>
      <div className="score-text">
        <strong>{score}</strong>
        <small>{label}</small>
      </div>
    </div>
  )
}

export function Stepper({ steps, current }: { steps: string[]; current: number }) {
  return (
    <ol className="stepper">
      {steps.map((step, i) => (
        <li key={step} className={i < current ? 'done' : i === current ? 'current' : undefined} aria-current={i === current ? 'step' : undefined}>
          <span className="stepper-dot">{i < current ? <Icon name="check" size={14} /> : i + 1}</span>
          <span className="stepper-label">{step}</span>
        </li>
      ))}
    </ol>
  )
}

export function Speech({
  look,
  name,
  mood,
  children,
  side = 'left',
  size = 56,
}: {
  look: AvatarLook
  name: string
  mood?: 'happy' | 'worried' | 'neutral'
  children: ReactNode
  side?: 'left' | 'right'
  size?: number
}) {
  return (
    <div className={`speech speech-${side}`}>
      <div className="speech-avatar">
        <Avatar look={look} mood={mood} size={size} />
      </div>
      <div className="speech-bubble">
        <strong className="speech-name">{name}</strong>
        <div>{children}</div>
      </div>
    </div>
  )
}

export function CoinAmount({ value, size = 16 }: { value: number; size?: number }) {
  return (
    <span className="coin-amount">
      <Icon name="coin" size={size} />
      {value.toLocaleString('th-TH')}
    </span>
  )
}
