import { describe, expect, it } from 'vitest'
import { findRuns, hourLabel, hourProfile, hourlyTotal, summarize, trimBills, trimEstimate, wateringWindows, type HourlyRead } from '../src/engine/schedule'
import type { RatePeriod } from '../src/engine/billing'

const S = { minGallons: 50, maxGapHours: 3 }

/** Build reads from a start time and a list of gallons; null leaves the hour out (missing). */
function reads(start: string, gallons: (number | null)[]): HourlyRead[] {
  const t0 = Date.UTC(+start.slice(0, 4), +start.slice(5, 7) - 1, +start.slice(8, 10), +start.slice(11, 13))
  return gallons.flatMap((g, i) => (g === null ? [] : [{ time: new Date(t0 + i * 3_600_000).toISOString().slice(0, 13).replace('T', ' ') + ':00', gallons: g }]))
}

describe('findRuns', () => {
  it('finds a complete run across midnight', () => {
    const r = findRuns(reads('2026-07-01 20:00', [0, 0, 1000, 1000, 1000, 500, 0, 0]), S)
    expect(r).toHaveLength(1)
    expect(r[0]).toMatchObject({ start: '2026-07-01 22:00', end: '2026-07-02 01:00', gallons: 3500, missingHours: 0, complete: true })
  })

  it('keeps a short gap inside one run and marks it partial, never counting missing as zero', () => {
    const r = findRuns(reads('2026-07-01 21:00', [0, 1000, null, null, 1000, 0]), S)
    expect(r).toHaveLength(1)
    expect(r[0]).toMatchObject({ hours: [1000, null, null, 1000], missingHours: 2, startKnown: true, endKnown: true, complete: false })
  })

  it('splits runs when the gap is longer than allowed', () => {
    const r = findRuns(reads('2026-07-01 21:00', [0, 1000, null, null, null, null, 1000, 0]), S)
    expect(r).toHaveLength(2)
    expect(r[0].endKnown).toBe(false)
    expect(r[1].startKnown).toBe(false)
  })

  it('marks the start unknown when the hour before is missing, and the end unknown at the end of the data', () => {
    const r = findRuns(reads('2026-07-01 22:00', [0, null, 800, 800]), S)
    expect(r[0]).toMatchObject({ startKnown: false, endKnown: false, complete: false })
  })

  it('ignores flow below the watering threshold', () => {
    expect(findRuns(reads('2026-07-01 00:00', [4, 5, 49, 3]), S)).toEqual([])
  })
})

describe('summaries', () => {
  const data = reads('2026-07-01 12:00', [
    ...Array(10).fill(0), 1000, 1000, 1000, 1000, ...Array(10).fill(0), // night 1: 10 PM to 1 AM
    ...Array(10).fill(0), 1000, 1000, 1000, 1000, ...Array(10).fill(0), // night 2: same
    ...Array(8).fill(0), 200, ...Array(15).fill(0), // night 3: 8 PM only
  ])
  const runs = findRuns(data, S)

  it('groups runs into watering windows, most common first', () => {
    const w = wateringWindows(runs)
    expect(w[0]).toMatchObject({ startHour: 22, endHour: 1, hours: 4, runs: 2, medianGallons: 4000 })
    expect(w[1]).toMatchObject({ startHour: 20, endHour: 20, runs: 1 })
  })

  it('counts days with watering per clock hour', () => {
    const p = hourProfile(data, 50)
    expect(p[22]).toMatchObject({ watered: 2, reported: 3, avgGallonsWhenWatered: 1000 })
    expect(p[20].watered).toBe(1)
    expect(p[12].watered).toBe(0)
  })

  it('reports runs per week over the span of the data', () => {
    const s = summarize(data, runs)
    expect(s.runs).toBe(3)
    expect(s.runsPerWeek).toBeCloseTo((3 / s.days) * 7)
  })
})

describe('trimEstimate', () => {
  it('measures gallons in the last hours when most runs are complete', () => {
    // Two nights, 4 hours each; the last hour is a smaller station.
    const runs = findRuns(reads('2026-07-01 21:00', [0, 1000, 1000, 1000, 200, 0, 0, 1000, 1000, 1000, 200, 0]), S)
    const e = trimEstimate(runs, 1, 0.8)
    expect(e).toMatchObject({ method: 'measured_gallons', runsUsed: 2 })
    if (e.method) expect(e.share).toBeCloseTo(400 / 6400)
  })

  it('falls back to the share of watering hours when too many runs have missing hours', () => {
    const runs = findRuns(reads('2026-07-01 21:00', [0, 1000, null, 1000, 1000, 0, 0, 1000, null, 1000, 1000, 0]), S)
    const e = trimEstimate(runs, 1, 0.8)
    expect(e).toMatchObject({ method: 'watering_hours', runsUsed: 2 })
    if (e.method) expect(e.share).toBeCloseTo(2 / 8)
  })

  it('removes a run shorter than the trim entirely', () => {
    const runs = findRuns(reads('2026-07-01 21:00', [0, 1000, 1000, 1000, 0, 0, 500, 0]), S)
    const e = trimEstimate(runs, 1, 0)
    if (e.method) expect(e.share).toBeCloseTo((1000 + 500) / 3500)
    else throw new Error('expected an estimate')
  })

  it('gives no estimate when the typical run fits in one hourly read', () => {
    const runs = findRuns(reads('2026-07-01 00:00', [0, 300, 0, 0, 300, 0]), S)
    expect(trimEstimate(runs, 1, 0.8).method).toBeNull()
  })

  it('rejects a non-whole number of hours', () => {
    expect(() => trimEstimate([], 1.5, 0.8)).toThrow()
  })
})

describe('hourlyTotal', () => {
  it('sums reads in whole days and counts hours read', () => {
    const r = hourlyTotal(reads('2026-07-01 00:00', [10, null, 30, ...Array(21).fill(1), 99]), '2026-07-01', '2026-07-01')
    expect(r).toEqual({ gallons: 61, hoursRead: 23, hoursInRange: 24 })
  })
})

describe('trimBills', () => {
  const rate: RatePeriod = {
    applies_from_period_end: '2026-01-01',
    applies_to_period_end: null,
    fixed_charges: [{ meters: ['meter-1'], amount: 50 }],
    included_kgal_per_bill: { value: 0 },
    volumetric: { blocks: [{ block: 1, limit: 'winter_allowance', price: 2 }, { block: 2, limit: null, price: 4 }] },
    fees: [],
    taxes: [],
  }
  const periods = [
    { start: '2025-11-15', end: '2025-12-14', usage: 10 },
    { start: '2025-12-15', end: '2026-01-14', usage: 10 },
    { start: '2026-01-15', end: '2026-02-14', usage: 10 },
  ]
  const bill = { id: 'b', meter: 'meter-1', period_start: '2026-07-01', period_end: '2026-07-31', gallons: 100_000 }

  it('re-prices a bill with the trimmed gallons', () => {
    // 100 kgal: 10 in block 1 at $2, 90 in block 2 at $4, plus $50 = $430. Cut 25%: 75 kgal = 50 + 20 + 260 = $330.
    const [r] = trimBills([bill], 0.25, [rate], periods)
    expect(r).toMatchObject({ gallonsSaved: 25_000, computedNow: 430, computedTrimmed: 330, saved: 100 })
  })

  it('leaves out bills it cannot price', () => {
    expect(trimBills([{ ...bill, gallons: null }], 0.25, [rate], periods)).toEqual([])
    expect(trimBills([bill], 0.25, [rate], [])).toEqual([])
  })
})

describe('hourLabel', () => {
  it('formats clock hours', () => {
    expect([0, 1, 12, 13, 22].map(hourLabel)).toEqual(['12 AM', '1 AM', '12 PM', '1 PM', '10 PM'])
  })
})
