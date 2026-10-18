import { describe, expect, it } from 'vitest'
import { buildData } from '../scripts/build-data'
import type { RatePeriod, ReadPeriod } from '../src/engine/billing'
import { billInches, billMonths, meterNeed, netInches, runNeedModel, runTodaysPace, seedingInches, type NeedResult } from '../src/engine/needModel'
import { needSetup } from '../src/lib/needModel'

const d = buildData()
const rates = d.rates as unknown as RatePeriod[]
const history = Object.fromEntries(Object.entries(d.billingPeriods).map(([m, p]) => [m, p.rows as ReadPeriod[]]))
const setup = needSetup(d)
if ('missing' in setup) throw new Error(`need model inputs missing: ${setup.missing.join(', ')}`)
const { inputs, cases } = setup
const ok = (r: NeedResult | { error: string }) => {
  if ('error' in r) throw new Error(r.error)
  return r
}

describe('bill window', () => {
  it('is the 12 bills ending December 2026 to November 2027', () => {
    const b = billMonths(inputs.firstBillMonth, inputs.bills, inputs.billEndDay)
    expect(b).toHaveLength(12)
    expect(b[0]).toEqual({ year: 2026, month: 12, start: '2026-11-14', end: '2026-12-13' })
    expect(b.at(-1)!.end).toBe('2027-11-13')
  })
})

describe('need for one bill, worked by hand', () => {
  // Meter 1, bill ending July 2027, lean case.
  // Lawn: June 9.48 x 0.5 - 0.08 x 0.5 = 4.70; July 9.49 x 0.5 - 0.98 x 0.5 = 4.255; average 4.4775 in.
  // 4.4775 x 0.623 x 76,600 x 0.62 / 0.75 / 1000 = 176.6 thousand gallons.
  // Drip: June 0.948 - 0.04 = 0.908; July 0.949 - 0.49 = 0.459; average 0.6835 in x 0.623 x 127,652 / 0.9 / 1000 = 60.4.
  const m1 = inputs.meters.find((m) => m.meter === 'meter-1')!
  const jul = billMonths(inputs.firstBillMonth, inputs.bills, inputs.billEndDay).find((b) => b.month === 7)!
  it('matches the hand calculation', () => {
    expect(netInches(inputs, 6, 0.5)).toBeCloseTo(4.7, 6)
    expect(billInches(inputs, 7, () => 0.5)).toBeCloseTo(4.4775, 6)
    const n = meterNeed(inputs, cases.lean, m1, jul, null)
    expect(n.turf).toBeCloseTo(176.6, 1)
    expect(n.drip).toBeCloseTo(60.4, 1)
    expect(n.kgal).toBe(237)
  })
  it('adds seeding water only to the bill that ends the month after seeding', () => {
    // 3 weeks of October at plant factor 1.0 instead of 0.5: 21 / 31 x 5.2 x 0.5 = 1.761 in.
    expect(seedingInches(inputs, cases.lean, 2027, 11)).toBeCloseTo(1.7613, 3)
    expect(seedingInches(inputs, cases.lean, 2027, 10)).toBe(0)
  })
  it('caps drip at the drip part of today\'s use in the cautious case only', () => {
    const m4 = inputs.meters.find((m) => m.meter === 'meter-4')!
    expect(meterNeed(inputs, cases.cautious, m4, jul, 36).drip).toBeLessThanOrEqual(36)
    expect(meterNeed(inputs, cases.lean, m4, jul, 1).drip).toBeGreaterThan(1)
  })
})

describe('pricing the modeled bills', () => {
  const lean = ok(runNeedModel(inputs, cases.lean, rates, history))
  it('prices meter 1, July 2027 the same as the hand calculation ($2,628.20)', () => {
    // Winter average from the modeled Dec to Feb bills: (43 + 32 + 45) / 3 = 40. Allowance 37 above the included 3.
    // 37 x 6.84 + 20 x 10.28 + 177 x 10.58 = 2,331.34; drought 234 x 0.13 = 30.42; Superfund 1.54; service 56.94;
    // tax 8.29% = 200.64; fee 7.32. Total 2,628.20.
    const b = lean.bills.find((x) => x.month === 7)!.meters.find((m) => m.meter === 'meter-1')!
    expect(b.kgal).toBe(237)
    expect(b.winterAverageKgal).toBe(40)
    expect(b.slices).toEqual({ included: 3, base: 37, tier1: 20, tier2: 177 })
    expect(b.total).toBeCloseTo(2628.2, 2)
  })
  it('prices December to February with last winter\'s average and March on with the modeled winter', () => {
    const m1 = (month: number) => lean.bills.find((x) => x.month === month)!.meters.find((m) => m.meter === 'meter-1')!
    expect(m1(12).winterAverageKgal).toBe(126) // (104 + 115 + 159) / 3, the bills ending Dec 2025 to Feb 2026
    expect(m1(3).winterAverageKgal).toBe(40)
  })
  it('uses today\'s rates through January 2027 and the 2027 rates from February', () => {
    expect(lean.bills.find((x) => x.month === 1)!.rate.applies_from_period_end).toBe('2026-05-13')
    expect(lean.bills.find((x) => x.month === 2)!.rate.applies_from_period_end).toBe('2027-02-01')
  })
  it('puts every gallon in exactly one price step', () => {
    for (const b of lean.bills) for (const m of b.meters) expect(m.slices.included + m.slices.base + m.slices.tier1 + m.slices.tier2).toBeCloseTo(m.kgal, 6)
  })
  it('matches the published analysis totals', () => {
    expect(lean.kgal).toBe(3243)
    expect(lean.total).toBeCloseTo(36075.54, 0)
    const cautious = ok(runNeedModel(inputs, cases.cautious, rates, history))
    expect(cautious.kgal).toBe(4374)
    expect(cautious.total).toBeCloseTo(46148.83, 0)
    expect(cautious.byMeter['meter-3'].kgal).toBe(213)
  })
  it('compares with today\'s water less the entry turf', () => {
    const today = ok(runTodaysPace(inputs, rates, history))
    expect(today.kgal).toBe(6359)
    expect(today.total).toBeGreaterThan(lean.total)
  })
})
