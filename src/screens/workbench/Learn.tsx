import { useState } from 'react'
import { Speech } from '../../components/Bits'
import { Icon } from '../../components/Icon'
import { KnowledgeView } from '../../components/KnowledgeView'
import { MENTOR } from '../../data/people'
import { useRun } from './runContext'

export function Learn({ onNext }: { onNext: () => void }) {
  const { job } = useRun()
  const card = job.learn
  return (
    <div className="learn">
      <article className="card learn-card">
        <span className="eyebrow">เรียนก่อนทำ · อ่านประมาณ 2 นาที</span>
        <h2>{card.title}</h2>
        <KnowledgeView blocks={card.blocks} />
        {card.more && (
          <details className="learn-more">
            <summary>อ่านเพิ่มเติม</summary>
            <KnowledgeView blocks={card.more} />
          </details>
        )}
        <div className="learn-refs">
          <strong>อ้างอิงใบเนื้อหา</strong>
          <ul className="ref-list">
            {card.refs.map(r => (
              <li key={r}>
                <Icon name="book" size={15} /> {r}
              </li>
            ))}
          </ul>
        </div>
      </article>
      <div className="learn-actions">
        <p className="muted">ระหว่างทำงานเปิดการ์ดนี้และคู่มือช่างได้ตลอด</p>
        <button type="button" className="btn btn-primary btn-lg" onClick={onNext}>
          {job.demo ? 'ดูพี่บูตสาธิต' : 'พร้อมลงมือ'} <Icon name="arrowRight" size={18} />
        </button>
      </div>
    </div>
  )
}

export function Demo({ onDone }: { onDone: () => void }) {
  const { job } = useRun()
  const frames = job.demo ?? []
  const [index, setIndex] = useState(0)
  const frame = frames[index]
  if (!frame) return null
  const last = index === frames.length - 1

  return (
    <div className="demo">
      <div className="demo-head">
        <span className="eyebrow">
          ดูตัวอย่าง · ภาพที่ {index + 1}/{frames.length}
        </span>
        <button type="button" className="link-btn" onClick={onDone}>
          ข้ามการสาธิต
        </button>
      </div>
      <article className="card demo-card" aria-live="polite">
        <h2>{frame.title}</h2>
        <Speech look={MENTOR.look} name={MENTOR.name} mood="happy" size={64}>
          <p>{frame.say}</p>
        </Speech>
        {frame.visual && (
          <div className="demo-visual">
            <KnowledgeView blocks={[frame.visual]} />
          </div>
        )}
      </article>
      <div className="demo-nav">
        <button type="button" className="btn btn-ghost" disabled={index === 0} onClick={() => setIndex(i => i - 1)}>
          <Icon name="arrowLeft" size={18} /> ก่อนหน้า
        </button>
        <div className="demo-dots" aria-hidden>
          {frames.map((f, i) => (
            <span key={f.title} className={i === index ? 'on' : undefined} />
          ))}
        </div>
        <button type="button" className="btn btn-primary" onClick={() => (last ? onDone() : setIndex(i => i + 1))}>
          {last ? 'ลงมือเองเลย' : 'ถัดไป'} <Icon name="arrowRight" size={18} />
        </button>
      </div>
    </div>
  )
}
