import type { SiteData } from '../../scripts/site-data'
import { Bars, METER_COLOR, Waterfall } from '../components/charts'
import { PageHeader, Section, Stat, Stats, TableView } from '../components/ui'
import { decomposeYears, summarize } from '../engine/history'
import { fmt, meterNumber } from '../lib/data'
import type { Model } from '../lib/model'

const EVENT_TYPE: Record<string, string> = {
  leak: 'Leak', repair: 'Repair', controller: 'Controller', schedule: 'Schedule', landscape: 'Landscape', meter: 'Meter', overseed: 'Overseed', rebate: 'Rebate', other: 'Other',
}

/** Twelve-month windows of read periods ending October to September, so every window is a full year. */
function waterYears(model: Model) {
  const ends = [...new Set(Object.values(model.periods).flatMap((p) => p.map((x) => x.end)))].sort()
  const years = [...new Set(ends.map((e) => (Number(e.slice(5, 7)) >= 10 ? Number(e.slice(0, 4)) + 1 : Number(e.slice(0, 4)))))]
  return years
    .map((wy) => {
      const inYear = (e: string) => e >= `${wy - 1}-10-01` && e <= `${wy}-09-30`
      const row: Record<string, number | string> = { label: `Oct ${wy - 1} to Sep ${wy}` }
      let complete = true
      let total = 0
      for (const m of model.meters) {
        const ps = model.periods[m].filter((p) => inYear(p.end))
        if (ps.length < 12 || ps.some((p) => p.usage === null)) complete = false
        const kgal = ps.reduce((s, p) => s + (p.usage ?? 0), 0)
        row[m] = kgal
        total += kgal
      }
      return { row, complete, total }
    })
    .filter((y) => y.complete)
}

export function HowWeGotHere({ data, model }: { data: SiteData; model: Model }) {
  const pl = Object.entries(data.financials)
    .map(([y, f]) => ({ year: y, total: f.lines.find((l) => l.account === '50110')?.actual ?? null }))
    .filter((r): r is { year: string; total: number } => r.total !== null)
  const low = pl.reduce((a, b) => (b.total < a.total ? b : a), pl[0])
  const last = pl.at(-1)
  const wy = waterYears(model)
  const years = [...new Set(data.bills.map((b) => b.bill_date.slice(0, 4)))].sort()
  const price = years
    .map((y) => ({ year: y, s: summarize(data.bills.filter((b) => b.bill_date.startsWith(y))) }))
    .filter((r) => r.s.costPerKgal !== null && r.s.billsWithGallons >= 12)
  const steps = [
    ['2023', '2024'],
    ['2024', '2025'],
  ].map(([a, b]) => decomposeYears(data.bills, a, b)).filter((d) => d.matched > 0)
  const events = [...data.events].sort((a, b) => a.date.localeCompare(b.date))
  const evDate = (e: (typeof events)[number]) =>
    e.precision === 'year' ? e.date.slice(0, 4) : e.precision === 'month' ? fmt.month(e.date) : new Date(`${e.date}T12:00:00`).toLocaleDateString('en-US', { dateStyle: 'medium' })

  return (
    <article>
      <PageHeader
        title="How we got here"
        lead="Water costs went up because of three things that can be told apart: using more water, the City charging more per gallon, and fixed service charges and fees. This screen splits the change into those three."
      />

      {low && last && (
        <Stats>
          <Stat value={fmt.usd(low.total)} label={`lowest year on the books (${low.year})`} />
          <Stat value={fmt.usd(last.total)} label={`latest full year (${last.year})`} flag={last.total > model.target} />
          <Stat value={fmt.pct((last.total - low.total) / low.total)} label={`more in ${last.year} than ${low.year}`} />
          <Stat value={price.length >= 2 ? fmt.pct(price.at(-1)!.s.costPerKgal! / price[0].s.costPerKgal! - 1) : 'Unknown'} label={price.length >= 2 ? `higher cost per 1,000 gallons, ${price[0].year} to ${price.at(-1)!.year}` : 'change in price per gallon'} />
        </Stats>
      )}

      <Section id="pl" title="What the HOA spent each year" lead="Water line from the HOA's year-end books. The dashed line is the target.">
        <Bars data={pl.map((r) => ({ year: r.year, total: r.total }))} x="year" series={[{ key: 'total', name: 'Water spend', color: 'var(--s1)' }]} label="HOA water spending by year" money target={model.target} targetLabel={`Target ${fmt.usd(model.target)}`} />
        <TableView caption="HOA water spending by year" head={['Year', 'Spend']} rows={pl.map((r) => [r.year, fmt.usd(r.total)])} />
      </Section>

      <Section id="gallons" title="How much water we used" lead="Gallons metered in each 12-month stretch of City read periods (October to September), by meter. Earlier years are not exported from Waterfluence yet.">
        {wy.length === 0 ? (
          <p className="mt-3 text-ink-2">No full year of read periods on file yet.</p>
        ) : (
          <>
            <Bars
              data={wy.map((y) => ({ ...y.row }))}
              x="label"
              stacked
              series={model.meters.map((m) => ({ key: m, name: `Meter ${meterNumber(m)}`, color: METER_COLOR[m] ?? 'var(--s1)' }))}
              label="Thousand gallons used by meter per year"
            />
            <TableView
              caption="Thousand gallons by meter per year"
              head={['Year', ...model.meters.map((m) => `Meter ${meterNumber(m)}`), 'All meters']}
              rows={wy.map((y) => [y.row.label as string, ...model.meters.map((m) => fmt.int(y.row[m] as number)), fmt.int(y.total)])}
            />
            <p className="mt-3 text-sm text-ink-2">Numbers are thousands of gallons. {wy.map((y) => `${y.row.label}: ${fmt.gallons(y.total)}`).join('. ')}.</p>
          </>
        )}
      </Section>

      <Section id="price" title="What a thousand gallons costs" lead="All charges on the bill divided by the gallons billed, for years where the City's gallons are readable on at least 12 bills.">
        <Bars
          data={price.map((r) => ({ year: r.year, perKgal: Math.round(r.s.costPerKgal! * 100) / 100 }))}
          x="year"
          series={[{ key: 'perKgal', name: 'Dollars per 1,000 gallons', color: 'var(--s1)' }]}
          label="Dollars per thousand gallons by year"
          money
          height={220}
        />
        <TableView caption="Cost per thousand gallons" head={['Year', 'Per 1,000 gallons', 'Bills used']} rows={price.map((r) => [r.year, `$${r.s.costPerKgal!.toFixed(2)}`, r.s.billsWithGallons])} />
      </Section>

      <Section id="split" title="Water, price, or fees?" lead="Each chart compares only the meter bills on file for the same month in both years, so the three pieces add up exactly to the change.">
        {steps.length === 0 && <p className="mt-3 text-ink-2">Not enough matching bills yet.</p>}
        <div className="grid gap-4 lg:grid-cols-2">
          {steps.map((d) => (
            <div key={d.from}>
              <h3 className="mt-4 font-semibold">
                {d.from} to {d.to}
              </h3>
              <Waterfall
                label={`Change in cost from ${d.from} to ${d.to}`}
                steps={[
                  { name: d.from, value: d.startTotal, total: true },
                  { name: 'Water used', value: d.volume },
                  { name: 'Price', value: d.price },
                  { name: 'Fixed fees', value: d.fixed },
                  { name: d.to, value: d.endTotal, total: true },
                ]}
              />
              <p className="mt-2 text-sm text-ink-2">
                {d.matched} meter bills compared ({fmt.int(Math.round(d.startGallons / 1000))} to {fmt.int(Math.round(d.endGallons / 1000))} thousand gallons).{' '}
                {Math.abs(d.volume) > Math.abs(d.price) ? 'Mostly the amount of water.' : 'Mostly the City price.'}
              </p>
            </div>
          ))}
        </div>
        <p className="mt-3 max-w-prose text-sm text-ink-2">
          Up steps are marked + and down steps -. "Water used" is the change in gallons at the earlier year's price. "Price" is the change in price on the later
          year's gallons. "Fixed fees" are service charges, per-bill fees, and late charges.
        </p>
      </Section>

      <Section id="timeline" title="What happened when" lead="Events that change water use. Rough dates are shown as a month or a year.">
        {events.length === 0 ? (
          <p className="mt-3 text-ink-2">No events logged yet.</p>
        ) : (
          <ol className="mt-4 space-y-3 border-l-2 border-line pl-5">
            {events.map((e) => (
              <li key={`${e.date}-${e.what}`} className="relative">
                <span aria-hidden="true" className="absolute -left-[27px] top-1.5 h-3 w-3 rounded-full border-2 border-surface bg-ink" />
                <p className="text-sm font-semibold">
                  {evDate(e)} · {EVENT_TYPE[e.type] ?? e.type}
                  {e.meter ? ` · Meter ${meterNumber(e.meter)}` : ''}
                </p>
                <p className="max-w-prose text-sm text-ink-2">{e.what}</p>
              </li>
            ))}
          </ol>
        )}
        <p className="mt-4 text-sm text-ink-2">
          Missing events (repairs, schedule changes, overseeding) are on the <a className="underline underline-offset-4" href="#data">Data and accuracy</a> list.
        </p>
      </Section>
    </article>
  )
}
