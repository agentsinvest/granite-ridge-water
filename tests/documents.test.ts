import { describe, expect, it } from 'vitest'
import { checkPasscode, isSignedIn, readCookie, safeEqual, sessionCookie, sessionToken, COOKIE_NAME } from '../netlify/shared/auth'
import { handleDocs, type DocMeta, type DocStore } from '../netlify/shared/docs-api'
import { CHUNK_BYTES, MAX_FILE_BYTES, TRASH_DAYS } from '../netlify/shared/docs-config'
import { canPreview, defaultTitle, downloadName, fileKind } from '../src/lib/docsClient'

function memoryStore(): DocStore & { data: Map<string, unknown> } {
  const data = new Map<string, unknown>()
  return {
    data,
    getJSON: async (k) => (data.has(k) ? structuredClone(data.get(k)) : null),
    setJSON: async (k, v) => void data.set(k, structuredClone(v)),
    getBytes: async (k) => (data.get(k) as ArrayBuffer | undefined) ?? null,
    setBytes: async (k, v) => void data.set(k, v),
    delete: async (k) => void data.delete(k),
    keys: async (p) => [...data.keys()].filter((k) => k.startsWith(p)),
  }
}

let ids = 0
const setup = (start = '2026-11-01T12:00:00Z') => {
  const store = memoryStore()
  let now = new Date(start)
  const deps = { store, now: () => now, newId: () => `00000000-0000-4000-8000-${String(++ids).padStart(12, '0')}` }
  const req = (method: string, path: string, body?: unknown, raw?: BodyInit) =>
    handleDocs(new Request(`https://site.test/api/docs${path}`, { method, body: raw ?? (body ? JSON.stringify(body) : undefined) }), deps)
  return { store, req, advance: (ms: number) => (now = new Date(now.getTime() + ms)) }
}

const bytes = (n: number, fill = 1) => new Uint8Array(n).fill(fill)

async function upload(req: ReturnType<typeof setup>['req'], size: number, title = 'Meter 2 bill, Aug 2026') {
  const m = (await (await req('POST', '', { title, fileName: 'scan_001.pdf', contentType: 'application/pdf', size })).json()) as DocMeta
  for (let n = 0; n < m.chunks; n++) {
    const len = n < m.chunks - 1 ? m.chunkSize : size - m.chunkSize * (m.chunks - 1)
    expect((await req('PUT', `/${m.id}/chunk/${n}`, undefined, bytes(len, n + 1))).status).toBe(200)
  }
  const done = await req('POST', `/${m.id}/complete`)
  expect(done.status).toBe(200)
  return (await done.json()) as DocMeta
}

describe('documents API', () => {
  it('uploads a multi-piece file, lists it, and returns the same bytes', async () => {
    const { req } = setup()
    const size = CHUNK_BYTES * 2 + 123
    const m = await upload(req, size)
    expect(m.chunks).toBe(3)
    expect(m.status).toBe('ready')
    const list = await (await req('GET', '')).json()
    expect(list.documents.map((d: DocMeta) => d.title)).toEqual(['Meter 2 bill, Aug 2026'])
    let total = 0
    for (let n = 0; n < m.chunks; n++) {
      const buf = new Uint8Array(await (await req('GET', `/${m.id}/chunk/${n}`)).arrayBuffer())
      expect(buf[0]).toBe(n + 1)
      total += buf.byteLength
    }
    expect(total).toBe(size)
  })

  it('hides unfinished uploads and refuses to finish one with missing pieces', async () => {
    const { req } = setup()
    const m = (await (await req('POST', '', { title: 'Half', fileName: 'a.xlsx', size: CHUNK_BYTES + 1 })).json()) as DocMeta
    await req('PUT', `/${m.id}/chunk/0`, undefined, bytes(CHUNK_BYTES))
    expect((await req('POST', `/${m.id}/complete`)).status).toBe(409)
    expect((await (await req('GET', '')).json()).documents).toEqual([])
    expect((await req('GET', `/${m.id}/chunk/0`)).status).toBe(409)
  })

  it('rejects a piece of the wrong size', async () => {
    const { req } = setup()
    const m = (await (await req('POST', '', { title: 'x', fileName: 'a.csv', size: 10 })).json()) as DocMeta
    expect((await req('PUT', `/${m.id}/chunk/0`, undefined, bytes(9))).status).toBe(400)
    expect((await req('PUT', `/${m.id}/chunk/1`, undefined, bytes(10))).status).toBe(400)
  })

  it('enforces the size limit and requires a name', async () => {
    const { req } = setup()
    expect((await req('POST', '', { title: 'big', fileName: 'v.mov', size: MAX_FILE_BYTES + 1 })).status).toBe(413)
    expect((await req('POST', '', { title: 'ok', fileName: 'v.mov', size: MAX_FILE_BYTES })).status).toBe(201)
    expect((await req('POST', '', { title: '   ', fileName: 'v.mov', size: 5 })).status).toBe(400)
    expect((await req('POST', '', { title: 'x', fileName: 'v.mov', size: 0 })).status).toBe(400)
  })

  it('accepts any file type', async () => {
    const { req } = setup()
    for (const fileName of ['IMG_0042.HEIC', 'usage.xlsx', 'export.csv', 'photo.jpg', 'notes.weird']) {
      expect((await req('POST', '', { title: fileName, fileName, size: 5 })).status).toBe(201)
    }
  })

  it('renames a document and edits its note', async () => {
    const { req } = setup()
    const m = await upload(req, 10)
    const r = await (await req('PATCH', `/${m.id}`, { title: '  Meter 2 August bill  ', note: 'From the City portal' })).json()
    expect(r.title).toBe('Meter 2 August bill')
    expect(r.note).toBe('From the City portal')
    expect((await req('PATCH', `/${m.id}`, { title: '' })).status).toBe(400)
  })

  it('moves to the trash, restores, and purges after the trash window', async () => {
    const { req, store, advance } = setup()
    const m = await upload(req, 10)
    await req('DELETE', `/${m.id}`)
    let list = await (await req('GET', '')).json()
    expect(list.documents).toEqual([])
    expect(list.trash.map((d: DocMeta) => d.id)).toEqual([m.id])
    await req('POST', `/${m.id}/restore`)
    list = await (await req('GET', '')).json()
    expect(list.documents.map((d: DocMeta) => d.id)).toEqual([m.id])

    await req('DELETE', `/${m.id}`)
    advance((TRASH_DAYS + 1) * 86400_000)
    list = await (await req('GET', '')).json()
    expect(list.trash).toEqual([])
    expect([...store.data.keys()].filter((k) => k.includes(m.id))).toEqual([])
  })

  it('cleans up abandoned uploads after a day', async () => {
    const { req, store, advance } = setup()
    await req('POST', '', { title: 'x', fileName: 'a.pdf', size: 10 })
    advance(25 * 3600_000)
    await req('GET', '')
    expect(store.data.size).toBe(0)
  })

  it('rejects unknown and malformed ids', async () => {
    const { req } = setup()
    expect((await req('GET', '/../../etc')).status).toBe(404)
    expect((await req('DELETE', '/00000000-0000-4000-8000-999999999999')).status).toBe(404)
  })
})

describe('site passcode', () => {
  const cfg = { passcode: 'blue heron 42', secret: 's' }
  const withCookie = (v: string) => new Request('https://site.test/', { headers: { cookie: `a=1; ${COOKIE_NAME}=${v}` } })

  it('accepts the right passcode and rejects others', async () => {
    expect(await checkPasscode('blue heron 42', cfg)).toBe(true)
    expect(await checkPasscode(' blue heron 42 ', cfg)).toBe(true)
    expect(await checkPasscode('blue heron 43', cfg)).toBe(false)
    expect(await checkPasscode('anything', { passcode: undefined, secret: undefined })).toBe(false)
  })

  it('recognizes the session cookie and nothing else', async () => {
    const t = await sessionToken(cfg.passcode, cfg.secret)
    expect(await isSignedIn(withCookie(t), cfg)).toBe(true)
    expect(await isSignedIn(withCookie(t.slice(0, -1) + '0'), cfg)).toBe(t.endsWith('0'))
    expect(await isSignedIn(new Request('https://site.test/'), cfg)).toBe(false)
    // Changing the passcode signs everyone out.
    expect(await isSignedIn(withCookie(t), { ...cfg, passcode: 'new one' })).toBe(false)
    // No passcode configured means locked.
    expect(await isSignedIn(withCookie(t), { passcode: undefined, secret: undefined })).toBe(false)
  })

  it('builds a secure, HttpOnly cookie', () => {
    const c = sessionCookie('abc', true)
    expect(c).toContain('HttpOnly')
    expect(c).toContain('Secure')
    expect(c).toContain('SameSite=Lax')
    expect(readCookie('x=1; grw_session=abc', COOKIE_NAME)).toBe('abc')
    expect(safeEqual('abc', 'abd')).toBe(false)
    expect(safeEqual('abc', 'abc')).toBe(true)
  })
})

describe('document display helpers', () => {
  it('names file types in plain language', () => {
    expect(fileKind('bill.PDF')).toBe('PDF')
    expect(fileKind('IMG_1.heic')).toBe('Photo (HEIC)')
    expect(fileKind('usage.xlsx')).toBe('Spreadsheet')
    expect(fileKind('export.csv')).toBe('CSV')
    expect(fileKind('a.jpg')).toBe('Image')
    expect(fileKind('blob.xyz')).toBe('XYZ')
    expect(canPreview('IMG_1.heic')).toBe(false)
    expect(canPreview('bill.pdf')).toBe(true)
  })

  it('suggests a name and keeps the extension on download', () => {
    expect(defaultTitle('Meter_2_Aug_2026.pdf')).toBe('Meter 2 Aug 2026')
    expect(downloadName({ title: 'Meter 2: August', fileName: 'scan.PDF' })).toBe('Meter 2- August.PDF')
    expect(downloadName({ title: 'quote.pdf', fileName: 'q.pdf' })).toBe('quote.pdf')
  })
})
