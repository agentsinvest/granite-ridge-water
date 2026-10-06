import type { ReactNode } from 'react'

export function PageHeader({ title, lead }: { title: string; lead: ReactNode }) {
  return (
    <header>
      <h1 className="text-2xl font-bold md:text-3xl">{title}</h1>
      <p className="mt-2 max-w-prose text-ink-2">{lead}</p>
    </header>
  )
}

export function Section({ id, title, lead, children }: { id: string; title: string; lead?: ReactNode; children: ReactNode }) {
  return (
    <section aria-labelledby={`${id}-heading`} className="mt-10">
      <h2 id={`${id}-heading`} className="text-xl font-bold">
        {title}
      </h2>
      {lead && <p className="mt-1 max-w-prose text-sm text-ink-2">{lead}</p>}
      {children}
    </section>
  )
}

export function Card({ children, className = '' }: { children: ReactNode; className?: string }) {
  return <div className={`rounded-xl bg-surface p-5 ring-1 ring-[var(--ring)] ${className}`}>{children}</div>
}

export function Stats({ children }: { children: ReactNode }) {
  return <dl className="mt-6 grid grid-cols-2 gap-3 md:grid-cols-4">{children}</dl>
}

export function Stat({ value, label, flag, good }: { value: string; label: ReactNode; flag?: boolean; good?: boolean }) {
  return (
    <div className="flex flex-col rounded-xl bg-surface p-4 ring-1 ring-[var(--ring)]">
      <dt className="order-2 mt-1 text-sm text-ink-2">{label}</dt>
      <dd className="order-1 flex items-center gap-2 text-2xl font-bold">
        {flag && (
          <span aria-hidden="true" className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-serious text-sm font-extrabold text-[#0b0b0b]">
            !
          </span>
        )}
        {good && (
          <span aria-hidden="true" className="inline-flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-good text-sm font-extrabold text-white">
            ✓
          </span>
        )}
        {value}
      </dd>
    </div>
  )
}

/** Status pill. The symbol and the words carry the meaning, so color is never the only signal. */
export function Pill({ tone, children }: { tone: 'good' | 'serious' | 'neutral'; children: ReactNode }) {
  const border = tone === 'good' ? 'border-good' : tone === 'serious' ? 'border-serious' : 'border-line'
  const mark = tone === 'good' ? '✓' : tone === 'serious' ? '!' : '•'
  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border-2 ${border} px-2 py-0.5 text-sm font-semibold`}>
      <span aria-hidden="true">{mark}</span>
      {children}
    </span>
  )
}

export function Missing({ what }: { what: string }) {
  return <span className="italic text-ink-2">{what} not recorded yet</span>
}

export function Sure({ level }: { level: string }) {
  const text = level === 'high' ? 'Fairly sure' : level === 'medium' ? 'Somewhat sure' : 'Rough estimate'
  return <span className="text-ink-2">{text} ({level} confidence)</span>
}

export function Empty({ children }: { children: ReactNode }) {
  return <p className="mt-4 rounded-xl border-2 border-dashed border-line p-5 text-ink-2">{children}</p>
}

/** A collapsible table view so every chart can be read without color or a mouse. */
export function TableView({ caption, head, rows }: { caption: string; head: string[]; rows: (string | number)[][] }) {
  return (
    <details className="mt-2 text-sm">
      <summary className="cursor-pointer font-semibold">Show as a table</summary>
      <div className="mt-2 overflow-x-auto rounded-lg ring-1 ring-[var(--ring)]">
        <table className="w-full text-left">
          <caption className="sr-only">{caption}</caption>
          <thead className="border-b border-line text-ink-2">
            <tr>
              {head.map((h, i) => (
                <th key={h} scope="col" className={`px-3 py-2 font-semibold ${i ? 'text-right' : ''}`}>
                  {h}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i} className="border-b border-line last:border-0">
                {r.map((c, j) =>
                  j === 0 ? (
                    <th key={j} scope="row" className="px-3 py-2 font-normal">
                      {c}
                    </th>
                  ) : (
                    <td key={j} className="tabular px-3 py-2 text-right">
                      {c}
                    </td>
                  ),
                )}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </details>
  )
}
