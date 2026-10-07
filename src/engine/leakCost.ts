// What a possible leak costs in City of Mesa charges. Pure: no UI imports, no I/O.
// Leak water is always the last water through the meter, so it is priced at the margin: the bill with the leak
// minus the bill without it. That puts it in block 2 whenever the meter is over its winter allowance.

import { calculateBill, currentRate, feeTaxKey, selectRate, type RatePeriod, type ReadPeriod } from './billing'

export type Episode = { from: string; to: string; gallons: number }

export type EpisodeCost = Episode &
  (
    | { kind: 'billed'; usd: number; periodEnd: string }
    | { kind: 'range'; low: number; high: number; reason: string }
    | { kind: 'unpriced'; reason: string }
  )

export type LeakCost = {
  episodes: EpisodeCost[]
  gallons: number
  /** Dollars for the priced episodes. Equal when every episode is on a bill already. */
  low: number | null
  high: number | null
  /** Gallons in episodes that could not be priced. */
  unpricedGallons: number
  perYear: { gallons: number; low: number; high: number } | null
}

const round2 = (x: number) => Math.round(x * 100) / 100

/** Dollars per thousand gallons above the included amount, in a volumetric block, with per-gallon fees and tax. */
export function marginalPricePerKgal(rate: RatePeriod, block: number): number | null {
  const b = rate.volumetric.blocks.find((x) => x.block === block)
  if (!b) return null
  const tax = (key: string) => rate.taxes.filter((t) => t.applies_to.includes(key)).reduce((s, t) => s + t.rate_percent / 100, 0)
  let price = b.price * (1 + tax('usage'))
  for (const f of rate.fees) {
    if (f.basis === 'per_bill') continue
    const key = feeTaxKey(f.name)
    price += f.amount * (1 + (key ? tax(key) : 0))
  }
  return price
}

/** Lowest and highest marginal price under a rate: all water in the cheapest block, or all in the dearest. */
function priceRange(rate: RatePeriod): [number, number] | null {
  const prices = rate.volumetric.blocks.map((b) => marginalPricePerKgal(rate, b.block)).filter((p): p is number => p !== null)
  return prices.length ? [Math.min(...prices), Math.max(...prices)] : null
}

export function episodeCost(meter: string, ep: Episode, rates: RatePeriod[], readPeriods: ReadPeriod[]): EpisodeCost {
  const period = readPeriods.find((p) => p.start <= ep.from && ep.to <= p.end)
  if (period && period.usage !== null && period.usage * 1000 >= ep.gallons) {
    const used = period.usage * 1000
    const withLeak = calculateBill(meter, period.start, period.end, used, rates, readPeriods)
    const without = calculateBill(meter, period.start, period.end, used - ep.gallons, rates, readPeriods)
    if (withLeak.ok && without.ok) return { ...ep, kind: 'billed', usd: round2(withLeak.total - without.total), periodEnd: period.end }
  }
  const rate = selectRate(rates, ep.to)
  if (!rate) return { ...ep, kind: 'unpriced', reason: `No City rate on file for ${ep.to.slice(0, 4)} yet.` }
  const range = priceRange(rate)
  if (!range) return { ...ep, kind: 'unpriced', reason: 'The rate on file has no water price.' }
  const lastEnd = readPeriods.reduce((m, p) => (p.end > m ? p.end : m), '')
  const reason =
    (period && period.usage === null) || ep.from > lastEnd
      ? 'Not on a bill yet. The exact cost is known when that bill arrives.'
      : 'Spans more than one bill, so it is priced as a range.'
  return { ...ep, kind: 'range', low: round2((ep.gallons / 1000) * range[0]), high: round2((ep.gallons / 1000) * range[1]), reason }
}

/** Cost of every episode, plus a yearly figure at the latest rate when the flag says the flow could continue. */
export function leakCost(
  meter: string,
  excess: { episodes: Episode[]; ongoing_gallons_per_year: number | null },
  rates: RatePeriod[],
  readPeriods: ReadPeriod[],
): LeakCost {
  const episodes = excess.episodes.map((e) => episodeCost(meter, e, rates, readPeriods))
  const priced = episodes.filter((e) => e.kind !== 'unpriced')
  const sum = (f: (e: EpisodeCost) => number) => round2(priced.reduce((s, e) => s + f(e), 0))
  const lowOf = (e: EpisodeCost) => (e.kind === 'billed' ? e.usd : e.kind === 'range' ? e.low : 0)
  const highOf = (e: EpisodeCost) => (e.kind === 'billed' ? e.usd : e.kind === 'range' ? e.high : 0)

  let perYear: LeakCost['perYear'] = null
  const latest = currentRate(rates)
  const range = latest ? priceRange(latest) : null
  if (excess.ongoing_gallons_per_year !== null && range) {
    const kgal = excess.ongoing_gallons_per_year / 1000
    perYear = { gallons: excess.ongoing_gallons_per_year, low: round2(kgal * range[0]), high: round2(kgal * range[1]) }
  }

  return {
    episodes,
    gallons: episodes.reduce((s, e) => s + e.gallons, 0),
    low: priced.length ? sum(lowOf) : null,
    high: priced.length ? sum(highOf) : null,
    unpricedGallons: episodes.filter((e) => e.kind === 'unpriced').reduce((s, e) => s + e.gallons, 0),
    perYear,
  }
}
