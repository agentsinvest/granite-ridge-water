import type { SiteData } from '../../scripts/site-data'
import type { RainCheck } from '../lib/rainCheck'
import { rainSummaryText } from './WateringAfterRain'
import { Card, Pill, Sure } from './ui'

const STATUS: Record<string, string> = { 'not-started': 'Not started', 'in-progress': 'In progress', done: 'Done', dropped: 'Dropped' }
const date = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })

/** Recommended moves that change how the system is run, with the rain check as their evidence. */
export function RainActions({ data, rc }: { data: SiteData; rc: RainCheck | null }) {
  if (data.actions.length === 0) return <p className="mt-3 text-ink-2">No changes of this kind on file.</p>
  return (
    <ol className="mt-4 space-y-3">
      {data.actions.map((a) => {
        const worked = rc ? rc.checks.filter((e) => rc.actionWorking.has(e.start)) : []
        return (
          <li key={a.id}>
            <Card>
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div className="min-w-0">
                  <h3 className="text-lg font-bold">{a.title}</h3>
                  <p className="mt-1 text-sm text-ink-2">
                    {a.controller} controller · Done by: {a.owner} · Lawn impact: {a.lawn_impact}
                  </p>
                </div>
                <dl className="grid grid-cols-2 gap-x-6 gap-y-1 text-right">
                  <div className="flex flex-col">
                    <dt className="order-2 text-xs text-ink-2">status</dt>
                    <dd className="order-1 text-xl font-bold">{STATUS[a.status] ?? a.status}</dd>
                  </div>
                  <div className="flex flex-col">
                    <dt className="order-2 text-xs text-ink-2">cost</dt>
                    <dd className="order-1 text-xl font-bold">{a.cost === 'needs quote' ? 'Quote' : a.cost}</dd>
                  </div>
                </dl>
              </div>
              <p className="mt-3 max-w-prose">{a.why}</p>
              {rc && rc.rainDays > 0 && <p className="mt-2 max-w-prose text-sm text-ink-2">{rainSummaryText(rc)}</p>}
              <ol className="mt-3 list-decimal space-y-2 pl-5 text-sm">
                {a.steps.map((s) => (
                  <li key={s.title}>
                    <span className="font-semibold">{s.title}.</span> <span className="text-ink-2">{s.detail}</span>
                  </li>
                ))}
              </ol>
              <dl className="mt-3 space-y-2 text-sm">
                <div>
                  <dt className="inline font-semibold">How we will know it worked: </dt>
                  <dd className="inline text-ink-2">{a.verify_with.charAt(0).toUpperCase() + a.verify_with.slice(1)}.</dd>
                </div>
                <div>
                  <dt className="inline font-semibold">So far: </dt>
                  <dd className="inline">
                    {!a.start_date
                      ? <span className="text-ink-2">Not done yet, so there is nothing to check.</span>
                      : worked.length
                        ? <Pill tone="good">Worked after {worked.map((e) => date(e.start)).join(', ')}</Pill>
                        : <span className="text-ink-2">Done {date(a.start_date)}. Waiting for the next rain of {a.verify_min_inches} in or more.</span>}
                  </dd>
                </div>
                <div>
                  <dt className="inline font-semibold">How sure: </dt>
                  <dd className="inline"><Sure level={a.confidence} /></dd>
                </div>
              </dl>
              <p className="mt-3 text-sm">
                <a href="#meters/watering-after-rain" className="font-semibold underline underline-offset-4">See every rain event</a>
              </p>
            </Card>
          </li>
        )
      })}
    </ol>
  )
}
