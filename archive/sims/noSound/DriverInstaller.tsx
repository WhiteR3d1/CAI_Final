import { useState } from 'react'
import { Icon } from '../../components/Icon'

interface Props {
  title: string
  compatible: boolean
  error?: string
  onError: () => void
  onFinish: (restartNow: boolean) => void
  onCancel: () => void
}

type Step = 'welcome' | 'checking' | 'error' | 'installing' | 'finish'

/** InstallShield-style setup wizard for a downloaded driver package (book 4.3.2 steps 3–4). */
export function DriverInstaller({ title, compatible, error, onError, onFinish, onCancel }: Props) {
  const [step, setStep] = useState<Step>('welcome')
  const [restartNow, setRestartNow] = useState(true)

  const next = () => {
    setStep('checking')
    window.setTimeout(() => {
      if (!compatible) {
        setStep('error')
        onError()
        return
      }
      setStep('installing')
      window.setTimeout(() => setStep('finish'), 2400)
    }, 900)
  }

  return (
    <div className="w-app installer">
      <aside className="installer-side" aria-hidden>
        <Icon name="speaker" size={44} />
      </aside>
      <div className="installer-main">
        <h3 className="w-h">{title}</h3>
        {step === 'welcome' && (
          <>
            <p>ยินดีต้อนรับสู่ตัวติดตั้งไดรเวอร์ ตัวติดตั้งจะคัดลอกไฟล์ไดรเวอร์ลงในเครื่อง กด Next เพื่อเริ่ม</p>
            <div className="w-buttons">
              <button type="button" className="w-btn" onClick={onCancel}>
                Cancel
              </button>
              <button type="button" className="w-btn w-btn-primary" onClick={next}>
                Next &gt;
              </button>
            </div>
          </>
        )}
        {step === 'checking' && (
          <div className="w-center">
            <span className="dt-spinner dt-spinner-dark" aria-hidden />
            <p>Checking system requirements…</p>
          </div>
        )}
        {step === 'error' && (
          <>
            <p className="w-error" role="alert">
              <strong>Setup cannot continue.</strong>
              <br />
              {error}
            </p>
            <div className="w-buttons">
              <button type="button" className="w-btn w-btn-primary" onClick={onCancel}>
                Close
              </button>
            </div>
          </>
        )}
        {step === 'installing' && (
          <>
            <p>Installing driver files…</p>
            <div className="installer-bar">
              <span />
            </div>
            <p className="w-small">C:\Program Files\Nimbus\Audio\NimbusHDA64.sys</p>
          </>
        )}
        {step === 'finish' && (
          <>
            <p>
              <strong>InstallShield Wizard Complete</strong>
            </p>
            <p>ต้องรีสตาร์ตเครื่องเพื่อให้ไดรเวอร์เริ่มทำงาน</p>
            <label className="w-radio">
              <input type="radio" name="restart" checked={restartNow} onChange={() => setRestartNow(true)} />
              Yes, I want to restart my computer now.
            </label>
            <label className="w-radio">
              <input type="radio" name="restart" checked={!restartNow} onChange={() => setRestartNow(false)} />
              No, I will restart my computer later.
            </label>
            <div className="w-buttons">
              <button type="button" className="w-btn w-btn-primary" onClick={() => onFinish(restartNow)}>
                Finish
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
