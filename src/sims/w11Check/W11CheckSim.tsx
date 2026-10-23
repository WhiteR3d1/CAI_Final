import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import type { EvidenceRule } from '../../game/types'
import { useRun } from '../../screens/workbench/runContext'
import { BenchBar, Monitor } from '../common/Monitor'
import { Desktop, type DesktopApp } from '../desktop/Desktop'
import { FileExplorer, type FsNode } from '../desktop/FileExplorer'
import { SettingsApp } from '../desktop/SettingsApp'
import { EvidenceAsk, type Verdict } from '../windows/EvidenceAsk'
import { PLOY_PC } from '../win11/media11'
import { BitLockerPanel, CopyProgress, PcHealthCheck, SystemInfo, TpmConsole, type KeyBackup } from '../win11/SystemTools'
import { AboutPage11 } from '../win11/Win11Settings'
import '../windows/windows.css'

type Decision = 'now' | 'after-fw' | 'never'

const READY_RULE: EvidenceRule = { groups: [['si-cpu'], ['si-tpm'], ['si-uefi', 'si-secureboot']], acceptable: ['si-ram', 'si-disk', 'wo-ploy-pc', 'wo-ploy-win11'] }

const DECISIONS: { id: Decision; label: string }[] = [
  { id: 'now', label: 'พร้อมแล้ว ติดตั้ง Windows 11 ได้ทันที' },
  { id: 'after-fw', label: 'ติดตั้งได้ หลังเปิด TPM (และ Secure Boot) ในเมนู UEFI' },
  { id: 'never', label: 'ติดตั้งไม่ได้ ต้องเปลี่ยนเครื่องใหม่' },
]

export function W11CheckSim() {
  const run = useRun()
  const [decision, setDecision] = useState<Decision | null>(null)
  const [deciding, setDeciding] = useState(false)
  const [ask, setAsk] = useState<Decision | null>(null)
  const [copying, setCopying] = useState<'e' | 'c' | null>(null)
  const [backup, setBackup] = useState<{ e: boolean; c: boolean }>({ e: false, c: false })
  const [keySaved, setKeySaved] = useState(false)

  const stageAfter = (next: 'decide' | 'backup' | 'key') => run.setStage(next)

  /* ---------- spec tools ---------- */
  const onOpenApp = (id: string) => {
    if (id === 'msinfo' && !run.hasCheck('check-msinfo')) {
      run.check('check-msinfo')
      run.log('เปิด System Information (msinfo32) ดู BIOS Mode และ Secure Boot State')
    }
    if (id === 'tpm' && !run.hasCheck('check-tpm')) {
      run.check('check-tpm')
      run.log('เปิด tpm.msc ดูสถานะ TPM')
      run.say('info', 'แปล: "Compatible TPM cannot be found" = Windows มองไม่เห็น TPM ที่ใช้ได้ ข้อความแนะนำให้ตรวจว่าเปิด TPM ใน BIOS (เฟิร์มแวร์) แล้วหรือยัง')
    }
  }
  const healthChecked = () => {
    if (run.hasCheck('check-health')) return
    run.check('check-health')
    run.log('รัน PC Health Check: ผ่านเกือบทุกข้อ ยกเว้น TPM 2.0')
    run.say('info', 'PC Health Check บอกว่ายังไม่พร้อมเพราะ TPM อย่าเพิ่งสรุป ยืนยันด้วย msinfo32 และ tpm.msc ก่อน แล้วกดหมุดข้อมูลสำคัญเก็บไว้')
    stageAfter('decide')
  }

  /* ---------- readiness decision ---------- */
  const judge = (verdict: Verdict) => {
    if (verdict === 'ok') {
      run.say('good', 'หลักฐานครบ: CPU รองรับ บูตแบบ UEFI แต่ระบบยังมองไม่เห็น TPM')
      return
    }
    run.mistake(verdict === 'missing' ? 'ev-missing' : 'ev-irrelevant', { quiet: true })
    run.say('warn', verdict === 'missing' ? 'ควรมีหลักฐานทั้ง CPU, สถานะ TPM และโหมดเฟิร์มแวร์ (UEFI/Secure Boot) ก่อนสรุป' : 'หลักฐานบางข้อไม่ได้บอกความพร้อมของฮาร์ดแวร์')
  }
  const decide = (d: Decision) => {
    setDecision(d)
    if (d === 'now') run.mistake('ready-now')
    else if (d === 'never') run.mistake('ready-never')
    else {
      run.log('สรุป: เครื่องผ่าน CPU/RAM/ดิสก์/UEFI แต่ต้องเปิด TPM 2.0 (และ Secure Boot) ในเมนู UEFI ก่อนติดตั้ง')
      run.say('good', 'สรุปถูก เปิด TPM และ Secure Boot ในเฟิร์มแวร์ได้ในงาน W11-03 ตอนนี้สำรองไฟล์ลูกค้าก่อน')
    }
    stageAfter('backup')
  }

  /* ---------- backup ---------- */
  const copyTo = (where: 'e' | 'c') => {
    if (copying || backup[where]) return
    setCopying(where)
  }
  const copyDone = () => {
    const where = copying
    setCopying(null)
    if (!where) return
    setBackup(b => ({ ...b, [where]: true }))
    if (where === 'c') {
      run.mistake('backup-same-disk', { actions: [{ label: 'คัดลอกไป BACKUP-PLOY (E:) แทน', variant: 'primary' }] })
      return
    }
    run.log('คัดลอกโฟลเดอร์ "บัญชีลูกค้า 2026" (1,240 ไฟล์) ไปที่ BACKUP-PLOY (E:)')
    run.say('good', 'คัดลอกเสร็จ ต่อไปเปิด BACKUP-PLOY (E:) แล้วลองเปิดไฟล์สักไฟล์ ให้แน่ใจว่าสำเนาใช้ได้')
  }
  const openBackupFile = () => {
    if (run.hasCheck('check-backup-open')) return
    run.check('check-backup-open')
    run.log('เปิดไฟล์ "งบการเงิน-ก.ย.2026.xlsx" จาก BACKUP-PLOY (E:) ได้ ไฟล์สำรองใช้งานได้จริง')
    stageAfter('key')
  }

  /* ---------- BitLocker recovery key ---------- */
  const saveKey = (method: KeyBackup, drive?: string): string | null => {
    if ((method === 'file' || method === 'usb') && drive === 'C') {
      run.say('info', 'แปล: บันทึกคีย์กู้คืนไว้ในไดรฟ์ที่เข้ารหัสอยู่ไม่ได้ เพราะถ้าไดรฟ์นั้นเปิดไม่ได้ คีย์ก็หายไปด้วย เลือกไดรฟ์อื่น')
      return "Your recovery key can't be saved in this location. Choose a different location."
    }
    setKeySaved(true)
    run.log(method === 'print' ? 'พิมพ์คีย์กู้คืน BitLocker เก็บไว้ให้ลูกค้า' : 'บันทึกคีย์กู้คืน BitLocker ไว้ใน BACKUP-PLOY (E:)')
    run.say('good', 'เก็บคีย์กู้คืนไว้นอกไดรฟ์ที่เข้ารหัสแล้ว')
    return null
  }

  /* ---------- submit ---------- */
  const submit = () => {
    if (!decision) {
      run.say('warn', 'ยังไม่ได้สรุปความพร้อมของเครื่อง กดปุ่ม "สรุปความพร้อม" ก่อน')
      return
    }
    const finishKey = () => {
      if (keySaved) return run.complete()
      run.alert({
        tone: 'warn',
        title: 'ยังไม่ได้เก็บคีย์กู้คืน BitLocker',
        text: 'ไดรฟ์ C: เปิด BitLocker อยู่ ถ้าเกิดปัญหาระหว่างติดตั้งแล้วต้องใช้คีย์ จะไม่มีทางเปิดไดรฟ์ได้อีก',
        actions: [
          { label: 'ส่งงานเลย (ไม่แนะนำ)', onClick: () => run.mistake('no-recovery-key', { actions: [{ label: 'ส่งงาน', variant: 'primary', onClick: run.complete }] }) },
          { label: 'กลับไปเก็บคีย์ก่อน', variant: 'primary' },
        ],
      })
    }
    if (backup.e) return finishKey()
    run.alert({
      tone: 'warn',
      title: 'ยังไม่ได้สำรองไฟล์ลูกค้าไปยังสื่อแยก',
      text: 'งานถัดไปจะล้างดิสก์ทั้งลูก ไฟล์บัญชีลูกค้าที่ยังไม่มีสำเนานอกเครื่องจะหายถาวร',
      actions: [
        { label: 'ส่งงานเลย (ไม่แนะนำ)', onClick: () => run.mistake('no-backup', { actions: [{ label: 'ไปต่อ', variant: 'primary', onClick: finishKey }] }) },
        { label: 'กลับไปสำรองก่อน', variant: 'primary' },
      ],
    })
  }

  /* ---------- screens ---------- */
  const files: FsNode = {
    id: 'acc',
    name: 'บัญชีลูกค้า 2026',
    kind: 'folder',
    detail: '1,240 ไฟล์ · 3.8 GB',
    summary: 'ไฟล์บัญชีลูกค้า 1,240 ไฟล์ (Excel และ PDF)',
    actions: [
      { label: backup.e ? 'สำรองแล้ว ✓' : 'Copy to BACKUP-PLOY (E:)', primary: true, onClick: () => copyTo('e') },
      { label: backup.c ? 'อยู่ใน C:\\Backup แล้ว' : 'Copy to Local Disk (C:)\\Backup', onClick: () => copyTo('c') },
    ],
  }
  const tree: FsNode = {
    id: 'pc',
    name: 'This PC',
    kind: 'pc',
    children: [
      {
        id: 'c',
        name: 'Local Disk (C:)',
        kind: 'drive',
        detail: 'BitLocker on · ว่าง 96 GB จาก 237 GB',
        children: [
          {
            id: 'users',
            name: 'Users',
            kind: 'folder',
            children: [{ id: 'ploy', name: 'Ploy', kind: 'folder', children: [{ id: 'docs', name: 'Documents', kind: 'folder', children: [files] }] }],
          },
          { id: 'win', name: 'Windows', kind: 'folder', children: [] },
          ...(backup.c ? [{ id: 'cbak', name: 'Backup', kind: 'folder' as const, summary: 'สำเนา "บัญชีลูกค้า 2026" (อยู่ในดิสก์เดียวกับที่จะล้าง)' }] : []),
        ],
      },
      {
        id: 'e',
        name: 'BACKUP-PLOY (E:)',
        kind: 'usb',
        detail: 'ฮาร์ดดิสก์ภายนอกของลูกค้า · 931 GB',
        children: backup.e
          ? [
              {
                id: 'bk',
                name: 'สำรอง-PLOY-NB',
                kind: 'folder',
                children: [
                  { id: 'bk-acc', name: 'บัญชีลูกค้า 2026', kind: 'folder', summary: 'สำเนา 1,240 ไฟล์ ครบตามต้นฉบับ' },
                  { id: 'bk-xlsx', name: 'งบการเงิน-ก.ย.2026.xlsx', kind: 'file', detail: 'Excel · 2.1 MB', onOpen: openBackupFile },
                ],
              },
            ]
          : [],
      },
    ],
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
          onChecked={healthChecked}
          rows={[
            { ok: true, text: 'The processor is supported for Windows 11.', detail: 'Processor: Bloom Core 5 1240U', fact: 'si-cpu' },
            { ok: true, text: 'There is at least 4 GB of system memory (RAM).', detail: 'System memory: 8 GB', fact: 'si-ram' },
            { ok: true, text: 'The system disk is 64 GB or larger.', detail: 'Storage: 256 GB', fact: 'si-disk' },
            { ok: true, text: 'This PC supports Secure Boot.', detail: 'Secure Boot capable' },
            { ok: false, text: 'TPM 2.0 must be supported and enabled on this PC.', detail: 'TPM: TPM not detected.', fact: 'si-tpm' },
          ]}
        />
      ),
    },
    {
      id: 'msinfo',
      title: 'System Information',
      icon: 'info',
      width: 620,
      height: 360,
      render: () => (
        <SystemInfo
          rows={[
            { label: 'OS Name', value: 'Microsoft Windows 10 Pro' },
            { label: 'Version', value: '10.0.19045 Build 19045' },
            { label: 'System Name', value: PLOY_PC.name },
            { label: 'System Manufacturer', value: 'Bloom' },
            { label: 'System Model', value: 'BloomBook 14 G3' },
            { label: 'System Type', value: 'x64-based PC' },
            { label: 'Processor', value: PLOY_PC.cpu, fact: 'si-cpu' },
            { label: 'BIOS Version/Date', value: 'Bloom Firmware 1.08, 3/14/2023' },
            { label: 'BIOS Mode', value: 'UEFI', fact: 'si-uefi' },
            { label: 'Secure Boot State', value: 'Off', fact: 'si-secureboot' },
            { label: 'Installed Physical Memory (RAM)', value: PLOY_PC.ram, fact: 'si-ram' },
          ]}
        />
      ),
    },
    {
      id: 'tpm',
      title: 'TPM Management on Local Computer',
      icon: 'cpu',
      width: 520,
      height: 280,
      render: () => <TpmConsole ready={false} fact="si-tpm" />,
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
              id: 'about',
              label: 'About',
              icon: 'info',
              render: () => (
                <AboutPage11
                  device={PLOY_PC.name}
                  specs={[
                    { label: 'Processor', value: PLOY_PC.cpu, fact: 'si-cpu' },
                    { label: 'Installed RAM', value: PLOY_PC.ram, fact: 'si-ram' },
                    { label: 'System type', value: '64-bit operating system, x64-based processor' },
                  ]}
                  windows={[
                    { label: 'Edition', value: 'Windows 10 Pro', fact: 'wo-ploy-pc' },
                    { label: 'Version', value: '22H2' },
                  ]}
                />
              ),
            },
          ]}
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
            { label: 'Documents', path: ['c', 'users', 'ploy', 'docs'], icon: 'folder' },
            { label: 'BACKUP-PLOY (E:)', path: ['e'], icon: 'usb' },
          ]}
        />
      ),
    },
    {
      id: 'bitlocker',
      title: 'BitLocker Drive Encryption',
      icon: 'lock',
      width: 560,
      height: 360,
      render: () => (
        <BitLockerPanel
          accountSignedIn={false}
          drives={[
            { id: 'C', label: 'Local Disk (C:)', removable: false },
            { id: 'E', label: 'BACKUP-PLOY (E:)', removable: true },
          ]}
          onBackup={saveKey}
        />
      ),
    },
  ]

  const search = (q: string) =>
    q.includes('health')
      ? 'health'
      : q.includes('msinfo') || q.includes('system information')
        ? 'msinfo'
        : q.includes('tpm')
          ? 'tpm'
          : q.includes('bitlocker')
            ? 'bitlocker'
            : q.includes('about') || q.includes('setting')
              ? 'settings'
              : q.includes('explorer') || q.includes('this pc') || q.includes('document')
                ? 'explorer'
                : null

  const tip = !run.hasCheck('check-health')
    ? 'ตรวจความพร้อม: พิมพ์ health ในช่องค้นหาเพื่อเปิด PC Health Check'
    : !decision
      ? 'ยืนยันด้วย msinfo32 และ tpm.msc กดหมุดหลักฐาน แล้วกด "สรุปความพร้อม"'
      : !backup.e
        ? 'สำรองโฟลเดอร์ "บัญชีลูกค้า 2026" ไปยัง BACKUP-PLOY (E:)'
        : !run.hasCheck('check-backup-open')
          ? 'เปิดไฟล์จาก BACKUP-PLOY (E:) ทดสอบว่าสำเนาใช้ได้'
          : !keySaved
            ? 'พิมพ์ bitlocker ในช่องค้นหา แล้วเก็บคีย์กู้คืนไว้นอกไดรฟ์ C:'
            : 'ครบแล้ว ส่งงานได้'

  return (
    <div className="sim-w11-check">
      <Monitor label="โน้ตบุ๊กของคุณพลอย (PLOY-NB) · Windows 10 Pro · เสียบ BACKUP-PLOY (E:) ไว้แล้ว">
        <Desktop
          wallpaper="blue"
          apps={apps}
          icons={[
            { app: 'explorer', label: 'This PC', icon: 'monitor' },
            { app: 'health', label: 'PC Health Check', icon: 'shield' },
          ]}
          startMenu={[
            { label: 'PC Health Check', icon: 'shield', app: 'health' },
            { label: 'File Explorer', icon: 'folder', app: 'explorer' },
            { label: 'Settings', icon: 'gear', app: 'settings' },
            { label: 'System Information (msinfo32)', icon: 'info', app: 'msinfo' },
            { label: 'TPM Management (tpm.msc)', icon: 'cpu', app: 'tpm' },
            { label: 'BitLocker Drive Encryption', icon: 'lock', app: 'bitlocker' },
          ]}
          winxMenu={[
            { label: 'System', app: 'settings' },
            { label: 'Device Manager' },
            { label: 'Disk Management' },
            { label: 'File Explorer', app: 'explorer' },
            { label: 'Run' },
          ]}
          search={search}
          onOpenApp={onOpenApp}
        >
          {copying && <CopyProgress title={`Copying 1,240 items from Documents to ${copying === 'e' ? 'BACKUP-PLOY (E:)' : 'Local Disk (C:)\\Backup'}`} onDone={copyDone} />}
        </Desktop>
      </Monitor>
      <BenchBar>
        <p>{tip}</p>
        <button type="button" className="btn btn-gold btn-sm" onClick={() => setDeciding(true)} disabled={!!decision}>
          <Icon name="clipboard" size={16} /> {decision ? 'สรุปความพร้อมแล้ว' : 'สรุปความพร้อม'}
        </button>
        <button type="button" className="btn btn-primary btn-sm" onClick={submit}>
          ส่งงาน <Icon name="arrowRight" size={16} />
        </button>
      </BenchBar>

      {deciding && (
        <Modal
          title="สรุปความพร้อมของ PLOY-NB สำหรับ Windows 11"
          icon="clipboard"
          wide
          onClose={() => setDeciding(false)}
          actions={[
            ...DECISIONS.map(d => ({
              label: d.label,
              onClick: () => {
                setDeciding(false)
                setAsk(d.id)
              },
            })),
            { label: 'ยังไม่สรุป', onClick: () => setDeciding(false) },
          ]}
        >
          <p>จากเครื่องมือที่ตรวจแล้ว เครื่องนี้พร้อมสำหรับ Windows 11 แค่ไหน</p>
        </Modal>
      )}

      {ask && (
        <EvidenceAsk
          id="readiness"
          title="หลักฐานที่ใช้สรุปความพร้อม"
          rule={READY_RULE}
          confirmLabel="ยืนยันการสรุป"
          onCancel={() => setAsk(null)}
          onConfirm={verdict => {
            judge(verdict)
            const d = ask
            setAsk(null)
            decide(d)
          }}
        >
          <p>
            คำตอบที่เลือก: <strong>{DECISIONS.find(d => d.id === ask)?.label}</strong>
          </p>
          <p>พี่บูตถาม: ใช้หลักฐานอะไรยืนยัน (ควรมีทั้ง CPU, TPM และโหมดเฟิร์มแวร์)</p>
        </EvidenceAsk>
      )}
    </div>
  )
}
