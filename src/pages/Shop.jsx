import { useMemo, useState } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/ProductCard'

export default function Shop() {
  const { publishedProducts: products, publishedStores: stores } = useApp()
  const [params, setParams] = useSearchParams()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')

  const categories = useMemo(
    () => [...new Set(products.map((p) => p.category))],
    [products],
  )
  const heritages = useMemo(
    () => [...new Set(stores.map((s) => s.heritage))],
    [stores],
  )

  const storeFilter = params.get('store')
  const activeCats = params.getAll('cat')
  const activeHeritages = params.getAll('heritage')

  function toggleParam(key, value) {
    const next = new URLSearchParams(params)
    const current = next.getAll(key)
    next.delete(key)
    if (current.includes(value)) {
      current.filter((v) => v !== value).forEach((v) => next.append(key, v))
    } else {
      ;[...current, value].forEach((v) => next.append(key, v))
    }
    setParams(next)
  }

  function clearFilters() {
    setParams(new URLSearchParams())
    setQuery('')
  }

  const filtered = useMemo(() => {
    let list = products.filter((p) => {
      const store = stores.find((s) => s.id === p.storeId)
      if (storeFilter && p.storeId !== storeFilter) return false
      if (activeCats.length && !activeCats.includes(p.category)) return false
      if (activeHeritages.length && !activeHeritages.includes(store?.heritage))
        return false
      if (query) {
        const hay = `${p.name} ${p.description} ${store?.name} ${store?.heritage}`.toLowerCase()
        if (!hay.includes(query.toLowerCase())) return false
      }
      return true
    })
    if (sort === 'price-asc')
      list = [...list].sort((a, b) => a.inPersonPrice - b.inPersonPrice)
    if (sort === 'price-desc')
      list = [...list].sort((a, b) => b.inPersonPrice - a.inPersonPrice)
    if (sort === 'name')
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    if (sort === 'name-desc')
      list = [...list].sort((a, b) => b.name.localeCompare(a.name))
    if (sort === 'stock')
      list = [...list].sort((a, b) => b.stock - a.stock)
    return list
  }, [products, stores, storeFilter, activeCats, activeHeritages, query, sort])

  const featuredStore = storeFilter && stores.find((s) => s.id === storeFilter)

  // Stores that actually have listings, for the "shop by business" strip.
  const sellingStores = useMemo(() => {
    const live = new Set(products.map((p) => p.storeId))
    return stores.filter((s) => live.has(s.id))
  }, [stores, products])

  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <div className="eyebrow-sm">The marketplace</div>
          <h2>{featuredStore ? featuredStore.name : 'Shop all products'}</h2>
          <p>
            {featuredStore
              ? `${featuredStore.heritage} · ${featuredStore.neighborhood}`
              : 'Authentic goods from family-owned cultural businesses.'}
          </p>
          {featuredStore && (
            <Link
              to={`/store/${featuredStore.id}`}
              className="muted"
              style={{ fontWeight: 600 }}
            >
              Read {featuredStore.name}’s story &amp; visit info →
            </Link>
          )}
        </div>
        <select
          className="select"
          style={{ maxWidth: 200 }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="featured">Sort: Featured</option>
          <option value="price-asc">Price: Low to High</option>
          <option value="price-desc">Price: High to Low</option>
          <option value="name">Name: A–Z</option>
          <option value="name-desc">Name: Z–A</option>
          <option value="stock">Availability: Most in stock</option>
        </select>
      </div>

      {!storeFilter && (
        <div className="shop-by-business">
          <div className="sbb-head">
            <span className="eyebrow-sm">Shop by business</span>
            <Link to="/businesses" className="muted" style={{ fontWeight: 600 }}>
              Browse all businesses →
            </Link>
          </div>
          <div className="sbb-row">
            {sellingStores.map((s) => (
              <Link key={s.id} to={`/store/${s.id}`} className="sbb-card">
                <span className="sbb-avatar">
                  {s.ownerImage ? (
                    <img src={s.ownerImage} alt={s.ownerName || s.owner} loading="lazy" />
                  ) : (
                    <span className="thumb-fallback">{s.name?.charAt(0) || '?'}</span>
                  )}
                </span>
                <span className="sbb-name">{s.name}</span>
                <span className="sbb-sub muted">{s.heritage}</span>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="shop-layout">
        <aside className="filter-card">
          <input
            className="input"
            placeholder="Search products…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ marginBottom: 18 }}
          />

          <div className="filter-group">
            <h4>Category</h4>
            {categories.map((c) => (
              <label key={c} className="filter-opt">
                <input
                  type="checkbox"
                  checked={activeCats.includes(c)}
                  onChange={() => toggleParam('cat', c)}
                />
                {c}
              </label>
            ))}
          </div>

          <div className="filter-group">
            <h4>Heritage</h4>
            {heritages.map((h) => (
              <label key={h} className="filter-opt">
                <input
                  type="checkbox"
                  checked={activeHeritages.includes(h)}
                  onChange={() => toggleParam('heritage', h)}
                />
                {h}
              </label>
            ))}
          </div>

          {(activeCats.length > 0 ||
            activeHeritages.length > 0 ||
            !!storeFilter ||
            query.length > 0) && (
            <button className="btn btn-ghost btn-sm btn-block" onClick={clearFilters}>
              Clear filters
            </button>
          )}
        </aside>

        <div>
          <p className="muted" style={{ marginTop: 0 }}>
            {filtered.length} product{filtered.length === 1 ? '' : 's'}
          </p>
          {filtered.length ? (
            <div className="product-grid">
              {filtered.map((p) => (
                <ProductCard key={p.id} product={p} />
              ))}
            </div>
          ) : (
            <div className="empty">
              <p>No products match those filters yet.</p>
              <button className="btn btn-ghost btn-sm" onClick={clearFilters}>
                Clear filters
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
