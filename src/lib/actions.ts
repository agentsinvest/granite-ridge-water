// The action tracking layer: who is doing what, and what it is worth. No React here, and no new pricing: every dollar
// figure comes from an existing calculator (leak cost, the What if scenario engine) or from a sourced value in the
// action file.
import type { SiteData } from '../../scripts/site-data'
import { runScenario, type Change } from '../engine/scenarios'
import { buildMoves, type Model, type Move } from './model'

export type Action = SiteData['actions'][number]
export type Status = Action['status']
type Range = { low: number; high: number }

export const STATUS_LABEL: Record<Status, string> = {
  'not-started': 'Not started',
  asked: 'Asked',
  scheduled: 'Scheduled',
  done: 'Done, checking it worked',
  verified: 'Verified',
  dropped: 'Dropped',
}

export const OWNER_LABEL: Record<Action['owner'], string> = {
  Landscaper: 'The landscaper',
  Trestle: 'Trestle (HOA management)',
  HOA: 'The HOA',
  'City of Mesa': 'City of Mesa',
}

export const LAWN_LABEL: Record<Action['lawn_impact'], string> = {
  none: 'No change to the lawn',
  'changes-lawn-watering': 'Changes lawn watering',
  'removes-lawn': 'Removes lawn',
}

export const URGENT_LABEL: Record<NonNullable<Action['urgent']>, string> = {
  'tree-risk': 'Urgent: trees at risk',
  'open-leak': 'Water running to waste',
}

/** Status groups on the Action plan screen. */
export const GROUPS: { id: string; title: string; statuses: Status[] }[] = [
  { id: 'now', title: 'Now', statuses: ['not-started'] },
  { id: 'waiting', title: 'Waiting on someone', statuses: ['asked', 'scheduled'] },
  { id: 'done', title: 'Done, checking it worked', statuses: ['done'] },
  { id: 'verified', title: 'Verified', statuses: ['verified'] },
]

export type Priced = {
  action: Action
  /** Yearly savings, from the linked calculator or the action file. Negative means the change as written costs more. */
  annual: Range | null
  /** What the linked problem has cost so far, for leaks. */
  soFar: Range | null
  /** The scenario change behind the savings, when it comes from a What if option, so several can be combined in order. */
  change: Change | null
  move: Move | null
}

export function priceActions(data: SiteData, model: Model): Priced[] {
  const moves = buildMoves(data, model)
  return data.actions.map((action) => {
    if (action.savings_per_year) {
      const [low, high] = action.savings_per_year
      return { action, annual: { low, high }, soFar: null, change: null, move: null }
    }
    const id = action.savings_from?.split(':')[1]
    const move = id ? moves.find((m) => m.id === id) ?? null : null
    return { action, annual: move?.annual ?? null, soFar: move?.soFar ?? null, change: move?.change ?? null, move }
  })
}

/** Actions that should save money but have no price yet. Questions, decisions, and plain setting fixes that save nothing are not counted. */
export function isUnpriced(p: Priced): boolean {
  if (p.action.status === 'dropped' || p.annual !== null) return false
  return p.action.category === 'fix-leak' || p.action.category === 'equipment' || p.action.savings_from !== null
}

export type Band = { id: 'verified' | 'progress' | 'proposed'; label: string; statuses: Status[]; low: number; high: number; count: number }

/**
 * Savings toward the target in three bands. Watering changes are combined in sequence with the What if engine, so two
 * changes on the same meter are never simply added. Leak and sourced savings are added on top. Only changes that save
 * money on their own are counted; the ones that would cost more as written are shown on their own card instead.
 */
export function progressBands(priced: Priced[], model: Model): { bands: Band[]; unpriced: number } {
  const defs: Omit<Band, 'low' | 'high' | 'count'>[] = [
    { id: 'verified', label: 'Verified savings', statuses: ['verified'] },
    { id: 'progress', label: 'In progress', statuses: ['asked', 'scheduled', 'done'] },
    { id: 'proposed', label: 'Proposed', statuses: ['not-started'] },
  ]
  const counting = priced.filter((p) => p.annual !== null && p.annual.high > 0)
  const total = (statuses: Status[]): Range => {
    const these = counting.filter((p) => statuses.includes(p.action.status))
    const fixed = these.filter((p) => !p.change)
    const changes = these.flatMap((p) => (p.change ? [p.change] : []))
    let combined = 0
    if (changes.length && model.latestRate) {
      const r = runScenario(model.baseline, changes, model.latestRate)
      combined = r.ok ? r.baseCost - r.newCost : 0
    }
    return {
      low: combined + fixed.reduce((s, p) => s + p.annual!.low, 0),
      high: combined + fixed.reduce((s, p) => s + p.annual!.high, 0),
    }
  }
  const bands: Band[] = []
  let sofar: Status[] = []
  let prev: Range = { low: 0, high: 0 }
  for (const d of defs) {
    sofar = [...sofar, ...d.statuses]
    const cum = total(sofar)
    bands.push({ ...d, low: cum.low - prev.low, high: cum.high - prev.high, count: counting.filter((p) => d.statuses.includes(p.action.status)).length })
    prev = cum
  }
  return { bands, unpriced: priced.filter(isUnpriced).length }
}

const OPEN: Status[] = ['not-started', 'asked', 'scheduled']

/** Up to `n` open actions: urgent ones first (trees at risk, then water running to waste), then by yearly savings. */
export function fixNow(priced: Priced[], n = 3): Priced[] {
  const urgency = (p: Priced) => (p.action.urgent === 'tree-risk' ? 0 : p.action.urgent === 'open-leak' ? 1 : 2)
  const worth = (p: Priced) => Math.max(p.annual?.high ?? 0, p.soFar?.high ?? 0)
  return priced
    .filter((p) => OPEN.includes(p.action.status))
    .sort((a, b) => urgency(a) - urgency(b) || worth(b) - worth(a) || a.action.title.localeCompare(b.action.title))
    .slice(0, n)
}

export type Update = { date: string; text: string; link: string }

const plural = (n: number, one: string, many: string) => (n === 1 ? one : many)

/** Recent changes from the data itself: bills, flags, action status changes, and experiments. Newest first. */
export function whatChanged(data: SiteData, n = 6): Update[] {
  const out: Update[] = []
  // Bills, grouped by the month they were issued.
  const byMonth = new Map<string, { date: string; meters: Set<string> }>()
  for (const b of data.bills) {
    const k = b.bill_date.slice(0, 7)
    const g = byMonth.get(k) ?? { date: b.bill_date, meters: new Set<string>() }
    if (b.bill_date > g.date) g.date = b.bill_date
    g.meters.add(b.meter.replace('meter-', ''))
    byMonth.set(k, g)
  }
  for (const g of byMonth.values()) {
    const m = [...g.meters].sort()
    out.push({ date: g.date, text: `New City ${plural(m.length, 'bill', 'bills')} for ${plural(m.length, 'meter', 'meters')} ${m.join(', ')}`, link: '#history?tab=bills' })
  }
  for (const f of data.flags) {
    out.push({ date: String(f.first_seen).slice(0, 10), text: `New problem found: ${f.title}`, link: `#problems/${f.id}` })
    if (f.fixed_on) out.push({ date: String(f.fixed_on).slice(0, 10), text: `Fixed: ${f.title}`, link: `#problems/${f.id}` })
  }
  // Action status changes. Several actions changed the same way on the same day are one line.
  const groups = new Map<string, { date: string; status: Status; note: string | undefined; actions: Action[] }>()
  for (const a of data.actions) {
    const entries = [...a.history]
    if (entries.at(-1)!.status !== a.status) entries.push({ date: a.updated, status: a.status, note: undefined })
    for (const e of entries) {
      const k = `${e.date}|${e.status}|${e.note ?? ''}`
      const g = groups.get(k) ?? { date: e.date, status: e.status, note: e.note, actions: [] }
      g.actions.push(a)
      groups.set(k, g)
    }
  }
  for (const g of groups.values()) {
    const what = g.note && g.note.startsWith('Added') ? 'added to the action plan' : `now ${STATUS_LABEL[g.status].toLowerCase()}`
    out.push(
      g.actions.length === 1
        ? { date: g.date, text: `${g.actions[0].title}: ${what}`, link: `#action/${g.actions[0].id}` }
        : { date: g.date, text: `${g.actions.length} actions ${what}`, link: '#plan' },
    )
  }
  for (const x of data.experiments) {
    if (x.start) out.push({ date: x.start, text: `Test started: ${x.title}`, link: '#calculator?tab=did-it-work' })
    if (x.end) out.push({ date: x.end, text: `Test finished: ${x.title}`, link: '#calculator?tab=did-it-work' })
  }
  return out.sort((a, b) => b.date.localeCompare(a.date)).slice(0, n)
}

/** Cost per home per month for a yearly dollar figure. */
export const perHomeMonth = (yearly: number, homes: number) => yearly / homes / 12

/** What the proposed next rates add to the same water, from the scenario engine priced at today's and the proposed rates. */
export function nextRatesImpact(model: Model): { yearly: number; rateStart: string | null } | null {
  if (!model.latestRate || !model.nextRate) return null
  const now = runScenario(model.baseline, [], model.latestRate)
  const next = runScenario(model.baseline, [], model.nextRate)
  if (!now.ok || !next.ok) return null
  const start = model.nextRate.effective_start
  return { yearly: next.baseCost - now.baseCost, rateStart: start ? String(start).slice(0, 10) : null }
}

export function nextRatesText(data: SiteData, model: Model): string | null {
  const r = nextRatesImpact(model)
  if (!r) return null
  const homes = (data.config.site as { homes: { value: number } }).homes.value
  const usd = (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 })
  return `the proposed rates would add about ${usd(r.yearly)} a year for the same water, about ${usd(perHomeMonth(r.yearly, homes))} per home per month.`
}
