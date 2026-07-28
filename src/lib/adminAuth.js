// Admin authentication + invite plumbing.
//
// Two different sign-ins live in this app:
//   • Buyers / businesses  → intentionally FAKE (see AuthModal). Any email works.
//   • Admins (our team)     → REAL Google Sign-In, and invite-only.
//
// This file owns the admin side: how we mint and verify the one-off invite
// links, and how we read a Google account out of the token Google hands back.
//
// ---------------------------------------------------------------------------
// A note on how "invite-only" is enforced (important, please read)
// ---------------------------------------------------------------------------
// This repo is a front-end-only prototype with no backend, so there is no
// server to check a password against. We get as close as we can in the
// browser:
//
//   1. An invite link carries the invited email plus an expiry, HMAC-signed
//      with a shared secret. Because it's signed, nobody can hand-edit a link
//      to smuggle in a different email — the signature won't match.
//   2. Clicking a valid link records that email as an authorised admin (in the
//      browser it's opened in).
//   3. Admin sign-in then requires a REAL Google account whose verified email
//      is on that authorised list.
//
// The honest limitation: the signing secret ships inside the built JS, so a
// determined engineer who reads the bundle could forge a link. For a real
// production system the token would be signed and verified on a server the
// public can't see. When you're ready for that, the swap is small — this file
// is the only place tokens are made or checked. Until then this is a solid,
// demonstrable invite gate for the prototype.

// The founder's account. Seeded as the first admin so there's always a way in
// to send the very first invite — no chicken-and-egg problem.
export const OWNER_EMAIL = 'noelle@c10family.com'

// How long an invite link stays valid after you create it.
export const INVITE_TTL_DAYS = 14

// Your real Google OAuth Client ID, injected at build time. When this is set,
// admins get the genuine "Sign in with Google" button. When it's empty (e.g.
// nobody has configured it yet) the UI falls back to a clearly-labelled demo
// sign-in so the invite flow is still fully explorable. See .env.example.
export const GOOGLE_CLIENT_ID = import.meta.env.VITE_GOOGLE_CLIENT_ID || ''
export const HAS_GOOGLE = Boolean(GOOGLE_CLIENT_ID)

// Secret used to sign invite links. Override in production via env.
const INVITE_SECRET =
  import.meta.env.VITE_ADMIN_INVITE_SECRET || 'cultureconnect-dev-invite-secret'

export function normalizeEmail(email) {
  return String(email || '').trim().toLowerCase()
}

// --- base64url helpers -----------------------------------------------------
function toBase64Url(bytes) {
  let bin = ''
  bytes.forEach((b) => (bin += String.fromCharCode(b)))
  return btoa(bin).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}
function fromBase64Url(str) {
  const b64 = str.replace(/-/g, '+').replace(/_/g, '/')
  const bin = atob(b64)
  const bytes = new Uint8Array(bin.length)
  for (let i = 0; i < bin.length; i++) bytes[i] = bin.charCodeAt(i)
  return bytes
}
function encodeJson(obj) {
  return toBase64Url(new TextEncoder().encode(JSON.stringify(obj)))
}
function decodeJson(b64) {
  return JSON.parse(new TextDecoder().decode(fromBase64Url(b64)))
}

// --- HMAC-SHA256 signing ---------------------------------------------------
async function hmac(message) {
  const key = await crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(INVITE_SECRET),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign'],
  )
  const sig = await crypto.subtle.sign(
    'HMAC',
    key,
    new TextEncoder().encode(message),
  )
  return toBase64Url(new Uint8Array(sig))
}

// Constant-time-ish string compare (avoids leaking length/prefix via early
// return). Good enough for a client-side prototype.
function safeEqual(a, b) {
  if (a.length !== b.length) return false
  let diff = 0
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i)
  return diff === 0
}

// Create a signed invite token for an email. Returns the opaque token string.
export async function createInviteToken(email, ttlDays = INVITE_TTL_DAYS) {
  const payload = {
    email: normalizeEmail(email),
    exp: Date.now() + ttlDays * 24 * 60 * 60 * 1000,
    // A little entropy so two invites for the same email aren't identical.
    n: toBase64Url(crypto.getRandomValues(new Uint8Array(6))),
  }
  const body = encodeJson(payload)
  const sig = await hmac(body)
  return `${body}.${sig}`
}

// Verify a token. Returns { ok, email } on success, or { ok:false, reason }.
export async function verifyInviteToken(token) {
  try {
    const [body, sig] = String(token || '').split('.')
    if (!body || !sig) return { ok: false, reason: 'malformed' }
    const expected = await hmac(body)
    if (!safeEqual(sig, expected)) return { ok: false, reason: 'bad-signature' }
    const payload = decodeJson(body)
    if (!payload.email) return { ok: false, reason: 'malformed' }
    if (Date.now() > payload.exp) return { ok: false, reason: 'expired' }
    return { ok: true, email: normalizeEmail(payload.email), exp: payload.exp }
  } catch {
    return { ok: false, reason: 'malformed' }
  }
}

// Turn a token into the full link you'll email to an admin.
export function inviteLinkFor(token) {
  const origin =
    typeof window !== 'undefined' ? window.location.origin : ''
  return `${origin}/invite?token=${encodeURIComponent(token)}`
}

// --- Google credential (JWT) decoding --------------------------------------
// Google's Sign-In returns a JWT ID token. We only need the profile claims
// from its (base64url) payload — no signature verification is done in the
// browser prototype; a production backend would verify it against Google's
// public keys. Returns { email, name, picture, emailVerified, sub } or null.
export function decodeGoogleCredential(credential) {
  try {
    const payloadB64 = String(credential).split('.')[1]
    const claims = decodeJson(payloadB64)
    return {
      email: normalizeEmail(claims.email),
      name: claims.name || claims.given_name || '',
      picture: claims.picture || '',
      emailVerified: claims.email_verified !== false,
      sub: claims.sub || '',
    }
  } catch {
    return null
  }
}

// --- Google Identity Services script loader --------------------------------
// Loads https://accounts.google.com/gsi/client once and resolves with the
// global `google.accounts.id` handle. Rejects if it can't load (offline, etc.)
// so callers can fall back to the demo path.
let gsiPromise = null
export function loadGoogleIdentity() {
  if (typeof window === 'undefined') return Promise.reject(new Error('no window'))
  if (window.google?.accounts?.id) return Promise.resolve(window.google)
  if (gsiPromise) return gsiPromise

  gsiPromise = new Promise((resolve, reject) => {
    const existing = document.querySelector('script[data-gsi]')
    const onload = () => {
      if (window.google?.accounts?.id) resolve(window.google)
      else reject(new Error('Google Identity Services failed to initialise'))
    }
    if (existing) {
      existing.addEventListener('load', onload)
      existing.addEventListener('error', () => reject(new Error('gsi load error')))
      return
    }
    const s = document.createElement('script')
    s.src = 'https://accounts.google.com/gsi/client'
    s.async = true
    s.defer = true
    s.dataset.gsi = 'true'
    s.onload = onload
    s.onerror = () => reject(new Error('gsi load error'))
    document.head.appendChild(s)
  })
  return gsiPromise
}
