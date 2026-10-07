// Writes public/data/watering-after-rain.csv from the same check the site shows. Runs after build-data.
import { mkdirSync, writeFileSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { buildData } from './build-data'
import { rainCsv } from '../src/engine/rainResponse'
import { buildRainCheck, meterName } from '../src/lib/rainCheck'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const data = buildData()
const check = buildRainCheck(data)
if (!check) {
  console.error('write-rain-csv failed: rain_check settings missing from data/config/site.md')
  process.exit(1)
}
const out = join(root, 'public/data/watering-after-rain.csv')
mkdirSync(dirname(out), { recursive: true })
writeFileSync(out, rainCsv(check.checks, (id) => meterName(data, id)))
console.log(`write-rain-csv: ${check.checks.length} rain events, ${check.checks.reduce((s, e) => s + e.meters.length, 0)} rows`)
