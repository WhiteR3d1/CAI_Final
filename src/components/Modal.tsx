import { useEffect, useId, type ReactNode } from 'react'
import { createPortal } from 'react-dom'
import type { Tone } from '../game/types'
import { Icon, type IconName } from './Icon'

export interface ModalAction {
  label: string
  onClick?: () => void
  variant?: 'primary' | 'ghost' | 'danger' | 'gold'
}

interface Props {
  title: string
  tone?: Tone
  icon?: IconName
  children?: ReactNode
  actions: ModalAction[]
  /** called for Esc / backdrop click; omit to force a choice */
  onClose?: () => void
  wide?: boolean
}

const TONE_ICON: Record<Tone, IconName> = { info: 'info', good: 'check', warn: 'alert', bad: 'alert' }

export function Modal({ title, tone = 'info', icon, children, actions, onClose, wide }: Props) {
  const titleId = useId()

  useEffect(() => {
    const previous = document.activeElement instanceof HTMLElement ? document.activeElement : null
    return () => previous?.focus()
  }, [])

  useEffect(() => {
    if (!onClose) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose()
    }
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [onClose])

  const focusIndex = Math.max(
    0,
    actions.findIndex(a => a.variant === 'primary' || a.variant === 'gold'),
  )

  return createPortal(
    <div
      className="modal-backdrop"
      onMouseDown={e => {
        if (e.target === e.currentTarget) onClose?.()
      }}
    >
      <div role="dialog" aria-modal="true" aria-labelledby={titleId} className={`modal modal-${tone}${wide ? ' modal-wide' : ''}`}>
        <div className="modal-head">
          <span className="modal-icon">
            <Icon name={icon ?? TONE_ICON[tone]} size={22} />
          </span>
          <h2 id={titleId}>{title}</h2>
        </div>
        {children && <div className="modal-body">{children}</div>}
        <div className="modal-actions">
          {actions.map((action, i) => (
            <button
              key={action.label}
              type="button"
              className={`btn btn-${action.variant ?? 'ghost'}`}
              autoFocus={i === focusIndex}
              onClick={action.onClick}
            >
              {action.label}
            </button>
          ))}
        </div>
      </div>
    </div>,
    document.body,
  )
}
