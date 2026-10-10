import type { Section } from '../../data/blog'
import ArticleImagePicker from './ArticleImagePicker'
import { office } from './officeTheme'

const BLOCK_TYPES: { type: Section['type']; label: string }[] = [
  { type: 'paragraph', label: 'Paragraph' },
  { type: 'heading', label: 'Heading' },
  { type: 'quote', label: 'Quote' },
  { type: 'list', label: 'Bullet list' },
  { type: 'image', label: 'Photo' },
]

function blankSection(type: Section['type']): Section {
  if (type === 'list') return { type, items: [''] }
  if (type === 'image') return { type, src: '', alt: '', caption: '' }
  return { type, content: '' }
}

function typeLabel(type: Section['type']): string {
  return BLOCK_TYPES.find(b => b.type === type)?.label || type
}

export default function ArticleBodyEditor({
  sections,
  onChange,
  disabled = false,
}: {
  sections: Section[]
  onChange: (next: Section[]) => void
  disabled?: boolean
}) {
  const updateAt = (index: number, patch: Partial<Section>) => {
    onChange(sections.map((s, i) => (i === index ? { ...s, ...patch } : s)))
  }

  const move = (index: number, dir: -1 | 1) => {
    const next = index + dir
    if (next < 0 || next >= sections.length) return
    const copy = [...sections]
    const [item] = copy.splice(index, 1)
    copy.splice(next, 0, item)
    onChange(copy)
  }

  const remove = (index: number) => {
    onChange(sections.filter((_, i) => i !== index))
  }

  const add = (type: Section['type']) => {
    onChange([...sections, blankSection(type)])
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3">
        <div>
          <p className="text-[10px] tracking-[0.2em] uppercase" style={{ color: office.gold, fontFamily: "'DM Mono', monospace" }}>
            Story body
          </p>
          <p className="text-xs mt-1" style={{ color: office.mute }}>
            Build the article in plain blocks — no code, no JSON. Add paragraphs, headings, quotes, lists, and photos.
          </p>
        </div>
        <p className="text-[10px] tracking-widest uppercase" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
          {sections.length} block{sections.length === 1 ? '' : 's'}
        </p>
      </div>

      {sections.length === 0 ? (
        <div className="p-6 text-center" style={{ backgroundColor: '#fff', border: `1px dashed ${office.line}` }}>
          <p className="text-sm mb-4" style={{ color: office.mute }}>
            Start writing — add your first paragraph or photo below.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {sections.map((section, index) => (
            <div
              key={`${section.type}-${index}`}
              className="p-4 sm:p-5 space-y-3"
              style={{ backgroundColor: '#fff', border: `1px solid ${office.line}` }}
            >
              <div className="flex flex-wrap items-center justify-between gap-2">
                <span
                  className="text-[10px] tracking-[0.18em] uppercase px-2 py-1"
                  style={{ backgroundColor: '#F0E8D8', color: office.wine, fontFamily: "'DM Mono', monospace" }}
                >
                  {index + 1}. {typeLabel(section.type)}
                </span>
                <div className="flex flex-wrap gap-1">
                  <button
                    type="button"
                    disabled={disabled || index === 0}
                    onClick={() => move(index, -1)}
                    className="px-2.5 py-2 text-[10px] tracking-widest uppercase min-h-[36px] disabled:opacity-30"
                    style={{ border: `1px solid ${office.line}`, color: office.mute, fontFamily: "'DM Mono', monospace", background: '#FAF6F0' }}
                  >
                    Up
                  </button>
                  <button
                    type="button"
                    disabled={disabled || index === sections.length - 1}
                    onClick={() => move(index, 1)}
                    className="px-2.5 py-2 text-[10px] tracking-widest uppercase min-h-[36px] disabled:opacity-30"
                    style={{ border: `1px solid ${office.line}`, color: office.mute, fontFamily: "'DM Mono', monospace", background: '#FAF6F0' }}
                  >
                    Down
                  </button>
                  <button
                    type="button"
                    disabled={disabled}
                    onClick={() => remove(index)}
                    className="px-2.5 py-2 text-[10px] tracking-widest uppercase min-h-[36px]"
                    style={{ color: office.wine, fontFamily: "'DM Mono', monospace", background: 'none', border: 'none' }}
                  >
                    Remove
                  </button>
                </div>
              </div>

              {section.type === 'paragraph' || section.type === 'heading' || section.type === 'quote' ? (
                <textarea
                  rows={section.type === 'heading' ? 2 : 5}
                  value={section.content || ''}
                  disabled={disabled}
                  onChange={e => updateAt(index, { content: e.target.value })}
                  placeholder={
                    section.type === 'heading'
                      ? 'Section heading'
                      : section.type === 'quote'
                        ? 'A short quotation…'
                        : 'Write this paragraph…'
                  }
                  className="w-full px-3 py-3 text-sm"
                  style={{
                    ...office.field,
                    fontFamily: section.type === 'heading' ? "'Lora', serif" : undefined,
                    fontWeight: section.type === 'heading' ? 600 : undefined,
                    fontStyle: section.type === 'quote' ? 'italic' : undefined,
                  }}
                />
              ) : null}

              {section.type === 'list' ? (
                <div className="space-y-2">
                  <p className="text-xs" style={{ color: office.mute }}>One bullet per line</p>
                  <textarea
                    rows={5}
                    value={(section.items || []).join('\n')}
                    disabled={disabled}
                    onChange={e =>
                      updateAt(index, {
                        items: e.target.value.split('\n'),
                      })
                    }
                    placeholder={'First point\nSecond point\nThird point'}
                    className="w-full px-3 py-3 text-sm"
                    style={office.field}
                  />
                </div>
              ) : null}

              {section.type === 'image' ? (
                <div className="space-y-3">
                  <ArticleImagePicker
                    value={section.src || ''}
                    onChange={src => updateAt(index, { src })}
                    label="Photo in the story"
                    hint="This photo appears in the middle of the article."
                    disabled={disabled}
                    aspect="16/9"
                  />
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div>
                      <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                        Alt text
                      </label>
                      <input
                        value={section.alt || ''}
                        disabled={disabled}
                        onChange={e => updateAt(index, { alt: e.target.value })}
                        placeholder="Short description for accessibility"
                        className="w-full px-3 py-3 text-sm min-h-[44px]"
                        style={office.field}
                      />
                    </div>
                    <div>
                      <label className="text-[10px] tracking-widest uppercase block mb-1" style={{ color: office.mute, fontFamily: "'DM Mono', monospace" }}>
                        Caption
                      </label>
                      <input
                        value={section.caption || ''}
                        disabled={disabled}
                        onChange={e => updateAt(index, { caption: e.target.value })}
                        placeholder="Optional caption under the photo"
                        className="w-full px-3 py-3 text-sm min-h-[44px]"
                        style={office.field}
                      />
                    </div>
                  </div>
                </div>
              ) : null}
            </div>
          ))}
        </div>
      )}

      <div className="flex flex-wrap gap-2 pt-1">
        {BLOCK_TYPES.map(block => (
          <button
            key={block.type}
            type="button"
            disabled={disabled}
            onClick={() => add(block.type)}
            className="px-3.5 py-2.5 text-[10px] tracking-widest uppercase min-h-[40px]"
            style={{
              border: `1px solid ${office.gold}`,
              color: office.wine,
              backgroundColor: '#fff',
              fontFamily: "'DM Mono', monospace",
            }}
          >
            + {block.label}
          </button>
        ))}
      </div>
    </div>
  )
}

export function estimateReadTime(sections: Section[]): string {
  const words = sections.reduce((sum, s) => {
    if (s.type === 'list') return sum + (s.items || []).join(' ').split(/\s+/).filter(Boolean).length
    if (s.type === 'image') return sum
    return sum + (s.content || '').split(/\s+/).filter(Boolean).length
  }, 0)
  const minutes = Math.max(1, Math.round(words / 200) || 1)
  return `${minutes} min read`
}

export function normalizeSections(sections: Section[]): Section[] {
  return sections
    .map(s => {
      if (s.type === 'list') {
        return {
          ...s,
          items: (s.items || []).map(i => i.trim()).filter(Boolean),
        }
      }
      if (s.type === 'image') {
        return {
          type: 'image' as const,
          src: (s.src || '').trim(),
          alt: (s.alt || '').trim(),
          caption: (s.caption || '').trim(),
        }
      }
      return {
        ...s,
        content: (s.content || '').trim(),
      }
    })
    .filter(s => {
      if (s.type === 'list') return (s.items || []).length > 0
      if (s.type === 'image') return Boolean(s.src)
      return Boolean(s.content)
    })
}
