import type { SiteData } from '../../scripts/site-data'
import type { RatePeriod, ReadPeriod } from '../engine/billing'
import { leakCost, type EpisodeCost, type LeakCost } from '../engine/leakCost'
import { fmt, meterNumber } from '../lib/data'

type Flag = SiteData['flags'][number]
export type CostedFlag = { flag: Flag; cost: LeakCost | null }

const STATUS_TEXT: Record<Flag['status'], string> = {
  suggested: 'Not checked yet',
  open: 'Confirmed, not fixed',
  investigating: 'Being checked',
  fixed: 'Fixed',
  'false-alarm': 'False alarm',
}

const SURE_TEXT = { high: 'Fairly sure', medium: 'Somewhat sure', low: 'Rough estimate' } as const

const isActive = (f: Flag) => f.status !== 'fixed' && f.status !== 'false-alarm'

/** Active flags with their estimated cost, most expensive first; flags without a cost go last. */
export function costFlags(data: SiteData): CostedFlag[] {
  const rates = data.rates as unknown as RatePeriod[]
  return data.flags
    .filter(isActive)
    .map((flag) => ({
      flag,
      cost: flag.excess_water ? leakCost(flag.meter, flag.excess_water, rates, (data.billingPeriods[flag.meter]?.rows ?? []) as ReadPeriod[]) : null,
    }))
    .sort((a, b) => (b.cost?.high ?? -1) - (a.cost?.high ?? -1))
}

export function dollarRange(low: number, high: number): string {
  const [l, h] = [fmt.usd(low), fmt.usd(high)]
  return l === h ? l : `${l} to ${h}`
}

/** Plain gallons, rounded so the number does not look more exact than it is. */
function gallons(n: number): string {
  if (n >= 10000) return `${fmt.int(Math.round(n / 1000) * 1000)} gallons`
  if (n >= 1000) return `${fmt.int(Math.round(n / 100) * 100)} gallons`
  return `${fmt.int(Math.round(n))} gallons`
}

function dates(from: string, to: string): string {
  const d = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
  return from === to ? d(from) : `${d(from)} to ${d(to)}`
}

function episodeDollars(e: EpisodeCost): string {
  if (e.kind === 'billed') return fmt.usd(e.usd)
  if (e.kind === 'range') return dollarRange(e.low, e.high)
  return 'Not priced'
}

export function LeakFlags({ flags }: { flags: CostedFlag[] }) {
  if (flags.length === 0) {
    return <p className="mt-3 text-ink-2">No possible leaks are flagged right now.</p>
  }
  return (
    <ul className="mt-4 space-y-4">
      {flags.map(({ flag, cost }) => (
        <LeakCard key={flag.id} flag={flag} cost={cost} />
      ))}
    </ul>
  )
}

function LeakCard({ flag, cost }: CostedFlag) {
  const headingId = `${flag.id}-heading`
  return (
    <li id={flag.id} aria-labelledby={headingId} className="scroll-mt-6 rounded-xl border-l-4 border-serious bg-surface p-5 ring-1 ring-[var(--ring)]">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-serious px-2 py-0.5 font-semibold">
          <span aria-hidden="true">!</span>
          {STATUS_TEXT[flag.status]}
        </span>
        <a href={`#meters/${flag.meter}`} className="text-ink-2 underline underline-offset-4">
          Meter {meterNumber(flag.meter)}
        </a>
      </p>
      <h3 id={headingId} className="mt-3 text-lg font-bold">
        {flag.title}
      </h3>

      <CostLine cost={cost} />

      <p className="mt-4 max-w-prose">{flag.summary}</p>
      <dl className="mt-4 space-y-3 text-sm">
        {flag.likely_cause && (
          <div>
            <dt className="font-semibold">What might be causing it</dt>
            <dd className="mt-0.5 max-w-prose text-ink-2">{flag.likely_cause}</dd>
          </div>
        )}
        {flag.todo && (
          <div>
            <dt className="font-semibold">What to check next</dt>
            <dd className="mt-0.5 max-w-prose text-ink-2">{flag.todo}</dd>
          </div>
        )}
      </dl>

      <details className="mt-4 text-sm">
        <summary className="cursor-pointer font-semibold">The numbers behind this</summary>
        <div className="mt-3 space-y-3">
          <p className="max-w-prose">{flag.evidence}</p>
          {cost && cost.episodes.length > 0 && <EpisodeTable cost={cost} />}
          {flag.excess_water && (
            <p className="max-w-prose text-ink-2">
              <span className="font-semibold text-ink">How the extra water was counted:</span> {flag.excess_water.method}{' '}
              {SURE_TEXT[flag.excess_water.confidence]} ({flag.excess_water.confidence} confidence).
            </p>
          )}
          {cost && (
            <p className="max-w-prose text-ink-2">
              <span className="font-semibold text-ink">How the cost was figured:</span> extra water is the last water through the
              meter, so it is charged at the top price that meter was paying, plus the per-gallon fees and tax, using the City of
              Mesa rates on file. Where the bill is in, the cost is that bill recalculated without the extra water. Where it is not
              in yet, it is shown as a range from the lower price to the higher one.
            </p>
          )}
          <p className="text-ink-2">Source: {flag.excess_water?.source ?? flag.source ?? 'Not recorded'}</p>
        </div>
      </details>
    </li>
  )
}

function CostLine({ cost }: { cost: LeakCost | null }) {
  if (!cost) {
    return (
      <p className="mt-3 text-ink-2">
        <span className="font-semibold text-ink">Cost not estimated yet.</span> We cannot yet say how much of this water is extra
        until the weather-based water budget for this meter is built.
      </p>
    )
  }
  return (
    <dl className="mt-3 grid gap-3 sm:grid-cols-3">
      <div className="flex flex-col">
        <dt className="order-2 text-sm text-ink-2">estimated extra charges so far</dt>
        <dd className="order-1 text-2xl font-bold">
          {cost.low !== null && cost.high !== null ? dollarRange(cost.low, cost.high) : 'Not priced yet'}
        </dd>
      </div>
      <div className="flex flex-col">
        <dt className="order-2 text-sm text-ink-2">extra water</dt>
        <dd className="order-1 text-2xl font-bold">{gallons(cost.gallons)}</dd>
      </div>
      {cost.perYear && (
        <div className="flex flex-col">
          <dt className="order-2 text-sm text-ink-2">a year if it keeps going</dt>
          <dd className="order-1 text-2xl font-bold">{dollarRange(cost.perYear.low, cost.perYear.high)}</dd>
        </div>
      )}
      {cost.unpricedGallons > 0 && (
        <p className="text-sm text-ink-2 sm:col-span-3">
          {gallons(cost.unpricedGallons)} not priced: {cost.episodes.find((e) => e.kind === 'unpriced')?.reason}
        </p>
      )}
    </dl>
  )
}

function EpisodeTable({ cost }: { cost: LeakCost }) {
  return (
    <div className="overflow-x-auto rounded-lg ring-1 ring-[var(--ring)]">
      <table className="w-full min-w-[28rem] text-left">
        <caption className="sr-only">Extra water and estimated cost by date</caption>
        <thead className="border-b border-line text-ink-2">
          <tr>
            <th scope="col" className="px-3 py-2 font-semibold">When</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">Extra water</th>
            <th scope="col" className="px-3 py-2 text-right font-semibold">Estimated cost</th>
            <th scope="col" className="px-3 py-2 font-semibold">Priced from</th>
          </tr>
        </thead>
        <tbody>
          {cost.episodes.map((e) => (
            <tr key={`${e.from}-${e.to}`} className="border-b border-line last:border-0 align-top">
              <th scope="row" className="px-3 py-2 font-normal">{dates(e.from, e.to)}</th>
              <td className="tabular px-3 py-2 text-right">{fmt.int(e.gallons)}</td>
              <td className="tabular px-3 py-2 text-right">{episodeDollars(e)}</td>
              <td className="px-3 py-2 text-ink-2">
                {e.kind === 'billed' ? `Bill for the read period ending ${dates(e.periodEnd, e.periodEnd)}` : e.reason}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
