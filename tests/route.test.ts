import { describe, expect, it } from 'vitest'
import { parseHash, toHash } from '../src/lib/route'

const go = (h: string) => {
  const r = parseHash(h)
  return toHash(r.name, r.anchor, r.query)
}

describe('old links redirect to the new screens', () => {
  it.each([
    ['#overview', '#home'],
    ['', '#home'],
    ['#nonsense', '#home'],
    ['#moves', '#plan'],
    ['#quickwins?l=abc&p=proposed', '#plan?l=abc&p=proposed&tab=target'],
    ['#schedule', '#water?tab=schedule'],
    ['#budget/by-meter-month', '#water/by-meter-month?tab=budget'],
    ['#meters', '#water?tab=meters'],
    ['#meters/meter-2', '#water/meter-2?tab=meters'],
    ['#meters/leaks-heading', '#problems/leaks-heading'],
    ['#meters/checks-heading', '#problems/checks-heading'],
    ['#meters/2026-09-meter-4-step-change', '#problems/2026-09-meter-4-step-change'],
    ['#whatif?s=xyz', '#calculator?s=xyz&tab=whatif'],
    ['#invest?inv=smart-et-controller', '#calculator?inv=smart-et-controller&tab=invest'],
    ['#what-if', '#calculator?tab=invest'],
    ['#experiments', '#calculator?tab=did-it-work'],
    ['#bills?p=last12', '#history?p=last12&tab=bills'],
    ['#history', '#history'],
    ['#data', '#about'],
  ])('%s goes to %s', (from, to) => expect(go(from)).toBe(to))

  it('marks only old hashes as redirected', () => {
    expect(parseHash('#plan').redirected).toBe(false)
    expect(parseHash('#moves').redirected).toBe(true)
  })
})
