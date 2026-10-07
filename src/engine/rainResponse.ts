// "Watering after rain": did a meter water through a rain event, or start again before the rain was used up?
// Pure: no UI imports, no I/O. Dates are "YYYY-MM-DD". Watering comes from the same run detection as the schedule
// view (findRuns); cost comes from the leak-cost method (episodeCost). Nothing here prices water on its own.

import type { RatePeriod, ReadPeriod } from './billing'
import { episodeCost, type EpisodeCost } from './leakCost'
import { findRuns, hourOf, type HourlyRead, type ScheduleSettings } from './schedule'

/** One gauge day. `inches` is null when the gauge reported the day as missing; a trace is stored as 0. */
export type RainDay = { date: string; inches: number | null }
/** One day of reference evapotranspiration (inches). null when the station did not report it. */
export type EtoDay = { date: string; inches: number | null }

export type PlantFactorRule = { meters: string[]; months: number[]; factor: number }

export type RainSettings = {
  minEventInches: number
  usableShare: number
  usableCapInches: number
  plantFactors: PlantFactorRule[]
  summerMonths: number[]
  maxDaysSummer: number
  maxDaysWinter: number
  alreadyOffDays: number
  /** A watering run counts for this check only when it starts at or after this hour, or before `nightEndHour`. */
  nightStartHour: number
  nightEndHour: number
}

export type RainEvent = { start: string; end: string; inches: number; usableInches: number }

export type Night = { date: string; gallons: number; missingHours: number; lastDate: string }

export type RainResult = 'watered-through' | 'too-soon' | 'paused' | 'already-off' | 'not-checked' | 'too-early'

export type MeterRainCheck = {
  meter: string
  result: RainResult
  /** Days the usable rain covers, counted from the day after the rain. */
  daysCovered: number
  /** Last day of the skip window; earlier than end + daysCovered when the next rain event starts first. */
  windowEnd: string
  /** Days in the window priced with a monthly-normal ETo because the station had no reading. */
  etoEstimatedDays: number
  firstWatering: string | null
  daysAfter: number | null
  daysEarly: number | null
  /** Watering nights from the night of the rain to the night before the last covered day (watering then lands on a
   * covered day). Empty for already-off and not-checked. */
  nights: Night[]
  gallons: number
  partial: boolean
  cost: EpisodeCost | null
}

export type RainEventCheck = RainEvent & { meters: MeterRainCheck[] }

const DAY_MS = 86_400_000
const dayMs = (d: string) => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10))
export const addDays = (d: string, n: number) => new Date(dayMs(d) + n * DAY_MS).toISOString().slice(0, 10)
export const daysBetween = (a: string, b: string) => Math.round((dayMs(b) - dayMs(a)) / DAY_MS)
const month = (d: string) => Number(d.slice(5, 7))
const round2 = (x: number) => Math.round(x * 100) / 100

/**
 * Days with at least `minInches` of rain. Back-to-back qualifying days merge into one event. A missing gauge day is
 * never read as dry: it ends the run of days, so an event is never stretched across a day nobody measured.
 */
export function findRainEvents(rain: RainDay[], s: Pick<RainSettings, 'minEventInches' | 'usableShare' | 'usableCapInches'>): RainEvent[] {
  const days = [...rain].sort((a, b) => a.date.localeCompare(b.date))
  const events: RainEvent[] = []
  let cur: { start: string; end: string; inches: number } | null = null
  for (const d of days) {
    const wet = d.inches !== null && d.inches >= s.minEventInches
    if (wet && cur && daysBetween(cur.end, d.date) === 1) {
      cur.end = d.date
      cur.inches += d.inches!
    } else {
      if (cur) events.push(cur as RainEvent)
      cur = wet ? { start: d.date, end: d.date, inches: d.inches! } : null
    }
  }
  if (cur) events.push(cur as RainEvent)
  return events.map((e) => ({ ...e, inches: round2(e.inches), usableInches: usableRain(e.inches, s) }))
}

/** Rain the soil keeps: a share of the event, capped, because heavy rain runs off. */
export function usableRain(inches: number, s: Pick<RainSettings, 'usableShare' | 'usableCapInches'>): number {
  return round2(Math.min(inches * s.usableShare, s.usableCapInches))
}

export function plantFactor(meter: string, date: string, rules: PlantFactorRule[]): number | null {
  const m = month(date)
  return rules.find((r) => r.meters.includes(meter) && (r.months.length === 0 || r.months.includes(m)))?.factor ?? null
}

/**
 * Count days forward from the day after the rain, taking each day's ETo x plant factor from the usable rain, until
 * it runs out. Only whole days count: the day the rain runs out partway is not covered, so a rain too small to
 * cover one full day covers 0. Capped by season (season of the first day counted).
 */
export function daysCovered(
  meter: string,
  ev: RainEvent,
  eto: (date: string) => { inches: number; estimated: boolean } | null,
  s: RainSettings,
): { days: number; etoEstimatedDays: number } | null {
  const first = addDays(ev.end, 1)
  const cap = s.summerMonths.includes(month(first)) ? s.maxDaysSummer : s.maxDaysWinter
  let left = ev.usableInches
  let days = 0
  let estimated = 0
  while (days < cap) {
    const d = addDays(first, days)
    const e = eto(d)
    const pf = plantFactor(meter, d, s.plantFactors)
    if (!e || pf === null) return null
    if (left < e.inches * pf) break
    if (e.estimated) estimated++
    left -= e.inches * pf
    days++
  }
  return { days, etoEstimatedDays: estimated }
}

/**
 * Watering nights from hourly reads: runs found by the schedule rule, kept only when they start in the night window,
 * grouped by the evening they belong to (a run that starts after midnight belongs to the night before).
 */
export function wateringNights(reads: HourlyRead[], schedule: ScheduleSettings, s: Pick<RainSettings, 'nightStartHour' | 'nightEndHour'>): Night[] {
  const byNight = new Map<string, Night>()
  for (const r of findRuns(reads, schedule)) {
    const h = hourOf(r.start)
    if (!(h >= s.nightStartHour || h < s.nightEndHour)) continue
    const date = h >= 12 ? r.start.slice(0, 10) : addDays(r.start.slice(0, 10), -1)
    const n = byNight.get(date) ?? { date, gallons: 0, missingHours: 0, lastDate: date }
    n.gallons += r.gallons
    n.missingHours += r.missingHours
    if (r.end.slice(0, 10) > n.lastDate) n.lastDate = r.end.slice(0, 10)
    byNight.set(date, n)
  }
  return [...byNight.values()].sort((a, b) => a.date.localeCompare(b.date))
}

/** Hours of the night window (evening of `date` to the morning after) that have no read. */
export function missingNightHours(readTimes: Set<string>, date: string, s: Pick<RainSettings, 'nightStartHour' | 'nightEndHour'>): number {
  let missing = 0
  const next = addDays(date, 1)
  for (let h = s.nightStartHour; h < 24; h++) if (!readTimes.has(`${date} ${String(h).padStart(2, '0')}:00`)) missing++
  for (let h = 0; h < s.nightEndHour; h++) if (!readTimes.has(`${next} ${String(h).padStart(2, '0')}:00`)) missing++
  return missing
}

export type MeterInput = { meter: string; reads: HourlyRead[]; readPeriods: ReadPeriod[] }

/** Check one event on one meter. `nextStart` is the start of the next rain event, which ends this one's window. */
export function checkMeter(
  ev: RainEvent,
  nextStart: string | null,
  input: MeterInput,
  nights: Night[],
  eto: (date: string) => { inches: number; estimated: boolean } | null,
  s: RainSettings,
  schedule: ScheduleSettings,
  rates: RatePeriod[],
): MeterRainCheck {
  const covered = daysCovered(input.meter, ev, eto, s)
  const days = covered?.days ?? 0
  let windowEnd = addDays(ev.end, days)
  if (nextStart && windowEnd >= nextStart) windowEnd = addDays(nextStart, -1)
  // A night's watering serves the next day, so the nights that count are the night of the rain up to the night
  // before the last covered day. A rain that covers no full day has no such nights.
  const lastNight = addDays(windowEnd, -1)
  const base: MeterRainCheck = {
    meter: input.meter, result: 'not-checked', daysCovered: days, windowEnd, etoEstimatedDays: covered?.etoEstimatedDays ?? 0,
    firstWatering: null, daysAfter: null, daysEarly: null, nights: [], gallons: 0, partial: false, cost: null,
  }
  const firstRead = input.reads[0]?.time ?? null
  const lastRead = input.reads.at(-1)?.time ?? null
  const lookbackStart = addDays(ev.start, -s.alreadyOffDays)
  // Hourly data must cover the whole look-back, or we cannot say whether the meter was already off.
  if (!covered || !firstRead || !lastRead || firstRead > `${lookbackStart} ${String(s.nightStartHour).padStart(2, '0')}:00` || lastRead < `${ev.start} 12:00`) return base
  if (!nights.some((n) => n.date >= lookbackStart && n.date < ev.start)) return { ...base, result: 'already-off' }

  const inWindow = nights.filter((n) => n.date >= ev.start && n.date <= lastNight)
  const first = nights.find((n) => n.date >= ev.start) ?? null
  const daysAfter = first ? Math.max(0, daysBetween(ev.end, first.date)) : null
  const readTimes = new Set(input.reads.map((r) => r.time))
  const wateredDates = new Set(inWindow.map((n) => n.date))
  let hiddenGap = false
  for (let d = ev.start; d <= lastNight; d = addDays(d, 1)) {
    if (!wateredDates.has(d) && missingNightHours(readTimes, d, s) > schedule.maxGapHours) hiddenGap = true
  }
  const windowDone = lastRead >= `${windowEnd} ${String(s.nightEndHour).padStart(2, '0')}:00`
  const result: RainResult = inWindow.some((n) => n.date <= addDays(ev.end, 1))
    ? 'watered-through'
    : inWindow.length > 0
      ? 'too-soon'
      : windowDone
        ? 'paused'
        : 'too-early'
  const gallons = Math.round(inWindow.reduce((sum, n) => sum + n.gallons, 0))
  const cost = gallons > 0
    ? episodeCost(input.meter, { from: inWindow[0].date, to: inWindow.at(-1)!.lastDate, gallons }, rates, input.readPeriods)
    : null
  return {
    ...base,
    result,
    firstWatering: first?.date ?? null,
    daysAfter,
    daysEarly: daysAfter !== null && first && first.date <= lastNight ? days - daysAfter : null,
    nights: inWindow,
    gallons,
    partial: inWindow.some((n) => n.missingHours > 0) || hiddenGap,
    cost,
  }
}

export function checkRain(
  rain: RainDay[],
  eto: (date: string) => { inches: number; estimated: boolean } | null,
  meters: MeterInput[],
  s: RainSettings,
  schedule: ScheduleSettings,
  rates: RatePeriod[],
): RainEventCheck[] {
  const events = findRainEvents(rain, s)
  const nightsBy = new Map(meters.map((m) => [m.meter, wateringNights(m.reads, schedule, s)]))
  return events.map((ev, i) => ({
    ...ev,
    meters: meters.map((m) => checkMeter(ev, events[i + 1]?.start ?? null, m, nightsBy.get(m.meter)!, eto, s, schedule, rates)),
  }))
}

/** Results that count toward the summary. Already-off, not-checked, and too-early rows are listed but not counted. */
export const COUNTED: RainResult[] = ['watered-through', 'too-soon', 'paused']

export const costLow = (c: EpisodeCost | null) => (!c ? 0 : c.kind === 'billed' ? c.usd : c.kind === 'range' ? c.low : null)
export const costHigh = (c: EpisodeCost | null) => (!c ? 0 : c.kind === 'billed' ? c.usd : c.kind === 'range' ? c.high : null)

export type RainSummary = {
  events: number
  wateredThrough: number
  tooSoon: number
  paused: number
  avgDaysEarly: number | null
  gallons: number
  costLow: number
  costHigh: number
  unpricedGallons: number
  partial: boolean
}

export function summarizeRain(checks: RainEventCheck[]): RainSummary {
  const rows = checks.flatMap((e) => e.meters).filter((m) => COUNTED.includes(m.result))
  const wet = rows.filter((m) => m.result === 'watered-through' || m.result === 'too-soon')
  const early = rows.filter((m) => m.result === 'too-soon' && m.daysEarly !== null)
  const priced = wet.filter((m) => costLow(m.cost) !== null)
  return {
    events: checks.length,
    wateredThrough: rows.filter((m) => m.result === 'watered-through').length,
    tooSoon: rows.filter((m) => m.result === 'too-soon').length,
    paused: rows.filter((m) => m.result === 'paused').length,
    avgDaysEarly: early.length ? early.reduce((s, m) => s + m.daysEarly!, 0) / early.length : null,
    gallons: wet.reduce((s, m) => s + m.gallons, 0),
    costLow: round2(priced.reduce((s, m) => s + costLow(m.cost)!, 0)),
    costHigh: round2(priced.reduce((s, m) => s + costHigh(m.cost)!, 0)),
    unpricedGallons: wet.filter((m) => costLow(m.cost) === null).reduce((s, m) => s + m.gallons, 0),
    partial: wet.some((m) => m.partial),
  }
}

export const RESULT_TEXT: Record<RainResult, string> = {
  'watered-through': 'Watered through the rain',
  'too-soon': 'Started again too soon',
  paused: 'Paused as it should',
  'already-off': 'Already off',
  'not-checked': 'Not checked: no hourly meter data',
  'too-early': 'Too soon to tell',
}

const CSV_HEAD = [
  'event start', 'event end', 'rain in', 'usable rain in', 'meter', 'days covered', 'result', 'first watering date',
  'days after rain', 'days early', 'nights watered inside window', 'dates watered', 'gallons', 'partial', 'cost low', 'cost high',
]

const csvCell = (v: string | number | null) => {
  const s = v === null ? '' : String(v)
  return /[",\n]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s
}

/** One row per meter per event, oldest first. Gallons and cost are blank on rows the summary does not count. */
export function rainCsv(checks: RainEventCheck[], meterName: (id: string) => string): string {
  const lines = [CSV_HEAD.join(',')]
  for (const e of checks) {
    for (const m of e.meters) {
      const counted = COUNTED.includes(m.result)
      const wet = m.result === 'watered-through' || m.result === 'too-soon'
      lines.push([
        e.start, e.end, e.inches.toFixed(2), e.usableInches.toFixed(2), meterName(m.meter), m.daysCovered, RESULT_TEXT[m.result],
        counted ? m.firstWatering : null, counted ? m.daysAfter : null, counted ? m.daysEarly : null,
        counted ? m.nights.length : null, counted ? m.nights.map((n) => n.date).join(' ') : null,
        counted ? m.gallons : null, counted ? (m.partial ? 'yes' : 'no') : null,
        wet ? costLow(m.cost)?.toFixed(2) ?? null : counted ? '0.00' : null,
        wet ? costHigh(m.cost)?.toFixed(2) ?? null : counted ? '0.00' : null,
      ].map(csvCell).join(','))
    }
  }
  return lines.join('\n') + '\n'
}
