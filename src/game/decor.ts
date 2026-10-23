// Pure shop-decoration logic (no DOM) so the node test runner can import it.
import {
  CLASSIC_SPOTS,
  DECOR_BY_ID,
  DEFAULT_FLOOR,
  DEFAULT_SIGN,
  DEFAULT_SIGN_TEXT,
  DEFAULT_WALL,
  FLOOR_FRONT,
  MAX_PLACED,
  SIGN_TEXT_MAX,
  ZONES,
  type DecorItem,
} from '../data/decor.ts'
import type { DecorState, PlacedDecor, SaveData } from './types.ts'

const FREE = new Set([DEFAULT_WALL, DEFAULT_FLOOR, DEFAULT_SIGN])

export function defaultDecor(): DecorState {
  return { wall: DEFAULT_WALL, floor: DEFAULT_FLOOR, sign: DEFAULT_SIGN, signText: DEFAULT_SIGN_TEXT, placed: [] }
}

/** the range the bottom-centre anchor of an item may take */
export function zoneBounds(item: DecorItem): { x0: number; x1: number; y0: number; y1: number } {
  const zone = ZONES[item.zone ?? 'floor']
  const half = item.w / 2
  const x0 = zone.x[0] + half
  const x1 = Math.max(x0, zone.x[1] - half)
  switch (item.zone) {
    case 'ceiling':
      // hangs on a cord from the ceiling, so the top of the item stays below it
      return { x0, x1, y0: item.h + 8, y1: item.h + 96 }
    case 'wall':
      return { x0, x1, y0: item.h + 6, y1: zone.y[1] }
    default:
      return { x0, x1, y0: zone.y[0], y1: zone.y[1] }
  }
}

export function clampToZone(item: DecorItem, x: number, y: number): { x: number; y: number } {
  const b = zoneBounds(item)
  const fx = Number.isFinite(x) ? x : (b.x0 + b.x1) / 2
  const fy = Number.isFinite(y) ? y : b.y1
  return { x: Math.round(Math.min(b.x1, Math.max(b.x0, fx))), y: Math.round(Math.min(b.y1, Math.max(b.y0, fy))) }
}

/** back = drawn behind the counter and the people; front = on the counter/bench or in the front strip of floor */
export function layerOf(item: DecorItem, y: number): 'back' | 'front' {
  if (item.zone === 'counter' || item.zone === 'bench') return 'front'
  if (item.zone === 'floor' && y >= FLOOR_FRONT) return 'front'
  return 'back'
}

/** placed items of one layer in drawing order */
export function layerItems(decor: DecorState, layer: 'back' | 'front'): PlacedDecor[] {
  return decor.placed
    .map((p, i) => ({ p, i }))
    .filter(({ p }) => {
      const item = DECOR_BY_ID[p.item]
      return item && layerOf(item, p.y) === layer
    })
    .sort((a, b) => a.p.z - b.p.z || a.p.y - b.p.y || a.i - b.i)
    .map(({ p }) => p)
}

export function owned(save: SaveData, id: string): number {
  return FREE.has(id) ? 1 : (save.inventory[id] ?? 0)
}

export function placedCount(decor: DecorState, id: string): number {
  return decor.placed.filter(p => p.item === id).length
}

/** copies bought but not standing in the shop */
export function inStock(save: SaveData, id: string): number {
  return Math.max(0, owned(save, id) - placedCount(save.decor, id))
}

export type BuyBlock = 'unknown' | 'level' | 'max' | 'coins'

/** why an item cannot be bought right now, or null when it can */
export function buyBlock(save: SaveData, id: string, levelIndex: number): BuyBlock | null {
  const item = DECOR_BY_ID[id]
  if (!item) return 'unknown'
  if ((item.level ?? 0) > levelIndex) return 'level'
  if (owned(save, id) >= item.max) return 'max'
  if (save.coins < item.price) return 'coins'
  return null
}

export function nextUid(decor: DecorState): string {
  const used = decor.placed.map(p => Number(p.uid.replace(/^d/, ''))).filter(n => Number.isFinite(n))
  return `d${(used.length ? Math.max(...used) : 0) + 1}`
}

/** a free-ish starting spot: the middle of the zone, nudged sideways for each item already in that zone */
export function defaultSpot(decor: DecorState, item: DecorItem): { x: number; y: number } {
  const b = zoneBounds(item)
  const crowd = decor.placed.filter(p => DECOR_BY_ID[p.item]?.zone === item.zone).length
  const offset = ((crowd % 5) - 2) * 46
  const y = item.zone === 'wall' ? Math.min(b.y1, b.y0 + 60) : item.zone === 'ceiling' ? b.y0 + 20 : b.y1
  return clampToZone(item, (b.x0 + b.x1) / 2 + offset, item.zone === 'floor' ? 440 : y)
}

/** stands one copy from stock in the shop */
export function placeItem(save: SaveData, id: string): SaveData | null {
  const item = DECOR_BY_ID[id]
  if (!item || item.kind !== 'place' || inStock(save, id) < 1 || save.decor.placed.length >= MAX_PLACED) return null
  const spot = defaultSpot(save.decor, item)
  const top = Math.max(0, ...save.decor.placed.map(p => p.z))
  const placed: PlacedDecor = { uid: nextUid(save.decor), item: id, x: spot.x, y: spot.y, flip: false, z: top + 1 }
  return { ...save, decor: { ...save.decor, placed: [...save.decor.placed, placed] } }
}

/** a wall/floor/sign style becomes the one in use */
export function applySurface(save: SaveData, id: string): SaveData | null {
  const item = DECOR_BY_ID[id]
  if (!item || item.kind === 'place' || owned(save, id) < 1) return null
  return { ...save, decor: { ...save.decor, [item.kind]: id } }
}

/** pays for one copy; a placeable goes straight into the shop and a style is applied at once */
export function buyDecor(save: SaveData, id: string, levelIndex: number): SaveData | null {
  if (buyBlock(save, id, levelIndex)) return null
  const item = DECOR_BY_ID[id]
  const paid: SaveData = { ...save, coins: save.coins - item.price, inventory: { ...save.inventory, [id]: owned(save, id) + 1 } }
  if (item.kind === 'place') return placeItem(paid, id) ?? paid
  return applySurface(paid, id) ?? paid
}

const update = (decor: DecorState, uid: string, fn: (p: PlacedDecor, item: DecorItem) => PlacedDecor): DecorState => ({
  ...decor,
  placed: decor.placed.map(p => (p.uid === uid && DECOR_BY_ID[p.item] ? fn(p, DECOR_BY_ID[p.item]) : p)),
})

export function moveItem(decor: DecorState, uid: string, x: number, y: number): DecorState {
  return update(decor, uid, (p, item) => ({ ...p, ...clampToZone(item, x, y) }))
}

export function flipItem(decor: DecorState, uid: string): DecorState {
  return update(decor, uid, p => ({ ...p, flip: !p.flip }))
}

export function restack(decor: DecorState, uid: string, dir: 'front' | 'back'): DecorState {
  const zs = decor.placed.map(p => p.z)
  const z = dir === 'front' ? Math.max(0, ...zs) + 1 : Math.min(0, ...zs) - 1
  return update(decor, uid, p => ({ ...p, z }))
}

/** takes an item out of the shop and back into stock */
export function storeItem(decor: DecorState, uid: string): DecorState {
  return { ...decor, placed: decor.placed.filter(p => p.uid !== uid) }
}

export function cleanSignText(text: string): string {
  return text.replace(/\s+/g, ' ').trim().slice(0, SIGN_TEXT_MAX)
}

export function setSignText(decor: DecorState, text: string): DecorState {
  return { ...decor, signText: cleanSignText(text) || DEFAULT_SIGN_TEXT }
}

// ---------- loading saved data ----------

const isObj = (v: unknown): v is Record<string, unknown> => typeof v === 'object' && v !== null

export function normalizeInventory(raw: unknown): Record<string, number> {
  const inventory: Record<string, number> = {}
  if (!isObj(raw)) return inventory
  for (const [id, n] of Object.entries(raw)) {
    const item = DECOR_BY_ID[id]
    if (!item || FREE.has(id) || typeof n !== 'number' || !Number.isFinite(n) || n < 1) continue
    inventory[id] = Math.min(item.max, Math.floor(n))
  }
  return inventory
}

/** keeps only styles and placements the inventory can pay for, inside their zones, with unique ids */
export function normalizeDecor(raw: unknown, inventory: Record<string, number>): DecorState {
  const base = defaultDecor()
  if (!isObj(raw)) return base
  const has = (id: unknown, kind: DecorItem['kind']): id is string =>
    typeof id === 'string' && DECOR_BY_ID[id]?.kind === kind && (FREE.has(id) || (inventory[id] ?? 0) > 0)
  const placed: PlacedDecor[] = []
  const used = new Map<string, number>()
  const uids = new Set<string>()
  for (const p of Array.isArray(raw.placed) ? raw.placed : []) {
    if (!isObj(p) || typeof p.item !== 'string') continue
    const item = DECOR_BY_ID[p.item]
    if (!item || item.kind !== 'place') continue
    const count = used.get(p.item) ?? 0
    if (count >= (inventory[p.item] ?? 0) || placed.length >= MAX_PLACED) continue
    used.set(p.item, count + 1)
    let uid = typeof p.uid === 'string' && /^d\d+$/.test(p.uid) && !uids.has(p.uid) ? p.uid : ''
    if (!uid) uid = nextUid({ ...base, placed })
    uids.add(uid)
    const spot = clampToZone(item, Number(p.x), Number(p.y))
    placed.push({ uid, item: p.item, ...spot, flip: p.flip === true, z: Number.isInteger(p.z) ? (p.z as number) : 0 })
  }
  return {
    wall: has(raw.wall, 'wall') ? raw.wall : base.wall,
    floor: has(raw.floor, 'floor') ? raw.floor : base.floor,
    sign: has(raw.sign, 'sign') ? raw.sign : base.sign,
    signText: typeof raw.signText === 'string' && cleanSignText(raw.signText) ? cleanSignText(raw.signText) : base.signText,
    placed,
  }
}

export function normalizeShop(rawInventory: unknown, rawDecor: unknown): { inventory: Record<string, number>; decor: DecorState } {
  const inventory = normalizeInventory(rawInventory)
  return { inventory, decor: normalizeDecor(rawDecor, inventory) }
}

/** save v3 only knew five fixed items; they keep their old spots so the shop looks the same */
export function migrateOwned(owned: unknown): { inventory: Record<string, number>; decor: DecorState } {
  const ids = Array.isArray(owned) ? owned.filter((x): x is string => typeof x === 'string' && DECOR_BY_ID[x]?.kind === 'place') : []
  const inventory: Record<string, number> = {}
  for (const id of ids) inventory[id] = 1
  const decor = defaultDecor()
  decor.placed = Object.keys(inventory).map((id, i) => {
    const spot = CLASSIC_SPOTS[id] ?? defaultSpot(decor, DECOR_BY_ID[id])
    return { uid: `d${i + 1}`, item: id, ...clampToZone(DECOR_BY_ID[id], spot.x, spot.y), flip: false, z: 0 }
  })
  return { inventory, decor }
}
