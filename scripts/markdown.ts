import matter from 'gray-matter'
import YAML from 'yaml'

export type TableRow = { line: number; cells: Record<string, string> }
export type Table = { line: number; headers: string[]; rows: TableRow[] }
export type ParsedFile = { frontmatter: Record<string, unknown>; tables: Table[]; body: string; bodyStartLine: number }

// gray-matter's bundled js-yaml is old; parse YAML with the maintained `yaml` package instead.
const engines = { yaml: (s: string) => (YAML.parse(s) ?? {}) as object }

function splitRow(line: string): string[] {
  const inner = line.trim().replace(/^\|/, '').replace(/\|$/, '')
  return inner.split('|').map((c) => c.trim())
}

export function parseMarkdown(text: string): ParsedFile {
  const fm = matter(text, { engines })
  const bodyIndex = text.length - fm.content.length
  const bodyStartLine = text.slice(0, bodyIndex).split('\n').length
  const lines = fm.content.split('\n')
  const tables: Table[] = []
  for (let i = 0; i < lines.length - 1; i++) {
    const head = lines[i].trim()
    const sep = lines[i + 1].trim()
    if (!head.startsWith('|') || !/^\|(\s*:?-{3,}:?\s*\|)+$/.test(sep)) continue
    const headers = splitRow(head)
    const table: Table = { line: bodyStartLine + i, headers, rows: [] }
    let j = i + 2
    for (; j < lines.length && lines[j].trim().startsWith('|'); j++) {
      const cells = splitRow(lines[j])
      if (cells.length !== headers.length) {
        throw new Error(`line ${bodyStartLine + j}: table row has ${cells.length} cells, header has ${headers.length}`)
      }
      table.rows.push({ line: bodyStartLine + j, cells: Object.fromEntries(headers.map((h, k) => [h, cells[k]])) })
    }
    tables.push(table)
    i = j - 1
  }
  return { frontmatter: fm.data as Record<string, unknown>, tables, body: fm.content, bodyStartLine }
}

/** Line number of a top-level frontmatter key, for error messages. */
export function keyLine(text: string, key: string): number | null {
  const lines = text.split('\n')
  const i = lines.findIndex((l) => l.startsWith(`${key}:`) || l.trimStart().startsWith(`${key}:`))
  return i >= 0 ? i + 1 : null
}
