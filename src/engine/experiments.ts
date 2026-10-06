// Did an experiment do what we expected? Pure: no UI imports, no I/O.
// Compares average daily water use before a change with average daily use after it, on complete days only.
// Weather is not adjusted for yet (no daily ETo on file), so short windows in spring or fall can mislead; the result
// says so.

export type Day = { date: string; gallons: number | null; hours: number | null }

export type Expected =
  | { type: 'percent_reduction'; value: number }
  | { type: 'max_daily_gallons'; value: number }

export type CheckSettings = { minDays: number; minHours: number; shareOfTarget: number; noisePercent: number }

export type Verdict = 'as_expected' | 'partly' | 'no_change' | 'went_up' | 'not_enough_data' | 'not_started'

export type CheckResult = {
  verdict: Verdict
  before: { from: string; to: string; days: number; avg: number | null }
  after: { from: string; to: string; days: number; avg: number | null; max: number | null; daysOver: number }
  /** Percent drop in average daily gallons (negative means use went up). */
  changePercent: number | null
}

const addDays = (iso: string, n: number) => new Date(Date.parse(`${iso}T12:00:00Z`) + n * 86400000).toISOString().slice(0, 10)

export function checkExperiment(
  days: Day[],
  start: string | null,
  end: string | null,
  beforeDays: number,
  expected: Expected,
  s: CheckSettings,
): CheckResult {
  const empty = { from: '', to: '', days: 0, avg: null }
  if (start === null) return { verdict: 'not_started', before: empty, after: { ...empty, max: null, daysOver: 0 }, changePercent: null }
  const complete = days.filter((d) => d.gallons !== null && (d.hours ?? 0) >= s.minHours)
  const bFrom = addDays(start, -beforeDays)
  const bTo = addDays(start, -1)
  const lastDay = complete.reduce((m, d) => (d.date > m ? d.date : m), '')
  const aTo = end ?? lastDay
  const before = complete.filter((d) => d.date >= bFrom && d.date <= bTo)
  const after = complete.filter((d) => d.date >= start && d.date <= aTo)
  const avg = (l: Day[]) => (l.length ? l.reduce((t, d) => t + (d.gallons as number), 0) / l.length : null)
  const bAvg = avg(before)
  const aAvg = avg(after)
  const max = after.length ? Math.max(...after.map((d) => d.gallons as number)) : null
  const daysOver = expected.type === 'max_daily_gallons' ? after.filter((d) => (d.gallons as number) > expected.value).length : 0
  const changePercent = bAvg && aAvg !== null ? ((bAvg - aAvg) / bAvg) * 100 : null
  const result = {
    before: { from: bFrom, to: bTo, days: before.length, avg: bAvg },
    after: { from: start, to: aTo, days: after.length, avg: aAvg, max, daysOver },
    changePercent,
  }

  if (after.length < s.minDays || (expected.type === 'percent_reduction' && before.length < s.minDays)) return { verdict: 'not_enough_data', ...result }
  if (expected.type === 'max_daily_gallons') return { verdict: daysOver === 0 ? 'as_expected' : 'partly', ...result }
  if (changePercent === null) return { verdict: 'not_enough_data', ...result }
  const verdict: Verdict =
    changePercent >= expected.value * s.shareOfTarget
      ? 'as_expected'
      : changePercent >= s.noisePercent
        ? 'partly'
        : changePercent <= -s.noisePercent
          ? 'went_up'
          : 'no_change'
  return { verdict, ...result }
}
