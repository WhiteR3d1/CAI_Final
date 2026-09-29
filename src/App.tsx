import { lazy, Suspense, useState } from 'react'
import { JOB_BY_ID } from './data/jobs'
import { GameProvider } from './game/GameProvider'
import type { JobId } from './game/types'
import { Hud, type Screen } from './screens/Hud'
import { Manual } from './screens/Manual'
import { Results } from './screens/Results'
import { Shop } from './screens/Shop'
import './App.css'

// The workbench (all simulations) is the heaviest part, so it loads only when a job opens.
const Workbench = lazy(() => import('./screens/workbench/Workbench').then(m => ({ default: m.Workbench })))

export default function App() {
  const [screen, setScreen] = useState<Screen>({ name: 'shop' })
  const [runKey, setRunKey] = useState(0)

  const openJob = (id: JobId) => {
    setRunKey(k => k + 1)
    setScreen({ name: 'job', id })
    window.scrollTo({ top: 0 })
  }
  const go = (next: Screen) => {
    setScreen(next)
    window.scrollTo({ top: 0 })
  }

  return (
    <GameProvider>
      <div className={`app app-${screen.name}`}>
        <Hud screen={screen} onNavigate={go} />
        <main id="main" className="app-main">
          {(screen.name === 'shop' || screen.name === 'board' || screen.name === 'decor') && <Shop view={screen.name} onOpenJob={openJob} onNavigate={go} />}
          {screen.name === 'manual' && <Manual initialUnit={screen.unit} />}
          {screen.name === 'results' && <Results onOpenJob={openJob} />}
          {screen.name === 'job' && (
            <Suspense fallback={<p className="app-loading">กำลังเปิดโต๊ะซ่อม…</p>}>
              <Workbench key={runKey} job={JOB_BY_ID[screen.id]} onExit={() => go({ name: 'shop' })} onOpenJob={openJob} />
            </Suspense>
          )}
        </main>
      </div>
    </GameProvider>
  )
}

