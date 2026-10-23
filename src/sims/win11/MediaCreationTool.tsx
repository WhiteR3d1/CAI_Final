// Windows 11 Media Creation Tool (sheet Win11 p.2–3, figures 3–4).
// The job decides which choices are mistakes through the callbacks; this component only behaves like the tool.
import { useEffect, useEffectEvent, useState } from 'react'
import { Icon } from '../../components/Icon'
import './win11.css'

export interface McDrive {
  id: string
  label: string
  /** size in GB as Windows reports it */
  sizeGb: number
}

type Step = 'loading' | 'license' | 'loading2' | 'edition' | 'media' | 'drive' | 'progress' | 'ready'

interface Props {
  drives: McDrive[]
  /** chose language/edition; recommended = kept "Use the recommended options for this PC" */
  onEdition?: (recommended: boolean, language: string) => void
  /** USB flash drive or ISO file; return false to stay on the page */
  onMedia: (kind: 'usb' | 'iso') => boolean
  /** the drive picked on "Select a USB flash drive"; return false to stay on the page */
  onDrive: (drive: McDrive) => boolean
  onDecline?: () => void
  onDone: (drive: McDrive) => void
}

const PHASE_MS = { download: 9000, create: 6000 }

/** "Downloading Windows 11" then "Creating Windows 11 media", sped up for class */
function Progress({ onDone }: { onDone: () => void }) {
  const [elapsed, setElapsed] = useState(0)
  const finish = useEffectEvent(() => onDone())
  useEffect(() => {
    const started = Date.now()
    const t = window.setInterval(() => {
      const e = Date.now() - started
      setElapsed(e)
      if (e >= PHASE_MS.download + PHASE_MS.create) {
        window.clearInterval(t)
        finish()
      }
    }, 200)
    return () => window.clearInterval(t)
  }, [])
  const downloading = elapsed < PHASE_MS.download
  const percent = downloading
    ? Math.floor((elapsed / PHASE_MS.download) * 100)
    : Math.min(100, Math.floor(((elapsed - PHASE_MS.download) / PHASE_MS.create) * 100))
  return (
    <>
      <h2>{downloading ? 'Downloading Windows 11' : 'Creating Windows 11 media'}</h2>
      <p className="w-small">Feel free to keep using your PC.</p>
      <p className="w11-mct-percent">Progress: {percent}%</p>
      <div className="w11-bar">
        <span style={{ transform: `scaleX(${percent / 100})` }} />
      </div>
      <button type="button" className="btn btn-ghost btn-sm w11-skip" onClick={onDone} title="ปุ่มนี้มีเฉพาะในเกม เครื่องจริงต้องรอ">
        ⏩ ข้ามเวลารอ (จำลอง)
      </button>
    </>
  )
}

export function MediaCreationTool({ drives, onEdition, onMedia, onDrive, onDecline, onDone }: Props) {
  const [step, setStep] = useState<Step>('loading')
  const [recommended, setRecommended] = useState(true)
  const [language, setLanguage] = useState('English (United States)')
  const [media, setMedia] = useState<'usb' | 'iso'>('usb')
  const [list, setList] = useState(drives)
  const [picked, setPicked] = useState<string | null>(null)
  const drive = list.find(d => d.id === picked) ?? null

  // "Getting a few things ready"
  useEffect(() => {
    if (step !== 'loading' && step !== 'loading2') return
    const t = window.setTimeout(() => setStep(step === 'loading' ? 'license' : 'edition'), 1500)
    return () => window.clearTimeout(t)
  }, [step])

  const footer = (back: (() => void) | null, next: (() => void) | null, nextLabel = 'Next', nextDisabled = false) => (
    <div className="w11-mct-foot">
      <span className="w11-mct-brand">
        <span className="w11-ms-logo" aria-hidden />
        Microsoft&nbsp;&nbsp;Support&nbsp;&nbsp;Legal
      </span>
      <span className="w11-mct-btns">
        {back && (
          <button type="button" className="w-btn" onClick={back}>
            Back
          </button>
        )}
        {next && (
          <button type="button" className="w-btn w-btn-primary" disabled={nextDisabled} onClick={next}>
            {nextLabel}
          </button>
        )}
      </span>
    </div>
  )

  return (
    <div className="w11-mct">
      {(step === 'loading' || step === 'loading2') && (
        <div className="w11-mct-page">
          <h2>Getting a few things ready</h2>
          <span className="dt-spinner dt-spinner-dark" aria-hidden />
          {footer(null, null)}
        </div>
      )}

      {step === 'license' && (
        <div className="w11-mct-page">
          <h2>Applicable notices and license terms</h2>
          <div className="w11-mct-terms" tabIndex={0}>
            <p>
              <strong>MICROSOFT SOFTWARE LICENSE TERMS</strong>
            </p>
            <p>IF YOU LIVE IN (OR ARE A BUSINESS WITH A PRINCIPAL PLACE OF BUSINESS IN) THE UNITED STATES … (ข้อความสัญญาอนุญาตฉบับเต็ม)</p>
            <p>By using the software, you accept these terms. If you do not accept them, do not use the software.</p>
          </div>
          {footer(null, () => setStep('loading2'), 'Accept')}
          <button type="button" className="w-btn w11-mct-decline" onClick={() => onDecline?.()}>
            Decline
          </button>
        </div>
      )}

      {step === 'edition' && (
        <div className="w11-mct-page">
          <h2>Select language and edition</h2>
          <p className="w-small">Please select from one of the available options to continue.</p>
          <label className="w11-mct-field">
            <span>Language</span>
            <select value={language} disabled={recommended} onChange={e => setLanguage(e.target.value)}>
              <option>English (United States)</option>
              <option>Thai</option>
            </select>
          </label>
          <label className="w11-mct-field">
            <span>Edition</span>
            <select value="Windows 11" disabled>
              <option>Windows 11</option>
            </select>
          </label>
          <label className="w11-check">
            <input type="checkbox" checked={recommended} onChange={e => setRecommended(e.target.checked)} />
            Use the recommended options for this PC
          </label>
          {footer(null, () => {
            onEdition?.(recommended, language)
            setStep('media')
          })}
        </div>
      )}

      {step === 'media' && (
        <div className="w11-mct-page">
          <h2>Choose which media to use</h2>
          <p className="w-small">If you want to install Windows 11 on another partition, you need to create and then run the media to install it.</p>
          <label className="w11-radio">
            <input type="radio" name="mct-media" checked={media === 'usb'} onChange={() => setMedia('usb')} />
            <span>
              <strong>USB flash drive</strong>
              <small>It needs to be at least 8 GB.</small>
            </span>
          </label>
          <label className="w11-radio">
            <input type="radio" name="mct-media" checked={media === 'iso'} onChange={() => setMedia('iso')} />
            <span>
              <strong>ISO file</strong>
              <small>You'll need to burn the ISO file to a DVD later.</small>
            </span>
          </label>
          {footer(() => setStep('edition'), () => onMedia(media) && setStep('drive'))}
        </div>
      )}

      {step === 'drive' && (
        <div className="w11-mct-page">
          <h2>Select a USB flash drive</h2>
          <p className="w-small">The files on your USB drive will be deleted. To keep these files, back them up now to another save location.</p>
          <button type="button" className="w11-link" onClick={() => setList([...drives])}>
            Refresh drive list
          </button>
          <p className="w-small w11-mct-sub">Removable drives</p>
          <div className="w11-mct-drives" role="listbox" aria-label="Removable drives">
            {list.map(d => (
              <button key={d.id} type="button" role="option" aria-selected={picked === d.id} className={picked === d.id ? 'on' : undefined} onClick={() => setPicked(d.id)}>
                {d.id}: {d.label} ({d.sizeGb.toFixed(1)} GB)
              </button>
            ))}
          </div>
          {footer(() => setStep('media'), () => drive && onDrive(drive) && setStep('progress'), 'Next', !drive)}
        </div>
      )}

      {step === 'progress' && (
        <div className="w11-mct-page">
          <Progress onDone={() => setStep('ready')} />
          {footer(null, null)}
        </div>
      )}

      {step === 'ready' && drive && (
        <div className="w11-mct-page">
          <h2>Your USB flash drive is ready</h2>
          <p className="w11-mct-drive-done">
            <Icon name="usb" size={20} /> {drive.id}: ESD-USB
          </p>
          {footer(null, () => onDone(drive), 'Finish')}
        </div>
      )}
    </div>
  )
}
