import { defaultSave, normalizeSave } from './progress.ts'
import type { SaveData } from './types.ts'

// v4: free-placement shop decorations. A v3 save (same jobs, five fixed decorations) is migrated
// on first load; the v3 key is left untouched so nothing is lost if an older build is opened again.
export const SAVE_KEY = 'boot-bloom:save:v4'
export const LEGACY_SAVE_KEY = 'boot-bloom:save:v3'

export function loadSave(): SaveData {
  try {
    const raw = window.localStorage.getItem(SAVE_KEY) ?? window.localStorage.getItem(LEGACY_SAVE_KEY)
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
