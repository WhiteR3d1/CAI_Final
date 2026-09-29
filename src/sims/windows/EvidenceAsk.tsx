import { useState, type ReactNode } from 'react'
import { Modal } from '../../components/Modal'
import { judgeEvidence } from '../../game/evidence'
import type { EvidenceRule } from '../../game/types'
import { EvidencePicker } from '../../screens/workbench/Fact'
import { useRun } from '../../screens/workbench/runContext'

export type Verdict = ReturnType<typeof judgeEvidence>

interface Props {
  /** reason id; only the first answer of each id counts toward the score */
  id: string
  title: string
  children: ReactNode
  rule: EvidenceRule
  confirmLabel: string
  onConfirm: (verdict: Verdict) => void
  onCancel: () => void
}

/** The mentor asks which notebook evidence supports a decision before the player commits to it. */
export function EvidenceAsk({ id, title, children, rule, confirmLabel, onConfirm, onCancel }: Props) {
  const run = useRun()
  const [picked, setPicked] = useState<string[]>([])
  return (
    <Modal
      title={title}
      tone="info"
      icon="pin"
      wide
      onClose={onCancel}
      actions={[
        { label: 'ยกเลิก', onClick: onCancel },
        {
          label: confirmLabel,
          variant: 'primary',
          onClick: () => {
            const verdict = judgeEvidence(picked, rule)
            run.reason(id, verdict === 'ok')
            onConfirm(verdict)
          },
        },
      ]}
    >
      {children}
      <p>เลือกหลักฐานจากสมุดที่ใช้ยืนยันการตัดสินใจนี้</p>
      <EvidencePicker label="หลักฐานประกอบการตัดสินใจ" value={picked} onChange={setPicked} />
    </Modal>
  )
}
