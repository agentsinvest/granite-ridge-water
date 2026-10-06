import { readFileSync, readdirSync, statSync } from 'node:fs'
import { join, relative } from 'node:path'
import { describe, expect, it } from 'vitest'

const root = join(__dirname, '..')
const walk = (dir: string): string[] =>
  readdirSync(dir).flatMap((n) => {
    const p = join(dir, n)
    return statSync(p).isDirectory() ? walk(p) : n.endsWith('.md') ? [p] : []
  })

describe('public-site rules', () => {
  it('has no digit run longer than 6 in /data except the example meter reads', () => {
    const hits = walk(join(root, 'data')).flatMap((f) =>
      readFileSync(f, 'utf8')
        .split('\n')
        .map((line, i) => ({ f: relative(root, f), i: i + 1, line }))
        .filter(({ line }) => /\d{7,}/.test(line) && !/^read_(start|end): \d+$/.test(line)),
    )
    expect(hits).toEqual([])
  })

  it('has no full Mesa account numbers in /data or /sources markdown', () => {
    const files = [...walk(join(root, 'data')), ...walk(join(root, 'sources'))]
    const hits = files.filter((f) => /\b30486\d-\d\b/.test(readFileSync(f, 'utf8')))
    expect(hits.map((f) => relative(root, f))).toEqual([])
  })

  it('keeps the site out of search results', () => {
    expect(readFileSync(join(root, 'index.html'), 'utf8')).toContain('<meta name="robots" content="noindex, nofollow" />')
    expect(readFileSync(join(root, 'public', 'robots.txt'), 'utf8')).toMatch(/User-agent: \*\s+Disallow: \//)
  })

  it('shows the required footer text', () => {
    expect(readFileSync(join(root, 'src', 'App.tsx'), 'utf8')).toContain(
      'Estimates are based on City of Mesa published rates and HOA records. Bills from the City are the official record.',
    )
  })
})
