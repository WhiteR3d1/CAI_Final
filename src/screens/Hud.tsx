import { CoinAmount } from '../components/Bits'
import { Icon, type IconName } from '../components/Icon'
import { ThemeToggle } from '../components/ThemeToggle'
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
            <small>ร้านซ่อมคอมจำลอง · ติดตั้ง Windows 10 / 11</small>
          </span>
        </div>
      ) : (
        <button type="button" className="hud-brand" onClick={() => onNavigate({ name: 'shop' })} aria-label="กลับหน้าร้าน Boot & Bloom">
          <Logo />
          <span>
            <strong>Boot &amp; Bloom</strong>
            <small>ร้านซ่อมคอมจำลอง · ติดตั้ง Windows 10 / 11</small>
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
        {!storageOk && (
          <span className="hud-pill hud-warn" title="บันทึกลงเบราว์เซอร์ไม่ได้ ความคืบหน้าจะหายเมื่อปิดหน้า">
            <Icon name="alert" size={16} />
            บันทึกไม่ได้
          </span>
        )}
        <button
          type="button"
          className="hud-icon-btn"
          aria-pressed={save.settings.sfx}
          aria-label={save.settings.sfx ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
          title={save.settings.sfx ? 'ปิดเสียงเอฟเฟกต์' : 'เปิดเสียงเอฟเฟกต์'}
          onClick={() => updateSettings({ sfx: !save.settings.sfx })}
        >
          <Icon name={save.settings.sfx ? 'speaker' : 'speakerX'} size={20} />
        </button>
        <ThemeToggle className="hud-icon-btn" />
      </div>
    </header>
  )
}

