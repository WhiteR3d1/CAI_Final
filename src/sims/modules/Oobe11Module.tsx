import { useState } from 'react'
import { Icon } from '../../components/Icon'
import type { Oobe11Phase } from '../../game/scenarios'
import { useRun } from '../../screens/workbench/runContext'
import { BenchBar, Monitor } from '../common/Monitor'
import { Desktop } from '../desktop/Desktop'
import { Win11Oobe, type Oobe11Step } from '../win11/Win11Oobe'
import { DoneButton } from './ModuleBits'
import '../windows/windows.css'
import './modules.css'

/** content sheet Win11 p.7–8: country, keyboard, network, account, PIN and privacy as the customer wants */
export function Oobe11Module({ phase, last, onDone }: { phase: Oobe11Phase; last: boolean; onDone: () => void }) {
  const run = useRun()
  const [step, setStep] = useState<Oobe11Step>('region')
  const [typed, setTyped] = useState(false)
  const [done, setDone] = useState(false)

  return (
    <div className="module-oobe11">
      <Monitor label="เครื่องของลูกค้า · Windows 11 ตั้งค่าครั้งแรก">
        {done ? (
          <Desktop variant="win11" wallpaper="bloom" apps={[]} icons={[]} startMenu={[]} winxMenu={[]} />
        ) : (
          <Win11Oobe
            networks={phase.networks}
            passwordEntered={typed}
            onStep={setStep}
            onRegion={r => (r === phase.region ? run.log(`เลือกประเทศ ${r}`) : run.mistake('oobe11-region', { lead: `เลือก ${r} ไว้ ใบงานขอ ${phase.region}` }))}
            onKeyboard={k => (k === phase.keyboard ? run.log(`เลือกแป้นพิมพ์ ${k}`) : run.mistake('oobe11-keyboard', { lead: `เลือก ${k} ไว้ ใบงานขอ ${phase.keyboard}` }))}
            onSecond={layout =>
              layout === phase.second
                ? run.log(layout ? `เพิ่มแป้นพิมพ์ที่สอง ${layout}` : 'ไม่เพิ่มแป้นที่สอง (Skip)')
                : run.mistake('oobe11-second', { lead: layout ? `เพิ่ม ${layout} ไว้` : 'กด Skip ไปแล้ว' })
            }
            onConnect={(ssid, password) => {
              if (ssid !== phase.wifi.ssid) {
                run.say('warn', `${ssid} ไม่ใช่ Wi-Fi ของลูกค้า ใบงานให้เชื่อม ${phase.wifi.ssid}`)
                return false
              }
              if (password !== phase.wifi.password) return false
              run.log(`เชื่อมต่อ Wi-Fi ${ssid}`)
              return true
            }}
            onNoInternet={back => run.mistake('oobe11-nonet', { actions: [{ label: 'กลับไปเชื่อมต่อเครือข่าย', variant: 'primary', onClick: back }] })}
            onName={name => run.log(name ? `ตั้งชื่อเครื่อง ${name}` : 'ข้ามการตั้งชื่อเครื่อง')}
            onSetupType={kind => {
              if (kind !== phase.setup) {
                run.mistake('oobe11-setup', { lead: phase.setup === 'personal' ? 'เครื่องนี้เป็นเครื่องส่วนตัวของลูกค้า' : 'เครื่องนี้องค์กรเป็นผู้จัดการ', actions: [{ label: 'เลือกใหม่', variant: 'primary' }] })
                return false
              }
              run.log(kind === 'personal' ? 'เลือก Set up for personal use' : 'เลือก Set up for work or school')
              return true
            }}
            onAccount={email => {
              if (email.toLowerCase() !== phase.email.toLowerCase()) {
                run.mistake('oobe11-account', { lead: `ใส่ ${email} ไว้ ใบงานให้ใช้บัญชี ${phase.email}`, actions: [{ label: 'แก้ไข', variant: 'primary' }] })
                return false
              }
              run.log(`ลงชื่อเข้าใช้ด้วยบัญชี Microsoft ของลูกค้า (${phase.email})`)
              return true
            }}
            onPin={() => {
              run.log('ตั้ง PIN (Windows Hello) ร่วมกับลูกค้า')
              return true
            }}
            onPrivacy={choices => {
              const still = choices.filter(c => phase.privacyOff.includes(c.id) && c.on)
              if (still.length) run.mistake('oobe11-privacy', { lead: `ยังเปิด ${still.map(c => c.label).join(', ')} อยู่` })
              else run.log('ทบทวนความเป็นส่วนตัวทีละรายการ ปิดส่วนที่ลูกค้าไม่ต้องการ แล้วกด Accept')
            }}
            onDone={() => {
              setDone(true)
              run.check('oobe11-done')
              run.say('good', 'เข้าเดสก์ท็อป Windows 11 แล้ว')
            }}
          />
        )}
      </Monitor>
      <BenchBar>
        <p>{done ? 'ตั้งค่าเริ่มต้นครบแล้ว' : step === 'password' && !typed ? 'หน้ารหัสผ่านบัญชี Microsoft: ให้ลูกค้าพิมพ์รหัสผ่านเอง' : 'ตอบแต่ละหน้าให้ตรงกับใบงาน'}</p>
        {step === 'password' && !typed && !done && (
          <button
            type="button"
            className="btn btn-gold btn-sm"
            onClick={() => {
              setTyped(true)
              run.log('ให้ลูกค้าพิมพ์รหัสผ่านบัญชี Microsoft ด้วยตัวเอง')
            }}
          >
            <Icon name="users" size={16} /> ให้ลูกค้าพิมพ์รหัสผ่านเอง
          </button>
        )}
        <DoneButton ready={done} last={last} onDone={onDone} />
      </BenchBar>
    </div>
  )
}
