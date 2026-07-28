import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  onlinePrice,
  commission,
  shippingQuotes,
  FREE_SHIPPING_THRESHOLD,
} from '../data/mockData'

export default function Cart() {
  const { cart, products, stores, updateCartQty, removeFromCart, placeOrder, user } =
    useApp()
  const [placed, setPlaced] = useState(null)
  const [city, setCity] = useState('')
  const [email, setEmail] = useState(user?.email || '')

  // Address-based shipping estimator.
  const [address, setAddress] = useState('')
  const [quote, setQuote] = useState(null) // { zone, options } | null
  const [shipMethod, setShipMethod] = useState(null) // 'standard' | 'express'
  const [addressError, setAddressError] = useState('')

  const lines = cart
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product) return null
      const store = stores.find((s) => s.id === product.storeId)
      const unit = onlinePrice(product.inPersonPrice)
      return { ...item, product, store, unit, subtotal: unit * item.qty }
    })
    .filter(Boolean)

  const subtotal = lines.reduce((s, l) => s + l.subtotal, 0)
  const selectedOption = quote?.options.find((o) => o.id === shipMethod) || null
  const shipping = selectedOption?.amount ?? null
  const total = subtotal + (shipping ?? 0)

  function searchShipping(e) {
    e.preventDefault()
    const result = shippingQuotes(address, subtotal)
    if (!result) {
      setQuote(null)
      setShipMethod(null)
      setAddressError(
        "Couldn't find a rate for that address - include a US ZIP code or state.",
      )
      return
    }
    setAddressError('')
    setQuote(result)
    // Default to the cheapest option.
    const cheapest = [...result.options].sort((a, b) => a.amount - b.amount)[0]
    setShipMethod(cheapest.id)
    // Use the searched address as the ship-to city if none entered yet.
    if (!city.trim()) setCity(address.trim())
  }

  function checkout(e) {
    e.preventDefault()
    if (!selectedOption) return
    const order = placeOrder({ city: city || address, email })
    setPlaced(order)
  }

  if (placed) {
    const shopCount = new Set(
      placed.items
        .map((i) => products.find((p) => p.id === i.productId)?.storeId)
        .filter(Boolean),
    ).size
    return (
      <div className="container section">
        <div
          className="panel"
          style={{ maxWidth: 560, margin: '0 auto', textAlign: 'center' }}
        >
          <div style={{ fontSize: '3.2rem' }}>🎉</div>
          <h2>Order confirmed!</h2>
          <p className="muted">
            Order <strong>{placed.id}</strong> is on its way to {placed.city}.
            You're supporting {shopCount} family-owned{' '}
            {shopCount === 1 ? 'business' : 'businesses'} today.
          </p>
          <div className="notice" style={{ textAlign: 'left' }}>
            This is a demo checkout - no payment was processed and no email was
            sent. The order now appears in the admin dashboard.
          </div>
          <Link to="/shop" className="btn btn-primary">
            Continue shopping
          </Link>
        </div>
      </div>
    )
  }

  if (!lines.length) {
    return (
      <div className="container section">
        <div className="empty">
          <div className="big">🛒</div>
          <h2>Your cart is empty</h2>
          <p>Discover authentic goods from family-owned cultural shops.</p>
          <Link to="/shop" className="btn btn-primary">
            Browse the marketplace
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="container section">
      <h1 style={{ fontSize: '2rem' }}>Your cart</h1>
      <div className="detail-grid" style={{ gridTemplateColumns: '1.6fr 1fr' }}>
        <div>
          {lines.map((l) => (
            <div key={l.productId} className="cart-line">
              <div className="cart-thumb">{l.product.emoji}</div>
              <div>
                <div style={{ fontWeight: 600 }}>{l.product.name}</div>
                <div className="muted" style={{ fontSize: '0.83rem' }}>
                  {l.store?.emoji} {l.store?.name} · ${l.unit.toFixed(2)} each
                </div>
                <button
                  className="back-link"
                  style={{ marginTop: 6, background: 'none', border: 'none', padding: 0 }}
                  onClick={() => removeFromCart(l.productId)}
                >
                  Remove
                </button>
              </div>
              <div className="qty">
                <button onClick={() => updateCartQty(l.productId, l.qty - 1)}>−</button>
                <span>{l.qty}</span>
                <button onClick={() => updateCartQty(l.productId, l.qty + 1)}>+</button>
              </div>
              <div style={{ fontWeight: 700, minWidth: 70 }} className="text-right">
                ${l.subtotal.toFixed(2)}
              </div>
            </div>
          ))}
        </div>

        <form className="summary-card" onSubmit={checkout}>
          <h3 style={{ marginTop: 0 }}>Order summary</h3>
          <div className="calc-row">
            <span>Subtotal</span>
            <span>${subtotal.toFixed(2)}</span>
          </div>
          <div className="calc-row">
            <span>Shipping</span>
            <span>
              {shipping == null ? (
                <span className="muted">Search address</span>
              ) : selectedOption?.free ? (
                <span className="pos">FREE</span>
              ) : (
                `$${shipping.toFixed(2)}`
              )}
            </span>
          </div>
          <div className="calc-row total">
            <span>Total</span>
            <span>{shipping == null ? '-' : `$${total.toFixed(2)}`}</span>
          </div>

          <div className="field" style={{ marginTop: 16 }}>
            <label>Email</label>
            <input
              className="input"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
            />
          </div>

          <div className="field">
            <label>Shipping address</label>
            <div className="flex gap-8">
              <input
                className="input"
                value={address}
                onChange={(e) => {
                  setAddress(e.target.value)
                  setQuote(null)
                  setShipMethod(null)
                }}
                placeholder="Street, city, ST or ZIP"
              />
              <button
                type="button"
                className="btn btn-ghost"
                onClick={searchShipping}
                disabled={!address.trim()}
                style={{ whiteSpace: 'nowrap' }}
              >
                Get rates
              </button>
            </div>
            {addressError && (
              <p className="muted" style={{ color: 'var(--clay)', fontSize: '0.8rem', marginTop: 6 }}>
                {addressError}
              </p>
            )}
          </div>

          {quote && (
            <div className="field">
              <label>Shipping method</label>
              <div className="ship-options">
                {quote.options.map((opt) => (
                  <label
                    key={opt.id}
                    className={`ship-option${shipMethod === opt.id ? ' selected' : ''}`}
                  >
                    <input
                      type="radio"
                      name="ship-method"
                      checked={shipMethod === opt.id}
                      onChange={() => setShipMethod(opt.id)}
                    />
                    <span className="ship-option-body">
                      <span style={{ fontWeight: 600 }}>{opt.label}</span>
                      <span className="muted" style={{ fontSize: '0.8rem' }}>
                        {opt.eta}
                      </span>
                    </span>
                    <span style={{ fontWeight: 700 }}>
                      {opt.free ? <span className="pos">FREE</span> : `$${opt.amount.toFixed(2)}`}
                    </span>
                  </label>
                ))}
              </div>
              <p className="muted" style={{ fontSize: '0.78rem', marginTop: 8, marginBottom: 0 }}>
                Estimated from our NYC hub (zone {quote.zone}). Standard ships free on orders
                over ${FREE_SHIPPING_THRESHOLD}.
              </p>
            </div>
          )}

          <button
            className="btn btn-primary btn-block"
            type="submit"
            disabled={!selectedOption}
          >
            {selectedOption
              ? `Place demo order · $${total.toFixed(2)}`
              : 'Search address to continue'}
          </button>
          <p className="muted" style={{ fontSize: '0.78rem', textAlign: 'center', marginBottom: 0 }}>
            Demo checkout - CultureConnect keeps a 20% commission (~$
            {commission(subtotal).toFixed(2)}) to fund marketing &amp; operations.
          </p>
        </form>
      </div>
    </div>
  )
}
