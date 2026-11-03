import { describe, expect, it } from 'vitest'
import { firstSentence, installText, mapAlerts, shortBlurb } from '../src/lib/mapAlerts'
import data from '../src/generated/data.json'

const map = {
  canvas: { width: 1000, height: 1000 },
  meters: [
    { meter: 'meter-1', at: [500, 500] as [number, number] },
    { meter: 'meter-2', at: [990, 10] as [number, number] },
  ],
  zones: [{ id: 'c15', stations: ['C15'], label_at: [300, 300] as [number, number] }],
}
const flag = (id: string, meter: string, status: string, zones: string[] = []) => ({ id, title: `T ${id}`, summary: 'First one. Second one.', meter, zones, status })

describe('mapAlerts', () => {
  it('puts a flag on its zone when a station is on the map, otherwise on its meter', () => {
    const a = mapAlerts(map, [flag('a', 'meter-1', 'open', ['C15']), flag('b', 'meter-1', 'suggested', ['C99'])], [])
    expect(a.map((x) => [x.id, x.zone, x.at])).toEqual([
      ['a', 'C15', [346, 300]],
      ['b', null, [540, 470]],
    ])
  })
  it('leaves out fixed flags, false alarms, and open questions', () => {
    const a = mapAlerts(map, [flag('a', 'meter-1', 'fixed'), flag('b', 'meter-1', 'false-alarm')], [
      { id: 'meter-1', checks: [{ id: 'q', title: 'Q', detail: 'D.', kind: 'question', stations: [] }] },
    ])
    expect(a).toEqual([])
  })
  it('spreads markers at one spot side by side and keeps them on the map', () => {
    const a = mapAlerts(map, [flag('a', 'meter-2', 'open'), flag('b', 'meter-2', 'open')], [])
    expect(a.map((x) => x.at)).toEqual([
      [950, 20],
      [914, 20],
    ])
    const b = mapAlerts(map, [flag('a', 'meter-1', 'open'), flag('b', 'meter-1', 'open')], [])
    expect(b[1].at[0] - b[0].at[0]).toBe(36)
  })
  it('links flags and action checks to their spot on the Problems screen', () => {
    const a = mapAlerts(map, [flag('2026-x', 'meter-1', 'open')], [{ id: 'meter-1', checks: [{ id: 'drip', title: 'C', detail: 'D.', kind: 'action', stations: ['C15'] }] }])
    expect(a.map((x) => x.href)).toEqual(['#problems/2026-x', '#problems/check-drip'])
  })
  it('has a marker for every active flag and action check in the site data', () => {
    const active = data.flags.filter((f) => f.status !== 'fixed' && f.status !== 'false-alarm')
    const actions = data.meters.flatMap((m) => (m.checks ?? []).filter((c) => c.kind === 'action'))
    const a = mapAlerts(data.map as never, active as never, data.meters as never)
    expect(a.length).toBe(active.length + actions.length)
    for (const x of a) {
      expect(x.at[0]).toBeGreaterThan(0)
      expect(x.at[0]).toBeLessThan(data.map.canvas.width)
    }
  })
})

describe('firstSentence', () => {
  it('keeps decimals whole', () => expect(firstSentence('It rained 1.7 inches. Then it stopped.')).toBe('It rained 1.7 inches.'))
  it('returns short text as is', () => expect(firstSentence('No stop here')).toBe('No stop here'))
})

describe('shortBlurb', () => {
  it('takes two sentences when they fit', () => expect(shortBlurb('One. Two. Three.')).toBe('One. Two.'))
  it('falls back to one long sentence', () => expect(shortBlurb(`${'a'.repeat(250)}. B${'b'.repeat(100)}.`)).toBe(`${'a'.repeat(250)}.`))
})

describe('installText', () => {
  it('states an exact day', () => expect(installText({ from: '2025-04-30', to: '2025-04-30' })).toBe('Installed Apr 30, 2025.'))
  it('states a window, never a guessed day', () => expect(installText({ from: '2024-09-13', to: '2024-10-11' })).toBe('Installed between Sep 13 and Oct 11, 2024.'))
  it('crosses years', () => expect(installText({ from: '2023-12-20', to: '2024-01-10' })).toBe('Installed between Dec 20, 2023 and Jan 10, 2024.'))
  it('says when it is not on file', () => {
    expect(installText(undefined)).toBe('Install date not on file.')
    expect(installText({ from: null, to: null, in_use_by: '2023-10-01' })).toBe('Install date not on file. Working by Oct 1, 2023.')
  })
})
