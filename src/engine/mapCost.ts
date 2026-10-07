// What each meter cost in a calendar year, and which meters a map zone's water goes through. Pure: no UI imports, no I/O.
// Zones are not metered on their own, so a zone never gets a dollar figure of its own here unless it is the only thing
// on its meters. Splitting a shared meter needs each station's run time and flow, which are not all on file.

export type CostBill = { meter: string; bill_date: string; printed_total: number; reconciled: string }

export type MeterYearCost = {
  meter: string
  year: string
  /** Sum of printed totals on bills dated in this year. */
  total: number
  bills: number
  /** Bill months (1 to 12) up to `throughMonth` with no bill on file for this meter. */
  missingMonths: number[]
  /** Last month the year is counted through: 12 for a past year, the latest bill month on any meter for the current one. */
  throughMonth: number
  /** Bills not yet checked against the City's prices (anything but `pass`). */
  unchecked: number
}

const r2 = (x: number) => Math.round(x * 100) / 100

/** The latest bill year on file, and the month of the latest bill in it, across all meters. */
export function latestBillMonth(bills: CostBill[]): { year: string; month: number } | null {
  const last = bills.map((b) => b.bill_date).sort().at(-1)
  return last ? { year: last.slice(0, 4), month: Number(last.slice(5, 7)) } : null
}

/** One meter's bills dated in `year`, counted through `throughMonth` (bills dated later in the year are left out). */
export function meterYearCost(bills: CostBill[], meter: string, year: string, throughMonth = 12): MeterYearCost {
  const mine = bills.filter((b) => b.meter === meter && b.bill_date.startsWith(year) && Number(b.bill_date.slice(5, 7)) <= throughMonth)
  const months = new Set(mine.map((b) => Number(b.bill_date.slice(5, 7))))
  const missingMonths = Array.from({ length: throughMonth }, (_, i) => i + 1).filter((m) => !months.has(m))
  return {
    meter,
    year,
    total: r2(mine.reduce((s, b) => s + b.printed_total, 0)),
    bills: mine.length,
    missingMonths,
    throughMonth,
    unchecked: mine.filter((b) => b.reconciled !== 'pass').length,
  }
}

/** Year to date (latest bill year) and the full year before it, for one meter. */
export function meterCostPair(bills: CostBill[], meter: string): { ytd: MeterYearCost; prior: MeterYearCost } | null {
  const last = latestBillMonth(bills)
  if (!last) return null
  return {
    ytd: meterYearCost(bills, meter, last.year, last.month),
    prior: meterYearCost(bills, meter, String(Number(last.year) - 1), 12),
  }
}

export type StationLike = { station: string; meter: string | null; program: string | null }

export type ZoneMeters = {
  /** Meters this zone's stations are on, in meter order. */
  meters: string[]
  /** Zone stations whose meter is not on file. */
  unknownMeter: string[]
  /** Other stations on the same meters, which share the meter's bill. Stations turned off are left out. */
  sharedWith: string[]
  /** True when the zone is everything that runs on its meters, so the meters' cost is the zone's cost. */
  wholeMeter: boolean
}

/** Which meters a zone's water goes through and what else shares them. `stations` lists every station on the site. */
export function zoneMeters(zoneStations: string[], stations: StationLike[]): ZoneMeters {
  const inZone = new Set(zoneStations)
  const mine = stations.filter((s) => inZone.has(s.station))
  const meters = [...new Set(mine.map((s) => s.meter).filter((m): m is string => m !== null))].sort()
  const unknownMeter = zoneStations.filter((id) => !mine.some((s) => s.station === id && s.meter !== null))
  const sharedWith = stations.filter((s) => !inZone.has(s.station) && s.meter !== null && meters.includes(s.meter) && s.program !== 'Off').map((s) => s.station)
  return { meters, unknownMeter, sharedWith, wholeMeter: meters.length > 0 && unknownMeter.length === 0 && sharedWith.length === 0 }
}

/** "C1 to C7, C14, C15": station ids with runs of consecutive numbers on the same letter collapsed. */
export function stationRanges(ids: string[]): string {
  const parsed = ids
    .map((id) => ({ id, letter: id.replace(/\d+$/, ''), n: Number(id.match(/\d+$/)?.[0] ?? NaN) }))
    .sort((a, b) => a.letter.localeCompare(b.letter) || a.n - b.n)
  const out: string[] = []
  let i = 0
  while (i < parsed.length) {
    let j = i
    while (j + 1 < parsed.length && parsed[j + 1].letter === parsed[i].letter && parsed[j + 1].n === parsed[j].n + 1) j++
    if (j - i >= 2) out.push(`${parsed[i].id} to ${parsed[j].id}`)
    else for (let k = i; k <= j; k++) out.push(parsed[k].id)
    i = j + 1
  }
  return out.join(', ')
}
