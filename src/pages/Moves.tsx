import { useState } from 'react'
import type { SiteData } from '../../scripts/site-data'
import { dollarRange } from '../components/LeakFlags'
import { Card, PageHeader, Pill, Section, Sure } from '../components/ui'
import { fmt, meterNumber } from '../lib/data'
import { buildMoves, monthsText, rankMoves, type Model, type Move } from '../lib/model'

const EFFORT: Record<string, string> = { low: 'Low effort', medium: 'Some effort', high: 'Big project' }

export function Moves({ data, model }: { data: SiteData; model: Model }) {
  const [green, setGreen] = useState(false)
  const all = buildMoves(data, model)
  const { ranked, backfires, leaks, needsQuote, hiddenGreenspace } = rankMoves(all, green)

  return (
    <article>
      <PageHeader
        title="Recommended moves"
        lead="What to do first, ranked by how much each move saves a year. Leaks come first because they cost money and help nothing. Anything without a real price shows as needing a quote rather than being ranked on a guess."
      />

      <label className="mt-6 flex items-start gap-2 rounded-xl bg-surface p-4 text-sm ring-1 ring-[var(--ring)]">
        <input type="checkbox" className="mt-1 h-4 w-4" checked={green} onChange={(e) => setGreen(e.target.checked)} />
        <span>
          <strong>Include moves that change watering on the park greenspace.</strong> Off by default, because the goal is to keep the turf.
          {!green && hiddenGreenspace > 0 && ` ${hiddenGreenspace} moves are hidden, including the largest savings.`}
        </span>
      </label>

      <Section id="leaks" title="1. Fix leaks" lead="Most certain first, then by cost. Each repair needs a quote from the landscaper. Some flags need a site check before anyone knows what to fix.">
        {leaks.length === 0 ? <p className="mt-3 text-ink-2">No open leak flags.</p> : (
          <ol className="mt-4 space-y-3">{leaks.map((m) => <MoveCard key={m.id} m={m} />)}</ol>
        )}
      </Section>

      <Section id="ranked" title="2. Watering changes, ranked by yearly savings" lead="Savings are calculated from the last 12 read periods at the City's current prices. The percent in each title is a proposed size, not a promise: test it first.">
        {ranked.length === 0 ? (
          <p className="mt-3 text-ink-2">{green ? 'No priced options on file.' : 'No priced options outside the greenspace. Turn on the toggle above to see the park options.'}</p>
        ) : (
          <ol className="mt-4 space-y-3">{ranked.map((m, i) => <MoveCard key={m.id} m={m} rank={i + 1} />)}</ol>
        )}
      </Section>

      {backfires.length > 0 && (
        <Section id="backfire" title="Checked, but would not save money as written" lead="The City sets each meter's cheaper price block from its December to February use. Cutting winter water alone shrinks that block, so more summer water is billed at the higher price and the bill can go up. Pair a winter cut with a summer cut, or skip it.">
          <ul className="mt-4 space-y-2">
            {backfires.map((m) => (
              <li key={m.id} className="flex flex-wrap items-baseline gap-x-3 rounded-lg bg-surface px-4 py-3 ring-1 ring-[var(--ring)]">
                <span className="font-semibold">{m.title}</span>
                <span className="text-sm text-ink-2">
                  {m.annual!.high < 0 ? `costs about ${fmt.usd(-m.annual!.high)} more a year` : 'saves nothing'} ·{' '}
                  <a className="underline underline-offset-4" href={m.link}>Open in What if</a>
                </span>
              </li>
            ))}
          </ul>
        </Section>
      )}

      <Section id="quotes" title="3. Needs a quote first" lead="Worth pricing. These are not ranked until a quote or a cited savings figure is on file.">
        <ul className="mt-4 grid gap-3 md:grid-cols-2">
          {needsQuote.map((m) => (
            <li key={m.id}>
              <Card className="h-full">
                <p className="flex flex-wrap items-center gap-2 font-semibold">
                  {m.title} <Pill tone="neutral">Needs a quote</Pill>
                </p>
                <p className="mt-2 text-sm text-ink-2">{m.why}</p>
                {m.kind === 'investment' && (
                  <p className="mt-2 text-sm">
                    <a href={`#calculator?tab=invest&inv=${m.id}`} className="font-semibold underline underline-offset-4">Try it with your own numbers</a>
                  </p>
                )}
              </Card>
            </li>
          ))}
        </ul>
      </Section>
    </article>
  )
}

function MoveCard({ m, rank }: { m: Move; rank?: number }) {
  return (
    <li>
      <Card>
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div className="min-w-0">
            {rank !== undefined && <p className="text-sm text-ink-2">#{rank}</p>}
            <h3 className="text-lg font-bold">{m.title}</h3>
            <p className="mt-1 text-sm text-ink-2">
              {m.meters.map((x) => `Meter ${meterNumber(x)}`).join(', ')}
              {m.change && 'months' in m.change ? ` · ${monthsText(m.change.months)}` : ''}
              {m.effort ? ` · ${EFFORT[m.effort]}` : ''}
            </p>
          </div>
          <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-right">
            <div className="flex flex-col">
              <dt className="order-2 text-xs text-ink-2">{m.annual ? 'saved a year' : m.soFar ? 'cost so far' : 'savings'}</dt>
              <dd className="order-1 text-xl font-bold">
                {m.annual ? dollarRange(m.annual.low, m.annual.high) : m.soFar ? dollarRange(m.soFar.low, m.soFar.high) : 'Not estimated'}
              </dd>
            </div>
            <div className="flex flex-col">
              <dt className="order-2 text-xs text-ink-2">up front</dt>
              <dd className="order-1 text-xl font-bold">{m.upfront === null ? 'Quote' : m.upfront === 0 ? '$0' : fmt.usd(m.upfront)}</dd>
            </div>
          </dl>
        </div>
        <p className="mt-3 max-w-prose">{m.why}</p>
        <dl className="mt-3 space-y-2 text-sm">
          <div>
            <dt className="inline font-semibold">Payback: </dt>
            <dd className="inline text-ink-2">
              {m.paybackMonths !== null ? (m.paybackMonths === 0 ? 'right away, nothing to buy' : `${Math.ceil(m.paybackMonths)} months`) : 'needs the repair or purchase price'}
              {m.upfront !== null && ` (${m.upfrontSource})`}
            </dd>
          </div>
          <div>
            <dt className="inline font-semibold">How sure: </dt>
            <dd className="inline"><Sure level={m.confidence} /></dd>
          </div>
          {m.risks.map((r) => (
            <div key={r} className="flex gap-2">
              <dt className="sr-only">Risk</dt>
              <span aria-hidden="true" className="font-extrabold">!</span>
              <dd className="text-ink-2">{r}</dd>
            </div>
          ))}
          {m.howToTest && (
            <div>
              <dt className="inline font-semibold">Test it first: </dt>
              <dd className="inline text-ink-2">{m.howToTest}</dd>
            </div>
          )}
        </dl>
        <p className="mt-3 text-sm">
          <a href={m.link} className="font-semibold underline underline-offset-4">
            {m.kind === 'leak' ? 'See the evidence' : 'Open in What if'}
          </a>
        </p>
      </Card>
    </li>
  )
}
