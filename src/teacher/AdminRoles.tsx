import { useEffect, useMemo, useState } from 'react'
import { Icon } from '../components/Icon'
import { Modal } from '../components/Modal'
import { api, errorMessage, ROLE_LABEL, type AccountRow, type Role, type Session } from '../auth/api'

const ROLE_NOTE: Record<Role, string> = {
  student: 'เล่นเกมและเห็นเฉพาะร้านของตัวเอง',
  teacher: 'เห็นกระดานร้านและคะแนนของนักเรียนทุกคน',
  admin: 'เห็นทุกอย่างของอาจารย์ และปรับบทบาท/ปิดบัญชีคนอื่นได้',
}

function when(iso: string) {
  if (!iso) return '—'
  const d = new Date(iso)
  return Number.isNaN(d.getTime()) ? iso : d.toLocaleDateString('th-TH', { dateStyle: 'medium' })
}

/** Admin-only: give an account the student, teacher or admin role, and switch accounts off. */
export function AdminRoles({ session, onChanged }: { session: Session; onChanged: () => void }) {
  const token = session.token
  const [accounts, setAccounts] = useState<AccountRow[]>()
  const [roles, setRoles] = useState<Role[]>(['student', 'teacher', 'admin'])
  const [editable, setEditable] = useState(true)
  const [message, setMessage] = useState('')
  const [notice, setNotice] = useState('')
  const [busy, setBusy] = useState<string | null>(null)
  const [generation, setGeneration] = useState(0)
  const [query, setQuery] = useState('')
  const [confirm, setConfirm] = useState<{ row: AccountRow; role?: Role; disabled?: boolean } | null>(null)

  useEffect(() => {
    let cancelled = false
    async function load() {
      setMessage('')
      try {
        const data = await api<{ accounts: AccountRow[]; roles: Role[]; editable: boolean }>('accounts', { token })
        if (cancelled) return
        setAccounts(data.accounts)
        setRoles(data.roles)
        setEditable(data.editable)
      } catch (e) {
        if (!cancelled) setMessage(errorMessage(e))
      }
    }
    void load()
    return () => {
      cancelled = true
    }
  }, [token, generation])

  const list = useMemo(() => {
    const q = query.trim().toLowerCase()
    return (accounts ?? []).filter(a => !q || a.name.toLowerCase().includes(q) || a.username.toLowerCase().includes(q))
  }, [accounts, query])

  async function apply(row: AccountRow, change: { role?: Role; disabled?: boolean }) {
    setBusy(row.uid)
    setMessage('')
    setNotice('')
    try {
      const body = change.role !== undefined ? { uid: row.uid, role: change.role } : { uid: row.uid, disabled: change.disabled }
      const next = await api<{ uid: string; role: Role; disabled: boolean }>(change.role !== undefined ? 'setRole' : 'setDisabled', {
        token,
        ...body,
      })
      setAccounts(prev => prev?.map(a => (a.uid === next.uid ? { ...a, role: next.role, disabled: next.disabled } : a)))
      setNotice(
        change.role !== undefined
          ? `ตั้ง ${row.name} เป็น "${ROLE_LABEL[next.role]}" แล้ว`
          : `${next.disabled ? 'ปิด' : 'เปิด'}บัญชีของ ${row.name} แล้ว`,
      )
      // the class list changes when somebody stops or starts being a student
      onChanged()
    } catch (e) {
      setMessage(errorMessage(e))
    } finally {
      setBusy(null)
    }
  }

  const admins = (accounts ?? []).filter(a => a.role === 'admin').length

  return (
    <section className="admin" aria-label="จัดการบัญชีและบทบาท">
      <div className="admin-intro card">
        <h2>บทบาทของบัญชี</h2>
        <ul>
          {roles.map(r => (
            <li key={r}>
              <strong>{ROLE_LABEL[r]}</strong> — {ROLE_NOTE[r]}
            </li>
          ))}
        </ul>
        <p className="muted">
          บัญชีใหม่ทุกบัญชีเป็นนักเรียนก่อนเสมอ · เปลี่ยนบทบาทของตัวเองไม่ได้ และบัญชีที่ตั้งไว้ใน <code>ADMINS</code> ของ Code.gs จะแก้จากหน้านี้ไม่ได้
          เพื่อไม่ให้ไม่เหลือผู้ดูแลเลย (ตอนนี้มีผู้ดูแล {admins} บัญชี)
        </p>
      </div>

      {!editable && (
        <p role="alert" className="account-error">
          ชีตยังไม่มีคอลัมน์ <code>role</code> จึงยังบันทึกบทบาทไม่ได้ ให้เปิด Apps Script แล้ว Run <code>setupBootBloom</code> หนึ่งครั้ง
          (ตอนนี้บทบาทมาจากรายชื่อใน Code.gs ระบบส่วนอื่นยังใช้ได้ตามปกติ)
        </p>
      )}
      {message && (
        <p role="alert" className="account-error">
          {message}
        </p>
      )}

      <div className="admin-controls">
        <label className="teacher-search">
          <span>ค้นหาชื่อหรือชื่อผู้ใช้</span>
          <input value={query} maxLength={40} onChange={e => setQuery(e.target.value)} placeholder="เช่น student01" />
        </label>
        <button type="button" className="btn btn-ghost btn-sm" onClick={() => setGeneration(g => g + 1)}>
          <Icon name="refresh" size={18} /> โหลดรายชื่อใหม่
        </button>
        <span role="status" className="muted">
          {notice}
        </span>
      </div>

      {!accounts && !message && <p className="muted">กำลังโหลดรายชื่อบัญชี…</p>}

      {accounts && (
        <div className="teacher-table-wrap">
          <table className="teacher-table">
            <thead>
              <tr>
                <th scope="col">บัญชี</th>
                <th scope="col">สมัครเมื่อ</th>
                <th scope="col">บทบาท</th>
                <th scope="col">สถานะ</th>
                <th scope="col">
                  <span className="visually-hidden">ปิดหรือเปิดบัญชี</span>
                </th>
              </tr>
            </thead>
            <tbody>
              {list.map(a => (
                <tr key={a.uid} className={a.disabled ? 'is-empty' : undefined}>
                  <th scope="row">
                    {a.name}
                    <small className="muted"> {a.username}</small>
                  </th>
                  <td>{when(a.createdAt)}</td>
                  <td>
                    {a.fixed || a.self ? (
                      <span className={`chip${a.role === 'admin' ? ' chip-extra' : ''}`}>{ROLE_LABEL[a.role]}</span>
                    ) : (
                      <select
                        aria-label={`บทบาทของ ${a.name}`}
                        value={a.role}
                        disabled={!editable || busy === a.uid}
                        onChange={e => setConfirm({ row: a, role: e.target.value as Role })}
                      >
                        {roles.map(r => (
                          <option key={r} value={r}>
                            {ROLE_LABEL[r]}
                          </option>
                        ))}
                      </select>
                    )}
                  </td>
                  <td>
                    {a.disabled ? <span className="chip chip-bad">ปิดอยู่</span> : <span className="chip chip-good">ใช้งานได้</span>}
                    {a.locked && <span className="chip chip-warn">ล็อกชั่วคราว</span>}
                    {a.self && <span className="chip">บัญชีของคุณ</span>}
                    {a.fixed && !a.self && <span className="chip">ตั้งไว้ใน Code.gs</span>}
                  </td>
                  <td>
                    {!a.fixed && !a.self && (
                      <button
                        type="button"
                        className="btn btn-ghost btn-sm"
                        disabled={busy === a.uid}
                        onClick={() => setConfirm({ row: a, disabled: !a.disabled })}
                      >
                        {a.disabled ? 'เปิดบัญชี' : 'ปิดบัญชี'}
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {confirm && (
        <Modal
          title={confirm.role !== undefined ? `เปลี่ยนบทบาทของ ${confirm.row.name}?` : confirm.disabled ? `ปิดบัญชีของ ${confirm.row.name}?` : `เปิดบัญชีของ ${confirm.row.name}?`}
          tone={confirm.disabled ? 'bad' : 'warn'}
          onClose={() => setConfirm(null)}
          actions={[
            { label: 'ยกเลิก', onClick: () => setConfirm(null) },
            {
              label: confirm.role !== undefined ? 'เปลี่ยนบทบาท' : confirm.disabled ? 'ปิดบัญชี' : 'เปิดบัญชี',
              variant: confirm.disabled ? 'danger' : 'primary',
              onClick: () => {
                const change = confirm
                setConfirm(null)
                void apply(change.row, change)
              },
            },
          ]}
        >
          {confirm.role !== undefined ? (
            <p>
              {confirm.row.username} จะเป็น <strong>{ROLE_LABEL[confirm.role]}</strong> — {ROLE_NOTE[confirm.role]}
            </p>
          ) : confirm.disabled ? (
            <p>{confirm.row.username} จะเข้าสู่ระบบไม่ได้ทันที และหน้าที่เปิดค้างอยู่จะถูกตัดออก เซฟและคะแนนยังอยู่ครบ เปิดบัญชีคืนได้ภายหลัง</p>
          ) : (
            <p>{confirm.row.username} จะกลับมาเข้าสู่ระบบได้ตามปกติ</p>
          )}
        </Modal>
      )}
    </section>
  )
}
