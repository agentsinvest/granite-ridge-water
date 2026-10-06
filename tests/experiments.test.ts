import { describe, expect, it } from 'vitest'
import { checkExperiment, type Day } from '../src/engine/experiments'

const s = { minDays: 7, minHours: 20, shareOfTarget: 0.75, noisePercent: 5 }
const series = (from: string, n: number, gallons: number, hours = 24): Day[] =>
  Array.from({ length: n }, (_, i) => ({ date: new Date(Date.parse(`${from}T12:00:00Z`) + i * 86400000).toISOString().slice(0, 10), gallons, hours }))

describe('checkExperiment', () => {
  const before = series('2026-07-01', 14, 1000)
  it('says as expected when use drops by the expected amount', () => {
    const r = checkExperiment([...before, ...series('2026-07-15', 14, 900)], '2026-07-15', null, 14, { type: 'percent_reduction', value: 10 }, s)
    expect(r.verdict).toBe('as_expected')
    expect(r.changePercent).toBeCloseTo(10, 10)
  })
  it('says partly when it drops less than three-quarters of the target', () => {
    const r = checkExperiment([...before, ...series('2026-07-15', 14, 940)], '2026-07-15', null, 14, { type: 'percent_reduction', value: 10 }, s)
    expect(r.verdict).toBe('partly')
  })
  it('says went up and no change correctly', () => {
    expect(checkExperiment([...before, ...series('2026-07-15', 14, 1100)], '2026-07-15', null, 14, { type: 'percent_reduction', value: 10 }, s).verdict).toBe('went_up')
    expect(checkExperiment([...before, ...series('2026-07-15', 14, 990)], '2026-07-15', null, 14, { type: 'percent_reduction', value: 10 }, s).verdict).toBe('no_change')
  })
  it('ignores incomplete days and waits for enough data', () => {
    const r = checkExperiment([...before, ...series('2026-07-15', 14, 0, 5)], '2026-07-15', null, 14, { type: 'percent_reduction', value: 10 }, s)
    expect(r.verdict).toBe('not_enough_data')
  })
  it('checks a daily ceiling for repairs', () => {
    const after = series('2026-07-15', 10, 300)
    expect(checkExperiment([...before, ...after], '2026-07-15', null, 14, { type: 'max_daily_gallons', value: 400 }, s).verdict).toBe('as_expected')
    after[3].gallons = 9000
    const r = checkExperiment([...before, ...after], '2026-07-15', null, 14, { type: 'max_daily_gallons', value: 400 }, s)
    expect(r.verdict).toBe('partly')
    expect(r.after.daysOver).toBe(1)
  })
  it('is not started without a start date', () => {
    expect(checkExperiment(before, null, null, 14, { type: 'percent_reduction', value: 10 }, s).verdict).toBe('not_started')
  })
})
