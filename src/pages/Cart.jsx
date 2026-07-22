import { useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { onlinePrice, commission } from '../data/mockData'

export default function Cart() {
  const { cart, products, stores, updateCartQty, removeFromCart, placeOrder, user } =
    useApp()
  const [placed, setPlaced] = useState(null)
  const [city, setCity] = useState('')
  const [email, setEmail] = useState(user?.email || '')

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
  const shipping = subtotal > 0 ? 6.5 : 0
  const total = subtotal + shipping

  function checkout(e) {
    e.preventDefault()
    const order = placeOrder({ city, email })
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
            This is a demo checkout — no payment was processed and no email was
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
            <span>${shipping.toFixed(2)}</span>
          </div>
          <div className="calc-row total">
            <span>Total</span>
            <span>${total.toFixed(2)}</span>
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
            <label>Ship to city</label>
            <input
              className="input"
              required
              value={city}
              onChange={(e) => setCity(e.target.value)}
              placeholder="e.g. Denver, CO"
            />
          </div>

          <button className="btn btn-primary btn-block" type="submit">
            Place demo order · ${total.toFixed(2)}
          </button>
          <p className="muted" style={{ fontSize: '0.78rem', textAlign: 'center', marginBottom: 0 }}>
            Demo checkout — CultureConnect keeps a 20% commission (~$
            {commission(subtotal).toFixed(2)}) to fund marketing &amp; operations.
          </p>
        </form>
      </div>
    </div>
  )
}
