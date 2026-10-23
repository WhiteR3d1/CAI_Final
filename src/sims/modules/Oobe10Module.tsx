import { useState } from 'react'
import type { Oobe10Phase } from '../../game/scenarios'
import { useRun } from '../../screens/workbench/runContext'
import { BenchBar, Monitor } from '../common/Monitor'
import { Oobe } from '../windows/Oobe'
import { DoneButton } from './ModuleBits'
import '../windows/windows.css'
import './modules.css'

/** content sheet Win10 p.11–14: setup steps 10–16 the way the customer asked */
export function Oobe10Module({ phase, last, onDone }: { phase: Oobe10Phase; last: boolean; onDone: () => void }) {
  const run = useRun()
  const [done, setDone] = useState(false)

  return (
    <div className="module-oobe10">
      <Monitor label="เครื่องของลูกค้า · ตั้งค่าเริ่มต้นหลังติดตั้ง Windows 10">
        {done ? (
          <div className="module-setup-start">
            <strong>Hi</strong>
            <span>เข้า Windows แล้ว</span>
          </div>
        ) : (
          <Oobe
            onRegion={r => (r === phase.region ? run.log(`ขั้นที่ 10 เลือกภูมิภาค ${r}`) : run.mistake('oobe10-region', { lead: `เลือก ${r} ไว้ ใบงานขอ ${phase.region}` }))}
            onKeyboard={k => (k === phase.keyboard ? run.log(`ขั้นที่ 11 แป้นพิมพ์หลัก ${k}`) : run.mistake('oobe10-keyboard', { lead: `เลือก ${k} ไว้ ใบงานขอ ${phase.keyboard}` }))}
            onSecond={layout =>
              layout === phase.second
                ? run.log(layout ? `ขั้นที่ 12 เพิ่มแป้นพิมพ์ ${layout}` : 'ขั้นที่ 12 กด Skip ไม่เพิ่มแป้นที่สอง')
                : run.mistake('oobe10-second', { lead: layout ? `เพิ่ม ${layout} ไว้` : 'กด Skip ไปแล้ว' })
            }
            onAccount={(kind, next, back) => {
              if (kind !== phase.account) {
                run.mistake('oobe10-account', {
                  lead: phase.account === 'offline' ? 'ลูกค้าขอบัญชีในเครื่อง (Offline account)' : 'ลูกค้าต้องการใช้บัญชี Microsoft',
                  actions: [{ label: 'ย้อนกลับไปเลือกใหม่', variant: 'primary', onClick: back }],
                })
                return
              }
              run.log(kind === 'offline' ? 'ขั้นที่ 13 เลือก Offline account (Limited experience)' : 'ขั้นที่ 13 ใช้บัญชี Microsoft ตามที่ลูกค้าต้องการ')
              next()
            }}
            onName={name => {
              if (phase.user && name.toLowerCase() !== phase.user.toLowerCase()) run.mistake('oobe10-user', { lead: `ตั้งชื่อ ${name} ไว้ ใบงานขอ ${phase.user}` })
              else run.log(`ขั้นที่ 14 ตั้งชื่อผู้ใช้ ${name}`)
            }}
            onPassword={pw => {
              if (!pw) {
                run.mistake('oobe10-nopass', { actions: [{ label: 'กลับไปตั้งรหัสผ่าน', variant: 'primary' }] })
                return false
              }
              run.log('ตั้งรหัสผ่านสำหรับเข้าเครื่องแล้ว')
              return true
            }}
            onPrivacy={choices => {
              const still = choices.filter(c => phase.privacyOff.includes(c.id) && c.on)
              if (still.length) run.mistake('oobe10-privacy', { lead: `ยังเปิด ${still.map(c => c.label).join(', ')} อยู่` })
              else run.log('ขั้นที่ 16 ปิดความเป็นส่วนตัวตามที่ลูกค้าขอ แล้วกด Accept')
            }}
            onDone={() => {
              setDone(true)
              run.check('oobe10-done')
            }}
          />
        )}
      </Monitor>
      <BenchBar>
        <p>{done ? 'ตั้งค่าเริ่มต้นครบแล้ว' : 'ขั้นที่ 10–16: อ่านคำถามแต่ละหน้า แล้วเลือกให้ตรงกับใบงาน'}</p>
        <DoneButton ready={done} last={last} onDone={onDone} />
      </BenchBar>
    </div>
  )
}
