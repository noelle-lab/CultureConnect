import { Link, useParams } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/ProductCard'
import PhotoCredit from '../components/PhotoCredit'

// The public "meet the maker" page for a single partner shop: its story, its
// brick-and-mortar location, a real storefront photo, and everything it sells.
export default function StoreDetail() {
  const { id } = useParams()
  const { stores, products } = useApp()

  const store = stores.find((s) => s.id === id)
  if (!store) {
    return (
      <div className="container empty">
        <div className="big">🏪</div>
        <p>That shop could not be found.</p>
        <Link to="/shop" className="btn btn-primary btn-sm">
          Back to marketplace
        </Link>
      </div>
    )
  }

  const shopProducts = products.filter((p) => p.storeId === store.id)
  const mapsUrl = store.address
    ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
        `${store.name}, ${store.address}`,
      )}`
    : null

  return (
    <div className="store-page">
      {/* HERO */}
      <section className="store-hero">
        <div className="store-hero-media">
          {store.image ? (
            <img src={store.image} alt={`${store.name} storefront`} />
          ) : (
            <span className="media-emoji">{store.emoji}</span>
          )}
          {store.imageCredit && <PhotoCredit credit={store.imageCredit} />}
        </div>

        <div className="store-hero-body">
          <Link to="/shop" className="back-link">
            ← Back to marketplace
          </Link>
          <div className="chip-row" style={{ margin: '10px 0 12px' }}>
            <span className="badge badge-culture">{store.heritage}</span>
            {store.status === 'active' && (
              <span className="badge badge-cc">Active partner</span>
            )}
            {store.status === 'onboarding' && (
              <span className="badge badge-etsy">Onboarding</span>
            )}
            {store.rating && (
              <span className="badge badge-cc">★ {store.rating}</span>
            )}
          </div>

          <h1>
            {store.emoji} {store.name}
          </h1>
          <p className="store-owner">
            Family-owned by {store.owner}
            {store.founded ? ` · Serving the neighborhood since ${store.founded}` : ''}
          </p>

          <p className="store-lead">{store.longStory || store.story}</p>

          {store.specialties?.length > 0 && (
            <div className="chip-row" style={{ marginTop: 4 }}>
              {store.specialties.map((s) => (
                <span key={s} className="badge badge-culture">
                  {s}
                </span>
              ))}
            </div>
          )}

          <div className="hero-cta" style={{ marginTop: 22 }}>
            <a href="#shelf" className="btn btn-primary">
              🛍️ Shop this store
            </a>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-ghost"
              >
                📍 Get directions
              </a>
            )}
          </div>
        </div>
      </section>

      {/* VISIT / BRICK-AND-MORTAR */}
      <section className="container">
        <div className="store-info-grid">
          <div className="info-card">
            <div className="info-icon">📍</div>
            <h4>Brick &amp; mortar</h4>
            <p>{store.address || `${store.neighborhood}, ${store.city}`}</p>
            {mapsUrl && (
              <a
                href={mapsUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="muted"
                style={{ fontWeight: 600 }}
              >
                Open in Maps →
              </a>
            )}
          </div>
          <div className="info-card">
            <div className="info-icon">🕒</div>
            <h4>Hours</h4>
            <p>{store.hours || 'Call ahead for hours'}</p>
          </div>
          <div className="info-card">
            <div className="info-icon">🌍</div>
            <h4>Heritage</h4>
            <p>
              {store.heritage}
              <br />
              {store.neighborhood}
            </p>
          </div>
          <div className="info-card">
            <div className="info-icon">🤝</div>
            <h4>On CultureConnect</h4>
            <p>
              {store.services?.includes('listing') && 'Marketplace listing'}
              {store.services?.includes('listing') &&
                store.services?.includes('crosslisting') &&
                ' · '}
              {store.services?.includes('crosslisting') && 'Etsy & eBay sync'}
              {(!store.services || store.services.length === 0) &&
                'In early conversations'}
            </p>
          </div>
        </div>
      </section>

      {/* MEET THE OWNER */}
      {(store.ownerImage || store.bio) && (
        <section className="container section owner-section">
          <div className="owner-band">
            <div className="owner-portrait">
              {store.ownerImage ? (
                <img
                  src={store.ownerImage}
                  alt={`${store.ownerName || store.owner}, ${store.name}`}
                />
              ) : (
                <span className="media-emoji">{store.emoji}</span>
              )}
              {store.ownerImageCredit && (
                <PhotoCredit credit={store.ownerImageCredit} />
              )}
            </div>
            <div className="owner-copy">
              <div className="eyebrow-sm">Meet the owner</div>
              <h2>{store.ownerName || store.owner}</h2>
              <p className="owner-role">
                {store.owner}
                {store.founded ? ` · Since ${store.founded}` : ''} ·{' '}
                {store.neighborhood}
              </p>
              {(store.bio || [store.longStory || store.story]).map((para, i) => (
                <p key={i} className="owner-para">
                  {para}
                </p>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* PRODUCTS */}
      <section id="shelf" className="container section">
        <div className="section-head">
          <div>
            <div className="eyebrow-sm">On the shelf</div>
            <h2>
              {shopProducts.length > 0
                ? `Shop ${store.name}`
                : 'Coming soon to the marketplace'}
            </h2>
            <p>
              {shopProducts.length > 0
                ? 'Every purchase supports this family business directly.'
                : `${store.name} isn’t selling online yet — check back soon.`}
            </p>
          </div>
        </div>

        {shopProducts.length > 0 ? (
          <div className="product-grid">
            {shopProducts.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        ) : (
          <div className="empty">
            <div className="big">{store.emoji}</div>
            <p>
              This shop is still being onboarded. Want it in your city sooner?
            </p>
            <Link to="/request-store" className="btn btn-primary btn-sm">
              📍 Request your city
            </Link>
          </div>
        )}
      </section>
    </div>
  )
}
