import { describe, expect, it } from 'vitest'
import type { RatePeriod, ReadPeriod } from '../src/engine/billing'
import { applyChanges, cutToReach, latestBaseline, payback, runScenario } from '../src/engine/scenarios'
import { buildData } from '../scripts/build-data'

const data = buildData()
const rates = data.rates as unknown as RatePeriod[]
const rate = rates.at(-1)!
const all = Object.fromEntries(Object.entries(data.billingPeriods).map(([m, v]) => [m, v.rows as ReadPeriod[]]))
const meters = data.meters.map((m) => m.id)
const base = latestBaseline(all, meters)
const p: ReadPeriod = { start: '2026-07-01', end: '2026-07-30', usage: 100 }

describe('applyChanges', () => {
  it('stacks two 20% cuts to 36%, not 40%', () => {
    const c = { kind: 'turn_down' as const, meters: ['meter-1'], percent: 20, months: [] }
    expect(applyChanges('meter-1', p, [c, c])).toBeCloseTo(64, 10)
  })
  it('turning a meter off removes exactly its gallons, and later changes save nothing more', () => {
    expect(applyChanges('meter-1', p, [{ kind: 'off', meters: ['meter-1'] }])).toBe(0)
    expect(applyChanges('meter-1', p, [{ kind: 'off', meters: ['meter-1'] }, { kind: 'turn_down', meters: ['meter-1'], percent: 50, months: [] }])).toBe(0)
  })
  it('only applies seasonal changes in their months', () => {
    expect(applyChanges('meter-1', p, [{ kind: 'shutoff', meters: ['meter-1'], months: [1] }])).toBe(100)
    expect(applyChanges('meter-1', p, [{ kind: 'shutoff', meters: ['meter-1'], months: [7] }])).toBe(0)
  })
  it('leaves other meters alone', () => {
    expect(applyChanges('meter-2', p, [{ kind: 'off', meters: ['meter-1'] }])).toBe(100)
  })
})

describe('runScenario', () => {
  it('prices the baseline close to what the City billed for the same read periods', () => {
    const r = runScenario(base, [], rate)
    expect(r.ok).toBe(true)
    if (!r.ok) return
    expect(r.baseCost).toBe(r.newCost)
    // Same 12 periods at the latest rate should be in the range of recent annual bills (about $50,000).
    expect(r.baseCost).toBeGreaterThan(40000)
    expect(r.baseCost).toBeLessThan(65000)
  })
  it('turning a meter off removes exactly its baseline gallons, but its service charge remains', () => {
    const r = runScenario(base, [{ kind: 'off', meters: ['meter-4'] }], rate)
    if (!r.ok) throw new Error(r.reason)
    const m4 = r.meters.find((m) => m.meter === 'meter-4')!
    expect(m4.newKgal).toBe(0)
    expect(r.baseKgal - r.newKgal).toBeCloseTo(m4.baseKgal, 10)
    expect(m4.newCost).toBeGreaterThan(0)
  })
  it('a cut that hits the target actually hits it', () => {
    const pct = cutToReach(base, meters, 30000, rate)
    expect(pct).not.toBeNull()
    const r = runScenario(base, [{ kind: 'turn_down', meters, percent: pct!, months: [] }], rate)
    if (!r.ok) throw new Error(r.reason)
    expect(r.newCost).toBeLessThanOrEqual(30000)
    expect(r.newCost).toBeGreaterThan(29990)
  })
})

describe('payback', () => {
  it('matches a hand calculation', () => {
    // $6,000 up front, $200 a year to run, $1,400 a year saved: 6,000 / 1,200 = 5 years = 60 months; 5-year net 0.
    expect(payback(6000, 200, 1400)).toEqual({ months: 60, net: 0 })
    expect(payback(6000, 0, 0).months).toBeNull()
  })
})

describe('recommended moves', async () => {
  const { buildModel, buildMoves, rankMoves } = await import('../src/lib/model')
  const model = buildModel(data)
  const moves = buildMoves(data, model)
  it('ranks only options that actually save money, and hides greenspace by default', () => {
    const off = rankMoves(moves, false)
    const on = rankMoves(moves, true)
    for (const m of [...off.ranked, ...on.ranked]) expect(m.annual!.high).toBeGreaterThan(0)
    expect(off.ranked.every((m) => !m.greenspace)).toBe(true)
    expect(on.ranked.length).toBeGreaterThanOrEqual(off.ranked.length)
    for (let i = 1; i < on.ranked.length; i++) expect(on.ranked[i - 1].annual!.high).toBeGreaterThanOrEqual(on.ranked[i].annual!.high)
  })
  it('never ranks items without a price; they show as needing a quote', () => {
    const r = rankMoves(moves, true)
    expect(r.ranked.every((m) => m.upfront !== null)).toBe(true)
    expect(r.needsQuote.every((m) => m.kind === 'investment' || m.upfront === null || m.annual === null)).toBe(true)
  })
})
