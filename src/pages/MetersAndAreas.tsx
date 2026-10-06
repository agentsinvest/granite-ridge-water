import type { ReactNode } from 'react'
import type { SiteData } from '../../scripts/site-data'
import { SiteMap } from '../components/SiteMap'
import { fmt, meterNumber } from '../lib/data'
import { recentUsage, shares } from '../engine/usage'

const RECENT_PERIODS = 12

const FLAG_STATUS_TEXT: Record<string, string> = {
  suggested: 'Suggested, not yet reviewed',
  open: 'Open',
  investigating: 'Being investigated',
  fixed: 'Fixed',
  'false-alarm': 'False alarm',
}

function Missing({ what }: { what: string }) {
  return <span className="italic text-ink-2">{what} not recorded yet</span>
}

export function MetersAndAreas({ data }: { data: SiteData }) {
  const wf = data.areas.frontmatter.waterfluence_landscape as
    | { shrub_sq_ft: number; turf_overseed_sq_ft: number; turf_no_overseed_sq_ft: number; total_sq_ft: number; source: string }
    | undefined
  const areaNames = Object.fromEntries(data.areas.rows.map((r) => [r['Area id'], { label: r['Map label'], name: r.Name }]))
  const activeFlags = data.flags.filter((f) => f.status !== 'fixed' && f.status !== 'false-alarm')
  const flaggedMeters = new Set(activeFlags.map((f) => f.meter))

  const summaries = data.meters.map((m) => recentUsage(m.id, data.billingPeriods[m.id]?.rows ?? [], RECENT_PERIODS))
  const share = shares(summaries)
  const totalRecent = summaries.reduce((s, m) => s + m.thousandGallons, 0)
  const range = summaries.find((s) => s.from && s.to)
  const metersFor = (areaId: string) => data.meters.filter((m) => m.areas_served?.includes(areaId)).map((m) => m.id)
  const target = (data.config.site as { annual_target_usd?: { value: number } }).annual_target_usd?.value ?? null
  const billsFor = (meter: string) => data.bills.filter((b) => b.meter === meter).sort((a, b) => a.bill_date.localeCompare(b.bill_date)).slice(-12)
  const recentBills = data.meters.flatMap((m) => billsFor(m.id))
  const billTotal = recentBills.reduce((s, b) => s + b.printed_total, 0)
  const billRange = recentBills.length ? [recentBills.map((b) => b.bill_date).sort()[0], recentBills.map((b) => b.bill_date).sort().at(-1)!] : null
  const grossTotal = data.areas.rows.reduce((s, r) => s + (r['Gross sq ft'] ?? 0), 0)

  if (data.meters.length === 0 && data.areas.rows.length === 0) {
    return (
      <section>
        <h1 className="text-2xl font-bold">Meters and areas</h1>
        <p className="mt-4 text-ink-2">No meters or areas have been added yet. Add them as files in the data folder.</p>
      </section>
    )
  }

  return (
    <article>
      <h1 className="text-2xl font-bold md:text-3xl">Meters and areas</h1>
      <p className="mt-2 max-w-prose text-ink-2">
        Where the HOA's four City of Mesa water meters are, and what landscape the common areas hold.
      </p>

      <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">
        <Stat
          value={billTotal > 0 ? fmt.usd(billTotal) : 'Missing'}
          label={
            billRange
              ? `City water bills, all meters, ${fmt.month(billRange[0])} to ${fmt.month(billRange[1])}${target ? ` (target ${fmt.usd(target)} a year)` : ''}`
              : 'City water bills'
          }
        />
        <Stat
          value={wf ? `${fmt.int(wf.total_sq_ft)} sq ft` : 'Missing'}
          label={wf ? `irrigated landscape, ${fmt.pct(wf.turf_overseed_sq_ft / wf.total_sq_ft)} of it turf (Waterfluence)` : 'irrigated landscape'}
        />
        <Stat
          value={totalRecent > 0 ? fmt.gallons(totalRecent) : 'Missing'}
          label={range?.from && range.to ? `used, all meters, ${fmt.month(range.from)} to ${fmt.month(range.to)}` : 'used in the last 12 read periods'}
        />
        <Stat
          value={String(activeFlags.length)}
          label={activeFlags.length === 1 ? 'possible leak flagged' : 'possible leaks flagged, across all meters'}
          flag={activeFlags.length > 0}
        />
      </dl>

      <section aria-labelledby="map-heading" className="mt-10">
        <h2 id="map-heading" className="text-xl font-bold">
          Map
        </h2>
        <p className="mt-1 text-sm text-ink-2">Select a meter number to jump to its details.</p>
        <div className="mt-4 rounded-xl bg-surface p-3 ring-1 ring-[var(--ring)] md:p-5">
          <SiteMap map={data.map} areaNames={areaNames} flaggedMeters={flaggedMeters} />
        </div>
        <details className="mt-3 text-sm text-ink-2">
          <summary className="cursor-pointer font-semibold text-ink">How this map was made</summary>
          <p className="mt-2 max-w-prose">
            The area outlines are traced by hand from the HOA's annotated aerial map, and the meter locations come from the
            Waterfluence controller map. It is a simplified drawing: square footages below come from the source maps, not
            from the drawing. {data.map.slope.text}
          </p>
        </details>
      </section>

      <section aria-labelledby="areas-heading" className="mt-10">
        <h2 id="areas-heading" className="text-xl font-bold">
          Common areas
        </h2>
        {data.areas.rows.length === 0 ? (
          <p className="mt-3 text-ink-2">No areas have been added yet.</p>
        ) : (
          <div className="mt-4 overflow-x-auto rounded-xl bg-surface ring-1 ring-[var(--ring)]">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <caption className="sr-only">Common areas with gross square footage</caption>
              <thead className="border-b border-line text-ink-2">
                <tr>
                  <th scope="col" className="px-4 py-3 font-semibold">Area</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Square feet</th>
                  <th scope="col" className="px-4 py-3 text-right font-semibold">Turf</th>
                  <th scope="col" className="px-4 py-3 font-semibold">Which meter waters it</th>
                </tr>
              </thead>
              <tbody>
                {data.areas.rows.map((r) => (
                  <tr key={r['Area id']} className="border-b border-line last:border-0 align-top">
                    <th scope="row" className="px-4 py-3 font-normal">
                      <span className="mr-2 inline-flex h-6 w-6 items-center justify-center rounded-full border-2 border-ink text-xs font-bold">
                        {r['Map label']}
                      </span>
                      <span className="font-semibold">{r.Name}</span>
                      <span className="mt-1 block text-ink-2">{r.Description}</span>
                    </th>
                    <td className="tabular px-4 py-3 text-right">{r['Gross sq ft'] === null ? <Missing what="Size" /> : fmt.int(r['Gross sq ft'])}</td>
                    <td className="tabular px-4 py-3 text-right">{r['Turf sq ft'] === null ? '' : `about ${fmt.int(r['Turf sq ft'])}`}</td>
                    <td className="px-4 py-3">
                      {metersFor(r['Area id']).length ? metersFor(r['Area id']).map((id) => `Meter ${meterNumber(id)}`).join(', ') : <Missing what="Meter" />}
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot className="border-t border-line">
                <tr>
                  <th scope="row" className="px-4 py-3 text-left font-semibold">All areas</th>
                  <td className="tabular px-4 py-3 text-right font-semibold">{fmt.int(grossTotal)}</td>
                  <td colSpan={2} />
                </tr>
              </tfoot>
            </table>
          </div>
        )}
        {wf && (
          <p className="mt-3 max-w-prose text-sm text-ink-2">
            Waterfluence measures {fmt.int(wf.shrub_sq_ft)} sq ft of irrigated shrub and desert landscape and{' '}
            {fmt.int(wf.turf_overseed_sq_ft)} sq ft of overseeded turf. Those figures do not split by area and are a little higher
            than the HOA map; which set the water budget uses is still open.
          </p>
        )}
      </section>

      <section aria-labelledby="meters-heading" className="mt-10">
        <h2 id="meters-heading" className="text-xl font-bold">
          Meters
        </h2>
        <p className="mt-1 text-sm text-ink-2">
          Meter numbers are labels used on this site. Water use is metered usage from Waterfluence for the last{' '}
          {RECENT_PERIODS} City read periods.
        </p>
        <ul className="mt-4 grid gap-4 md:grid-cols-2">
          {data.meters.map((m) => {
            const s = summaries.find((x) => x.meter === m.id)
            const sh = share[m.id]
            const flags = activeFlags.filter((f) => f.meter === m.id)
            return (
              <li key={m.id} id={m.id} className="scroll-mt-6 rounded-xl bg-surface p-5 ring-1 ring-[var(--ring)]">
                <h3 className="flex items-baseline gap-3">
                  <span className="text-lg font-bold">Meter {meterNumber(m.id)}</span>
                  <span className="text-sm text-ink-2">meter number ending {m.meter_number_last4 ?? '????'}</span>
                </h3>
                <MeterBills bills={billsFor(m.id)} />
                <p className="mt-3 text-2xl font-bold">{s && s.thousandGallons > 0 ? fmt.gallons(s.thousandGallons) : 'Missing'}</p>
                <p className="text-sm text-ink-2">
                  {sh !== null && sh !== undefined ? `${fmt.pct(sh)} of all common-area water` : 'Share unknown'}
                  {s && s.missingPeriods > 0 ? `, ${s.missingPeriods} read periods missing` : ''}
                </p>
                <dl className="mt-4 space-y-2 text-sm">
                  <Row term="Where it is">{m.location ?? <Missing what="Location" />}</Row>
                  <Row term="Waters">
                    {m.areas_served?.length ? m.areas_served.map((a) => areaNames[a]?.name ?? a).join(', ') : <Missing what="Areas served" />}
                    {m.areas_served_note && <span className="mt-1 block text-ink-2">{m.areas_served_note}</span>}
                  </Row>
                  <Row term="Mesa account">{m.account_last4 ? `ending ${m.account_last4}` : <Missing what="Account" />}</Row>
                  <Row term="Meter size">{m.size_inches ? `${m.size_inches} inch` : <Missing what="Size" />}</Row>
                </dl>
                {flags.length > 0 && (
                  <ul className="mt-4 space-y-3">
                    {flags.map((f) => (
                      <li key={f.id} className="rounded-lg border-2 border-serious p-3 text-sm" role="note">
                        <p className="flex items-center gap-2 font-semibold">
                          <span aria-hidden="true" className="inline-flex h-5 w-5 shrink-0 items-center justify-center rounded-full bg-serious text-xs font-extrabold text-[#0b0b0b]">
                            !
                          </span>
                          Possible leak: {FLAG_STATUS_TEXT[f.status]}
                        </p>
                        <p className="mt-2">{f.evidence}</p>
                        {f.likely_cause && <p className="mt-2 text-ink-2">Likely cause: {f.likely_cause}</p>}
                      </li>
                    ))}
                  </ul>
                )}
              </li>
            )
          })}
        </ul>
      </section>
    </article>
  )
}

function Stat({ value, label, flag }: { value: string; label: string; flag?: boolean }) {
  return (
    <div className="flex flex-col rounded-xl bg-surface p-4 ring-1 ring-[var(--ring)]">
      <dt className="order-2 mt-1 text-sm text-ink-2">{label}</dt>
      <dd className="order-1 flex items-center gap-2 text-2xl font-bold">
        {flag && (
          <span aria-hidden="true" className="inline-flex h-6 w-6 items-center justify-center rounded-full bg-serious text-sm font-extrabold text-[#0b0b0b]">
            !
          </span>
        )}
        {value}
      </dd>
    </div>
  )
}

function MeterBills({ bills }: { bills: SiteData['bills'] }) {
  if (bills.length === 0) return <p className="mt-3 text-sm text-ink-2"><Missing what="Bills" /></p>
  const total = bills.reduce((s, b) => s + b.printed_total, 0)
  const unreconciled = bills.filter((b) => b.reconciled !== 'pass')
  return (
    <div className="mt-3">
      <p className="text-2xl font-bold">{fmt.usd(total)}</p>
      <p className="text-sm text-ink-2">
        last {bills.length} City bills, {fmt.month(bills[0].bill_date)} to {fmt.month(bills.at(-1)!.bill_date)}
      </p>
      {unreconciled.length > 0 && (
        <p className="mt-2 inline-flex items-center gap-2 rounded-md border-2 border-serious px-2 py-1 text-xs font-semibold">
          <span aria-hidden="true">!</span>
          {unreconciled.length} {unreconciled.length === 1 ? 'bill' : 'bills'} unreconciled
        </p>
      )}
    </div>
  )
}

function Row({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div className="grid grid-cols-[7.5rem_1fr] gap-2">
      <dt className="text-ink-2">{term}</dt>
      <dd>{children}</dd>
    </div>
  )
}
