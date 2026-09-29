import { createContext, useContext } from 'react'
import type { DecorItem } from '../data/decor'
import type { SoundName } from './audio'
import type { JobDef, JobId, JobResult, SaveData, Settings } from './types'

export interface GameApi {
  save: SaveData
  storageOk: boolean
  startJob(id: JobId): void
  /** records the run and returns the coins actually paid */
  finishJob(job: JobDef, result: JobResult): number
  buy(item: DecorItem): boolean
  updateSettings(patch: Partial<Settings>): void
  reset(): void
  play(name: SoundName): void
}

export const GameContext = createContext<GameApi | null>(null)

export function useGame(): GameApi {
  const game = useContext(GameContext)
  if (!game) throw new Error('useGame must be used inside <GameProvider>')
  return game
}
