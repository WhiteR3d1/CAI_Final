// Windows Security (sheet Win11 p.4 figure 5 and p.9): Home, Firewall & network protection, Device security.
import { useState, type ReactNode } from 'react'
import { Icon, type IconName } from '../../components/Icon'
import { Fact } from '../../screens/workbench/Fact'
import './win11.css'

export type SecurityPage = 'home' | 'firewall' | 'device'

interface Props {
  /** security processor (TPM) present and turned on in the firmware */
  tpm: boolean
  secureBoot: boolean
  firewall?: boolean
  /** device encryption state, or none when the PC does not offer it */
  encryption?: 'on' | 'off' | 'none'
  facts?: { tpm?: string; secureBoot?: string; encryption?: string; firewall?: string }
  initial?: SecurityPage
  onPage?: (page: SecurityPage) => void
}

const NAV: { id: SecurityPage | null; label: string; icon: IconName }[] = [
  { id: 'home', label: 'Home', icon: 'home' },
  { id: null, label: 'Virus & threat protection', icon: 'shield' },
  { id: null, label: 'Account protection', icon: 'users' },
  { id: 'firewall', label: 'Firewall & network protection', icon: 'wifi' },
  { id: null, label: 'App & browser control', icon: 'app' },
  { id: 'device', label: 'Device security', icon: 'monitor' },
]

const pin = (text: string, fact?: string): ReactNode => (fact ? <Fact id={fact}>{text}</Fact> : text)

export function WindowsSecurity({ tpm, secureBoot, firewall = true, encryption = 'none', facts = {}, initial = 'home', onPage }: Props) {
  const [page, setPage] = useState<SecurityPage>(initial)
  const go = (p: SecurityPage) => {
    setPage(p)
    onPage?.(p)
  }
  const deviceOk = tpm && secureBoot

  return (
    <div className="w11-sec">
      <nav className="w11-sec-nav" aria-label="Windows Security">
        {NAV.map(n =>
          n.id ? (
            <button key={n.label} type="button" className={page === n.id ? 'on' : undefined} onClick={() => go(n.id as SecurityPage)}>
              <Icon name={n.icon} size={16} /> {n.label}
            </button>
          ) : (
            <span key={n.label} className="w11-sec-nav-off">
              <Icon name={n.icon} size={16} /> {n.label}
            </span>
          ),
        )}
      </nav>
      <div className="w11-sec-main">
        {page === 'home' && (
          <>
            <h2>Security at a glance</h2>
            <p className="w-small">See what's happening with the security and health of your device and take any actions needed.</p>
            <div className="w11-sec-tiles">
              <div className="w11-sec-tile ok">
                <Icon name="shield" size={26} />
                <strong>Virus & threat protection</strong>
                <small>No action needed.</small>
              </div>
              <button type="button" className={`w11-sec-tile ${firewall ? 'ok' : 'bad'}`} onClick={() => go('firewall')}>
                <Icon name="wifi" size={26} />
                <strong>Firewall & network protection</strong>
                <small>{firewall ? 'No action needed.' : 'Firewall is off. Your device may be vulnerable.'}</small>
              </button>
              <button type="button" className={`w11-sec-tile ${deviceOk ? 'ok' : 'warn'}`} onClick={() => go('device')}>
                <Icon name="monitor" size={26} />
                <strong>Device security</strong>
                <small>{deviceOk ? 'View status and manage hardware security features.' : 'Standard hardware security not supported.'}</small>
              </button>
            </div>
          </>
        )}

        {page === 'firewall' && (
          <>
            <h2>Firewall & network protection</h2>
            <p className="w-small">Who and what can access your networks.</p>
            {['Domain network', 'Private network', 'Public network (active)'].map(n => (
              <div key={n} className="w11-sec-row">
                <Icon name="wifi" size={20} />
                <div>
                  <strong>{n}</strong>
                  <small className={firewall ? 'w-ok' : 'w-fail'}>{pin(firewall ? 'Firewall is on.' : 'Firewall is off.', n.includes('active') ? facts.firewall : undefined)}</small>
                </div>
              </div>
            ))}
          </>
        )}

        {page === 'device' && (
          <>
            <h2>Device security</h2>
            <p className="w-small">Security that comes built into your device.</p>
            <section className="w11-sec-section">
              <h3>
                <Icon name="cpu" size={18} /> Core isolation
              </h3>
              <p className="w-small">Security features available on your device that use virtualization-based security.</p>
            </section>
            {tpm && (
              <section className="w11-sec-section">
                <h3>
                  <Icon name="cpu" size={18} /> Security processor
                </h3>
                <p className="w-small">{pin('Your security processor, called the trusted platform module (TPM), is providing additional encryption for your device.', facts.tpm)}</p>
                <span className="w11-link is-muted">Security processor details · Specification version: 2.0</span>
              </section>
            )}
            <section className="w11-sec-section">
              <h3>
                <Icon name="power" size={18} /> Secure boot
              </h3>
              <p className={`w-small ${secureBoot ? '' : 'w-fail'}`}>
                {pin(
                  secureBoot ? 'Secure boot is on, preventing malicious software from loading when your device starts up.' : 'Secure boot is off. Turn it on to help prevent malicious software from loading when your device starts up.',
                  facts.secureBoot,
                )}
              </p>
            </section>
            {encryption !== 'none' && (
              <section className="w11-sec-section">
                <h3>
                  <Icon name="lock" size={18} /> Data encryption
                </h3>
                <p className="w-small">{pin(`Device encryption is ${encryption}.`, facts.encryption)} Helps protect your data from unauthorized access in case your device is lost or stolen.</p>
              </section>
            )}
            {!tpm && <p className="w11-sec-foot">{pin('Standard hardware security not supported.', facts.tpm)}</p>}
          </>
        )}
      </div>
    </div>
  )
}
