import type { ReactNode } from 'react'
import { Bar, BarChart, CartesianGrid, Cell, LabelList, Legend, Line, LineChart, ReferenceLine, ResponsiveContainer, Tooltip, XAxis, YAxis } from 'recharts'

/** Fixed color per meter (categorical slots 1 to 4), so a meter keeps its color on every chart. */
export const METER_COLOR: Record<string, string> = { 'meter-1': 'var(--s1)', 'meter-2': 'var(--s2)', 'meter-3': 'var(--s3)', 'meter-4': 'var(--s4)' }

const axis = { stroke: 'var(--axis)', tick: { fill: 'var(--ink-2)', fontSize: 12 }, tickLine: false }
const tooltipStyle = {
  contentStyle: { background: 'var(--surface)', border: '1px solid var(--line)', borderRadius: 8, color: 'var(--ink)', fontSize: 13 },
  labelStyle: { color: 'var(--ink)', fontWeight: 600 },
  itemStyle: { color: 'var(--ink)' },
  cursor: { fill: 'var(--ring)' },
}

export function ChartFrame({ label, children, height = 260 }: { label: string; children: ReactNode; height?: number }) {
  return (
    <figure className="mt-4 rounded-xl bg-surface p-3 ring-1 ring-[var(--ring)] md:p-4">
      <figcaption className="sr-only">{label}</figcaption>
      <div style={{ height }} role="img" aria-label={label}>
        <ResponsiveContainer width="100%" height="100%">
          {children as React.ReactElement}
        </ResponsiveContainer>
      </div>
    </figure>
  )
}

/** `dimWhen` names a row field; rows where it is truthy draw lighter, for partial values such as year to date. */
type Series = { key: string; name: string; color: string; dimWhen?: string }

export function Bars({
  data, x, xSub, series, label, money, stacked, target, targetLabel, height, format, axisFormat,
}: {
  data: Record<string, string | number | null>[]
  x: string
  /** Row field shown as a second, smaller line under each x-axis label. */
  xSub?: string
  series: Series[]
  label: string
  money?: boolean
  stacked?: boolean
  target?: number
  targetLabel?: string
  height?: number
  /** Tooltip value format, for units other than whole numbers or dollars. */
  format?: (v: number) => string
  /** Y-axis tick format, paired with `format`. */
  axisFormat?: (v: number) => string
}) {
  const fmt = format ?? ((v: number) => (money ? `$${Math.round(v).toLocaleString('en-US')}` : Math.round(v).toLocaleString('en-US')))
  const short = axisFormat ?? ((v: number) => {
    const n = v >= 1000 ? `${Number((v / 1000).toFixed(1))}k` : String(v)
    return money ? `$${n}` : n
  })
  return (
    <ChartFrame label={label} height={height}>
      <BarChart data={data} margin={{ top: 16, right: 8, left: 0, bottom: 0 }} barCategoryGap="20%">
        <CartesianGrid vertical={false} stroke="var(--grid)" />
        {xSub ? (
          <XAxis
            dataKey={x}
            {...axis}
            interval={0}
            height={54}
            tick={(p: { x?: number | string; y?: number | string; payload?: { value?: unknown }; index?: number }) => {
              // Each word of the label on its own line (so "2026 YTD" stacks), then the sub label.
              const lines = [...String(p.payload?.value ?? '').split(' '), String(data[p.index ?? -1]?.[xSub] ?? '')]
              return (
                <text x={p.x} y={p.y} textAnchor="middle" fill="var(--ink-2)" fontSize={12}>
                  {lines.map((l, i) => (
                    <tspan key={i} x={p.x} dy={i === 0 ? '0.9em' : '1.25em'}>
                      {l}
                    </tspan>
                  ))}
                </text>
              )
            }}
          />
        ) : (
          <XAxis dataKey={x} {...axis} />
        )}
        <YAxis {...axis} width={52} tickFormatter={short} />
        <Tooltip {...tooltipStyle} formatter={(v) => fmt(Number(v))} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 13, color: 'var(--ink)' }} />}
        {target !== undefined && (
          <ReferenceLine y={target} stroke="var(--ink)" strokeDasharray="6 4" label={{ value: targetLabel, position: 'insideTopRight', fill: 'var(--ink)', fontSize: 12 }} />
        )}
        {series.map((s, i) => (
          <Bar
            key={s.key}
            dataKey={s.key}
            name={s.name}
            fill={s.color}
            stackId={stacked ? 'a' : undefined}
            radius={stacked ? (i === series.length - 1 ? [4, 4, 0, 0] : 0) : [4, 4, 0, 0]}
            stroke="var(--surface)"
            strokeWidth={stacked ? 1 : 0}
            maxBarSize={56}
            isAnimationActive={false}
          >
            {s.dimWhen && data.map((row, j) => <Cell key={j} fillOpacity={row[s.dimWhen!] ? 0.45 : 1} stroke={s.color} strokeWidth={row[s.dimWhen!] ? 1.5 : 0} />)}
          </Bar>
        ))}
      </BarChart>
    </ChartFrame>
  )
}

export function Lines({ data, x, series, label, height }: { data: Record<string, string | number | null>[]; x: string; series: Series[]; label: string; height?: number }) {
  return (
    <ChartFrame label={label} height={height}>
      <LineChart data={data} margin={{ top: 16, right: 12, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--grid)" />
        <XAxis dataKey={x} {...axis} />
        <YAxis {...axis} width={52} tickFormatter={(v) => Number(v).toLocaleString('en-US')} />
        <Tooltip {...tooltipStyle} cursor={{ stroke: 'var(--axis)' }} formatter={(v) => Math.round(Number(v)).toLocaleString('en-US')} />
        {series.length > 1 && <Legend wrapperStyle={{ fontSize: 13 }} />}
        {series.map((s) => (
          <Line key={s.key} isAnimationActive={false} type="monotone" dataKey={s.key} name={s.name} stroke={s.color} strokeWidth={2} dot={{ r: 3 }} activeDot={{ r: 5 }} connectNulls={false} />
        ))}
      </LineChart>
    </ChartFrame>
  )
}

/** Waterfall: start, signed steps, end. Up steps use the serious color, down steps the good color, each with a sign in the label. */
export function Waterfall({ steps, label }: { steps: { name: string; value: number; total?: boolean }[]; label: string }) {
  const money = (v: number) => `${v < 0 ? '-' : ''}$${Math.abs(Math.round(v)).toLocaleString('en-US')}`
  let run = 0
  const rows = steps.map((s) => {
    if (s.total) {
      run = s.value
      return { name: s.name, base: 0, size: s.value, kind: 'total', value: s.value, text: money(s.value) }
    }
    const base = s.value >= 0 ? run : run + s.value
    run += s.value
    return { name: s.name, base, size: Math.abs(s.value), kind: s.value >= 0 ? 'up' : 'down', value: s.value, text: `${s.value >= 0 ? '+' : ''}${money(s.value)}` }
  })
  const color = (k: string) => (k === 'total' ? 'var(--s1)' : k === 'up' ? 'var(--serious)' : 'var(--good)')
  return (
    <ChartFrame label={label} height={280}>
      <BarChart data={rows} margin={{ top: 24, right: 8, left: 0, bottom: 0 }}>
        <CartesianGrid vertical={false} stroke="var(--grid)" />
        <XAxis dataKey="name" {...axis} interval={0} />
        <YAxis {...axis} width={52} tickFormatter={(v) => `$${Math.round(v / 1000)}k`} />
        <Tooltip {...tooltipStyle} formatter={(_v, _n, p) => money((p.payload as { value: number }).value)} />
        <Bar dataKey="base" stackId="w" fill="transparent" isAnimationActive={false} tooltipType="none" />
        <Bar dataKey="size" stackId="w" radius={[4, 4, 4, 4]} name="Change" isAnimationActive={false}>
          {rows.map((r) => (
            <Cell key={r.name} fill={color(r.kind)} />
          ))}
          <LabelList dataKey="text" position="top" fill="var(--ink)" fontSize={12} />
        </Bar>
      </BarChart>
    </ChartFrame>
  )
}
