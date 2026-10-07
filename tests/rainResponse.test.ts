import { describe, expect, it } from 'vitest'
import type { RatePeriod, ReadPeriod } from '../src/engine/billing'
import { addDays, checkRain, daysCovered, findRainEvents, rainCsv, summarizeRain, usableRain, wateringNights, type RainDay, type RainSettings } from '../src/engine/rainResponse'
import { buildData } from '../scripts/build-data'

const data = buildData()
const rc = (data.config.site as { rain_check: Record<string, { value: unknown }> }).rain_check
const settings: RainSettings = {
  minEventInches: rc.min_event_inches.value as number,
  usableShare: rc.usable_share.value as number,
  usableCapInches: rc.usable_cap_inches.value as number,
  plantFactors: rc.plant_factors.value as RainSettings['plantFactors'],
  summerMonths: rc.summer_months.value as number[],
  maxDaysSummer: rc.max_days_summer.value as number,
  maxDaysWinter: rc.max_days_winter.value as number,
  alreadyOffDays: rc.already_off_days.value as number,
  nightStartHour: rc.night_start_hour.value as number,
  nightEndHour: rc.night_end_hour.value as number,
}
const ws = (data.config.site as { watering_schedule: { watering_hour_min_gallons: { value: number }; max_gap_hours: { value: number } } }).watering_schedule
const schedule = { minGallons: ws.watering_hour_min_gallons.value, maxGapHours: ws.max_gap_hours.value }
const rates = data.rates as unknown as RatePeriod[]
const meters = data.meters.map((m) => ({ meter: m.id, reads: data.hourly[m.id].reads, readPeriods: data.billingPeriods[m.id].rows as ReadPeriod[] }))

// ETo for these tests: the Queen Creek monthly normal on file, spread evenly over the month (the same fallback the
// site uses before daily ETo is fetched). A constant 0.25 in/day is used where a test needs round numbers.
const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const normalEto = (date: string) => {
  const mo = Number(date.slice(5, 7))
  const monthly = data.monthlyNormals!.months.find((m) => m.month === MONTHS[mo - 1])!.eto!
  return { inches: monthly / new Date(Date.UTC(2026, mo, 0)).getUTCDate(), estimated: true }
}
const flat = (inches: number) => () => ({ inches, estimated: false })

/** Dry days from Jul 1 to Oct 5 with the given rain. The rain amounts are the test cases stated on 2026-10-07. */
function season(wet: Record<string, number>): RainDay[] {
  const days: RainDay[] = []
  for (let d = '2026-07-01'; d <= '2026-10-05'; d = addDays(d, 1)) days.push({ date: d, inches: wet[d] ?? 0 })
  return days
}

describe('findRainEvents', () => {
  it('keeps days at or above the threshold and merges back-to-back days', () => {
    const ev = findRainEvents(
      [
        { date: '2026-09-14', inches: 0.1 },
        { date: '2026-09-15', inches: 0.5 },
        { date: '2026-09-16', inches: 0.3 },
        { date: '2026-09-18', inches: 0.2 },
      ],
      settings,
    )
    expect(ev.map((e) => [e.start, e.end, e.inches])).toEqual([
      ['2026-09-15', '2026-09-16', 0.8],
      ['2026-09-18', '2026-09-18', 0.2],
    ])
  })

  it('never treats a missing gauge day as dry or wet: it ends an event', () => {
    const ev = findRainEvents(
      [
        { date: '2026-09-15', inches: 0.5 },
        { date: '2026-09-16', inches: null },
        { date: '2026-09-17', inches: 0.4 },
      ],
      settings,
    )
    expect(ev).toHaveLength(2)
  })

  it('counts 75% of the rain as usable, capped at 1.5 in', () => {
    expect(usableRain(0.83, settings)).toBeCloseTo(0.62, 2)
    expect(usableRain(3, settings)).toBe(1.5)
  })
})

describe('daysCovered', () => {
  const ev = (end: string, usable: number) => ({ start: end, end, inches: usable / 0.75, usableInches: usable })
  it('counts only whole days the usable rain covers', () => {
    // Park in summer: 0.25 x 0.6 = 0.15 a day. 0.62 in covers 4 whole days (0.60), not 5.
    expect(daysCovered('meter-1', ev('2026-08-31', 0.62), flat(0.25), settings)!.days).toBe(4)
    // Drip: 0.25 x 0.3 = 0.075 a day, so 0.62 would last 8 days, capped at 7 in summer.
    expect(daysCovered('meter-3', ev('2026-08-31', 0.62), flat(0.25), settings)!.days).toBe(7)
  })
  it('uses the winter cap and the overseeded turf plant factor in winter', () => {
    // 0.05 x 0.8 = 0.04 a day; 1.5 in would last 37 days, capped at 14.
    expect(daysCovered('meter-1', ev('2026-12-10', 1.5), flat(0.05), settings)!.days).toBe(14)
    // Drip in winter: 0.05 x 0.3 = 0.015 a day, 0.3 in lasts 20, capped at 14.
    expect(daysCovered('meter-4', ev('2026-12-10', 0.3), flat(0.05), settings)!.days).toBe(14)
  })
})

describe('wateringNights', () => {
  it('ignores single daytime hours on the park meters', () => {
    const nights = wateringNights(data.hourly['meter-1'].reads, schedule, settings)
    // 171 gallons at 1 PM on Aug 31 is not a watering night; the 10 PM run on Aug 30 is.
    expect(nights.find((n) => n.date === '2026-08-31')).toBeUndefined()
    expect(nights.find((n) => n.date === '2026-08-30')!.gallons).toBeGreaterThan(10000)
  })
})

describe('checkRain on the real hourly data (test cases from 2026-10-07)', () => {
  const rain = season({ '2026-07-17': 0.44, '2026-07-21': 0.68, '2026-08-31': 0.83 })
  const checks = checkRain(rain, normalEto, meters, settings, schedule, rates)
  const at = (start: string, meter: string) => checks.find((e) => e.start === start)!.meters.find((m) => m.meter === meter)!

  it('Aug 31, 0.83 in: both park meters started again too soon, 1 to 2 days early', () => {
    for (const m of ['meter-1', 'meter-2']) {
      const r = at('2026-08-31', m)
      expect(r.result).toBe('too-soon')
      expect(r.firstWatering).toBe('2026-09-02')
      expect(r.daysAfter).toBe(2)
      expect(r.daysCovered).toBeGreaterThanOrEqual(3)
      expect(r.daysCovered).toBeLessThanOrEqual(4)
      expect(r.daysEarly).toBeGreaterThanOrEqual(1)
      expect(r.daysEarly).toBeLessThanOrEqual(2)
      expect(r.gallons).toBeGreaterThan(0)
      expect(r.cost).not.toBeNull()
    }
  })

  it('Jul 21, 0.68 in: the park watered through the rain', () => {
    expect(at('2026-07-21', 'meter-1').result).toBe('watered-through')
    expect(at('2026-07-21', 'meter-2').result).toBe('watered-through')
    expect(at('2026-07-21', 'meter-2').firstWatering).toBe('2026-07-22')
  })

  it('Jul 17, 0.44 in: the park paused as it should', () => {
    expect(at('2026-07-17', 'meter-1').result).toBe('paused')
    expect(at('2026-07-17', 'meter-2').result).toBe('paused')
    expect(at('2026-07-17', 'meter-1').gallons).toBe(0)
  })

  it('says "already off" when a meter did not water in the 7 days before the rain', () => {
    // Meter 3 has no overnight watering between the nights of Jul 12 and Jul 27 in the hourly data.
    const c = checkRain(season({ '2026-07-24': 0.5 }), normalEto, meters, settings, schedule, rates)
    expect(c[0].meters.find((m) => m.meter === 'meter-3')!.result).toBe('already-off')
  })

  it('does not check events before the hourly data covers the look-back week', () => {
    const c = checkRain(season({ '2026-07-05': 0.5 }), normalEto, meters, settings, schedule, rates)
    expect(c[0].meters.every((m) => m.result === 'not-checked')).toBe(true)
  })

  it('summary counts match the CSV rows', () => {
    const s = summarizeRain(checks)
    const csv = rainCsv(checks, (id) => id).trim().split('\n').slice(1).map((l) => l.split(','))
    const counted = csv.filter((r) => r[6] === 'Watered through the rain' || r[6] === 'Started again too soon')
    expect(counted.length).toBe(s.wateredThrough + s.tooSoon)
    expect(counted.reduce((t, r) => t + Number(r[12]), 0)).toBe(s.gallons)
    expect(counted.reduce((t, r) => t + Number(r[14]), 0)).toBeCloseTo(s.costLow, 2)
    expect(counted.reduce((t, r) => t + Number(r[15]), 0)).toBeCloseTo(s.costHigh, 2)
    expect(s.events).toBe(3)
  })
})
