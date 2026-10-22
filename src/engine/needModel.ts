// Next-year need model: how much water the landscape needs for each coming City bill, and what those bills cost.
// Pure: no UI imports, no I/O.
//
// Need comes from weather and plants, not from past use: for each calendar month, inches needed = max(0, ETo x plant
// factor - rain x usable share). A City bill runs from mid-month to mid-month, so it takes the average of the two
// calendar months it spans. Inches become gallons over the lawn and drip areas, divided by sprinkler or drip efficiency.
// Each bill is then priced by calculateBill with the modeled bills appended to the meter's read history, so the modeled
// December to February bills set the winter average that prices the rest of the year, the same way the City does it.

import { blockSlices, calculateBill, selectRate, type LineItem, type RatePeriod, type ReadPeriod } from './billing'

export type NeedCaseInputs = {
  turfAreaSqFt: number
  bermudaPlantFactor: number
  ryePlantFactor: number
  seedingWeeks: number
  seedingPlantFactor: number
  turfEfficiency: number
  desertPlantFactor: number
  dripEfficiency: number
  /** Never let drip need go above the drip part of what the meter uses today. */
  capDripAtCurrentUse: boolean
}

export type NeedMeterInputs = { meter: string; turfShare: number; desertSqFt: number; dripShare: number; todayKept: number }

export type NeedInputs = {
  /** January to December: ETo and average rain, inches. */
  months: { eto: number; rain: number }[]
  gallonsPerInchSqFt: number
  rainShare: number
  ryeMonths: number[]
  seedingMonth: number
  /** First bill as YYYY-MM (the month the read period ends), and how many bills. */
  firstBillMonth: string
  bills: number
  billEndDay: number
  meters: NeedMeterInputs[]
}

export type Slices = { included: number; base: number; tier1: number; tier2: number }

export type MeterBill = {
  meter: string
  kgal: number
  turfKgal: number
  dripKgal: number
  /** Winter average (thousand gallons a bill) that sets this bill's price blocks, as the City rounds it. */
  winterAverageKgal: number
  slices: Slices
  lineItems: LineItem[]
  total: number
}

export type BillMonth = { year: number; month: number; start: string; end: string }
export type ModelBill = BillMonth & { meters: MeterBill[]; kgal: number; total: number; slices: Slices; rate: RatePeriod }
export type NeedResult = { bills: ModelBill[]; kgal: number; total: number; slices: Slices; byMeter: Record<string, { kgal: number; total: number }> }

const pad = (n: number) => String(n).padStart(2, '0')
const iso = (y: number, m: number, d: number) => `${y}-${pad(m)}-${pad(d)}`
const daysIn = (y: number, m: number) => new Date(Date.UTC(y, m, 0)).getUTCDate()

/** The bills in the window, oldest first, with typical read dates. */
export function billMonths(firstBillMonth: string, bills: number, endDay: number): BillMonth[] {
  const [y0, m0] = firstBillMonth.split('-').map(Number)
  return Array.from({ length: bills }, (_, i) => {
    const year = y0 + Math.floor((m0 - 1 + i) / 12)
    const month = ((m0 - 1 + i) % 12) + 1
    const py = month === 1 ? year - 1 : year
    const pm = month === 1 ? 12 : month - 1
    return { year, month, start: iso(py, pm, endDay + 1), end: iso(year, month, endDay) }
  })
}

const prevMonth = (m: number) => (m === 1 ? 12 : m - 1)

/** Inches of water a plant needs in a calendar month after usable rain, never below zero. */
export function netInches(inp: NeedInputs, month: number, plantFactor: number): number {
  const w = inp.months[month - 1]
  return Math.max(0, w.eto * plantFactor - w.rain * inp.rainShare)
}

/** Inches for a bill ending in `month`: the average of that month and the one before. */
export function billInches(inp: NeedInputs, month: number, plantFactorFor: (calendarMonth: number) => number): number {
  const a = prevMonth(month)
  return (netInches(inp, a, plantFactorFor(a)) + netInches(inp, month, plantFactorFor(month))) / 2
}

/** Lawn plant factor in a calendar month: rye in the rye months, Bermuda otherwise. */
export const lawnFactor = (inp: NeedInputs, c: NeedCaseInputs) => (m: number) => (inp.ryeMonths.includes(m) ? c.ryePlantFactor : c.bermudaPlantFactor)

/** Extra inches for seeding, on the bill that ends the month after the seeding month. */
export function seedingInches(inp: NeedInputs, c: NeedCaseInputs, billYear: number, billMonth: number): number {
  if (billMonth !== (inp.seedingMonth % 12) + 1) return 0
  const year = billMonth === 1 ? billYear - 1 : billYear
  const w = inp.months[inp.seedingMonth - 1]
  return ((c.seedingWeeks * 7) / daysIn(year, inp.seedingMonth)) * w.eto * (c.seedingPlantFactor - c.bermudaPlantFactor)
}

/**
 * Thousand gallons a meter needs on one bill, split into lawn and drip. `lastYearKgal` is the meter's use on the same bill
 * last year; the cautious cap is its drip share of that.
 */
export function meterNeed(inp: NeedInputs, c: NeedCaseInputs, m: NeedMeterInputs, bill: BillMonth, lastYearKgal: number | null) {
  const lawnIn = billInches(inp, bill.month, lawnFactor(inp, c)) + seedingInches(inp, c, bill.year, bill.month)
  const turf = (lawnIn * inp.gallonsPerInchSqFt * c.turfAreaSqFt * m.turfShare) / c.turfEfficiency / 1000
  let drip = (billInches(inp, bill.month, () => c.desertPlantFactor) * inp.gallonsPerInchSqFt * m.desertSqFt) / c.dripEfficiency / 1000
  if (c.capDripAtCurrentUse && lastYearKgal !== null) drip = Math.min(drip, lastYearKgal * m.dripShare)
  return { turf, drip, kgal: Math.round(turf + drip) }
}

/** Use on the latest actual read period ending in each calendar month, keyed by month. */
export function lastYearByMonth(periods: ReadPeriod[]): Map<number, number> {
  const out = new Map<number, number>()
  for (const p of [...periods].filter((p) => p.usage !== null).sort((a, b) => a.end.localeCompare(b.end))) out.set(Number(p.end.slice(5, 7)), p.usage as number)
  return out
}

function slicesOf(rate: RatePeriod, kgal: number, allowance: number): Slices {
  const included = rate.included_kgal_per_bill.value
  const s = blockSlices(rate, Math.max(kgal - included, 0), allowance)
  return { included: Math.min(kgal, included), base: s[0]?.kgal ?? 0, tier1: s[1]?.kgal ?? 0, tier2: s.slice(2).reduce((a, b) => a + b.kgal, 0) }
}

const addSlices = (a: Slices, b: Slices): Slices => ({ included: a.included + b.included, base: a.base + b.base, tier1: a.tier1 + b.tier1, tier2: a.tier2 + b.tier2 })
const zero: Slices = { included: 0, base: 0, tier1: 0, tier2: 0 }
const r2 = (x: number) => Math.round(x * 100) / 100

/**
 * Price a set of modeled bills. `use[meter][i]` is thousand gallons on bill i. Each meter's modeled bills are appended to
 * its read history before pricing, so a modeled winter sets the allowance for the bills after it.
 */
export function priceBills(
  months: BillMonth[],
  use: Record<string, { kgal: number; turfKgal: number; dripKgal: number }[]>,
  rates: RatePeriod[],
  history: Record<string, ReadPeriod[]>,
): NeedResult | { error: string } {
  const bills: ModelBill[] = []
  for (const [i, b] of months.entries()) {
    const rate = selectRate(rates, b.end)
    if (!rate) return { error: `no City rate covers a bill ending ${b.end}` }
    const meters: MeterBill[] = []
    for (const [meter, rows] of Object.entries(use)) {
      const modeled: ReadPeriod[] = months.slice(0, i).map((x, j) => ({ start: x.start, end: x.end, usage: rows[j].kgal }))
      const reads = [...(history[meter] ?? []).filter((p) => p.end < months[0].start), ...modeled]
      const res = calculateBill(meter, b.start, b.end, rows[i].kgal * 1000, rates, reads)
      if (!res.ok) return { error: `${meter}, bill ending ${b.end}: ${res.reason}` }
      meters.push({
        meter,
        ...rows[i],
        winterAverageKgal: res.allowanceKgal + rate.included_kgal_per_bill.value,
        slices: slicesOf(rate, rows[i].kgal, res.allowanceKgal),
        lineItems: res.lineItems,
        total: res.total,
      })
    }
    bills.push({ ...b, rate, meters, kgal: meters.reduce((s, m) => s + m.kgal, 0), total: r2(meters.reduce((s, m) => s + m.total, 0)), slices: meters.reduce((s, m) => addSlices(s, m.slices), zero) })
  }
  const byMeter: NeedResult['byMeter'] = {}
  for (const b of bills) for (const m of b.meters) {
    byMeter[m.meter] ??= { kgal: 0, total: 0 }
    byMeter[m.meter].kgal += m.kgal
    byMeter[m.meter].total = r2(byMeter[m.meter].total + m.total)
  }
  return {
    bills,
    kgal: bills.reduce((s, b) => s + b.kgal, 0),
    total: r2(bills.reduce((s, b) => s + b.total, 0)),
    slices: bills.reduce((s, b) => addSlices(s, b.slices), zero),
    byMeter,
  }
}

/** Need for every meter and bill in the window, priced. */
export function runNeedModel(inp: NeedInputs, c: NeedCaseInputs, rates: RatePeriod[], history: Record<string, ReadPeriod[]>): NeedResult | { error: string } {
  const months = billMonths(inp.firstBillMonth, inp.bills, inp.billEndDay)
  const use = Object.fromEntries(
    inp.meters.map((m) => {
      const last = lastYearByMonth(history[m.meter] ?? [])
      return [m.meter, months.map((b) => {
        const today = last.get(b.month)
        const n = meterNeed(inp, c, m, b, today ?? null)
        return { kgal: n.kgal, turfKgal: n.turf, dripKgal: n.drip }
      })]
    }),
  )
  return priceBills(months, use, rates, history)
}

/** For comparison: the same water as each meter's latest actual bill for each month, less what no longer gets watered. */
export function runTodaysPace(inp: NeedInputs, rates: RatePeriod[], history: Record<string, ReadPeriod[]>): NeedResult | { error: string } {
  const months = billMonths(inp.firstBillMonth, inp.bills, inp.billEndDay)
  const use: Record<string, { kgal: number; turfKgal: number; dripKgal: number }[]> = {}
  for (const m of inp.meters) {
    const last = lastYearByMonth(history[m.meter] ?? [])
    const rows = []
    for (const b of months) {
      const v = last.get(b.month)
      if (v === undefined) return { error: `${m.meter} has no past bill ending in month ${b.month}` }
      rows.push({ kgal: Math.round(v * m.todayKept), turfKgal: 0, dripKgal: 0 })
    }
    use[m.meter] = rows
  }
  return priceBills(months, use, rates, history)
}
