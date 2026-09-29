import { defaultSave, normalizeSave } from './progress.ts'
import type { SaveData } from './types.ts'

// v3: the jobs were replaced by the Windows-installation content sheet, so old saves start fresh.
export const SAVE_KEY = 'boot-bloom:save:v3'

export function loadSave(): SaveData {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY)
    return raw ? normalizeSave(JSON.parse(raw)) : defaultSave()
  } catch {
    return defaultSave()
  }
}

export function writeSave(save: SaveData): boolean {
  try {
    window.localStorage.setItem(SAVE_KEY, JSON.stringify(save))
    return true
  } catch {
    return false
  }
}
