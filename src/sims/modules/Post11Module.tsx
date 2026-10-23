import { useState } from 'react'
import type { Post11Phase } from '../../game/scenarios'
import { useRun } from '../../screens/workbench/runContext'
import { BenchBar, Monitor } from '../common/Monitor'
import { Browser, SearchBox, type BrowserPage } from '../desktop/Browser'
import { Desktop, type DesktopApp } from '../desktop/Desktop'
import { DeviceManager, type DmCategory } from '../desktop/DeviceManager'
import { SettingsApp, type UpdateState } from '../desktop/SettingsApp'
import { SignIn, WorkingOnUpdates } from '../windows/WindowsBoot'
import { WIN11_UPDATE_MS } from '../win11/media11'
import { WindowsBackup } from '../win11/WindowsBackup'
import { WindowsSecurity } from '../win11/WindowsSecurity'
import { ActivationPage11, UpdatePage11 } from '../win11/Win11Settings'
import { DoneButton } from './ModuleBits'
import '../windows/windows.css'
import '../win11/win11.css'
import './modules.css'

type Screen = 'desktop' | 'updating' | 'signin'

const OK_DEVICES: DmCategory[] = [
  { id: 'disk', name: 'Disk drives', icon: 'hdd', devices: [{ id: 'nvme', name: 'NVMe BLOOM 256GB', status: 'ok', statusText: 'This device is working properly.', manufacturer: '(Standard disk drives)', provider: 'Microsoft', version: '10.0.22621.1', date: '6/21/2006', location: 'Bus Number 0, Target Id 0' }] },
  { id: 'display', name: 'Display adapters', icon: 'monitor', devices: [{ id: 'gpu', name: 'Bloom Graphics', status: 'ok', statusText: 'This device is working properly.', manufacturer: 'Bloom', provider: 'Bloom', version: '31.0.101.4502', date: '5/30/2024', location: 'PCI bus 0, device 2, function 0' }] },
]

/** content sheet Win11 p.8–10: Activation, Windows Update, drivers, Windows Security and backup before handing the PC back */
export function Post11Module({ phase, last, onDone }: { phase: Post11Phase; last: boolean; onDone: () => void }) {
  const run = useRun()
  const [screen, setScreen] = useState<Screen>('desktop')
  const [round, setRound] = useState(0)
  const [update, setUpdate] = useState<{ state: UpdateState; startedAt: number | null }>({ state: 'idle', startedAt: null })
  const [fixed, setFixed] = useState<string[]>([])
  const [firewall, setFirewall] = useState(!phase.firewallOff)
  const missing = phase.drivers.filter(d => !fixed.includes(d.id))

  /* ---------- Windows Update (restart → sign in with the PIN → open Settings again) ---------- */
  const checkUpdates = () => {
    setUpdate({ state: 'working', startedAt: Date.now() })
    window.setTimeout(() => setUpdate(u => (u.state === 'working' ? { state: 'restart', startedAt: u.startedAt } : u)), WIN11_UPDATE_MS)
  }
  const afterSignIn = () => {
    setUpdate({ state: 'done', startedAt: null })
    setRound(r => r + 1)
    setScreen('desktop')
    run.say('info', "เข้าเครื่องแล้ว เปิด Settings > Windows Update อีกครั้งเพื่อดูว่าขึ้น You're up to date")
  }

  /* ---------- drivers ---------- */
  const installDrivers = (ids: string[]) => {
    const names = phase.drivers.filter(d => ids.includes(d.id))
    setFixed(f => [...new Set([...f, ...ids])])
    run.log(`ติดตั้งไดรเวอร์จาก Optional updates > Driver updates: ${names.map(d => d.update).join(', ')}`)
    run.say('good', 'ติดตั้งไดรเวอร์แล้ว เปิด Device Manager ตรวจอีกครั้งว่าไม่มีเครื่องหมายเตือน')
  }
  const categories: DmCategory[] = [
    ...OK_DEVICES,
    ...[...new Set(phase.drivers.map(d => d.category))].map(cat => ({
      id: cat,
      name: cat,
      icon: cat.includes('Network') ? ('wifi' as const) : cat.includes('Sound') || cat.includes('audio') ? ('speaker' as const) : ('cpu' as const),
      devices: phase.drivers
        .filter(d => d.category === cat)
        .map(d =>
          fixed.includes(d.id)
            ? { id: d.id, name: d.update, status: 'ok' as const, statusText: 'This device is working properly.', manufacturer: 'Bloom', provider: 'Bloom', version: '1.2.0.0', date: '9/12/2026', location: 'PCI bus 1, device 0, function 0' }
            : { id: d.id, name: d.name, status: 'warn' as const, statusText: 'The drivers for this device are not installed. (Code 28)', manufacturer: 'Unknown', provider: 'Unknown', version: 'Not available', date: 'Not available', location: 'PCI bus 1, device 0, function 0' },
        ),
    })),
  ]
  const onOpenApp = (id: string) => {
    if (id === 'settings' && update.state === 'done' && !run.hasCheck('post-update')) {
      run.check('post-update')
      run.log("รีสตาร์ตแล้วเปิด Windows Update อีกครั้ง ขึ้น You're up to date")
    }
    if (id === 'devmgr' && phase.drivers.length && missing.length === 0 && !run.hasCheck('post-drivers')) {
      run.check('post-drivers')
      run.log('เปิด Device Manager ตรวจแล้ว ไม่มีอุปกรณ์ขาดไดรเวอร์')
    }
  }

  /* ---------- browser: the manufacturer's site vs. a file-sharing site ---------- */
  const resolve = (url: string, go: (u: string) => void): BrowserPage => {
    if (url === 'search:') {
      return {
        title: 'Bloom Search',
        body: (
          <div className="web-home">
            <div className="web-logo">Bloom Search</div>
            <SearchBox onSearch={q => go(`search:${q}`)} />
          </div>
        ),
      }
    }
    if (url.startsWith('search:')) {
      return {
        title: `${url.slice(7)} - Bloom Search`,
        body: (
          <div className="web-results">
            <SearchBox onSearch={q => go(`search:${q}`)} initial={url.slice(7)} />
            <div className="web-result">
              <cite>https://support.bloom.example › drivers</cite>
              <button type="button" className="web-link" onClick={() => go('https://support.bloom.example/drivers')}>
                Bloom Support — Drivers & Downloads ({phase.pc})
              </button>
              <p>ไดรเวอร์อย่างเป็นทางการสำหรับเครื่องรุ่นนี้</p>
            </div>
            <div className="web-result">
              <cite>http://free-driver-download.example › all-drivers</cite>
              <button type="button" className="web-link" onClick={() => go('http://free-driver-download.example')}>
                FREE ALL DRIVERS PACK 2026 — ดาวน์โหลดฟรี ครบทุกรุ่น!!!
              </button>
              <p>ไฟล์ฝากไว้ใน file-host ดาวน์โหลดเร็ว ไม่ต้องสมัคร</p>
            </div>
          </div>
        ),
      }
    }
    if (url === 'https://support.bloom.example/drivers') {
      return {
        title: 'Bloom Support',
        body: (
          <div className="web-site">
            <h2>Drivers & Downloads — {phase.pc}</h2>
            <p>ไดรเวอร์ล่าสุดของรุ่นนี้เผยแพร่ผ่าน Windows Update แล้ว แนะนำติดตั้งที่ Settings › Windows Update › Advanced options › Optional updates › Driver updates</p>
          </div>
        ),
      }
    }
    if (url === 'http://free-driver-download.example') {
      return {
        title: 'FREE ALL DRIVERS PACK',
        secure: false,
        body: (
          <div className="web-site">
            <h2>FREE ALL DRIVERS PACK 2026</h2>
            <button type="button" className="w-btn w-btn-primary" onClick={() => run.mistake('post-driver-site')}>
              DOWNLOAD NOW (file-host)
            </button>
          </div>
        ),
      }
    }
    return { title: 'ไม่พบหน้า', body: <p>This site can't be reached</p>, secure: false }
  }

  const apps: DesktopApp[] = [
    {
      id: 'settings',
      title: 'Settings',
      icon: 'gear',
      width: 640,
      height: 380,
      render: () => (
        <SettingsApp
          initial="update"
          onPage={id => {
            if (id === 'activation' && !run.hasCheck('post-activation')) {
              run.check('post-activation')
              run.log(`ตรวจ Settings > System > Activation: ${phase.edition} · Active`)
            }
          }}
          pages={[
            {
              id: 'update',
              label: 'Windows Update',
              icon: 'refresh',
              render: () => (
                <UpdatePage11
                  state={update.state}
                  startedAt={update.startedAt}
                  onCheck={checkUpdates}
                  onRestart={() => {
                    run.log('กด Restart now เพื่อให้อัปเดตเสร็จ')
                    setScreen('updating')
                  }}
                  drivers={missing.map(d => ({ id: d.id, name: d.update }))}
                  onInstallDrivers={installDrivers}
                />
              ),
            },
            { id: 'activation', label: 'Activation', icon: 'check', render: () => <ActivationPage11 edition={phase.edition} active /> },
          ]}
        />
      ),
    },
    {
      id: 'devmgr',
      title: 'Device Manager',
      icon: 'monitor',
      width: 560,
      height: 360,
      render: () => (
        <DeviceManager
          computer={phase.pc}
          categories={categories}
          browseFolders={[]}
          browseRoot="C:\Users\Downloads"
          onUpdateAuto={() => ({
            ok: false,
            message: 'Windows was unable to find drivers for this device. Settings › Windows Update › Advanced options › Optional updates may have driver updates for this device.',
          })}
          onUpdateBrowse={() => ({ ok: false, message: 'Windows could not find driver software for your device.' })}
          onOtherAction={(_, action) => run.say('info', action === 'scan' ? 'สแกนแล้ว อุปกรณ์ยังขาดไดรเวอร์อยู่' : 'ไม่ต้องปิดหรือถอนอุปกรณ์ ให้ติดตั้งไดรเวอร์ที่ถูกต้อง')}
        />
      ),
    },
    {
      id: 'security',
      title: 'Windows Security',
      icon: 'shield',
      width: 640,
      height: 380,
      render: () => (
        <WindowsSecurity
          tpm
          secureBoot
          firewall={firewall}
          encryption="on"
          onFirewallOn={() => {
            setFirewall(true)
            run.log('เปิด Microsoft Defender Firewall กลับมา')
          }}
          onPage={p => {
            if (p === 'device' && firewall && !run.hasCheck('post-security')) {
              run.check('post-security')
              run.log('ตรวจ Windows Security: Firewall เปิด, TPM 2.0 และ Secure Boot ทำงาน, Device encryption เปิด')
            }
          }}
        />
      ),
    },
    ...(phase.backup
      ? [
          {
            id: 'backup',
            title: 'Windows Backup',
            icon: 'folder' as const,
            width: 520,
            height: 380,
            render: () => (
              <WindowsBackup
                device={phase.pc}
                onBackedUp={() => {
                  run.check('post-backup')
                  run.log('ตั้งค่า Windows Backup และสำรองข้อมูลแล้ว')
                }}
              />
            ),
          },
        ]
      : []),
    { id: 'browser', title: 'Microsoft Edge', icon: 'app', width: 620, height: 360, render: () => <Browser home="search:" resolve={resolve} /> },
  ]

  return (
    <div className="module-post11">
      <Monitor label={`เครื่องของลูกค้า (${phase.pc}) · Windows 11 ติดตั้งใหม่`}>
        {screen === 'updating' && <WorkingOnUpdates onDone={() => setScreen('signin')} />}
        {screen === 'signin' && <SignIn pin user={phase.user} password={phase.pin} onWrong={() => run.say('warn', `PIN ไม่ถูก PIN ของลูกค้าคือ ${phase.pin} (อยู่ในใบงาน)`)} onDone={afterSignIn} />}
        {screen === 'desktop' && (
          <Desktop
            key={round}
            variant="win11"
            wallpaper="bloom"
            apps={apps}
            icons={[
              { app: 'settings', label: 'Settings', icon: 'gear' },
              { app: 'browser', label: 'Microsoft Edge', icon: 'app' },
            ]}
            startMenu={[
              { label: 'Settings', icon: 'gear', app: 'settings' },
              { label: 'Windows Security', icon: 'shield', app: 'security' },
              ...(phase.backup ? [{ label: 'Windows Backup', icon: 'folder' as const, app: 'backup' }] : []),
              { label: 'Microsoft Edge', icon: 'app', app: 'browser' },
            ]}
            winxMenu={[
              { label: 'Device Manager', app: 'devmgr' },
              { label: 'Settings', app: 'settings' },
            ]}
            search={q =>
              q.includes('device') ? 'devmgr' : q.includes('security') || q.includes('firewall') ? 'security' : q.includes('backup') ? (phase.backup ? 'backup' : null) : q.includes('update') || q.includes('setting') || q.includes('activation') ? 'settings' : null
            }
            onOpenApp={onOpenApp}
          />
        )}
      </Monitor>
      <BenchBar>
        <p>{screen === 'signin' ? 'เครื่องรีสตาร์ตแล้ว คลิกหน้าจอล็อก แล้วใส่ PIN' : 'ตรวจ Activation, Windows Update, Device Manager (คลิกขวาปุ่ม Start), Windows Security และ Backup ตามใบงาน'}</p>
        <DoneButton ready={screen === 'desktop'} last={last} onDone={onDone} />
      </BenchBar>
    </div>
  )
}
