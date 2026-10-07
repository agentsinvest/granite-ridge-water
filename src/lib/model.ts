// Numbers several screens share, derived from the data and the engine. No React here.
import type { SiteData } from '../../scripts/site-data'
import { currentRate, type RatePeriod, type ReadPeriod } from '../engine/billing'
import { latestBaseline, payback, runScenario, type Baseline, type Change } from '../engine/scenarios'
import { costFlags, type CostedFlag } from '../components/LeakFlags'

export type Model = ReturnType<typeof buildModel>

export function buildModel(data: SiteData) {
  const meters = data.meters.map((m) => m.id)
  const rates = data.rates as unknown as RatePeriod[]
  const byStart = [...data.rates].sort((a, b) => a.applies_from_period_end.localeCompare(b.applies_from_period_end))
  // Today's prices: the latest rate actually seen on bills. A recommended rate prices future scenarios only.
  const latestRate = currentRate(rates)
  const nextRate = (byStart.filter((r) => r.status === 'recommended').at(-1) ?? null) as (RatePeriod & { id: string; effective_start: string | Date | null }) | null
  const periods: Record<string, ReadPeriod[]> = Object.fromEntries(meters.map((m) => [m, (data.billingPeriods[m]?.rows ?? []) as ReadPeriod[]]))
  const baseline = latestBaseline(periods, meters)
  const site = data.config.site as {
    annual_target_usd: { value: number; source: string }
    experiment_check: Record<'min_days_each_side' | 'min_hours_per_day' | 'share_of_target_for_success' | 'noise_percent', { value: number; source: string }>
  }
  const target = site.annual_target_usd.value
  const lastBills = meters.flatMap((m) => data.bills.filter((b) => b.meter === m).sort((a, b) => a.bill_date.localeCompare(b.bill_date)).slice(-12))
  const runRate = lastBills.reduce((s, b) => s + b.printed_total, 0)
  const runRateRange = lastBills.length ? [lastBills.map((b) => b.bill_date).sort()[0], lastBills.map((b) => b.bill_date).sort().at(-1)!] : null
  const greenspaceMeters = new Set(
    data.meters.filter((m) => (m.areas_served ?? []).some((a) => (data.areas.rows.find((r) => r['Area id'] === a)?.['Turf sq ft'] ?? 0) > 0)).map((m) => m.id),
  )
  const flags = costFlags(data)
  const baseRun = latestRate ? runScenario(baseline, [], latestRate) : null
  return { meters, rates, latestRate, nextRate, periods, baseline, target, site, lastBills, runRate, runRateRange, greenspaceMeters, flags, baseRun }
}

export type Move = {
  id: string
  kind: 'leak' | 'option' | 'investment'
  title: string
  why: string
  meters: string[]
  annual: { low: number; high: number } | null
  soFar: { low: number; high: number } | null
  upfront: number | null
  upfrontSource: string
  paybackMonths: number | null
  effort: string | null
  confidence: string
  greenspace: boolean
  risks: string[]
  howToTest?: string
  link: string
  change?: Change
}

export const RISK = {
  trees: 'Trees in this zone need deep watering even if surrounding plants are turned off. Losing a mature tree costs far more than the water saved.',
  turf: 'Turf that gets too little water goes brown and dormant and takes weeks to recover once watering returns. Ask the landscaper how far the park turf can be cut before it stresses.',
  unknownTrees: 'It is not yet known whether these meters water trees. Check before cutting deeply.',
}

export function optionChange(o: SiteData['options'][number]): Change {
  return o.change.kind === 'shutoff'
    ? { kind: 'shutoff', meters: o.meters, months: o.change.months }
    : { kind: 'turn_down', meters: o.meters, percent: o.change.percent ?? 0, months: o.change.months }
}

export function savingsOf(baseline: Baseline, rate: RatePeriod, changes: Change[]): number | null {
  const r = runScenario(baseline, changes, rate)
  return r.ok ? r.baseCost - r.newCost : null
}

/** Every candidate move with what it saves. Ranking happens on the screen so the greenspace toggle can filter. */
export function buildMoves(data: SiteData, m: Model): Move[] {
  const moves: Move[] = []
  for (const { flag, cost } of m.flags as CostedFlag[]) {
    moves.push({
      id: flag.id,
      kind: 'leak',
      title: `Fix: ${flag.title.replace(/^Meter (\d+): (.)/, (_, n: string, c: string) => `meter ${n}, ${c.toLowerCase()}`)}`,
      why: flag.summary,
      meters: [flag.meter],
      annual: cost?.perYear ? { low: cost.perYear.low, high: cost.perYear.high } : null,
      soFar: cost && cost.low !== null && cost.high !== null ? { low: cost.low, high: cost.high } : null,
      upfront: null,
      upfrontSource: 'Repair cost needs a quote',
      paybackMonths: null,
      effort: null,
      confidence: flag.excess_water?.confidence ?? 'low',
      greenspace: false,
      risks: [],
      link: `#problems/${flag.id}`,
    })
  }
  for (const o of data.options) {
    const change = optionChange(o)
    const saved = m.latestRate ? savingsOf(m.baseline, m.latestRate, [change]) : null
    const risks: string[] = []
    if (o.touches_greenspace) risks.push(RISK.turf)
    if (o.has_trees === true) risks.push(RISK.trees)
    if (o.has_trees === null) risks.push(RISK.unknownTrees)
    moves.push({
      id: o.id,
      kind: 'option',
      title: o.title,
      why: o.why,
      meters: o.meters,
      annual: saved === null ? null : { low: saved, high: saved },
      soFar: null,
      upfront: o.upfront_cost,
      upfrontSource: o.upfront_cost_source,
      paybackMonths: saved !== null && o.upfront_cost !== null ? payback(o.upfront_cost, 0, saved).months : null,
      effort: o.effort,
      confidence: o.confidence,
      greenspace: o.touches_greenspace,
      risks,
      howToTest: o.how_to_test,
      link: `#calculator?tab=whatif&o=${o.id}`,
      change,
    })
  }
  for (const inv of data.investments as { id: string; name: string; notes: string; confidence: string; upfront_cost_per_unit: number | null; requires_confirmation?: string }[]) {
    moves.push({
      id: inv.id,
      kind: 'investment',
      title: inv.name,
      why: inv.notes + (inv.requires_confirmation ? ` ${inv.requires_confirmation}.` : ''),
      meters: [],
      annual: null,
      soFar: null,
      upfront: inv.upfront_cost_per_unit,
      upfrontSource: inv.upfront_cost_per_unit === null ? 'Needs a quote' : 'Investment catalog',
      paybackMonths: null,
      effort: null,
      confidence: inv.confidence,
      greenspace: false,
      risks: [],
      link: '#plan',
    })
  }
  return moves
}

/** Ranked moves: only options with known savings and cost, best savings first, then lower effort. */
export function rankMoves(moves: Move[], includeGreenspace: boolean): { ranked: Move[]; backfires: Move[]; leaks: Move[]; needsQuote: Move[]; hiddenGreenspace: number } {
  const sure = { high: 0, medium: 1, low: 2 } as Record<string, number>
  const effortRank = { low: 0, medium: 1, high: 2 } as Record<string, number>
  const visible = moves.filter((x) => includeGreenspace || !x.greenspace)
  return {
    leaks: visible
      .filter((x) => x.kind === 'leak')
      .sort((a, b) => (sure[a.confidence] ?? 2) - (sure[b.confidence] ?? 2) || (b.annual?.high ?? b.soFar?.high ?? -1) - (a.annual?.high ?? a.soFar?.high ?? -1)),
    backfires: visible.filter((x) => x.kind === 'option' && x.annual !== null && x.annual.high <= 0),
    ranked: visible
      .filter((x) => x.kind === 'option' && x.annual !== null && x.annual.high > 0 && x.upfront !== null)
      .sort((a, b) => b.annual!.high - a.annual!.high || (effortRank[a.effort ?? 'high'] ?? 2) - (effortRank[b.effort ?? 'high'] ?? 2)),
    needsQuote: visible.filter((x) => x.kind === 'investment' || (x.kind === 'option' && (x.annual === null || x.upfront === null))),
    hiddenGreenspace: moves.filter((x) => x.greenspace).length - visible.filter((x) => x.greenspace).length,
  }
}

export const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export function monthsText(months: number[]): string {
  if (months.length === 0 || months.length === 12) return 'all year'
  return months.map((n) => MONTHS[n - 1]).join(', ')
}
