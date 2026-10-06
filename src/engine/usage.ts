// Pure helpers over metered usage. No UI imports.

export type Period = { start: string; end: string; usage: number | null }

export type MeterUsageSummary = {
  meter: string
  thousandGallons: number
  periods: number
  missingPeriods: number
  from: string | null
  to: string | null
}

/** Sum the most recent `count` read periods for one meter. Missing usage is counted, not guessed. */
export function recentUsage(meter: string, rows: Period[], count: number): MeterUsageSummary {
  const recent = [...rows].sort((a, b) => a.start.localeCompare(b.start)).slice(-count)
  const known = recent.filter((r) => r.usage !== null)
  return {
    meter,
    thousandGallons: known.reduce((sum, r) => sum + (r.usage as number), 0),
    periods: recent.length,
    missingPeriods: recent.length - known.length,
    from: recent[0]?.start ?? null,
    to: recent.at(-1)?.end ?? null,
  }
}

/** Each meter's share of the combined total, as a fraction 0 to 1. Returns null when the total is zero. */
export function shares(summaries: MeterUsageSummary[]): Record<string, number | null> {
  const total = summaries.reduce((s, m) => s + m.thousandGallons, 0)
  return Object.fromEntries(summaries.map((m) => [m.meter, total > 0 ? m.thousandGallons / total : null]))
}
