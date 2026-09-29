import type { ReactNode } from 'react'
import { Icon } from '../../components/Icon'
import { useRun } from './runContext'

/** A piece of on-screen information the player can pin into the evidence notebook. */
export function Fact({ id, children, className }: { id: string; children?: ReactNode; className?: string }) {
  const run = useRun()
  const def = run.job.evidence[id]
  const pinned = run.isPinned(id)
  return (
    <span className={`fact${pinned ? ' is-pinned' : ''}${className ? ` ${className}` : ''}`}>
      <span className="fact-text">{children ?? def?.label}</span>
      <button
        type="button"
        className="fact-pin"
        aria-pressed={pinned}
        title={pinned ? 'เอาออกจากสมุดหลักฐาน' : 'จดลงสมุดหลักฐาน'}
        onClick={() => (pinned ? run.unpin(id) : run.pin(id))}
      >
        <Icon name="pin" size={13} />
        <span className="visually-hidden">
          {pinned ? 'เอาออกจากสมุดหลักฐาน' : 'จดเป็นหลักฐาน'}: {def?.label}
        </span>
      </button>
    </span>
  )
}

/** Lets the player attach pinned evidence to a decision. */
export function EvidencePicker({ value, onChange, label }: { value: string[]; onChange: (next: string[]) => void; label: string }) {
  const run = useRun()
  const pinned = run.state.evidence
  if (pinned.length === 0) {
    return (
      <p className="ev-empty">
        <Icon name="pin" size={14} /> ยังไม่มีหลักฐานในสมุด กดหมุดที่ข้อมูลในใบงานหรือบนหน้าจอเพื่อจดก่อน
      </p>
    )
  }
  return (
    <div className="ev-picker" role="group" aria-label={label}>
      {pinned.map(id => {
        const on = value.includes(id)
        return (
          <button
            key={id}
            type="button"
            className={`ev-chip${on ? ' on' : ''}`}
            aria-pressed={on}
            onClick={() => onChange(on ? value.filter(v => v !== id) : [...value, id])}
          >
            <Icon name={on ? 'check' : 'pin'} size={13} />
            {run.job.evidence[id]?.label ?? id}
          </button>
        )
      })}
    </div>
  )
}
