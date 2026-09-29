import { useState } from 'react'
import { Speech } from '../../components/Bits'
import { Icon, type IconName } from '../../components/Icon'
import { judgeEvidence } from '../../game/evidence'
import { EvidencePicker } from '../../screens/workbench/Fact'
import { WorkOrder } from '../../screens/workbench/Intake'
import { useRun } from '../../screens/workbench/runContext'
import { BiosSetup, type BiosInfoRow } from '../common/BiosSetup'
import { BenchBar, Monitor } from '../common/Monitor'
import { PostScreen } from '../common/PostScreen'
import { ANSWER_LABEL, DECISIONS, REQUIREMENTS, type DecisionId } from './decisions'
import './chooseOs.css'

type Tab = 'order' | 'pc' | 'proposal' | 'review'
type Pc = 'off' | 'post' | 'bios' | 'noos'
type VerdictKind = 'ok' | 'wrong' | 'evidence' | 'empty'

const BIOS_INFO: BiosInfoRow[] = [
  { label: 'BIOS Version', value: '2.14 (UEFI)' },
  { label: 'Processor Type', value: 'Bloom Core 5 · 64-bit (x64)', fact: 'hw-cpu' },
  { label: 'Processor Cores', value: '4' },
  { label: 'Total Memory', value: '8192 MB', fact: 'hw-ram' },
  { label: 'SATA Port 0', value: 'SSD 512 GB', fact: 'hw-ssd' },
  { label: 'Boot Mode', value: 'UEFI', fact: 'hw-uefi' },
]

const EMPTY_CHOICE: Record<DecisionId, string> = { std: '', os: '', edition: '', arch: '' }
const EMPTY_EVIDENCE: Record<DecisionId, string[]> = { std: [], os: [], edition: [], arch: [] }
const VERDICT_ICON: Record<VerdictKind, IconName> = { ok: 'check', wrong: 'x', evidence: 'pin', empty: 'info' }

export function ChooseOsSim() {
  const run = useRun()
  const [tab, setTab] = useState<Tab>('order')
  const [pc, setPc] = useState<Pc>('off')
  const [boots, setBoots] = useState(0)
  const [choice, setChoice] = useState(EMPTY_CHOICE)
  const [evidence, setEvidence] = useState(EMPTY_EVIDENCE)
  const [verdicts, setVerdicts] = useState<Partial<Record<DecisionId, { kind: VerdictKind; text: string }>>>({})
  const [scored, setScored] = useState<DecisionId[]>([])
  const [accepted, setAccepted] = useState(false)
  const [mapping, setMapping] = useState<Record<string, string>>({})
  const [mapResult, setMapResult] = useState<Record<string, boolean> | null>(null)

  const reviewDone = run.hasCheck('review-needs')
  const licenseDone = run.hasCheck('tell-license')

  const openTab = (next: Tab) => {
    setTab(next)
    if (next === 'proposal' && run.state.stage === 'inspect') run.setStage('propose')
  }

  const powerOn = () => {
    setBoots(b => b + 1)
    setPc('post')
  }

  const postKey = (key: string) => {
    if (key === 'F2') {
      setPc('bios')
      run.log('เปิดเครื่องแล้วกด F2 เข้า BIOS ตรวจหน่วยความจำและซีพียู')
    } else {
      run.say('info', 'เครื่องใหม่ยังไม่มีระบบปฏิบัติการให้เลือกบูต งานนี้ให้กด F2 เข้า BIOS ดูสเปก')
    }
  }

  const leaveBios = () => {
    setPc('noos')
    run.say('info', 'ออกจาก BIOS แล้ว เครื่องใหม่ยังไม่มีระบบปฏิบัติการจึงบูตต่อไม่ได้ เป็นเรื่องปกติของเครื่องเปล่า')
  }

  const submit = () => {
    const next: Partial<Record<DecisionId, { kind: VerdictKind; text: string }>> = {}
    const nowScored = [...scored]
    let fixes = 0
    for (const d of DECISIONS) {
      const value = choice[d.id]
      if (!value) {
        next[d.id] = { kind: 'empty', text: 'ยังไม่ได้เลือกข้อนี้' }
        fixes++
        continue
      }
      if (value !== d.correct) {
        const option = d.options.find(o => o.value === value)
        const def = option?.mistake ? run.job.mistakes[option.mistake] : undefined
        if (option?.mistake) run.mistake(option.mistake, { quiet: true })
        next[d.id] = { kind: 'wrong', text: def ? `${def.explain}${def.ref ? ` (${def.ref})` : ''}` : 'ยังไม่ตรงกับความต้องการของลูกค้า' }
        fixes++
        continue
      }
      const verdict = judgeEvidence(evidence[d.id], d.rule)
      if (!nowScored.includes(d.id)) {
        run.reason(`choose-${d.id}`, verdict === 'ok')
        nowScored.push(d.id)
      }
      if (verdict !== 'ok') {
        run.mistake(verdict === 'missing' ? 'ev-missing' : 'ev-irrelevant', { quiet: true })
        next[d.id] = {
          kind: 'evidence',
          text: `เลือกถูกแล้ว แต่${verdict === 'missing' ? 'ยังไม่มีหลักฐานที่ตรงประเด็น' : 'มีหลักฐานที่ไม่เกี่ยวข้องปนอยู่'} — ${d.evidenceTip}`,
        }
        fixes++
        continue
      }
      next[d.id] = { kind: 'ok', text: d.ok }
    }
    setVerdicts(next)
    setScored(nowScored)
    if (fixes === 0) {
      setAccepted(true)
      setTab('review')
      run.setStage('review')
      run.log('เขียนใบเสนอ: มาตรฐานปิด · Windows 10 Pro · 64 บิต พร้อมหลักฐานทุกข้อ')
      run.say('good', 'ใบเสนอผ่าน! ต่อไปทวนกับคุณพลอยว่าตอบทุกความต้องการ และแจ้งเรื่องค่าลิขสิทธิ์')
      run.play('success')
    } else {
      run.play('error')
      run.say('warn', `ใบเสนอยังมี ${fixes} ข้อที่ต้องแก้ อ่านคำอธิบายใต้แต่ละข้อแล้วส่งใหม่`)
    }
  }

  const checkMapping = () => {
    const result: Record<string, boolean> = {}
    for (const r of REQUIREMENTS) {
      const picked = mapping[r.id]
      result[r.id] = picked === r.answer || (r.id === 'r-app' && picked === 'std')
    }
    setMapResult(result)
    if (Object.values(result).every(Boolean)) {
      run.check('review-needs')
      run.log('ทวนความต้องการกับลูกค้า ชี้ให้เห็นว่าแต่ละข้อได้คำตอบจากส่วนไหนของใบเสนอ')
    } else {
      run.play('error')
      run.say('warn', 'ยังจับคู่ความต้องการกับใบเสนอไม่ถูกทุกข้อ ลองดูข้อที่มีกากบาท')
    }
  }

  const tellLicense = () => {
    run.check('tell-license')
    run.log('แจ้งลูกค้าว่า Windows 10 Pro เป็นมาตรฐานปิด ต้องซื้อลิขสิทธิ์')
  }

  const tabs: [Tab, string, IconName][] = [
    ['order', 'ใบสั่งงาน', 'clipboard'],
    ['pc', 'เครื่องลูกค้า', 'monitor'],
    ['proposal', 'ใบเสนอ', 'file'],
    ...(accepted ? ([['review', 'ทวนกับลูกค้า', 'users']] as [Tab, string, IconName][]) : []),
  ]

  return (
    <div className="sim-choose">
      <div className="desk-tabs" role="tablist" aria-label="สิ่งที่อยู่บนโต๊ะ">
        {tabs.map(([id, label, icon]) => (
          <button key={id} type="button" role="tab" aria-selected={tab === id} onClick={() => openTab(id)}>
            <Icon name={icon} size={17} />
            {label}
          </button>
        ))}
      </div>

      {tab === 'order' && (
        <section className="card paper sim-paper">
          <div className="paper-head">
            <span className="eyebrow">ใบสั่งงาน · สำนักงานบัญชีพลอยใจ</span>
          </div>
          <p className="muted">อ่านทีละบรรทัด กดหมุดเฉพาะข้อที่ช่วยตัดสินใจเลือก OS ข้อที่ไม่เกี่ยวข้องปล่อยไว้</p>
          <WorkOrder />
          <div className="sim-paper-next">
            <button type="button" className="btn btn-ghost" onClick={() => openTab('pc')}>
              ต่อไป: ตรวจสเปกเครื่อง <Icon name="arrowRight" size={16} />
            </button>
          </div>
        </section>
      )}

      {tab === 'pc' && (
        <>
          <Monitor label="เครื่องลูกค้า · PC ใหม่ของสำนักงาน (ยังไม่มี OS)">
            {pc === 'off' && (
              <div className="pc-off">
                <p>เครื่องยังปิดอยู่</p>
                <button type="button" className="power-btn" onClick={powerOn}>
                  <Icon name="power" size={28} />
                  <span>เปิดเครื่อง</span>
                </button>
              </div>
            )}
            {pc === 'post' && <PostScreen key={boots} seconds={7} keys={['F2', 'F12']} onKey={postKey} onTimeout={() => setPc('noos')} />}
            {pc === 'bios' && (
              <BiosSetup
                mode="info"
                info={BIOS_INFO}
                drives={['SSD 512GB']}
                onSaveExit={leaveBios}
                onDiscardExit={leaveBios}
                onNote={t => run.say('info', t)}
              />
            )}
            {pc === 'noos' && (
              <div className="noos">
                <p>Reboot and Select proper Boot device</p>
                <p>or Insert Boot Media in selected Boot device and press a key_</p>
                <button type="button" className="btn btn-ghost btn-sm noos-btn" onClick={powerOn}>
                  <Icon name="refresh" size={16} /> รีสตาร์ตเครื่อง
                </button>
              </div>
            )}
          </Monitor>
          <BenchBar>
            <p>
              {pc === 'bios'
                ? 'ดูหน้า Main แล้วกดหมุดข้อมูลที่ใช้ตัดสินใจ ออกจาก BIOS ด้วย Esc หรือ F10'
                : 'เปิดเครื่องแล้วเข้า BIOS เพื่อดูหน่วยความจำและซีพียู'}
            </p>
            <button type="button" className="btn btn-ghost btn-sm" onClick={() => openTab('proposal')}>
              ไปเขียนใบเสนอ <Icon name="arrowRight" size={16} />
            </button>
          </BenchBar>
        </>
      )}

      {tab === 'proposal' && (
        <section className="card proposal">
          <header className="proposal-head">
            <div>
              <span className="eyebrow">ใบเสนอระบบปฏิบัติการ</span>
              <h2>เครื่องใหม่ของสำนักงานบัญชีพลอยใจ</h2>
            </div>
            <span className={`chip ${accepted ? 'chip-good' : ''}`}>{accepted ? 'พี่บูตตรวจผ่านแล้ว' : 'ร่าง'}</span>
          </header>
          <p className="muted">เลือกคำตอบทุกข้อ และแนบหลักฐานจากสมุดหลักฐานที่สนับสนุนการเลือกนั้น</p>
          {DECISIONS.map((d, index) => {
            const verdict = verdicts[d.id]
            return (
              <fieldset key={d.id} className={`decision${verdict ? ` decision-${verdict.kind}` : ''}`} disabled={accepted}>
                <legend>
                  <span className="decision-no">{index + 1}</span> {d.title}
                </legend>
                <p className="decision-q">{d.question}</p>
                <div className="options">
                  {d.options.map(o => (
                    <label key={o.value} className={`option${choice[d.id] === o.value ? ' on' : ''}`}>
                      <input
                        type="radio"
                        name={`decision-${d.id}`}
                        value={o.value}
                        checked={choice[d.id] === o.value}
                        onChange={() => {
                          setChoice(c => ({ ...c, [d.id]: o.value }))
                          setVerdicts(v => ({ ...v, [d.id]: undefined }))
                        }}
                      />
                      <strong>{o.label}</strong>
                      {o.sub && <small>{o.sub}</small>}
                    </label>
                  ))}
                </div>
                <div className="decision-ev">
                  <span>หลักฐานประกอบ</span>
                  <EvidencePicker
                    label={`หลักฐานสำหรับ${d.title}`}
                    value={evidence[d.id]}
                    onChange={v => {
                      setEvidence(e => ({ ...e, [d.id]: v }))
                      setVerdicts(prev => ({ ...prev, [d.id]: undefined }))
                    }}
                  />
                </div>
                {verdict && (
                  <p className={`verdict verdict-${verdict.kind}`} role="status">
                    <Icon name={VERDICT_ICON[verdict.kind]} size={16} />
                    {verdict.text}
                  </p>
                )}
              </fieldset>
            )
          })}
          {!accepted && (
            <button type="button" className="btn btn-primary btn-lg" onClick={submit}>
              <Icon name="check" size={18} /> ส่งใบเสนอให้พี่บูตตรวจ
            </button>
          )}
        </section>
      )}

      {tab === 'review' && (
        <section className="card review">
          <Speech look={run.job.customer.look} name={run.job.customer.name} mood={reviewDone && licenseDone ? 'happy' : 'neutral'}>
            <p>{reviewDone ? 'ครบทุกข้อเลย อธิบายเข้าใจง่ายดี' : 'ช่วยอธิบายหน่อยค่ะ ว่าแต่ละเรื่องที่พี่ขอ ตอบด้วยอะไรในใบเสนอ'}</p>
          </Speech>
          <h3>ทวนความต้องการกับลูกค้า</h3>
          <table className="review-table">
            <thead>
              <tr>
                <th scope="col">ความต้องการของลูกค้า</th>
                <th scope="col">ส่วนของใบเสนอที่ตอบโจทย์</th>
              </tr>
            </thead>
            <tbody>
              {REQUIREMENTS.map(r => (
                <tr key={r.id} className={mapResult ? (mapResult[r.id] ? 'ok' : 'no') : undefined}>
                  <th scope="row">{r.need}</th>
                  <td>
                    <select
                      value={mapping[r.id] ?? ''}
                      disabled={reviewDone}
                      aria-label={`ส่วนของใบเสนอที่ตอบ: ${r.need}`}
                      onChange={e => {
                        setMapping(m => ({ ...m, [r.id]: e.target.value }))
                        setMapResult(null)
                      }}
                    >
                      <option value="">เลือก…</option>
                      {(Object.keys(ANSWER_LABEL) as DecisionId[]).map(k => (
                        <option key={k} value={k}>
                          {ANSWER_LABEL[k]}
                        </option>
                      ))}
                    </select>
                    {mapResult && <Icon name={mapResult[r.id] ? 'check' : 'x'} size={16} />}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          <div className="review-actions">
            <button type="button" className="btn btn-primary" disabled={reviewDone} onClick={checkMapping}>
              <Icon name="users" size={17} /> {reviewDone ? 'ทวนครบแล้ว' : 'ทวนกับลูกค้า'}
            </button>
            <button type="button" className="btn btn-gold" disabled={licenseDone} onClick={tellLicense}>
              <Icon name="coin" size={17} /> {licenseDone ? 'แจ้งเรื่องลิขสิทธิ์แล้ว' : 'แจ้งค่าลิขสิทธิ์ Windows 10 Pro'}
            </button>
          </div>
          {licenseDone && (
            <Speech look={run.job.customer.look} name={run.job.customer.name} mood="happy" size={44}>
              <p>ได้ค่ะ งบส่วนลิขสิทธิ์พี่เตรียมไว้แล้ว ถูกกฎหมายสบายใจกว่า</p>
            </Speech>
          )}
          <BenchBar>
            <p>ทวนครบและแจ้งค่าลิขสิทธิ์แล้ว ก็ส่งงานได้เลย</p>
            <button type="button" className="btn btn-primary" onClick={run.complete}>
              ส่งงาน <Icon name="arrowRight" size={16} />
            </button>
          </BenchBar>
        </section>
      )}
    </div>
  )
}
