import { useState } from 'react'
import { Icon } from '../../components/Icon'
import type { EvidenceRule } from '../../game/types'
import { Fact } from '../../screens/workbench/Fact'
import { useRun } from '../../screens/workbench/runContext'
import { BenchBar, Monitor } from '../common/Monitor'
import { Browser, SearchBox, type BrowserPage } from '../desktop/Browser'
import { Desktop, type DesktopApp, type DesktopControl } from '../desktop/Desktop'
import { FileExplorer, type FsNode } from '../desktop/FileExplorer'
import { EvidenceAsk, type Verdict } from '../windows/EvidenceAsk'
import { SCHEME_LABEL, type RufusConfig, type RufusDevice } from '../windows/media'
import { Rufus } from '../windows/Rufus'

type Stage = 'download' | 'plug' | 'rufus' | 'verify'
const ORDER: Stage[] = ['download', 'plug', 'rufus', 'verify']

const HOME = 'search:'
const RUFUS_SITE = 'https://rufus.ie/th/'
const HOWTO_SITE = 'https://it-howto.example/rufus-windows10'
const USB_RULE: EvidenceRule = { groups: [['wo-usb', 'fe-usb'], ['wo-bios']], acceptable: ['wo-win10'] }

export function MakeUsbSim() {
  const run = useRun()
  const [stage, setStageLocal] = useState<Stage>('download')
  const [downloaded, setDownloaded] = useState(false)
  const [plugged, setPlugged] = useState(false)
  const [seenUsb, setSeenUsb] = useState(false)
  const [seenTools, setSeenTools] = useState(false)
  const [rufusOpen, setRufusOpen] = useState(false)
  const [rufusRound, setRufusRound] = useState(0)
  const [usb, setUsb] = useState<RufusConfig | null>(null)
  const [toolsWiped, setToolsWiped] = useState(false)
  const [reasoned, setReasoned] = useState(false)
  const [ask, setAsk] = useState<{ config: RufusConfig; next: () => void } | null>(null)
  const [notice, setNotice] = useState<string | null>(null)

  const advance = (to: Stage) => {
    if (ORDER.indexOf(to) <= ORDER.indexOf(stage)) return
    setStageLocal(to)
    run.setStage(to)
  }

  const flash = (text: string) => {
    setNotice(text)
    window.setTimeout(() => setNotice(n => (n === text ? null : n)), 3200)
  }

  /* ---------- step 1: download ---------- */
  const download = (ctl: DesktopControl) => {
    if (!downloaded) {
      setDownloaded(true)
      run.log('ค้นหา rufus แล้วดาวน์โหลด rufus-3.4.exe จากเว็บไซต์ของโปรแกรม (ขั้นที่ 1)')
      run.say('good', 'ดาวน์โหลดเสร็จ ไฟล์อยู่ที่แถบดาวน์โหลดและโฟลเดอร์ Downloads ขั้นต่อไปเสียบแฟลชไดรฟ์ แล้วตรวจว่าเครื่องมองเห็น')
      advance('plug')
    }
    ctl.toast('ดาวน์โหลดเสร็จ: rufus-3.4.exe (1.1 MB)')
  }

  /* ---------- step 2: plug in ---------- */
  const plug = () => {
    setPlugged(true)
    flash('ตรวจพบอุปกรณ์ USB ใหม่: KINGSTON (F:)')
    run.log('เสียบแฟลชไดรฟ์ของครูแอน KINGSTON 16 GB')
  }

  /* ---------- step 3: rufus ---------- */
  const openRufus = () => {
    setRufusOpen(true)
    if (!plugged) run.say('warn', 'ใบเนื้อหาให้เสียบ USB และตรวจว่าเครื่องมองเห็นก่อนเปิด Rufus (ขั้นที่ 2) ตอนนี้ในช่อง Device มีแต่ SHOP-TOOLS ของร้าน')
    else if (!seenUsb) run.say('info', 'เปิด Rufus แล้ว ลองกลับไปดูใน This PC ด้วยว่าเครื่องเห็นแฟลชไดรฟ์ชื่ออะไร ขนาดเท่าไร จะได้เทียบกับช่อง Device')
    if (plugged) advance('rufus')
  }

  const devices: RufusDevice[] = [{ id: 'E', label: 'SHOP-TOOLS (E:) [32 GB]' }, ...(plugged ? [{ id: 'F', label: 'KINGSTON (F:) [16 GB]' }] : [])]

  const judge = (verdict: Verdict) => {
    if (verdict === 'ok') {
      run.say('good', 'หลักฐานครบ: แฟลชไดรฟ์ของครูแอนคือ 16 GB และเครื่องปลายทางเป็น BIOS แบบเก่า')
      return
    }
    run.mistake(verdict === 'missing' ? 'ev-missing' : 'ev-irrelevant', { quiet: true })
    run.say(
      'warn',
      verdict === 'missing'
        ? 'ก่อนเขียนทับ ควรมีหลักฐานทั้งตัวแฟลชไดรฟ์ (ขนาด 16 GB) และชนิดของเครื่องปลายทาง (BIOS แบบเก่า)'
        : 'หลักฐานบางข้อไม่ได้ช่วยยืนยันว่าเลือก Device หรือ Partition scheme ถูก',
    )
  }

  const rufusStart = (config: RufusConfig) => {
    if (config.device === 'E') {
      setToolsWiped(true)
      run.mistake('rufus-wrong-device', {
        lead: 'โปรแกรมและไดรเวอร์ของร้านใน SHOP-TOOLS (E:) ถูกลบหมดแล้ว!',
        actions: [
          {
            label: 'ย้อนกลับ (โหมดฝึก)',
            variant: 'primary',
            onClick: () => {
              setToolsWiped(false)
              setRufusRound(r => r + 1)
              run.say('info', 'ย้อนกลับไปก่อนกด START แล้ว ตรวจชื่อและขนาดในช่อง Device ให้ดีอีกครั้ง')
            },
          },
        ],
      })
      return false
    }
    if (config.iso.kind !== 'windows') {
      run.mistake('rufus-wrong-iso', { actions: [{ label: 'เลือกไฟล์ใหม่', variant: 'primary' }] })
      return false
    }
    if (config.scheme !== 'mbr-bios') {
      run.mistake('rufus-wrong-scheme', {
        lead: `เลือก "${SCHEME_LABEL[config.scheme]}" ไว้`,
        actions: [{ label: 'ตั้งค่าใหม่', variant: 'primary' }],
      })
      return false
    }
    run.log(`ตั้ง Rufus: Device = KINGSTON (F:) 16 GB, ${SCHEME_LABEL[config.scheme]}, NTFS, Cluster 4096, ISO Windows 10 แล้วกด Start`)
    return true
  }

  const rufusDone = (config: RufusConfig) => {
    setUsb(config)
    run.say('good', 'Rufus ขึ้น READY แล้ว ลองเปิดแฟลชไดรฟ์ใน This PC ดูว่ามีไฟล์ติดตั้งครบก่อนส่งงาน')
    advance('verify')
  }

  /* ---------- file explorer ---------- */
  const tree: FsNode = {
    id: 'pc',
    name: 'This PC',
    kind: 'pc',
    children: [
      { id: 'c', name: 'Local Disk (C:)', kind: 'drive', detail: 'เครื่องของร้าน · ว่าง 120 GB', summary: 'Windows, Program Files, Users … (ระบบของเครื่องร้าน)' },
      {
        id: 'dl',
        name: 'Downloads',
        kind: 'folder',
        detail: downloaded ? '4 รายการ' : '3 รายการ',
        children: [
          ...(downloaded ? [{ id: 'rufus', name: 'rufus-3.4.exe', kind: 'exe' as const, detail: 'Application · 1.1 MB', onOpen: openRufus }] : []),
          { id: 'iso-win', name: 'Win10_22H2_Thai_x32x64.iso', kind: 'iso', detail: 'Disc Image File · 5.6 GB' },
          { id: 'iso-ubuntu', name: 'ubuntu-20.04.6-desktop-amd64.iso', kind: 'iso', detail: 'Disc Image File · 4.1 GB' },
          { id: 'iso-office', name: 'Office_2019_Setup.iso', kind: 'iso', detail: 'Disc Image File · 3.2 GB' },
        ],
      },
      {
        id: 'e',
        name: 'SHOP-TOOLS (E:)',
        kind: 'usb',
        detail: 'แฟลชไดรฟ์ของร้าน · 32 GB',
        children: toolsWiped
          ? []
          : [
              { id: 'apps', name: 'โปรแกรมของร้าน', kind: 'folder', summary: 'ตัวติดตั้งโปรแกรมที่ร้านใช้บ่อย 64 รายการ' },
              { id: 'drivers', name: 'ไดรเวอร์', kind: 'folder', summary: 'ไดรเวอร์ของลูกค้าเก่า 212 รายการ' },
            ],
      },
      ...(plugged
        ? [
            {
              id: 'f',
              name: usb ? 'WIN10_TH (F:)' : 'KINGSTON (F:)',
              kind: 'usb' as const,
              detail: usb ? 'USB Boot Windows 10 · 16 GB' : 'แฟลชไดรฟ์ของครูแอน · 16 GB',
              children: usb
                ? [
                    { id: 'boot', name: 'boot', kind: 'folder' as const, children: [] },
                    { id: 'efi', name: 'efi', kind: 'folder' as const, children: [] },
                    { id: 'sources', name: 'sources', kind: 'folder' as const, summary: 'ไฟล์ติดตั้ง Windows (install.esd และอื่น ๆ)' },
                    { id: 'support', name: 'support', kind: 'folder' as const, children: [] },
                    { id: 'autorun', name: 'autorun.inf', kind: 'file' as const, detail: '1 KB' },
                    { id: 'bootmgr', name: 'bootmgr', kind: 'file' as const, detail: '400 KB' },
                    { id: 'setup', name: 'setup.exe', kind: 'exe' as const, detail: '94 KB', onOpen: () => run.say('info', 'setup.exe ใช้ติดตั้งจากใน Windows งานนี้เราจะนำ USB ไปบูตเครื่องห้องแล็บแทน') },
                  ]
                : [],
            },
          ]
        : []),
    ],
  }

  const onNavigate = (_: string[], node: FsNode) => {
    if (node.id === 'e') setSeenTools(true)
    if (node.id !== 'f') return
    if (!usb && !seenUsb) {
      setSeenUsb(true)
      run.check('check-usb-seen')
      run.log('เปิด This PC ตรวจแล้วว่าเครื่องมองเห็นแฟลชไดรฟ์ KINGSTON (F:) 16 GB (ขั้นที่ 2)')
      advance('rufus')
    } else if (usb && !run.hasCheck('check-usb-files')) {
      run.check('check-usb-files')
      run.log('เปิดแฟลชไดรฟ์หลังสร้างเสร็จ เห็นไฟล์ติดตั้ง boot, sources และ setup.exe')
    }
  }

  /* ---------- browser ---------- */
  const resolve = (ctl: DesktopControl) => (url: string, go: (u: string) => void): BrowserPage => {
    if (url === HOME) {
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
      const q = url.slice(7).trim().toLowerCase()
      const hit = q.includes('rufus') || q.includes('รูฟัส')
      return {
        title: `${q} - Bloom Search`,
        body: (
          <div className="web-results">
            <SearchBox onSearch={x => go(`search:${x}`)} initial={url.slice(7)} />
            {hit ? (
              <>
                <div className="web-result">
                  <cite>https://rufus.ie › th</cite>
                  <button type="button" className="web-link" onClick={() => go(RUFUS_SITE)}>
                    Rufus - สร้างแฟลชไดรฟ์ USB ที่บูตได้อย่างง่ายดาย
                  </button>
                  <p>Rufus เป็นโปรแกรมที่ช่วยฟอร์แมตและสร้างแฟลชไดรฟ์ USB ที่บูตได้ เช่น ตัวติดตั้ง Windows</p>
                </div>
                <div className="web-result">
                  <cite>https://it-howto.example › rufus-windows10</cite>
                  <button type="button" className="web-link" onClick={() => go(HOWTO_SITE)}>
                    วิธีทำ USB ติดตั้ง Windows 10 ด้วย Rufus (บทความ)
                  </button>
                  <p>บทความสอนการใช้งาน Rufus ทีละขั้นตอน พร้อมคำอธิบายแต่ละช่อง</p>
                </div>
              </>
            ) : (
              <p className="w-small">ไม่พบผลลัพธ์ที่ตรงกับงานนี้ ลองค้นหาด้วยชื่อโปรแกรม เช่น rufus</p>
            )}
          </div>
        ),
      }
    }
    if (url === RUFUS_SITE) {
      return {
        title: 'Rufus',
        body: (
          <div className="web-site">
            <div className="web-site-head">
              <strong>Rufus</strong>
              <span>rufus.ie</span>
            </div>
            <p>Rufus เป็นโปรแกรมที่ช่วยฟอร์แมตและสร้างแฟลชไดรฟ์ USB ที่บูตได้ ใช้ได้หลายเวอร์ชัน</p>
            <h2>ดาวน์โหลด</h2>
            <div className="web-table-scroll">
              <table className="web-table">
                <thead>
                  <tr>
                    <th>ไฟล์</th>
                    <th>ชนิด</th>
                    <th>ขนาด</th>
                    <th />
                  </tr>
                </thead>
                <tbody>
                  <tr>
                    <td>rufus-3.4.exe</td>
                    <td>Standard</td>
                    <td>1.1 MB</td>
                    <td>
                      <button type="button" className="w-btn w-btn-primary" onClick={() => download(ctl)}>
                        <Icon name="download" size={14} /> ดาวน์โหลด
                      </button>
                    </td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        ),
      }
    }
    if (url === HOWTO_SITE) {
      return {
        title: 'IT How-to',
        body: (
          <div className="web-site">
            <h2>วิธีทำ USB ติดตั้ง Windows 10 ด้วย Rufus</h2>
            <p>1) ดาวน์โหลด Rufus จากเว็บไซต์ของโปรแกรม 2) เสียบแฟลชไดรฟ์ 3) เปิด Rufus เลือก Device, Partition scheme และไฟล์ ISO แล้วกด Start</p>
            <p className="w-small">หน้านี้เป็นบทความ ไม่มีไฟล์ให้ดาวน์โหลด กลับไปเลือกเว็บไซต์ของโปรแกรม</p>
            <button type="button" className="web-link" onClick={() => go(RUFUS_SITE)}>
              ไปที่เว็บไซต์ Rufus
            </button>
          </div>
        ),
      }
    }
    return { title: 'ไม่พบหน้า', body: <p>This site can't be reached — ลองค้นหาใหม่</p>, secure: false }
  }

  const apps: DesktopApp[] = [
    {
      id: 'browser',
      title: 'Browser',
      icon: 'app',
      width: 640,
      height: 380,
      render: ctl => (
        <Browser
          home={HOME}
          resolve={resolve(ctl)}
          footer={
            downloaded ? (
              <div className="dl-bar">
                <button type="button" className="dl-file" onClick={openRufus}>
                  <Icon name="app" size={16} /> rufus-3.4.exe <small>1.1 MB · เปิดไฟล์</small>
                </button>
              </div>
            ) : undefined
          }
        />
      ),
    },
    {
      id: 'explorer',
      title: 'This PC — File Explorer',
      icon: 'folder',
      width: 600,
      height: 340,
      render: () => (
        <FileExplorer
          root={tree}
          quick={[
            { label: 'Downloads', path: ['dl'], icon: 'download' },
            ...(plugged ? [{ label: usb ? 'WIN10_TH (F:)' : 'KINGSTON (F:)', path: ['f'], icon: 'usb' as const }] : []),
          ]}
          onNavigate={onNavigate}
        />
      ),
    },
  ]

  const tip: Record<Stage, string> = {
    download: 'ขั้นที่ 1: ค้นหาและดาวน์โหลดโปรแกรม Rufus',
    plug: plugged ? 'ขั้นที่ 2: เปิด This PC ตรวจว่าเครื่องมองเห็นแฟลชไดรฟ์' : 'ขั้นที่ 2: เสียบแฟลชไดรฟ์ของครูแอน แล้วตรวจว่าเครื่องมองเห็น',
    rufus: 'ขั้นที่ 3: เปิด Rufus จากแถบดาวน์โหลดหรือโฟลเดอร์ Downloads ตั้งค่าแล้วกด START',
    verify: 'สร้างเสร็จแล้ว เปิดแฟลชไดรฟ์ใน This PC ตรวจไฟล์ติดตั้ง แล้วส่งงาน',
  }

  return (
    <div className="sim-make-usb">
      <Monitor label="เครื่องของร้าน · เสียบแฟลชไดรฟ์ SHOP-TOOLS (E:) ไว้อยู่แล้ว">
        <Desktop
          wallpaper="teal"
          apps={apps}
          icons={[
            { app: 'explorer', label: 'This PC', icon: 'monitor' },
            { app: 'browser', label: 'Browser', icon: 'app' },
          ]}
          startMenu={[
            { label: 'File Explorer', icon: 'folder', app: 'explorer' },
            { label: 'Browser', icon: 'app', app: 'browser' },
          ]}
          winxMenu={[{ label: 'File Explorer', app: 'explorer' }, { label: 'Settings' }, { label: 'Disk Management' }, { label: 'Run' }]}
          initialOpen={['browser']}
        >
          {notice && (
            <div className="dt-toast dt-toast-device" role="status">
              {notice}
            </div>
          )}
          {rufusOpen && (
            <div className="rufus-overlay">
              <Rufus
                key={rufusRound}
                devices={devices}
                onReview={(config, next) => (reasoned ? next() : setAsk({ config, next }))}
                onStart={rufusStart}
                onDone={rufusDone}
                onClose={() => setRufusOpen(false)}
              />
            </div>
          )}
        </Desktop>
      </Monitor>
      <BenchBar>
        <p>{tip[stage]}</p>
        {seenUsb && <Fact id="fe-usb">This PC: KINGSTON (F:) 16 GB</Fact>}
        {seenTools && <Fact id="fe-tools">SHOP-TOOLS (E:) 32 GB มีโปรแกรมของร้าน</Fact>}
        {!plugged ? (
          <button type="button" className="btn btn-gold btn-sm" onClick={plug}>
            <Icon name="usb" size={16} /> เสียบแฟลชไดรฟ์ของครูแอน
          </button>
        ) : (
          <button type="button" className="btn btn-primary btn-sm" disabled={!usb} onClick={run.complete}>
            ส่งงาน <Icon name="arrowRight" size={16} />
          </button>
        )}
      </BenchBar>

      {ask && (
        <EvidenceAsk
          id="usb-setup"
          title="ก่อนกด START: ตั้งค่าถูกแล้วหรือยัง?"
          rule={USB_RULE}
          confirmLabel="ยืนยันและเขียน USB"
          onCancel={() => setAsk(null)}
          onConfirm={verdict => {
            setReasoned(true)
            judge(verdict)
            const next = ask.next
            setAsk(null)
            next()
          }}
        >
          <p>
            Device: <strong>{devices.find(d => d.id === ask.config.device)?.label}</strong>
            <br />
            Partition scheme: <strong>{SCHEME_LABEL[ask.config.scheme]}</strong>
            <br />
            ISO: <strong>{ask.config.iso.name}</strong>
          </p>
          <p>พี่บูตถาม: ทำไมเลือกอุปกรณ์และ Partition scheme นี้</p>
        </EvidenceAsk>
      )}
    </div>
  )
}
