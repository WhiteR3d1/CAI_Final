import { useState } from 'react'
import { Icon } from '../components/Icon'
import { KnowledgeView } from '../components/KnowledgeView'
import { JOB_BY_ID } from '../data/jobs'
import { EXTRA_NOTES, MANUAL, SOURCE } from '../data/manual'
import './manual.css'

interface Props {
  initialUnit?: number
  compact?: boolean
}

export function Manual({ initialUnit = 1, compact = false }: Props) {
  const [selected, setSelected] = useState<number | 'extra'>(initialUnit)
  const unit = MANUAL.find(u => u.no === selected)

  return (
    <div className={`manual${compact ? ' manual-compact' : ''}`}>
      {!compact && (
        <header className="manual-head">
          <div>
            <span className="eyebrow">คู่มือช่าง</span>
            <h1>สรุปใบเนื้อหา: การติดตั้ง Windows 10</h1>
            <p className="muted">
              สรุปจาก{SOURCE.title} ({SOURCE.subject} {SOURCE.pages} หน้า) เลขหน้าอ้างอิงตามใบเนื้อหา ส่วนที่ติดป้าย "เสริมนอกใบเนื้อหา" เป็นความรู้ที่เกมเพิ่มให้
            </p>
          </div>
        </header>
      )}

      <div className="manual-body">
        <nav className="manual-nav" aria-label="หัวข้อในใบเนื้อหา">
          {MANUAL.map(u => (
            <button key={u.no} type="button" aria-current={selected === u.no ? 'true' : undefined} onClick={() => setSelected(u.no)}>
              <span className="manual-no">{u.no}</span>
              <span>{u.title}</span>
            </button>
          ))}
          <button type="button" aria-current={selected === 'extra' ? 'true' : undefined} onClick={() => setSelected('extra')}>
            <span className="manual-no manual-no-extra">
              <Icon name="sparkle" size={14} />
            </span>
            <span>เสริมนอกใบเนื้อหา</span>
          </button>
        </nav>

        <article className="manual-article card" aria-live="polite">
          {unit ? (
            <>
              <div className="manual-article-head">
                <span className="chip">ตอนที่ {unit.no}</span>
                <span className="chip">{unit.pages}</span>
              </div>
              <h2>{unit.title}</h2>
              <p className="manual-lead">{unit.summary}</p>
              <KnowledgeView blocks={unit.blocks} />
              <div className="manual-foot">
                <div>
                  <h4>คำสำคัญ</h4>
                  <div className="manual-chips">
                    {unit.terms.map(t => (
                      <span key={t} className="chip">
                        {t}
                      </span>
                    ))}
                  </div>
                </div>
                <div>
                  <h4>ฝึกในงาน</h4>
                  <div className="manual-chips">
                    {unit.jobs.length > 0 ? (
                      unit.jobs.map(id => (
                        <span key={id} className="chip chip-good">
                          <Icon name="wrench" size={14} /> {JOB_BY_ID[id].code} {JOB_BY_ID[id].title}
                        </span>
                      ))
                    ) : (
                      <span className="muted">ยังไม่มีงานฝึกตอนนี้</span>
                    )}
                  </div>
                </div>
              </div>
              {unit.cautions?.map(c => (
                <aside key={c} className="kb-note kb-note-warn manual-caution">
                  <Icon name="alert" size={18} />
                  <div>
                    <strong>ข้อสังเกต</strong>
                    <p>{c}</p>
                  </div>
                </aside>
              ))}
            </>
          ) : (
            <>
              <div className="manual-article-head">
                <span className="chip chip-extra">ไม่ได้มาจากใบเนื้อหา</span>
              </div>
              <h2>เนื้อหาเสริมนอกใบเนื้อหา</h2>
              <p className="manual-lead">ความรู้ที่เกมเพิ่มเพื่อให้ทำงานกับเครื่องจริงได้อย่างปลอดภัย ใช้ประกอบ ไม่ใช่เนื้อหาหลักของใบเนื้อหา</p>
              <div className="kb">
                {EXTRA_NOTES.map(n => (
                  <aside key={n.title} className="kb-note kb-note-extra">
                    <Icon name="sparkle" size={18} />
                    <div>
                      <strong>{n.title}</strong>
                      <p>{n.text}</p>
                    </div>
                  </aside>
                ))}
              </div>
            </>
          )}
        </article>
      </div>
    </div>
  )
}
