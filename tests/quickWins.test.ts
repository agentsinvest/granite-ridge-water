import { describe, expect, it } from 'vitest'
import { buildData } from '../scripts/build-data'
import type { RatePeriod, ReadPeriod } from '../src/engine/billing'
import { calculateBill } from '../src/engine/billing'
import { meterFactor, planChanges, proposedRate, runPlan, turfNeedKgal, type YearLevers } from '../src/engine/quickWins'
import { runScenario, type Baseline } from '../src/engine/scenarios'

const d = buildData()
const plan = d.quickWins!
const rates = d.rates as unknown as RatePeriod[]
const current = rates.at(-1)!

const levers = (i: number): YearLevers => {
  const l = plan.levers
  return {
    leakCutPercent: l.leak_repair_cut_percent.by_year[i],
    controllerCutPercent: l.controller_cut_percent.by_year[i],
    stopOverseeding: l.stop_overseeding.by_year[i],
    winterTurfPercent: l.winter_turf_percent.by_year[i],
    winterMonths: l.winter_turf_percent.months!,
    octoberTurfPercent: l.october_turf_percent.by_year[i],
    octoberMonths: l.october_turf_percent.months!,
    summerTurfPercent: l.summer_turf_percent.by_year[i],
    summerMonths: l.summer_turf_percent.months!,
    dripPercent: l.desert_drip_percent.by_year[i],
  }
}

// The workbook's baseline (meter reads Sep 2025 to Aug 2026, by the month the read ends), Jan to Dec.
const WB: Record<string, number[]> = {
  'meter-1': [115, 159, 166, 260, 310, 575, 575, 374, 313, 342, 232, 104],
  'meter-2': [58, 85, 88, 147, 192, 325, 324, 229, 191, 200, 135, 57],
  'meter-3': [18, 27, 21, 27, 27, 52, 59, 37, 35, 31, 32, 19],
  'meter-4': [30, 30, 37, 32, 29, 43, 36, 26, 49, 42, 40, 32],
}
// Read periods inside each calendar month, so the period month and the read-end month agree.
const wbBaseline: Baseline = Object.fromEntries(
  Object.entries(WB).map(([m, v]) => [m, v.map((usage, i) => ({ start: `2026-${String(i + 1).padStart(2, '0')}-02`, end: `2026-${String(i + 1).padStart(2, '0')}-27`, usage }))]),
)
const shares = [
  { id: 'meter-1', turfShare: 0.88 },
  { id: 'meter-2', turfShare: 0.9 },
  { id: 'meter-3', turfShare: 0 },
  { id: 'meter-4', turfShare: 0 },
]

describe('turf need at a healthy minimum', () => {
  it('matches the workbook, month by month, from the monthly normals', () => {
    const t = d.turfMinimum!
    const need = turfNeedKgal(
      d.monthlyNormals!.months.map((m) => ({ eto: m.eto, rain: m.rainAvg })),
      { areaSqFt: t.turfAreaSqFt.value, plantFactor: t.plantFactor.value, efficiency: t.efficiency.value, effectiveRainShare: t.effectiveRainShare.value },
    ) as number[]
    const workbook = [46.27, 74.24, 143.1, 244.96, 314.9, 337.14, 305.22, 246.76, 206.95, 165.34, 83.57, 35.51]
    need.forEach((v, i) => expect(v).toBeCloseTo(workbook[i], 1))
    expect(need.reduce((a, b) => a + b, 0)).toBeCloseTo(2203.95, 0)
  })
})

describe('quick wins levers', () => {
  it('meter 1 in January 2027 keeps 22.7% of its water, as in the workbook (115 -> 26.15)', () => {
    expect(115 * meterFactor(1, 0.88, levers(0))).toBeCloseTo(26.15445, 4)
  })
  it('reproduces the workbook plan water for every year (4.01, 3.45, 3.13, 3.01 million gallons)', () => {
    const expected = [4010.858, 3445.104, 3131.508, 3008.636]
    plan.years.forEach((_, i) => {
      const r = runScenario(wbBaseline, planChanges(shares, levers(i)), current)
      expect(r.ok).toBe(true)
      if (r.ok) expect(r.newKgal).toBeCloseTo(expected[i], 2)
    })
  })
  it('levers compound: a meter with no turf at 75% drip, 5% leak and 10% controller keeps 64.125%', () => {
    expect(meterFactor(7, 0, levers(0))).toBeCloseTo(0.95 * 0.9 * 0.75, 10)
  })
  it('turning every lever to "no change" leaves the bill exactly as it is', () => {
    const none: YearLevers = { ...levers(0), leakCutPercent: 0, controllerCutPercent: 0, stopOverseeding: false, summerTurfPercent: 100, dripPercent: 100 }
    expect(planChanges(shares, none)).toHaveLength(0)
  })
})

describe('proposed 2027 prices', () => {
  const p = proposedRate(current, plan.proposed_2027_prices)
  it('prices the three blocks: allowance, up to 1.5x the winter average, above it', () => {
    // Winter average 100 (allowance 97 above the included 3). 200 thousand gallons:
    // 97 at usage, 150-100 = 50 at tier 1, 50 at tier 2.
    const b = calculateBill('meter-1', '2027-07-01', '2027-07-30', 200000, [{ ...p, applies_from_period_end: '0000-01-01', applies_to_period_end: null }], [], 97)
    expect(b.ok).toBe(true)
    if (!b.ok) return
    const usage = b.lineItems.find((l) => l.name === 'Excess usage charge')!.amount
    const u = plan.proposed_2027_prices.usage_price
    expect(usage).toBeCloseTo(97 * u + 50 * (u + plan.proposed_2027_prices.tier1_surcharge) + 50 * (u + plan.proposed_2027_prices.tier2_surcharge), 2)
  })
  it("prices the workbook's do-nothing 2027 year within 1% of the workbook ($63,725)", () => {
    const r = runScenario(wbBaseline, [], p)
    expect(r.ok).toBe(true)
    if (r.ok) expect(Math.abs(r.baseCost / 63725.4 - 1)).toBeLessThan(0.01)
  })
  it("prices the workbook's 2027 plan within 1% of the workbook ($44,560)", () => {
    const [y] = runPlan(wbBaseline, shares, [{ year: 2027, levers: levers(0) }], p)
    expect(y.result.ok).toBe(true)
    if (y.result.ok) expect(Math.abs(y.result.newCost / 44559.56 - 1)).toBeLessThan(0.01)
  })
})

describe('real data', () => {
  it('every meter has a turf share and the plan runs on the latest 12 read periods', () => {
    for (const m of d.meters) expect(m.turf_share_percent).toBeDefined()
    const base: Baseline = Object.fromEntries(d.meters.map((m) => [m.id, (d.billingPeriods[m.id].rows as ReadPeriod[]).slice(-12)]))
    const s = d.meters.map((m) => ({ id: m.id, turfShare: m.turf_share_percent!.value / 100 }))
    const out = runPlan(base, s, [{ year: 2027, levers: levers(0) }], current)
    expect(out[0].result.ok).toBe(true)
  })
})
