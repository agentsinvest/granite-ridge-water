import type { SiteData } from '../../scripts/site-data'
import { winterBase, winterCutEffect, type WinterCut } from '../engine/winterBase'
import { fmt, meterName } from '../lib/data'
import type { Model } from '../lib/model'
import { GridTable, HowCalculated, Section, Stat, Stats, Term } from './ui'

const signed = (n: number) => `${n > 0 ? '+' : n < 0 ? '-' : ''}$${Math.abs(n).toFixed(2)}`
const cutText = (c: WinterCut | null) => (c ? `${signed(c.net)} a year` : 'Not enough data')

/** Problems: the summer surcharge, and how each meter's December to February use sets it for the next twelve months. */
export function WinterBaseSection({ data, model }: { data: SiteData; model: Model }) {
  const rate = model.latestRate
  const rows = rate
    ? model.meters.map((m) => ({
        meter: m,
        wb: winterBase(m, model.periods[m], rate.included_kgal_per_bill.value, model.nextRate),
        today: winterCutEffect(m, model.baseline[m], rate),
        next: model.nextRate ? winterCutEffect(m, model.baseline[m], model.nextRate) : null,
      }))
    : []
  const ok = rows.filter((r) => r.wb !== null)
  const lead =
    'The City bills each meter at a lower price up to its winter base: the average of its December, January, and February bills. Every 1,000 gallons above that base costs more, for the next twelve months.'

  if (!rate || ok.length === 0) {
    return (
      <Section id="surcharge" title="Summer surcharge set by winter use" lead={lead}>
        <p className="mt-3 text-ink-2">Not enough winter bills on file yet to work out each meter's winter base.</p>
      </Section>
    )
  }

  const first = ok[0].wb!
  const winterYear = Number(first.winter[2].end.slice(0, 4))
  const sinceLabel = first.since.length ? fmt.month(first.since[0].end) : null
  const used = ok.reduce((s, r) => s + r.wb!.since.reduce((t, p) => t + (p.usage ?? 0), 0), 0)
  const above = ok.reduce((s, r) => s + r.wb!.kgalAbove, 0)
  const times = ok.map((r) => r.wb!.peak?.times ?? 0)
  const [lo, hi] = [Math.min(...times), Math.max(...times)]

  // Peak surcharge paid by year, from the bill history. Only years with every meter on file are summed.
  const h = data.meterYears
  const years = h ? [...new Set(h.rows.map((r) => r.year))].sort() : []
  const yearTotal = (y: number) => {
    const vals = data.meters.map((m) => h!.rows.find((r) => r.year === y && r.meter === m.id)?.peakSurcharge ?? null)
    return vals.some((v) => v === null) ? null : (vals as number[]).reduce((a, b) => a + b, 0)
  }
  const latestYear = years.at(-1) ?? null
  const latestPartial = latestYear !== null && h!.rows.some((r) => r.year === latestYear && !r.complete)
  const priorYear = latestPartial ? (years.at(-2) ?? null) : null
  const latestPaid = latestYear !== null ? yearTotal(latestYear) : null
  const priorPaid = priorYear !== null ? yearTotal(priorYear) : null

  const tiered = ok.some((r) => r.wb!.tier2Kgal !== null)
  const tierRow = ok.find((r) => r.wb!.tier2Kgal !== null && r.wb!.averageKgal > 0)
  const tierMultiple = tierRow ? Math.round((tierRow.wb!.tier2Kgal! / tierRow.wb!.averageKgal) * 100) / 100 : null
  const nextStart = model.nextRate?.effective_start ? String(model.nextRate.effective_start instanceof Date ? model.nextRate.effective_start.toISOString() : model.nextRate.effective_start).slice(0, 10) : null
  const nextLabel = nextStart ? fmt.month(nextStart) : 'next year'
  // The next winter base prices bills from March of the following year; say so only when the new prices start by then.
  const nextBaseUnderNewPrices = tierMultiple !== null && nextStart !== null && nextStart <= `${winterYear + 1}-03-31`
  const included = fmt.int(rate.included_kgal_per_bill.value * 1000)
  const example = ok.find((r) => r.today && r.today.net > 0)
  const head = [
    'Meter',
    'Winter base (a month)',
    'Busiest month',
    'Times the base',
    'Months above base',
    'Water above base',
    ...(tiered ? [`Top tier from ${nextLabel} (a month)`] : []),
    'Winter cut, today',
    ...(model.nextRate ? [`Winter cut, ${nextLabel} prices`] : []),
  ]
  const blank = (n: number) => Array.from({ length: n }, () => '')
  return (
    <Section
      id="surcharge"
      title="Summer surcharge set by winter use"
      lead={
        <>
          {lead} In the busiest month since {sinceLabel ?? 'March'}, the meters used {lo.toFixed(1)} to {hi.toFixed(1)} times their winter base, so most summer water
          pays the <Term k="higher">higher price</Term>.
        </>
      }
    >
      <Stats>
        {latestPaid !== null && (
          <Stat value={fmt.usd(latestPaid)} label={`extra paid above the winter base in ${latestYear}${latestPartial ? ' so far' : ''}`} flag />
        )}
        {priorPaid !== null && <Stat value={fmt.usd(priorPaid)} label={`extra paid above the winter base in ${priorYear}`} />}
        {used > 0 && <Stat value={fmt.pct(above / used)} label={`of the water since ${sinceLabel} was above the winter base`} flag />}
      </Stats>

      <GridTable
        caption="Each meter's winter base, and how its use since March compares"
        head={head}
        groups={[
          {
            rows: rows.map((r) => ({
              label: meterName(r.meter, 'name'),
              muted: r.wb === null,
              cells:
                r.wb === null
                  ? ['Winter bills missing', ...blank(head.length - 2)]
                  : [
                      fmt.gallons(r.wb.averageKgal),
                      r.wb.peak ? `${fmt.gallons(r.wb.peak.kgal)} (${fmt.month(r.wb.peak.end)})` : 'None yet',
                      r.wb.peak ? `${r.wb.peak.times.toFixed(1)}x` : '',
                      `${r.wb.periodsAbove} of ${r.wb.since.length}`,
                      fmt.gallons(r.wb.kgalAbove),
                      ...(tiered ? [r.wb.tier2Kgal === null ? '' : fmt.gallons(Math.round(r.wb.tier2Kgal))] : []),
                      cutText(r.today),
                      ...(model.nextRate ? [cutText(r.next)] : []),
                    ],
            })),
          },
        ]}
      />
      <p className="mt-2 max-w-prose text-sm text-ink-2">
        Winter base is each meter's December to February average. Busiest month and water above base count the bills since {sinceLabel ?? 'March'}. Winter cut is the
        change in a year's bills from using 1,000 fewer gallons a month in December, January, and February; a plus sign means the year costs more.
      </p>

      <h3 className="mt-6 font-semibold">What this means for us</h3>
      <ul className="mt-2 max-w-prose list-disc space-y-2 pl-5 text-sm">
        <li>
          <strong>This winter sets next year's prices.</strong> The bills read in December {winterYear}, January {winterYear + 1}, and February {winterYear + 1} set each
          meter's winter base for every bill from March {winterYear + 1} to February {winterYear + 2}.
          {nextBaseUnderNewPrices && (
            <>
              {' '}
              Those are also the first bills under the City's recommended two-tier surcharge, where water above {tierMultiple} times the winter base costs even more.{' '}
              <a href="#action/track-2027-rates" className="underline underline-offset-4">
                Follow the vote on the new rates
              </a>
              .
            </>
          )}
        </li>
        {example?.today && (
          <li>
            <strong>Cutting winter water by itself can raise the bill.</strong> On {meterName(example.meter, 'name')}, using 1,000 fewer gallons a month from December to
            February saves about {`$${example.today.winterSaved.toFixed(2)}`} on those winter bills, but lowers the winter base, so the rest of the year's bills go up
            about {`$${example.today.restAdded.toFixed(2)}`}. A winter cut, including skipping or trimming overseeding, saves money only when summer use comes down too.{' '}
            <a href="#action/overseeding-decision" className="underline underline-offset-4">
              See the overseeding decision
            </a>
            .
          </li>
        )}
        <li>
          <strong>The surcharge comes down when summer use comes closer to the winter base.</strong> Summer cuts and leak repairs save at the higher price, which is why they
          are worth the most.{' '}
          <a href="#calculator?tab=whatif" className="underline underline-offset-4">
            Try it in the savings calculator
          </a>
          .
        </li>
      </ul>

      <HowCalculated>
        <p>
          The winter base is the average of the meter's three read periods ending in December, January, and February, rounded to the nearest 1,000 gallons. The first {included}{' '}
          gallons of each bill carry no usage charge, so the lower price covers the base minus {included} gallons. This rule is worked out from the bills and reproduces the
          usage charge on the bills on file to the cent; the City has not confirmed it in writing.
        </p>
        <p>
          "Water above the base" adds up each month's use above the winter base since {sinceLabel ?? 'March'}. The yearly change from a winter cut prices the latest twelve
          months of use twice, as is and with 1,000 fewer gallons in each December, January, and February bill, each with its own winter base, including service charges,
          fees, and taxes. A plus sign means the year costs more. The extra paid by year comes from the bill history.
        </p>
        <p>
          <a href="#history/surcharge-heading?tab=how" className="underline underline-offset-4">
            See the surcharge month by month
          </a>
          .
        </p>
      </HowCalculated>
    </Section>
  )
}
