import { z } from 'zod'

const nullableString = z.string().nullable()
const last4 = z.string().regex(/^\d{4}$/, 'must be exactly 4 digits').nullable()
const date = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')
const point = z.tuple([z.number(), z.number()])
const confidence = z.enum(['high', 'medium', 'low'])

/** Table cell helpers. Blank cells are null; anything else must parse. */
export const cellNumber = z
  .string()
  .transform((s, ctx) => {
    if (s === '') return null
    const n = Number(s)
    if (Number.isNaN(n)) {
      ctx.addIssue({ code: 'custom', message: `"${s}" is not a number` })
      return z.NEVER
    }
    return n
  })
export const cellDate = z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'must be YYYY-MM-DD')

export const meterSchema = z.object({
  id: z.string().regex(/^meter-\d+$/),
  name: nullableString,
  name_source: z.string().optional(),
  account_last4: last4,
  meter_number_last4: last4,
  size_inches: z.number().nullable(),
  size_source: z.string().optional(),
  turf_share_percent: z.object({ value: z.number().min(0).max(100), source: z.string(), confidence }).optional(),
  service_type: nullableString,
  waterfluence_id: nullableString,
  location: nullableString,
  areas_served: z.array(z.string()).nullable(),
  areas_served_note: z.string().optional(),
  areas_served_source: z.string().optional(),
  controller_note: z.string().optional(),
  controller_note_source: z.string().optional(),
  controller: z
    .object({ name: z.string(), model: nullableString, summary: z.string(), source: z.string(), confidence })
    .optional(),
  checks: z
    .array(
      z.object({
        kind: z.enum(['action', 'question']),
        title: z.string().min(1),
        detail: z.string().min(1),
        source: z.string().min(1),
        confidence,
      }),
    )
    .optional(),
  active_from: z.union([date, z.date()]).nullable(),
  active_to: z.union([date, z.date()]).nullable(),
  source: nullableString,
  todo: z.string().optional(),
})

export const areaRowSchema = z.object({
  'Area id': z.string().min(1),
  'Map label': z.string(),
  Name: z.string().min(1),
  'Gross sq ft': cellNumber,
  'Turf sq ft': cellNumber,
  Description: z.string(),
  Zones: z.string(),
})

export const areasFrontmatterSchema = z.object({
  source: z.string(),
  site_slope: z.object({ value: z.string(), source: z.string(), confidence }),
  lot_area_included: z.object({ value: z.boolean(), source: z.string(), confidence }),
  waterfluence_landscape: z.object({
    shrub_sq_ft: z.number(),
    turf_overseed_sq_ft: z.number(),
    turf_no_overseed_sq_ft: z.number(),
    pool_sq_ft: z.number(),
    total_sq_ft: z.number(),
    source: z.string(),
    confidence,
    note: z.string(),
  }),
  todo: z.string().optional(),
})

export const mapSchema = z.object({
  source: z.string(),
  confidence,
  note: z.string(),
  canvas: z.object({ width: z.number(), height: z.number() }),
  areas: z.array(
    z.object({
      id: z.string(),
      landscape: z.enum(['shrub', 'turf']),
      label_at: point,
      parts: z.array(z.array(point).min(3)).min(1),
    }),
  ),
  turf: z.array(z.object({ area: z.string(), points: z.array(point).min(3) })),
  streets: z.object({ area: z.string(), label_at: point, width: z.number(), lines: z.array(z.array(point).min(2)) }),
  meters: z.array(z.object({ meter: z.string(), at: point })),
  boundary_roads: z.array(z.object({ name: z.string(), line: z.array(point).min(2), label_at: point, rotate: z.number().optional() })),
  slope: z.object({ text: z.string(), source: z.string() }),
  controllers: z
    .array(z.object({ id: z.string().regex(/^[A-Z]$/), name: z.string(), meters: z.array(z.string()).min(1), at: point }))
    .optional(),
  zones: z
    .array(
      z.object({
        id: z.string(),
        controller: z.string(),
        label: z.string(),
        name: z.string(),
        status: z.enum(['on', 'off']),
        label_at: point,
        parts: z.array(z.array(point).min(3)).min(1),
      }),
    )
    .optional(),
  zones_source: z.string().optional(),
})

export const billingPeriodsFrontmatterSchema = z.object({
  meter: z.string(),
  meter_number_last4: last4,
  unit: z.literal('thousand_gallons'),
  unit_source: z.string(),
  unit_confidence: confidence,
  source: z.string(),
  todo: z.string().optional(),
})
export const billingPeriodRowSchema = z.object({
  'Period start': cellDate,
  'Period end': cellDate,
  Usage: cellNumber,
})

export const usageFrontmatterSchema = z.object({
  meter: z.string(),
  meter_number_last4: last4,
  year: z.number(),
  source: z.string(),
  exported_on: z.union([date, z.date()]),
  covers: z.string(),
  todo: z.string().optional(),
})
export const usageRowSchema = z.object({
  Date: cellDate,
  Gallons: cellNumber,
  'Hours reported': cellNumber,
  'Min hour gal': cellNumber,
  'Waterfluence budget gal': cellNumber,
})

export const hourlyFrontmatterSchema = usageFrontmatterSchema
export const hourlyRowSchema = z.object({
  'Read time': z.string().regex(/^\d{4}-\d{2}-\d{2} \d{2}:00$/, 'must be YYYY-MM-DD HH:00'),
  Gallons: cellNumber.refine((n) => n !== null, 'blank hours must be left out, not written as empty'),
})

export const financialsFrontmatterSchema = z.object({
  year: z.number(),
  basis: z.enum(['cash', 'accrual']).nullable(),
  report_generated: z.union([date, z.date()]),
  source: z.string(),
  water_irrigation_december: z.number(),
  needs_review: z.boolean().optional(),
  todo: z.string().optional(),
})
export const financialsRowSchema = z.object({
  Account: z.string().regex(/^\d{5}$/),
  Line: z.string(),
  Actual: cellNumber,
  Budget: cellNumber,
  Page: cellNumber,
})

export const flagSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  summary: z.string().min(1),
  meter: z.string(),
  zones: z.array(z.string()),
  rule: z.enum(['over_budget', 'step_change', 'off_schedule', 'never_zero', 'winter_summer_ratio', 'meter_vs_meter', 'manual']),
  first_seen: z.union([date, z.date()]),
  status: z.enum(['suggested', 'open', 'investigating', 'fixed', 'false-alarm']),
  fixed_on: z.union([date, z.date()]).nullable(),
  evidence: z.string(),
  likely_cause: z.string().optional(),
  excess_water: z
    .object({
      episodes: z.array(z.object({ from: date, to: date, gallons: z.number().positive() })),
      ongoing_gallons_per_year: z.number().positive().nullable(),
      method: z.string().min(1),
      source: z.string().min(1),
      confidence,
    })
    .nullable(),
  related_events: z.array(z.string()),
  source: z.string().optional(),
  todo: z.string().optional(),
})

export const eventRowSchema = z.object({
  Date: cellDate,
  Precision: z.enum(['day', 'month', 'year']),
  Meter: z.string(),
  Zones: z.string(),
  Type: z.enum(['leak', 'repair', 'controller', 'schedule', 'landscape', 'meter', 'overseed', 'rebate', 'other']),
  'What happened': z.string().min(1),
  Source: z.string().min(1),
})

export const investmentSchema = z.object({
  name: z.string(),
  applies_to: z.enum(['zones', 'meters', 'areas']),
  effect: z.object({
    type: z.enum(['percent_reduction', 'gallons_per_month', 'efficiency_change', 'leak_elimination', 'fixed_charge_change']),
    value: z.number().nullable(),
    range: z.tuple([z.number().nullable(), z.number().nullable()]),
  }),
  upfront_cost_per_unit: z.number().nullable(),
  unit: z.enum(['controller', 'zone', 'meter', 'sq_ft', 'one_time']),
  annual_cost: z.number().nullable(),
  lifespan_years: z.number().nullable(),
  source: z.string(),
  confidence,
  requires_confirmation: z.string().optional(),
  linked_flags: z.array(z.string()).optional(),
  notes: z.string(),
  todo: z.string().optional(),
})

const sourced = <T extends z.ZodTypeAny>(v: T) => z.object({ value: v, source: z.string() }).passthrough()
export const siteConfigSchema = z.object({
  annual_target_usd: sourced(z.number()),
  reconciliation: z.object({ tolerance_usd_per_bill: sourced(z.number()), required_pass_rate_percent: sourced(z.number()), line_item_tolerance_usd: sourced(z.number()) }),
  leak_rules: z.object({ over_budget_threshold_percent: sourced(z.number()), over_budget_consecutive_periods: sourced(z.number()) }),
  waterfluence_budget_disagreement_percent: sourced(z.number()),
  weather: z.object({ azmet_station: nullableString, source: z.string().optional(), confidence: confidence.optional(), todo: z.string().optional() }),
  waterfluence_unit_cost: sourced(z.number()),
  watering_schedule: z.object({ watering_hour_min_gallons: sourced(z.number().positive()), max_gap_hours: sourced(z.number().int().nonnegative()), measured_min_complete_share: sourced(z.number().min(0).max(1)) }),
  homes: sourced(z.number().int().positive()),
  small_wins_budget_usd: sourced(z.number().positive()),
  post_2027_rate_assumption: z.object({ method: z.string(), label: z.string(), source: z.string(), confidence }),
  rain_check: z.object({
    min_event_inches: sourced(z.number().positive()),
    usable_share: sourced(z.number().min(0).max(1)),
    usable_cap_inches: sourced(z.number().positive()),
    plant_factors: sourced(z.array(z.object({ meters: z.array(z.string()).min(1), months: z.array(z.number().int().min(1).max(12)), factor: z.number().positive() })).min(1)),
    summer_months: sourced(z.array(z.number().int().min(1).max(12))),
    max_days_summer: sourced(z.number().int().positive()),
    max_days_winter: sourced(z.number().int().positive()),
    already_off_days: sourced(z.number().int().positive()),
    night_start_hour: sourced(z.number().int().min(12).max(23)),
    night_end_hour: sourced(z.number().int().min(0).max(12)),
    since: sourced(date),
    action_id: sourced(z.string()),
    action_verify_min_inches: sourced(z.number().positive()),
  }),
  experiment_check: z.object({
    min_days_each_side: sourced(z.number().int().positive()),
    min_hours_per_day: sourced(z.number().int().positive()),
    share_of_target_for_success: sourced(z.number().positive()),
    noise_percent: sourced(z.number().positive()),
  }),
})

export const plantFactorsFrontmatterSchema = z.object({
  conversion_factor_gallons_per_inch_sq_ft: sourced(z.number()),
  method: z.object({ formula: z.string(), source: z.string(), confidence, note: z.string() }),
  todo: z.string().optional(),
})

const derivedValue = { derived: z.boolean(), source: z.string() }
export const rateSchema = z.object({
  /** `recommended` rates are proposals not yet adopted: they price future scenarios only, never "today". */
  status: z.enum(['in_effect', 'recommended', 'adopted']).default('in_effect'),
  effective_start: z.union([date, z.date()]).nullable(),
  effective_end: z.union([date, z.date()]).nullable(),
  applies_from_period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  applies_to_period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  observed_in: z.string(),
  derived: z.boolean(),
  service_type: nullableString,
  source: z.string(),
  confidence,
  fixed_charges: z.array(z.object({ meters: z.array(z.string()).min(1), meter_size_inches: z.number().nullable(), amount: z.number(), ...derivedValue })).min(1),
  included_kgal_per_bill: z.object({ value: z.number(), ...derivedValue }),
  volumetric: z.object({
    unit: z.literal('per_1000_gallons'),
    applies_to: z.string(),
    blocks: z
      .array(
        z.object({
          block: z.number(),
          limit: z.union([z.literal('winter_allowance'), z.object({ winter_average_multiple: z.number().gt(1) })]).nullable(),
          price: z.number(),
          ...derivedValue,
        }),
      )
      .min(2),
  }),
  winter_allowance: z.object({ method: z.string(), derived: z.boolean(), confidence, source: z.string() }),
  fees: z.array(z.object({ name: z.string(), basis: z.enum(['per_1000_gallons_above_included', 'per_1000_gallons', 'per_bill']), amount: z.number(), ...derivedValue })),
  taxes: z.array(z.object({ name: z.string(), rate_percent: z.number(), applies_to: z.array(z.string()), derived: z.boolean(), confidence, source: z.string() })),
  straddle_rule: z.enum(['prorate', 'rate_at_period_end']).nullable(),
  todo: z.string().optional(),
})

export const billSchema = z.object({
  meter: z.string(),
  bill_date: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/).nullable(),
  period_source: z.string().optional(),
  read_start: z.number().nullable(),
  read_end: z.number().nullable(),
  read_start_date: z.union([date, z.date()]).optional(),
  read_end_date: z.union([date, z.date()]).optional(),
  confirmed_by: z.string().optional(),
  late_fee_source: z.string().optional(),
  correction_source: z.string().optional(),
  gallons: z.number().nonnegative().nullable(),
  gallons_source: z.string().optional(),
  gallons_range: z.tuple([z.number(), z.number()]).optional(),
  meter_number_last4: z.string().regex(/^\d{4}$/).optional(),
  usage_code: z.string().optional(),
  ocr_page: z.number().optional(),
  amount_due: z.number().nullable(),
  printed_total: z.number(),
  reconciled: z.enum(['pending', 'pass', 'fail', 'unpriced']),
  needs_review: z.boolean(),
  source: z.string(),
  todo: z.string().optional(),
})
export const billLineSchema = z.object({ 'Line item': z.string().min(1), Amount: cellNumber })

export const annualRainFrontmatterSchema = z.object({ unit: z.literal('inches'), source: z.string(), confidence, todo: z.string().optional() })
export const annualRainRowSchema = z.object({ Year: z.string().regex(/^\d{4}$/), 'Rain in': cellNumber, Complete: z.enum(['yes', 'no']) })

export const eventsFrontmatterSchema = z.object({ todo: z.string().optional() })

export const experimentSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  meter: z.string(),
  what_changes: z.string().min(1),
  status: z.enum(['planned', 'running', 'done', 'stopped']),
  start: date.nullable(),
  end: date.nullable(),
  baseline_days: z.number().int().positive(),
  expected: z.object({
    type: z.enum(['percent_reduction', 'max_daily_gallons']),
    value: z.number().positive(),
    source: z.string().min(1),
    confidence,
  }),
  linked_flags: z.array(z.string()).optional(),
  outcome_note: z.string().optional(),
  todo: z.string().optional(),
})

export const optionSchema = z.object({
  id: z.string(),
  title: z.string().min(1),
  why: z.string().min(1),
  meters: z.array(z.string()).min(1),
  change: z.object({ kind: z.enum(['turn_down', 'shutoff']), percent: z.number().positive().max(100).nullable(), months: z.array(z.number().int().min(1).max(12)) }),
  touches_greenspace: z.boolean(),
  has_trees: z.boolean().nullable(),
  upfront_cost: z.number().nonnegative().nullable(),
  upfront_cost_source: z.string(),
  effort: z.enum(['low', 'medium', 'high']),
  source: z.string().min(1),
  confidence,
  how_to_test: z.string().optional(),
  todo: z.string().optional(),
})

export const dataNeedsFrontmatterSchema = z.object({ updated: date, todo: z.string().optional() })
export const dataNeedRowSchema = z.object({
  Priority: z.string().regex(/^\d+$/),
  Need: z.string().min(1),
  'Why it matters': z.string().min(1),
  'What it unlocks': z.string().min(1),
  'Who has it': z.string(),
  Status: z.enum(['needed', 'partly in', 'in hand']),
})

export const historyFrontmatterSchema = z.object({
  source: z.string(),
  confidence,
  covers: z.string(),
  note: z.string().optional(),
  checks: z.string().optional(),
  todo: z.string().optional(),
})
export const historyRowSchema = z.object({
  Year: z.string().regex(/^\d{4}$/),
  Meter: z.string().regex(/^meter-\d+$/),
  'Gallons kgal': cellNumber,
  'Peak surcharge': cellNumber,
  Complete: z.enum(['yes', 'no']),
})
const sourcedNumber = z.object({ value: z.number(), source: z.string(), confidence })
export const turfMinimumFrontmatterSchema = z.object({
  turf_area_sq_ft: sourcedNumber,
  plant_factor: sourcedNumber,
  efficiency: sourcedNumber,
  effective_rain_share: sourcedNumber,
  source: z.string(),
  confidence,
  todo: z.string().optional(),
})
const monthName = z.enum(['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'])
export const monthlyNormalsFrontmatterSchema = z.object({ eto_source: z.string(), eto_confidence: confidence, rain_source: z.string(), rain_confidence: confidence, todo: z.string().optional() })
export const monthlyNormalsRowSchema = z.object({ Month: monthName, 'ETo in': cellNumber, 'Rain avg in': cellNumber, 'Rain 2020 in': cellNumber, 'Rain 2021 in': cellNumber })
const lever = <T extends z.ZodTypeAny>(v: T) =>
  z.object({
    label: z.string(),
    by_year: z.array(v),
    months: z.array(z.number().int().min(1).max(12)).optional(),
    applies_to: z.enum(['all_water', 'turf', 'drip']),
    why: z.string(),
    investment: z.string().optional(),
    source: z.string(),
    confidence,
  })
const pct = z.number().min(0).max(100)
export const quickWinsPlanSchema = z.object({
  id: z.string(),
  name: z.string(),
  kind: z.literal('quick_wins_plan'),
  source: z.string(),
  confidence,
  created_on: z.union([date, z.date()]),
  years: z.array(z.number().int()).min(1),
  levers: z.object({
    leak_repair_cut_percent: lever(pct),
    controller_cut_percent: lever(pct),
    stop_overseeding: lever(z.boolean()),
    winter_turf_percent: lever(pct),
    october_turf_percent: lever(pct),
    summer_turf_percent: lever(pct),
    desert_drip_percent: lever(pct),
  }),
  controller_rebate: z.object({ share: z.number().min(0).max(1), cap_usd: z.number(), source: z.string(), confidence, todo: z.string().optional() }),
  overseeding_cost: z.object({ source: z.string(), note: z.string() }),
  notes: z.string().optional(),
})
export type QuickWinsPlan = z.infer<typeof quickWinsPlanSchema>
export const budgetCheckFrontmatterSchema = z.object({ period: z.string(), source: z.string(), confidence, note: z.string(), todo: z.string().optional() })
export const budgetCheckRowSchema = z.object({
  Scope: z.string().min(1),
  Measure: z.string().min(1),
  'Low kgal': cellNumber,
  'High kgal': cellNumber,
  Source: z.string().min(1),
  Confidence: confidence,
})

/** YAML turns bare dates into Date objects; keep them as YYYY-MM-DD strings. */
const isoDate = z.union([date, z.date().transform((d) => d.toISOString().slice(0, 10))])
export const ACTION_STATUSES = ['not-started', 'asked', 'scheduled', 'done', 'verified', 'dropped'] as const
const actionStatus = z.enum(ACTION_STATUSES)
export const actionSchema = z.object({
  id: z.string().regex(/^[a-z0-9-]+$/),
  title: z.string().min(1),
  problem: z.string().min(1),
  meter: z.string().regex(/^(meter-\d+|all|park)$/),
  controller: z.enum(['Park', 'Entrance', 'B']).nullable(),
  stations: z.array(z.string()).default([]),
  category: z.enum(['fix-leak', 'schedule-change', 'equipment', 'decision', 'get-info']),
  lawn_impact: z.enum(['none', 'changes-lawn-watering', 'removes-lawn']),
  owner: z.enum(['Landscaper', 'Trestle', 'HOA', 'City of Mesa']),
  status: actionStatus,
  urgent: z.enum(['tree-risk', 'open-leak']).nullable().default(null),
  due: isoDate.nullable().default(null),
  after: z.array(z.string()).default([]),
  cost: z.union([z.number().nonnegative(), z.literal('needs quote'), z.literal('no purchase')]),
  cost_source: z.string().min(1),
  savings_from: z.string().regex(/^(option|flag|investment):[a-z0-9-]+$/).nullable().default(null),
  savings_per_year: z.tuple([z.number(), z.number()]).nullable().default(null),
  savings_source: z.string().optional(),
  savings_note: z.string().optional(),
  evidence: z.array(z.string().regex(/^(flag|source|experiment|option|investment):.+$/)),
  verify_with: z.string().min(1),
  verify_experiment: z.string().nullable().default(null),
  shows: z.enum(['next-rates']).nullable().default(null),
  updated: isoDate,
  history: z.array(z.object({ date: isoDate, status: actionStatus, note: z.string().optional() })).min(1),
  todo: z.string().optional(),
})
export type Action = z.infer<typeof actionSchema>

export const controllerSchema = z.object({
  id: z.string().regex(/^[A-Z]$/),
  name: z.enum(['Park', 'Entrance', 'B']),
  full_name: z.string().min(1),
  model: nullableString,
  serial_last4: last4,
  meters: z.array(z.string()).min(1),
  has_flow_sensor: z.boolean().nullable(),
  source: z.string().min(1),
  confidence,
  findings: z.array(z.object({ text: z.string().min(1), source: z.string().min(1) })).default([]),
  todo: z.string().optional(),
})
const blankable = z.string().transform((s) => (s === '' ? null : s))
export const stationRowSchema = z.object({
  Station: z.string().regex(/^[A-Z]\d+$/, 'must be the controller letter and station number, like C7'),
  Meter: z.union([z.literal('').transform(() => null), z.string().regex(/^meter-\d+$/)]),
  Waters: z.string().min(1),
  Type: z.union([z.literal('').transform(() => null), z.enum(['spray', 'rotor', 'drip', 'bubbler'])]),
  GPM: cellNumber,
  Program: blankable,
  'Run min': cellNumber,
  Cycles: cellNumber,
  Days: blankable,
  Findings: blankable,
  Source: z.string().min(1),
})
export type Controller = z.infer<typeof controllerSchema>
export type StationRow = z.infer<typeof stationRowSchema>

export type Meter = z.infer<typeof meterSchema>
export type AreaRow = z.infer<typeof areaRowSchema>
export type SiteMap = z.infer<typeof mapSchema>
export type Flag = z.infer<typeof flagSchema>
export type Rate = z.infer<typeof rateSchema>
export type Bill = z.infer<typeof billSchema>
export type Experiment = z.infer<typeof experimentSchema>
export type MoveOption = z.infer<typeof optionSchema>

/** Daily weather from one station, one file per year (weather/daily-rain/<YYYY>.md, weather/daily-eto/<YYYY>.md). */
export const dailyWeatherFrontmatterSchema = z.object({
  year: z.number(),
  station_id: z.string(),
  station_name: z.string(),
  source: z.string(),
  retrieved_on: z.union([date, z.date()]).nullable(),
  covers: z.string().nullable(),
  todo: z.string().optional(),
})
/** `Reported` is the gauge's own value: a number, T (trace, stored as 0), M (missing), or S (included in a later day's total). */
export const dailyRainRowSchema = z.object({ Date: cellDate, 'Rain in': cellNumber, Reported: z.string().min(1, 'copy what the gauge reported') })
export const dailyEtoRowSchema = z.object({ Date: cellDate, 'ETo in': cellNumber })

