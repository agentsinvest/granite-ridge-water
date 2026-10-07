import { describe, expect, it } from 'vitest'
import { buildData } from '../scripts/build-data'
import { buildModel, buildMoves } from '../src/lib/model'
import { fixNow, priceActions, progressBands, whatChanged, type Action } from '../src/lib/actions'

const data = buildData()
const model = buildModel(data)
const moves = buildMoves(data, model)
const withStatus = (id: string, status: Action['status']) => ({ ...data, actions: data.actions.map((a) => (a.id === id ? { ...a, status } : a)) })

describe('actions', () => {
  it('takes savings from the existing calculators, not new math', () => {
    const priced = priceActions(data, model)
    const valve = priced.find((p) => p.action.id === 'meter1-master-valve-repair')!
    expect(valve.annual).toEqual(moves.find((m) => m.id === '2026-07-meter-1-trickle')!.annual)
    const tune = priced.find((p) => p.action.id === 'park-seasonal-adjust-test')!
    expect(tune.annual).toEqual(moves.find((m) => m.id === 'park-controller-tune-up')!.annual)
    expect(priced.find((p) => p.action.id === 'controller-b-flow-sensor')!.annual).toBeNull()
  })

  it('moves savings into the verified band when an action is verified', () => {
    const before = progressBands(priceActions(data, model), model).bands
    const d = withStatus('park-seasonal-adjust-test', 'verified')
    const after = progressBands(priceActions(d, model), model).bands
    const tune = moves.find((m) => m.id === 'park-controller-tune-up')!.annual!.high
    expect(before[0].high).toBe(0)
    expect(after[0].high).toBeCloseTo(tune, 2)
    // Total across the bands does not change.
    const sum = (b: typeof before) => b.reduce((s, x) => s + x.high, 0)
    expect(sum(after)).toBeCloseTo(sum(before), 2)
  })

  it('combines watering changes in sequence instead of adding them', () => {
    const extra: Action = { ...data.actions.find((a) => a.id === 'park-seasonal-adjust-test')!, id: 'x', savings_from: 'option:park-summer-back-to-2022' }
    const d = { ...data, actions: [...data.actions, extra] }
    const both = progressBands(priceActions(d, model), model).bands[2]
    const a = moves.find((m) => m.id === 'park-controller-tune-up')!.annual!.high
    const b = moves.find((m) => m.id === 'park-summer-back-to-2022')!.annual!.high
    const leak = moves.find((m) => m.id === '2026-07-meter-1-trickle')!.annual!.high
    expect(both.high - leak).toBeLessThan(a + b)
  })

  it('counts actions that should save money but have no price', () => {
    expect(progressBands(priceActions(data, model), model).unpriced).toBe(3)
  })

  it('puts trees at risk first, then leaks', () => {
    const top = fixNow(priceActions(data, model))
    expect(top.map((p) => p.action.id)).toEqual(['entrance-drip-back-on', 'meter4-valve-repair', 'meter1-master-valve-repair'])
    expect(fixNow(priceActions(withStatus('entrance-drip-back-on', 'done'), model))[0].action.id).not.toBe('entrance-drip-back-on')
  })

  it('reports a status change even when only the status line was edited', () => {
    const d = withStatus('entrance-drip-back-on', 'verified')
    const changes = whatChanged(d, 20)
    expect(changes.some((c) => c.text.startsWith('Turn the entrance drip back on') && c.text.endsWith('now verified'))).toBe(true)
  })
})
