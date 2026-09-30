import { useEffect, useRef, useState } from 'react'
import { KeyPad } from './Monitor'

interface Props {
  items: { label: string; value: string }[]
  onSelect: (value: string) => void
  onEscape: () => void
}

/** One-time boot menu (F12). Keyboard only, like the real firmware menu. */
export function BootMenu({ items, onSelect, onEscape }: Props) {
  const ref = useRef<HTMLDivElement>(null)
  const [index, setIndex] = useState(0)

  useEffect(() => {
    ref.current?.focus({ preventScroll: true })
  }, [])

  const press = (key: string) => {
    if (key === 'ArrowUp') setIndex(i => Math.max(0, i - 1))
    else if (key === 'ArrowDown') setIndex(i => Math.min(items.length - 1, i + 1))
    else if (key === 'Enter') onSelect(items[index].value)
    else if (key === 'Escape') onEscape()
  }

  return (
    <div className="bootmenu-wrap">
      <div
        ref={ref}
        className="bootmenu"
        tabIndex={0}
        role="listbox"
        aria-label="Please select boot device"
        onMouseDown={e => {
          e.preventDefault()
          ref.current?.focus({ preventScroll: true })
        }}
        onKeyDown={e => {
          if (['ArrowUp', 'ArrowDown', 'Enter', 'Escape'].includes(e.key)) {
            e.preventDefault()
            press(e.key)
          }
        }}
      >
        <div className="bootmenu-box">
          <div className="bootmenu-title">Please select boot device:</div>
          {items.map((item, i) => (
            <div key={item.value} role="option" aria-selected={i === index} className={`bootmenu-item${i === index ? ' on' : ''}`}>
              {item.label}
            </div>
          ))}
          <div className="bootmenu-help">
            ↑ and ↓ to move selection
            <br />
            ENTER to select boot device
            <br />
            ESC to boot using defaults
          </div>
        </div>
      </div>
      <KeyPad
        keys={['ArrowUp', 'ArrowDown', 'Enter', 'Escape']}
        onKey={k => {
          press(k)
          ref.current?.focus({ preventScroll: true })
        }}
      />
    </div>
  )
}
