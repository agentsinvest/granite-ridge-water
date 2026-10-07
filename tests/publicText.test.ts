import { describe, expect, it } from 'vitest'
import { publicText } from '../src/lib/publicText'

describe('publicText', () => {
  it.each([
    ['Eco Verde irrigation assessment, 2026 (sources/controllers/eco-verde-assessment-2026.md)', 'Eco Verde irrigation assessment, 2026'],
    ['data/usage/meter-4/2026.md', 'the daily meter reads'],
    ['data/usage/meter-4/2026.md; sources/waterfluence/ami-hourly-meter-4-2026.md', 'the daily meter reads; the Waterfluence exports'],
    ['Confirm the meter size on a City bill (see INVENTORY.md)', 'Confirm the meter size on a City bill'],
    ['Meter-4 is controller B', 'Meter-4 is controller B'],
    ['water on meter-4 on 2026-09-18', 'water on meter 4 on 2026-09-18'],
  ])('%s', (raw, out) => expect(publicText(raw, false)).toBe(out))

  it('leaves text alone in maintainer mode', () => expect(publicText('data/usage/x.md', true)).toBe('data/usage/x.md'))
})
