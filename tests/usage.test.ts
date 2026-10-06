import { describe, expect, it } from 'vitest'
import { recentUsage, shares } from '../src/engine/usage'

const rows = [
  { start: '2026-01-01', end: '2026-01-31', usage: 10 },
  { start: '2026-02-01', end: '2026-02-28', usage: null },
  { start: '2026-03-01', end: '2026-03-31', usage: 30 },
]

describe('recentUsage', () => {
  it('sums the most recent periods and counts missing ones instead of guessing', () => {
    const s = recentUsage('meter-1', rows, 2)
    expect(s).toEqual({ meter: 'meter-1', thousandGallons: 30, periods: 2, missingPeriods: 1, from: '2026-02-01', to: '2026-03-31' })
  })
  it('sorts by start date before taking the most recent', () => {
    expect(recentUsage('m', [...rows].reverse(), 1).thousandGallons).toBe(30)
  })
})

describe('shares', () => {
  it('returns fractions that sum to 1', () => {
    const r = shares([recentUsage('a', rows, 3), recentUsage('b', [{ start: '2026-01-01', end: '2026-01-31', usage: 60 }], 3)])
    expect(r.a).toBeCloseTo(0.4)
    expect(r.b).toBeCloseTo(0.6)
  })
  it('returns null shares when there is no usage', () => {
    expect(shares([recentUsage('a', [], 3)])).toEqual({ a: null })
  })
})
