import type { AvatarLook } from '../game/types'

type Mood = 'happy' | 'worried' | 'neutral'

interface Props {
  look: AvatarLook
  mood?: Mood
  size?: number
  className?: string
  label?: string
}

const HAIR_BACK: Partial<Record<AvatarLook['hairStyle'], string>> = {
  bob: 'M26 52C23 27 37 15 50 15s27 12 24 37h-7c0-11-6-20-17-20s-17 9-17 20z',
  bun: 'M29 44C28 25 39 17 50 17s22 8 21 27c-3-8-11-13-21-13s-18 5-21 13z',
}

const HAIR_FRONT: Record<AvatarLook['hairStyle'], string> = {
  short: 'M29 43C28 24 39 17 50 17c12 0 22 8 21 26-3-8-11-13-21-13s-18 5-21 13z',
  bob: 'M31 40c3-7 10-11 19-11 10 0 16 4 19 11-6-3-12-5-19-5s-13 2-19 5z',
  long: 'M31 40c3-7 10-11 19-11 10 0 16 4 19 11-6-3-12-5-19-5s-13 2-19 5z',
  bun: 'M31 40c3-7 10-11 19-11 10 0 16 4 19 11-6-3-12-5-19-5s-13 2-19 5z',
  cap: '',
  spiky: 'M29 43l2-17 6 5 4-12 5 8 5-11 4 11 6-8 2 11 6-5 2 18c-5-9-13-13-21-13s-16 4-21 13z',
}

export function Avatar({ look, mood = 'neutral', size = 64, className, label }: Props) {
  const { skin, hair, hairStyle, shirt, accessory = 'none' } = look
  const mouth =
    mood === 'happy' ? 'M42.5 55q7.5 7 15 0' : mood === 'worried' ? 'M44 58q6-5 12 0' : 'M44 56q6 3 12 0'
  return (
    <svg
      viewBox="0 0 100 100"
      width={size}
      height={size}
      className={className}
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
    >
      {hairStyle === 'long' && (
        <path d="M25 46C25 25 37 15 50 15s25 10 25 31l2 30H64V46c-2-9-7-14-14-14s-12 5-14 14v30H23z" fill={hair} />
      )}
      {HAIR_BACK[hairStyle] && <path d={HAIR_BACK[hairStyle]} fill={hair} />}
      {hairStyle === 'bun' && <circle cx="50" cy="13" r="8" fill={hair} />}
      <path d="M17 100c0-20 15-29 33-29s33 9 33 29z" fill={shirt} />
      <path d="M40 71q10 9 20 0" fill="none" stroke="rgb(0 0 0 / 12%)" strokeWidth="2" />
      <rect x="44" y="58" width="12" height="15" rx="4" fill={skin} />
      <ellipse cx="30.5" cy="47" rx="4" ry="5.5" fill={skin} />
      <ellipse cx="69.5" cy="47" rx="4" ry="5.5" fill={skin} />
      <ellipse cx="50" cy="45" rx="20" ry="22" fill={skin} />
      {HAIR_FRONT[hairStyle] && <path d={HAIR_FRONT[hairStyle]} fill={hair} />}
      {hairStyle === 'cap' && (
        <g>
          <path d="M29 41c0-15 9-23 21-23s21 8 21 23z" fill={shirt} />
          <path d="M29 41h50a3 3 0 0 1 0 6H29z" fill={shirt} />
          <path d="M29 41h42" stroke="rgb(255 255 255 / 45%)" strokeWidth="2" />
          <circle cx="50" cy="29" r="3.5" fill="#e8bd6a" />
        </g>
      )}
      {mood === 'worried' ? (
        <g stroke="#3a2c25" strokeWidth="2" strokeLinecap="round">
          <path d="M37 38l7 2M63 38l-7 2" />
        </g>
      ) : (
        <g stroke="#3a2c25" strokeWidth="2" strokeLinecap="round" opacity=".7">
          <path d="M37 39q4-2 8 0M55 39q4-2 8 0" fill="none" />
        </g>
      )}
      <circle cx="42" cy="46.5" r="2.6" fill="#2b2420" />
      <circle cx="58" cy="46.5" r="2.6" fill="#2b2420" />
      <ellipse cx="36" cy="53" rx="4" ry="2.3" fill="#f08f7f" opacity=".35" />
      <ellipse cx="64" cy="53" rx="4" ry="2.3" fill="#f08f7f" opacity=".35" />
      <path d={mouth} fill="none" stroke="#6b3b2f" strokeWidth="2.2" strokeLinecap="round" />
      {accessory === 'glasses' && (
        <g fill="none" stroke="#3a3a3a" strokeWidth="1.8">
          <circle cx="42" cy="46.5" r="6.5" />
          <circle cx="58" cy="46.5" r="6.5" />
          <path d="M48.5 46h3" />
        </g>
      )}
      {accessory === 'camera' && (
        <g>
          <path d="M34 73l24 18" stroke="#2b2b2b" strokeWidth="2" />
          <rect x="55" y="82" width="20" height="13" rx="3" fill="#2f3337" />
          <circle cx="65" cy="88.5" r="4" fill="#8fb7c9" stroke="#1d1f22" strokeWidth="1.5" />
        </g>
      )}
      {accessory === 'headset' && (
        <g fill="none" stroke="#2f3337" strokeWidth="3" strokeLinecap="round">
          <path d="M28 47a22 22 0 0 1 44 0" />
          <path d="M71 50q0 10-12 11" strokeWidth="2" />
        </g>
      )}
    </svg>
  )
}
