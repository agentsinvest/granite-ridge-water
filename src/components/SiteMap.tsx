import { useEffect, useRef, useState } from 'react'
import type { SiteData } from '../../scripts/site-data'
import { meterNumber } from '../lib/data'
import { installText, type MapAlert } from '../lib/mapAlerts'
import { MapCard, MapCostCard, type MapCosts } from './MapCostCard'

type Props = {
  map: SiteData['map']
  areaNames: Record<string, { label: string; name: string }>
  flaggedMeters: Set<string>
  /** Bills and stations for the cost card shown on hover, focus, or tap. Without it the map shows no costs. */
  costs?: MapCosts
  /** Current problems, each a ! marker linking to it. When given, they replace the ! badge on meter pins. */
  alerts?: MapAlert[]
  /** Controller facts for the controller hover card (model, flow sensor, install date). */
  controllerInfo?: SiteData['controllers']
}

type Active = { kind: 'meter' | 'zone' | 'controller' | 'alert'; id: string; at: [number, number] }

const toPoints = (pts: [number, number][]) => pts.map(([x, y]) => `${x},${y}`).join(' ')

/** One color token per controller letter; the letter is always printed too, so color is never the only cue. */
export const zoneColor = (controller: string) => `var(--zone-${controller.toLowerCase()})`
const meterList = (meters: string[]) => (meters.length > 1 ? 'meters ' : 'meter ') + meters.map(meterNumber).join(' and ')

export function SiteMap({ map, areaNames, flaggedMeters, costs, alerts, controllerInfo }: Props) {
  const { width, height } = map.canvas
  const controllers = map.controllers ?? []
  const zones = map.zones ?? []
  const hasZones = controllers.length > 0 || zones.length > 0
  const [showZones, setShowZones] = useState(true)
  const zonesOn = hasZones && showZones
  const [active, setActive] = useState<Active | null>(null)
  const wrapRef = useRef<HTMLDivElement>(null)
  const closeTimer = useRef<number | undefined>(undefined)
  // Hover cards stay open while the pointer moves onto them, and Escape closes them (WCAG 1.4.13).
  const show = (a: Active) => {
    window.clearTimeout(closeTimer.current)
    setActive(a)
  }
  const hideSoon = () => {
    window.clearTimeout(closeTimer.current)
    closeTimer.current = window.setTimeout(() => setActive(null), 200)
  }
  useEffect(() => {
    if (!active) return
    const onKey = (e: KeyboardEvent) => e.key === 'Escape' && setActive(null)
    window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [active])
  useEffect(() => () => window.clearTimeout(closeTimer.current), [])
  const cardHandlers = (a: Active, cardId: string) => ({
    onMouseEnter: () => show(a),
    onMouseLeave: hideSoon,
    onFocus: () => show(a),
    onBlur: () => setActive(null),
    'aria-describedby': active?.kind === a.kind && active.id === a.id ? cardId : undefined,
  })
  const hoverProps = (a: Active) => (costs ? cardHandlers(a, 'map-cost-card') : {})
  const activeZone = active?.kind === 'zone' ? zones.find((z) => z.id === active.id) : undefined
  const activeAlert = active?.kind === 'alert' ? alerts?.find((x) => x.id === active.id) : undefined
  const activeController = active?.kind === 'controller' ? controllers.find((c) => c.id === active.id) : undefined
  const cardProps = (at: [number, number]) => ({
    at,
    canvas: map.canvas,
    wrap: wrapRef.current,
    onMouseEnter: () => window.clearTimeout(closeTimer.current),
    onMouseLeave: hideSoon,
  })
  const alertMeters = new Set((alerts ?? []).map((x) => x.meter))
  return (
    <figure className="m-0">
      {hasZones && (
        <label className="mb-3 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={showZones} onChange={(e) => setShowZones(e.target.checked)} className="h-4 w-4" />
          Show watering zones and controllers
        </label>
      )}
      <div ref={wrapRef} className="relative">
      <svg
        viewBox={`0 0 ${width} ${height}`}
        className="block h-auto w-full rounded-lg bg-surface"
        role="group"
        aria-labelledby="site-map-title site-map-desc"
      >
        <title id="site-map-title">Schematic map of Granite Ridge common areas and water meters</title>
        <desc id="site-map-desc">
          Five common areas labeled B to E plus the private streets, the park turf, and four City of Mesa water meters
          numbered 1 to 4. The same information is in the tables below the map.
        </desc>
        <defs>
          {controllers.map((c) => (
            <pattern key={c.id} id={`zone-hatch-${c.id}`} patternUnits="userSpaceOnUse" width="12" height="12" patternTransform="rotate(-45)">
              <line x1="0" y1="0" x2="0" y2="12" stroke={zoneColor(c.id)} strokeWidth="5" />
            </pattern>
          ))}
          <pattern id="turf-hatch" patternUnits="userSpaceOnUse" width="14" height="14" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="14" stroke="var(--turf-hatch)" strokeWidth="4" />
          </pattern>
        </defs>

        {map.boundary_roads.map((r) => (
          <g key={r.name} aria-hidden="true">
            <polyline points={toPoints(r.line)} fill="none" stroke="var(--street)" strokeWidth={28} strokeLinecap="round" />
          </g>
        ))}

        {map.areas.map((a) => (
          <g key={a.id}>
            <title>{`${areaNames[a.id]?.label ?? ''} ${areaNames[a.id]?.name ?? a.id}`.trim()}</title>
            {a.parts.map((part, i) => (
              <polygon key={i} points={toPoints(part)} fill="var(--shrub)" stroke="var(--surface)" strokeWidth={4} strokeLinejoin="round" />
            ))}
          </g>
        ))}

        {map.turf.map((t, i) => (
          <g key={i}>
            <title>Turf (the park lawn)</title>
            <polygon points={toPoints(t.points)} fill="var(--turf)" stroke="var(--surface)" strokeWidth={4} strokeLinejoin="round" />
            <polygon points={toPoints(t.points)} fill="url(#turf-hatch)" opacity={0.6} />
          </g>
        ))}

        {zonesOn &&
          zones.map((z) => {
            const c = controllers.find((x) => x.id === z.controller)
            const label = `Zone ${z.label}: ${z.name}. ${c?.name ?? `Controller ${z.controller}`}${c ? `, ${meterList(c.meters)}` : ''}.${z.status === 'off' ? ' Turned off.' : ''}`
            const a: Active = { kind: 'zone', id: z.id, at: z.label_at }
            return costs ? (
              <g
                key={z.id}
                className="map-zone"
                tabIndex={0}
                role="button"
                aria-label={`${label} Show what its meter costs.`}
                {...hoverProps(a)}
                onClick={() => show(a)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault()
                    show(a)
                  }
                }}
              >
                <ZoneShapes z={z} />
              </g>
            ) : (
              <g key={z.id}>
                <title>{label}</title>
                <ZoneShapes z={z} />
              </g>
            )
          })}

        <g>
          <title>{`${areaNames[map.streets.area]?.label ?? ''} ${areaNames[map.streets.area]?.name ?? 'Private streets'}`.trim()}</title>
          {map.streets.lines.map((line, i) => (
            <polyline
              key={i}
              points={toPoints(line)}
              fill="none"
              stroke="var(--street)"
              strokeWidth={map.streets.width}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
        </g>

        <g aria-hidden="true" fontSize={26} fill="var(--ink-2)" fontWeight={600}>
          {map.boundary_roads.map((r) => (
            <text
              key={r.name}
              x={r.label_at[0]}
              y={r.label_at[1]}
              textAnchor="middle"
              transform={r.rotate ? `rotate(${r.rotate} ${r.label_at[0]} ${r.label_at[1]})` : undefined}
              stroke="var(--street)"
              strokeWidth={0}
            >
              {r.name}
            </text>
          ))}
        </g>

        <g aria-hidden="true">
          {[...map.areas.map((a) => ({ id: a.id, at: a.label_at })), { id: map.streets.area, at: map.streets.label_at }].map(({ id, at }) => (
            <g key={id} transform={`translate(${at[0]} ${at[1]})`}>
              <circle r={26} fill="var(--surface)" stroke="var(--ink)" strokeWidth={3} />
              <text textAnchor="middle" dominantBaseline="central" fontSize={30} fontWeight={700} fill="var(--ink)">
                {areaNames[id]?.label ?? '?'}
              </text>
            </g>
          ))}
        </g>

        {zonesOn && (
          <g aria-hidden="true" fontSize={21} fontWeight={700} pointerEvents="none">
            {zones.map((z) => (
              <text
                key={z.id}
                x={z.label_at[0]}
                y={z.label_at[1]}
                textAnchor="middle"
                dominantBaseline="central"
                fill="var(--ink)"
                stroke="var(--surface)"
                strokeWidth={6}
                paintOrder="stroke"
              >
                {z.status === 'off' ? `${z.label} off` : z.label}
              </text>
            ))}
          </g>
        )}

        {zonesOn &&
          controllers.map((c) => (
            <g
              key={c.id}
              transform={`translate(${c.at[0]} ${c.at[1]})`}
              {...(controllerInfo
                ? {
                    className: 'map-pin',
                    tabIndex: 0,
                    role: 'button',
                    'aria-label': `${c.name} (controller ${c.id}), ${meterList(c.meters)}. Show its details.`,
                    ...cardHandlers({ kind: 'controller', id: c.id, at: c.at }, 'map-controller-card'),
                    onClick: () => show({ kind: 'controller', id: c.id, at: c.at }),
                  }
                : {})}
            >
              {!controllerInfo && <title>{`${c.name} (controller ${c.id}), ${meterList(c.meters)}`}</title>}
              <circle r={32} fill="transparent" />
              <polygon points="0,-26 24,16 -24,16" fill="var(--surface)" stroke={zoneColor(c.id)} strokeWidth={5} strokeLinejoin="round" />
              <text y={4} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill="var(--ink)" aria-hidden="true">
                {c.id}
              </text>
            </g>
          ))}

        {map.meters.map((pin) => {
          const n = meterNumber(pin.meter)
          const flagged = flaggedMeters.has(pin.meter) || alertMeters.has(pin.meter)
          return (
            <a
              key={pin.meter}
              href={`#water/${pin.meter}?tab=meters`}
              aria-label={`Meter ${n}${flagged ? ', has a problem flagged' : ''}. Go to details.`}
              {...hoverProps({ kind: 'meter', id: pin.meter, at: pin.at })}
            >
              <g transform={`translate(${pin.at[0]} ${pin.at[1]})`} className="map-pin">
                <circle r={34} fill="transparent" />
                <circle className="pin-ring" r={24} fill="var(--pin)" stroke="var(--surface)" strokeWidth={4} />
                <text textAnchor="middle" dominantBaseline="central" fontSize={28} fontWeight={700} fill="var(--pin-ink)">
                  {n}
                </text>
                {flagged && !alerts && (
                  <g transform="translate(22 -22)">
                    <circle r={14} fill="var(--serious)" stroke="var(--surface)" strokeWidth={3} />
                    <text textAnchor="middle" dominantBaseline="central" fontSize={20} fontWeight={800} fill="#0b0b0b">
                      !
                    </text>
                  </g>
                )}
              </g>
            </a>
          )
        })}

        {alerts?.map((x) => (
          <a key={x.id} href={x.href} aria-label={`Problem: ${x.title}. ${x.status}. Go to it.`} {...cardHandlers({ kind: 'alert', id: x.id, at: x.at }, 'map-alert-card')}>
            <g transform={`translate(${x.at[0]} ${x.at[1]})`} className="map-pin">
              <circle r={22} fill="transparent" />
              <AlertMark kind={x.kind} />
            </g>
          </a>
        ))}
      </svg>
      {activeAlert && (
        <MapCard id="map-alert-card" {...cardProps(activeAlert.at)}>
          <p className="text-xs font-semibold uppercase tracking-wide text-ink-2">
            {activeAlert.status}
            {activeAlert.zone ? ` · Zone ${activeAlert.zone}` : ''}
          </p>
          <p className="mt-1 font-semibold">{activeAlert.title}</p>
          <p className="mt-1 text-ink-2">{activeAlert.blurb}</p>
          <p className="mt-2">
            <a href={activeAlert.href} className="font-semibold underline underline-offset-4">
              Go to this problem
            </a>
          </p>
        </MapCard>
      )}
      {activeController && controllerInfo && (
        <MapCard id="map-controller-card" {...cardProps(activeController.at)}>
          <ControllerBody c={activeController} info={controllerInfo.find((x) => x.id === activeController.id)} />
        </MapCard>
      )}
      {costs && active && (active.kind === 'meter' || activeZone) && (
        <MapCostCard
          id="map-cost-card"
          costs={costs}
          target={active.kind === 'meter' ? { kind: 'meter', meter: active.id, flagged: flaggedMeters.has(active.id) } : { kind: 'zone', zone: activeZone!, controller: controllers.find((c) => c.id === activeZone!.controller) }}
          at={active.at}
          canvas={map.canvas}
          wrap={wrapRef.current}
          onMouseEnter={() => window.clearTimeout(closeTimer.current)}
          onMouseLeave={hideSoon}
        />
      )}
      </div>
      <figcaption className="mt-3 flex flex-wrap gap-x-5 gap-y-2 text-sm text-ink-2">
        <LegendSwatch kind="shrub" label="Shrub and desert landscape" />
        <LegendSwatch kind="turf" label="Turf" />
        <LegendSwatch kind="street" label="Private streets" />
        <span className="inline-flex items-center gap-2">
          <svg width="20" height="20" viewBox="-12 -12 24 24" aria-hidden="true">
            <circle r={11} fill="var(--pin)" />
            <text textAnchor="middle" dominantBaseline="central" fontSize={13} fontWeight={700} fill="var(--pin-ink)">
              1
            </text>
          </svg>
          Water meter
        </span>
        <span className="inline-flex items-center gap-2">
          <svg width="20" height="20" viewBox="-12 -12 24 24" aria-hidden="true">
            <circle r={10} fill="var(--serious)" />
            <text textAnchor="middle" dominantBaseline="central" fontSize={14} fontWeight={800} fill="#0b0b0b">
              !
            </text>
          </svg>
          {alerts ? 'A current problem: hover or tab to it for a summary, select it to open it' : 'Leak flag'}
        </span>
        {alerts?.some((x) => x.kind === 'check') && (
          <span className="inline-flex items-center gap-2">
            <svg width="20" height="20" viewBox="-12 -12 24 24" aria-hidden="true">
              <AlertMark kind="check" small />
            </svg>
            A watering check for the landscaper
          </span>
        )}
        {zonesOn &&
          controllers.map((c) => (
            <span key={c.id} className="inline-flex items-center gap-2">
              <svg width="22" height="20" viewBox="-14 -14 28 26" aria-hidden="true">
                <polygon points="0,-12 12,9 -12,9" fill="var(--surface)" stroke={zoneColor(c.id)} strokeWidth={3} />
                <text y={2} textAnchor="middle" dominantBaseline="central" fontSize={11} fontWeight={800} fill="var(--ink)">
                  {c.id}
                </text>
              </svg>
              {c.name} ({meterList(c.meters)})
            </span>
          ))}
        {zonesOn && zones.some((z) => z.status === 'off') && (
          <span className="inline-flex items-center gap-2">
            <svg width="22" height="14" aria-hidden="true">
              <rect x="2" y="2" width="18" height="10" rx="2" fill="none" stroke="var(--ink-2)" strokeWidth="2" strokeDasharray="4 3" />
            </svg>
            Dashed outline: zone turned off
          </span>
        )}
        <span>North is up. Schematic, not to scale.</span>
      </figcaption>
    </figure>
  )
}

function LegendSwatch({ kind, label }: { kind: 'shrub' | 'turf' | 'street'; label: string }) {
  return (
    <span className="inline-flex items-center gap-2">
      <svg width="20" height="14" aria-hidden="true">
        <defs>
          <pattern id={`legend-hatch-${kind}`} patternUnits="userSpaceOnUse" width="6" height="6" patternTransform="rotate(45)">
            <line x1="0" y1="0" x2="0" y2="6" stroke="var(--turf-hatch)" strokeWidth="2" />
          </pattern>
        </defs>
        <rect width="20" height="14" rx="3" fill={`var(--${kind})`} />
        {kind === 'turf' && <rect width="20" height="14" rx="3" fill={`url(#legend-hatch-${kind})`} opacity={0.6} />}
      </svg>
      {label}
    </span>
  )
}

function ZoneShapes({ z }: { z: NonNullable<SiteData['map']['zones']>[number] }) {
  return (
    <>
      {z.parts.map((part, i) => (
        <polygon
          key={i}
          className="zone-shape"
          points={toPoints(part)}
          fill={z.status === 'off' ? 'none' : `url(#zone-hatch-${z.controller})`}
          fillOpacity={0.55}
          stroke={zoneColor(z.controller)}
          strokeWidth={4}
          strokeDasharray={z.status === 'off' ? '10 8' : undefined}
          strokeLinejoin="round"
        />
      ))}
    </>
  )
}

/** Problem marker: a circle for a possible leak, a diamond for a watering check. Both carry "!" so shape and mark, not only color, say what it is. */
function AlertMark({ kind, small }: { kind: MapAlert['kind']; small?: boolean }) {
  const r = small ? 10 : 16
  return (
    <>
      {kind === 'flag' ? (
        <circle r={r} fill="var(--serious)" stroke="var(--surface)" strokeWidth={small ? 0 : 3} />
      ) : (
        <rect x={-r * 0.8} y={-r * 0.8} width={r * 1.6} height={r * 1.6} transform="rotate(45)" fill="var(--serious)" stroke="var(--surface)" strokeWidth={small ? 0 : 3} />
      )}
      <text textAnchor="middle" dominantBaseline="central" fontSize={small ? 14 : 22} fontWeight={800} fill="#0b0b0b">
        !
      </text>
    </>
  )
}

function ControllerBody({ c, info }: { c: NonNullable<SiteData['map']['controllers']>[number]; info: SiteData['controllers'][number] | undefined }) {
  return (
    <>
      <p className="font-semibold">
        {c.name} (controller {c.id})
      </p>
      <p className="text-xs text-ink-2">{info?.model ?? 'Make and model not on file'}</p>
      <dl className="mt-2 grid grid-cols-[auto_1fr] gap-x-3 gap-y-0.5">
        <dt className="text-ink-2">Waters</dt>
        <dd>{meterList(c.meters)}</dd>
        <dt className="text-ink-2">Installed</dt>
        <dd>{installText(info?.installed).replace(/^Installed /, '').replace(/^Install date not on file\./, 'Not on file.')}</dd>
        <dt className="text-ink-2">Flow sensor</dt>
        <dd>{info?.has_flow_sensor === true ? 'Yes' : info?.has_flow_sensor === false ? 'No' : 'Not known'}</dd>
      </dl>
      <p className="mt-2">
        <a href={`#water/controller-${c.id}?tab=controllers`} className="font-semibold underline underline-offset-4">
          Controller details
        </a>
      </p>
    </>
  )
}
