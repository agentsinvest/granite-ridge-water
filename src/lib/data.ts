import raw from '../generated/data.json'
import type { SiteData } from '../../scripts/site-data'

import { cleanData, isMaintainer } from './publicText'

/** Raw data for maintainers (`?maintainer=1`); everyone else gets the same facts with file paths and jargon in plain words. */
export const rawData = raw as unknown as SiteData
export const maintainer = isMaintainer()
export const data: SiteData = maintainer ? rawData : { ...cleanData(rawData), openTodos: rawData.openTodos, generatedAt: rawData.generatedAt }

export function meterNumber(id: string): string {
  return id.replace('meter-', '')
}

export const fmt = {
  int: (n: number) => n.toLocaleString('en-US'),
  usd: (n: number) => n.toLocaleString('en-US', { style: 'currency', currency: 'USD', maximumFractionDigits: 0 }),
  pct: (f: number) => `${Math.round(f * 100)}%`,
  /** Thousand gallons to a plain-language gallons figure. */
  gallons: (thousand: number) =>
    thousand >= 1000 ? `${(thousand / 1000).toFixed(1)} million gallons` : `${Math.round(thousand).toLocaleString('en-US')},000 gallons`,
  month: (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', year: 'numeric' }),
}

/** "Meter 1 · East park (…8300)": the one way meters are named across the site. Missing parts are left out, never guessed. */
export function meterLabel(d: { meters: { id: string; name: string | null; meter_number_last4: string | null }[] }, id: string, form: 'full' | 'name' = 'full'): string {
  const m = d.meters.find((x) => x.id === id)
  const base = `Meter ${meterNumber(id)}${m?.name ? ` · ${m.name}` : ''}`
  return form === 'full' && m?.meter_number_last4 ? `${base} (…${m.meter_number_last4})` : base
}

/** meterLabel for this site's data: "Meter 1 · East park (…8300)". */
export const meterName = (id: string, form: 'full' | 'name' = 'full') => meterLabel(data, id, form)
