import { useMemo } from 'react'
import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

// "Browse businesses" — the shop-by-business directory. Every family shop on
// CultureConnect gets a card here with its owner, story snippet, and a link
// through to its full business page.
export default function Businesses() {
  const { publishedStores: stores, publishedProducts: products } = useApp()

  const countByStore = useMemo(() => {
    const m = {}
    for (const p of products) m[p.storeId] = (m[p.storeId] || 0) + 1
    return m
  }, [products])

  // Sellers first (anything with live listings), then anyone still onboarding.
  const ordered = useMemo(() => {
    const rank = (s) => (countByStore[s.id] > 0 ? 0 : 1)
    return [...stores].sort((a, b) => rank(a) - rank(b))
  }, [stores, countByStore])

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

      <div className="business-grid">
        {ordered.map((s) => {
          const count = countByStore[s.id] || 0
          return (
            <div key={s.id} className="business-card">
              <Link to={`/store/${s.id}`} className="business-media">
                {s.image ? (
                  <img src={s.image} alt={`${s.name} storefront`} loading="lazy" />
                ) : (
                  <span className="thumb-emoji">{s.emoji}</span>
                )}
              </Link>

              <div className="business-body">
                <div className="business-owner">
                  <span className="owner-avatar">
                    {s.ownerImage ? (
                      <img src={s.ownerImage} alt={s.ownerName || s.owner} loading="lazy" />
                    ) : (
                      <span>{s.emoji}</span>
                    )}
                  </span>
                  <span className="owner-meta">
                    <span className="owner-label">Owner</span>
                    <span className="owner-name">{s.ownerName || s.owner}</span>
                  </span>
                </div>

                <Link to={`/store/${s.id}`} className="business-name">
                  {s.emoji} {s.name}
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
    </div>
  )
}
