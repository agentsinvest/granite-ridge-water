import type { SiteData } from '../../scripts/site-data'
import { costText } from '../components/actions'
import { controllerTitle } from './Controllers'

type Action = SiteData['actions'][number]

/** One page the landscaper can print and tick off: every open action they own, by controller and station. */
export function Checklist({ data }: { data: SiteData }) {
  const mine = data.actions.filter((a) => a.owner === 'Landscaper' && ['not-started', 'asked', 'scheduled'].includes(a.status))
  const groups = [
    ...['Park', 'Entrance', 'B'].map((name) => {
      const c = data.controllers.find((x) => x.name === name)
      return { key: name, title: c ? controllerTitle(c) : `${name} controller`, items: mine.filter((a) => a.controller === name) }
    }),
    { key: 'other', title: 'Other', items: mine.filter((a) => !a.controller) },
  ].filter((g) => g.items.length > 0)
  const where = (a: Action) => (a.stations.length ? `Station${a.stations.length > 1 ? 's' : ''} ${a.stations.join(', ')}` : 'Whole controller')
  const today = new Date().toLocaleDateString('en-US', { dateStyle: 'medium' })

  return (
    <article className="checklist">
      <header className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Landscaper checklist</h1>
          <p className="mt-1 text-ink-2">Granite Ridge HOA common areas. Printed {today}.</p>
        </div>
        <button type="button" onClick={() => window.print()} className="rounded-lg px-3 py-2 font-semibold ring-2 ring-[var(--focus)] print:hidden">
          Print
        </button>
      </header>
      <p className="mt-3 max-w-prose text-sm">Tick each item when it is done and write the date. Please return a copy to the HOA, or tell Trestle what was done.</p>
      {groups.length === 0 && <p className="mt-6 text-ink-2">Nothing open for the landscaper right now.</p>}
      {groups.map((g) => (
        <section key={g.key} aria-labelledby={`cl-${g.key}`} className="mt-6 break-inside-avoid-page">
          <h2 id={`cl-${g.key}`} className="border-b-2 border-ink pb-1 text-lg font-bold">
            {g.title}
          </h2>
          <ul className="mt-2">
            {[...g.items]
              .sort((a, b) => where(a).localeCompare(where(b)))
              .map((a) => (
                <li key={a.id} className="flex gap-3 border-b border-line py-3 break-inside-avoid">
                  <input type="checkbox" aria-label={`Done: ${a.title}`} className="mt-1 h-5 w-5 shrink-0" />
                  <div className="min-w-0 flex-1 text-sm">
                    <p className="text-xs font-semibold uppercase tracking-wide text-ink-2">{where(a)}</p>
                    <p className="font-semibold">{a.title}</p>
                    <p className="mt-1">{a.problem}</p>
                    <p className="mt-1 text-ink-2">Done means: {a.verify_with}</p>
                    {a.cost === 'needs quote' && <p className="mt-1 text-ink-2">{costText(a.cost)}: please send a price before doing the work.</p>}
                    <p className="mt-2">Date done: ____________ Notes: ______________________________</p>
                  </div>
                </li>
              ))}
          </ul>
        </section>
      ))}
    </article>
  )
}
