import { useState } from 'react'
import type { Setup10Phase } from '../../game/scenarios'
import { useRun } from '../../screens/workbench/runContext'
import { BenchBar, Monitor } from '../common/Monitor'
import { WinSetup } from '../windows/WinSetup'
import { DoneButton } from './ModuleBits'
import './modules.css'

/** content sheet Win10 p.6–11: Windows 10 Setup steps 1–9 on the customer's disk */
export function Setup10Module({ phase, last, onDone }: { phase: Setup10Phase; last: boolean; onDone: () => void }) {
  const run = useRun()
  const [done, setDone] = useState(false)
  const arch = phase.ramGb >= 4 ? 64 : 32

  return (
    <div className="module-setup10">
      <Monitor label="เครื่องของลูกค้า · บูตจาก USB ติดตั้ง Windows 10">
        <WinSetup
          disk={phase.disk}
          parts={phase.parts}
          bootMode={phase.bootMode}
          diskStyle={phase.diskStyle}
          productKey={phase.productKey}
          editions={phase.editions}
          onArch={(picked, proceed) => {
            if (picked !== arch) {
              run.mistake('setup10-arch', { lead: `เครื่องนี้มี RAM ${phase.ramGb} GB`, actions: [{ label: 'เลือกใหม่', variant: 'primary' }] })
              return
            }
            run.log(`เลือก Windows Setup (${arch}-bit) เพราะเครื่องมี RAM ${phase.ramGb} GB`)
            proceed()
          }}
          onKey={kind => {
            if (kind === 'nokey' && phase.productKey) {
              run.mistake('setup10-key', { lead: 'ใบงานมี Product Key ให้มาแล้ว', modal: true, actions: [{ label: 'กลับไปใส่ Product Key', variant: 'primary' }] })
              return false
            }
            run.log(kind === 'key' ? 'ใส่ Product Key ตามใบงาน (ขั้นที่ 5)' : "เครื่องเคยเปิดใช้งานแล้ว จึงกด I don't have a product key")
            return true
          }}
          onKeyRejected={() =>
            run.say('info', phase.productKey ? 'คีย์ไม่ตรงกับใบงาน ตรวจตัวอักษรอีกครั้ง' : "ใบงานไม่มี Product Key เครื่องนี้เคยเปิดใช้งานแล้ว ให้กด I don't have a product key")
          }
          onEdition={edition => {
            if (phase.edition && edition !== phase.edition) {
              run.mistake('setup10-edition', { lead: `ลูกค้ามีสิทธิ์ ${phase.edition}`, modal: true, actions: [{ label: 'เลือกใหม่', variant: 'primary' }] })
              return false
            }
            run.log(`เลือกรุ่น ${edition} ให้ตรงกับลิขสิทธิ์`)
            return true
          }}
          onUpgrade={() => run.mistake('setup10-upgrade', { lead: 'หน้า Compatibility report บอกว่า Upgrade ใช้ไม่ได้เมื่อบูตจาก USB กด Close แล้วเลือก Custom' })}
          onCreate={mb => run.log(`สร้างพาร์ทิชันขนาด ${mb.toLocaleString()} MB บนดิสก์ใหม่`)}
          onDestroy={(part, mode, undo) => {
            if (part.kind === 'data') {
              run.mistake('setup10-data', { lead: `${mode === 'delete' ? 'ลบ' : 'ฟอร์แมต'} "${part.label}" ไปแล้ว`, actions: [{ label: 'ย้อนกลับ (โหมดฝึก)', variant: 'primary', onClick: undo }] })
            } else run.log(`${mode === 'delete' ? 'ลบ' : 'ฟอร์แมต'}พาร์ทิชัน ${part.label}`)
          }}
          onTarget={part => {
            if (part.kind === 'data') {
              run.mistake('setup10-target', { actions: [{ label: 'เลือกพาร์ทิชันใหม่', variant: 'primary' }] })
              return false
            }
            run.log(`เลือกติดตั้งลง ${part.label} (ขั้นที่ 8)`)
            return true
          }}
          onPressKey={retry => run.mistake('setup10-keypress', { modal: true, actions: [{ label: 'ย้อนกลับ (โหมดฝึก)', variant: 'primary', onClick: retry }] })}
          onInstalled={() => {
            setDone(true)
            run.check('setup10-done')
            run.log('ติดตั้งเสร็จ เครื่องรีสตาร์ตเองโดยไม่กดปุ่ม (ขั้นที่ 9)')
          }}
        />
      </Monitor>
      <BenchBar>
        <p>{done ? 'ติดตั้งเสร็จ เครื่องพร้อมตั้งค่าเริ่มต้น' : 'ติดตั้ง Windows 10 ตามขั้นที่ 1–9 ให้ตรงกับใบงาน'}</p>
        <DoneButton ready={done} last={last} onDone={onDone} />
      </BenchBar>
    </div>
  )
}
