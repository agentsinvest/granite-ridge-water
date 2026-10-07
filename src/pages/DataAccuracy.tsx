import type { SiteData } from '../../scripts/site-data'
import { Card, PageHeader, Pill, Section, Stat, Stats } from '../components/ui'
import { fmt, meterNumber } from '../lib/data'
import type { Model } from '../lib/model'

const longDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { dateStyle: 'medium' })

export function DataAccuracy({ data, model }: { data: SiteData; model: Model }) {
  const needed = data.dataNeeds.filter((n) => n.status !== 'in hand')
  const review = data.bills.filter((b) => b.needs_review)
  const unpriced = data.bills.filter((b) => b.reconciled !== 'pass' && b.reconciled !== 'fail')
  const passed = data.bills.filter((b) => b.reconciled === 'pass').length
  const quotes = (data.investments as { id: string; name: string; upfront_cost_per_unit: number | null; effect: { value: number | null } }[]).filter(
    (i) => i.upfront_cost_per_unit === null || i.effect.value === null,
  )
  const byFolder = new Map<string, { file: string; todo: string }[]>()
  for (const t of data.openTodos) {
    const folder = t.file.includes('/') ? t.file.split('/')[0] : 'general'
    byFolder.set(folder, [...(byFolder.get(folder) ?? []), t])
  }
  const lastRate = model.latestRate

  return (
    <article>
      <PageHeader
        title="Data and accuracy"
        lead="How fresh the numbers are, what is still estimated, and the data that would make the site more accurate. If you can help with any item on the list, tell the board."
      />
      <Stats>
        <Stat value={String(needed.length)} label="data requests open" flag={needed.length > 0} />
        <Stat value={`${passed} of ${data.bills.length}`} label="bills checked line by line against the City's rates" />
        <Stat value={String(review.length)} label="bills marked for review" flag={review.length > 0} />
        <Stat value={String(quotes.length)} label="investments that need a quote" />
      </Stats>

      <Section id="needs" title="Data that would make this more accurate" lead="Most useful first. Each item says what it would unlock on this site.">
        <ol className="mt-4 space-y-3">
          {data.dataNeeds.map((n) => (
            <li key={n.priority}>
              <Card>
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <h3 className="font-semibold">
                    <span className="text-ink-2">{n.priority}.</span> {n.need}
                  </h3>
                  <Pill tone={n.status === 'in hand' ? 'good' : n.status === 'partly in' ? 'neutral' : 'serious'}>
                    {n.status === 'in hand' ? 'In hand' : n.status === 'partly in' ? 'Partly in' : 'Needed'}
                  </Pill>
                </div>
                <dl className="mt-2 grid gap-1 text-sm md:grid-cols-[9rem_1fr]">
                  <dt className="font-semibold">Why it matters</dt>
                  <dd className="text-ink-2">{n.why}</dd>
                  <dt className="font-semibold">What it unlocks</dt>
                  <dd className="text-ink-2">{n.unlocks}</dd>
                  <dt className="font-semibold">Who has it</dt>
                  <dd className="text-ink-2">{n.who || 'Unknown'}</dd>
                </dl>
              </Card>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="fresh" title="How fresh the data is">
        <div className="mt-4 overflow-x-auto rounded-xl bg-surface ring-1 ring-[var(--ring)]">
          <table className="w-full min-w-[36rem] text-left text-sm">
            <caption className="sr-only">Latest data on file by meter</caption>
            <thead className="border-b border-line text-ink-2">
              <tr>
                <th scope="col" className="px-4 py-3 font-semibold">Meter</th>
                <th scope="col" className="px-4 py-3 font-semibold">Latest City bill</th>
                <th scope="col" className="px-4 py-3 font-semibold">Latest read period</th>
                <th scope="col" className="px-4 py-3 font-semibold">Latest daily use</th>
              </tr>
            </thead>
            <tbody>
              {model.meters.map((m) => {
                const bill = data.bills.filter((b) => b.meter === m).map((b) => b.bill_date).sort().at(-1)
                const period = model.periods[m].map((p) => p.end).sort().at(-1)
                const day = Object.values(data.usage[m] ?? {}).flat().filter((d) => d.gallons !== null).map((d) => d.date).sort().at(-1)
                return (
                  <tr key={m} className="border-b border-line last:border-0">
                    <th scope="row" className="px-4 py-3 font-semibold">Meter {meterNumber(m)}</th>
                    <td className="px-4 py-3">{bill ? longDate(bill) : 'None'}</td>
                    <td className="px-4 py-3">{period ? `ends ${longDate(period)}` : 'None'}</td>
                    <td className="px-4 py-3">{day ? longDate(day) : 'None'}</td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <ul className="mt-3 list-disc space-y-1 pl-5 text-sm text-ink-2">
          <li>
            City rates on file: {data.rates.filter((r) => r.status !== 'recommended').length} periods derived from our own bills
            {lastRate ? `; latest applies from read periods ending ${longDate(lastRate.applies_from_period_end)}` : ''}.
            {model.nextRate
              ? ` Plus the City's recommended rates from February 1, 2027 (FY 26/27 rate presentation), not adopted until the Council votes on December 8, 2026.`
              : ' No published rate schedule yet.'}
          </li>
          {data.monthlyNormals && <li>Monthly weather averages: on file (AZMET Queen Creek weather demand, NOAA East Mesa rain), for planning.</li>}
          <li>Daily weather: not on file (AZMET). Annual rainfall only, {data.annualRainfall.map((r) => r.year).join(', ')}.</li>
          <li>Zones: none on file yet. Everything is by meter.</li>
          <li>HOA year-end books: {Object.keys(data.financials).join(', ')}.</li>
        </ul>
      </Section>

      <Section id="estimates" title="What is still estimated">
        <ul className="mt-3 space-y-2 text-sm">
          <li><strong>{unpriced.length} bills</strong> <span className="text-ink-2">are not priced by the rate model yet (no derived rate for their period, or gallons unreadable). They show as "Unreconciled" on the Bills screen.</span></li>
          <li><strong>{review.length} bills</strong> <span className="text-ink-2">are marked for review, usually because the gallons did not read cleanly from the scan.</span></li>
          <li><strong>Leak costs</strong> <span className="text-ink-2">are estimates. Where the bill is not in yet they are a range.</span></li>
          <li><strong>The water budget</strong> <span className="text-ink-2">is annual and site-wide, low confidence, until daily weather and zones are in.</span></li>
          <li><strong>Savings</strong> <span className="text-ink-2">assume the City's current prices continue and the weather matches the starting year.</span></li>
        </ul>
      </Section>

      <Section id="quotes" title="Needs a quote">
        <ul className="mt-3 flex flex-wrap gap-2">
          {quotes.map((q) => <li key={q.id}><Pill tone="neutral">{q.name}</Pill></li>)}
        </ul>
      </Section>

      <Section id="todos" title="Open notes in the data files" lead={`${data.openTodos.length} notes, grouped by folder. These are the working to-do list for whoever maintains the data.`}>
        <div className="mt-4 space-y-2">
          {[...byFolder.entries()].sort((a, b) => b[1].length - a[1].length).map(([folder, items]) => (
            <details key={folder} className="rounded-xl bg-surface ring-1 ring-[var(--ring)]">
              <summary className="cursor-pointer px-4 py-3 font-semibold">
                {folder} <span className="font-normal text-ink-2">({fmt.int(items.length)})</span>
              </summary>
              <ul className="space-y-2 px-4 pb-4 text-sm">
                {items.slice(0, 50).map((t) => (
                  <li key={t.file}>
                    <code className="text-xs text-ink-2">{t.file}</code>
                    <span className="block">{t.todo}</span>
                  </li>
                ))}
                {items.length > 50 && <li className="text-ink-2">and {items.length - 50} more in the data folder.</li>}
              </ul>
            </details>
          ))}
        </div>
      </Section>
    </article>
  )
}
