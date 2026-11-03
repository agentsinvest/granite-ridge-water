import { getStore } from '@netlify/blobs'
import { isSignedIn } from '../shared/auth'
import { handleDocs, type DocStore } from '../shared/docs-api'

function blobStore(): DocStore {
  const s = getStore({ name: 'documents', consistency: 'strong' })
  return {
    getJSON: (k) => s.get(k, { type: 'json' }),
    setJSON: async (k, v) => {
      await s.setJSON(k, v)
    },
    getBytes: (k) => s.get(k, { type: 'arrayBuffer' }),
    setBytes: async (k, v) => {
      await s.set(k, v)
    },
    delete: (k) => s.delete(k),
    keys: async (prefix) => {
      const { blobs } = await s.list({ prefix })
      return blobs.map((b) => b.key)
    },
  }
}

export default async (req: Request): Promise<Response> => {
  // The edge function already gates the whole site; check again here so the API never answers without a session.
  if (!(await isSignedIn(req))) return new Response(JSON.stringify({ error: 'Enter the site passcode first.' }), { status: 401, headers: { 'content-type': 'application/json' } })
  try {
    return await handleDocs(req, { store: blobStore() })
  } catch (e) {
    console.error(e)
    return new Response(JSON.stringify({ error: 'The document store had a problem. Try again in a minute.' }), { status: 500, headers: { 'content-type': 'application/json' } })
  }
}

export const config = { path: ['/api/docs', '/api/docs/*'] }
