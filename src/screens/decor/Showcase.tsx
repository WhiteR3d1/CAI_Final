import { useEffect, useEffectEvent, useRef, useState } from 'react'
import { Icon } from '../../components/Icon'
import { useGame } from '../../game/gameContext'
import { reputation, shopLevel } from '../../game/progress'
import { ShopScene } from '../ShopScene'
import { exportShopPng } from './exportPng'
import './decor.css'

const fileSafe = (s: string) => s.replace(/[\\/:*?"<>|]+/g, '').replace(/\s+/g, '-').slice(0, 40)

/** full-screen presentation of the shop for class competitions, with a PNG to send to the teacher */
export function Showcase({ onClose }: { onClose: () => void }) {
  const game = useGame()
  const { save } = game
  const level = shopLevel(reputation(save))
  const rootRef = useRef<HTMLDivElement>(null)
  const sceneRef = useRef<HTMLDivElement>(null)
  const closeRef = useRef<HTMLButtonElement>(null)
  const [owner, setOwner] = useState(save.settings.playerName)
  const [png, setPng] = useState<string | null>(null)
  const [status, setStatus] = useState<'idle' | 'busy' | 'error'>('idle')
  const items = save.decor.placed.length

  useEffect(() => {
    closeRef.current?.focus()
  }, [])
  useEffect(() => () => {
    if (png) URL.revokeObjectURL(png)
  }, [png])

  const commitOwner = () => {
    const name = owner.trim().slice(0, 60)
    if (name !== save.settings.playerName) game.updateSettings({ playerName: name })
    return name
  }

  const close = () => {
    commitOwner()
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
    onClose()
  }

  // listen on the document: focus can fall back to <body> (e.g. while the PNG button is disabled)
  const onEscape = useEffectEvent((e: globalThis.KeyboardEvent) => {
    if (e.key === 'Escape' && !document.fullscreenElement) close()
  })
  useEffect(() => {
    const handler = (e: globalThis.KeyboardEvent) => onEscape(e)
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [])

  const toggleFullscreen = () => {
    if (document.fullscreenElement) void document.exitFullscreen().catch(() => undefined)
    else void rootRef.current?.requestFullscreen?.().catch(() => undefined)
  }

  const makePng = async () => {
    if (!sceneRef.current) return
    const name = commitOwner()
    setStatus('busy')
    try {
      const blob = await exportShopPng(sceneRef.current, { title: save.decor.signText, owner: name, level: level.title, items })
      setPng(URL.createObjectURL(blob))
      setStatus('idle')
    } catch {
      setStatus('error')
    }
  }

  const fileName = `ร้าน-${fileSafe(save.decor.signText)}${owner.trim() ? `-${fileSafe(owner.trim())}` : ''}.png`

  return (
    <div ref={rootRef} className="showcase" role="dialog" aria-modal="true" aria-labelledby="showcase-title">
      <div className="showcase-frame">
        <header className="showcase-head">
          <div>
            <span className="eyebrow">โหมดโชว์ร้าน</span>
            <h2 id="showcase-title">{save.decor.signText}</h2>
            <p>
              เจ้าของร้าน <strong>{owner.trim() || '—'}</strong> · {level.title} · ของตกแต่ง {items} ชิ้น
            </p>
          </div>
          <div className="showcase-btns">
            <button type="button" className="btn btn-ghost btn-sm" onClick={toggleFullscreen}>
              <Icon name="monitor" size={18} /> เต็มจอ
            </button>
            <button type="button" className="btn btn-gold btn-sm" onClick={makePng} disabled={status === 'busy'}>
              <Icon name="image" size={18} /> บันทึกรูป PNG
            </button>
            <button ref={closeRef} type="button" className="btn btn-primary btn-sm" onClick={close}>
              <Icon name="x" size={18} /> ปิด
            </button>
          </div>
        </header>

        <div className="showcase-scene">
          <ShopScene decor={save.decor} people={false} sceneRef={sceneRef} label={`ร้าน ${save.decor.signText}`} />
        </div>

        <footer className="showcase-foot">
          <label className="showcase-owner">
            <span>ชื่อเจ้าของร้าน (ชื่อ ชั้น เลขที่)</span>
            <input value={owner} maxLength={60} onChange={e => setOwner(e.target.value)} onBlur={commitOwner} placeholder="เช่น สมชาย ปวช.1/2 เลขที่ 5" />
          </label>
          <div className="showcase-png" aria-live="polite">
            {status === 'busy' && <span className="muted">กำลังสร้างรูป…</span>}
            {status === 'error' && <span className="showcase-error">สร้างรูปไม่สำเร็จ ลองกดอีกครั้ง</span>}
            {png && status !== 'busy' && (
              <>
                <img src={png} alt={`รูปร้าน ${save.decor.signText}`} />
                <a className="btn btn-gold btn-sm" href={png} download={fileName}>
                  <Icon name="download" size={18} /> ดาวน์โหลดรูป
                </a>
              </>
            )}
          </div>
        </footer>
      </div>
    </div>
  )
}
