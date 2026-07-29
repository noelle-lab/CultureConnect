// POST /api/mutate   body: { "op": "updateStore", "args": { … } }
//
// Applies one write to the shared state inside a single transaction and returns
// the full, fresh state afterwards (same shape as GET /api/state) so the caller
// stays perfectly in sync.
//
// Concurrency: we `SELECT … FOR UPDATE` every collection row at the top of the
// transaction, so two admins saving at the same moment are serialised — the
// second one reads the first one's committed change and builds on top of it,
// instead of overwriting it. Any collection whose value actually changed has
// its `rev` bumped, which is how polling clients notice the update.
import { hasDatabase, withClient, ensureReady, readAll, json } from './_db.js'
import { buildSeed, COLLECTION_NAMES } from './_seed.js'
import { applyOp } from './_ops.js'

export async function handler(event) {
  if (event.httpMethod !== 'POST') {
    return json(405, { error: 'method-not-allowed' })
  }
  if (!hasDatabase()) {
    return json(503, { error: 'no-database' })
  }

  let payload
  try {
    payload = JSON.parse(event.body || '{}')
  } catch {
    return json(400, { error: 'bad-json' })
  }
  const { op, args } = payload
  if (!op) return json(400, { error: 'missing-op' })

  try {
    const result = await withClient(async (client) => {
      await ensureReady(client, buildSeed, COLLECTION_NAMES)
      await client.query('begin')
      try {
        // Lock every row for the duration of the transaction.
        const { rows } = await client.query(
          'select name, data from collections for update',
        )
        const current = {}
        for (const row of rows) current[row.name] = row.data

        // Compute the next state with the exact same logic the client used.
        const next = applyOp(current, op, args)

        // Persist only the collections whose value actually changed, bumping
        // their rev so polling clients pick the change up.
        for (const name of COLLECTION_NAMES) {
          const before = JSON.stringify(current[name] ?? null)
          const after = JSON.stringify(next[name] ?? null)
          if (before !== after) {
            await client.query(
              `update collections
                 set data = $2::jsonb, rev = rev + 1, updated_at = now()
               where name = $1`,
              [name, after],
            )
          }
        }

        await client.query('commit')
      } catch (err) {
        await client.query('rollback')
        throw err
      }
      return readAll(client)
    })
    return json(200, result)
  } catch (err) {
    const message = String(err?.message || err)
    // An unknown op is the client's fault (400); everything else is a 500.
    const status = message.startsWith('Unknown op') ? 400 : 500
    return json(status, { error: 'mutate-failed', message })
  }
}
