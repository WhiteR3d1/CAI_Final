import { useState } from 'react'
import { useRun } from '../../screens/workbench/runContext'
import { BootModule } from './BootModule'
import { MctModule } from './MctModule'
import { Oobe10Module } from './Oobe10Module'
import { Oobe11Module } from './Oobe11Module'
import { Post11Module } from './Post11Module'
import { Ready11Module } from './Ready11Module'
import { RufusModule } from './RufusModule'
import { Setup10Module } from './Setup10Module'
import { Setup11Module } from './Setup11Module'
import { Uefi11Module } from './Uefi11Module'

/** plays a module job: its phases one after another, then hands the job in */
export function ModuleSim() {
  const run = useRun()
  const phases = run.job.phases ?? []
  const [index, setIndex] = useState(0)
  const phase = phases[index]
  if (!phase) return null
  const last = index === phases.length - 1
  const onDone = () => (last ? run.complete() : setIndex(i => i + 1))

  switch (phase.module) {
    case 'rufus':
      return <RufusModule key={index} phase={phase} last={last} onDone={onDone} />
    case 'boot':
      return <BootModule key={index} phase={phase} last={last} onDone={onDone} />
    case 'setup10':
      return <Setup10Module key={index} phase={phase} last={last} onDone={onDone} />
    case 'oobe10':
      return <Oobe10Module key={index} phase={phase} last={last} onDone={onDone} />
    case 'ready11':
      return <Ready11Module key={index} phase={phase} last={last} onDone={onDone} />
    case 'mct':
      return <MctModule key={index} phase={phase} last={last} onDone={onDone} />
    case 'uefi11':
      return <Uefi11Module key={index} phase={phase} last={last} onDone={onDone} />
    case 'setup11':
      return <Setup11Module key={index} phase={phase} last={last} onDone={onDone} />
    case 'oobe11':
      return <Oobe11Module key={index} phase={phase} last={last} onDone={onDone} />
    case 'post11':
      return <Post11Module key={index} phase={phase} last={last} onDone={onDone} />
  }
}
