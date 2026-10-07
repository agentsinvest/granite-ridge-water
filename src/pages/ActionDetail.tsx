import type { SiteData } from '../../scripts/site-data'
import { LawnBadge, StatusChip, UrgentBadge, costText, savingsText, soFarText } from '../components/actions'
import { LeakFlags } from '../components/LeakFlags'
import { Markdown } from '../components/Markdown'
import { Pill, Section } from '../components/ui'
import { checkExperiment } from '../engine/experiments'
import { OWNER_LABEL, STATUS_LABEL, nextRatesText, priceActions } from '../lib/actions'
import { meterLabel } from '../lib/data'
import type { Model } from '../lib/model'
import { publicText } from '../lib/publicText'
import { controllerTitle } from './Controllers'
import { VERDICT, daysFor } from './Experiments'
import { DailyDetail } from './MetersAndAreas'

const longDate = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { dateStyle: 'medium' })

export function ActionDetail({ data, model, id }: { data: SiteData; model: Model; id: string | null }) {
  const p = priceActions(data, model).find((x) => x.action.id === id)
  if (!p) {
    return (
      <article>
        <h1 className="text-2xl font-bold">Action not found</h1>
        <p className="mt-3 text-ink-2">
          This action may have been renamed. <a href="#plan" className="underline underline-offset-4">See the full action plan</a>.
        </p>
      </article>
    )
  }
  const a = p.action
  const ref = (kind: string) => a.evidence.filter((e) => e.startsWith(`${kind}:`)).map((e) => e.slice(kind.length + 1))
  const flags = model.flags.filter((f) => ref('flag').includes(f.flag.id))
  const sources = ref('source')
  const options = ref('option').map((o) => data.options.find((x) => x.id === o)!).filter(Boolean)
  const invs = ref('investment').map((i) => data.investments.find((x) => x.id === i) as { id: string; name: string } | undefined).filter((x) => x !== undefined)
  const controller = data.controllers.find((c) => c.name === a.controller)
  const exp = data.experiments.find((x) => x.id === a.verify_experiment)
  const st = model.site.experiment_check
  const check = exp
    ? checkExperiment(daysFor(data, exp.meter), exp.start, exp.end, exp.baseline_days, exp.expected, {
        minDays: st.min_days_each_side.value, minHours: st.min_hours_per_day.value, shareOfTarget: st.share_of_target_for_success.value, noisePercent: st.noise_percent.value,
      })
    : null
  const meters = a.meter === 'all' ? [] : a.meter === 'park' ? ['meter-1', 'meter-2'] : [a.meter]
  const soFar = soFarText(p)
  const after = a.after.map((x) => data.actions.find((y) => y.id === x)!).filter(Boolean)

  return (
    <article>
      <p className="text-sm print:hidden">
        <a href="#plan" className="underline underline-offset-4">Action plan</a>
      </p>
      <h1 className="mt-2 text-2xl font-bold md:text-3xl">{a.title}</h1>
      <div className="mt-3 flex flex-wrap items-center gap-2">
        <StatusChip status={a.status} />
        <UrgentBadge urgent={a.urgent} />
        <LawnBadge impact={a.lawn_impact} />
      </div>

      <dl className="mt-5 grid gap-3 rounded-xl bg-surface p-4 text-sm ring-1 ring-[var(--ring)] sm:grid-cols-2">
        <Item term="What's wrong">{a.problem}</Item>
        <Item term="Who is handling it">{OWNER_LABEL[a.owner]}</Item>
        <Item term="Where">
          {a.meter === 'all' ? 'All meters' : meters.map((m) => meterLabel(data, m)).join(' and ')}
          {controller && (
            <>
              {', '}
              <a href={`#water/controller-${controller.id}-heading?tab=controllers`} className="underline underline-offset-4">{controllerTitle(controller)}</a>
            </>
          )}
          {a.stations.length > 0 && `, station${a.stations.length > 1 ? 's' : ''} ${a.stations.join(', ')}`}
        </Item>
        <Item term="Cost">
          {costText(a.cost)}
          <span className="block text-ink-2">{publicText(a.cost_source)}</span>
        </Item>
        <Item term="Savings">
          {savingsText(p)}
          {soFar && <span className="block">The extra water {soFar}.</span>}
          {a.savings_note && <span className="block text-ink-2">{publicText(a.savings_note)}</span>}
        </Item>
        <Item term="How we'll know it worked">{a.verify_with}</Item>
        {a.shows === 'next-rates' && nextRatesText(data, model) && <Item term="If nothing changes">{`Starting in 2027, ${nextRatesText(data, model)}`}</Item>}
        {a.due && <Item term="By">{longDate(a.due)}</Item>}
        {after.length > 0 && (
          <Item term="Do first">
            {after.map((x) => (
              <a key={x.id} href={`#action/${x.id}`} className="block underline underline-offset-4">{x.title}</a>
            ))}
          </Item>
        )}
      </dl>

      {a.body && (
        <Section id="details" title="Details">
          <div className="mt-3">
            <Markdown text={a.body} />
          </div>
        </Section>
      )}

      {exp && check && (
        <Section id="result" title="Did it work?">
          <p className="mt-3 flex flex-wrap items-center gap-2">
            <Pill tone={VERDICT[check.verdict].tone}>{VERDICT[check.verdict].text}</Pill>
            <span className="text-sm text-ink-2">
              {check.verdict === 'not_started' ? 'The check starts once the work is done and its date is recorded.' : `Checked against ${check.before.days} days before and ${check.after.days} days after.`}
            </span>
          </p>
          <p className="mt-2 text-sm">
            <a href="#calculator?tab=did-it-work" className="underline underline-offset-4">How the check works</a>
          </p>
        </Section>
      )}

      {(flags.length > 0 || meters.length === 1) && (
        <Section id="evidence" title="The evidence">
          {flags.length > 0 && <LeakFlags flags={flags} />}
          {meters.length === 1 && <DailyDetail meter={meters[0]} days={Object.values(data.usage[meters[0]] ?? {}).flat()} />}
        </Section>
      )}

      {(sources.length > 0 || options.length > 0 || invs.length > 0) && (
        <Section id="based-on" title="Based on">
          <ul className="mt-3 list-disc space-y-1 pl-5 text-sm">
            {options.map((o) => (
              <li key={o.id}>
                Savings calculator: <a href={`#calculator?tab=whatif&o=${o.id}`} className="underline underline-offset-4">{o.title}</a>
              </li>
            ))}
            {invs.map((i) => (
              <li key={i.id}>
                Equipment idea: <a href={`#calculator?tab=invest&inv=${i.id}`} className="underline underline-offset-4">{i.name}</a>
              </li>
            ))}
            {sources.map((s) => (
              <li key={s}>{data.evidenceLabels[s]}</li>
            ))}
          </ul>
        </Section>
      )}

      <Section id="history" title="History">
        <ol className="mt-3 space-y-1 text-sm">
          {[...a.history, ...(a.history.at(-1)!.status !== a.status ? [{ date: a.updated, status: a.status, note: undefined }] : [])]
            .slice()
            .reverse()
            .map((h, i) => (
              <li key={i} className="flex gap-3">
                <span className="tabular w-28 shrink-0 text-ink-2">{longDate(h.date)}</span>
                <span>
                  {STATUS_LABEL[h.status]}
                  {h.note ? `: ${publicText(h.note)}` : ''}
                </span>
              </li>
            ))}
        </ol>
      </Section>
    </article>
  )
}

function Item({ term, children }: { term: string; children: React.ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-2">{term}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  )
}
