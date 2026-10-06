import type { AreaRow, Flag, Meter, SiteMap } from './schemas'

export type BillingPeriod = { start: string; end: string; usage: number | null }
export type DailyUsage = { date: string; gallons: number | null; hours: number | null; minHour: number | null }
export type FinancialLine = { account: string; line: string; actual: number | null; budget: number | null }
export type EventRow = { date: string; precision: string; meter: string; type: string; what: string; source: string }

export type SiteData = {
  generatedAt: string
  meters: Meter[]
  areas: { rows: (Omit<AreaRow, 'Gross sq ft' | 'Turf sq ft'> & { 'Gross sq ft': number | null; 'Turf sq ft': number | null })[]; frontmatter: Record<string, unknown> }
  map: SiteMap
  billingPeriods: Record<string, { unit: string; unitConfidence: string; rows: BillingPeriod[] }>
  usage: Record<string, Record<string, DailyUsage[]>>
  financials: Record<string, { lines: FinancialLine[]; needsReview: boolean }>
  flags: Flag[]
  events: EventRow[]
  investments: Record<string, unknown>[]
  config: { site: Record<string, unknown>; plantFactors: Record<string, unknown> }
  openTodos: { file: string; todo: string }[]
}
