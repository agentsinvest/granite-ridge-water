import { mkdtempSync, mkdirSync, writeFileSync, cpSync, readFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { buildData } from '../scripts/build-data'

const realData = join(__dirname, '..', 'data')

function copyOfData() {
  const dir = mkdtempSync(join(tmpdir(), 'grw-data-'))
  cpSync(realData, dir, { recursive: true })
  return dir
}

describe('buildData', () => {
  it('validates every real data file', () => {
    const d = buildData()
    expect(d.meters.map((m) => m.id)).toEqual(['meter-1', 'meter-2', 'meter-3', 'meter-4'])
    expect(d.areas.rows).toHaveLength(5)
    expect(d.map.meters).toHaveLength(4)
    expect(Object.keys(d.financials)).toEqual(['2020', '2021', '2022', '2023', '2024', '2025'])
  })

  it('carries P&L water totals through exactly', () => {
    const d = buildData()
    const water = (y: string) => d.financials[y].lines.find((l) => l.account === '50110')?.actual
    expect(water('2023')).toBe(26016.31)
    expect(water('2024')).toBe(44708.39)
  })

  it('fails with file and line on a bad table value', () => {
    const dir = copyOfData()
    writeFileSync(
      join(dir, 'events.md'),
      ['---', '---', '', '| Date | Precision | Meter | Zones | Type | What happened | Source |', '|---|---|---|---|---|---|---|', '| 2024-13 | day | | | other | x | y |', ''].join('\n'),
    )
    expect(() => buildData(dir)).toThrow(/events\.md:6: column "Date"/)
  })

  it('fails on a missing required frontmatter value', () => {
    const dir = copyOfData()
    writeFileSync(join(dir, 'meters', 'meter-9.md'), ['---', 'id: meter-9', 'name: null', '---', ''].join('\n'))
    expect(() => buildData(dir)).toThrow(/meter-9\.md.*account_last4/)
  })

  it('fails on a file with no schema', () => {
    const dir = copyOfData()
    mkdirSync(join(dir, 'zones'), { recursive: true })
    writeFileSync(join(dir, 'zones', 'a-01.md'), '---\nid: a-01\n---\n')
    expect(() => buildData(dir)).toThrow(/no schema/)
  })

  it('rejects an em dash', () => {
    const dir = copyOfData()
    writeFileSync(join(dir, 'flags', 'x.md'), '---\nid: x\n---\nA — B\n')
    expect(() => buildData(dir)).toThrow(/em dash/)
  })

  it('reads action files and names their evidence documents', () => {
    const d = buildData()
    expect(d.actions).toHaveLength(11)
    expect(d.evidenceLabels['sources/controllers/eco-verde-assessment-2026']).toMatch(/Eco Verde/)
  })

  it('fails on an action that points at a flag that does not exist', () => {
    const dir = copyOfData()
    const f = join(dir, 'actions', 'meter4-valve-repair.md')
    writeFileSync(f, readFileSync(f, 'utf8').replace('savings_from: flag:2026-09-meter-4-step-change', 'savings_from: flag:no-such-flag'))
    expect(() => buildData(dir)).toThrow(/actions\/meter4-valve-repair\.md: unknown flag "no-such-flag"/)
  })

  it('fails on an unknown action status with file and line', () => {
    const dir = copyOfData()
    const f = join(dir, 'actions', 'meter4-valve-repair.md')
    writeFileSync(f, readFileSync(f, 'utf8').replace('status: not-started\nurgent', 'status: maybe\nurgent'))
    expect(() => buildData(dir)).toThrow(/meter4-valve-repair\.md:\d+: status/)
  })
})
