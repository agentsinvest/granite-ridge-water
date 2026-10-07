// The City's winter base: each meter's December, January, and February read periods set the amount billed at the
// lower price for the next twelve read periods (March through February). Water above it pays the surcharge. Pure: no UI
// imports, no I/O.

import { winterAllowanceKgal, type RatePeriod, type ReadPeriod } from './billing'
import { priceYear, steadyAllowanceKgal } from './scenarios'

const r2 = (x: number) => Math.round(x * 100) / 100
const endMonth = (p: { end: string }) => Number(p.end.slice(5, 7))
const isWinter = (p: { end: string }) => [12, 1, 2].includes(endMonth(p))

export type WinterBase = {
  meter: string
  /** The December, January, and February read periods that set the base. */
  winter: ReadPeriod[]
  /** Winter water average in thousand gallons a read period, rounded as the City rounds it. */
  averageKgal: number
  /** Thousand gallons a read period billed at the lower price, above the included amount. */
  allowanceKgal: number
  /** Read periods priced with this base so far (ending March onward), oldest first. */
  since: ReadPeriod[]
  /** How many of them went above the base, and by how much in total. */
  periodsAbove: number
  kgalAbove: number
  /** Highest read period priced with this base, and how many times the base it was. */
  peak: { end: string; kgal: number; times: number } | null
  /** The City's second surcharge tier line, when the rate has one (a multiple of the winter average). */
  tier2Kgal: number | null
  kgalAboveTier2: number | null
}

/** The winter base that prices this meter's latest read period, and how the periods since then compare to it. */
export function winterBase(meter: string, periods: ReadPeriod[], includedKgal: number, tierRate: RatePeriod | null = null): WinterBase | null {
  const sorted = [...periods].filter((p) => p.usage !== null).sort((a, b) => a.end.localeCompare(b.end))
  const latest = sorted.at(-1)
  if (!latest) return null
  const allowanceKgal = winterAllowanceKgal(sorted, latest.end, includedKgal)
  if (allowanceKgal === null) return null
  const year = Number(latest.end.slice(0, 4))
  const winterYear = endMonth(latest) >= 3 ? year : year - 1
  const wanted = [`${winterYear - 1}-12`, `${winterYear}-01`, `${winterYear}-02`]
  const winter = wanted.map((ym) => sorted.find((p) => p.end.startsWith(ym))!)
  const averageKgal = Math.round(winter.reduce((s, p) => s + (p.usage as number), 0) / 3)
  const since = sorted.filter((p) => p.end >= `${winterYear}-03`)
  const over = since.map((p) => Math.max((p.usage as number) - averageKgal, 0))
  const top = [...since].sort((a, b) => (b.usage as number) - (a.usage as number))[0]
  const multiple = tierRate?.volumetric.blocks.map((b) => (b.limit && typeof b.limit === 'object' ? b.limit.winter_average_multiple : null)).find((x) => x !== null) ?? null
  const tier2Kgal = multiple === null ? null : multiple * averageKgal
  return {
    meter,
    winter,
    averageKgal,
    allowanceKgal,
    since,
    periodsAbove: over.filter((x) => x > 0).length,
    kgalAbove: over.reduce((s, x) => s + x, 0),
    peak: top ? { end: top.end, kgal: top.usage as number, times: averageKgal > 0 ? (top.usage as number) / averageKgal : Infinity } : null,
    tier2Kgal,
    kgalAboveTier2: tier2Kgal === null ? null : since.reduce((s, p) => s + Math.max((p.usage as number) - tier2Kgal, 0), 0),
  }
}

export type WinterCut = {
  /** What cutting the winter periods by `kgal` each saves on those winter bills. */
  winterSaved: number
  /** What the lower base adds to the other read periods' bills. Positive means the year costs more. */
  restAdded: number
  /** Net yearly change: negative saves money. */
  net: number
}

/**
 * Prices a year of read periods with and without `kgal` thousand gallons cut from each December, January, and February
 * period, each priced with its own steady-state winter base (as in runScenario). Shows how much of a winter cut comes
 * back as surcharge on the rest of the year.
 */
export function winterCutEffect(meter: string, year: ReadPeriod[], rate: RatePeriod, kgal = 1): WinterCut | null {
  if (year.some((p) => p.usage === null)) return null
  const base = year.map((p) => ({ start: p.start, end: p.end, kgal: p.usage as number }))
  if (steadyAllowanceKgal(base, rate.included_kgal_per_bill.value) === null) return null
  const cut = base.map((p) => (isWinter(p) ? { ...p, kgal: Math.max(p.kgal - kgal, 0) } : p))
  const a = priceYear(meter, base, rate)
  const b = priceYear(meter, cut, rate)
  if (typeof a === 'string' || typeof b === 'string') return null
  const winterSaved = r2(base.reduce((s, p, i) => s + (isWinter(p) ? a[i] - b[i] : 0), 0))
  const restAdded = r2(base.reduce((s, p, i) => s + (isWinter(p) ? 0 : b[i] - a[i]), 0))
  return { winterSaved, restAdded, net: r2(restAdded - winterSaved) }
}
