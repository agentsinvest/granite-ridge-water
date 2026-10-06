// City of Mesa bill calculator. Pure: no UI imports, no I/O.
// Money is computed in whole cents with half-up rounding, the way bills round each line.

export type RatePeriod = {
  applies_from_period_end: string
  applies_to_period_end: string | null
  fixed_charges: { meters: string[]; amount: number }[]
  included_kgal_per_bill: { value: number }
  volumetric: { blocks: { block: number; limit: 'winter_allowance' | null; price: number }[] }
  fees: { name: string; basis: 'per_1000_gallons_above_included' | 'per_1000_gallons' | 'per_bill'; amount: number }[]
  taxes: { name: string; rate_percent: number; applies_to: string[] }[]
}

export type ReadPeriod = { start: string; end: string; usage: number | null } // usage in thousand gallons

export type LineItem = { name: string; amount: number }
export type BillResult =
  | { ok: true; lineItems: LineItem[]; total: number; allowanceKgal: number; rate: RatePeriod }
  | { ok: false; reason: string }

/** Which tax base a fee belongs to, matching the `applies_to` keys in rate files. Untaxed fees return null. */
export function feeTaxKey(name: string): string | null {
  return name === 'Water drought' ? 'water_drought' : name === 'Superfund charge' ? 'superfund' : null
}

const cents = (x: number) => Math.round(x * 100 + Number.EPSILON * 100) // x already in dollars
const dollars = (c: number) => c / 100

/** Rate period that covers a read period ending on `periodEnd` (YYYY-MM-DD). */
export function selectRate(rates: RatePeriod[], periodEnd: string): RatePeriod | null {
  return (
    rates.find((r) => periodEnd >= r.applies_from_period_end && (r.applies_to_period_end === null || periodEnd <= r.applies_to_period_end)) ?? null
  )
}

/**
 * Block 1 allowance in thousand gallons above the included amount: average of the meter's read periods ending in
 * December, January, and February, rounded to the nearest thousand, minus the included amount. Read periods ending
 * March through February use the most recent such winter.
 */
export function winterAllowanceKgal(periods: ReadPeriod[], periodEnd: string, includedKgal: number): number | null {
  const year = Number(periodEnd.slice(0, 4))
  const month = Number(periodEnd.slice(5, 7))
  const winterYear = month >= 3 ? year : year - 1
  const wanted = [`${winterYear - 1}-12`, `${winterYear}-01`, `${winterYear}-02`]
  const vals = wanted.map((ym) => periods.find((p) => p.end.slice(0, 7) === ym)?.usage ?? null)
  if (vals.some((v) => v === null)) return null
  const avg = (vals as number[]).reduce((a, b) => a + b, 0) / 3
  return Math.max(Math.round(avg) - includedKgal, 0)
}

export function calculateBill(
  meter: string,
  periodStart: string,
  periodEnd: string,
  gallons: number,
  rates: RatePeriod[],
  readPeriods: ReadPeriod[],
): BillResult {
  if (periodStart > periodEnd) return { ok: false, reason: 'period starts after it ends' }
  const rate = selectRate(rates, periodEnd)
  if (!rate) return { ok: false, reason: `no rate covers a period ending ${periodEnd}` }
  const fixed = rate.fixed_charges.find((f) => f.meters.includes(meter))
  if (!fixed) return { ok: false, reason: `no service charge for ${meter}` }
  const included = rate.included_kgal_per_bill.value
  const allowance = winterAllowanceKgal(readPeriods, periodEnd, included)
  if (allowance === null) return { ok: false, reason: 'winter usage needed for the allowance is missing' }

  const kgal = gallons / 1000
  const excess = Math.max(kgal - included, 0)
  const [b1, b2] = [...rate.volumetric.blocks].sort((a, b) => a.block - b.block)
  const inBlock1 = Math.min(excess, allowance)

  const items: { name: string; c: number; taxable: string | null }[] = [
    { name: 'Service charge', c: cents(fixed.amount), taxable: 'service' },
    { name: 'Excess usage charge', c: cents(inBlock1 * b1.price + (excess - inBlock1) * b2.price), taxable: 'usage' },
  ]
  for (const f of rate.fees) {
    const base = f.basis === 'per_bill' ? 1 : f.basis === 'per_1000_gallons' ? kgal : excess
    items.push({ name: f.name, c: cents(base * f.amount), taxable: feeTaxKey(f.name) })
  }
  const taxLines = rate.taxes.map((t) => {
    const base = items.filter((i) => i.taxable && t.applies_to.includes(i.taxable)).reduce((s, i) => s + i.c, 0)
    return { name: t.name, c: Math.round((base * t.rate_percent) / 100) }
  })
  const all = [...items.map(({ name, c }) => ({ name, c })), ...taxLines]
  const total = all.reduce((s, i) => s + i.c, 0)
  return { ok: true, lineItems: all.map((i) => ({ name: i.name, amount: dollars(i.c) })), total: dollars(total), allowanceKgal: allowance, rate }
}
