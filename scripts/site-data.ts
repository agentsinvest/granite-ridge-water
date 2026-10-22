import type { Action, AreaRow, NeedCase, LandscapeProblem, Controller, Bill, Experiment, Flag, Meter, MoveOption, QuickWinsPlan, Rate, SiteMap } from './schemas'

export type BillingPeriod = { start: string; end: string; usage: number | null }
export type DailyUsage = { date: string; gallons: number | null; hours: number | null; minHour: number | null }
export type HourlyRead = { time: string; gallons: number }
export type FinancialLine = { account: string; line: string; actual: number | null; budget: number | null }
export type DailyWeather = { stationId: string; stationName: string; source: string; retrievedOn: string | null; days: { date: string; inches: number | null }[] }
export type EventRow = { date: string; precision: string; meter: string; type: string; what: string; source: string }

export type SiteData = {
  generatedAt: string
  meters: Meter[]
  areas: { rows: (Omit<AreaRow, 'Gross sq ft' | 'Turf sq ft'> & { 'Gross sq ft': number | null; 'Turf sq ft': number | null })[]; frontmatter: Record<string, unknown> }
  map: SiteMap
  billingPeriods: Record<string, { unit: string; unitConfidence: string; rows: BillingPeriod[] }>
  usage: Record<string, Record<string, DailyUsage[]>>
  hourly: Record<string, { covers: string; source: string; reads: HourlyRead[] }>
  financials: Record<string, { lines: FinancialLine[]; needsReview: boolean }>
  flags: Flag[]
  rates: (Rate & { id: string })[]
  bills: (Bill & { id: string; lineItems: { name: string; amount: number | null }[]; notes: string })[]
  events: EventRow[]
  annualRainfall: { year: number; inches: number | null; complete: boolean }[]
  investments: Record<string, unknown>[]
  config: { site: Record<string, unknown>; plantFactors: Record<string, unknown> }
  experiments: Experiment[]
  options: MoveOption[]
  dataNeeds: { priority: number; need: string; why: string; unlocks: string; who: string; status: string }[]
  meterYears: { source: string; confidence: string; covers: string; note: string; rows: { year: number; meter: string; kgal: number | null; peakSurcharge: number | null; complete: boolean }[] } | null
  turfMinimum: {
    turfAreaSqFt: { value: number; source: string; confidence: string }
    plantFactor: { value: number; source: string; confidence: string }
    efficiency: { value: number; source: string; confidence: string }
    effectiveRainShare: { value: number; source: string; confidence: string }
    source: string
    confidence: string
  } | null
  /** Inputs for the next-12-bills need model. Blank meter cells are null and show as missing. */
  needModel: {
    title: string
    first_bill_month: string
    bills: number
    bill_end_day: { value: number; source: string; confidence: string }
    rain_share: { value: number; source: string; confidence: string }
    rye_months: number[]
    rye_months_source: string
    seeding_month: number
    seeding_note: string
    rates_note: string
    cases: { lean: NeedCase; cautious: NeedCase }
    source: string
    confidence: string
    todo?: string
    meters: { meter: string; turfShare: number | null; desertSqFt: number | null; dripShare: number | null; todayKept: number | null; source: string; confidence: string }[]
  } | null
  monthlyNormals: {
    etoSource: string
    etoConfidence: string
    rainSource: string
    rainConfidence: string
    months: { month: string; eto: number | null; rainAvg: number | null; rainDry: number | null; rainWet: number | null }[]
  } | null
  quickWins: QuickWinsPlan | null
  budgetCheck: { period: string; source: string; note: string; rows: { scope: string; measure: string; low: number | null; high: number | null; source: string; confidence: string }[] } | null
  /** NOAA gauge daily rain (null inches = missing). */
  dailyRain: DailyWeather | null
  /** AZMET daily reference evapotranspiration. */
  dailyEto: DailyWeather | null
  /** Tracked actions. `body` is the markdown below the front matter; `evidenceLabels` names each `source:` evidence file. */
  actions: (Action & { body: string })[]
  evidenceLabels: Record<string, string>
  /** Landscape maintenance and contract problems, by rank. `body` is the markdown below the front matter. */
  landscapeProblems: (LandscapeProblem & { body: string })[]
  /** Irrigation controllers with one row per station. Blank cells are null and show as unknown. */
  controllers: (Controller & { stations: { station: string; meter: string | null; waters: string; type: string | null; gpm: number | null; program: string | null; runMin: number | null; cycles: number | null; days: string | null; findings: string | null; source: string }[] })[]
  openTodos: { file: string; todo: string }[]
}
