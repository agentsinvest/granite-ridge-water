import { readFileSync, readdirSync, statSync, mkdirSync, writeFileSync } from 'node:fs'
import { join, relative, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { z } from 'zod'
import { parseMarkdown, keyLine, type ParsedFile, type Table } from './markdown'
import * as S from './schemas'
import type { SiteData } from './site-data'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const DOC_FILES = new Set(['README.md', 'INVENTORY.md', 'RECONCILIATION.md'])

export class DataError extends Error {}

function walk(dir: string): string[] {
  return readdirSync(dir).flatMap((name) => {
    const p = join(dir, name)
    if (statSync(p).isDirectory()) return walk(p)
    return name.endsWith('.md') && !DOC_FILES.has(name) ? [p] : []
  })
}

function fail(file: string, line: number | null, msg: string): never {
  throw new DataError(`${file}${line ? `:${line}` : ''}: ${msg}`)
}

function check<T extends z.ZodTypeAny>(schema: T, value: unknown, file: string, text: string): z.infer<T> {
  const r = schema.safeParse(value)
  if (r.success) return r.data
  const issue = r.error.issues[0]
  const key = issue.path[0]
  fail(file, typeof key === 'string' ? keyLine(text, key) : null, `${issue.path.join('.') || '(frontmatter)'}: ${issue.message}`)
}

function rows<T extends z.ZodTypeAny>(table: Table | undefined, schema: T, file: string): z.infer<T>[] {
  if (!table) fail(file, null, 'expected a markdown table')
  return table.rows.map((row) => {
    const r = schema.safeParse(row.cells)
    if (!r.success) {
      const issue = r.error.issues[0]
      fail(file, row.line, `column "${String(issue.path[0] ?? '')}": ${issue.message}`)
    }
    return r.data
  })
}

function firstTable(p: ParsedFile, headers: string[], file: string): Table {
  const t = p.tables.find((t) => headers.every((h) => t.headers.includes(h)))
  if (!t) fail(file, null, `missing table with columns: ${headers.join(', ')}`)
  return t
}

export function buildData(dataDir = join(root, 'data')): SiteData {
  const out: SiteData = {
    generatedAt: new Date().toISOString(),
    meters: [],
    areas: { rows: [], frontmatter: {} },
    map: undefined as unknown as SiteData['map'],
    billingPeriods: {},
    usage: {},
    hourly: {},
    financials: {},
    flags: [],
    rates: [],
    bills: [],
    events: [],
    annualRainfall: [],
    investments: [],
    config: { site: {}, plantFactors: {} },
    experiments: [],
    options: [],
    dataNeeds: [],
    budgetCheck: null,
    meterYears: null,
    turfMinimum: null,
    monthlyNormals: null,
    quickWins: null,
    actions: [],
    evidenceLabels: {},
    controllers: [],
    openTodos: [],
  }
  for (const abs of walk(dataDir).sort()) {
    const file = relative(root, abs)
    const rel = relative(dataDir, abs).split('\\').join('/')
    const text = readFileSync(abs, 'utf8')
    if (text.includes('\u2014')) fail(file, text.slice(0, text.indexOf('\u2014')).split('\n').length, 'em dash is not allowed in data files')
    let p: ParsedFile
    try {
      p = parseMarkdown(text)
    } catch (e) {
      fail(file, null, (e as Error).message)
    }
    const fm = p.frontmatter
    if (typeof fm.todo === 'string') out.openTodos.push({ file: rel, todo: fm.todo })
    let m: RegExpMatchArray | null
    if ((m = rel.match(/^meters\/(meter-\d+)\.md$/))) {
      const meter = check(S.meterSchema, fm, file, text)
      if (meter.id !== m[1]) fail(file, keyLine(text, 'id'), `id "${meter.id}" does not match file name`)
      out.meters.push(meter)
    } else if (rel === 'areas.md') {
      out.areas.frontmatter = check(S.areasFrontmatterSchema, fm, file, text)
      out.areas.rows = rows(firstTable(p, ['Area id', 'Gross sq ft'], file), S.areaRowSchema, file)
    } else if (rel === 'map.md') {
      out.map = check(S.mapSchema, fm, file, text)
    } else if ((m = rel.match(/^billing-periods\/(meter-\d+)\.md$/))) {
      const f = check(S.billingPeriodsFrontmatterSchema, fm, file, text)
      if (f.meter !== m[1]) fail(file, keyLine(text, 'meter'), 'meter does not match file name')
      const r = rows(firstTable(p, ['Period start', 'Usage'], file), S.billingPeriodRowSchema, file)
      out.billingPeriods[m[1]] = { unit: f.unit, unitConfidence: f.unit_confidence, rows: r.map((x) => ({ start: x['Period start'], end: x['Period end'], usage: x.Usage })) }
    } else if ((m = rel.match(/^usage\/(meter-\d+)\/(\d{4})\.md$/))) {
      check(S.usageFrontmatterSchema, fm, file, text)
      const r = rows(firstTable(p, ['Date', 'Gallons'], file), S.usageRowSchema, file)
      out.usage[m[1]] ??= {}
      out.usage[m[1]][m[2]] = r.map((x) => ({ date: x.Date, gallons: x.Gallons, hours: x['Hours reported'], minHour: x['Min hour gal'] }))
    } else if ((m = rel.match(/^hourly\/(meter-\d+)\/(\d{4})\.md$/))) {
      const f = check(S.hourlyFrontmatterSchema, fm, file, text)
      if (f.meter !== m[1]) fail(file, keyLine(text, 'meter'), 'meter does not match folder')
      const table = firstTable(p, ['Read time', 'Gallons'], file)
      const r = rows(table, S.hourlyRowSchema, file)
      const reads = r.map((x) => ({ time: x['Read time'], gallons: x.Gallons as number }))
      reads.forEach((x, i) => {
        if (!x.time.startsWith(m![2])) fail(file, table.rows[i].line, `read time ${x.time} is not in ${m![2]}`)
        if (i > 0 && x.time <= reads[i - 1].time) fail(file, table.rows[i].line, 'read times must be in order with no repeats')
      })
      const prev = out.hourly[m[1]]
      out.hourly[m[1]] = prev
        ? { covers: `${prev.covers}; ${f.covers}`, source: `${prev.source}; ${f.source}`, reads: [...prev.reads, ...reads] }
        : { covers: f.covers, source: f.source, reads }
    } else if ((m = rel.match(/^financials\/(\d{4})\.md$/))) {
      const f = check(S.financialsFrontmatterSchema, fm, file, text)
      const r = rows(firstTable(p, ['Account', 'Actual'], file), S.financialsRowSchema, file)
      out.financials[m[1]] = { needsReview: f.needs_review ?? false, lines: r.map((x) => ({ account: x.Account, line: x.Line, actual: x.Actual, budget: x.Budget })) }
    } else if (rel.match(/^flags\/[^/]+\.md$/)) {
      const flag = check(S.flagSchema, fm, file, text)
      if (`flags/${flag.id}.md` !== rel) fail(file, keyLine(text, 'id'), 'id does not match file name')
      for (const e of flag.excess_water?.episodes ?? []) if (e.from > e.to) fail(file, keyLine(text, 'excess_water'), `episode ${e.from} to ${e.to} ends before it starts`)
      out.flags.push(flag)
    } else if ((m = rel.match(/^rates\/(\d{4}-\d{2}-\d{2})\.md$/))) {
      const rate = check(S.rateSchema, fm, file, text)
      if (rate.applies_from_period_end !== m[1]) fail(file, keyLine(text, 'applies_from_period_end'), 'does not match file name')
      out.rates.push({ id: m[1], ...rate })
    } else if ((m = rel.match(/^bills\/(meter-\d+)\/(\d{4}-\d{2})\.md$/))) {
      const bill = check(S.billSchema, fm, file, text)
      if (bill.meter !== m[1]) fail(file, keyLine(text, 'meter'), 'meter does not match folder')
      if (bill.period_end && bill.period_end.slice(0, 7) !== m[2]) fail(file, keyLine(text, 'period_end'), 'file name must be the month the period ends')
      const items = rows(firstTable(p, ['Line item', 'Amount'], file), S.billLineSchema, file)
      const notes = p.body.match(/^Notes:\s*(.*)$/m)?.[1] ?? ''
      out.bills.push({ id: rel.slice(0, -3), ...bill, lineItems: items.map((i) => ({ name: i['Line item'], amount: i.Amount })), notes })
    } else if (rel === 'weather/annual-rainfall.md') {
      check(S.annualRainFrontmatterSchema, fm, file, text)
      out.annualRainfall = rows(firstTable(p, ['Year', 'Rain in'], file), S.annualRainRowSchema, file).map((r) => ({ year: Number(r.Year), inches: r['Rain in'], complete: r.Complete === 'yes' }))
    } else if (rel === 'events.md') {
      check(S.eventsFrontmatterSchema, fm, file, text)
      out.events = rows(firstTable(p, ['Date', 'Precision'], file), S.eventRowSchema, file).map((x) => ({
        date: x.Date, precision: x.Precision, meter: x.Meter, type: x.Type, what: x['What happened'], source: x.Source,
      }))
    } else if (rel.match(/^investments\/[^/]+\.md$/)) {
      out.investments.push({ id: rel.slice('investments/'.length, -3), ...check(S.investmentSchema, fm, file, text) })
    } else if (rel.match(/^experiments\/[^/]+\.md$/)) {
      const x = check(S.experimentSchema, fm, file, text)
      if (`experiments/${x.id}.md` !== rel) fail(file, keyLine(text, 'id'), 'id does not match file name')
      if (x.start && x.end && x.start > x.end) fail(file, keyLine(text, 'end'), 'ends before it starts')
      if (x.status !== 'planned' && !x.start) fail(file, keyLine(text, 'start'), `a ${x.status} experiment needs a start date`)
      out.experiments.push(x)
    } else if (rel.match(/^options\/[^/]+\.md$/)) {
      const o = check(S.optionSchema, fm, file, text)
      if (`options/${o.id}.md` !== rel) fail(file, keyLine(text, 'id'), 'id does not match file name')
      if (o.change.kind === 'turn_down' && o.change.percent === null) fail(file, keyLine(text, 'change'), 'turn_down needs a percent')
      out.options.push(o)
    } else if (rel.match(/^controllers\/[^/]+\.md$/)) {
      const c = check(S.controllerSchema, fm, file, text)
      const table = firstTable(p, ['Station', 'Waters'], file)
      const r = rows(table, S.stationRowSchema, file)
      r.forEach((x, i) => {
        if (!x.Station.startsWith(c.id)) fail(file, table.rows[i].line, `station ${x.Station} is not on controller ${c.id}`)
        if (r.findIndex((y) => y.Station === x.Station) !== i) fail(file, table.rows[i].line, `station ${x.Station} is listed twice`)
      })
      out.controllers.push({
        ...c,
        stations: r.map((x) => ({
          station: x.Station, meter: x.Meter, waters: x.Waters, type: x.Type, gpm: x.GPM, program: x.Program, runMin: x['Run min'], cycles: x.Cycles, days: x.Days, findings: x.Findings, source: x.Source,
        })),
      })
    } else if (rel.match(/^actions\/[^/]+\.md$/)) {
      const a = check(S.actionSchema, fm, file, text)
      if (`actions/${a.id}.md` !== rel) fail(file, keyLine(text, 'id'), 'id does not match file name')
      if (a.savings_from && a.savings_per_year) fail(file, keyLine(text, 'savings_per_year'), 'use savings_from or savings_per_year, not both')
      if (a.savings_per_year && !a.savings_source) fail(file, keyLine(text, 'savings_per_year'), 'savings_per_year needs a savings_source')
      if (a.savings_per_year && a.savings_per_year[0] > a.savings_per_year[1]) fail(file, keyLine(text, 'savings_per_year'), 'low is above high')
      if (a.history.at(-1)!.date > a.updated) fail(file, keyLine(text, 'updated'), 'updated is before the last history entry')
      for (let i = 1; i < a.history.length; i++) if (a.history[i].date < a.history[i - 1].date) fail(file, keyLine(text, 'history'), 'history must be oldest first')
      out.actions.push({ ...a, body: p.body.trim() })
    } else if (rel === 'data-needs.md') {
      check(S.dataNeedsFrontmatterSchema, fm, file, text)
      out.dataNeeds = rows(firstTable(p, ['Priority', 'Need'], file), S.dataNeedRowSchema, file).map((r) => ({
        priority: Number(r.Priority), need: r.Need, why: r['Why it matters'], unlocks: r['What it unlocks'], who: r['Who has it'], status: r.Status,
      }))
    } else if (rel === 'budget/annual-check.md') {
      const f = check(S.budgetCheckFrontmatterSchema, fm, file, text)
      const r = rows(firstTable(p, ['Scope', 'Measure'], file), S.budgetCheckRowSchema, file)
      out.budgetCheck = { period: f.period, source: f.source, note: f.note, rows: r.map((x) => ({ scope: x.Scope, measure: x.Measure, low: x['Low kgal'], high: x['High kgal'], source: x.Source, confidence: x.Confidence })) }
    } else if (rel === 'history/by-meter-year.md') {
      const f = check(S.historyFrontmatterSchema, fm, file, text)
      const r = rows(firstTable(p, ['Year', 'Meter'], file), S.historyRowSchema, file)
      out.meterYears = {
        source: f.source, confidence: f.confidence, covers: f.covers, note: f.note ?? '',
        rows: r.map((x) => ({ year: Number(x.Year), meter: x.Meter, kgal: x['Gallons kgal'], peakSurcharge: x['Peak surcharge'], complete: x.Complete === 'yes' })),
      }
    } else if (rel === 'budget/turf-minimum.md') {
      const f = check(S.turfMinimumFrontmatterSchema, fm, file, text)
      out.turfMinimum = {
        turfAreaSqFt: f.turf_area_sq_ft, plantFactor: f.plant_factor, efficiency: f.efficiency, effectiveRainShare: f.effective_rain_share, source: f.source, confidence: f.confidence,
      }
    } else if (rel === 'weather/monthly-normals.md') {
      const f = check(S.monthlyNormalsFrontmatterSchema, fm, file, text)
      const r = rows(firstTable(p, ['Month', 'ETo in'], file), S.monthlyNormalsRowSchema, file)
      if (r.map((x) => x.Month).join() !== 'Jan,Feb,Mar,Apr,May,Jun,Jul,Aug,Sep,Oct,Nov,Dec') fail(file, null, 'needs one row per month, January to December')
      out.monthlyNormals = {
        etoSource: f.eto_source, etoConfidence: f.eto_confidence, rainSource: f.rain_source, rainConfidence: f.rain_confidence,
        months: r.map((x) => ({ month: x.Month, eto: x['ETo in'], rainAvg: x['Rain avg in'], rainDry: x['Rain 2020 in'], rainWet: x['Rain 2021 in'] })),
      }
    } else if (rel === 'scenarios/quick-wins.md') {
      const plan = check(S.quickWinsPlanSchema, fm, file, text)
      for (const [k, l] of Object.entries(plan.levers)) if (l.by_year.length !== plan.years.length) fail(file, keyLine(text, k), `${k} needs one value per plan year`)
      out.quickWins = plan
    } else if (rel === 'config/site.md') {
      out.config.site = check(S.siteConfigSchema, fm, file, text)
    } else if (rel === 'config/plant-factors.md') {
      out.config.plantFactors = check(S.plantFactorsFrontmatterSchema, fm, file, text)
    } else {
      fail(file, null, 'no schema for this path; add one in scripts/schemas.ts before adding this kind of file')
    }
  }
  if (!out.map) fail('data/map.md', null, 'missing')
  // Cross-file checks
  const meterIds = new Set(out.meters.map((x) => x.id))
  const areaIds = new Set(out.areas.rows.map((r) => r['Area id']))
  for (const pin of out.map.meters) if (!meterIds.has(pin.meter)) fail('data/map.md', null, `unknown meter "${pin.meter}"`)
  for (const a of out.map.areas) if (!areaIds.has(a.id)) fail('data/map.md', null, `unknown area "${a.id}"`)
  if (!areaIds.has(out.map.streets.area)) fail('data/map.md', null, `unknown streets area "${out.map.streets.area}"`)
  const controllerIds = new Set((out.map.controllers ?? []).map((c) => c.id))
  for (const c of out.map.controllers ?? []) for (const m of c.meters) if (!meterIds.has(m)) fail('data/map.md', null, `controller ${c.id}: unknown meter "${m}"`)
  for (const z of out.map.zones ?? []) if (!controllerIds.has(z.controller)) fail('data/map.md', null, `zone ${z.id}: unknown controller "${z.controller}"`)
  const mapStationIds = new Set(out.controllers.flatMap((c) => c.stations.map((s) => s.station)))
  for (const z of out.map.zones ?? []) for (const s of z.stations) if (!mapStationIds.has(s)) fail('data/map.md', null, `zone ${z.id}: station "${s}" is not in data/controllers/`)
  for (const b of out.bills) if (!meterIds.has(b.meter)) fail(`data/${b.id}.md`, null, `unknown meter "${b.meter}"`)
  for (const id of Object.keys(out.hourly)) if (!meterIds.has(id)) fail(`data/hourly/${id}`, null, `unknown meter "${id}"`)
  for (const f of out.flags) if (!meterIds.has(f.meter)) fail(`data/flags/${f.id}.md`, null, `unknown meter "${f.meter}"`)
  const flagIds = new Set(out.flags.map((f) => f.id))
  for (const x of out.experiments) {
    if (!meterIds.has(x.meter)) fail(`data/experiments/${x.id}.md`, null, `unknown meter "${x.meter}"`)
    for (const id of x.linked_flags ?? []) if (!flagIds.has(id)) fail(`data/experiments/${x.id}.md`, null, `unknown flag "${id}"`)
  }
  if (out.quickWins) {
    const ids = new Set(out.investments.map((i) => i.id as string))
    for (const l of Object.values(out.quickWins.levers)) if (l.investment && !ids.has(l.investment)) fail('data/scenarios/quick-wins.md', null, `unknown investment "${l.investment}"`)
  }
  for (const r of out.meterYears?.rows ?? []) if (!meterIds.has(r.meter)) fail('data/history/by-meter-year.md', null, `unknown meter "${r.meter}"`)
  for (const o of out.options) for (const mid of o.meters) if (!meterIds.has(mid)) fail(`data/options/${o.id}.md`, null, `unknown meter "${mid}"`)
  const optionIds = new Set(out.options.map((o) => o.id))
  const investmentIds = new Set(out.investments.map((i) => i.id as string))
  const experimentIds = new Set(out.experiments.map((x) => x.id))
  const actionIds = new Set(out.actions.map((a) => a.id))
  for (const a of out.actions) {
    const where = `data/actions/${a.id}.md`
    if (a.meter.startsWith('meter-') && !meterIds.has(a.meter)) fail(where, null, `unknown meter "${a.meter}"`)
    for (const id of a.after) if (!actionIds.has(id)) fail(where, null, `after: unknown action "${id}"`)
    if (a.verify_experiment && !experimentIds.has(a.verify_experiment)) fail(where, null, `unknown experiment "${a.verify_experiment}"`)
    for (const ref of [...a.evidence, ...(a.savings_from ? [a.savings_from] : [])]) {
      const [kind, id] = [ref.slice(0, ref.indexOf(':')), ref.slice(ref.indexOf(':') + 1)]
      const known = kind === 'flag' ? flagIds : kind === 'option' ? optionIds : kind === 'investment' ? investmentIds : kind === 'experiment' ? experimentIds : null
      if (known && !known.has(id)) fail(where, null, `unknown ${kind} "${id}"`)
      if (kind === 'source') {
        // Evidence documents live in /sources or /docs. Only their title is published, never the path or the text.
        const path = join(root, `${id}.md`)
        let doc: string
        try {
          doc = readFileSync(path, 'utf8')
        } catch {
          fail(where, null, `evidence file not found: ${id}.md`)
        }
        const docFm = parseMarkdown(doc).frontmatter
        const title = typeof docFm.document === 'string' ? docFm.document : doc.match(/^# (.+)$/m)?.[1]
        if (!title) fail(where, null, `${id}.md has no document name or heading to show`)
        out.evidenceLabels[id] = title
      }
    }
  }
  for (const c of out.controllers) {
    const where = `data/controllers`
    for (const m of [...c.meters, ...c.stations.flatMap((s) => (s.meter ? [s.meter] : []))]) if (!meterIds.has(m)) fail(where, null, `controller ${c.id}: unknown meter "${m}"`)
    for (const s of c.stations) if (s.meter && !c.meters.includes(s.meter)) fail(where, null, `station ${s.station}: meter ${s.meter} is not one of controller ${c.id}'s meters`)
    const onMap = (out.map.controllers ?? []).find((x) => x.id === c.id)
    if (!onMap) fail(where, null, `controller ${c.id} is not on the map`)
  }
  const stationIds = new Set(out.controllers.flatMap((c) => c.stations.map((s) => s.station)))
  for (const a of out.actions) {
    for (const s of a.stations) if (!stationIds.has(s)) fail(`data/actions/${a.id}.md`, null, `unknown station "${s}"`)
    if (a.controller && out.controllers.length && !out.controllers.some((c) => c.name === a.controller)) fail(`data/actions/${a.id}.md`, null, `unknown controller "${a.controller}"`)
  }
  out.controllers.sort((a, b) => a.id.localeCompare(b.id))
  out.actions.sort((a, b) => a.id.localeCompare(b.id))
  out.dataNeeds.sort((a, b) => a.priority - b.priority)
  out.rates.sort((a, b) => a.id.localeCompare(b.id))
  out.bills.sort((a, b) => a.id.localeCompare(b.id))
  out.meters.sort((a, b) => a.id.localeCompare(b.id, undefined, { numeric: true }))
  return out
}

if (process.argv[1] && fileURLToPath(import.meta.url) === process.argv[1]) {
  try {
    const data = buildData()
    mkdirSync(join(root, 'src/generated'), { recursive: true })
    writeFileSync(join(root, 'src/generated/data.json'), JSON.stringify(data))
    console.log(`build-data: ${data.meters.length} meters, ${data.areas.rows.length} areas, ${data.flags.length} flags, ${Object.keys(data.financials).length} years of financials, ${data.openTodos.length} open todos`)
  } catch (e) {
    console.error(`build-data failed: ${(e as Error).message}`)
    process.exit(1)
  }
}
