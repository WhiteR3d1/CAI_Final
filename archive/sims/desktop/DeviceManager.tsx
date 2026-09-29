import { useState } from 'react'
import { Icon, type IconName } from '../../components/Icon'
import { Fact } from '../../screens/workbench/Fact'

export interface DmDevice {
  id: string
  name: string
  status: 'ok' | 'warn'
  statusText: string
  manufacturer: string
  provider: string
  version: string
  date: string
  /** evidence ids that can be pinned from this device */
  facts?: { row?: string; status?: string; driver?: string }
}

export interface DmCategory {
  id: string
  name: string
  icon: IconName
  devices: DmDevice[]
}

export interface DmResult {
  ok: boolean
  message: string
}

interface Props {
  categories: DmCategory[]
  browseFolders: string[]
  onUpdateAuto: (deviceId: string) => DmResult
  onUpdateBrowse: (deviceId: string, folder: string) => DmResult
  onOtherAction: (deviceId: string, action: 'disable' | 'uninstall' | 'scan') => void
  onSelectDevice?: (deviceId: string) => void
}

type Panel = null | 'props' | 'choose' | 'searching' | 'browse' | DmResult

export function DeviceManager({ categories, browseFolders, onUpdateAuto, onUpdateBrowse, onOtherAction, onSelectDevice }: Props) {
  const [expanded, setExpanded] = useState<string[]>(() =>
    categories.filter(c => c.devices.some(d => d.status === 'warn') || c.id === 'sound').map(c => c.id),
  )
  const [selected, setSelected] = useState<string | null>(null)
  const [panel, setPanel] = useState<Panel>(null)
  const [propsTab, setPropsTab] = useState<'general' | 'driver'>('general')
  const [folder, setFolder] = useState('')
  const [menu, setMenu] = useState<{ x: number; y: number } | null>(null)

  const device = categories.flatMap(c => c.devices).find(d => d.id === selected)
  const toggle = (id: string) => setExpanded(list => (list.includes(id) ? list.filter(x => x !== id) : [...list, id]))

  const act = (action: 'update' | 'props' | 'disable' | 'uninstall' | 'scan') => {
    setMenu(null)
    if (action === 'scan') return onOtherAction(selected ?? '', 'scan')
    if (!device) return
    if (action === 'update') setPanel('choose')
    else if (action === 'props') {
      setPropsTab('general')
      setPanel('props')
    } else onOtherAction(device.id, action)
  }

  const searchAuto = () => {
    if (!device) return
    setPanel('searching')
    const id = device.id
    window.setTimeout(() => setPanel(onUpdateAuto(id)), 1400)
  }

  return (
    <div className="w-app w-dm" onClick={() => menu && setMenu(null)}>
      <div className="w-toolbar">
        <button type="button" className="w-tool" disabled={!device} onClick={() => act('update')}>
          <Icon name="download" size={15} /> Update driver
        </button>
        <button type="button" className="w-tool" disabled={!device} onClick={() => act('props')}>
          <Icon name="info" size={15} /> Properties
        </button>
        <button type="button" className="w-tool" onClick={() => act('scan')}>
          <Icon name="search" size={15} /> Scan for hardware changes
        </button>
      </div>

      <ul className="dm-tree" role="tree" aria-label="อุปกรณ์ในเครื่อง">
        <li className="dm-root">
          <Icon name="monitor" size={15} /> DESKTOP-BLOOM
        </li>
        {categories.filter(cat => cat.devices.length > 0).map(cat => {
          const isOpen = expanded.includes(cat.id)
          return (
            <li key={cat.id} role="treeitem" aria-expanded={isOpen}>
              <button type="button" className="dm-cat" onClick={() => toggle(cat.id)}>
                <Icon name={isOpen ? 'chevronDown' : 'chevronRight'} size={13} />
                <Icon name={cat.icon} size={15} />
                {cat.name}
              </button>
              {isOpen && (
                <ul role="group">
                  {cat.devices.map(d => (
                    <li key={d.id} role="treeitem" aria-selected={selected === d.id}>
                      <div
                        className={`dm-dev${selected === d.id ? ' on' : ''}`}
                        tabIndex={0}
                        onKeyDown={e => {
                          if (e.key === 'Enter' || e.key === ' ') {
                            e.preventDefault()
                            setSelected(d.id)
                            onSelectDevice?.(d.id)
                          }
                        }}
                        onClick={e => {
                          if ((e.target as HTMLElement).closest('.fact-pin')) return
                          setSelected(d.id)
                          onSelectDevice?.(d.id)
                        }}
                        onDoubleClick={() => {
                          setSelected(d.id)
                          setPropsTab('general')
                          setPanel('props')
                        }}
                        onContextMenu={e => {
                          e.preventDefault()
                          setSelected(d.id)
                          const box = e.currentTarget.closest('.w-dm')?.getBoundingClientRect()
                          setMenu({ x: e.clientX - (box?.left ?? 0), y: e.clientY - (box?.top ?? 0) })
                        }}
                      >
                        <span className="dm-dev-icon">
                          <Icon name={cat.icon} size={15} />
                          {d.status === 'warn' && <span className="dm-warn" aria-label="มีปัญหา">!</span>}
                        </span>
                        {d.facts?.row ? <Fact id={d.facts.row}>{d.name}</Fact> : d.name}
                      </div>
                    </li>
                  ))}
                </ul>
              )}
            </li>
          )
        })}
      </ul>

      {menu && device && (
        <div className="w-context" style={{ left: menu.x, top: menu.y }} role="menu">
          <button type="button" role="menuitem" onClick={() => act('update')}>
            Update driver
          </button>
          <button type="button" role="menuitem" onClick={() => act('disable')}>
            Disable device
          </button>
          <button type="button" role="menuitem" onClick={() => act('uninstall')}>
            Uninstall device
          </button>
          <hr />
          <button type="button" role="menuitem" onClick={() => act('scan')}>
            Scan for hardware changes
          </button>
          <button type="button" role="menuitem" onClick={() => act('props')}>
            <strong>Properties</strong>
          </button>
        </div>
      )}

      {panel && device && (
        <div className="w-sheet" role="dialog" aria-label={panel === 'props' ? `${device.name} Properties` : 'Update Drivers'}>
          <header className="w-sheet-head">
            <span>{panel === 'props' ? `${device.name} Properties` : `Update Drivers - ${device.name}`}</span>
            <button type="button" className="dt-close" aria-label="ปิด" onClick={() => setPanel(null)}>
              <Icon name="x" size={14} />
            </button>
          </header>

          {panel === 'props' && (
            <div className="w-sheet-body">
              <div className="w-tabs">
                {(['general', 'driver'] as const).map(t => (
                  <button key={t} type="button" className={propsTab === t ? 'on' : undefined} onClick={() => setPropsTab(t)}>
                    {t === 'general' ? 'General' : 'Driver'}
                  </button>
                ))}
              </div>
              {propsTab === 'general' ? (
                <div className="w-kv">
                  <span>Device type:</span>
                  <span>{categories.find(c => c.devices.includes(device))?.name}</span>
                  <span>Manufacturer:</span>
                  <span>{device.manufacturer}</span>
                  <span>Location:</span>
                  <span>Internal High Definition Audio Bus</span>
                  <span className="w-kv-full">Device status</span>
                  <div className="w-status w-kv-full">
                    {device.facts?.status ? <Fact id={device.facts.status}>{device.statusText}</Fact> : device.statusText}
                  </div>
                </div>
              ) : (
                <div className="w-kv">
                  <span>Driver Provider:</span>
                  <span>{device.facts?.driver ? <Fact id={device.facts.driver}>{device.provider}</Fact> : device.provider}</span>
                  <span>Driver Date:</span>
                  <span>{device.date}</span>
                  <span>Driver Version:</span>
                  <span>{device.version}</span>
                  <span className="w-kv-full" />
                  <button type="button" className="w-btn w-kv-full" onClick={() => setPanel('choose')}>
                    Update Driver...
                  </button>
                </div>
              )}
            </div>
          )}

          {panel === 'choose' && (
            <div className="w-sheet-body">
              <h3 className="w-h">How do you want to search for drivers?</h3>
              <button type="button" className="w-bigopt" onClick={searchAuto}>
                <strong>→ Search automatically for updated driver software</strong>
                <span>Windows will search your computer and the Internet for the latest driver software for your device.</span>
              </button>
              <button type="button" className="w-bigopt" onClick={() => setPanel('browse')}>
                <strong>→ Browse my computer for driver software</strong>
                <span>Locate and install driver software manually.</span>
              </button>
            </div>
          )}

          {panel === 'searching' && (
            <div className="w-sheet-body w-center">
              <span className="dt-spinner dt-spinner-dark" aria-hidden />
              <p>Searching online for drivers...</p>
            </div>
          )}

          {panel === 'browse' && (
            <div className="w-sheet-body">
              <h3 className="w-h">Browse for drivers on your computer</h3>
              {browseFolders.length === 0 ? (
                <p className="w-note">ยังไม่มีโฟลเดอร์ไดรเวอร์ในเครื่อง ต้องดาวน์โหลดและแตกไฟล์ (Extract All) ก่อน</p>
              ) : (
                <div className="w-radio-list" role="radiogroup" aria-label="โฟลเดอร์ไดรเวอร์">
                  {browseFolders.map(f => (
                    <label key={f}>
                      <input type="radio" name="dm-folder" checked={folder === f} onChange={() => setFolder(f)} />
                      <Icon name="folder" size={15} /> C:\Users\Ann\Downloads\{f}
                    </label>
                  ))}
                </div>
              )}
              <div className="w-buttons">
                <button type="button" className="w-btn" onClick={() => setPanel('choose')}>
                  Back
                </button>
                <button type="button" className="w-btn w-btn-primary" disabled={!folder} onClick={() => setPanel(onUpdateBrowse(device.id, folder))}>
                  Next
                </button>
              </div>
            </div>
          )}

          {typeof panel === 'object' && (
            <div className="w-sheet-body">
              <h3 className={`w-h ${panel.ok ? 'w-ok' : 'w-fail'}`}>
                <Icon name={panel.ok ? 'check' : 'alert'} size={18} /> {panel.ok ? 'Windows has successfully updated your drivers' : 'Update Drivers'}
              </h3>
              <p>{panel.message}</p>
              <div className="w-buttons">
                <button type="button" className="w-btn w-btn-primary" onClick={() => setPanel(null)}>
                  Close
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  )
}
