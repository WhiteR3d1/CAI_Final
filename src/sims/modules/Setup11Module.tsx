import { useState } from 'react'
import type { Setup11Phase } from '../../game/scenarios'
import { useRun } from '../../screens/workbench/runContext'
import { BootMenu } from '../common/BootMenu'
import { BenchBar, Monitor } from '../common/Monitor'
import { PostScreen } from '../common/PostScreen'
import { Win11Setup } from '../win11/Win11Setup'
import { DoneButton } from './ModuleBits'
import './modules.css'

type Screen = 'setup' | 'post' | 'menu' | 'ready'

/** content sheet Win11 p.5–7: Windows 11 Setup on the right disk and edition, then let the PC restart by itself */
export function Setup11Module({ phase, last, onDone }: { phase: Setup11Phase; last: boolean; onDone: () => void }) {
  const run = useRun()
  const [screen, setScreen] = useState<Screen>('setup')
  const [round, setRound] = useState(0)
  const [boots, setBoots] = useState(0)
  const done = run.hasCheck('setup11-done')

  const finish = () => {
    setScreen('ready')
    run.check('setup11-done')
    run.log('ปล่อยให้เครื่องรีสตาร์ตและบูตต่อเองจาก Windows Boot Manager จนเข้า OOBE')
  }

  return (
    <div className="module-setup11">
      <Monitor label="เครื่องของลูกค้า · บูตจาก USB Windows 11 แบบ UEFI">
        {screen === 'setup' && (
          <Win11Setup
            key={round}
            parts={phase.parts}
            editions={phase.editions}
            onOption={option => {
              if (option === 'repair') {
                run.mistake('setup11-repair')
                return false
              }
              run.log('เลือก Install Windows 11 และติ๊กยอมรับว่าไฟล์ แอป และการตั้งค่าจะถูกลบ')
              return true
            }}
            onNoKey={() => run.log("ลูกค้ามีสิทธิ์แบบดิจิทัล จึงเลือก I don't have a product key")}
            onKeyRejected={() => run.say('info', "ใบงานไม่มี Product Key ให้ เครื่องนี้มีสิทธิ์แบบดิจิทัล กด I don't have a product key")}
            onEdition={edition => {
              if (edition !== phase.edition) {
                run.mistake('setup11-edition', { lead: `ลูกค้ามีสิทธิ์ ${phase.edition}`, modal: true, actions: [{ label: 'เลือกใหม่', variant: 'primary' }] })
                return false
              }
              run.log(`เลือกรุ่น ${edition} ให้ตรงกับสิทธิ์`)
              return true
            }}
            onDestroy={(part, mode, undo) => {
              if (part.disk !== phase.targetDisk || part.kind === 'data') {
                run.mistake('setup11-data', {
                  lead: `${mode === 'delete' ? 'ลบ' : 'ฟอร์แมต'} "${part.label}" ไปแล้ว`,
                  actions: [{ label: 'ย้อนกลับ (โหมดฝึก)', variant: 'primary', onClick: undo }],
                })
              } else run.log(`${mode === 'delete' ? 'ลบ' : 'ฟอร์แมต'} ${part.label} (Windows เดิมบน Disk ${part.disk})`)
            }}
            onTarget={part => {
              if (part.disk !== phase.targetDisk) {
                run.mistake('setup11-disk', { lead: `เลือก Disk ${part.disk} ไว้`, actions: [{ label: 'เลือกใหม่', variant: 'primary' }] })
                return false
              }
              if (part.kind !== 'unalloc') {
                run.say('info', `ใบเนื้อหาให้เลือกพื้นที่ว่าง (Unallocated Space) ให้ Setup สร้างพาร์ทิชันระบบแบบ GPT เอง ลบพาร์ทิชันของ Windows เดิมบน Disk ${phase.targetDisk} ก่อน`)
                return false
              }
              run.log(`เลือก ${part.label} แล้วกด Next ให้ Setup สร้างพาร์ทิชันระบบแบบ GPT`)
              return true
            }}
            onReady={() => {
              run.check('setup11-ready')
              run.log('ตรวจหน้า Ready to install (รุ่นที่เลือก · Keep nothing) แล้วกด Install')
            }}
            onRestart={() => {
              run.setStage('restart')
              setBoots(b => b + 1)
              setScreen('post')
            }}
          />
        )}
        {screen === 'post' && <PostScreen key={boots} seconds={7} untimed keys={['F12']} onKey={() => setScreen('menu')} onTimeout={finish} vendor="BLOOM" firmware="UEFI Firmware v1.08" />}
        {screen === 'menu' && (
          <BootMenu
            items={[
              { label: 'Windows Boot Manager', value: 'hdd' },
              { label: 'UEFI: USB Flash Drive, Partition 1', value: 'usb' },
            ]}
            onSelect={v => {
              if (v === 'usb') {
                run.mistake('setup11-reboot', {
                  actions: [
                    {
                      label: 'ย้อนกลับ (โหมดฝึก)',
                      variant: 'primary',
                      onClick: () => {
                        setBoots(b => b + 1)
                        setScreen('post')
                      },
                    },
                  ],
                })
              } else finish()
            }}
            onEscape={finish}
          />
        )}
        {screen === 'ready' && (
          <div className="module-setup-start">
            <strong>Getting ready</strong>
            <span>Windows 11 กำลังเตรียมหน้าตั้งค่าเริ่มต้น (OOBE)</span>
          </div>
        )}
      </Monitor>
      <BenchBar>
        <p>
          {done
            ? 'ติดตั้งเสร็จแล้ว'
            : screen === 'setup'
              ? 'ติดตั้ง Windows 11 ให้ตรงกับใบงาน: รุ่นตามสิทธิ์ และดิสก์ที่ถูกต้อง'
              : 'เครื่องรีสตาร์ตแล้ว ไม่ต้องบูต USB ซ้ำ ปล่อยให้เครื่องบูตต่อ'}
        </p>
        {screen === 'setup' && (
          <button type="button" className="btn btn-ghost btn-sm" onClick={() => setRound(r => r + 1)}>
            เริ่ม Setup ใหม่
          </button>
        )}
        <DoneButton ready={done} last={last} onDone={onDone} />
      </BenchBar>
    </div>
  )
}
