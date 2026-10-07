// City of Mesa bill calculator. Pure: no UI imports, no I/O.
// Money is computed in whole cents with half-up rounding, the way bills round each line.

export type RatePeriod = {
  source?: string
  confidence?: string
  applies_from_period_end: string
  applies_to_period_end: string | null
  fixed_charges: { meters: string[]; amount: number }[]
  included_kgal_per_bill: { value: number }
  /**
   * Price blocks in order. Block 1 ends at the winter allowance. A later block can end at a multiple of the winter
   * average (for example 1.5 for a proposed two-tier surcharge); the last block has no limit.
   */
  volumetric: { blocks: { block: number; limit: BlockLimit; price: number }[] }
  fees: { name: string; basis: 'per_1000_gallons_above_included' | 'per_1000_gallons' | 'per_bill'; amount: number }[]
  taxes: { name: string; rate_percent: number; applies_to: string[] }[]
}

export type BlockLimit = 'winter_allowance' | { winter_average_multiple: number } | null

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

/**
 * Thousand gallons above the included amount that fall in each price block, in block order. Block limits are in the
 * same terms as `excess`: the winter allowance, or a multiple of the winter average (allowance + included) minus the
 * included amount.
 */
export function blockSlices(rate: RatePeriod, excess: number, allowance: number): { kgal: number; price: number }[] {
  const included = rate.included_kgal_per_bill.value
  const blocks = [...rate.volumetric.blocks].sort((a, b) => a.block - b.block)
  let floor = 0
  return blocks.map((b, i) => {
    const top =
      i === blocks.length - 1 || b.limit === null
        ? Infinity
        : b.limit === 'winter_allowance'
          ? allowance
          : Math.max(b.limit.winter_average_multiple * (allowance + included) - included, allowance)
    const kgal = Math.max(Math.min(excess, top) - floor, 0)
    floor = Math.max(floor, Math.min(excess, top))
    return { kgal, price: b.price }
  })
}

export function calculateBill(
  meter: string,
  periodStart: string,
  periodEnd: string,
  gallons: number,
  rates: RatePeriod[],
  readPeriods: ReadPeriod[],
  /** Use this block 1 allowance (thousand gallons above the included amount) instead of the meter's winter history. */
  allowanceOverrideKgal?: number,
): BillResult {
  if (periodStart > periodEnd) return { ok: false, reason: 'period starts after it ends' }
  const rate = selectRate(rates, periodEnd)
  if (!rate) return { ok: false, reason: `no rate covers a period ending ${periodEnd}` }
  const fixed = rate.fixed_charges.find((f) => f.meters.includes(meter))
  if (!fixed) return { ok: false, reason: `no service charge for ${meter}` }
  const included = rate.included_kgal_per_bill.value
  const allowance = allowanceOverrideKgal ?? winterAllowanceKgal(readPeriods, periodEnd, included)
  if (allowance === null) return { ok: false, reason: 'winter usage needed for the allowance is missing' }

  const kgal = gallons / 1000
  const excess = Math.max(kgal - included, 0)
  const slices = blockSlices(rate, excess, allowance)

  const items: { name: string; c: number; taxable: string | null }[] = [
    { name: 'Service charge', c: cents(fixed.amount), taxable: 'service' },
    { name: 'Excess usage charge', c: cents(slices.reduce((s, b) => s + b.kgal * b.price, 0)), taxable: 'usage' },
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

export type UsageSplit = {
  /** Thousand gallons billed at the lower (block 1) price, inside the winter allowance. */
  lowerKgal: number
  /** Thousand gallons billed at the higher (block 2) price, above the winter allowance. */
  higherKgal: number
  lowerPrice: number
  higherPrice: number
  lowerDollars: number
  higherDollars: number
  /** What the higher-price gallons cost beyond the lower price: higherKgal x (higher price - lower price). */
  premium: number
  allowanceKgal: number
}

/**
 * Splits a bill's excess usage charge into the part billed at the lower price and the part above the winter allowance
 * billed at the higher price. Returns null when no rate covers the period or the split does not reproduce the printed
 * usage charge to the cent, so a derived split is never shown for a bill it does not match.
 */
export function splitUsageCharge(
  meter: string,
  periodStart: string,
  periodEnd: string,
  gallons: number,
  printedUsageCharge: number,
  rates: RatePeriod[],
  readPeriods: ReadPeriod[],
): UsageSplit | null {
  const bill = calculateBill(meter, periodStart, periodEnd, gallons, rates, readPeriods)
  if (!bill.ok) return null
  const computed = bill.lineItems.find((l) => l.name === 'Excess usage charge')?.amount
  if (computed === undefined || cents(computed) !== cents(printedUsageCharge)) return null
  const excess = Math.max(gallons / 1000 - bill.rate.included_kgal_per_bill.value, 0)
  const [first, ...rest] = blockSlices(bill.rate, excess, bill.allowanceKgal)
  const lowerKgal = first.kgal
  const higherKgal = rest.reduce((s, b) => s + b.kgal, 0)
  const higherDollars = dollars(cents(rest.reduce((s, b) => s + b.kgal * b.price, 0)))
  return {
    lowerKgal,
    higherKgal,
    lowerPrice: first.price,
    /** With more than one higher block, the gallon-weighted average higher price. */
    higherPrice: higherKgal > 0 ? rest.reduce((s, b) => s + b.kgal * b.price, 0) / higherKgal : (rest[0]?.price ?? first.price),
    // The lower part is the printed charge minus the higher part, so the two always add up to the bill.
    lowerDollars: dollars(cents(printedUsageCharge) - cents(higherDollars)),
    higherDollars,
    premium: dollars(cents(rest.reduce((s, b) => s + b.kgal * (b.price - first.price), 0))),
    allowanceKgal: bill.allowanceKgal,
  }
}
