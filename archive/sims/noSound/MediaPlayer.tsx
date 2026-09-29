import { Icon } from '../../components/Icon'
import { SoundWave } from '../desktop/SoundControls'

/** The teacher's lesson video. Plays silently until the audio device works. */
export function MediaPlayer({ soundOk, playing, onPlay }: { soundOk: boolean; playing: boolean; onPlay: () => void }) {
  return (
    <div className="w-app player">
      <div className={`player-screen${playing ? ' is-playing' : ''}`}>
        <span className="player-title">English Lesson 5 · Greetings</span>
        <span className="player-caption">{playing ? '“Hello! Nice to meet you.”' : 'สื่อการสอน.mp4'}</span>
        {playing && (soundOk ? <SoundWave /> : <span className="player-mute">🔇 ภาพเล่นแต่ไม่มีเสียง</span>)}
      </div>
      <div className="player-bar">
        <button type="button" className="w-btn w-btn-primary" onClick={onPlay}>
          <Icon name="play" size={14} /> เล่น
        </button>
        <span className="w-small">00:12 / 03:45</span>
      </div>
    </div>
  )
}
