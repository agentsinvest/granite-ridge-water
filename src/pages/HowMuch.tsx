import type { SiteData } from '../../scripts/site-data'
import { Lines } from '../components/charts'
import { Card, Empty, PageHeader, Section, Stat, Stats, Sure, TableView } from '../components/ui'
import { fmt } from '../lib/data'
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
