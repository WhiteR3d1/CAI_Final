// Turns the shop scene (its stacked SVG layers) into a PNG with a caption, entirely in the browser.
// Web fonts are not available inside an SVG image, so the scene falls back to system fonts;
// the caption is drawn on the canvas afterwards and uses the page fonts.

export interface ShopCaption {
  title: string
  owner: string
  level: string
  items: number
}

const W = 2000
const H = 920
const CAPTION = 170

function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const img = new Image()
    img.onload = () => resolve(img)
    img.onerror = () => reject(new Error('โหลดภาพฉากร้านไม่สำเร็จ'))
    img.src = url
  })
}

/** the scene's layers merged into one standalone SVG document */
export function sceneSvg(scene: HTMLElement): string {
  const layers = [...scene.querySelectorAll<SVGSVGElement>('svg.scene-layer')]
  const inner = layers.map(svg => svg.innerHTML).join('')
  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1000 460" width="${W}" height="${H}">${inner}</svg>`
}

export async function exportShopPng(scene: HTMLElement, caption: ShopCaption): Promise<Blob> {
  const url = URL.createObjectURL(new Blob([sceneSvg(scene)], { type: 'image/svg+xml;charset=utf-8' }))
  try {
    const img = await loadImage(url)
    await document.fonts?.ready
    const canvas = document.createElement('canvas')
    canvas.width = W
    canvas.height = H + CAPTION
    const ctx = canvas.getContext('2d')
    if (!ctx) throw new Error('เบราว์เซอร์นี้วาดภาพไม่ได้')
    ctx.drawImage(img, 0, 0, W, H)

    ctx.fillStyle = '#193d35'
    ctx.fillRect(0, H, W, CAPTION)
    ctx.fillStyle = '#e8bd6a'
    ctx.fillRect(0, H, W, 8)

    ctx.textBaseline = 'alphabetic'
    ctx.fillStyle = '#e8bd6a'
    ctx.font = '600 64px Mitr, Tahoma, sans-serif'
    ctx.fillText(caption.title, 64, H + 88)
    ctx.fillStyle = '#fffdf3'
    ctx.font = '36px "IBM Plex Sans Thai", Tahoma, sans-serif'
    const who = caption.owner ? `เจ้าของร้าน: ${caption.owner}` : 'เจ้าของร้าน: (ยังไม่ได้ใส่ชื่อ)'
    ctx.fillText(`${who} · ${caption.level} · ของตกแต่ง ${caption.items} ชิ้น`, 64, H + 140)
    ctx.textAlign = 'right'
    ctx.fillStyle = '#b9cbb8'
    ctx.font = '30px "IBM Plex Sans Thai", Tahoma, sans-serif'
    ctx.fillText('Boot & Bloom · ร้านซ่อมคอมจำลอง', W - 64, H + 140)

    return await new Promise<Blob>((resolve, reject) =>
      canvas.toBlob(b => (b ? resolve(b) : reject(new Error('สร้างไฟล์รูปไม่สำเร็จ'))), 'image/png'),
    )
  } finally {
    URL.revokeObjectURL(url)
  }
}
