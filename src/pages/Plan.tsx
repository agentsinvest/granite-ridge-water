import type { SiteData } from '../../scripts/site-data'
import { LawnBadge, StatusChip, UrgentBadge, costText, savingsText, soFarText } from '../components/actions'
import { dollarRange } from '../components/LeakFlags'
import { PageHeader, Section } from '../components/ui'
import { GROUPS, LAWN_LABEL, OWNER_LABEL, nextRatesText, priceActions, type Action, type Priced } from '../lib/actions'
import { fmt, meterLabel } from '../lib/data'
import { buildMoves, type Model, type Move } from '../lib/model'
import { publicText } from '../lib/publicText'
import { setQuery } from '../lib/route'
import { useState } from 'react'

const lawnRank: Record<Action['lawn_impact'], number> = { none: 0, 'changes-lawn-watering': 1, 'removes-lawn': 2 }

/** Default order: urgent first, then no change to the lawn, then the largest savings. Nothing is hidden. */
function sortActions(list: Priced[]) {
  const urgency = (p: Priced) => (p.action.urgent === 'tree-risk' ? 0 : p.action.urgent === 'open-leak' ? 1 : 2)
  const worth = (p: Priced) => Math.max(p.annual?.high ?? 0, p.soFar?.high ?? 0)
  return [...list].sort((a, b) => urgency(a) - urgency(b) || lawnRank[a.action.lawn_impact] - lawnRank[b.action.lawn_impact] || worth(b) - worth(a))
}

function meterText(data: SiteData, m: string) {
  if (m === 'all') return 'All meters'
  if (m === 'park') return 'Park meters (1 and 2)'
  return meterLabel(data, m)
}

export function Plan({ data, model, query }: { data: SiteData; model: Model; query: URLSearchParams }) {
  const [owner, setOwner] = useState(query.get('who') ?? '')
  const [meter, setMeter] = useState(query.get('meter') ?? '')
  const [lawn, setLawn] = useState(query.get('lawn') ?? '')
  const update = (k: 'who' | 'meter' | 'lawn', v: string) => {
    const next = { who: owner, meter, lawn, [k]: v }
    if (k === 'who') setOwner(v)
    if (k === 'meter') setMeter(v)
    if (k === 'lawn') setLawn(v)
    setQuery(next)
  }
  const priced = priceActions(data, model)
  const matches = (p: Priced) =>
    (!owner || p.action.owner === owner) &&
    (!meter || p.action.meter === meter || p.action.meter === 'all' || (p.action.meter === 'park' && ['meter-1', 'meter-2'].includes(meter))) &&
    (!lawn || p.action.lawn_impact === lawn)
  const shown = priced.filter(matches)
  const dropped = shown.filter((p) => p.action.status === 'dropped')

  // Calculator results that no action covers yet: still visible, with the largest savings first.
  // An idea is on the plan when an action takes its savings from it, or (for a flagged problem) cites the flag.
  const covered = new Set(data.actions.flatMap((a) => [...(a.savings_from ? [a.savings_from] : []), ...a.evidence.filter((e) => e.startsWith('flag:'))]))
  const ideas = buildMoves(data, model)
    .filter((m) => !covered.has(`${m.kind === 'leak' ? 'flag' : m.kind}:${m.id}`))
    .sort((a, b) => (b.annual?.high ?? -Infinity) - (a.annual?.high ?? -Infinity))

  const select = 'mt-1 block w-full rounded-lg bg-surface px-3 py-2 ring-1 ring-[var(--ring)]'
  return (
    <article>
      <PageHeader title="Action plan" lead="Everything being done about the common-area water, who is handling it, and where it stands." />

      <fieldset className="mt-6 grid gap-3 rounded-xl bg-surface p-4 ring-1 ring-[var(--ring)] sm:grid-cols-3">
        <legend className="sr-only">Filter actions</legend>
        <label className="text-sm font-semibold">
          Who is handling it
          <select className={select} value={owner} onChange={(e) => update('who', e.target.value)}>
            <option value="">Anyone</option>
            {Object.entries(OWNER_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Meter
          <select className={select} value={meter} onChange={(e) => update('meter', e.target.value)}>
            <option value="">All meters</option>
            {data.meters.map((m) => (
              <option key={m.id} value={m.id}>{meterLabel(data, m.id)}</option>
            ))}
          </select>
        </label>
        <label className="text-sm font-semibold">
          Lawn
          <select className={select} value={lawn} onChange={(e) => update('lawn', e.target.value)}>
            <option value="">Any</option>
            {Object.entries(LAWN_LABEL).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </label>
      </fieldset>
      {(owner || meter || lawn) && (
        <p className="mt-2 text-sm text-ink-2">
          Showing {shown.length} of {priced.length} actions.{' '}
          <button type="button" className="underline underline-offset-4" onClick={() => { setOwner(''); setMeter(''); setLawn(''); setQuery({}) }}>
            Clear filters
          </button>
        </p>
      )}

      {GROUPS.map((g) => {
        const list = sortActions(shown.filter((p) => g.statuses.includes(p.action.status)))
        return (
          <Section key={g.id} id={`group-${g.id}`} title={`${g.title} (${list.length})`}>
            {list.length === 0 ? (
              <p className="mt-3 text-sm text-ink-2">{owner || meter || lawn ? 'None match these filters.' : 'None right now.'}</p>
            ) : (
              <ul className="mt-3 space-y-3">
                {list.map((p) => (
                  <li key={p.action.id}>
                    <ActionRow data={data} p={p} model={model} />
                  </li>
                ))}
              </ul>
            )}
          </Section>
        )
      })}
      {dropped.length > 0 && (
        <details className="mt-8 text-sm">
          <summary className="cursor-pointer font-semibold">Dropped ({dropped.length})</summary>
          <ul className="mt-2 list-disc pl-5">
            {dropped.map((p) => (
              <li key={p.action.id}><a href={`#action/${p.action.id}`} className="underline underline-offset-4">{p.action.title}</a></li>
            ))}
          </ul>
        </details>
      )}

      <Section id="ideas" title="Other ideas checked, not on the plan yet" lead="From the savings calculator and the list of possible equipment. Each needs someone to take it on before it becomes an action.">
        {ideas.length === 0 ? (
          <p className="mt-3 text-sm text-ink-2">Every idea is on the plan.</p>
        ) : (
          <ul className="mt-3 space-y-2">
            {ideas.map((m) => (
              <li key={m.id}>
                <IdeaRow m={m} />
              </li>
            ))}
          </ul>
        )}
      </Section>

      <p className="mt-8 text-sm">
        <a href="#checklist" className="underline underline-offset-4">Printable checklist for the landscaper</a> ·{' '}
        <a href="#problems/checks-heading" className="underline underline-offset-4">Watering questions</a> ·{' '}
        <a href="#plan?tab=target" className="underline underline-offset-4">Plan to reach the target</a>
      </p>
    </article>
  )
}

function ActionRow({ data, p, model }: { data: SiteData; p: Priced; model: Model }) {
  const a = p.action
  const impact = a.shows === 'next-rates' ? nextRatesText(data, model) : null
  const soFar = soFarText(p)
  return (
    <div className={`rounded-xl bg-surface p-4 ring-1 ring-[var(--ring)] ${a.urgent ? 'border-l-4 border-serious' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip status={a.status} />
        <UrgentBadge urgent={a.urgent} />
        <LawnBadge impact={a.lawn_impact} />
      </div>
      <h3 className="mt-2 text-base font-bold">
        <a href={`#action/${a.id}`} className="underline underline-offset-4">{a.title}</a>
      </h3>
      <p className="mt-1 text-sm text-ink-2">{a.problem}</p>
      <dl className="mt-2 grid gap-x-6 gap-y-1 text-sm sm:grid-cols-2">
        <div><dt className="inline font-semibold">Who: </dt><dd className="inline">{OWNER_LABEL[a.owner]}</dd></div>
        <div><dt className="inline font-semibold">Where: </dt><dd className="inline">{meterText(data, a.meter)}</dd></div>
        <div><dt className="inline font-semibold">Savings: </dt><dd className="inline">{savingsText(p)}{soFar ? `; ${soFar}` : ''}</dd></div>
        <div><dt className="inline font-semibold">Cost: </dt><dd className="inline">{costText(a.cost)}</dd></div>
        {impact && <div className="sm:col-span-2"><dt className="inline font-semibold">If nothing changes: </dt><dd className="inline">{impact}</dd></div>}
        {a.due && <div><dt className="inline font-semibold">By: </dt><dd className="inline">{new Date(`${a.due}T12:00:00`).toLocaleDateString('en-US', { dateStyle: 'medium' })}</dd></div>}
      </dl>
    </div>
  )
}

function IdeaRow({ m }: { m: Move }) {
  const value = m.annual
    ? m.annual.high > 0
      ? `Saves about ${dollarRange(m.annual.low, m.annual.high)} a year`
      : `Costs about ${fmt.usd(-m.annual.high)} more a year as written`
    : m.soFar
      ? `Has cost about ${dollarRange(m.soFar.low, m.soFar.high)} so far`
      : 'Needs a quote'
  const link = m.kind === 'investment' ? `#calculator?tab=invest&inv=${m.id}` : m.link
  return (
    <div className="flex flex-wrap items-center gap-x-3 gap-y-1 rounded-lg bg-surface px-4 py-3 text-sm ring-1 ring-[var(--ring)]">
      <a href={link} className="font-semibold underline underline-offset-4">{publicText(m.title)}</a>
      <span className="text-ink-2">{value}</span>
      {m.meters.length > 0 && <span className="text-ink-2">{m.meters.map((x) => `Meter ${x.replace('meter-', '')}`).join(', ')}</span>}
      {m.kind === 'option' && <LawnBadge impact={m.greenspace ? 'changes-lawn-watering' : 'none'} />}
    </div>
  )
}
