import { useMemo } from 'react'
import type { SiteData } from '../../scripts/site-data'
import { LeakFlags, dollarRange } from '../components/LeakFlags'
import { WateringAfterRain } from '../components/WateringAfterRain'
import { WateringChecks } from '../components/WateringChecks'
import { buildRainCheck } from '../lib/rainCheck'
import { PageHeader, Section, Stat, Stats } from '../components/ui'
import type { Model } from '../lib/model'

export function Problems({ data, model }: { data: SiteData; model: Model }) {
  const costed = model.flags
  const priced = costed.filter((c) => c.cost?.low != null && c.cost.high != null)
  const low = priced.reduce((s, c) => s + c.cost!.low!, 0)
  const high = priced.reduce((s, c) => s + c.cost!.high!, 0)
  const rain = useMemo(() => buildRainCheck(data), [data])
  const checks = data.meters.reduce((n, m) => n + (m.checks?.length ?? 0), 0)
  return (
    <article>
      <PageHeader title="Problems" lead="What looks broken or wasteful in the water use right now, most expensive first." />
      <Stats>
        <Stat value={String(costed.length)} label={costed.length === 1 ? 'possible leak flagged' : 'possible leaks flagged'} flag={costed.length > 0} />
        <Stat value={priced.length ? dollarRange(low, high) : 'Not priced'} label="extra charges so far, where priced" flag={priced.length > 0} />
        <Stat value={String(checks)} label="watering questions for the landscaper" />
      </Stats>

      <Section id="leaks" title="Possible leaks" lead="Each one says what we saw, roughly what it cost, and what to check next. None are confirmed leaks yet.">
        <LeakFlags flags={costed} />
      </Section>

      <Section id="checks" title="Watering checks" lead="Not leaks, but worth raising with the landscaper: water that stopped when it should not have, or watering we cannot explain yet.">
        <WateringChecks data={data} />
      </Section>

      <WateringAfterRain data={data} rc={rain} />
    </article>
  )
}
