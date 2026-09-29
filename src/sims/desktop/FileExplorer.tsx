import { useState } from 'react'
import { Icon, type IconName } from '../../components/Icon'

export interface FsAction {
  label: string
  onClick: () => void
  primary?: boolean
}

export interface FsNode {
  id: string
  name: string
  kind: 'pc' | 'drive' | 'usb' | 'folder' | 'file' | 'zip' | 'exe' | 'iso' | 'image'
  detail?: string
  children?: FsNode[]
  /** shown instead of listing many children (e.g. 12,480 photos) */
  summary?: string
  actions?: FsAction[]
  onOpen?: () => void
}

const KIND_ICON: Record<FsNode['kind'], IconName> = {
  pc: 'monitor',
  drive: 'hdd',
  usb: 'usb',
  folder: 'folder',
  file: 'file',
  zip: 'zip',
  exe: 'app',
  iso: 'disc',
  image: 'image',
}

function walk(root: FsNode, path: string[]): FsNode[] {
  const chain = [root]
  let node = root
  for (const id of path) {
    const next = node.children?.find(c => c.id === id)
    if (!next) break
    chain.push(next)
    node = next
  }
  return chain
}

interface Props {
  root: FsNode
  quick?: { label: string; path: string[]; icon: IconName }[]
  initialPath?: string[]
  onNavigate?: (path: string[], node: FsNode) => void
}

export function FileExplorer({ root, quick = [], initialPath = [], onNavigate }: Props) {
  const [path, setPath] = useState<string[]>(initialPath)
  const [selected, setSelected] = useState<string | null>(null)
  const chain = walk(root, path)
  const current = chain[chain.length - 1]
  const validPath = chain.slice(1).map(n => n.id)
  const item = current.children?.find(c => c.id === selected)

  const go = (next: string[]) => {
    const target = walk(root, next)
    const node = target[target.length - 1]
    setPath(target.slice(1).map(n => n.id))
    setSelected(null)
    onNavigate?.(target.slice(1).map(n => n.id), node)
  }

  const open = (node: FsNode) => {
    if (node.children || node.summary) go([...validPath, node.id])
    else node.onOpen?.()
  }

  return (
    <div className="w-app w-fe">
      <div className="w-fe-bar">
        <button type="button" className="w-icon-btn" aria-label="ขึ้นไปหนึ่งระดับ" disabled={validPath.length === 0} onClick={() => go(validPath.slice(0, -1))}>
          <Icon name="arrowLeft" size={16} />
        </button>
        <div className="w-fe-address" aria-label="ตำแหน่งปัจจุบัน">
          {chain.map((n, i) => (
            <button key={n.id} type="button" onClick={() => go(validPath.slice(0, i))}>
              {i > 0 && <Icon name="chevronRight" size={12} />}
              {n.name}
            </button>
          ))}
        </div>
      </div>
      <div className="w-fe-body">
        <nav className="w-fe-nav" aria-label="ทางลัด">
          {quick.map(q => (
            <button key={q.label} type="button" onClick={() => go(q.path)}>
              <Icon name={q.icon} size={15} />
              {q.label}
            </button>
          ))}
          <button type="button" onClick={() => go([])}>
            <Icon name="monitor" size={15} />
            {root.name}
          </button>
        </nav>
        <div className="w-fe-main">
          {current.summary && <p className="w-fe-summary">{current.summary}</p>}
          {current.children && current.children.length === 0 && !current.summary && <p className="w-small">This folder is empty.</p>}
          <ul className="w-fe-list">
            {current.children?.map(child => (
              <li key={child.id}>
                <button
                  type="button"
                  className={selected === child.id ? 'on' : undefined}
                  onClick={() => setSelected(child.id)}
                  onDoubleClick={() => open(child)}
                >
                  <Icon name={KIND_ICON[child.kind]} size={child.kind === 'drive' || child.kind === 'usb' ? 26 : 20} />
                  <span>
                    <strong>{child.name}</strong>
                    {child.detail && <small>{child.detail}</small>}
                  </span>
                </button>
              </li>
            ))}
          </ul>
          {item && (
            <div className="w-fe-detail">
              <span>
                <Icon name={KIND_ICON[item.kind]} size={16} /> {item.name}
              </span>
              <div className="w-buttons">
                {(item.children || item.summary || item.onOpen) && (
                  <button type="button" className="w-btn w-btn-primary" onClick={() => open(item)}>
                    Open
                  </button>
                )}
                {item.actions?.map(a => (
                  <button key={a.label} type="button" className={`w-btn${a.primary ? ' w-btn-primary' : ''}`} onClick={a.onClick}>
                    {a.label}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
