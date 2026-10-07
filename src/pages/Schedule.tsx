import { HowCalculated } from '../components/ui'
import { useState } from 'react'
import type { SiteData } from '../../scripts/site-data'
import { fmt, meterNumber, meterName } from '../lib/data'
import type { RatePeriod } from '../engine/billing'
import {
  findRuns,
  hourLabel,
  hourProfile,
  hourlyTotal,
  summarize,
  trimBills,
  trimEstimate,
  wateringWindows,
  type HourProfile,
  type WateringRun,
} from '../engine/schedule'

type ScheduleConfig = {
  watering_hour_min_gallons: { value: number }
  max_gap_hours: { value: number }
  measured_min_complete_share: { value: number }
}

const TRIM_CHOICES = [0, 1, 2, 3] as const
/** Chart runs noon to noon so a night's watering is one unbroken stretch. */
const CHART_HOURS = Array.from({ length: 24 }, (_, i) => (i + 12) % 24)

const day = (iso: string) => new Date(`${iso.slice(0, 10)}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const roundTo = (n: number, step: number) => Math.round(n / step) * step
const windowText = (start: number, end: number) => (start === end ? `${hourLabel(start)} read only` : `${hourLabel(start)} to ${hourLabel(end)}`)

export function Schedule({ data }: { data: SiteData }) {
  const [trim, setTrim] = useState<(typeof TRIM_CHOICES)[number]>(0)
  const cfg = (data.config.site as { watering_schedule?: ScheduleConfig }).watering_schedule
  const meters = data.meters.filter((m) => data.hourly[m.id]?.reads.length)

  if (!cfg) {
    return (
      <section role="alert">
        <h1 className="text-2xl font-bold">Watering schedule</h1>
        <p className="mt-4 text-ink-2">The watering schedule settings are missing, so this page cannot be shown right now.</p>
      </section>
    )
  }
  if (meters.length === 0) {
    return (
      <section>
        <h1 className="text-2xl font-bold">Watering schedule</h1>
        <p className="mt-4 text-ink-2">No hourly meter reads are on file yet, so we cannot show when each meter waters.</p>
      </section>
    )
  }

  const settings = { minGallons: cfg.watering_hour_min_gallons.value, maxGapHours: cfg.max_gap_hours.value }
  const allReads = meters.flatMap((m) => data.hourly[m.id].reads)
  const first = allReads.map((r) => r.time).sort()[0]
  const last = allReads.map((r) => r.time).sort().at(-1)!

  return (
    <article>
      <h1 className="text-2xl font-bold md:text-3xl">Watering schedule</h1>
      <p className="mt-2 max-w-prose text-ink-2">
        When each meter waters, how long, and how much, from Waterfluence hourly meter reads, {day(first)} to {day(last)}, {last.slice(0, 4)}. Pick an
        option below to see what ending each night's watering earlier would save.
      </p>

      <fieldset className="mt-6 rounded-xl bg-surface p-4 ring-1 ring-[var(--ring)]">
        <legend className="px-1 text-base font-bold">What if every watering night ended earlier?</legend>
        <div className="mt-2 flex flex-wrap gap-2">
          {TRIM_CHOICES.map((n) => (
            <label
              key={n}
              className={`flex cursor-pointer items-center gap-2 rounded-lg border-2 px-3 py-2 text-sm ${trim === n ? 'border-ink font-semibold' : 'border-line'}`}
            >
              <input type="radio" name="trim" value={n} checked={trim === n} onChange={() => setTrim(n)} className="h-4 w-4 accent-[var(--ink)]" />
              {n === 0 ? 'No change' : n === 1 ? '1 hour earlier' : `${n} hours earlier`}
            </label>
          ))}
        </div>
      </fieldset>

      <ul className="mt-8 space-y-6">
        {meters.map((m) => (
          <MeterSchedule key={m.id} meterId={m.id} data={data} settings={settings} minCompleteShare={cfg.measured_min_complete_share.value} trim={trim} />
        ))}
      </ul>

      <section aria-labelledby="notes-heading" className="mt-10 max-w-prose text-sm">
        <h2 id="notes-heading" className="text-xl font-bold">
          How to read this
        </h2>
        <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-2">
          <li>
            Times are the clock hour Waterfluence puts on each hourly read. Waterfluence has not confirmed whether that marks the start or the end of the hour, so
            real times may be an hour earlier.
          </li>
          <li>An hour counts as watering when it reads {fmt.int(settings.minGallons)} gallons or more. Small steady flow below that shows up as a leak flag instead.</li>
          <li>
            Waterfluence leaves out some late-night reads, mostly inside the watering window on meters 1, 3, and 4. Nights with a missing hour are marked partial
            and their gallons are not used directly. The City bill is the official record of how much water each meter used.
          </li>
          <li>
            Savings are worked out by cutting that share of gallons from a real City bill in the same weeks and re-pricing it with the same calculator that checks
            every bill. Summer bills are the largest, so a winter month would save less. Some of each bill is not watering (for example a small leak), so the
            saving may be a little high.
          </li>
          <li>
            Ending earlier shortens whichever stations water last each night. Which zones those are is not recorded yet, so this page cannot tell which plants
            would get less water. Trees need deep watering even if surrounding plants are cut back: losing a mature tree costs far more than the water saved.
            Turf that gets too little water goes dormant and can take weeks to recover.
          </li>
        </ul>
      </section>
    </article>
  )
}

function MeterSchedule({
  meterId,
  data,
  settings,
  minCompleteShare,
  trim,
}: {
  meterId: string
  data: SiteData
  settings: { minGallons: number; maxGapHours: number }
  minCompleteShare: number
  trim: number
}) {
  const hourly = data.hourly[meterId]
  const reads = hourly.reads
  const runs = findRuns(reads, settings)
  const summary = summarize(reads, runs)
  const windows = wateringWindows(runs)
  const profile = hourProfile(reads, settings.minGallons)
  const partial = runs.filter((r) => !r.complete).length
  const from = reads[0].time.slice(0, 10)
  const to = reads.at(-1)!.time.slice(0, 10)
  const coveredBills = data.bills
    .filter((b) => b.meter === meterId && b.reconciled === 'pass' && b.period_start && b.period_end && b.period_start >= from && b.period_end <= to)
    .sort((a, b) => a.bill_date.localeCompare(b.bill_date))
  const coverage = coveredBills
    .filter((b) => b.gallons)
    .map((b) => ({ bill: b, hourly: hourlyTotal(reads, b.period_start!, b.period_end!) }))
  const top = windows[0]
  const knownNights = windows.reduce((s, w) => s + w.runs, 0)
  const estimate = trim > 0 ? trimEstimate(runs, trim, minCompleteShare) : null
  const priced = estimate?.method ? trimBills(coveredBills, estimate.share, data.rates as unknown as RatePeriod[], data.billingPeriods[meterId]?.rows ?? []) : []

  return (
    <li id={`schedule-${meterId}`} className="rounded-xl bg-surface p-5 ring-1 ring-[var(--ring)]">
      <h2 className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
        <span className="text-lg font-bold">{meterName(meterId)}</span>
        <span className="text-sm text-ink-2">{data.meters.find((m) => m.id === meterId)?.location ?? ''}</span>
      </h2>

      {runs.length === 0 ? (
        <p className="mt-3 text-ink-2">No watering was seen in the hourly reads from {day(from)} to {day(to)}.</p>
      ) : (
        <>
          <dl className="mt-4 grid gap-3 sm:grid-cols-3">
            <Tile
              value={top ? windowText(top.startHour, top.endHour) : 'Not visible'}
              label={
                top
                  ? `most common watering window, ${top.runs} of ${knownNights} nights where the start and end are both visible`
                  : 'no night has both its start and end visible'
              }
            />
            <Tile value={summary.runsPerWeek !== null ? `${summary.runsPerWeek.toFixed(1)} a week` : 'Missing'} label={`watering runs, ${summary.runs} seen in ${Math.round(summary.days)} days`} />
            <Tile
              value={top?.medianGallons != null ? `${fmt.int(roundTo(top.medianGallons, 100))} gal` : 'Not measurable'}
              label={top?.medianGallons != null ? `typical gallons in a ${windowText(top.startHour, top.endHour)} run` : 'every run in the most common window has a missing hour'}
            />
          </dl>

          {estimate && <TrimResult trim={trim} estimate={estimate} priced={priced} />}

          <HourChart profile={profile} meterId={meterId} />

          {windows.length > 1 && (
            <div className="mt-5">
              <h3 className="text-sm font-semibold">All watering windows seen</h3>
              <ul className="mt-2 space-y-1 text-sm">
                {windows.slice(0, 5).map((w) => (
                  <li key={`${w.startHour}-${w.endHour}-${w.hours}`} className="tabular">
                    {windowText(w.startHour, w.endHour)}: {w.runs} {w.runs === 1 ? 'night' : 'nights'}
                    {w.medianGallons != null ? `, about ${fmt.int(roundTo(w.medianGallons, 100))} gallons each` : ', gallons not measurable (missing hours)'}
                  </li>
                ))}
                {windows.length > 5 && <li className="text-ink-2">and {windows.length - 5} other windows seen once or twice</li>}
              </ul>
            </div>
          )}

          <RecentRuns runs={runs} />
        </>
      )}

      <HowCalculated title="About these readings">
      <div className="mt-5 space-y-1 text-sm text-ink-2">
        {partial > 0 && (
          <p>
            {partial} of {runs.length} watering runs are partial: a read is missing at the start, the end, or in the middle.
          </p>
        )}
        {coverage.map(({ bill, hourly: h }) => (
          <p key={bill.id}>
            For the City read period {day(bill.period_start!)} to {day(bill.period_end!)}, the hourly reads add up to {fmt.pct(h.gallons / bill.gallons!)} of the{' '}
            {fmt.int(bill.gallons!)} gallons billed ({h.hoursRead} of {h.hoursInRange} hours read).
          </p>
        ))}
        <p>Source: {hourly.source}</p>
      </div>
      </HowCalculated>
    </li>
  )
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col rounded-lg border border-line p-3">
      <dt className="order-2 mt-1 text-sm text-ink-2">{label}</dt>
      <dd className="order-1 text-xl font-bold">{value}</dd>
    </div>
  )
}

function TrimResult({
  trim,
  estimate,
  priced,
}: {
  trim: number
  estimate: ReturnType<typeof trimEstimate>
  priced: ReturnType<typeof trimBills>
}) {
  const what = trim === 1 ? 'Ending 1 hour earlier' : `Ending ${trim} hours earlier`
  return (
    <section aria-live="polite" className="mt-5 rounded-lg border-2 border-ink p-4">
      <h3 className="font-bold">{what}</h3>
      {estimate.method === null ? (
        <p className="mt-1 text-sm">{estimate.reason} You can try a percent turn-down for this meter in the Savings calculator.</p>
      ) : (
        <>
          <p className="mt-1 text-2xl font-bold">about {fmt.pct(estimate.share)} less watering water</p>
          {priced.map((p) => (
            <p key={p.id} className="mt-1">
              On the City bill for {day(p.periodStart)} to {day(p.periodEnd)}, that is about {fmt.int(roundTo(p.gallonsSaved, 1000))} gallons and{' '}
              <strong>{fmt.usd(p.saved)}</strong> (bill re-priced from {fmt.usd(p.computedNow)} to {fmt.usd(p.computedTrimmed)}).
            </p>
          ))}
          {priced.length === 0 && <p className="mt-1 text-sm text-ink-2">No reconciled City bill falls inside the hourly data yet, so dollars are not shown.</p>}
          <p className="mt-2 text-sm text-ink-2">
            {estimate.method === 'measured_gallons'
              ? `Measured: gallons in the last ${trim === 1 ? 'hour' : `${trim} hours`} of ${estimate.runsUsed} fully read watering runs, out of ${estimate.runsSeen} seen. Confidence: medium.`
              : `Rough: this meter has missing late-night reads, so this is the share of watering hours removed across ${estimate.runsUsed} runs with a visible start and end, assuming the same flow every hour. On meter 2, where every hour is read, this shortcut gives a higher number than the measured one, so treat it as an upper end. Confidence: low.`}
          </p>
        </>
      )}
    </section>
  )
}

function HourChart({ profile, meterId }: { profile: HourProfile[]; meterId: string }) {
  const byHour = new Map(profile.map((p) => [p.hour, p]))
  const max = Math.max(1, ...profile.map((p) => p.watered))
  const W = 24 * 24
  const H = 120
  const id = `hours-${meterId}`
  return (
    <figure className="mt-6" aria-labelledby={`${id}-cap`}>
      <figcaption id={`${id}-cap`} className="text-sm font-semibold">
        Days with watering at each hour, noon to noon
      </figcaption>
      <svg viewBox={`0 0 ${W} ${H + 22}`} className="mt-2 w-full" role="img" aria-label="Bar chart of days with watering at each clock hour. The table below has the same numbers.">
        <line x1={0} x2={W} y1={H} y2={H} stroke="var(--axis)" strokeWidth={1} />
        {CHART_HOURS.map((hour, i) => {
          const p = byHour.get(hour)!
          const h = (p.watered / max) * (H - 8)
          return (
            <g key={hour}>
              <rect x={i * 24} y={0} width={24} height={H} fill="transparent">
                <title>
                  {hourLabel(hour)}: watering on {p.watered} of {p.reported} days read
                  {p.avgGallonsWhenWatered !== null ? `, about ${fmt.int(Math.round(p.avgGallonsWhenWatered))} gallons in that hour` : ''}
                </title>
              </rect>
              {p.watered > 0 && <rect x={i * 24 + 3} y={H - h} width={18} height={h} rx={4} fill="var(--bar)" pointerEvents="none" />}
              {hour % 6 === 0 && (
                <text x={i * 24 + 12} y={H + 16} textAnchor="middle" fontSize={11} fill="var(--ink-2)">
                  {hour === 0 ? 'midnight' : hour === 12 ? 'noon' : hourLabel(hour)}
                </text>
              )}
            </g>
          )
        })}
      </svg>
      <details className="mt-1 text-sm">
        <summary className="cursor-pointer text-ink-2">Show as a table</summary>
        <div className="mt-2 overflow-x-auto">
          <table className="w-full min-w-[22rem] text-left">
            <caption className="sr-only">Watering by clock hour for meter {meterNumber(meterId)}</caption>
            <thead className="border-b border-line text-ink-2">
              <tr>
                <th scope="col" className="py-1 pr-3 font-semibold">Hour read</th>
                <th scope="col" className="py-1 pr-3 text-right font-semibold">Days watering</th>
                <th scope="col" className="py-1 pr-3 text-right font-semibold">Days read</th>
                <th scope="col" className="py-1 text-right font-semibold">Average gallons when watering</th>
              </tr>
            </thead>
            <tbody className="tabular">
              {CHART_HOURS.map((hour) => {
                const p = byHour.get(hour)!
                return (
                  <tr key={hour} className="border-b border-line last:border-0">
                    <th scope="row" className="py-1 pr-3 font-normal">{hourLabel(hour)}</th>
                    <td className="py-1 pr-3 text-right">{p.watered}</td>
                    <td className="py-1 pr-3 text-right">{p.reported}</td>
                    <td className="py-1 text-right">{p.avgGallonsWhenWatered === null ? '' : fmt.int(Math.round(p.avgGallonsWhenWatered))}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </details>
    </figure>
  )
}

function RecentRuns({ runs }: { runs: WateringRun[] }) {
  const recent = runs.slice(-10).reverse()
  return (
    <details className="mt-5 text-sm">
      <summary className="cursor-pointer font-semibold">Last {recent.length} watering runs</summary>
      <div className="mt-2 overflow-x-auto">
        <table className="w-full min-w-[26rem] text-left">
          <caption className="sr-only">Most recent watering runs, newest first</caption>
          <thead className="border-b border-line text-ink-2">
            <tr>
              <th scope="col" className="py-1 pr-3 font-semibold">Started</th>
              <th scope="col" className="py-1 pr-3 font-semibold">Window</th>
              <th scope="col" className="py-1 pr-3 text-right font-semibold">Gallons read</th>
              <th scope="col" className="py-1 font-semibold">Reads</th>
            </tr>
          </thead>
          <tbody className="tabular">
            {recent.map((r) => (
              <tr key={r.start} className="border-b border-line last:border-0">
                <th scope="row" className="py-1 pr-3 font-normal">{day(r.start)}</th>
                <td className="py-1 pr-3">{windowText(Number(r.start.slice(11, 13)), Number(r.end.slice(11, 13)))}</td>
                <td className="py-1 pr-3 text-right">{fmt.int(Math.round(r.gallons))}</td>
                <td className="py-1">
                  {r.complete
                    ? 'Complete'
                    : `Partial: ${[!r.startKnown && 'start not read', r.missingHours > 0 && `${r.missingHours} hour${r.missingHours === 1 ? '' : 's'} missing`, !r.endKnown && 'end not read'].filter(Boolean).join(', ')}`}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
