import type { SiteData } from '../../scripts/site-data'
import { meterCostPair, stationRanges, zoneMeters, type CostBill, type MeterYearCost, type StationLike } from '../engine/mapCost'
import { fmt, meterName, meterNumber } from '../lib/data'
import { MONTHS } from '../lib/model'

export type MapCosts = {
  bills: CostBill[]
  stations: StationLike[]
  /** Controller ids whose station-to-meter split is inferred, not confirmed by the landscaper. */
  unconfirmedSplit: Set<string>
}

type Zone = NonNullable<SiteData['map']['zones']>[number]
type Controller = NonNullable<SiteData['map']['controllers']>[number]
type Target = { kind: 'meter'; meter: string; flagged: boolean } | { kind: 'zone'; zone: Zone; controller: Controller | undefined }

const CARD_PX = 288

function yearLabel(c: MeterYearCost, ytd: boolean) {
  return ytd ? `${c.year} so far (bills through ${MONTHS[c.throughMonth - 1]})` : c.year
}

function gapNote(c: MeterYearCost): string | null {
  if (c.bills === 0) return null
  const parts: string[] = []
  if (c.missingMonths.length) parts.push(`no bill on file for ${c.missingMonths.map((m) => MONTHS[m - 1]).join(', ')}`)
  if (c.unchecked) parts.push(`${c.unchecked} not yet checked against City prices`)
  return parts.length ? `${c.year}: ${parts.join('; ')}.` : null
}

function Money({ c }: { c: MeterYearCost }) {
  return c.bills === 0 ? <span className="italic text-ink-2">No bills on file</span> : <span className="tabular font-semibold">{fmt.usd(c.total)}</span>
}

function MeterRows({ meters, bills }: { meters: string[]; bills: CostBill[] }) {
  const pairs = meters.map((m) => ({ meter: m, p: meterCostPair(bills, m) })).filter((x): x is { meter: string; p: NonNullable<ReturnType<typeof meterCostPair>> } => x.p !== null)
  if (pairs.length === 0) return <p className="mt-2 italic text-ink-2">No bills on file.</p>
  const { ytd, prior } = pairs[0].p
  const sum = (pick: 'ytd' | 'prior') => ({ ...pairs[0].p[pick], total: pairs.reduce((s, x) => s + x.p[pick].total, 0), bills: pairs.reduce((s, x) => s + x.p[pick].bills, 0) })
  const notes = pairs.flatMap((x) => [gapNote(x.p.ytd), gapNote(x.p.prior)].map((n) => (n && pairs.length > 1 ? `Meter ${meterNumber(x.meter)}, ${n}` : n))).filter(Boolean)
  return (
    <>
      {pairs.length === 1 ? (
        <dl className="mt-2 grid grid-cols-[1fr_auto] gap-x-3 gap-y-0.5">
          <dt className="text-ink-2">{yearLabel(ytd, true)}</dt>
          <dd className="text-right"><Money c={ytd} /></dd>
          <dt className="text-ink-2">{prior.year}</dt>
          <dd className="text-right"><Money c={prior} /></dd>
        </dl>
      ) : (
        <table className="mt-2 w-full text-left">
          <thead className="text-xs text-ink-2">
            <tr>
              <th scope="col" className="py-0.5 font-normal"><span className="sr-only">Meter</span></th>
              <th scope="col" className="py-0.5 pl-2 text-right font-normal">{ytd.year} so far</th>
              <th scope="col" className="py-0.5 pl-2 text-right font-normal">{prior.year}</th>
            </tr>
          </thead>
          <tbody>
            {[...pairs.map((x) => ({ key: x.meter, label: `Meter ${meterNumber(x.meter)}`, y: x.p.ytd, p: x.p.prior })), { key: 'all', label: 'Together', y: sum('ytd'), p: sum('prior') }].map((r) => (
              <tr key={r.key} className={r.key === 'all' ? 'border-t border-line' : undefined}>
                <th scope="row" className="py-0.5 pr-2 font-normal text-ink-2">{r.label}</th>
                <td className="py-0.5 pl-2 text-right"><Money c={r.y} /></td>
                <td className="py-0.5 pl-2 text-right"><Money c={r.p} /></td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {pairs.length > 1 && <p className="mt-1 text-xs text-ink-2">{ytd.year} counts bills through {MONTHS[ytd.throughMonth - 1]}.</p>}
      {notes.map((n) => (
        <p key={n} className="mt-1 text-xs text-ink-2">{n}</p>
      ))}
    </>
  )
}

export function MapCostCard({
  id,
  costs,
  target,
  at,
  canvas,
  wrap,
  onMouseEnter,
  onMouseLeave,
}: {
  id: string
  costs: MapCosts
  target: Target
  at: [number, number]
  canvas: { width: number; height: number }
  wrap: HTMLDivElement | null
  onMouseEnter: () => void
  onMouseLeave: () => void
}) {
  // Place the card next to the shape it describes, kept inside the map.
  const w = wrap?.clientWidth ?? 0
  const h = wrap?.clientHeight ?? 0
  const scale = w / canvas.width
  const x = at[0] * scale
  const y = at[1] * scale
  const half = CARD_PX / 2
  const left = w <= CARD_PX ? w / 2 : Math.min(Math.max(x, half), w - half)
  const below = at[1] < canvas.height / 2
  // On narrow screens a floating card would cover most of the map, so it sits under the map instead.
  const floating = w >= 560
  const style = !floating ? undefined : below ? { left, top: y + 20 } : { left, bottom: h - y + 20 }

  return (
    <div
      id={id}
      role="tooltip"
      className={`${floating ? 'absolute z-10 w-72 -translate-x-1/2 shadow-lg' : 'mt-3 w-full'} rounded-lg bg-surface p-3 text-sm ring-1 ring-[var(--ring)]`}
      style={style}
      onMouseEnter={onMouseEnter}
      onMouseLeave={onMouseLeave}
    >
      {target.kind === 'meter' ? <MeterBody costs={costs} meter={target.meter} flagged={target.flagged} /> : <ZoneBody costs={costs} zone={target.zone} controller={target.controller} />}
    </div>
  )
}

function MeterBody({ costs, meter, flagged }: { costs: MapCosts; meter: string; flagged: boolean }) {
  return (
    <>
      <p className="font-semibold">{meterName(meter, 'name')}</p>
      <p className="text-xs text-ink-2">What the City billed for this meter.</p>
      <MeterRows meters={[meter]} bills={costs.bills} />
      {flagged && (
        <p className="mt-2 text-xs">
          <span aria-hidden="true" className="font-extrabold">! </span>This meter has a possible leak flagged.
        </p>
      )}
      <p className="mt-2 text-xs text-ink-2">Select the meter for its details.</p>
    </>
  )
}

function ZoneBody({ costs, zone, controller }: { costs: MapCosts; zone: Zone; controller: Controller | undefined }) {
  const zm = zoneMeters(zone.stations, costs.stations)
  const meters = zm.meters.map(meterNumber)
  const meterText = `${meters.length > 1 ? 'meters' : 'meter'} ${meters.join(' and ')}`
  return (
    <>
      <p className="font-semibold">
        Zone {zone.label} · {zone.name}
      </p>
      <p className="text-xs text-ink-2">
        {controller?.name ?? `Controller ${zone.controller}`}
        {zone.status === 'off' ? '. Turned off at the controller.' : ''}
      </p>
      {zm.meters.length === 0 ? (
        <p className="mt-2">Which meter feeds this zone is not on file yet, so its cost is unknown.</p>
      ) : zm.wholeMeter ? (
        <p className="mt-2">This zone is the only thing watering on {meterText}, so the meter's bill is this zone's cost.</p>
      ) : (
        <p className="mt-2">
          This zone has no meter of its own. Its water goes through {meterText}, which also {meters.length > 1 ? 'feed' : 'feeds'} {stationRanges(zm.sharedWith)}. The cost below is for the whole{' '}
          {meters.length > 1 ? 'meters' : 'meter'}, not this zone alone.
        </p>
      )}
      {zm.meters.length > 0 && <MeterRows meters={zm.meters} bills={costs.bills} />}
      {zm.unknownMeter.length > 0 && zm.meters.length > 0 && <p className="mt-1 text-xs text-ink-2">Meter not on file for {stationRanges(zm.unknownMeter)}.</p>}
      {!zm.wholeMeter && zm.meters.length > 0 && (
        <p className="mt-2 text-xs text-ink-2">Splitting a meter's bill by zone needs each station's run time and flow, which the landscaper has not given us yet.</p>
      )}
      {controller && costs.unconfirmedSplit.has(controller.id) && (
        <p className="mt-1 text-xs text-ink-2">Which stations are on which meter is likely but not yet confirmed by the landscaper.</p>
      )}
    </>
  )
}
