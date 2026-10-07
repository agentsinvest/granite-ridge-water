// "What if" scenarios: a baseline year of read periods plus a list of changes. Pure: no UI imports, no I/O.
//
// Changes apply in sequence, not added: two 20% cuts on the same water leave 64% of it (a 36% cut). Turning a meter
// off leaves no water, so any later change on that meter saves nothing more. The City's block 1 allowance comes from
// December to February use, so a scenario is priced as if its changes had been in place a full year: the allowance is
// recalculated from the scenario's own winter periods. The baseline is priced the same way so the two compare fairly.

import { calculateBill, type RatePeriod, type ReadPeriod } from './billing'

export type Change =
  | { kind: 'turn_down'; meters: string[]; percent: number; months: number[] }
  | { kind: 'shutoff'; meters: string[]; months: number[] }
  | { kind: 'off'; meters: string[] }
  | { kind: 'remove_gallons'; meter: string; gallonsPerYear: number; label: string }

/** Read periods per meter (usage in thousand gallons), normally the latest 12. */
export type Baseline = Record<string, ReadPeriod[]>

export type PeriodResult = { start: string; end: string; baseKgal: number; newKgal: number; baseCost: number; newCost: number }
export type MeterResult = { meter: string; baseKgal: number; newKgal: number; baseCost: number; newCost: number; periods: PeriodResult[] }
export type ScenarioResult =
  | { ok: true; meters: MeterResult[]; baseKgal: number; newKgal: number; baseCost: number; newCost: number }
  | { ok: false; reason: string }

const r2 = (x: number) => Math.round(x * 100) / 100

/** Month a read period mostly falls in (1 to 12): the month of its midpoint. */
export function periodMonth(p: { start: string; end: string }): number {
  const mid = (Date.parse(`${p.start}T12:00:00Z`) + Date.parse(`${p.end}T12:00:00Z`)) / 2
  return new Date(mid).getUTCMonth() + 1
}

const days = (p: { start: string; end: string }) => Math.round((Date.parse(p.end) - Date.parse(p.start)) / 86400000) + 1

const applies = (months: number[], m: number) => months.length === 0 || months.includes(m)

/** Thousand gallons for one meter's period after every change, in order. */
export function applyChanges(meter: string, p: ReadPeriod, changes: Change[]): number {
  let kgal = p.usage ?? 0
  const m = periodMonth(p)
  for (const c of changes) {
    if (c.kind === 'remove_gallons') {
      if (c.meter === meter) kgal = Math.max(kgal - (c.gallonsPerYear / 1000) * (days(p) / 365), 0)
    } else if (c.meters.includes(meter)) {
      if (c.kind === 'off') kgal = 0
      else if (c.kind === 'shutoff' && applies(c.months, m)) kgal = 0
      else if (c.kind === 'turn_down' && applies(c.months, m)) kgal = kgal * (1 - c.percent / 100)
    }
  }
  return kgal
}

/** Steady-state block 1 allowance from the December, January, and February periods in the list. */
export function steadyAllowanceKgal(periods: { end: string; kgal: number }[], includedKgal: number): number | null {
  const winter = [12, 1, 2].map((mo) => periods.find((p) => Number(p.end.slice(5, 7)) === mo)?.kgal ?? null)
  if (winter.some((v) => v === null)) return null
  return Math.max(Math.round((winter as number[]).reduce((a, b) => a + b, 0) / 3) - includedKgal, 0)
}

export function priceYear(meter: string, periods: { start: string; end: string; kgal: number }[], rate: RatePeriod): number[] | string {
  const open: RatePeriod = { ...rate, applies_from_period_end: '0000-01-01', applies_to_period_end: null }
  const allowance = steadyAllowanceKgal(periods, rate.included_kgal_per_bill.value)
  if (allowance === null) return `${meter} is missing a December, January, or February read period`
  const out: number[] = []
  for (const p of periods) {
    const bill = calculateBill(meter, p.start, p.end, Math.round(p.kgal * 1000), [open], [], allowance)
    if (!bill.ok) return `${meter}: ${bill.reason}`
    out.push(bill.total)
  }
  return out
}

export function runScenario(baseline: Baseline, changes: Change[], rate: RatePeriod): ScenarioResult {
  const meters: MeterResult[] = []
  for (const [meter, periods] of Object.entries(baseline)) {
    if (periods.some((p) => p.usage === null)) return { ok: false, reason: `${meter} has a read period with no usage` }
    const base = periods.map((p) => ({ start: p.start, end: p.end, kgal: p.usage as number }))
    const next = periods.map((p) => ({ start: p.start, end: p.end, kgal: applyChanges(meter, p, changes) }))
    const baseCost = priceYear(meter, base, rate)
    const newCost = priceYear(meter, next, rate)
    if (typeof baseCost === 'string') return { ok: false, reason: baseCost }
    if (typeof newCost === 'string') return { ok: false, reason: newCost }
    const rows = periods.map((p, i) => ({ start: p.start, end: p.end, baseKgal: base[i].kgal, newKgal: next[i].kgal, baseCost: baseCost[i], newCost: newCost[i] }))
    meters.push({
      meter,
      baseKgal: rows.reduce((s, r) => s + r.baseKgal, 0),
      newKgal: rows.reduce((s, r) => s + r.newKgal, 0),
      baseCost: r2(rows.reduce((s, r) => s + r.baseCost, 0)),
      newCost: r2(rows.reduce((s, r) => s + r.newCost, 0)),
      periods: rows,
    })
  }
  return {
    ok: true,
    meters,
    baseKgal: meters.reduce((s, m) => s + m.baseKgal, 0),
    newKgal: meters.reduce((s, m) => s + m.newKgal, 0),
    baseCost: r2(meters.reduce((s, m) => s + m.baseCost, 0)),
    newCost: r2(meters.reduce((s, m) => s + m.newCost, 0)),
  }
}

/** The latest `n` read periods for each meter, all ending on the same dates. */
export function latestBaseline(all: Record<string, ReadPeriod[]>, meters: string[], n = 12): Baseline {
  return Object.fromEntries(meters.map((m) => [m, [...(all[m] ?? [])].sort((a, b) => a.end.localeCompare(b.end)).slice(-n)]))
}

/** Same-percent, all-year cut on the chosen meters that brings the yearly cost down to `target`, or null if none can. */
export function cutToReach(baseline: Baseline, meters: string[], target: number, rate: RatePeriod): number | null {
  const cost = (pct: number) => {
    const r = runScenario(baseline, [{ kind: 'turn_down', meters, percent: pct, months: [] }], rate)
    return r.ok ? r.newCost : null
  }
  const at0 = cost(0)
  const at100 = cost(100)
  if (at0 === null || at100 === null) return null
  if (at0 <= target) return 0
  if (at100 > target) return null
  let [lo, hi] = [0, 100]
  for (let i = 0; i < 30; i++) {
    const mid = (lo + hi) / 2
    if ((cost(mid) as number) > target) lo = mid
    else hi = mid
  }
  return hi
}

/** Simple payback in months and 5-year net for a one-time cost plus yearly cost against yearly savings. */
export function payback(upfront: number, annualCost: number, annualSavings: number, years = 5): { months: number | null; net: number } {
  const yearly = annualSavings - annualCost
  return { months: yearly > 0 ? (upfront / yearly) * 12 : null, net: r2(yearly * years - upfront) }
}
