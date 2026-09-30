import { useEffect, useRef, useState, type CSSProperties, type ReactNode } from 'react'
import { Icon, type IconName } from '../../components/Icon'
import './desktop.css'

export interface DesktopControl {
  open(id: string): void
  close(id: string): void
  toast(text: string): void
}

export interface DesktopApp {
  id: string
  title: string
  icon: IconName
  width?: number
  height?: number
  render: (ctl: DesktopControl) => ReactNode
}

export interface MenuItem {
  label: string
  icon?: IconName
  app?: string
  onSelect?: (ctl: DesktopControl) => void
}

interface Props {
  apps: DesktopApp[]
  icons: { app: string; label: string; icon: IconName }[]
  startMenu: MenuItem[]
  winxMenu: MenuItem[]
  /** omit for a plain speaker icon in the tray */
  volume?: { state: 'ok' | 'none' | 'mute'; panel: (close: () => void) => ReactNode }
  initialOpen?: string[]
  onOpenApp?: (id: string) => void
  search?: (query: string) => string | null
  wallpaper?: 'teal' | 'blue'
  children?: ReactNode
}

type Menu = 'start' | 'winx' | 'volume' | null

export function Desktop({ apps, icons, startMenu, winxMenu, volume, initialOpen = [], onOpenApp, search, wallpaper = 'teal', children }: Props) {
  const [open, setOpen] = useState<string[]>(initialOpen)
  const [menu, setMenu] = useState<Menu>(null)
  const [toast, setToast] = useState<{ id: number; text: string } | null>(null)
  const [query, setQuery] = useState('')
  const [selectedIcon, setSelectedIcon] = useState<string | null>(null)
  const touchRef = useRef(false)

  useEffect(() => {
    if (!toast) return
    const t = window.setTimeout(() => setToast(null), 2800)
    return () => window.clearTimeout(t)
  }, [toast])

  const ctl: DesktopControl = {
    open: id => {
      setOpen(list => [...list.filter(x => x !== id), id])
      setMenu(null)
      onOpenApp?.(id)
    },
    close: id => setOpen(list => list.filter(x => x !== id)),
    toast: text => setToast(prev => ({ id: (prev?.id ?? 0) + 1, text })),
  }

  const runItem = (item: MenuItem) => {
    setMenu(null)
    if (item.app) ctl.open(item.app)
    else if (item.onSelect) item.onSelect(ctl)
    else ctl.toast(`"${item.label}" ไม่ต้องใช้ในงานนี้`)
  }

  const submitSearch = () => {
    const q = query.trim()
    if (!q) return
    const id = search?.(q.toLowerCase()) ?? null
    if (id) ctl.open(id)
    else ctl.toast(`ไม่พบผลลัพธ์สำหรับ "${q}"`)
    setQuery('')
  }

  return (
    <div className={`dt dt-${wallpaper}`} onMouseDown={e => e.target === e.currentTarget && setMenu(null)}>
      <div className="dt-icons">
        {icons.map(ic => (
          // like Windows: click selects, double-click (or Enter) opens; a tap on a touch screen opens directly
          <button
            key={ic.app}
            type="button"
            className={`dt-icon${selectedIcon === ic.app ? ' on' : ''}`}
            title="ดับเบิลคลิกเพื่อเปิด"
            onPointerDown={e => (touchRef.current = e.pointerType === 'touch')}
            onClick={() => (touchRef.current ? ctl.open(ic.app) : setSelectedIcon(ic.app))}
            onDoubleClick={() => ctl.open(ic.app)}
            onKeyDown={e => e.key === 'Enter' && ctl.open(ic.app)}
          >
            <span className="dt-icon-img">
              <Icon name={ic.icon} size={30} />
            </span>
            <span>{ic.label}</span>
          </button>
        ))}
      </div>

      {open.map((id, i) => {
        const app = apps.find(a => a.id === id)
        if (!app) return null
        const style = {
          '--w': `${app.width ?? 560}px`,
          '--h': `${app.height ?? 380}px`,
          '--x': `${3 + (i % 5) * 4}%`,
          '--y': `${3 + (i % 5) * 5}%`,
          zIndex: 10 + i,
        } as CSSProperties
        const focused = i === open.length - 1
        return (
          <section
            key={id}
            className={`dt-window${focused ? ' is-focused' : ''}`}
            style={style}
            aria-label={app.title}
            onMouseDown={() => {
              if (!focused) setOpen(list => [...list.filter(x => x !== id), id])
            }}
          >
            <header className="dt-titlebar">
              <Icon name={app.icon} size={15} />
              <span>{app.title}</span>
              <button type="button" className="dt-close" aria-label={`ปิด ${app.title}`} onClick={() => ctl.close(id)}>
                <Icon name="x" size={15} />
              </button>
            </header>
            <div className="dt-body">{app.render(ctl)}</div>
          </section>
        )
      })}

      {menu === 'start' && (
        <div className="dt-menu dt-start" role="menu" aria-label="Start">
          <strong className="dt-menu-title">Start</strong>
          {startMenu.map(item => (
            <button key={item.label} type="button" role="menuitem" onClick={() => runItem(item)}>
              <Icon name={item.icon ?? 'app'} size={17} />
              {item.label}
            </button>
          ))}
          <button type="button" role="menuitem" className="dt-menu-hint" onClick={() => setMenu('winx')}>
            <Icon name="menu" size={17} />
            เมนูลัด (เหมือนคลิกขวาที่ปุ่ม Start)
          </button>
        </div>
      )}
      {menu === 'winx' && (
        <div className="dt-menu dt-winx" role="menu" aria-label="เมนูลัดของปุ่ม Start">
          {winxMenu.map(item => (
            <button key={item.label} type="button" role="menuitem" onClick={() => runItem(item)}>
              {item.label}
            </button>
          ))}
        </div>
      )}
      {menu === 'volume' && volume && <div className="dt-flyout">{volume.panel(() => setMenu(null))}</div>}

      {toast && (
        <div key={toast.id} className="dt-toast" role="status">
          {toast.text}
        </div>
      )}

      <footer className="dt-taskbar">
        <button
          type="button"
          className={`dt-start-btn${menu === 'start' || menu === 'winx' ? ' on' : ''}`}
          aria-label="Start (คลิกขวาเพื่อเปิดเมนูลัด)"
          onClick={() => setMenu(m => (m === 'start' ? null : 'start'))}
          onContextMenu={e => {
            e.preventDefault()
            setMenu('winx')
          }}
        >
          <Icon name="start" size={17} />
        </button>
        <form
          className="dt-search"
          onSubmit={e => {
            e.preventDefault()
            submitSearch()
          }}
        >
          <Icon name="search" size={15} />
          <input value={query} onChange={e => setQuery(e.target.value)} placeholder="Type here to search" aria-label="ค้นหาในเครื่อง" />
        </form>
        <div className="dt-tasks">
          {open.map(id => {
            const app = apps.find(a => a.id === id)
            return app ? (
              <button key={id} type="button" className="dt-task" title={app.title} onClick={() => setOpen(list => [...list.filter(x => x !== id), id])}>
                <Icon name={app.icon} size={17} />
              </button>
            ) : null
          })}
        </div>
        <div className="dt-tray">
          <Icon name="wifi" size={16} />
          {volume ? (
            <button
              type="button"
              className={`dt-vol${volume.state !== 'ok' ? ' is-alert' : ''}`}
              aria-label="เสียง (คลิกเพื่อดูสถานะเสียง)"
              onClick={() => setMenu(m => (m === 'volume' ? null : 'volume'))}
            >
              <Icon name={volume.state === 'ok' ? 'speaker' : 'speakerX'} size={17} />
            </button>
          ) : (
            <Icon name="speaker" size={17} />
          )}
          <span className="dt-clock">09:41</span>
        </div>
      </footer>
      {children}
    </div>
  )
}

export function RestartScreen({ label = 'Restarting' }: { label?: string }) {
  return (
    <div className="dt-restart" role="status">
      <span className="dt-spinner" aria-hidden />
      <p>{label}</p>
    </div>
  )
}
