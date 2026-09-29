import { useState } from 'react'
import { CoinAmount, ScoreRing, Stars } from '../components/Bits'
import { Icon } from '../components/Icon'
import { Modal } from '../components/Modal'
import { JOBS, JOB_BY_ID } from '../data/jobs'
import { useGame } from '../game/gameContext'
import { isUnlocked, jobProgress, reputation } from '../game/progress'
import { CRITERION_LABEL } from '../game/scoring'
import type { JobId, SaveData } from '../game/types'
import './results.css'

// Learning goals summarised from the content sheet (the sheet itself has no objective list; see GAME_PLAN.md).
const GOALS: { title: string; jobs: JobId[] }[] = [
  { title: 'สร้าง USB Boot Windows 10 ด้วยโปรแกรม Rufus ได้ (ใบเนื้อหา หน้า 1–3)', jobs: ['make-usb', 'reinstall'] },
  { title: 'กำหนดค่า BIOS ให้เครื่องบูตจาก USB ได้ (หน้า 3–6)', jobs: ['bios-boot', 'reinstall'] },
  { title: 'ติดตั้ง Windows 10 ตามขั้นตอนที่ 1–9 ได้ถูกต้อง (หน้า 6–11)', jobs: ['install-new', 'reinstall'] },
  { title: 'ตั้งค่าหลังติดตั้งและตรวจ Windows Update ตามขั้นตอนที่ 10–17 ได้ (หน้า 11–15)', jobs: ['first-setup', 'reinstall'] },
  { title: 'ติดตั้งระบบปฏิบัติการด้วยความรอบคอบ ไม่ทำข้อมูลเสียหาย', jobs: ['make-usb', 'reinstall'] },
]

function summaryText(save: SaveData, date: string) {
  const lines = [
    'สรุปผลการฝึก Boot & Bloom — การติดตั้งระบบปฏิบัติการ Windows 10',
    `ผู้เรียน: ${save.settings.playerName.trim() || '-'}`,
    `วันที่: ${date}`,
    '',
  ]
  for (const job of JOBS) {
    const p = jobProgress(save, job.id)
    if (!p.best) {
      lines.push(`${job.code} ${job.title}: ยังไม่ได้ทำ`)
      continue
    }
    const crit = job.criteria.map(c => `${CRITERION_LABEL[c]} ${Math.round((p.best?.criteria[c] ?? 0) * 100)}%`).join(' · ')
    lines.push(`${job.code} ${job.title}: คะแนนดีที่สุด ${p.best.score}/100 (${p.best.stars} ดาว) · ทำ ${p.completions} ครั้ง`)
    lines.push(`  ${crit}`)
    const passed = p.best.objectives.filter(o => o.passed).length
    lines.push(`  เป้าหมายที่ผ่าน ${passed}/${job.objectives.length} · คำใบ้รอบที่ดีที่สุด ${p.best.hintsUsed} ครั้ง`)
    if (p.best.mistakes.length) lines.push(`  ควรฝึกเพิ่ม: ${p.best.mistakes.map(m => job.mistakes[m]?.label ?? m).join('; ')}`)
  }
  return lines.join('\n')
}

async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}

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
        {JOBS.map(job => {
          const p = jobProgress(save, job.id)
          const best = p.best
          return (
            <article key={job.id} className="card result-job">
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
        <ul>
          {GOALS.map(c => {
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
