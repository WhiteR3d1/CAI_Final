import type { JobDef } from '../../game/types.ts'
import { ANN } from '../people.ts'

// Content sheet (ใบเนื้อหา) pages 11–15: ขั้นที่ 10–16 ตั้งค่าหลังติดตั้ง และขั้นที่ 17 ตรวจ Windows Update
export const firstSetupJob: JobDef = {
  id: 'first-setup',
  order: 4,
  code: 'งาน 04',
  title: 'ตั้งค่าเริ่มต้นและอัปเดต Windows',
  tagline: 'ตั้งภูมิภาค แป้นพิมพ์ บัญชีผู้ใช้ และความเป็นส่วนตัว แล้วตรวจ Windows Update',
  customer: ANN,
  intake: [
    'เครื่องขึ้นหน้าสีฟ้าถามภูมิภาคแล้วค่ะ ช่วยตั้งค่าให้เสร็จเลยนะคะ',
    'เครื่องนี้นักเรียนใช้ร่วมกัน ไม่อยากผูกกับบัญชี Microsoft ของใคร ขอเป็นบัญชีในเครื่องชื่อ Lab01 และตั้งรหัสผ่านด้วยค่ะ',
    'นักเรียนต้องพิมพ์ภาษาไทยได้ แล้วขอปิดการแชร์ตำแหน่งกับโฆษณาด้วยนะคะ',
  ],
  workOrder: [
    { label: 'ภูมิภาค', value: 'ประเทศไทย', fact: 'wo-th' },
    { label: 'แป้นพิมพ์', value: 'US เป็นหลัก และเพิ่มภาษาไทย (Thai Kedmanee)', fact: 'wo-kb' },
    { label: 'บัญชีผู้ใช้', value: 'บัญชีในเครื่อง (Offline account) ชื่อ Lab01 พร้อมรหัสผ่าน', fact: 'wo-offline' },
    { label: 'ความเป็นส่วนตัว', value: 'ปิด Location (ตำแหน่ง) และ Advertising ID (โฆษณา)', fact: 'wo-privacy' },
    { label: 'งาน', value: 'ตั้งค่าเริ่มต้นขั้นที่ 10–16 แล้วตรวจ Windows Update ขั้นที่ 17' },
  ],
  objectives: [
    { id: 'o1', text: 'ตั้งค่าเริ่มต้นขั้นที่ 10–16 ตามความต้องการของลูกค้า', rules: [{ criterion: 'accuracy', min: 0.75 }] },
    { id: 'o2', text: 'เลือกบัญชีผู้ใช้และความเป็นส่วนตัวให้ปลอดภัยสำหรับเครื่องที่ใช้ร่วมกัน', rules: [{ criterion: 'dataSafety', min: 0.8 }] },
    { id: 'o3', text: 'ตรวจ Windows Update และรีสตาร์ตจนเป็นเวอร์ชันล่าสุด', rules: [{ criterion: 'testing', min: 1 }] },
  ],
  units: ['ใบเนื้อหา หน้า 11–15'],
  manualNo: 4,
  reward: 200,
  minutes: 10,
  requires: 'install-new',
  criteria: ['accuracy', 'reasoning', 'dataSafety', 'testing'],
  learn: {
    title: 'ตั้งค่าหลังติดตั้งและตรวจอัปเดต (ขั้นที่ 10–17)',
    blocks: [
      {
        kind: 'table',
        title: 'ขั้นที่ 10–16',
        head: ['ขั้น', 'หน้าจอ', 'ทำอะไร'],
        rows: [
          ['10', "Let's start with region", 'เลือก Thailand แล้วกด Yes'],
          ['11', 'Keyboard layout', 'ตัวอย่างเลือก US แล้วกด Yes'],
          ['12', 'Second keyboard layout', 'ต้องการแป้นที่สองกด Add layout ถ้าไม่ต้องการกด Skip'],
          ['13', 'Sign in with Microsoft', 'ใช้ Microsoft Account หรือ Create account'],
          ['14', 'Offline account', 'ตั้งชื่อ User และ Password (ถ้าใช้ Microsoft Account อาจต้องตั้ง PIN)'],
          ['15', 'Phone / OneDrive', 'สำหรับ Microsoft Account ถ้าไม่ต้องการกด Next'],
          ['16', 'Privacy settings', 'เปิด (On) เฉพาะที่ต้องใช้ เปลี่ยนภายหลังได้ แล้วกด Accept'],
        ],
      },
      {
        kind: 'points',
        title: 'ขั้นที่ 17: ตรวจ Windows Update',
        items: [
          'คลิกช่องค้นหาที่ Taskbar แล้วพิมพ์ **Windows Update**',
          'กด Check for updates รอให้ดาวน์โหลดและติดตั้ง แล้วกด **Restart now** ตามหน้าจอ',
          'รีสตาร์ตแล้วใส่รหัสผ่านที่ตั้งไว้เพื่อเข้าเครื่อง จากนั้นเปิด Windows Update อีกครั้ง ถ้าขึ้น **You\'re up to date** แปลว่า Windows เป็นเวอร์ชันล่าสุดแล้ว',
        ],
      },
      {
        kind: 'note',
        tone: 'tip',
        title: 'Offline account คืออะไร',
        text: 'Offline account (บัญชีในเครื่อง) เข้าใช้ด้วยชื่อผู้ใช้และรหัสผ่านที่ตั้งในเครื่อง ไม่ต้องใช้อีเมล หน้า Sign in with Microsoft มีลิงก์ Offline account อยู่มุมซ้ายล่าง',
      },
    ],
    more: [
      {
        kind: 'note',
        tone: 'extra',
        text: 'Location คือการให้แอปรู้ตำแหน่งของเครื่อง ส่วน Advertising ID ใช้ติดตามพฤติกรรมเพื่อแสดงโฆษณา เครื่องที่หลายคนใช้ร่วมกันควรปิดสิ่งที่ไม่จำเป็น',
      },
      {
        kind: 'note',
        tone: 'extra',
        title: 'สิ่งที่ Windows 10 รุ่นใหม่ถามเพิ่ม',
        text: 'หลังกด Offline account จะมีหน้า "Sign in with Microsoft instead?" ให้กด Limited experience (มุมซ้ายล่าง) และถ้าตั้งรหัสผ่าน จะให้ยืนยันรหัสผ่านและตั้งคำถามความปลอดภัย 3 ข้อ ไว้ใช้ตอนลืมรหัสผ่าน',
      },
    ],
    refs: ['ใบเนื้อหา หน้า 11–15 ขั้นตอนที่ 10–17'],
  },
  demo: [
    {
      title: 'อ่านคำถามก่อนกด Yes',
      say: 'หน้าตั้งค่าเริ่มต้นจะถามทีละเรื่อง พี่อ่านคำถาม เลือกให้ตรงกับที่ลูกค้าต้องการ แล้วค่อยกด Yes ในรายการภูมิภาค Taiwan กับ Tajikistan อยู่ใกล้ Thailand ต้องดูให้ดี',
    },
    {
      title: 'หาลิงก์ Offline account',
      say: 'หน้า Sign in with Microsoft มีช่องใส่อีเมล ถ้าลูกค้าไม่ต้องการบัญชี Microsoft ให้มองหาลิงก์ Offline account มุมซ้ายล่าง Windows จะถามอีกครั้งว่าจะใช้บัญชี Microsoft ไหม ให้กด Limited experience แล้วตั้งชื่อผู้ใช้กับรหัสผ่าน',
    },
    {
      title: 'อัปเดตหลังเข้า Windows',
      say: 'เข้า Windows แล้ว พี่พิมพ์ Windows Update ในช่องค้นหา กด Check for updates รอดาวน์โหลด แล้วกด Restart now พอกลับมาต้องเห็น You\'re up to date',
    },
  ],
  stages: [
    { id: 'region', label: 'ภูมิภาคและแป้นพิมพ์ (ขั้นที่ 10–12)' },
    { id: 'account', label: 'บัญชีผู้ใช้ (ขั้นที่ 13–15)' },
    { id: 'privacy', label: 'ความเป็นส่วนตัว (ขั้นที่ 16)' },
    { id: 'update', label: 'Windows Update (ขั้นที่ 17)' },
  ],
  hints: {
    region: ['เลือก Thailand แล้วกด Yes', 'แป้นหลักเลือก US แล้วกด Yes', 'แป้นที่สองกด Add layout แล้วเลือก Thai Kedmanee เพราะนักเรียนต้องพิมพ์ภาษาไทย'],
    account: [
      'อย่าใส่อีเมล ให้กดลิงก์ Offline account มุมซ้ายล่าง แล้วกด Limited experience',
      'ตั้งชื่อ Lab01 ใส่รหัสผ่าน ยืนยันรหัสผ่านให้ตรงกัน แล้วตั้งคำถามความปลอดภัย 3 ข้อ (จำรหัสผ่านไว้ ต้องใช้ตอนรีสตาร์ต)',
    ],
    privacy: ['กดปิด Location และ Advertising ID ให้เป็น No แล้วกด Accept'],
    update: [
      'พิมพ์ Windows Update ในช่องค้นหาที่ Taskbar แล้วกด Enter',
      'กด Check for updates รอจนขึ้นปุ่ม Restart now แล้วกด',
      'หลังรีสตาร์ต คลิกหน้าจอล็อก ใส่รหัสผ่านที่ตั้งไว้ แล้วเปิด Windows Update อีกครั้งเพื่อดูว่าขึ้น You\'re up to date',
    ],
  },
  evidence: {
    'wo-th': { label: 'เครื่องใช้งานในประเทศไทย', source: 'ใบสั่งงาน' },
    'wo-kb': { label: 'แป้นพิมพ์ US และเพิ่มภาษาไทย', source: 'ใบสั่งงาน' },
    'wo-offline': { label: 'นักเรียนใช้ร่วมกัน ขอบัญชีในเครื่อง Lab01 พร้อมรหัสผ่าน', source: 'ใบสั่งงาน' },
    'wo-privacy': { label: 'ปิด Location และ Advertising ID', source: 'ใบสั่งงาน' },
  },
  mistakes: {
    'oobe-region': {
      label: 'เลือกภูมิภาคไม่ใช่ Thailand',
      severity: 'minor',
      criterion: 'accuracy',
      explain: 'ขั้นที่ 10 ให้เลือกภูมิภาคที่ใช้งาน เครื่องนี้อยู่ประเทศไทยจึงเลือก Thailand ภูมิภาคมีผลกับรูปแบบวันที่และบริการในเครื่อง',
      ref: 'ใบเนื้อหา หน้า 11',
    },
    'oobe-keyboard': {
      label: 'เลือกแป้นพิมพ์หลักไม่ตรงกับใบงาน',
      severity: 'minor',
      criterion: 'accuracy',
      explain: 'ขั้นที่ 11 ตัวอย่างในใบเนื้อหาเลือก US และใบงานก็ขอ US เป็นแป้นหลัก',
      ref: 'ใบเนื้อหา หน้า 11–12',
    },
    'oobe-no-thai': {
      label: 'ไม่ได้เพิ่มแป้นพิมพ์ภาษาไทย',
      severity: 'minor',
      criterion: 'accuracy',
      explain: 'ขั้นที่ 12 ถ้าต้องการแป้นพิมพ์ที่สองให้กด Add layout (ถ้าไม่ต้องการจึงกด Skip) ครูแอนบอกว่านักเรียนต้องพิมพ์ภาษาไทย จึงควรเพิ่ม Thai Kedmanee',
      ref: 'ใบเนื้อหา หน้า 12',
    },
    'oobe-ms-account': {
      label: 'ใช้บัญชี Microsoft ทั้งที่ลูกค้าขอบัญชีในเครื่อง',
      severity: 'major',
      criterion: 'accuracy',
      explain: 'ขั้นที่ 13–14 เลือกได้ว่าจะใช้ Microsoft Account หรือ Offline account เครื่องนี้นักเรียนใช้ร่วมกัน ครูแอนจึงขอบัญชีในเครื่องชื่อ Lab01',
      ref: 'ใบเนื้อหา หน้า 12–13',
    },
    'oobe-username': {
      label: 'ตั้งชื่อผู้ใช้ไม่ตรงกับใบงาน',
      severity: 'minor',
      criterion: 'accuracy',
      explain: 'ใบงานขอชื่อผู้ใช้ Lab01 เพื่อให้ครูจัดการเครื่องในห้องแล็บได้ง่าย',
    },
    'oobe-no-password': {
      label: 'สร้างบัญชีโดยไม่ตั้งรหัสผ่าน',
      severity: 'major',
      criterion: 'dataSafety',
      explain: 'ขั้นที่ 14 ให้กำหนดชื่อ User และ Password สำหรับเข้าสู่ระบบ ครูแอนขอให้ตั้งรหัสผ่าน ถ้าไม่มีรหัสผ่าน ใครก็เข้าเครื่องได้',
      ref: 'ใบเนื้อหา หน้า 13',
    },
    'oobe-privacy': {
      label: 'ไม่ได้ปิดการตั้งค่าความเป็นส่วนตัวตามใบงาน',
      severity: 'minor',
      criterion: 'dataSafety',
      explain: 'ขั้นที่ 16 ให้เปิดเฉพาะฟังก์ชันที่ต้องใช้ ครูแอนขอปิด Location และ Advertising ID',
      ref: 'ใบเนื้อหา หน้า 14–15',
    },
    'ev-missing': {
      label: 'เลือกชนิดบัญชีโดยยังไม่มีหลักฐานจากใบงาน',
      severity: 'minor',
      criterion: 'reasoning',
      explain: 'ก่อนเลือกชนิดบัญชี ควรจดความต้องการของลูกค้าเรื่องบัญชีผู้ใช้ไว้เป็นหลักฐาน',
    },
    'ev-irrelevant': {
      label: 'ใช้หลักฐานที่ไม่เกี่ยวกับการเลือกชนิดบัญชี',
      severity: 'minor',
      criterion: 'reasoning',
      explain: 'ภูมิภาคหรือแป้นพิมพ์ไม่ได้บอกว่าต้องใช้บัญชีแบบไหน หลักฐานที่ตรงคือความต้องการเรื่องบัญชีผู้ใช้',
    },
  },
  checks: [{ id: 'check-update', label: 'อัปเดต Windows กด Restart แล้วเปิด Windows Update อีกครั้งจนเห็น You\'re up to date (ขั้นที่ 17)', required: true }],
  principles: [
    'ขั้นที่ 10–12: ภูมิภาค Thailand → แป้นพิมพ์หลัก → แป้นที่สอง (ต้องการกด Add layout ไม่ต้องการกด Skip)',
    'ขั้นที่ 13–14: เลือก Microsoft Account หรือ Offline account แล้วตั้งชื่อผู้ใช้และรหัสผ่าน',
    'ขั้นที่ 16: เปิดเฉพาะการตั้งค่าความเป็นส่วนตัวที่ต้องใช้ แล้วกด Accept',
    'ขั้นที่ 17: ค้นหา Windows Update ตรวจอัปเดต แล้วกด Restart',
  ],
  quiz: [
    {
      id: 'q-offline',
      kind: 'transfer',
      prompt: 'เครื่องที่นักเรียนหลายคนใช้ร่วมกัน ควรตั้งบัญชีแบบใดในขั้นที่ 13–14',
      choices: [
        { text: 'Offline account (บัญชีในเครื่อง) พร้อมรหัสผ่าน', correct: true, feedback: 'ถูกต้อง ไม่ผูกกับบัญชีส่วนตัวของใคร และยังมีรหัสผ่านป้องกัน' },
        { text: 'บัญชี Microsoft ของนักเรียนคนแรกที่ใช้เครื่อง', feedback: 'ข้อมูลในบัญชีนั้นจะปนกับคนอื่นที่ใช้เครื่องร่วมกัน' },
        { text: 'บัญชีในเครื่องแบบไม่ต้องมีรหัสผ่าน', feedback: 'ใบเนื้อหาให้กำหนดทั้งชื่อ User และ Password' },
      ],
      ref: 'ใบเนื้อหา หน้า 12–13',
    },
    {
      id: 'q-skip',
      kind: 'reason',
      prompt: 'หน้า "Do you want to add a second keyboard layout?" ถ้าไม่ต้องการเพิ่มแป้นพิมพ์ควรกดปุ่มใด',
      choices: [
        { text: 'Skip', correct: true, feedback: 'ถูกต้อง ตามขั้นที่ 12 ในใบเนื้อหา' },
        { text: 'Add layout', feedback: 'Add layout ใช้เมื่อต้องการเพิ่มแป้นพิมพ์ภาษาที่สอง' },
        { text: 'ปิดเครื่องแล้วเริ่มใหม่', feedback: 'ไม่จำเป็น กด Skip เพื่อข้ามได้เลย' },
      ],
      ref: 'ใบเนื้อหา หน้า 12',
    },
    {
      id: 'q-update',
      kind: 'reason',
      prompt: 'ติดตั้ง Windows เสร็จแล้ว ทำไมใบเนื้อหาให้ตรวจ Windows Update ในขั้นที่ 17',
      choices: [
        { text: 'เพื่อตรวจว่า Windows ที่ติดตั้งเป็นเวอร์ชันล่าสุด', correct: true, feedback: 'ถูกต้อง แล้วกด Restart ตามหน้าจอเพื่อให้อัปเดตเสร็จ' },
        { text: 'เพื่อเปลี่ยนภาษาของเครื่อง', feedback: 'ภาษาตั้งไว้แล้วตั้งแต่ขั้นที่ 3 และ 10–12' },
        { text: 'เพื่อสร้างบัญชีผู้ใช้ใหม่', feedback: 'บัญชีผู้ใช้สร้างไว้แล้วในขั้นที่ 13–14' },
      ],
      ref: 'ใบเนื้อหา หน้า 15',
    },
  ],
  thanks: 'เรียบร้อยครบทุกขั้นเลย นักเรียนใช้เครื่องนี้ได้แล้ว ขอบคุณมากนะคะ',
}
