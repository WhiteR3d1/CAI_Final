import { createContext, useContext } from 'react'
import type { SoundName } from './audio'
import type { DecorState, JobDef, JobId, JobResult, SaveData, Settings } from './types'

export interface GameApi {
  save: SaveData
  storageOk: boolean
  startJob(id: JobId): void
  /** records the run and returns the coins actually paid */
  finishJob(job: JobDef, result: JobResult): number
  /** pays for one copy of a decoration (placed or applied at once); false when not allowed */
  buyDecor(id: string): boolean
  /** stands one copy from stock in the shop */
  placeDecor(id: string): boolean
  /** switches to an owned wall / floor / sign style */
  applySurface(id: string): boolean
  /** stores the shop layout after moving, flipping, stacking, storing or renaming */
  setDecor(decor: DecorState): void
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
