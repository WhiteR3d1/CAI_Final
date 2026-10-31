import { useEffect, useMemo, useState } from 'react'
import { CoinAmount } from '../components/Bits'
import { Icon } from '../components/Icon'
import { JOBS } from '../data/jobs'
import { api, errorMessage, TEACHER_BATCH, type Session, type StudentShop, type StudentSummary } from '../auth/api'
import { normalizeShop } from '../game/decor'
import { shopLevel } from '../game/progress'
import type { DecorState } from '../game/types'
import { ShopScene } from '../screens/ShopScene'
import { AdminRoles } from './AdminRoles'
import { StudentDetail } from './StudentDetail'
import '../screens/shop.css'
import './teacher.css'

interface Shop {
  decor: DecorState
  playerName: string
}

type SortId = 'name' | 'stars' | 'jobs' | 'coins' | 'items' | 'updated'

const SORTS: { id: SortId; label: string }[] = [
  { id: 'name', label: 'ชื่อ ก–ฮ' },
  { id: 'stars', label: 'ดาวมากไปน้อย' },
  { id: 'jobs', label: 'งานที่ทำมากไปน้อย' },
  { id: 'coins', label: 'เหรียญมากไปน้อย' },
  { id: 'items', label: 'ของตกแต่งมากไปน้อย' },
  { id: 'updated', label: 'อัปเดตล่าสุด' },
]

const MAX_STARS = JOBS.length * 3

function when(iso: string) {
  if (!iso) return 'ยังไม่เริ่มเล่น'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleString('th-TH', { dateStyle: 'medium', timeStyle: 'short' })
}

const itemCount = (shops: Record<string, Shop>, uid: string) => shops[uid]?.decor.placed.length ?? 0

/** the shop level a student has reached; the sheet's stars column is the same sum as reputation() */
const levelTitle = (stars: number) => shopLevel(stars).title

function csv(rows: (string | number)[][]) {
  return rows.map(r => r.map(v => `"${String(v).replace(/"/g, '""')}"`).join(',')).join('\r\n')
}

/** Teacher-only console: the class shop gallery plus each student's score report. Reads the sheet, never writes it. */
export function TeacherConsole({ session }: { session: Session }) {
  const token = session.token
  const [students, setStudents] = useState<StudentSummary[]>()
  const [shops, setShops] = useState<Record<string, Shop>>({})
  const [pending, setPending] = useState(0)
  const [message, setMessage] = useState('')
  const [shopMessage, setShopMessage] = useState('')
  const [busy, setBusy] = useState(true)
  const [generation, setGeneration] = useState(0)
  const [view, setView] = useState<'board' | 'table' | 'admin'>('board')
  const [sort, setSort] = useState<SortId>('name')
  const [query, setQuery] = useState('')
  const [open, setOpen] = useState<StudentSummary | null>(null)

  useEffect(() => {
    let cancelled = false
    async function start() {
      setBusy(true)
      setMessage('')
      setShopMessage('')
      setShops({})
      try {
        const data = await api<{ students: StudentSummary[] }>('roster', { token })
        if (cancelled) return
        setStudents(data.students)
        setBusy(false)
        // Shops are read in small batches: one request per class list would risk an Apps Script timeout.
        const uids = data.students.filter(s => s.revision > 0).map(s => s.uid)
        setPending(uids.length)
        for (let i = 0; i < uids.length; i += TEACHER_BATCH) {
          if (cancelled) return
          const batch = uids.slice(i, i + TEACHER_BATCH)
          try {
            const page = await api<{ shops: StudentShop[] }>('shops', { token, uids: batch })
            if (cancelled) return
            setShops(prev => {
              const next = { ...prev }
              for (const s of page.shops) next[s.uid] = { decor: normalizeShop(s.inventory, s.decor).decor, playerName: s.playerName }
              return next
            })
          } catch (e) {
            if (cancelled) return
            setShopMessage(errorMessage(e))
          }
          setPending(p => Math.max(0, p - batch.length))
        }
      } catch (e) {
        if (!cancelled) {
          setMessage(errorMessage(e))
          setBusy(false)
        }
      }
    }
    void start()
    return () => {
      cancelled = true
    }
  }, [token, generation])

  const items = (uid: string) => itemCount(shops, uid)

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    const rows = (students ?? []).filter(
      s => !q || s.name.toLowerCase().includes(q) || s.username.toLowerCase().includes(q) || (shops[s.uid]?.decor.signText ?? '').toLowerCase().includes(q),
    )
    const by: Record<SortId, (a: StudentSummary, b: StudentSummary) => number> = {
      name: (a, b) => a.name.localeCompare(b.name, 'th'),
      stars: (a, b) => b.stars - a.stars,
      jobs: (a, b) => b.completedJobs - a.completedJobs,
      coins: (a, b) => b.coins - a.coins,
      items: (a, b) => itemCount(shops, b.uid) - itemCount(shops, a.uid),
      updated: (a, b) => b.updatedAt.localeCompare(a.updatedAt),
    }
    return [...rows].sort((a, b) => by[sort](a, b) || a.name.localeCompare(b.name, 'th'))
  }, [students, shops, sort, query])

  const started = (students ?? []).filter(s => s.revision > 0)
  const avgStars = started.length ? Math.round((started.reduce((n, s) => n + s.stars, 0) / started.length) * 10) / 10 : 0
  const avgJobs = started.length ? Math.round((started.reduce((n, s) => n + s.completedJobs, 0) / started.length) * 10) / 10 : 0

  const downloadCsv = () => {
    const head = ['ชื่อที่แสดง', 'ชื่อผู้ใช้', 'ชื่อร้าน', 'ระดับร้าน', 'ดาว', `จาก ${MAX_STARS}`, 'งานที่ส่ง', `จาก ${JOBS.length}`, 'เหรียญ', 'ของตกแต่ง', 'อัปเดตล่าสุด']
    const rows = list.map(s => [
      s.name,
      s.username,
      shops[s.uid]?.decor.signText ?? '',
      levelTitle(s.stars),
      s.stars,
      MAX_STARS,
      s.completedJobs,
      JOBS.length,
      s.coins,
      items(s.uid),
      when(s.updatedAt),
    ])
    const url = URL.createObjectURL(new Blob(['﻿' + csv([head, ...rows])], { type: 'text/csv;charset=utf-8' }))
    const a = document.createElement('a')
    a.href = url
    a.download = 'boot-bloom-ห้องเรียน.csv'
    a.click()
    window.setTimeout(() => URL.revokeObjectURL(url), 1000)
  }

  return (
    <div className="teacher">
      <header className="teacher-head">
        <div>
          <span className="eyebrow">สำหรับอาจารย์</span>
          <h1>ห้องเรียน Boot &amp; Bloom</h1>
          <p className="muted">ดูร้านที่นักเรียนตกแต่ง และคะแนนรายงานของแต่ละคน หน้านี้อ่านข้อมูลจากชีตเท่านั้น ไม่แก้ไขเซฟของนักเรียน</p>
        </div>
        <button type="button" className="btn btn-ghost btn-sm" disabled={busy} onClick={() => setGeneration(g => g + 1)}>
          <Icon name="refresh" size={18} /> โหลดข้อมูลใหม่
        </button>
      </header>

      {message && (
        <p role="alert" className="account-error">
          {message}
        </p>
      )}
      {busy && !students && <p className="muted">กำลังโหลดรายชื่อนักเรียน…</p>}

      {students && (
        <>
          <section className="teacher-stats" aria-label="ภาพรวมของห้อง">
            <div className="card teacher-stat">
              <span className="muted">บัญชีนักเรียน</span>
              <strong>{students.length}</strong>
            </div>
            <div className="card teacher-stat">
              <span className="muted">เริ่มเล่นแล้ว</span>
              <strong>{started.length}</strong>
            </div>
            <div className="card teacher-stat">
              <span className="muted">ดาวเฉลี่ย (ผู้ที่เริ่มเล่น)</span>
              <strong>
                <Icon name="star" size={20} filled className="star-on" /> {avgStars}
              </strong>
            </div>
            <div className="card teacher-stat">
              <span className="muted">งานที่ส่งเฉลี่ย</span>
              <strong>
                {avgJobs}/{JOBS.length}
              </strong>
            </div>
          </section>

          <section className="teacher-controls" aria-label="ตัวกรองและการเรียงลำดับ">
            <div className="teacher-tabs" role="group" aria-label="รูปแบบการแสดง">
              <button type="button" aria-pressed={view === 'board'} onClick={() => setView('board')}>
                <Icon name="image" size={18} /> กระดานร้าน
              </button>
              <button type="button" aria-pressed={view === 'table'} onClick={() => setView('table')}>
                <Icon name="chart" size={18} /> ตารางรายชื่อ
              </button>
              {session.user.admin && (
                <button type="button" aria-pressed={view === 'admin'} onClick={() => setView('admin')}>
                  <Icon name="users" size={18} /> จัดการบัญชี
                </button>
              )}
            </div>
            {view !== 'admin' && (
              <>
                <label className="teacher-search">
                  <span>ค้นหาชื่อ ชื่อผู้ใช้ หรือชื่อร้าน</span>
                  <input value={query} maxLength={40} onChange={e => setQuery(e.target.value)} placeholder="เช่น student01" />
                </label>
                <label className="teacher-sort">
                  <span>เรียงตาม</span>
                  <select value={sort} onChange={e => setSort(e.target.value as SortId)}>
                    {SORTS.map(s => (
                      <option key={s.id} value={s.id}>
                        {s.label}
                      </option>
                    ))}
                  </select>
                </label>
                <button type="button" className="btn btn-ghost btn-sm" onClick={downloadCsv}>
                  <Icon name="download" size={18} /> ดาวน์โหลดรายชื่อ .csv
                </button>
              </>
            )}
          </section>

          {view !== 'admin' && (
            <p className="muted teacher-progress" aria-live="polite">
              {pending > 0 ? `กำลังโหลดภาพร้าน… เหลืออีก ${pending} คน` : `แสดง ${list.length} จาก ${students.length} คน`}
              {shopMessage ? ` · โหลดภาพร้านบางส่วนไม่สำเร็จ: ${shopMessage}` : ''}
            </p>
          )}

          {view !== 'admin' && students.length === 0 && (
            <p className="muted">ยังไม่มีบัญชีนักเรียนในชีต ให้นักเรียนสมัครจากหน้าเข้าสู่ระบบก่อน</p>
          )}

          {view === 'admin' ? (
            <AdminRoles session={session} onChanged={() => setGeneration(g => g + 1)} />
          ) : view === 'board' ? (
            <section className="teacher-gallery" aria-label="กระดานร้านของนักเรียน">
              {list.map(s => {
                const shop = shops[s.uid]
                return (
                  <article key={s.uid} className="card teacher-card">
                    <div className="teacher-card-scene">
                      {shop ? (
                        <ShopScene decor={shop.decor} people={false} label={`ร้าน ${shop.decor.signText} ของ ${s.name}`} />
                      ) : (
                        <div className="teacher-card-empty">{s.revision > 0 ? 'กำลังโหลดร้าน…' : 'ยังไม่เริ่มเล่น'}</div>
                      )}
                    </div>
                    <div className="teacher-card-body">
                      <h3>{shop?.decor.signText ?? '—'}</h3>
                      <p className="muted">
                        {s.name} · {s.username}
                        {shop?.playerName.trim() ? ` · ${shop.playerName.trim()}` : ''}
                      </p>
                      <div className="teacher-card-meta">
                        <span className="chip">{levelTitle(s.stars)}</span>
                        <span className="chip chip-good">
                          <Icon name="star" size={14} filled className="star-on" /> {s.stars}/{MAX_STARS}
                        </span>
                        <span className="chip">
                          งาน {s.completedJobs}/{JOBS.length}
                        </span>
                        <span className="chip chip-warn">
                          <CoinAmount value={s.coins} size={14} />
                        </span>
                        <span className="chip">ของตกแต่ง {items(s.uid)} ชิ้น</span>
                        {s.disabled && <span className="chip chip-extra">บัญชีถูกปิด</span>}
                      </div>
                      <small className="muted">อัปเดต {when(s.updatedAt)}</small>
                    </div>
                    <div className="teacher-card-foot">
                      <button type="button" className="btn btn-primary btn-sm" onClick={() => setOpen(s)}>
                        ดูร้านและคะแนน
                        <Icon name="arrowRight" size={16} />
                      </button>
                    </div>
                  </article>
                )
              })}
            </section>
          ) : (
            <div className="teacher-table-wrap">
              <table className="teacher-table">
                <thead>
                  <tr>
                    <th scope="col">นักเรียน</th>
                    <th scope="col">ชื่อร้าน</th>
                    <th scope="col">ระดับร้าน</th>
                    <th scope="col">ดาว</th>
                    <th scope="col">งานที่ส่ง</th>
                    <th scope="col">เหรียญ</th>
                    <th scope="col">ของตกแต่ง</th>
                    <th scope="col">อัปเดตล่าสุด</th>
                    <th scope="col">
                      <span className="visually-hidden">เปิดดู</span>
                    </th>
                  </tr>
                </thead>
                <tbody>
                  {list.map(s => (
                    <tr key={s.uid}>
                      <th scope="row">
                        {s.name}
                        <small className="muted"> {s.username}</small>
                      </th>
                      <td>{shops[s.uid]?.decor.signText ?? '—'}</td>
                      <td>{levelTitle(s.stars)}</td>
                      <td>
                        {s.stars}/{MAX_STARS}
                      </td>
                      <td>
                        {s.completedJobs}/{JOBS.length}
                      </td>
                      <td>{s.coins.toLocaleString('th-TH')}</td>
                      <td>{items(s.uid)}</td>
                      <td>{when(s.updatedAt)}</td>
                      <td>
                        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setOpen(s)}>
                          ดูร้าน
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </>
      )}

      {open && <StudentDetail token={token} student={open} onClose={() => setOpen(null)} />}
    </div>
  )
}
