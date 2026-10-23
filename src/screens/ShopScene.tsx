import { useId, type KeyboardEvent, type PointerEvent, type Ref } from 'react'
import { Avatar } from '../components/Avatar'
import { DECOR_BY_ID } from '../data/decor'
import { MENTOR } from '../data/people'
import { layerItems } from '../game/decor'
import type { DecorState, PlacedDecor, Person } from '../game/types'
import { FloorSurface, PlacedArt, SignBoard, WallSurface } from './decor/art'

/** hooks the decoration editor uses to make placed items draggable */
export interface SceneEditor {
  selected: string | null
  onSelect(uid: string | null): void
  onPointerDown(e: PointerEvent<SVGGElement>, uid: string): void
  onKeyDown(e: KeyboardEvent<SVGGElement>, uid: string): void
}

interface Props {
  decor: DecorState
  customer?: Person
  onCustomer?: () => void
  onBoard?: () => void
  onManual?: () => void
  /** false hides the customer and the mentor (editor and show mode) */
  people?: boolean
  editor?: SceneEditor
  sceneRef?: Ref<HTMLDivElement>
  label?: string
}

function Items({ items, editor }: { items: PlacedDecor[]; editor?: SceneEditor }) {
  return (
    <>
      {items.map(p => {
        const item = DECOR_BY_ID[p.item]
        const selected = editor?.selected === p.uid
        return (
          <g
            key={p.uid}
            className={`decor-placed${selected ? ' is-selected' : ''}`}
            tabIndex={editor ? 0 : undefined}
            role={editor ? 'button' : undefined}
            aria-label={editor ? `${item.name} (ลากเพื่อย้าย)` : undefined}
            aria-pressed={editor ? selected : undefined}
            onPointerDown={editor ? e => editor.onPointerDown(e, p.uid) : undefined}
            onKeyDown={editor ? e => editor.onKeyDown(e, p.uid) : undefined}
            onFocus={editor ? () => editor.onSelect(p.uid) : undefined}
          >
            <PlacedArt id={p.item} x={p.x} y={p.y} flip={p.flip} />
            {editor && <rect className="decor-hit" x={p.x - item.w / 2 - 4} y={p.y - item.h - 4} width={item.w + 8} height={item.h + 8} rx="6" />}
          </g>
        )
      })}
    </>
  )
}

function BackLayer({ decor, pid, editor }: { decor: DecorState; pid: string; editor?: SceneEditor }) {
  return (
    <svg className="scene-layer" viewBox="0 0 1000 460" aria-hidden={editor ? undefined : true}>
      <defs>
        <linearGradient id={`${pid}-sky`} x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#cfe5ea" />
          <stop offset="1" stopColor="#eef6ef" />
        </linearGradient>
      </defs>
      <WallSurface style={decor.wall} pid={pid} />
      <FloorSurface style={decor.floor} pid={pid} />

      {/* window */}
      <rect x="52" y="58" width="196" height="182" rx="6" fill="#f8f4e3" />
      <rect x="66" y="72" width="168" height="154" fill={`url(#${pid}-sky)`} />
      <path d="M66 190q40-34 84-10t84-8v54H66z" fill="#b9d3a8" />
      <path d="M66 206q52-22 100 0t68-8v28H66z" fill="#a3c493" />
      <circle cx="198" cy="104" r="15" fill="#fff6d6" />
      <path d="M150 72v154M66 149h168" stroke="#f8f4e3" strokeWidth="8" />
      <rect x="42" y="238" width="216" height="12" rx="3" fill="#efe8d2" />
      <g transform="translate(88 244)">
        <path d="M6 0h28l-3 20H9z" fill="#c07f5f" />
        <path d="M20 0c-10-12-18-8-20-18 10 0 16 6 20 14 2-12 10-18 18-18-2 10-8 16-18 22z" fill="#5f8a55" />
      </g>

      <SignBoard style={decor.sign} text={decor.signText} />

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

      <Items items={layerItems(decor, 'back')} editor={editor} />
    </svg>
  )
}

function FrontLayer({ decor, editor }: { decor: DecorState; editor?: SceneEditor }) {
  return (
    <svg className="scene-layer scene-front" viewBox="0 0 1000 460" aria-hidden={editor ? undefined : true}>
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
        <text x="32" y="20" textAnchor="middle" fontFamily="IBM Plex Sans Thai, Tahoma, sans-serif" fontSize="13" fill="#2f5e4b">
          รับซ่อม
        </text>
      </g>

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

      <Items items={layerItems(decor, 'front')} editor={editor} />
    </svg>
  )
}

export function ShopScene({ decor, customer, onCustomer, onBoard, onManual, people = true, editor, sceneRef, label }: Props) {
  // pattern ids must be unique when several scenes are on the page (front page, editor, show mode)
  const pid = `s${useId().replace(/[^a-zA-Z0-9]/g, '')}`
  return (
    <div
      ref={sceneRef}
      className={`scene${editor ? ' is-editing' : ''}`}
      role="group"
      aria-label={label ?? `ภายในร้าน ${decor.signText}`}
      onPointerDown={editor ? e => e.target === e.currentTarget && editor.onSelect(null) : undefined}
    >
      <BackLayer decor={decor} pid={pid} editor={editor} />
      {people && customer && (
        <div className="scene-person scene-customer">
          <Avatar look={customer.look} mood="worried" size={120} />
        </div>
      )}
      {people && (
        <div className="scene-person scene-mentor">
          <Avatar look={MENTOR.look} mood="happy" size={110} />
        </div>
      )}
      <FrontLayer decor={decor} editor={editor} />

      {!editor && onBoard && (
        <button type="button" className="hotspot hotspot-board" onClick={onBoard}>
          <span>กระดานงาน</span>
        </button>
      )}
      {!editor && onManual && (
        <button type="button" className="hotspot hotspot-manual" onClick={onManual}>
          <span>คู่มือช่าง</span>
        </button>
      )}
      {!editor && customer && onCustomer && (
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
