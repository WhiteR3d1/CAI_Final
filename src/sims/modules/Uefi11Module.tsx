import { useState } from 'react'
import { Icon } from '../../components/Icon'
import type { FirmwareState, Uefi11Phase } from '../../game/scenarios'
import { useRun } from '../../screens/workbench/runContext'
import { BiosSetup } from '../common/BiosSetup'
import { BootMenu } from '../common/BootMenu'
import { BenchBar, Monitor } from '../common/Monitor'
import { PostScreen } from '../common/PostScreen'
import { Desktop, type DesktopApp } from '../desktop/Desktop'
import { SystemInfo } from '../win11/SystemTools'
import { WindowsSecurity } from '../win11/WindowsSecurity'
import { DoneButton, InfoScreen } from './ModuleBits'
import '../windows/windows.css'
import './modules.css'

type Screen = 'windows' | 'post' | 'setup' | 'menu' | 'old' | 'blocked' | 'started'

const same = (a: FirmwareState, b: FirmwareState) => a.secureBoot === b.secureBoot && a.tpm === b.tpm && a.csm === b.csm

/** content sheet Win11 p.4–5: UEFI on, Secure Boot ready, TPM 2.0 on, then boot the USB from its UEFI entry */
export function Uefi11Module({ phase, last, onDone }: { phase: Uefi11Phase; last: boolean; onDone: () => void }) {
  const run = useRun()
  const [screen, setScreen] = useState<Screen>(phase.precheck ? 'windows' : 'post')
  const [boots, setBoots] = useState(0)
  const [fw, setFw] = useState<FirmwareState>(phase.start)
  const [saved, setSaved] = useState<FirmwareState>(phase.start)
  const [seen, setSeen] = useState({ msinfo: false, device: false })
  const done = run.hasCheck('uefi-boot')

  const restart = () => {
    setBoots(b => b + 1)
    setScreen('post')
  }

  const look = (what: 'msinfo' | 'device') => {
    const next = { ...seen, [what]: true }
    setSeen(next)
    if (next.msinfo && next.device && !run.hasCheck('uefi-precheck')) {
      run.check('uefi-precheck')
      run.log(`ตรวจก่อนเข้าเฟิร์มแวร์: BIOS Mode UEFI, Secure Boot ${phase.start.secureBoot ? 'On' : 'Off'}, TPM ${phase.start.tpm ? 'พบ' : 'ไม่พบ'}`)
    }
  }

  const bootUsb = () => {
    const problems: { id: string; lead: string }[] = []
    if (saved.csm) problems.push({ id: 'uefi-csm', lead: 'Boot Mode ยังเป็น Legacy + UEFI (CSM)' })
    if (!saved.secureBoot) problems.push({ id: 'uefi-secureboot', lead: 'Secure Boot ยังเป็น Disabled' })
    if (!saved.tpm) problems.push({ id: 'uefi-tpm', lead: 'TPM Device ยังเป็น Disabled' })
    if (problems.length) {
      problems.forEach((p, i) => run.mistake(p.id, i === 0 ? { lead: p.lead } : { lead: p.lead, modal: false }))
      setScreen('blocked')
      return
    }
    run.setStage('boot')
    run.check('uefi-boot')
    run.log(`เมนูบูต F12 เลือก "UEFI: ${phase.usb}, Partition 1" เข้า Windows 11 Setup ได้`)
    setScreen('started')
  }

  const apps: DesktopApp[] = [
    {
      id: 'msinfo',
      title: 'System Information',
      icon: 'info',
      width: 600,
      height: 330,
      render: () => (
        <SystemInfo
          rows={[
            ...phase.info,
            { label: 'BIOS Mode', value: phase.start.csm ? 'Legacy' : 'UEFI' },
            { label: 'Secure Boot State', value: phase.start.csm ? 'Unsupported' : phase.start.secureBoot ? 'On' : 'Off' },
          ]}
        />
      ),
    },
    {
      id: 'security',
      title: 'Windows Security',
      icon: 'shield',
      width: 620,
      height: 360,
      render: () => <WindowsSecurity tpm={phase.start.tpm} secureBoot={phase.start.secureBoot} onPage={p => p === 'device' && look('device')} />,
    },
  ]

  return (
    <div className="module-uefi11">
      <Monitor label="เครื่องของลูกค้า · เสียบ USB Windows 11 ไว้แล้ว">
        {screen === 'windows' && (
          <Desktop
            wallpaper="blue"
            apps={apps}
            icons={[{ app: 'security', label: 'Windows Security', icon: 'shield' }]}
            startMenu={[
              { label: 'System Information (msinfo32)', icon: 'info', app: 'msinfo' },
              { label: 'Windows Security', icon: 'shield', app: 'security' },
            ]}
            winxMenu={[{ label: 'System' }, { label: 'Run' }]}
            search={q => (q.includes('msinfo') || q.includes('system information') ? 'msinfo' : q.includes('security') ? 'security' : null)}
            onOpenApp={id => id === 'msinfo' && look('msinfo')}
          />
        )}
        {screen === 'post' && <PostScreen key={boots} seconds={7} untimed keys={['F2', 'F12']} onKey={k => setScreen(k === 'F2' ? 'setup' : 'menu')} onTimeout={() => setScreen('old')} vendor="BLOOM" firmware="UEFI Firmware v1.08" />}
        {screen === 'setup' && (
          <BiosSetup
            mode="boot"
            variant="uefi"
            info={phase.info}
            drives={[phase.disk, phase.usb]}
            security={fw}
            onSecurityChange={next => {
              setFw(next)
              run.setStage('firmware')
            }}
            onSaveExit={() => {
              setSaved(fw)
              run.log(`บันทึกเฟิร์มแวร์: Boot Mode ${fw.csm ? 'CSM' : 'UEFI'}, Secure Boot ${fw.secureBoot ? 'Enabled' : 'Disabled'}, TPM ${fw.tpm ? 'Enabled' : 'Disabled'}`)
              restart()
            }}
            onDiscardExit={() => {
              if (!same(fw, saved)) run.mistake('uefi-discard')
              setFw(saved)
              restart()
            }}
            onNote={text => run.say('info', text)}
          />
        )}
        {screen === 'menu' && (
          <BootMenu
            items={[
              { label: `Windows Boot Manager (${phase.disk})`, value: 'hdd' },
              { label: `UEFI: ${phase.usb}, Partition 1`, value: 'uefi' },
              ...(saved.csm ? [{ label: phase.usb, value: 'legacy' }] : []),
              { label: 'Enter Setup', value: 'setup' },
            ]}
            onSelect={v => {
              if (v === 'uefi') bootUsb()
              else if (v === 'legacy') {
                run.mistake('uefi-legacy', { actions: [{ label: 'รีสตาร์ตแล้วเลือกใหม่', variant: 'primary', onClick: restart }] })
              } else if (v === 'setup') setScreen('setup')
              else setScreen('old')
            }}
            onEscape={() => setScreen('old')}
          />
        )}
        {screen === 'old' && <InfoScreen title="Windows เดิมกำลังเริ่มระบบ…" text="เครื่องบูตจากดิสก์ ไม่ได้บูตจาก USB" action={{ label: 'รีสตาร์ตอีกครั้ง', onClick: restart }} />}
        {screen === 'blocked' && (
          <InfoScreen
            title="This PC can't run Windows 11"
            text="This PC doesn't currently meet Windows 11 system requirements. (Setup ตรวจพบว่าเฟิร์มแวร์ยังไม่พร้อม)"
            action={{ label: 'รีสตาร์ตเข้าเมนูเฟิร์มแวร์', onClick: restart }}
          />
        )}
        {screen === 'started' && (
          <div className="module-setup-start">
            <Icon name="start" size={28} />
            <strong>Windows 11 Setup</strong>
            <span>Select language settings</span>
          </div>
        )}
      </Monitor>
      <BenchBar>
        <p>
          {done
            ? 'บูต USB แบบ UEFI สำเร็จ'
            : screen === 'windows'
              ? 'ตรวจ msinfo32 และ Windows Security > Device security ก่อน แล้วรีสตาร์ตเข้าเมนูเฟิร์มแวร์'
              : 'F2 เข้าเมนูเฟิร์มแวร์ ตั้ง UEFI/Secure Boot/TPM แล้ว F10 · รีสตาร์ตแล้ว F12 เลือก USB แบบ UEFI'}
        </p>
        {screen === 'windows' && (
          <button type="button" className="btn btn-gold btn-sm" onClick={restart}>
            <Icon name="refresh" size={16} /> รีสตาร์ตเครื่อง
          </button>
        )}
        <DoneButton ready={done} last={last} onDone={onDone} />
      </BenchBar>
    </div>
  )
}
