import { useId, useState } from 'react'
import { VISUALS, type VisualId } from '../data/visualGuides'
import { Modal } from './Modal'
import './visual-guide.css'

function GuideDrawing({ id }: { id: VisualId }) {
  const guide = VISUALS[id]
  const unique = useId()
  const dark = guide.theme === 'bios'
  const foreground = dark ? '#f1f5ff' : '#223348'
  const targetY = 116 + guide.target * 48
  return (
    <div className="visual-guide-scroll" tabIndex={0} role="region" aria-label="ภาพประกอบ เลื่อนแนวนอนเพื่อดูรายละเอียดได้">
      <svg className="visual-guide-image" viewBox="0 0 800 410" role="img" aria-labelledby={`${unique}-title ${unique}-desc`}>
        <title id={`${unique}-title`}>{guide.title}</title>
        <desc id={`${unique}-desc`}>ลูกศรชี้ {guide.rows[guide.target]} — {guide.action} เพราะ {guide.why}</desc>
        <defs><marker id={`${unique}-arrow`} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="9" markerHeight="9" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 Z" fill="#c35419" /></marker></defs>
        <rect width="800" height="410" rx="16" fill="#eaf1ee" />
        <rect x="18" y="22" width="584" height="364" rx="8" fill={dark ? '#142667' : '#fff'} stroke="#b4c5c2" />
        <path d="M26 22 H594 Q602 22 602 30 V62 H18 V30 Q18 22 26 22" fill={dark ? '#dce4f5' : '#e5ecf3'} />
        <circle cx="36" cy="42" r="5" fill="#1c7863" />
        <text x="50" y="47" fontSize="12" fill="#263d51">{guide.window}</text>
        <path d="M575 36 l10 10 m0 -10 l-10 10" stroke="#506076" strokeWidth="1.5" />
        <text x="38" y="87" fontSize="12" fill={dark ? '#c6d9ff' : '#617487'}>{guide.theme === 'web' ? '←   →   ⟳     แหล่งดาวน์โหลดทางการ' : dark ? 'Main     Advanced     Boot     Exit' : 'หน้าจอตัวอย่าง · ตรวจข้อมูลตามใบงาน'}</text>
        {guide.rows.map((row, index) => {
          const y = 116 + index * 48
          const active = index === guide.target
          return <g key={row}>
            <rect x="34" y={y - 23} width="550" height="39" rx="4" fill={active ? (dark ? '#335c9f' : '#fff2db') : (dark ? '#1b3177' : '#f4f7fa')} stroke={active ? '#c35419' : 'none'} strokeWidth="2.5" />
            <text x="48" y={y + 2} fontSize="14" fill={foreground} fontWeight={active ? '600' : '400'}>{row}</text>
          </g>
        })}
        <text x="38" y="371" fill={dark ? '#c6d9ff' : '#617487'} fontSize="12">{guide.key ? `ใช้คีย์บอร์ด: ${guide.key}` : 'อ่านชื่อและข้อมูลให้ครบก่อนยืนยัน'}</text>
        <path d={`M 658 ${targetY - 10} H 591`} fill="none" stroke="#c35419" strokeWidth="3" markerEnd={`url(#${unique}-arrow)`} />
        <circle cx="684" cy={targetY - 10} r="21" fill="#c35419" />
        <text x="684" y={targetY - 3} textAnchor="middle" fontSize="21" fontWeight="700" fill="white">1</text>
        <text x="684" y={targetY + 29} textAnchor="middle" fontSize="16" fill="#75320f">จุดที่ต้องดู</text>
        <text x="684" y="361" textAnchor="middle" fontSize="12" fill="#526b61">ภาพจำลองเพื่ออธิบาย</text>
      </svg>
    </div>
  )
}

export function VisualGuide({ id }: { id: VisualId }) {
  const guide = VISUALS[id]
  const [expanded, setExpanded] = useState(false)
  const close = () => setExpanded(false)
  const caption = <div className="visual-guide-caption"><p><strong>1 · ทำอะไร</strong>{guide.action}</p><p><strong>ทำไม</strong>{guide.why}</p></div>
  return (
    <figure className="visual-guide">
      <div className="visual-guide-heading"><h3>{guide.title}</h3><button type="button" className="btn btn-ghost btn-sm" onClick={() => setExpanded(true)} aria-label={`ขยายภาพ ${guide.title}`}>ขยายภาพ ↗</button></div>
      <GuideDrawing id={id} />
      <figcaption>{caption}<small className="muted">ภาพวาดย่อจากหน้าจอในเกม · ใช้ค่าตามใบงานของแต่ละเครื่อง</small></figcaption>
      {expanded && <Modal title={guide.title} wide onClose={close} actions={[{ label: 'ปิดภาพ', variant: 'primary', onClick: close }]}><GuideDrawing id={id} />{caption}</Modal>}
    </figure>
  )
}

export function VisualGuideGallery({ ids }: { ids: VisualId[] }) {
  const [selected, setSelected] = useState<VisualId | null>(null)
  const current = selected && ids.includes(selected) ? selected : ids[0]
  if (!current) return null
  return (
    <section className="visual-guide-gallery" aria-label="ภาพประกอบขั้นตอน">
      {ids.length > 1 && <div className="visual-guide-picker" aria-label="เลือกภาพขั้นตอน">{ids.map((id, index) => <button type="button" key={id} aria-pressed={current === id} onClick={() => setSelected(id)}>{index + 1}. {VISUALS[id].title}</button>)}</div>}
      <VisualGuide key={current} id={current} />
    </section>
  )
}
