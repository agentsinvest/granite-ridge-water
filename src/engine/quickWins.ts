// "Quick wins" plan: no-construction levers stepped by year, from Jennifer's Zone Plan Model. Pure: no UI imports, no I/O.
//
// Each meter's water is split into turf and desert drip by its turf share. Leak repair and the smart controller cut all
// water; the turf and drip levers then set each part as a percent of today, month by month. Levers multiply, so they
// compound rather than add. The result is expressed as ordinary scenario changes and priced by runScenario, so the
// plan uses the same billing engine, winter allowance, fees, and taxes as every other number on the site.

import type { RatePeriod } from './billing'
import { periodMonth, runScenario, type Baseline, type Change, type ScenarioResult } from './scenarios'

export type YearLevers = {
  leakCutPercent: number
  controllerCutPercent: number
  stopOverseeding: boolean
  winterTurfPercent: number
  winterMonths: number[]
  octoberTurfPercent: number
  octoberMonths: number[]
  summerTurfPercent: number
  summerMonths: number[]
  dripPercent: number
}

/** Turf water in a month as a share of today's. */
export function turfFactor(month: number, l: YearLevers): number {
  if (l.summerMonths.includes(month)) return l.summerTurfPercent / 100
  if (l.stopOverseeding && l.winterMonths.includes(month)) return l.winterTurfPercent / 100
  if (l.stopOverseeding && l.octoberMonths.includes(month)) return l.octoberTurfPercent / 100
  return 1
}

/** A meter's water in a month as a share of today's, after every lever. */
export function meterFactor(month: number, turfShare: number, l: YearLevers): number {
  const mix = turfShare * turfFactor(month, l) + (1 - turfShare) * (l.dripPercent / 100)
  return (1 - l.leakCutPercent / 100) * (1 - l.controllerCutPercent / 100) * mix
}

/** The levers as scenario changes: one turn-down per meter for each group of months with the same factor. */
export function planChanges(meters: { id: string; turfShare: number }[], l: YearLevers): Change[] {
  const out: Change[] = []
  for (const m of meters) {
    const groups = new Map<number, number[]>()
    for (let mo = 1; mo <= 12; mo++) {
      const pct = Math.round((1 - meterFactor(mo, m.turfShare, l)) * 1e9) / 1e7
      groups.set(pct, [...(groups.get(pct) ?? []), mo])
    }
    for (const [pct, months] of groups) if (pct !== 0) out.push({ kind: 'turn_down', meters: [m.id], percent: pct, months })
  }
  return out
}

export type ProposedPrices = {
  usage_price: number
  tier1_surcharge: number
  tier1_limit_multiple_of_winter_average: number
  tier2_surcharge: number
  drought_per_kgal: number
  service_increase_percent: number
}

/**
 * A rate built from today's rate with proposed prices swapped in: the usage price below the winter allowance, a first
 * surcharge tier up to a multiple of the winter average, and a second tier above it. Service charges rise by the
 * proposed percent, rounded to the cent. Other fees and taxes stay as they are today.
 */
export function proposedRate(current: RatePeriod, p: ProposedPrices): RatePeriod {
  return {
    ...current,
    source: 'Proposed prices (not adopted)',
    fixed_charges: current.fixed_charges.map((f) => ({ ...f, amount: Math.round(f.amount * (1 + p.service_increase_percent / 100) * 100) / 100 })),
    volumetric: {
      blocks: [
        { block: 1, limit: 'winter_allowance', price: p.usage_price },
        { block: 2, limit: { winter_average_multiple: p.tier1_limit_multiple_of_winter_average }, price: p.usage_price + p.tier1_surcharge },
        { block: 3, limit: null, price: p.usage_price + p.tier2_surcharge },
      ],
    },
    fees: current.fees.map((f) => (f.name === 'Water drought' ? { ...f, amount: p.drought_per_kgal } : f)),
  }
}

export type TurfNeedInputs = { areaSqFt: number; plantFactor: number; efficiency: number; effectiveRainShare: number }

/** Thousand gallons the turf needs each month to stay green: max(0, ETo x PF - rain x share) x 0.623 / efficiency x area. */
export function turfNeedKgal(months: { eto: number | null; rain: number | null }[], t: TurfNeedInputs): (number | null)[] {
  return months.map((m) =>
    m.eto === null || m.rain === null ? null : (Math.max(0, m.eto * t.plantFactor - m.rain * t.effectiveRainShare) * 0.623 * t.areaSqFt) / t.efficiency / 1000,
  )
}

/** Thousand gallons going to turf in the read period(s) of a month, after the levers. */
export function turfWaterKgal(baseline: Baseline, meters: { id: string; turfShare: number }[], month: number, l: YearLevers | null): number {
  let total = 0
  for (const m of meters) {
    for (const p of baseline[m.id] ?? []) {
      if (periodMonth(p) !== month) continue
      const cut = l ? (1 - l.leakCutPercent / 100) * (1 - l.controllerCutPercent / 100) * turfFactor(month, l) : 1
      total += (p.usage ?? 0) * m.turfShare * cut
    }
  }
  return total
}

export type PlanYear = { year: number; levers: YearLevers; result: ScenarioResult }

export function runPlan(baseline: Baseline, meters: { id: string; turfShare: number }[], years: { year: number; levers: YearLevers }[], rate: RatePeriod): PlanYear[] {
  return years.map((y) => ({ ...y, result: runScenario(baseline, planChanges(meters, y.levers), rate) }))
}
