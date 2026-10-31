// Light/dark preference. It lives in localStorage rather than in the save, so it also applies to the
// sign-in page and the teacher console, and it follows the device instead of the account.
export type Theme = 'light' | 'dark'

const KEY = 'boot-bloom:theme'

function stored(): Theme | null {
  try {
    const value = localStorage.getItem(KEY)
    return value === 'light' || value === 'dark' ? value : null
  } catch {
    return null
  }
}

/** the saved choice, or whatever the device is set to */
export function currentTheme(): Theme {
  return stored() ?? (window.matchMedia?.('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
}

export function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme
}

export function saveTheme(theme: Theme) {
  try {
    localStorage.setItem(KEY, theme)
  } catch {
    // a browser with storage switched off still gets the change for this visit
  }
}

/** called once from main.tsx so the first paint already has the right colours */
export function initTheme() {
  applyTheme(currentTheme())
}
