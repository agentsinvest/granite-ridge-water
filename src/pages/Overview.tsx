import type { SiteData } from '../../scripts/site-data'
import { useMemo } from 'react'
import { Bars, Waterfall } from '../components/charts'
import { rainSummaryText } from '../components/WateringAfterRain'
import { buildRainCheck } from '../lib/rainCheck'
import { dollarRange } from '../components/LeakFlags'
import { Card, PageHeader, Pill, Section, Stat, Stats, TableView } from '../components/ui'
import { cutToReach } from '../engine/scenarios'
import { decomposeYears } from '../engine/history'
import { fmt, meterNumber } from '../lib/data'
import { buildMoves, rankMoves, type Model, type Move } from '../lib/model'

export function Overview({ data, model }: { data: SiteData; model: Model }) {
  const { target, runRate, runRateRange, lastBills, latestRate, baseline, meters, flags } = model
  const over = runRate - target
  const cut = latestRate ? cutToReach(baseline, meters, target, latestRate) : null
  const pricedLeaks = flags.filter((f) => f.cost?.low != null)
  const leakLow = pricedLeaks.reduce((s, f) => s + (f.cost!.low ?? 0), 0)
  const leakHigh = pricedLeaks.reduce((s, f) => s + (f.cost!.high ?? 0), 0)
  const gallons = lastBills.reduce((s, b) => s + (b.gallons ?? 0), 0)
  const checks = [
    ...data.meters
      .flatMap((m) => (m.checks ?? []).map((c) => ({ ...c, meter: m.id })))
      .reduce((byTitle, c) => {
        const seen = byTitle.get(c.title)
        if (seen) seen.meters.push(c.meter)
        else byTitle.set(c.title, { kind: c.kind, title: c.title, meters: [c.meter] })
        return byTitle
      }, new Map<string, { kind: 'action' | 'question'; title: string; meters: string[] }>())
      .values(),
  ].sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'action' ? -1 : 1))
  const moves = rankMoves(buildMoves(data, model), false)
  const picks: Move[] = [...moves.leaks.slice(0, 1), ...moves.ranked.slice(0, 2)]
  const top: Move[] = [...picks, ...moves.leaks.filter((l) => !picks.includes(l))].slice(0, 3)
  const allRanked = rankMoves(buildMoves(data, model), true)
  const rain = useMemo(() => buildRainCheck(data), [data])

  const plYears = Object.entries(data.financials)
    .map(([y, f]) => ({ year: y, total: f.lines.find((l) => l.account === '50110')?.actual ?? null }))
    .filter((r) => r.total !== null)
  const spendRows = [...plYears.map((r) => ({ label: r.year, total: r.total as number })), ...(runRateRange ? [{ label: 'Last 12 bills', total: runRate }] : [])]

  const byMeter = meters.map((m) => ({
    meter: `Meter ${meterNumber(m)}`,
    id: m,
    total: lastBills.filter((b) => b.meter === m).reduce((s, b) => s + b.printed_total, 0),
  }))
  const d = decomposeYears(data.bills, '2024', '2025')

  const experiments = data.experiments
  const running = experiments.filter((x) => x.status === 'running').length

  return (
    <article>
      <PageHeader
        title="Granite Ridge water at a glance"
        lead="What the HOA pays the City of Mesa to water the common areas, where it goes, and what to try next. Tap any screen in the menu for details."
      />

      <Card className="mt-6">
        <p className="text-lg leading-relaxed">
          Over the last 12 City bills{runRateRange ? ` (${fmt.month(runRateRange[0])} to ${fmt.month(runRateRange[1])})` : ''} the HOA paid{' '}
          <strong>{fmt.usd(runRate)}</strong> for water, {over > 0 ? <><strong>{fmt.usd(over)} more</strong> than</> : 'within'} the {fmt.usd(target)} yearly target.
          {cut !== null && cut > 0 && (
            <>
              {' '}At today's City prices, reaching the target means using about <strong>{Math.ceil(cut)}% less water</strong> across all four meters.
            </>
          )}{' '}
          The two park meters use most of it, and {flags.length} possible {flags.length === 1 ? 'leak is' : 'leaks are'} flagged.
        </p>
      </Card>

      <Stats>
        <Stat value={fmt.usd(runRate)} label="last 12 City bills, all meters" flag={over > 0} />
        <Stat value={over > 0 ? fmt.usd(over) : fmt.usd(0)} label={`over the ${fmt.usd(target)} target`} flag={over > 0} good={over <= 0} />
        <Stat value={cut === null ? 'Unknown' : `${Math.ceil(cut)}%`} label="less water needed to reach the target at today's prices" />
        <Stat value={pricedLeaks.length ? dollarRange(leakLow, leakHigh) : String(flags.length)} label={`extra charges from ${flags.length} possible leaks so far (where priced)`} flag={flags.length > 0} />
      </Stats>

      <p className="mt-4 rounded-xl bg-surface p-4 text-sm ring-1 ring-[var(--ring)]">
        <strong>Watering after rain: </strong>
        {rain && rain.rainDays > 0 ? rainSummaryText(rain) : 'Rain gauge readings are not in yet, so this check has not run.'}{' '}
        <a className="font-semibold underline underline-offset-4" href="#meters/watering-after-rain">See every rain event</a>
      </p>

      <Section id="first" title="What to do first" lead="The top moves from the Recommended moves screen. Fix leaks first: they cost money and help nothing.">
        <ol className="mt-4 grid gap-3 md:grid-cols-3">
          {top.map((mv, i) => (
            <li key={mv.id}>
              <a href={mv.link} className="block h-full rounded-xl bg-surface p-4 ring-1 ring-[var(--ring)] hover:ring-2 hover:ring-[var(--focus)]">
                <span className="text-sm text-ink-2">{i + 1}.</span>
                <span className="mt-1 block font-semibold">{mv.title}</span>
                <span className="mt-2 block text-sm text-ink-2">
                  {mv.annual ? `Saves about ${dollarRange(mv.annual.low, mv.annual.high)} a year` : mv.soFar ? `Has cost ${dollarRange(mv.soFar.low, mv.soFar.high)} so far` : 'Savings not estimated yet'}
                  {mv.upfront === 0 ? ', no purchase needed' : mv.upfront === null ? ', repair cost needs a quote' : ''}
                </span>
              </a>
            </li>
          ))}
        </ol>
        {allRanked.ranked.length > moves.ranked.length && (
          <p className="mt-3 text-sm text-ink-2">
            {allRanked.ranked.length - moves.ranked.length} more options change watering on the park turf and are listed on{' '}
            <a className="underline underline-offset-4" href="#moves">Recommended moves</a> with the greenspace toggle on. The largest one there saves about{' '}
            {allRanked.ranked[0]?.annual ? fmt.usd(allRanked.ranked[0].annual.high) : 'an unknown amount'} a year.
          </p>
        )}
      </Section>

      <Section id="spend" title="Water spending by year" lead="From the HOA's year-end books, plus the last 12 City bills. The dashed line is the $30,000 target.">
        <Bars data={spendRows} x="label" series={[{ key: 'total', name: 'Water spend', color: 'var(--s1)' }]} label="HOA water spending by year with the target line" money target={target} targetLabel={`Target ${fmt.usd(target)}`} />
        <TableView caption="Water spending by year" head={['Year', 'Spend']} rows={spendRows.map((r) => [r.label, fmt.usd(r.total)])} />
        <p className="mt-3 max-w-prose text-sm text-ink-2">
          Spending dropped below the target in 2023, then jumped in 2024 and stayed high. <a className="underline underline-offset-4" href="#history">How we got here</a> shows why.
        </p>
      </Section>

      {d.matched > 0 && (
        <Section id="why" title="Why 2025 cost more than 2024" lead={`Comparing the ${d.matched} meter bills that are on file for the same month in both years.`}>
          <Waterfall
            label="Change in cost from 2024 to 2025 split into water used, price, and fixed charges"
            steps={[
              { name: '2024', value: d.startTotal, total: true },
              { name: 'Water used', value: d.volume },
              { name: 'Price', value: d.price },
              { name: 'Fixed fees', value: d.fixed },
              { name: '2025', value: d.endTotal, total: true },
            ]}
          />
          <p className="mt-3 max-w-prose text-sm text-ink-2">
            {d.volume < 0 ? `Using less water saved ${fmt.usd(-d.volume)}` : `Using more water added ${fmt.usd(d.volume)}`}, higher City prices added{' '}
            {fmt.usd(d.price)}, and service charges and fees changed by {fmt.usd(d.fixed)}.
          </p>
        </Section>
      )}

      <Section id="where" title="Where the money goes" lead="Last 12 City bills by meter.">
        <Bars
          data={byMeter.map((r) => ({ meter: r.meter, total: Math.round(r.total) }))}
          x="meter"
          series={[{ key: 'total', name: 'Last 12 bills', color: 'var(--s1)' }]}
          label="Last 12 bills by meter"
          money
          height={220}
        />
        <TableView caption="Last 12 bills by meter" head={['Meter', 'Bills', 'Share']} rows={byMeter.map((r) => [r.meter, fmt.usd(r.total), fmt.pct(r.total / runRate)])} />
        <p className="mt-3 text-sm text-ink-2">
          {fmt.int(Math.round(gallons / 1000) * 1000)} gallons in all. <a className="underline underline-offset-4" href="#meters">Meters and leaks</a> has each meter's details.
        </p>
      </Section>

      <Section id="leaks" title="Possible leaks">
        {flags.length === 0 ? (
          <p className="mt-3 text-ink-2">None flagged right now.</p>
        ) : (
          <ul className="mt-4 space-y-2">
            {flags.slice(0, 3).map(({ flag, cost }) => (
              <li key={flag.id} className="flex flex-wrap items-baseline gap-x-3 gap-y-1 rounded-lg bg-surface px-4 py-3 ring-1 ring-[var(--ring)]">
                <span aria-hidden="true" className="font-extrabold">!</span>
                <a href={`#meters/${flag.id}`} className="font-semibold underline underline-offset-4">{flag.title}</a>
                <span className="text-sm text-ink-2">{cost?.low != null && cost.high != null ? `about ${dollarRange(cost.low, cost.high)} so far` : 'cost not estimated yet'}</span>
              </li>
            ))}
            {flags.length > 3 && (
              <li className="text-sm">
                <a href="#meters/leaks-heading" className="underline underline-offset-4">All {flags.length} possible leaks</a>
              </li>
            )}
          </ul>
        )}
      </Section>

      {checks.length > 0 && (
        <Section id="checks" title="Watering checks" lead="Not leaks, but worth raising with the landscaper.">
          <ul className="mt-4 space-y-2">
            {checks.map((c) => (
              <li key={c.title} className="rounded-lg bg-surface px-4 py-3 ring-1 ring-[var(--ring)]">
                <span className="text-xs font-semibold uppercase tracking-wide text-ink-2">
                  {c.kind === 'action' ? 'Needs action' : 'Open question'} · {c.meters.length > 1 ? 'Meters' : 'Meter'} {c.meters.map(meterNumber).join(' and ')}
                </span>
                <a href="#meters/checks-heading" className="mt-1 block font-semibold underline underline-offset-4">{c.title}</a>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section id="exp" title="Experiments">
        <p className="mt-3 flex flex-wrap items-center gap-3">
          <Pill tone="neutral">{running} running</Pill>
          <span className="text-ink-2">
            {experiments.length} on file. Every change the HOA tries is checked against the water use before it.{' '}
            <a href="#experiments" className="underline underline-offset-4">See experiments</a>
          </span>
        </p>
      </Section>
    </article>
  )
}
