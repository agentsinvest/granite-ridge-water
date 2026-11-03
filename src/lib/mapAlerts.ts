/**
 * Current problems as markers on the site map. Pure: no React, so the placement can be tested.
 *
 * A problem is an active leak flag (not fixed, not a false alarm) or a watering check that needs action.
 * Its marker goes next to the map zone of the first station it names that is on the map, otherwise next to
 * its meter's pin. Several markers at one spot sit side by side so none hides another.
 */

export type Point = [number, number]

type FlagLike = { id: string; title: string; summary: string; meter: string; zones: string[]; status: string }
type CheckLike = { id: string; title: string; detail: string; kind: 'action' | 'question'; stations: string[] }
type MapLike = {
  canvas: { width: number; height: number }
  meters: { meter: string; at: Point }[]
  zones?: { id: string; stations: string[]; label_at: Point }[]
}

export type MapAlert = {
  /** Unique id, also the anchor on the Problems screen. */
  id: string
  kind: 'flag' | 'check'
  title: string
  /** The first one or two sentences of the summary or detail, for the hover card. */
  blurb: string
  /** Plain words for where it stands, like "Not checked yet". */
  status: string
  meter: string
  /** Zone label like "C15" when the problem is placed on a zone, otherwise null (placed on the meter). */
  zone: string | null
  href: string
  at: Point
}

const FLAG_STATUS: Record<string, string> = {
  suggested: 'Not checked yet',
  open: 'Confirmed, not fixed',
  investigating: 'Being checked',
}

/** First sentence, so the hover card stays short. Keeps decimals like "1.7 inches" whole. */
export function firstSentence(text: string): string {
  const m = text.match(/^.*?[.!?](?=\s+[A-Z(]|\s*$)/)
  return (m ? m[0] : text).trim()
}

/** The first two sentences when they fit a hover card (about 320 characters), otherwise the first one. */
export function shortBlurb(text: string): string {
  const one = firstSentence(text)
  const rest = text.slice(text.indexOf(one) + one.length).trim()
  if (!rest) return one
  const two = `${one} ${firstSentence(rest)}`
  return two.length <= 320 ? two : one
}

export const checkAnchor = (id: string) => `check-${id}`

// Offsets from the spot the marker belongs to, in map pixels: right of a meter pin's top, or right of a zone label.
const STEP = 36
const FROM_METER: Point = [40, -30]
const FROM_ZONE: Point = [46, 0]
const EDGE = 20

export function mapAlerts(map: MapLike, flags: FlagLike[], meters: { id: string; checks?: CheckLike[] }[]): MapAlert[] {
  const zoneOf = (stations: string[]) => {
    for (const s of stations) {
      const z = map.zones?.find((x) => x.stations.includes(s))
      if (z) return z
    }
    return null
  }
  type Pending = Omit<MapAlert, 'at'> & { base: Point; from: Point; key: string }
  const pending: Pending[] = []
  const place = (meter: string, stations: string[]) => {
    const z = zoneOf(stations)
    if (z) return { base: z.label_at, from: FROM_ZONE, key: `zone:${z.id}`, zone: z.stations.length === 1 ? z.stations[0] : z.id.toUpperCase() }
    const pin = map.meters.find((p) => p.meter === meter)
    return pin ? { base: pin.at, from: FROM_METER, key: `meter:${meter}`, zone: null } : null
  }
  for (const f of flags) {
    if (!(f.status in FLAG_STATUS)) continue
    const p = place(f.meter, f.zones)
    if (!p) continue
    pending.push({ id: f.id, kind: 'flag', title: f.title, blurb: shortBlurb(f.summary), status: FLAG_STATUS[f.status], meter: f.meter, href: `#problems/${f.id}`, ...p })
  }
  for (const m of meters) {
    for (const c of m.checks ?? []) {
      if (c.kind !== 'action') continue
      const p = place(m.id, c.stations)
      if (!p) continue
      pending.push({ id: checkAnchor(c.id), kind: 'check', title: c.title, blurb: shortBlurb(c.detail), status: 'Watering check for the landscaper', meter: m.id, href: `#problems/${checkAnchor(c.id)}`, ...p })
    }
  }
  const count = new Map<string, number>()
  for (const p of pending) count.set(p.key, (count.get(p.key) ?? 0) + 1)
  const seen = new Map<string, number>()
  return pending.map(({ base, from, key, ...a }) => {
    const i = seen.get(key) ?? 0
    seen.set(key, i + 1)
    // A row that would run off the right edge goes to the left of the spot instead, so markers never pile up.
    const leftward = base[0] + from[0] + ((count.get(key) ?? 1) - 1) * STEP > map.canvas.width - EDGE
    const x = Math.min(Math.max(leftward ? base[0] - from[0] - i * STEP : base[0] + from[0] + i * STEP, EDGE), map.canvas.width - EDGE)
    const y = Math.min(Math.max(base[1] + from[1], EDGE), map.canvas.height - EDGE)
    return { ...a, at: [x, y] as Point }
  })
}

type Installed = { from: string | null; to: string | null; in_use_by?: string; note?: string } | undefined

const longDay = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })
const shortDay = (iso: string) => new Date(`${iso}T12:00:00`).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })

/** "Installed Apr 30, 2025", "Installed between Sep 13 and Oct 11, 2024", or why it is not known. Never guesses a day. */
export function installText(i: Installed): string {
  if (!i || i.from === null || i.to === null) {
    return i?.in_use_by ? `Install date not on file. Working by ${longDay(i.in_use_by)}.` : 'Install date not on file.'
  }
  if (i.from === i.to) return `Installed ${longDay(i.from)}.`
  return i.from.slice(0, 4) === i.to.slice(0, 4) ? `Installed between ${shortDay(i.from)} and ${longDay(i.to)}.` : `Installed between ${longDay(i.from)} and ${longDay(i.to)}.`
}
