import { Icon } from '../../components/Icon'

/** the bench-bar button that ends a phase: "ไปขั้นต่อไป" between phases, "ส่งงาน" after the last one */
export function DoneButton({ ready, last, onDone }: { ready: boolean; last: boolean; onDone: () => void }) {
  return (
    <button type="button" className="btn btn-primary btn-sm" disabled={!ready} onClick={onDone}>
      {last ? 'ส่งงาน' : 'ไปขั้นต่อไป'} <Icon name="arrowRight" size={16} />
    </button>
  )
}

/** a simple screen between steps (old Windows booting, Setup started, …) with an optional action */
export function InfoScreen({ title, text, action }: { title: string; text?: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="module-info">
      <strong>{title}</strong>
      {text && <p>{text}</p>}
      {action && (
        <button type="button" className="btn btn-gold btn-sm" onClick={action.onClick}>
          <Icon name="refresh" size={16} /> {action.label}
        </button>
      )}
    </div>
  )
}
