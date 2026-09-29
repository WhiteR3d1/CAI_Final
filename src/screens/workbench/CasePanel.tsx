import { useState } from 'react'
import { Avatar } from '../../components/Avatar'
import { Icon, type IconName } from '../../components/Icon'
import { MENTOR } from '../../data/people'
import type { Tone } from '../../game/types'
import { WorkOrder } from './Intake'
import { useRun } from './runContext'

const TONE_ICON: Record<Tone, IconName> = { info: 'chat', good: 'check', warn: 'alert', bad: 'alert' }
type Tab = 'mentor' | 'order' | 'notes'

export function CasePanel({ onManual, onCard }: { onManual: () => void; onCard: () => void }) {
  const run = useRun()
  const { job, state } = run
  const [tab, setTab] = useState<Tab>('mentor')
  const hints = job.hints[state.stage] ?? []
  const shown = Math.min(state.hintLevel[state.stage] ?? 0, hints.length)
  const stageIndex = job.stages.findIndex(s => s.id === state.stage)
  const tabs: [Tab, string, IconName][] = [
    ['mentor', 'พี่บูต', 'chat'],
    ['order', 'ใบงาน', 'clipboard'],
    ['notes', `หลักฐาน (${state.evidence.length})`, 'pin'],
  ]

  return (
    <aside className="case-panel" data-tab={tab} aria-label="แผงงาน">
      <div className="case-tabs" role="tablist" aria-label="ส่วนของแผงงาน">
        {tabs.map(([id, label, icon]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => setTab(id)}>
            <Icon name={icon} size={16} />
            {label}
          </button>
        ))}
      </div>

      <section className="case-section case-mentor" data-section="mentor">
        <div className="case-mentor-head">
          <Avatar look={MENTOR.look} mood="happy" size={44} />
          <div>
            <strong>{MENTOR.name}</strong>
            <small className="muted">ช่างรุ่นพี่คอยดูอยู่ข้าง ๆ</small>
          </div>
        </div>
        <ul className="feed" aria-live="polite">
          {state.feed.slice(0, 4).map((item, i) => (
            <li key={item.id} className={`feed-item feed-${item.tone}${i === 0 ? ' is-latest' : ''}`}>
              <Icon name={TONE_ICON[item.tone]} size={16} />
              <div>
                <p>{item.text}</p>
                {item.ref && <small className="muted">อ้างอิง: {item.ref}</small>}
              </div>
            </li>
          ))}
        </ul>

        {shown > 0 && (
          <div className="hint-box">
            <strong>
              <Icon name="bulb" size={15} /> คำใบ้ขั้นนี้
            </strong>
            <ol>
              {hints.slice(0, shown).map(h => (
                <li key={h}>{h}</li>
              ))}
            </ol>
          </div>
        )}

        <div className="case-buttons">
          <button type="button" className="btn btn-gold btn-sm" onClick={() => run.requestHint(hints.length)} disabled={shown >= hints.length}>
            <Icon name="bulb" size={16} />
            {hints.length === 0 ? 'ขั้นนี้ไม่มีคำใบ้' : shown >= hints.length ? 'เปิดคำใบ้ครบแล้ว' : `ขอคำใบ้ (${shown}/${hints.length})`}
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onCard}>
            <Icon name="sparkle" size={16} /> การ์ดความรู้
          </button>
          <button type="button" className="btn btn-ghost btn-sm" onClick={onManual}>
            <Icon name="book" size={16} /> คู่มือช่าง
          </button>
        </div>

        <ol className="stage-list" aria-label="ขั้นตอนในงาน">
          {job.stages.map((s, i) => (
            <li key={s.id} className={i < stageIndex ? 'done' : i === stageIndex ? 'current' : undefined}>
              <span>{i < stageIndex ? <Icon name="check" size={13} /> : i + 1}</span>
              {s.label}
            </li>
          ))}
        </ol>
      </section>

      <section className="case-section" data-section="order">
        <h3>
          <Icon name="clipboard" size={18} /> ใบสั่งงาน
        </h3>
        <WorkOrder compact />
        <h4>เป้าหมาย</h4>
        <ol className="goal-list goal-list-compact">
          {job.objectives.map(o => (
            <li key={o.id}>{o.text}</li>
          ))}
        </ol>
      </section>

      <section className="case-section" data-section="notes">
        <h3>
          <Icon name="pin" size={18} /> สมุดหลักฐาน
        </h3>
        {state.evidence.length === 0 ? (
          <p className="muted">ยังว่างอยู่ กดหมุดที่ข้อมูลในใบงานหรือบนหน้าจอจำลองเพื่อจดสิ่งที่ช่วยตัดสินใจ</p>
        ) : (
          <ul className="notebook">
            {state.evidence.map(id => (
              <li key={id}>
                <div>
                  <strong>{job.evidence[id]?.label ?? id}</strong>
                  <small className="muted">จาก {job.evidence[id]?.source}</small>
                </div>
                <button type="button" className="icon-btn" aria-label={`เอา "${job.evidence[id]?.label}" ออก`} onClick={() => run.unpin(id)}>
                  <Icon name="x" size={14} />
                </button>
              </li>
            ))}
          </ul>
        )}
      </section>
    </aside>
  )
}
