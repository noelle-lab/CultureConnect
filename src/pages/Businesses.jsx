import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

// "Browse businesses" — the shop-by-business directory. Every family shop on
// CultureConnect gets a card here with its owner, story snippet, and a link
// through to its full business page.
export default function Businesses() {
  const { publishedStores: stores, publishedProducts: products } = useApp()
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('featured')

  const countByStore = useMemo(() => {
    const m = {}
    for (const p of products) m[p.storeId] = (m[p.storeId] || 0) + 1
    return m
  }, [products])

  const ordered = useMemo(() => {
    let list = stores.filter((s) => {
      if (!query) return true
      const hay = `${s.name} ${s.owner} ${s.heritage} ${s.neighborhood} ${s.story}`.toLowerCase()
      return hay.includes(query.toLowerCase())
    })
    const count = (s) => countByStore[s.id] || 0
    if (sort === 'featured') {
      // Sellers first (anything with live listings), then anyone still onboarding.
      list = [...list].sort((a, b) => (count(b) > 0 ? 1 : 0) - (count(a) > 0 ? 1 : 0))
    } else if (sort === 'name') {
      list = [...list].sort((a, b) => a.name.localeCompare(b.name))
    } else if (sort === 'name-desc') {
      list = [...list].sort((a, b) => b.name.localeCompare(a.name))
    } else if (sort === 'rating') {
      list = [...list].sort((a, b) => (b.rating || 0) - (a.rating || 0))
    } else if (sort === 'products') {
      list = [...list].sort((a, b) => count(b) - count(a))
    }
    return list
  }, [stores, countByStore, query, sort])

  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <div className="eyebrow-sm">Shop by business</div>
          <h2>Browse our family-owned businesses</h2>
          <p style={{ maxWidth: 640 }}>
            Every shop on CultureConnect is a real-life, family-run cultural
            business. Meet the owners, read their stories, and shop their
            shelves directly.
          </p>
        </div>
        <Link to="/shop" className="btn btn-ghost btn-sm">
          Shop all products →
        </Link>
      </div>

      <div
        className="flex between center wrap"
        style={{ gap: 12, margin: '0 0 24px' }}
      >
        <input
          className="input"
          placeholder="Search businesses…"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          style={{ maxWidth: 320 }}
        />
        <select
          className="select"
          style={{ maxWidth: 240 }}
          value={sort}
          onChange={(e) => setSort(e.target.value)}
        >
          <option value="featured">Sort: Featured</option>
          <option value="name">Name: A–Z</option>
          <option value="name-desc">Name: Z–A</option>
          <option value="rating">Rating: High to Low</option>
          <option value="products">Most products</option>
        </select>
      </div>

      <div className="business-grid">
        {ordered.map((s) => {
          const count = countByStore[s.id] || 0
          return (
            <div key={s.id} className="business-card">
              <Link to={`/store/${s.id}`} className="business-media">
                {s.image ? (
                  <img src={s.image} alt={`${s.name} storefront`} loading="lazy" />
                ) : (
                  <span className="thumb-fallback">{s.name?.charAt(0) || '?'}</span>
                )}
              </Link>

              <div className="business-body">
                <div className="business-owner">
                  <span className="owner-avatar">
                    {s.ownerImage ? (
                      <img src={s.ownerImage} alt={s.ownerName || s.owner} loading="lazy" />
                    ) : (
                      <span className="thumb-fallback">{(s.ownerName || s.owner || s.name)?.charAt(0) || '?'}</span>
                    )}
                  </span>
                  <span className="owner-meta">
                    <span className="owner-label">Owner</span>
                    <span className="owner-name">{s.ownerName || s.owner}</span>
                  </span>
                </div>

                <Link to={`/store/${s.id}`} className="business-name">
                  {s.name}
                </Link>
                <div className="muted business-sub">
                  {s.heritage} · {s.neighborhood}
                </div>

                <p className="business-story">{s.story}</p>

                {s.specialties?.length > 0 && (
                  <div className="chip-row" style={{ marginTop: 2 }}>
                    {s.specialties.slice(0, 3).map((sp) => (
                      <span key={sp} className="badge badge-culture">
                        {sp}
                      </span>
                    ))}
                  </div>
                )}

                <div className="business-foot">
                  <span className="muted">
                    {count > 0 ? (
                      <>
                        <strong>{count}</strong> product{count === 1 ? '' : 's'}
                        {s.rating ? ` · ★ ${s.rating}` : ''}
                      </>
                    ) : (
                      'Coming soon'
                    )}
                  </span>
                  <Link to={`/store/${s.id}`} className="btn btn-primary btn-sm">
                    Visit shop
                  </Link>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {ordered.length === 0 && (
        <div className="empty">
          <p>No businesses match your search.</p>
        </div>
      )}
    </div>
  )
}
