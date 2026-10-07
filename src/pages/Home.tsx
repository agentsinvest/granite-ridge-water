import { useMemo } from 'react'
import type { SiteData } from '../../scripts/site-data'
import { ActionCard } from '../components/actions'
import { Bars } from '../components/charts'
import { rainSummaryText } from '../components/WateringAfterRain'
import { buildRainCheck } from '../lib/rainCheck'
import { dollarRange } from '../components/LeakFlags'
import { Pill, Section, TableView } from '../components/ui'
import { checkExperiment } from '../engine/experiments'
import { fixNow, perHomeMonth, priceActions, progressBands, whatChanged, type Band } from '../lib/actions'
import { fmt, meterLabel } from '../lib/data'
import type { Model } from '../lib/model'
import { VERDICT, daysFor } from './Experiments'

const usd2 = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
const BAND_STYLE: Record<Band['id'], string> = {
  verified: 'bg-good',
  progress: 'bg-[var(--s1)]',
  // Hatched, so the proposed band reads differently from the others without relying on color.
  proposed: 'bg-[repeating-linear-gradient(135deg,var(--s1)_0_3px,transparent_3px_7px)] ring-1 ring-inset ring-[var(--s1)]',
}
const BAND_MARK: Record<Band['id'], string> = { verified: '✓✓', progress: '◷', proposed: '○' }

export function Home({ data, model }: { data: SiteData; model: Model }) {
  const { target, runRate, runRateRange, lastBills, meters } = model
  const homes = (data.config.site as { homes: { value: number } }).homes.value
  const over = runRate - target
  const priced = priceActions(data, model)
  const { bands, unpriced } = progressBands(priced, model)
  const found = bands.reduce((s, b) => s + b.low, 0)
  const top = fixNow(priced)
  const changes = whatChanged(data)
  const rain = useMemo(() => buildRainCheck(data), [data])

  const plYears = Object.entries(data.financials)
    .map(([y, f]) => ({ year: y, total: f.lines.find((l) => l.account === '50110')?.actual ?? null }))
    .filter((r) => r.total !== null)
  const spendRows = [...plYears.map((r) => ({ label: r.year, total: r.total as number })), ...(runRateRange ? [{ label: 'Last 12 bills', total: runRate }] : [])]
  const byMeter = meters.map((m) => ({ meter: `Meter ${m.replace('meter-', '')}`, full: meterLabel(data, m), total: lastBills.filter((b) => b.meter === m).reduce((s, b) => s + b.printed_total, 0) }))

  const st = model.site.experiment_check
  const settings = { minDays: st.min_days_each_side.value, minHours: st.min_hours_per_day.value, shareOfTarget: st.share_of_target_for_success.value, noisePercent: st.noise_percent.value }
  const tests = [...data.experiments].sort((a, b) => (b.start ?? '').localeCompare(a.start ?? ''))
  const lastTest = tests.find((x) => x.start) ?? tests[0] ?? null
  const lastCheck = lastTest ? checkExperiment(daysFor(data, lastTest.meter), lastTest.start, lastTest.end, lastTest.baseline_days, lastTest.expected, settings) : null

  return (
    <article>
      <h1 className="text-xl font-bold md:text-2xl">Granite Ridge common-area water</h1>

      <section aria-label="Cost and goal" className={`mt-4 rounded-xl border-l-4 bg-surface p-4 ring-1 ring-[var(--ring)] ${over > 0 ? 'border-serious' : 'border-good'}`}>
        <p className="leading-relaxed md:text-lg">
          Common-area water cost <strong>{fmt.usd(runRate)}</strong> over the last 12 bills
          {runRateRange ? ` (${fmt.month(runRateRange[0])} to ${fmt.month(runRateRange[1])})` : ''}, about <strong>{usd2(perHomeMonth(runRate, homes))} per home per month</strong>. The goal
          is {fmt.usd(target)} (about {usd2(perHomeMonth(target, homes))} per home per month).
        </p>
        <p className="mt-2 flex flex-wrap items-center gap-2 text-sm">
          {over > 0 ? (
            <Pill tone="serious">Over the goal by {fmt.usd(over)} a year</Pill>
          ) : (
            <Pill tone="good">Within the goal</Pill>
          )}
          {over > 0 && <span className="text-ink-2">about {usd2(perHomeMonth(over, homes))} per home per month</span>}
        </p>
      </section>

      {over > 0 && (
        <section aria-labelledby="progress-heading" className="mt-5">
          <h2 id="progress-heading" className="text-base font-bold">
            Are we on track?
          </h2>
          <p className="mt-1 text-sm text-ink-2">
            Actions on the plan would save at least {fmt.usd(found)} of the {fmt.usd(over)} a year needed
            {unpriced > 0 ? `, plus ${unpriced} ${unpriced === 1 ? 'action' : 'actions'} not priced yet` : ''}.
          </p>
          <div
            role="img"
            aria-label={`Progress to the goal: ${bands.map((b) => `${b.label} ${fmt.usd(b.low)}`).join(', ')}, out of ${fmt.usd(over)} needed.`}
            className="mt-2 flex h-5 w-full overflow-hidden rounded-md bg-[var(--line)]"
          >
            {bands.map((b) => (b.low > 0 ? <div key={b.id} className={BAND_STYLE[b.id]} style={{ width: `${Math.min(100, (b.low / over) * 100)}%` }} /> : null))}
          </div>
          <ul className="mt-2 grid gap-x-4 gap-y-1 text-sm sm:grid-cols-3">
            {bands.map((b) => (
              <li key={b.id} className="flex items-center gap-2">
                <span aria-hidden="true" className={`inline-block h-3 w-4 shrink-0 rounded-sm ${BAND_STYLE[b.id]}`} />
                <span>
                  <span aria-hidden="true">{BAND_MARK[b.id]} </span>
                  {b.label}: <strong>{b.high > 0 ? dollarRange(b.low, b.high) : '$0'}</strong>
                </span>
              </li>
            ))}
          </ul>
        </section>
      )}

      <section aria-labelledby="fix-heading" className="mt-6">
        <h2 id="fix-heading" className="text-lg font-bold">
          Fix now
        </h2>
        {top.length === 0 ? (
          <p className="mt-2 text-ink-2">Nothing waiting right now.</p>
        ) : (
          <ol className="mt-3 grid gap-3 md:grid-cols-3">
            {top.map((p) => (
              <li key={p.action.id}>
                <ActionCard p={p} />
              </li>
            ))}
          </ol>
        )}
        <p className="mt-3 text-sm">
          <a href="#plan" className="font-semibold underline underline-offset-4">
            See all {data.actions.filter((a) => a.status !== 'dropped').length} actions and who is handling them
          </a>
        </p>
      </section>

      <Section id="changed" title="What changed since the last update">
        <p className="mt-3 rounded-xl bg-surface p-4 text-sm ring-1 ring-[var(--ring)]">
          <strong>Watering after rain: </strong>
          {rain && rain.rainDays > 0 ? rainSummaryText(rain) : 'Rain gauge readings are not in yet, so this check has not run.'}{' '}
          <a className="font-semibold underline underline-offset-4" href="#problems/watering-after-rain">See every rain event</a>
        </p>
        {changes.length === 0 ? (
          <p className="mt-3 text-ink-2">Nothing new yet.</p>
        ) : (
          <ul className="mt-3 space-y-2 text-sm">
            {changes.map((c, i) => (
              <li key={i} className="flex gap-3">
                <span className="tabular w-24 shrink-0 text-ink-2">{new Date(`${c.date}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}</span>
                <a href={c.link} className="underline underline-offset-4">
                  {c.text}
                </a>
              </li>
            ))}
          </ul>
        )}
        <p className="mt-4 text-sm">
          <span className="font-semibold">Did the last change work? </span>
          {lastTest && lastCheck ? (
            <>
              {lastTest.title}: {lastCheck.verdict === 'not_started' ? 'not done yet, so there is nothing to check.' : `${VERDICT[lastCheck.verdict].text.toLowerCase()}.`}{' '}
              <a href="#calculator?tab=did-it-work" className="underline underline-offset-4">
                How we check
              </a>
            </>
          ) : (
            'No change has been tested yet.'
          )}
        </p>
      </Section>

      <Section id="spend" title="Water spending by year" lead="From the HOA's year-end books, plus the last 12 City bills. The dashed line is the goal.">
        <Bars data={spendRows} x="label" series={[{ key: 'total', name: 'Water spend', color: 'var(--s1)' }]} label="HOA water spending by year with the goal line" money target={target} targetLabel={`Goal ${fmt.usd(target)}`} />
        <TableView caption="Water spending by year" head={['Year', 'Spend']} rows={spendRows.map((r) => [r.label, fmt.usd(r.total)])} />
        <p className="mt-3 text-sm">
          <a className="underline underline-offset-4" href="#history">
            How we got here
          </a>
        </p>
      </Section>

      <Section id="where" title="Where the money goes" lead="Last 12 City bills by meter.">
        <Bars data={byMeter.map((r) => ({ meter: r.meter, total: Math.round(r.total) }))} x="meter" series={[{ key: 'total', name: 'Last 12 bills', color: 'var(--s1)' }]} label="Last 12 bills by meter" money height={220} />
        <TableView caption="Last 12 bills by meter" head={['Meter', 'Bills', 'Share']} rows={byMeter.map((r) => [r.full, fmt.usd(r.total), fmt.pct(r.total / runRate)])} />
        <p className="mt-3 text-sm">
          <a className="underline underline-offset-4" href="#water">
            Where the water goes
          </a>
        </p>
      </Section>
    </article>
  )
}
