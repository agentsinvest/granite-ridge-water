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
    financials: {},
    flags: [],
    rates: [],
    bills: [],
    events: [],
    annualRainfall: [],
    investments: [],
    config: { site: {}, plantFactors: {} },
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
  for (const b of out.bills) if (!meterIds.has(b.meter)) fail(`data/${b.id}.md`, null, `unknown meter "${b.meter}"`)
  for (const f of out.flags) if (!meterIds.has(f.meter)) fail(`data/flags/${f.id}.md`, null, `unknown meter "${f.meter}"`)
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
