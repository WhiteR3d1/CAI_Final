import { useCallback, useEffect, useRef, useState, type FormEvent, type ReactNode } from 'react'
import { ThemeToggle } from '../components/ThemeToggle'
import { defaultSave, normalizeSave } from '../game/progress'
import type { SaveData } from '../game/types'
import { TeacherConsole } from '../teacher/TeacherConsole'
import { api, errorMessage, type Health, type Session, type Snapshot } from './api'
import { SaveQueue, type Draft, type SyncStatus } from './sync'
import './accounts.css'

const SESSION_KEY = 'boot-bloom:session:v1'
const draftKey = (uid: string) => `boot-bloom:draft:${uid}`
interface AccountGame { initialSave: SaveData; saveScope: string; onSave: (save: SaveData) => void }
interface Loaded { session: Session; snapshot: Snapshot; draft?: Draft }
function readSession(): Session | null {
  try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null') } catch { return null }
}
function readDraft(uid: string): Draft | undefined {
  try {
    const d = JSON.parse(localStorage.getItem(draftKey(uid)) || 'null')
    return d && Number.isSafeInteger(d.revision) && d.save?.version === 4 && typeof d.requestId === 'string' ? d : undefined
  } catch { return undefined }
}
export function AccountGate({ children }: { children: (account?: AccountGame) => ReactNode }) {
  const [health, setHealth] = useState<Health>()
  const [loaded, setLoaded] = useState<Loaded>()
  const [preview, setPreview] = useState(false)
  const [busy, setBusy] = useState(true)
  const [message, setMessage] = useState('')
  const [register, setRegister] = useState(false)
  const [generation, setGeneration] = useState(0)
  const [gameKey, setGameKey] = useState(0)
  const [playing, setPlaying] = useState(false)

  async function enter(session: Session) {
    const data = await api<{ snapshot: Snapshot }>('load', { token: session.token })
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session))
    setLoaded({ session, snapshot: data.snapshot, draft: readDraft(session.user.uid) })
    setMessage(''); setGameKey(k => k + 1)
  }
  useEffect(() => {
    let cancelled = false
    async function start() {
      try {
        const h = await api<Health>()
        if (cancelled) return
        setHealth(h)
        const session = readSession()
        if (session && session.expiresAt > Date.now()) {
          const data = await api<{ snapshot: Snapshot }>('load', { token: session.token })
          if (!cancelled) setLoaded({ session, snapshot: data.snapshot, draft: readDraft(session.user.uid) })
        }
      } catch (e) { if (!cancelled) setMessage(errorMessage(e)) }
      finally { if (!cancelled) setBusy(false) }
    }
    void start()
    return () => { cancelled = true }
  }, [generation])


  async function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault(); setBusy(true); setMessage('')
    const form = new FormData(event.currentTarget)
    try {
      const session = await api<Session>(register ? 'register' : 'login', {
        username: form.get('username'), password: form.get('password'), name: form.get('name'),
      })
      await enter(session)
    } catch (e) { setMessage(errorMessage(e)) }
    finally { setBusy(false) }
  }
  function signedOut() {
    sessionStorage.removeItem(SESSION_KEY); setLoaded(undefined); setMessage(''); setPlaying(false)
  }
  // A teacher account opens the class console instead of the game, but may still play to try a job out.
  if (loaded?.session.user.teacher && !playing) return <TeacherShell session={loaded.session} onSignOut={signedOut} onPlay={() => setPlaying(true)} />
  if (loaded) return <OnlineGame key={`${loaded.session.user.uid}:${gameKey}`} loaded={loaded} onSignOut={signedOut} onTeacher={loaded.session.user.teacher ? () => setPlaying(false) : undefined} onReload={async () => {
    const data = await api<{ snapshot: Snapshot }>('load', { token: loaded.session.token })
    localStorage.removeItem(draftKey(loaded.session.user.uid))
    setLoaded({ session: loaded.session, snapshot: data.snapshot }); setGameKey(k => k + 1)
  }}>{children}</OnlineGame>
  if (preview) return <><div className="account-bar"><span>โหมดเล่นในเครื่อง — ไม่บันทึกลงชีต</span><button onClick={() => setPreview(false)}>กลับหน้าเข้าสู่ระบบ</button><ThemeToggle /></div>{children()}</>
  return <main className="account-page"><section className="account-card">
    <ThemeToggle />
    <span className="account-eyebrow">BOOT & BLOOM · ห้องเรียนช่างคอม</span>
    <h1>ร้านของคุณ พร้อมเรียนรู้ต่อ</h1>
    <p>เข้าสู่ระบบเพื่อเก็บงานที่ทำ คะแนน เหรียญ และร้านที่ตกแต่งไว้ใน Google Sheets ของห้องเรียน</p>
    <div className="account-tabs"><button aria-pressed={!register} onClick={() => setRegister(false)}>เข้าสู่ระบบ</button><button aria-pressed={register} onClick={() => setRegister(true)}>สร้างบัญชี</button></div>
    <form onSubmit={submit}>
      {register && <label>ชื่อที่แสดง<input name="name" required maxLength={80} autoComplete="name" /></label>}
      <label>ชื่อผู้ใช้<input name="username" required minLength={3} maxLength={32} pattern="[a-zA-Z0-9][a-zA-Z0-9._\-]{2,31}" autoComplete="username" autoCapitalize="none" spellCheck={false} placeholder="เช่น student01" /></label>
      <small>ใช้ a–z, ตัวเลข, จุด, ขีดกลาง หรือขีดล่าง 3–32 ตัว</small>
      <label>รหัสผ่าน<input type="password" name="password" required minLength={register ? 10 : undefined} maxLength={72} autoComplete={register ? 'new-password' : 'current-password'} /></label>
      {register && <small>อย่างน้อย 10 ตัว ไม่เกิน 72 ไบต์</small>}
      <button className="account-primary" disabled={busy || !health || (register && !health.registration)}>{busy ? 'กำลังเชื่อมต่อ…' : register ? 'สร้างบัญชีและเปิดร้าน' : 'เข้าสู่ร้าน'}</button>
    </form>
    {register && health && !health.registration && <p>ครูยังไม่เปิดรับสมัครบัญชีใหม่</p>}
    {message && <p role="alert" className="account-error">{message}</p>}
    {!health && <button disabled={busy} onClick={() => { setBusy(true); setGeneration(g => g + 1) }}>ตรวจการเชื่อมต่ออีกครั้ง</button>}
    <button className="account-preview" onClick={() => setPreview(true)}>ทดลองเล่นในเครื่องก่อน</button>
    <small>ข้อมูลบัญชีและผลการเรียนเก็บในชีตของครู รหัสผ่านเก็บเป็นค่าแฮช กรุณาออกจากระบบเมื่อใช้เครื่องส่วนรวม</small>
  </section></main>
}

function OnlineGame({ loaded, onSignOut, onReload, onTeacher, children }: {
  loaded: Loaded; onSignOut: () => void; onReload: () => Promise<void>; onTeacher?: () => void; children: (account?: AccountGame) => ReactNode
}) {
  const { session, snapshot, draft } = loaded
  const [syncState, setSyncState] = useState<{ status: SyncStatus; error?: unknown }>({ status: draft ? 'pending' : 'saved' })
  const [cacheError, setCacheError] = useState(false)
  const [message, setMessage] = useState('')
  const [working, setWorking] = useState(false)
  const queueRef = useRef<SaveQueue | null>(null)
  // Created in effect to survive StrictMode's setup/cleanup cycle.
  useEffect(() => {
    const queue = new SaveQueue(snapshot.revision,
      d => api('save', { token: session.token, ...d }),
      d => { try { if (d) localStorage.setItem(draftKey(session.user.uid), JSON.stringify(d)); else localStorage.removeItem(draftKey(session.user.uid)); setCacheError(false) } catch { setCacheError(true) } },
      () => setSyncState({ status: queue.status, error: queue.error }), draft)
    queueRef.current = queue
    if (draft) void queue.flush()
    const beforeUnload = (e: BeforeUnloadEvent) => { if (queue.status !== 'saved') { e.preventDefault(); e.returnValue = '' } }
    window.addEventListener('beforeunload', beforeUnload)
    return () => { queue.dispose(); window.removeEventListener('beforeunload', beforeUnload) }
  }, [session, snapshot, draft])
  const status = syncState.status
  const onSave = useCallback((next: SaveData) => { queueRef.current?.enqueue(next) }, [])
  const labels = { saved: 'บันทึกลงชีตแล้ว', saving: 'กำลังบันทึก…', pending: 'รอบันทึก…', error: 'ยังบันทึกลงชีตไม่ได้', conflict: 'พบข้อมูลจากอีกเครื่อง' }
  async function logout() {
    setWorking(true); setMessage('')
    try {
      await queueRef.current?.flush()
      if (queueRef.current?.status !== 'saved') { setMessage('ยังมีข้อมูลที่บันทึกไม่สำเร็จ กรุณาลองบันทึกอีกครั้งก่อนออก'); return }
      await api('logout', { token: session.token }); onSignOut()
    } catch (e) { setMessage(errorMessage(e)) } finally { setWorking(false) }
  }
  const save = normalizeSave(draft?.save ?? snapshot.save ?? { ...defaultSave(), settings: { ...defaultSave().settings, playerName: session.user.name } })
  return <>
    <div className="account-bar"><strong>{session.user.name}</strong><span role="status">{labels[status]}</span>
      {onTeacher && <button disabled={working || status === 'saving'} onClick={onTeacher}>กลับหน้าอาจารย์</button>}
      {(status === 'error' || status === 'pending') && <button disabled={working} onClick={() => { void queueRef.current?.flush() }}>ลองบันทึกอีกครั้ง</button>}
      <button disabled={working || status === 'saving'} onClick={() => { void logout() }}>บันทึกและออกจากระบบ</button>
    </div>
    {(status === 'error' || status === 'conflict' || message || cacheError) && <div className="account-notice" role="alert">
      <p>{message || (syncState.error ? errorMessage(syncState.error) : '')}</p>
      {cacheError && <p>เก็บร่างในเครื่องไม่ได้ อย่าปิดหน้านี้จนกว่าบันทึกลงชีตสำเร็จ</p>}
      {status === 'conflict' && <button disabled={working} onClick={async () => {
        if (!confirm('โหลดข้อมูลล่าสุดจากชีตและทิ้งการเปลี่ยนแปลงที่ยังไม่บันทึกในเครื่องนี้?')) return
        setWorking(true)
        try { await onReload() } catch (e) { setMessage(errorMessage(e)); setWorking(false) }
      }}>ใช้ข้อมูลล่าสุดจากชีต</button>}
      {status === 'error' && <button disabled={working || cacheError} onClick={() => {
        if (confirm('เก็บร่างไว้ในเครื่องแล้วกลับไปเข้าสู่ระบบใหม่? เข้าใช้บัญชีเดิมเพื่อส่งร่างต่อ')) onSignOut()
      }}>เก็บร่างแล้วเข้าสู่ระบบใหม่</button>}
    </div>}
    <div inert={working}><RenderGame render={children} account={{ initialSave: save, saveScope: session.user.uid, onSave }} /></div>
  </>
}

function RenderGame({ render, account }: { render: (account?: AccountGame) => ReactNode; account: AccountGame }) {
  return render(account)
}

/** Shell around the teacher console: the account bar, sign-out and the way into the game itself. */
function TeacherShell({ session, onSignOut, onPlay }: { session: Session; onSignOut: () => void; onPlay: () => void }) {
  const [working, setWorking] = useState(false)
  const [message, setMessage] = useState('')
  async function logout() {
    setWorking(true); setMessage('')
    try { await api('logout', { token: session.token }); onSignOut() }
    catch (e) { setMessage(errorMessage(e)) } finally { setWorking(false) }
  }
  return <>
    <div className="account-bar"><strong>{session.user.name} · อาจารย์</strong><span role="status">โหมดอาจารย์ — อ่านข้อมูลนักเรียนอย่างเดียว</span>
      <button disabled={working} onClick={onPlay}>เปิดเกมของฉัน</button>
      <button disabled={working} onClick={() => { void logout() }}>ออกจากระบบ</button>
      <ThemeToggle />
    </div>
    {message && <div className="account-notice" role="alert"><p>{message}</p></div>}
    <TeacherConsole session={session} />
  </>
}
