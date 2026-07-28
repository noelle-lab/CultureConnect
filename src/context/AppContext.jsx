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
  // Catalog is split into two copies. `stores` / `products` are the PUBLISHED
  // versions the public storefront reads. Admins never edit these directly —
  // they edit `draftStores` / `draftProducts` (the working copy), and those
  // changes only reach the public site when an admin clicks "Publish edits".
  const [stores, setStores] = useState(persisted?.stores ?? seedStores)
  const [products, setProducts] = useState(persisted?.products ?? seedProducts)
  // Admin working copy. Falls back to the published catalog for visitors who
  // predate the draft/publish split (no `draftStores` persisted yet).
  const [draftStores, setDraftStores] = useState(
    persisted?.draftStores ?? persisted?.stores ?? seedStores,
  )
  const [draftProducts, setDraftProducts] = useState(
    persisted?.draftProducts ?? persisted?.products ?? seedProducts,
  )
  const [cityRequests, setCityRequests] = useState(
    persisted?.cityRequests ?? seedCityRequests,
  )
  const [orders, setOrders] = useState(persisted?.orders ?? seedOrders)
  // Admin roster + outstanding invite links (see src/lib/adminAuth.js).
  const [admins, setAdmins] = useState(persisted?.admins ?? seedAdmins)
  const [invites, setInvites] = useState(persisted?.invites ?? [])

  // Persist everything so the demo survives refreshes.
  useEffect(() => {
    const snapshot = {
      user,
      cart,
      stores,
      products,
      draftStores,
      draftProducts,
      cityRequests,
      orders,
      admins,
      invites,
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
    draftStores,
    draftProducts,
    cityRequests,
    orders,
    admins,
    invites,
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

  // Redeem a token (called from the /invite page on the invitee's device).
  // Adds the email to the admin roster. Returns { ok, email } or { ok:false }.
  async function redeemInvite(token) {
    const res = await verifyInviteToken(token)
    if (!res.ok) return res
    const email = res.email
    setAdmins((prev) =>
      prev.some((a) => a.email === email)
        ? prev
        : [
            ...prev,
            {
              email,
              name: '',
              status: 'active',
              addedAt: new Date().toISOString().slice(0, 10),
            },
          ],
    )
    setInvites((prev) =>
      prev.map((i) => (i.token === token ? { ...i, redeemed: true } : i)),
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
  // All catalog edits land in the DRAFT copy. Nothing an admin changes here is
  // public until publishEdits() promotes the draft to the published catalog.
  function updateStore(id, patch) {
    setDraftStores((prev) => prev.map((s) => (s.id === id ? { ...s, ...patch } : s)))
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
    setDraftStores((prev) => [created, ...prev])
    return created
  }

  // --- Products (admin) ----------------------------------------------------
  function updateProduct(id, patch) {
    setDraftProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
  }
  function addProduct(product) {
    const created = {
      id: `p-${Date.now()}`,
      category: 'Food & Pantry',
      inPersonPrice: 0,
      stock: 0,
      emoji: '🏷️',
      crosslisted: [],
      description: '',
      image: '',
      ...product,
    }
    setDraftProducts((prev) => [created, ...prev])
    return created
  }
  function removeProduct(id) {
    setDraftProducts((prev) => prev.filter((p) => p.id !== id))
  }
  function toggleCrosslist(id, channel) {
    setDraftProducts((prev) =>
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

  // --- Publishing ----------------------------------------------------------
  // Number of catalog records that differ between the draft and what's live:
  // edited, newly added, or removed shops + products. Drives the "Publish
  // edits" banner in the admin console.
  const pendingChanges = useMemo(() => {
    let count = 0
    const livedStore = new Map(stores.map((s) => [s.id, JSON.stringify(s)]))
    draftStores.forEach((s) => {
      if (livedStore.get(s.id) !== JSON.stringify(s)) count++ // added or edited
    })
    const draftStoreIds = new Set(draftStores.map((s) => s.id))
    stores.forEach((s) => {
      if (!draftStoreIds.has(s.id)) count++ // removed
    })
    const livedProduct = new Map(products.map((p) => [p.id, JSON.stringify(p)]))
    draftProducts.forEach((p) => {
      if (livedProduct.get(p.id) !== JSON.stringify(p)) count++
    })
    const draftProductIds = new Set(draftProducts.map((p) => p.id))
    products.forEach((p) => {
      if (!draftProductIds.has(p.id)) count++
    })
    return count
  }, [stores, products, draftStores, draftProducts])

  // Promote the admin draft to the public catalog.
  function publishEdits() {
    setStores(draftStores)
    setProducts(draftProducts)
  }
  // Throw the draft away and start again from what's currently live.
  function discardEdits() {
    setDraftStores(stores)
    setDraftProducts(products)
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
    setDraftStores(seedStores)
    setDraftProducts(seedProducts)
    setCityRequests(seedCityRequests)
    setOrders(seedOrders)
    // Reset the admin roster back to just the owner, and clear invites. This
    // does NOT touch anyone's real Google account — only our local allow-list.
    setAdmins(seedAdmins)
    setInvites([])
  }

  const value = useMemo(
    () => ({
      user,
      cart,
      stores,
      products,
      draftStores,
      draftProducts,
      pendingChanges,
      publishEdits,
      discardEdits,
      cityRequests,
      orders,
      admins,
      invites,
      signIn,
      signOut,
      isAuthorizedAdmin,
      signInAdminGoogle,
      createInvite,
      redeemInvite,
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
      placeOrder,
      resetDemo,
    }),
    [
      user,
      cart,
      stores,
      products,
      draftStores,
      draftProducts,
      pendingChanges,
      cityRequests,
      orders,
      admins,
      invites,
    ],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
