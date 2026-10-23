import { useState } from 'react'
import type { BootPhase } from '../../game/scenarios'
import { useRun } from '../../screens/workbench/runContext'
import { BiosSetup } from '../common/BiosSetup'
import { BenchBar, Monitor } from '../common/Monitor'
import { PostScreen } from '../common/PostScreen'
import { DoneButton, InfoScreen } from './ModuleBits'
import './modules.css'

type Screen = 'post' | 'setup' | 'old' | 'usb'

/** content sheet Win10 p.3–6: F2 → Boot → Hard Disk Drives → 1st Drive = USB → F10 */
export function BootModule({ phase, last, onDone }: { phase: BootPhase; last: boolean; onDone: () => void }) {
  const run = useRun()
  const [screen, setScreen] = useState<Screen>('post')
  const [boots, setBoots] = useState(0)
  const [order, setOrder] = useState(phase.drives)
  const [saved, setSaved] = useState(phase.drives)
  const done = run.hasCheck('boot-usb')

  const restart = () => {
    setBoots(b => b + 1)
    setScreen('post')
  }
  const bootBy = (list: string[]) => {
    if (list[0] === phase.usb) {
      setScreen('usb')
      run.check('boot-usb')
      run.log('เครื่องบูตจาก USB เข้าสู่ตัวติดตั้งได้')
    } else {
      setScreen('old')
      run.say('info', `เครื่องบูตจาก ${list[0]} เพราะลำดับแรกยังไม่ใช่ USB ลองรีสตาร์ตแล้วกด F2 อีกครั้ง`)
    }
  }

  return (
    <div className="module-boot">
      <Monitor label="เครื่องของลูกค้า · เสียบ USB ติดตั้งไว้แล้ว">
        {screen === 'post' && <PostScreen key={boots} seconds={7} untimed keys={['F2']} onKey={() => setScreen('setup')} onTimeout={() => bootBy(saved)} vendor="BLOOM BOARD" firmware="BIOS v02.61" />}
        {screen === 'setup' && (
          <BiosSetup
            mode="boot"
            variant="legacy"
            info={phase.info}
            drives={order}
            onDrivesChange={setOrder}
            onSaveExit={() => {
              setSaved(order)
              if (order[0] !== phase.usb) run.mistake('boot-wrong', { lead: `ลำดับแรกตอนนี้คือ ${order[0]}` })
              else run.log('ตั้ง Boot → Hard Disk Drives → 1st Drive = USB แล้วกด F10 บันทึกและออก')
              restart()
            }}
            onDiscardExit={() => {
              if (order.join() !== saved.join()) run.mistake('boot-nosave')
              setOrder(saved)
              restart()
            }}
            onDisable={() => run.mistake('boot-disable')}
            onNote={text => run.say('info', text)}
          />
        )}
        {screen === 'old' && <InfoScreen title={`กำลังเริ่มระบบจาก ${saved[0]}…`} text="เครื่องไม่ได้บูตจาก USB" action={{ label: 'รีสตาร์ตอีกครั้ง', onClick: restart }} />}
        {screen === 'usb' && (
          <div className="module-setup-start">
            <strong>Windows Setup</strong>
            <span>Loading files…</span>
          </div>
        )}
      </Monitor>
      <BenchBar>
        <p>{done ? 'เครื่องบูตจาก USB แล้ว' : 'กด F2 เข้า BIOS ตั้ง USB เป็นลำดับแรก แล้ว F10 บันทึก'}</p>
        <DoneButton ready={done} last={last} onDone={onDone} />
      </BenchBar>
    </div>
  )
}
