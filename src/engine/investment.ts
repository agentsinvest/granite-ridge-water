// "Is it worth it?" math for one change on one or more meters. Pure: no UI imports, no I/O.
// Savings come from re-pricing each read period with calculateBill, so blocks, the winter allowance, fees, and taxes
// are all applied the way the City bills them, not from a flat dollars-per-gallon guess.

import { calculateBill, type RatePeriod, type ReadPeriod } from './billing'

export type Effect = { type: 'percent_reduction'; value: number } | { type: 'gallons_per_month'; value: number }

export type MeterYear = {
  meter: string
  from: string
  to: string
  kgal: number
  cost: number
  /** Cost of the same periods with no water at all: the floor no change can go below. */
  floorCost: number
}

export type PriceResult = { ok: true; years: MeterYear[] } | { ok: false; reason: string }

const round2 = (x: number) => Math.round(x * 100) / 100

/** A rate that prices any period, so a past year of water can be priced at today's rate. */
export function asCurrent(rate: RatePeriod): RatePeriod {
  return { ...rate, applies_from_period_end: '0000-01-01', applies_to_period_end: null }
}

/** The last `count` read periods with known usage, oldest first. */
export function lastPeriods(periods: ReadPeriod[], count = 12): ReadPeriod[] {
  return [...periods]
    .filter((p) => p.usage !== null)
    .sort((a, b) => a.end.localeCompare(b.end))
    .slice(-count)
}

/** Apply an effect to read-period usage (thousand gallons). Never goes below zero. */
export function applyEffect(periods: ReadPeriod[], effect: Effect | null): ReadPeriod[] {
  if (!effect) return periods
  return periods.map((p) => {
    if (p.usage === null) return p
    const usage = effect.type === 'percent_reduction' ? p.usage * (1 - effect.value / 100) : p.usage - effect.value / 1000
    return { ...p, usage: Math.max(usage, 0) }
  })
}

/**
 * Price one meter's last 12 read periods at `rate`, with the effect applied to every read period. Applying it to the
 * winter periods too means the winter allowance resets to the lower use, which is where a permanent change settles
 * after its first December to February.
 */
export function priceMeterYear(meter: string, allPeriods: ReadPeriod[], rate: RatePeriod, effect: Effect | null): { ok: true; year: MeterYear } | { ok: false; reason: string } {
  const window = lastPeriods(allPeriods)
  if (window.length < 12) return { ok: false, reason: `${meter} has only ${window.length} read periods with known usage; 12 are needed` }
  const rates = [asCurrent(rate)]
  const changed = applyEffect(allPeriods, effect)
  const zeroed = applyEffect(allPeriods, { type: 'percent_reduction', value: 100 })
  let cost = 0
  let floorCost = 0
  let kgal = 0
  for (const p of window) {
    const after = changed.find((c) => c.end === p.end)!.usage as number
    const r = calculateBill(meter, p.start, p.end, Math.round(after * 1000), rates, changed)
    const z = calculateBill(meter, p.start, p.end, 0, rates, zeroed)
    if (!r.ok) return { ok: false, reason: `${meter}, period ending ${p.end}: ${r.reason}` }
    if (!z.ok) return { ok: false, reason: `${meter}, period ending ${p.end}: ${z.reason}` }
    cost += r.total
    floorCost += z.total
    kgal += after
  }
  return { ok: true, year: { meter, from: window[0].start, to: window.at(-1)!.end, kgal, cost: round2(cost), floorCost: round2(floorCost) } }
}

export type Costs = { upfront: number; annual: number; lifespanYears: number | null }

export type Outcome = {
  baselineCost: number
  afterCost: number
  baselineKgal: number
  afterKgal: number
  /** Lower bills per year. */
  annualSavings: number
  /** Lower bills minus the investment's own yearly cost. */
  netAnnual: number
  /** null when it never pays back. */
  paybackMonths: number | null
  fiveYearNet: number
  lifetimeNet: number | null
  /** Most this meter set could save per year if it used no water at all. */
  maxAnnualSavings: number
}

export function outcome(baseline: MeterYear[], after: MeterYear[], costs: Costs): Outcome {
  const sum = (xs: MeterYear[], k: 'cost' | 'kgal' | 'floorCost') => xs.reduce((s, x) => s + x[k], 0)
  const baselineCost = round2(sum(baseline, 'cost'))
  const afterCost = round2(sum(after, 'cost'))
  const annualSavings = round2(baselineCost - afterCost)
  const netAnnual = round2(annualSavings - costs.annual)
  const net = (years: number) => round2(netAnnual * years - costs.upfront)
  return {
    baselineCost,
    afterCost,
    baselineKgal: sum(baseline, 'kgal'),
    afterKgal: sum(after, 'kgal'),
    annualSavings,
    netAnnual,
    paybackMonths: netAnnual > 0 ? (costs.upfront / netAnnual) * 12 : null,
    fiveYearNet: net(5),
    lifetimeNet: costs.lifespanYears === null ? null : net(costs.lifespanYears),
    maxAnnualSavings: round2(baselineCost - sum(baseline, 'floorCost')),
  }
}

export type Evaluation = { ok: true; byMeter: { baseline: MeterYear; after: MeterYear }[]; result: Outcome } | { ok: false; reason: string }

export function evaluate(meters: string[], periods: Record<string, ReadPeriod[]>, rate: RatePeriod, effect: Effect, costs: Costs): Evaluation {
  if (meters.length === 0) return { ok: false, reason: 'choose at least one meter' }
  const byMeter: { baseline: MeterYear; after: MeterYear }[] = []
  for (const m of meters) {
    const b = priceMeterYear(m, periods[m] ?? [], rate, null)
    if (!b.ok) return b
    const a = priceMeterYear(m, periods[m] ?? [], rate, effect)
    if (!a.ok) return a
    byMeter.push({ baseline: b.year, after: a.year })
  }
  return { ok: true, byMeter, result: outcome(byMeter.map((x) => x.baseline), byMeter.map((x) => x.after), costs) }
}

/**
 * Smallest percent cut in water that pays back the investment within `years`, to 0.1%. null when even using no water
 * at all would not. Savings rise with the cut, so a bisection is exact enough.
 */
export function breakEvenPercent(meters: string[], periods: Record<string, ReadPeriod[]>, rate: RatePeriod, costs: Costs, years: number): number | null {
  const net = (pct: number) => {
    const e = evaluate(meters, periods, rate, { type: 'percent_reduction', value: pct }, costs)
    return e.ok ? e.result.netAnnual * years - costs.upfront : null
  }
  const top = net(100)
  if (top === null || top < 0) return null
  if ((net(0) ?? -1) >= 0) return 0
  let lo = 0
  let hi = 100
  while (hi - lo > 0.05) {
    const mid = (lo + hi) / 2
    if ((net(mid) as number) >= 0) hi = mid
    else lo = mid
  }
  return Math.ceil(hi * 10) / 10
}
