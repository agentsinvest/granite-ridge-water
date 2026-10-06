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
  account_last4: last4,
  meter_number_last4: last4,
  size_inches: z.number().nullable(),
  service_type: nullableString,
  waterfluence_id: nullableString,
  location: nullableString,
  areas_served: z.array(z.string()).nullable(),
  areas_served_note: z.string().optional(),
  areas_served_source: z.string().optional(),
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
  meter: z.string(),
  zones: z.array(z.string()),
  rule: z.enum(['over_budget', 'step_change', 'off_schedule', 'never_zero', 'winter_summer_ratio', 'meter_vs_meter', 'manual']),
  first_seen: z.union([date, z.date()]),
  status: z.enum(['suggested', 'open', 'investigating', 'fixed', 'false-alarm']),
  fixed_on: z.union([date, z.date()]).nullable(),
  evidence: z.string(),
  likely_cause: z.string().optional(),
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
  post_2027_rate_assumption: z.object({ method: z.string(), label: z.string(), source: z.string(), confidence }),
})

export const plantFactorsFrontmatterSchema = z.object({
  conversion_factor_gallons_per_inch_sq_ft: sourced(z.number()),
  method: z.object({ formula: z.string(), source: z.string(), confidence, note: z.string() }),
  todo: z.string().optional(),
})

const derivedValue = { derived: z.boolean(), source: z.string() }
export const rateSchema = z.object({
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
    blocks: z.array(z.object({ block: z.number(), limit: z.enum(['winter_allowance']).nullable(), price: z.number(), ...derivedValue })).length(2),
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
  period_start: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period_end: z.string().regex(/^\d{4}-\d{2}-\d{2}$/),
  period_source: z.string().optional(),
  read_start: z.number().nullable(),
  read_end: z.number().nullable(),
  read_start_date: z.union([date, z.date()]).optional(),
  read_end_date: z.union([date, z.date()]).optional(),
  confirmed_by: z.string().optional(),
  late_fee_source: z.string().optional(),
  correction_source: z.string().optional(),
  gallons: z.number().nonnegative(),
  amount_due: z.number().nullable(),
  printed_total: z.number(),
  reconciled: z.enum(['pending', 'pass', 'fail']),
  needs_review: z.boolean(),
  source: z.string(),
  todo: z.string().optional(),
})
export const billLineSchema = z.object({ 'Line item': z.string().min(1), Amount: cellNumber })

export const eventsFrontmatterSchema = z.object({ todo: z.string().optional() })

export type Meter = z.infer<typeof meterSchema>
export type AreaRow = z.infer<typeof areaRowSchema>
export type SiteMap = z.infer<typeof mapSchema>
export type Flag = z.infer<typeof flagSchema>
export type Rate = z.infer<typeof rateSchema>
export type Bill = z.infer<typeof billSchema>
