import type { SiteData } from '../../scripts/site-data'
import { meterNumber } from '../lib/data'

type Props = {
  map: SiteData['map']
  areaNames: Record<string, { label: string; name: string }>
  flaggedMeters: Set<string>
}

const toPoints = (pts: [number, number][]) => pts.map(([x, y]) => `${x},${y}`).join(' ')

export function SiteMap({ map, areaNames, flaggedMeters }: Props) {
  const { width, height } = map.canvas
  return (
    <figure className="m-0">
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

        {map.meters.map((pin) => {
          const n = meterNumber(pin.meter)
          const flagged = flaggedMeters.has(pin.meter)
          return (
            <a key={pin.meter} href={`#${pin.meter}`} aria-label={`Meter ${n}${flagged ? ', has a leak flag' : ''}. Go to details.`}>
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
