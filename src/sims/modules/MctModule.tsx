import { useState } from 'react'
import { Icon } from '../../components/Icon'
import type { MctPhase } from '../../game/scenarios'
import { useRun } from '../../screens/workbench/runContext'
import { BenchBar, Monitor } from '../common/Monitor'
import { Browser, type BrowserPage } from '../desktop/Browser'
import { Desktop, type DesktopApp, type DesktopControl } from '../desktop/Desktop'
import { FileExplorer, type FsNode } from '../desktop/FileExplorer'
import { MediaCreationTool } from '../win11/MediaCreationTool'
import { UacPrompt } from '../win11/SystemTools'
import { DoneButton } from './ModuleBits'
import '../windows/windows.css'
import './modules.css'

const DOWNLOAD_URL = 'https://www.microsoft.com/software-download/windows11'
const TOOL = 'mediacreationtool.exe'

/** content sheet Win11 p.2–3: (download the tool,) create the USB and remove it safely */
export function MctModule({ phase, last, onDone }: { phase: MctPhase; last: boolean; onDone: () => void }) {
  const run = useRun()
  const [downloaded, setDownloaded] = useState(!phase.download)
  // the desktop that asked to run the tool, kept while the UAC prompt is up
  const [uac, setUac] = useState<DesktopControl | null>(null)
  const [toolOpen, setToolOpen] = useState(!phase.download)
  const [ready, setReady] = useState<string | null>(null)
  const [ejected, setEjected] = useState(false)
  const done = !!ready && (!phase.eject || ejected)

  const openTool = (ctl: DesktopControl) => {
    if (toolOpen) ctl.open('mct')
    else setUac(ctl)
  }

  const resolve = (ctl: DesktopControl) => (url: string): BrowserPage => {
    if (url !== DOWNLOAD_URL) return { title: 'ไม่พบหน้า', body: <p>This site can't be reached</p>, secure: false }
    return {
      title: 'Download Windows 11',
      body: (
        <div className="web-site module-web">
          <section>
            <h3>Windows 11 Installation Assistant</h3>
            <p className="w-small">This is the best option for installing Windows 11 on the device you're currently using.</p>
            <button type="button" className="w-btn" onClick={() => run.mistake('mct-assistant')}>
              Download Now
            </button>
          </section>
          <section>
            <h3>Create Windows 11 Installation Media</h3>
            <p className="w-small">If you want to perform a reinstall or clean install of Windows 11 on a new or used PC, use this option to download the media creation tool to make a bootable USB or DVD.</p>
            <button
              type="button"
              className="w-btn w-btn-primary"
              onClick={() => {
                if (!downloaded) {
                  setDownloaded(true)
                  run.log('เปิดหน้า Download Windows 11 ของ Microsoft แล้วดาวน์โหลด Media Creation Tool (ขั้นที่ 1)')
                }
                ctl.toast(`ดาวน์โหลดเสร็จ: ${TOOL}`)
              }}
            >
              Download Now
            </button>
          </section>
          <section>
            <h3>Download Windows 11 Disk Image (ISO) for x64 devices</h3>
            <p className="w-small">This option is for users that want to create a bootable installation media (USB flash drive, DVD) or create a virtual machine (.ISO file).</p>
            <button type="button" className="w-btn" onClick={() => run.say('info', 'ไฟล์ ISO ต้องนำไปสร้างสื่ออีกขั้น งานนี้ใช้ Media Creation Tool สร้าง USB โดยตรงตามใบเนื้อหา')}>
              Select Download
            </button>
          </section>
        </div>
      ),
    }
  }

  const usbNode = (d: MctPhase['drives'][number]): FsNode => ({
    id: d.id,
    name: d.id === ready ? `ESD-USB (${d.id}:)` : `${d.label} (${d.id}:)`,
    kind: 'usb',
    detail: `${d.sizeGb} GB${d.data ? ` · ${d.data}` : ''}`,
    children: [],
    summary: d.id === ready ? 'ไฟล์ติดตั้ง Windows 11 (boot, efi, sources, setup.exe)' : d.data ?? 'ว่าง',
    actions:
      d.id === ready && phase.eject
        ? [
            {
              label: ejected ? 'ถอดแล้ว ✓' : 'Eject',
              primary: true,
              onClick: () => {
                if (ejected) return
                setEjected(true)
                run.check('mct-eject')
                run.log('ถอด USB อย่างปลอดภัย (Eject) แล้วติดป้ายชื่อ "Windows 11 ติดตั้ง"')
              },
            },
          ]
        : undefined,
  })

  const apps: DesktopApp[] = [
    ...(phase.download
      ? [
          {
            id: 'browser',
            title: 'Microsoft Edge',
            icon: 'app' as const,
            width: 640,
            height: 380,
            render: (ctl: DesktopControl) => (
              <Browser
                home={DOWNLOAD_URL}
                resolve={resolve(ctl)}
                footer={
                  downloaded ? (
                    <div className="dl-bar">
                      <button type="button" className="dl-file" onClick={() => openTool(ctl)}>
                        <Icon name="app" size={16} /> {TOOL} <small>เปิดไฟล์</small>
                      </button>
                    </div>
                  ) : undefined
                }
              />
            ),
          },
        ]
      : []),
    {
      id: 'mct',
      title: 'Windows 11 Setup',
      icon: 'start',
      width: 600,
      height: 400,
      render: () => (
        <MediaCreationTool
          drives={phase.drives.map(d => ({ id: d.id, label: d.label, sizeGb: d.sizeGb }))}
          onDecline={() => run.say('info', 'ถ้า Decline เครื่องมือจะปิดตัว ต้องยอมรับเงื่อนไขก่อนจึงสร้างสื่อได้')}
          onEdition={recommended => run.log(recommended ? 'ใช้ภาษาและรุ่นที่แนะนำ (Use the recommended options for this PC)' : 'เลือกภาษาและรุ่นเอง')}
          onMedia={kind => {
            if (kind === 'iso') {
              run.mistake('mct-iso')
              return false
            }
            run.log('เลือก USB flash drive')
            return true
          }}
          onDrive={drive => {
            const d = phase.drives.find(x => x.id === drive.id)
            if (d?.data) {
              run.mistake('mct-data', { lead: `${d.id}: ${d.label} มี ${d.data}` })
              return false
            }
            if (drive.sizeGb < 8) {
              run.mistake('mct-small', { lead: `${drive.id}: ${drive.label} มีแค่ ${drive.sizeGb} GB` })
              return false
            }
            run.log(`ตรวจชื่อและความจุแล้ว เลือก ${drive.id}: ${drive.label} (${drive.sizeGb} GB)`)
            return true
          }}
          onDone={drive => {
            setReady(drive.id)
            run.check('mct-ready')
            run.say('good', phase.eject ? 'สร้างสื่อเสร็จ เปิด This PC แล้วกด Eject ที่ USB ก่อนดึงออก' : 'สร้างสื่อเสร็จ USB พร้อมใช้งาน')
          }}
        />
      ),
    },
    {
      id: 'explorer',
      title: 'This PC — File Explorer',
      icon: 'folder',
      width: 560,
      height: 320,
      render: () => (
        <FileExplorer
          root={{ id: 'pc', name: 'This PC', kind: 'pc', children: [{ id: 'c', name: 'Local Disk (C:)', kind: 'drive', detail: 'เครื่องของร้าน', summary: 'Windows, Program Files, Users …' }, ...phase.drives.map(usbNode)] }}
        />
      ),
    },
  ]

  const submit = () => {
    if (phase.eject && !ejected) {
      run.mistake('mct-noeject', { actions: [{ label: 'ไปต่อ', variant: 'primary', onClick: onDone }] })
      return
    }
    onDone()
  }

  return (
    <div className="module-mct">
      <Monitor label="เครื่องของร้าน · เสียบ USB ไว้แล้ว">
        <Desktop
          wallpaper="teal"
          apps={apps}
          icons={[
            { app: 'explorer', label: 'This PC', icon: 'monitor' },
            ...(phase.download ? [{ app: 'browser', label: 'Microsoft Edge', icon: 'app' as const }] : [{ app: 'mct', label: 'Media Creation Tool', icon: 'start' as const }]),
          ]}
          startMenu={[
            { label: 'File Explorer', icon: 'folder', app: 'explorer' },
            ...(phase.download ? [{ label: 'Microsoft Edge', icon: 'app' as const, app: 'browser' }] : []),
          ]}
          winxMenu={[{ label: 'File Explorer', app: 'explorer' }, { label: 'Disk Management' }]}
          initialOpen={[phase.download ? 'browser' : 'mct']}
        >
          {uac && (
            <UacPrompt
              app="Windows 11 Setup"
              onNo={() => {
                setUac(null)
                run.say('info', 'การสร้างสื่อต้องใช้สิทธิ์ผู้ดูแลระบบ กด Yes เพื่อให้เครื่องมือทำงาน')
              }}
              onYes={() => {
                uac.open('mct')
                setUac(null)
                setToolOpen(true)
                run.log('อนุญาตสิทธิ์ผู้ดูแลระบบ (User Account Control) แล้วเปิด Media Creation Tool')
              }}
            />
          )}
        </Desktop>
      </Monitor>
      <BenchBar>
        <p>{done ? 'USB พร้อมแล้ว' : ready ? 'เปิด This PC แล้วกด Eject ที่ USB' : 'สร้าง USB ด้วย Media Creation Tool ตรวจชื่อและความจุก่อนเลือก'}</p>
        <DoneButton ready={!!ready} last={last} onDone={submit} />
      </BenchBar>
    </div>
  )
}
