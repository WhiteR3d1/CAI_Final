import type { SVGProps } from 'react'

const circ = (cx: number, cy: number, r: number) => `M${cx - r} ${cy}a${r} ${r} 0 1 0 ${2 * r} 0a${r} ${r} 0 1 0 ${-2 * r} 0`

const PATHS = {
  home: 'M3 11l9-7 9 7v9a1 1 0 0 1-1 1h-5v-6H9v6H4a1 1 0 0 1-1-1z',
  book: 'M3 5.5C5.5 4 8.5 4 12 6c3.5-2 6.5-2 9-.5V19c-2.5-1.5-5.5-1.5-9 .5-3.5-2-6.5-2-9-.5zM12 6v13.5',
  chart: 'M5 20v-7M12 20V5M19 20v-11M3 20h18',
  coin: `${circ(12, 12, 9)}${circ(12, 12, 5)}`,
  star: 'M12 3l2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9z',
  check: 'M5 12.5l4.2 4.2L19 7',
  x: 'M6 6l12 12M18 6L6 18',
  alert: 'M12 3.5l9.5 17h-19zM12 10v4.5M12 17.5v.01',
  info: `${circ(12, 12, 9)}M12 11v6M12 7.5v.01`,
  bulb: 'M9 18h6M10 21h4M12 3a6 6 0 0 0-3.5 10.9c.6.5 1 1.2 1 2V17h5v-1.1c0-.8.4-1.5 1-2A6 6 0 0 0 12 3z',
  pin: 'M9 3h6M10 3v5l-3 4h10l-3-4V3M12 12v9',
  clipboard: 'M9 3.5h6v3H9zM8 5H6a1 1 0 0 0-1 1v14a1 1 0 0 0 1 1h12a1 1 0 0 0 1-1V6a1 1 0 0 0-1-1h-2M8 12h8M8 16h5',
  arrowLeft: 'M19 12H5M11 6l-6 6 6 6',
  arrowRight: 'M5 12h14M13 6l6 6-6 6',
  chevronRight: 'M9 6l6 6-6 6',
  chevronLeft: 'M15 6l-6 6 6 6',
  chevronDown: 'M6 9l6 6 6-6',
  chevronUp: 'M6 15l6-6 6 6',
  lock: 'M6 11h12v9H6zM8.5 11V8a3.5 3.5 0 0 1 7 0v3',
  wrench: 'M14.5 5.5a4 4 0 0 0-5 5L4 16l4 4 5.5-5.5a4 4 0 0 0 5-5l-2.5 2.5-2.5-.5-.5-2.5z',
  user: `${circ(12, 8, 4)}M4 21a8 8 0 0 1 16 0`,
  users: `${circ(9, 8, 3.5)}M2.5 20a6.5 6.5 0 0 1 13 0${circ(17, 9, 2.8)}M16 13.5a5.5 5.5 0 0 1 6 5.5`,
  folder: 'M3 7a1 1 0 0 1 1-1h5l2 2h9a1 1 0 0 1 1 1v9a1 1 0 0 1-1 1H4a1 1 0 0 1-1-1z',
  drive: 'M3 6h18v12H3zM3 13h18M16.5 15.5h1.5',
  usb: 'M9 3h6v6H9zM7 9h10v7a5 5 0 0 1-10 0zM10.5 5.5v1M13.5 5.5v1',
  file: 'M6 3h8l4 4v14H6zM14 3v4h4',
  zip: 'M6 3h8l4 4v14H6zM14 3v4h4M11 4v2M13 6v2M11 8v2M13 10v2M10.5 14h3v3h-3z',
  app: 'M3 5h18v14H3zM3 9h18M6 7h.01M8.5 7h.01',
  disc: `${circ(12, 12, 9)}${circ(12, 12, 2.5)}`,
  image: 'M4 5h16v14H4zM4 16l5-5 4 4 3-3 4 4M15 9.5h.01',
  gear: `${circ(12, 12, 3.2)}M12 2.5v3M12 18.5v3M4.9 4.9L7 7M17 17l2.1 2.1M2.5 12h3M18.5 12h3M4.9 19.1L7 17M17 7l2.1-2.1`,
  speaker: 'M4 9h4l5-4v14l-5-4H4zM16 9.5a3.5 3.5 0 0 1 0 5M18.5 7a7 7 0 0 1 0 10',
  speakerX: 'M4 9h4l5-4v14l-5-4H4zM16 9.5l5 5M21 9.5l-5 5',
  wifi: 'M2 8.5a15 15 0 0 1 20 0M5 12a10 10 0 0 1 14 0M8.5 15.5a5 5 0 0 1 7 0M12 19h.01',
  search: `${circ(11, 11, 6.5)}M16 16l5 5`,
  start: 'M3 3h8v8H3zM13 3h8v8h-8zM3 13h8v8H3zM13 13h8v8h-8z',
  power: 'M12 3v9M6.3 6.3a8 8 0 1 0 11.4 0',
  monitor: 'M3 4h18v12H3zM8 20h8M12 16v4',
  cpu: 'M7 7h10v10H7zM10 10h4v4h-4zM9 3v4M15 3v4M9 17v4M15 17v4M3 9h4M3 15h4M17 9h4M17 15h4',
  globe: `${circ(12, 12, 9)}M3 12h18M12 3a14 14 0 0 1 0 18M12 3a14 14 0 0 0 0 18`,
  download: 'M12 3v12M7 10l5 5 5-5M4 19h16',
  refresh: 'M20 11a8 8 0 0 0-14.9-3.5M4 4v4h4M4 13a8 8 0 0 0 14.9 3.5M20 20v-4h-4',
  play: 'M7 4.5l12.5 7.5L7 19.5z',
  shield: 'M12 3l8 3v6c0 5-3.5 8-8 9-4.5-1-8-4-8-9V6z',
  sparkle: 'M12 3l1.8 5.2L19 10l-5.2 1.8L12 17l-1.8-5.2L5 10l5.2-1.8z',
  clock: `${circ(12, 12, 9)}M12 7v5l3 2`,
  mic: 'M12 3a3 3 0 0 1 3 3v6a3 3 0 0 1-6 0V6a3 3 0 0 1 3-3zM5 11a7 7 0 0 0 14 0M12 18v3',
  video: 'M3 6h12v12H3zM15 10l6-3v10l-6-3',
  menu: 'M4 6h16M4 12h16M4 18h16',
  keyboard: 'M3 6h18v12H3zM7 10h.01M11 10h.01M15 10h.01M7 14h10',
  eye: `M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7S2 12 2 12z${circ(12, 12, 3)}`,
  trash: 'M4 7h16M9 7V4h6v3M6 7l1 13h10l1-13',
  external: 'M14 4h6v6M20 4l-9 9M18 14v5a1 1 0 0 1-1 1H5a1 1 0 0 1-1-1V7a1 1 0 0 1 1-1h5',
  copy: 'M8 8h12v12H8zM4 16V4h12',
  bell: 'M5 19h14M7 19v-5a5 5 0 0 1 10 0v5M12 6V4',
  chat: 'M4 5h16v11H9l-5 4z',
  bag: 'M5 8h14l-1 12H6zM9 8V6a3 3 0 0 1 6 0v2',
  hdd: 'M4 4h16v16H4zM4 15h16M7 18h.01M10 18h.01',
  sound: 'M4 9h4l5-4v14l-5-4H4z',
  volume: 'M4 9h4l5-4v14l-5-4H4zM16 9.5a3.5 3.5 0 0 1 0 5',
  flag: 'M5 21V4h11l-2 4 2 4H5',
  target: `${circ(12, 12, 9)}${circ(12, 12, 5)}${circ(12, 12, 1)}`,
} as const

export type IconName = keyof typeof PATHS

type Props = Omit<SVGProps<SVGSVGElement>, 'name'> & {
  name: IconName
  size?: number
  filled?: boolean
  label?: string
}

export function Icon({ name, size = 20, filled = false, label, ...rest }: Props) {
  const solid = filled || name === 'start'
  return (
    <svg
      viewBox="0 0 24 24"
      width={size}
      height={size}
      fill={solid ? 'currentColor' : 'none'}
      stroke="currentColor"
      strokeWidth={solid ? 1.2 : 1.8}
      strokeLinecap="round"
      strokeLinejoin="round"
      role={label ? 'img' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : true}
      focusable="false"
      {...rest}
    >
      <path d={PATHS[name]} />
    </svg>
  )
}
