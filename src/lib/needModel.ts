// Turns the need-model data file, weather normals, and plant-factor config into engine inputs. No React here.
import type { SiteData } from '../../scripts/site-data'
import type { NeedCaseInputs, NeedInputs } from '../engine/needModel'

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

export type CaseId = 'lean' | 'cautious'
export type NeedSetup = { inputs: NeedInputs; cases: Record<CaseId, NeedCaseInputs> } | { missing: string[] }

/** Engine inputs, or the list of values that are missing. Missing values are never filled in. */
export function needSetup(data: SiteData): NeedSetup {
  const nm = data.needModel
  const missing: string[] = []
  if (!nm) return { missing: ['the need model inputs'] }
  const normals = data.monthlyNormals?.months ?? []
  const months = MONTHS.map((name) => {
    const r = normals.find((x) => x.month === name)
    if (r?.eto == null) missing.push(`${name} weather demand`)
    if (r?.rainAvg == null) missing.push(`${name} average rain`)
    return { eto: r?.eto ?? 0, rain: r?.rainAvg ?? 0 }
  })
  const conv = (data.config.plantFactors as { conversion_factor_gallons_per_inch_sq_ft?: { value: number } }).conversion_factor_gallons_per_inch_sq_ft?.value
  if (conv == null) missing.push('gallons per inch per square foot')
  const meters = nm.meters.map((m) => {
    for (const [k, v] of [['lawn share', m.turfShare], ['desert area', m.desertSqFt], ['drip share', m.dripShare], ["share of today's use kept", m.todayKept]] as const)
      if (v === null) missing.push(`${m.meter} ${k}`)
    return { meter: m.meter, turfShare: m.turfShare ?? 0, desertSqFt: m.desertSqFt ?? 0, dripShare: m.dripShare ?? 0, todayKept: m.todayKept ?? 0 }
  })
  if (missing.length) return { missing }
  const toCase = (c: SiteData['needModel'] extends infer N ? (N extends { cases: infer C } ? C[keyof C] : never) : never): NeedCaseInputs => ({
    turfAreaSqFt: c.turf_area_sq_ft.value,
    bermudaPlantFactor: c.bermuda_plant_factor.value,
    ryePlantFactor: c.rye_plant_factor.value,
    seedingWeeks: c.seeding_weeks.value,
    seedingPlantFactor: c.seeding_plant_factor.value,
    turfEfficiency: c.turf_efficiency.value,
    desertPlantFactor: c.desert_plant_factor.value,
    dripEfficiency: c.drip_efficiency.value,
    capDripAtCurrentUse: c.cap_drip_at_current_use,
  })
  return {
    inputs: {
      months,
      gallonsPerInchSqFt: conv!,
      rainShare: nm.rain_share.value,
      ryeMonths: nm.rye_months,
      seedingMonth: nm.seeding_month,
      firstBillMonth: nm.first_bill_month,
      bills: nm.bills,
      billEndDay: nm.bill_end_day.value,
      meters,
    },
    cases: { lean: toCase(nm.cases.lean), cautious: toCase(nm.cases.cautious) },
  }
}
