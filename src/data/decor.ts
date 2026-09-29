export interface DecorItem {
  id: string
  name: string
  price: number
  blurb: string
}

export const DECOR: DecorItem[] = [
  { id: 'fern', name: 'ต้นเฟิร์นแขวน', price: 80, blurb: 'สีเขียวให้ร้านสดชื่น' },
  { id: 'poster', name: 'โปสเตอร์ลำดับการบูต', price: 120, blurb: 'ท่องจำง่าย ติดผนังไว้เลย' },
  { id: 'lamp', name: 'โคมไฟโต๊ะซ่อม', price: 150, blurb: 'แสงอุ่น ๆ มองน็อตตัวเล็กได้ชัด' },
  { id: 'neon', name: 'ป้ายไฟ OPEN', price: 200, blurb: 'ลูกค้าเห็นแต่ไกล' },
  { id: 'cat', name: 'แมวประจำร้าน', price: 250, blurb: 'ชื่อ "ไบออส" ชอบนอนบนเคาน์เตอร์' },
]
