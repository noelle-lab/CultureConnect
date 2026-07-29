import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  stores as seedStores,
  products as seedProducts,
  cityRequests as seedCityRequests,
  orders as seedOrders,
} from '../data/mockData'
import {
  OWNER_EMAIL,
  normalizeEmail,
  createInviteToken,
  verifyInviteToken,
  inviteLinkFor,
} from '../lib/adminAuth'

const AppContext = createContext(null)

// Bumped to v4 for the merge of two parallel v3 shapes: the marketplace grew
// to 7 businesses with ~15 products each, owner portraits, and two-paragraph
// founder stories, while admin auth moved to real Google Sign-In + invite-only
// access (the `admins` and `invites` collections). Returning visitors load the
// new seed data instead of a stale v3 that only had one half of these fields.
const STORAGE_KEY = 'cultureconnect.state.v4'

// Demo credentials for the FAKE buyer sign-in only. Any email / password works.
// Admins do NOT use this — they sign in with a real Google account (invite-only).
export const DEMO_ACCOUNTS = {
  buyer: { email: 'buyer@cultureconnect.shop', password: 'shop123' },
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

  // Keep the admin roster live across tabs/windows. Invites are accepted on the
  // invitee's own tab (they open the link there), which writes to localStorage —
  // but React state in a tab that's already open (e.g. the owner sitting on the
  // Team page) won't notice on its own. Listening for `storage` events lets that
  // tab pick up the acceptance the moment it happens, so the new admin moves into
  // the Admins section and out of Pending without a manual refresh.
  //
  // We only sync the invite/roster collections here — not `user`, which is this
  // tab's own sign-in session and must stay put. Each setter returns the previous
  // value unchanged when nothing actually differs, so identical writes bouncing
  // between tabs can't cause a re-render loop.
  useEffect(() => {
    function onStorage(e) {
      if (e.key !== STORAGE_KEY || !e.newValue) return
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

  // Persist everything so the demo survives refreshes.
  useEffect(() => {
    const snapshot = {
      user,
      cart,
      stores,
      products,
      publishedStores,
      publishedProducts,
      cityRequests,
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
    orders,
    admins,
    invites,
    invitedEmails,
  ])

  // --- Buyer auth (fake) ---------------------------------------------------
  // Buyers / businesses get an intentionally fake sign-in — any credentials
  // work. Admins do NOT use this path.
  function signIn(email, name) {
    setUser({ role: 'buyer', email, name: name || 'Guest Buyer' })
  }
  function signOut() {
    setUser(null)
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
  // invited accounts in. Returns { ok } or { ok:false, reason }.
  function signInAdminGoogle(profile) {
    if (!profile?.email) return { ok: false, reason: 'no-email' }
    if (profile.emailVerified === false)
      return { ok: false, reason: 'unverified' }
    if (!isAuthorizedAdmin(profile.email))
      return { ok: false, reason: 'not-invited' }

    const email = normalizeEmail(profile.email)
    // Remember the latest name/photo Google gave us.
    setAdmins((prev) =>
      prev.map((a) =>
        a.email === email
          ? {
              ...a,
              name: profile.name || a.name,
              picture: profile.picture || a.picture,
              lastSignIn: new Date().toISOString().slice(0, 10),
            }
          : a,
      ),
    )
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
    // Remember this address forever (most-recent first, no duplicates), so it's
    // offered as a suggestion next time — even if the invite is later revoked.
    setInvitedEmails((prev) => [clean, ...prev.filter((e) => e !== clean)])
    setInvites((prev) => [
      {
        id,
        email: clean,
        token,
        link,
        createdAt: new Date().toISOString().slice(0, 10),
        redeemed: false,
      },
      // Drop any older pending invite for the same email — one active link each.
      ...prev.filter((i) => i.email !== clean),
    ])
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
  // This is the deliberate step that adds the email to the admin roster and
  // remembers the account on this device (persisted to localStorage, so it
  // survives refreshes and return visits). Returns { ok, email } or { ok:false }.
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
    return { ok: true, email }
  }

  // Cancel a pending invite link.
  function revokeInvite(id) {
    setInvites((prev) => prev.filter((i) => i.id !== id))
  }

  // Remove an admin's access (owner can't be removed). Signs them out if it's
  // the currently signed-in account.
  function revokeAdmin(email) {
    const e = normalizeEmail(email)
    if (adminRecord(e)?.status === 'owner') return
    setAdmins((prev) => prev.filter((a) => a.email !== e))
    setInvites((prev) => prev.filter((i) => i.email !== e))
    if (normalizeEmail(user?.email) === e && user?.role === 'admin') setUser(null)
  }

  // --- Cart ----------------------------------------------------------------
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
    setCityRequests((prev) => [
      {
        id: `cr-${Date.now()}`,
        votes: 1,
        status: 'requested',
        submittedBy: user?.email ?? 'anonymous',
        date: new Date().toISOString().slice(0, 10),
        ...req,
      },
      ...prev,
    ])
  }
  function voteCityRequest(id) {
    setCityRequests((prev) =>
      prev.map((c) => (c.id === id ? { ...c, votes: c.votes + 1 } : c)),
    )
  }
  function setCityRequestStatus(id, status) {
    setCityRequests((prev) =>
      prev.map((c) => (c.id === id ? { ...c, status } : c)),
    )
  }

  // --- Stores (admin) ------------------------------------------------------
  function updateStore(id, patch) {
    setStores((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
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
    return created
  }

  // --- Products (admin) ----------------------------------------------------
  function updateProduct(id, patch) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
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
    return created
  }
  function removeProduct(id) {
    setProducts((prev) => prev.filter((p) => p.id !== id))
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
  // and listings.
  function publishEdits() {
    setPublishedStores(stores)
    setPublishedProducts(products)
  }

  // Throw the draft away and start again from what's currently live.
  function discardEdits() {
    setStores(publishedStores)
    setProducts(publishedProducts)
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
    return order
  }

  function resetDemo() {
    localStorage.removeItem(STORAGE_KEY)
    setUser(null)
    setCart([])
    setStores(seedStores)
    setProducts(seedProducts)
    setPublishedStores(seedStores)
    setPublishedProducts(seedProducts)
    setCityRequests(seedCityRequests)
    setOrders(seedOrders)
    // Reset the admin roster back to just the owner, and clear invites. This
    // does NOT touch anyone's real Google account — only our local allow-list.
    setAdmins(seedAdmins)
    setInvites([])
    setInvitedEmails([])
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
      orders,
      admins,
      invites,
      invitedEmails,
      signIn,
      signOut,
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
      orders,
      admins,
      invites,
      invitedEmails,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
