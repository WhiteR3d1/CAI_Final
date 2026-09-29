import { useState, type ReactNode } from 'react'
import { Icon } from '../../components/Icon'
import './web.css'

export interface BrowserPage {
  title: string
  body: ReactNode
  secure?: boolean
}

interface Props {
  home: string
  resolve: (url: string, go: (url: string) => void) => BrowserPage
  /** browser-level bar under the page, e.g. finished downloads */
  footer?: ReactNode
}

export function Browser({ home, resolve, footer }: Props) {
  const [history, setHistory] = useState<string[]>([home])
  const [index, setIndex] = useState(0)
  const [typed, setTyped] = useState<string | null>(null)
  const url = history[index]

  const go = (next: string) => {
    setHistory(h => [...h.slice(0, index + 1), next])
    setIndex(i => i + 1)
    setTyped(null)
  }
  const page = resolve(url, go)

  return (
    <div className={`w-app w-browser${footer ? ' w-browser-with-footer' : ''}`}>
      <div className="w-browser-bar">
        <button type="button" className="w-icon-btn" aria-label="ย้อนกลับ" disabled={index === 0} onClick={() => setIndex(i => i - 1)}>
          <Icon name="arrowLeft" size={16} />
        </button>
        <button type="button" className="w-icon-btn" aria-label="หน้าแรก" onClick={() => go(home)}>
          <Icon name="home" size={16} />
        </button>
        <form
          className="w-browser-address"
          onSubmit={e => {
            e.preventDefault()
            const value = (typed ?? url).trim()
            if (!value) return
            go(/^(https?:|search:)/.test(value) ? value : value.includes('.') ? `https://${value}` : `search:${value}`)
          }}
        >
          <Icon name={page.secure === false ? 'alert' : 'lock'} size={13} className={page.secure === false ? 'w-fail' : 'w-ok'} />
          <input
            value={typed ?? url}
            onChange={e => setTyped(e.target.value)}
            onFocus={e => e.target.select()}
            aria-label="ที่อยู่เว็บหรือคำค้นหา"
            spellCheck={false}
          />
        </form>
      </div>
      <div className="w-browser-page">
        <div className="w-browser-title">{page.title}</div>
        {page.body}
      </div>
      {footer}
    </div>
  )
}

/** Search box used on the simulated search engine's home page */
export function SearchBox({ onSearch, initial = '' }: { onSearch: (q: string) => void; initial?: string }) {
  const [q, setQ] = useState(initial)
  return (
    <form
      className="w-searchbox"
      onSubmit={e => {
        e.preventDefault()
        if (q.trim()) onSearch(q.trim())
      }}
    >
      <Icon name="search" size={16} />
      <input value={q} onChange={e => setQ(e.target.value)} placeholder="ค้นหาเว็บ" aria-label="ค้นหาเว็บ" autoFocus />
      <button type="submit" className="w-btn w-btn-primary">
        ค้นหา
      </button>
    </form>
  )
}
