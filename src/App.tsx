import { useEffect, useState } from 'react'
import { data } from './lib/data'
import { MetersAndAreas } from './pages/MetersAndAreas'
import { Bills } from './pages/Bills'
import { Schedule } from './pages/Schedule'

const SCREENS = [
  { name: 'Overview', route: null },
  { name: 'How we got here', route: null },
  { name: 'Meters and areas', route: 'meters' },
  { name: 'Watering schedule', route: 'schedule' },
  { name: 'How much should we use', route: null },
  { name: 'What if', route: null },
  { name: 'Recommended moves', route: null },
  { name: 'Bills', route: 'bills' },
  { name: 'Data freshness', route: null },
] as const

type Route = 'meters' | 'schedule' | 'bills'
const ROUTES: Route[] = ['meters', 'schedule', 'bills']
const readRoute = (): Route => ROUTES.find((r) => window.location.hash === `#${r}`) ?? 'meters'

export function App() {
  const [route, setRoute] = useState<Route>(readRoute)
  useEffect(() => {
    const onHash = () => {
      if (ROUTES.some((r) => window.location.hash === `#${r}`)) {
        setRoute(readRoute())
        window.scrollTo(0, 0)
      }
    }
    window.addEventListener('hashchange', onHash)
    return () => window.removeEventListener('hashchange', onHash)
  }, [])

  return (
    <div className="min-h-screen md:flex">
      <a href="#main" className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-10 focus:bg-surface focus:p-2">
        Skip to content
      </a>
      <nav aria-label="Screens" className="border-b border-line bg-surface px-4 py-4 md:sticky md:top-0 md:h-screen md:w-60 md:shrink-0 md:border-b-0 md:border-r">
        <p className="text-base font-bold">Granite Ridge Water</p>
        <p className="mt-1 text-sm text-ink-2">Common-area irrigation</p>
        <ul className="mt-4 flex flex-wrap gap-x-4 gap-y-1 text-sm md:block md:space-y-1">
          {SCREENS.map((s) =>
            s.route ? (
              <li key={s.name}>
                <a
                  href={`#${s.route}`}
                  aria-current={route === s.route ? 'page' : undefined}
                  className={route === s.route ? 'font-semibold text-ink underline decoration-2 underline-offset-4' : 'text-ink underline-offset-4 hover:underline'}
                >
                  {s.name}
                </a>
              </li>
            ) : (
              <li key={s.name} className="text-ink-2">
                {s.name} <span className="sr-only md:not-sr-only md:text-xs">(coming)</span>
              </li>
            ),
          )}
        </ul>
      </nav>
      <div className="min-w-0 flex-1">
        <main id="main" className="mx-auto max-w-5xl px-4 py-6 md:px-8 md:py-10">
          {route === 'bills' ? <Bills data={data} /> : route === 'schedule' ? <Schedule data={data} /> : <MetersAndAreas data={data} />}
        </main>
        <footer className="mx-auto max-w-5xl border-t border-line px-4 py-6 text-sm text-ink-2 md:px-8">
          <p>Estimates are based on City of Mesa published rates and HOA records. Bills from the City are the official record.</p>
          <p className="mt-2">Data built {new Date(data.generatedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}.</p>
        </footer>
      </div>
    </div>
  )
}
