import { describe, expect, it } from 'vitest'
import { decomposeYears, filterBills, fixedPart, summarize, type BillLike } from '../src/engine/history'
import { buildData } from '../scripts/build-data'
import { splitUsageCharge, type RatePeriod, type ReadPeriod } from '../src/engine/billing'

const bill = (meter: string, date: string, gallons: number | null, total: number, service: number): BillLike => ({
  meter, bill_date: date, gallons, printed_total: total, lineItems: [{ name: 'Service charge', amount: service }, { name: 'Excess usage charge', amount: total - service }],
})

describe('decomposeYears', () => {
  it('splits a change into volume, price, and fixed effects that add up exactly', () => {
    // 2024: 10,000 gal, $100 total, $20 fixed -> $8 per thousand variable.
    // 2025: 12,000 gal, $140 total, $26 fixed -> $9.50 per thousand variable.
    const d = decomposeYears([bill('m', '2024-03-01', 10000, 100, 20), bill('m', '2025-03-01', 12000, 140, 26)], '2024', '2025')
    expect(d.volume).toBe(16) // 2,000 gal x $0.008
    expect(d.fixed).toBe(6)
    expect(d.price).toBe(18) // ($0.0095 - $0.008) x 12,000
    expect(d.volume + d.price + d.fixed).toBeCloseTo(d.endTotal - d.startTotal, 10)
  })
  it('only compares meter-months present in both years', () => {
    const d = decomposeYears([bill('m', '2024-03-01', 1, 1, 0), bill('m', '2025-04-01', 1, 1, 0)], '2024', '2025')
    expect(d.matched).toBe(0)
  })
  it('adds up exactly on the real bills', () => {
    const data = buildData()
    const d = decomposeYears(data.bills, '2024', '2025')
    expect(d.matched).toBeGreaterThan(20)
    expect(d.volume + d.price + d.fixed).toBeCloseTo(d.endTotal - d.startTotal, 1)
  })
})

describe('filterBills and summarize', () => {
  const list = [bill('a', '2025-01-10', 1000, 50, 10), bill('b', '2025-06-10', null, 70, 10), bill('a', '2026-01-10', 3000, 90, 10)]
  it('filters by bill date range and meter', () => {
    expect(filterBills(list, { from: '2025-01-01', to: '2025-12-31', meters: null })).toHaveLength(2)
    expect(filterBills(list, { from: null, to: null, meters: ['a'] })).toHaveLength(2)
  })
  it('totals every bill but prices per gallon only on bills with gallons', () => {
    const s = summarize(list)
    expect(s.total).toBe(210)
    expect(s.gallons).toBe(4000)
    expect(s.costPerKgal).toBe(35) // (50 + 90) / 4
    expect(fixedPart(list[0])).toBe(10)
  })
})

describe('yearly history by meter (data/history/by-meter-year.md)', () => {
  const d = buildData()
  const rates = d.rates as unknown as RatePeriod[]
  const rows = d.meterYears!.rows
  it('has one row per meter per year', () => {
    const keys = rows.map((r) => `${r.year} ${r.meter}`)
    expect(new Set(keys).size).toBe(keys.length)
  })
  it('2026 gallons equal the 2026 bills on file for every meter', () => {
    for (const r of rows.filter((x) => x.year === 2026)) {
      const bills = d.bills.filter((b) => b.meter === r.meter && b.bill_date.startsWith('2026'))
      expect(Math.round(bills.reduce((s, b) => s + (b.gallons ?? 0), 0) / 1000)).toBe(r.kgal)
    }
  })
  it('2026 peak surcharge equals the billing engine split of the 2026 bills, within $1', () => {
    for (const r of rows.filter((x) => x.year === 2026)) {
      const bills = d.bills.filter((b) => b.meter === r.meter && b.bill_date.startsWith('2026'))
      const premium = bills.reduce((s, b) => {
        const usage = b.lineItems.find((l) => l.name === 'Excess usage charge')?.amount ?? null
        const split = usage === null ? null : splitUsageCharge(b.meter, b.period_start!, b.period_end!, b.gallons!, usage, rates, d.billingPeriods[b.meter].rows as ReadPeriod[])
        expect(split).not.toBeNull()
        return s + (split?.premium ?? 0)
      }, 0)
      expect(Math.abs(premium - r.peakSurcharge!)).toBeLessThan(1)
    }
  })
})
