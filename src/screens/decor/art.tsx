// Our own SVG drawings for every shop decoration (no images from the book or content sheets).
// Placeable items are drawn around their anchor: (0, 0) is the bottom-centre and the item extends up (negative y).
import type { ReactNode } from 'react'
import { DECOR_BY_ID } from '../../data/decor'

const MONO = 'IBM Plex Mono, Consolas, monospace'
const DISPLAY = 'Mitr, Tahoma, sans-serif'
const RAINBOW = ['#ff6f86', '#f2c94c', '#7eaa70', '#6fb7e0', '#b39ddb']

function Poster({ head, color, children, tilt = 0 }: { head: string; color: string; children: ReactNode; tilt?: number }) {
  return (
    <g transform={tilt ? `rotate(${tilt} 0 -60)` : undefined}>
      <rect x="-45" y="-120" width="90" height="120" rx="3" fill="#fbf6e6" />
      <rect x="-45" y="-120" width="90" height="26" fill={color} />
      <text x="0" y="-102" textAnchor="middle" fontFamily={MONO} fontSize={head.length > 11 ? 8.5 : 11} fill="#fffdf3">
        {head}
      </text>
      <g fontFamily={MONO} fontSize="10" fill={color}>
        {children}
      </g>
      <rect x="-12" y="-125" width="24" height="10" fill="#f2dfa8" opacity=".85" />
    </g>
  )
}

function Lines({ rows, x = -36, y0 = -78, step = 15 }: { rows: string[]; x?: number; y0?: number; step?: number }) {
  return (
    <>
      {rows.map((r, i) => (
        <text key={r} x={x} y={y0 + i * step}>
          {r}
        </text>
      ))}
    </>
  )
}

/** a point on the curve used by the fairy lights and the bunting */
function sag(x: number, half: number, top: number, dip: number) {
  const t = (x + half) / (half * 2)
  return (1 - t) * (1 - t) * top + 2 * (1 - t) * t * dip + t * t * top
}

export function ItemArt({ id }: { id: string }) {
  switch (id) {
    case 'fern':
      return (
        <g>
          <path d="M-16 -54h32l-4 22h-24z" fill="#c9926c" />
          <g fill="#5f8a55">
            <path d="M-14 -50c-16 10-22 30-20 50 8-16 14-30 22-44z" />
            <path d="M14 -50c16 10 22 30 20 50-8-16-14-30-22-44z" />
            <path d="M-2 -50c-4 16-2 34 4 48 2-16 2-32-2-48z" />
            <path d="M-8 -52c-18-2-30 6-36 18 14-4 26-8 36-14z" />
            <path d="M8 -52c18-2 30 6 36 18-14-4-26-8-36-14z" />
          </g>
        </g>
      )
    case 'cactus':
      return (
        <g>
          <rect x="-5" y="-34" width="10" height="22" rx="5" fill="#6c9660" />
          <rect x="-12" y="-28" width="6" height="11" rx="3" fill="#6c9660" />
          <rect x="6" y="-31" width="6" height="12" rx="3" fill="#7eaa70" />
          <circle cx="0" cy="-34" r="3" fill="#ff9fb0" />
          <rect x="-12" y="-16" width="24" height="4" rx="1" fill="#b06f50" />
          <path d="M-11 -12h22l-3 12h-16z" fill="#c07f5f" />
        </g>
      )
    case 'monstera':
      return (
        <g>
          <g stroke="#4f7a47" strokeWidth="3" fill="none" strokeLinecap="round">
            <path d="M0 -40q-6-30-22-48" />
            <path d="M0 -40q4-34 20-58" />
            <path d="M0 -40q0-34-2-66" />
          </g>
          <ellipse cx="-24" cy="-88" rx="20" ry="12" transform="rotate(-30 -24 -88)" fill="#5f8a55" />
          <ellipse cx="22" cy="-98" rx="20" ry="12" transform="rotate(25 22 -98)" fill="#5f8a55" />
          <ellipse cx="-2" cy="-106" rx="14" ry="11" fill="#6c9660" />
          <g stroke="#dfe8d5" strokeWidth="2">
            <path d="M-34 -92l8 5M-24 -80l6-6M14 -104l6 6M26 -92l-4 7M-6 -110l6 4" />
          </g>
          <rect x="-25" y="-42" width="50" height="6" rx="2" fill="#d4c29c" />
          <path d="M-24 -38h48l-6 38h-36z" fill="#e9e3c8" />
        </g>
      )
    case 'sunflower':
      return (
        <g>
          <path d="M0 -30v-56" stroke="#4f7a47" strokeWidth="3" />
          <ellipse cx="-8" cy="-50" rx="9" ry="4" transform="rotate(-30 -8 -50)" fill="#6c9660" />
          <ellipse cx="8" cy="-62" rx="9" ry="4" transform="rotate(30 8 -62)" fill="#6c9660" />
          {[0, 45, 90, 135, 180, 225, 270, 315].map(a => (
            <ellipse key={a} cx="0" cy="-99" rx="4.5" ry="8" transform={`rotate(${a} 0 -88)`} fill="#f2c94c" />
          ))}
          <circle cx="0" cy="-88" r="7" fill="#8a5a2b" />
          <path d="M-16 -30h32l-4 30h-24z" fill="#c07f5f" />
        </g>
      )
    case 'bonsai':
      return (
        <g>
          <path d="M-2 -8q-8-12 2-20q8-6 0-14" stroke="#8a6a47" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="-12" cy="-30" rx="12" ry="7" fill="#5f8a55" />
          <ellipse cx="10" cy="-36" rx="14" ry="8" fill="#6c9660" />
          <ellipse cx="0" cy="-41" rx="10" ry="5" fill="#7eaa70" />
          <rect x="-26" y="-8" width="52" height="8" rx="2" fill="#2f5e4b" />
        </g>
      )
    case 'planter':
      return (
        <g>
          <path d="M-40 -8l10 8M40 -8l-10 8" stroke="#8a6a47" strokeWidth="3" />
          <rect x="-50" y="-14" width="100" height="6" rx="2" fill="#a8825a" />
          {[-30, 0, 30].map((x, i) => (
            <g key={x}>
              <ellipse cx={x - 5} cy="-38" rx="6" ry="3" fill="#6c9660" transform={`rotate(-30 ${x - 5} -38)`} />
              <circle cx={x} cy="-46" r="7" fill={['#ff9fb0', '#f2c94c', '#b39ddb'][i]} />
              <circle cx={x} cy="-46" r="2.5" fill="#fff6d6" />
              <path d={`M${x - 10} -34h20l-3 20h-14z`} fill="#c07f5f" />
            </g>
          ))}
        </g>
      )
    case 'palm':
      return (
        <g>
          <path d="M0 -34q4-50-2-96" stroke="#a8825a" strokeWidth="6" fill="none" />
          <g fill="#5f8a55">
            <path d="M-2 -130q-30-10-44 10q20-4 44-10z" />
            <path d="M-2 -130q30-12 44 8q-22-2-44-8z" />
            <path d="M-2 -130q-14-24-36-20q16 6 36 20z" />
            <path d="M-2 -130q16-24 36-18q-16 4-36 18z" />
          </g>
          <path d="M-2 -130q-4-16 4-20q2 10-4 20z" fill="#6c9660" />
          <path d="M-20 -34h40l-5 34h-30z" fill="#2f5e4b" />
        </g>
      )
    case 'lamp':
      return (
        <g>
          <polygon points="10,-92 30,-88 125,0 -8,0" fill="#ffe7a6" opacity=".3" />
          <path d="M-32 0h26" stroke="#3a4a43" strokeWidth="6" strokeLinecap="round" />
          <path d="M-19 -2l-4-58 30-40" fill="none" stroke="#3a4a43" strokeWidth="5" strokeLinecap="round" />
          <path d="M-4 -108l36 8-18 18z" fill="#e8bd6a" />
        </g>
      )
    case 'neon':
      return (
        <g>
          <ellipse cx="0" cy="-30" rx="70" ry="30" fill="#ff9fb0" opacity=".25" />
          <ellipse cx="0" cy="-30" rx="52" ry="20" fill="#ff9fb0" opacity=".3" />
          <rect x="-48" y="-48" width="96" height="36" rx="18" fill="none" stroke="#ff6f86" strokeWidth="4" />
          <text x="0" y="-22" textAnchor="middle" fontFamily={DISPLAY} fontSize="22" fill="#ff5f79" letterSpacing="3">
            OPEN
          </text>
        </g>
      )
    case 'pendant':
      return (
        <g>
          <ellipse cx="0" cy="4" rx="26" ry="10" fill="#fff1b8" opacity=".5" />
          <rect x="-4" y="-48" width="8" height="10" fill="#3a4a43" />
          <path d="M-22 -6q0-30 22-34q22 4 22 34z" fill="#e8bd6a" />
          <ellipse cx="0" cy="-6" rx="22" ry="5" fill="#c9923a" />
          <circle cx="0" cy="-2" r="6" fill="#fff6d6" />
        </g>
      )
    case 'fairy': {
      const bulbs = [-108, -84, -60, -36, -12, 12, 36, 60, 84, 108]
      return (
        <g>
          <path d="M-120 -34Q-60 2 0 -30Q60 2 120 -34" stroke="#3a4a43" strokeWidth="2" fill="none" />
          {bulbs.map((x, i) => {
            const y = (x < 0 ? sag(x + 60, 60, -34, 2) : sag(x - 60, 60, -30, 2)) + 5
            const c = RAINBOW[i % RAINBOW.length]
            return (
              <g key={x}>
                <circle cx={x} cy={y} r="9" fill={c} opacity=".25" />
                <circle cx={x} cy={y} r="4.5" fill={c} />
              </g>
            )
          })}
        </g>
      )
    }
    case 'floorlamp':
      return (
        <g>
          <path d="M-26 -118h52l18 46h-88z" fill="#fff1b8" opacity=".3" />
          <rect x="-2" y="-140" width="4" height="136" fill="#3a4a43" />
          <ellipse cx="0" cy="-4" rx="22" ry="5" fill="#3a4a43" />
          <path d="M-26 -118l8-42h36l8 42z" fill="#fbf6e6" stroke="#e2d6b5" strokeWidth="2" />
        </g>
      )
    case 'lava':
      return (
        <g>
          <path d="M-8 -12h16l-4-32h-8z" fill="#ff9f5a" opacity=".9" />
          <circle cx="0" cy="-22" r="4" fill="#ffd66b" />
          <circle cx="-1" cy="-34" r="3" fill="#ffd66b" />
          <path d="M-4 -44h8l-1-8h-6z" fill="#3a4a43" />
          <path d="M-10 0h20l-4-12h-12z" fill="#3a4a43" />
        </g>
      )
    case 'poster':
      return (
        <Poster head="BOOT ORDER" color="#2f5e4b" tilt={-3}>
          <Lines rows={['1 USB', '2 HDD', '3 F10 ✓']} x={-35} y0={-74} step={20} />
        </Poster>
      )
    case 'poster-win11':
      return (
        <Poster head="WINDOWS 11" color="#3d6f8e" tilt={2}>
          <Lines rows={['CPU 64-bit', '2 cores+', 'RAM 4 GB', 'DISK 64 GB', 'TPM 2.0 ✓']} y0={-80} step={15} />
        </Poster>
      )
    case 'poster-gpt':
      return (
        <Poster head="MBR vs GPT" color="#7d6aa8">
          <rect x="-36" y="-86" width="72" height="30" rx="4" fill="#efe9f8" />
          <rect x="-36" y="-48" width="72" height="30" rx="4" fill="#efe9f8" />
          <text x="0" y="-67" textAnchor="middle">BIOS → MBR</text>
          <text x="0" y="-29" textAnchor="middle">UEFI → GPT</text>
        </Poster>
      )
    case 'poster-uefi':
      return (
        <Poster head="UEFI CHECK" color="#c07f5f" tilt={-2}>
          <Lines rows={['UEFI    ✓', 'SecureBoot', '       ✓', 'TPM 2.0 ✓']} y0={-74} step={18} />
        </Poster>
      )
    case 'poster-backup':
      return (
        <Poster head="BACKUP FIRST" color="#c0504a" tilt={3}>
          <Lines rows={['1 COPY', '2 OPEN ✓', '3 THEN', '  WIPE']} y0={-74} step={18} />
        </Poster>
      )
    case 'poster-keys':
      return (
        <Poster head="FIRMWARE KEYS" color="#193d35">
          {[
            ['F2', -20, -68],
            ['DEL', 20, -68],
            ['F12', -20, -32],
            ['ESC', 20, -32],
          ].map(([k, x, y]) => (
            <g key={k as string}>
              <rect x={(x as number) - 16} y={(y as number) - 18} width="32" height="26" rx="5" fill="#e3ebe0" stroke="#193d35" />
              <text x={x as number} y={y as number} textAnchor="middle">
                {k}
              </text>
            </g>
          ))}
        </Poster>
      )
    case 'certificate':
      return (
        <g>
          <rect x="-48" y="-72" width="96" height="72" rx="3" fill="#c9923a" />
          <rect x="-42" y="-66" width="84" height="60" fill="#fffdf3" />
          <text x="0" y="-48" textAnchor="middle" fontFamily={DISPLAY} fontSize="11" fill="#2f5e4b" letterSpacing="1">
            CERTIFIED
          </text>
          <path d="M-30 -36h60M-30 -26h44" stroke="#cdd8c6" strokeWidth="3" />
          <path d="M22 -18l-4 14 8-4 8 4-4-14z" fill="#c0504a" />
          <circle cx="26" cy="-20" r="8" fill="#d9534f" />
        </g>
      )
    case 'clock':
      return (
        <g>
          <circle cx="0" cy="-27" r="25" fill="#fffdf3" stroke="#3a4a43" strokeWidth="4" />
          <g stroke="#3a4a43" strokeWidth="2">
            <path d="M0 -48v5M0 -11v5M-21 -27h5M16 -27h5" />
          </g>
          <path d="M0 -27v-15M0 -27l10 6" stroke="#3a4a43" strokeWidth="3" strokeLinecap="round" />
          <circle cx="0" cy="-27" r="2.5" fill="#c0504a" />
        </g>
      )
    case 'sofa':
      return (
        <g>
          <rect x="-80" y="-84" width="160" height="46" rx="14" fill="#c07f5f" />
          <rect x="-86" y="-48" width="172" height="28" rx="10" fill="#d39274" />
          <path d="M-28 -80v34M28 -80v34" stroke="#b06f50" strokeWidth="2" />
          <rect x="-92" y="-64" width="24" height="50" rx="10" fill="#b06f50" />
          <rect x="68" y="-64" width="24" height="50" rx="10" fill="#b06f50" />
          <rect x="-80" y="-14" width="6" height="14" fill="#6d4f35" />
          <rect x="74" y="-14" width="6" height="14" fill="#6d4f35" />
        </g>
      )
    case 'chair':
      return (
        <g>
          <path d="M-18 -34v34M18 -34v34" stroke="#8a6a47" strokeWidth="4" />
          <rect x="-18" y="-76" width="36" height="34" rx="6" fill="#a8825a" />
          <path d="M-8 -70v24M0 -70v24M8 -70v24" stroke="#8a6a47" strokeWidth="2" />
          <rect x="-22" y="-42" width="44" height="8" rx="3" fill="#c39b6d" />
        </g>
      )
    case 'rug':
      return (
        <g>
          <path d="M-110 0L110 0L96 -22L-96 -22z" fill="#c46a5a" />
          <path d="M-90 -4L90 -4L80 -18L-80 -18z" fill="none" stroke="#f2d3a0" strokeWidth="2" />
          <path d="M-40 -11h80M-60 -11l10-5M60 -11l-10-5" stroke="#f2d3a0" strokeWidth="2" />
          <path d="M-114 2l4-4M114 2l-4-4" stroke="#e7c48d" strokeWidth="2" />
        </g>
      )
    case 'coffee':
      return (
        <g>
          <rect x="-28" y="-28" width="5" height="28" fill="#6d4f35" />
          <rect x="23" y="-28" width="5" height="28" fill="#6d4f35" />
          <rect x="-35" y="-34" width="70" height="8" rx="3" fill="#8a6a47" />
          <path d="M-6 -48h14l-2 14h-10z" fill="#fffdf3" />
          <path d="M8 -45q6 0 5 5t-6 3" stroke="#fffdf3" strokeWidth="2" fill="none" />
          <path d="M-2 -54q-3-4 0-8M3 -54q-3-4 0-8" stroke="#cdd8c6" strokeWidth="1.5" fill="none" />
        </g>
      )
    case 'water':
      return (
        <g>
          <rect x="-14" y="-116" width="28" height="28" rx="8" fill="#9fd3f0" opacity=".9" />
          <rect x="-20" y="-90" width="40" height="90" rx="4" fill="#e9eef0" stroke="#cdd8c6" />
          <circle cx="-6" cy="-60" r="3.5" fill="#3d6f8e" />
          <circle cx="6" cy="-60" r="3.5" fill="#d9534f" />
          <rect x="-12" y="-46" width="24" height="4" fill="#b0bec5" />
        </g>
      )
    case 'display':
      return (
        <g>
          <rect x="-52" y="-150" width="104" height="150" rx="4" fill="#8a6a47" />
          <rect x="-46" y="-144" width="92" height="96" fill="#d8eef0" opacity=".9" />
          <path d="M-46 -112h92M-46 -80h92" stroke="#a8825a" strokeWidth="3" />
          <rect x="-38" y="-126" width="32" height="9" fill="#2f5e4b" />
          <path d="M-36 -117v3M-30 -117v3M-24 -117v3M-18 -117v3M-12 -117v3" stroke="#e8bd6a" strokeWidth="2" />
          <rect x="6" y="-132" width="30" height="19" rx="2" fill="#9aa5ab" />
          <circle cx="21" cy="-122" r="6" fill="#c7d0d4" />
          <rect x="-38" y="-100" width="44" height="15" rx="2" fill="#3a4a43" />
          <circle cx="-26" cy="-92" r="5" fill="#5c6f66" />
          <circle cx="-8" cy="-92" r="5" fill="#5c6f66" />
          <rect x="14" y="-102" width="24" height="16" rx="2" fill="#2f5e4b" />
          <rect x="-46" y="-42" width="92" height="36" fill="#a8825a" />
          <rect x="-6" y="-27" width="12" height="4" rx="2" fill="#e8bd6a" />
        </g>
      )
    case 'wallshelf':
      return (
        <g>
          <path d="M-46 -4l10 4M46 -4l-10 4" stroke="#8a6a47" strokeWidth="3" />
          <rect x="-54" y="-40" width="8" height="30" fill="#2f5e4b" />
          <rect x="-45" y="-44" width="9" height="34" fill="#c07f5f" />
          <rect x="-35" y="-36" width="8" height="26" fill="#e8bd6a" transform="rotate(8 -31 -23)" />
          <rect x="-16" y="-34" width="30" height="24" rx="2" fill="#cfbf9c" />
          <path d="M-16 -26h30" stroke="#b7a57f" strokeWidth="2" />
          <path d="M28 -10h18l-3 -12h-12z" fill="#c07f5f" />
          <circle cx="37" cy="-28" r="7" fill="#6c9660" />
          <rect x="-60" y="-10" width="120" height="6" rx="2" fill="#a8825a" />
        </g>
      )
    case 'retro':
      return (
        <g>
          <rect x="-24" y="-16" width="48" height="16" rx="3" fill="#d9d0b4" />
          <rect x="-10" y="-10" width="20" height="3" fill="#8a8a7a" />
          <rect x="-34" y="-66" width="68" height="50" rx="6" fill="#e9e3c8" />
          <rect x="-26" y="-60" width="52" height="36" rx="4" fill="#2f3d38" />
          <text x="-22" y="-46" fontFamily={MONO} fontSize="8" fill="#8fdcaa">
            C:\&gt;_
          </text>
          <path d="M-22 -38h30" stroke="#8fdcaa" strokeWidth="2" opacity=".6" />
        </g>
      )
    case 'usbjar':
      return (
        <g>
          {[
            [-8, -8, '#ff6f86', -20],
            [2, -14, '#6fb7e0', 15],
            [-4, -22, '#f2c94c', -5],
            [6, -6, '#7eaa70', 30],
          ].map(([x, y, c, r]) => (
            <rect key={c as string} x={x as number} y={y as number} width="8" height="13" rx="2" fill={c as string} transform={`rotate(${r} ${(x as number) + 4} ${(y as number) + 6})`} />
          ))}
          <rect x="-14" y="-32" width="28" height="32" rx="5" fill="#e3f2f7" opacity=".55" stroke="#b0d4de" strokeWidth="2" />
          <rect x="-12" y="-38" width="24" height="7" rx="2" fill="#c07f5f" />
        </g>
      )
    case 'rgbpc':
      return (
        <g>
          <rect x="-24" y="-76" width="48" height="76" rx="4" fill="#2f3d38" />
          <rect x="-18" y="-70" width="32" height="62" rx="3" fill="#1b2420" />
          <circle cx="-2" cy="-54" r="9" fill="none" stroke="#ff6f86" strokeWidth="3" />
          <circle cx="-2" cy="-26" r="9" fill="none" stroke="#6fb7e0" strokeWidth="3" />
          {RAINBOW.map((c, i) => (
            <rect key={c} x="17" y={-70 + i * 12.4} width="3" height="12.4" fill={c} />
          ))}
        </g>
      )
    case 'robot':
      return (
        <g>
          <rect x="-12" y="-6" width="8" height="6" fill="#3a4a43" />
          <rect x="4" y="-6" width="8" height="6" fill="#3a4a43" />
          <rect x="-14" y="-30" width="28" height="24" rx="5" fill="#b0bec5" />
          <rect x="-6" y="-24" width="12" height="8" rx="2" fill="#8fdcaa" />
          <path d="M14 -24l8-6" stroke="#b0bec5" strokeWidth="4" strokeLinecap="round" />
          <path d="M22 -30l6-9" stroke="#e8bd6a" strokeWidth="3" strokeLinecap="round" />
          <rect x="-11" y="-48" width="22" height="16" rx="5" fill="#cfd8dc" />
          <circle cx="-4" cy="-40" r="2.5" fill="#3d6f8e" />
          <circle cx="4" cy="-40" r="2.5" fill="#3d6f8e" />
          <path d="M0 -48v-2" stroke="#90a4ae" strokeWidth="2" />
          <circle cx="0" cy="-51" r="2.5" fill="#ff6f86" />
        </g>
      )
    case 'server':
      return (
        <g>
          <rect x="-37" y="-164" width="74" height="164" rx="4" fill="#2f3d38" />
          {[0, 1, 2, 3, 4, 5, 6].map(i => (
            <g key={i}>
              <rect x="-31" y={-156 + i * 21} width="62" height="16" rx="2" fill="#3a4a43" />
              <path d={`M-25 ${-148 + i * 21}h28`} stroke="#5c6f66" strokeWidth="2" />
              <circle cx="18" cy={-148 + i * 21} r="2.5" fill={i % 3 === 1 ? '#e8bd6a' : '#8fdcaa'} />
              <circle cx="25" cy={-148 + i * 21} r="2.5" fill="#8fdcaa" opacity={i % 2 ? 1 : 0.4} />
            </g>
          ))}
        </g>
      )
    case 'tvwall':
      return (
        <g>
          <rect x="-10" y="-8" width="20" height="8" fill="#3a4a43" />
          <rect x="-75" y="-92" width="150" height="86" rx="5" fill="#2f3d38" />
          <rect x="-69" y="-86" width="138" height="74" rx="2" fill="#2d6cb5" />
          <path d="M-60 -20q30-50 60-50t60 50z" fill="#5aa0e8" opacity=".8" />
          <path d="M-40 -20q20-34 40-34t40 34z" fill="#9cc8f5" opacity=".85" />
          <path d="M-20 -20q10-18 20-18t20 18z" fill="#dbeeff" />
        </g>
      )
    case 'arcade':
      return (
        <g>
          <path d="M-38 0V-130L-30 -176H30L38 -130V0Z" fill="#7d6aa8" />
          <rect x="-30" y="-170" width="60" height="16" fill="#f2c94c" />
          <text x="0" y="-158" textAnchor="middle" fontFamily={MONO} fontSize="11" fill="#5d4d8a">
            PLAY
          </text>
          <rect x="-28" y="-146" width="56" height="44" rx="3" fill="#1b2420" />
          <g fill="#8fdcaa">
            <rect x="-18" y="-136" width="6" height="5" />
            <rect x="-6" y="-136" width="6" height="5" />
            <rect x="6" y="-136" width="6" height="5" />
            <rect x="-12" y="-126" width="6" height="5" />
            <rect x="0" y="-126" width="6" height="5" />
          </g>
          <rect x="-4" y="-112" width="8" height="5" fill="#ff6f86" />
          <path d="M-38 -98h76l-6 16h-64z" fill="#5d4d8a" />
          <path d="M-16 -92v-8" stroke="#3a4a43" strokeWidth="3" />
          <circle cx="-16" cy="-101" r="4" fill="#d9534f" />
          <circle cx="8" cy="-90" r="3.5" fill="#f2c94c" />
          <circle cx="18" cy="-90" r="3.5" fill="#6fb7e0" />
          <rect x="-10" y="-56" width="20" height="18" rx="2" fill="#3a4a43" />
          <path d="M0 -52v8" stroke="#e8bd6a" strokeWidth="2" />
        </g>
      )
    case 'cat':
      return (
        <g transform="translate(-34 -36)">
          <ellipse cx="34" cy="26" rx="30" ry="12" fill="#d99c5f" />
          <path d="M60 26q18-2 12-18" fill="none" stroke="#d99c5f" strokeWidth="6" strokeLinecap="round" />
          <circle cx="12" cy="20" r="12" fill="#e2a86b" />
          <path d="M3 12l2-12 8 8zM14 8l8-8 2 12z" fill="#e2a86b" />
          <path d="M6 21q3 2 6 0M14 21q3 2 6 0" stroke="#5a3a2a" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <path d="M26 20q8 6 16 0M40 22q6 5 12 0" stroke="#c1864f" strokeWidth="2" fill="none" />
          <text x="-2" y="-6" fontFamily={DISPLAY} fontSize="14" fill="#6f8179">
            z z
          </text>
        </g>
      )
    case 'dog':
      return (
        <g>
          <path d="M36 -24q14-8 12-20" stroke="#c9a27a" strokeWidth="5" fill="none" strokeLinecap="round" />
          <ellipse cx="6" cy="-18" rx="34" ry="16" fill="#c9a27a" />
          <ellipse cx="-14" cy="-3" rx="9" ry="4" fill="#d9b38c" />
          <ellipse cx="22" cy="-3" rx="9" ry="4" fill="#d9b38c" />
          <circle cx="-30" cy="-28" r="15" fill="#d9b38c" />
          <path d="M-38 -40q-10 6-6 20q8-6 10-16z" fill="#8a6a47" />
          <ellipse cx="-42" cy="-24" rx="8" ry="5.5" fill="#efd9bd" />
          <circle cx="-48" cy="-25" r="2.6" fill="#3a2a20" />
          <path d="M-33 -31q3 2 6 0" stroke="#3a2a20" strokeWidth="1.6" fill="none" strokeLinecap="round" />
          <text x="-20" y="-50" fontFamily={DISPLAY} fontSize="12" fill="#6f8179">
            z
          </text>
        </g>
      )
    case 'fishtank':
      return (
        <g>
          <rect x="-40" y="-58" width="80" height="50" rx="3" fill="#bfe6f2" opacity=".9" stroke="#8fc3d3" strokeWidth="2" />
          <path d="M-38 -16q20-6 40 0t36 0v6h-76z" fill="#e8d9a8" />
          <path d="M-26 -12q-4-16 2-30M-20 -12q6-14 0-24M24 -12q-6-18 2-28" stroke="#5f8a55" strokeWidth="3" fill="none" />
          <g fill="#f29a4c">
            <ellipse cx="-6" cy="-36" rx="8" ry="5" />
            <path d="M2 -36l7-5v10z" />
            <ellipse cx="14" cy="-24" rx="6" ry="4" />
            <path d="M8 -24l-6-4v8z" />
          </g>
          <circle cx="-10" cy="-48" r="2" fill="#fff" opacity=".8" />
          <circle cx="-7" cy="-53" r="1.5" fill="#fff" opacity=".8" />
          <rect x="-42" y="-8" width="84" height="8" fill="#3a4a43" />
        </g>
      )
    case 'trophy':
      return (
        <g>
          <path d="M-14 -50q-10 0-8 10q2 6 8 6M14 -50q10 0 8 10q-2 6-8 6" stroke="#c9923a" strokeWidth="3" fill="none" />
          <path d="M-14 -56h28q0 22-14 26q-14-4-14-26z" fill="#e8bd6a" />
          <path d="M0 -51l2.4 5 5.4.6-4 3.7 1.1 5.3-4.9-2.7-4.9 2.7 1.1-5.3-4-3.7 5.4-.6z" fill="#fff3c9" />
          <rect x="-3" y="-30" width="6" height="12" fill="#c9923a" />
          <rect x="-12" y="-18" width="24" height="6" fill="#c9923a" />
          <rect x="-16" y="-12" width="32" height="12" rx="2" fill="#3a4a43" />
        </g>
      )
    case 'balloons':
      return (
        <g>
          <g stroke="#8a9b82" strokeWidth="1.2" fill="none">
            <path d="M0 -6q-6-40-16-96" />
            <path d="M0 -6q6-50 14-104" />
            <path d="M0 -6q-2-60-2-116" />
          </g>
          <ellipse cx="-16" cy="-118" rx="14" ry="17" fill="#ff6f86" />
          <ellipse cx="14" cy="-126" rx="14" ry="17" fill="#6fb7e0" />
          <ellipse cx="-2" cy="-134" rx="14" ry="16" fill="#f2c94c" />
          <ellipse cx="-20" cy="-124" rx="3" ry="5" fill="#fff" opacity=".5" />
          <rect x="-5" y="-7" width="10" height="7" rx="2" fill="#c07f5f" />
        </g>
      )
    case 'bunting':
      return (
        <g>
          <path d="M-130 -40Q0 -4 130 -40" stroke="#8a9b82" strokeWidth="2" fill="none" />
          {[-105, -75, -45, -15, 15, 45, 75, 105].map((x, i) => {
            const y = sag(x, 130, -40, -4)
            return <path key={x} d={`M${x - 11} ${y}L${x + 11} ${y}L${x} ${y + 20}z`} fill={RAINBOW[i % RAINBOW.length]} />
          })}
        </g>
      )
    case 'welcome':
      return (
        <g>
          <path d="M-26 0L-14 -96M26 0L14 -96" stroke="#8a6a47" strokeWidth="5" strokeLinecap="round" />
          <rect x="-24" y="-90" width="48" height="60" rx="3" fill="#2f3d38" stroke="#a8825a" strokeWidth="3" />
          <text x="0" y="-66" textAnchor="middle" fontFamily={DISPLAY} fontSize="11" fill="#fffdf3">
            ยินดี
          </text>
          <text x="0" y="-50" textAnchor="middle" fontFamily={DISPLAY} fontSize="11" fill="#fffdf3">
            ต้อนรับ
          </text>
          <circle cx="12" cy="-38" r="3" fill="#ff9fb0" />
        </g>
      )
    case 'teddy':
      return (
        <g>
          <ellipse cx="0" cy="-12" rx="13" ry="12" fill="#b9845a" />
          <ellipse cx="-13" cy="-15" rx="4" ry="6" fill="#b9845a" />
          <ellipse cx="13" cy="-15" rx="4" ry="6" fill="#b9845a" />
          <ellipse cx="-8" cy="-2" rx="6" ry="3.5" fill="#a87650" />
          <ellipse cx="8" cy="-2" rx="6" ry="3.5" fill="#a87650" />
          <circle cx="-8" cy="-37" r="4" fill="#c9935f" />
          <circle cx="8" cy="-37" r="4" fill="#c9935f" />
          <circle cx="0" cy="-29" r="10" fill="#c9935f" />
          <ellipse cx="0" cy="-26" rx="4" ry="3" fill="#ead2b2" />
          <circle cx="-4" cy="-31" r="1.4" fill="#3a2a20" />
          <circle cx="4" cy="-31" r="1.4" fill="#3a2a20" />
        </g>
      )
    case 'starmobile':
      return (
        <path
          d="M0 -38l5.3 10.7 11.8 1.7-8.6 8.4 2 11.8L0 -11l-10.5 5.5 2-11.8-8.6-8.4 11.8-1.7z"
          fill="#f2c94c"
          stroke="#c9923a"
          strokeWidth="2"
          strokeLinejoin="round"
        />
      )
    default:
      return <rect x="-15" y="-30" width="30" height="30" rx="4" fill="#cdd8c6" />
  }
}

// ---------- wall, floor and sign styles ----------

interface WallStyle {
  base: string
  trim: string
  edge: string
  pattern: (id: string) => ReactNode
}

const WALLS: Record<string, WallStyle> = {
  'wall-sage': {
    base: '#dfe8d5',
    trim: '#c8d7bc',
    edge: '#b2c4a5',
    pattern: id => (
      <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse">
        <rect width="44" height="44" fill="#dfe8d5" />
        <circle cx="22" cy="22" r="1.6" fill="#cfdcc3" />
      </pattern>
    ),
  },
  'wall-cream': {
    base: '#f6eedb',
    trim: '#e8dcc0',
    edge: '#d6c6a2',
    pattern: id => (
      <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="#f6eedb" />
        <circle cx="10" cy="10" r="1.8" fill="#e8d3a0" />
        <circle cx="30" cy="30" r="1.8" fill="#e8d3a0" />
      </pattern>
    ),
  },
  'wall-stripe': {
    base: '#e3f2ea',
    trim: '#bcd8c8',
    edge: '#a5c7b4',
    pattern: id => (
      <pattern id={id} width="44" height="44" patternUnits="userSpaceOnUse">
        <rect width="22" height="44" fill="#e3f2ea" />
        <rect x="22" width="22" height="44" fill="#d3e9dd" />
      </pattern>
    ),
  },
  'wall-brick': {
    base: '#c98b6b',
    trim: '#8f5a43',
    edge: '#7a4a36',
    pattern: id => (
      <pattern id={id} width="60" height="30" patternUnits="userSpaceOnUse">
        <rect width="60" height="30" fill="#c98b6b" />
        <path d="M0 0H60M0 15H60M30 0V15M0 15V30M60 15V30" stroke="#e6c3a8" strokeWidth="2" />
      </pattern>
    ),
  },
  'wall-wood': {
    base: '#d9b68a',
    trim: '#a8825a',
    edge: '#8a6a47',
    pattern: id => (
      <pattern id={id} width="36" height="120" patternUnits="userSpaceOnUse">
        <rect width="36" height="120" fill="#d9b68a" />
        <path d="M0 0V120" stroke="#b8935f" strokeWidth="2" />
        <ellipse cx="20" cy="60" rx="3" ry="6" fill="none" stroke="#c9a273" />
      </pattern>
    ),
  },
  'wall-night': {
    base: '#24324a',
    trim: '#1b2638',
    edge: '#121a28',
    pattern: id => (
      <pattern id={id} width="90" height="90" patternUnits="userSpaceOnUse">
        <rect width="90" height="90" fill="#24324a" />
        <g fill="#fff6d6">
          <circle cx="12" cy="18" r="1.6" />
          <circle cx="60" cy="40" r="1.2" />
          <circle cx="34" cy="72" r="1.8" />
          <circle cx="80" cy="80" r="1" />
          <circle cx="72" cy="10" r="1.4" opacity=".7" />
        </g>
      </pattern>
    ),
  },
  'wall-circuit': {
    base: '#1f3b34',
    trim: '#163029',
    edge: '#0f231e',
    pattern: id => (
      <pattern id={id} width="80" height="80" patternUnits="userSpaceOnUse">
        <rect width="80" height="80" fill="#1f3b34" />
        <path d="M0 20H30V50H80M50 0V30H80M20 80V60H50" stroke="#3f7a5e" strokeWidth="2" fill="none" />
        <g fill="#8fdcaa">
          <circle cx="30" cy="20" r="3" />
          <circle cx="50" cy="30" r="3" />
          <circle cx="20" cy="60" r="3" />
        </g>
      </pattern>
    ),
  },
}

const FLOORS: Record<string, { base: string; pattern?: (id: string) => ReactNode; lines?: boolean }> = {
  'floor-wood': { base: '#e6d6b4', lines: true },
  'floor-tile': {
    base: '#eef2f3',
    pattern: id => (
      <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="#eef2f3" />
        <path d="M0 0H40M0 0V40" stroke="#d3dcdf" strokeWidth="2" />
      </pattern>
    ),
  },
  'floor-checker': {
    base: '#f5f2ea',
    pattern: id => (
      <pattern id={id} width="60" height="60" patternUnits="userSpaceOnUse">
        <rect width="60" height="60" fill="#f5f2ea" />
        <rect width="30" height="30" fill="#2f3d38" />
        <rect x="30" y="30" width="30" height="30" fill="#2f3d38" />
      </pattern>
    ),
  },
  'floor-terrazzo': {
    base: '#e8e2d6',
    pattern: id => (
      <pattern id={id} width="50" height="50" patternUnits="userSpaceOnUse">
        <rect width="50" height="50" fill="#e8e2d6" />
        <circle cx="8" cy="12" r="2" fill="#c07f5f" />
        <circle cx="30" cy="8" r="1.5" fill="#8a9b82" />
        <circle cx="40" cy="34" r="1.2" fill="#3d6f8e" />
        <circle cx="18" cy="38" r="1.8" fill="#e8bd6a" />
      </pattern>
    ),
  },
  'floor-grass': {
    base: '#94c27f',
    pattern: id => (
      <pattern id={id} width="24" height="24" patternUnits="userSpaceOnUse">
        <rect width="24" height="24" fill="#94c27f" />
        <path d="M4 24l2-8M12 24l-1-9M19 24l2-7" stroke="#7fae6b" strokeWidth="2" />
      </pattern>
    ),
  },
  'floor-carpet': {
    base: '#3f5f86',
    pattern: id => (
      <pattern id={id} width="40" height="40" patternUnits="userSpaceOnUse">
        <rect width="40" height="40" fill="#3f5f86" />
        <path d="M20 6L34 20L20 34L6 20z" fill="none" stroke="#4f719a" strokeWidth="2" />
      </pattern>
    ),
  },
}

/** wall from the ceiling down to the wainscot (y 0–344) */
export function WallSurface({ style, pid }: { style: string; pid: string }) {
  const w = WALLS[style] ?? WALLS['wall-sage']
  const id = `${pid}-wall`
  return (
    <g>
      <defs>{w.pattern(id)}</defs>
      <rect width="1000" height="300" fill={`url(#${id})`} />
      <rect y="296" width="1000" height="48" fill={w.trim} />
      <rect y="296" width="1000" height="6" fill={w.edge} />
    </g>
  )
}

/** floor from the wainscot to the bottom of the scene (y 344–460) */
export function FloorSurface({ style, pid }: { style: string; pid: string }) {
  const f = FLOORS[style] ?? FLOORS['floor-wood']
  const id = `${pid}-floor`
  return (
    <g>
      {f.pattern && <defs>{f.pattern(id)}</defs>}
      <rect y="344" width="1000" height="116" fill={f.pattern ? `url(#${id})` : f.base} />
      {f.lines && (
        <g stroke="#d4c29c" strokeWidth="2">
          <path d="M0 372H1000M0 404H1000M0 436H1000" />
          <path d="M120 344v28M420 372v32M760 344v28M260 404v32M600 404v32M900 372v32" />
        </g>
      )}
    </g>
  )
}

const SIGN_LOOK: Record<string, { bg: string; text: string; font: string; stroke?: string; rx: number; glow?: string }> = {
  'sign-classic': { bg: '#193d35', text: '#e8bd6a', font: DISPLAY, rx: 14 },
  'sign-wood': { bg: '#6d4f35', text: '#fbf0d9', font: DISPLAY, stroke: '#a8825a', rx: 8 },
  'sign-pixel': { bg: '#141a18', text: '#8fdcaa', font: MONO, stroke: '#8fdcaa', rx: 2 },
  'sign-neon': { bg: '#2a2233', text: '#ffd0da', font: DISPLAY, stroke: '#ff6f86', rx: 14, glow: '#ff6f86' },
  'sign-gold': { bg: '#e8bd6a', text: '#5a3f12', font: DISPLAY, stroke: '#c9923a', rx: 14 },
}

/** the hanging shop sign with the shop's own name */
export function SignBoard({ style, text }: { style: string; text: string }) {
  const s = SIGN_LOOK[style] ?? SIGN_LOOK['sign-classic']
  const long = text.length > 12
  const textProps = {
    x: 500,
    y: 64,
    textAnchor: 'middle' as const,
    fontFamily: s.font,
    fontSize: long ? 20 : 25,
    letterSpacing: long ? 0 : 1,
    ...(long ? { textLength: 192, lengthAdjust: 'spacingAndGlyphs' as const } : {}),
  }
  return (
    <g>
      <path d="M430 0v30M570 0v30" stroke="#8a9b82" strokeWidth="3" />
      <rect x="392" y="28" width="216" height="54" rx={s.rx} fill={s.bg} stroke={s.stroke} strokeWidth={s.stroke ? 3 : 0} />
      {style === 'sign-wood' && <path d="M402 44h196M402 66h196" stroke="#5a3f2a" strokeWidth="2" opacity=".6" />}
      {style === 'sign-gold' && <rect x="398" y="34" width="204" height="42" rx="10" fill="none" stroke="#fff3c9" strokeWidth="1.5" />}
      {s.glow && (
        <text {...textProps} fill="none" stroke={s.glow} strokeWidth="6" opacity=".45">
          {text}
        </text>
      )}
      <text {...textProps} fill={s.text}>
        {text}
      </text>
    </g>
  )
}

/** one placed item at its spot; ceiling items get a cord up to the ceiling */
export function PlacedArt({ id, x, y, flip }: { id: string; x: number; y: number; flip: boolean }) {
  const item = DECOR_BY_ID[id]
  return (
    <g transform={`translate(${x} ${y})`}>
      {item?.zone === 'ceiling' && <path d={`M0 ${-y}V${-item.h}`} stroke="#8a9b82" strokeWidth="2" />}
      <g transform={flip ? 'scale(-1 1)' : undefined}>
        <ItemArt id={id} />
      </g>
    </g>
  )
}

/** catalog thumbnail: placeables are framed around their size, styles show a swatch */
export function DecorThumb({ id, size = 64 }: { id: string; size?: number }) {
  const item = DECOR_BY_ID[id]
  const pid = `thumb-${id}`
  if (!item || item.kind !== 'place') {
    const kind = item?.kind
    return (
      <svg viewBox="0 0 64 64" width={size} height={size} aria-hidden className="decor-thumb">
        <defs>
          <clipPath id={`${pid}-clip`}>
            <rect width="64" height="64" rx="12" />
          </clipPath>
        </defs>
        <g clipPath={`url(#${pid}-clip)`}>
          {kind === 'wall' && (
            <g transform="scale(0.3)">
              <WallSurface style={id} pid={pid} />
            </g>
          )}
          {kind === 'floor' && (
            <g transform="translate(0 -192.6) scale(0.56)">
              <FloorSurface style={id} pid={pid} />
            </g>
          )}
          {kind === 'sign' && (
            <>
              <rect width="64" height="64" fill="#eef2e6" />
              <g transform="translate(-103 18) scale(0.27)">
                <SignBoard style={id} text="Aa" />
              </g>
            </>
          )}
        </g>
      </svg>
    )
  }
  const pad = 8
  const side = Math.max(item.w, item.h) + pad * 2
  const vx = -side / 2
  const vy = -item.h - (side - item.h) / 2
  return (
    <svg viewBox={`${vx} ${vy} ${side} ${side}`} width={size} height={size} aria-hidden className="decor-thumb">
      <rect x={vx} y={vy} width={side} height={side} rx={side * 0.18} fill="#eef2e6" />
      <ItemArt id={id} />
    </svg>
  )
}
