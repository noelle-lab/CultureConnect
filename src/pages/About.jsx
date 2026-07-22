import { Link } from 'react-router-dom'

export default function About() {
  return (
    <>
      <section className="hero">
        <div className="container" style={{ padding: '60px 0 48px' }}>
          <span className="eyebrow">Our mission</span>
          <h1 style={{ fontSize: '2.8rem', maxWidth: '16em' }}>
            Cultural accessibility, from every big city to every small one.
          </h1>
          <p className="lead" style={{ maxWidth: '40em' }}>
            CultureConnect exists to help authentic cultural goods — and the
            families who make them — reach all of the United States, not just the
            urban centers with the largest minority populations.
          </p>
        </div>
      </section>

      <section className="section">
        <div className="container">
          <div className="detail-grid">
            <div className="panel">
              <div className="eyebrow-sm">The problem</div>
              <h2 style={{ fontSize: '1.5rem' }}>
                Great shops, stuck within a few zip codes.
              </h2>
              <p className="muted">
                Ethnic-minority-run businesses in large cities often lack the
                funding — and sometimes the technological proficiency — to market
                themselves and expand their reach to a wider customer base. Their
                goods rarely make it beyond a handful of neighborhoods.
              </p>
              <p className="muted">
                Meanwhile, in non-major cities, the selection of cultural goods is
                minimal and often inauthentic. It's hard to navigate for quality
                and cultural accuracy, and too much of what's available leans on
                orientalism rather than the real thing.
              </p>
            </div>
            <div className="panel" style={{ background: 'var(--saffron-soft)', borderColor: '#eeddb4' }}>
              <div className="eyebrow-sm">The goal</div>
              <h2 style={{ fontSize: '1.5rem' }}>
                Authenticity, made accessible everywhere.
              </h2>
              <p style={{ color: 'var(--charcoal)' }}>
                By partnering with ethnic mom-and-pop shops, we give small
                businesses a platform to tap into ecommerce markets far beyond
                their local areas — culture-specific marketing, done for them.
              </p>
              <p style={{ color: 'var(--charcoal)' }}>
                We step away from the orientalism of mass-market platforms and
                make genuine cultural goods easier to discover and buy for people
                who aren't near a cultural hub. Our mission is to help small,
                family-owned cultural businesses become more accessible and reach
                every city in the U.S.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <div className="eyebrow-sm">What we believe</div>
              <h2>Principles that guide the platform</h2>
            </div>
          </div>
          <div className="product-grid">
            {[
              ['🫱🏽‍🫲🏾', 'Families first', 'Shops keep ~96% of their usual in-store margin. We only earn when they sell.'],
              ['✨', 'Authentic, not orientalist', 'Goods are presented by the families who make them, with real stories and heritage.'],
              ['🗺️', 'Everywhere, not just hubs', 'We prioritize expansion to cities that are underserved, guided by real buyer demand.'],
              ['🧑‍💻', 'We handle the tech', 'Listings, photos, marketing, cross-listing, and logistics — so shop owners don\'t have to.'],
            ].map(([icon, title, body]) => (
              <div className="panel" key={title}>
                <div style={{ fontSize: '2rem' }}>{icon}</div>
                <h3 style={{ fontSize: '1.1rem', margin: '8px 0 4px' }}>{title}</h3>
                <p className="muted" style={{ fontSize: '0.9rem', margin: 0 }}>
                  {body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="band">
            <h2>Starting in New York City. Coming to your city next.</h2>
            <p>
              We're onboarding family-owned shops across NYC's neighborhoods
              today, with San Francisco and Washington, D.C. next on the map. Tell
              us where you want us to go.
            </p>
            <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/request-store" className="btn btn-primary">
                📍 Request your city
              </Link>
              <Link to="/services" className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                Own a shop? Partner with us →
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
