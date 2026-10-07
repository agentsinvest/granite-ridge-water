import { useState } from 'react'
import type { SiteData } from '../../scripts/site-data'
import { Bars } from '../components/charts'
import { Card, Empty, PageHeader, Pill, Section, Stat, Stats, Sure, TableView } from '../components/ui'
import { checkExperiment, type CheckResult, type Day, type Expected } from '../engine/experiments'
import { fmt, meterNumber } from '../lib/data'
import type { Model } from '../lib/model'

const STATUS: Record<string, string> = { planned: 'Planned', running: 'Running', done: 'Done', stopped: 'Stopped' }

const VERDICT: Record<CheckResult['verdict'], { text: string; tone: 'good' | 'serious' | 'neutral' }> = {
  as_expected: { text: 'Went as expected', tone: 'good' },
  partly: { text: 'Partly worked', tone: 'serious' },
  no_change: { text: 'No clear change', tone: 'serious' },
  went_up: { text: 'Use went up', tone: 'serious' },
  not_enough_data: { text: 'Too early to tell', tone: 'neutral' },
  not_started: { text: 'Not started', tone: 'neutral' },
}

function daysFor(data: SiteData, meter: string): Day[] {
  return Object.values(data.usage[meter] ?? {})
    .flat()
    .map((d) => ({ date: d.date, gallons: d.gallons, hours: d.hours }))
    .sort((a, b) => a.date.localeCompare(b.date))
}

const shortDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

export function Experiments({ data, model }: { data: SiteData; model: Model }) {
  const st = model.site.experiment_check
  const settings = { minDays: st.min_days_each_side.value, minHours: st.min_hours_per_day.value, shareOfTarget: st.share_of_target_for_success.value, noisePercent: st.noise_percent.value }
  const checked = data.experiments.map((x) => ({ x, r: checkExperiment(daysFor(data, x.meter), x.start, x.end, x.baseline_days, x.expected, settings) }))
  const counts = (v: CheckResult['verdict'][]) => checked.filter((c) => v.includes(c.r.verdict)).length

  return (
    <article>
      <PageHeader
        title="Experiments"
        lead="When the HOA changes something on purpose (a repair, a schedule, a new device), log it here with what we expect to happen. The site then compares daily water use before and after and says whether it went as expected."
      />
      <Stats>
        <Stat value={String(data.experiments.length)} label="experiments on file" />
        <Stat value={String(checked.filter((c) => c.x.status === 'running').length)} label="running now" />
        <Stat value={String(counts(['as_expected']))} label="went as expected" good={counts(['as_expected']) > 0} />
        <Stat value={String(counts(['partly', 'no_change', 'went_up']))} label="did not go as expected" flag={counts(['partly', 'no_change', 'went_up']) > 0} />
      </Stats>

      <Section id="list" title="Logged experiments">
        {checked.length === 0 ? (
          <Empty>No experiments logged yet. Add a file to data/experiments/ (the README there has the format), or try the checker below.</Empty>
        ) : (
          <ul className="mt-4 space-y-4">
            {checked.map(({ x, r }) => (
              <li key={x.id}>
                <Card>
                  <p className="flex flex-wrap items-center gap-2 text-sm">
                    <Pill tone={VERDICT[r.verdict].tone}>{VERDICT[r.verdict].text}</Pill>
                    <span className="text-ink-2">
                      {STATUS[x.status]} · Meter {meterNumber(x.meter)}
                      {x.start ? ` · from ${shortDate(x.start)}${x.end ? ` to ${shortDate(x.end)}` : ''}` : ''}
                    </span>
                  </p>
                  <h3 className="mt-2 text-lg font-bold">{x.title}</h3>
                  <p className="mt-1 max-w-prose">{x.what_changes}</p>
                  <p className="mt-2 text-sm">
                    <strong>Expected:</strong> {expectedText(x.expected)}. <span className="text-ink-2">{x.expected.source}</span> <Sure level={x.expected.confidence} />
                  </p>
                  <ResultBlock r={r} expected={x.expected} days={daysFor(data, x.meter)} />
                  {x.outcome_note && <p className="mt-2 text-sm"><strong>On site:</strong> {x.outcome_note}</p>}
                  {x.todo && <p className="mt-2 text-sm text-ink-2"><strong className="text-ink">Next:</strong> {x.todo}</p>}
                </Card>
              </li>
            ))}
          </ul>
        )}
      </Section>

      <Checker data={data} model={model} settings={settings} />

      <Section id="how" title="How the check works">
        <ul className="mt-3 max-w-prose list-disc space-y-1 pl-5 text-sm text-ink-2">
          <li>Average daily gallons on complete days (at least {settings.minHours} of 24 hours reported) before the start, compared with after it.</li>
          <li>At least {settings.minDays} complete days are needed on each side before the site gives an answer.</li>
          <li>"Went as expected" means the drop reached at least {fmt.pct(settings.shareOfTarget)} of the expected drop. Changes under {settings.noisePercent}% count as no clear change.</li>
          <li>For repairs, "as expected" means no day after the repair went above the daily limit.</li>
          <li>Weather is not adjusted for yet (daily weather is not on file), so compare similar weeks and keep trials short in spring and fall.</li>
          <li>Waterfluence's hourly data misses some late-night hours on meters 1 and 4, so daily totals there run low. Before and after are affected the same way.</li>
        </ul>
        <p className="mt-2 text-sm text-ink-2">These settings live in data/config/site.md.</p>
      </Section>
    </article>
  )
}

function expectedText(e: Expected): string {
  return e.type === 'percent_reduction' ? `average daily use drops ${e.value}%` : `no day goes above ${fmt.int(e.value)} gallons`
}

function ResultBlock({ r, expected, days }: { r: CheckResult; expected: Expected; days: Day[] }) {
  if (r.verdict === 'not_started') return <p className="mt-3 text-sm text-ink-2">Starts once a start date is filled in.</p>
  const span = days.filter((d) => d.date >= r.before.from && d.date <= r.after.to)
  const chart = span.map((d) => ({
    day: shortDate(d.date),
    before: d.date < r.after.from && d.gallons !== null ? Math.round(d.gallons) : null,
    after: d.date >= r.after.from && d.gallons !== null ? Math.round(d.gallons) : null,
  }))
  return (
    <div className="mt-3">
      <dl className="grid grid-cols-2 gap-3 text-sm md:grid-cols-4">
        <div>
          <dt className="text-ink-2">Before, a day</dt>
          <dd className="text-lg font-bold">{r.before.avg === null ? 'No data' : `${fmt.int(Math.round(r.before.avg))} gal`}</dd>
          <dd className="text-ink-2">{r.before.days} complete days</dd>
        </div>
        <div>
          <dt className="text-ink-2">After, a day</dt>
          <dd className="text-lg font-bold">{r.after.avg === null ? 'No data' : `${fmt.int(Math.round(r.after.avg))} gal`}</dd>
          <dd className="text-ink-2">{r.after.days} complete days</dd>
        </div>
        <div>
          <dt className="text-ink-2">Change</dt>
          <dd className="text-lg font-bold">{r.changePercent === null ? 'Unknown' : `${r.changePercent >= 0 ? '-' : '+'}${Math.abs(Math.round(r.changePercent))}%`}</dd>
          <dd className="text-ink-2">{expected.type === 'percent_reduction' ? `expected -${expected.value}%` : `${r.after.daysOver} days over ${fmt.int(expected.value)} gal`}</dd>
        </div>
        <div>
          <dt className="text-ink-2">Highest day after</dt>
          <dd className="text-lg font-bold">{r.after.max === null ? 'No data' : `${fmt.int(Math.round(r.after.max))} gal`}</dd>
        </div>
      </dl>
      {chart.length > 0 && (
        <>
          <Bars data={chart} x="day" series={[{ key: 'before', name: 'Before', color: 'var(--s1)' }, { key: 'after', name: 'After', color: 'var(--s2)' }]} label="Daily gallons before and after the change" height={220} />
          <TableView caption="Daily gallons" head={['Day', 'Before', 'After']} rows={chart.map((c) => [c.day, c.before ?? '', c.after ?? ''])} />
        </>
      )}
    </div>
  )
}

function Checker({ data, model, settings }: { data: SiteData; model: Model; settings: Parameters<typeof checkExperiment>[5] }) {
  const firstWithData = model.meters.find((m) => daysFor(data, m).length > 0) ?? model.meters[0]
  const [meter, setMeter] = useState(firstWithData)
  const [start, setStart] = useState('')
  const [before, setBefore] = useState(14)
  const [pct, setPct] = useState(10)
  const days = daysFor(data, meter)
  const range = days.length ? [days[0].date, days.at(-1)!.date] : null
  const end = start ? new Date(Date.parse(`${start}T12:00:00Z`) + (before - 1) * 86400000).toISOString().slice(0, 10) : null
  const r = start ? checkExperiment(days, start, end, before, { type: 'percent_reduction', value: pct }, settings) : null
  return (
    <Section id="checker" title="Check any change" lead="Had a repair or schedule change on a known date? Pick the meter and the date. The same number of days before and after the change are compared.">
      <Card className="mt-4">
        <div className="grid gap-3 text-sm md:grid-cols-4">
          <label className="block">
            <span className="font-semibold">Meter</span>
            <select className="mt-1 block w-full rounded border border-line bg-surface p-2" value={meter} onChange={(e) => setMeter(e.target.value)}>
              {model.meters.map((m) => <option key={m} value={m}>Meter {meterNumber(m)}</option>)}
            </select>
          </label>
          <label className="block">
            <span className="font-semibold">Change made on</span>
            <input type="date" className="mt-1 block w-full rounded border border-line bg-surface p-2" value={start} min={range?.[0]} max={range?.[1]} onChange={(e) => setStart(e.target.value)} />
          </label>
          <label className="block">
            <span className="font-semibold">Days to compare before</span>
            <input type="number" min={7} max={60} className="mt-1 block w-full rounded border border-line bg-surface p-2" value={before} onChange={(e) => setBefore(Math.max(1, Number(e.target.value) || 14))} />
          </label>
          <label className="block">
            <span className="font-semibold">Expected drop (%)</span>
            <input type="number" min={1} max={100} className="mt-1 block w-full rounded border border-line bg-surface p-2" value={pct} onChange={(e) => setPct(Math.max(1, Number(e.target.value) || 10))} />
          </label>
        </div>
        <p className="mt-2 text-sm text-ink-2">{range ? `Daily data on file for this meter: ${shortDate(range[0])} to ${shortDate(range[1])}, ${range[1].slice(0, 4)}.` : 'No daily data on file for this meter.'}</p>
        {!r && <p className="mt-3 text-sm text-ink-2">Pick the date the change was made to see the result.</p>}
        {r && (
          <>
            <p className="mt-3"><Pill tone={VERDICT[r.verdict].tone}>{VERDICT[r.verdict].text}</Pill></p>
            <ResultBlock r={r} expected={{ type: 'percent_reduction', value: pct }} days={days} />
          </>
        )}
      </Card>
    </Section>
  )
}
