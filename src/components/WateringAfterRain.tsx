import { Bar, BarChart, CartesianGrid, ReferenceArea, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'
import type { SiteData } from '../../scripts/site-data'
import { addDays, type MeterRainCheck, type RainEventCheck } from '../engine/rainResponse'
import type { EpisodeCost } from '../engine/leakCost'
import { fmt } from '../lib/data'
import { meterName, type RainCheck } from '../lib/rainCheck'
import { dollarRange } from './LeakFlags'
import { METER_COLOR } from './charts'
import { Empty, HowCalculated, Pill, TableView } from './ui'

export const CSV_PATH = 'data/watering-after-rain.csv'

const day = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
const days = (n: number) => `${n} ${n === 1 ? 'day' : 'days'}`
const eventDates = (e: RainEventCheck) => (e.start === e.end ? day(e.start) : `${day(e.start)} to ${day(e.end)}`)

export function costText(c: EpisodeCost | null): string {
  if (!c) return '$0'
  if (c.kind === 'billed') return fmt.usd(c.usd)
  if (c.kind === 'range') return dollarRange(c.low, c.high)
  return 'Not priced yet'
}

/** The one-sentence summary used here and on Overview. */
export function rainSummaryText(rc: RainCheck): string {
  const s = rc.summary
  const since = new Date(`${rc.since}T12:00:00`).toLocaleDateString('en-US', { month: 'long', year: 'numeric' })
  const early = s.avgDaysEarly === null ? '' : ` (${Number(s.avgDaysEarly.toFixed(1))} ${s.avgDaysEarly === 1 ? 'day' : 'days'} early on average)`
  const cost = s.costLow === s.costHigh ? fmt.usd(s.costLow) : dollarRange(s.costLow, s.costHigh)
  return (
    `Since ${since}: ${s.events} rain ${s.events === 1 ? 'event' : 'events'}. ` +
    `Watered through the rain ${s.wateredThrough} ${s.wateredThrough === 1 ? 'time' : 'times'}, ` +
    `started again too soon ${s.tooSoon} ${s.tooSoon === 1 ? 'time' : 'times'}${early}, ` +
    `${s.partial ? 'at least' : 'about'} ${fmt.int(s.gallons)} gallons and ${cost}.`
  )
}

function ResultChip({ m }: { m: MeterRainCheck }) {
  switch (m.result) {
    case 'watered-through':
      return <Pill tone="serious">Watered through the rain</Pill>
    case 'too-soon':
      return <Pill tone="serious">{m.daysEarly ? `Started again ${days(m.daysEarly)} early` : 'Started again too soon'}</Pill>
    case 'paused':
      return <Pill tone="good">Paused as it should</Pill>
    case 'already-off':
      return <Pill tone="neutral">Already off</Pill>
    case 'too-early':
      return <Pill tone="neutral">Too soon to tell</Pill>
    default:
      return <Pill tone="neutral">Not checked</Pill>
  }
}

const counted = (m: MeterRainCheck) => m.result === 'watered-through' || m.result === 'too-soon' || m.result === 'paused'

export function WateringAfterRain({ data, rc }: { data: SiteData; rc: RainCheck | null }) {
  const lead = 'Every rain event since July 2026, and whether each meter skipped watering for as long as the rain covered the plants, or watered anyway.'
  if (!rc) {
    return (
      <section id="watering-after-rain" aria-labelledby="rain-heading" className="mt-10">
        <h2 id="rain-heading" className="text-xl font-bold">Watering after rain</h2>
        <Empty>The settings for this check are missing, so it cannot run.</Empty>
      </section>
    )
  }
  const rows = [...rc.checks].reverse().flatMap((e) => e.meters.map((m) => ({ e, m })))
  const s = rc.settings
  const pf = (meters: string[]) => s.plantFactors.filter((r) => meters.some((m) => r.meters.includes(m)))

  return (
    <section id="watering-after-rain" aria-labelledby="rain-heading" className="mt-10">
      <h2 id="rain-heading" className="text-xl font-bold">Watering after rain</h2>
      <p className="mt-1 max-w-prose text-sm text-ink-2">{lead}</p>

      {rc.rainDays === 0 ? (
        <Empty>Rain gauge readings have not been added yet, so there is nothing to check. Once they are, every rain event since July 2026 shows here.</Empty>
      ) : (
        <>
          <p className="mt-4 rounded-xl bg-surface p-4 text-base ring-1 ring-[var(--ring)]">
            {rainSummaryText(rc)}
            {rc.summary.unpricedGallons > 0 && ` ${fmt.int(rc.summary.unpricedGallons)} of those gallons cannot be priced yet.`}
          </p>
          <p className="mt-2 text-sm">
            <a className="font-semibold underline underline-offset-4" href={`/${CSV_PATH}`} download>
              Download this data
            </a>{' '}
            <span className="text-ink-2">(spreadsheet file, one row per meter per rain event)</span>
          </p>

          {rows.length === 0 ? (
            <Empty>No rain of {s.minEventInches.toFixed(2)} in or more since {day(rc.since)}{rc.rainThrough ? ` (gauge readings through ${day(rc.rainThrough)})` : ''}.</Empty>
          ) : (
            <>
            {/* Phones: one card per meter per rain. Wider screens: the full table. */}
            <ul className="mt-4 space-y-2 md:hidden">
              {rows.map(({ e, m }) => (
                <li key={`${e.start}-${m.meter}`} className="rounded-xl bg-surface p-3 text-sm ring-1 ring-[var(--ring)]">
                  <p className="font-semibold">{eventDates(e)}, {e.inches.toFixed(2)} in · {meterName(data, m.meter)}</p>
                  <p className="mt-1"><ResultChip m={m} /></p>
                  {rc.actionWorking.has(e.start) && m.meter === e.meters[0].meter && <p className="mt-1"><Pill tone="good">The rain fix worked</Pill></p>}
                  <p className="mt-1 text-ink-2">
                    Rain covered {days(m.daysCovered)}
                    {counted(m) && m.firstWatering ? `. Watered again ${day(m.firstWatering)} (${m.daysAfter === 0 ? 'night of the rain' : `${days(m.daysAfter!)} after`})` : ''}
                    {counted(m) && m.gallons > 0 ? `. Extra: ${m.partial ? 'at least ' : ''}${fmt.int(m.gallons)} gallons, ${costText(m.cost)}` : ''}.
                  </p>
                </li>
              ))}
            </ul>
            <div className="mt-4 hidden overflow-x-auto rounded-xl bg-surface ring-1 ring-[var(--ring)] md:block">
              <table className="w-full min-w-[56rem] text-left text-sm">
                <caption className="sr-only">Watering after each rain event, by meter, newest first</caption>
                <thead className="border-b border-line text-ink-2">
                  <tr>
                    {['Rain', 'Meter', 'Days the rain covered', 'Result', 'First watering after', 'Nights watered inside the window', 'Extra gallons', 'Estimated cost'].map((h, i) => (
                      <th key={h} scope="col" className={`px-3 py-2 font-semibold ${i >= 6 ? 'text-right' : ''}`}>{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {rows.map(({ e, m }) => (
                    <tr key={`${e.start}-${m.meter}`} className="border-b border-line last:border-0 align-top">
                      <th scope="row" className="whitespace-nowrap px-3 py-2 font-normal">
                        {eventDates(e)}
                        <span className="block text-ink-2">{e.inches.toFixed(2)} in</span>
                        {rc.actionWorking.has(e.start) && m.meter === e.meters[0].meter && <span className="mt-1 block"><Pill tone="good">The rain fix worked</Pill></span>}
                      </th>
                      <td className="min-w-[10rem] px-3 py-2">{meterName(data, m.meter)}</td>
                      <td className="tabular px-3 py-2">{days(m.daysCovered)}</td>
                      <td className="whitespace-nowrap px-3 py-2"><ResultChip m={m} /></td>
                      <td className="whitespace-nowrap px-3 py-2">
                        {counted(m) && m.firstWatering ? `${day(m.firstWatering)} (${m.daysAfter === 0 ? 'night of the rain' : `${days(m.daysAfter!)} after`})` : counted(m) ? 'Not yet' : ''}
                      </td>
                      <td className="px-3 py-2">{counted(m) ? (m.nights.length ? `${m.nights.length}: ${m.nights.map((n) => day(n.date)).join(', ')}` : 'None') : ''}</td>
                      <td className="tabular whitespace-nowrap px-3 py-2 text-right">{counted(m) ? `${m.partial && m.gallons > 0 ? 'at least ' : ''}${fmt.int(m.gallons)}` : ''}</td>
                      <td className="tabular whitespace-nowrap px-3 py-2 text-right">{counted(m) ? costText(m.cost) : ''}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            </>
          )}
          {rows.some(({ m }) => m.partial) && (
            <p className="mt-2 text-sm text-ink-2">"At least" means some night hours are missing from the meter data, so the real number may be higher.</p>
          )}

          {rc.checks.length > 0 && data.meters.filter((m) => data.hourly[m.id]).map((m) => <MeterChart key={m.id} data={data} rc={rc} meter={m.id} />)}
        </>
      )}

      {rc.action && (
        <p className="mt-4 text-sm">
          <span className="font-semibold">What we are doing about it: </span>
          <a className="underline underline-offset-4" href={`#action/${rc.action.id}`}>{rc.action.title}</a>
          {rc.action.doneOn
            ? rc.actionWorking.size
              ? `. Done ${day(rc.action.doneOn)}, and it has worked after ${rc.actionWorking.size} ${rc.actionWorking.size === 1 ? 'rain' : 'rains'} so far.`
              : `. Done ${day(rc.action.doneOn)}. Waiting for the next rain of ${rc.action.minInches} in or more to check it.`
            : '. Not done yet.'}
        </p>
      )}

      <HowCalculated>
        <div className="space-y-2">
          <p>
            A rain event is a day with {s.minEventInches.toFixed(2)} in of rain or more at the NOAA rain gauge in East Mesa. Rainy days in a row count as one
            event. We count {fmt.pct(s.usableShare)} of the rain as usable by plants, up to {s.usableCapInches} in, because heavy rain runs off.
          </p>
          <p>
            Each day after the rain, plants use some of that water: the day's weather demand (from the Arizona weather station at Queen Creek) times a plant
            factor. The rain "covers" each full day until it is used up, up to {s.maxDaysSummer} days in summer and {s.maxDaysWinter} in winter. That is the
            skip window. Plant factors: park lawn {pf(['meter-1']).map((r) => `${r.factor} (${r.months.length ? monthsShort(r.months) : 'all year'})`).join(', ')};
            drip {pf(['meter-3']).map((r) => r.factor).join(', ')}.
          </p>
          <p>
            Watering on the night of the rain or the first night after counts as watering through the rain. Watering later inside the window counts as
            starting again too soon. A meter that did not water in the {s.alreadyOffDays} days before the rain was already off, and is left out of the counts.
            Only watering that starts between {hour(s.nightStartHour)} and {hour(s.nightEndHour)} counts, so a single daytime test is not mistaken for the
            schedule. The cost uses the same method as the leak estimates: what that water added to the City bill, or a range while the bill is not in yet.
          </p>
          <p>Please keep in mind:</p>
          <ul className="list-disc space-y-1 pl-5">
            <li>The rain gauge is about 2 miles away, so the park can get more or less rain than it shows.</li>
            <li>Hourly meter data starts {rc.hourlyFrom ? day(rc.hourlyFrom) : 'July 3'}, 2026. Rain before there is a full week of meter data is listed as not checked. The full hourly history has been requested from Waterfluence; when it arrives, older rain is checked the same way.</li>
            <li>Some late-night hours are missing from the meter data, so some gallons are a minimum.</li>
            <li>The plant factors are estimates.</li>
            {rc.usesNormals && <li>Where the weather station's daily reading is not in yet, a typical day for that month is used.</li>}
            {rc.missingRainDays > 0 && <li>The gauge has no reading for {days(rc.missingRainDays)}. Missing days are never counted as dry.</li>}
          </ul>
          <p>So treat each row as a strong signal, not a bill line. City bills are the official record.</p>
        </div>
      </HowCalculated>
    </section>
  )
}

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const monthsShort = (ms: number[]) => `${MONTHS[ms[0] - 1]} to ${MONTHS[ms.at(-1)! - 1]}`
const hour = (h: number) => (h === 0 ? 'midnight' : h === 12 ? 'noon' : `${h % 12} ${h < 12 ? 'AM' : 'PM'}`)

const axis = { stroke: 'var(--axis)', tick: { fill: 'var(--ink-2)', fontSize: 12 }, tickLine: false }

/** Gallons each watering night as bars, each rain as a labelled line, each skip window shaded. One y-axis: gallons. */
function MeterChart({ data, rc, meter }: { data: SiteData; rc: RainCheck; meter: string }) {
  const reads = data.hourly[meter].reads
  const first = reads[0].time.slice(0, 10)
  const last = reads.at(-1)!.time.slice(0, 10)
  const all = new Map((rc.nightsByMeter[meter] ?? []).map((n) => [n.date, n.gallons]))
  const rows: { date: string; label: string; gallons: number }[] = []
  for (let d = first; d <= last; d = addDays(d, 1)) rows.push({ date: d, label: day(d), gallons: Math.round(all.get(d) ?? 0) })
  const events = rc.checks.filter((e) => e.end >= first && e.start <= last)
  const name = meterName(data, meter)
  const label = `${name}: gallons watered each night, with rain events and the days each rain covered`
  return (
    <div className="mt-6">
      <h3 className="text-base font-semibold">{name}</h3>
      <figure className="mt-2 rounded-xl bg-surface p-3 ring-1 ring-[var(--ring)] md:p-4">
        <figcaption className="sr-only">{label}</figcaption>
        <div style={{ height: 240 }} role="img" aria-label={label}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={rows} margin={{ top: 46, right: 8, left: 0, bottom: 0 }} barCategoryGap={1}>
              <CartesianGrid vertical={false} stroke="var(--grid)" />
              <XAxis dataKey="label" {...axis} minTickGap={24} />
              <YAxis {...axis} width={52} tickFormatter={(v) => (v >= 1000 ? `${Number((v / 1000).toFixed(1))}k` : String(v))} />
              <Tooltip
                contentStyle={{ background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink)', fontSize: 13 }}
                labelStyle={{ color: 'var(--ink)', fontWeight: 600 }}
                itemStyle={{ color: 'var(--ink)' }}
                cursor={{ fill: 'var(--ring)' }}
                formatter={(v) => [`${fmt.int(Number(v))} gallons`, 'Watered that night']}
              />
              {events.map((e) => {
                const m = e.meters.find((x) => x.meter === meter)
                return m && m.windowEnd > e.end ? (
                  <ReferenceArea key={`w-${e.start}`} x1={day(addDays(e.end, 1))} x2={day(m.windowEnd)} fill="var(--s1)" fillOpacity={0.12} stroke="none" ifOverflow="hidden" />
                ) : null
              })}
              {events.map((e, i) => (
                // Three label heights so rains a few days apart do not print on top of each other.
                <ReferenceLine key={`r-${e.start}`} x={day(e.start)} stroke="var(--ink)" strokeDasharray="3 3" label={{ value: `${e.inches.toFixed(2)} in`, position: 'top', offset: 4 + (i % 3) * 13, fill: 'var(--ink)', fontSize: 11 }} />
              ))}
              <Bar dataKey="gallons" name="Gallons" fill={METER_COLOR[meter] ?? 'var(--s1)'} radius={[3, 3, 0, 0]} isAnimationActive={false} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <p className="mt-2 text-xs text-ink-2">
          Bars: gallons watered each night. Dashed lines: rain, with inches. Shaded: the days the rain covered.
        </p>
      </figure>
      <TableView
        caption={`${name}: watering after each rain`}
        head={['Rain', 'Inches', 'Rain covered until', 'Result', 'Gallons inside the window']}
        rows={events.flatMap((e) => {
          const m = e.meters.find((x) => x.meter === meter)
          if (!m) return []
          return [[eventDates(e), e.inches.toFixed(2), m.windowEnd > e.end ? day(m.windowEnd) : 'Less than a day', resultWords(m), counted(m) ? fmt.int(m.gallons) : 'Not counted']]
        })}
      />
    </div>
  )
}

function resultWords(m: MeterRainCheck): string {
  switch (m.result) {
    case 'watered-through': return 'Watered through the rain'
    case 'too-soon': return m.daysEarly ? `Started again ${days(m.daysEarly)} early` : 'Started again too soon'
    case 'paused': return 'Paused as it should'
    case 'already-off': return 'Already off'
    case 'too-early': return 'Too soon to tell'
    default: return 'Not checked'
  }
}
