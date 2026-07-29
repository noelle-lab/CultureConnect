// GET /api/state
//
// Returns the whole shared app state — every collection plus its rev:
//     { collections: { stores: [...], products: [...], … }, revs: { … } }
//
// The browser calls this once on load and then polls it every few seconds; the
// per-collection `rev` lets it cheaply tell what (if anything) changed.
import { hasDatabase, withClient, ensureReady, readAll, json } from './_db.js'
import { buildSeed, COLLECTION_NAMES } from './_seed.js'

export async function handler(event) {
  if (event.httpMethod !== 'GET') {
    return json(405, { error: 'method-not-allowed' })
  }
  // No database configured yet → tell the client to use local demo mode.
  if (!hasDatabase()) {
    return json(503, { error: 'no-database' })
  }
  try {
    const result = await withClient(async (client) => {
      await ensureReady(client, buildSeed, COLLECTION_NAMES)
      return readAll(client)
    })
    return json(200, result)
  } catch (err) {
    return json(500, { error: 'server-error', message: String(err?.message || err) })
  }
}
