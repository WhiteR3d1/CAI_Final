import { Avatar } from '../components/Avatar'
import { MENTOR } from '../data/people'
import type { Person } from '../game/types'

interface Props {
  owned: string[]
  customer?: Person
  onCustomer?: () => void
  onBoard: () => void
  onManual: () => void
}

function BackLayer({ owned }: { owned: string[] }) {
  const has = (id: string) => owned.includes(id)
  return (
    <svg className="scene-layer" viewBox="0 0 1000 460" aria-hidden>
      <defs>
        <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe5ea" />
          <stop offset="1" stopColor="#eef6ef" />
        </linearGradient>
        <pattern id="wallpaper" width="44" height="44" patternUnits="userSpaceOnUse">
          <rect width="44" height="44" fill="#dfe8d5" />
          <circle cx="22" cy="22" r="1.6" fill="#cfdcc3" />
        </pattern>
        <radialGradient id="glow" cx=".5" cy=".5" r=".5">
          <stop offset="0" stopColor="#ff9fb0" stopOpacity=".9" />
          <stop offset="1" stopColor="#ff9fb0" stopOpacity="0" />
        </radialGradient>
      </defs>
      <rect width="1000" height="300" fill="url(#wallpaper)" />
      <rect y="296" width="1000" height="48" fill="#c8d7bc" />
      <rect y="296" width="1000" height="6" fill="#b2c4a5" />
      <rect y="344" width="1000" height="116" fill="#e6d6b4" />
      <g stroke="#d4c29c" strokeWidth="2">
        <path d="M0 372H1000M0 404H1000M0 436H1000" />
        <path d="M120 344v28M420 372v32M760 344v28M260 404v32M600 404v32M900 372v32" />
      </g>

      {/* window */}
      <rect x="52" y="58" width="196" height="182" rx="6" fill="#f8f4e3" />
      <rect x="66" y="72" width="168" height="154" fill="url(#sky)" />
      <path d="M66 190q40-34 84-10t84-8v54H66z" fill="#b9d3a8" />
      <path d="M66 206q52-22 100 0t68-8v28H66z" fill="#a3c493" />
      <circle cx="198" cy="104" r="15" fill="#fff6d6" />
      <path d="M150 72v154M66 149h168" stroke="#f8f4e3" strokeWidth="8" />
      <rect x="42" y="238" width="216" height="12" rx="3" fill="#efe8d2" />
      <g transform="translate(88 244)">
        <path d="M6 0h28l-3 20H9z" fill="#c07f5f" />
        <path d="M20 0c-10-12-18-8-20-18 10 0 16 6 20 14 2-12 10-18 18-18-2 10-8 16-18 22z" fill="#5f8a55" />
      </g>
      {has('neon') && (
        <g>
          <ellipse cx="150" cy="118" rx="70" ry="30" fill="url(#glow)" />
          <rect x="102" y="100" width="96" height="36" rx="18" fill="none" stroke="#ff6f86" strokeWidth="4" />
          <text x="150" y="126" textAnchor="middle" fontFamily="Mitr, sans-serif" fontSize="22" fill="#ff5f79" letterSpacing="3">
            OPEN
          </text>
        </g>
      )}

      {/* hanging sign */}
      <path d="M430 0v30M570 0v30" stroke="#8a9b82" strokeWidth="3" />
      <rect x="392" y="28" width="216" height="54" rx="14" fill="#193d35" />
      <text x="500" y="64" textAnchor="middle" fontFamily="Mitr, sans-serif" fontSize="25" fill="#e8bd6a" letterSpacing="1">
        BOOT &amp; BLOOM
      </text>

      {/* job board */}
      <rect x="276" y="104" width="178" height="132" rx="8" fill="#a8825a" />
      <rect x="286" y="114" width="158" height="112" rx="4" fill="#d9b47f" />
      <g>
        <rect x="298" y="126" width="46" height="56" fill="#fffaf0" transform="rotate(-6 321 154)" />
        <rect x="354" y="122" width="46" height="60" fill="#f4f7ee" transform="rotate(4 377 152)" />
        <rect x="392" y="162" width="42" height="50" fill="#fff2d8" transform="rotate(-3 413 187)" />
        <rect x="306" y="186" width="54" height="30" fill="#eaf1f7" transform="rotate(3 333 201)" />
        <circle cx="321" cy="130" r="4" fill="#c0503e" />
        <circle cx="377" cy="126" r="4" fill="#2f6682" />
        <circle cx="413" cy="166" r="4" fill="#e8bd6a" />
        <circle cx="333" cy="190" r="4" fill="#3f7a5e" />
      </g>

      {has('poster') && (
        <g transform="rotate(-3 525 160)">
          <rect x="482" y="104" width="86" height="112" rx="3" fill="#fbf6e6" />
          <rect x="482" y="104" width="86" height="26" fill="#2f5e4b" />
          <text x="525" y="122" textAnchor="middle" fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="#fffdf3">
            BOOT ORDER
          </text>
          <g fontFamily="IBM Plex Mono, monospace" fontSize="11" fill="#2f5e4b">
            <text x="492" y="150">1 USB</text>
            <text x="492" y="170">2 HDD</text>
            <text x="492" y="190">3 F10 ✓</text>
          </g>
          <rect x="500" y="98" width="22" height="10" fill="#f2dfa8" opacity=".85" />
        </g>
      )}

      {/* shelf with manuals */}
      <rect x="700" y="150" width="236" height="10" rx="2" fill="#a8825a" />
      <path d="M720 160l14 20M916 160l-14 20" stroke="#8a6a47" strokeWidth="5" />
      <g>
        <rect x="716" y="100" width="18" height="50" rx="2" fill="#2f5e4b" />
        <rect x="736" y="94" width="16" height="56" rx="2" fill="#c07f5f" />
        <rect x="754" y="104" width="20" height="46" rx="2" fill="#e8bd6a" />
        <rect x="776" y="98" width="14" height="52" rx="2" fill="#3d6f8e" />
        <rect x="792" y="108" width="20" height="42" rx="2" fill="#7d6aa8" transform="rotate(-10 802 129)" />
      </g>
      <rect x="840" y="118" width="40" height="32" rx="3" fill="#cfbf9c" />
      <rect x="846" y="124" width="28" height="4" fill="#b7a57f" />
      <g transform="translate(890 112)">
        <path d="M4 12h22l-3 26H7z" fill="#c07f5f" />
        <circle cx="15" cy="6" r="10" fill="#6c9660" />
        <circle cx="8" cy="10" r="6" fill="#7eaa70" />
      </g>

      {has('fern') && (
        <g>
          <path d="M620 0v58" stroke="#8a9b82" strokeWidth="2" />
          <path d="M604 58h32l-4 22h-24z" fill="#c9926c" />
          <g fill="#5f8a55">
            <path d="M606 62c-16 10-22 30-20 50 8-16 14-30 22-44z" />
            <path d="M634 62c16 10 22 30 20 50-8-16-14-30-22-44z" />
            <path d="M618 62c-4 16-2 34 4 48 2-16 2-32-2-48z" />
            <path d="M612 60c-18-2-30 6-36 18 14-4 26-8 36-14z" />
            <path d="M628 60c18-2 30 6 36 18-14-4-26-8-36-14z" />
          </g>
        </g>
      )}
    </svg>
  )
}

function FrontLayer({ owned }: { owned: string[] }) {
  const has = (id: string) => owned.includes(id)
  return (
    <svg className="scene-layer scene-front" viewBox="0 0 1000 460" aria-hidden>
      {/* counter */}
      <rect x="246" y="268" width="360" height="22" rx="5" fill="#7e5f3f" />
      <rect x="258" y="290" width="336" height="118" fill="#b48c5f" />
      <g fill="#c39b6d">
        <rect x="274" y="304" width="92" height="88" rx="6" />
        <rect x="380" y="304" width="92" height="88" rx="6" />
        <rect x="486" y="304" width="92" height="88" rx="6" />
      </g>
      <rect x="258" y="404" width="336" height="10" fill="#8f6b46" />
      <g transform="translate(548 246)">
        <rect x="0" y="18" width="34" height="6" rx="3" fill="#6d6d6d" />
        <path d="M3 18a14 14 0 0 1 28 0z" fill="#e8bd6a" />
        <circle cx="17" cy="3" r="3" fill="#c9923a" />
      </g>
      <g transform="translate(262 238)">
        <rect x="0" y="0" width="64" height="30" rx="4" fill="#fffdf3" stroke="#cdd8c6" />
        <text x="32" y="20" textAnchor="middle" fontFamily="IBM Plex Sans Thai, sans-serif" fontSize="13" fill="#2f5e4b">
          รับซ่อม
        </text>
      </g>

      {has('cat') && (
        <g transform="translate(352 236)">
          <ellipse cx="34" cy="26" rx="30" ry="12" fill="#d99c5f" />
          <path d="M60 26q18-2 12-18" fill="none" stroke="#d99c5f" strokeWidth="6" strokeLinecap="round" />
          <circle cx="12" cy="20" r="12" fill="#e2a86b" />
          <path d="M3 12l2-12 8 8zM14 8l8-8 2 12z" fill="#e2a86b" />
          <path d="M6 21q3 2 6 0M14 21q3 2 6 0" stroke="#5a3a2a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M26 20q8 6 16 0M40 22q6 5 12 0" stroke="#c1864f" strokeWidth="2" fill="none" />
          <text x="-2" y="-6" fontFamily="Mitr, sans-serif" fontSize="14" fill="#6f8179">
            z z
          </text>
        </g>
      )}

      {/* workbench */}
      <rect x="640" y="302" width="330" height="16" rx="4" fill="#a8825a" />
      <rect x="652" y="318" width="12" height="96" fill="#8a6a47" />
      <rect x="946" y="318" width="12" height="96" fill="#8a6a47" />
      <rect x="664" y="360" width="282" height="8" fill="#8a6a47" />
      <g>
        <rect x="770" y="202" width="128" height="86" rx="7" fill="#2f3d38" />
        <rect x="778" y="210" width="112" height="70" rx="3" fill="#bfe0cc" />
        <g stroke="#2f5e4b" strokeWidth="4" strokeLinecap="round" opacity=".7">
          <path d="M788 224h40M788 238h64M788 252h30M788 266h52" />
        </g>
        <rect x="826" y="288" width="16" height="10" fill="#2f3d38" />
        <rect x="806" y="296" width="56" height="6" rx="3" fill="#2f3d38" />
        <rect x="910" y="226" width="42" height="76" rx="5" fill="#46574f" />
        <circle cx="931" cy="244" r="4" fill="#8fdcaa" />
        <path d="M918 262h26M918 272h26" stroke="#5c6f66" strokeWidth="3" />
        <path d="M700 300l6-8h64l6 8z" fill="#e9e3c8" />
      </g>
      {has('lamp') && (
        <g>
          <polygon points="790,210 810,214 905,302 772,302" fill="#ffe7a6" opacity=".3" />
          <path d="M748 302h26" stroke="#3a4a43" strokeWidth="6" strokeLinecap="round" />
          <path d="M761 300l-4-58 30-40" fill="none" stroke="#3a4a43" strokeWidth="5" strokeLinecap="round" />
          <path d="M776 194l36 8-18 18z" fill="#e8bd6a" />
        </g>
      )}
    </svg>
  )
}

export function ShopScene({ owned, customer, onCustomer, onBoard, onManual }: Props) {
  return (
    <div className="scene" role="group" aria-label="ภายในร้าน Boot & Bloom">
      <BackLayer owned={owned} />
      {customer && (
        <div className="scene-person scene-customer">
          <Avatar look={customer.look} mood="worried" size={120} />
        </div>
      )}
      <div className="scene-person scene-mentor">
        <Avatar look={MENTOR.look} mood="happy" size={110} />
      </div>
      <FrontLayer owned={owned} />

      <button type="button" className="hotspot hotspot-board" onClick={onBoard}>
        <span>กระดานงาน</span>
      </button>
      <button type="button" className="hotspot hotspot-manual" onClick={onManual}>
        <span>คู่มือช่าง</span>
      </button>
      {customer && onCustomer && (
        <button type="button" className="hotspot hotspot-customer" onClick={onCustomer}>
          <span className="hotspot-alert" aria-hidden>
            !
          </span>
          <span>{customer.name} รออยู่ · รับงาน</span>
        </button>
      )}
    </div>
  )
}
