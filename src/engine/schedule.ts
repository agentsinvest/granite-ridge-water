// Watering schedule from hourly meter reads. Pure: no UI imports, no I/O.
// A read time is "YYYY-MM-DD HH:00". Missing hours are absent from the input; they are never treated as zero.

import { calculateBill, type RatePeriod, type ReadPeriod } from './billing'

export type HourlyRead = { time: string; gallons: number }
export type ScheduleSettings = { minGallons: number; maxGapHours: number }

export type WateringRun = {
  start: string
  end: string
  /** Gallons for each clock hour from start to end; null where the hour has no read. */
  hours: (number | null)[]
  gallons: number
  missingHours: number
  /** The hour before the run was read and was not watering. */
  startKnown: boolean
  /** The hour after the run was read and was not watering. */
  endKnown: boolean
  /** Start and end known and no missing hours inside: the only runs used for estimates. */
  complete: boolean
}

const HOUR_MS = 3_600_000
const toMs = (t: string) => Date.UTC(+t.slice(0, 4), +t.slice(5, 7) - 1, +t.slice(8, 10), +t.slice(11, 13))
const fromMs = (ms: number) => new Date(ms).toISOString().slice(0, 13).replace('T', ' ') + ':00'
export const hourOf = (t: string) => Number(t.slice(11, 13))

/**
 * Group watering hours (reads at or above `minGallons`) into runs. Up to `maxGapHours` missing reads between two
 * watering hours stay inside one run, which is then marked incomplete.
 */
export function findRuns(reads: HourlyRead[], s: ScheduleSettings): WateringRun[] {
  if (reads.length === 0) return []
  const byMs = new Map(reads.map((r) => [toMs(r.time), r.gallons]))
  const first = toMs(reads[0].time)
  const last = toMs(reads[reads.length - 1].time)
  const runs: WateringRun[] = []
  let cur: { startMs: number; lastWetMs: number; hours: (number | null)[]; startKnown: boolean } | null = null
  let gap = 0

  const close = (endKnown: boolean) => {
    if (!cur) return
    const hours = cur.hours.slice(0, (cur.lastWetMs - cur.startMs) / HOUR_MS + 1)
    const missingHours = hours.filter((h) => h === null).length
    runs.push({
      start: fromMs(cur.startMs),
      end: fromMs(cur.lastWetMs),
      hours,
      gallons: hours.reduce<number>((sum, h) => sum + (h ?? 0), 0),
      missingHours,
      startKnown: cur.startKnown,
      endKnown,
      complete: cur.startKnown && endKnown && missingHours === 0,
    })
    cur = null
  }

  for (let ms = first; ms <= last; ms += HOUR_MS) {
    const g = byMs.get(ms)
    if (g === undefined) {
      gap++
      if (cur) {
        cur.hours.push(null)
        if (gap > s.maxGapHours) close(false)
      }
      continue
    }
    if (g >= s.minGallons) {
      if (!cur) {
        const prev = byMs.get(ms - HOUR_MS)
        cur = { startMs: ms, lastWetMs: ms, hours: [], startKnown: prev !== undefined && prev < s.minGallons }
      }
      cur.hours.push(g)
      cur.lastWetMs = ms
    } else if (cur) {
      close(gap === 0)
    }
    gap = 0
  }
  close(false) // data ends: we cannot know whether the last run kept going
  return runs
}

export type HourProfile = { hour: number; reported: number; watered: number; avgGallonsWhenWatered: number | null }

/** For each clock hour 0 to 23: how many days have a read, how many of those were watering, and the average flow then. */
export function hourProfile(reads: HourlyRead[], minGallons: number): HourProfile[] {
  return Array.from({ length: 24 }, (_, hour) => {
    const at = reads.filter((r) => hourOf(r.time) === hour)
    const wet = at.filter((r) => r.gallons >= minGallons)
    return {
      hour,
      reported: at.length,
      watered: wet.length,
      avgGallonsWhenWatered: wet.length ? wet.reduce((s, r) => s + r.gallons, 0) / wet.length : null,
    }
  })
}

export type ScheduleSummary = {
  from: string | null
  to: string | null
  days: number
  runs: number
  completeRuns: number
  runsPerWeek: number | null
}

export function summarize(reads: HourlyRead[], runs: WateringRun[]): ScheduleSummary {
  const from = reads[0]?.time ?? null
  const to = reads.at(-1)?.time ?? null
  const days = from && to ? (toMs(to) - toMs(from)) / HOUR_MS / 24 : 0
  return {
    from,
    to,
    days,
    runs: runs.length,
    completeRuns: runs.filter((r) => r.complete).length,
    runsPerWeek: days > 0 ? (runs.length / days) * 7 : null,
  }
}

const median = (xs: number[]) => {
  if (xs.length === 0) return null
  const s = [...xs].sort((a, b) => a - b)
  const mid = Math.floor(s.length / 2)
  return s.length % 2 ? s[mid] : (s[mid - 1] + s[mid]) / 2
}

export type WateringWindow = {
  startHour: number
  endHour: number
  /** Clock hours from first to last watering read, inclusive. */
  hours: number
  runs: number
  /** Median gallons over the complete runs in this window; null when none are complete. */
  medianGallons: number | null
  completeRuns: number
}

/**
 * Watering windows seen (first and last watering read hour), most common first. Only runs whose start and end are
 * both known are counted, so a window is never cut short by a missing read at either edge.
 */
export function wateringWindows(runs: WateringRun[]): WateringWindow[] {
  const groups = new Map<string, WateringRun[]>()
  for (const r of runs.filter((x) => x.startKnown && x.endKnown)) {
    const key = `${hourOf(r.start)}-${hourOf(r.end)}-${r.hours.length}`
    groups.set(key, [...(groups.get(key) ?? []), r])
  }
  return [...groups.values()]
    .map((g) => {
      const complete = g.filter((r) => r.complete)
      return {
        startHour: hourOf(g[0].start),
        endHour: hourOf(g[0].end),
        hours: g[0].hours.length,
        runs: g.length,
        medianGallons: median(complete.map((r) => r.gallons)),
        completeRuns: complete.length,
      }
    })
    .sort((a, b) => b.runs - a.runs || a.startHour - b.startHour)
}

export type TrimEstimate =
  | {
      method: 'measured_gallons' | 'watering_hours'
      /** Fraction of watering water removed, 0 to 1. */
      share: number
      runsUsed: number
      runsSeen: number
    }
  | { method: null; reason: string; runsSeen: number }

/**
 * Share of watering water saved if every run ended `hours` clock hours earlier (a shorter run is removed entirely).
 *
 * When at least `minCompleteShare` of runs are complete, the share is measured: gallons in the final hours of the
 * complete runs over all their gallons. Otherwise complete runs are not a fair sample (on meters with missing
 * late-night reads they are mostly the short nights), so the share is the fraction of watering hours removed across
 * runs with a known start and end, which assumes the same flow every hour.
 *
 * Returns no estimate when the typical run is no longer than `hours`: a run that fits inside one hourly read may last
 * only minutes, so hourly reads cannot show what ending it an hour earlier would do.
 */
export function trimEstimate(runs: WateringRun[], hours: number, minCompleteShare: number): TrimEstimate {
  if (!Number.isInteger(hours) || hours < 1) throw new Error('hours must be a whole number, 1 or more')
  const runsSeen = runs.length
  if (runsSeen === 0) return { method: null, reason: 'No watering was seen in the hourly data.', runsSeen }
  const known = runs.filter((r) => r.startKnown && r.endKnown)
  if (known.length === 0) return { method: null, reason: 'No watering night has both its start and end visible in the hourly data.', runsSeen }
  const typical = median(known.map((r) => r.hours.length)) as number
  if (typical <= hours) {
    return {
      method: null,
      reason: `Watering on this meter usually shows up in ${typical === 1 ? 'a single hourly read' : `${typical} hourly reads`}, so the hourly data cannot show what ending ${hours === 1 ? 'an hour' : `${hours} hours`} earlier would do.`,
      runsSeen,
    }
  }
  const complete = runs.filter((r) => r.complete)
  if (complete.length / runsSeen >= minCompleteShare) {
    const before = complete.reduce((s, r) => s + r.gallons, 0)
    const removed = complete.reduce((s, r) => s + (r.hours.slice(-hours) as number[]).reduce((a, b) => a + b, 0), 0)
    return { method: 'measured_gallons', share: removed / before, runsUsed: complete.length, runsSeen }
  }
  const total = known.reduce((s, r) => s + r.hours.length, 0)
  const removed = known.reduce((s, r) => s + Math.min(hours, r.hours.length), 0)
  return { method: 'watering_hours', share: removed / total, runsUsed: known.length, runsSeen }
}

/** Gallons the hourly reads add up to between two dates (inclusive, whole days), and how many hours have a read. */
export function hourlyTotal(reads: HourlyRead[], fromDate: string, toDate: string): { gallons: number; hoursRead: number; hoursInRange: number } {
  const inRange = reads.filter((r) => r.time.slice(0, 10) >= fromDate && r.time.slice(0, 10) <= toDate)
  const hoursInRange = (toMs(`${toDate} 00:00`) - toMs(`${fromDate} 00:00`)) / HOUR_MS + 24
  return { gallons: inRange.reduce((s, r) => s + r.gallons, 0), hoursRead: inRange.length, hoursInRange }
}

export type BillLike = { id: string; meter: string; period_start: string | null; period_end: string | null; gallons: number | null }
export type TrimBillResult = { id: string; periodStart: string; periodEnd: string; gallons: number; gallonsSaved: number; computedNow: number; computedTrimmed: number; saved: number }

/**
 * Re-price bills with their gallons cut by `share`, using the same calculator the reconciliation checks. Bills without
 * a known period or gallons, or that the calculator cannot price, are left out.
 */
export function trimBills(bills: BillLike[], share: number, rates: RatePeriod[], readPeriods: ReadPeriod[]): TrimBillResult[] {
  return bills.flatMap((b) => {
    if (!b.period_start || !b.period_end || b.gallons === null) return []
    const now = calculateBill(b.meter, b.period_start, b.period_end, b.gallons, rates, readPeriods)
    const gallonsSaved = Math.round(b.gallons * share)
    const trimmed = calculateBill(b.meter, b.period_start, b.period_end, b.gallons - gallonsSaved, rates, readPeriods)
    if (!now.ok || !trimmed.ok) return []
    return [{ id: b.id, periodStart: b.period_start, periodEnd: b.period_end, gallons: b.gallons, gallonsSaved, computedNow: now.total, computedTrimmed: trimmed.total, saved: Math.round((now.total - trimmed.total) * 100) / 100 }]
  })
}

/** "10 PM" style label for a clock hour 0 to 23. */
export function hourLabel(hour: number): string {
  const h = hour % 12 === 0 ? 12 : hour % 12
  return `${h} ${hour < 12 ? 'AM' : 'PM'}`
}
