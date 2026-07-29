import { useMemo } from 'react'
import { Link, useSearchParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/ProductCard'
import { searchCatalog } from '../lib/search'

// Full search results across businesses, products, and heritages. The navbar
// search bar sends you here with ?q=…
export default function Search() {
  const { publishedStores: stores, publishedProducts: products } = useApp()
  const [params] = useSearchParams()
  const query = params.get('q') || ''

  const results = useMemo(
    () => searchCatalog(query, stores, products),
    [query, stores, products],
  )

  const total = results.stores.length + results.products.length
  const trimmed = query.trim()

  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <div className="eyebrow-sm">Search</div>
          <h2>
            {trimmed ? (
              <>
                Results for “{trimmed}”
              </>
            ) : (
              'Search CultureConnect'
            )}
          </h2>
          <p>
            {trimmed
              ? `${total} match${total === 1 ? '' : 'es'} across businesses and products.`
              : 'Search by business, product, heritage, or anything else.'}
          </p>
        </div>
      </div>

      {!trimmed && (
        <div className="empty">
          <div className="big">🔍</div>
          <p>Type something in the search bar above to get started.</p>
          <Link to="/shop" className="btn btn-ghost btn-sm">
            Browse all products →
          </Link>
        </div>
      )}

      {trimmed && total === 0 && (
        <div className="empty">
          <div className="big">🤷</div>
          <p>Nothing matched “{trimmed}”. Try a different word or heritage.</p>
          <Link to="/shop" className="btn btn-ghost btn-sm">
            Browse all products →
          </Link>
        </div>
      )}

      {/* Matching heritages — quick jump into the filtered shop view. */}
      {results.heritages.length > 0 && (
        <div style={{ marginBottom: 26 }}>
          <div className="chip-row">
            {results.heritages.map((h) => (
              <Link
                key={h}
                to={`/shop?heritage=${encodeURIComponent(h)}`}
                className="badge badge-culture"
              >
                🌍 {h}
              </Link>
            ))}
          </div>
        </div>
      )}

      {/* Matching businesses */}
      {results.stores.length > 0 && (
        <section style={{ marginBottom: 34 }}>
          <h3 style={{ marginTop: 0 }}>
            Businesses{' '}
            <span className="muted" style={{ fontWeight: 400 }}>
              ({results.stores.length})
            </span>
          </h3>
          <div className="search-store-grid">
            {results.stores.map((s) => (
              <Link key={s.id} to={`/store/${s.id}`} className="search-store-card">
                <span className="search-store-avatar">
                  {s.ownerImage ? (
                    <img src={s.ownerImage} alt={s.ownerName || s.owner} loading="lazy" />
                  ) : (
                    <span>{s.emoji}</span>
                  )}
                </span>
                <span className="search-store-meta">
                  <span className="search-store-name">
                    {s.emoji} {s.name}
                  </span>
                  <span className="muted">
                    {s.heritage} · {s.neighborhood}
                  </span>
                </span>
              </Link>
            ))}
          </div>
        </section>
      )}

      {/* Matching products */}
      {results.products.length > 0 && (
        <section>
          <h3 style={{ marginTop: 0 }}>
            Products{' '}
            <span className="muted" style={{ fontWeight: 400 }}>
              ({results.products.length})
            </span>
          </h3>
          <div className="product-grid">
            {results.products.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </section>
      )}
    </div>
  )
}
