// Database plumbing shared by the API functions.
//
// One tiny table holds the whole shared app state — one row per collection,
// its value stored as JSONB, plus a `rev` counter that bumps on every write:
//
//     collections(name text pk, data jsonb, rev bigint, updated_at)
//
// The `rev` is what powers cheap live-sync: the browser remembers the rev it
// last saw for each collection and only re-renders one when the server's rev
// moves, so polling is quiet when nothing has changed.
//
// We use the Neon serverless driver's Pool (WebSocket) rather than the plain
// HTTP `neon()` helper because writes run inside a real transaction with
// `SELECT ... FOR UPDATE`, which serialises concurrent admins and prevents one
// admin's save from clobbering another's.
import { Pool } from '@neondatabase/serverless'

let _pool

function getPool() {
  if (!_pool) {
    const connectionString = process.env.DATABASE_URL
    if (!connectionString) throw new Error('DATABASE_URL is not set')
    _pool = new Pool({ connectionString })
  }
  return _pool
}

// Is the backend actually configured? When false the functions return a clear
// signal so the browser falls back to its old localStorage-only demo mode.
export function hasDatabase() {
  return Boolean(process.env.DATABASE_URL)
}

// Run `fn(client)` against a pooled connection, always releasing it afterwards.
export async function withClient(fn) {
  const client = await getPool().connect()
  try {
    return await fn(client)
  } finally {
    client.release()
  }
}

// Create the table if needed and insert any collection that doesn't exist yet.
// Idempotent and safe to call on every request; `on conflict do nothing` means
// existing data is never overwritten (so we don't stomp real edits on seeding).
export async function ensureReady(client, buildSeed, names) {
  await client.query(`
    create table if not exists collections (
      name text primary key,
      data jsonb not null default '[]'::jsonb,
      rev bigint not null default 0,
      updated_at timestamptz not null default now()
    )
  `)
  const seed = buildSeed()
  for (const name of names) {
    await client.query(
      `insert into collections (name, data, rev)
       values ($1, $2::jsonb, 0)
       on conflict (name) do nothing`,
      [name, JSON.stringify(seed[name] ?? [])],
    )
  }
}

// Read every collection into plain objects: { collections, revs }.
export async function readAll(client) {
  const { rows } = await client.query(
    'select name, data, rev from collections',
  )
  const collections = {}
  const revs = {}
  for (const row of rows) {
    collections[row.name] = row.data
    // rev comes back as a string (bigint); normalise to a JS number.
    revs[row.name] = Number(row.rev)
  }
  return { collections, revs }
}

// Standard JSON response helper.
export function json(statusCode, body) {
  return {
    statusCode,
    headers: {
      'Content-Type': 'application/json',
      // The API is same-origin behind /api/*, but no-store keeps any CDN or
      // browser cache from serving stale collections to a polling client.
      'Cache-Control': 'no-store',
    },
    body: JSON.stringify(body),
  }
}
