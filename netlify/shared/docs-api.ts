/**
 * Documents API: committee members upload any file, give it a readable name, rename it, and move it to the trash.
 * Pure request handling over a small storage interface, so it can be tested without Netlify.
 *
 * Storage layout:
 *   meta/<id>           JSON DocMeta
 *   chunk/<id>/<n>      bytes of piece n (CHUNK_BYTES each, the last one shorter)
 */
import { ABANDONED_UPLOAD_HOURS, CHUNK_BYTES, MAX_FILE_BYTES, MAX_NAME_LENGTH, MAX_NOTE_LENGTH, MAX_TITLE_LENGTH, TRASH_DAYS } from './docs-config'

export type DocMeta = {
  id: string
  title: string
  fileName: string
  contentType: string
  size: number
  chunkSize: number
  chunks: number
  note: string
  addedBy: string
  status: 'uploading' | 'ready'
  createdAt: string
  updatedAt: string
  deletedAt: string | null
}

export type DocStore = {
  getJSON(key: string): Promise<unknown | null>
  setJSON(key: string, value: unknown): Promise<void>
  getBytes(key: string): Promise<ArrayBuffer | null>
  setBytes(key: string, value: ArrayBuffer): Promise<void>
  delete(key: string): Promise<void>
  keys(prefix: string): Promise<string[]>
}

export const BASE = '/api/docs'

const json = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), { status, headers: { 'content-type': 'application/json; charset=utf-8', 'cache-control': 'no-store' } })
const fail = (status: number, message: string) => json({ error: message }, status)

const metaKey = (id: string) => `meta/${id}`
const chunkKey = (id: string, n: number) => `chunk/${id}/${n}`
const ID = /^[a-f0-9-]{36}$/

const text = (v: unknown, max: number): string | null => (typeof v === 'string' ? v.trim().slice(0, max + 1) : v == null ? '' : null)

function expectedChunkLength(m: DocMeta, n: number): number {
  return n < m.chunks - 1 ? m.chunkSize : m.size - m.chunkSize * (m.chunks - 1)
}

async function readMeta(store: DocStore, id: string): Promise<DocMeta | null> {
  if (!ID.test(id)) return null
  return (await store.getJSON(metaKey(id))) as DocMeta | null
}

async function purge(store: DocStore, m: DocMeta) {
  for (const k of await store.keys(`chunk/${m.id}/`)) await store.delete(k)
  await store.delete(metaKey(m.id))
}

async function listAll(store: DocStore, now: Date): Promise<DocMeta[]> {
  const out: DocMeta[] = []
  for (const k of await store.keys('meta/')) {
    const m = (await store.getJSON(k)) as DocMeta | null
    if (!m) continue
    const trashExpired = m.deletedAt && now.getTime() - Date.parse(m.deletedAt) > TRASH_DAYS * 86400_000
    const abandoned = m.status === 'uploading' && now.getTime() - Date.parse(m.createdAt) > ABANDONED_UPLOAD_HOURS * 3600_000
    if (trashExpired || abandoned) await purge(store, m)
    else out.push(m)
  }
  return out.sort((a, b) => b.createdAt.localeCompare(a.createdAt))
}

async function body(req: Request): Promise<Record<string, unknown> | null> {
  try {
    const b = await req.json()
    return b && typeof b === 'object' ? (b as Record<string, unknown>) : null
  } catch {
    return null
  }
}

export type Deps = { store: DocStore; now?: () => Date; newId?: () => string }

export async function handleDocs(req: Request, deps: Deps): Promise<Response> {
  const { store } = deps
  const now = deps.now ?? (() => new Date())
  const newId = deps.newId ?? (() => crypto.randomUUID())
  const path = new URL(req.url).pathname.replace(/\/+$/, '')
  if (!path.startsWith(BASE)) return fail(404, 'Not found')
  const parts = path.slice(BASE.length).split('/').filter(Boolean)
  const method = req.method.toUpperCase()

  // GET /api/docs
  if (parts.length === 0 && method === 'GET') {
    const all = await listAll(store, now())
    return json({
      documents: all.filter((m) => m.status === 'ready' && !m.deletedAt),
      trash: all.filter((m) => m.status === 'ready' && m.deletedAt),
      limits: { maxFileBytes: MAX_FILE_BYTES, chunkBytes: CHUNK_BYTES, trashDays: TRASH_DAYS },
    })
  }

  // POST /api/docs  -> start an upload
  if (parts.length === 0 && method === 'POST') {
    const b = await body(req)
    if (!b) return fail(400, 'Send the document details as JSON.')
    const title = text(b.title, MAX_TITLE_LENGTH)
    const fileName = text(b.fileName, 255)
    const note = text(b.note, MAX_NOTE_LENGTH)
    const addedBy = text(b.addedBy, MAX_NAME_LENGTH)
    const contentType = text(b.contentType, 200)
    const size = b.size
    if (!title) return fail(400, 'Give the document a name.')
    if (title.length > MAX_TITLE_LENGTH) return fail(400, `Keep the name under ${MAX_TITLE_LENGTH} characters.`)
    if (!fileName) return fail(400, 'The file name is missing.')
    if (note === null || note.length > MAX_NOTE_LENGTH) return fail(400, `Keep the note under ${MAX_NOTE_LENGTH} characters.`)
    if (addedBy === null || addedBy.length > MAX_NAME_LENGTH) return fail(400, `Keep "added by" under ${MAX_NAME_LENGTH} characters.`)
    if (typeof size !== 'number' || !Number.isInteger(size) || size < 1) return fail(400, 'The file is empty.')
    if (size > MAX_FILE_BYTES) return fail(413, 'The file is larger than the upload limit.')
    const ts = now().toISOString()
    const m: DocMeta = {
      id: newId(),
      title,
      fileName: fileName.slice(0, 255),
      contentType: contentType || 'application/octet-stream',
      size,
      chunkSize: CHUNK_BYTES,
      chunks: Math.ceil(size / CHUNK_BYTES),
      note,
      addedBy,
      status: 'uploading',
      createdAt: ts,
      updatedAt: ts,
      deletedAt: null,
    }
    await store.setJSON(metaKey(m.id), m)
    return json(m, 201)
  }

  const m = parts[0] ? await readMeta(store, parts[0]) : null
  if (!m) return fail(404, 'That document was not found.')

  // PUT /api/docs/:id/chunk/:n
  if (parts.length === 3 && parts[1] === 'chunk' && method === 'PUT') {
    if (m.status !== 'uploading') return fail(409, 'This upload is already finished.')
    const n = Number(parts[2])
    if (!Number.isInteger(n) || n < 0 || n >= m.chunks) return fail(400, 'Bad piece number.')
    const bytes = await req.arrayBuffer()
    if (bytes.byteLength !== expectedChunkLength(m, n)) return fail(400, 'This piece is the wrong size. Try the upload again.')
    await store.setBytes(chunkKey(m.id, n), bytes)
    return json({ ok: true })
  }

  // POST /api/docs/:id/complete
  if (parts.length === 2 && parts[1] === 'complete' && method === 'POST') {
    if (m.status === 'ready') return json(m)
    const have = new Set(await store.keys(`chunk/${m.id}/`))
    const missing = Array.from({ length: m.chunks }, (_, i) => i).filter((i) => !have.has(chunkKey(m.id, i)))
    if (missing.length) return fail(409, `Upload is missing ${missing.length} of ${m.chunks} pieces. Try again.`)
    const done: DocMeta = { ...m, status: 'ready', updatedAt: now().toISOString() }
    await store.setJSON(metaKey(m.id), done)
    return json(done)
  }

  // GET /api/docs/:id/chunk/:n
  if (parts.length === 3 && parts[1] === 'chunk' && method === 'GET') {
    if (m.status !== 'ready') return fail(409, 'This document is still uploading.')
    const n = Number(parts[2])
    if (!Number.isInteger(n) || n < 0 || n >= m.chunks) return fail(400, 'Bad piece number.')
    const bytes = await store.getBytes(chunkKey(m.id, n))
    if (!bytes) return fail(404, 'Part of this file is missing.')
    return new Response(bytes, { headers: { 'content-type': 'application/octet-stream', 'cache-control': 'private, max-age=31536000, immutable' } })
  }

  // POST /api/docs/:id/restore
  if (parts.length === 2 && parts[1] === 'restore' && method === 'POST') {
    const restored: DocMeta = { ...m, deletedAt: null, updatedAt: now().toISOString() }
    await store.setJSON(metaKey(m.id), restored)
    return json(restored)
  }

  if (parts.length === 1 && method === 'GET') return json(m)

  // PATCH /api/docs/:id  -> rename or edit the note
  if (parts.length === 1 && method === 'PATCH') {
    const b = await body(req)
    if (!b) return fail(400, 'Send the changes as JSON.')
    const next = { ...m }
    if ('title' in b) {
      const t = text(b.title, MAX_TITLE_LENGTH)
      if (!t) return fail(400, 'Give the document a name.')
      if (t.length > MAX_TITLE_LENGTH) return fail(400, `Keep the name under ${MAX_TITLE_LENGTH} characters.`)
      next.title = t
    }
    if ('note' in b) {
      const n = text(b.note, MAX_NOTE_LENGTH)
      if (n === null || n.length > MAX_NOTE_LENGTH) return fail(400, `Keep the note under ${MAX_NOTE_LENGTH} characters.`)
      next.note = n
    }
    next.updatedAt = now().toISOString()
    await store.setJSON(metaKey(m.id), next)
    return json(next)
  }

  // DELETE /api/docs/:id  -> finished documents go to the trash; unfinished uploads are removed now
  if (parts.length === 1 && method === 'DELETE') {
    if (m.status === 'uploading') {
      await purge(store, m)
      return json({ ok: true, removed: true })
    }
    const trashed: DocMeta = { ...m, deletedAt: now().toISOString(), updatedAt: now().toISOString() }
    await store.setJSON(metaKey(m.id), trashed)
    return json(trashed)
  }

  return fail(405, 'Not allowed')
}
