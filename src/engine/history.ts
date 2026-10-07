// Bill totals over any period, and the "how we got here" split of cost changes. Pure: no UI imports, no I/O.

export type BillLike = {
  meter: string
  bill_date: string
  gallons: number | null
  printed_total: number
  lineItems: { name: string; amount: number | null }[]
}

/** Charges that do not depend on gallons: service charge, per-bill fees, and late charges. */
export const FIXED_LINES = ['Service charge', 'Other fees', 'Other charge', 'Late fee charge', 'Tax on late fee', 'Delinquent letter charge']

const r2 = (x: number) => Math.round(x * 100) / 100

export function fixedPart(b: BillLike): number {
  return r2(b.lineItems.filter((l) => FIXED_LINES.includes(l.name)).reduce((s, l) => s + (l.amount ?? 0), 0))
}

export type BillFilter = { from: string | null; to: string | null; meters: string[] | null }

/** Bills whose bill date falls in [from, to] (inclusive, YYYY-MM-DD) on the chosen meters. */
export function filterBills<T extends BillLike>(bills: T[], f: BillFilter): T[] {
  return bills.filter(
    (b) => (f.from === null || b.bill_date >= f.from) && (f.to === null || b.bill_date <= f.to) && (f.meters === null || f.meters.includes(b.meter)),
  )
}

export type BillSummary = {
  count: number
  total: number
  /** Gallons on bills where the City's gallons are known. */
  gallons: number
  billsWithGallons: number
  /** Dollars per thousand gallons, all charges included, over bills with known gallons. */
  costPerKgal: number | null
  fixed: number
}

export function summarize(bills: BillLike[]): BillSummary {
  const withGal = bills.filter((b) => b.gallons !== null)
  const gallons = withGal.reduce((s, b) => s + (b.gallons ?? 0), 0)
  const totalWithGal = withGal.reduce((s, b) => s + b.printed_total, 0)
  return {
    count: bills.length,
    total: r2(bills.reduce((s, b) => s + b.printed_total, 0)),
    gallons,
    billsWithGallons: withGal.length,
    costPerKgal: gallons > 0 ? totalWithGal / (gallons / 1000) : null,
    fixed: r2(bills.reduce((s, b) => s + fixedPart(b), 0)),
  }
}

export type Decomposition = {
  from: string
  to: string
  /** Meter-months present with known gallons in both periods. Only these are compared. */
  matched: number
  startTotal: number
  endTotal: number
  startGallons: number
  endGallons: number
  /** Change from using more or fewer gallons, at the earlier price. */
  volume: number
  /** Change from the price per gallon, on the later gallons. */
  price: number
  /** Change in service charges and per-bill fees. */
  fixed: number
}

/**
 * Split the change in cost between two calendar years (by bill date) into volume, price, and fixed-charge effects.
 * Only bills present in both years for the same meter and bill month, with gallons known, are compared, so the three
 * effects add up exactly to the change in those bills' totals.
 */
export function decomposeYears(bills: BillLike[], fromYear: string, toYear: string): Decomposition {
  const key = (b: BillLike) => `${b.meter}|${b.bill_date.slice(5, 7)}`
  const known = bills.filter((b) => b.gallons !== null)
  const a = new Map(known.filter((b) => b.bill_date.startsWith(fromYear)).map((b) => [key(b), b]))
  const b = new Map(known.filter((x) => x.bill_date.startsWith(toYear)).map((x) => [key(x), x]))
  const keys = [...a.keys()].filter((k) => b.has(k))
  const side = (m: Map<string, BillLike>) => {
    const list = keys.map((k) => m.get(k)!)
    const total = list.reduce((s, x) => s + x.printed_total, 0)
    const fixed = list.reduce((s, x) => s + fixedPart(x), 0)
    const gallons = list.reduce((s, x) => s + (x.gallons ?? 0), 0)
    return { total, fixed, gallons, variable: total - fixed }
  }
  const A = side(a)
  const B = side(b)
  const pA = A.gallons > 0 ? A.variable / A.gallons : 0
  const pB = B.gallons > 0 ? B.variable / B.gallons : 0
  const volume = (B.gallons - A.gallons) * pA
  const fixed = B.fixed - A.fixed
  const price = (pB - pA) * B.gallons
  return {
    from: fromYear,
    to: toYear,
    matched: keys.length,
    startTotal: r2(A.total),
    endTotal: r2(B.total),
    startGallons: A.gallons,
    endGallons: B.gallons,
    volume: r2(volume),
    price: r2(price),
    fixed: r2(fixed),
  }
}

/** Bill totals by calendar year of the bill date, with how many of the expected bills are on file. */
export function totalsByYear(bills: BillLike[], meters: string[]): { year: string; total: number; count: number; byMeter: Record<string, number> }[] {
  const years = [...new Set(bills.map((b) => b.bill_date.slice(0, 4)))].sort()
  return years.map((year) => {
    const ys = bills.filter((b) => b.bill_date.startsWith(year))
    const byMeter = Object.fromEntries(meters.map((m) => [m, r2(ys.filter((b) => b.meter === m).reduce((s, b) => s + b.printed_total, 0))]))
    return { year, total: r2(ys.reduce((s, b) => s + b.printed_total, 0)), count: ys.length, byMeter }
  })
}
