import { useEffect, useRef, useState, type KeyboardEvent } from 'react'
import { Fact } from '../../screens/workbench/Fact'
import { KeyPad } from './Monitor'

export interface BiosInfoRow {
  label: string
  value: string
  fact?: string
}

export type BiosView = 'tab' | 'hdd' | 'priority'

interface Props {
  /** "info" = look only, "boot" = boot order can be changed */
  mode: 'info' | 'boot'
  /** "legacy" = older BIOS like the content sheet (Power/Exit tabs, no Boot Mode row) */
  variant?: 'uefi' | 'legacy'
  info: BiosInfoRow[]
  drives: string[]
  onDrivesChange?: (next: string[]) => void
  onSaveExit: () => void
  onDiscardExit: () => void
  onNote: (text: string) => void
  /** called when a boot sub-menu is opened */
  onView?: (view: BiosView) => void
  /** called when the player tries to disable a drive */
  onDisable?: () => void
}

const TABS = {
  uefi: ['Main', 'Advanced', 'Boot', 'Security', 'Save & Exit'],
  legacy: ['Main', 'Advanced', 'Power', 'Boot', 'Security', 'Exit'],
} as const
const ORD = ['1st', '2nd', '3rd']

interface Row {
  label: string
  value?: string
  fact?: string
  help: string
  action?: () => void
}

export function BiosSetup({ mode, variant = 'uefi', info, drives, onDrivesChange, onSaveExit, onDiscardExit, onNote, onView, onDisable }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const tabs: readonly string[] = TABS[variant]
  const [tab, setTab] = useState(0)
  const [cursor, setCursor] = useState(0)
  const [view, setView] = useState<BiosView>('tab')
  const [popup, setPopup] = useState<{ slot: number; index: number } | null>(null)
  const [dialog, setDialog] = useState<{ kind: 'save' | 'exit'; ok: boolean } | null>(null)

  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])

  const notInThisJob = () => onNote('งานนี้แค่ตรวจสเปกในหน้า Main ยังไม่ต้องตั้งค่าอะไรใน BIOS')
  const openSub = (next: BiosView) => {
    if (mode === 'info') return notInThisJob()
    setView(next)
    setCursor(0)
    onView?.(next)
  }
  const popupOptions = [...drives, 'Disabled']
  const bootRowIndex = { priority: variant === 'legacy' ? 0 : 1, hdd: variant === 'legacy' ? 1 : 2 }

  const rows: Row[] = (() => {
    if (view === 'hdd' || view === 'priority') {
      const driveRows: Row[] = drives.map((d, i) => ({
        label: view === 'hdd' ? `${ORD[i]} Drive` : `${ORD[i]} Boot Device`,
        value: d,
        help: view === 'hdd' ? 'กด Enter เพื่อเลือกอุปกรณ์ที่จะให้อยู่ลำดับนี้' : 'ลำดับอุปกรณ์ที่เครื่องจะลองบูต เปลี่ยนได้โดยกด Enter',
        action: () => setPopup({ slot: i, index: i }),
      }))
      if (view === 'priority')
        driveRows.push({ label: `${ORD[drives.length]} Boot Device`, value: 'Network: PXE', help: 'บูตผ่านเครือข่าย ไม่ใช้ในงานนี้', action: () => onNote('ไม่ต้องใช้การบูตผ่านเครือข่ายในงานนี้') })
      return driveRows
    }
    switch (tabs[tab]) {
      case 'Main':
        return info.map(r => ({ label: r.label, value: r.value, fact: r.fact, help: 'ข้อมูลของเครื่อง กดหมุดเพื่อจดเป็นหลักฐานได้' }))
      case 'Advanced':
        return ['CPU Configuration', 'IDE Configuration', 'USB Configuration'].map(l => ({
          label: `▶ ${l}`,
          help: 'ตั้งค่าขั้นสูง ไม่ต้องใช้ในงานนี้',
          action: () => onNote('เมนู Advanced ไม่ต้องใช้ในงานนี้ ลองดูแท็บ Boot'),
        }))
      case 'Power':
        return ['ACPI Settings', 'APM Configuration'].map(l => ({
          label: `▶ ${l}`,
          help: 'ตั้งค่าการจัดการพลังงาน ไม่ต้องใช้ในงานนี้',
          action: () => onNote('เมนู Power ไม่เกี่ยวกับลำดับบูต ลองดูแท็บ Boot'),
        }))
      case 'Boot':
        return [
          ...(variant === 'uefi'
            ? [{ label: 'Boot Mode Select', value: 'UEFI', help: 'รูปแบบการบูตของเมนบอร์ด', action: () => onNote('ไม่ต้องเปลี่ยน Boot Mode ในงานนี้') }]
            : []),
          { label: '▶ Boot Device Priority', help: 'ดูลำดับอุปกรณ์ที่ใช้บูต', action: () => openSub('priority') },
          { label: '▶ Hard Disk Drives', help: 'จัดลำดับฮาร์ดดิสก์และแฟลชไดรฟ์ที่ใช้บูต', action: () => openSub('hdd') },
          { label: '▶ CD/DVD Drives', help: 'เครื่องนี้ไม่มีไดรฟ์ CD/DVD', action: () => onNote('เครื่องนี้ไม่มีไดรฟ์ CD/DVD') },
        ]
      case 'Security':
        return variant === 'uefi'
          ? [
              { label: 'Administrator Password', value: 'Not Installed', help: 'รหัสผ่านเข้า BIOS', action: () => onNote('ไม่ต้องตั้งรหัสผ่านในงานนี้') },
              { label: 'Secure Boot', value: 'Enabled', help: 'ป้องกันการบูตจากโปรแกรมที่ไม่ได้รับรอง', action: () => onNote('ไม่ต้องเปลี่ยน Secure Boot ในงานนี้') },
            ]
          : [{ label: 'Supervisor Password', value: 'Not Installed', help: 'รหัสผ่านเข้า BIOS', action: () => onNote('ไม่ต้องตั้งรหัสผ่านในงานนี้') }]
      default:
        return [
          { label: 'Save Changes and Exit', help: 'บันทึกการตั้งค่าแล้วรีสตาร์ต (เหมือนกด F10)', action: () => setDialog({ kind: 'save', ok: true }) },
          { label: 'Discard Changes and Exit', help: 'ออกโดยไม่บันทึก การเปลี่ยนแปลงจะไม่มีผล', action: () => setDialog({ kind: 'exit', ok: true }) },
        ]
    }
  })()

  const safeCursor = Math.min(cursor, Math.max(0, rows.length - 1))

  const choosePopup = (index: number) => {
    if (!popup) return
    const option = popupOptions[index]
    if (option === 'Disabled') {
      if (onDisable) onDisable()
      else onNote('อย่าปิดการใช้งานไดรฟ์ ให้สลับลำดับแทน')
      setPopup(null)
      return
    }
    const next = [...drives]
    const from = next.indexOf(option)
    ;[next[popup.slot], next[from]] = [next[from], next[popup.slot]]
    onDrivesChange?.(next)
    setPopup(null)
  }

  const confirmDialog = (ok: boolean) => {
    if (!dialog) return
    setDialog(null)
    if (!ok) return
    if (dialog.kind === 'save') onSaveExit()
    else onDiscardExit()
  }

  const press = (key: string) => {
    if (dialog) {
      if (key === 'ArrowLeft' || key === 'ArrowRight') setDialog({ ...dialog, ok: !dialog.ok })
      else if (key === 'Enter') confirmDialog(dialog.ok)
      else if (key === 'Escape') setDialog(null)
      return
    }
    if (key === 'F10') {
      setDialog({ kind: 'save', ok: true })
      return
    }
    if (popup) {
      if (key === 'ArrowUp') setPopup({ ...popup, index: Math.max(0, popup.index - 1) })
      else if (key === 'ArrowDown') setPopup({ ...popup, index: Math.min(popupOptions.length - 1, popup.index + 1) })
      else if (key === 'Enter') choosePopup(popup.index)
      else if (key === 'Escape') setPopup(null)
      return
    }
    if (key === 'ArrowUp') setCursor(Math.max(0, safeCursor - 1))
    else if (key === 'ArrowDown') setCursor(Math.min(rows.length - 1, safeCursor + 1))
    else if (key === 'Enter') rows[safeCursor]?.action?.()
    else if (key === 'Escape') {
      if (view !== 'tab') {
        setCursor(bootRowIndex[view])
        setView('tab')
        onView?.('tab')
      } else setDialog({ kind: 'exit', ok: true })
    } else if (view === 'tab' && (key === 'ArrowLeft' || key === 'ArrowRight')) {
      setTab(t => (t + (key === 'ArrowLeft' ? tabs.length - 1 : 1)) % tabs.length)
      setCursor(0)
    }
  }

  const onKeyDown = (e: KeyboardEvent) => {
    if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight', 'Enter', 'Escape', 'F10'].includes(e.key)) {
      if (e.key === 'Enter' && (e.target as HTMLElement).closest('button')) return
      e.preventDefault()
      press(e.key)
    }
  }

  const title = view === 'hdd' ? 'Hard Disk Drives' : view === 'priority' ? 'Boot Device Priority' : null

  return (
    <div className="bios-wrap">
      <div ref={ref} className="bios" tabIndex={0} role="application" aria-label="BIOS Setup Utility ใช้ลูกศร Enter Esc และ F10" onKeyDown={onKeyDown}>
        <div className="bios-title">BIOS SETUP UTILITY</div>
        <div className="bios-tabs" role="tablist">
          {tabs.map((t, i) => (
            <button
              key={t}
              type="button"
              role="tab"
              tabIndex={-1}
              aria-selected={tab === i}
              className={tab === i ? 'on' : undefined}
              onClick={() => {
                setTab(i)
                setView('tab')
                setCursor(0)
                setPopup(null)
                ref.current?.focus({ preventScroll: true })
              }}
            >
              {t}
            </button>
          ))}
        </div>
        <div className="bios-body">
          <div className="bios-main">
            {title && <div className="bios-sub">{title}</div>}
            <ul className="bios-rows">
              {rows.map((r, i) => (
                <li
                  key={r.label}
                  className={i === safeCursor ? 'on' : undefined}
                  onClick={e => {
                    if ((e.target as HTMLElement).closest('.fact-pin')) return
                    setCursor(i)
                    r.action?.()
                    ref.current?.focus({ preventScroll: true })
                  }}
                >
                  <span className="bios-label">{r.label}</span>
                  {r.value !== undefined && <span className="bios-value">{r.fact ? <Fact id={r.fact}>[{r.value}]</Fact> : `[${r.value}]`}</span>}
                </li>
              ))}
            </ul>
          </div>
          <aside className="bios-help">
            <p>{rows[safeCursor]?.help}</p>
            <dl>
              <dt>←→</dt>
              <dd>Select Screen</dd>
              <dt>↑↓</dt>
              <dd>Select Item</dd>
              <dt>Enter</dt>
              <dd>Select</dd>
              <dt>F10</dt>
              <dd>Save and Exit</dd>
              <dt>ESC</dt>
              <dd>Exit</dd>
            </dl>
          </aside>
        </div>
        <div className="bios-foot">{variant === 'legacy' ? 'v02.61' : 'v2.14'} (C) 2026 Bloom Firmware — แบบจำลองเพื่อการเรียนรู้</div>

        {popup && (
          <div className="bios-popup" role="listbox" aria-label="เลือกอุปกรณ์">
            <div className="bios-popup-title">Options</div>
            {popupOptions.map((o, i) => (
              <button
                key={o}
                type="button"
                tabIndex={-1}
                role="option"
                aria-selected={popup.index === i}
                className={popup.index === i ? 'on' : undefined}
                onClick={() => {
                  choosePopup(i)
                  ref.current?.focus({ preventScroll: true })
                }}
              >
                {o}
              </button>
            ))}
          </div>
        )}
        {dialog && (
          <div className="bios-dialog" role="alertdialog" aria-label={dialog.kind === 'save' ? 'บันทึกและออก' : 'ออกโดยไม่บันทึก'}>
            <p>{dialog.kind === 'save' ? 'Save configuration changes and exit now?' : 'Quit without saving?'}</p>
            <div>
              {[true, false].map(ok => (
                <button
                  key={String(ok)}
                  type="button"
                  tabIndex={-1}
                  className={dialog.ok === ok ? 'on' : undefined}
                  onClick={() => {
                    confirmDialog(ok)
                    ref.current?.focus({ preventScroll: true })
                  }}
                >
                  [{ok ? 'Ok' : 'Cancel'}]
                </button>
              ))}
            </div>
          </div>
        )}
      </div>
      <KeyPad
        keys={['ArrowLeft', 'ArrowUp', 'ArrowDown', 'ArrowRight', 'Enter', 'Escape', 'F10']}
        onKey={k => {
          press(k)
          ref.current?.focus({ preventScroll: true })
        }}
      />
    </div>
  )
}
