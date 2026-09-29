import { useState } from 'react'
import { Fact } from '../../screens/workbench/Fact'

export interface DxRow {
  label: string
  value: string
  fact?: string
}

export interface DxTab {
  id: string
  label: string
  group: string
  rows: DxRow[]
  notes: DxRow
}

/** DirectX Diagnostic Tool (dxdiag) */
export function Dxdiag({ tabs, onExit }: { tabs: DxTab[]; onExit: () => void }) {
  const [tabId, setTabId] = useState(tabs[0].id)
  const tab = tabs.find(t => t.id === tabId) ?? tabs[0]
  const index = tabs.indexOf(tab)

  return (
    <div className="w-app w-dx">
      <div className="w-tabs" role="tablist">
        {tabs.map(t => (
          <button key={t.id} type="button" role="tab" aria-selected={t.id === tab.id} className={t.id === tab.id ? 'on' : undefined} onClick={() => setTabId(t.id)}>
            {t.label}
          </button>
        ))}
      </div>
      <fieldset className="w-group">
        <legend>{tab.group}</legend>
        <dl className="w-dl">
          {tab.rows.map(r => (
            <div key={r.label}>
              <dt>{r.label}:</dt>
              <dd>{r.fact ? <Fact id={r.fact}>{r.value}</Fact> : r.value}</dd>
            </div>
          ))}
        </dl>
      </fieldset>
      <fieldset className="w-group">
        <legend>Notes</legend>
        <p className="w-notes">• {tab.notes.fact ? <Fact id={tab.notes.fact}>{tab.notes.value}</Fact> : tab.notes.value}</p>
      </fieldset>
      <div className="w-buttons">
        <button type="button" className="w-btn" disabled={index === tabs.length - 1} onClick={() => setTabId(tabs[index + 1]?.id ?? tab.id)}>
          Next Page
        </button>
        <button type="button" className="w-btn w-btn-primary" onClick={onExit}>
          Exit
        </button>
      </div>
    </div>
  )
}
