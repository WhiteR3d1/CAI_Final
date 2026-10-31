import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { CoinAmount, ScoreRing, Stars } from '../components/Bits'
import { Icon } from '../components/Icon'
import { JOBS, jobsOf, TRACKS } from '../data/jobs'
import { DECOR_BY_ID } from '../data/decor'
import { api, errorMessage, type StudentSummary } from '../auth/api'
import { jobProgress, normalizeSave, reputation, shopLevel } from '../game/progress'
import type { SaveData } from '../game/types'
import { exportShopPng } from '../screens/decor/exportPng'
import { copyText, summaryText } from '../screens/report'
import { ShopScene } from '../screens/ShopScene'

const fileSafe = (s: string) => s.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '-').slice(0, 40)

/** read-only view of one student: the shop as they decorated it, plus the score report for marking */
export function StudentDetail({ token, student, onClose }: { token: string; student: StudentSummary; onClose: () => void }) {
  const [save, setSave] = useState<SaveData>()
  const [message, setMessage] = useState('')
  const [png, setPng] = useState<string | null>(null)
  const [pngStatus, setPngStatus] = useState<'idle' | 'busy' | 'error'>('idle')
  const [copied, setCopied] = useState<'idle' | 'ok' | 'fail'>('idle')
  const [report, setReport] = useState<string | null>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)

  useEffect(() => {
    closeRef.current?.focus()
  }, [])
  useEffect(
    () => () => {
      if (png) URL.revokeObjectURL(png)
    },
    [png],
  )

  const onEscape = useEffectEvent((e: globalThis.KeyboardEvent) => {
    if (e.key === 'Escape') onClose()
  })
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => onEscape(e)
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  useEffect(() => {
    let cancelled = false
    async function run() {
      try {
        const data = await api<{ save: unknown }>('student', { token, uid: student.uid })
        if (!cancelled) setSave(normalizeSave(data.save))
      } catch (e) {
        if (!cancelled) setMessage(errorMessage(e))
      }
    }
    void run()
    return () => {
      cancelled = true
    }
  }, [token, student.uid])

  const who = `${student.name}${student.username ? ` (${student.username})` : ''}`
  const makeReport = () => (save ? summaryText(save, new Date().toLocaleDateString('th-TH', { dateStyle: 'long' }), who) : '')

  const copy = async () => {
    const text = makeReport()
    const ok = await copyText(text)
    setCopied(ok ? 'ok' : 'fail')
    setReport(ok ? null : text)
  }

  const download = () => {
    const url = URL.createObjectURL(new Blob([makeReport()], { type: 'text/plain;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = `boot-bloom-${fileSafe(student.username || student.name)}.txt`
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  const makePng = async () => {
    if (!sceneRef.current || !save) return
    setPngStatus('busy')
    try {
      const blob = await exportShopPng(sceneRef.current, {
        title: save.decor.signText,
        owner: save.settings.playerName.trim() || student.name,
        level: shopLevel(reputation(save)).title,
        items: save.decor.placed.length,
      })
      setPng(URL.createObjectURL(blob))
      setPngStatus('idle')
    } catch {
      setPngStatus('error')
    }
  }

  const rep = save ? reputation(save) : 0
  const done = save ? JOBS.filter(j => jobProgress(save, j.id).best) : []
  const avg =
    save && done.length ? Math.round(done.reduce((sum, j) => sum + (jobProgress(save, j.id).best?.score ?? 0), 0) / done.length) : 0
  const used = save
    ? Object.entries(
        save.decor.placed.reduce<Record<string, number>>((acc, p) => {
          acc[p.item] = (acc[p.item] ?? 0) + 1
          return acc
        }, {}),
      )
    : []

  return (
    <div className="teacher-detail" role="dialog" aria-modal="true" aria-labelledby="teacher-detail-title">
      <div className="teacher-detail-frame card">
        <header className="teacher-detail-head">
          <div>
            <span className="eyebrow">ร้านของนักเรียน</span>
            <h2 id="teacher-detail-title">{student.name}</h2>
            <p className="muted">
              ชื่อผู้ใช้ {student.username}
              {save && save.settings.playerName.trim() ? ` · ชื่อที่นักเรียนกรอกไว้ ${save.settings.playerName.trim()}` : ''}
            </p>
          </div>
          <div className="teacher-detail-btns">
            <button type="button" className="btn btn-gold btn-sm" onClick={makePng} disabled={!save || pngStatus === 'busy'}>
              <Icon name="image" size={18} /> บันทึกรูปร้าน
            </button>
            <button ref={closeRef} type="button" className="btn btn-primary btn-sm" onClick={onClose}>
              <Icon name="x" size={18} /> ปิด
            </button>
          </div>
        </header>

        {message && (
          <p role="alert" className="account-error">
            {message}
          </p>
        )}
        {!save && !message && <p className="muted">กำลังโหลดร้านและคะแนน…</p>}

        {save && (
          <>
            <div className="teacher-detail-top">
              <div className="teacher-detail-scene">
                <ShopScene
                  decor={save.decor}
                  people={false}
                  sceneRef={sceneRef}
                  label={`ร้าน ${save.decor.signText} ของ ${student.name}`}
                />
              </div>
              <div className="teacher-detail-side">
                {done.length > 0 ? <ScoreRing score={avg} size={116} label="คะแนนเฉลี่ย" /> : <p className="muted">ยังไม่มีงานที่ส่ง</p>}
                <ul className="teacher-facts">
                  <li>
                    <span>ชื่อร้าน</span>
                    <strong>{save.decor.signText}</strong>
                  </li>
                  <li>
                    <span>ระดับร้าน</span>
                    <strong>{shopLevel(rep).title}</strong>
                  </li>
                  <li>
                    <span>ดาวรวม</span>
                    <strong>
                      <Icon name="star" size={16} filled className="star-on" /> {rep}/{JOBS.length * 3}
                    </strong>
                  </li>
                  <li>
                    <span>งานที่ส่ง</span>
                    <strong>
                      {done.length}/{JOBS.length}
                    </strong>
                  </li>
                  <li>
                    <span>เหรียญคงเหลือ</span>
                    <strong>
                      <CoinAmount value={save.coins} />
                    </strong>
                  </li>
                  <li>
                    <span>ของตกแต่งในร้าน</span>
                    <strong>{save.decor.placed.length} ชิ้น</strong>
                  </li>
                </ul>
              </div>
            </div>

            <div className="teacher-detail-actions">
              <button type="button" className="btn btn-primary btn-sm" onClick={copy}>
                <Icon name="copy" size={18} /> คัดลอกสรุปผล
              </button>
              <button type="button" className="btn btn-ghost btn-sm" onClick={download}>
                <Icon name="download" size={18} /> ดาวน์โหลด .txt
              </button>
              <span role="status" className="muted">
                {copied === 'ok'
                  ? 'คัดลอกแล้ว'
                  : copied === 'fail'
                    ? 'เบราว์เซอร์ไม่อนุญาตให้คัดลอกอัตโนมัติ เลือกข้อความด้านล่างแล้วคัดลอกเอง'
                    : ''}
              </span>
              <span className="muted" aria-live="polite">
                {pngStatus === 'busy' ? 'กำลังสร้างรูป…' : pngStatus === 'error' ? 'สร้างรูปไม่สำเร็จ ลองอีกครั้ง' : ''}
              </span>
              {png && pngStatus !== 'busy' && (
                <a
                  className="btn btn-gold btn-sm"
                  href={png}
                  download={`ร้าน-${fileSafe(save.decor.signText)}-${fileSafe(student.username)}.png`}
                >
                  <Icon name="download" size={18} /> ดาวน์โหลดรูปที่สร้างไว้
                </a>
              )}
            </div>
            {report && (
              <textarea
                className="summary-box"
                readOnly
                value={report}
                aria-label="สรุปผลสำหรับคัดลอก"
                onFocus={e => e.target.select()}
              />
            )}

            {used.length > 0 && (
              <section className="teacher-decor-list">
                <h3>ของตกแต่งที่ใช้</h3>
                <div className="teacher-chips">
                  {used.map(([id, n]) => (
                    <span key={id} className="chip">
                      {DECOR_BY_ID[id]?.name ?? id}
                      {n > 1 ? ` ×${n}` : ''}
                    </span>
                  ))}
                </div>
              </section>
            )}

            <section className="teacher-scores">
              <h3>คะแนนรายงาน</h3>
              <p className="muted">คะแนนวิชามาจากความถูกต้อง เหตุผล การรักษาข้อมูล และการทดสอบหลังแก้ ส่วนเหรียญกับดาวเป็นรางวัลในเกม</p>
              {TRACKS.map(track => (
                <div key={track.id}>
                  <h4>สาย {track.title}</h4>
                  <div className="teacher-table-wrap">
                    <table className="teacher-table">
                      <thead>
                        <tr>
                          <th scope="col">งาน</th>
                          <th scope="col">คะแนนดีที่สุด</th>
                          <th scope="col">ดาว</th>
                          <th scope="col">เปิด/ส่ง</th>
                          <th scope="col">คำใบ้</th>
                          <th scope="col">เป้าหมายที่ผ่าน</th>
                          <th scope="col">จุดที่ควรฝึกเพิ่ม</th>
                        </tr>
                      </thead>
                      <tbody>
                        {jobsOf(track.id).map(job => {
                          const p = jobProgress(save, job.id)
                          const best = p.best
                          return (
                            <tr key={job.id} className={best ? undefined : 'is-empty'}>
                              <th scope="row">
                                <span className="job-code">{job.code}</span> {job.title}
                              </th>
                              <td>{best ? `${best.score}/100` : '—'}</td>
                              <td>{best ? <Stars value={best.stars} size={14} /> : '—'}</td>
                              <td>
                                {p.attempts}/{p.completions}
                              </td>
                              <td>{best ? best.hintsUsed : '—'}</td>
                              <td>{best ? `${best.objectives.filter(o => o.passed).length}/${job.objectives.length}` : '—'}</td>
                              <td>
                                {best
                                  ? best.mistakes.length
                                    ? best.mistakes.map(m => job.mistakes[m]?.label ?? m).join(', ')
                                    : 'ไม่มี'
                                  : '—'}
                              </td>
                            </tr>
                          )
                        })}
                      </tbody>
                    </table>
                  </div>
                </div>
              ))}
            </section>
          </>
        )}
      </div>
    </div>
  )
}
