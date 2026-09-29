import { Icon } from '../../components/Icon'
import { SoundWave } from '../desktop/SoundControls'

interface Props {
  outputName: string
  playing: boolean
  heard: boolean
  onTest: () => void
}

const PEOPLE = [
  { name: 'คุณวิน (ลูกค้า)', initial: 'ว', speaking: true, color: '#3d6f8e' },
  { name: 'คุณมุก (ลูกค้า)', initial: 'ม', speaking: false, color: '#7d6aa8' },
  { name: 'คุณพลอย (คุณ)', initial: 'พ', speaking: false, color: '#c07f5f' },
]

/** BloomMeet — the online meeting app the customer actually uses. */
export function MeetingApp({ outputName, playing, heard, onTest }: Props) {
  return (
    <div className="w-app meet">
      <div className="meet-grid">
        {PEOPLE.map(p => (
          <div key={p.name} className={`meet-tile${p.speaking ? ' is-speaking' : ''}`}>
            <span className="meet-face" style={{ background: p.color }}>
              {p.initial}
            </span>
            <span className="meet-name">{p.name}</span>
            {p.speaking && <span className="meet-talk">{heard ? 'กำลังพูด 🔊' : 'กำลังพูด… แต่ไม่ได้ยินเสียง'}</span>}
          </div>
        ))}
      </div>
      <div className="meet-bar">
        <span className="w-small">
          <Icon name="speaker" size={14} /> ลำโพง: {outputName}
        </span>
        <button type="button" className="w-btn w-btn-primary" onClick={onTest}>
          <Icon name="play" size={14} /> ทดสอบลำโพง
        </button>
      </div>
      {playing && (heard ? <SoundWave /> : <p className="w-note">กำลังเล่นเสียงทดสอบ… ออกทาง {outputName} แต่ไม่ได้ยินอะไรเลย</p>)}
    </div>
  )
}
