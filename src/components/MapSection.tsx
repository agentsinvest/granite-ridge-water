import type { SiteData } from '../../scripts/site-data'
import { SiteMap } from './SiteMap'
import { costFlags } from './LeakFlags'
import type { MapCosts } from './MapCostCard'
import { meterCostPair } from '../engine/mapCost'
import { fmt, meterName, meterNumber } from '../lib/data'
import { mapAlerts } from '../lib/mapAlerts'
import { MONTHS } from '../lib/model'

function Missing({ what }: { what: string }) {
  return <span className="italic text-ink-2">{what} not recorded yet</span>
}

/** The site map with costs on hover, controller details, and current problems as markers. Shown on the Home page. */
export function MapSection({ data }: { data: SiteData }) {
  const areaNames = Object.fromEntries(data.areas.rows.map((r) => [r['Area id'], { label: r['Map label'], name: r.Name }]))
  const activeFlags = costFlags(data).map((c) => c.flag)
  const flaggedMeters = new Set(activeFlags.map((f) => f.meter))
  const alerts = mapAlerts(data.map, activeFlags, data.meters.map((m) => ({ id: m.id, checks: m.checks })))
  const mapCosts: MapCosts = {
    bills: data.bills,
    stations: data.controllers.flatMap((c) => c.stations),
    unconfirmedSplit: new Set(data.controllers.filter((c) => c.confidence !== 'high' && c.meters.length > 1).map((c) => c.id)),
    meters: data.meters,
    shares: data.zoneShares,
  }
  const meterCosts = data.meters.map((m) => ({ meter: m.id, p: meterCostPair(data.bills, m.id) }))
  const costYears = meterCosts.find((x) => x.p)?.p ?? null
  return (
      <section aria-labelledby="map-heading" className="mt-6">
        <h2 id="map-heading" className="text-lg font-bold">
          Map
        </h2>
        <p className="mt-1 max-w-prose text-sm text-ink-2">
          Hover over, tap, or tab to a meter to see what it cost{costYears ? ` in ${costYears.ytd.year} so far and in ${costYears.prior.year}` : ''}, to a watering zone to see what is known about its share of its meter's water, or to a controller to see what it is and when it went in.{' '}
          {alerts.length > 0
            ? `The ${alerts.length} red ! markers are current problems: each says what is wrong, and selecting it opens that problem.`
            : 'No current problems are flagged.'}
        </p>
        <div className="mt-4 rounded-xl bg-surface p-3 ring-1 ring-[var(--ring)] md:p-5">
          <SiteMap map={data.map} areaNames={areaNames} flaggedMeters={flaggedMeters} costs={mapCosts} alerts={alerts} controllerInfo={data.controllers} />
        </div>
        {costYears && (
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-semibold">What each meter cost, as a table</summary>
            <div className="mt-2 overflow-x-auto rounded-xl bg-surface ring-1 ring-[var(--ring)]">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <caption className="sr-only">City water bills by meter, this year so far and last year</caption>
                <thead className="border-b border-line text-ink-2">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-semibold">Meter</th>
                    <th scope="col" className="px-4 py-2 text-right font-semibold">{costYears.ytd.year} so far (bills through {MONTHS[costYears.ytd.throughMonth - 1]})</th>
                    <th scope="col" className="px-4 py-2 text-right font-semibold">{costYears.prior.year}</th>
                    <th scope="col" className="px-4 py-2 font-semibold">Bills not on file</th>
                  </tr>
                </thead>
                <tbody>
                  {meterCosts.map(({ meter, p }) => {
                    const gaps = p ? [p.ytd, p.prior].filter((c) => c.missingMonths.length).map((c) => `${c.year}: ${c.missingMonths.map((m) => MONTHS[m - 1]).join(', ')}`) : []
                    return (
                      <tr key={meter} className="border-b border-line last:border-0 align-top">
                        <th scope="row" className="px-4 py-2 font-semibold">{meterName(meter, 'name')}</th>
                        <td className="tabular px-4 py-2 text-right">{p && p.ytd.bills ? fmt.usd(p.ytd.total) : <Missing what="Bills" />}</td>
                        <td className="tabular px-4 py-2 text-right">{p && p.prior.bills ? fmt.usd(p.prior.total) : <Missing what="Bills" />}</td>
                        <td className="px-4 py-2">{gaps.length ? gaps.join('; ') : 'None'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            <p className="mt-2 max-w-prose text-ink-2">
              Totals add up the printed totals on the City bills on file, by bill date. Zones have no meters of their own, so a zone's cost is
              only known when it is the only thing on its meter.
            </p>
          </details>
        )}
        <details className="mt-3 text-sm text-ink-2">
          <summary className="cursor-pointer font-semibold text-ink">How this map was made</summary>
          <p className="mt-2 max-w-prose">
            The area outlines are traced by hand from the HOA's annotated aerial map, and the meter locations come from the
            Waterfluence controller map. It is a simplified drawing: square footages below come from the source maps, not
            from the drawing. {data.map.slope.text}
          </p>
          {data.map.zones_source && <p className="mt-2 max-w-prose">Watering zones and controllers: {data.map.zones_source}</p>}
        </details>
        {(data.map.zones ?? []).length > 0 && (
          <details className="mt-3 text-sm">
            <summary className="cursor-pointer font-semibold">Watering zones as a table</summary>
            <div className="mt-2 overflow-x-auto rounded-xl bg-surface ring-1 ring-[var(--ring)]">
              <table className="w-full min-w-[32rem] text-left text-sm">
                <caption className="sr-only">Watering zones by controller and meter</caption>
                <thead className="border-b border-line text-ink-2">
                  <tr>
                    <th scope="col" className="px-4 py-2 font-semibold">Zone</th>
                    <th scope="col" className="px-4 py-2 font-semibold">What it waters</th>
                    <th scope="col" className="px-4 py-2 font-semibold">Controller</th>
                    <th scope="col" className="px-4 py-2 font-semibold">Meter</th>
                    <th scope="col" className="px-4 py-2 font-semibold">Status</th>
                  </tr>
                </thead>
                <tbody>
                  {(data.map.zones ?? []).map((z) => {
                    const c = (data.map.controllers ?? []).find((x) => x.id === z.controller)
                    return (
                      <tr key={z.id} className="border-b border-line last:border-0 align-top">
                        <th scope="row" className="px-4 py-2 font-semibold">{z.label}</th>
                        <td className="px-4 py-2">{z.name}</td>
                        <td className="px-4 py-2">{c?.name ?? z.controller}</td>
                        <td className="px-4 py-2">{c ? c.meters.map(meterNumber).join(' and ') : <Missing what="Meter" />}</td>
                        <td className="px-4 py-2">{z.status === 'off' ? 'Turned off' : 'On'}</td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          </details>
        )}
      </section>
  )
}
