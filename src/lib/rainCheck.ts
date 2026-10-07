// "Watering after rain" from the site data. Shared by the Meters screen, Overview, Recommended moves, and the CSV
// written at build time, so every place shows the same numbers. No React here.
import type { SiteData } from '../../scripts/site-data'
import type { RatePeriod, ReadPeriod } from '../engine/billing'
import { checkRain, summarizeRain, wateringNights, type Night, type RainEventCheck, type RainSettings, type RainSummary } from '../engine/rainResponse'
import type { ScheduleSettings } from '../engine/schedule'
import { meterNumber } from './data'

type Sourced<T> = { value: T; source: string }
type RainConfig = {
  since: Sourced<string>
  min_event_inches: Sourced<number>
  usable_share: Sourced<number>
  usable_cap_inches: Sourced<number>
  plant_factors: Sourced<RainSettings['plantFactors']>
  summer_months: Sourced<number[]>
  max_days_summer: Sourced<number>
  max_days_winter: Sourced<number>
  already_off_days: Sourced<number>
  night_start_hour: Sourced<number>
  night_end_hour: Sourced<number>
}

const MONTH_ABBR = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export type RainCheck = {
  settings: RainSettings
  since: string
  checks: RainEventCheck[]
  summary: RainSummary
  rainDays: number
  missingRainDays: number
  rainThrough: string | null
  etoDays: number
  /** Some skip windows used the monthly-normal ETo because the station had no daily value. */
  usesNormals: boolean
  hourlyFrom: string | null
  /** Every watering night per meter, by the same rule the check uses (for the charts). */
  nightsByMeter: Record<string, Night[]>
  /** Events after the action's start date where every verify meter paused. */
  actionWorking: Set<string>
}

/** Plain name and number: "Entry parkway (meter 3)" when the meter has a name, else "Meter 1 (Park controller)". */
export function meterName(data: SiteData, id: string): string {
  const m = data.meters.find((x) => x.id === id)
  if (m?.name) return `${m.name} (meter ${meterNumber(id)})`
  return m?.controller ? `Meter ${meterNumber(id)} (${m.controller.name})` : `Meter ${meterNumber(id)}`
}

export function buildRainCheck(data: SiteData): RainCheck | null {
  const cfg = (data.config.site as { rain_check?: RainConfig }).rain_check
  const sched = (data.config.site as { watering_schedule?: { watering_hour_min_gallons: Sourced<number>; max_gap_hours: Sourced<number> } }).watering_schedule
  if (!cfg || !sched) return null
  const settings: RainSettings = {
    minEventInches: cfg.min_event_inches.value,
    usableShare: cfg.usable_share.value,
    usableCapInches: cfg.usable_cap_inches.value,
    plantFactors: cfg.plant_factors.value,
    summerMonths: cfg.summer_months.value,
    maxDaysSummer: cfg.max_days_summer.value,
    maxDaysWinter: cfg.max_days_winter.value,
    alreadyOffDays: cfg.already_off_days.value,
    nightStartHour: cfg.night_start_hour.value,
    nightEndHour: cfg.night_end_hour.value,
  }
  const schedule: ScheduleSettings = { minGallons: sched.watering_hour_min_gallons.value, maxGapHours: sched.max_gap_hours.value }
  const since = cfg.since.value
  const rain = (data.dailyRain?.days ?? []).filter((d) => d.date >= since)
  const etoBy = new Map((data.dailyEto?.days ?? []).filter((d) => d.inches !== null).map((d) => [d.date, d.inches as number]))
  // Days the station has not reported yet use the station's monthly normal, spread evenly over the month.
  const normals = new Map((data.monthlyNormals?.months ?? []).map((m) => [MONTH_ABBR.indexOf(m.month) + 1, m.eto]))
  const eto = (date: string) => {
    const v = etoBy.get(date)
    if (v !== undefined) return { inches: v, estimated: false }
    const mo = Number(date.slice(5, 7))
    const monthly = normals.get(mo)
    if (monthly == null) return null
    const daysInMonth = new Date(Date.UTC(Number(date.slice(0, 4)), mo, 0)).getUTCDate()
    return { inches: monthly / daysInMonth, estimated: true }
  }
  const rates = data.rates as unknown as RatePeriod[]
  const meters = data.meters
    .filter((m) => data.hourly[m.id])
    .map((m) => ({ meter: m.id, reads: data.hourly[m.id].reads, readPeriods: (data.billingPeriods[m.id]?.rows ?? []) as ReadPeriod[] }))
  const checks = checkRain(rain, eto, meters, settings, schedule, rates)
  const actionWorking = new Set<string>()
  for (const a of data.actions) {
    if (!a.start_date) continue
    for (const e of checks) {
      if (e.start <= a.start_date || e.inches < a.verify_min_inches) continue
      if (a.verify_meters.every((id) => e.meters.find((m) => m.meter === id)?.result === 'paused')) actionWorking.add(e.start)
    }
  }
  const firstHourly = Object.values(data.hourly).map((h) => h.reads[0]?.time).filter(Boolean).sort()[0] ?? null
  return {
    settings,
    since,
    checks,
    summary: summarizeRain(checks),
    rainDays: rain.length,
    missingRainDays: rain.filter((d) => d.inches === null).length,
    rainThrough: rain.at(-1)?.date ?? null,
    etoDays: etoBy.size,
    usesNormals: checks.some((e) => e.meters.some((m) => m.etoEstimatedDays > 0)),
    hourlyFrom: firstHourly ? firstHourly.slice(0, 10) : null,
    actionWorking,
    nightsByMeter: Object.fromEntries(meters.map((m) => [m.meter, wateringNights(m.reads, schedule, settings)])),
  }
}
