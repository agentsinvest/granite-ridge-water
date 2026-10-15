import type { SiteData } from '../../scripts/site-data'
import { fmt } from '../lib/data'
import { Markdown } from './Markdown'

type Problem = SiteData['landscapeProblems'][number]

const STATUS_TEXT: Record<Problem['status'], string> = {
  open: 'Not raised yet',
  asked: 'Raised, waiting on an answer',
  resolved: 'Resolved',
}

export const activeLandscapeProblems = (data: SiteData) => data.landscapeProblems.filter((p) => p.status !== 'resolved')

/** Landscape costs and problems, in rank order. Not leaks. */
export function LandscapeProblems({ data }: { data: SiteData }) {
  const problems = activeLandscapeProblems(data)
  if (problems.length === 0) return <p className="mt-3 text-ink-2">No open landscape problems right now.</p>
  return (
    <ul className="mt-4 space-y-4">
      {problems.map((p) => (
        <Card key={p.id} p={p} data={data} />
      ))}
    </ul>
  )
}

function Card({ p, data }: { p: Problem; data: SiteData }) {
  const headingId = `landscape-${p.id}-heading`
  const action = p.action ? data.actions.find((a) => a.id === p.action) : undefined
  const flags = p.related_flags.map((id) => data.flags.find((f) => f.id === id)).filter((f) => f != null)
  return (
    <li id={`landscape-${p.id}`} aria-labelledby={headingId} className="scroll-mt-6 rounded-xl border-l-4 border-serious bg-surface p-5 ring-1 ring-[var(--ring)]">
      <p className="flex flex-wrap items-center gap-x-3 gap-y-1 text-sm">
        <span className="inline-flex items-center gap-1.5 rounded-md border-2 border-serious px-2 py-0.5 font-semibold">
          <span aria-hidden="true">!</span>
          {STATUS_TEXT[p.status]}
        </span>
      </p>
      <h3 id={headingId} className="mt-3 text-lg font-bold">
        {p.title}
      </h3>
      <p className="mt-3 max-w-prose">{p.summary}</p>
      {p.paid.length > 0 && (
        <table className="mt-3 text-sm">
          <caption className="sr-only">What the HOA paid</caption>
          <thead>
            <tr className="text-left text-ink-2">
              <th scope="col" className="pr-6 font-semibold">Period</th>
              <th scope="col" className="text-right font-semibold">Paid</th>
            </tr>
          </thead>
          <tbody>
            {p.paid.map((x) => (
              <tr key={x.period}>
                <td className="pr-6">{x.period}</td>
                <td className="text-right font-semibold tabular-nums">{fmt.usd(x.amount)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
      {p.body && (
        <div className="mt-3 max-w-prose text-sm text-ink-2">
          <Markdown text={p.body} />
        </div>
      )}
      {(action || flags.length > 0) && (
        <dl className="mt-4 space-y-2 text-sm">
          {action && (
            <div>
              <dt className="inline font-semibold">What we are doing: </dt>
              <dd className="inline">
                <a href={`#action/${action.id}`} className="underline underline-offset-4">
                  {action.title}
                </a>
              </dd>
            </div>
          )}
          {flags.length > 0 && (
            <div>
              <dt className="inline font-semibold">Related leaks: </dt>
              <dd className="inline">
                {flags.map((f, i) => (
                  <span key={f.id}>
                    {i > 0 && '; '}
                    <a href={`#problems/${f.id}`} className="underline underline-offset-4">
                      {f.title}
                    </a>
                  </span>
                ))}
              </dd>
            </div>
          )}
        </dl>
      )}
      <p className="mt-3 text-sm text-ink-2">Source: {p.source}</p>
    </li>
  )
}
