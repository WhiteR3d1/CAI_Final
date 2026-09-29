import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Fact } from '../../screens/workbench/Fact'

export interface AudioOut {
  id: string
  name: string
}

export interface SoundState {
  /** no working output device (driver problem) */
  broken: boolean
  outputs: AudioOut[]
  outputId: string | null
  volume: number
  muted: boolean
}

export interface SoundFacts {
  broken?: string
  output?: string
  level?: string
  troubleshoot?: string
}

interface Handlers {
  onSelect: (id: string) => void
  onVolume: (v: number) => void
  onMute: () => void
  onTest: () => void
}

function OutputName({ state, facts }: { state: SoundState; facts: SoundFacts }) {
  const out = state.outputs.find(o => o.id === state.outputId)
  if (!out) return null
  return facts.output ? <Fact id={facts.output}>{out.name}</Fact> : <>{out.name}</>
}

export function VolumeFlyout({ state, facts = {}, playing, ...h }: { state: SoundState; facts?: SoundFacts; playing: boolean } & Handlers) {
  if (state.broken) {
    return (
      <div className="w-vol">
        <div className="w-vol-broken">
          <Icon name="speakerX" size={22} />
          {facts.broken ? <Fact id={facts.broken}>No Audio Output Device is installed</Fact> : 'No Audio Output Device is installed'}
        </div>
        <p className="w-note">ไม่พบอุปกรณ์ส่งออกเสียงที่ใช้งานได้</p>
      </div>
    )
  }
  return (
    <div className="w-vol">
      <label className="w-vol-device">
        <span>อุปกรณ์ส่งออก (Output)</span>
        <select value={state.outputId ?? ''} onChange={e => h.onSelect(e.target.value)}>
          {state.outputs.map(o => (
            <option key={o.id} value={o.id}>
              {o.name}
            </option>
          ))}
        </select>
      </label>
      <p className="w-vol-current">
        กำลังใช้: <OutputName state={state} facts={facts} />
      </p>
      <div className="w-vol-row">
        <button type="button" className="w-icon-btn" aria-label={state.muted ? 'เปิดเสียง' : 'ปิดเสียง'} onClick={h.onMute}>
          <Icon name={state.muted ? 'speakerX' : 'speaker'} size={20} />
        </button>
        <input
          type="range"
          min={0}
          max={100}
          value={state.volume}
          aria-label="ระดับเสียง"
          onChange={e => h.onVolume(Number(e.target.value))}
        />
        <span className="w-vol-num">
          {facts.level ? <Fact id={facts.level}>{state.muted ? 'ปิดเสียง' : `${state.volume}%`}</Fact> : state.muted ? 'ปิดเสียง' : `${state.volume}%`}
        </span>
      </div>
      <button type="button" className="w-btn w-btn-primary w-test" onClick={h.onTest}>
        <Icon name="play" size={14} /> เล่นเสียงทดสอบ
      </button>
      {playing && <SoundWave />}
    </div>
  )
}

export function SoundWave() {
  return (
    <div className="sound-wave" aria-label="กำลังเล่นเสียง">
      {Array.from({ length: 12 }, (_, i) => (
        <span key={i} style={{ animationDelay: `${(i % 6) * 0.08}s` }} />
      ))}
    </div>
  )
}

export function SoundSettingsPage({
  state,
  facts = {},
  playing,
  onTroubleshoot,
  ...h
}: { state: SoundState; facts?: SoundFacts; playing: boolean; onTroubleshoot: () => string } & Handlers) {
  const [trouble, setTrouble] = useState<'idle' | 'running' | string>('idle')
  return (
    <div className="w-settings-page">
      <h2>Sound</h2>
      <h3>Output</h3>
      <label className="w-field w-field-col">
        <span>Choose your output device</span>
        {state.broken || state.outputs.length === 0 ? (
          <select disabled>
            <option>No output devices found</option>
          </select>
        ) : (
          <select value={state.outputId ?? ''} onChange={e => h.onSelect(e.target.value)}>
            {state.outputs.map(o => (
              <option key={o.id} value={o.id}>
                {o.name}
              </option>
            ))}
          </select>
        )}
      </label>
      {!state.broken && (
        <>
          <p className="w-small">
            Master volume: {state.muted ? 'muted' : `${state.volume}`}
          </p>
          <button type="button" className="w-btn" onClick={h.onTest}>
            <Icon name="play" size={14} /> Test
          </button>
          {playing && <SoundWave />}
        </>
      )}
      <div className="w-trouble">
        <button
          type="button"
          className="w-btn"
          disabled={trouble === 'running'}
          onClick={() => {
            setTrouble('running')
            window.setTimeout(() => setTrouble(onTroubleshoot()), 1300)
          }}
        >
          Troubleshoot
        </button>
        {trouble === 'running' && <span className="w-small">กำลังตรวจหาปัญหา…</span>}
        {trouble !== 'idle' && trouble !== 'running' && (
          <p className="w-note">{facts.troubleshoot && state.broken ? <Fact id={facts.troubleshoot}>{trouble}</Fact> : trouble}</p>
        )}
      </div>
    </div>
  )
}
