import { describe, expect, it } from 'vitest'
import { parseMarkdown } from '../scripts/markdown'

describe('parseMarkdown', () => {
  it('reads frontmatter and tables with file line numbers', () => {
    const text = ['---', 'meter: meter-1', '---', '', 'Intro.', '', '| A | B |', '|---|---|', '| 1 | x |', '| 2 | |', ''].join('\n')
    const p = parseMarkdown(text)
    expect(p.frontmatter.meter).toBe('meter-1')
    expect(p.tables).toHaveLength(1)
    expect(p.tables[0].line).toBe(7)
    expect(p.tables[0].rows.map((r) => r.line)).toEqual([9, 10])
    expect(p.tables[0].rows[1].cells).toEqual({ A: '2', B: '' })
  })

  it('rejects a row with the wrong number of cells', () => {
    const text = ['---', 'a: 1', '---', '| A | B |', '|---|---|', '| 1 |'].join('\n')
    expect(() => parseMarkdown(text)).toThrow(/line 6/)
  })
})
