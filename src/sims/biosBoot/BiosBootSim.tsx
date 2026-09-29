import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { useRun } from '../../screens/workbench/runContext'
import { BiosSetup, type BiosInfoRow, type BiosView } from '../common/BiosSetup'
import { BenchBar, Monitor } from '../common/Monitor'
import { PostScreen } from '../common/PostScreen'
import '../windows/windows.css'

type Stage = 'enter' | 'order' | 'save' | 'test'
type Screen = 'off' | 'post' | 'bios' | 'noboot' | 'bootmgr'

const HDD = 'SATA: WDC WD5000 (500GB)'
const USB = 'USB: KINGSTON DT (16GB)'

const BIOS_INFO: BiosInfoRow[] = [
  { label: 'BIOS Version', value: '02.61' },
  { label: 'Processor', value: 'Bloom Core 2 Duo 2.4GHz' },
  { label: 'System Memory', value: '2048 MB' },
  { label: 'SATA Port 1', value: 'WDC WD5000 500GB' },
  { label: 'USB Device', value: 'KINGSTON DT 16GB', fact: 'bs-usb' },
]

export function BiosBootSim() {
  const run = useRun()
  const [stage, setStageLocal] = useState<Stage>('enter')
  const [screen, setScreen] = useState<Screen>('off')
  const [boots, setBoots] = useState(0)
  const [timed, setTimed] = useState(false)
  const [order, setOrder] = useState([HDD, USB])
  const [saved, setSaved] = useState([HDD, USB])

  const toStage = (next: Stage) => {
    setStageLocal(next)
    run.setStage(next)
  }

  const powerOn = () => {
    setBoots(b => b + 1)
    setScreen('post')
  }

  const bootBy = (list: string[]) => {
    if (list[0] === USB) {
      setScreen('bootmgr')
      toStage('test')
      if (!run.hasCheck('check-boot-usb')) {
        run.check('check-boot-usb')
        run.log('รีสตาร์ตแล้วเครื่องบูตจาก USB เข้าหน้า Windows Boot Manager ได้')
      }
    } else setScreen('noboot')
  }

  const changeOrder = (next: string[]) => {
    setOrder(next)
    if (next[0] === USB) {
      run.log('BIOS: Boot → Hard Disk Drives → 1st Drive = USB: KINGSTON (ขั้นที่ 3–5)')
      if (stage === 'order') toStage('save')
    }
  }

  const onView = (view: BiosView) => {
    if (view === 'priority' && order[0] === USB && !run.hasCheck('check-order')) {
      run.check('check-order')
      run.log('เปิด Boot Device Priority เห็น USB เป็นลำดับแรกแล้ว (ขั้นที่ 6)')
    }
  }

  return (
    <div className="sim-bios-boot">
      <Monitor label="คอมห้องแล็บของครูแอน · เสียบ USB Boot Windows 10 ไว้แล้ว">
        {screen === 'off' && (
          <div className="poweroff">
            <Icon name="power" size={44} />
            <p>เครื่องปิดอยู่</p>
            <button type="button" className="btn btn-gold" onClick={powerOn}>
              <Icon name="power" size={16} /> เปิดเครื่อง
            </button>
          </div>
        )}
        {screen === 'post' && (
          <PostScreen
            key={boots}
            seconds={7}
            untimed={!timed}
            keys={['F2']}
            firmware="BIOS v02.61"
            onKey={() => {
              setOrder(saved)
              setScreen('bios')
              if (stage === 'enter') toStage('order')
              run.log('Restart แล้วกด F2 เข้าหน้าตั้งค่า BIOS (ขั้นที่ 1)')
            }}
            onTimeout={() => bootBy(saved)}
          />
        )}
        {screen === 'bios' && (
          <BiosSetup
            mode="boot"
            variant="legacy"
            info={BIOS_INFO}
            drives={order}
            onDrivesChange={changeOrder}
            onView={onView}
            onDisable={() => run.mistake('bios-disable')}
            onSaveExit={() => {
              setSaved(order)
              if (order[0] === USB) run.log('กด F10 แล้วเลือก OK บันทึกการตั้งค่าและออกจาก BIOS (ขั้นที่ 6–7)')
              bootBy(order)
            }}
            onDiscardExit={() => {
              if (order[0] !== saved[0]) run.mistake('bios-no-save')
              setOrder(saved)
              bootBy(saved)
            }}
            onNote={t => run.say('info', t)}
          />
        )}
        {screen === 'noboot' && (
          <div className="noboot" role="status">
            <p>Reboot and Select proper Boot device</p>
            <p>or Insert Boot Media in selected Boot device and press a key_</p>
            <button type="button" className="btn btn-gold btn-sm" onClick={powerOn}>
              <Icon name="refresh" size={16} /> รีสตาร์ต
            </button>
          </div>
        )}
        {screen === 'bootmgr' && (
          <div className="bootmgr-wrap">
            <div className="bootmgr">
              <div className="bootmgr-head">Windows Boot Manager</div>
              <p>Choose an operating system to start, or press TAB to select a tool:</p>
              <p className="bootmgr-dim">(Use the arrow keys to highlight your choice, then press ENTER.)</p>
              <button type="button" className="on" tabIndex={-1}>
                Windows Setup (64-bit)
              </button>
              <button type="button" tabIndex={-1}>
                Windows Setup (32-bit)
              </button>
              <div className="bootmgr-foot">ENTER=Choose · TAB=Menu · ESC=Cancel</div>
            </div>
            <div className="boot-success">
              <Icon name="check" size={22} />
              <p>บูตจาก USB สำเร็จ! เครื่องเข้าสู่ตัวติดตั้ง Windows แล้ว (การติดตั้งจะทำในงาน 03)</p>
            </div>
          </div>
        )}
      </Monitor>
      <BenchBar>
        <p>
          {screen === 'noboot'
            ? 'เครื่องยังบูตจากฮาร์ดดิสก์ใหม่ที่ว่างอยู่ รีสตาร์ตแล้วกด F2 เข้า BIOS'
            : stage === 'enter'
              ? 'ขั้นที่ 1: เปิดเครื่องแล้วกด F2 เข้าหน้าตั้งค่า BIOS'
              : stage === 'order'
                ? 'ขั้นที่ 2–5: แท็บ Boot → Hard Disk Drives → 1st Drive เลือก USB'
                : stage === 'save'
                  ? 'ขั้นที่ 6–7: กด F10 แล้วเลือก OK เพื่อบันทึกและออก'
                  : 'เครื่องบูตจาก USB แล้ว ส่งงานได้เลย'}
        </p>
        <label className="switch">
          <input type="checkbox" checked={timed} onChange={e => setTimed(e.target.checked)} />
          <span>จับเวลาหน้าโลโก้เหมือนเครื่องจริง (7 วินาที)</span>
        </label>
        <button type="button" className="btn btn-primary btn-sm" disabled={!run.hasCheck('check-boot-usb')} onClick={run.complete}>
          ส่งงาน <Icon name="arrowRight" size={16} />
        </button>
      </BenchBar>
    </div>
  )
}
