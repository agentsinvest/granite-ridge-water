import { useState } from 'react'
import type { SiteData } from '../../scripts/site-data'
import { Bars } from '../components/charts'
import { Card, GridTable, PageHeader, Pill, Section, Stat, Stats, Sure, Term } from '../components/ui'
import { runPlan, turfNeedKgal, turfWaterKgal, type YearLevers } from '../engine/quickWins'
import { fmt, meterNumber, meterName } from '../lib/data'
import { RISK, type Model } from '../lib/model'
import { setQuery } from '../lib/route'

type Plan = NonNullable<SiteData['quickWins']>
type LeverKey = keyof Plan['levers']
type Values = Record<LeverKey, (number | boolean)[]>

const ORDER: LeverKey[] = ['leak_repair_cut_percent', 'controller_cut_percent', 'stop_overseeding', 'winter_turf_percent', 'october_turf_percent', 'summer_turf_percent', 'desert_drip_percent']
const TURF_KEYS: LeverKey[] = ['stop_overseeding', 'winter_turf_percent', 'october_turf_percent', 'summer_turf_percent']

const enc = (x: unknown) => btoa(unescape(encodeURIComponent(JSON.stringify(x)))).replace(/=+$/, '')
function dec<T>(s: string | null, fallback: T): T {
  if (!s) return fallback
  try {
    return JSON.parse(decodeURIComponent(escape(atob(s)))) as T
  } catch {
    return fallback
  }
}

const defaults = (plan: Plan): Values => Object.fromEntries(ORDER.map((k) => [k, [...plan.levers[k].by_year]])) as Values

/** Values read from the URL, kept only when they have the right shape for this plan. */
function fromUrl(plan: Plan, raw: string | null): Values {
  const d = defaults(plan)
  const v = dec<Partial<Values>>(raw, {})
  for (const k of ORDER) {
    const arr = v[k]
    if (!Array.isArray(arr) || arr.length !== plan.years.length) continue
    if (k === 'stop_overseeding' ? arr.every((x) => typeof x === 'boolean') : arr.every((x) => typeof x === 'number' && x >= 0 && x <= 100)) d[k] = arr
  }
  return d
}

function leversFor(plan: Plan, v: Values, i: number, keepTurf: boolean): YearLevers {
  const l = plan.levers
  return {
    leakCutPercent: v.leak_repair_cut_percent[i] as number,
    controllerCutPercent: v.controller_cut_percent[i] as number,
    stopOverseeding: keepTurf ? false : (v.stop_overseeding[i] as boolean),
    winterTurfPercent: v.winter_turf_percent[i] as number,
    winterMonths: l.winter_turf_percent.months ?? [],
    octoberTurfPercent: v.october_turf_percent[i] as number,
    octoberMonths: l.october_turf_percent.months ?? [],
    summerTurfPercent: keepTurf ? 100 : (v.summer_turf_percent[i] as number),
    summerMonths: l.summer_turf_percent.months ?? [],
    dripPercent: v.desert_drip_percent[i] as number,
  }
}

const NEUTRAL: Omit<YearLevers, 'winterMonths' | 'octoberMonths' | 'summerMonths'> = {
  leakCutPercent: 0,
  controllerCutPercent: 0,
  stopOverseeding: false,
  winterTurfPercent: 100,
  octoberTurfPercent: 100,
  summerTurfPercent: 100,
  dripPercent: 100,
}

export function QuickWins({ data, model, query }: { data: SiteData; model: Model; query: URLSearchParams }) {
  const plan = data.quickWins
  if (!plan || !model.latestRate) {
    return (
      <article>
        <PageHeader title="Quick wins" lead="No quick wins plan or City price is on file yet." />
      </article>
    )
  }
  return <QuickWinsBody data={data} model={model} plan={plan} rate={model.latestRate} query={query} />
}

function QuickWinsBody({ data, model, plan, rate, query }: { data: SiteData; model: Model; plan: Plan; rate: NonNullable<Model['latestRate']>; query: URLSearchParams }) {
  const [values, setValues] = useState<Values>(() => fromUrl(plan, query.get('l')))
  const [prices, setPrices] = useState<'today' | 'proposed'>(query.get('p') === 'proposed' ? 'proposed' : 'today')
  const [keepTurf, setKeepTurf] = useState(query.get('t') === '1')
  const save = (v: Values, p: typeof prices, t: boolean) => {
    const isDefault = JSON.stringify(v) === JSON.stringify(defaults(plan))
    setQuery({ l: isDefault ? null : enc(v), p: p === 'proposed' ? 'proposed' : null, t: t ? '1' : null })
  }
  const update = (v: Values) => {
    setValues(v)
    save(v, prices, keepTurf)
  }

  const meters = data.meters.map((m) => ({ id: m.id, turfShare: (m.turf_share_percent?.value ?? 0) / 100 }))
  const missingShare = data.meters.filter((m) => !m.turf_share_percent).map((m) => m.id)
  const next = model.nextRate
  const priced = prices === 'proposed' && next ? next : rate
  const years = plan.years.map((year, i) => ({ year, levers: leversFor(plan, values, i, keepTurf) }))
  const out = runPlan(model.baseline, meters, years, priced)
  const ok = out.every((y) => y.result.ok)

  const turf = data.turfMinimum
  const need =
    turf && data.monthlyNormals
      ? turfNeedKgal(
          data.monthlyNormals.months.map((m) => ({ eto: m.eto, rain: m.rainAvg })),
          { areaSqFt: turf.turfAreaSqFt.value, plantFactor: turf.plantFactor.value, efficiency: turf.efficiency.value, effectiveRainShare: turf.effectiveRainShare.value },
        )
      : null
  const julyNeed = need?.[6] ?? null
  const julyRatio = (l: YearLevers | null) => (julyNeed ? turfWaterKgal(model.baseline, meters, 7, l) / julyNeed : null)

  const homes = (model.site as unknown as { homes: { value: number } }).homes.value
  const budget = (model.site as unknown as { small_wins_budget_usd: { value: number; source: string } }).small_wins_budget_usd
  const target = model.target
  const baseEnds = Object.values(model.baseline).flat().map((p) => p.end).sort()
  const baseLabel = baseEnds.length ? `read periods ending ${fmt.month(baseEnds[0])} to ${fmt.month(baseEnds.at(-1)!)}` : 'the latest 12 read periods'

  // Each lever on its own, in the first plan year, so its worth can be weighed against a quote.
  const first = years[0].levers
  const alone = (patch: Partial<YearLevers>) => {
    const l = { ...first, ...NEUTRAL, ...patch }
    const r = runPlan(model.baseline, meters, [{ year: years[0].year, levers: l }], priced)[0].result
    return r.ok ? r.baseCost - r.newCost : null
  }
  const leverAlone: Record<string, number | null> = {
    leak: alone({ leakCutPercent: first.leakCutPercent }),
    controller: alone({ controllerCutPercent: first.controllerCutPercent }),
    overseed: keepTurf ? 0 : alone({ stopOverseeding: first.stopOverseeding, winterTurfPercent: first.winterTurfPercent, octoberTurfPercent: first.octoberTurfPercent }),
    summer: keepTurf ? 0 : alone({ summerTurfPercent: first.summerTurfPercent }),
    drip: alone({ dripPercent: first.dripPercent }),
  }

  const inv = (id?: string) => data.investments.find((x) => x.id === id) as { id: string; name: string; upfront_cost_per_unit: number | null; unit: string; source: string } | undefined
  const latestBooks = Object.keys(data.financials).sort().at(-1)
  const overseedLine = latestBooks ? (data.financials[latestBooks].lines.find((l) => l.account === '51110')?.actual ?? null) : null
  const rebate = plan.controller_rebate
  const costs = [
    { key: 'leak', label: plan.levers.leak_repair_cut_percent.label, investment: inv(plan.levers.leak_repair_cut_percent.investment), cost: null as number | null, note: 'Wet check by the landscaper or an irrigation auditor, then repairs.' },
    {
      key: 'controller',
      label: plan.levers.controller_cut_percent.label,
      investment: inv(plan.levers.controller_cut_percent.investment),
      cost: null as number | null,
      note: `Mesa may pay ${fmt.pct(rebate.share)} up to ${fmt.usd(rebate.cap_usd)} (to confirm).`,
    },
    {
      key: 'overseed',
      label: plan.levers.stop_overseeding.label,
      investment: undefined,
      cost: 0,
      note: overseedLine !== null ? `No cost. Also ends the overseeding line in the HOA books: ${fmt.usd(overseedLine)} in ${latestBooks}.` : 'No cost.',
    },
    { key: 'summer', label: 'Summer turf step-down', investment: undefined, cost: 0, note: 'Controller settings. No cost if the landscape contract covers schedule changes (to confirm).' },
    { key: 'drip', label: 'Desert drip step-down', investment: undefined, cost: 0, note: 'Controller settings. No cost if the landscape contract covers schedule changes (to confirm).' },
  ].map((c) => ({ ...c, cost: c.investment ? c.investment.upfront_cost_per_unit : c.cost }))
  const known = costs.filter((c) => c.cost !== null).reduce((s, c) => s + (c.cost ?? 0), 0)
  const needQuote = costs.filter((c) => c.cost === null)

  const missing = <span className="italic text-ink-2">Not available</span>
  const lastYear = out.at(-1)!
  const y1 = out[0]

  return (
    <article>
      <PageHeader
        title="Quick wins"
        lead="Steps that cost little or nothing up front: fix leaks, a smart controller, stop winter overseeding, and step summer turf and desert drip water down a little each year. Rain gardens, rainwater harvesting, and landscape conversion are not part of this plan."
      />

      <Card className="mt-6">
        <fieldset>
          <legend className="font-semibold">Price the plan at</legend>
          <div className="mt-2 flex flex-wrap gap-x-6 gap-y-2">
            {(next ? (['today', 'proposed'] as const) : (['today'] as const)).map((p) => (
              <label key={p} className="flex items-center gap-2">
                <input
                  type="radio"
                  name="prices"
                  className="h-4 w-4"
                  checked={prices === p}
                  onChange={() => {
                    setPrices(p)
                    save(values, p, keepTurf)
                  }}
                />
                {p === 'today' ? "Today's City prices" : "City's recommended prices from February 2027 (vote December 8, 2026)"}
              </label>
            ))}
          </div>
        </fieldset>
        <label className="mt-4 flex items-start gap-2">
          <input
            type="checkbox"
            className="mt-1 h-4 w-4"
            checked={keepTurf}
            onChange={(e) => {
              setKeepTurf(e.target.checked)
              save(values, prices, e.target.checked)
            }}
          />
          <span>
            <strong>Leave the park turf as it is today.</strong> Keeps overseeding and summer turf water unchanged, to see what the other steps do alone.
          </span>
        </label>
        <button
          type="button"
          className="mt-4 rounded-md border border-line px-3 py-1.5 text-sm font-semibold"
          onClick={() => {
            const d = defaults(plan)
            setValues(d)
            setPrices('today')
            setKeepTurf(false)
            save(d, 'today', false)
          }}
        >
          Reset to the workbook plan
        </button>
      </Card>

      {!ok ? (
        <p className="mt-6 rounded-xl border-2 border-serious p-4">
          The plan could not be priced: {out.map((y) => (!y.result.ok ? y.result.reason : '')).filter(Boolean)[0]}
        </p>
      ) : (
        <>
          <Stats>
            {y1.result.ok && <Stat value={fmt.usd(y1.result.baseCost - y1.result.newCost)} label={`saved in ${y1.year}, the first year`} good={y1.result.newCost < y1.result.baseCost} />}
            {lastYear.result.ok && (
              <Stat value={fmt.usd(lastYear.result.newCost)} label={`water bill in ${lastYear.year} with the plan (target ${fmt.usd(target)})`} flag={lastYear.result.newCost > target} good={lastYear.result.newCost <= target} />
            )}
            <Stat
              value={julyRatio(lastYear.levers) === null ? 'Unknown' : fmt.pct(julyRatio(lastYear.levers)!)}
              label={`of the turf's healthy minimum in July ${lastYear.year}`}
              flag={(julyRatio(lastYear.levers) ?? 1) < 1}
            />
            <Stat value={needQuote.length ? `${needQuote.length} need a quote` : fmt.usd(known)} label={`upfront cost against the ${fmt.usd(budget.value)} small-wins budget`} />
          </Stats>

          <Section id="results" title="Water bill by year" lead={`Each year's steps applied to ${baseLabel}. The dashed line is the target.`}>
            <Bars
              data={out.map((y) => ({ year: String(y.year), base: y.result.ok ? y.result.baseCost : null, plan: y.result.ok ? y.result.newCost : null }))}
              x="year"
              series={[
                { key: 'base', name: 'Do nothing', color: 'var(--s2)' },
                { key: 'plan', name: 'With the plan', color: 'var(--s1)' },
              ]}
              label="Yearly water bill, doing nothing and with the plan"
              money
              target={target}
              targetLabel={`Target ${fmt.usd(target)}`}
            />
            <GridTable
              caption="Plan results by year"
              head={['', ...out.map((y) => String(y.year))]}
              groups={[
                {
                  title: 'Water (thousand gallons)',
                  rows: [
                    { label: 'Do nothing', cells: out.map((y) => (y.result.ok ? fmt.int(Math.round(y.result.baseKgal)) : missing)) },
                    { label: 'With the plan', strong: true, cells: out.map((y) => (y.result.ok ? fmt.int(Math.round(y.result.newKgal)) : missing)) },
                    { label: 'Water cut', cells: out.map((y) => (y.result.ok ? fmt.pct(1 - y.result.newKgal / y.result.baseKgal) : missing)) },
                  ],
                },
                {
                  title: 'Water bill',
                  rows: [
                    { label: 'Do nothing', cells: out.map((y) => (y.result.ok ? fmt.usd(y.result.baseCost) : missing)) },
                    { label: 'With the plan', strong: true, cells: out.map((y) => (y.result.ok ? fmt.usd(y.result.newCost) : missing)) },
                    { label: 'Saved', cells: out.map((y) => (y.result.ok ? fmt.usd(y.result.baseCost - y.result.newCost) : missing)) },
                    {
                      label: `Plan vs ${fmt.usd(target)} target`,
                      cells: out.map((y) => (y.result.ok ? `${y.result.newCost > target ? '+' : '-'}${fmt.usd(Math.abs(y.result.newCost - target))} ${y.result.newCost > target ? 'over' : 'under'}` : missing)),
                    },
                    { label: `Plan per home per month (${homes} homes)`, muted: true, cells: out.map((y) => (y.result.ok ? `$${(y.result.newCost / homes / 12).toFixed(2)}` : missing)) },
                  ],
                },
                {
                  title: 'Turf check',
                  rows: [
                    {
                      label: 'July turf water vs healthy minimum',
                      cells: out.map((y) => {
                        const r = julyRatio(y.levers)
                        return r === null ? missing : r < 1 ? <Pill tone="serious">{fmt.pct(r)}, below</Pill> : fmt.pct(r)
                      }),
                    },
                  ],
                },
              ]}
            />
            <p className="mt-3 max-w-prose text-sm text-ink-2">
              Today the park meters put about {julyRatio(null) === null ? 'an unknown share' : fmt.pct(julyRatio(null)!)} of the turf's healthy minimum on the
              turf in July. Below 100% means summer turf water is under the healthy-minimum estimate: watch the lawn and ease off the summer cut.
            </p>
          </Section>

          <Section id="by-meter" title="Bill by meter" lead="Which meter's bill changes, each year.">
            <GridTable
              caption="Water bill by meter and year"
              head={['', 'Do nothing', ...out.map((y) => String(y.year))]}
              groups={[
                {
                  rows: data.meters.map((m) => {
                    const base = y1.result.ok ? y1.result.meters.find((x) => x.meter === m.id)?.baseCost : undefined
                    return {
                      label: `${meterName(m.id)}${m.turf_share_percent?.value ? ` (${m.turf_share_percent.value}% turf)` : ''}`,
                      cells: [
                        base === undefined ? missing : fmt.usd(base),
                        ...out.map((y) => {
                          const r = y.result.ok ? y.result.meters.find((x) => x.meter === m.id) : undefined
                          return r ? fmt.usd(r.newCost) : missing
                        }),
                      ],
                    }
                  }),
                },
              ]}
            />
          </Section>
        </>
      )}

      <Section id="levers" title="The steps, year by year" lead="Edit any number to see the effect. Percents of today are what is left: 70% means 30% less water.">
        <div className="mt-4 overflow-x-auto rounded-xl bg-surface ring-1 ring-[var(--ring)]">
          <table className="w-full text-left text-sm">
            <caption className="sr-only">Quick wins steps by year</caption>
            <thead className="border-b border-line text-ink-2">
              <tr>
                <th scope="col" className="px-3 py-2 font-semibold">
                  Step
                </th>
                {plan.years.map((y) => (
                  <th key={y} scope="col" className="px-3 py-2 text-right font-semibold">
                    {y}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ORDER.map((k) => {
                const l = plan.levers[k]
                const off = keepTurf && TURF_KEYS.includes(k)
                return (
                  <tr key={k} className="border-b border-line last:border-0">
                    <th scope="row" className="min-w-[14rem] px-3 py-2 font-normal">
                      <span className="font-semibold">{l.label}</span>
                      <span className="block text-xs text-ink-2">{l.why}</span>
                    </th>
                    {plan.years.map((y, i) => (
                      <td key={y} className="px-3 py-2 text-right">
                        {k === 'stop_overseeding' ? (
                          <input
                            type="checkbox"
                            className="h-4 w-4"
                            aria-label={`${l.label}, ${y}`}
                            disabled={off}
                            checked={values[k][i] as boolean}
                            onChange={(e) => update({ ...values, [k]: values[k].map((x, j) => (j === i ? e.target.checked : x)) })}
                          />
                        ) : (
                          <span className="inline-flex items-center gap-1">
                            <input
                              type="number"
                              min={0}
                              max={100}
                              step={5}
                              inputMode="numeric"
                              aria-label={`${l.label}, ${y}, percent`}
                              disabled={off}
                              className="tabular w-16 rounded border border-line bg-surface p-1 text-right disabled:opacity-60"
                              value={values[k][i] as number}
                              onChange={(e) => {
                                const n = Math.min(100, Math.max(0, Number(e.target.value)))
                                if (!Number.isNaN(n)) update({ ...values, [k]: values[k].map((x, j) => (j === i ? n : x)) })
                              }}
                            />
                            %
                          </span>
                        )}
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
        <p className="mt-3 max-w-prose text-sm text-ink-2">
          Leak repair and the controller cut all water. The turf steps apply to each meter's turf share and the drip step to the rest. Steps multiply, so two 10% cuts
          leave 81%, not 80%. Months follow the middle of each City read period.
        </p>
      </Section>

      <Section id="costs" title={`What it costs, against the ${fmt.usd(budget.value)} budget`} lead={`Savings are for ${years[0].year}, each step on its own. Together they save less than the sum, because each step works on water another has already cut.`}>
        <GridTable
          caption="Upfront cost and first-year savings of each step"
          head={['Step', 'Upfront cost', `Saves in ${years[0].year}, alone`, '2-year payback if under', 'Notes']}
          leftCols={[4]}
          groups={[
            {
              rows: costs.map((c) => {
                const s = leverAlone[c.key]
                return {
                  label: c.label,
                  cells: [
                    c.cost === null ? <Pill tone="neutral">Needs a quote</Pill> : fmt.usd(c.cost),
                    s === null ? missing : s < 0 ? <Pill tone="serious">Costs {fmt.usd(-s)} more</Pill> : fmt.usd(s),
                    c.cost === null && s !== null && s > 0 ? fmt.usd(2 * s) : '',
                    <span className="block min-w-[12rem] max-w-[18rem] whitespace-normal text-ink-2">{c.note}</span>,
                  ],
                }
              }),
            },
            {
              rows: [
                {
                  label: 'Known so far',
                  strong: true,
                  cells: [fmt.usd(known), '', '', needQuote.length ? `${needQuote.length} still need a quote, so the total is not known yet.` : known <= budget.value ? 'Within the budget.' : 'Over the budget.'],
                },
              ],
            },
          ]}
        />
        <p className="mt-3 max-w-prose text-sm text-ink-2">
          Stopping overseeding saves a lot of winter water but {(leverAlone.overseed ?? 0) < 0 ? 'raises the bill' : 'little money'} on its own: the City sets
          each meter's lower-price allowance from December to February use, so less winter water moves more summer water to the higher price
          {prices === 'proposed' ? ', and under the 2027 prices more of it into the top tier above 1.5 times the winter average' : ''}. It pays off only when
          paired with the summer steps, as in the plan. No step is ranked on a guessed price. "2-year payback if under" is two years of that step's own savings, a ceiling to compare quotes against.
          Budget: {budget.source}.
        </p>
      </Section>

      <Section id="risks" title="Before turning water down">
        <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5">
          {!keepTurf && <li>{RISK.turf}</li>}
          <li>{RISK.unknownTrees}</li>
          <li>Step drip down a little at a time and watch the plants through one summer before the next step.</li>
        </ul>
      </Section>

      <Section id="assumptions" title="Assumptions and sources">
        <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5 text-sm">
          <li>
            Steps and their yearly values: {plan.source}. <Sure level={plan.confidence} />
          </li>
          <li>Starting point: each meter's metered use for {baseLabel}, held the same every year (no change in weather).</li>
          <li>
            Turf share of each meter's water:{' '}
            {data.meters.map((m) => `meter ${meterNumber(m.id)} ${m.turf_share_percent ? `${m.turf_share_percent.value}%` : 'unknown'}`).join(', ')}. {data.meters[0].turf_share_percent?.source}.
            {missingShare.length > 0 && ` Missing for ${missingShare.join(', ')}, treated as 0%.`}
          </li>
          {prices === 'today' ? (
            <li>
              Prices: the latest City rate on file, {rate.source}. <Sure level={rate.confidence ?? "low"} />
            </li>
          ) : (
            <li>
              Prices: {next?.source}. Usage {`$${next?.volumetric.blocks[0].price.toFixed(2)}`}, a first surcharge tier up to 1.5 times the winter average, a
              second tier above it, and a $0.13 drought charge. Recommended, not yet adopted. <Sure level={next?.confidence ?? 'low'} />
            </li>
          )}
          <li>{(model.site as unknown as { post_2027_rate_assumption: { label: string } }).post_2027_rate_assumption.label} {plan.notes}</li>
          <li>
            The City's <Term k="allowance">lower-price allowance</Term> comes from December to February use, so each year is priced as if its steps had been in place all year, including last
            winter.
          </li>
          {turf && (
            <li>
              Turf healthy minimum: {fmt.int(turf.turfAreaSqFt.value)} sq ft of turf at plant factor {turf.plantFactor.value.toFixed(2)} and {fmt.pct(turf.efficiency.value)}{' '}
              sprinkler efficiency, with average weather. See <a href="#water/by-meter-month?tab=budget" className="underline underline-offset-4">How much should we use</a>.{' '}
              <Sure level={turf.confidence} />
            </li>
          )}
        </ul>
      </Section>
    </article>
  )
}
