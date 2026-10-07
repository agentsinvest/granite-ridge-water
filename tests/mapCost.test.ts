import { describe, expect, it } from 'vitest'
import { latestBillMonth, meterCostPair, meterYearCost, stationRanges, zoneMeters } from '../src/engine/mapCost'

const bill = (meter: string, bill_date: string, printed_total: number, reconciled = 'pass') => ({ meter, bill_date, printed_total, reconciled })

const bills = [
  bill('meter-1', '2025-01-27', 100),
  bill('meter-1', '2025-03-27', 200.5, 'unpriced'),
  bill('meter-1', '2026-01-27', 300),
  bill('meter-1', '2026-02-26', 400.25),
  bill('meter-2', '2026-03-27', 50),
]

describe('meterYearCost', () => {
  it('sums printed totals and lists missing bill months instead of filling them', () => {
    const c = meterYearCost(bills, 'meter-1', '2025')
    expect(c.total).toBe(300.5)
    expect(c.bills).toBe(2)
    expect(c.missingMonths).toEqual([2, 4, 5, 6, 7, 8, 9, 10, 11, 12])
    expect(c.unchecked).toBe(1)
  })
  it('counts the current year only through the month given', () => {
    expect(meterYearCost(bills, 'meter-1', '2026', 3)).toMatchObject({ total: 700.25, bills: 2, missingMonths: [3], throughMonth: 3 })
  })
})

describe('meterCostPair', () => {
  it('uses the latest bill on any meter for year to date and the year before it as the full year', () => {
    expect(latestBillMonth(bills)).toEqual({ year: '2026', month: 3 })
    const p = meterCostPair(bills, 'meter-1')!
    expect(p.ytd).toMatchObject({ year: '2026', total: 700.25, throughMonth: 3 })
    expect(p.prior).toMatchObject({ year: '2025', total: 300.5, throughMonth: 12 })
  })
  it('returns null with no bills', () => {
    expect(meterCostPair([], 'meter-1')).toBeNull()
  })
})

const stations = [
  { station: 'C1', meter: 'meter-1', program: null },
  { station: 'C2', meter: 'meter-1', program: null },
  { station: 'C8', meter: 'meter-2', program: null },
  { station: 'C13', meter: 'meter-2', program: null },
  { station: 'A1', meter: 'meter-3', program: 'Off' },
  { station: 'A4', meter: 'meter-3', program: 'B' },
  { station: 'B1', meter: null, program: null },
]

describe('zoneMeters', () => {
  it('finds every meter a zone is on and what shares them', () => {
    expect(zoneMeters(['C1', 'C8'], stations)).toEqual({ meters: ['meter-1', 'meter-2'], unknownMeter: [], sharedWith: ['C2', 'C13'], wholeMeter: false })
  })
  it('is the whole meter only when nothing else that is on shares it', () => {
    expect(zoneMeters(['A4'], stations).wholeMeter).toBe(true)
    expect(zoneMeters(['C1'], stations).wholeMeter).toBe(false)
  })
  it('reports stations with no meter on file and never calls that zone a whole meter', () => {
    expect(zoneMeters(['B1'], stations)).toEqual({ meters: [], unknownMeter: ['B1'], sharedWith: [], wholeMeter: false })
  })
})

describe('stationRanges', () => {
  it('collapses runs of three or more', () => {
    expect(stationRanges(['C15', 'C1', 'C2', 'C3', 'C4', 'C5', 'C6', 'C7', 'C14'])).toBe('C1 to C7, C14, C15')
    expect(stationRanges(['B1', 'B2', 'A4'])).toBe('A4, B1, B2')
  })
})
