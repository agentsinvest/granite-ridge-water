import { useEffect, useState } from 'react'

export const ROUTES = ['overview', 'history', 'meters', 'schedule', 'budget', 'whatif', 'invest', 'moves', 'experiments', 'bills', 'data'] as const
export type RouteName = (typeof ROUTES)[number]
export type Route = { name: RouteName; anchor: string | null; query: URLSearchParams }

export function parseHash(hash: string): Route {
  const raw = hash.replace(/^#/, '')
  const [path, q = ''] = raw.split('?')
  const [first, anchor = null] = path.split('/')
  // Links shared before the screens were split used #what-if for the investment calculator.
  const name = first === 'what-if' ? 'invest' : first
  return { name: (ROUTES as readonly string[]).includes(name) ? (name as RouteName) : 'overview', anchor, query: new URLSearchParams(q) }
}

export function useRoute(): Route {
  const [route, setRoute] = useState(() => parseHash(window.location.hash))
  useEffect(() => {
    const on = () => setRoute(parseHash(window.location.hash))
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

/** Update the query part of the current hash without adding a history entry or scrolling. */
export function setQuery(name: RouteName, params: Record<string, string | null>) {
  const q = new URLSearchParams()
  for (const [k, v] of Object.entries(params)) if (v !== null && v !== '') q.set(k, v)
  const s = q.toString()
  history.replaceState(null, '', `#${name}${s ? `?${s}` : ''}`)
}
