/**
 * Puts the whole site behind one shared passcode. Runs on Netlify's edge before any page, script, data file,
 * or function is served, so nothing on the site can be fetched without the session cookie.
 */
import { authConfig, checkPasscode, clearCookie, isSignedIn, sessionCookie, sessionToken } from '../shared/auth.ts'

const LOGIN = '/__login'
const LOGOUT = '/__logout'

const esc = (s: string) => s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[c]!)

/** Only same-site paths are allowed as a return address. */
function safeNext(raw: string | null): string {
  if (!raw || !raw.startsWith('/') || raw.startsWith('//') || raw.startsWith(LOGIN) || raw.startsWith(LOGOUT)) return '/'
  return raw
}
const safeHash = (raw: string | null) => (raw && /^#[\w\-/?=&%.,~]*$/.test(raw) ? raw : '')

function page(opts: { next: string; error?: string; notConfigured?: boolean; status: number }): Response {
  const body = opts.notConfigured
    ? `<h1>Granite Ridge Water</h1><p>This site is locked, and its passcode has not been set up yet. The site maintainer needs to add it in the Netlify settings.</p>`
    : `<h1>Granite Ridge Water</h1>
<p class="lead">This site is for Granite Ridge neighbors. Enter the passcode from the landscape committee.</p>
<form method="post" action="${LOGIN}">
  <input type="hidden" name="next" value="${esc(opts.next)}">
  <input type="hidden" name="hash" id="hash" value="">
  <label for="passcode">Passcode</label>
  <input id="passcode" name="passcode" type="password" autocomplete="current-password" required autofocus${opts.error ? ' aria-invalid="true" aria-describedby="err"' : ''}>
  ${opts.error ? `<p id="err" class="err" role="alert"><span aria-hidden="true">! </span>${esc(opts.error)}</p>` : ''}
  <button type="submit">Open the site</button>
</form>
<p class="small">You stay signed in on this device for 90 days.</p>
<script>document.getElementById('hash').value = location.hash</script>`
  const html = `<!doctype html>
<html lang="en">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width, initial-scale=1">
<meta name="robots" content="noindex, nofollow">
<title>Enter passcode | Granite Ridge Water</title>
<style>
:root{--page:#f9f9f7;--surface:#fcfcfb;--ink:#0b0b0b;--ink-2:#52514e;--line:#c3c2b7;--focus:#2a78d6;--btn:#0b0b0b;--btn-ink:#fff;--err:#a3361a;color-scheme:light dark}
@media (prefers-color-scheme:dark){:root{--page:#0d0d0d;--surface:#1a1a19;--ink:#fff;--ink-2:#c3c2b7;--line:#4a4a46;--btn:#fff;--btn-ink:#0b0b0b;--err:#ff9c7a}}
*{box-sizing:border-box}
body{margin:0;background:var(--page);color:var(--ink);font:16px/1.5 system-ui,-apple-system,"Segoe UI",sans-serif;display:flex;min-height:100vh;align-items:center;justify-content:center;padding:16px}
main{width:100%;max-width:400px;background:var(--surface);border:1px solid var(--line);border-radius:12px;padding:24px}
h1{font-size:1.5rem;margin:0 0 8px}
.lead,.small{color:var(--ink-2)}
.small{font-size:.875rem;margin-bottom:0}
label{display:block;font-weight:600;margin-top:16px}
input[type=password]{display:block;width:100%;margin-top:4px;padding:10px;font:inherit;color:var(--ink);background:var(--page);border:1px solid var(--line);border-radius:6px}
input[aria-invalid=true]{border:2px solid var(--err)}
.err{color:var(--err);font-weight:600;margin:8px 0 0}
button{margin-top:16px;width:100%;padding:10px 16px;font:inherit;font-weight:600;color:var(--btn-ink);background:var(--btn);border:0;border-radius:6px;cursor:pointer}
:focus-visible{outline:3px solid var(--focus);outline-offset:2px}
</style>
</head>
<body><main>${body}</main></body>
</html>`
  return new Response(html, {
    status: opts.status,
    headers: { 'content-type': 'text/html; charset=utf-8', 'cache-control': 'no-store', 'x-robots-tag': 'noindex, nofollow' },
  })
}

export default async (req: Request, context: { next: () => Promise<Response> }): Promise<Response> => {
  const url = new URL(req.url)
  const secure = url.protocol === 'https:'
  const cfg = authConfig()

  if (url.pathname === LOGOUT) {
    return new Response(null, { status: 303, headers: { location: '/', 'set-cookie': clearCookie(secure), 'cache-control': 'no-store' } })
  }

  if (!cfg.passcode) return page({ next: '/', notConfigured: true, status: 503 })

  if (url.pathname === LOGIN && req.method === 'POST') {
    const form = await req.formData().catch(() => null)
    const next = safeNext(String(form?.get('next') ?? '/'))
    const hash = safeHash(String(form?.get('hash') ?? ''))
    if (await checkPasscode(String(form?.get('passcode') ?? ''), cfg)) {
      const token = await sessionToken(cfg.passcode, cfg.secret ?? '')
      return new Response(null, { status: 303, headers: { location: next + hash, 'set-cookie': sessionCookie(token, secure), 'cache-control': 'no-store' } })
    }
    // Slow down guessing.
    await new Promise((r) => setTimeout(r, 1000))
    return page({ next, error: 'That passcode did not work. Check it and try again.', status: 401 })
  }

  if (await isSignedIn(req, cfg)) {
    if (url.pathname === LOGIN) return new Response(null, { status: 303, headers: { location: '/' } })
    return context.next()
  }

  // Not signed in: API calls get a plain 401, everything else gets the passcode page.
  if (url.pathname.startsWith('/api/')) {
    return new Response(JSON.stringify({ error: 'Enter the site passcode first.' }), { status: 401, headers: { 'content-type': 'application/json' } })
  }
  return page({ next: safeNext(url.pathname === LOGIN ? '/' : url.pathname + url.search), status: 401 })
}

export const config = { path: '/*', excludedPath: ['/robots.txt'] }
