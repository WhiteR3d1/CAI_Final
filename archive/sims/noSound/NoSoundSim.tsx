import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import { judgeEvidence } from '../../game/evidence'
import type { EvidenceRule } from '../../game/types'
import { EvidencePicker } from '../../screens/workbench/Fact'
import { useRun } from '../../screens/workbench/runContext'
import { BenchBar, Monitor } from '../common/Monitor'
import { Browser, SearchBox, type BrowserPage } from '../desktop/Browser'
import { Desktop, RestartScreen, type DesktopApp, type DesktopControl, type MenuItem } from '../desktop/Desktop'
import { DeviceManager, type DmCategory, type DmResult } from '../desktop/DeviceManager'
import { Dxdiag, type DxTab } from '../desktop/Dxdiag'
import { FileExplorer, type FsNode } from '../desktop/FileExplorer'
import { RunDialog } from '../desktop/RunDialog'
import { SettingsApp } from '../desktop/SettingsApp'
import { SoundSettingsPage, VolumeFlyout, type SoundState } from '../desktop/SoundControls'
import { DriverInstaller } from './DriverInstaller'
import { MediaPlayer } from './MediaPlayer'
import '../audio.css'

type PkgId = 'na892-x64' | 'na892-x86' | 'na790-x64' | 'na892-w7'

interface Pkg {
  file: string
  folder: string
  model: string
  os: string
  version: string
  date: string
  size: string
  ok: boolean
  mistake?: string
  error?: string
}

const PKGS: Record<PkgId, Pkg> = {
  'na892-x64': { file: 'NA892_Win10_x64_6.0.9.1.zip', folder: 'NA892_Win10_x64', model: 'NA-892', os: 'Windows 10 (64-bit)', version: '6.0.9.1', date: '2024-03-12', size: '118 MB', ok: true },
  'na892-x86': {
    file: 'NA892_Win10_x86_6.0.9.1.zip',
    folder: 'NA892_Win10_x86',
    model: 'NA-892',
    os: 'Windows 10 (32-bit)',
    version: '6.0.9.1',
    date: '2024-03-12',
    size: '96 MB',
    ok: false,
    mistake: 'drv-arch',
    error: 'This package is for 32-bit Windows. — แพ็กเกจนี้สำหรับ Windows 32 บิต แต่เครื่องนี้เป็น 64 บิต',
  },
  'na790-x64': {
    file: 'NA790_Win10_x64_5.8.2.zip',
    folder: 'NA790_Win10_x64',
    model: 'NA-790',
    os: 'Windows 10 (64-bit)',
    version: '5.8.2',
    date: '2023-08-01',
    size: '104 MB',
    ok: false,
    mistake: 'drv-model',
    error: 'No supported device (NA-790) was found on this computer. — ไม่พบอุปกรณ์ NA-790 ในเครื่องนี้',
  },
  'na892-w7': {
    file: 'NA892_Win7_x64_5.2.zip',
    folder: 'NA892_Win7_x64',
    model: 'NA-892',
    os: 'Windows 7 (64-bit)',
    version: '5.2.0',
    date: '2016-02-18',
    size: '87 MB',
    ok: false,
    mistake: 'drv-os',
    error: 'This driver package supports Windows 7 only. — แพ็กเกจนี้ออกแบบสำหรับ Windows 7',
  },
}

const PKG_IDS = Object.keys(PKGS) as PkgId[]
const DRIVER_RULE: EvidenceRule = {
  groups: [['dx-name', 'dm-warn'], ['dx-os']],
  acceptable: ['dm-code10', 'dm-generic', 'vol-x', 'wo-spk', 'wo-nosound', 'wo-fresh', 'dx-model', 'ts-driver'],
}

const OFFICIAL = 'https://www.nimbus-audio.example/support/na-892'
const HOME = 'https://search.bloom.example'

export function NoSoundSim() {
  const run = useRun()
  const [fixed, setFixed] = useState(false)
  const [pending, setPending] = useState(false)
  const [downloads, setDownloads] = useState<{ id: PkgId; extracted: boolean }[]>([])
  const [installPkg, setInstallPkg] = useState<PkgId | null>(null)
  const [restarting, setRestarting] = useState(false)
  const [boot, setBoot] = useState(0)
  const [reasoned, setReasoned] = useState(false)
  const [ask, setAsk] = useState<{ id: PkgId; ctl: DesktopControl } | null>(null)
  const [askEv, setAskEv] = useState<string[]>([])
  const [volume, setVolume] = useState(60)
  const [muted, setMuted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [autoTipShown, setAutoTipShown] = useState(false)

  const sound: SoundState = fixed
    ? { broken: false, outputs: [{ id: 'spk', name: 'Speakers (Nimbus HD Audio)' }], outputId: 'spk', volume, muted }
    : { broken: true, outputs: [], outputId: null, volume, muted }

  const markFixed = (how: string) => {
    setFixed(true)
    setPending(false)
    run.setStage('verify')
    run.log(how)
    run.say('good', 'ไดรเวอร์ตัวใหม่ทำงานแล้ว! ก่อนส่งคืน ทดสอบเสียงและดู Device Manager อีกครั้ง')
  }

  const restart = () => {
    setRestarting(true)
    window.setTimeout(() => {
      setRestarting(false)
      setBoot(b => b + 1)
      if (pending) markFixed('รีสตาร์ตเครื่องให้ไดรเวอร์ใหม่เริ่มทำงาน')
      else run.say('info', 'รีสตาร์ตแล้ว อาการยังเหมือนเดิม การรีสตาร์ตอย่างเดียวไม่ได้แก้ที่สาเหตุ')
    }, 2200)
  }

  const testSound = () => {
    if (!fixed) {
      run.say('warn', 'ยังไม่มีเสียงออกมาเลย')
      return
    }
    if (muted || volume === 0) {
      run.say('info', 'ตอนนี้ปิดเสียงอยู่ เปิดเสียงก่อนทดสอบ')
      return
    }
    run.play('chime')
    setPlaying(true)
    window.setTimeout(() => setPlaying(false), 2500)
    if (!run.hasCheck('check-sound')) {
      run.check('check-sound')
      run.log('รีสตาร์ตแล้วทดสอบเล่นเสียง ได้ยินชัดเจน')
    }
  }

  const checkDevmgr = () => {
    if (fixed && !run.hasCheck('check-devmgr')) {
      run.check('check-devmgr')
      run.log('ตรวจ Device Manager หลังติดตั้ง ไม่มีเครื่องหมายเตือนแล้ว')
    }
  }

  /* ---------- downloads ---------- */
  const addDownload = (id: PkgId, ctl: DesktopControl) => {
    setDownloads(list => (list.some(d => d.id === id) ? list : [...list, { id, extracted: false }]))
    ctl.toast(`ดาวน์โหลดเสร็จ: ${PKGS[id].file} (อยู่ในโฟลเดอร์ Downloads)`)
    if (run.state.stage === 'investigate') run.setStage('fix')
    run.log(`ดาวน์โหลด ${PKGS[id].file} จากเว็บไซต์ผู้ผลิต`)
  }

  const requestDownload = (id: PkgId, ctl: DesktopControl) => {
    if (reasoned) return addDownload(id, ctl)
    setAskEv([])
    setAsk({ id, ctl })
  }

  const confirmDownload = () => {
    if (!ask) return
    const verdict = judgeEvidence(askEv, DRIVER_RULE)
    run.reason('driver-choice', verdict === 'ok')
    setReasoned(true)
    if (verdict === 'ok') run.say('good', 'เหตุผลชัดเจน: รุ่นอุปกรณ์และรุ่นระบบตรงกับไฟล์ที่เลือก')
    else {
      run.mistake(verdict === 'missing' ? 'ev-missing' : 'ev-irrelevant', { quiet: true })
      run.say(
        'warn',
        verdict === 'missing'
          ? 'ก่อนเลือกไฟล์ไดรเวอร์ ควรมีหลักฐานทั้งชื่อรุ่นการ์ดเสียง (dxdiag แท็บ Sound) และรุ่นระบบ 32/64 บิต (dxdiag แท็บ System)'
          : 'หลักฐานบางข้อไม่เกี่ยวกับการเลือกไฟล์ไดรเวอร์ เช่น ขนาดหน่วยความจำ',
      )
    }
    addDownload(ask.id, ask.ctl)
    setAsk(null)
  }

  const unsafe = () =>
    run.mistake('drv-unsafe', { lead: 'โหมดฝึกบล็อกการดาวน์โหลดไว้ให้แล้ว' })

  /* ---------- browser ---------- */
  const resolve = (ctl: DesktopControl) => (url: string, go: (u: string) => void): BrowserPage => {
    if (url === HOME) {
      return {
        title: 'Bloom Search',
        body: (
          <div className="web-home">
            <div className="web-logo">Bloom Search</div>
            <SearchBox onSearch={q => go(`search:${q}`)} />
            <p className="w-small">ลองค้นด้วยชื่อรุ่นอุปกรณ์ที่ได้จากเครื่องมือของระบบ</p>
          </div>
        ),
      }
    }
    if (url.startsWith('search:')) {
      const q = url.slice(7)
      const model = /na-?\s?892|nimbus/i.test(q)
      const generic = /driver|ไดรเวอร์|เสียง|sound|audio/i.test(q)
      return {
        title: `${q} - Bloom Search`,
        body: (
          <div className="web-results">
            <SearchBox key={q} onSearch={nq => go(`search:${nq}`)} initial={q} />
            {!model && !generic && <p>ไม่พบผลลัพธ์ที่ตรง ลองค้นหาด้วยชื่อรุ่นอุปกรณ์</p>}
            {!model && generic && <p className="w-note">ผลลัพธ์กว้างเกินไป ลองค้นด้วยชื่อรุ่นอุปกรณ์ที่ได้จาก dxdiag เพื่อให้เจอเว็บของผู้ผลิต</p>}
            {model && (
              <article className="web-result">
                <button type="button" className="web-link" onClick={() => go(OFFICIAL)}>
                  NA-892 HD Audio Codec — Drivers &amp; Support | Nimbus Semiconductor
                </button>
                <cite>https://www.nimbus-audio.example › support › na-892</cite>
                <p>ดาวน์โหลดไดรเวอร์อย่างเป็นทางการสำหรับ NA-892 รองรับ Windows 10 และ Windows 7</p>
              </article>
            )}
            {(model || generic) && (
              <>
                <article className="web-result">
                  <button type="button" className="web-link" onClick={() => go('https://freedriverz.example/download')}>
                    ดาวน์โหลดไดรเวอร์ฟรีทุกยี่ห้อ!!! 100% Working — FreeDriverZ
                  </button>
                  <cite>https://freedriverz.example › download</cite>
                  <p>ไดรเวอร์ทุกรุ่น โหลดฟรี ไม่ต้องสมัคร เร็วที่สุด!</p>
                </article>
                <article className="web-result">
                  <button type="button" className="web-link" onClick={() => go('https://driverboost.example')}>
                    DriverBoost PRO — อัปเดตไดรเวอร์ทั้งหมดใน 1 คลิก
                  </button>
                  <cite>https://driverboost.example</cite>
                  <p>สแกนและติดตั้งไดรเวอร์ทุกตัวในเครื่องอัตโนมัติ ทดลองใช้ฟรี</p>
                </article>
              </>
            )}
          </div>
        ),
      }
    }
    if (url === OFFICIAL) {
      return {
        title: 'Nimbus Semiconductor — Support',
        body: (
          <div className="web-vendor">
            <header className="web-vendor-head">
              <strong>Nimbus Semiconductor</strong>
              <span>Support › Audio › NA-892</span>
            </header>
            <h2>NA-892 HD Audio Codec</h2>
            <p className="w-small">เลือกไฟล์ให้ตรงกับรุ่นอุปกรณ์และระบบปฏิบัติการของเครื่อง</p>
            <div className="web-table-scroll">
              <table className="web-table">
                <thead>
                  <tr>
                    <th>Device</th>
                    <th>Operating system</th>
                    <th>Version</th>
                    <th>Date</th>
                    <th>Size</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  {PKG_IDS.map(id => {
                    const p = PKGS[id]
                    const have = downloads.some(d => d.id === id)
                    return (
                      <tr key={id}>
                        <td>{p.model}</td>
                        <td>{p.os}</td>
                        <td>{p.version}</td>
                        <td>{p.date}</td>
                        <td>{p.size}</td>
                        <td>
                          <button type="button" className="w-btn w-btn-primary" disabled={have} onClick={() => requestDownload(id, ctl)}>
                            {have ? 'ดาวน์โหลดแล้ว' : 'Download'}
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </div>
        ),
      }
    }
    if (url.startsWith('https://freedriverz.example') || url.startsWith('https://driverboost.example')) {
      const boost = url.includes('driverboost')
      return {
        title: boost ? 'DriverBoost PRO' : 'FreeDriverZ',
        secure: false,
        body: (
          <div className="web-shady">
            <strong>{boost ? '⚡ DriverBoost PRO ⚡' : '🔥 FREE DRIVERS FOR ALL DEVICES 🔥'}</strong>
            <p>{boost ? 'พบไดรเวอร์เก่า 27 รายการ! กดเพื่ออัปเดตทั้งหมดทันที' : 'ไดรเวอร์ทุกยี่ห้อ ทุกรุ่น โหลดฟรี 100%'}</p>
            <button type="button" className="web-shady-btn" onClick={unsafe}>
              {boost ? 'SCAN & UPDATE ALL' : 'DOWNLOAD NOW'}
            </button>
            <small>* โฆษณา · ไฟล์ไม่ระบุผู้ผลิต</small>
          </div>
        ),
      }
    }
    return { title: 'Not found', body: <p>ไม่พบหน้าเว็บนี้ (404) ลองกลับไปหน้าค้นหา</p> }
  }

  /* ---------- device manager ---------- */
  const categories: DmCategory[] = [
    {
      id: 'audio-io',
      name: 'Audio inputs and outputs',
      icon: 'speaker',
      devices: fixed
        ? [
            { id: 'spk', name: 'Speakers (Nimbus HD Audio)', status: 'ok', statusText: 'This device is working properly.', manufacturer: 'Nimbus Semiconductor', provider: 'Nimbus Semiconductor', version: '6.0.9.1', date: '3/12/2024' },
          ]
        : [],
    },
    { id: 'computer', name: 'Computer', icon: 'monitor', devices: [dev('pc', 'ACPI x64-based PC')] },
    { id: 'disk', name: 'Disk drives', icon: 'hdd', devices: [dev('ssd', 'BLOOM NVMe SSD 256GB')] },
    { id: 'display', name: 'Display adapters', icon: 'monitor', devices: [dev('gpu', 'Bloom Graphics UHD 620')] },
    { id: 'kbd', name: 'Keyboards', icon: 'keyboard', devices: [dev('kbd', 'Standard PS/2 Keyboard')] },
    { id: 'net', name: 'Network adapters', icon: 'wifi', devices: [dev('wifi', 'Bloom Wireless-AC 9560')] },
    {
      id: 'sound',
      name: 'Sound, video and game controllers',
      icon: 'speaker',
      devices: [
        fixed
          ? { id: 'na892', name: 'Nimbus HD Audio NA-892', status: 'ok', statusText: 'This device is working properly.', manufacturer: 'Nimbus Semiconductor', provider: 'Nimbus Semiconductor', version: '6.0.9.1', date: '3/12/2024' }
          : {
              id: 'na892',
              name: 'Nimbus HD Audio NA-892',
              status: 'warn',
              statusText: 'This device cannot start. (Code 10) — ไดรเวอร์ที่ติดตั้งอยู่เป็นแบบทั่วไป อาจไม่ตรงกับรุ่นอุปกรณ์',
              manufacturer: 'Nimbus Semiconductor',
              provider: 'Microsoft (Generic HD Audio)',
              version: '10.0.19041.1',
              date: '6/21/2015',
              facts: { row: 'dm-warn', status: 'dm-code10', driver: 'dm-generic' },
            },
      ],
    },
  ]

  const extractedFolders = downloads.filter(d => d.extracted).map(d => PKGS[d.id].folder)

  const updateAuto = (deviceId: string): DmResult => {
    if (deviceId === 'na892' && !fixed && !autoTipShown) {
      setAutoTipShown(true)
      run.say('info', 'Windows หาไดรเวอร์ที่ใหม่กว่าไม่เจอ เป็นเรื่องปกติของบางอุปกรณ์ ต้องไปหาไฟล์จากเว็บไซต์ผู้ผลิตเอง')
    }
    return { ok: false, message: 'The best drivers for your device are already installed. — Windows ไม่พบไดรเวอร์ที่ดีกว่าที่ติดตั้งอยู่' }
  }

  const updateBrowse = (deviceId: string, folder: string): DmResult => {
    const id = PKG_IDS.find(k => PKGS[k].folder === folder)
    if (!id || deviceId !== 'na892') return { ok: false, message: 'Windows could not find drivers for your device in this folder. — ไฟล์ในโฟลเดอร์นี้ไม่ใช่ไดรเวอร์ของอุปกรณ์ที่เลือก' }
    const pkg = PKGS[id]
    if (!pkg.ok) {
      if (pkg.mistake) run.mistake(pkg.mistake)
      return { ok: false, message: pkg.error ?? 'ติดตั้งไม่ได้' }
    }
    if (fixed) return { ok: false, message: 'The best drivers for your device are already installed.' }
    markFixed('ติดตั้งไดรเวอร์ผ่าน Device Manager > Update driver > Browse my computer')
    return { ok: true, message: 'Windows has finished installing the drivers for this device: Nimbus HD Audio NA-892' }
  }

  /* ---------- files ---------- */
  const openInstaller = (id: PkgId, ctl: DesktopControl) => {
    setInstallPkg(id)
    ctl.open('installer')
  }

  const buildTree = (ctl: DesktopControl): FsNode => {
    const downloadNodes: FsNode[] = downloads.flatMap(d => {
      const p = PKGS[d.id]
      const zip: FsNode = {
        id: `zip-${d.id}`,
        name: p.file,
        kind: 'zip',
        detail: `Compressed (zipped) · ${p.size}`,
        onOpen: () => run.say('info', 'ไฟล์ .zip ต้องแตกไฟล์ก่อน เลือกไฟล์แล้วกด Extract All'),
        actions: d.extracted
          ? []
          : [
              {
                label: 'Extract All',
                primary: true,
                onClick: () => setDownloads(list => list.map(x => (x.id === d.id ? { ...x, extracted: true } : x))),
              },
            ],
      }
      if (!d.extracted) return [zip]
      const folder: FsNode = {
        id: `dir-${d.id}`,
        name: p.folder,
        kind: 'folder',
        detail: 'File folder',
        children: [
          { id: `setup-${d.id}`, name: 'setup.exe', kind: 'exe', detail: 'Application', onOpen: () => openInstaller(d.id, ctl) },
          { id: `inf-${d.id}`, name: 'NimbusHDA.inf', kind: 'file', detail: 'Setup Information' },
        ],
      }
      return [zip, folder]
    })

    return {
      id: 'pc',
      name: 'This PC',
      kind: 'pc',
      children: [
        {
          id: 'c',
          name: 'Local Disk (C:)',
          kind: 'drive',
          detail: 'ว่าง 180 GB จาก 237 GB',
          children: [
            {
              id: 'users',
              name: 'Users',
              kind: 'folder',
              children: [
                {
                  id: 'ann',
                  name: 'Ann',
                  kind: 'folder',
                  children: [
                    { id: 'downloads', name: 'Downloads', kind: 'folder', children: downloadNodes },
                    {
                      id: 'docs',
                      name: 'Documents',
                      kind: 'folder',
                      children: [{ id: 'lesson', name: 'สื่อการสอน.mp4', kind: 'file', detail: 'MP4 Video', onOpen: () => ctl.open('player') }],
                    },
                  ],
                },
              ],
            },
            { id: 'win', name: 'Windows', kind: 'folder', children: [] },
          ],
        },
      ],
    }
  }

  /* ---------- dxdiag ---------- */
  const dxTabs: DxTab[] = [
    {
      id: 'system',
      label: 'System',
      group: 'System Information',
      rows: [
        { label: 'Current Date/Time', value: 'Tuesday, September 29, 2026' },
        { label: 'Computer Name', value: 'DESKTOP-BLOOM' },
        { label: 'Operating System', value: 'Windows 10 Home 64-bit (10.0, Build 19045)', fact: 'dx-os' },
        { label: 'System Manufacturer', value: 'Bloom' },
        { label: 'System Model', value: 'Bloom Book 14', fact: 'dx-model' },
        { label: 'Processor', value: 'Bloom Core 5 (8 CPUs)' },
        { label: 'Memory', value: '8192MB RAM', fact: 'dx-ram' },
        { label: 'DirectX Version', value: 'DirectX 12' },
      ],
      notes: { label: 'Notes', value: 'No problems found.' },
    },
    {
      id: 'display',
      label: 'Display 1',
      group: 'Device',
      rows: [
        { label: 'Name', value: 'Bloom Graphics UHD 620' },
        { label: 'Manufacturer', value: 'Bloom' },
        { label: 'Display Memory', value: '4172 MB' },
      ],
      notes: { label: 'Notes', value: 'No problems found.' },
    },
    {
      id: 'sound',
      label: 'Sound 1',
      group: 'Device',
      rows: [
        { label: 'Name', value: 'Nimbus HD Audio NA-892', fact: 'dx-name' },
        { label: 'Manufacturer', value: 'Nimbus Semiconductor' },
        { label: 'Driver', value: fixed ? 'NimbusHDA64.sys 6.0.9.1 (Nimbus)' : 'HdAudio.sys 10.0.19041.1 (Microsoft Generic)' },
      ],
      notes: { label: 'Notes', value: fixed ? 'No problems found.' : 'The device is not working properly. — อุปกรณ์เสียงทำงานไม่ได้' },
    },
    {
      id: 'input',
      label: 'Input',
      group: 'Input Devices',
      rows: [
        { label: 'Keyboard', value: 'Standard PS/2 Keyboard' },
        { label: 'Mouse', value: 'HID-compliant mouse' },
      ],
      notes: { label: 'Notes', value: 'No problems found.' },
    },
  ]

  const runCommand = (ctl: DesktopControl) => (cmd: string) => {
    const c = cmd.toLowerCase()
    if (c === 'dxdiag' || c === 'dxdiag.exe') {
      ctl.open('dxdiag')
      return null
    }
    if (c === 'devmgmt.msc') {
      ctl.open('devmgr')
      return null
    }
    if (c === 'mmsys.cpl' || c === 'control') {
      ctl.open('settings')
      return null
    }
    return `Windows cannot find '${cmd}'. Make sure you typed the name correctly, and then try again.`
  }

  const apps: DesktopApp[] = [
    {
      id: 'player',
      title: 'Movies & TV — สื่อการสอน.mp4',
      icon: 'video',
      width: 460,
      height: 300,
      render: () => (
        <MediaPlayer
          soundOk={fixed && !muted}
          playing={playing}
          onPlay={() => {
            if (fixed) testSound()
            else {
              setPlaying(true)
              window.setTimeout(() => setPlaying(false), 2500)
              run.say('info', 'คลิปเล่นได้ แต่ไม่มีเสียงออกมาเลย ตรงกับที่ครูแอนเล่า')
            }
          }}
        />
      ),
    },
    {
      id: 'devmgr',
      title: 'Device Manager',
      icon: 'cpu',
      width: 560,
      height: 400,
      render: () => (
        <DeviceManager
          categories={categories}
          browseFolders={extractedFolders}
          onUpdateAuto={updateAuto}
          onUpdateBrowse={updateBrowse}
          onSelectDevice={id => id === 'na892' && checkDevmgr()}
          onOtherAction={(_, action) =>
            run.say('info', action === 'scan' ? 'สแกนแล้ว ไม่พบอุปกรณ์ใหม่' : 'การปิดหรือถอนอุปกรณ์ไม่ได้แก้ที่สาเหตุ ลองหาไดรเวอร์ที่ตรงรุ่นแทน')
          }
        />
      ),
    },
    { id: 'dxdiag', title: 'DirectX Diagnostic Tool', icon: 'app', width: 560, height: 390, render: ctl => <Dxdiag tabs={dxTabs} onExit={() => ctl.close('dxdiag')} /> },
    { id: 'run', title: 'Run', icon: 'app', width: 400, height: 220, render: ctl => <RunDialog onRun={runCommand(ctl)} onClose={() => ctl.close('run')} /> },
    { id: 'browser', title: 'เว็บเบราว์เซอร์', icon: 'globe', width: 640, height: 420, render: ctl => <Browser home={HOME} resolve={resolve(ctl)} /> },
    {
      id: 'explorer',
      title: 'File Explorer',
      icon: 'folder',
      width: 600,
      height: 360,
      render: ctl => (
        <FileExplorer
          root={buildTree(ctl)}
          initialPath={['c', 'users', 'ann', 'downloads']}
          quick={[
            { label: 'Downloads', path: ['c', 'users', 'ann', 'downloads'], icon: 'download' },
            { label: 'Documents', path: ['c', 'users', 'ann', 'docs'], icon: 'folder' },
          ]}
        />
      ),
    },
    {
      id: 'installer',
      title: installPkg ? `${PKGS[installPkg].folder} Setup` : 'Setup',
      icon: 'app',
      width: 520,
      height: 300,
      render: ctl =>
        installPkg ? (
          <DriverInstaller
            key={installPkg}
            title={`Nimbus HD Audio Driver Setup (${PKGS[installPkg].version})`}
            compatible={PKGS[installPkg].ok}
            error={PKGS[installPkg].error}
            onError={() => {
              const m = PKGS[installPkg].mistake
              if (m) run.mistake(m)
            }}
            onCancel={() => ctl.close('installer')}
            onFinish={now => {
              ctl.close('installer')
              if (fixed) return
              if (now) {
                setPending(true)
                setRestarting(true)
                window.setTimeout(() => {
                  setRestarting(false)
                  setBoot(b => b + 1)
                  markFixed('ติดตั้งไดรเวอร์ NA-892 สำหรับ Windows 10 64-bit ด้วย setup.exe แล้วรีสตาร์ตเครื่อง')
                }, 2200)
              } else {
                setPending(true)
                run.say('info', 'ติดตั้งเสร็จ แต่ไดรเวอร์จะเริ่มทำงานหลังรีสตาร์ต (Start > Restart)')
              }
            }}
          />
        ) : (
          <div className="w-app">ไม่มีตัวติดตั้งที่เปิดอยู่</div>
        ),
    },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'gear',
      width: 600,
      height: 360,
      render: () => (
        <SettingsApp
          pages={[
            {
              id: 'sound',
              label: 'Sound',
              icon: 'speaker',
              render: () => (
                <SoundSettingsPage
                  state={sound}
                  playing={playing}
                  facts={{ troubleshoot: 'ts-driver' }}
                  onSelect={() => {}}
                  onVolume={setVolume}
                  onMute={() => setMuted(m => !m)}
                  onTest={testSound}
                  onTroubleshoot={() =>
                    fixed ? 'ไม่พบปัญหาเกี่ยวกับเสียง' : 'พบปัญหา: อุปกรณ์เสียงทำงานไม่ได้ (Code 10) แนะนำให้อัปเดตไดรเวอร์เสียง'
                  }
                />
              ),
            },
            { id: 'about', label: 'About', icon: 'info', render: () => <p className="w-small">Windows 10 Home · Bloom Book 14</p> },
          ]}
        />
      ),
    },
  ]

  const startMenu: MenuItem[] = [
    { label: 'File Explorer', icon: 'folder', app: 'explorer' },
    { label: 'เว็บเบราว์เซอร์', icon: 'globe', app: 'browser' },
    { label: 'Movies & TV', icon: 'video', app: 'player' },
    { label: 'Settings', icon: 'gear', app: 'settings' },
    { label: 'Run', icon: 'app', app: 'run' },
    { label: 'Power › Restart', icon: 'power', onSelect: restart },
  ]
  const winxMenu: MenuItem[] = [
    { label: 'Apps and Features' },
    { label: 'Power Options' },
    { label: 'Event Viewer' },
    { label: 'System' },
    { label: 'Device Manager', app: 'devmgr' },
    { label: 'Network Connections' },
    { label: 'Disk Management' },
    { label: 'Task Manager' },
    { label: 'Settings', app: 'settings' },
    { label: 'File Explorer', app: 'explorer' },
    { label: 'Run', app: 'run' },
    { label: 'Shut down or sign out › Restart', onSelect: restart },
  ]

  const search = (q: string) => {
    if (q.includes('dxdiag')) return 'dxdiag'
    if (q.includes('device') || q.includes('devmgmt')) return 'devmgr'
    if (q.includes('sound') || q.includes('เสียง') || q.includes('setting')) return 'settings'
    if (q === 'run') return 'run'
    if (q.includes('edge') || q.includes('browser') || q.includes('chrome') || q.includes('เว็บ')) return 'browser'
    if (q.includes('explorer') || q.includes('file')) return 'explorer'
    return null
  }

  const stage = run.state.stage
  return (
    <div className="sim-audio">
      <Monitor label="โน้ตบุ๊กของครูแอน · Windows 10 Home (เพิ่งลงใหม่)">
        <Desktop
          key={boot}
          wallpaper="teal"
          apps={apps}
          icons={[
            { app: 'explorer', label: 'This PC', icon: 'monitor' },
            { app: 'browser', label: 'เว็บเบราว์เซอร์', icon: 'globe' },
            { app: 'player', label: 'สื่อการสอน.mp4', icon: 'video' },
          ]}
          startMenu={startMenu}
          winxMenu={winxMenu}
          search={search}
          onOpenApp={id => id === 'devmgr' && checkDevmgr()}
          volume={{
            state: sound.broken ? 'none' : muted ? 'mute' : 'ok',
            panel: () => (
              <VolumeFlyout
                state={sound}
                playing={playing}
                facts={{ broken: 'vol-x' }}
                onSelect={() => {}}
                onVolume={setVolume}
                onMute={() => setMuted(m => !m)}
                onTest={testSound}
              />
            ),
          }}
        >
          {restarting && <RestartScreen />}
        </Desktop>
      </Monitor>
      <BenchBar>
        <p>
          {stage === 'investigate'
            ? 'หาหลักฐานก่อน: ไอคอนลำโพง, Device Manager (คลิกขวาปุ่ม Start) และ dxdiag (Run)'
            : stage === 'fix'
              ? pending
                ? 'ติดตั้งแล้ว รีสตาร์ตเครื่องให้ไดรเวอร์ทำงาน'
                : 'ติดตั้งไดรเวอร์ที่ดาวน์โหลดมา แล้วรีสตาร์ต'
              : 'ทดสอบเสียงและดู Device Manager ก่อนส่งคืน'}
        </p>
        <button type="button" className="btn btn-primary btn-sm" disabled={!fixed} onClick={run.complete}>
          ส่งงาน <Icon name="arrowRight" size={16} />
        </button>
      </BenchBar>

      {ask && (
        <Modal
          title="ก่อนดาวน์โหลด: ทำไมเลือกไฟล์นี้?"
          tone="info"
          icon="pin"
          wide
          onClose={() => setAsk(null)}
          actions={[
            { label: 'ยกเลิก', onClick: () => setAsk(null) },
            { label: 'ดาวน์โหลด', variant: 'primary', onClick: confirmDownload },
          ]}
        >
          <p>
            ไฟล์ที่เลือก: <strong>{PKGS[ask.id].file}</strong> ({PKGS[ask.id].model} · {PKGS[ask.id].os})
          </p>
          <p>เลือกหลักฐานจากสมุดที่บอกว่าไฟล์นี้ตรงกับเครื่องของครูแอน</p>
          <EvidencePicker label="หลักฐานการเลือกไดรเวอร์" value={askEv} onChange={setAskEv} />
        </Modal>
      )}
    </div>
  )
}

function dev(id: string, name: string) {
  return {
    id,
    name,
    status: 'ok' as const,
    statusText: 'This device is working properly.',
    manufacturer: 'Standard',
    provider: 'Microsoft',
    version: '10.0.19041.1',
    date: '6/21/2006',
  }
}
