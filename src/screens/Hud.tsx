import { useState } from 'react'
import { CoinAmount } from '../components/Bits'
import { Icon, type IconName } from '../components/Icon'
import { useGame } from '../game/gameContext'
import { reputation, shopLevel } from '../game/progress'
import type { JobId } from '../game/types'

export type Screen = { name: 'shop' } | { name: 'board' } | { name: 'decor' } | { name: 'job'; id: JobId } | { name: 'manual'; unit?: number } | { name: 'results' }

const NAV: { name: 'shop' | 'board' | 'decor' | 'manual' | 'results'; label: string; icon: IconName }[] = [
  { name: 'shop', label: 'หน้าร้าน', icon: 'home' },
  { name: 'board', label: 'กระดานงาน', icon: 'book' },
  { name: 'decor', label: 'ตกแต่งร้าน', icon: 'star' },
  { name: 'manual', label: 'คู่มือช่าง', icon: 'book' },
  { name: 'results', label: 'ผลการฝึก', icon: 'chart' },
]

export function Logo() {
  return (
    <svg viewBox="0 0 40 40" width="38" height="38" aria-hidden className="logo-mark">
      <rect x="1" y="1" width="38" height="38" rx="11" fill="#e8bd6a" />
      <path d="M13.5 14.5a9 9 0 1 0 13 0" fill="none" stroke="#193d35" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 9v12" stroke="#193d35" strokeWidth="3" strokeLinecap="round" />
      <path d="M20 12c3.5-4 8-4 9.5-3.2-.2 3.5-4 6.2-9.5 5.2" fill="#2f5e4b" />
    </svg>
  )
}

export function Hud({ screen, onNavigate }: { screen: Screen; onNavigate: (s: Screen) => void }) {
  const { save, updateSettings, storageOk } = useGame()
  const [menuOpen, setMenuOpen] = useState(false)
  const rep = reputation(save)
  const level = shopLevel(rep)
  const inJob = screen.name === 'job'

  return (
    <header className={`hud${inJob ? ' hud-compact' : ''}`}>
      <a className="hud-skip" href="#main">
        ข้ามไปเนื้อหาหลัก
      </a>
      {inJob ? (
        // During a job the logo is not a shortcut home: leaving must go through the workbench's exit confirmation.
        <div className="hud-brand">
          <Logo />
          <span>
            <strong>Boot &amp; Bloom</strong>
            <small>ร้านซ่อมคอมจำลอง · ติดตั้ง Windows 10</small>
          </span>
        </div>
      ) : (
        <button type="button" className="hud-brand" onClick={() => onNavigate({ name: 'shop' })} aria-label="กลับหน้าร้าน Boot & Bloom">
          <Logo />
          <span>
            <strong>Boot &amp; Bloom</strong>
            <small>ร้านซ่อมคอมจำลอง · ติดตั้ง Windows 10</small>
          </span>
        </button>
      )}

      {!inJob && (
        <nav className="hud-nav" aria-label="เมนูหลัก">
          {NAV.map(item => (
            <button
              key={item.name}
              type="button"
              aria-current={screen.name === item.name ? 'page' : undefined}
              onClick={() => onNavigate({ name: item.name })}
            >
              <Icon name={item.icon} size={18} />
              <span>{item.label}</span>
            </button>
          ))}
        </nav>
      )}

      <div className="hud-stats">
        <span className="hud-pill" title="เหรียญในเกม ใช้ซื้อของตกแต่งร้าน (ไม่ใช่คะแนนวิชา)">
          <CoinAmount value={save.coins} />
        </span>
        <span className="hud-pill" title="ชื่อเสียงร้าน = ผลรวมดาวที่ดีที่สุดของทุกงาน">
          <Icon name="star" size={16} filled className="star-on" />
          {rep}
        </span>
        <span className="hud-level">{level.title}</span>
        <div className="hud-menu">
          <button
            type="button"
            className="hud-icon-btn"
            aria-expanded={menuOpen}
            aria-label="ตั้งค่า"
            onClick={() => setMenuOpen(o => !o)}
          >
            <Icon name="gear" size={20} />
          </button>
          {menuOpen && (
            <div className="hud-popover" role="group" aria-label="ตั้งค่า">
              <label className="switch">
                <input type="checkbox" checked={save.settings.sfx} onChange={e => updateSettings({ sfx: e.target.checked })} />
                <span>เสียงเอฟเฟกต์</span>
              </label>
              {!storageOk && <p className="hud-warn">บันทึกลงเบราว์เซอร์ไม่ได้ ความคืบหน้าจะหายเมื่อปิดหน้า</p>}
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => setMenuOpen(false)}>
                ปิด
              </button>
            </div>
          )}
        </div>
      </div>
    </header>
  )
}

