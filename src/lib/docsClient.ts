/** Browser side of the Documents API (netlify/shared/docs-api.ts). Files move in pieces to stay under Netlify's request size cap. */
import type { DocMeta } from '../../netlify/shared/docs-api'
import { CHUNK_BYTES, MAX_FILE_BYTES } from '../../netlify/shared/docs-config'

export type { DocMeta }
export { MAX_FILE_BYTES }

const API = '/api/docs'

export class DocsError extends Error {
  constructor(message: string, readonly kind: 'unavailable' | 'signed-out' | 'other' = 'other') {
    super(message)
  }
}

async function call<T>(path: string, init?: RequestInit): Promise<T> {
  let res: Response
  try {
    res = await fetch(API + path, { credentials: 'same-origin', ...init })
  } catch {
    throw new DocsError('Could not reach the site. Check your internet connection and try again.')
  }
  if (res.status === 401) throw new DocsError('Your session ended. Reload the page and enter the passcode again.', 'signed-out')
  const isJson = (res.headers.get('content-type') ?? '').includes('application/json')
  if (!isJson) {
    // A local preview (vite) has no functions, so the path falls through to the app's HTML.
    if (res.status === 404 || res.ok) throw new DocsError('Documents are only available on the live site, not in a local preview.', 'unavailable')
    throw new DocsError(`The document store answered with an error (${res.status}). Try again in a minute.`)
  }
  const body = await res.json()
  if (!res.ok) throw new DocsError(body?.error ?? `Something went wrong (${res.status}).`)
  return body as T
}

const jsonInit = (method: string, body: unknown): RequestInit => ({ method, headers: { 'content-type': 'application/json' }, body: JSON.stringify(body) })

export type DocList = { documents: DocMeta[]; trash: DocMeta[]; limits: { maxFileBytes: number; chunkBytes: number; trashDays: number } }

export const listDocs = () => call<DocList>('')
export const renameDoc = (id: string, changes: { title?: string; note?: string }) => call<DocMeta>(`/${id}`, jsonInit('PATCH', changes))
export const trashDoc = (id: string) => call<DocMeta>(`/${id}`, { method: 'DELETE' })
export const restoreDoc = (id: string) => call<DocMeta>(`/${id}/restore`, { method: 'POST' })

async function withRetry<T>(fn: () => Promise<T>, tries = 3): Promise<T> {
  for (let i = 1; ; i++) {
    try {
      return await fn()
    } catch (e) {
      if (i >= tries || (e instanceof DocsError && e.kind !== 'other')) throw e
      await new Promise((r) => setTimeout(r, 1000 * i))
    }
  }
}

/** Uploads one file in pieces. Reports progress from 0 to 1. Removes the partial upload if it fails. */
export async function uploadDoc(file: File, details: { title: string; note: string; addedBy: string }, onProgress: (p: number) => void): Promise<DocMeta> {
  if (file.size > MAX_FILE_BYTES) throw new DocsError('This file is larger than the upload limit.')
  if (file.size === 0) throw new DocsError('This file is empty.')
  const meta = await call<DocMeta>('', jsonInit('POST', { ...details, fileName: file.name, contentType: file.type, size: file.size }))
  try {
    for (let n = 0; n < meta.chunks; n++) {
      const piece = file.slice(n * meta.chunkSize, Math.min(file.size, (n + 1) * meta.chunkSize))
      await withRetry(() => call(`/${meta.id}/chunk/${n}`, { method: 'PUT', headers: { 'content-type': 'application/octet-stream' }, body: piece }))
      onProgress((n + 1) / meta.chunks)
    }
    return await withRetry(() => call<DocMeta>(`/${meta.id}/complete`, { method: 'POST' }))
  } catch (e) {
    await call(`/${meta.id}`, { method: 'DELETE' }).catch(() => undefined)
    throw e
  }
}

/** Fetches every piece of a document and joins them into one file in the browser. */
export async function fetchDoc(meta: DocMeta, onProgress: (p: number) => void): Promise<Blob> {
  const parts: ArrayBuffer[] = []
  for (let n = 0; n < meta.chunks; n++) {
    const buf = await withRetry(async () => {
      let res: Response
      try {
        res = await fetch(`${API}/${meta.id}/chunk/${n}`, { credentials: 'same-origin' })
      } catch {
        throw new DocsError('Could not reach the site. Check your internet connection and try again.')
      }
      if (res.status === 401) throw new DocsError('Your session ended. Reload the page and enter the passcode again.', 'signed-out')
      if (!res.ok) throw new DocsError(`Could not download part of this file (${res.status}).`)
      return res.arrayBuffer()
    })
    parts.push(buf)
    onProgress((n + 1) / meta.chunks)
  }
  return new Blob(parts, { type: meta.contentType || 'application/octet-stream' })
}

export { CHUNK_BYTES }

/** Plain-language file kind from the file name and type. Shown as text, never by color or icon alone. */
export function fileKind(fileName: string, contentType = ''): string {
  const ext = fileName.toLowerCase().split('.').pop() ?? ''
  if (ext === 'pdf' || contentType === 'application/pdf') return 'PDF'
  if (['xls', 'xlsx', 'xlsm', 'ods', 'numbers'].includes(ext)) return 'Spreadsheet'
  if (ext === 'csv' || contentType === 'text/csv') return 'CSV'
  if (['doc', 'docx', 'odt', 'rtf', 'pages'].includes(ext)) return 'Word document'
  if (['ppt', 'pptx', 'key', 'odp'].includes(ext)) return 'Slides'
  if (['heic', 'heif'].includes(ext)) return 'Photo (HEIC)'
  if (contentType.startsWith('image/') || ['jpg', 'jpeg', 'png', 'gif', 'webp', 'tif', 'tiff', 'bmp', 'svg'].includes(ext)) return 'Image'
  if (contentType.startsWith('video/') || ['mp4', 'mov', 'm4v', 'avi', 'webm'].includes(ext)) return 'Video'
  if (contentType.startsWith('audio/') || ['mp3', 'm4a', 'wav'].includes(ext)) return 'Audio'
  if (['zip', '7z', 'rar', 'gz'].includes(ext)) return 'Zip archive'
  if (['txt', 'md'].includes(ext) || contentType.startsWith('text/')) return 'Text'
  if (['kml', 'kmz', 'geojson', 'shp'].includes(ext)) return 'Map file'
  return ext ? ext.toUpperCase() : 'File'
}

/** Browsers can show these in a tab. Everything else downloads. HEIC only opens in Safari, so it downloads. */
export function canPreview(fileName: string, contentType = ''): boolean {
  const k = fileKind(fileName, contentType)
  return k === 'PDF' || k === 'Image' || k === 'Text'
}

export function formatBytes(n: number): string {
  if (n < 1000) return `${n} bytes`
  if (n < 1000 ** 2) return `${(n / 1000).toFixed(0)} KB`
  if (n < 1000 ** 3) return `${(n / 1000 ** 2).toFixed(n < 10 * 1000 ** 2 ? 1 : 0)} MB`
  return `${(n / 1000 ** 3).toFixed(2)} GB`
}

/** The default display name: the file name without its extension, with underscores turned into spaces. */
export function defaultTitle(fileName: string): string {
  const base = fileName.replace(/\.[^.]+$/, '')
  return base.replace(/[_]+/g, ' ').replace(/\s+/g, ' ').trim() || fileName
}

/** File name for a download: the readable name plus the original extension. */
export function downloadName(meta: Pick<DocMeta, 'title' | 'fileName'>): string {
  const ext = /\.[^.]+$/.exec(meta.fileName)?.[0] ?? ''
  const safe = meta.title.replace(/[\\/:*?"<>|]+/g, '-').trim() || 'document'
  return safe.toLowerCase().endsWith(ext.toLowerCase()) ? safe : safe + ext
}
