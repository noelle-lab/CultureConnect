import { useMemo, useState } from 'react'
import { useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/ProductCard'

export default function Shop() {
  const { products, stores } = useApp()
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
    if (sort === 'name') list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    return list
  }, [products, stores, storeFilter, activeCats, activeHeritages, query, sort])

  const featuredStore = storeFilter && stores.find((s) => s.id === storeFilter)

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
        </select>
      </div>

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
              <div className="big">🔍</div>
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
