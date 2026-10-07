import type { ReactNode } from 'react'
import type { SiteData } from '../../scripts/site-data'
import { StatusChip } from '../components/actions'
import { PageHeader, Section } from '../components/ui'
import { meterLabel } from '../lib/data'
import { publicText } from '../lib/publicText'
import type { Model } from '../lib/model'

type Controller = SiteData['controllers'][number]
type Station = Controller['stations'][number]

const ORDER = ['Park', 'Entrance', 'B']
const TYPE: Record<string, string> = { spray: 'Spray', rotor: 'Rotor (lawn)', drip: 'Drip', bubbler: 'Bubbler' }

function Unknown() {
  return <span className="text-ink-2">unknown</span>
}

export function controllerTitle(c: Pick<Controller, 'name' | 'full_name'>) {
  return c.name === 'B' ? 'Controller B' : `${c.name} controller`
}

function schedule(s: Station): ReactNode {
  if (s.program === 'Off') return 'Turned off'
  if (s.program === null && s.runMin === null) return <Unknown />
  const run = s.runMin === null ? 'run time unknown' : `${s.runMin} min${s.cycles && s.cycles > 1 ? ` x ${s.cycles} cycles` : ''}`
  return `Program ${s.program ?? 'unknown'}: ${run}${s.days ? `, ${s.days}` : ''}`
}

/** Plain list of what is not on file, by controller, so "unknown" is not repeated as a request in every row. */
export function stillNeeded(c: Controller): string[] {
  const all = c.stations.filter((s) => s.program !== 'Off')
  const missing = (pick: (s: Station) => unknown) => all.filter((s) => pick(s) === null).map((s) => s.station)
  const list = (ids: string[]) => (ids.length === all.length ? 'every station' : ids.join(', '))
  const out: string[] = []
  if (!c.model) out.push('Make and model of the controller')
  if (c.has_flow_sensor === null) out.push('Whether it has a flow sensor and master valve')
  const prog = missing((s) => s.program ?? s.runMin)
  if (prog.length) out.push(`Program, days, and run time for ${list(prog)}`)
  const gpm = missing((s) => s.gpm)
  if (gpm.length) out.push(`Flow in gallons per minute for ${list(gpm)}`)
  const meter = missing((s) => s.meter)
  if (meter.length) out.push(`Which meter feeds ${list(meter)}`)
  if (c.confidence !== 'high' && c.meters.length > 1) out.push(`Confirm which stations are on ${c.meters.map((m) => `meter ${m.replace('meter-', '')}`).join(' and which on ')}`)
  return out
}

export function Controllers({ data, model }: { data: SiteData; model: Model }) {
  const controllers = [...data.controllers].sort((a, b) => ORDER.indexOf(a.name) - ORDER.indexOf(b.name))
  if (controllers.length === 0) {
    return (
      <article>
        <PageHeader title="Controllers and zones" lead="Which controller waters what." />
        <p className="mt-4 text-ink-2">No controllers are on file yet.</p>
      </article>
    )
  }
  const open = data.actions.filter((a) => !['verified', 'dropped'].includes(a.status))
  return (
    <article>
      <PageHeader
        title="Controllers and zones"
        lead="Three irrigation controllers water the common areas. Each one runs numbered stations, and each station waters one part of the landscape."
      />
      <p className="mt-4 text-sm">
        <a href="#checklist" className="font-semibold underline underline-offset-4">
          Printable checklist for the landscaper
        </a>
      </p>

      {controllers.map((c) => {
        const flags = model.flags.filter((f) => c.meters.includes(f.flag.meter))
        const whole = open.filter((a) => a.controller === c.name && a.stations.length === 0)
        return (
          <Section key={c.id} id={`controller-${c.id}`} title={controllerTitle(c)} lead={`${c.model ?? 'Make and model unknown'}. Waters through ${c.meters.map((m) => meterLabel(data, m)).join(' and ')}.`}>
            {(flags.length > 0 || whole.length > 0) && (
              <ul className="mt-3 space-y-1 text-sm">
                {flags.map(({ flag }) => (
                  <li key={flag.id} className="flex gap-2">
                    <span aria-hidden="true" className="font-extrabold">!</span>
                    <span>
                      Open problem: <a href={`#problems/${flag.id}`} className="underline underline-offset-4">{flag.title}</a>
                    </span>
                  </li>
                ))}
                {whole.map((a) => (
                  <li key={a.id} className="flex flex-wrap items-center gap-2">
                    <span>Action for the whole controller:</span>
                    <a href={`#action/${a.id}`} className="underline underline-offset-4">{a.title}</a>
                    <StatusChip status={a.status} />
                  </li>
                ))}
              </ul>
            )}
            <div className="mt-4 overflow-x-auto rounded-xl bg-surface ring-1 ring-[var(--ring)]">
              <table className="w-full min-w-[56rem] text-left text-sm">
                <caption className="sr-only">{controllerTitle(c)} stations</caption>
                <thead className="border-b border-line text-ink-2">
                  <tr>
                    {['Station', 'Meter', 'Waters', 'Type', 'Flow (GPM)', 'Program and run time', 'Eco Verde findings', 'Open flags', 'Actions'].map((h) => (
                      <th key={h} scope="col" className="px-3 py-2 font-semibold">{h}</th>
                    ))}
                  </tr>
                </thead>
                <tbody>
                  {c.stations.map((s) => {
                    const acts = open.filter((a) => a.stations.includes(s.station))
                    const sf = flags.filter(({ flag }) => flag.zones.includes(s.station))
                    return (
                      <tr key={s.station} className="border-b border-line align-top last:border-0">
                        <th scope="row" className="px-3 py-2 font-semibold">{s.station}</th>
                        <td className="whitespace-nowrap px-3 py-2">{s.meter ? `Meter ${s.meter.replace('meter-', '')}` : <Unknown />}</td>
                        <td className="px-3 py-2">{s.waters}</td>
                        <td className="whitespace-nowrap px-3 py-2">{s.type ? TYPE[s.type] : <Unknown />}</td>
                        <td className="tabular px-3 py-2">{s.gpm ?? <Unknown />}</td>
                        <td className="px-3 py-2">{schedule(s)}</td>
                        <td className="px-3 py-2">{s.findings ? publicText(s.findings) : <span className="text-ink-2">None noted</span>}</td>
                        <td className="px-3 py-2">{sf.length ? sf.map(({ flag }) => <a key={flag.id} href={`#problems/${flag.id}`} className="block underline underline-offset-4">{flag.title}</a>) : <span className="text-ink-2">None</span>}</td>
                        <td className="px-3 py-2">
                          {acts.length ? acts.map((a) => <a key={a.id} href={`#action/${a.id}`} className="block underline underline-offset-4">{a.title}</a>) : <span className="text-ink-2">None</span>}
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
            {c.findings.length > 0 && (
              <details className="mt-3 text-sm">
                <summary className="cursor-pointer font-semibold">Findings for the whole controller</summary>
                <ul className="mt-2 list-disc space-y-1 pl-5">
                  {c.findings.map((f) => (
                    <li key={f.text}>{publicText(f.text)}</li>
                  ))}
                </ul>
              </details>
            )}
          </Section>
        )
      })}

      <Section id="still-needed" title="What we still need from the landscaper" lead="Everything shown as unknown above, in one list.">
        <ul className="mt-3 space-y-3 text-sm">
          {controllers.map((c) => {
            const need = stillNeeded(c)
            return need.length === 0 ? null : (
              <li key={c.id}>
                <span className="font-semibold">{controllerTitle(c)}</span>
                <ul className="mt-1 list-disc pl-5">
                  {need.map((n) => (
                    <li key={n}>{n}</li>
                  ))}
                </ul>
              </li>
            )
          })}
        </ul>
      </Section>
    </article>
  )
}
