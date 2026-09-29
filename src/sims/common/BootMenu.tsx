import { useEffect, useRef, useState } from 'react'
import { KeyPad } from './Monitor'

interface Props {
  items: { label: string; value: string }[]
  onSelect: (value: string) => void
  onEscape: () => void
}

/** One-time boot menu (F12). */
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
            <button
              key={item.value}
              type="button"
              tabIndex={-1}
              role="option"
              aria-selected={i === index}
              className={i === index ? 'on' : undefined}
              onClick={() => {
                setIndex(i)
                onSelect(item.value)
              }}
            >
              {item.label}
            </button>
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
      <KeyPad keys={['ArrowUp', 'ArrowDown', 'Enter', 'Escape']} onKey={press} />
    </div>
  )
}
