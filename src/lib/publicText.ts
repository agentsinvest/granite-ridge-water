// Text from the data files is written for maintainers too: it cites file paths and internal notes. Homeowners see the
// same facts with the paths turned into plain names. Add `?maintainer=1` to the address to see the raw text.

const NAMES: [RegExp, string][] = [
  [/^data\/usage/, 'the daily meter reads'],
  [/^data\/hourly/, 'the hourly meter reads'],
  [/^data\/billing-periods/, 'the meter read periods'],
  [/^data\/bills/, 'the City bills'],
  [/^data\/flags/, 'the problem notes'],
  [/^data\/rates/, 'the City rates on file'],
  [/^data\/(config|map|areas)/, 'the site records'],
  [/^sources\/controllers\/eco-verde/, 'the Eco Verde assessment'],
  [/^sources\/controllers\/hydropoint/, 'the WeatherTRAK controller reports'],
  [/^sources\/waterfluence/, 'the Waterfluence exports'],
  [/^sources\/workbook/, "Jennifer's water model workbook"],
  [/^sources\/city/, 'City of Mesa documents'],
  [/^sources\/(pl|bills)/, 'HOA financial records'],
  [/^sources\/maps/, 'the HOA area map'],
  [/^docs\/analysis/, "the HOA's water analysis notes"],
]

const PATH = /\b(?:data|sources|docs)\/[\w./-]*[\w/]/g

export function isMaintainer(): boolean {
  try {
    return new URLSearchParams(window.location.hash.split('?')[1] ?? '').get('maintainer') === '1' || new URLSearchParams(window.location.search).get('maintainer') === '1'
  } catch {
    return false
  }
}

function name(path: string): string {
  return NAMES.find(([re]) => re.test(path))?.[1] ?? 'HOA records'
}

/** The text with file paths replaced by plain names and maintainer references removed. */
export function publicText(text: string, maintainer = isMaintainer()): string {
  if (maintainer) return text
  let t = text
    // "(see INVENTORY.md)", "(sources/x.md)", "(data/a.md; docs/b.md)" carry nothing for homeowners.
    .replace(/\s*\((?:see )?(?:INVENTORY|CLAUDE|README|RECONCILIATION)\.md\)/g, '')
    .replace(/\s*\((?:[^()]*?\b(?:data|sources|docs)\/[^()]*)\)/g, '')
    .replace(/\s*(?:See |see )?(?:INVENTORY|CLAUDE)\.md\.?/g, '')
    .replace(PATH, (p) => name(p))
    .replace(/\bmeter-(\d)\b/g, 'meter $1')
  // Several paths in a row collapse to repeated names; keep each once.
  t = t.replace(/(the [^;,.]+?)(?:[;,] \1)+/g, '$1')
  return t.replace(/\s+([.,;])/g, '$1').replace(/\s{2,}/g, ' ').trim()
}
