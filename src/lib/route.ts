import { useEffect, useState } from 'react'

export const ROUTES = ['home', 'plan', 'action', 'problems', 'water', 'calculator', 'history', 'about', 'checklist'] as const
export type RouteName = (typeof ROUTES)[number]
export type Route = { name: RouteName; anchor: string | null; query: URLSearchParams }

/**
 * Hashes from before the October 2026 regrouping, mapped to their new screen and tab.
 * Shared links keep working: the address bar is rewritten to the new hash without adding a history entry.
 */
const OLD: Record<string, { name: RouteName; tab?: string }> = {
  overview: { name: 'home' },
  moves: { name: 'plan' },
  quickwins: { name: 'plan', tab: 'target' },
  schedule: { name: 'water', tab: 'schedule' },
  budget: { name: 'water', tab: 'budget' },
  whatif: { name: 'calculator', tab: 'whatif' },
  invest: { name: 'calculator', tab: 'invest' },
  // Links shared before the screens were split used #what-if for the investment calculator.
  'what-if': { name: 'calculator', tab: 'invest' },
  experiments: { name: 'calculator', tab: 'did-it-work' },
  bills: { name: 'history', tab: 'bills' },
  data: { name: 'about' },
}

/** Anchors on the old Meters screen that now live on Problems: the leak and check sections, and flag ids (they start with a year). */
const isProblemAnchor = (a: string | null) => a !== null && (a === 'leaks-heading' || a === 'checks-heading' || /^\d{4}-/.test(a))

export function parseHash(hash: string): Route & { redirected: boolean } {
  const raw = hash.replace(/^#/, '')
  const [path, q = ''] = raw.split('?')
  const [first, anchor = null] = path.split('/')
  const query = new URLSearchParams(q)
  if (first === 'meters') {
    if (isProblemAnchor(anchor)) return { name: 'problems', anchor, query, redirected: true }
    if (!query.has('tab')) query.set('tab', 'meters')
    return { name: 'water', anchor, query, redirected: true }
  }
  const old = OLD[first]
  if (old) {
    if (old.tab && !query.has('tab')) query.set('tab', old.tab)
    return { name: old.name, anchor, query, redirected: true }
  }
  const known = (ROUTES as readonly string[]).includes(first)
  return { name: known ? (first as RouteName) : 'home', anchor: known ? anchor : null, query, redirected: false }
}

export function toHash(name: RouteName, anchor: string | null, query: URLSearchParams): string {
  const s = query.toString()
  return `#${name}${anchor ? `/${anchor}` : ''}${s ? `?${s}` : ''}`
}

export function useRoute(): Route {
  const read = () => {
    const r = parseHash(window.location.hash)
    if (r.redirected) history.replaceState(null, '', toHash(r.name, r.anchor, r.query))
    return { name: r.name, anchor: r.anchor, query: r.query }
  }
  const [route, setRoute] = useState(read)
  useEffect(() => {
    const on = () => setRoute(read())
    window.addEventListener('hashchange', on)
    return () => window.removeEventListener('hashchange', on)
  }, [])
  return route
}

/** Update the query part of the current hash without adding a history entry or scrolling. Keeps the screen, anchor, and tab. */
export function setQuery(params: Record<string, string | null>) {
  const cur = parseHash(window.location.hash)
  const q = new URLSearchParams()
  const tab = cur.query.get('tab')
  if (tab) q.set('tab', tab)
  for (const [k, v] of Object.entries(params)) if (v !== null && v !== '') q.set(k, v)
  history.replaceState(null, '', toHash(cur.name, cur.anchor, q))
}

/** A link to a screen, optionally a tab on it, and optionally a spot on the page. */
export function href(name: RouteName, opts: { tab?: string; anchor?: string; params?: Record<string, string> } = {}): string {
  const q = new URLSearchParams()
  if (opts.tab) q.set('tab', opts.tab)
  for (const [k, v] of Object.entries(opts.params ?? {})) q.set(k, v)
  return toHash(name, opts.anchor ?? null, q)
}
