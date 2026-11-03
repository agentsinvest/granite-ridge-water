/**
 * Shared passcode for the whole site. Runs in both the edge function (Deno) and the documents function (Node),
 * so it uses only Web Crypto and no imports.
 *
 * The passcode lives in the Netlify environment variable SITE_PASSCODE. The browser never sees it: after a correct
 * passcode the server sets an HttpOnly cookie holding an HMAC of a fixed label keyed by the passcode (plus the
 * optional SESSION_SECRET). Changing the passcode changes the expected cookie, so everyone is signed out.
 */

export const COOKIE_NAME = 'grw_session'
export const COOKIE_MAX_AGE_DAYS = 90
const LABEL = 'granite-ridge-water-session-v1'

type Env = { get(name: string): string | undefined }
declare const Netlify: { env: Env } | undefined

/** Reads an environment variable in either runtime. */
export function env(name: string): string | undefined {
  try {
    if (typeof Netlify !== 'undefined' && Netlify?.env) {
      const v = Netlify.env.get(name)
      if (v !== undefined) return v
    }
  } catch {
    // Not running on Netlify.
  }
  const p = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process
  return p?.env?.[name]
}

const hex = (buf: ArrayBuffer) => [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, '0')).join('')

/** The cookie value a browser holds once it has entered the right passcode. */
export async function sessionToken(passcode: string, secret = ''): Promise<string> {
  const key = await crypto.subtle.importKey('raw', new TextEncoder().encode(`${passcode}|${secret}`), { name: 'HMAC', hash: 'SHA-256' }, false, ['sign'])
  return hex(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(LABEL)))
}

/** Compares two strings in time that does not depend on where they differ. */
export function safeEqual(a: string, b: string): boolean {
  const len = Math.max(a.length, b.length)
  let diff = a.length ^ b.length
  for (let i = 0; i < len; i++) diff |= (a.charCodeAt(i) || 0) ^ (b.charCodeAt(i) || 0)
  return diff === 0
}

export function readCookie(header: string | null, name: string): string | null {
  if (!header) return null
  for (const part of header.split(';')) {
    const [k, ...v] = part.trim().split('=')
    if (k === name) return decodeURIComponent(v.join('='))
  }
  return null
}

export type AuthConfig = { passcode: string | undefined; secret: string | undefined }

export const authConfig = (): AuthConfig => ({ passcode: env('SITE_PASSCODE'), secret: env('SESSION_SECRET') })

/** True when the request carries a valid session cookie. Fails closed when no passcode is configured. */
export async function isSignedIn(req: Request, cfg: AuthConfig = authConfig()): Promise<boolean> {
  if (!cfg.passcode) return false
  const got = readCookie(req.headers.get('cookie'), COOKIE_NAME)
  if (!got) return false
  return safeEqual(got, await sessionToken(cfg.passcode, cfg.secret ?? ''))
}

export async function checkPasscode(entered: string, cfg: AuthConfig = authConfig()): Promise<boolean> {
  if (!cfg.passcode) return false
  return safeEqual(entered.trim(), cfg.passcode.trim())
}

export function sessionCookie(token: string, secure: boolean): string {
  return `${COOKIE_NAME}=${encodeURIComponent(token)}; Path=/; Max-Age=${COOKIE_MAX_AGE_DAYS * 86400}; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`
}

export function clearCookie(secure: boolean): string {
  return `${COOKIE_NAME}=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax${secure ? '; Secure' : ''}`
}
