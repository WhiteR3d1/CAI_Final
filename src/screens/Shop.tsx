import { Avatar } from '../components/Avatar'
import { CoinAmount, Speech, Stars } from '../components/Bits'
import { Icon } from '../components/Icon'
import { DECOR, type DecorItem } from '../data/decor'
import { JOBS, JOB_BY_ID } from '../data/jobs'
import { MENTOR } from '../data/people'
import { useGame } from '../game/gameContext'
import { isUnlocked, jobProgress, LEVELS, reputation, shopLevel } from '../game/progress'
import type { JobDef, JobId } from '../game/types'
import type { Screen } from './Hud'
import { ShopScene } from './ShopScene'
import './shop.css'

function DecorThumb({ id }: { id: string }) {
  return (
    <svg viewBox="0 0 48 48" width="48" height="48" aria-hidden>
      <rect width="48" height="48" rx="12" fill="#eef2e6" />
      {id === 'fern' && (
        <g>
          <path d="M16 20h16l-2 12H18z" fill="#c9926c" />
          <path d="M18 20c-8 4-10 12-9 18 4-7 7-12 11-17zM30 20c8 4 10 12 9 18-4-7-7-12-11-17zM24 20c-2 7-1 13 1 18 1-6 1-12-1-18z" fill="#5f8a55" />
          <path d="M24 6v14" stroke="#8a9b82" />
        </g>
      )}
      {id === 'poster' && (
        <g>
          <rect x="12" y="8" width="24" height="32" rx="2" fill="#fbf6e6" stroke="#cdd8c6" />
          <rect x="12" y="8" width="24" height="8" fill="#2f5e4b" />
          <path d="M16 22h14M16 28h10M16 34h12" stroke="#2f5e4b" strokeWidth="2" />
        </g>
      )}
      {id === 'lamp' && (
        <g>
          <path d="M14 40h14M21 40l-4-14 12-12" stroke="#3a4a43" strokeWidth="3" fill="none" strokeLinecap="round" />
          <path d="M27 10l12 3-6 8z" fill="#e8bd6a" />
        </g>
      )}
      {id === 'neon' && (
        <g>
          <rect x="7" y="16" width="34" height="16" rx="8" fill="none" stroke="#ff6f86" strokeWidth="2.5" />
          <text x="24" y="28" textAnchor="middle" fontSize="10" fontFamily="Mitr, sans-serif" fill="#ff5f79">
            OPEN
          </text>
        </g>
      )}
      {id === 'cat' && (
        <g>
          <ellipse cx="27" cy="31" rx="13" ry="7" fill="#d99c5f" />
          <circle cx="16" cy="27" r="7" fill="#e2a86b" />
          <path d="M11 22l1-7 5 5zM17 20l5-5 1 7z" fill="#e2a86b" />
          <path d="M13 28q2 1 4 0" stroke="#5a3a2a" fill="none" />
        </g>
      )}
    </svg>
  )
}

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
  const next = JOBS.find(j => isUnlocked(save, j) && jobProgress(save, j.id).completions === 0)
  const doneCount = JOBS.filter(j => jobProgress(save, j.id).completions > 0).length
  const maxRep = JOBS.length * 3

  const greeting =
    doneCount === 0
      ? 'ยินดีต้อนรับช่างฝึกหัด! ลูกค้ารออยู่ที่เคาน์เตอร์แล้ว ลองรับงานแรกดูนะ ค่อย ๆ ตรวจ ค่อย ๆ ตัดสินใจ มีอะไรพี่ช่วยอยู่ข้าง ๆ'
      : next
        ? `เก่งมาก! ร้านเริ่มมีชื่อเสียงแล้ว งานถัดไปคือ "${next.title}" ของ${next.customer.name}`
        : 'ทำครบทุกงานแล้ว! ลองเล่นซ้ำเพื่อเก็บสามดาว หรือเปิดคู่มือช่างทบทวนก่อนสอบ'

  const openBoard = () => onNavigate({ name: 'board' })
  const openDecor = () => onNavigate({ name: 'decor' })
  const backToShop = () => onNavigate({ name: 'shop' })

  const buy = (item: DecorItem) => {
    if (game.buy(item)) game.play('coin')
  }

  return (
    <div className={`shop shop-view-${view}`}>
      {view !== 'shop' && <div className="shop-page-heading"><button type="button" className="btn btn-ghost" onClick={backToShop}><Icon name="arrowLeft" size={20} /> กลับหน้าร้าน</button><h1>{view === 'board' ? 'เลือกงานที่อยากเรียนรู้' : 'แต่งร้านในแบบของเรา'}</h1><p className="muted">{view === 'board' ? 'อ่านโจทย์ เลือกงาน แล้วค่อย ๆ ฝึกทีละขั้น' : 'ใช้เหรียญจากการฝึกซื้อของตกแต่ง ของที่ซื้อจะปรากฏในหน้าร้าน'}</p></div>}
      {view === 'shop' && <section className="shop-top">
        <div className="shop-scene-wrap">
          <ShopScene
            owned={save.owned}
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
              {level.nextAt !== null
                ? `อีก ${level.nextAt - rep} ดาว ได้เลื่อนเป็น "${LEVELS[level.index + 1].title}"`
                : 'ระดับสูงสุดแล้ว เยี่ยมมาก!'}
            </small>
          </div>
        </aside>
      </section>}

      {view === 'shop' && <section className="shop-shortcuts" aria-label="ไปยังพื้นที่อื่น"><button className="card shortcut" onClick={openBoard}><Icon name="arrowRight" size={28}/><span><strong>กระดานงาน</strong><small>เลือกภารกิจและดูความก้าวหน้าทั้ง {JOBS.length} งาน</small></span></button><button className="card shortcut" onClick={openDecor}><Icon name="star" size={28}/><span><strong>ตกแต่งร้าน</strong><small>เลือกของแต่งร้านด้วยเหรียญที่สะสม</small></span></button></section>}
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
        <div className="job-grid">
          {JOBS.map(job => (
            <JobCard key={job.id} job={job} onOpen={onOpenJob} />
          ))}
        </div>
      </section>}

      {view === 'decor' && <section className="decor-shop" aria-labelledby="decor-title">
        <div className="section-head">
          <div>
            <span className="eyebrow">ตกแต่งร้าน</span>
            <h2 id="decor-title">ใช้เหรียญแต่งร้านให้น่านั่ง</h2>
          </div>
          <p className="muted">
            มีอยู่ <CoinAmount value={save.coins} />
          </p>
        </div>
        <div className="decor-grid">
          {DECOR.map(item => {
            const owned = save.owned.includes(item.id)
            return (
              <div key={item.id} className={`decor-item card${owned ? ' is-owned' : ''}`}>
                <DecorThumb id={item.id} />
                <div>
                  <strong>{item.name}</strong>
                  <small className="muted">{item.blurb}</small>
                </div>
                {owned ? (
                  <span className="chip chip-good">
                    <Icon name="check" size={14} /> ติดตั้งแล้ว
                  </span>
                ) : (
                  <button type="button" className="btn btn-gold btn-sm" aria-label={`ซื้อ${item.name} ราคา ${item.price} เหรียญ`} disabled={save.coins < item.price} onClick={() => buy(item)}>
                    <CoinAmount value={item.price} size={14} />
                  </button>
                )}
              </div>
            )
          })}
        </div>
      </section>}
    </div>
  )
}

