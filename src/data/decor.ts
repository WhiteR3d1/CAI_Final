// Shop decoration catalog. Pure data (no JSX) so src/game and the node tests can import it.
// Every item is drawn by our own SVG in src/screens/decor/art.tsx — never images from the book or content sheet.

/** what buying the item gives: something to place, or a wall / floor / sign style */
export type DecorKind = 'place' | 'wall' | 'floor' | 'sign'
/** where a placeable item may stand; the anchor (x, y) is the bottom-centre of the item */
export type DecorZone = 'wall' | 'floor' | 'counter' | 'bench' | 'ceiling'
export type DecorCategory = 'surface' | 'plant' | 'light' | 'wallart' | 'furniture' | 'tech' | 'pet' | 'fun'

export interface DecorItem {
  id: string
  name: string
  price: number
  blurb: string
  kind: DecorKind
  category: DecorCategory
  zone?: DecorZone
  /** size in scene units (the scene is 1000 × 460) */
  w: number
  h: number
  /** how many copies one shop may own */
  max: number
  /** shop level index (see LEVELS in src/game/progress.ts) needed to buy it */
  level?: number
}

export const SCENE_W = 1000
export const SCENE_H = 460
/** floor items placed lower than this stand in front of the counter and workbench */
export const FLOOR_FRONT = 414

export const ZONES: Record<DecorZone, { x: [number, number]; y: [number, number]; label: string }> = {
  ceiling: { x: [0, SCENE_W], y: [0, 0], label: 'ห้อยจากเพดาน' },
  wall: { x: [0, SCENE_W], y: [0, 290], label: 'ติดผนัง' },
  floor: { x: [0, SCENE_W], y: [352, 458], label: 'ตั้งบนพื้น' },
  counter: { x: [262, 590], y: [272, 272], label: 'วางบนเคาน์เตอร์' },
  bench: { x: [650, 962], y: [302, 302], label: 'วางบนโต๊ะซ่อม' },
}

export const CATEGORIES: { id: DecorCategory; label: string }[] = [
  { id: 'surface', label: 'ผนัง · พื้น · ป้าย' },
  { id: 'plant', label: 'ต้นไม้' },
  { id: 'light', label: 'แสงไฟ' },
  { id: 'wallart', label: 'ของติดผนัง' },
  { id: 'furniture', label: 'เฟอร์นิเจอร์' },
  { id: 'tech', label: 'ของไอที' },
  { id: 'pet', label: 'สัตว์เลี้ยง' },
  { id: 'fun', label: 'ของสนุก' },
]

const wall = (id: string, name: string, price: number, blurb: string, level?: number): DecorItem => ({
  id, name, price, blurb, kind: 'wall', category: 'surface', w: 0, h: 0, max: 1, level,
})
const floor = (id: string, name: string, price: number, blurb: string, level?: number): DecorItem => ({
  id, name, price, blurb, kind: 'floor', category: 'surface', w: 0, h: 0, max: 1, level,
})
const sign = (id: string, name: string, price: number, blurb: string, level?: number): DecorItem => ({
  id, name, price, blurb, kind: 'sign', category: 'surface', w: 0, h: 0, max: 1, level,
})
const place = (
  id: string,
  name: string,
  price: number,
  blurb: string,
  category: DecorCategory,
  zone: DecorZone,
  w: number,
  h: number,
  max: number,
  level?: number,
): DecorItem => ({ id, name, price, blurb, kind: 'place', category, zone, w, h, max, level })

export const DEFAULT_WALL = 'wall-sage'
export const DEFAULT_FLOOR = 'floor-wood'
export const DEFAULT_SIGN = 'sign-classic'
export const DEFAULT_SIGN_TEXT = 'BOOT & BLOOM'
export const SIGN_TEXT_MAX = 20
/** keeps the scene light enough for old classroom PCs */
export const MAX_PLACED = 80

export const DECOR: DecorItem[] = [
  // walls, floors and signs: buy once, then switch freely
  wall(DEFAULT_WALL, 'ผนังเขียวเสจ', 0, 'ผนังเดิมของร้าน สีเขียวอ่อนสบายตา'),
  wall('wall-cream', 'ผนังครีมลายจุดทอง', 50, 'อบอุ่นเหมือนร้านกาแฟ'),
  wall('wall-stripe', 'ผนังลายทางมิ้นต์', 60, 'ลายทางตั้งทำให้ร้านดูสูงขึ้น'),
  wall('wall-brick', 'ผนังอิฐ', 90, 'สไตล์ลอฟต์ เท่แบบช่างมืออาชีพ'),
  wall('wall-wood', 'ผนังไม้ระแนง', 100, 'ไม้สีน้ำผึ้ง ดูเป็นธรรมชาติ'),
  wall('wall-night', 'ผนังท้องฟ้าดาว', 140, 'สีกรมท่ากับดาวระยิบ', 2),
  wall('wall-circuit', 'ผนังลายวงจร', 160, 'ลายแผงวงจรเรืองแสง สำหรับหัวหน้าช่าง', 3),
  floor(DEFAULT_FLOOR, 'พื้นไม้', 0, 'พื้นไม้เดิมของร้าน'),
  floor('floor-tile', 'พื้นกระเบื้องขาว', 50, 'สะอาดตา เช็ดง่าย'),
  floor('floor-checker', 'พื้นหมากรุก', 80, 'ขาวดำแบบร้านย้อนยุค'),
  floor('floor-terrazzo', 'พื้นหินขัด', 90, 'ลายจุดหินหลากสี'),
  floor('floor-grass', 'พื้นหญ้าเทียม', 90, 'เหมือนแต่งร้านในสวน'),
  floor('floor-carpet', 'พรมน้ำเงินทั้งร้าน', 110, 'เดินเงียบ ดูหรู', 1),
  sign(DEFAULT_SIGN, 'ป้ายเขียวตัวทอง', 0, 'ป้ายเดิมของร้าน'),
  sign('sign-wood', 'ป้ายไม้แกะสลัก', 60, 'ไม้สีเข้ม ตัวอักษรครีม'),
  sign('sign-pixel', 'ป้ายพิกเซลย้อนยุค', 90, 'ตัวอักษรเขียวแบบจอคอมรุ่นเก่า'),
  sign('sign-neon', 'ป้ายนีออนชมพู', 120, 'เรืองแสงเห็นแต่ไกล', 1),
  sign('sign-gold', 'ป้ายทองหรู', 180, 'ป้ายทองสำหรับร้านระดับหัวหน้าช่าง', 3),

  // plants
  place('fern', 'ต้นเฟิร์นแขวน', 50, 'สีเขียวให้ร้านสดชื่น', 'plant', 'ceiling', 90, 54, 3),
  place('cactus', 'กระบองเพชรจิ๋ว', 25, 'ตัวเล็ก ดูแลง่าย วางได้หลายต้น', 'plant', 'counter', 26, 36, 4),
  place('monstera', 'มอนสเตอร่ากระถางใหญ่', 70, 'ใบใหญ่ เต็มมุมร้าน', 'plant', 'floor', 76, 118, 3),
  place('sunflower', 'ทานตะวันในกระถาง', 55, 'สีเหลืองสดใส', 'plant', 'floor', 44, 104, 3),
  place('bonsai', 'บอนไซ', 90, 'ต้นไม้จิ๋วอายุหลายปี', 'plant', 'counter', 56, 46, 2, 1),
  place('planter', 'ชั้นแขวนไม้ดอก', 65, 'กระถางดอกไม้เรียงบนชั้น', 'plant', 'wall', 100, 56, 2),
  place('palm', 'ปาล์มประดับ', 100, 'ต้นสูงโปร่ง เหมือนล็อบบี้โรงแรม', 'plant', 'floor', 90, 150, 2, 1),

  // lights
  place('lamp', 'โคมไฟโต๊ะซ่อม', 90, 'แสงอุ่น ๆ มองน็อตตัวเล็กได้ชัด', 'light', 'bench', 70, 108, 1),
  place('neon', 'ป้ายไฟ OPEN', 120, 'ลูกค้าเห็นแต่ไกล', 'light', 'wall', 140, 60, 1),
  place('pendant', 'โคมไฟห้อยเพดาน', 55, 'โคมสีทองห้อยลงมา', 'light', 'ceiling', 44, 48, 4),
  place('fairy', 'ไฟประดับหลากสี', 45, 'ไฟเม็ดเล็กพาดผนัง', 'light', 'wall', 240, 36, 3),
  place('floorlamp', 'โคมไฟตั้งพื้น', 80, 'มุมนั่งรอดูอบอุ่นขึ้น', 'light', 'floor', 54, 160, 2),
  place('lava', 'โคมลาวา', 60, 'ฟองสีส้มลอยขึ้นลง', 'light', 'counter', 24, 52, 2, 1),

  // things on the wall (posters are our own short summaries of the content sheets)
  place('poster', 'โปสเตอร์ลำดับการบูต', 70, 'ท่องจำง่าย ติดผนังไว้เลย', 'wallart', 'wall', 90, 120, 1),
  place('poster-win11', 'โปสเตอร์สเปก Windows 11', 70, 'CPU 64 บิต · RAM 4 GB · 64 GB · TPM 2.0', 'wallart', 'wall', 90, 120, 1),
  place('poster-gpt', 'โปสเตอร์ MBR กับ GPT', 70, 'BIOS ใช้ MBR · UEFI ใช้ GPT', 'wallart', 'wall', 90, 120, 1),
  place('poster-uefi', 'โปสเตอร์ UEFI · Secure Boot', 70, 'เช็กก่อนบูต Windows 11', 'wallart', 'wall', 90, 120, 1),
  place('poster-backup', 'โปสเตอร์ สำรองก่อนลบ', 60, 'สำรอง → ทดสอบเปิด → ค่อยลบ', 'wallart', 'wall', 90, 120, 1),
  place('poster-keys', 'โปสเตอร์ปุ่มเข้าเฟิร์มแวร์', 60, 'F2 · Del · F12 · Esc ดูคู่มือเครื่องก่อน', 'wallart', 'wall', 90, 120, 1),
  place('certificate', 'กรอบใบรับรองช่าง', 110, 'ใบรับรองฝีมือ ติดให้ลูกค้าเห็น', 'wallart', 'wall', 96, 72, 1, 2),
  place('clock', 'นาฬิกาแขวน', 45, 'บอกเวลานัดรับเครื่อง', 'wallart', 'wall', 54, 54, 1),

  // furniture
  place('sofa', 'โซฟารอคิว', 150, 'ลูกค้านั่งรอสบาย ๆ', 'furniture', 'floor', 180, 84, 1),
  place('chair', 'เก้าอี้รอคิว', 40, 'เก้าอี้ไม้ เรียงกี่ตัวก็ได้', 'furniture', 'floor', 46, 76, 4),
  place('rug', 'พรมหน้าร้าน', 65, 'พรมลายเรขาคณิต', 'furniture', 'floor', 220, 22, 2),
  place('coffee', 'โต๊ะกาแฟเล็ก', 55, 'มีแก้วกาแฟรอลูกค้า', 'furniture', 'floor', 70, 48, 2),
  place('water', 'ตู้กดน้ำ', 85, 'บริการน้ำเย็นฟรี', 'furniture', 'floor', 46, 116, 1),
  place('display', 'ตู้โชว์อะไหล่', 130, 'โชว์ RAM ฮาร์ดดิสก์ และการ์ดจอ', 'furniture', 'floor', 104, 150, 2, 1),
  place('wallshelf', 'ชั้นติดผนังวางของสะสม', 60, 'วางกล่องและของสะสม', 'furniture', 'wall', 120, 54, 3),

  // tech
  place('retro', 'คอมย้อนยุค', 120, 'จอหลังเต่าในตำนาน', 'tech', 'counter', 74, 66, 1),
  place('usbjar', 'โหลแฟลชไดรฟ์', 30, 'แฟลชไดรฟ์หลากสีเต็มโหล', 'tech', 'counter', 30, 38, 3),
  place('rgbpc', 'เคส PC ไฟ RGB', 150, 'ไฟเปลี่ยนสีได้', 'tech', 'bench', 52, 76, 1, 1),
  place('robot', 'หุ่นยนต์ช่างจิ๋ว', 95, 'ผู้ช่วยตัวน้อยถือไขควง', 'tech', 'bench', 38, 52, 2),
  place('server', 'ตู้เซิร์ฟเวอร์', 190, 'ไฟสถานะกะพริบ ดูโปร', 'tech', 'floor', 74, 164, 1, 2),
  place('tvwall', 'จอโชว์ Windows 11', 170, 'จอใหญ่ติดผนัง โชว์หน้าจอเริ่มต้น', 'tech', 'wall', 150, 92, 1, 2),
  place('arcade', 'ตู้เกมอาเขต', 230, 'ตู้เกมย้อนยุคไว้คลายเครียด', 'tech', 'floor', 84, 176, 1, 3),

  // pets
  place('cat', 'แมวประจำร้าน "ไบออส"', 150, 'ชอบนอนบนเคาน์เตอร์', 'pet', 'counter', 80, 52, 1),
  place('dog', 'หมาเฝ้าร้าน "อูฟี่"', 160, 'นอนรอลูกค้าหน้าร้าน', 'pet', 'floor', 86, 64, 1),
  place('fishtank', 'ตู้ปลา', 140, 'ปลาทองว่ายช้า ๆ ช่วยผ่อนคลาย', 'pet', 'counter', 84, 60, 1, 1),

  // fun
  place('trophy', 'ถ้วยรางวัลช่างดีเด่น', 180, 'ถ้วยทองสำหรับหัวหน้าช่าง', 'fun', 'counter', 40, 56, 1, 3),
  place('balloons', 'ช่อลูกโป่ง', 35, 'ฉลองเปิดร้าน', 'fun', 'floor', 60, 150, 3),
  place('bunting', 'ธงราวสีสัน', 35, 'ธงสามเหลี่ยมหลากสี', 'fun', 'wall', 260, 40, 3),
  place('welcome', 'ป้ายตั้ง "ยินดีต้อนรับ"', 55, 'ป้ายกระดานดำหน้าร้าน', 'fun', 'floor', 60, 96, 1),
  place('teddy', 'ตุ๊กตาหมี', 45, 'นั่งเป็นเพื่อนลูกค้า', 'fun', 'counter', 36, 40, 2),
  place('starmobile', 'ดาวห้อยเพดาน', 40, 'ดาวกระดาษหมุนช้า ๆ', 'fun', 'ceiling', 40, 40, 4),
]

export const DECOR_BY_ID: Record<string, DecorItem> = Object.fromEntries(DECOR.map(d => [d.id, d]))

/**
 * Where the five original items stood before decorations could be moved (save v3).
 * Migrated saves place them here so an existing shop looks the same.
 */
export const CLASSIC_SPOTS: Record<string, { x: number; y: number }> = {
  neon: { x: 150, y: 148 },
  poster: { x: 525, y: 216 },
  fern: { x: 620, y: 112 },
  cat: { x: 386, y: 272 },
  lamp: { x: 780, y: 302 },
}
