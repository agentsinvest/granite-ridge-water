import type { SiteData } from '../../scripts/site-data'
import { meterNumber } from '../lib/data'

type MeterCheck = NonNullable<SiteData['meters'][number]['checks']>[number]

/** Things in the watering data to raise with the landscaper that are not leaks. Actions first, then open questions. */
export function WateringChecks({ data }: { data: SiteData }) {
  const checks = data.meters.flatMap((m) => (m.checks ?? []).map((c) => ({ ...c, meter: m.id })))
  checks.sort((a, b) => (a.kind === b.kind ? 0 : a.kind === 'action' ? -1 : 1))
  if (checks.length === 0) return <p className="mt-3 text-ink-2">Nothing to check right now.</p>
  return (
    <ul className="mt-4 space-y-3">
      {checks.map((c) => (
        <li key={`${c.meter}-${c.title}`}>
          <Check check={c} meter={c.meter} />
        </li>
      ))}
    </ul>
  )
}

function Check({ check, meter }: { check: MeterCheck; meter: string }) {
  const action = check.kind === 'action'
  return (
    <div className={`rounded-xl bg-surface p-4 ring-1 ring-[var(--ring)] ${action ? 'border-l-4 border-serious' : ''}`}>
      <p className="text-xs font-semibold uppercase tracking-wide text-ink-2">
        {action ? 'Needs action' : 'Open question'} ·{' '}
        <a href={`#water/${meter}?tab=meters`} className="underline underline-offset-4">
          Meter {meterNumber(meter)}
        </a>
      </p>
      <p className="mt-1 font-semibold">{check.title}</p>
      <p className="mt-1 max-w-prose text-sm text-ink-2">{check.detail}</p>
    </div>
  )
}
