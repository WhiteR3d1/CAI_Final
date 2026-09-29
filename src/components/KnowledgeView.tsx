import type { KBlock } from '../game/types'
import { Icon } from './Icon'
import { RichText } from './RichText'

const NOTE_ICON = { extra: 'sparkle', warn: 'alert', tip: 'bulb' } as const
const NOTE_LABEL = { extra: 'เสริมนอกใบเนื้อหา', warn: 'ระวัง', tip: 'เคล็ดลับ' } as const

function Block({ block }: { block: KBlock }) {
  switch (block.kind) {
    case 'text':
      return (
        <p className="kb-text">
          <RichText text={block.text} />
        </p>
      )
    case 'points':
      return (
        <div className="kb-points">
          {block.title && <h4>{block.title}</h4>}
          <ul>
            {block.items.map(item => (
              <li key={item}>
                <RichText text={item} />
              </li>
            ))}
          </ul>
        </div>
      )
    case 'table':
      return (
        <div className="kb-table">
          {block.title && <h4>{block.title}</h4>}
          <div className="kb-table-scroll">
            <table>
              <thead>
                <tr>
                  {block.head.map((h, i) => (
                    <th key={i} scope="col">
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {block.rows.map((row, r) => (
                  <tr key={r}>
                    {row.map((cell, c) =>
                      c === 0 ? (
                        <th key={c} scope="row">
                          <RichText text={cell} />
                        </th>
                      ) : (
                        <td key={c}>
                          <RichText text={cell} />
                        </td>
                      ),
                    )}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )
    case 'flow':
      return (
        <div className="kb-flow">
          {block.title && <h4>{block.title}</h4>}
          <ol>
            {block.steps.map((step, i) => (
              <li key={i}>
                <strong>{step.label}</strong>
                {step.sub && <span>{step.sub}</span>}
              </li>
            ))}
          </ol>
        </div>
      )
    case 'note':
      return (
        <aside className={`kb-note kb-note-${block.tone}`}>
          <Icon name={NOTE_ICON[block.tone]} size={18} />
          <div>
            <strong>
              {block.title ?? NOTE_LABEL[block.tone]}
              {block.title && block.tone === 'extra' && <small> · {NOTE_LABEL.extra}</small>}
            </strong>
            <p>
              <RichText text={block.text} />
            </p>
          </div>
        </aside>
      )
  }
}

export function KnowledgeView({ blocks }: { blocks: KBlock[] }) {
  return (
    <div className="kb">
      {blocks.map((block, i) => (
        <Block key={i} block={block} />
      ))}
    </div>
  )
}
