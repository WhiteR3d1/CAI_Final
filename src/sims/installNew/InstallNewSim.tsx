import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { LAB_KEY } from '../../data/jobs/installNew'
import type { EvidenceRule } from '../../game/types'
import { useRun } from '../../screens/workbench/runContext'
import { BiosSetup, type BiosInfoRow } from '../common/BiosSetup'
import { BootMenu } from '../common/BootMenu'
import { BenchBar, Monitor } from '../common/Monitor'
import { PostScreen } from '../common/PostScreen'
import { EvidenceAsk, type Verdict } from '../windows/EvidenceAsk'
import type { Part } from '../windows/media'
import { WinSetup, type SetupStep } from '../windows/WinSetup'
import '../windows/windows.css'

type Screen = 'off' | 'post' | 'bios' | 'bootmenu' | 'noboot' | 'setup' | 'done'

const HDD = 'SATA: WDC WD5000 (500GB)'
const USB = 'USB: KINGSTON DT (16GB)'
const NEW_DISK: Part[] = [{ id: 'u0', label: 'Drive 0 Unallocated Space', size: 465.8, free: 465.8, type: '', kind: 'unalloc' }]
const ARCH_RULE: EvidenceRule = { groups: [['wo-ram2']] }
const BIOS_INFO: BiosInfoRow[] = [
  { label: 'BIOS Version', value: '02.61' },
  { label: 'System Memory', value: '2048 MB' },
  { label: 'SATA Port 1', value: 'WDC WD5000 500GB' },
  { label: 'USB Device', value: 'KINGSTON DT 16GB' },
]

export function InstallNewSim() {
  const run = useRun()
  const [screen, setScreen] = useState<Screen>('off')
  const [boots, setBoots] = useState(0)
  const [setupRound, setSetupRound] = useState(0)
  const [timed, setTimed] = useState(false)
  const [reasoned, setReasoned] = useState(false)
  const [ask, setAsk] = useState<{ arch: 32 | 64; proceed: () => void } | null>(null)

  const powerOn = () => {
    setBoots(b => b + 1)
    setScreen('post')
  }

  const bootUsb = () => {
    setSetupRound(r => r + 1)
    setScreen('setup')
    run.setStage('setup')
    run.log('บูตจาก USB เข้าสู่ตัวติดตั้ง Windows 10 (ขั้นที่ 1)')
  }

  /* ---------- step 2: 32 or 64 bit ---------- */
  const decideArch = (arch: 32 | 64, proceed: () => void) => {
    if (arch === 64) {
      run.mistake('arch-64', { actions: [{ label: 'เลือกใหม่', variant: 'primary' }] })
      return
    }
    run.log('เลือก Windows Setup (32-bit) เพราะเครื่องมี RAM 2 GB น้อยกว่า 4 GB (ขั้นที่ 2)')
    proceed()
  }

  const judge = (verdict: Verdict) => {
    if (verdict === 'ok') {
      run.say('good', 'ใช้ RAM ของเครื่องเป็นหลักฐานได้ถูกต้อง')
      return
    }
    run.mistake(verdict === 'missing' ? 'ev-missing' : 'ev-irrelevant', { quiet: true })
    run.say('warn', verdict === 'missing' ? 'การเลือก 32 หรือ 64 บิตต้องดูจาก RAM ควรจดขนาด RAM จากใบงานไว้เป็นหลักฐาน' : 'หลักฐานบางข้อไม่เกี่ยวกับการเลือกจำนวนบิต ใช้ RAM อย่างเดียวก็พอ')
  }

  /* ---------- step 8: partition ---------- */
  const target = (part: Part) => {
    if (part.kind === 'unalloc') {
      run.mistake('part-size', {
        modal: true,
        lead: 'ถ้ากด Next ที่พื้นที่ว่างเลย ตัวติดตั้งจะใช้ทั้ง 465.8 GB เป็นไดรฟ์ C:',
        actions: [{ label: 'ย้อนกลับไปสร้างพาร์ทิชัน (โหมดฝึก)', variant: 'primary' }],
      })
      return false
    }
    const gb = part.size + 0.549
    if (part.kind === 'primary' && (gb < 95 || gb > 110)) {
      run.mistake('part-size', {
        modal: true,
        lead: `พาร์ทิชันที่สร้างมีขนาด ${gb.toFixed(1)} GB`,
        actions: [{ label: 'ลบแล้วสร้างใหม่ (โหมดฝึก)', variant: 'primary' }],
      })
      return false
    }
    run.log(`เลือกติดตั้งลง ${part.label} ขนาดประมาณ ${Math.round(gb)} GB (ขั้นที่ 8)`)
    return true
  }

  const onStep = (step: SetupStep) => {
    if (step === 'where') run.setStage('disk')
    if (step === 'installing') run.setStage('wait')
  }

  return (
    <div className="sim-install-new">
      <Monitor label="คอมห้องแล็บ · RAM 2 GB · ฮาร์ดดิสก์ใหม่ 500 GB · เสียบ USB Boot ไว้">
        {screen === 'off' && (
          <div className="poweroff">
            <Icon name="power" size={44} />
            <p>BIOS ตั้งให้ USB บูตก่อนแล้วจากงาน 02</p>
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
            keys={['F2', 'F12']}
            firmware="BIOS v02.61"
            onKey={k => setScreen(k === 'F2' ? 'bios' : 'bootmenu')}
            onTimeout={bootUsb}
          />
        )}
        {screen === 'bios' && (
          <BiosSetup
            mode="boot"
            variant="legacy"
            info={BIOS_INFO}
            drives={[USB, HDD]}
            onSaveExit={bootUsb}
            onDiscardExit={bootUsb}
            onNote={t => run.say('info', t)}
            onDrivesChange={() => run.say('info', 'ลำดับบูตตั้งไว้แล้วจากงาน 02 ไม่ต้องเปลี่ยน กด F10 หรือ Esc เพื่อออก')}
          />
        )}
        {screen === 'bootmenu' && (
          <BootMenu
            items={[
              { label: 'SATA: WDC WD5000AAKX (476940MB)', value: 'hdd' },
              { label: 'USB: KINGSTON DataTraveler (14784MB)', value: 'usb' },
              { label: 'Enter Setup', value: 'setup' },
            ]}
            onSelect={v => (v === 'usb' ? bootUsb() : v === 'hdd' ? setScreen('noboot') : setScreen('bios'))}
            onEscape={bootUsb}
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
        {screen === 'setup' && (
          <WinSetup
            key={setupRound}
            disk="new"
            parts={NEW_DISK}
            productKey={LAB_KEY}
            onStep={onStep}
            onArch={(arch, proceed) => (reasoned ? decideArch(arch, proceed) : setAsk({ arch, proceed }))}
            onLanguage={lang => {
              if (lang.time !== 'Thai (Thailand)') run.mistake('lang-format')
              else run.log('ตั้ง Time and currency format เป็น Thai (Thailand) ตามใบงาน (ขั้นที่ 3)')
            }}
            onKey={kind => {
              if (kind === 'key') {
                run.log('ใส่ Product Key ของโรงเรียน แล้วกด Next (ขั้นที่ 5)')
                return true
              }
              run.mistake('no-key', { modal: true, actions: [{ label: 'กลับไปใส่ Product Key', variant: 'primary' }] })
              return false
            }}
            onUpgrade={() =>
              run.mistake('setup-upgrade', {
                modal: true,
                lead: "ตัวติดตั้งแจ้งว่า: The upgrade option isn't available if you start your computer using Windows installation media.",
                actions: [{ label: 'เลือกใหม่', variant: 'primary' }],
              })
            }
            onCreate={mb => run.log(`สร้างพาร์ทิชันใหม่ขนาด ${mb.toLocaleString('en-US')} MB บนฮาร์ดดิสก์ใหม่ (ขั้นที่ 8)`)}
            onTarget={target}
            onPressKey={retry =>
              run.mistake('reboot-keypress', {
                modal: true,
                actions: [{ label: 'ย้อนกลับ (โหมดฝึก)', variant: 'primary', onClick: retry }],
              })
            }
            onInstalled={() => {
              setScreen('done')
              run.check('check-reach-oobe')
              run.log('ปล่อยให้เครื่องรีสตาร์ตเองโดยไม่กดปุ่ม จนเข้าหน้าตั้งค่าเริ่มต้น (ขั้นที่ 9)')
              run.say('good', 'ติดตั้งสำเร็จ! เครื่องเข้าหน้าตั้งค่าเริ่มต้นแล้ว ส่งงานได้เลย')
            }}
          />
        )}
        {screen === 'done' && (
          <div className="oobe">
            <h2>Let's start with region. Is this right?</h2>
            <p>หน้าตั้งค่าเริ่มต้น (ขั้นที่ 10) จะทำต่อในงาน 04</p>
            <div className="boot-success is-inline">
              <Icon name="check" size={22} />
              <p>ติดตั้ง Windows 10 ครบขั้นที่ 1–9 แล้ว</p>
            </div>
          </div>
        )}
      </Monitor>
      <BenchBar>
        <p>
          {screen === 'off' || screen === 'post' || screen === 'bootmenu' || screen === 'bios' || screen === 'noboot'
            ? 'ขั้นที่ 1: เปิดเครื่องให้บูตจาก USB (หรือกด F12 เลือก USB)'
            : screen === 'setup'
              ? 'ทำตามตัวติดตั้งทีละหน้า อ่านใบงานประกอบ'
              : 'ติดตั้งเสร็จแล้ว ส่งงานได้เลย'}
        </p>
        {screen !== 'setup' && screen !== 'done' && (
          <label className="switch">
            <input type="checkbox" checked={timed} onChange={e => setTimed(e.target.checked)} />
            <span>จับเวลาหน้าโลโก้เหมือนเครื่องจริง</span>
          </label>
        )}
        <button type="button" className="btn btn-primary btn-sm" disabled={screen !== 'done'} onClick={run.complete}>
          ส่งงาน <Icon name="arrowRight" size={16} />
        </button>
      </BenchBar>

      {ask && (
        <EvidenceAsk
          id="arch"
          title={`เลือก Windows Setup (${ask.arch}-bit) เพราะอะไร?`}
          rule={ARCH_RULE}
          confirmLabel="ยืนยันการเลือก"
          onCancel={() => setAsk(null)}
          onConfirm={verdict => {
            setReasoned(true)
            judge(verdict)
            const { arch, proceed } = ask
            setAsk(null)
            decideArch(arch, proceed)
          }}
        >
          <p>พี่บูตถาม: ใบเนื้อหาใช้อะไรตัดสินว่าจะติดตั้งแบบ 32 บิต หรือ 64 บิต แนบหลักฐานของเครื่องนี้</p>
        </EvidenceAsk>
      )}
    </div>
  )
}
