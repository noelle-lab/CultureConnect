import { useState } from 'react'
import { Link, useParams, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { onlinePrice, MARKUP } from '../data/mockData'
import ProductCard from '../components/ProductCard'

export default function ProductDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { products, stores, addToCart } = useApp()
  const [qty, setQty] = useState(1)
  const [added, setAdded] = useState(false)

  const product = products.find((p) => p.id === id)
  if (!product) {
    return (
      <div className="container empty">
        <div className="big">🫙</div>
        <p>That product could not be found.</p>
        <Link to="/shop" className="btn btn-primary btn-sm">
          Back to shop
        </Link>
      </div>
    )
  }

  const store = stores.find((s) => s.id === product.storeId)
  const price = onlinePrice(product.inPersonPrice)
  const related = products
    .filter((p) => p.storeId === product.storeId && p.id !== product.id)
    .slice(0, 4)

  function handleAdd() {
    addToCart(product.id, qty)
    setAdded(true)
    setTimeout(() => setAdded(false), 1800)
  }

  return (
    <div className="container section">
      <Link to="/shop" className="back-link">
        ← Back to marketplace
      </Link>

      <div className="detail-grid">
        <div className="detail-media">{product.emoji}</div>

        <div>
          <div className="chip-row" style={{ marginBottom: 12 }}>
            <span className="badge badge-culture">{product.category}</span>
            {product.crosslisted.includes('etsy') && (
              <span className="badge badge-etsy">Also on Etsy</span>
            )}
            {product.crosslisted.includes('ebay') && (
              <span className="badge badge-ebay">Also on eBay</span>
            )}
          </div>

          <h1 style={{ fontSize: '2rem' }}>{product.name}</h1>

          <Link
            to={`/shop?store=${store.id}`}
            className="muted"
            style={{ fontWeight: 600, display: 'inline-block', marginBottom: 16 }}
          >
            {store.emoji} {store.name} · {store.heritage} · {store.neighborhood}
          </Link>

          <p style={{ fontSize: '1.02rem', color: 'var(--charcoal)' }}>
            {product.description}
          </p>

          <div style={{ margin: '20px 0' }}>
            <span className="price-lg">${price.toFixed(2)}</span>
            <span className="strike">${product.inPersonPrice.toFixed(2)} in-store</span>
          </div>

          <div className="flex center gap-12" style={{ marginBottom: 18 }}>
            <div className="qty">
              <button onClick={() => setQty((q) => Math.max(1, q - 1))}>−</button>
              <span>{qty}</span>
              <button onClick={() => setQty((q) => Math.min(product.stock, q + 1))}>
                +
              </button>
            </div>
            <span className="muted" style={{ fontSize: '0.85rem' }}>
              {product.stock} in stock
            </span>
          </div>

          <div className="flex gap-12 wrap">
            <button className="btn btn-primary" onClick={handleAdd}>
              {added ? '✓ Added to cart' : '🛒 Add to cart'}
            </button>
            <button
              className="btn btn-dark"
              onClick={() => {
                addToCart(product.id, qty)
                navigate('/cart')
              }}
            >
              Buy now
            </button>
          </div>

          <div className="panel" style={{ marginTop: 24, background: 'var(--sand)' }}>
            <strong>Why buy through CultureConnect?</strong>
            <p className="muted" style={{ margin: '6px 0 0', fontSize: '0.9rem' }}>
              Every purchase supports a family-owned business directly.
              CultureConnect handles marketing, listings, and fulfillment so
              shops can focus on their craft. Online prices reflect a modest{' '}
              {Math.round((MARKUP - 1) * 100)}% markup over in-store pricing to
              cover that service.
            </p>
          </div>
        </div>
      </div>

      {related.length > 0 && (
        <section style={{ marginTop: 56 }}>
          <div className="section-head">
            <div>
              <div className="eyebrow-sm">More from this shop</div>
              <h2 style={{ fontSize: '1.5rem' }}>{store.name}</h2>
            </div>
          </div>
          <div className="product-grid">
            {related.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
