import { useState } from 'react'
import { Icon } from '../../components/Icon'

/** Windows + R "Run" box. onRun returns an error message or null when the command opened something. */
export function RunDialog({ onRun, onClose }: { onRun: (cmd: string) => string | null; onClose: () => void }) {
  const [cmd, setCmd] = useState('')
  const [error, setError] = useState<string | null>(null)

  return (
    <form
      className="w-app w-run"
      onSubmit={e => {
        e.preventDefault()
        const value = cmd.trim()
        if (!value) return
        const err = onRun(value)
        if (err) setError(err)
        else onClose()
      }}
    >
      <div className="w-run-top">
        <Icon name="app" size={30} />
        <p>Type the name of a program, folder, document, or Internet resource, and Windows will open it for you.</p>
      </div>
      <label className="w-field">
        <span>Open:</span>
        <input
          autoFocus
          value={cmd}
          onChange={e => {
            setCmd(e.target.value)
            setError(null)
          }}
          spellCheck={false}
          autoComplete="off"
        />
      </label>
      {error && (
        <p className="w-error" role="alert">
          {error}
        </p>
      )}
      <div className="w-buttons">
        <button type="submit" className="w-btn w-btn-primary">
          OK
        </button>
        <button type="button" className="w-btn" onClick={onClose}>
          Cancel
        </button>
      </div>
    </form>
  )
}
