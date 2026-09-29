import { useState } from 'react'
import { Icon } from '../../components/Icon'
import { Modal } from '../../components/Modal'
import { judgeEvidence } from '../../game/evidence'
import type { EvidenceRule } from '../../game/types'
import { EvidencePicker, Fact } from '../../screens/workbench/Fact'
import { useRun } from '../../screens/workbench/runContext'
import { BenchBar, Monitor } from '../common/Monitor'
import { Desktop, RestartScreen, type DesktopApp, type DesktopControl, type MenuItem } from '../desktop/Desktop'
import { DeviceManager, type DmCategory, type DmResult } from '../desktop/DeviceManager'
import { Dxdiag, type DxTab } from '../desktop/Dxdiag'
import { RunDialog } from '../desktop/RunDialog'
import { SettingsApp } from '../desktop/SettingsApp'
import { SoundSettingsPage, VolumeFlyout, type SoundState } from '../desktop/SoundControls'
import { MeetingApp } from './MeetingApp'
import '../audio.css'

const OUTPUTS = [
  { id: 'hdmi', name: 'ViewMax VX24 (HDMI Audio)' },
  { id: 'spk', name: 'Speakers (Nimbus HD Audio)' },
]

const FIX_RULE: EvidenceRule = {
  groups: [['vol-hdmi', 'mon-nospk', 'wo-hdmi']],
  acceptable: ['dm-ok', 'dx-ok', 'vol-level', 'spk-jack', 'wo-meeting'],
}

function ok(id: string, name: string, extra: Partial<DmCategory['devices'][number]> = {}) {
  return {
    id,
    name,
    status: 'ok' as const,
    statusText: 'This device is working properly.',
    manufacturer: 'Standard',
    provider: 'Microsoft',
    version: '10.0.19041.1',
    date: '6/21/2006',
    ...extra,
  }
}

export function MeetingAudioSim() {
  const run = useRun()
  const [output, setOutput] = useState('hdmi')
  const [volume, setVolume] = useState(70)
  const [muted, setMuted] = useState(false)
  const [playing, setPlaying] = useState(false)
  const [restarting, setRestarting] = useState(false)
  const [boot, setBoot] = useState(0)
  const [asking, setAsking] = useState(false)
  const [askEv, setAskEv] = useState<string[]>([])
  const [reasoned, setReasoned] = useState(false)

  const fixed = output === 'spk'
  const outName = OUTPUTS.find(o => o.id === output)?.name ?? ''
  const sound: SoundState = { broken: false, outputs: OUTPUTS, outputId: output, volume, muted }

  const investigateDone = () => {
    if (run.state.stage === 'investigate') run.setStage('fix')
  }

  const applySpeakers = () => {
    setOutput('spk')
    run.setStage('verify')
    run.log('เปลี่ยนอุปกรณ์ส่งออกเสียงจากจอ HDMI เป็นลำโพง Speakers (Nimbus HD Audio)')
    run.say('good', 'เปลี่ยนอุปกรณ์ส่งออกแล้ว ลองทดสอบในโปรแกรมประชุมที่ลูกค้าใช้จริง')
  }

  const selectOutput = (id: string) => {
    if (id === output) return
    if (id === 'spk' && !reasoned) {
      setAskEv([])
      setAsking(true)
      return
    }
    if (id === 'spk') applySpeakers()
    else {
      setOutput(id)
      run.say('info', 'กลับไปใช้จอ HDMI แล้ว จอนี้ไม่มีลำโพงในตัว')
    }
  }

  const confirmReason = () => {
    const verdict = judgeEvidence(askEv, FIX_RULE)
    run.reason('fix-output', verdict === 'ok')
    setReasoned(true)
    setAsking(false)
    if (verdict !== 'ok') {
      run.mistake(verdict === 'missing' ? 'ev-missing' : 'ev-irrelevant', { quiet: true })
      run.say('warn', 'ควรชี้หลักฐานให้ได้ว่าเสียงกำลังออกทางจอ HDMI ที่ไม่มีลำโพง ก่อนเปลี่ยนการตั้งค่า')
    }
    applySpeakers()
  }

  const test = (where: 'meeting' | 'system') => {
    setPlaying(true)
    window.setTimeout(() => setPlaying(false), 2500)
    if (!fixed || muted || volume === 0) {
      run.say('info', fixed ? 'ตอนนี้ปิดเสียงอยู่' : `เสียงทดสอบออกทาง ${outName} แต่คุณพลอยไม่ได้ยินอะไรเลย`)
      return
    }
    run.play('chime')
    if (where === 'meeting' && !run.hasCheck('check-meeting')) {
      run.check('check-meeting')
      run.log('ทดสอบลำโพงในโปรแกรมประชุม BloomMeet ได้ยินเสียงชัดเจน')
    } else if (where === 'system') run.say('info', 'เสียงออกแล้ว ลองทดสอบในโปรแกรมประชุมที่ลูกค้าใช้จริงด้วย')
  }

  const restart = () => {
    setRestarting(true)
    window.setTimeout(() => {
      setRestarting(false)
      setBoot(b => b + 1)
      run.say('info', 'รีสตาร์ตแล้ว เสียงยังออกทางเดิม การรีสตาร์ตไม่ได้เปลี่ยนอุปกรณ์ส่งออก')
    }, 2000)
  }

  const needless = (): DmResult => {
    run.mistake('unneeded-driver')
    return { ok: false, message: 'The best drivers for your device are already installed.' }
  }

  const categories: DmCategory[] = [
    {
      id: 'audio-io',
      name: 'Audio inputs and outputs',
      icon: 'speaker',
      devices: [ok('spk', 'Speakers (Nimbus HD Audio)'), ok('hdmi', 'ViewMax VX24 (HDMI Audio)'), ok('mic', 'Microphone (Nimbus HD Audio)')],
    },
    { id: 'display', name: 'Display adapters', icon: 'monitor', devices: [ok('gpu', 'Bloom Graphics UHD 630')] },
    { id: 'monitors', name: 'Monitors', icon: 'monitor', devices: [ok('mon', 'ViewMax VX24')] },
    {
      id: 'sound',
      name: 'Sound, video and game controllers',
      icon: 'speaker',
      devices: [
        ok('na892', 'Nimbus HD Audio NA-892', { manufacturer: 'Nimbus Semiconductor', provider: 'Nimbus Semiconductor', version: '6.0.9.1', date: '3/12/2024', facts: { row: 'dm-ok' } }),
        ok('hdmi-audio', 'Bloom Graphics HD Audio (HDMI)'),
      ],
    },
  ]

  const dxTabs: DxTab[] = [
    {
      id: 'system',
      label: 'System',
      group: 'System Information',
      rows: [
        { label: 'Computer Name', value: 'PLOYJAI-ACC01' },
        { label: 'Operating System', value: 'Windows 10 Pro 64-bit (10.0, Build 19045)' },
        { label: 'Memory', value: '8192MB RAM' },
      ],
      notes: { label: 'Notes', value: 'No problems found.' },
    },
    {
      id: 'sound1',
      label: 'Sound 1',
      group: 'Device',
      rows: [
        { label: 'Name', value: 'Speakers (Nimbus HD Audio)' },
        { label: 'Default Device', value: output === 'spk' ? 'Yes' : 'No' },
      ],
      notes: { label: 'Notes', value: 'No problems found.', fact: 'dx-ok' },
    },
    {
      id: 'sound2',
      label: 'Sound 2',
      group: 'Device',
      rows: [
        { label: 'Name', value: 'ViewMax VX24 (HDMI Audio)' },
        { label: 'Default Device', value: output === 'hdmi' ? 'Yes' : 'No' },
      ],
      notes: { label: 'Notes', value: 'No problems found.' },
    },
  ]

  const runCommand = (ctl: DesktopControl) => (cmd: string) => {
    const c = cmd.toLowerCase()
    if (c === 'dxdiag' || c === 'dxdiag.exe') {
      ctl.open('dxdiag')
      investigateDone()
      return null
    }
    if (c === 'devmgmt.msc') {
      ctl.open('devmgr')
      return null
    }
    if (c === 'mmsys.cpl') {
      ctl.open('settings')
      return null
    }
    return `Windows cannot find '${cmd}'. Make sure you typed the name correctly, and then try again.`
  }

  const flyoutFacts = output === 'hdmi' ? { output: 'vol-hdmi', level: 'vol-level' } : { level: 'vol-level' }

  const apps: DesktopApp[] = [
    {
      id: 'meeting',
      title: 'BloomMeet — ประชุมกับลูกค้า',
      icon: 'video',
      width: 520,
      height: 330,
      render: () => <MeetingApp outputName={outName} playing={playing} heard={fixed && !muted && volume > 0} onTest={() => test('meeting')} />,
    },
    {
      id: 'devmgr',
      title: 'Device Manager',
      icon: 'cpu',
      width: 540,
      height: 380,
      render: () => (
        <DeviceManager
          categories={categories}
          browseFolders={[]}
          onUpdateAuto={needless}
          onUpdateBrowse={needless}
          onOtherAction={(_, action) => {
            if (action === 'uninstall') run.mistake('unneeded-driver')
            else run.say('info', action === 'scan' ? 'สแกนแล้ว ทุกอุปกรณ์ทำงานปกติ' : 'ปิดอุปกรณ์ไม่ได้ช่วยให้ได้ยินเสียง')
          }}
        />
      ),
    },
    { id: 'dxdiag', title: 'DirectX Diagnostic Tool', icon: 'app', width: 540, height: 360, render: ctl => <Dxdiag tabs={dxTabs} onExit={() => ctl.close('dxdiag')} /> },
    { id: 'run', title: 'Run', icon: 'app', width: 400, height: 220, render: ctl => <RunDialog onRun={runCommand(ctl)} onClose={() => ctl.close('run')} /> },
    {
      id: 'settings',
      title: 'Settings',
      icon: 'gear',
      width: 580,
      height: 340,
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
                  onSelect={selectOutput}
                  onVolume={setVolume}
                  onMute={() => setMuted(m => !m)}
                  onTest={() => test('system')}
                  onTroubleshoot={() =>
                    fixed ? 'ไม่พบปัญหา' : 'อุปกรณ์เสียงทำงานปกติ แต่เสียงถูกส่งไปที่ ViewMax VX24 (HDMI Audio) ลองตรวจว่าอุปกรณ์นี้มีลำโพงหรือไม่'
                  }
                />
              ),
            },
          ]}
        />
      ),
    },
  ]

  const startMenu: MenuItem[] = [
    { label: 'BloomMeet', icon: 'video', app: 'meeting' },
    { label: 'Settings', icon: 'gear', app: 'settings' },
    { label: 'Run', icon: 'app', app: 'run' },
    { label: 'Power › Restart', icon: 'power', onSelect: restart },
  ]
  const winxMenu: MenuItem[] = [
    { label: 'Apps and Features' },
    { label: 'Event Viewer' },
    { label: 'System' },
    { label: 'Device Manager', app: 'devmgr' },
    { label: 'Network Connections' },
    { label: 'Task Manager' },
    { label: 'Settings', app: 'settings' },
    { label: 'Run', app: 'run' },
    { label: 'Shut down or sign out › Restart', onSelect: restart },
  ]

  const search = (q: string) => {
    if (q.includes('dxdiag')) return 'dxdiag'
    if (q.includes('device')) return 'devmgr'
    if (q.includes('sound') || q.includes('เสียง') || q.includes('setting')) return 'settings'
    if (q === 'run') return 'run'
    if (q.includes('meet')) return 'meeting'
    return null
  }

  const stage = run.state.stage

  return (
    <div className="sim-audio">
      <Monitor label="PC สำนักงานพลอยใจ · Windows 10 Pro 64-bit (ต่อจอ ViewMax ผ่าน HDMI)">
        <Desktop
          key={boot}
          wallpaper="teal"
          apps={apps}
          icons={[{ app: 'meeting', label: 'BloomMeet', icon: 'video' }]}
          startMenu={startMenu}
          winxMenu={winxMenu}
          search={search}
          initialOpen={['meeting']}
          onOpenApp={id => (id === 'devmgr' || id === 'settings' || id === 'dxdiag') && investigateDone()}
          volume={{
            state: muted ? 'mute' : 'ok',
            panel: () => (
              <VolumeFlyout
                state={sound}
                playing={playing}
                facts={flyoutFacts}
                onSelect={selectOutput}
                onVolume={setVolume}
                onMute={() => setMuted(m => !m)}
                onTest={() => test('system')}
              />
            ),
          }}
        >
          {restarting && <RestartScreen />}
        </Desktop>
      </Monitor>

      <section className="card desk" aria-label="โต๊ะของลูกค้า">
        <h3>
          <Icon name="eye" size={18} /> ดูรอบ ๆ โต๊ะของลูกค้า
        </h3>
        <div className="desk-items">
          <div className="desk-item">
            <span className="desk-art desk-art-monitor" aria-hidden />
            <div>
              <strong>จอใหม่ ViewMax VX24</strong>
              <small>ต่อกับเครื่องด้วยสาย HDMI</small>
              <span className="desk-label">
                ป้ายหลังจอ: <Fact id="mon-nospk">No built-in speakers · ไม่มีลำโพงในตัว</Fact>
              </span>
            </div>
          </div>
          <div className="desk-item">
            <span className="desk-art desk-art-speaker" aria-hidden />
            <div>
              <strong>ลำโพงตั้งโต๊ะ</strong>
              <small>ไฟสถานะสีเขียว เปิดอยู่</small>
              <span className="desk-label">
                <Fact id="spk-jack">เสียบช่องเสียงสีเขียวด้านหลังเครื่อง</Fact>
              </span>
            </div>
          </div>
        </div>
      </section>

      <BenchBar>
        <p>
          {stage === 'verify'
            ? 'ทดสอบลำโพงในโปรแกรมประชุมก่อนส่งงาน'
            : 'หาหลักฐานก่อนลงมือ: ไอคอนลำโพง, Device Manager และโต๊ะของลูกค้า'}
        </p>
        <button type="button" className="btn btn-primary btn-sm" disabled={!fixed} onClick={run.complete}>
          ส่งงาน <Icon name="arrowRight" size={16} />
        </button>
      </BenchBar>

      {asking && (
        <Modal
          title="ก่อนเปลี่ยนการตั้งค่า: เพราะอะไร?"
          tone="info"
          icon="pin"
          wide
          onClose={() => setAsking(false)}
          actions={[
            { label: 'ยกเลิก', onClick: () => setAsking(false) },
            { label: 'เปลี่ยนเป็น Speakers', variant: 'primary', onClick: confirmReason },
          ]}
        >
          <p>พี่บูตถาม: หลักฐานใดบอกว่าต้องเปลี่ยนอุปกรณ์ส่งออกเสียง ไม่ใช่ติดตั้งไดรเวอร์ใหม่?</p>
          <EvidencePicker label="หลักฐานการเปลี่ยนอุปกรณ์ส่งออก" value={askEv} onChange={setAskEv} />
        </Modal>
      )}
    </div>
  )
}
