import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import type { Ready11Phase } from '../../game/scenarios'
import { useRun } from '../../screens/workbench/runContext'
import { BenchBar, Monitor } from '../common/Monitor'
import { Desktop, type DesktopApp } from '../desktop/Desktop'
import { PcHealthCheck, SystemInfo, TpmConsole } from '../win11/SystemTools'
import { DoneButton } from './ModuleBits'
import '../windows/windows.css'
import './modules.css'

const ANSWERS: { id: Ready11Phase['answer']; label: string }[] = [
  { id: 'firmware', label: 'ติดตั้งได้ หลังเปิด TPM / Secure Boot ในเมนู UEFI' },
  { id: 'unsupported', label: 'ไม่ควรติดตั้ง Windows 11 (ฮาร์ดแวร์ไม่ผ่านข้อกำหนด)' },
  { id: 'ready', label: 'พร้อมแล้ว ติดตั้ง Windows 11 ได้เลย' },
]

/** content sheet Win11 p.1: decide from PC Health Check, msinfo32 and tpm.msc whether the PC can take Windows 11 */
export function Ready11Module({ phase, last, onDone }: { phase: Ready11Phase; last: boolean; onDone: () => void }) {
  const run = useRun()
  const [asking, setAsking] = useState(false)
  const [answered, setAnswered] = useState(false)

  const choose = (id: Ready11Phase['answer']) => {
    setAsking(false)
    if (id !== phase.answer) {
      run.mistake('ready-wrong', { lead: `ตอบว่า "${ANSWERS.find(a => a.id === id)?.label}"` })
      return
    }
    setAnswered(true)
    run.log(`สรุปความพร้อมของ ${phase.pc}: ${ANSWERS.find(a => a.id === id)?.label}`)
    run.say('good', 'สรุปถูกต้องจากข้อมูลที่ตรวจ')
  }

  const apps: DesktopApp[] = [
    {
      id: 'health',
      title: 'PC Health Check',
      icon: 'shield',
      width: 560,
      height: 380,
      render: () => (
        <PcHealthCheck
          device={phase.pc}
          rows={phase.health}
          onChecked={() => {
            if (run.hasCheck('ready-health')) return
            run.check('ready-health')
            run.setStage('decide')
          }}
        />
      ),
    },
    { id: 'msinfo', title: 'System Information', icon: 'info', width: 600, height: 340, render: () => <SystemInfo rows={phase.info} /> },
    { id: 'tpm', title: 'TPM Management on Local Computer', icon: 'cpu', width: 520, height: 280, render: () => <TpmConsole ready={phase.tpmReady} /> },
  ]

  return (
    <div className="module-ready11">
      <Monitor label={`เครื่องของลูกค้า (${phase.pc}) · Windows 10`}>
        <Desktop
          wallpaper="blue"
          apps={apps}
          icons={[{ app: 'health', label: 'PC Health Check', icon: 'shield' }]}
          startMenu={[
            { label: 'PC Health Check', icon: 'shield', app: 'health' },
            { label: 'System Information (msinfo32)', icon: 'info', app: 'msinfo' },
            { label: 'TPM Management (tpm.msc)', icon: 'cpu', app: 'tpm' },
          ]}
          winxMenu={[{ label: 'System' }, { label: 'Device Manager' }, { label: 'Run' }]}
          search={q => (q.includes('health') ? 'health' : q.includes('msinfo') || q.includes('system information') ? 'msinfo' : q.includes('tpm') ? 'tpm' : null)}
          onOpenApp={id => {
            if (id === 'msinfo' && !run.hasCheck('ready-msinfo')) run.check('ready-msinfo')
          }}
        />
      </Monitor>
      <BenchBar>
        <p>{answered ? 'สรุปความพร้อมแล้ว' : 'ตรวจด้วย PC Health Check, msinfo32 และ tpm.msc แล้วกดสรุปความพร้อม'}</p>
        <button type="button" className="btn btn-gold btn-sm" disabled={answered} onClick={() => setAsking(true)}>
          <Icon name="clipboard" size={16} /> สรุปความพร้อม
        </button>
        <DoneButton ready={answered} last={last} onDone={onDone} />
      </BenchBar>
      {asking && (
        <Modal
          title={`สรุปความพร้อมของ ${phase.pc} สำหรับ Windows 11`}
          icon="clipboard"
          wide
          onClose={() => setAsking(false)}
          actions={[...ANSWERS.map(a => ({ label: a.label, onClick: () => choose(a.id) })), { label: 'ยังไม่สรุป', onClick: () => setAsking(false) }]}
        >
          <p>จากเครื่องมือที่ตรวจแล้ว เครื่องนี้พร้อมสำหรับ Windows 11 แค่ไหน</p>
        </Modal>
      )}
    </div>
  )
}
