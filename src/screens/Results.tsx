import { useState } from 'react'
import { CoinAmount, ScoreRing, Stars } from '../components/Bits'
import { Icon } from '../components/Icon'
import { Modal } from '../components/Modal'
import { JOBS, JOB_BY_ID, jobsOf, TRACKS } from '../data/jobs'
import { useGame } from '../game/gameContext'
import { isUnlocked, jobProgress, reputation } from '../game/progress'
import { CRITERION_LABEL } from '../game/scoring'
import type { JobId, Track } from '../game/types'
import { copyText, summaryText } from './report'
import './results.css'

// Win10: goals summarised from the Windows 10 content sheet (it has no objective list; see GAME_PLAN.md).
// Win11: the six behavioural objectives listed in the Windows 11 content-analysis file.
const GOALS: { track: Track; title: string; jobs: JobId[] }[] = [
  { track: 'win10', title: 'ดาวน์โหลด Media Creation Tool จาก Microsoft สร้าง USB และติดตั้ง Windows 10 ตามข้อมูลเครื่องลูกค้า (เนื้อหาเสริม)', jobs: ['microsoft-install'] },
  { track: 'win10', title: 'สร้าง USB Boot Windows 10 ด้วยโปรแกรม Rufus ได้ (ใบเนื้อหา Win10 หน้า 1–3)', jobs: ['make-usb', 'reinstall'] },
  { track: 'win10', title: 'กำหนดค่า BIOS ให้เครื่องบูตจาก USB ได้ (หน้า 3–6)', jobs: ['bios-boot', 'reinstall'] },
  { track: 'win10', title: 'ติดตั้ง Windows 10 ตามขั้นตอนที่ 1–9 ได้ถูกต้อง (หน้า 6–11)', jobs: ['install-new', 'reinstall'] },
  { track: 'win10', title: 'ตั้งค่าหลังติดตั้งและตรวจ Windows Update ตามขั้นตอนที่ 10–17 ได้ (หน้า 11–15)', jobs: ['first-setup', 'reinstall'] },
  { track: 'win10', title: 'ติดตั้งระบบปฏิบัติการด้วยความรอบคอบ ไม่ทำข้อมูลเสียหาย', jobs: ['make-usb', 'reinstall'] },
  { track: 'win11', title: 'ตรวจความพร้อมของเครื่องตามข้อกำหนด Windows 11 และสำรองข้อมูลก่อนติดตั้งได้ (ใบเนื้อหา Win11 หน้า 1–2)', jobs: ['w11-check', 'ch-ready-office', 'ch-ready-old'] },
  { track: 'win11', title: 'สร้าง USB ติดตั้ง Windows 11 ด้วย Media Creation Tool ได้ (หน้า 2–3)', jobs: ['w11-usb', 'ch-mct-design', 'ch-mct-hotel'] },
  { track: 'win11', title: 'ตั้งค่า UEFI, Secure Boot และ TPM 2.0 แล้วบูตจาก USB แบบ UEFI ได้ (หน้า 4–5)', jobs: ['w11-uefi', 'ch-uefi-hotel', 'ch-uefi-student'] },
  { track: 'win11', title: 'ติดตั้ง Windows 11 และตั้งค่าเริ่มต้น (OOBE) ได้ถูกต้อง (หน้า 5–8)', jobs: ['w11-install', 'ch-setup11-design', 'ch-setup11-hotel', 'ch-oobe11-design', 'ch-oobe11-student'] },
  { track: 'win11', title: 'ตรวจสอบหลังติดตั้ง: Activation, Windows Update, ไดรเวอร์, Windows Security และการสำรองข้อมูลได้ (หน้า 8–10)', jobs: ['w11-verify', 'ch-post-design', 'ch-post-hotel'] },
]

export function Results({ onOpenJob }: { onOpenJob: (id: JobId) => void }) {
  const game = useGame()
  const { save } = game
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')
  const [manualText, setManualText] = useState<string | null>(null)
  const [confirmReset, setConfirmReset] = useState(false)
  const done = JOBS.filter(j => jobProgress(save, j.id).best)
  const avg = done.length ? Math.round(done.reduce((s, j) => s + (jobProgress(save, j.id).best?.score ?? 0), 0) / done.length) : 0

  const makeSummary = () => summaryText(save, new Date().toLocaleDateString('th-TH', { dateStyle: 'long' }))

  const copy = async () => {
    const text = makeSummary()
    const ok = await copyText(text)
    setCopied(ok ? 'ok' : 'fail')
    setManualText(ok ? null : text)
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([makeSummary()], { type: 'text/plain;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `boot-bloom-${save.settings.playerName.trim() || 'ผลการฝึก'}.txt`
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="results">
      <header className="results-head">
        <div>
          <span className="eyebrow">ผลการฝึก</span>
          <h1>สมุดพกช่างฝึกหัด</h1>
          <p className="muted">คะแนนวิชาดูจากความถูกต้อง เหตุผล การรักษาข้อมูล และการทดสอบหลังแก้ ส่วนเหรียญและดาวเป็นรางวัลในเกม แยกจากกัน</p>
        </div>
        <label className="results-name">
          <span>ชื่อ/เลขที่ (ใส่หรือไม่ใส่ก็ได้)</span>
          <input
            type="text"
            value={save.settings.playerName}
            maxLength={60}
            placeholder="เช่น สมชาย ปวช.1/2 เลขที่ 5"
            onChange={e => game.updateSettings({ playerName: e.target.value })}
          />
        </label>
      </header>

      <section className="results-overview">
        <div className="card overview-card">
          <span className="muted">งานที่ทำสำเร็จ</span>
          <strong>
            {done.length}/{JOBS.length}
          </strong>
        </div>
        <div className="card overview-card">
          <span className="muted">คะแนนวิชาเฉลี่ย (ดีที่สุด)</span>
          <strong>{done.length ? avg : '–'}</strong>
        </div>
        <div className="card overview-card">
          <span className="muted">ชื่อเสียงร้าน</span>
          <strong>
            <Icon name="star" size={22} filled className="star-on" /> {reputation(save)}
          </strong>
        </div>
        <div className="card overview-card">
          <span className="muted">เหรียญในเกม</span>
          <strong>
            <CoinAmount value={save.coins} size={22} />
          </strong>
        </div>
      </section>

      <section className="results-jobs">
        {TRACKS.flatMap(t => jobsOf(t.id)).map(job => {
          const p = jobProgress(save, job.id)
          const best = p.best
          return (
            <article key={job.id} className="card result-job">
              {job.order === 1 && <span className="result-track">สาย {TRACKS.find(t => t.id === job.track)?.title}</span>}
              <div className="result-job-main">
                {best ? <ScoreRing score={best.score} size={104} /> : <div className="result-empty">ยังไม่ได้ทำ</div>}
                <div className="result-job-info">
                  <span className="job-code">{job.code}</span>
                  <h2>{job.title}</h2>
                  <div className="result-job-meta">
                    {best && <Stars value={best.stars} />}
                    <span className="muted">
                      เปิดงาน {p.attempts} ครั้ง · ส่งงาน {p.completions} ครั้ง
                      {best ? ` · คำใบ้ในรอบที่ดีที่สุด ${best.hintsUsed}` : ''}
                    </span>
                  </div>
                </div>
                {isUnlocked(save, job) ? (
                  <button type="button" className="btn btn-ghost btn-sm" onClick={() => onOpenJob(job.id)}>
                    {best ? 'ฝึกอีกครั้ง' : 'เริ่มงานนี้'}
                  </button>
                ) : (
                  <span className="job-locked">
                    <Icon name="lock" size={16} /> ยังล็อกอยู่
                  </span>
                )}
              </div>
              {best && (
                <div className="result-job-detail">
                  <div className="criteria">
                    {job.criteria.map(c => {
                      const v = best.criteria[c] ?? 0
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
                        const passed = best.objectives.find(x => x.id === o.id)?.passed
                        return (
                          <li key={o.id} className={passed ? 'ok' : 'no'}>
                            <Icon name={passed ? 'check' : 'x'} size={16} />
                            {o.text}
                          </li>
                        )
                      })}
                    </ul>
                    {best.mistakes.length > 0 && (
                      <>
                        <h4>จุดที่ควรฝึกเพิ่ม</h4>
                        <ul className="mistake-list">
                          {best.mistakes.map(m => (
                            <li key={m}>{job.mistakes[m]?.label ?? m}</li>
                          ))}
                        </ul>
                      </>
                    )}
                  </div>
                </div>
              )}
            </article>
          )
        })}
      </section>

      <section className="card results-comp">
        <h2>จุดประสงค์การเรียนรู้จากใบเนื้อหา</h2>
        <p className="muted">ถือว่าผ่านเมื่อทำงานที่เกี่ยวข้องสำเร็จและผ่านเป้าหมายการเรียนรู้ครบอย่างน้อย 1 งาน</p>
        {TRACKS.filter(t => GOALS.some(g => g.track === t.id)).map(t => (
          <div key={t.id}>
            <h3 className="results-goal-track">สาย {t.title}</h3>
            <ul>
              {GOALS.filter(g => g.track === t.id).map(c => {
                const ok = c.jobs.some(id => {
                  const best = jobProgress(save, id).best
                  return best && best.objectives.every(o => o.passed)
                })
                return (
                  <li key={c.title} className={ok ? 'ok' : undefined}>
                    <Icon name={ok ? 'check' : 'target'} size={18} />
                    <div>
                      <strong>{c.title}</strong>
                      <small className="muted">ฝึกใน: {c.jobs.map(id => JOB_BY_ID[id].code).join(', ')}</small>
                    </div>
                  </li>
                )
              })}
            </ul>
          </div>
        ))}
      </section>

      <section className="card results-teacher">
        <div>
          <h2>สำหรับครูและการส่งงาน</h2>
          <p className="muted">ผลบันทึกในเบราว์เซอร์นี้เท่านั้น ไม่ส่งข้อมูลออกไปที่ใด คัดลอกสรุปไปวางในช่องทางส่งงานของห้องเรียนได้</p>
        </div>
        <div className="teacher-actions">
          <button type="button" className="btn btn-primary" onClick={copy}>
            <Icon name="copy" size={18} /> คัดลอกสรุปผล
          </button>
          <button type="button" className="btn btn-ghost" onClick={download}>
            <Icon name="download" size={18} /> ดาวน์โหลด .txt
          </button>
          <span role="status" className="muted">
            {copied === 'ok' ? 'คัดลอกแล้ว' : copied === 'fail' ? 'เบราว์เซอร์ไม่อนุญาตให้คัดลอกอัตโนมัติ เลือกข้อความด้านล่างแล้วคัดลอกเองได้' : ''}
          </span>
          <label className="switch">
            <input type="checkbox" checked={save.settings.unlockAll} onChange={e => game.updateSettings({ unlockAll: e.target.checked })} />
            <span>เปิดทุกงาน (ให้ครูเลือกงานตามบทเรียน)</span>
          </label>
          <button type="button" className="btn btn-ghost" onClick={() => setConfirmReset(true)}>
            <Icon name="trash" size={18} /> ล้างความคืบหน้า
          </button>
        </div>
        {manualText && (
          <textarea className="summary-box" readOnly value={manualText} aria-label="สรุปผลสำหรับคัดลอก" onFocus={e => e.target.select()} />
        )}
      </section>

      {confirmReset && (
        <Modal
          title="ล้างความคืบหน้าทั้งหมด?"
          tone="bad"
          onClose={() => setConfirmReset(false)}
          actions={[
            { label: 'ยกเลิก', onClick: () => setConfirmReset(false) },
            {
              label: 'ล้างข้อมูล',
              variant: 'danger',
              onClick: () => {
                game.reset()
                setConfirmReset(false)
              },
            },
          ]}
        >
          <p>คะแนน เหรียญ และของตกแต่งในเบราว์เซอร์นี้จะหายทั้งหมด ย้อนกลับไม่ได้</p>
        </Modal>
      )}
    </div>
  )
}
