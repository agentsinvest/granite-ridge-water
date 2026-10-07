import { describe, expect, it } from 'vitest'
import { currentRate, type RatePeriod, type ReadPeriod } from '../src/engine/billing'
import { applyEffect, breakEvenPercent, evaluate, outcome, priceMeterYear, type MeterYear } from '../src/engine/investment'
import { buildData } from '../scripts/build-data'

const data = buildData()
const rate = currentRate(data.rates as unknown as RatePeriod[])!
const periods = Object.fromEntries(Object.entries(data.billingPeriods).map(([k, v]) => [k, v.rows])) as Record<string, ReadPeriod[]>
const noCosts = { upfront: 0, annual: 0, lifespanYears: null }

describe('applyEffect', () => {
  const p: ReadPeriod[] = [
    { start: '2026-01-01', end: '2026-01-31', usage: 40 },
    { start: '2026-02-01', end: '2026-02-28', usage: null },
    { start: '2026-03-01', end: '2026-03-31', usage: 2 },
  ]
  it('cuts by a percent and leaves unknown usage unknown', () => {
    expect(applyEffect(p, { type: 'percent_reduction', value: 25 }).map((x) => x.usage)).toEqual([30, null, 1.5])
  })
  it('subtracts gallons per month and never goes below zero', () => {
    expect(applyEffect(p, { type: 'gallons_per_month', value: 5000 }).map((x) => x.usage)).toEqual([35, null, 0])
  })
})

describe('priceMeterYear', () => {
  it('prices the floor (no water at all) by hand for meter-4', () => {
    // No water: service 39.30 + tax 8.29% of 39.30 = 3.26 + other fees 7.32 = 49.88 a bill, 598.56 for 12 bills.
    const r = priceMeterYear('meter-4', periods['meter-4'], rate, null)
    expect(r.ok && r.year.floorCost).toBe(598.56)
  })
  it('using no water costs exactly the floor', () => {
    const r = priceMeterYear('meter-4', periods['meter-4'], rate, { type: 'percent_reduction', value: 100 })
    expect(r.ok && r.year.cost).toBe(r.ok && r.year.floorCost)
  })
  it('refuses a meter without 12 known read periods', () => {
    expect(priceMeterYear('meter-4', periods['meter-4'].slice(0, 5), rate, null).ok).toBe(false)
  })
})

describe('outcome', () => {
  const y = (cost: number, floorCost = 600): MeterYear => ({ meter: 'meter-4', from: 'a', to: 'b', kgal: 100, cost, floorCost })
  it('matches a hand calculation of payback and 5-year net', () => {
    // Saves 3,000 - 2,400 = 600 a year, minus 100 a year of subscription = 500 net.
    // Payback 6,000 / 500 = 12 years = 144 months. 5-year net 5 x 500 - 6,000 = -3,500. 15-year net 1,500.
    const o = outcome([y(3000)], [y(2400)], { upfront: 6000, annual: 100, lifespanYears: 15 })
    expect(o.annualSavings).toBe(600)
    expect(o.netAnnual).toBe(500)
    expect(o.paybackMonths).toBe(144)
    expect(o.fiveYearNet).toBe(-3500)
    expect(o.lifetimeNet).toBe(1500)
    expect(o.maxAnnualSavings).toBe(2400)
  })
  it('never pays back when yearly costs eat the savings', () => {
    expect(outcome([y(3000)], [y(2950)], { upfront: 6000, annual: 50, lifespanYears: null }).paybackMonths).toBeNull()
  })
})

describe('evaluate on real data', () => {
  it('savings rise with the cut and stop at the floor', () => {
    const s = [10, 20, 30, 100].map((pct) => {
      const e = evaluate(['meter-4'], periods, rate, { type: 'percent_reduction', value: pct }, noCosts)
      return e.ok ? e.result.annualSavings : NaN
    })
    expect(s[0]).toBeGreaterThan(0)
    expect(s[1]).toBeGreaterThan(s[0])
    expect(s[2]).toBeGreaterThan(s[1])
    const full = evaluate(['meter-4'], periods, rate, { type: 'percent_reduction', value: 100 }, noCosts)
    expect(full.ok && full.result.annualSavings).toBe(full.ok && full.result.maxAnnualSavings)
  })
  it('adds meters together', () => {
    const e = (ms: string[]) => evaluate(ms, periods, rate, { type: 'percent_reduction', value: 10 }, noCosts)
    const a = e(['meter-3'])
    const b = e(['meter-4'])
    const ab = e(['meter-3', 'meter-4'])
    expect(ab.ok && ab.result.annualSavings).toBeCloseTo((a.ok ? a.result.annualSavings : 0) + (b.ok ? b.result.annualSavings : 0), 2)
  })
  it('asks for a meter', () => {
    expect(evaluate([], periods, rate, { type: 'percent_reduction', value: 10 }, noCosts)).toEqual({ ok: false, reason: 'choose at least one meter' })
  })
})

describe('breakEvenPercent', () => {
  const costs = { upfront: 6000, annual: 0, lifespanYears: null }
  it('finds the smallest cut that pays back in time', () => {
    const pct = breakEvenPercent(['meter-4'], periods, rate, costs, 5)!
    const net = (p: number) => {
      const e = evaluate(['meter-4'], periods, rate, { type: 'percent_reduction', value: p }, costs)
      return e.ok ? e.result.fiveYearNet : NaN
    }
    expect(net(pct)).toBeGreaterThanOrEqual(0)
    expect(net(pct - 0.2)).toBeLessThan(0)
  })
  it('returns null when even no water would not pay back', () => {
    expect(breakEvenPercent(['meter-4'], periods, rate, { ...costs, upfront: 1_000_000 }, 5)).toBeNull()
  })
  it('returns 0 for a free change', () => {
    expect(breakEvenPercent(['meter-4'], periods, rate, noCosts, 5)).toBe(0)
  })
})
