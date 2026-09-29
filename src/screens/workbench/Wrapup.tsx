import { CoinAmount, ScoreRing, Speech, Stars } from '../../components/Bits'
import { Icon } from '../../components/Icon'
import { RichText } from '../../components/RichText'
import { JOBS } from '../../data/jobs'
import { useGame } from '../../game/gameContext'
import { isUnlocked, jobProgress, reputation } from '../../game/progress'
import { CRITERION_LABEL } from '../../game/scoring'
import type { JobId } from '../../game/types'
import { useRun } from './runContext'
import type { RunAction } from './runState'

export function Handover({ onBack, onSubmit }: { onBack: () => void; onSubmit: () => void }) {
  const { job, state } = useRun()
  const required = job.checks.filter(c => c.required)
  const missing = required.filter(c => !state.checks.includes(c.id))

  return (
    <div className="handover">
      <Speech look={job.customer.look} name={job.customer.name} mood={missing.length ? 'neutral' : 'happy'} size={72}>
        <p>เสร็จแล้วใช่ไหม ขอดูหน่อยว่าตรวจอะไรไปบ้าง</p>
      </Speech>
      <article className="card handover-card">
        <span className="eyebrow">ใบตรวจรับงาน · {job.code}</span>
        <h2>ทดสอบและส่งงาน</h2>
        <ul className="checklist">
          {job.checks.map(c => {
            const done = state.checks.includes(c.id)
            return (
              <li key={c.id} className={done ? 'ok' : c.required ? 'no' : 'opt'}>
                <Icon name={done ? 'check' : c.required ? 'x' : 'info'} size={18} />
                <span>
                  {c.label}
                  {!c.required && <small className="muted"> (ไม่บังคับ)</small>}
                </span>
              </li>
            )
          })}
        </ul>
        {missing.length > 0 ? (
          <aside className="kb-note kb-note-warn">
            <Icon name="alert" size={18} />
            <div>
              <strong>ยังตรวจไม่ครบ</strong>
              <p>
                ช่างที่ดีทดสอบก่อนส่งทุกครั้ง ถ้าส่งตอนนี้ เกณฑ์ "การทดสอบหลังแก้" จะได้ไม่เต็ม กลับไปที่โต๊ะซ่อมเพื่อตรวจเพิ่มได้ งานที่ทำไว้ยังอยู่ครบ
              </p>
            </div>
          </aside>
        ) : (
          <aside className="kb-note kb-note-tip">
            <Icon name="check" size={18} />
            <div>
              <strong>ตรวจครบแล้ว</strong>
              <p>พร้อมส่งมอบงานให้ลูกค้า</p>
            </div>
          </aside>
        )}
        <div className="handover-actions">
          <button type="button" className="btn btn-ghost" onClick={onBack}>
            <Icon name="arrowLeft" size={18} /> กลับไปที่โต๊ะซ่อม
          </button>
          <button type="button" className="btn btn-primary btn-lg" onClick={onSubmit}>
            ส่งมอบงาน <Icon name="arrowRight" size={18} />
          </button>
        </div>
      </article>
    </div>
  )
}

export function Debrief({ dispatch, onFinish }: { dispatch: (a: RunAction) => void; onFinish: () => void }) {
  const run = useRun()
  const { job, state } = run
  const allCorrect = job.quiz.every(q => state.quiz[q.id]?.picked.some(i => q.choices[i]?.correct))

  const pick = (qid: string, choice: number, correct: boolean) => {
    dispatch({ type: 'quiz', qid, choice, correct })
    run.play(correct ? 'success' : 'error')
  }

  return (
    <div className="debrief">
      <Speech look={job.customer.look} name={job.customer.name} mood="happy" size={72}>
        <p>{job.thanks}</p>
      </Speech>

      <div className="debrief-grid">
        <article className="card debrief-card">
          <span className="eyebrow">สรุปงาน</span>
          <h2>สิ่งที่ได้เรียนรู้</h2>
          <h4>หลักการสำคัญ</h4>
          <ul className="principles">
            {job.principles.map(p => (
              <li key={p}>
                <Icon name="sparkle" size={15} />
                {p}
              </li>
            ))}
          </ul>
          {state.log.length > 0 && (
            <>
              <h4>ขั้นตอนที่คุณทำ</h4>
              <ol className="done-steps">
                {state.log.map(l => (
                  <li key={l}>{l}</li>
                ))}
              </ol>
            </>
          )}
          <h4>จุดที่พลาดและเหตุผล</h4>
          {state.mistakes.length === 0 ? (
            <p className="chip chip-good">
              <Icon name="check" size={14} /> ไม่มีจุดพลาดในงานนี้ ยอดเยี่ยม!
            </p>
          ) : (
            <ul className="mistakes">
              {state.mistakes.map(id => {
                const m = job.mistakes[id]
                return (
                  <li key={id} className={`mistake-${m.severity}`}>
                    <strong>{m.label}</strong>
                    <p>
                      <RichText text={m.explain} />
                    </p>
                    <small className="muted">
                      {m.ref ? `อ้างอิง: ${m.ref}` : ''}
                      {m.extra ? `${m.ref ? ' · ' : ''}เสริมนอกใบเนื้อหา` : ''}
                    </small>
                  </li>
                )
              })}
            </ul>
          )}
        </article>

        <article className="card debrief-card">
          <span className="eyebrow">ตรวจความเข้าใจ</span>
          <h2>ลองอธิบายเหตุผล</h2>
          <p className="muted">ตอบใหม่ได้จนกว่าจะถูก แต่คะแนน "เหตุผล" นับจากคำตอบแรก</p>
          <div className="quiz">
            {job.quiz.map((q, qi) => {
              const record = state.quiz[q.id]
              const solved = record?.picked.some(i => q.choices[i]?.correct)
              const lastPick = record?.picked[record.picked.length - 1]
              const lastChoice = lastPick !== undefined ? q.choices[lastPick] : undefined
              return (
                <fieldset key={q.id} className={`quiz-q${solved ? ' is-solved' : ''}`}>
                  <legend>
                    <span className={`chip ${q.kind === 'transfer' ? 'chip-warn' : ''}`}>{q.kind === 'transfer' ? 'ประยุกต์' : 'เหตุผล'}</span>
                    ข้อ {qi + 1}. {q.prompt}
                  </legend>
                  <div className="quiz-choices">
                    {q.choices.map((c, ci) => {
                      const picked = record?.picked.includes(ci)
                      return (
                        <button
                          key={c.text}
                          type="button"
                          className={`quiz-choice${picked ? (c.correct ? ' right' : ' wrong') : ''}`}
                          disabled={solved || picked}
                          onClick={() => pick(q.id, ci, Boolean(c.correct))}
                        >
                          <span className="quiz-letter">{'กขคง'[ci]}</span>
                          {c.text}
                          {picked && <Icon name={c.correct ? 'check' : 'x'} size={16} />}
                        </button>
                      )
                    })}
                  </div>
                  {lastChoice && (
                    <p className={`quiz-feedback ${lastChoice.correct ? 'ok' : 'no'}`} role="status">
                      {lastChoice.feedback}
                      {lastChoice.correct && q.ref ? <small className="muted"> ({q.ref})</small> : null}
                    </p>
                  )}
                </fieldset>
              )
            })}
          </div>
          <button type="button" className="btn btn-primary btn-lg btn-block" disabled={!allCorrect} onClick={onFinish}>
            {allCorrect ? 'ดูผลงาน' : 'ตอบให้ครบทุกข้อก่อน'} <Icon name="arrowRight" size={18} />
          </button>
        </article>
      </div>
    </div>
  )
}

export function ResultView({ onExit, onOpenJob }: { onExit: () => void; onOpenJob: (id: JobId) => void }) {
  const { job, state } = useRun()
  const { save } = useGame()
  const outcome = state.outcome
  if (!outcome) return null
  const { result, paid } = outcome
  const progress = jobProgress(save, job.id)
  const nextJob = JOBS.find(j => j.order === job.order + 1)
  const nextOpen = nextJob && isUnlocked(save, nextJob)
  const allPassed = result.objectives.every(o => o.passed)

  return (
    <div className="result">
      <article className="card result-card">
        <div className="result-top">
          <ScoreRing score={result.score} size={150} />
          <div className="result-headline">
            <span className="eyebrow">ผลงาน · {job.code}</span>
            <h2>
              {result.score >= 85 && allPassed
                ? 'งานคุณภาพระดับมืออาชีพ!'
                : result.score >= 60
                  ? allPassed
                    ? 'ผ่านงานนี้แล้ว'
                    : 'ผ่านงานแล้ว แต่ยังมีเป้าหมายที่ควรฝึกเพิ่ม'
                  : 'ส่งงานแล้ว แต่ควรฝึกเพิ่ม'}
            </h2>
            <p className="muted">
              คะแนนวิชาดูจาก {job.criteria.map(c => CRITERION_LABEL[c]).join(' · ')} ใช้คำใบ้ {result.hintsUsed} ครั้ง · พลาด {result.mistakes.length}{' '}
              จุด · เปิดงานนี้ครั้งที่ {progress.attempts}
            </p>
          </div>
        </div>

        <div className="result-grid">
          <div className="criteria">
            {job.criteria.map(c => {
              const v = result.criteria[c] ?? 0
              return (
                <div key={c} className="criterion">
                  <span>{CRITERION_LABEL[c]}</span>
                  <div className="meter">
                    <span style={{ width: `${v * 100}%` }} />
                  </div>
                  <strong>{Math.round(v * 100)}%</strong>
                </div>
              )
            })}
          </div>
          <div>
            <h4>เป้าหมายการเรียนรู้</h4>
            <ul className="objective-list">
              {job.objectives.map(o => {
                const passed = result.objectives.find(x => x.id === o.id)?.passed
                return (
                  <li key={o.id} className={passed ? 'ok' : 'no'}>
                    <Icon name={passed ? 'check' : 'x'} size={16} />
                    {o.text}
                  </li>
                )
              })}
            </ul>
          </div>
        </div>

        <div className="reward-strip">
          <div>
            <span className="muted">รางวัลในเกม (แยกจากคะแนนวิชา)</span>
            <div className="reward-row">
              <Stars value={result.stars} size={26} />
              <span className="reward-coins">
                {paid > 0 ? (
                  <>
                    +<CoinAmount value={paid} size={20} />
                  </>
                ) : (
                  <small className="muted">
                    {progress.paid >= job.reward ? 'รับค่าจ้างงานนี้ครบแล้ว' : 'ไม่ได้เหรียญเพิ่ม (รอบก่อนทำได้ดีกว่า)'}
                  </small>
                )}
              </span>
              <span className="muted">
                ชื่อเสียงร้าน <Icon name="star" size={14} filled className="star-on" /> {reputation(save)}
              </span>
            </div>
          </div>
        </div>

        <div className="result-actions">
          <button type="button" className="btn btn-ghost" onClick={onExit}>
            <Icon name="home" size={18} /> กลับร้าน
          </button>
          <button type="button" className="btn btn-ghost" onClick={() => onOpenJob(job.id)}>
            <Icon name="refresh" size={18} /> ทำงานนี้อีกครั้ง
          </button>
          {nextJob && nextOpen && (
            <button type="button" className="btn btn-primary btn-lg" onClick={() => onOpenJob(nextJob.id)}>
              งานถัดไป: {nextJob.title} <Icon name="arrowRight" size={18} />
            </button>
          )}
        </div>
      </article>
    </div>
  )
}
