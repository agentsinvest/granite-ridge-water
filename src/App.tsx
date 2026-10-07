import { useEffect, useMemo, type ReactNode } from 'react'
import { data } from './lib/data'
import { buildModel } from './lib/model'
import { useRoute, type Route, type RouteName } from './lib/route'
import { ScreenTabs } from './components/ui'
import { MetersAndAreas } from './pages/MetersAndAreas'
import { Bills } from './pages/Bills'
import { Schedule } from './pages/Schedule'
import { Home } from './pages/Home'
import { HowWeGotHere } from './pages/HowWeGotHere'
import { HowMuch } from './pages/HowMuch'
import { WhatIf } from './pages/WhatIf'
import { InvestmentCalculator } from './pages/Investment'
import { QuickWins } from './pages/QuickWins'
import { Moves } from './pages/Moves'
import { Experiments } from './pages/Experiments'
import { DataAccuracy } from './pages/DataAccuracy'
import { Problems } from './pages/Problems'
import { Controllers } from './pages/Controllers'
import { Checklist } from './pages/Checklist'

type Model = ReturnType<typeof buildModel>
type Tab = { id: string; label: string; render: (r: Route, m: Model) => ReactNode }
type Screen = { route: RouteName; name: string; menu: boolean; tabs: Tab[] }

/** Five screens in the menu, plus About the data in the footer. Each screen's tabs reuse the existing views. */
const SCREENS: Screen[] = [
  { route: 'home', name: 'Home', menu: true, tabs: [{ id: 'home', label: 'Home', render: (_, m) => <Home data={data} model={m} /> }] },
  {
    route: 'plan',
    name: 'Action plan',
    menu: true,
    tabs: [
      { id: 'actions', label: 'Actions', render: (_, m) => <Moves data={data} model={m} /> },
      { id: 'target', label: 'Plan to reach the target', render: (r, m) => <QuickWins data={data} model={m} query={r.query} /> },
    ],
  },
  { route: 'problems', name: 'Problems', menu: true, tabs: [{ id: 'problems', label: 'Problems', render: (_, m) => <Problems data={data} model={m} /> }] },
  {
    route: 'water',
    name: 'Where the water goes',
    menu: true,
    tabs: [
      { id: 'meters', label: 'Meters and map', render: () => <MetersAndAreas data={data} /> },
      { id: 'controllers', label: 'Controllers and zones', render: (_, m) => <Controllers data={data} model={m} /> },
      { id: 'schedule', label: 'When it waters', render: () => <Schedule data={data} /> },
      { id: 'budget', label: 'How much should we use', render: (_, m) => <HowMuch data={data} model={m} /> },
    ],
  },
  {
    route: 'calculator',
    name: 'Savings calculator',
    menu: true,
    tabs: [
      { id: 'whatif', label: 'What if we...', render: (r, m) => <WhatIf data={data} model={m} query={r.query} /> },
      { id: 'invest', label: 'Is an investment worth it?', render: () => <InvestmentCalculator data={data} /> },
      { id: 'did-it-work', label: 'Did it work?', render: (_, m) => <Experiments data={data} model={m} /> },
    ],
  },
  {
    route: 'history',
    name: 'History and bills',
    menu: true,
    tabs: [
      { id: 'how', label: 'How we got here', render: (_, m) => <HowWeGotHere data={data} model={m} /> },
      { id: 'bills', label: 'Bills', render: (r) => <Bills data={data} query={r.query} /> },
    ],
  },
  { route: 'checklist', name: 'Landscaper checklist', menu: false, tabs: [{ id: 'checklist', label: 'Landscaper checklist', render: () => <Checklist data={data} /> }] },
  { route: 'about', name: 'About the data', menu: false, tabs: [{ id: 'about', label: 'About the data', render: (_, m) => <DataAccuracy data={data} model={m} /> }] },
]

export function App() {
  const route = useRoute()
  const model = useMemo(() => buildModel(data), [])
  const screen = SCREENS.find((s) => s.route === route.name) ?? SCREENS[0]
  const tab = screen.tabs.find((t) => t.id === route.query.get('tab')) ?? screen.tabs[0]
  useEffect(() => {
    const el = route.anchor ? document.getElementById(route.anchor) : null
    if (el) el.scrollIntoView()
    else window.scrollTo(0, 0)
    document.title = `${screen.tabs.length > 1 ? `${tab.label} | ` : ''}${screen.name} | Granite Ridge Water`
  }, [route.name, route.anchor, tab.id])

  return (
    <div className="min-h-screen md:flex">
      <a href="#main" onClick={(e) => { e.preventDefault(); document.getElementById('main')?.focus() }} className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:bg-surface focus:p-2">
        Skip to content
      </a>
      <nav aria-label="Screens" className="border-b border-line bg-surface px-4 py-4 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:overflow-y-auto md:border-b-0 md:border-r print:hidden">
        <p className="text-base font-bold">Granite Ridge Water</p>
        <p className="mt-1 text-sm text-ink-2">Common-area irrigation</p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-2 text-sm md:block md:space-y-1.5">
          {SCREENS.filter((s) => s.menu).map((s) => (
            <li key={s.route}>
              <a
                href={`#${s.route}`}
                aria-current={screen.route === s.route ? 'page' : undefined}
                className={screen.route === s.route ? 'font-semibold text-ink underline decoration-2 underline-offset-4' : 'text-ink underline-offset-4 hover:underline'}
              >
                {s.name}
              </a>
            </li>
          ))}
        </ul>
      </nav>
      <div className="min-w-0 flex-1">
        <main id="main" tabIndex={-1} className="mx-auto max-w-5xl px-4 py-6 outline-none md:px-8 md:py-10">
          {screen.tabs.length > 1 && <ScreenTabs screen={screen.name} route={screen.route} tabs={screen.tabs} current={tab.id} />}
          <div key={`${screen.route}-${tab.id}`}>{tab.render(route, model)}</div>
        </main>
        <footer className="mx-auto max-w-5xl border-t border-line px-4 py-6 text-sm text-ink-2 md:px-8">
          <p>Estimates are based on City of Mesa published rates and HOA records. Bills from the City are the official record.</p>
          <p className="mt-2 print:hidden">
            <a href="#about" className="underline underline-offset-4">About the data</a> · Data built {new Date(data.generatedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}.
          </p>
        </footer>
      </div>
    </div>
  )
}
