import { useEffect, useMemo, useState, type ReactNode } from 'react'
import type { SiteData } from '../../scripts/site-data'
import { currentRate, type RatePeriod, type ReadPeriod } from '../engine/billing'
import { breakEvenPercent, evaluate, type Effect, type Outcome } from '../engine/investment'
import { fmt, meterNumber } from '../lib/data'
import { setQuery } from '../lib/route'

type Investment = {
  id: string
  name: string
  applies_to: string
  effect: { type: string; value: number | null; range: [number | null, number | null] }
  upfront_cost_per_unit: number | null
  unit: string
  annual_cost: number | null
  lifespan_years: number | null
  source: string
  confidence: string
  requires_confirmation?: string
  todo?: string
}

/** The form, as strings, so it round-trips through the URL exactly as typed. */
type Form = { inv: string; name: string; m: string[]; kind: 'pct' | 'gal'; val: string; low: string; high: string; cost: string; yearly: string; life: string }
const EMPTY: Form = { inv: '', name: '', m: [], kind: 'pct', val: '', low: '', high: '', cost: '', yearly: '', life: '' }
const KEYS = ['inv', 'name', 'kind', 'val', 'low', 'high', 'cost', 'yearly', 'life'] as const

export function readForm(hash: string): Form {
  const q = new URLSearchParams(hash.split('?')[1] ?? '')
  const f: Form = { ...EMPTY, m: q.get('m')?.split(',').filter(Boolean) ?? [] }
  for (const k of KEYS) {
    const v = q.get(k)
    if (v === null) continue
    if (k === 'kind') f.kind = v === 'gal' ? 'gal' : 'pct'
    else f[k] = v
  }
  return f
}

function writeForm(f: Form) {
  const q = new URLSearchParams()
  if (f.m.length) q.set('m', f.m.join(','))
  for (const k of KEYS) if (f[k] && !(k === 'kind' && f.kind === 'pct')) q.set(k, f[k])
  setQuery(Object.fromEntries(q))
}

/** Blank is null; anything else must be a number at or above zero. */
function num(s: string): number | null | 'bad' {
  if (s.trim() === '') return null
  const n = Number(s.replace(/[$,%\s]/g, ''))
  return Number.isFinite(n) && n >= 0 ? n : 'bad'
}

const usd2 = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD' })
const signedUsd = (n: number) => (n < 0 ? `minus ${fmt.usd(-n)}` : fmt.usd(n))
function payback(months: number | null) {
  if (months === null) return 'Never'
  if (months < 24) return `${Math.round(months)} months`
  return `${(months / 12).toFixed(1)} years`
}

export function InvestmentCalculator({ data }: { data: SiteData }) {
  const [form, setForm] = useState<Form>(() => readForm(window.location.hash))
  useEffect(() => writeForm(form), [form])
  const set = (patch: Partial<Form>) => setForm((f) => ({ ...f, ...patch }))

  const investments = data.investments as unknown as Investment[]
  const rate = (currentRate(data.rates as unknown as RatePeriod[]) ?? undefined) as unknown as (RatePeriod & SiteData['rates'][number]) | undefined
  const periods = useMemo(
    () => Object.fromEntries(Object.entries(data.billingPeriods).map(([k, v]) => [k, v.rows])) as Record<string, ReadPeriod[]>,
    [data],
  )
  const site = data.config.site as { annual_target_usd?: { value: number; source: string }; reconciliation?: { required_pass_rate_percent: { value: number } } }
  const target = site.annual_target_usd?.value ?? null
  const priced = data.bills.filter((b) => b.reconciled === 'pass' || b.reconciled === 'fail')
  const passRate = priced.length ? (100 * priced.filter((b) => b.reconciled === 'pass').length) / priced.length : 0
  const gateMet = priced.length > 0 && passRate >= (site.reconciliation?.required_pass_rate_percent.value ?? 100)
  const chosen = investments.find((i) => i.id === form.inv) ?? null

  // Each meter's cost for the last 12 read periods at today's rate, to help people choose.
  const baselines = useMemo(() => {
    if (!rate) return {}
    const out: Record<string, Outcome | string> = {}
    for (const m of data.meters) {
      const e = evaluate([m.id], periods, rate, { type: 'percent_reduction', value: 0 }, { upfront: 0, annual: 0, lifespanYears: null })
      out[m.id] = e.ok ? e.result : e.reason
    }
    return out
  }, [data, periods, rate])

  function pickInvestment(id: string) {
    const inv = investments.find((i) => i.id === id)
    if (!inv) return set({ inv: '' })
    const s = (n: number | null) => (n === null ? '' : String(n))
    const perMeter = inv.unit === 'meter' || inv.unit === 'one_time' || inv.unit === 'controller'
    set({
      inv: id,
      name: inv.name,
      kind: inv.effect.type === 'gallons_per_month' ? 'gal' : 'pct',
      val: s(inv.effect.value),
      low: s(inv.effect.range[0]),
      high: s(inv.effect.range[1]),
      cost: inv.upfront_cost_per_unit !== null && perMeter ? String(inv.upfront_cost_per_unit * (inv.unit === 'meter' ? Math.max(form.m.length, 1) : 1)) : '',
      yearly: s(inv.annual_cost),
      life: s(inv.lifespan_years),
    })
  }

  const parsed = { val: num(form.val), low: num(form.low), high: num(form.high), cost: num(form.cost), yearly: num(form.yearly), life: num(form.life) }
  const bad = (Object.keys(parsed) as (keyof typeof parsed)[]).filter((k) => parsed[k] === 'bad')
  const pctTooBig = form.kind === 'pct' && [parsed.val, parsed.low, parsed.high].some((v) => typeof v === 'number' && v > 100)
  const ready = rate && gateMet && form.m.length > 0 && typeof parsed.val === 'number' && typeof parsed.cost === 'number' && bad.length === 0 && !pctTooBig

  const costs = {
    upfront: typeof parsed.cost === 'number' ? parsed.cost : 0,
    annual: typeof parsed.yearly === 'number' ? parsed.yearly : 0,
    lifespanYears: typeof parsed.life === 'number' && parsed.life > 0 ? parsed.life : null,
  }
  const effectOf = (v: number): Effect => (form.kind === 'pct' ? { type: 'percent_reduction', value: v } : { type: 'gallons_per_month', value: v })
  const run = (v: number | null | 'bad') => (ready && typeof v === 'number' ? evaluate(form.m, periods, rate!, effectOf(v), costs) : null)
  const expected = run(parsed.val)
  const worst = run(parsed.low)
  const best = run(parsed.high)
  const breakEven = ready ? breakEvenPercent(form.m, periods, rate!, costs, 5) : null
  const breakEvenLife = ready && costs.lifespanYears && costs.lifespanYears !== 5 ? breakEvenPercent(form.m, periods, rate!, costs, costs.lifespanYears) : null
  const allMetersCost = Object.values(baselines).every((b) => typeof b !== 'string') ? Object.values(baselines).reduce((s, b) => s + (b as Outcome).baselineCost, 0) : null
  const openFlags = data.flags.filter((f) => form.m.includes(f.meter) && !['fixed', 'false-alarm'].includes(f.status))
  const meterList = form.m.map((m) => `meter ${meterNumber(m)}`).join(' and ')
  const label = form.name.trim() || 'This change'

  return (
    <article>
      <h1 className="text-2xl font-bold md:text-3xl">Is an investment worth it?</h1>
      <p className="mt-2 max-w-prose text-ink-2">
        Enter a change or investment, what it costs, and how much water you expect it to save. The calculator re-prices each meter's last 12
        City bills with less water and shows whether the savings pay back the cost.
      </p>

      {!rate && <Notice>No City of Mesa rate is on file yet, so nothing can be priced.</Notice>}
      {rate && !gateMet && (
        <Notice>
          Savings are hidden until at least {site.reconciliation?.required_pass_rate_percent.value ?? 95}% of priced bills reconcile with the
          City's rates. Today: {passRate.toFixed(0)}%. See the Bills screen.
        </Notice>
      )}

      <form className="mt-6 space-y-6 rounded-xl bg-surface p-4 ring-1 ring-[var(--ring)] md:p-6" onSubmit={(e) => e.preventDefault()}>
        <Field id="inv" label="Start from the catalog (optional)">
          <select id="inv" value={form.inv} onChange={(e) => pickInvestment(e.target.value)} className={inputCls}>
            <option value="">My own change</option>
            {investments.map((i) => (
              <option key={i.id} value={i.id}>
                {i.name}
              </option>
            ))}
          </select>
          {chosen && (
            <p className="mt-2 text-sm text-ink-2">
              {chosen.effect.value === null || chosen.upfront_cost_per_unit === null
                ? 'Needs a quote: the catalog has no cost or savings for this yet, so enter your own numbers below.'
                : `Catalog values from ${chosen.source} (confidence ${chosen.confidence}).`}
              {chosen.requires_confirmation && <span className="block font-semibold text-ink">{chosen.requires_confirmation}</span>}
            </p>
          )}
        </Field>

        <Field id="name" label="Name">
          <input id="name" value={form.name} onChange={(e) => set({ name: e.target.value })} placeholder="For example, smart controller" className={inputCls} />
        </Field>

        <fieldset>
          <legend className="font-semibold">Which meters it affects</legend>
          <p className="text-sm text-ink-2">Zones and areas are not tied to meters in the data yet, so changes apply to a whole meter's water.</p>
          <div className="mt-2 grid gap-2 sm:grid-cols-2">
            {data.meters.map((m) => {
              const b = baselines[m.id]
              return (
                <label key={m.id} className="flex items-start gap-2 rounded-lg p-2 ring-1 ring-[var(--ring)]">
                  <input
                    type="checkbox"
                    className="mt-1 size-4"
                    checked={form.m.includes(m.id)}
                    onChange={(e) => set({ m: e.target.checked ? [...form.m, m.id].sort() : form.m.filter((x) => x !== m.id) })}
                  />
                  <span>
                    <span className="font-semibold">Meter {meterNumber(m.id)}</span>
                    <span className="block text-sm text-ink-2">
                      {typeof b === 'object' ? `${fmt.usd(b.baselineCost)} a year at today's rate, ${fmt.gallons(b.baselineKgal)}` : b ?? 'Cannot be priced'}
                    </span>
                  </span>
                </label>
              )
            })}
          </div>
        </fieldset>

        <fieldset>
          <legend className="font-semibold">Water it saves</legend>
          <div className="mt-2 flex flex-wrap gap-4">
            {(['pct', 'gal'] as const).map((k) => (
              <label key={k} className="flex items-center gap-2">
                <input type="radio" name="kind" className="size-4" checked={form.kind === k} onChange={() => set({ kind: k })} />
                {k === 'pct' ? 'Percent of the meter’s water' : 'Gallons per month'}
              </label>
            ))}
          </div>
          <div className="mt-3 grid gap-4 sm:grid-cols-3">
            <Field id="val" label={form.kind === 'pct' ? 'Expected cut (%)' : 'Expected gallons a month'} error={parsed.val === 'bad' || (form.kind === 'pct' && typeof parsed.val === 'number' && parsed.val > 100)}>
              <input id="val" inputMode="decimal" value={form.val} onChange={(e) => set({ val: e.target.value })} className={inputCls} />
            </Field>
            <Field id="low" label="Worst case (optional)" error={parsed.low === 'bad'}>
              <input id="low" inputMode="decimal" value={form.low} onChange={(e) => set({ low: e.target.value })} className={inputCls} />
            </Field>
            <Field id="high" label="Best case (optional)" error={parsed.high === 'bad'}>
              <input id="high" inputMode="decimal" value={form.high} onChange={(e) => set({ high: e.target.value })} className={inputCls} />
            </Field>
          </div>
        </fieldset>

        <div className="grid gap-4 sm:grid-cols-3">
          <Field id="cost" label="Upfront cost ($)" error={parsed.cost === 'bad'}>
            <input id="cost" inputMode="decimal" value={form.cost} onChange={(e) => set({ cost: e.target.value })} placeholder="6000" className={inputCls} />
          </Field>
          <Field id="yearly" label="Yearly cost, like a subscription ($, optional)" error={parsed.yearly === 'bad'}>
            <input id="yearly" inputMode="decimal" value={form.yearly} onChange={(e) => set({ yearly: e.target.value })} className={inputCls} />
          </Field>
          <Field id="life" label="Expected life in years (optional)" error={parsed.life === 'bad'}>
            <input id="life" inputMode="decimal" value={form.life} onChange={(e) => set({ life: e.target.value })} className={inputCls} />
          </Field>
        </div>
        {(bad.length > 0 || pctTooBig) && (
          <p role="alert" className="text-sm font-semibold">
            <span aria-hidden="true">! </span>
            {pctTooBig ? 'A percent cut cannot be more than 100. ' : ''}
            {bad.length > 0 ? 'Some boxes are not numbers. Use plain numbers like 6000 or 20.' : ''}
          </p>
        )}
        <button type="button" onClick={() => setForm(EMPTY)} className="text-sm underline underline-offset-4">
          Start over
        </button>
      </form>

      <section aria-labelledby="result-heading" aria-live="polite" className="mt-8">
        <h2 id="result-heading" className="text-xl font-bold">
          Result
        </h2>
        {!ready && gateMet && rate && (
          <p className="mt-2 text-ink-2">Choose at least one meter and enter the upfront cost and the expected saving to see the result.</p>
        )}
        {expected && !expected.ok && <Notice>Cannot price this: {expected.reason}.</Notice>}
        {expected?.ok && (
          <>
            <p className="mt-3 text-2xl font-bold">
              {expected.result.paybackMonths === null
                ? `${label} never pays for itself.`
                : `${label} pays for itself in ${payback(expected.result.paybackMonths)}.`}
            </p>
            <p className="mt-1 max-w-prose text-ink-2">
              {expected.result.paybackMonths === null
                ? `Its yearly cost is as large as or larger than the ${fmt.usd(expected.result.annualSavings)} a year it would save on ${meterList}.`
                : costs.lifespanYears
                  ? expected.result.paybackMonths / 12 <= costs.lifespanYears
                    ? `That is within its expected ${costs.lifespanYears}-year life.`
                    : `That is longer than its expected ${costs.lifespanYears}-year life, so it would wear out before paying for itself.`
                  : 'Enter an expected life to see whether it lasts that long.'}
            </p>

            <dl className="mt-4 grid grid-cols-2 gap-3 md:grid-cols-4">
              <Tile value={fmt.usd(expected.result.annualSavings)} label={`lower bills a year on ${meterList}`} />
              <Tile value={payback(expected.result.paybackMonths)} label="to pay back the upfront cost" />
              <Tile value={signedUsd(expected.result.fiveYearNet)} label="ahead after 5 years (savings minus all costs)" flag={expected.result.fiveYearNet < 0} />
              <Tile value={fmt.usd(expected.result.maxAnnualSavings)} label="the most any change could save a year here, if it used no water at all" />
            </dl>

            <p className="mt-4 max-w-prose">
              {breakEven === null
                ? `Even using no water at all, ${meterList} could not pay back ${fmt.usd(costs.upfront)} in 5 years.`
                : breakEven === 0
                  ? 'It pays back within 5 years even with no water saved.'
                  : `To pay back in 5 years, it would need to cut ${meterList}'s water by at least ${breakEven}%.`}
              {breakEvenLife !== null && ` To pay back within its ${costs.lifespanYears}-year life: at least ${breakEvenLife}%.`}
              {costs.lifespanYears && costs.lifespanYears !== 5 && breakEvenLife === null && ` It could not pay back within its ${costs.lifespanYears}-year life even using no water.`}
            </p>

            {(worst?.ok || best?.ok) && (
              <Table caption="Worst, expected, and best case" heads={['', 'Worst case', 'Expected', 'Best case']}>
                {(
                  [
                    ['Saved', (o: Outcome) => fmt.gallons(o.baselineKgal - o.afterKgal) + ' a year'],
                    ['Lower bills a year', (o: Outcome) => fmt.usd(o.annualSavings)],
                    ['Payback', (o: Outcome) => payback(o.paybackMonths)],
                    ['Ahead after 5 years', (o: Outcome) => signedUsd(o.fiveYearNet)],
                  ] as [string, (o: Outcome) => string][]
                ).map(([name, f]) => (
                  <tr key={name} className="border-b border-line last:border-0">
                    <th scope="row" className="px-4 py-2 font-semibold">{name}</th>
                    {[worst, expected, best].map((e, i) => (
                      <td key={i} className="tabular px-4 py-2 text-right">
                        {e?.ok ? f(e.result) : <span className="italic text-ink-2">Not entered</span>}
                      </td>
                    ))}
                  </tr>
                ))}
              </Table>
            )}

            <Table caption="By meter, last 12 read periods at today's rate" heads={['Meter', 'Water now', 'Water after', 'Bills now', 'Bills after']}>
              {expected.byMeter.map(({ baseline, after }) => (
                <tr key={baseline.meter} className="border-b border-line last:border-0">
                  <th scope="row" className="px-4 py-2 font-semibold">Meter {meterNumber(baseline.meter)}</th>
                  <td className="tabular px-4 py-2 text-right">{fmt.gallons(baseline.kgal)}</td>
                  <td className="tabular px-4 py-2 text-right">{fmt.gallons(after.kgal)}</td>
                  <td className="tabular px-4 py-2 text-right">{usd2(baseline.cost)}</td>
                  <td className="tabular px-4 py-2 text-right">{usd2(after.cost)}</td>
                </tr>
              ))}
            </Table>

            {target !== null && allMetersCost !== null && (
              <p className="mt-4 max-w-prose">
                All four meters cost about {fmt.usd(allMetersCost)} a year at today's rate. With this change: about{' '}
                {fmt.usd(allMetersCost - expected.result.annualSavings)}, against the HOA's {fmt.usd(target)} target (
                {allMetersCost - expected.result.annualSavings <= target
                  ? 'at or under target'
                  : `${fmt.usd(allMetersCost - expected.result.annualSavings - target)} still to go`}
                ).
              </p>
            )}

            {openFlags.length > 0 && (
              <div className="mt-6 rounded-xl p-4 ring-2 ring-serious">
                <p className="font-semibold">
                  <span aria-hidden="true">! </span>
                  {openFlags.length === 1 ? 'There is a possible leak' : `There are ${openFlags.length} possible leaks`} on {meterList}.
                </p>
                <p className="mt-1 text-sm">
                  A percent cut assumes the water is used on schedule. Water lost to a leak or a stuck valve is only saved by fixing it.
                </p>
                <ul className="mt-2 list-disc space-y-1 pl-5 text-sm">
                  {openFlags.map((f) => (
                    <li key={f.id}>
                      Meter {meterNumber(f.meter)}, first seen {String(f.first_seen).slice(0, 10)}: {f.likely_cause ?? f.evidence}
                    </li>
                  ))}
                </ul>
              </div>
            )}

            <section aria-labelledby="assumptions-heading" className="mt-8">
              <h3 id="assumptions-heading" className="text-lg font-bold">
                What this assumes
              </h3>
              <ul className="mt-2 max-w-prose list-disc space-y-2 pl-5 text-sm">
                <li>
                  The water saved is your estimate{chosen && chosen.effect.value !== null ? ` (catalog: ${chosen.source}, confidence ${chosen.confidence})` : ''}. It is not a
                  vendor quote or a measured result.
                </li>
                <li>
                  Water use is each meter's last 12 read periods ({expected.byMeter.map((x) => `meter ${meterNumber(x.baseline.meter)} ${x.baseline.from} to ${x.baseline.to}`).join('; ')}),
                  from Waterfluence.
                </li>
                <li>
                  Every bill is priced at the City of Mesa rate in effect since the read period ending {rate!.id}, which was{' '}
                  {rate!.derived ? 'worked out from the HOA’s bills, not yet checked against the City’s published schedule' : 'taken from the City’s schedule'}{' '}
                  (confidence {rate!.confidence}). Rates are held flat for later years; if City rates rise, savings grow.
                </li>
                <li>
                  The service charge and per-bill fees stay the same however little water is used, which is why savings stop at{' '}
                  {fmt.usd(expected.result.maxAnnualSavings)} a year.
                </li>
                <li>
                  The cut applies to winter too, so the City's cheaper winter allowance shrinks with it. This is where a lasting change settles after its first
                  winter; the first year can save a little more.
                </li>
                <li>{costs.annual > 0 ? `Yearly cost of ${fmt.usd(costs.annual)} is subtracted from savings every year.` : 'No yearly cost was entered, so none is subtracted.'}</li>
                <li>Payback is simple payback: no interest, rebates, or financing.</li>
              </ul>
              <p className="mt-3 text-sm text-ink-2">The link in your address bar saves these inputs, so you can share this result.</p>
            </section>
          </>
        )}
      </section>
    </article>
  )
}

const inputCls = 'mt-1 w-full rounded-lg border border-line bg-page px-3 py-2 text-ink'

function Field({ id, label, error, children }: { id: string; label: string; error?: boolean; children: ReactNode }) {
  return (
    <div>
      <label htmlFor={id} className="block font-semibold">
        {label}
      </label>
      {children}
      {error && (
        <p className="mt-1 text-sm font-semibold">
          <span aria-hidden="true">! </span>Not a valid number
        </p>
      )}
    </div>
  )
}

function Notice({ children }: { children: ReactNode }) {
  return <p className="mt-4 max-w-prose rounded-xl p-4 ring-2 ring-serious">{children}</p>
}

function Tile({ value, label, flag }: { value: string; label: string; flag?: boolean }) {
  return (
    <div className={`flex flex-col rounded-xl bg-surface p-4 ring-1 ${flag ? 'ring-2 ring-serious' : 'ring-[var(--ring)]'}`}>
      <dt className="order-2 mt-1 text-sm text-ink-2">{label}</dt>
      <dd className="order-1 text-2xl font-bold">{value}</dd>
    </div>
  )
}

function Table({ caption, heads, children }: { caption: string; heads: string[]; children: ReactNode }) {
  return (
    <div className="mt-6 overflow-x-auto rounded-xl bg-surface ring-1 ring-[var(--ring)]">
      <table className="w-full min-w-[32rem] text-left text-sm">
        <caption className="px-4 pt-3 text-left font-semibold">{caption}</caption>
        <thead className="border-b border-line text-ink-2">
          <tr>
            {heads.map((h, i) => (
              <th key={h || i} scope="col" className={`px-4 py-2 font-semibold ${i > 0 ? 'text-right' : ''}`}>
                {h}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>{children}</tbody>
      </table>
    </div>
  )
}
