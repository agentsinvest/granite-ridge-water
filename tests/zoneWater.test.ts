import { describe, expect, it } from 'vitest'
import data from '../src/generated/data.json'
import type { SiteData } from '../scripts/site-data'
import { WATER_STEPS, waterShade, zoneWaterRow } from '../src/components/SiteMap'

const site = data as unknown as SiteData
const rows = site.zoneWater!.rows

describe('zone water', () => {
  it('park stations add up to the flow sensor total, less the water on days with no station running', () => {
    const measured = rows.filter((r) => r.basis === 'measured')
    expect(measured.map((r) => r.stations[0]).sort()).toEqual(Array.from({ length: 15 }, (_, i) => `C${i + 1}`).sort())
    const total = measured.reduce((t, r) => t + r.gallons!, 0)
    // Runtime History: 5,130,181 gallons measured, 1,659 on days with no station running.
    expect(Math.abs(total - (5_130_181 - 1_659))).toBeLessThan(20)
  })

  it('every map zone that is on finds its row, and unconfirmed outside zones point at A4', () => {
    for (const z of site.map.zones ?? []) {
      if (z.status === 'off') continue
      const r = zoneWaterRow(z.stations, rows)
      expect(r, z.id).toBeDefined()
      if (z.id.startsWith('a-')) expect(r!.stations).toEqual(['A4'])
    }
  })

  it('estimates sit inside their range', () => {
    for (const r of rows.filter((x) => x.basis === 'estimated')) expect(r.low! <= r.gallons! && r.gallons! <= r.high!).toBe(true)
  })

  it('shades step at the legend bounds', () => {
    expect(waterShade(99_999)).toBe('var(--w1)')
    expect(waterShade(250_000)).toBe('var(--w3)')
    expect(waterShade(600_000)).toBe('var(--w5)')
    expect(WATER_STEPS).toHaveLength(5)
  })
})
