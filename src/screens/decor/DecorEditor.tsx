import { useRef, useState, type KeyboardEvent, type PointerEvent } from 'react'
import { CoinAmount } from '../../components/Bits'
import { Icon } from '../../components/Icon'
import { CATEGORIES, DECOR, DECOR_BY_ID, MAX_PLACED, SIGN_TEXT_MAX, ZONES, type DecorCategory, type DecorItem } from '../../data/decor'
import { buyBlock, cleanSignText, flipItem, inStock, moveItem, nextUid, owned, placedCount, restack, setSignText, storeItem } from '../../game/decor'
import { useGame } from '../../game/gameContext'
import { LEVELS, reputation, shopLevel } from '../../game/progress'
import type { DecorState } from '../../game/types'
import { ShopScene, type SceneEditor } from '../ShopScene'
import { DecorThumb } from './art'
import './decor.css'

interface Drag {
  uid: string
  pointer: number
  dx: number
  dy: number
  decor: DecorState
  moved: boolean
}

const SURFACE_GROUPS: { kind: DecorItem['kind']; label: string }[] = [
  { kind: 'wall', label: 'ลายผนัง' },
  { kind: 'floor', label: 'พื้น' },
  { kind: 'sign', label: 'ป้ายร้าน' },
]

export function DecorEditor({ onShowcase }: { onShowcase: () => void }) {
  const game = useGame()
  const { save } = game
  const level = shopLevel(reputation(save))
  const [tab, setTab] = useState<DecorCategory>('furniture')
  const [selected, setSelected] = useState<string | null>(null)
  const [drag, setDrag] = useState<Drag | null>(null)
  const [name, setName] = useState(save.decor.signText)
  const sceneRef = useRef<HTMLDivElement>(null)

  const decor = drag?.decor ?? save.decor
  const current = decor.placed.find(p => p.uid === selected)
  const currentItem = current ? DECOR_BY_ID[current.item] : undefined

  const toScene = (clientX: number, clientY: number) => {
    const svg = sceneRef.current?.querySelector('svg')
    const m = svg?.getScreenCTM()
    if (!m) return null
    const pt = new DOMPoint(clientX, clientY).matrixTransform(m.inverse())
    return { x: pt.x, y: pt.y }
  }

  const editor: SceneEditor = {
    selected,
    onSelect: setSelected,
    onPointerDown(e: PointerEvent<SVGGElement>, uid) {
      if (e.button !== 0) return
      const p = save.decor.placed.find(x => x.uid === uid)
      const at = toScene(e.clientX, e.clientY)
      setSelected(uid)
      if (!p || !at) return
      e.preventDefault()
      e.currentTarget.setPointerCapture(e.pointerId)
      setDrag({ uid, pointer: e.pointerId, dx: at.x - p.x, dy: at.y - p.y, decor: save.decor, moved: false })
    },
    onKeyDown(e: KeyboardEvent<SVGGElement>, uid) {
      const p = save.decor.placed.find(x => x.uid === uid)
      if (!p) return
      const step = e.shiftKey ? 24 : 6
      const arrows: Record<string, [number, number]> = { ArrowLeft: [-step, 0], ArrowRight: [step, 0], ArrowUp: [0, -step], ArrowDown: [0, step] }
      let next: DecorState | null = null
      if (arrows[e.key]) next = moveItem(save.decor, uid, p.x + arrows[e.key][0], p.y + arrows[e.key][1])
      else if (e.key === 'f' || e.key === 'F') next = flipItem(save.decor, uid)
      else if (e.key === ']' || e.key === 'PageUp') next = restack(save.decor, uid, 'front')
      else if (e.key === '[' || e.key === 'PageDown') next = restack(save.decor, uid, 'back')
      else if (e.key === 'Delete' || e.key === 'Backspace') {
        next = storeItem(save.decor, uid)
        setSelected(null)
      } else if (e.key === 'Escape') {
        setSelected(null)
        e.currentTarget.blur()
      }
      if (next) {
        e.preventDefault()
        game.setDecor(next)
      }
    },
  }

  const onPointerMove = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag || e.pointerId !== drag.pointer) return
    const at = toScene(e.clientX, e.clientY)
    if (!at) return
    setDrag({ ...drag, moved: true, decor: moveItem(drag.decor, drag.uid, at.x - drag.dx, at.y - drag.dy) })
  }
  const endDrag = (e: PointerEvent<HTMLDivElement>) => {
    if (!drag || e.pointerId !== drag.pointer) return
    if (drag.moved) game.setDecor(drag.decor)
    setDrag(null)
  }

  const act = (fn: (d: DecorState, uid: string) => DecorState) => {
    if (selected) game.setDecor(fn(save.decor, selected))
  }

  const buy = (item: DecorItem) => {
    const uid = nextUid(save.decor)
    if (!game.buyDecor(item.id)) return
    game.play('coin')
    if (item.kind === 'place' && save.decor.placed.length < MAX_PLACED) setSelected(uid)
  }
  const place = (item: DecorItem) => {
    const uid = nextUid(save.decor)
    if (game.placeDecor(item.id)) setSelected(uid)
  }
  const commitName = () => {
    const next = setSignText(save.decor, name)
    setName(next.signText)
    if (next.signText !== save.decor.signText) game.setDecor(next)
  }

  const shown = tab === 'surface' ? [] : DECOR.filter(d => d.category === tab)

  return (
    <div className="decor-editor">
      <section className="decor-stage card" aria-label="ฉากร้านสำหรับจัดของ">
        <div className="decor-stage-top">
          <p className="muted">
            ลากของเพื่อย้าย · คลิกเลือกแล้วใช้ปุ่มด้านล่างหรือคีย์ลูกศร, F กลับด้าน, Delete เก็บเข้าคลัง
          </p>
          <div className="decor-stage-actions">
            <span className="chip">
              ในร้าน {save.decor.placed.length}/{MAX_PLACED} ชิ้น
            </span>
            <button type="button" className="btn btn-primary btn-sm" onClick={onShowcase}>
              <Icon name="monitor" size={18} /> โชว์ร้าน
            </button>
          </div>
        </div>
        <div className="decor-stage-scene" onPointerMove={onPointerMove} onPointerUp={endDrag} onPointerCancel={endDrag}>
          <ShopScene decor={decor} people={false} editor={editor} sceneRef={sceneRef} label="ฉากร้าน ลากของตกแต่งเพื่อย้ายตำแหน่ง" />
        </div>
        <div className={`decor-toolbar${current ? '' : ' is-empty'}`} aria-live="polite">
          {current && currentItem ? (
            <>
              <span className="decor-toolbar-name">
                <DecorThumb id={current.item} size={36} />
                <strong>{currentItem.name}</strong>
                <small className="muted">{ZONES[currentItem.zone ?? 'floor'].label}</small>
              </span>
              <span className="decor-toolbar-btns">
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => act(flipItem)}>
                  <Icon name="refresh" size={16} /> กลับด้าน
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => act((d, u) => restack(d, u, 'front'))}>
                  <Icon name="chevronUp" size={16} /> ไว้หน้าสุด
                </button>
                <button type="button" className="btn btn-ghost btn-sm" onClick={() => act((d, u) => restack(d, u, 'back'))}>
                  <Icon name="chevronDown" size={16} /> ไว้หลังสุด
                </button>
                <button
                  type="button"
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    act(storeItem)
                    setSelected(null)
                  }}
                >
                  <Icon name="bag" size={16} /> เก็บเข้าคลัง
                </button>
              </span>
            </>
          ) : (
            <span className="muted">ยังไม่ได้เลือกของ · คลิกของในร้านเพื่อจัดตำแหน่ง</span>
          )}
        </div>
      </section>

      <section className="decor-catalog card" aria-labelledby="decor-catalog-title">
        <div className="section-head">
          <div>
            <span className="eyebrow">ร้านขายของตกแต่ง</span>
            <h2 id="decor-catalog-title">เลือกของแต่งร้าน</h2>
          </div>
          <p className="muted">
            มีอยู่ <CoinAmount value={save.coins} /> · ระดับร้าน <strong>{level.title}</strong>
          </p>
        </div>

        <div className="decor-tabs" role="tablist" aria-label="หมวดของตกแต่ง">
          {CATEGORIES.map(c => (
            <button key={c.id} type="button" role="tab" aria-selected={tab === c.id} className={`decor-tab${tab === c.id ? ' is-on' : ''}`} onClick={() => setTab(c.id)}>
              {c.label}
            </button>
          ))}
        </div>

        {tab === 'surface' ? (
          <div className="decor-surfaces">
            <label className="decor-name">
              <span>ชื่อร้านบนป้าย</span>
              <input
                value={name}
                maxLength={SIGN_TEXT_MAX}
                onChange={e => setName(e.target.value)}
                onBlur={commitName}
                onKeyDown={e => e.key === 'Enter' && commitName()}
                placeholder="ตั้งชื่อร้านของเรา"
              />
              <small className="muted">
                ไม่เกิน {SIGN_TEXT_MAX} ตัวอักษร · ตอนนี้ {cleanSignText(name).length}
              </small>
            </label>
            {SURFACE_GROUPS.map(g => (
              <div key={g.kind}>
                <h3 className="decor-group-title">{g.label}</h3>
                <div className="decor-grid">
                  {DECOR.filter(d => d.kind === g.kind).map(item => (
                    <DecorCard key={item.id} item={item} inUse={decor[g.kind as 'wall' | 'floor' | 'sign'] === item.id} onBuy={buy} onPlace={place} />
                  ))}
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="decor-grid">
            {shown.map(item => (
              <DecorCard key={item.id} item={item} onBuy={buy} onPlace={place} />
            ))}
          </div>
        )}
      </section>
    </div>
  )
}

function DecorCard({ item, inUse, onBuy, onPlace }: { item: DecorItem; inUse?: boolean; onBuy: (i: DecorItem) => void; onPlace: (i: DecorItem) => void }) {
  const game = useGame()
  const { save } = game
  const levelIndex = shopLevel(reputation(save)).index
  const have = owned(save, item.id)
  const block = buyBlock(save, item.id, levelIndex)
  const stock = item.kind === 'place' ? inStock(save, item.id) : 0
  const placed = item.kind === 'place' ? placedCount(save.decor, item.id) : 0
  const need = item.level ? LEVELS[item.level] : undefined

  return (
    <article className={`decor-item card${have ? ' is-owned' : ''}${block === 'level' ? ' is-locked' : ''}`}>
      <DecorThumb id={item.id} size={72} />
      <div className="decor-item-text">
        <strong>{item.name}</strong>
        <small className="muted">{item.blurb}</small>
        <small className="decor-item-meta">
          {item.kind === 'place' ? `${ZONES[item.zone ?? 'floor'].label} · ซื้อได้ ${item.max} ชิ้น` : 'ซื้อครั้งเดียว เปลี่ยนกลับไปมาได้'}
          {have > 0 && item.kind === 'place' ? ` · มี ${have} (ในร้าน ${placed})` : ''}
        </small>
      </div>
      <div className="decor-item-actions">
        {block === 'level' && need ? (
          <span className="chip">
            <Icon name="lock" size={14} /> ปลดที่ระดับ "{need.title}" ({need.min} ดาว)
          </span>
        ) : item.kind !== 'place' && have > 0 ? (
          inUse ? (
            <span className="chip chip-good">
              <Icon name="check" size={14} /> ใช้อยู่
            </span>
          ) : (
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => game.applySurface(item.id)}>
              ใช้แบบนี้
            </button>
          )
        ) : (
          <>
            {stock > 0 && (
              <button type="button" className="btn btn-ghost btn-sm" onClick={() => onPlace(item)}>
                วางในร้าน ({stock})
              </button>
            )}
            {block !== 'max' ? (
              <button
                type="button"
                className="btn btn-gold btn-sm"
                disabled={block !== null}
                aria-label={`ซื้อ${item.name} ราคา ${item.price} เหรียญ`}
                onClick={() => onBuy(item)}
              >
                ซื้อ <CoinAmount value={item.price} size={14} />
              </button>
            ) : (
              stock === 0 && (
                <span className="chip chip-good">
                  <Icon name="check" size={14} /> ครบจำนวนแล้ว
                </span>
              )
            )}
          </>
        )}
      </div>
    </article>
  )
}
