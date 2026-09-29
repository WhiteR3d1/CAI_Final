import { Avatar } from '../../components/Avatar'
import { CoinAmount } from '../../components/Bits'
import { Icon } from '../../components/Icon'
import { useGame } from '../../game/gameContext'
import { jobProgress } from '../../game/progress'
import { Fact } from './Fact'
import { useRun } from './runContext'

export function WorkOrder({ compact = false }: { compact?: boolean }) {
  const { job } = useRun()
  return (
    <dl className={`work-order${compact ? ' work-order-compact' : ''}`}>
      {job.workOrder.map(row => (
        <div key={row.label}>
          <dt>{row.label}</dt>
          <dd>{row.fact ? <Fact id={row.fact}>{row.value}</Fact> : row.value}</dd>
        </div>
      ))}
    </dl>
  )
}

export function Intake({ onAccept, onBack }: { onAccept: () => void; onBack: () => void }) {
  const { job } = useRun()
  const { save } = useGame()
  const progress = jobProgress(save, job.id)

  return (
    <div className="intake">
      <section className="intake-scene">
        <div className="intake-customer">
          <Avatar look={job.customer.look} mood="worried" size={168} label={job.customer.name} />
          <div>
            <strong>{job.customer.name}</strong>
            <small>{job.customer.role}</small>
          </div>
        </div>
        <div className="intake-dialogue" aria-live="polite">
          {job.intake.map((line, i) => (
            <p key={i} className="intake-line" style={{ animationDelay: `${0.25 + i * 0.7}s` }}>
              {line}
            </p>
          ))}
        </div>
      </section>

      <div className="intake-grid">
        <section className="card paper">
          <div className="paper-head">
            <span className="eyebrow">ใบสั่งงาน · {job.code}</span>
            <span className="chip">
              <Icon name="pin" size={13} /> กดหมุดเพื่อจดหลักฐาน
            </span>
          </div>
          <h2>{job.title}</h2>
          <WorkOrder />
        </section>

        <section className="card intake-goals">
          <span className="eyebrow">เป้าหมายการเรียนรู้</span>
          <ol className="goal-list">
            {job.objectives.map(o => (
              <li key={o.id}>{o.text}</li>
            ))}
          </ol>
          <div className="intake-meta">
            {job.units.map(u => (
              <span key={u} className={`chip${u.includes('เสริม') ? ' chip-extra' : ''}`}>
                {u}
              </span>
            ))}
            <span className="chip">
              <Icon name="clock" size={14} /> ~{job.minutes} นาที
            </span>
            <span className="chip chip-warn">
              ค่าจ้าง <CoinAmount value={job.reward} size={14} />
            </span>
          </div>
          <ul className="ref-list">
            {job.learn.refs.map(r => (
              <li key={r}>
                <Icon name="book" size={15} /> {r}
              </li>
            ))}
          </ul>
          {progress.completions > 0 && (
            <p className="muted intake-replay">เคยส่งงานนี้แล้ว {progress.completions} ครั้ง ทำใหม่ได้เพื่อพัฒนาคะแนน เหรียญจะจ่ายเฉพาะส่วนที่ดีขึ้น</p>
          )}
          <div className="intake-actions">
            <button type="button" className="btn btn-ghost" onClick={onBack}>
              <Icon name="arrowLeft" size={18} /> กลับร้าน
            </button>
            <button type="button" className="btn btn-primary btn-lg" onClick={onAccept}>
              รับงานนี้ <Icon name="arrowRight" size={18} />
            </button>
          </div>
        </section>
      </div>
    </div>
  )
}
