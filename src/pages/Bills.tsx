import type { SiteData } from '../../scripts/site-data'
import { fmt, meterNumber } from '../lib/data'

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

export function Bills({ data }: { data: SiteData }) {
  const meters = data.meters.map((m) => m.id)
  const byKey = new Map(data.bills.map((b) => [`${b.meter}|${b.bill_date}`, b]))
  const billDates = [...new Set(data.bills.map((b) => b.bill_date))].sort().reverse()
  const years = [...new Set(billDates.map((d) => d.slice(0, 4)))]
  const plWater = (y: string) => data.financials[y]?.lines.find((l) => l.account === '50110')?.actual ?? null
  const review = data.bills.filter((b) => b.needs_review).length
  const missing = billDates.length * meters.length - data.bills.length
  const checked = data.bills.filter((b) => b.reconciled === 'pass').length

  if (data.bills.length === 0) {
    return (
      <section>
        <h1 className="text-2xl font-bold">Bills</h1>
        <p className="mt-4 text-ink-2">No bills have been added yet.</p>
      </section>
    )
  }

  return (
    <article>
      <h1 className="text-2xl font-bold md:text-3xl">Bills</h1>
      <p className="mt-2 max-w-prose text-ink-2">
        Every City of Mesa water bill on file, by meter. Most were read from scanned bills, so a few are marked for review or are
        still missing.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Tile value={fmt.int(data.bills.length)} label={`bills from ${fmt.month(billDates.at(-1)!)} to ${fmt.month(billDates[0])}`} />
        <Tile value={fmt.int(checked)} label="checked line by line against the City's rates" />
        <Tile value={fmt.int(review)} label="marked for review (usually gallons not readable)" />
        <Tile value={fmt.int(missing)} label="meter bills not read yet" />
      </dl>

      <section aria-labelledby="years-heading" className="mt-10">
        <h2 id="years-heading" className="text-xl font-bold">
          By year
        </h2>
        <p className="mt-1 max-w-prose text-sm text-ink-2">
          Bills are counted by bill date. The HOA's P&amp;L records water when it is paid, so the two will not match exactly, and
          they cannot match until every bill is read.
        </p>
        <div className="mt-4 overflow-x-auto rounded-xl bg-surface ring-1 ring-[var(--ring)]">
          <table className="w-full min-w-[34rem] text-left text-sm">
            <caption className="sr-only">Bill totals by year compared with the P&amp;L</caption>
            <thead className="border-b border-line text-ink-2">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Year</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Bills read</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">Total of bills read</th>
                <th scope="col" className="px-4 py-3 text-right font-semibold">P&amp;L water</th>
              </tr>
            </thead>
            <tbody>
              {years.map((y) => {
                const ys = data.bills.filter((b) => b.bill_date.startsWith(y))
                const dates = billDates.filter((d) => d.startsWith(y)).length
                const pl = plWater(y)
                return (
                  <tr key={y} className="border-b border-line last:border-0">
                    <th scope="row" className="px-4 py-3 font-semibold">{y}</th>
                    <td className="tabular px-4 py-3 text-right">
                      {ys.length} of {dates * meters.length}
                    </td>
                    <td className="tabular px-4 py-3 text-right">{usd2(ys.reduce((s, b) => s + b.printed_total, 0))}</td>
                    <td className="tabular px-4 py-3 text-right">{pl === null ? <span className="italic text-ink-2">Not on file</span> : usd2(pl)}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </section>

      <section aria-labelledby="months-heading" className="mt-10">
        <h2 id="months-heading" className="text-xl font-bold">
          Every bill
        </h2>
        <p className="mt-1 text-sm text-ink-2">Dollars are the bill's current charges. Gallons are what the City billed.</p>
        {years.map((y, i) => (
          <details key={y} open={i === 0} className="mt-4 rounded-xl bg-surface ring-1 ring-[var(--ring)]">
            <summary className="cursor-pointer px-4 py-3 font-semibold">{y}</summary>
            <div className="overflow-x-auto">
              <table className="w-full min-w-[40rem] text-left text-sm">
                <caption className="sr-only">Bills dated in {y}, by meter</caption>
                <thead className="border-y border-line text-ink-2">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-semibold">Bill date</th>
                    {meters.map((m) => (
                      <th key={m} scope="col" className="px-4 py-2 text-right font-semibold">
                        Meter {meterNumber(m)}
                      </th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {billDates
                    .filter((d) => d.startsWith(y))
                    .map((d) => (
                      <tr key={d} className="border-b border-line align-top last:border-0">
                        <th scope="row" className="tabular px-4 py-2 font-normal">{d}</th>
                        {meters.map((m) => (
                          <Cell key={m} bill={byKey.get(`${m}|${d}`)} />
                        ))}
                      </tr>
                    ))}
                </tbody>
              </table>
            </div>
          </details>
        ))}
      </section>
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
    </td>
  )
}

function Tile({ value, label }: { value: string; label: string }) {
  return (
    <div className="flex flex-col rounded-xl bg-surface p-4 ring-1 ring-[var(--ring)]">
      <dt className="order-2 mt-1 text-sm text-ink-2">{label}</dt>
      <dd className="order-1 text-2xl font-bold">{value}</dd>
    </div>
  )
}
