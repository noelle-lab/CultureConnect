// Owner-portal access gate.
//
// The "For Businesses" page (src/pages/Services.jsx) lets an existing partner
// shop sign in to their owner portal. We don't want a casual visitor who just
// lands on the site to click straight in, so access is tied to a specific
// email the owner has to type. To keep the site from advertising which emails
// work, the owner allow-list (OWNER_ACCOUNTS in src/context/AppContext.jsx) is
// keyed by a SHA-256 *hash* of each authorised email — the addresses themselves
// never appear in the code or the shipped bundle. A typed email is hashed the
// same way here and only matches when its hash is on the list.
//
// Honest limitation (same as the admin invite gate in adminAuth.js): this is a
// front-end-only prototype, so the check runs in the browser. Hashing means the
// working emails aren't sitting in the page or bundle for anyone to read, which
// stops casual access — but it isn't a substitute for a real server-side login.
// When a backend exists, move this verification behind it.

import { normalizeEmail } from './adminAuth'

// Normalise (trim + lower-case) an email and return its SHA-256 hash as
// lowercase hex, using the browser's built-in crypto. Normalising the same way
// everywhere means capitalisation or stray spaces never lock a real owner out.
//
// Regenerate a hash for a new owner email with:
//   node -e "console.log(require('crypto').createHash('sha256').update('you@shop.com').digest('hex'))"
export async function hashOwnerEmail(email) {
  const clean = normalizeEmail(email)
  if (!clean) return ''
  const bytes = new TextEncoder().encode(clean)
  const digest = await crypto.subtle.digest('SHA-256', bytes)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}
