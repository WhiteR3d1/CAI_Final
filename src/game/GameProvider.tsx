import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { playSound, type SoundName } from './audio'
import { applySurface, buyDecor, placeItem } from './decor'
import { GameContext, type GameApi } from './gameContext'
import { applyResult, defaultSave, reputation, shopLevel, startAttempt } from './progress'
import { loadSave, writeSave } from './storage'
import type { SaveData } from './types'

export function GameProvider({ children }: { children: ReactNode }) {
  const [save, setSave] = useState<SaveData>(loadSave)
  const [storageOk, setStorageOk] = useState(true)

  const commit = useCallback((next: SaveData) => {
    setSave(next)
    setStorageOk(writeSave(next))
  }, [])

  const play = useCallback(
    (name: SoundName) => {
      if (save.settings.sfx) playSound(name)
    },
    [save.settings.sfx],
  )

  const api = useMemo<GameApi>(() => {
    const attempt = (next: SaveData | null) => {
      if (!next) return false
      commit(next)
      return true
    }
    return {
      save,
      storageOk,
      play,
      startJob: id => commit(startAttempt(save, id)),
      finishJob: (job, result) => {
        const { save: next, paid } = applyResult(save, job, result)
        commit(next)
        return paid
      },
      buyDecor: id => attempt(buyDecor(save, id, shopLevel(reputation(save)).index)),
      placeDecor: id => attempt(placeItem(save, id)),
      applySurface: id => attempt(applySurface(save, id)),
      setDecor: decor => commit({ ...save, decor }),
      updateSettings: patch => commit({ ...save, settings: { ...save.settings, ...patch } }),
      reset: () => commit({ ...defaultSave(), settings: save.settings }),
    }
  }, [save, storageOk, play, commit])

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>
}
