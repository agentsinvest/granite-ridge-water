import { useEffect, useMemo } from 'react'
import { data } from './lib/data'
import { buildModel } from './lib/model'
import { useRoute, type RouteName } from './lib/route'
import { MetersAndAreas } from './pages/MetersAndAreas'
import { Bills } from './pages/Bills'
import { Schedule } from './pages/Schedule'
import { Overview } from './pages/Overview'
import { HowWeGotHere } from './pages/HowWeGotHere'
import { HowMuch } from './pages/HowMuch'
import { WhatIf } from './pages/WhatIf'
import { InvestmentCalculator } from './pages/Investment'
import { Moves } from './pages/Moves'
import { Experiments } from './pages/Experiments'
import { DataAccuracy } from './pages/DataAccuracy'

const SCREENS: { name: string; route: RouteName }[] = [
  { name: 'Overview', route: 'overview' },
  { name: 'How we got here', route: 'history' },
  { name: 'Meters and leaks', route: 'meters' },
  { name: 'Watering schedule', route: 'schedule' },
  { name: 'How much should we use', route: 'budget' },
  { name: 'What if', route: 'whatif' },
  { name: 'Is an investment worth it?', route: 'invest' },
  { name: 'Recommended moves', route: 'moves' },
  { name: 'Experiments', route: 'experiments' },
  { name: 'Bills', route: 'bills' },
  { name: 'Data and accuracy', route: 'data' },
]

export function App() {
  const route = useRoute()
  const model = useMemo(() => buildModel(data), [])
  useEffect(() => {
    if (route.anchor) document.getElementById(route.anchor)?.scrollIntoView()
    else window.scrollTo(0, 0)
    const screen = SCREENS.find((s) => s.route === route.name)
    document.title = `${screen?.name ?? 'Overview'} | Granite Ridge Water`
  }, [route.name, route.anchor])

  const page = (() => {
    switch (route.name) {
      case 'history': return <HowWeGotHere data={data} model={model} />
      case 'meters': return <MetersAndAreas data={data} />
      case 'schedule': return <Schedule data={data} />
      case 'budget': return <HowMuch data={data} model={model} />
      case 'whatif': return <WhatIf data={data} model={model} query={route.query} />
      case 'invest': return <InvestmentCalculator data={data} />
      case 'moves': return <Moves data={data} model={model} />
      case 'experiments': return <Experiments data={data} model={model} />
      case 'bills': return <Bills data={data} query={route.query} />
      case 'data': return <DataAccuracy data={data} model={model} />
      default: return <Overview data={data} model={model} />
    }
  })()

  return (
    <div className="min-h-screen md:flex">
      <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }} className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:bg-surface focus:p-2">
        Skip to content
      </a>
      <nav aria-label="Screens" className="border-b border-line bg-surface px-4 py-4 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r">
        <p className="text-base font-bold">Granite Ridge Water</p>
        <p className="mt-1 text-sm text-ink-2">Common-area irrigation</p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm md:block md:space-y-1.5">
          {SCREENS.map((s) => (
            <li key={s.route}>
              <a
                href={`#${s.route}`}
                aria-current={route.name === s.route ? 'page' : undefined}
                className={route.name === s.route ? 'font-semibold text-ink underline decoration-2 underline-offset-4' : 'text-ink underline-offset-4 hover:underline'}
              >
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 flex-1">
        <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-6 outline-none md:px-8 md:py-10">
          {page}
        </main>
        <footer className="mx-auto max-w-5xl border-t border-line px-4 py-6 text-sm text-ink-2 md:px-8">
          <p>Estimates are based on City of Mesa published rates and HOA records. Bills from the City are the official record.</p>
          <p className="mt-2">Data built {new Date(data.generatedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}.</p>
        </footer>
      </div>
    </div>
  )
}
