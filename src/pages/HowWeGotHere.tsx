import type { SiteData } from '../../scripts/site-data'
import { Bars, METER_COLOR, Waterfall } from '../components/charts'
import { GridTable, PageHeader, Section, Stat, Stats, Sure, TableView } from '../components/ui'
import { splitUsageCharge } from '../engine/billing'
import { decomposeYears, summarize } from '../engine/history'
import { fmt, meterNumber } from '../lib/data'
import type { Model } from '../lib/model'

const EVENT_TYPE: Record<string, string> = {
  leak: 'Leak', repair: 'Repair', controller: 'Controller', schedule: 'Schedule', landscape: 'Landscape', meter: 'Meter', overseed: 'Overseed', rebate: 'Rebate', other: 'Other',
}

const longDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { dateStyle: 'medium' })

/** Each month's usage charges split into water at the lower price and water above the winter allowance at the higher price. */
function surchargeByMonth(data: SiteData, model: Model) {
  const r2 = (x: number) => Math.round(x * 100) / 100
  const priced = data.bills.filter((b) => b.gallons !== null && b.period_start && b.period_end && model.rates.some((r) => b.period_end! >= r.applies_from_period_end))
  const months = [...new Set(priced.map((b) => b.bill_date.slice(0, 7)))].sort()
  const rows = months.map((ym) => {
    const bills = priced.filter((b) => b.bill_date.startsWith(ym))
    const row = { month: fmt.month(`${ym}-15`), lower: 0, higher: 0, premium: 0, drought: 0, lowerKgal: 0, higherKgal: 0, bills: bills.length, unsplit: 0, prices: new Set<string>() }
    for (const b of bills) {
      const usage = b.lineItems.find((l) => l.name === 'Excess usage charge')?.amount ?? null
      const s = usage === null ? null : splitUsageCharge(b.meter, b.period_start!, b.period_end!, b.gallons!, usage, model.rates, model.periods[b.meter])
      if (!s) {
        row.unsplit++
        continue
      }
      row.lower += s.lowerDollars
      row.higher += s.higherDollars
      row.premium += s.premium
      row.lowerKgal += s.lowerKgal
      row.higherKgal += s.higherKgal
      row.drought += b.lineItems.find((l) => l.name === 'Water drought')?.amount ?? 0
      row.prices.add(`$${s.lowerPrice.toFixed(2)} / $${s.higherPrice.toFixed(2)}`)
    }
    return { ...row, lower: r2(row.lower), higher: r2(row.higher), premium: r2(row.premium), drought: r2(row.drought), prices: [...row.prices].join(', ') }
  })
  const firstPriced = [...model.rates].map((r) => r.applies_from_period_end).sort()[0] ?? null
  return { rows, firstPriced }
}

/** Gallons, peak surcharge, total bill, and all-in cost per 1,000 gallons, by meter and year. */
function MeterHistory({ data, spend }: { data: SiteData; spend: { year: string; total: number; partial: number }[] }) {
  const h = data.meterYears!
  const years = [...new Set(h.rows.map((r) => r.year))].sort()
  const partial = new Set(h.rows.filter((r) => !r.complete).map((r) => r.year))
  const head = ['', ...years.map((y) => (partial.has(y) ? `${y} so far` : String(y)))]
  const cell = (y: number, m: string) => h.rows.find((r) => r.year === y && r.meter === m) ?? null
  const sum = (y: number, k: 'kgal' | 'peakSurcharge') => {
    const vals = data.meters.map((m) => cell(y, m.id)?.[k] ?? null)
    return vals.some((v) => v === null) ? null : (vals as number[]).reduce((a, b) => a + b, 0)
  }
  const missing = <span className="italic text-ink-2">Not on file</span>
  const meterLabel = (m: SiteData['meters'][number]) => (
    <>
      Meter {meterNumber(m.id)}
      {m.meter_number_last4 ? ` (...${m.meter_number_last4})` : ''}
      {m.location && <span className="block min-w-[10rem] max-w-[16rem] whitespace-normal text-xs text-ink-2">{m.location}</span>}
    </>
  )
  const total = (y: number) => spend.find((s) => s.year.startsWith(String(y)))?.total ?? null
  return (
    <Section id="by-meter" title="Bill history by meter" lead={`Thousands of gallons and peak surcharge by meter and year, from the City bills. ${h.covers}`}>
      <GridTable
        caption="Gallons, peak surcharge, and total water bill by meter and year"
        head={head}
        groups={[
          {
            title: 'Gallons (1,000s)',
            rows: [
              ...data.meters.map((m) => ({ label: meterLabel(m), cells: years.map((y) => (cell(y, m.id)?.kgal == null ? missing : fmt.int(cell(y, m.id)!.kgal!))) })),
              { label: 'All meters', strong: true, cells: years.map((y) => (sum(y, 'kgal') === null ? missing : fmt.int(sum(y, 'kgal')!))) },
            ],
          },
          {
            title: 'Peak surcharge paid ($)',
            rows: [
              ...data.meters.map((m) => ({ label: `Meter ${meterNumber(m.id)}`, cells: years.map((y) => (cell(y, m.id)?.peakSurcharge == null ? missing : fmt.usd(cell(y, m.id)!.peakSurcharge!))) })),
              { label: 'All meters', strong: true, cells: years.map((y) => (sum(y, 'peakSurcharge') === null ? missing : fmt.usd(sum(y, 'peakSurcharge')!))) },
            ],
          },
          {
            rows: [
              { label: 'Total HOA water bill', strong: true, cells: years.map((y) => (total(y) === null ? missing : fmt.usd(total(y)!))) },
              {
                label: 'Cost per 1,000 gallons, all in',
                muted: true,
                cells: years.map((y) => (total(y) === null || !sum(y, 'kgal') ? missing : `$${(total(y)! / sum(y, 'kgal')!).toFixed(2)}`)),
              },
            ],
          },
        ]}
      />
      <div className="mt-3 max-w-prose space-y-2 text-sm text-ink-2">
        <p>
          Peak surcharge is what the HOA paid because water went above each meter's winter allowance: the gallons above it times the difference between the
          higher and lower price. Total bill is the HOA's year-end books, and City bills for the year so far. Cost per 1,000 gallons is the total bill divided
          by all-meter gallons.
        </p>
        {h.note && <p>{h.note}</p>}
        <p>
          Source: {h.source}. <Sure level={h.confidence} />
        </p>
      </div>
    </Section>
  )
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
  // Year to date for the year after the last P&L, from City bills (the official record) until the year-end books exist.
  const ytdYear = pl.length ? String(Number(pl.at(-1)!.year) + 1) : null
  const ytdBills = ytdYear ? data.bills.filter((b) => b.bill_date.startsWith(ytdYear)) : []
  const ytd = ytdYear && ytdBills.length
    ? {
        year: ytdYear,
        total: Math.round(ytdBills.reduce((s, b) => s + b.printed_total, 0) * 100) / 100,
        bills: ytdBills.length,
        unreconciled: ytdBills.filter((b) => b.reconciled !== 'pass').length,
        through: ytdBills.map((b) => b.bill_date).sort().at(-1)!,
      }
    : null
  const rainFor = (year: string) => data.annualRainfall.find((r) => String(r.year) === year) ?? null
  const rainLabel = (year: string) => {
    const r = rainFor(year)
    return r?.inches == null ? 'no data' : `${r.inches.toFixed(1)} in`
  }
  const rainText = (year: string) => {
    const r = rainFor(year)
    return r?.inches == null ? 'Not on file' : `${r.inches.toFixed(2)} in${r.complete ? '' : ' so far'}`
  }
  const spend = [
    ...pl.map((r) => ({ year: r.year, total: r.total, partial: 0, rain: rainLabel(r.year) })),
    ...(ytd ? [{ year: `${ytd.year} YTD`, total: ytd.total, partial: 1, rain: rainLabel(ytd.year) }] : []),
  ]
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
  const surcharge = surchargeByMonth(data, model)
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

      <Section
        id="pl"
        title="What the HOA spent each year"
        lead={`Water line from the HOA's year-end books.${ytd ? ` ${ytd.year} YTD is the lighter bar: City bills dated ${ytd.year} so far, since the year-end books are not out yet.` : ''} The dashed line is the target. Under each year is that year's rainfall in inches.`}
      >
        <Bars data={spend} x="year" xSub="rain" series={[{ key: 'total', name: 'Water spend', color: 'var(--s1)', dimWhen: 'partial' }]} label="HOA water spending by year" money target={model.target} targetLabel={`Target ${fmt.usd(model.target)}`} />
        <TableView
          caption="HOA water spending by year"
          head={['Year', 'Spend', 'Rain', 'Source']}
          rows={[
            ...pl.map((r) => [r.year, fmt.usd(r.total), rainText(r.year), 'Year-end books']),
            ...(ytd ? [[`${ytd.year} YTD`, fmt.usd(ytd.total), rainText(ytd.year), `${ytd.bills} City bills through ${longDate(ytd.through)}`]] : []),
          ]}
        />
        {ytd && (
          <p className="mt-3 max-w-prose text-sm text-ink-2">
            {ytd.year} so far is {fmt.usd(ytd.total)} from {ytd.bills} City bills dated through {longDate(ytd.through)}
            {ytd.unreconciled > 0 ? `, ${ytd.unreconciled} of them unreconciled` : ''}. It is a partial year, so it is not a full-year total. Bill totals and the books can differ because the books may follow payment dates.
          </p>
        )}
        <p className="mt-3 max-w-prose text-sm text-ink-2">
          Rainfall is the yearly total the HOA provided. The gauge or weather station behind it is not confirmed yet.
          {(() => {
            const r = data.annualRainfall.find((x) => !x.complete)
            return r ? ` ${r.year} rain is the total so far this year.` : ''
          })()}
        </p>
      </Section>

      {data.meterYears && <MeterHistory data={data} spend={spend} />}

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

      <Section
        id="surcharge"
        title="Water above the winter allowance, by month"
        lead="The City prices each meter's water in two steps. Water up to the meter's winter allowance (its December to February average) costs the lower price. Water above it costs the higher price."
      >
        {surcharge.rows.length === 0 ? (
          <p className="mt-3 text-ink-2">No City prices on file yet, so no bills can be split.</p>
        ) : (
          <>
            <Stats>
              <Stat value={fmt.usd(surcharge.rows.reduce((t, r) => t + r.higher, 0))} label={`billed at the higher price, ${surcharge.rows[0].month} to ${surcharge.rows.at(-1)!.month}`} />
              <Stat value={fmt.usd(surcharge.rows.reduce((t, r) => t + r.premium, 0))} label="extra paid because that water was above the allowance" />
              <Stat value={fmt.usd(surcharge.rows.reduce((t, r) => t + r.drought, 0))} label="water drought charge over the same months" />
            </Stats>
            <Bars
              data={surcharge.rows.map((r) => ({ month: r.month, lower: r.lower, higher: r.higher }))}
              x="month"
              stacked
              series={[
                { key: 'lower', name: 'Water at the lower price', color: 'var(--s1)' },
                { key: 'higher', name: 'Water above the allowance, higher price', color: 'var(--s2)' },
              ]}
              label="Usage charges by bill month, split into the lower price and the higher price above the winter allowance"
              money
            />
            <TableView
              caption="Usage charges by bill month, all meters"
              head={['Bill month', 'Lower price', 'Higher price', 'Extra from higher price', 'Water drought', 'Thousand gallons above allowance', 'Price per 1,000 gallons (lower / higher)', 'Bills']}
              rows={surcharge.rows.map((r) => [
                r.month,
                fmt.usd(r.lower),
                fmt.usd(r.higher),
                fmt.usd(r.premium),
                `$${r.drought.toFixed(2)}`,
                fmt.int(r.higherKgal),
                r.prices || 'Unknown',
                r.unsplit ? `${r.bills - r.unsplit} of ${r.bills} split` : r.bills,
              ])}
            />
            <p className="mt-3 max-w-prose text-sm text-ink-2">
              "Extra from higher price" is the gallons above the allowance times the difference between the two prices: what that water cost beyond the lower
              price. Prices are worked out from the bills and match each bill's usage charge to the cent; a bill they do not match is left out and counted in the
              Bills column. The first 3,000 gallons on each bill carry no usage charge. Prices before read periods ending{' '}
              {surcharge.firstPriced ? fmt.month(surcharge.firstPriced) : 'the first rate on file'} are not on file yet, so earlier months are not shown.
            </p>
          </>
        )}
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
          Missing events (repairs, schedule changes, overseeding) are on the <a className="underline underline-offset-4" href="#about">Data and accuracy</a> list.
        </p>
      </Section>
    </article>
  )
}
