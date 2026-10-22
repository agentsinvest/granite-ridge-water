import { useMemo, useState } from 'react'
import type { SiteData } from '../../scripts/site-data'
import { Bars, METER_COLOR } from '../components/charts'
import { Card, Empty, GridTable, HowCalculated, PageHeader, Section, Stat, Stats, Sure, TableView } from '../components/ui'
import { billInches, lawnFactor, netInches, runNeedModel, runTodaysPace, seedingInches, type ModelBill, type NeedResult } from '../engine/needModel'
import type { RatePeriod, ReadPeriod } from '../engine/billing'
import { fmt, meterName } from '../lib/data'
import { needSetup, type CaseId } from '../lib/needModel'
import { setQuery } from '../lib/route'

const MONTH = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
const MONTH_LONG = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December']
const billLabel = (b: { year: number; month: number }) => `${MONTH[b.month - 1]} ${b.year}`
const covers = (b: { start: string; end: string }) => `${fmt.day(b.start)} to ${fmt.day(b.end)}`
const gal = (kgal: number) => `${fmt.int(Math.round(kgal * 1000))}`
const usd = (n: number) => fmt.usd(n)
const usd2 = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', minimumFractionDigits: 2 })
const surcharge = (s: { tier1: number; tier2: number }) => s.tier1 + s.tier2

export function NextYear({ data, query }: { data: SiteData; query: URLSearchParams }) {
  const [caseId, setCaseId] = useState<CaseId>(query.get('case') === 'cautious' ? 'cautious' : 'lean')
  const setup = useMemo(() => needSetup(data), [data])
  const nm = data.needModel
  const rates = data.rates as unknown as RatePeriod[]
  const history = useMemo(() => Object.fromEntries(Object.entries(data.billingPeriods).map(([m, p]) => [m, p.rows as ReadPeriod[]])), [data])
  const runs = useMemo(() => {
    if ('missing' in setup) return null
    return {
      lean: runNeedModel(setup.inputs, setup.cases.lean, rates, history),
      cautious: runNeedModel(setup.inputs, setup.cases.cautious, rates, history),
      today: runTodaysPace(setup.inputs, rates, history),
    }
  }, [setup, rates, history])
  const homes = (data.config.site as { homes?: { value: number } }).homes?.value ?? null

  const header = (
    <PageHeader
      title="Next year: the water we need and what it will cost"
      lead="How much water the landscape actually needs for each of the next 12 City bills, worked out from the weather and the plants rather than from past bills, and what each bill will cost."
    />
  )
  if (!nm || 'missing' in setup || !runs) {
    return (
      <article>
        {header}
        <Empty>This estimate can't be shown yet. Missing: {'missing' in setup ? setup.missing.join(', ') : 'the model inputs'}.</Empty>
      </article>
    )
  }
  const errors = [runs.lean, runs.cautious, runs.today].flatMap((r) => ('error' in r ? [r.error] : []))
  if (errors.length) {
    return (
      <article>
        {header}
        <Empty>This estimate can't be worked out right now: {errors[0]}.</Empty>
      </article>
    )
  }
  const lean = runs.lean as NeedResult
  const cautious = runs.cautious as NeedResult
  const today = runs.today as NeedResult
  const run = caseId === 'lean' ? lean : cautious
  const c = nm.cases[caseId]
  const first = run.bills[0]
  const last = run.bills.at(-1)!
  const choose = (id: CaseId) => {
    setCaseId(id)
    setQuery({ case: id === 'lean' ? null : id })
  }
  const futureRate = run.bills.map((b) => b.rate).at(-1)!
  const blocks = [...futureRate.volumetric.blocks].sort((a, b) => a.block - b.block)

  return (
    <article>
      {header}

      <Card className="mt-6">
        <p className="max-w-prose">
          <strong>What this covers:</strong> the 12 bills ending {billLabel(first)} to {billLabel(last)}. The park lawn is overseeded with winter rye. The
          entry is artificial turf, so it gets no water. Normal weather. {nm.rates_note}
        </p>
      </Card>

      <fieldset className="mt-6">
        <legend className="font-semibold">Show the estimate for</legend>
        <div className="mt-2 grid gap-3 sm:grid-cols-2">
          {(['lean', 'cautious'] as const).map((id) => (
            <label key={id} className={`flex cursor-pointer gap-3 rounded-xl bg-surface p-4 ring-1 ${caseId === id ? 'ring-2 ring-[var(--focus)]' : 'ring-[var(--ring)]'}`}>
              <input type="radio" name="case" className="mt-1 size-4" checked={caseId === id} onChange={() => choose(id)} />
              <span>
                <span className="font-semibold">
                  {nm.cases[id].label}: {fmt.gallons((id === 'lean' ? lean : cautious).kgal)}, {usd((id === 'lean' ? lean : cautious).total)}
                </span>
                <span className="mt-1 block text-sm text-ink-2">{nm.cases[id].description}</span>
              </span>
            </label>
          ))}
        </div>
      </fieldset>

      <Stats>
        <Stat value={fmt.gallons(run.kgal)} label="water the landscape needs over 12 bills" />
        <Stat value={usd(run.total)} label="the 12 City bills" />
        <Stat value={homes ? usd2(run.total / homes / 12) : 'Missing'} label="per home per month" />
        <Stat value={fmt.pct(1 - run.kgal / today.kgal)} label={`less water than last year's pace (${fmt.gallons(today.kgal)}, ${usd(today.total)})`} good />
      </Stats>

      <Section id="monthly" title="Bill by bill" lead="Water needed on each bill and what the bill will cost, all four meters together.">
        <Bars
          data={run.bills.map((b, i) => ({ month: billLabel(b), need: b.kgal, today: today.bills[i].kgal }))}
          x="month"
          series={[
            { key: 'today', name: "Last year's water", color: 'var(--s3)' },
            { key: 'need', name: 'What the landscape needs', color: 'var(--s1)' },
          ]}
          label="Thousand gallons on each bill: last year's water next to what the landscape needs"
          format={(v) => `${fmt.int(Math.round(v * 1000))} gallons`}
        />
        <GridTable
          caption="Water needed and cost, bill by bill"
          head={['Bill ending', 'Covers about', 'Gallons needed', 'At the lower price', 'At a surcharge', 'Bill']}
          leftCols={[1]}
          groups={[
            {
              rows: [
                ...run.bills.map((b) => ({
                  label: billLabel(b),
                  cells: [covers(b), gal(b.kgal), gal(b.slices.included + b.slices.base), gal(surcharge(b.slices)), usd(b.total)],
                })),
                {
                  label: '12 bills',
                  strong: true,
                  cells: ['', gal(run.kgal), gal(run.slices.included + run.slices.base), gal(surcharge(run.slices)), usd(run.total)],
                },
              ],
            },
          ]}
        />
        <p className="mt-3 max-w-prose text-sm text-ink-2">
          "At the lower price" includes the first {fmt.int(futureRate.included_kgal_per_bill.value * 1000)} gallons on each meter's bill, which have no usage
          charge. "At a surcharge" is water above the meter's winter average; the next section explains why that is most of the summer water.
        </p>
      </Section>

      <Section id="winter" title="Why winter water sets the price all year" lead="The City sets each meter's lower-price amount from its December, January, and February bills.">
        <div className="mt-4 grid gap-3 md:grid-cols-2">
          {Object.keys(run.byMeter).map((m) => {
            const lastWinter = run.bills[0].meters.find((x) => x.meter === m)!.winterAverageKgal
            const later = run.bills.find((b) => b.month === 3)?.meters.find((x) => x.meter === m)?.winterAverageKgal ?? null
            return (
              <Card key={m}>
                <p className="font-semibold">{meterName(m, 'name')}</p>
                <p className="mt-1 text-sm text-ink-2">
                  Winter average: <strong className="text-ink">{gal(lastWinter)} gallons</strong> a bill last winter
                  {later !== null && (
                    <>
                      , about <strong className="text-ink">{gal(later)}</strong> this winter if watered to need
                    </>
                  )}
                  .
                </p>
              </Card>
            )
          })}
        </div>
        <div className="mt-4 max-w-prose space-y-2 text-sm text-ink-2">
          <p>
            From the bill ending {billLabel(run.bills.find((b) => b.rate === futureRate)!)}, each meter pays{' '}
            <strong className="text-ink">{usd2(blocks[0].price)}</strong> per 1,000 gallons up to its winter average,{' '}
            {blocks.length > 2 ? (
              <>
                <strong className="text-ink">{usd2(blocks[1].price)}</strong> up to 1.5 times the average, and <strong className="text-ink">{usd2(blocks[2].price)}</strong> above that
              </>
            ) : (
              <>
                <strong className="text-ink">{usd2(blocks[1].price)}</strong> above it
              </>
            )}
            , plus the drought charge and tax.
          </p>
          <p>
            Watering only to need in winter keeps the winter averages low, so most spring and summer water pays a surcharge. Over the 12 bills, about{' '}
            {fmt.pct(surcharge(run.slices) / run.kgal)} of the water is above the winter average. The desert drip meters need almost no winter water, so nearly all
            of their summer water pays the top price.
          </p>
        </div>
      </Section>

      <Section id="meters" title="By meter" lead="Each meter is billed on its own. Gallons and cost over the 12 bills.">
        <GridTable
          caption="Water needed and cost by meter"
          head={['Meter', 'Gallons needed', "Last year's water", 'Cost', "Last year's water at these prices"]}
          groups={[
            {
              rows: [
                ...Object.entries(run.byMeter).map(([m, v]) => ({
                  label: meterName(m, 'name'),
                  cells: [gal(v.kgal), gal(today.byMeter[m].kgal), usd(v.total), usd(today.byMeter[m].total)],
                })),
                { label: 'All meters', strong: true, cells: [gal(run.kgal), gal(today.kgal), usd(run.total), usd(today.total)] },
              ],
            },
          ]}
        />
        <MeterDetail bills={run.bills} />
      </Section>

      <Section id="method" title="How we worked it out" lead="Five steps, from the weather to the bill. Every number comes from the data on file.">
        <ol className="mt-4 max-w-prose list-decimal space-y-3 pl-5">
          <li>
            <strong>Weather demand.</strong> How many inches of water the heat, sun, and wind pull out of a lawn each month, and the average rain. A City bill
            runs from the middle of one month to the middle of the next, so each bill uses the average of those two months.
          </li>
          <li>
            <strong>What each plant needs.</strong> A plant factor scales that demand to the plant. For the {c.label.toLowerCase()} estimate: Bermuda lawn{' '}
            {c.bermuda_plant_factor.value}, winter rye {c.rye_plant_factor.value} ({nm.rye_months.map((m) => MONTH[m - 1]).join(', ')}), {c.seeding_weeks.value}{' '}
            weeks of seeding at {c.seeding_plant_factor.value} in {MONTH_LONG[nm.seeding_month - 1]}, and desert plants {c.desert_plant_factor.value}.
          </li>
          <li>
            <strong>Rain.</strong> {fmt.pct(nm.rain_share.value)} of each month's average rain counts as water the plants can use, and is subtracted.
          </li>
          <li>
            <strong>Inches to gallons.</strong> One inch over one square foot is 0.623 gallons. The lawn is {fmt.int(c.turf_area_sq_ft.value)} square feet,
            split between the two park meters. Sprinklers and drip lose some water, so the need is divided by their efficiency ({c.turf_efficiency.value} for
            the lawn, {c.drip_efficiency.value} for drip).
            {c.cap_drip_at_current_use && ' Drip is never set above the drip part of what each meter uses today.'}
          </li>
          <li>
            <strong>The City's prices.</strong> Each meter's bill gets a service charge, a monthly fee, the drought and Superfund charges, and tax. Water is priced
            in steps set by the meter's winter average, as above. The modeled December to February bills set the winter average for March on.
          </li>
        </ol>
        <WorkedExample run={run} setup={setup} caseId={caseId} />
      </Section>

      <Section id="assumptions" title="What we assumed" lead="Each value, where it comes from, and how sure we are.">
        <dl className="mt-4 divide-y divide-line rounded-xl bg-surface ring-1 ring-[var(--ring)]">
          {(
            [
              ['Lawn area', `${fmt.int(c.turf_area_sq_ft.value)} sq ft`, c.turf_area_sq_ft],
              ['Bermuda lawn plant factor', String(c.bermuda_plant_factor.value), c.bermuda_plant_factor],
              ['Winter rye plant factor', String(c.rye_plant_factor.value), c.rye_plant_factor],
              ['Weeks of seeding water', String(c.seeding_weeks.value), c.seeding_weeks],
              ['Sprinkler efficiency', String(c.turf_efficiency.value), c.turf_efficiency],
              ['Desert plant factor', String(c.desert_plant_factor.value), c.desert_plant_factor],
              ['Drip efficiency', String(c.drip_efficiency.value), c.drip_efficiency],
              ['Share of rain plants use', fmt.pct(nm.rain_share.value), nm.rain_share],
            ] as const
          )
            .map(([what, v, s]): { what: string; v: string; source: string; confidence: string } => ({ what, v, source: s.source, confidence: s.confidence }))
            .concat(
              nm.meters.map((m) => ({
                what: meterName(m.meter, 'name'),
                v: `${m.turfShare ? `${fmt.pct(m.turfShare)} of the lawn, ` : ''}${m.desertSqFt === null ? 'desert area missing' : `${fmt.int(m.desertSqFt)} sq ft of desert`}`,
                source: m.source,
                confidence: m.confidence,
              })),
            )
            .map((a) => (
              <div key={a.what} className="p-4">
                <dt className="font-semibold">
                  {a.what}: <span className="tabular">{a.v}</span>
                </dt>
                <dd className="mt-1 text-sm text-ink-2">
                  {a.source} <Sure level={a.confidence} />
                </dd>
              </div>
            ))}
        </dl>
        <p className="mt-3 text-sm text-ink-2">
          Weather: {data.monthlyNormals?.etoSource}; rain: {data.monthlyNormals?.rainSource}. Overall: <Sure level={nm.confidence} />.
        </p>
      </Section>

      <Section id="not-included" title="What is not in these numbers">
        <ul className="mt-3 max-w-prose list-disc space-y-2 pl-5">
          <li>
            <strong>Leaks.</strong> Need assumes no leaks. A valve that sticks open, like meter 4's in fall 2026, adds water on top, all of it at the top price.
          </li>
          <li>
            <strong>Watering through rain.</strong> Need subtracts average rain. Any watering during or right after rain is extra.
          </li>
          <li>
            <strong>A dry year.</strong> These numbers use average rain. A dry year like 2020 needs more water.
          </li>
          <li>
            <strong>The landscaper's overseed charge,</strong> which is not on the City bill.
          </li>
        </ul>
        <HowCalculated title="What would make this estimate firmer">
          <p>{data.needModel?.todo}</p>
        </HowCalculated>
      </Section>
    </article>
  )
}

function MeterDetail({ bills }: { bills: ModelBill[] }) {
  const meters = bills[0].meters.map((m) => m.meter)
  return (
    <>
      <Bars
        data={bills.map((b) => ({ month: billLabel(b), ...Object.fromEntries(b.meters.map((m) => [m.meter, m.kgal])) }))}
        x="month"
        stacked
        series={meters.map((m) => ({ key: m, name: meterName(m, 'name'), color: METER_COLOR[m] ?? 'var(--s4)' }))}
        label="Thousand gallons needed on each bill, by meter"
        format={(v) => `${fmt.int(Math.round(v * 1000))} gallons`}
      />
      {meters.map((m) => (
        <TableView
          key={m}
          caption={`${meterName(m, 'name')}: each bill`}
          head={[meterName(m, 'name'), 'Gallons', 'Winter average', 'Lower price', 'Surcharge tier 1', 'Surcharge tier 2', 'Bill']}
          rows={bills.map((b) => {
            const x = b.meters.find((y) => y.meter === m)!
            return [billLabel(b), gal(x.kgal), gal(x.winterAverageKgal), gal(x.slices.included + x.slices.base), gal(x.slices.tier1), gal(x.slices.tier2), usd2(x.total)]
          })}
        />
      ))}
    </>
  )
}

function WorkedExample({ run, setup, caseId }: { run: NeedResult; setup: Exclude<ReturnType<typeof needSetup>, { missing: string[] }>; caseId: CaseId }) {
  const { inputs } = setup
  const c = setup.cases[caseId]
  const bill = run.bills.find((b) => b.month === 7) ?? run.bills[Math.floor(run.bills.length / 2)]
  const mb = bill.meters.find((m) => m.turfKgal > 0) ?? bill.meters[0]
  const mi = inputs.meters.find((m) => m.meter === mb.meter)!
  const prev = bill.month === 1 ? 12 : bill.month - 1
  const lawn = lawnFactor(inputs, c)
  const lawnIn = billInches(inputs, bill.month, lawn) + seedingInches(inputs, c, bill.year, bill.month)
  const dripIn = billInches(inputs, bill.month, () => c.desertPlantFactor)
  const blocks = [...bill.rate.volumetric.blocks].sort((a, b) => a.block - b.block)
  const r1 = (x: number) => x.toFixed(2)
  return (
    <Card className="mt-6">
      <p className="font-semibold">
        Worked example: {meterName(mb.meter, 'name')}, bill ending {billLabel(bill)}
      </p>
      <ul className="mt-3 space-y-2 text-sm">
        <li>
          <strong>Lawn:</strong> {MONTH_LONG[prev - 1]} {r1(netInches(inputs, prev, lawn(prev)))} in and {MONTH_LONG[bill.month - 1]}{' '}
          {r1(netInches(inputs, bill.month, lawn(bill.month)))} in after rain, average {r1(lawnIn)} in. {r1(lawnIn)} x 0.623 x{' '}
          {fmt.int(Math.round(c.turfAreaSqFt * mi.turfShare))} sq ft / {c.turfEfficiency} = <strong>{gal(mb.turfKgal)} gallons</strong>.
        </li>
        <li>
          <strong>Desert drip:</strong> average {r1(dripIn)} in. {r1(dripIn)} x 0.623 x {fmt.int(mi.desertSqFt)} sq ft / {c.dripEfficiency} ={' '}
          <strong>{gal(mb.dripKgal)} gallons</strong>
          {c.capDripAtCurrentUse && ' (or the drip part of last year\'s use, if lower)'}.
        </li>
        <li>
          <strong>Total:</strong> {gal(mb.kgal)} gallons. Winter average {gal(mb.winterAverageKgal)}.
        </li>
        <li>
          <strong>Price steps:</strong> {gal(mb.slices.included)} included; {gal(mb.slices.base)} at {usd2(blocks[0].price)}; {gal(mb.slices.tier1)} at{' '}
          {usd2(blocks[1].price)}
          {blocks[2] && (
            <>
              ; {gal(mb.slices.tier2)} at {usd2(blocks[2].price)}
            </>
          )}{' '}
          per 1,000 gallons.
        </li>
      </ul>
      <TableView caption="Worked example bill lines" head={['Line', 'Amount']} rows={mb.lineItems.map((l) => [l.name, usd2(l.amount)]).concat([['Bill', usd2(mb.total)]])} />
    </Card>
  )
}
