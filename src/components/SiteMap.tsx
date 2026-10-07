import { useState } from 'react'
import type { SiteData } from '../../scripts/site-data'
import { meterNumber } from '../lib/data'

type Props = {
  map: SiteData['map']
  areaNames: Record<string, { label: string; name: string }>
  flaggedMeters: Set<string>
}

const toPoints = (pts: [number, number][]) => pts.map(([x, y]) => `${x},${y}`).join(' ')

/** One color token per controller letter; the letter is always printed too, so color is never the only cue. */
export const zoneColor = (controller: string) => `var(--zone-${controller.toLowerCase()})`
const meterList = (meters: string[]) => (meters.length > 1 ? 'meters ' : 'meter ') + meters.map(meterNumber).join(' and ')

export function SiteMap({ map, areaNames, flaggedMeters }: Props) {
  const { width, height } = map.canvas
  const controllers = map.controllers ?? []
  const zones = map.zones ?? []
  const hasZones = controllers.length > 0 || zones.length > 0
  const [showZones, setShowZones] = useState(true)
  const zonesOn = hasZones && showZones
  return (
    <figure className="m-0">
      {hasZones && (
        <label className="mb-3 inline-flex cursor-pointer items-center gap-2 text-sm font-semibold">
          <input type="checkbox" checked={showZones} onChange={(e) => setShowZones(e.target.checked)} className="h-4 w-4" />
          Show watering zones and controllers
        </label>
      )}
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
            return (
              <g key={z.id}>
                <title>{`Zone ${z.label}: ${z.name}. ${c?.name ?? `Controller ${z.controller}`}${c ? `, ${meterList(c.meters)}` : ''}.${z.status === 'off' ? ' Turned off.' : ''}`}</title>
                {z.parts.map((part, i) => (
                  <polygon
                    key={i}
                    points={toPoints(part)}
                    fill={z.status === 'off' ? 'none' : `url(#zone-hatch-${z.controller})`}
                    fillOpacity={0.55}
                    stroke={zoneColor(z.controller)}
                    strokeWidth={4}
                    strokeDasharray={z.status === 'off' ? '10 8' : undefined}
                    strokeLinejoin="round"
                  />
                ))}
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
          <g aria-hidden="true" fontSize={21} fontWeight={700}>
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
            <g key={c.id} transform={`translate(${c.at[0]} ${c.at[1]})`}>
              <title>{`${c.name} (controller ${c.id}), ${meterList(c.meters)}`}</title>
              <polygon points="0,-26 24,16 -24,16" fill="var(--surface)" stroke={zoneColor(c.id)} strokeWidth={5} strokeLinejoin="round" />
              <text y={4} textAnchor="middle" dominantBaseline="central" fontSize={22} fontWeight={800} fill="var(--ink)" aria-hidden="true">
                {c.id}
              </text>
            </g>
          ))}

        {map.meters.map((pin) => {
          const n = meterNumber(pin.meter)
          const flagged = flaggedMeters.has(pin.meter)
          return (
            <a key={pin.meter} href={`#water/${pin.meter}?tab=meters`} aria-label={`Meter ${n}${flagged ? ', has a leak flag' : ''}. Go to details.`}>
              <g transform={`translate(${pin.at[0]} ${pin.at[1]})`} className="map-pin">
                <circle r={34} fill="transparent" />
                <circle className="pin-ring" r={24} fill="var(--pin)" stroke="var(--surface)" strokeWidth={4} />
                <text textAnchor="middle" dominantBaseline="central" fontSize={28} fontWeight={700} fill="var(--pin-ink)">
                  {n}
                </text>
                {flagged && (
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
      </svg>
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
          Leak flag
        </span>
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
