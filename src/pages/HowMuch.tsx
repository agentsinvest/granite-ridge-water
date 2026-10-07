import type { SiteData } from '../../scripts/site-data'
import { Lines } from '../components/charts'
import { Card, Empty, GridTable, PageHeader, Section, Stat, Stats, Sure, TableView } from '../components/ui'
import { fmt, meterNumber } from '../lib/data'
import { MONTHS, type Model } from '../lib/model'

const ORDER = [10, 11, 12, 1, 2, 3, 4, 5, 6, 7, 8, 9]
const YEAR_COLORS = ['var(--s3)', 'var(--s2)', 'var(--s1)']

export function HowMuch({ data, model }: { data: SiteData; model: Model }) {
  const check = data.budgetCheck
  const scopes = check ? [...new Set(check.rows.map((r) => r.scope))] : []
  const site = check?.rows.filter((r) => r.scope === scopes[0]) ?? []
  const actual = site.find((r) => /actual/i.test(r.measure))?.low ?? null
  const need = site.find((r) => /plants need/i.test(r.measure)) ?? null
  const wf = site.find((r) => /waterfluence/i.test(r.measure)) ?? null

  // Combined use by month of read-period end, for each October to September year on file.
  const all = Object.values(model.periods).flat()
  const wyOf = (end: string) => (Number(end.slice(5, 7)) >= 10 ? Number(end.slice(0, 4)) + 1 : Number(end.slice(0, 4)))
  const wys = [...new Set(all.map((p) => wyOf(p.end)))].sort().slice(-3)
  const monthly = ORDER.map((mo) => {
    const row: Record<string, string | number | null> = { month: MONTHS[mo - 1] }
    for (const wy of wys) {
      const ps = all.filter((p) => wyOf(p.end) === wy && Number(p.end.slice(5, 7)) === mo)
      row[`y${wy}`] = ps.length === model.meters.length && ps.every((p) => p.usage !== null) ? ps.reduce((s, p) => s + (p.usage ?? 0), 0) : null
    }
    return row
  })

  return (
    <article>
      <PageHeader
        title="How much water should we use?"
        lead="The landscape needs enough water to replace what the weather pulls out of the plants and soil. That depends on the weather, the kind of plants, how much area they cover, and how evenly the sprinklers put water down."
      />
      <Card className="mt-6">
        <p className="max-w-prose">
          <strong>The formula in one sentence:</strong> gallons needed = weather demand (inches) x plant factor x area (square feet) x 0.623, divided by how
          efficiently the sprinklers apply water, minus useful rain.
        </p>
      </Card>

      {!check ? (
        <Empty>No water budget is on file yet.</Empty>
      ) : (
        <>
          <Stats>
            <Stat value={actual !== null ? fmt.gallons(actual) : 'Missing'} label={`used (${check.period})`} />
            <Stat value={wf?.low != null ? fmt.gallons(wf.low) : 'Missing'} label="Waterfluence's budget for the same year" />
            <Stat value={need?.low != null ? `${(need.low / 1000).toFixed(1)} to ${((need.high ?? need.low) / 1000).toFixed(1)} million gallons` : 'Missing'} label="what the plants themselves need (before sprinkler losses)" />
            <Stat value={actual !== null && wf?.low ? fmt.pct(actual / wf.low) : 'Unknown'} label="of Waterfluence's budget used" />
          </Stats>

          <Section id="check" title="Use vs need, by meter group" lead="Bars show the estimated range; the dark mark is what was actually used. Thousand gallons a year.">
            {scopes.map((scope) => (
              <RangeGroup key={scope} scope={scope} rows={check.rows.filter((r) => r.scope === scope)} />
            ))}
            <TableView
              caption="Water budget check"
              head={['Scope and measure', 'Low', 'High', 'Confidence']}
              rows={check.rows.map((r) => [`${r.scope}: ${r.measure}`, r.low === null ? 'Missing' : fmt.int(r.low), r.high === null ? 'Missing' : fmt.int(r.high), r.confidence])}
            />
            <div className="mt-4 max-w-prose space-y-2 text-sm text-ink-2">
              <p>
                <strong className="text-ink">What this says:</strong> across the whole site, use is about what a typical sprinkler system needs, so there is no
                huge waste overall. The two park meters stand out: they use more than the park alone should need. Either they water more than the park, or the
                park is overwatered. The controller settings printout will tell which.
              </p>
              <p>{check.note}</p>
              <p>Source: {check.source}. <Sure level={check.rows.some((r) => r.confidence === 'low') ? 'low' : 'medium'} /></p>
            </div>
          </Section>
        </>
      )}

      <Section id="season" title="Water use through the year" lead="All four meters combined, by the month each City read period ends. Thousand gallons. Comparing years shows whether a change held.">
        <Lines data={monthly} x="month" series={wys.map((wy, i) => ({ key: `y${wy}`, name: `Oct ${wy - 1} to Sep ${wy}`, color: YEAR_COLORS[i % 3] }))} label="Thousand gallons per month for each year" />
        <TableView
          caption="Thousand gallons per month"
          head={['Month', ...wys.map((wy) => `${wy - 1} to ${wy}`)]}
          rows={monthly.map((r) => [r.month as string, ...wys.map((wy) => (r[`y${wy}`] === null ? 'Missing' : fmt.int(r[`y${wy}`] as number)))])}
        />
        <p className="mt-3 max-w-prose text-sm text-ink-2">
          Use should follow the weather: low in winter, high in June and July. Spikes in October and November are overseeding the park with winter rye.
        </p>
      </Section>

      <ByMeterMonth data={data} model={model} />

      <Section id="next" title="What a full budget needs" lead="A monthly, per-zone budget (and a fair comparison for each meter) needs two things we do not have yet.">
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
          <li>Daily weather from the nearest AZMET station (weather demand and rain), 2021 to now.</li>
          <li>The zone list: what each controller station waters, its plant type, sprinkler type, and square feet.</li>
        </ul>
        <p className="mt-3 text-sm">
          The full list is on <a href="#data" className="underline underline-offset-4">Data and accuracy</a>.
        </p>
      </Section>
    </article>
  )
}

function RangeGroup({ scope, rows }: { scope: string; rows: NonNullable<SiteData['budgetCheck']>['rows'] }) {
  const actual = rows.find((r) => /actual/i.test(r.measure))
  const others = rows.filter((r) => r !== actual && r.low !== null)
  const max = Math.max(...rows.map((r) => r.high ?? r.low ?? 0)) * 1.1 || 1
  const pct = (v: number) => `${(v / max) * 100}%`
  return (
    <Card className="mt-4">
      <h3 className="font-semibold">{scope}</h3>
      {actual?.low != null && (
        <p className="mt-1 text-sm text-ink-2">
          Used: <strong className="text-ink">{fmt.int(actual.low)}</strong> thousand gallons
        </p>
      )}
      <ul className="mt-3 space-y-3">
        {others.map((r) => {
          const lo = r.low as number
          const hi = r.high ?? lo
          const verdict = actual?.low == null ? '' : actual.low > hi ? 'Used more' : actual.low < lo ? 'Used less' : 'Within range'
          return (
            <li key={r.measure} className="grid gap-1 text-sm md:grid-cols-[14rem_1fr] md:items-center md:gap-3">
              <span>
                {r.measure}
                <span className="block text-ink-2">
                  {fmt.int(lo)}
                  {hi !== lo ? ` to ${fmt.int(hi)}` : ''} · {verdict}
                </span>
              </span>
              <span className="relative block h-6 rounded bg-[var(--grid)]" aria-hidden="true">
                <span className="absolute top-1 bottom-1 rounded bg-[var(--s1)]" style={{ left: pct(lo), width: `max(4px, ${pct(hi - lo)})` }} />
                {actual?.low != null && <span className="absolute -top-1 -bottom-1 w-1 rounded bg-ink" style={{ left: pct(actual.low) }} />}
              </span>
            </li>
          )
        })}
      </ul>
    </Card>
  )
}

/** Monthly use per meter for the latest 12 read months and the average of the last two full calendar years, next to the turf's healthy minimum. */
function ByMeterMonth({ data, model }: { data: SiteData; model: Model }) {
  const use = (m: string, ym: string) => model.periods[m].find((p) => p.end.slice(0, 7) === ym)?.usage ?? null
  const ymsOnFile = [...new Set(Object.values(model.periods).flat().map((p) => p.end.slice(0, 7)))].sort()
  const full = (ym: string) => model.meters.every((m) => use(m, ym) !== null)
  const lastFull = [...ymsOnFile].reverse().find(full) ?? null
  if (!lastFull) return null
  const window = ymsOnFile.filter((ym) => ym <= lastFull).slice(-12)
  if (window.length < 12 || !window.every(full)) return null
  const monthOf = (ym: string) => Number(ym.slice(5, 7))
  const lastYm = (mo: number) => window.find((ym) => monthOf(ym) === mo)!
  const fullYears = [...new Set(ymsOnFile.map((ym) => ym.slice(0, 4)))].filter((y) => MONTHS.every((_, i) => full(`${y}-${String(i + 1).padStart(2, '0')}`))).slice(-2)
  const avgRaw = (m: string, mo: number) => fullYears.reduce((t, y) => t + use(m, `${y}-${String(mo).padStart(2, '0')}`)!, 0) / fullYears.length
  const label = (ym: string) => fmt.month(`${ym}-15`)
  const n = (v: number) => fmt.int(v)
  const mos = MONTHS.map((_, i) => i + 1)
  // Months are rounded for display; the year total adds the unrounded values, then rounds.
  const row = (vals: number[]) => [...vals.map((v) => n(Math.round(v))), n(Math.round(vals.reduce((a, b) => a + b, 0)))]
  const turf = data.turfMinimum
  const turfRow = turf ? mos.map((mo) => turf.months.find((x) => x.month === MONTHS[mo - 1])?.kgal ?? null) : null
  const service = (m: string) => model.latestRate?.fixed_charges.find((f) => f.meters.includes(m))?.amount ?? null
  const missing = <span className="italic text-ink-2">Not on file</span>

  return (
    <Section
      id="by-meter-month"
      title="Water use by meter and month"
      lead={`Thousands of gallons, by the month each City read period ends. "Last 12 months" is ${label(window[0])} to ${label(window.at(-1)!)}.${fullYears.length ? ` The average is ${fullYears.join(' and ')}.` : ''}`}
    >
      <GridTable
        caption="Meters: location, size, service charge, and turf share"
        leftCols={[1]}
        head={['Meter', 'Location', 'Size', 'Service charge per bill', 'Turf share of water']}
        groups={[
          {
            rows: data.meters.map((m) => ({
              label: `Meter ${meterNumber(m.id)}${m.meter_number_last4 ? ` (...${m.meter_number_last4})` : ''}`,
              cells: [
                <span className="block min-w-[12rem] max-w-[18rem] whitespace-normal">{m.location ?? 'Not on file'}</span>,
                m.size_inches === null ? missing : `${m.size_inches === 1.5 ? '1 1/2' : m.size_inches}"`,
                service(m.id) === null ? missing : `$${service(m.id)!.toFixed(2)}`,
                m.turf_share_percent ? `${m.turf_share_percent.value}%` : missing,
              ],
            })),
          },
        ]}
      />
      <GridTable
        caption="Thousand gallons by meter and month, with the turf healthy minimum"
        head={['', ...MONTHS, 'Year']}
        groups={[
          {
            title: `Last 12 months (${label(window[0])} to ${label(window.at(-1)!)})`,
            rows: [
              ...model.meters.map((m) => ({ label: `Meter ${meterNumber(m)}`, cells: row(mos.map((mo) => use(m, lastYm(mo))!)) })),
              { label: 'All meters', strong: true, cells: row(mos.map((mo) => model.meters.reduce((t, m) => t + use(m, lastYm(mo))!, 0))) },
            ],
          },
          ...(fullYears.length
            ? [
                {
                  title: `${fullYears.join(' and ')} average`,
                  rows: [
                    ...model.meters.map((m) => ({ label: `Meter ${meterNumber(m)}`, cells: row(mos.map((mo) => avgRaw(m, mo))) })),
                    { label: 'All meters', strong: true, cells: row(mos.map((mo) => model.meters.reduce((t, m) => t + avgRaw(m, mo), 0))) },
                  ],
                },
              ]
            : []),
          ...(turfRow
            ? [
                {
                  rows: [
                    {
                      label: 'Turf need at a healthy minimum',
                      muted: true,
                      cells: turfRow.some((v) => v === null) ? [...turfRow.map((v) => (v === null ? missing : n(v))), missing] : row(turfRow as number[]),
                    },
                  ],
                },
              ]
            : []),
        ]}
      />
      {turf && (
        <div className="mt-3 max-w-prose space-y-2 text-sm text-ink-2">
          <p>
            <strong className="text-ink">Turf need at a healthy minimum</strong> is what {fmt.int(turf.turfAreaSqFt.value)} square feet of park turf needs to
            stay green: monthly weather demand x plant factor {turf.plantFactor.value.toFixed(2)} x area x 0.623, divided by a sprinkler efficiency of{' '}
            {fmt.pct(turf.efficiency.value)}. It covers the turf only, not shrubs or trees.
          </p>
          <ul className="list-disc space-y-1 pl-5">
            <li>
              Turf area {fmt.int(turf.turfAreaSqFt.value)} sq ft: {turf.turfAreaSqFt.source}. <Sure level={turf.turfAreaSqFt.confidence} />
            </li>
            <li>
              Plant factor {turf.plantFactor.value.toFixed(2)}: {turf.plantFactor.source}. <Sure level={turf.plantFactor.confidence} />
            </li>
            <li>
              Sprinkler efficiency {fmt.pct(turf.efficiency.value)}: {turf.efficiency.source}. <Sure level={turf.efficiency.confidence} />
            </li>
            <li>
              Monthly amounts: {turf.source}. <Sure level={turf.confidence} />. The weather data behind them is not confirmed yet.
            </li>
          </ul>
          <p>Overseeding the park with winter rye in October and November shows up as a spike in the average for those months.</p>
        </div>
      )}
    </Section>
  )
}
