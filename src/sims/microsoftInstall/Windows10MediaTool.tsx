import { useEffect, useState } from 'react'
import { useRun } from '../../screens/workbench/runContext'
import { mediaIssue, MICROSOFT_WIN10_URL, type MediaOptions } from './mediaCreation'
import './microsoft.css'

type Page = 'search' | 'website' | 'download' | 'license' | 'task' | 'options' | 'media' | 'drive' | 'confirm' | 'progress' | 'ready'

export function Windows10MediaTool({ onDone }: { onDone: () => void }) {
  const run = useRun()
  const [page, setPage] = useState<Page>('search')
  const [options, setOptions] = useState<MediaOptions>({ task: 'upgrade', language: 'English', architecture: '32', media: 'usb', drive: '' })
  const [recommended, setRecommended] = useState(true)
  const [confirmed, setConfirmed] = useState(false)
  const [progress, setProgress] = useState(0)
  const set = (key: keyof MediaOptions, value: string) => setOptions(prev => ({ ...prev, [key]: value }))

  useEffect(() => {
    if (page !== 'progress') return
    const started = Date.now()
    const timer = window.setInterval(() => {
      const value = Math.min(100, Math.floor((Date.now() - started) / 120))
      setProgress(value)
      if (value === 100) { window.clearInterval(timer); setPage('ready') }
    }, 120)
    return () => window.clearInterval(timer)
  }, [page])

  const next = (target: Page, issue: string | null = null) => {
    if (issue) { run.mistake(issue); return }
    setPage(target)
  }
  const issue = mediaIssue(options)
  const radio = (key: keyof MediaOptions, value: string, label: string) => (
    <label className="mct10-choice"><input type="radio" name={key} value={value} checked={options[key] === value} onChange={() => set(key, value)} />{label}</label>
  )
  const navigation = (back: Page, target: Page, error: string | null = null) => <footer className="mct10-footer"><button type="button" className="w-btn" onClick={() => setPage(back)}>Back</button><button type="button" className="w-btn w-btn-primary" onClick={() => next(target, error)}>Next</button></footer>

  return <div className="mct10">
    <div className="mct10-caption">{['search', 'website', 'download'].includes(page) ? 'Browser · หน้าเว็บจำลอง' : 'Windows 10 Setup · Media Creation Tool'}</div>
    {page === 'search' && <section>
      <h2>ดาวน์โหลด Windows 10</h2><p>เลือกแหล่งดาวน์โหลดเครื่องมือสร้างสื่อให้ลูกค้า</p>
      <button className="mct10-result" type="button" onClick={() => { run.check('check-microsoft'); setPage('website') }}><strong>ดาวน์โหลด Windows 10 — Microsoft</strong><small>{MICROSOFT_WIN10_URL}</small></button>
      <button className="mct10-result" type="button" onClick={() => run.mistake('mct-source')}><strong>Windows 10 พร้อมโปรแกรมเสริม — ดาวน์โหลดเร็ว</strong><small>win-download.example (เว็บตัวอย่าง)</small></button>
    </section>}
    {page === 'website' && <section className="mct10-site">
      <div className="mct10-address">{MICROSOFT_WIN10_URL}</div>
      <h2>สร้างสื่อการติดตั้ง Windows 10</h2>
      <p>ใช้เครื่องมือของ Microsoft สร้าง USB สำหรับติดตั้ง Windows 10 บนเครื่องที่มีสิทธิ์ใช้งาน อ่านข้อมูลเครื่องลูกค้าก่อนเลือกภาษาและสถาปัตยกรรม</p>
      <button type="button" className="mct10-download" onClick={() => setPage('download')}>ดาวน์โหลดตอนนี้</button>
      <p className="muted">การดาวน์โหลดในเกมเป็นการจำลอง</p>
    </section>}
    {page === 'download' && <section><h2>ดาวน์โหลดเครื่องมือเรียบร้อย</h2><p>MediaCreationTool_22H2.exe · Microsoft Corporation</p><button type="button" className="w-btn" onClick={() => setPage('license')}>เปิดเครื่องมือ</button></section>}
    {page === 'license' && <section><h2>Applicable notices and license terms</h2><p>Microsoft Media Creation Tool</p><p>อ่านและยอมรับเงื่อนไขการใช้เครื่องมือก่อนดำเนินการ การใช้เครื่องมือไม่ได้ให้สิทธิ์ใช้งาน Windows เพิ่มเติม</p><p className="muted">สรุปเพื่อการเรียนรู้ ไม่ใช่ข้อความสัญญาฉบับเต็ม</p><footer className="mct10-footer"><button type="button" className="w-btn" onClick={() => setPage('download')}>Decline</button><button type="button" className="w-btn w-btn-primary" onClick={() => setPage('task')}>Accept</button></footer></section>}
    {page === 'task' && <section><h2>What do you want to do?</h2>{radio('task', 'upgrade', 'Upgrade this PC now')}{radio('task', 'create', 'Create installation media (USB flash drive, DVD, or ISO file) for another PC')}{navigation('license', 'options', options.task === 'create' ? null : 'mct-task')}</section>}
    {page === 'options' && <section><h2>Select language, architecture, and edition</h2>
      <label className="mct10-choice"><input type="checkbox" checked={recommended} onChange={e => { setRecommended(e.target.checked); if (e.target.checked) setOptions(prev => ({ ...prev, language: 'English', architecture: '32' })) }} />Use the recommended options for this PC</label>
      <p className="muted">เครื่องร้าน: English · 32-bit / เครื่องลูกค้า: ภาษาไทย · CPU x64 · RAM 16 GB</p>
      <label className="mct10-field">Language<select disabled={recommended} value={options.language} onChange={e => set('language', e.target.value)}><option value="English">English (United States)</option><option value="Thai">ไทย</option></select></label>
      <label className="mct10-field">Edition<select aria-label="Edition" disabled value="Windows 10"><option>Windows 10</option></select></label>
      <label className="mct10-field">Architecture<select disabled={recommended} value={options.architecture} onChange={e => set('architecture', e.target.value)}><option value="32">32-bit (x86)</option><option value="64">64-bit (x64)</option></select></label>
      {navigation('task', 'media', options.language === 'Thai' && options.architecture === '64' ? null : 'mct-options')}</section>}
    {page === 'media' && <section><h2>Choose which media to use</h2>{radio('media', 'usb', 'USB flash drive — It needs to be at least 8 GB')}{radio('media', 'iso', 'ISO file — Save an image for later')}{navigation('options', 'drive', options.media === 'usb' ? null : 'mct-media')}</section>}
    {page === 'drive' && <section><h2>Select a USB flash drive</h2><p>Files on your USB drive will be deleted.</p>{radio('drive', 'E', 'SHOP-BACKUP (E:) · 2 TB · ข้อมูลสำรองลูกค้า')}{radio('drive', 'F', 'KINGSTON (F:) · 16 GB · ว่างเปล่า')}{navigation('media', 'confirm', options.drive === 'F' ? null : options.drive ? 'mct-drive' : 'mct-no-drive')}</section>}
    {page === 'confirm' && <section><h2>ตรวจอุปกรณ์ก่อนเขียน USB</h2><p>Windows 10 · ภาษาไทย · 64-bit → KINGSTON (F:) 16 GB</p><label className="mct10-choice"><input type="checkbox" checked={confirmed} onChange={e => setConfirmed(e.target.checked)} />ตรวจชื่อและขนาดแล้ว ยืนยันว่าแฟลชไดรฟ์ว่างและยอมให้ลบข้อมูล</label><p className="muted">จุดตรวจเพื่อการเรียนรู้ที่เพิ่มในเกม</p><footer className="mct10-footer"><button type="button" className="w-btn" onClick={() => setPage('drive')}>Back</button><button type="button" className="w-btn w-btn-primary" disabled={!confirmed} onClick={() => { if (!issue) { run.check('check-media-options'); setPage('progress') } else run.mistake(issue) }}>สร้าง USB</button></footer></section>}
    {page === 'progress' && <section role="status"><h2>{progress < 60 ? 'Downloading Windows 10' : 'Creating Windows 10 media'}</h2><progress value={progress} max={100} /><p>Progress: {progress}%</p><small>เกมเร่งเวลาให้เพื่อการเรียน</small></section>}
    {page === 'ready' && <section><h2>Your USB flash drive is ready</h2><p>KINGSTON (F:) · Windows 10 · ภาษาไทย · 64-bit</p><p>USB พร้อมใช้กับเครื่องลูกค้า ขั้นต่อไปบูต USB แบบ UEFI ให้ตรงกับดิสก์ GPT ของลูกค้า</p><button type="button" className="w-btn w-btn-primary" onClick={() => { run.check('check-media-ready'); onDone() }}>Finish</button></section>}
  </div>
}
