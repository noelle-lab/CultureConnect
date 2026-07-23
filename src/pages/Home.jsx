import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import ProductCard from '../components/ProductCard'

export default function Home() {
  const { products, stores } = useApp()
  const featured = products.slice(0, 8)
  const activeStores = stores.filter((s) => s.status === 'active')

  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container hero-inner">
          <div>
            <span className="eyebrow">🌍 Now serving New York City · SF &amp; DC next</span>
            <h1>
              Authentic cultural goods, <span className="accent">delivered everywhere.</span>
            </h1>
            <p className="lead">
              CultureConnect brings family-owned, ethnic-minority-run shops from
              big cities to every city in the U.S. Discover teas, textiles,
              spices, and handmade goods - sourced directly from the families who
              know them best.
            </p>
            <div className="hero-cta">
              <Link to="/shop" className="btn btn-primary">
                🛍️ Shop the marketplace
              </Link>
              <Link to="/services" className="btn btn-ghost">
                Own a shop? List with us →
              </Link>
            </div>
            <div className="hero-stats">
              <div className="stat">
                <strong>25</strong>
                <span>partner shops</span>
              </div>
              <div className="stat">
                <strong>1000+</strong>
                <span>authentic products</span>
              </div>
            </div>
          </div>
          <div className="hero-collage">
            <div className="hero-tile tall">🧶</div>
            <div className="hero-tile">🍵</div>
            <div className="hero-tile">🏺</div>
            <div className="hero-tile">🌶️</div>
            <div className="hero-tile tall">🪷</div>
            <div className="hero-tile">☕</div>
            <div className="hero-tile">🥮</div>
          </div>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="section">
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow-sm">Fresh from our shops</div>
              <h2>Featured this week</h2>
            </div>
            <Link to="/shop" className="btn btn-ghost btn-sm">
              View all products →
            </Link>
          </div>
          <div className="product-grid">
            {featured.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>
      </section>

      {/* PARTNER SHOPS */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head">
            <div>
              <div className="eyebrow-sm">Meet the makers</div>
              <h2>Family-owned partner shops</h2>
              <p>Real neighborhood businesses, now reaching the whole country.</p>
            </div>
          </div>
          <div className="product-grid">
            {activeStores.map((s) => (
              <Link
                to={`/shop?store=${s.id}`}
                key={s.id}
                className="product-card"
                style={{ padding: 20 }}
              >
                <div style={{ fontSize: '2.4rem' }}>{s.emoji}</div>
                <div style={{ fontWeight: 700, marginTop: 8 }}>{s.name}</div>
                <div className="muted" style={{ fontSize: '0.85rem' }}>
                  {s.heritage} · {s.neighborhood}
                </div>
                <p style={{ fontSize: '0.86rem', marginTop: 8 }} className="muted">
                  {s.story}
                </p>
                <span className="badge badge-cc" style={{ marginTop: 'auto' }}>
                  ★ {s.rating} · {s.owner}
                </span>
              </Link>
            ))}
          </div>
        </div>
      </section>

      {/* HOW IT WORKS */}
      <section className="section" style={{ background: 'var(--white)', borderTop: '1px solid var(--line)', borderBottom: '1px solid var(--line)' }}>
        <div className="container">
          <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <div className="eyebrow-sm">How CultureConnect works</div>
              <h2>From a neighborhood shelf to your doorstep</h2>
            </div>
          </div>
          <div className="steps">
            <div className="step">
              <div className="num">1</div>
              <h4>We partner with shops</h4>
              <p>Our team discovers and onboards family-owned cultural businesses, starting in NYC.</p>
            </div>
            <div className="step">
              <div className="num">2</div>
              <h4>We handle the tech</h4>
              <p>Listings, photos, marketing, and cross-listing to Etsy &amp; eBay - all done for them.</p>
            </div>
            <div className="step">
              <div className="num">3</div>
              <h4>You shop authentically</h4>
              <p>Browse verified cultural goods and buy directly, no matter where you live.</p>
            </div>
            <div className="step">
              <div className="num">4</div>
              <h4>Shops grow nationwide</h4>
              <p>Small businesses reach customers far beyond their block - and their culture travels with them.</p>
            </div>
          </div>
        </div>
      </section>

      {/* MISSION BAND */}
      <section className="section">
        <div className="container">
          <div className="band">
            <div className="eyebrow-sm" style={{ color: 'var(--saffron)' }}>
              Our mission
            </div>
            <h2>Cultural accessibility shouldn't stop at the city limits.</h2>
            <p>
              Ethnic-minority-run businesses in large cities often lack the
              funding and technology to reach beyond their neighborhoods.
              Meanwhile, the selection in smaller cities is minimal, hard to
              vet for authenticity, and too often steeped in orientalism.
              CultureConnect exists to close that gap - helping cultural goods
              become genuinely accessible everywhere, sold by the families who
              know them best.
            </p>
            <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/about" className="btn btn-primary">
                Read our mission
              </Link>
              <Link to="/request-store" className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                📍 Request your city
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
