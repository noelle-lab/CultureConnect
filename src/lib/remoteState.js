// Thin client for the shared-state API (netlify/functions/state.js & mutate.js).
//
// Two calls, both returning the whole state so the app can stay in sync:
//   fetchState()        -> { available, collections, revs }
//   mutateState(op,a)   -> { available, collections, revs }
//
// `available` is false when the backend isn't configured (the function replies
// 503 no-database). That's the signal for AppContext to fall back to the old
// front-end-only demo mode instead of erroring — so the app still runs before
// anyone has set DATABASE_URL.

const BASE = '/api'

async function request(path, options) {
  const res = await fetch(`${BASE}${path}`, options)
  let body = null
  try {
    body = await res.json()
  } catch {
    /* empty / non-JSON body */
  }
  return { ok: res.ok, status: res.status, body }
}

// GET the whole shared state. Resolves to { available:false } when the backend
// isn't configured; throws only on unexpected server/network failures.
export async function fetchState() {
  const { ok, status, body } = await request('/state', {
    headers: { Accept: 'application/json' },
  })
  if (ok) return { available: true, collections: body.collections, revs: body.revs }
  if (status === 503) return { available: false }
  throw new Error(body?.message || `state request failed (${status})`)
}

// Apply one write op and get the fresh state back.
export async function mutateState(op, args) {
  const { ok, status, body } = await request('/mutate', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ op, args }),
  })
  if (ok) return { available: true, collections: body.collections, revs: body.revs }
  if (status === 503) return { available: false }
  throw new Error(body?.message || `mutate "${op}" failed (${status})`)
}
