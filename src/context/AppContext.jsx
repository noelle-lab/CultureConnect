import { createContext, useContext, useEffect, useMemo, useState } from 'react'
import {
  stores as seedStores,
  products as seedProducts,
  cityRequests as seedCityRequests,
  orders as seedOrders,
} from '../data/mockData'

const AppContext = createContext(null)

const STORAGE_KEY = 'cultureconnect.state.v1'

// Demo credentials. Auth is intentionally fake — any of these (or any
// password) will work. Shown on the sign-in screens so the demo is easy to use.
export const DEMO_ACCOUNTS = {
  buyer: { email: 'buyer@cultureconnect.shop', password: 'shop123' },
  admin: { email: 'admin@cultureconnect.shop', password: 'admin123' },
}

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
  const [stores, setStores] = useState(persisted?.stores ?? seedStores)
  const [products, setProducts] = useState(persisted?.products ?? seedProducts)
  const [cityRequests, setCityRequests] = useState(
    persisted?.cityRequests ?? seedCityRequests,
  )
  const [orders, setOrders] = useState(persisted?.orders ?? seedOrders)

  // Persist everything so the demo survives refreshes.
  useEffect(() => {
    const snapshot = { user, cart, stores, products, cityRequests, orders }
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(snapshot))
    } catch {
      /* ignore quota errors */
    }
  }, [user, cart, stores, products, cityRequests, orders])

  // --- Auth (fake) ---------------------------------------------------------
  function signIn(role, email, name) {
    setUser({
      role,
      email,
      name: name || (role === 'admin' ? 'CultureConnect Admin' : 'Guest Buyer'),
    })
  }
  function signOut() {
    setUser(null)
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
    setStores((prev) => [
      { id: `st-${Date.now()}`, status: 'prospect', services: [], ...store },
      ...prev,
    ])
  }

  // --- Products (admin) ----------------------------------------------------
  function updateProduct(id, patch) {
    setProducts((prev) => prev.map((p) => (p.id === id ? { ...p, ...patch } : p)))
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
    setCityRequests(seedCityRequests)
    setOrders(seedOrders)
  }

  const value = useMemo(
    () => ({
      user,
      cart,
      stores,
      products,
      cityRequests,
      orders,
      signIn,
      signOut,
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
      toggleCrosslist,
      placeOrder,
      resetDemo,
    }),
    [user, cart, stores, products, cityRequests, orders],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  const ctx = useContext(AppContext)
  if (!ctx) throw new Error('useApp must be used within AppProvider')
  return ctx
}
