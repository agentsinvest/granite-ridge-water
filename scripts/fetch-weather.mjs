#!/usr/bin/env node
// Update daily rain (NOAA ACIS, COOP East Mesa) and daily ETo (AZMET Queen Creek) markdown files in data/weather/.
// Run from the repo root: node scripts/fetch-weather.mjs [--from YYYY-MM-DD] [--to YYYY-MM-DD]
// Defaults: from 2026-07-01 to today. Rows inside the range are replaced; rows outside it are kept.
// This runs on a maintainer's machine only. The site never calls these APIs.
// Behind an HTTPS proxy (as in a Claude Code cloud session), run with NODE_USE_ENV_PROXY=1 so fetch uses it.

import { mkdirSync, readFileSync, writeFileSync, existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
// The data file records the 6-digit COOP number (the public-site check allows no digit run over 6 in /data).
const RAIN = { id: 'USC00022782', fileId: 'COOP 022782', name: 'East Mesa (NOAA COOP)', dir: 'daily-rain' }
const ETO = { id: 'az22', name: 'Queen Creek (AZMET)', dir: 'daily-eto' }

const arg = (name, fallback) => {
  const i = process.argv.indexOf(name)
  return i > 0 ? process.argv[i + 1] : fallback
}
const today = new Date().toISOString().slice(0, 10)
const from = arg('--from', '2026-07-01')
const to = arg('--to', today)
if (!/^\d{4}-\d{2}-\d{2}$/.test(from) || !/^\d{4}-\d{2}-\d{2}$/.test(to) || from > to) {
  console.error('Usage: node scripts/fetch-weather.mjs [--from YYYY-MM-DD] [--to YYYY-MM-DD]')
  process.exit(1)
}
const days = Math.round((Date.parse(to) - Date.parse(from)) / 86_400_000) + 1

async function fetchRain() {
  const res = await fetch('https://data.rcc-acis.org/StnData', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ sid: RAIN.id, sdate: from, edate: to, elems: 'pcpn' }),
  })
  if (!res.ok) throw new Error(`NOAA ACIS returned ${res.status}`)
  const json = await res.json()
  if (json.error) throw new Error(`NOAA ACIS: ${json.error}`)
  return json.data.map(([date, raw]) => {
    const reported = String(raw).trim()
    const up = reported.toUpperCase()
    // T = trace, counted as 0. M = missing, S = included in a later day's total: both stay blank, never 0.
    const inches = up === 'T' ? '0' : up === 'M' || up === 'S' || up === '' ? '' : String(Number.parseFloat(reported))
    if (inches !== '' && Number.isNaN(Number(inches))) throw new Error(`NOAA ACIS: unexpected value "${reported}" on ${date}`)
    return { date, cells: [inches, reported || 'M'] }
  })
}

async function fetchEto() {
  const url = `https://api.azmet.arizona.edu/v1/observations/daily/${ETO.id}/${from}T00:00/P${days}D`
  const res = await fetch(url)
  if (!res.ok) throw new Error(`AZMET returned ${res.status}`)
  const json = await res.json()
  const list = Array.isArray(json) ? json : json.data
  if (!Array.isArray(list)) throw new Error('AZMET: no data array in the response')
  return list
    .map((r) => {
      const date = r.date_datetime ? String(r.date_datetime).slice(0, 10) : new Date(Date.UTC(Number(r.date_year), 0, Number(r.date_doy))).toISOString().slice(0, 10)
      const v = r.eto_pen_mon_in
      // AZMET marks missing values with null or large negative sentinels; keep them blank.
      const ok = v !== null && v !== undefined && v !== '' && Number(v) > -99
      return { date, cells: [ok ? String(Number(v)) : ''] }
    })
    .filter((r) => r.date >= from && r.date <= to)
}

function readRows(file) {
  if (!existsSync(file)) return new Map()
  const rows = new Map()
  for (const line of readFileSync(file, 'utf8').split('\n')) {
    const m = line.match(/^\| (\d{4}-\d{2}-\d{2}) \|(.*)\|$/)
    if (m) rows.set(m[1], m[2].split('|').map((c) => c.trim()))
  }
  return rows
}

function write(station, kind, headers, fresh, source) {
  const byYear = new Map()
  for (const r of fresh) byYear.set(r.date.slice(0, 4), [...(byYear.get(r.date.slice(0, 4)) ?? []), r])
  for (const [year, rows] of byYear) {
    const file = join(root, 'data', 'weather', station.dir, `${year}.md`)
    const merged = readRows(file)
    for (const d of [...merged.keys()]) if (d >= from && d <= to) merged.delete(d)
    for (const r of rows) merged.set(r.date, r.cells)
    const dates = [...merged.keys()].sort()
    const body = [
      '---',
      `year: ${year}`,
      `station_id: "${station.fileId ?? station.id}"`,
      `station_name: "${station.name}"`,
      `source: "${source}"`,
      `retrieved_on: ${today}`,
      `covers: "${dates[0]} to ${dates.at(-1)}"`,
      '---',
      '',
      `Daily ${kind} written by scripts/fetch-weather.mjs. Do not edit by hand; run the script again instead.`,
      '',
      `| Date | ${headers.join(' | ')} |`,
      `|---|${headers.map(() => '---').join('|')}|`,
      ...dates.map((d) => `| ${d} | ${merged.get(d).join(' | ')} |`),
      '',
    ].join('\n')
    mkdirSync(dirname(file), { recursive: true })
    writeFileSync(file, body)
    console.log(`fetch-weather: wrote ${rows.length} days to data/weather/${station.dir}/${year}.md`)
  }
}

let failed = false
try {
  write(RAIN, 'rain from the NOAA gauge', ['Rain in', 'Reported'], await fetchRain(), 'NOAA ACIS StnData, element pcpn (inches). T = trace, counted as 0. M = missing and S = included in a later total: left blank, never 0.')
} catch (e) {
  failed = true
  console.error(`fetch-weather: rain not updated: ${e.message}`)
}
try {
  write(ETO, 'reference evapotranspiration (ETo)', ['ETo in'], await fetchEto(), 'AZMET API v1 daily observations, field eto_pen_mon_in (Penman-Monteith ETo, inches). Blank = not reported.')
} catch (e) {
  failed = true
  console.error(`fetch-weather: ETo not updated: ${e.message}`)
}
process.exit(failed ? 1 : 0)
