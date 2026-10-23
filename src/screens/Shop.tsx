import { useState } from 'react'
import { Avatar } from '../components/Avatar'
import { CoinAmount, Speech, Stars } from '../components/Bits'
import { Icon } from '../components/Icon'
import { JOBS, JOB_BY_ID, jobsOf, TRACKS } from '../data/jobs'
import { MENTOR } from '../data/people'
import { useGame } from '../game/gameContext'
import { isUnlocked, jobProgress, lastTrack, LEVELS, nextJob, reputation, shopLevel } from '../game/progress'
import type { JobDef, JobId } from '../game/types'
import { DecorEditor } from './decor/DecorEditor'
import { Showcase } from './decor/Showcase'
import type { Screen } from './Hud'
import { ShopScene } from './ShopScene'
import './shop.css'

function JobCard({ job, onOpen }: { job: JobDef; onOpen: (id: JobId) => void }) {
  const { save } = useGame()
  const unlocked = isUnlocked(save, job)
  const progress = jobProgress(save, job.id)
  const done = progress.completions > 0
  const req = job.requires ? JOB_BY_ID[job.requires] : undefined

  return (
    <article className={`job-card card${unlocked ? '' : ' is-locked'}${done ? ' is-done' : ''}`}>
      <div className="job-card-top">
        <div className="job-card-avatar">
          <Avatar look={job.customer.look} mood={done ? 'happy' : 'worried'} size={72} />
        </div>
        <div>
          <span className="job-code">{job.code}</span>
          <h3>{job.title}</h3>
          <small className="muted">
            {job.customer.name} · {job.customer.role}
          </small>
        </div>
      </div>
      <p className="job-tagline">{job.tagline}</p>
      <div className="job-meta">
        {job.units.map(u => (
          <span key={u} className={`chip${u.includes('เสริม') ? ' chip-extra' : ''}`}>
            {u}
          </span>
        ))}
        <span className="chip">
          <Icon name="clock" size={14} /> ~{job.minutes} นาที
        </span>
        <span className="chip chip-warn">
          <CoinAmount value={job.reward} size={14} />
        </span>
      </div>
      <div className="job-card-foot">
        {!unlocked ? (
          <span className="job-locked">
            <Icon name="lock" size={16} /> ปลดล็อกเมื่อทำ{req ? ` ${req.code}` : 'งานก่อนหน้า'}เสร็จ
          </span>
        ) : (
          <>
            {done && progress.best ? (
              <span className="job-best">
                <Stars value={progress.best.stars} size={16} />
                <small>คะแนนดีที่สุด {progress.best.score}</small>
              </span>
            ) : (
              <span className="chip chip-good">ใหม่</span>
            )}
            <button type="button" className={`btn ${done ? 'btn-ghost' : 'btn-primary'} btn-sm`} onClick={() => onOpen(job.id)}>
              {done ? 'ทำอีกครั้ง' : 'เปิดใบงาน'}
              <Icon name="arrowRight" size={16} />
            </button>
          </>
        )}
      </div>
    </article>
  )
}

export function Shop({ onOpenJob, onNavigate, view = 'shop' }: { onOpenJob: (id: JobId) => void; onNavigate: (s: Screen) => void; view?: 'shop' | 'board' | 'decor' }) {
  const game = useGame()
  const { save } = game
  const rep = reputation(save)
  const level = shopLevel(rep)
  // suggest the next job in the track played last; the other track's next job is offered too
  const prefer = lastTrack(save, JOBS) ?? 'win10'
  const next = nextJob(save, JOBS, prefer)
  const other = next ? nextJob(save, JOBS.filter(j => j.track !== next.track)) : undefined
  const doneCount = JOBS.filter(j => jobProgress(save, j.id).completions > 0).length
  const maxRep = JOBS.length * 3

  const greeting =
    doneCount === 0
      ? 'ยินดีต้อนรับช่างฝึกหัด! ลูกค้ารออยู่ที่เคาน์เตอร์แล้ว ลองรับงานแรกดูนะ ค่อย ๆ ตรวจ ค่อย ๆ ตัดสินใจ มีอะไรพี่ช่วยอยู่ข้าง ๆ'
      : next
        ? `เก่งมาก! ร้านเริ่มมีชื่อเสียงแล้ว งานถัดไปคือ "${next.title}" ของ${next.customer.name}`
        : 'ทำครบทุกงานแล้ว! ลองเล่นซ้ำเพื่อเก็บสามดาว หรือเปิดคู่มือช่างทบทวนก่อนสอบ'

  const [showcase, setShowcase] = useState(false)
  const openBoard = () => onNavigate({ name: 'board' })
  const openDecor = () => onNavigate({ name: 'decor' })
  const backToShop = () => onNavigate({ name: 'shop' })

  return (
    <div className={`shop shop-view-${view}`}>
      {view !== 'shop' && <div className="shop-page-heading"><button type="button" className="btn btn-ghost" onClick={backToShop}><Icon name="arrowLeft" size={20} /> กลับหน้าร้าน</button><h1>{view === 'board' ? 'เลือกงานที่อยากเรียนรู้' : 'แต่งร้านในแบบของเรา'}</h1><p className="muted">{view === 'board' ? 'อ่านโจทย์ เลือกงาน แล้วค่อย ๆ ฝึกทีละขั้น' : 'ซื้อของด้วยเหรียญจากการฝึก แล้วลากไปวางตรงไหนก็ได้ ของพิเศษปลดล็อกตามระดับร้าน'}</p></div>}
      {view === 'shop' && <section className="shop-top">
        <div className="shop-scene-wrap">
          <ShopScene
            decor={save.decor}
            customer={next?.customer}
            onCustomer={next ? () => onOpenJob(next.id) : undefined}
            onBoard={openBoard}
            onManual={() => onNavigate({ name: 'manual' })}
          />
        </div>
        <aside className="shop-side card">
          <Speech look={MENTOR.look} name={`${MENTOR.name} · ${MENTOR.role}`} mood="happy">
            <p>{greeting}</p>
          </Speech>
          {next && (
            <div className="shop-next">
              <span className="eyebrow">งานถัดไป</span>
              <h2>{next.title}</h2>
              <p className="muted">{next.tagline}</p>
              <button type="button" className="btn btn-primary btn-lg btn-block" onClick={() => onOpenJob(next.id)}>
                รับงานจาก{next.customer.name}
                <Icon name="arrowRight" size={18} />
              </button>
              {other && (
                <button type="button" className="btn btn-ghost btn-sm btn-block shop-other" onClick={() => onOpenJob(other.id)}>
                  หรือสาย {TRACKS.find(t => t.id === other.track)?.title}: {other.title}
                </button>
              )}
            </div>
          )}
          <div className="shop-level">
            <div className="shop-level-row">
              <span>
                ระดับร้าน <strong>{level.title}</strong>
              </span>
              <span className="muted">
                <Icon name="star" size={14} filled className="star-on" /> {rep}/{maxRep}
              </span>
            </div>
            <div className="meter" role="progressbar" aria-valuemin={0} aria-valuemax={maxRep} aria-valuenow={rep} aria-label="ชื่อเสียงร้าน">
              <span style={{ width: `${(rep / maxRep) * 100}%` }} />
            </div>
            <small className="muted">
              {level.nextAt === null
                ? 'ระดับสูงสุดแล้ว เยี่ยมมาก!'
                : level.nextAt <= maxRep
                  ? `อีก ${level.nextAt - rep} ดาว ได้เลื่อนเป็น "${LEVELS[level.index + 1].title}"`
                  : `ระดับ "${LEVELS[level.index + 1].title}" ต้องใช้ดาวจากงานสาย Windows 11 ที่กำลังเพิ่ม`}
            </small>
          </div>
        </aside>
      </section>}

      {view === 'shop' && <section className="shop-shortcuts" aria-label="ไปยังพื้นที่อื่น"><button className="card shortcut" onClick={openBoard}><Icon name="arrowRight" size={28}/><span><strong>กระดานงาน</strong><small>เลือกภารกิจและดูความก้าวหน้าทั้ง {JOBS.length} งาน</small></span></button><button className="card shortcut" onClick={openDecor}><Icon name="star" size={28}/><span><strong>ตกแต่งร้าน</strong><small>ซื้อของแล้วลากวางได้อิสระ ตั้งชื่อร้านเอง</small></span></button><button className="card shortcut" onClick={() => setShowcase(true)}><Icon name="monitor" size={28}/><span><strong>โชว์ร้าน</strong><small>เปิดร้านเต็มจอไว้แข่ง และบันทึกเป็นรูป</small></span></button></section>}
      {view === 'board' && <section id="board" className="board" aria-labelledby="board-title">
        <div className="section-head">
          <div>
            <span className="eyebrow">กระดานงาน</span>
            <h2 id="board-title">งานที่ลูกค้าฝากไว้</h2>
          </div>
          <p className="muted">
            ทำเสร็จแล้ว {doneCount}/{JOBS.length} งาน · คะแนนวิชาแยกจากเหรียญในเกม
          </p>
        </div>
        {TRACKS.map(track => {
          const jobs = jobsOf(track.id)
          return (
            <div key={track.id} className={`board-track board-track-${track.id}`}>
              <div className="board-track-head">
                <h3>{track.title}</h3>
                <p className="muted">
                  {track.subtitle} · {track.sheet}
                </p>
              </div>
              {jobs.length ? (
                <div className="job-grid">
                  {jobs.map(job => (
                    <JobCard key={job.id} job={job} onOpen={onOpenJob} />
                  ))}
                </div>
              ) : (
                <p className="muted board-track-soon">งานสายนี้กำลังเพิ่ม</p>
              )}
            </div>
          )
        })}
      </section>}

      {view === 'decor' && <DecorEditor onShowcase={() => setShowcase(true)} />}
      {showcase && <Showcase onClose={() => setShowcase(false)} />}
    </div>
  )
}

