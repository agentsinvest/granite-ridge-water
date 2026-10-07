import { describe, expect, it } from 'vitest'
import { currentRate, type RatePeriod, type ReadPeriod } from '../src/engine/billing'
import { latestBaseline } from '../src/engine/scenarios'
import { winterBase, winterCutEffect } from '../src/engine/winterBase'
import { buildData } from '../scripts/build-data'

const data = buildData()
const rates = data.rates as unknown as RatePeriod[]
const rate = currentRate(rates)!
const next = rates.find((r) => (r as RatePeriod & { status?: string }).status === 'recommended') ?? null
const all = Object.fromEntries(Object.entries(data.billingPeriods).map(([m, v]) => [m, v.rows as ReadPeriod[]]))
const base = latestBaseline(all, data.meters.map((m) => m.id))

const p = (end: string, usage: number): ReadPeriod => ({ start: end, end, usage })
const year: ReadPeriod[] = [
  p('2025-12-12', 10), p('2026-01-13', 11), p('2026-02-12', 12),
  p('2026-03-16', 15), p('2026-06-14', 40), p('2026-07-15', 9),
]

describe('winterBase', () => {
  it('averages the December, January, and February periods and compares the months since March', () => {
    const wb = winterBase('meter-1', year, 3)!
    expect(wb.winter.map((x) => x.end)).toEqual(['2025-12-12', '2026-01-13', '2026-02-12'])
    expect(wb.averageKgal).toBe(11)
    expect(wb.allowanceKgal).toBe(8)
    expect(wb.since).toHaveLength(3)
    expect(wb.periodsAbove).toBe(2)
    expect(wb.kgalAbove).toBe(4 + 29)
    expect(wb.peak).toEqual({ end: '2026-06-14', kgal: 40, times: 40 / 11 })
    expect(wb.tier2Kgal).toBeNull()
  })
  it('adds the second surcharge tier line from a rate that has one', () => {
    const wb = winterBase('meter-1', year, 3, next)!
    expect(wb.tier2Kgal).toBeCloseTo(16.5, 10)
    expect(wb.kgalAboveTier2).toBeCloseTo(40 - 16.5, 10)
  })
  it('returns null when a winter period is missing', () => {
    expect(winterBase('meter-1', year.filter((x) => x.end !== '2026-01-13'), 3)).toBeNull()
  })
  it('matches the allowance the billing engine uses for meter 1 on the real data', () => {
    const wb = winterBase('meter-1', all['meter-1'], rate.included_kgal_per_bill.value)!
    expect(wb.averageKgal).toBe(126) // (104 + 115 + 159) / 3, December 2025 to February 2026 read periods
    expect(wb.allowanceKgal).toBe(123)
  })
})

describe('winterCutEffect', () => {
  it('splits a winter cut into winter savings and the surcharge it adds to the rest of the year', () => {
    const c = winterCutEffect('meter-1', base['meter-1'], rate)!
    // 3 thousand gallons at the lower price plus drought and superfund, taxed: 3 x (5.95 + 0.08 + 0.0065) x 1.0829, rounded per bill.
    expect(c.winterSaved).toBeCloseTo(19.62, 1)
    expect(c.restAdded).toBeGreaterThan(c.winterSaved)
    expect(c.net).toBeCloseTo(c.restAdded - c.winterSaved, 2)
  })
  it('adds nothing to the rest of the year when no month is above the base', () => {
    const flat = base['meter-1'].map((x) => ({ ...x, usage: [12, 1, 2].includes(Number(x.end.slice(5, 7))) ? 50 : 40 }))
    const c = winterCutEffect('meter-1', flat, rate)!
    expect(c.restAdded).toBe(0)
    expect(c.net).toBeLessThan(0)
  })
})
