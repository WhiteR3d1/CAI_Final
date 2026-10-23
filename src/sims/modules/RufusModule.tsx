import { useState } from 'react'
import type { RufusPhase } from '../../game/scenarios'
import { useRun } from '../../screens/workbench/runContext'
import { BenchBar, Monitor } from '../common/Monitor'
import { SCHEME_LABEL, type RufusConfig } from '../windows/media'
import { Rufus } from '../windows/Rufus'
import { DoneButton } from './ModuleBits'
import './modules.css'

/** content sheet Win10 p.1–3: pick the right device, partition scheme and ISO in Rufus */
export function RufusModule({ phase, last, onDone }: { phase: RufusPhase; last: boolean; onDone: () => void }) {
  const run = useRun()
  const [round, setRound] = useState(0)
  const [done, setDone] = useState(false)
  const label = (id: string) => phase.devices.find(d => d.id === id)?.label ?? id

  const start = (config: RufusConfig) => {
    if (config.device !== phase.target) {
      run.mistake('rufus-device', {
        lead: `เลือก ${label(config.device)} ไว้ ข้อมูลในอุปกรณ์นั้นจะถูกลบหมด!`,
        actions: [{ label: 'ย้อนกลับ (โหมดฝึก)', variant: 'primary', onClick: () => setRound(r => r + 1) }],
      })
      return false
    }
    if (config.boot !== 'iso') {
      run.mistake('rufus-boot', { actions: [{ label: 'ตั้งค่าใหม่', variant: 'primary' }] })
      return false
    }
    if (config.iso?.name !== phase.iso) {
      run.mistake('rufus-iso', { lead: config.iso ? `เลือก ${config.iso.name} ไว้` : undefined, actions: [{ label: 'เลือกไฟล์ใหม่', variant: 'primary' }] })
      return false
    }
    if (config.scheme !== phase.scheme) {
      run.mistake('rufus-scheme', { lead: `เลือก "${SCHEME_LABEL[config.scheme]}" ไว้`, actions: [{ label: 'ตั้งค่าใหม่', variant: 'primary' }] })
      return false
    }
    run.log(`ตั้ง Rufus: Device = ${label(config.device)}, ${SCHEME_LABEL[config.scheme]}, ISO ${phase.iso} แล้วกด Start`)
    return true
  }

  return (
    <div className="module-rufus">
      <Monitor label="เครื่องของร้าน · เสียบอุปกรณ์ของลูกค้าไว้แล้ว">
        <div className="module-pc">
          <Rufus
            key={round}
            devices={phase.devices}
            isos={phase.isos}
            defaultScheme={phase.scheme === 'gpt-uefi' ? 'mbr-bios' : 'gpt-uefi'}
            onStart={start}
            onDone={() => {
              setDone(true)
              run.check('rufus-done')
              run.say('good', 'Rufus ขึ้น DONE แล้ว USB พร้อมนำไปติดตั้ง')
            }}
          />
        </div>
      </Monitor>
      <BenchBar>
        <p>{done ? 'สร้าง USB เสร็จแล้ว' : 'อ่านใบงาน แล้วตั้ง Device, Partition scheme และไฟล์ ISO ให้ถูกก่อนกด Start'}</p>
        <DoneButton ready={done} last={last} onDone={onDone} />
      </BenchBar>
    </div>
  )
}
