import { useCallback, useMemo, useState, type ReactNode } from 'react'
import { playSound, type SoundName } from './audio'
import { GameContext, type GameApi } from './gameContext'
import { applyResult, buyItem, defaultSave, startAttempt } from './progress'
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

  const api = useMemo<GameApi>(
    () => ({
      save,
      storageOk,
      play,
      startJob: id => commit(startAttempt(save, id)),
      finishJob: (job, result) => {
        const { save: next, paid } = applyResult(save, job, result)
        commit(next)
        return paid
      },
      buy: item => {
        const next = buyItem(save, item)
        if (!next) return false
        commit(next)
        return true
      },
      updateSettings: patch => commit({ ...save, settings: { ...save.settings, ...patch } }),
      reset: () => commit({ ...defaultSave(), settings: save.settings }),
    }),
    [save, storageOk, play, commit],
  )

  return <GameContext.Provider value={api}>{children}</GameContext.Provider>
}
