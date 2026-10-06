import { data } from './lib/data'
import { MetersAndAreas } from './pages/MetersAndAreas'

const SCREENS = [
  { name: 'Overview', ready: false },
  { name: 'How we got here', ready: false },
  { name: 'Meters and areas', ready: true },
  { name: 'How much should we use', ready: false },
  { name: 'What if', ready: false },
  { name: 'Recommended moves', ready: false },
  { name: 'Bills', ready: false },
  { name: 'Data freshness', ready: false },
]

export function App() {
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
            s.ready ? (
              <li key={s.name}>
                <a href="#main" aria-current="page" className="font-semibold text-ink underline decoration-2 underline-offset-4">
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
          <MetersAndAreas data={data} />
        </main>
        <footer className="mx-auto max-w-5xl border-t border-line px-4 py-6 text-sm text-ink-2 md:px-8">
          <p>Estimates are based on City of Mesa published rates and HOA records. Bills from the City are the official record.</p>
          <p className="mt-2">Data built {new Date(data.generatedAt).toLocaleDateString('en-US', { dateStyle: 'medium' })}.</p>
        </footer>
      </div>
    </div>
  )
}
