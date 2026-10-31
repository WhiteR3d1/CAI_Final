import { useEffect, useState } from 'react'
import { Icon } from './Icon'
import { applyTheme, currentTheme, saveTheme } from './theme'

export function ThemeToggle({ className = '' }: { className?: string }) {
  const [theme, setTheme] = useState(currentTheme)

  useEffect(() => {
    applyTheme(theme)
  }, [theme])

  const next = theme === 'dark' ? 'light' : 'dark'
  const label = next === 'dark' ? 'เปลี่ยนเป็นธีมมืด' : 'เปลี่ยนเป็นธีมสว่าง'

  return (
    <button
      type="button"
      className={`theme-toggle${className ? ` ${className}` : ''}`}
      aria-label={label}
      title={label}
      onClick={() => {
        setTheme(next)
        saveTheme(next)
      }}
    >
      <Icon name={theme === 'dark' ? 'moon' : 'sun'} size={20} />
    </button>
  )
}
