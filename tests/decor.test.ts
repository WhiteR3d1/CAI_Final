import assert from 'node:assert/strict'
import { describe, it } from 'node:test'
import { CLASSIC_SPOTS, DECOR, DECOR_BY_ID, DEFAULT_FLOOR, DEFAULT_SIGN, DEFAULT_SIGN_TEXT, DEFAULT_WALL, MAX_PLACED, ZONES } from '../src/data/decor.ts'
import {
  applySurface,
  buyBlock,
  buyDecor,
  clampToZone,
  flipItem,
  inStock,
  layerItems,
  moveItem,
  placeItem,
  restack,
  setSignText,
  storeItem,
  zoneBounds,
} from '../src/game/decor.ts'
import { defaultSave, LEVELS, normalizeSave } from '../src/game/progress.ts'
import type { SaveData } from '../src/game/types.ts'

const rich = (coins = 5000): SaveData => ({ ...defaultSave(), coins })

describe('decoration catalog', () => {
  it('has unique ids, sane sizes and reachable unlock levels', () => {
    assert.equal(new Set(DECOR.map(d => d.id)).size, DECOR.length)
    assert.ok(DECOR.length >= 50, 'there should be plenty to choose from')
    for (const d of DECOR) {
      assert.ok(d.price >= 0 && d.max >= 1, d.id)
      assert.ok(d.level === undefined || (d.level >= 1 && d.level < LEVELS.length), `${d.id} level`)
      if (d.kind === 'place') {
        assert.ok(d.zone && ZONES[d.zone], `${d.id} needs a zone`)
        assert.ok(d.w > 0 && d.h > 0, `${d.id} needs a size`)
        const b = zoneBounds(d)
        assert.ok(b.x0 <= b.x1 && b.y0 <= b.y1, `${d.id} must fit its zone`)
      }
    }
  })

  it('gives the default wall, floor and sign for free', () => {
    for (const id of [DEFAULT_WALL, DEFAULT_FLOOR, DEFAULT_SIGN]) assert.equal(DECOR_BY_ID[id].price, 0)
  })

  it('keeps the five original items at spots inside their zones', () => {
    for (const [id, spot] of Object.entries(CLASSIC_SPOTS)) {
      assert.deepEqual(clampToZone(DECOR_BY_ID[id], spot.x, spot.y), spot, id)
    }
  })
})

describe('buying and placing', () => {
  it('needs enough coins and the shop level', () => {
    assert.equal(buyBlock({ ...defaultSave(), coins: 10 }, 'fern', 0), 'coins')
    assert.equal(buyBlock(rich(), 'arcade', 0), 'level')
    assert.equal(buyBlock(rich(), 'arcade', 3), null)
    assert.equal(buyBlock(rich(), 'nope', 4), 'unknown')
    assert.equal(buyDecor(rich(), 'arcade', 0), null)
  })

  it('places a bought item at once and stops at the per-item maximum', () => {
    let s = rich()
    for (let i = 0; i < DECOR_BY_ID.chair.max; i++) {
      const next = buyDecor(s, 'chair', 0)
      assert.ok(next)
      s = next
    }
    assert.equal(s.coins, 5000 - DECOR_BY_ID.chair.price * DECOR_BY_ID.chair.max)
    assert.equal(s.inventory.chair, DECOR_BY_ID.chair.max)
    assert.equal(s.decor.placed.filter(p => p.item === 'chair').length, DECOR_BY_ID.chair.max)
    assert.equal(new Set(s.decor.placed.map(p => p.uid)).size, s.decor.placed.length)
    assert.equal(buyBlock(s, 'chair', 0), 'max')
  })

  it('applies a bought wall style and switches back to the free one', () => {
    const s = buyDecor(rich(), 'wall-brick', 0)
    assert.equal(s?.decor.wall, 'wall-brick')
    assert.equal(s && applySurface(s, DEFAULT_WALL)?.decor.wall, DEFAULT_WALL)
    assert.equal(applySurface(rich(), 'wall-wood'), null)
  })

  it('stores items back into stock and places them again', () => {
    const s = buyDecor(rich(), 'sofa', 0)!
    const uid = s.decor.placed[0].uid
    const stored = { ...s, decor: storeItem(s.decor, uid) }
    assert.equal(inStock(stored, 'sofa'), 1)
    const again = placeItem(stored, 'sofa')
    assert.equal(again?.decor.placed.length, 1)
    assert.equal(again && placeItem(again, 'sofa'), null)
  })

  it('stops placing at the scene limit', () => {
    const full: SaveData = {
      ...rich(),
      inventory: { cactus: MAX_PLACED, sofa: 1 },
      decor: { ...defaultSave().decor, placed: Array.from({ length: MAX_PLACED }, (_, i) => ({ uid: `d${i + 1}`, item: 'cactus', x: 400, y: 272, flip: false, z: 0 })) },
    }
    assert.equal(inStock(full, 'sofa'), 1)
    assert.equal(placeItem(full, 'sofa'), null)
  })
})

describe('moving items', () => {
  const s = buyDecor(buyDecor(rich(), 'sofa', 0)!, 'poster', 0)!
  const sofa = s.decor.placed.find(p => p.item === 'sofa')!
  const poster = s.decor.placed.find(p => p.item === 'poster')!

  it('keeps items inside their zone', () => {
    const d = moveItem(s.decor, sofa.uid, -500, 10)
    const moved = d.placed.find(p => p.uid === sofa.uid)!
    assert.equal(moved.x, DECOR_BY_ID.sofa.w / 2)
    assert.equal(moved.y, ZONES.floor.y[0])
    const wall = moveItem(s.decor, poster.uid, 500, 999).placed.find(p => p.uid === poster.uid)!
    assert.equal(wall.y, ZONES.wall.y[1])
  })

  it('flips and restacks', () => {
    assert.equal(flipItem(s.decor, sofa.uid).placed.find(p => p.uid === sofa.uid)?.flip, true)
    const back = restack(s.decor, poster.uid, 'back')
    assert.ok(back.placed.find(p => p.uid === poster.uid)!.z < Math.min(...s.decor.placed.map(p => p.z)))
  })

  it('draws floor items in front of the counter only near the bottom', () => {
    const front = moveItem(s.decor, sofa.uid, 500, 450)
    assert.ok(layerItems(front, 'front').some(p => p.uid === sofa.uid))
    const behind = moveItem(s.decor, sofa.uid, 500, 380)
    assert.ok(layerItems(behind, 'back').some(p => p.uid === sofa.uid))
  })

  it('cleans the sign text', () => {
    assert.equal(setSignText(s.decor, '   ร้าน   ของ  ฉัน  ').signText, 'ร้าน ของ ฉัน')
    assert.equal(setSignText(s.decor, '   ').signText, DEFAULT_SIGN_TEXT)
    assert.equal(setSignText(s.decor, 'x'.repeat(40)).signText.length, 20)
  })
})

describe('saved shops', () => {
  it('migrates a v3 save without losing coins, stars or the old decorations', () => {
    const job = { attempts: 1, completions: 1, paid: 150, best: { finishedAt: 't', score: 100, criteria: {}, stars: 3, objectives: [], mistakes: [], hintsUsed: 0, coinsEarned: 150 } }
    const s = normalizeSave({ version: 3, coins: 750, owned: ['fern', 'poster', 'lamp', 'neon', 'cat'], jobs: { 'make-usb': job }, settings: { sfx: true, unlockAll: false, playerName: 'ก' } })
    assert.equal(s.version, 4)
    assert.equal(s.coins, 750)
    assert.equal(s.jobs['make-usb']?.best?.stars, 3)
    assert.equal(s.settings.playerName, 'ก')
    assert.equal(s.decor.placed.length, 5)
    for (const p of s.decor.placed) assert.deepEqual({ x: p.x, y: p.y }, CLASSIC_SPOTS[p.item])
    assert.equal(s.decor.wall, DEFAULT_WALL)
  })

  it('drops unknown items, unpaid placements, bad styles and duplicate ids from a v4 save', () => {
    const s = normalizeSave({
      version: 4,
      coins: 10,
      inventory: { sofa: 1, chair: 99, fake: 2, 'wall-brick': 1, [DEFAULT_WALL]: 3 },
      decor: {
        wall: 'wall-brick',
        floor: 'floor-checker',
        sign: 'nope',
        signText: '  ',
        placed: [
          { uid: 'd1', item: 'sofa', x: -100, y: 999, flip: true, z: 2 },
          { uid: 'd1', item: 'chair', x: 300, y: 400 },
          { uid: 'd7', item: 'sofa', x: 300, y: 400 },
          { uid: 'd8', item: 'fake', x: 1, y: 1 },
          'junk',
        ],
      },
    })
    assert.deepEqual(s.inventory, { sofa: 1, chair: DECOR_BY_ID.chair.max, 'wall-brick': 1 })
    assert.equal(s.decor.wall, 'wall-brick')
    assert.equal(s.decor.floor, DEFAULT_FLOOR)
    assert.equal(s.decor.sign, DEFAULT_SIGN)
    assert.equal(s.decor.signText, DEFAULT_SIGN_TEXT)
    assert.deepEqual(
      s.decor.placed.map(p => p.item),
      ['sofa', 'chair'],
    )
    assert.equal(new Set(s.decor.placed.map(p => p.uid)).size, 2)
    const sofa = s.decor.placed[0]
    assert.deepEqual([sofa.x, sofa.y, sofa.flip, sofa.z], [DECOR_BY_ID.sofa.w / 2, ZONES.floor.y[1], true, 2])
  })
})
