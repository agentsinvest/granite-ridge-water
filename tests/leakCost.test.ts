import { describe, expect, it } from 'vitest'
import type { RatePeriod, ReadPeriod } from '../src/engine/billing'
import { episodeCost, leakCost, marginalPricePerKgal } from '../src/engine/leakCost'
import { buildData } from '../scripts/build-data'

const data = buildData()
const rates = data.rates as unknown as RatePeriod[]
const periods = (m: string) => data.billingPeriods[m].rows as ReadPeriod[]
const rate2026 = rates.find((r) => r.applies_from_period_end === '2026-05-13')!

describe('marginalPricePerKgal', () => {
  it('matches a hand calculation for block 2 under the 2026-05-13 rate', () => {
    // (8.94 + 0.08 drought + 0.0065 superfund) x 1.0829 tax = 9.7748 per thousand gallons
    expect(marginalPricePerKgal(rate2026, 2)).toBeCloseTo(9.7748, 4)
    // (5.95 + 0.08 + 0.0065) x 1.0829 = 6.5369
    expect(marginalPricePerKgal(rate2026, 1)).toBeCloseTo(6.5369, 4)
  })
})

describe('episodeCost', () => {
  it('prices an episode on a known bill as that bill with the water minus the bill without it', () => {
    // Meter-1, period ending 2026-09-14, 399,000 gallons, well over its allowance, so all block 2.
    const e = episodeCost('meter-1', { from: '2026-08-13', to: '2026-09-14', gallons: 86000 }, rates, periods('meter-1'))
    expect(e.kind).toBe('billed')
    if (e.kind !== 'billed') return
    expect(e.usd).toBeCloseTo(86 * 9.7748, 0)
  })

  it('gives a block 1 to block 2 range when the bill has not arrived yet', () => {
    const e = episodeCost('meter-4', { from: '2026-10-02', to: '2026-10-04', gallons: 10000 }, rates, periods('meter-4'))
    expect(e.kind).toBe('range')
    if (e.kind !== 'range') return
    expect(e.low).toBeCloseTo(65.37, 2)
    expect(e.high).toBeCloseTo(97.75, 2)
    expect(e.reason).toMatch(/Not on a bill yet/)
  })

  it('leaves water unpriced when no rate covers it, instead of guessing', () => {
    const e = episodeCost('meter-4', { from: '2023-09-15', to: '2024-11-12', gallons: 271000 }, rates, periods('meter-4'))
    expect(e.kind).toBe('unpriced')
  })
})

describe('leakCost', () => {
  it('adds billed and unbilled episodes and prices a yearly figure at the latest rate', () => {
    const c = leakCost(
      'meter-1',
      { episodes: [{ from: '2026-07-03', to: '2026-07-14', gallons: 1200 }, { from: '2026-09-29', to: '2026-10-05', gallons: 700 }], ongoing_gallons_per_year: 36500 },
      rates,
      periods('meter-1'),
    )
    expect(c.gallons).toBe(1900)
    expect(c.low).toBeLessThan(c.high!)
    expect(c.perYear?.low).toBeCloseTo(36.5 * 6.5369, 1)
    expect(c.perYear?.high).toBeCloseTo(36.5 * 9.7748, 1)
  })

  it('reports no dollars when nothing could be priced', () => {
    const c = leakCost('meter-4', { episodes: [{ from: '2023-09-15', to: '2024-11-12', gallons: 271000 }], ongoing_gallons_per_year: null }, rates, periods('meter-4'))
    expect(c.low).toBeNull()
    expect(c.unpricedGallons).toBe(271000)
  })

  it('every flag with excess water has an episode inside its own data', () => {
    for (const f of data.flags) for (const e of f.excess_water?.episodes ?? []) expect(e.from <= e.to).toBe(true)
  })
})
