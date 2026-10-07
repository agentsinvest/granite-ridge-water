import type { ReactNode } from 'react'
import { LAWN_LABEL, OWNER_LABEL, STATUS_LABEL, URGENT_LABEL, type Action, type Priced } from '../lib/actions'
import { fmt } from '../lib/data'
import { dollarRange } from './LeakFlags'

/** Status as a chip. The mark and the words carry the meaning, so color is never the only signal. */
const STATUS_MARK: Record<Action['status'], string> = { 'not-started': '○', asked: '?', scheduled: '◷', done: '✓', verified: '✓✓', dropped: '×' }

export function StatusChip({ status }: { status: Action['status'] }) {
  const border = status === 'verified' || status === 'done' ? 'border-good' : status === 'dropped' ? 'border-line' : 'border-[var(--focus)]'
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border-2 ${border} px-2 py-0.5 text-sm font-semibold`}>
      <span aria-hidden="true">{STATUS_MARK[status]}</span>
      <span>
        <span className="sr-only">Status: </span>
        {STATUS_LABEL[status]}
      </span>
    </span>
  )
}

export function LawnBadge({ impact }: { impact: Action['lawn_impact'] }) {
  return (
    <span className={`inline-flex items-center gap-1.5 whitespace-nowrap rounded-md border px-2 py-0.5 text-xs font-semibold ${impact === 'none' ? 'border-line' : 'border-serious'}`}>
      <span aria-hidden="true">{impact === 'none' ? '=' : '~'}</span>
      {LAWN_LABEL[impact]}
    </span>
  )
}

export function UrgentBadge({ urgent }: { urgent: Action['urgent'] }) {
  if (!urgent) return null
  return (
    <span className="inline-flex items-center gap-1.5 whitespace-nowrap rounded-md bg-serious px-2 py-0.5 text-xs font-bold text-[#0b0b0b]">
      <span aria-hidden="true">!</span>
      {URGENT_LABEL[urgent]}
    </span>
  )
}

export function costText(cost: Action['cost']): string {
  if (cost === 'needs quote') return 'Needs a quote'
  if (cost === 'no purchase') return 'No purchase'
  return cost === 0 ? '$0' : fmt.usd(cost)
}

/** Yearly savings in words. A negative figure means the change as written would cost more. */
export function savingsText(p: Priced): string {
  if (p.annual) {
    if (p.annual.high <= 0) return p.annual.high < 0 ? `Costs about ${fmt.usd(-p.annual.high)} more a year as written` : 'Saves nothing as written'
    return `Saves about ${dollarRange(p.annual.low, p.annual.high)} a year`
  }
  if (p.action.category === 'get-info' || p.action.category === 'decision') return 'No savings on its own'
  if (p.action.savings_from || p.action.category === 'fix-leak' || p.action.category === 'equipment') return 'Savings not priced yet'
  return 'No savings expected'
}

export function soFarText(p: Priced): string | null {
  return p.soFar ? `has cost about ${dollarRange(p.soFar.low, p.soFar.high)} so far` : null
}

function Line({ term, children }: { term: string; children: ReactNode }) {
  return (
    <div>
      <dt className="text-xs font-semibold uppercase tracking-wide text-ink-2">{term}</dt>
      <dd className="mt-0.5">{children}</dd>
    </div>
  )
}

/** One action as a card: what is wrong, what to do, who, status, and how we will know it worked. */
export function ActionCard({ p, headingLevel = 3 }: { p: Priced; headingLevel?: 2 | 3 }) {
  const a = p.action
  const H = headingLevel === 2 ? 'h2' : 'h3'
  const soFar = soFarText(p)
  return (
    <article aria-labelledby={`card-${a.id}`} className={`h-full rounded-xl bg-surface p-4 ring-1 ring-[var(--ring)] ${a.urgent ? 'border-l-4 border-serious' : ''}`}>
      <div className="flex flex-wrap items-center gap-2">
        <StatusChip status={a.status} />
        <UrgentBadge urgent={a.urgent} />
      </div>
      <dl className="mt-3 space-y-3 text-sm">
        <Line term="What's wrong">
          {a.problem}
          {soFar && <span className="font-semibold"> {p.action.category === 'fix-leak' ? 'The extra water' : 'It'} {soFar}.</span>}
        </Line>
        <Line term="Do this">
          <H id={`card-${a.id}`} className="text-base font-bold">
            <a href={`#action/${a.id}`} className="underline underline-offset-4">
              {a.title}
            </a>
          </H>
        </Line>
        <Line term="Who">{OWNER_LABEL[a.owner]}</Line>
        <Line term="How we'll know it worked">{a.verify_with}</Line>
      </dl>
    </article>
  )
}
