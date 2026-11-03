import { useEffect, useMemo, useRef, useState } from 'react'
import { Card, Empty, PageHeader, Section } from '../components/ui'
import {
  canPreview,
  defaultTitle,
  downloadName,
  DocsError,
  fetchDoc,
  fileKind,
  formatBytes,
  listDocs,
  MAX_FILE_BYTES,
  renameDoc,
  restoreDoc,
  trashDoc,
  uploadDoc,
  type DocList,
  type DocMeta,
} from '../lib/docsClient'
import { TRASH_DAYS } from '../../netlify/shared/docs-config'

const input = 'mt-1 block w-full rounded border border-line bg-surface p-2'
const primary = 'rounded-md bg-ink px-4 py-2 text-sm font-semibold text-page disabled:opacity-50'
const secondary = 'rounded-md border border-line px-3 py-1.5 text-sm font-semibold hover:bg-[var(--ring)] disabled:opacity-50'
const linkBtn = 'text-sm underline underline-offset-4 disabled:opacity-50'

const dateText = (iso: string) => new Date(iso).toLocaleDateString('en-US', { dateStyle: 'medium' })
const pct = (p: number) => `${Math.round(p * 100)}%`
const message = (e: unknown) => (e instanceof Error ? e.message : 'Something went wrong.')

type Pending = { key: string; file: File; title: string; state: 'waiting' | 'uploading' | 'done' | 'error'; progress: number; error?: string }

export function Documents() {
  const [list, setList] = useState<DocList | null>(null)
  const [loadError, setLoadError] = useState<DocsError | null>(null)
  const [loading, setLoading] = useState(true)
  const [status, setStatus] = useState('')

  const load = async () => {
    setLoading(true)
    try {
      setList(await listDocs())
      setLoadError(null)
    } catch (e) {
      setLoadError(e instanceof DocsError ? e : new DocsError(message(e)))
    } finally {
      setLoading(false)
    }
  }
  useEffect(() => {
    void load()
  }, [])

  return (
    <article>
      <PageHeader
        title="Documents"
        lead="One place for everything about our neighborhood's water: bills, Waterfluence reports, landscaper quotes, photos, maps, and meeting notes. Anyone with the site passcode can add, rename, or remove documents."
      />
      <p className="sr-only" role="status" aria-live="polite">
        {status}
      </p>

      <Uploader disabled={loadError?.kind === 'unavailable' || loadError?.kind === 'signed-out'} onUploaded={(n) => { setStatus(`${n} document${n === 1 ? '' : 's'} added.`); void load() }} />

      <Section id="library" title="All documents">
        {loading && !list ? (
          <p className="mt-4 text-ink-2" role="status">Loading documents...</p>
        ) : loadError ? (
          <div className="mt-4 rounded-xl border-2 border-serious p-5" role="alert">
            <p className="font-semibold"><span aria-hidden="true">! </span>Documents could not be loaded.</p>
            <p className="mt-1 text-ink-2">{loadError.message}</p>
            {loadError.kind !== 'unavailable' && (
              <button type="button" className={`${secondary} mt-3`} onClick={() => void load()}>Try again</button>
            )}
          </div>
        ) : list ? (
          <Library list={list} onChange={(msg) => { setStatus(msg); void load() }} />
        ) : null}
      </Section>
    </article>
  )
}

function Uploader({ disabled, onUploaded }: { disabled: boolean; onUploaded: (count: number) => void }) {
  const [pending, setPending] = useState<Pending[]>([])
  const [note, setNote] = useState('')
  const [addedBy, setAddedBy] = useState('')
  const [busy, setBusy] = useState(false)
  const [dragging, setDragging] = useState(false)
  const fileInput = useRef<HTMLInputElement>(null)

  const add = (files: FileList | null) => {
    if (!files) return
    const next = Array.from(files).map((file, i): Pending => {
      const tooBig = file.size > MAX_FILE_BYTES
      const empty = file.size === 0
      return {
        key: `${Date.now()}-${i}-${file.name}`,
        file,
        title: defaultTitle(file.name),
        state: tooBig || empty ? 'error' : 'waiting',
        progress: 0,
        error: tooBig ? `This file is ${formatBytes(file.size)}. The limit is ${formatBytes(MAX_FILE_BYTES)}.` : empty ? 'This file is empty.' : undefined,
      }
    })
    setPending((p) => [...p.filter((x) => x.state !== 'done'), ...next])
    if (fileInput.current) fileInput.current.value = ''
  }

  const update = (key: string, patch: Partial<Pending>) => setPending((p) => p.map((x) => (x.key === key ? { ...x, ...patch } : x)))
  const ready = pending.filter((p) => p.state === 'waiting' || (p.state === 'error' && p.file.size > 0 && p.file.size <= MAX_FILE_BYTES))
  const missingName = ready.some((p) => !p.title.trim())

  const start = async () => {
    setBusy(true)
    let done = 0
    for (const p of ready) {
      update(p.key, { state: 'uploading', progress: 0, error: undefined })
      try {
        await uploadDoc(p.file, { title: p.title.trim(), note: note.trim(), addedBy: addedBy.trim() }, (progress) => update(p.key, { progress }))
        update(p.key, { state: 'done', progress: 1 })
        done++
      } catch (e) {
        update(p.key, { state: 'error', error: message(e) })
      }
    }
    setBusy(false)
    if (done) {
      setNote('')
      onUploaded(done)
    }
  }

  return (
    <Section id="add" title="Add documents" lead={`Any file type works: PDF, Excel, CSV, Word, photos (JPG, HEIC), videos, and more. Up to ${formatBytes(MAX_FILE_BYTES)} per file. Give each one a clear name so neighbors know what it is before opening it.`}>
      <Card className="mt-4">
        <div
          className={`rounded-lg border-2 border-dashed p-5 text-center ${dragging ? 'border-ink bg-[var(--ring)]' : 'border-line'}`}
          onDragOver={(e) => { e.preventDefault(); setDragging(true) }}
          onDragLeave={() => setDragging(false)}
          onDrop={(e) => { e.preventDefault(); setDragging(false); if (!disabled) add(e.dataTransfer.files) }}
        >
          <label htmlFor="doc-files" className="font-semibold">Choose files</label>
          <p className="mt-1 text-sm text-ink-2">or drag them here</p>
          <input id="doc-files" ref={fileInput} type="file" multiple disabled={disabled || busy} onChange={(e) => add(e.target.files)} className="mx-auto mt-3 block max-w-full text-sm" />
        </div>

        {pending.length > 0 && (
          <>
            <ul className="mt-5 space-y-4" aria-label="Files to upload">
              {pending.map((p) => (
                <li key={p.key} className="rounded-lg border border-line p-3">
                  <p className="text-sm text-ink-2">
                    {p.file.name} · {fileKind(p.file.name, p.file.type)} · {formatBytes(p.file.size)}
                  </p>
                  {p.state === 'done' ? (
                    <p className="mt-1 font-semibold"><span aria-hidden="true">✓ </span>Added as "{p.title}"</p>
                  ) : (
                    <label className="mt-2 block text-sm font-semibold">
                      Name shown to neighbors
                      <input className={input} value={p.title} maxLength={200} disabled={busy} onChange={(e) => update(p.key, { title: e.target.value })} aria-invalid={!p.title.trim()} placeholder="For example: Meter 2 bill, August 2026" />
                    </label>
                  )}
                  {p.state === 'uploading' && (
                    <div className="mt-2">
                      <progress className="w-full" value={p.progress} max={1} aria-label={`Uploading ${p.title}`} />
                      <p className="text-sm text-ink-2">Uploading... {pct(p.progress)}</p>
                    </div>
                  )}
                  {p.state === 'error' && p.error && (
                    <p className="mt-2 text-sm font-semibold" role="alert"><span aria-hidden="true">! </span>{p.error}</p>
                  )}
                  {(p.state === 'waiting' || p.state === 'error') && !busy && (
                    <button type="button" className={`${linkBtn} mt-2`} onClick={() => setPending((all) => all.filter((x) => x.key !== p.key))}>
                      Remove from list
                    </button>
                  )}
                </li>
              ))}
            </ul>

            {ready.length > 0 && (
              <div className="mt-5 grid gap-4 md:grid-cols-2">
                <label className="block text-sm font-semibold md:col-span-2">
                  Note (optional, applies to all files above)
                  <textarea className={input} rows={2} maxLength={2000} value={note} disabled={busy} onChange={(e) => setNote(e.target.value)} placeholder="What is this, and where did it come from?" />
                </label>
                <label className="block text-sm font-semibold">
                  Added by (optional)
                  <input className={input} maxLength={100} value={addedBy} disabled={busy} onChange={(e) => setAddedBy(e.target.value)} placeholder="First name or committee role" />
                </label>
              </div>
            )}

            {ready.length > 0 && (
              <div className="mt-5 flex flex-wrap items-center gap-3">
                <button type="button" className={primary} disabled={busy || missingName || disabled} onClick={() => void start()}>
                  {busy ? 'Uploading...' : `Upload ${ready.length} file${ready.length === 1 ? '' : 's'}`}
                </button>
                {missingName && <p className="text-sm font-semibold"><span aria-hidden="true">! </span>Every file needs a name.</p>}
                {busy && <p className="text-sm text-ink-2">Keep this page open until uploads finish.</p>}
              </div>
            )}
          </>
        )}
      </Card>
      <p className="mt-3 max-w-prose text-sm text-ink-2">
        Everyone with the passcode can see what you add. Before uploading, black out anything personal that does not need to be shared, like a homeowner's phone number.
      </p>
    </Section>
  )
}

function Library({ list, onChange }: { list: DocList; onChange: (msg: string) => void }) {
  const [q, setQ] = useState('')
  const [kind, setKind] = useState('')
  const kinds = useMemo(() => [...new Set(list.documents.map((d) => fileKind(d.fileName, d.contentType)))].sort(), [list.documents])
  const shown = list.documents.filter((d) => {
    if (kind && fileKind(d.fileName, d.contentType) !== kind) return false
    const needle = q.trim().toLowerCase()
    return !needle || [d.title, d.fileName, d.note, d.addedBy].some((s) => s.toLowerCase().includes(needle))
  })

  if (list.documents.length === 0 && list.trash.length === 0) {
    return <Empty>No documents yet. Add the first one above: a recent water bill or a landscaper quote is a good start.</Empty>
  }

  return (
    <>
      {list.documents.length > 0 && (
        <div className="mt-4 grid gap-3 md:grid-cols-[2fr_1fr]">
          <label className="block text-sm font-semibold">
            Search
            <input type="search" className={input} value={q} onChange={(e) => setQ(e.target.value)} placeholder="Name, note, or who added it" />
          </label>
          <label className="block text-sm font-semibold">
            Type
            <select className={input} value={kind} onChange={(e) => setKind(e.target.value)}>
              <option value="">All types</option>
              {kinds.map((k) => <option key={k}>{k}</option>)}
            </select>
          </label>
        </div>
      )}
      {list.documents.length === 0 ? (
        <Empty>No documents right now. Everything is in the trash below.</Empty>
      ) : shown.length === 0 ? (
        <Empty>
          No documents match. <button type="button" className="underline underline-offset-4" onClick={() => { setQ(''); setKind('') }}>Clear the search</button>
        </Empty>
      ) : (
        <>
          <p className="mt-3 text-sm text-ink-2">
            Showing {shown.length} of {list.documents.length} document{list.documents.length === 1 ? '' : 's'}, newest first.
          </p>
          <ul className="mt-3 space-y-3">
            {shown.map((d) => <DocRow key={d.id} doc={d} onChange={onChange} />)}
          </ul>
        </>
      )}

      {list.trash.length > 0 && (
        <details className="mt-8">
          <summary className="cursor-pointer font-semibold">Trash ({list.trash.length})</summary>
          <p className="mt-2 text-sm text-ink-2">Removed documents stay here for {list.limits.trashDays} days, then are deleted for good.</p>
          <ul className="mt-3 space-y-2">
            {list.trash.map((d) => <TrashRow key={d.id} doc={d} trashDays={list.limits.trashDays} onChange={onChange} />)}
          </ul>
        </details>
      )}
    </>
  )
}

function DocRow({ doc, onChange }: { doc: DocMeta; onChange: (msg: string) => void }) {
  const [editing, setEditing] = useState(false)
  const [title, setTitle] = useState(doc.title)
  const [note, setNote] = useState(doc.note)
  const [busy, setBusy] = useState<'' | 'save' | 'remove' | 'get'>('')
  const [progress, setProgress] = useState(0)
  const [error, setError] = useState('')
  const preview = canPreview(doc.fileName, doc.contentType)
  const titleId = `doc-${doc.id}`

  const save = async () => {
    setBusy('save')
    setError('')
    try {
      await renameDoc(doc.id, { title, note })
      setEditing(false)
      onChange(`Saved "${title.trim()}".`)
    } catch (e) {
      setError(message(e))
    } finally {
      setBusy('')
    }
  }

  const remove = async () => {
    if (!window.confirm(`Move "${doc.title}" to the trash? You can restore it for ${TRASH_DAYS} days.`)) return
    setBusy('remove')
    setError('')
    try {
      await trashDoc(doc.id)
      onChange(`Moved "${doc.title}" to the trash.`)
    } catch (e) {
      setError(message(e))
      setBusy('')
    }
  }

  const get = async (open: boolean) => {
    // Open the tab now, while the click still counts as a user action, so pop-up blockers allow it.
    const win = open ? window.open('', '_blank') : null
    setBusy('get')
    setError('')
    setProgress(0)
    try {
      const blob = await fetchDoc(doc, setProgress)
      const url = URL.createObjectURL(blob)
      if (win) {
        win.location.href = url
      } else {
        const a = document.createElement('a')
        a.href = url
        a.download = downloadName(doc)
        document.body.appendChild(a)
        a.click()
        a.remove()
      }
      setTimeout(() => URL.revokeObjectURL(url), 60_000)
    } catch (e) {
      win?.close()
      setError(message(e))
    } finally {
      setBusy('')
    }
  }

  return (
    <li>
      <Card className="!p-4">
        {editing ? (
          <div className="grid gap-3">
            <label className="block text-sm font-semibold">
              Name shown to neighbors
              <input className={input} value={title} maxLength={200} onChange={(e) => setTitle(e.target.value)} aria-invalid={!title.trim()} />
            </label>
            <label className="block text-sm font-semibold">
              Note
              <textarea className={input} rows={2} maxLength={2000} value={note} onChange={(e) => setNote(e.target.value)} />
            </label>
            <div className="flex flex-wrap gap-3">
              <button type="button" className={primary} disabled={busy !== '' || !title.trim()} onClick={() => void save()}>{busy === 'save' ? 'Saving...' : 'Save'}</button>
              <button type="button" className={secondary} disabled={busy !== ''} onClick={() => { setEditing(false); setTitle(doc.title); setNote(doc.note); setError('') }}>Cancel</button>
            </div>
          </div>
        ) : (
          <>
            <h3 id={titleId} className="break-words text-base font-semibold">{doc.title}</h3>
            <p className="mt-1 text-sm text-ink-2">
              {fileKind(doc.fileName, doc.contentType)} · {formatBytes(doc.size)} · added {dateText(doc.createdAt)}
              {doc.addedBy ? ` by ${doc.addedBy}` : ''}
            </p>
            {doc.note && <p className="mt-2 whitespace-pre-line text-sm">{doc.note}</p>}
            <p className="mt-1 break-all text-xs text-ink-2">Original file: {doc.fileName}</p>
            <div className="mt-3 flex flex-wrap items-center gap-3">
              {preview && (
                <button type="button" className={secondary} disabled={busy !== ''} onClick={() => void get(true)} aria-describedby={titleId}>Open</button>
              )}
              <button type="button" className={secondary} disabled={busy !== ''} onClick={() => void get(false)} aria-describedby={titleId}>Download</button>
              <button type="button" className={linkBtn} disabled={busy !== ''} onClick={() => setEditing(true)} aria-describedby={titleId}>Rename</button>
              <button type="button" className={linkBtn} disabled={busy !== ''} onClick={() => void remove()} aria-describedby={titleId}>{busy === 'remove' ? 'Removing...' : 'Remove'}</button>
            </div>
            {busy === 'get' && (
              <div className="mt-2">
                <progress className="w-full" value={progress} max={1} aria-label={`Getting ${doc.title}`} />
                <p className="text-sm text-ink-2">Getting the file... {pct(progress)}</p>
              </div>
            )}
          </>
        )}
        {error && <p className="mt-2 text-sm font-semibold" role="alert"><span aria-hidden="true">! </span>{error}</p>}
      </Card>
    </li>
  )
}

function TrashRow({ doc, trashDays, onChange }: { doc: DocMeta; trashDays: number; onChange: (msg: string) => void }) {
  const [busy, setBusy] = useState(false)
  const [error, setError] = useState('')
  const goneOn = doc.deletedAt ? new Date(Date.parse(doc.deletedAt) + trashDays * 86400_000).toISOString() : null
  return (
    <li className="rounded-lg border border-line p-3">
      <p className="font-semibold">{doc.title}</p>
      <p className="text-sm text-ink-2">
        {fileKind(doc.fileName, doc.contentType)} · {formatBytes(doc.size)}
        {doc.deletedAt ? ` · removed ${dateText(doc.deletedAt)}` : ''}
        {goneOn ? ` · deleted for good after ${dateText(goneOn)}` : ''}
      </p>
      <button
        type="button"
        className={`${linkBtn} mt-1`}
        disabled={busy}
        onClick={async () => {
          setBusy(true)
          try {
            await restoreDoc(doc.id)
            onChange(`Restored "${doc.title}".`)
          } catch (e) {
            setError(message(e))
            setBusy(false)
          }
        }}
      >
        {busy ? 'Restoring...' : `Restore ${doc.title}`}
      </button>
      {error && <p className="mt-1 text-sm font-semibold" role="alert"><span aria-hidden="true">! </span>{error}</p>}
    </li>
  )
}
