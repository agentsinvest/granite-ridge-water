import { useEffect, useMemo, useState } from 'react'
import type { SiteData } from '../../scripts/site-data'
import { Bars } from '../components/charts'
import { Card, PageHeader, Pill, Section, Stat, Stats, TableView } from '../components/ui'
import { runScenario, type Baseline, type Change } from '../engine/scenarios'
import { fmt, meterNumber } from '../lib/data'
import { MONTHS, RISK, monthsText, optionChange, type Model } from '../lib/model'
import { setQuery } from '../lib/route'

type UIChange =
  | { kind: 'turn_down'; meters: string[]; percent: number; months: number[] }
  | { kind: 'days'; meters: string[]; from: number; to: number; months: number[] }
  | { kind: 'shutoff'; meters: string[]; months: number[] }
  | { kind: 'off'; meters: string[] }
  | { kind: 'fix_leak'; flag: string }

type Scenario = { base: string; greenspace: boolean; changes: UIChange[] }
type Saved = Scenario & { name: string }

const SEASONS: { name: string; months: number[] }[] = [
  { name: 'All year', months: [] },
  { name: 'Summer (May to Sep)', months: [5, 6, 7, 8, 9] },
  { name: 'Monsoon (Jul to Sep)', months: [7, 8, 9] },
  { name: 'Winter (Nov to Feb)', months: [11, 12, 1, 2] },
]

const enc = (x: unknown) => btoa(unescape(encodeURIComponent(JSON.stringify(x)))).replace(/=+$/, '')
function dec<T>(s: string | null, fallback: T): T {
  if (!s) return fallback
  try {
    return JSON.parse(decodeURIComponent(escape(atob(s)))) as T
  } catch {
    return fallback
  }
}

function baselines(model: Model): { key: string; label: string; data: Baseline }[] {
  const out = [{ key: 'latest', label: 'Last 12 read periods', data: model.baseline }]
  const ends = [...new Set(Object.values(model.periods).flatMap((p) => p.map((x) => x.end)))]
  const wys = [...new Set(ends.map((e) => (Number(e.slice(5, 7)) >= 10 ? Number(e.slice(0, 4)) + 1 : Number(e.slice(0, 4)))))].sort().reverse()
  for (const wy of wys) {
    const data: Baseline = Object.fromEntries(
      model.meters.map((m) => [m, model.periods[m].filter((p) => p.end >= `${wy - 1}-10-01` && p.end <= `${wy}-09-30`)]),
    )
    if (Object.values(data).every((ps) => ps.length === 12 && ps.every((p) => p.usage !== null))) out.push({ key: `wy${wy}`, label: `Water used Oct ${wy - 1} to Sep ${wy}`, data })
  }
  return out
}

function toEngine(c: UIChange, flags: Model['flags']): Change | null {
  switch (c.kind) {
    case 'days':
      return c.from > 0 && c.to <= c.from ? { kind: 'turn_down', meters: c.meters, percent: (1 - c.to / c.from) * 100, months: c.months } : null
    case 'fix_leak': {
      const f = flags.find((x) => x.flag.id === c.flag)
      const g = f?.flag.excess_water?.ongoing_gallons_per_year
      return f && g ? { kind: 'remove_gallons', meter: f.flag.meter, gallonsPerYear: g, label: f.flag.title } : null
    }
    default:
      return c
  }
}

function describe(c: UIChange, flags: Model['flags']): string {
  const ms = 'meters' in c ? c.meters.map((m) => meterNumber(m)).join(', ') : ''
  const who = 'meters' in c ? (c.meters.length === 1 ? `meter ${ms}` : `meters ${ms}`) : ''
  switch (c.kind) {
    case 'turn_down': return `Turn ${who} down ${c.percent}%, ${monthsText(c.months)}`
    case 'days': return `Water ${who} ${c.to} days a week instead of ${c.from}, ${monthsText(c.months)}`
    case 'shutoff': return `Shut off ${who}, ${monthsText(c.months)}`
    case 'off': return `Turn ${who} off completely`
    case 'fix_leak': return `Fix: ${flags.find((f) => f.flag.id === c.flag)?.flag.title ?? c.flag}`
  }
}

export function WhatIf({ data, model, query }: { data: SiteData; model: Model; query: URLSearchParams }) {
  const bases = useMemo(() => baselines(model), [model])
  const fromOption = data.options.find((o) => o.id === query.get('o'))
  const [sc, setSc] = useState<Scenario>(() =>
    fromOption
      ? { base: 'latest', greenspace: fromOption.touches_greenspace, changes: [optionChange(fromOption) as UIChange] }
      : dec<Scenario>(query.get('s'), { base: 'latest', greenspace: false, changes: [] }),
  )
  const [saved, setSaved] = useState<Saved[]>(() => dec<Saved[]>(query.get('c'), []))
  useEffect(() => setQuery('whatif', { s: enc(sc), c: saved.length ? enc(saved) : null }), [sc, saved])

  const rate = model.latestRate
  if (!rate) return <PageHeader title="What if" lead="No City rate is on file, so changes cannot be priced yet." />

  const run = (s: Scenario) => {
    const base = bases.find((b) => b.key === s.base) ?? bases[0]
    const changes = s.changes.map((c) => toEngine(c, model.flags)).filter((c): c is Change => c !== null)
    return { base, result: runScenario(base.data, changes, rate) }
  }
  const { base, result } = run(sc)
  const update = (i: number, c: UIChange) => setSc({ ...sc, changes: sc.changes.map((x, j) => (j === i ? c : x)) })
  const remove = (i: number) => setSc({ ...sc, changes: sc.changes.filter((_, j) => j !== i) })
  const allowed = model.meters.filter((m) => sc.greenspace || !model.greenspaceMeters.has(m))
  const firstMeter = allowed[0] ?? model.meters[0]
  const add = (c: UIChange) => setSc({ ...sc, changes: [...sc.changes, c] })
  const leakFlags = model.flags.filter((f) => f.flag.excess_water?.ongoing_gallons_per_year)
  const touched = new Set(sc.changes.flatMap((c) => ('meters' in c ? c.meters : [])))
  const greenTouched = [...touched].some((m) => model.greenspaceMeters.has(m))
  const otherTouched = [...touched].some((m) => !model.greenspaceMeters.has(m))

  return (
    <article>
      <PageHeader
        title="What if we changed something?"
        lead="Pick a starting year, add changes, and see the gallons and dollars. Everything is priced with the City's current rates. The link in your address bar saves the scenario, so you can share it."
      />

      <Section id="step1" title="Step 1. Starting point">
        <Card className="mt-4">
          <label className="block text-sm font-semibold" htmlFor="base">
            Water use to start from
          </label>
          <select id="base" className="mt-1 w-full rounded-md border border-line bg-surface p-2 md:w-auto" value={sc.base} onChange={(e) => setSc({ ...sc, base: e.target.value })}>
            {bases.map((b) => (
              <option key={b.key} value={b.key}>
                {b.label}
              </option>
            ))}
          </select>
          <p className="mt-2 text-sm text-ink-2">
            Priced at the City rate for read periods from {fmt.month(rate.applies_from_period_end)} on (derived from our bills, {rate.confidence} confidence). Later
            years are assumed to stay at this rate; no 2027 rate is on file yet.
          </p>
          <label className="mt-4 flex items-start gap-2 text-sm">
            <input type="checkbox" className="mt-1 h-4 w-4" checked={sc.greenspace} onChange={(e) => setSc({ ...sc, greenspace: e.target.checked, changes: e.target.checked ? sc.changes : sc.changes.filter((c) => !('meters' in c) || c.meters.every((m) => !model.greenspaceMeters.has(m))) })} />
            <span>
              <strong>Include the park greenspace.</strong> Meters {[...model.greenspaceMeters].map(meterNumber).join(' and ')} water the park turf. They are left out
              unless this is on, because the goal is to keep the turf.
            </span>
          </label>
        </Card>
      </Section>

      <Section id="step2" title="Step 2. Changes" lead="Changes apply in order. Two 20% cuts on the same water make a 36% cut, not 40%.">
        <ol className="mt-4 space-y-3">
          {sc.changes.map((c, i) => (
            <li key={i}>
              <ChangeEditor c={c} meters={model.meters} allowed={allowed} flags={model.flags} onChange={(x) => update(i, x)} onRemove={() => remove(i)} />
            </li>
          ))}
        </ol>
        {sc.changes.length === 0 && <p className="mt-3 text-ink-2">No changes yet. Add one below.</p>}
        <div className="mt-4 flex flex-wrap gap-2">
          <AddButton onClick={() => add({ kind: 'turn_down', meters: [firstMeter], percent: 10, months: [] })}>Turn down</AddButton>
          <AddButton onClick={() => add({ kind: 'days', meters: [firstMeter], from: 3, to: 2, months: [] })}>Fewer watering days</AddButton>
          <AddButton onClick={() => add({ kind: 'shutoff', meters: [firstMeter], months: [12, 1, 2] })}>Seasonal shutoff</AddButton>
          <AddButton onClick={() => add({ kind: 'off', meters: [firstMeter] })}>Turn off completely</AddButton>
          {leakFlags.length > 0 && <AddButton onClick={() => add({ kind: 'fix_leak', flag: leakFlags[0].flag.id })}>Fix a leak</AddButton>}
        </div>
        {data.options.length > 0 && (
          <div className="mt-4 text-sm">
            <p className="font-semibold">Or start from a recommended option:</p>
            <ul className="mt-1 flex flex-wrap gap-2">
              {data.options.map((o) => (
                <li key={o.id}>
                  <button
                    type="button"
                    className="rounded-md border border-line px-2 py-1 text-left hover:bg-[var(--ring)] disabled:opacity-60"
                    disabled={o.touches_greenspace && !sc.greenspace}
                    onClick={() => add(optionChange(o) as UIChange)}
                  >
                    {o.title}
                    {o.touches_greenspace && !sc.greenspace ? ' (turn on greenspace)' : ''}
                  </button>
                </li>
              ))}
            </ul>
          </div>
        )}
        <details className="mt-4 text-sm">
          <summary className="cursor-pointer font-semibold">Investments (controllers, sensors, nozzles)</summary>
          <p className="mt-2 text-ink-2">These can be added once a quote or a cited savings figure is on file. Until then they are not priced, so they cannot mislead.</p>
          <ul className="mt-2 space-y-1">
            {(data.investments as { id: string; name: string; effect: { value: number | null } }[]).map((inv) => (
              <li key={inv.id} className="flex flex-wrap items-center gap-2">
                <span>{inv.name}</span>
                {inv.effect.value === null && <Pill tone="neutral">Needs a quote</Pill>}
              </li>
            ))}
          </ul>
        </details>
      </Section>

      <Section id="step3" title="Step 3. Results">
        {!result.ok ? (
          <p className="mt-3 rounded-lg border-2 border-serious p-3">Could not price this: {result.reason}</p>
        ) : (
          <Results result={result} target={model.target} baseLabel={base.label} />
        )}
        {result.ok && sc.changes.length > 0 && (
          <Card className="mt-4">
            <h3 className="font-semibold">Before you try this</h3>
            <ul className="mt-2 list-disc space-y-2 pl-5 text-sm">
              {greenTouched && <li>{RISK.turf}</li>}
              {greenTouched && <li>{RISK.trees}</li>}
              {otherTouched && <li>{RISK.unknownTrees}</li>}
              <li>
                A "keep tree watering" allowance and a "below estimated plant need" check need minimum plant factors from a cited source. They are not on file yet, so
                this result cannot warn when a cut goes below what plants need.
              </li>
              <li>Try a change on one meter for a few weeks first and log it on the <a href="#experiments" className="underline underline-offset-4">Experiments</a> screen.</li>
            </ul>
          </Card>
        )}
        <Assumptions rate={rate} baseLabel={base.label} flags={model.flags} changes={sc.changes} />
      </Section>

      <Section id="compare" title="Compare scenarios" lead="Save up to three scenarios to see them side by side. They are kept in the link.">
        <button
          type="button"
          className="mt-3 rounded-md bg-ink px-3 py-2 text-sm font-semibold text-page disabled:opacity-50"
          disabled={saved.length >= 3 || sc.changes.length === 0}
          onClick={() => setSaved([...saved, { ...sc, name: `Scenario ${String.fromCharCode(65 + saved.length)}` }])}
        >
          Save this scenario to compare
        </button>
        {saved.length > 0 && (
          <div className="mt-4 overflow-x-auto rounded-xl bg-surface ring-1 ring-[var(--ring)]">
            <table className="w-full min-w-[36rem] text-left text-sm">
              <caption className="sr-only">Saved scenarios compared</caption>
              <thead className="border-b border-line text-ink-2">
                <tr>
                  <th scope="col" className="px-3 py-2 font-semibold">Scenario</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Yearly cost</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">Saves</th>
                  <th scope="col" className="px-3 py-2 text-right font-semibold">vs target</th>
                  <th scope="col" className="px-3 py-2"><span className="sr-only">Actions</span></th>
                </tr>
              </thead>
              <tbody>
                {saved.map((s, i) => {
                  const r = run(s).result
                  return (
                    <tr key={i} className="border-b border-line align-top last:border-0">
                      <th scope="row" className="px-3 py-2 font-normal">
                        <span className="font-semibold">{s.name}</span>
                        <span className="block text-ink-2">{s.changes.map((c) => describe(c, model.flags)).join('; ')}</span>
                      </th>
                      <td className="tabular px-3 py-2 text-right">{r.ok ? fmt.usd(r.newCost) : 'Error'}</td>
                      <td className="tabular px-3 py-2 text-right">{r.ok ? fmt.usd(r.baseCost - r.newCost) : ''}</td>
                      <td className="tabular px-3 py-2 text-right">{r.ok ? (r.newCost <= model.target ? 'Meets it' : `${fmt.usd(r.newCost - model.target)} over`) : ''}</td>
                      <td className="px-3 py-2 text-right">
                        <button type="button" className="underline underline-offset-4" onClick={() => setSc({ base: s.base, greenspace: s.greenspace, changes: s.changes })}>
                          Open
                        </button>{' '}
                        <button type="button" className="ml-2 underline underline-offset-4" onClick={() => setSaved(saved.filter((_, j) => j !== i))}>
                          Remove
                        </button>
                      </td>
                    </tr>
                  )
                })}
              </tbody>
            </table>
          </div>
        )}
      </Section>
    </article>
  )
}

function AddButton({ onClick, children }: { onClick: () => void; children: string }) {
  return (
    <button type="button" onClick={onClick} className="rounded-md border-2 border-ink px-3 py-1.5 text-sm font-semibold hover:bg-[var(--ring)]">
      + {children}
    </button>
  )
}

function ChangeEditor({
  c, meters, allowed, flags, onChange, onRemove,
}: {
  c: UIChange
  meters: string[]
  allowed: string[]
  flags: Model['flags']
  onChange: (c: UIChange) => void
  onRemove: () => void
}) {
  const title = { turn_down: 'Turn down', days: 'Fewer watering days', shutoff: 'Seasonal shutoff', off: 'Turn off completely', fix_leak: 'Fix a leak' }[c.kind]
  return (
    <fieldset className="rounded-xl bg-surface p-4 ring-1 ring-[var(--ring)]">
      <legend className="sr-only">{title}</legend>
      <div className="flex items-center justify-between gap-2">
        <p className="font-semibold">{title}</p>
        <button type="button" onClick={onRemove} className="text-sm underline underline-offset-4">
          Remove
        </button>
      </div>
      {'meters' in c && (
        <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm" role="group" aria-label="Meters">
          {meters.map((m) => (
            <label key={m} className={`flex items-center gap-1.5 ${allowed.includes(m) ? '' : 'text-ink-2'}`}>
              <input
                type="checkbox"
                className="h-4 w-4"
                disabled={!allowed.includes(m)}
                checked={c.meters.includes(m)}
                onChange={(e) => onChange({ ...c, meters: e.target.checked ? [...c.meters, m] : c.meters.filter((x) => x !== m) })}
              />
              Meter {meterNumber(m)}
              {!allowed.includes(m) && ' (greenspace)'}
            </label>
          ))}
        </div>
      )}
      {c.kind === 'turn_down' && (
        <label className="mt-3 block text-sm">
          <span className="font-semibold">Cut run times by {c.percent}%</span>
          <input type="range" min={5} max={90} step={5} value={c.percent} onChange={(e) => onChange({ ...c, percent: Number(e.target.value) })} className="mt-1 block w-full max-w-sm" />
        </label>
      )}
      {c.kind === 'days' && (
        <div className="mt-3 flex flex-wrap items-center gap-2 text-sm">
          <label>
            From{' '}
            <select className="rounded border border-line bg-surface p-1" value={c.from} onChange={(e) => onChange({ ...c, from: Number(e.target.value) })}>
              {[1, 2, 3, 4, 5, 6, 7].map((n) => <option key={n}>{n}</option>)}
            </select>
          </label>
          <label>
            to{' '}
            <select className="rounded border border-line bg-surface p-1" value={c.to} onChange={(e) => onChange({ ...c, to: Number(e.target.value) })}>
              {[0, 1, 2, 3, 4, 5, 6, 7].filter((n) => n <= c.from).map((n) => <option key={n}>{n}</option>)}
            </select>{' '}
            days a week
          </label>
          <span className="text-ink-2">({Math.round((1 - c.to / c.from) * 100)}% less water, same run time per day)</span>
        </div>
      )}
      {(c.kind === 'turn_down' || c.kind === 'days' || c.kind === 'shutoff') && <MonthPicker months={c.months} allowAll={c.kind !== 'shutoff'} onChange={(months) => onChange({ ...c, months })} />}
      {c.kind === 'fix_leak' && (
        <label className="mt-2 block text-sm">
          <span className="sr-only">Leak</span>
          <select className="w-full rounded border border-line bg-surface p-1" value={c.flag} onChange={(e) => onChange({ ...c, flag: e.target.value })}>
            {flags.filter((f) => f.flag.excess_water?.ongoing_gallons_per_year).map((f) => (
              <option key={f.flag.id} value={f.flag.id}>
                {f.flag.title} ({fmt.int(f.flag.excess_water!.ongoing_gallons_per_year!)} gallons a year)
              </option>
            ))}
          </select>
        </label>
      )}
      {'meters' in c && c.meters.length === 0 && <p className="mt-2 text-sm text-ink-2">Pick at least one meter.</p>}
    </fieldset>
  )
}

function MonthPicker({ months, allowAll, onChange }: { months: number[]; allowAll: boolean; onChange: (m: number[]) => void }) {
  return (
    <div className="mt-3 text-sm">
      <div className="flex flex-wrap gap-2" role="group" aria-label="Season">
        {SEASONS.filter((s) => allowAll || s.months.length > 0).map((s) => (
          <button
            key={s.name}
            type="button"
            aria-pressed={JSON.stringify(s.months) === JSON.stringify(months)}
            onClick={() => onChange(s.months)}
            className="rounded-md border border-line px-2 py-1 aria-pressed:border-ink aria-pressed:font-semibold"
          >
            {s.name}
          </button>
        ))}
      </div>
      <div className="mt-2 flex flex-wrap gap-1" role="group" aria-label="Months">
        {MONTHS.map((name, i) => {
          const on = months.includes(i + 1)
          return (
            <button
              key={name}
              type="button"
              aria-pressed={on}
              onClick={() => onChange(on ? months.filter((x) => x !== i + 1) : [...months, i + 1].sort((a, b) => a - b))}
              className="w-11 rounded border border-line py-0.5 aria-pressed:bg-ink aria-pressed:text-page"
            >
              {name}
            </button>
          )
        })}
      </div>
      <p className="mt-1 text-ink-2">Applies: {monthsText(months)}. A read period counts in the month of its middle day.</p>
    </div>
  )
}

function Results({ result, target, baseLabel }: { result: Extract<ReturnType<typeof runScenario>, { ok: true }>; target: number; baseLabel: string }) {
  const saved = result.baseCost - result.newCost
  const gal = result.baseKgal - result.newKgal
  const gap = result.newCost - target
  const max = Math.max(result.baseCost, target) * 1.05
  const monthly = result.meters[0].periods.map((_, i) => ({
    period: fmt.month(result.meters[0].periods[i].end),
    before: Math.round(result.meters.reduce((s, m) => s + m.periods[i].baseCost, 0)),
    after: Math.round(result.meters.reduce((s, m) => s + m.periods[i].newCost, 0)),
  }))
  return (
    <>
      <Stats>
        <Stat value={fmt.usd(result.newCost)} label={`yearly cost (was ${fmt.usd(result.baseCost)})`} />
        <Stat value={fmt.usd(saved)} label={`saved a year (${result.baseCost ? fmt.pct(saved / result.baseCost) : '0%'})`} good={saved > 0} />
        <Stat value={gal >= 0.5 ? `${fmt.int(Math.round(gal))},000` : '0'} label="gallons saved a year" />
        <Stat value={gap <= 0 ? 'Meets it' : fmt.usd(gap)} label={gap <= 0 ? `the ${fmt.usd(target)} target` : `still over the ${fmt.usd(target)} target`} good={gap <= 0} flag={gap > 0} />
      </Stats>
      <p className="mt-3 max-w-prose text-sm text-ink-2">
        "Before" is the starting water use priced at today's City prices, so it can be higher than what was actually billed at the older prices.
      </p>
      <Card className="mt-4">
        <p className="text-sm font-semibold">Progress toward the {fmt.usd(target)} target</p>
        <div className="relative mt-3 h-8 rounded bg-[var(--grid)]" role="img" aria-label={`Before ${fmt.usd(result.baseCost)}, after ${fmt.usd(result.newCost)}, target ${fmt.usd(target)}`}>
          <div className="absolute inset-y-0 left-0 rounded bg-[var(--s1)] opacity-35" style={{ width: `${(result.baseCost / max) * 100}%` }} />
          <div className="absolute inset-y-1 left-0 rounded bg-[var(--s1)]" style={{ width: `${(result.newCost / max) * 100}%` }} />
          <div className="absolute -inset-y-1 w-1 bg-ink" style={{ left: `${(target / max) * 100}%` }} />
        </div>
        <p className="mt-2 flex flex-wrap gap-x-4 text-sm text-ink-2">
          <span>Light bar: before ({fmt.usd(result.baseCost)})</span>
          <span>Dark bar: after ({fmt.usd(result.newCost)})</span>
          <span>Black line: target</span>
        </p>
      </Card>
      <div className="mt-4 overflow-x-auto rounded-xl bg-surface ring-1 ring-[var(--ring)]">
        <table className="w-full min-w-[34rem] text-left text-sm">
          <caption className="sr-only">Results by meter</caption>
          <thead className="border-b border-line text-ink-2">
            <tr>
              <th scope="col" className="px-3 py-2 font-semibold">Meter</th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">Thousand gallons</th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">Yearly cost</th>
              <th scope="col" className="px-3 py-2 text-right font-semibold">Saves</th>
            </tr>
          </thead>
          <tbody>
            {result.meters.map((m) => (
              <tr key={m.meter} className="border-b border-line last:border-0">
                <th scope="row" className="px-3 py-2 font-normal">Meter {meterNumber(m.meter)}</th>
                <td className="tabular px-3 py-2 text-right">{fmt.int(Math.round(m.baseKgal))} to {fmt.int(Math.round(m.newKgal))}</td>
                <td className="tabular px-3 py-2 text-right">{fmt.usd(m.baseCost)} to {fmt.usd(m.newCost)}</td>
                <td className="tabular px-3 py-2 text-right font-semibold">{fmt.usd(m.baseCost - m.newCost)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <h3 className="mt-6 font-semibold">Month by month</h3>
      <Bars data={monthly} x="period" series={[{ key: 'before', name: 'Before', color: 'var(--s1)' }, { key: 'after', name: 'After', color: 'var(--s2)' }]} label={`Monthly cost before and after, ${baseLabel}`} money />
      <TableView caption="Monthly cost before and after" head={['Read period ending', 'Before', 'After']} rows={monthly.map((r) => [r.period, fmt.usd(r.before), fmt.usd(r.after)])} />
    </>
  )
}

function Assumptions({ rate, baseLabel, flags, changes }: { rate: NonNullable<Model['latestRate']>; baseLabel: string; flags: Model['flags']; changes: UIChange[] }) {
  const leaks = changes.filter((c): c is Extract<UIChange, { kind: 'fix_leak' }> => c.kind === 'fix_leak').map((c) => flags.find((f) => f.flag.id === c.flag)?.flag).filter(Boolean)
  return (
    <details className="mt-4 rounded-xl bg-surface p-4 text-sm ring-1 ring-[var(--ring)]">
      <summary className="cursor-pointer font-semibold">Every assumption behind these numbers</summary>
      <ul className="mt-3 list-disc space-y-2 pl-5 text-ink-2">
        <li>Starting point: {baseLabel}, metered gallons per City read period (Waterfluence ENERGY STAR export).</li>
        <li>
          Prices: City rate for read periods from {rate.applies_from_period_end}, {rate.source} ({rate.confidence} confidence). Block prices $
          {rate.volumetric.blocks.map((b) => b.price.toFixed(2)).join(' and $')} per thousand gallons, plus fees and {rate.taxes.map((t) => `${t.rate_percent}%`).join(', ')} tax.
        </li>
        <li>
          The cheaper first block is set from each meter's December to February use. Results assume a change has been in place a full year, so cutting winter
          water also lowers that allowance. The starting point is priced the same way.
        </li>
        <li>Service charges and per-bill fees stay even if a meter is turned off, unless the City closes the meter.</li>
        <li>Changes are applied in order, so percentages multiply rather than add.</li>
        <li>"Fewer watering days" assumes the same run time on the days that remain.</li>
        <li>Weather is held the same as the starting year.</li>
        {leaks.map((f) => (
          <li key={f!.id}>
            {f!.title}: {fmt.int(f!.excess_water!.ongoing_gallons_per_year!)} gallons a year. {f!.excess_water!.method} ({f!.excess_water!.confidence} confidence)
          </li>
        ))}
      </ul>
    </details>
  )
}

