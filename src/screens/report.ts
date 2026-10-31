// The printable training report, shared by the student's results page and the teacher console.
import { jobsOf, TRACKS } from '../data/jobs'
import { jobProgress } from '../game/progress'
import { CRITERION_LABEL } from '../game/scoring'
import type { SaveData } from '../game/types'

/** plain-text report of one save; the teacher console passes the student's account name as `who` */
export function summaryText(save: SaveData, date: string, who = save.settings.playerName) {
  const lines = [
    'สรุปผลการฝึก Boot & Bloom — การติดตั้งระบบปฏิบัติการ Windows 10 / 11',
    `ผู้เรียน: ${who.trim() || '-'}`,
    `วันที่: ${date}`,
  ]
  for (const job of TRACKS.flatMap(t => jobsOf(t.id))) {
    if (job.order === 1) lines.push('', `[สาย ${TRACKS.find(t => t.id === job.track)?.title}]`)
    const p = jobProgress(save, job.id)
    if (!p.best) {
      lines.push(`${job.code} ${job.title}: ยังไม่ได้ทำ`)
      continue
    }
    const crit = job.criteria.map(c => `${CRITERION_LABEL[c]} ${Math.round((p.best?.criteria[c] ?? 0) * 100)}%`).join(' · ')
    lines.push(`${job.code} ${job.title}: คะแนนดีที่สุด ${p.best.score}/100 (${p.best.stars} ดาว) · ทำ ${p.completions} ครั้ง`)
    lines.push(`  ${crit}`)
    const passed = p.best.objectives.filter(o => o.passed).length
    lines.push(`  เป้าหมายที่ผ่าน ${passed}/${job.objectives.length} · คำใบ้รอบที่ดีที่สุด ${p.best.hintsUsed} ครั้ง`)
    if (p.best.mistakes.length) lines.push(`  ควรฝึกเพิ่ม: ${p.best.mistakes.map(m => job.mistakes[m]?.label ?? m).join('; ')}`)
  }
  return lines.join('\n')
}

/** copies text to the clipboard, falling back to a hidden textarea where the API is blocked */
export async function copyText(text: string) {
  try {
    await navigator.clipboard.writeText(text)
    return true
  } catch {
    const area = document.createElement('textarea')
    area.value = text
    area.style.position = 'fixed'
    area.style.opacity = '0'
    document.body.appendChild(area)
    area.select()
    const ok = document.execCommand('copy')
    area.remove()
    return ok
  }
}
