import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  stores as seedStores,
  products as seedProducts,
  cityRequests as seedCityRequests,
  partnerRequests as seedPartnerRequests,
  orders as seedOrders,
} from '../data/mockData'
import {
  OWNER_EMAIL,
  normalizeEmail,
  createInviteToken,
  verifyInviteToken,
  inviteLinkFor,
} from '../lib/adminAuth'
import { hashOwnerEmail } from '../lib/ownerGate'
import { clearAllDrafts } from '../lib/useFormDraft'
import { fetchState, mutateState } from '../lib/remoteState'

const AppContext = createContext(null)

// Human-readable labels for the service a partner-shop applicant picked. Shared
// by the research-note builder here and the Partner Requests admin board.
export const SERVICE_LABEL = {
  listing: 'List on CultureConnect',
  crosslisting: 'Cross-listing (Etsy/eBay)',
  both: 'Both services',
}

// Bumped to v4 for the merge of two parallel v3 shapes: the marketplace grew
// to 7 businesses with ~15 products each, owner portraits, and two-paragraph
// founder stories, while admin auth moved to real Google Sign-In + invite-only
// access (the `admins` and `invites` collections). Returning visitors load the
// new seed data instead of a stale v3 that only had one half of these fields.
//
// NOTE: as of the shared-database migration this localStorage snapshot is only
// a fallback/cache. When a backend is configured (DATABASE_URL set, see
// netlify/functions/), the shared collections below come from — and are saved
// to — that database instead, so every admin and the public site see the same
// data. Without a backend the app still runs entirely from this snapshot, which
// is the original front-end-only demo mode (per-browser, not shared).
const STORAGE_KEY = 'cultureconnect.state.v4'

// How often (ms) to poll the backend for other admins' changes. This stack has
// no websockets, so we poll; the per-collection rev counter makes each poll
// cheap and only re-renders what actually changed. A few seconds is a good
// balance between "feels live" and not hammering the function.
const POLL_INTERVAL_MS = 4000

// Which context state maps to which shared collection name on the server.
// (user + cart are deliberately absent — they're per-person session state that
// stays in this browser, never shared.)
const SHARED_COLLECTIONS = [
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

// Demo credentials for the FAKE buyer sign-in only. Any email / password works.
// Admins do NOT use this — they sign in with a real Google account (invite-only).
export const DEMO_ACCOUNTS = {
  buyer: { email: 'buyer@cultureconnect.shop', password: 'shop123' },
}

// Business-owner sign-ins for the shop portal (linked from the "For Businesses"
// page). Each account is tied to one existing partner shop; the portal shows
// only the services that shop is enrolled in — so an owner on the "listing"
// plan sees just their CultureConnect listings, while an owner on both plans
// also gets the cross-listing manager.
//
// This map is keyed by the SHA-256 hash of the owner's email, not the email
// itself, so the addresses that unlock the portal never ship in the code or
// bundle — a visitor has to already know their registered email to get in (see
// src/lib/ownerGate.js). Add an owner by generating their hash:
//   node -e "console.log(require('crypto').createHash('sha256').update('you@shop.com').digest('hex'))"
export const OWNER_ACCOUNTS = {
  // mehmet@anatoliahome.shop — enrolled in CultureConnect listing only.
  '7daa8b8c42fa154e4be5da0eee351695d78aff6b3a744d60cbdb547f1b42e34e': {
    storeId: 'st-anatolia',
    name: 'Mehmet Demir',
    shop: 'Anatolia Home',
  },
  // linh@goldenlotus.shop — CultureConnect listing AND the cross-listing service.
  '2dcc2c42f060b270f8a4cf9b128fb20ae324e581c74557033d32fe784fd1664b': {
    storeId: 'st-golden-lotus',
    name: 'Linh Tran',
    shop: 'Golden Lotus Provisions',
  },
}

// The team roster always starts with the founder so there's a way to send the
// first invite. Everyone else gets on the list by redeeming an invite link.
const seedAdmins = [
  {
    email: OWNER_EMAIL,
    name: 'Noelle',
    status: 'owner', // owner | active (invited & redeemed)
    addedAt: '2026-01-01',
  },
]

function loadPersisted() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    return JSON.parse(raw)
  } catch {
    return null
  }
}

export function AppProvider({ children }) {
  const persisted = loadPersisted()

  const [user, setUser] = useState(persisted?.user ?? null) // { name, email, role }
  const [cart, setCart] = useState(persisted?.cart ?? []) // [{ productId, qty }]

  // Two snapshots of the catalog, on purpose:
  //   • `stores` / `products`          = the DRAFT the admin console edits.
  //   • `publishedStores` / `publishedProducts` = what the PUBLIC storefront shows.
  // Admin edits only touch the draft; the live site doesn't change until an
  // admin clicks "Publish edits" (draft → published) or "Discard edits"
  // (published → draft) in the console top bar. Returning demos that predate
  // this split fall back to their existing `stores`/`products` as the published
  // snapshot so their live site doesn't suddenly revert to seed data.
  const [stores, setStores] = useState(persisted?.stores ?? seedStores)
  const [products, setProducts] = useState(persisted?.products ?? seedProducts)
  const [publishedStores, setPublishedStores] = useState(
    persisted?.publishedStores ?? persisted?.stores ?? seedStores,
  )
  const [publishedProducts, setPublishedProducts] = useState(
    persisted?.publishedProducts ?? persisted?.products ?? seedProducts,
  )
  const [cityRequests, setCityRequests] = useState(
    persisted?.cityRequests ?? seedCityRequests,
  )
  // Inbound partner-shop applications submitted from the "For Businesses" page,
  // triaged on the admin console's Partner Requests board.
  const [partnerRequests, setPartnerRequests] = useState(
    persisted?.partnerRequests ?? seedPartnerRequests,
  )
  const [orders, setOrders] = useState(persisted?.orders ?? seedOrders)
  // Admin roster + outstanding invite links (see src/lib/adminAuth.js).
  const [admins, setAdmins] = useState(persisted?.admins ?? seedAdmins)
  const [invites, setInvites] = useState(persisted?.invites ?? [])
  // A lasting memory of every email that's ever been invited — even after an
  // invite is redeemed, revoked, or the person is later removed. This is what
  // powers the "previously invited" autocomplete on the Team page, so an admin
  // never has to retype an address they've invited before.
  const [invitedEmails, setInvitedEmails] = useState(
    persisted?.invitedEmails ?? [],
  )

  // --- Shared-backend wiring ------------------------------------------------
  // backendMode: 'unknown' until the first fetch resolves, then 'remote' (a
  // database is configured — data is shared across everyone) or 'local' (no
  // backend — original per-browser demo mode).
  const [backendMode, setBackendMode] = useState('unknown')
  const backendModeRef = useRef('unknown')
  useEffect(() => {
    backendModeRef.current = backendMode
  }, [backendMode])

  // Last-seen server rev per collection. A poll only adopts a collection when
  // its rev has moved, so unchanged data never causes a needless re-render.
  const revsRef = useRef({})
  // Count of in-flight writes. While >0 we skip polling so a slow poll can't
  // momentarily revert an optimistic local edit before its write lands.
  const inflightRef = useRef(0)

  // Map collection name -> its setter, for applying server state generically.
  const settersRef = useRef(null)
  if (!settersRef.current) {
    settersRef.current = {
      stores: setStores,
      products: setProducts,
      publishedStores: setPublishedStores,
      publishedProducts: setPublishedProducts,
      cityRequests: setCityRequests,
      partnerRequests: setPartnerRequests,
      orders: setOrders,
      admins: setAdmins,
      invites: setInvites,
      invitedEmails: setInvitedEmails,
    }
  }

  // Adopt server state: for each collection whose rev changed, replace local
  // state (skipping the write when the value is byte-for-byte identical, so we
  // don't trigger a pointless render). Used by both the poll and the response
  // to our own writes.
  function applyRemote(collections, revs) {
    if (!collections) return
    const setters = settersRef.current
    for (const name of SHARED_COLLECTIONS) {
      if (!(name in collections)) continue
      const incomingRev = revs?.[name]
      const known = revsRef.current[name]
      if (incomingRev !== undefined && incomingRev === known) continue
      const incoming = collections[name]
      setters[name]((prev) =>
        JSON.stringify(prev) === JSON.stringify(incoming) ? prev : incoming,
      )
      revsRef.current[name] = incomingRev
    }
  }

  // On mount: ask the backend for the shared state. If it's configured, switch
  // to 'remote' and adopt it; if not (or on error), stay in local demo mode.
  useEffect(() => {
    let cancelled = false
    fetchState()
      .then((res) => {
        if (cancelled) return
        if (res.available) {
          applyRemote(res.collections, res.revs)
          setBackendMode('remote')
        } else {
          setBackendMode('local')
        }
      })
      .catch((err) => {
        if (cancelled) return
        // Network/server hiccup — fall back to local mode rather than break.
        console.warn(
          'CultureConnect: could not reach the shared database, using local demo mode.',
          err,
        )
        setBackendMode('local')
      })
    return () => {
      cancelled = true
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [])

  // Poll for other admins' changes while in remote mode.
  useEffect(() => {
    if (backendMode !== 'remote') return
    const id = setInterval(() => {
      if (inflightRef.current > 0) return // don't fight our own in-flight write
      fetchState()
        .then((res) => {
          if (res.available) applyRemote(res.collections, res.revs)
        })
        .catch(() => {
          /* transient; the next tick will try again */
        })
    }, POLL_INTERVAL_MS)
    return () => clearInterval(id)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backendMode])

  // Send a write to the backend (no-op in local mode, where the localStorage
  // effect below is the store). Fire-and-forget: the local state was already
  // updated optimistically, and the authoritative response is adopted when it
  // lands. `await`-able for the few callers that need confirmation.
  function pushOp(op, args) {
    if (backendModeRef.current !== 'remote') return Promise.resolve(null)
    inflightRef.current += 1
    return mutateState(op, args)
      .then((res) => {
        if (res.available) applyRemote(res.collections, res.revs)
        return res
      })
      .catch((err) => {
        console.error(`CultureConnect: failed to save "${op}"`, err)
        return null
      })
      .finally(() => {
        inflightRef.current -= 1
      })
  }

  // Keep the admin roster live across tabs/windows in LOCAL mode. Invites are
  // accepted on the invitee's own tab (they open the link there), which writes
  // to localStorage — but React state in a tab that's already open won't notice
  // on its own. In remote mode the poll handles this (and every other) sync, so
  // this listener is really just for the no-backend demo.
  useEffect(() => {
    function onStorage(e) {
      if (e.key !== STORAGE_KEY || !e.newValue) return
      if (backendModeRef.current === 'remote') return
      let next
      try {
        next = JSON.parse(e.newValue)
      } catch {
        return
      }
      if (!next) return
      const sync = (setter, incoming) => {
        if (incoming === undefined) return
        setter((prev) =>
          JSON.stringify(prev) === JSON.stringify(incoming) ? prev : incoming,
        )
      }
      sync(setAdmins, next.admins)
      sync(setInvites, next.invites)
      sync(setInvitedEmails, next.invitedEmails)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [])

  // Persist a snapshot to localStorage. In local mode this IS the store; in
  // remote mode it's just a cache/fallback (harmless) and per-browser user/cart.
  useEffect(() => {
    const snapshot = {
      user,
      cart,
      stores,
      products,
      publishedStores,
      publishedProducts,
      cityRequests,
      partnerRequests,
      orders,
      admins,
      invites,
      invitedEmails,
    }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    } catch {
      /* ignore quota errors */
    }
  }, [
    user,
    cart,
    stores,
    products,
    publishedStores,
    publishedProducts,
    cityRequests,
    partnerRequests,
    orders,
    admins,
    invites,
    invitedEmails,
  ])

  // --- Buyer auth (fake) ---------------------------------------------------
  // Buyers / businesses get an intentionally fake sign-in — any credentials
  // work. Admins do NOT use this path. (Session-only, stays in this browser.)
  function signIn(email, name) {
    setUser({ role: 'buyer', email, name: name || 'Guest Buyer' })
  }
  function signOut() {
    setUser(null)
  }

  // --- Business-owner auth -------------------------------------------------
  // Sign in a partner shop owner. Access is gated on the owner's email: we hash
  // the address they typed and only let them in when it matches an entry in
  // OWNER_ACCOUNTS (which stores hashes, never plain emails — see
  // src/lib/ownerGate.js). This is what keeps a casual visitor from reaching the
  // portal. On success it attaches the owner's storeId so the portal knows which
  // shop's listings to manage. Async because hashing is; returns { ok } or
  // { ok:false }.
  async function signInOwner(email) {
    const hash = await hashOwnerEmail(email)
    const acct = hash && OWNER_ACCOUNTS[hash]
    if (!acct) return { ok: false }
    setUser({
      role: 'owner',
      email: normalizeEmail(email),
      name: acct.name,
      storeId: acct.storeId,
      shop: acct.shop,
    })
    return { ok: true }
  }

  // --- Admin auth (real Google + invite-only) ------------------------------
  // Is this email allowed into the admin area? True only for the owner or an
  // email that has redeemed an invite (and hasn't been revoked).
  function isAuthorizedAdmin(email) {
    const e = normalizeEmail(email)
    return admins.some((a) => a.email === e)
  }
  function adminRecord(email) {
    const e = normalizeEmail(email)
    return admins.find((a) => a.email === e) || null
  }

  // Called after a successful Google sign-in. `profile` comes from
  // decodeGoogleCredential (or the demo fallback). Only lets verified,
  // invited accounts in. Returns { ok } or { ok:false, reason }. Stays
  // synchronous; the roster's last-sign-in bookkeeping persists in the
  // background.
  function signInAdminGoogle(profile) {
    if (!profile?.email) return { ok: false, reason: 'no-email' }
    if (profile.emailVerified === false)
      return { ok: false, reason: 'unverified' }
    if (!isAuthorizedAdmin(profile.email))
      return { ok: false, reason: 'not-invited' }

    const email = normalizeEmail(profile.email)
    const today = new Date().toISOString().slice(0, 10)
    // Remember the latest name/photo Google gave us (optimistic + persisted).
    setAdmins((prev) =>
      prev.map((a) =>
        a.email === email
          ? {
              ...a,
              name: profile.name || a.name,
              picture: profile.picture || a.picture,
              lastSignIn: today,
            }
          : a,
      ),
    )
    pushOp('recordAdminSignIn', {
      email,
      name: profile.name || '',
      picture: profile.picture || '',
      date: today,
    })
    setUser({
      role: 'admin',
      email,
      name: profile.name || adminRecord(email)?.name || 'Admin',
      picture: profile.picture || '',
      authProvider: 'google',
    })
    return { ok: true }
  }

  // Create an invite: mints a signed link and records the pending invite +
  // pre-authorises the email so it's ready the moment they sign in with Google.
  // Returns { id, email, token, link }.
  async function createInvite(email) {
    const clean = normalizeEmail(email)
    const token = await createInviteToken(clean)
    const link = inviteLinkFor(token)
    const id = `inv-${Date.now()}`
    const invite = {
      id,
      email: clean,
      token,
      link,
      createdAt: new Date().toISOString().slice(0, 10),
      redeemed: false,
    }
    // Remember this address forever (most-recent first, no duplicates), so it's
    // offered as a suggestion next time — even if the invite is later revoked.
    setInvitedEmails((prev) => [clean, ...prev.filter((e) => e !== clean)])
    setInvites((prev) => [
      invite,
      // Drop any older pending invite for the same email — one active link each.
      ...prev.filter((i) => i.email !== clean),
    ])
    // Persist so the invite works from any device / any admin's console.
    await pushOp('createInvite', { invite })
    return { id, email: clean, token, link }
  }

  // Check an invite link WITHOUT accepting it (called on the /invite page load).
  // Read-only: it never touches the admin roster, so opening a link doesn't grant
  // access on its own — the invitee has to click "Accept invitation" for that.
  // Returns { ok, email, alreadyAdmin } or { ok:false, reason }.
  async function verifyInvite(token) {
    const res = await verifyInviteToken(token)
    if (!res.ok) return res
    return { ok: true, email: res.email, alreadyAdmin: isAuthorizedAdmin(res.email) }
  }

  // Accept an invite (the invitee clicks "Accept invitation" on the /invite page).
  // This is the deliberate step that adds the email to the shared admin roster.
  // Returns { ok, email } or { ok:false }.
  async function acceptInvite(token) {
    const res = await verifyInviteToken(token)
    if (!res.ok) return res
    const email = res.email
    const today = new Date().toISOString().slice(0, 10)
    setAdmins((prev) =>
      prev.some((a) => a.email === email)
        ? // Already remembered — just note that they (re)accepted.
          prev.map((a) =>
            a.email === email ? { ...a, acceptedAt: a.acceptedAt || today } : a,
          )
        : [
            ...prev,
            {
              email,
              name: '',
              status: 'active',
              addedAt: today,
              acceptedAt: today,
            },
          ],
    )
    setInvites((prev) =>
      prev.map((i) =>
        i.token === token ? { ...i, redeemed: true, acceptedAt: today } : i,
      ),
    )
    // Persist to the shared roster so every admin's console sees the new member.
    await pushOp('acceptInvite', { email, token, date: today })
    return { ok: true, email }
  }

  // Cancel a pending invite link.
  function revokeInvite(id) {
    setInvites((prev) => prev.filter((i) => i.id !== id))
    pushOp('revokeInvite', { id })
  }

  // Remove an admin's access (owner can't be removed). Signs them out if it's
  // the currently signed-in account.
  function revokeAdmin(email) {
    const e = normalizeEmail(email)
    if (adminRecord(e)?.status === 'owner') return
    setAdmins((prev) => prev.filter((a) => a.email !== e))
    setInvites((prev) => prev.filter((i) => i.email !== e))
    if (normalizeEmail(user?.email) === e && user?.role === 'admin') setUser(null)
    pushOp('revokeAdmin', { email: e })
  }

  // --- Cart (per-browser, not shared) --------------------------------------
  function addToCart(productId, qty = 1) {
    setCart((prev) => {
      const existing = prev.find((i) => i.productId === productId)
      if (existing) {
        return prev.map((i) =>
          i.productId === productId ? { ...i, qty: i.qty + qty } : i,
        )
      }
      return [...prev, { productId, qty }]
    })
  }
  function updateCartQty(productId, qty) {
    setCart((prev) =>
      qty <= 0
        ? prev.filter((i) => i.productId !== productId)
        : prev.map((i) => (i.productId === productId ? { ...i, qty } : i)),
    )
  }
  function removeFromCart(productId) {
    setCart((prev) => prev.filter((i) => i.productId !== productId))
  }
  function clearCart() {
    setCart([])
  }

  // --- City requests -------------------------------------------------------
  function addCityRequest(req) {
    const record = {
      id: `cr-${Date.now()}`,
      votes: 1,
      status: 'requested',
      submittedBy: user?.email ?? 'anonymous',
      date: new Date().toISOString().slice(0, 10),
      ...req,
    }
    setCityRequests((prev) => [record, ...prev])
    pushOp('addCityRequest', { req: record })
  }
  function voteCityRequest(id) {
    setCityRequests((prev) =>
      prev.map((c) => (c.id === id ? { ...c, votes: c.votes + 1 } : c)),
    )
    pushOp('voteCityRequest', { id })
  }
  function setCityRequestStatus(id, status) {
    setCityRequests((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c)),
    )
    pushOp('setCityRequestStatus', { id, status })
  }

  // --- Partner-shop requests -----------------------------------------------
  // A shop owner applies to join from the "For Businesses" page. The request
  // lands as `new` on the admin console's Partner Requests board.
  function addPartnerRequest(req) {
    const record = {
      id: `pr-${Date.now()}`,
      status: 'new', // new | research | approved | declined
      submittedBy: user?.email ?? 'anonymous',
      date: new Date().toISOString().slice(0, 10),
      ...req,
    }
    setPartnerRequests((prev) => [record, ...prev])
    pushOp('addPartnerRequest', { req: record })
    return record
  }

  function updatePartnerRequest(id, patch) {
    setPartnerRequests((prev) =>
      prev.map((r) => (r.id === id ? { ...r, ...patch } : r)),
    )
    pushOp('updatePartnerRequest', { id, patch })
  }

  function setPartnerRequestStatus(id, status) {
    updatePartnerRequest(id, { status })
  }

  // "Move to research": advance the request to the research stage AND drop the
  // shop into the Shop Discovery pipeline as a fresh prospect, so the team can
  // actually work it alongside shops they've sourced themselves. We only spin up
  // the discovery prospect once (guarded by researchStoreId) so re-clicking, or
  // moving the card back and forth, never creates duplicates.
  function movePartnerRequestToResearch(id) {
    const req = partnerRequests.find((r) => r.id === id)
    if (!req) return
    if (req.researchStoreId) {
      setPartnerRequestStatus(id, 'research')
      return
    }
    const notes = [
      req.message,
      req.service && `Interested in: ${SERVICE_LABEL[req.service] ?? req.service}.`,
      req.email && `Contact: ${req.email}`,
    ]
      .filter(Boolean)
      .join('\n\n')
    const store = addStore({
      name: req.shop,
      owner: req.contact || '',
      heritage: req.heritage || '',
      city: req.city || 'New York City',
      neighborhood: '',
      story: notes,
      status: 'prospect',
      services: [],
      rating: null,
    })
    updatePartnerRequest(id, { status: 'research', researchStoreId: store.id })
  }

  // --- Stores (admin) ------------------------------------------------------
  function updateStore(id, patch) {
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
    pushOp('updateStore', { id, patch })
  }
  function addStore(store) {
    const created = {
      id: `st-${Date.now()}`,
      status: 'prospect',
      services: [],
      city: 'New York City',
      rating: null,
      ...store,
    }
    setStores((prev) => [created, ...prev])
    pushOp('addStore', { store: created })
    return created
  }

  // --- Products (admin) ----------------------------------------------------
  function updateProduct(id, patch) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
    pushOp('updateProduct', { id, patch })
  }
  function addProduct(product) {
    const created = {
      id: `p-${Date.now()}`,
      category: 'Food & Pantry',
      inPersonPrice: 0,
      stock: 0,
      crosslisted: [],
      description: '',
      image: '',
      ...product,
    }
    setProducts((prev) => [created, ...prev])
    pushOp('addProduct', { product: created })
    return created
  }
  function removeProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
    pushOp('removeProduct', { id })
  }
  function toggleCrosslist(id, channel) {
    setProducts((prev) =>
      prev.map((p) => {
        if (p.id !== id) return p
        const has = p.crosslisted.includes(channel)
        return {
          ...p,
          crosslisted: has
            ? p.crosslisted.filter((c) => c !== channel)
            : [...p.crosslisted, channel],
        }
      }),
    )
    pushOp('toggleCrosslist', { id, channel })
  }

  // --- Publish / discard draft catalog edits -------------------------------
  // Are there any admin edits to the catalog that aren't live yet? Compared by
  // value — a JSON compare is plenty for this front-end prototype's data sizes.
  const hasPendingEdits = useMemo(
    () =>
      JSON.stringify(stores) !== JSON.stringify(publishedStores) ||
      JSON.stringify(products) !== JSON.stringify(publishedProducts),
    [stores, products, publishedStores, publishedProducts],
  )

  // Push the current draft live: the public storefront now shows these shops
  // and listings — for everyone, on every device.
  function publishEdits() {
    setPublishedStores(stores)
    setPublishedProducts(products)
    pushOp('publishEdits', {})
  }

  // Throw the draft away and start again from what's currently live.
  function discardEdits() {
    setStores(publishedStores)
    setProducts(publishedProducts)
    pushOp('discardEdits', {})
  }

  // --- Orders (checkout) ---------------------------------------------------
  function placeOrder(details) {
    const id = `ord-${1043 + orders.length}`
    const order = {
      id,
      date: new Date().toISOString().slice(0, 10),
      buyer: details.email || user?.email || 'guest@cultureconnect.shop',
      city: details.city || 'Unknown',
      items: cart.map((i) => ({ productId: i.productId, qty: i.qty })),
      status: 'paid',
    }
    setOrders((prev) => [order, ...prev])
    clearCart()
    pushOp('placeOrder', { order })
    return order
  }

  function resetDemo() {
    localStorage.removeItem(STORAGE_KEY)
    // Also drop any half-finished new-business / new-listing form drafts.
    clearAllDrafts()
    setUser(null)
    setCart([])
    setStores(seedStores)
    setProducts(seedProducts)
    setPublishedStores(seedStores)
    setPublishedProducts(seedProducts)
    setCityRequests(seedCityRequests)
    setPartnerRequests(seedPartnerRequests)
    setOrders(seedOrders)
    // Reset the admin roster back to just the owner, and clear invites. This
    // does NOT touch anyone's real Google account — only our local allow-list.
    setAdmins(seedAdmins)
    setInvites([])
    setInvitedEmails([])
    // In remote mode, reset the shared database too — for everyone.
    pushOp('reset', {})
  }

  const value = useMemo(
    () => ({
      user,
      cart,
      stores,
      products,
      publishedStores,
      publishedProducts,
      hasPendingEdits,
      cityRequests,
      partnerRequests,
      orders,
      admins,
      invites,
      invitedEmails,
      // Whether edits are shared via the backend ('remote') or local-only
      // ('local'); 'unknown' during the first load. Handy for a UI indicator.
      backendMode,
      signIn,
      signOut,
      signInOwner,
      isAuthorizedAdmin,
      signInAdminGoogle,
      createInvite,
      verifyInvite,
      acceptInvite,
      // Back-compat alias: acceptInvite is the deliberate "accept" action.
      redeemInvite: acceptInvite,
      revokeInvite,
      revokeAdmin,
      addToCart,
      updateCartQty,
      removeFromCart,
      clearCart,
      addCityRequest,
      voteCityRequest,
      setCityRequestStatus,
      addPartnerRequest,
      updatePartnerRequest,
      setPartnerRequestStatus,
      movePartnerRequestToResearch,
      updateStore,
      addStore,
      updateProduct,
      addProduct,
      removeProduct,
      toggleCrosslist,
      publishEdits,
      discardEdits,
      placeOrder,
      resetDemo,
    }),
    [
      user,
      cart,
      stores,
      products,
      publishedStores,
      publishedProducts,
      hasPendingEdits,
      cityRequests,
      partnerRequests,
      orders,
      admins,
      invites,
      invitedEmails,
      backendMode,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
