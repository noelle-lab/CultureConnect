// The demo seed for the shared database.
//
// The database starts empty; the first request seeds it with exactly the same
// shops, products, city requests, and orders the front-end prototype used to
// keep in localStorage. We import that data straight from src/data/mockData.js
// so there is a single source of truth — no hand-copied duplicate to drift.
//
// (esbuild bundles this import into the function at deploy time. mockData.js is
// pure data with no browser APIs, so it runs fine in the Node function runtime.)
import {
  stores as seedStores,
  products as seedProducts,
  cityRequests as seedCityRequests,
  partnerRequests as seedPartnerRequests,
  orders as seedOrders,
} from '../../src/data/mockData.js'

// Mirrors OWNER_EMAIL in src/lib/adminAuth.js. That module is browser-only
// (it uses crypto.subtle / btoa / import.meta), so we can't import it into the
// Node runtime — we keep the one constant in sync here instead. The founder is
// seeded as the first admin so there's always a way to send the first invite.
export const OWNER_EMAIL = 'noelle@c10family.com'

const seedAdmins = [
  { email: OWNER_EMAIL, name: 'Noelle', status: 'owner', addedAt: '2026-01-01' },
]

// The nine shared collections. `user` and `cart` are intentionally NOT here:
// they are per-person session state that stays in each browser, not shared.
export const COLLECTION_NAMES = [
  'stores',
  'products',
  'publishedStores',
  'publishedProducts',
  'cityRequests',
  'partnerRequests',
  'orders',
  'admins',
  'invites',
  'invitedEmails',
]

// A fresh copy of the seed for every collection. Called on first-time seeding
// and by the admin "Reset demo" action.
export function buildSeed() {
  return {
    // Draft catalog the admin console edits...
    stores: seedStores,
    products: seedProducts,
    // ...and the published snapshot the public storefront shows. They start
    // identical; admin edits move the draft, "Publish edits" copies it across.
    publishedStores: seedStores,
    publishedProducts: seedProducts,
    cityRequests: seedCityRequests,
    partnerRequests: seedPartnerRequests,
    orders: seedOrders,
    admins: seedAdmins,
    invites: [],
    invitedEmails: [],
  }
}
