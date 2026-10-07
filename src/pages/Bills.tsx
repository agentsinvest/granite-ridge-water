import { useEffect, useState } from 'react'
import type { SiteData } from '../../scripts/site-data'
import { Bars, METER_COLOR } from '../components/charts'
import { Empty, Stat, Stats, TableView } from '../components/ui'
import { filterBills, summarize } from '../engine/history'
import { fmt, meterNumber, meterName } from '../lib/data'
import { setQuery } from '../lib/route'

type Bill = SiteData['bills'][number]

const usd2 = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })

function Badge({ kind }: { kind: 'review' | 'missing' | 'fail' }) {
  const text = kind === 'review' ? 'Needs review' : kind === 'missing' ? 'Missing' : 'Does not reconcile'
  return (
    <span className="mt-1 inline-flex items-center gap-1 rounded border border-serious px-1.5 text-xs font-semibold">
      <span aria-hidden="true">{kind === 'missing' ? '?' : '!'}</span>
      {text}
    </span>
  )
}

/** Last day of a YYYY-MM month. */
const monthEnd = (ym: string) => new Date(Date.UTC(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)), 0)).toISOString().slice(0, 10)
const addMonths = (ym: string, n: number) => {
  const d = new Date(Date.UTC(Number(ym.slice(0, 4)), Number(ym.slice(5, 7)) - 1 + n, 1))
  return d.toISOString().slice(0, 7)
}

export function Bills({ data, query }: { data: SiteData; query: URLSearchParams }) {
  const meters = data.meters.map((m) => m.id)
  const billDatesAll = [...new Set(data.bills.map((b) => b.bill_date))].sort()
  const latestYm = billDatesAll.at(-1)?.slice(0, 7) ?? '2026-01'
  const firstYm = billDatesAll[0]?.slice(0, 7) ?? latestYm
  const years = [...new Set(billDatesAll.map((d) => d.slice(0, 4)))].sort().reverse()

  const [preset, setPreset] = useState(query.get('p') ?? 'last12')
  const [from, setFrom] = useState(query.get('from') ?? addMonths(latestYm, -11))
  const [to, setTo] = useState(query.get('to') ?? latestYm)
  const [picked, setPicked] = useState<string[]>(query.get('m')?.split(',').filter((m) => meters.includes(m)) ?? meters)

  const range = (() => {
    if (preset === 'last12') return [addMonths(latestYm, -11), latestYm]
    if (preset === 'last24') return [addMonths(latestYm, -23), latestYm]
    if (preset === 'all') return [firstYm, latestYm]
    if (/^\d{4}$/.test(preset)) return [`${preset}-01`, `${preset}-12`]
    return [from <= to ? from : to, from <= to ? to : from]
  })()
  useEffect(() => {
    setQuery({ p: preset, from: preset === 'custom' ? from : null, to: preset === 'custom' ? to : null, m: picked.length === meters.length ? null : picked.join(',') })
  }, [preset, from, to, picked, meters.length])

  if (data.bills.length === 0) {
    return (
      <section>
        <h1 className="text-2xl font-bold">Bills</h1>
        <p className="mt-4 text-ink-2">No bills have been added yet.</p>
      </section>
    )
  }

  const filtered = filterBills(data.bills, { from: `${range[0]}-01`, to: monthEnd(range[1]), meters: picked })
  const s = summarize(filtered)
  const dates = [...new Set(data.bills.map((b) => b.bill_date))].filter((d) => d >= `${range[0]}-01` && d <= monthEnd(range[1])).sort()
  const missing = dates.length * picked.length - filtered.length
  const byKey = new Map(data.bills.map((b) => [`${b.meter}|${b.bill_date}`, b]))
  const review = filtered.filter((b) => b.needs_review).length
  const checked = filtered.filter((b) => b.reconciled === 'pass').length
  const chart = dates.map((d) => {
    const row: Record<string, string | number> = { month: fmt.month(d) }
    for (const m of picked) row[m] = Math.round(byKey.get(`${m}|${d}`)?.printed_total ?? 0)
    return row
  })
  const plWater = (y: string) => data.financials[y]?.lines.find((l) => l.account === '50110')?.actual ?? null
  const label = `${fmt.month(`${range[0]}-01`)} to ${fmt.month(`${range[1]}-01`)}`

  return (
    <article>
      <h1 className="text-2xl font-bold md:text-3xl">Bills</h1>
      <p className="mt-2 max-w-prose text-ink-2">
        Every City of Mesa water bill on file. Pick a period and meters to see totals. Most older bills were read from scans, so a few are marked for review or
        missing.
      </p>

      <form className="mt-6 grid gap-4 rounded-xl bg-surface p-4 ring-1 ring-[var(--ring)] md:grid-cols-[auto_1fr]" onSubmit={(e) => e.preventDefault()} aria-label="Filter bills">
        <div className="flex flex-wrap items-end gap-3 text-sm">
          <label className="block">
            <span className="font-semibold">Period</span>
            <select className="mt-1 block rounded border border-line bg-surface p-2" value={preset} onChange={(e) => setPreset(e.target.value)}>
              <option value="last12">Last 12 months of bills</option>
              <option value="last24">Last 24 months of bills</option>
              {years.map((y) => (
                <option key={y} value={y}>
                  Bills dated in {y}
                </option>
              ))}
              <option value="all">All bills</option>
              <option value="custom">Choose months</option>
            </select>
          </label>
          {preset === 'custom' && (
            <>
              <label className="block">
                <span className="font-semibold">From</span>
                <input type="month" className="mt-1 block rounded border border-line bg-surface p-2" min={firstYm} max={latestYm} value={from} onChange={(e) => setFrom(e.target.value)} />
              </label>
              <label className="block">
                <span className="font-semibold">To</span>
                <input type="month" className="mt-1 block rounded border border-line bg-surface p-2" min={firstYm} max={latestYm} value={to} onChange={(e) => setTo(e.target.value)} />
              </label>
            </>
          )}
        </div>
        <fieldset className="text-sm">
          <legend className="font-semibold">Meters</legend>
          <div className="mt-1 flex flex-wrap gap-x-4 gap-y-1">
            {meters.map((m) => (
              <label key={m} className="flex items-center gap-1.5">
                <input type="checkbox" className="h-4 w-4" checked={picked.includes(m)} onChange={(e) => setPicked(e.target.checked ? [...picked, m].sort() : picked.filter((x) => x !== m))} />
                {meterName(m)}
              </label>
            ))}
          </div>
        </fieldset>
      </form>

      {filtered.length === 0 ? (
        <Empty>No bills match this period and these meters. Try a longer period or more meters.</Empty>
      ) : (
        <>
          <Stats>
            <Stat value={usd2(s.total)} label={`${s.count} bills, ${label}`} />
            <Stat value={s.gallons ? `${fmt.int(Math.round(s.gallons / 1000))},000` : 'Unknown'} label={`gallons (on ${s.billsWithGallons} of ${s.count} bills where the City's gallons are readable)`} />
            <Stat value={s.costPerKgal === null ? 'Unknown' : `$${s.costPerKgal.toFixed(2)}`} label="per 1,000 gallons, all charges included" />
            <Stat value={String(missing)} label={`bills not on file for this period${review ? `; ${review} marked for review` : ''}`} flag={missing > 0} />
          </Stats>
          <p className="mt-3 text-sm text-ink-2">
            {checked} of these bills are checked line by line against the City's rates. Service charges and fixed fees: {usd2(s.fixed)}.
          </p>

          <section aria-labelledby="chart-heading" className="mt-8">
            <h2 id="chart-heading" className="text-xl font-bold">Bill totals by month</h2>
            <Bars data={chart} x="month" stacked money series={picked.map((m) => ({ key: m, name: `Meter ${meterNumber(m)}`, color: METER_COLOR[m] ?? 'var(--s1)' }))} label={`Bill totals by month and meter, ${label}`} />
            <TableView caption="Bill totals by month" head={['Bill month', ...picked.map((m) => `Meter ${meterNumber(m)}`)]} rows={chart.map((r) => [r.month as string, ...picked.map((m) => fmt.usd(r[m] as number))])} />
          </section>
        </>
      )}

      <section aria-labelledby="years-heading" className="mt-10">
        <h2 id="years-heading" className="text-xl font-bold">By year</h2>
        <p className="mt-1 max-w-prose text-sm text-ink-2">
          All meters, counted by bill date. The HOA's books record water when it is paid, so the two will not match exactly until every bill is read.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl bg-surface ring-1 ring-[var(--ring)]">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">Bill totals by year compared with the HOA books</caption>
            <thead className="border-b border-line text-ink-2">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Year</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Bills on file</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Total of bills on file</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">HOA books, water</th>
              </tr>
            </thead>
            <tbody>
              {years.map((y) => {
                const ys = data.bills.filter((b) => b.bill_date.startsWith(y))
                const nDates = billDatesAll.filter((d) => d.startsWith(y)).length
                const pl = plWater(y)
                return (
                  <tr key={y} className="border-b border-line last:border-0">
                    <th scope="row" className="px-4 py-3 font-semibold">{y}</th>
                    <td className="tabular px-4 py-3 text-right">{ys.length} of {nDates * meters.length}</td>
                    <td className="tabular px-4 py-3 text-right">{usd2(ys.reduce((t, b) => t + b.printed_total, 0))}</td>
                    <td className="tabular px-4 py-3 text-right">{pl === null ? <span className="italic text-ink-2">Not on file</span> : usd2(pl)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      {filtered.length > 0 && (
        <section aria-labelledby="every-heading" className="mt-10">
          <h2 id="every-heading" className="text-xl font-bold">Every bill in this period</h2>
          <p className="mt-1 text-sm text-ink-2">Dollars are the bill's current charges. Gallons are what the City billed.</p>
          <div className="mt-4 overflow-x-auto rounded-xl bg-surface ring-1 ring-[var(--ring)]">
            <table className="w-full min-w-[40rem] text-left text-sm">
              <caption className="sr-only">Bills by date and meter, {label}</caption>
              <thead className="border-b border-line text-ink-2">
                <tr>
                  <th scope="col" className="px-4 py-2 font-semibold">Bill date</th>
                  {picked.map((m) => (
                    <th key={m} scope="col" className="px-4 py-2 text-right font-semibold">Meter {meterNumber(m)}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {[...dates].reverse().map((d) => (
                  <tr key={d} className="border-b border-line align-top last:border-0">
                    <th scope="row" className="tabular px-4 py-2 font-normal">{d}</th>
                    {picked.map((m) => (
                      <Cell key={m} bill={byKey.get(`${m}|${d}`)} />
                    ))}
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-line">
                <tr>
                  <th scope="row" className="px-4 py-2 text-left font-semibold">Total</th>
                  {picked.map((m) => (
                    <td key={m} className="tabular px-4 py-2 text-right font-semibold">{usd2(filtered.filter((b) => b.meter === m).reduce((t, b) => t + b.printed_total, 0))}</td>
                  ))}
                </tr>
              </tfoot>
            </table>
          </div>
        </section>
      )}
    </article>
  )
}

function Cell({ bill }: { bill: Bill | undefined }) {
  if (!bill)
    return (
      <td className="px-4 py-2 text-right">
        <Badge kind="missing" />
      </td>
    )
  return (
    <td className="tabular px-4 py-2 text-right">
      <span className="block font-semibold">{usd2(bill.printed_total)}</span>
      <span className="block text-ink-2">{bill.gallons === null ? 'gallons unknown' : `${fmt.int(bill.gallons)} gal`}</span>
      {bill.reconciled === 'fail' && <Badge kind="fail" />}
      {bill.needs_review && bill.reconciled !== 'fail' && <Badge kind="review" />}
      {bill.reconciled !== 'pass' && bill.reconciled !== 'fail' && !bill.needs_review && <span className="mt-1 block text-xs text-ink-2">Unreconciled</span>}
    </td>
  )
}
