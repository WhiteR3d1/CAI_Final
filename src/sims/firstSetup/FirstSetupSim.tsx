import { useState } from 'react'
import { Icon } from '../../components/Icon'
import type { EvidenceRule } from '../../game/types'
import { useRun } from '../../screens/workbench/runContext'
import { BenchBar, Monitor } from '../common/Monitor'
import { Desktop, RestartScreen, type DesktopApp } from '../desktop/Desktop'
import { SettingsApp, UpdatePage, type UpdateState } from '../desktop/SettingsApp'
import { EvidenceAsk, type Verdict } from '../windows/EvidenceAsk'
import { Oobe, type OobeStep } from '../windows/Oobe'
import '../windows/windows.css'

type Phase = 'oobe' | 'desktop' | 'restarting'

const ACCOUNT_RULE: EvidenceRule = { groups: [['wo-offline']] }

export function FirstSetupSim() {
  const run = useRun()
  const [phase, setPhase] = useState<Phase>('oobe')
  const [update, setUpdate] = useState<UpdateState>('idle')
  const [desktopRound, setDesktopRound] = useState(0)
  const [reasoned, setReasoned] = useState(false)
  const [ask, setAsk] = useState<{ next: () => void } | null>(null)
  const [user, setUser] = useState('Lab01')

  const onStep = (step: OobeStep) => {
    if (step === 'account') run.setStage('account')
    if (step === 'privacy') run.setStage('privacy')
  }

  const judge = (verdict: Verdict) => {
    if (verdict === 'ok') {
      run.say('good', 'เหตุผลชัดเจน: ครูแอนขอบัญชีในเครื่อง เพราะนักเรียนใช้เครื่องร่วมกัน')
      return
    }
    run.mistake(verdict === 'missing' ? 'ev-missing' : 'ev-irrelevant', { quiet: true })
    run.say('warn', verdict === 'missing' ? 'ควรจดความต้องการเรื่องบัญชีผู้ใช้จากใบงานไว้เป็นหลักฐานก่อนเลือก' : 'ภูมิภาคหรือแป้นพิมพ์ไม่ได้บอกว่าต้องใช้บัญชีแบบไหน')
  }

  /* ---------- step 17: Windows Update ---------- */
  const checkUpdates = () => {
    setUpdate('checking')
    window.setTimeout(() => setUpdate(u => (u === 'checking' ? 'restart' : u)), 1800)
  }
  const restartForUpdate = () => {
    setPhase('restarting')
    window.setTimeout(() => {
      setUpdate('done')
      setDesktopRound(r => r + 1)
      setPhase('desktop')
      if (!run.hasCheck('check-update')) {
        run.check('check-update')
        run.log('ค้นหา Windows Update กด Check for updates แล้ว Restart จนขึ้น You\'re up to date (ขั้นที่ 17)')
      }
    }, 2400)
  }

  const apps: DesktopApp[] = [
    {
      id: 'settings',
      title: 'Settings',
      icon: 'gear',
      width: 600,
      height: 320,
      render: () => (
        <SettingsApp
          initial="update"
          pages={[
            { id: 'update', label: 'Windows Update', icon: 'refresh', render: () => <UpdatePage state={update} onCheck={checkUpdates} onRestart={restartForUpdate} /> },
            {
              id: 'accounts',
              label: 'Accounts',
              icon: 'users',
              render: () => (
                <div className="w-settings-page">
                  <h2>Your info</h2>
                  <p>
                    <strong>{user}</strong>
                    <br />
                    Local account (บัญชีในเครื่อง) · Administrator
                  </p>
                </div>
              ),
            },
          ]}
        />
      ),
    },
    {
      id: 'explorer',
      title: 'This PC',
      icon: 'folder',
      width: 480,
      height: 260,
      render: () => (
        <div className="w-app">
          <p>Local Disk (C:) · Windows 10 ติดตั้งใหม่ · ว่าง 72 GB จาก 99 GB</p>
          <p>DATA (D:) · สำหรับเก็บงานนักเรียน</p>
        </div>
      ),
    },
  ]

  return (
    <div className="sim-first-setup">
      <Monitor label="คอมห้องแล็บ · หลังติดตั้ง Windows 10 เสร็จ">
        {phase === 'oobe' && (
          <Oobe
            onStep={onStep}
            onRegion={r => (r === 'Thailand' ? run.log('ขั้นที่ 10 เลือกภูมิภาค Thailand') : run.mistake('oobe-region', { lead: `เลือก ${r} ไว้` }))}
            onKeyboard={k => (k === 'US' ? run.log('ขั้นที่ 11 แป้นพิมพ์หลัก US') : run.mistake('oobe-keyboard', { lead: `เลือก ${k} ไว้` }))}
            onSecond={layout =>
              layout === 'Thai Kedmanee'
                ? run.log('ขั้นที่ 12 เพิ่มแป้นพิมพ์ Thai Kedmanee เพราะนักเรียนต้องพิมพ์ภาษาไทย')
                : run.mistake('oobe-no-thai', { lead: layout ? `เพิ่ม ${layout} แทนภาษาไทย` : 'กด Skip ไปแล้ว' })
            }
            onAccount={(kind, next, back) => {
              if (kind === 'microsoft') {
                run.mistake('oobe-ms-account', {
                  actions: [
                    { label: 'ย้อนกลับไปเลือก Offline account (โหมดฝึก)', variant: 'primary', onClick: back },
                    { label: 'ดูขั้นตอนบัญชี Microsoft ต่อ (ขั้นที่ 14–15)', onClick: next },
                  ],
                })
                return
              }
              if (reasoned) next()
              else setAsk({ next })
            }}
            onName={name => {
              setUser(name)
              if (name.toLowerCase() === 'lab01') run.log('ขั้นที่ 14 สร้าง Offline account ชื่อ Lab01')
              else run.mistake('oobe-username', { lead: `ตั้งชื่อ ${name} ไว้` })
            }}
            onPassword={has => {
              if (has) {
                run.log('ตั้งรหัสผ่านสำหรับเข้าสู่ระบบแล้ว')
                return true
              }
              run.mistake('oobe-no-password', { actions: [{ label: 'กลับไปตั้งรหัสผ่าน', variant: 'primary' }] })
              return false
            }}
            onPrivacy={choices => {
              const open = choices.filter(c => (c.id === 'location' || c.id === 'ads') && c.on)
              if (open.length) run.mistake('oobe-privacy', { lead: `ยังเปิด ${open.map(c => c.label).join(' และ ')} อยู่` })
              else run.log('ขั้นที่ 16 ปิด Location และ Advertising ID ตามใบงาน แล้วกด Accept')
            }}
            onDone={() => {
              setPhase('desktop')
              run.setStage('update')
              run.say('info', 'เข้า Windows แล้ว ขั้นสุดท้าย (ขั้นที่ 17) ค้นหา Windows Update เพื่อตรวจว่าเป็นเวอร์ชันล่าสุด')
            }}
          />
        )}
        {phase === 'restarting' && <RestartScreen label="Working on updates · Don't turn off your computer" />}
        {phase === 'desktop' && (
          <Desktop
            key={desktopRound}
            wallpaper="blue"
            apps={apps}
            icons={[{ app: 'explorer', label: 'This PC', icon: 'monitor' }]}
            startMenu={[
              { label: 'File Explorer', icon: 'folder', app: 'explorer' },
              { label: 'Settings', icon: 'gear', app: 'settings' },
            ]}
            winxMenu={[{ label: 'Settings', app: 'settings' }, { label: 'File Explorer', app: 'explorer' }, { label: 'Device Manager' }, { label: 'Run' }]}
            search={q => (q.includes('update') || q.includes('อัปเดต') || q.includes('setting') ? 'settings' : null)}
            initialOpen={update === 'done' ? ['settings'] : []}
          />
        )}
      </Monitor>
      <BenchBar>
        <p>
          {phase === 'oobe'
            ? 'ขั้นที่ 10–16: อ่านคำถามแต่ละหน้า แล้วเลือกให้ตรงกับใบงาน'
            : update === 'done'
              ? 'Windows เป็นเวอร์ชันล่าสุดแล้ว ส่งงานได้เลย'
              : 'ขั้นที่ 17: พิมพ์ Windows Update ในช่องค้นหาที่ Taskbar'}
        </p>
        <button type="button" className="btn btn-primary btn-sm" disabled={phase !== 'desktop'} onClick={run.complete}>
          ส่งงาน <Icon name="arrowRight" size={16} />
        </button>
      </BenchBar>

      {ask && (
        <EvidenceAsk
          id="account"
          title="เลือก Offline account เพราะอะไร?"
          rule={ACCOUNT_RULE}
          confirmLabel="ยืนยันการเลือก"
          onCancel={() => setAsk(null)}
          onConfirm={verdict => {
            setReasoned(true)
            judge(verdict)
            const { next } = ask
            setAsk(null)
            run.log('ขั้นที่ 13 เลือก Offline account แทน Microsoft Account')
            next()
          }}
        >
          <p>พี่บูตถาม: ทำไมเครื่องนี้ใช้บัญชีในเครื่อง (Offline account) แทนบัญชี Microsoft แนบหลักฐานจากใบงาน</p>
        </EvidenceAsk>
      )}
    </div>
  )
}
