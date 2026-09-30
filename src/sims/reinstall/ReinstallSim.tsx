import { useEffect, useEffectEvent, useState } from 'react'
import { Icon } from '../../components/Icon'
import { useRun } from '../../screens/workbench/runContext'
import { BiosSetup, type BiosInfoRow } from '../common/BiosSetup'
import { BootMenu } from '../common/BootMenu'
import { BenchBar, Monitor } from '../common/Monitor'
import { PostScreen } from '../common/PostScreen'
import { Desktop, type DesktopApp } from '../desktop/Desktop'
import { FileExplorer, type FsNode } from '../desktop/FileExplorer'
import { ActivationPage, SettingsApp, UpdatePage, type UpdateState } from '../desktop/SettingsApp'
import { SCHEME_LABEL, UPDATE_MS, type Part, type RufusConfig, type RufusDevice } from '../windows/media'
import { Oobe } from '../windows/Oobe'
import { Rufus } from '../windows/Rufus'
import { SignIn, WorkingOnUpdates } from '../windows/WindowsBoot'
import { WinSetup } from '../windows/WinSetup'
import './reinstall.css'

const COPY_MS = 8000

/** Windows' copy progress dialog, sped up (a real copy of 1.21 TB takes hours). */
function CopyDialog({ onDone }: { onDone: () => void }) {
  const [percent, setPercent] = useState(0)
  const done = useEffectEvent(() => onDone())
  useEffect(() => {
    const started = Date.now()
    const t = window.setInterval(() => {
      const p = Math.min(100, Math.floor(((Date.now() - started) / COPY_MS) * 100))
      setPercent(p)
      if (p >= 100) {
        window.clearInterval(t)
        done()
      }
    }, 150)
    return () => window.clearInterval(t)
  }, [])
  const hours = Math.max(0, 3 - (percent / 100) * 3)
  return (
    <div className="copy-dialog" role="status">
      <strong>Copying 12,480 items from PHOTOS (D:) to SHOP-BACKUP (E:)</strong>
      <small>{percent}% complete</small>
      <div className="copy-bar">
        <span style={{ transform: `scaleX(${percent / 100})` }} />
      </div>
      <small>Speed: 118 MB/s · Time remaining: About {hours >= 1 ? `${Math.ceil(hours)} hours` : `${Math.ceil(hours * 60)} minutes`}</small>
      <small className="muted">(เกมเร่งเวลาให้ ของจริงใช้เวลาหลายชั่วโมง)</small>
    </div>
  )
}

type Stage = 'backup' | 'rufus' | 'bios' | 'setup' | 'oobe' | 'verify'
type BiosScreen = 'post' | 'setup' | 'bootmenu' | 'oldwin'

const HDD = 'SATA: WDC WD40EZRZ (4TB)'
const USB = 'USB: KINGSTON DT (16GB)'
const DEVICES: RufusDevice[] = [
  { id: 'E', label: 'SHOP-BACKUP (E:) [2TB]' },
  { id: 'F', label: 'KINGSTON (F:) [16GB]' },
]
const CUSTOMER_DISK: Part[] = [
  { id: 'p1', label: 'Drive 0 Partition 1: System', size: 0.1, free: 0.071, type: 'System', kind: 'sys' },
  { id: 'p2', label: 'Drive 0 Partition 2', size: 0.016, free: 0.016, type: 'MSR (Reserved)', kind: 'msr' },
  { id: 'p3', label: 'Drive 0 Partition 3: Windows', size: 237.9, free: 41.2, type: 'Primary', kind: 'win' },
  { id: 'p4', label: 'Drive 0 Partition 4', size: 0.529, free: 0.085, type: 'Recovery', kind: 'rec' },
  { id: 'p5', label: 'Drive 0 Partition 5: PHOTOS', size: 3487.5, free: 2261.0, type: 'Primary', kind: 'data' },
]
const EDITIONS = ['Windows 10 Home', 'Windows 10 Home N', 'Windows 10 Education', 'Windows 10 Pro']

const BIOS_INFO: BiosInfoRow[] = [
  { label: 'Processor Type', value: 'Bloom Core 7 · 64-bit (x64)' },
  { label: 'Total Memory', value: '16384 MB' },
  { label: 'SATA Port 0', value: 'WDC WD40EZRZ 4TB' },
  { label: 'USB Device', value: 'KINGSTON DataTraveler 16GB' },
  { label: 'Boot Mode', value: 'UEFI' },
]

export function ReinstallSim() {
  const run = useRun()
  const [stage, setStageLocal] = useState<Stage>('backup')
  const [backedUp, setBackedUp] = useState(false)
  const [copying, setCopying] = useState(false)
  const [backupWiped, setBackupWiped] = useState(false)
  const [usb, setUsb] = useState<RufusConfig | null>(null)
  const [rufusRound, setRufusRound] = useState(0)
  const [biosScreen, setBiosScreen] = useState<BiosScreen>('post')
  const [boots, setBoots] = useState(0)
  const [timed, setTimed] = useState(false)
  const [order, setOrder] = useState([HDD, USB])
  const [saved, setSaved] = useState([HDD, USB])
  const [setupRound, setSetupRound] = useState(0)
  const [update, setUpdate] = useState<{ state: UpdateState; startedAt: number | null }>({ state: 'idle', startedAt: null })
  const [verifyPhase, setVerifyPhase] = useState<'desktop' | 'updating' | 'signin'>('desktop')
  const [desktopRound, setDesktopRound] = useState(0)
  const [account, setAccount] = useState({ user: 'Keng', password: '' })

  const go = (next: Stage) => {
    setStageLocal(next)
    run.setStage(next)
  }

  /* ---------- backup ---------- */
  const startCopy = () => {
    if (copying || backedUp) return
    setCopying(true)
  }
  const copyDone = () => {
    setCopying(false)
    setBackedUp(true)
    run.log('สำรองโฟลเดอร์งานลูกค้า 12,480 ไฟล์จาก D: ไปไว้ใน SHOP-BACKUP (E:) ก่อนเริ่ม')
    run.say('good', 'สำรองข้อมูลเสร็จ ต่อให้พลาดตอนติดตั้ง งานของลูกค้าก็ยังปลอดภัย')
    run.play('success')
  }

  const leaveBackup = () => {
    const toRufus = () => go('rufus')
    if (backedUp) return toRufus()
    run.alert({
      tone: 'warn',
      title: 'ยังไม่ได้สำรองข้อมูลลูกค้า',
      text: 'กำลังจะล้างเครื่องทั้งที่งานลูกค้ายังไม่มีสำเนาอยู่ที่อื่น ถ้าเกิดพลาดระหว่างติดตั้ง ข้อมูลอาจหายถาวร',
      actions: [
        { label: 'ข้ามไปเลย (ไม่แนะนำ)', onClick: () => run.mistake('no-backup', { actions: [{ label: 'ไปต่อ', variant: 'primary', onClick: toRufus }] }) },
        { label: 'กลับไปสำรองก่อน', variant: 'primary' },
      ],
    })
  }

  const oldTree: FsNode = {
    id: 'pc',
    name: 'This PC',
    kind: 'pc',
    children: [
      { id: 'c', name: 'Local Disk (C:)', kind: 'drive', detail: 'Windows เดิม · 237 GB', children: [], summary: 'Windows, Program Files, Users … (ระบบเดิมที่จะล้างทิ้ง)' },
      {
        id: 'd',
        name: 'PHOTOS (D:)',
        kind: 'drive',
        detail: 'ใช้ไป 1.21 TB จาก 3.39 TB',
        children: [
          {
            id: 'work',
            name: 'งานลูกค้า',
            kind: 'folder',
            detail: '12,480 ไฟล์ · 1.21 TB',
            summary: 'รูปงานลูกค้า 12,480 ไฟล์ (RAW และ JPG)',
            actions: [{ label: backedUp ? 'สำรองแล้ว ✓' : 'คัดลอกไปยัง SHOP-BACKUP (E:)', primary: true, onClick: startCopy }],
          },
        ],
      },
      {
        id: 'e',
        name: 'SHOP-BACKUP (E:)',
        kind: 'usb',
        detail: 'ฮาร์ดดิสก์สำรองของร้าน · 2 TB',
        children: backedUp ? [{ id: 'bk', name: 'สำรอง-งานลูกค้า-คุณเก่ง', kind: 'folder', detail: '12,480 ไฟล์', summary: 'สำเนางานลูกค้า 12,480 ไฟล์' }] : [],
      },
    ],
  }

  const backupApps: DesktopApp[] = [
    {
      id: 'explorer',
      title: 'This PC — File Explorer',
      icon: 'folder',
      width: 620,
      height: 340,
      render: () => <FileExplorer root={oldTree} quick={[{ label: 'PHOTOS (D:)', path: ['d'], icon: 'hdd' }]} />,
    },
    {
      id: 'adware',
      title: 'Security Alert!!!',
      icon: 'alert',
      width: 330,
      height: 190,
      render: () => (
        <div className="w-app adware">
          <strong>⚠ YOUR PC IS INFECTED WITH 5 VIRUSES!</strong>
          <p>Click CLEAN NOW to protect your files</p>
          <button type="button" className="w-btn" onClick={() => run.say('warn', 'อย่ากดป๊อปอัปแปลก ๆ แบบนี้ นี่แหละเหตุผลที่คุณเก่งอยากล้างเครื่อง ปิดหน้าต่างแล้วทำงานต่อ')}>
            CLEAN NOW
          </button>
        </div>
      ),
    },
  ]

  /* ---------- rufus ---------- */
  const rufusStart = (config: RufusConfig) => {
    if (config.device === 'E') {
      if (backedUp) setBackupWiped(true)
      run.mistake('rufus-backup-drive', {
        lead: backedUp ? 'สำเนางานลูกค้าที่เพิ่งสำรองไว้ใน E: ถูกลบหมด!' : 'ฮาร์ดดิสก์สำรองของร้านถูกฟอร์แมตทั้งลูก!',
        actions: [
          {
            label: 'ย้อนกลับ (โหมดฝึก)',
            variant: 'primary',
            onClick: () => {
              setBackupWiped(false)
              setRufusRound(r => r + 1)
              run.say('info', 'ย้อนกลับไปก่อนกด START แล้ว ตรวจช่อง Device ให้ดีอีกครั้ง')
            },
          },
        ],
      })
      return false
    }
    if (config.boot !== 'iso') {
      run.mistake('rufus-not-bootable', {
        lead: config.boot === 'freedos' ? 'เลือก FreeDOS ไว้ แฟลชไดรฟ์จะบูตเข้า DOS ไม่ใช่ตัวติดตั้ง Windows' : 'ไม่ได้ติ๊ก Create a bootable disk using ไว้ Rufus จะแค่ฟอร์แมตแฟลชไดรฟ์ให้ว่าง',
        actions: [{ label: 'ตั้งค่าใหม่', variant: 'primary' }],
      })
      return false
    }
    if (config.iso?.kind !== 'windows') {
      run.mistake('rufus-wrong-iso', { actions: [{ label: 'เลือกไฟล์ใหม่', variant: 'primary' }] })
      return false
    }
    if (config.scheme === 'mbr-uefi') run.mistake('rufus-scheme')
    return true
  }

  const rufusDone = (config: RufusConfig) => {
    setUsb(config)
    run.log(`สร้าง USB Boot Windows 10 ใน KINGSTON (F:) แบบ ${SCHEME_LABEL[config.scheme]}`)
    run.say('good', 'แฟลชไดรฟ์พร้อมแล้ว นำไปเสียบเครื่องของคุณเก่ง แล้วรีสตาร์ตเพื่อตั้งลำดับบูต')
  }

  /* ---------- bios ---------- */
  const bootUsb = () => {
    setSetupRound(r => r + 1)
    go('setup')
  }
  const bootOld = () => {
    setBiosScreen('oldwin')
    run.say('info', 'เครื่องบูตเข้า Windows เดิม เพราะลำดับบูตยังให้ฮาร์ดดิสก์มาก่อน ลองรีสตาร์ตแล้วกด F2 (หรือ F12) ให้ทัน')
  }
  const bootBy = (list: string[]) => (list[0] === USB ? bootUsb() : bootOld())
  const restart = () => {
    setBoots(b => b + 1)
    setBiosScreen('post')
  }

  /* ---------- verify ---------- */
  const newTree: FsNode = {
    id: 'pc',
    name: 'This PC',
    kind: 'pc',
    children: [
      {
        id: 'c',
        name: 'Local Disk (C:)',
        kind: 'drive',
        detail: 'Windows 10 ใหม่ · ว่าง 206 GB',
        children: [
          { id: 'pf', name: 'Program Files', kind: 'folder', children: [] },
          { id: 'users', name: 'Users', kind: 'folder', children: [] },
          { id: 'win', name: 'Windows', kind: 'folder', children: [] },
        ],
      },
      {
        id: 'd',
        name: 'PHOTOS (D:)',
        kind: 'drive',
        detail: 'ใช้ไป 1.21 TB จาก 3.39 TB',
        children: [{ id: 'work', name: 'งานลูกค้า', kind: 'folder', detail: '12,480 ไฟล์', summary: 'รูปงานลูกค้า 12,480 ไฟล์ (RAW และ JPG) อยู่ครบ ✓' }],
      },
    ],
  }

  const checkUpdates = () => {
    setUpdate({ state: 'working', startedAt: Date.now() })
    window.setTimeout(() => setUpdate(u => (u.state === 'working' ? { state: 'restart', startedAt: u.startedAt } : u)), UPDATE_MS)
  }
  const restartForUpdate = () => {
    setVerifyPhase('updating')
    run.log('กด Restart now เพื่อให้การอัปเดตเสร็จสมบูรณ์')
  }
  const afterSignIn = () => {
    setUpdate({ state: 'done', startedAt: null })
    setDesktopRound(r => r + 1)
    setVerifyPhase('desktop')
    run.say('info', 'เข้าเครื่องได้แล้ว เปิด Windows Update อีกครั้งเพื่อตรวจว่าเป็นเวอร์ชันล่าสุด')
  }
  const onOpenApp = (id: string) => {
    if (id === 'settings' && update.state === 'done' && !run.hasCheck('check-update')) {
      run.check('check-update')
      run.log("รีสตาร์ตแล้วเปิด Windows Update อีกครั้ง ขึ้น You're up to date (ขั้นที่ 17)")
    }
  }

  const verifyApps: DesktopApp[] = [
    {
      id: 'explorer',
      title: 'This PC — File Explorer',
      icon: 'folder',
      width: 600,
      height: 330,
      render: () => (
        <FileExplorer
          root={newTree}
          quick={[{ label: 'PHOTOS (D:)', path: ['d'], icon: 'hdd' }]}
          onNavigate={(_, node) => {
            if (node.id === 'work' && !run.hasCheck('check-photos')) {
              run.check('check-photos')
              run.log('หลังติดตั้ง เปิด PHOTOS (D:) ตรวจงานลูกค้า 12,480 ไฟล์ อยู่ครบ')
            }
          }}
        />
      ),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'gear',
      width: 620,
      height: 330,
      render: () => (
        <SettingsApp
          initial="update"
          onPage={id => id === 'activation' && run.check('check-activation')}
          pages={[
            {
              id: 'update',
              label: 'Windows Update',
              icon: 'refresh',
              render: () => <UpdatePage state={update.state} startedAt={update.startedAt} arch="x64" onCheck={checkUpdates} onRestart={restartForUpdate} />,
            },
            { id: 'activation', label: 'Activation', icon: 'check', render: () => <ActivationPage activated edition="Windows 10 Home" /> },
          ]}
        />
      ),
    },
  ]

  return (
    <div className="sim-reinstall">
      {stage === 'backup' && (
        <>
          <Monitor label="เครื่องลูกค้า · Windows เดิมที่ติดไวรัส (ต่อฮาร์ดดิสก์สำรองของร้านไว้แล้ว)">
            <Desktop
              wallpaper="blue"
              apps={backupApps}
              icons={[{ app: 'explorer', label: 'This PC', icon: 'monitor' }]}
              startMenu={[{ label: 'File Explorer', icon: 'folder', app: 'explorer' }]}
              winxMenu={[{ label: 'File Explorer', app: 'explorer' }, { label: 'Settings' }, { label: 'Device Manager' }, { label: 'Run' }]}
              initialOpen={['adware', 'explorer']}
            >
              {copying && <CopyDialog onDone={copyDone} />}
            </Desktop>
          </Monitor>
          <BenchBar>
            <p>{backedUp ? 'สำรองข้อมูลเรียบร้อย พร้อมสร้าง USB Boot' : 'ก่อนล้างเครื่อง คิดก่อนว่าต้องทำอะไรกับงานของลูกค้า'}</p>
            <button type="button" className="btn btn-primary btn-sm" onClick={leaveBackup}>
              ต่อไป: สร้าง USB Boot <Icon name="arrowRight" size={16} />
            </button>
          </BenchBar>
        </>
      )}

      {stage === 'rufus' && (
        <>
          <Monitor label="เครื่องของร้าน · เสียบแฟลชไดรฟ์ KINGSTON 16 GB และฮาร์ดดิสก์ SHOP-BACKUP 2 TB อยู่">
            <div className="shop-pc">
              <Rufus key={rufusRound} devices={DEVICES} defaultScheme="mbr-bios" onStart={rufusStart} onDone={rufusDone} />
            </div>
          </Monitor>
          <BenchBar>
            <p>{usb ? 'แฟลชไดรฟ์พร้อมแล้ว' : 'ตั้งค่าใน Rufus ให้ครบแล้วกด Start'}</p>
            <button
              type="button"
              className="btn btn-primary btn-sm"
              disabled={!usb}
              onClick={() => {
                setOrder(saved)
                restart()
                go('bios')
              }}
            >
              เสียบที่เครื่องลูกค้าแล้วรีสตาร์ต <Icon name="arrowRight" size={16} />
            </button>
          </BenchBar>
        </>
      )}

      {stage === 'bios' && (
        <>
          <Monitor label="เครื่องลูกค้า · เสียบแฟลชไดรฟ์แล้ว กำลังรีสตาร์ต">
            {biosScreen === 'post' && (
              <PostScreen
                key={boots}
                seconds={7}
                untimed={!timed}
                keys={['F2', 'F12']}
                onKey={key => {
                  if (key === 'F2') {
                    setOrder(saved)
                    setBiosScreen('setup')
                  } else setBiosScreen('bootmenu')
                }}
                onTimeout={() => bootBy(saved)}
              />
            )}
            {biosScreen === 'setup' && (
              <BiosSetup
                mode="boot"
                info={BIOS_INFO}
                drives={order}
                onDrivesChange={setOrder}
                onSaveExit={() => {
                  setSaved(order)
                  if (order[0] === USB) run.log('ตั้ง BIOS: Boot → Hard Disk Drives → 1st Drive = USB แล้วกด F10 บันทึกและออก')
                  restart()
                }}
                onDiscardExit={() => {
                  if (order[0] !== saved[0]) run.mistake('bios-no-save')
                  setOrder(saved)
                  restart()
                }}
                onNote={t => run.say('info', t)}
              />
            )}
            {biosScreen === 'bootmenu' && (
              <BootMenu
                items={[
                  { label: 'Windows Boot Manager (WDC WD40EZRZ 4TB)', value: 'hdd' },
                  { label: usb?.scheme === 'mbr-bios' ? 'KINGSTON DataTraveler 16GB' : 'UEFI: KINGSTON DataTraveler 16GB', value: 'usb' },
                  { label: 'Enter Setup', value: 'setup' },
                ]}
                onSelect={v => {
                  if (v === 'usb') {
                    run.log('กด F12 เปิดเมนูบูต แล้วเลือกบูตจากแฟลชไดรฟ์')
                    bootUsb()
                  } else if (v === 'hdd') bootOld()
                  else {
                    setOrder(saved)
                    setBiosScreen('setup')
                  }
                }}
                onEscape={() => bootBy(saved)}
              />
            )}
            {biosScreen === 'oldwin' && (
              <div className="oldwin">
                <div className="oldwin-popup">
                  <strong>⚠ Your PC is running slow!</strong>
                  <p>Windows เดิมบูตขึ้นมาอีกแล้ว (ยังไม่ได้บูตจากแฟลชไดรฟ์)</p>
                </div>
                <button type="button" className="btn btn-gold" onClick={restart}>
                  <Icon name="refresh" size={16} /> รีสตาร์ตอีกครั้ง
                </button>
              </div>
            )}
          </Monitor>
          <BenchBar>
            <p>เข้า BIOS ให้ USB บูตก่อน หรือใช้เมนูบูต F12 เลือก USB</p>
            <label className="switch">
              <input type="checkbox" checked={timed} onChange={e => setTimed(e.target.checked)} />
              <span>จับเวลาหน้าโลโก้เหมือนเครื่องจริง</span>
            </label>
          </BenchBar>
        </>
      )}

      {stage === 'setup' && (
        <Monitor label="เครื่องลูกค้า · บูตจากแฟลชไดรฟ์ Windows 10">
          <WinSetup
            key={setupRound}
            disk="existing"
            parts={CUSTOMER_DISK}
            bootMode={usb?.scheme === 'mbr-bios' ? 'legacy' : 'uefi'}
            diskStyle="gpt"
            editions={EDITIONS}
            onKeyRejected={() => run.say('info', 'เครื่องนี้เคยเปิดใช้งานแล้ว อ่านข้อความบนจออีกครั้ง: ถ้าติดตั้งใหม่ให้กด I don\'t have a product key')}
            onBlocked={(_, reason) => {
              if (reason !== 'gpt') return
              run.mistake('rufus-mbr', {
                actions: [
                  {
                    label: 'กลับไปทำ USB ใหม่ด้วย GPT',
                    variant: 'primary',
                    onClick: () => {
                      setUsb(null)
                      setRufusRound(r => r + 1)
                      go('rufus')
                    },
                  },
                ],
              })
            }}
            onArch={(arch, proceed) => {
              if (arch === 32) {
                run.mistake('setup-32bit', { actions: [{ label: 'เลือกใหม่', variant: 'primary' }] })
                return
              }
              run.log('เลือก Windows Setup (64-bit) เพราะเครื่องมี RAM 16 GB')
              proceed()
            }}
            onKey={() => true}
            onEdition={edition => {
              if (edition !== 'Windows 10 Home') {
                run.mistake('setup-edition', { modal: true, actions: [{ label: 'เลือกใหม่', variant: 'primary' }] })
                return false
              }
              run.log('ไม่ใส่ Product Key (เครื่องเคยเปิดใช้งานแล้ว) และเลือกรุ่น Windows 10 Home ให้ตรงลิขสิทธิ์เดิม')
              return true
            }}
            onUpgrade={() => run.mistake('setup-upgrade', { lead: 'หน้า Compatibility report บอกว่า Upgrade ใช้ไม่ได้เมื่อบูตจากแฟลชไดรฟ์ กด Close แล้วเลือก Custom' })}
            onDestroy={(part, mode, undo) => {
              if (part.kind === 'data') {
                run.mistake('setup-wipe-photos', {
                  lead: backedUp && !backupWiped ? 'โชคดีที่สำรองไว้ใน E: แล้ว ลูกค้าไม่เสียงาน แต่' : 'ถ้าเป็นเครื่องจริง รูปงานลูกค้า 12,480 ไฟล์หายไปแล้ว',
                  actions: [{ label: 'ย้อนกลับ (โหมดฝึก)', variant: 'primary', onClick: undo }],
                })
              } else if (part.kind !== 'win') {
                run.mistake('setup-delete-system', { actions: [{ label: 'ย้อนกลับ (โหมดฝึก)', variant: 'primary', onClick: undo }] })
              } else {
                run.log(mode === 'delete' ? 'ลบพาร์ทิชัน Windows เดิม (237.9 GB) เพื่อติดตั้งใหม่' : 'ฟอร์แมตพาร์ทิชัน Windows เดิม (237.9 GB)')
              }
            }}
            onTarget={part => {
              if (part.kind === 'data') {
                run.mistake('setup-wrong-target', { actions: [{ label: 'เลือกพาร์ทิชันใหม่', variant: 'primary' }] })
                return false
              }
              run.log('เลือกติดตั้งลงพาร์ทิชัน Windows เดิม โดยไม่แตะพาร์ทิชัน PHOTOS (ขั้นที่ 8)')
              return true
            }}
            onPressKey={retry =>
              run.mistake('reboot-keypress', {
                modal: true,
                actions: [{ label: 'ย้อนกลับ (โหมดฝึก)', variant: 'primary', onClick: retry }],
              })
            }
            onInstalled={() => {
              run.log('ปล่อยให้เครื่องรีสตาร์ตเองโดยไม่กดปุ่ม ตามขั้นที่ 9')
              go('oobe')
            }}
          />
        </Monitor>
      )}

      {stage === 'oobe' && (
        <Monitor label="เครื่องลูกค้า · ตั้งค่าเริ่มต้นหลังติดตั้ง">
          <Oobe
            onRegion={r => r !== 'Thailand' && run.say('info', `คุณเก่งอยู่ประเทศไทย ภูมิภาคที่เหมาะคือ Thailand (เลือก ${r} ก็ใช้งานได้ แต่รูปแบบวันที่และเวลาจะไม่ตรง)`)}
            onAccount={(kind, next, back) => {
              if (kind === 'microsoft') {
                run.say('info', 'งานนี้สร้างบัญชีในเครื่องให้คุณเก่งก่อนก็พอ ใช้ลิงก์ Offline account มุมซ้ายล่าง แล้วเลือก Limited experience')
                back()
              } else next()
            }}
            onName={user => setAccount(a => ({ ...a, user }))}
            onPassword={password => {
              setAccount(a => ({ ...a, password }))
              return true
            }}
            onDone={() => {
              run.log('ตั้งค่าเริ่มต้น: ภูมิภาค แป้นพิมพ์ บัญชีผู้ใช้ และความเป็นส่วนตัว (ขั้นที่ 10–16)')
              go('verify')
            }}
          />
        </Monitor>
      )}

      {stage === 'verify' && (
        <>
          <Monitor label="เครื่องลูกค้า · Windows 10 ติดตั้งใหม่">
            {verifyPhase === 'updating' ? (
              <WorkingOnUpdates onDone={() => setVerifyPhase('signin')} />
            ) : verifyPhase === 'signin' ? (
              <SignIn
                user={account.user}
                password={account.password}
                onWrong={() => run.say('warn', 'รหัสผ่านไม่ถูก ใช้รหัสผ่านที่ตั้งไว้ตอนสร้างบัญชีให้คุณเก่ง')}
                onDone={afterSignIn}
              />
            ) : (
              <Desktop
                key={desktopRound}
                wallpaper="blue"
                apps={verifyApps}
                icons={[
                  { app: 'explorer', label: 'This PC', icon: 'monitor' },
                  { app: 'settings', label: 'Settings', icon: 'gear' },
                ]}
                startMenu={[
                  { label: 'File Explorer', icon: 'folder', app: 'explorer' },
                  { label: 'Settings', icon: 'gear', app: 'settings' },
                ]}
                winxMenu={[
                  { label: 'Apps and Features' },
                  { label: 'Disk Management' },
                  { label: 'Settings', app: 'settings' },
                  { label: 'File Explorer', app: 'explorer' },
                  { label: 'Run' },
                ]}
                search={q => (q.includes('update') || q.includes('อัปเดต') || q.includes('setting') ? 'settings' : q.includes('explorer') || q.includes('this pc') ? 'explorer' : null)}
                onOpenApp={onOpenApp}
              />
            )}
          </Monitor>
          <BenchBar>
            <p>
              {verifyPhase === 'signin'
                ? 'เครื่องรีสตาร์ตแล้ว คลิกหน้าจอล็อก แล้วใส่รหัสผ่านที่ตั้งไว้'
                : update.state === 'done' && !run.hasCheck('check-update')
                  ? 'เปิด Windows Update อีกครั้งเพื่อตรวจผลหลังรีสตาร์ต'
                  : 'ก่อนส่งคืน ตรวจว่างานลูกค้ายังอยู่ และ Windows อัปเดตแล้ว (ขั้นที่ 17)'}
            </p>
            <button type="button" className="btn btn-primary btn-sm" disabled={verifyPhase !== 'desktop'} onClick={run.complete}>
              ส่งงาน <Icon name="arrowRight" size={16} />
            </button>
          </BenchBar>
        </>
      )}
    </div>
  )
}
