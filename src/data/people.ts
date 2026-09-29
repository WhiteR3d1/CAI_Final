import type { Person } from '../game/types.ts'

export const MENTOR: Person = {
  name: 'พี่บูต',
  role: 'หัวหน้าช่างประจำร้าน',
  look: { skin: '#e3b58f', hair: '#2b2420', hairStyle: 'cap', shirt: '#2f5e4b', accessory: 'none' },
}

export const PLOY: Person = {
  name: 'คุณพลอย',
  role: 'เจ้าของสำนักงานบัญชีพลอยใจ',
  look: { skin: '#f2c9a7', hair: '#3b2a22', hairStyle: 'bob', shirt: '#c07f5f', accessory: 'none' },
}

export const KENG: Person = {
  name: 'คุณเก่ง',
  role: 'ช่างภาพอิสระ',
  look: { skin: '#d6a07a', hair: '#1f1a17', hairStyle: 'spiky', shirt: '#3d6f8e', accessory: 'camera' },
}

export const ANN: Person = {
  name: 'ครูแอน',
  role: 'ครูดูแลห้องคอมพิวเตอร์ของโรงเรียน',
  look: { skin: '#efc3a0', hair: '#5a3a2a', hairStyle: 'bun', shirt: '#7d6aa8', accessory: 'glasses' },
}
