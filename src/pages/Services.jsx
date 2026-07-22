import { useState } from 'react'
import { Link } from 'react-router-dom'
import { COMMISSION_RATE, MARKUP } from '../data/mockData'

export default function Services() {
  const [sent, setSent] = useState(false)
  const [service, setService] = useState('listing')

  return (
    <>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <div className="container" style={{ padding: '56px 0 40px' }}>
          <span className="eyebrow">🤝 For shop owners</span>
          <h1 style={{ fontSize: '2.6rem', maxWidth: '16em' }}>
            You run the shop. We run the internet.
          </h1>
          <p className="lead">
            CultureConnect gives family-owned, ethnic-minority-run businesses two
            ways to grow beyond their neighborhood — with none of the technical
            overhead. Pick one, or use both together.
          </p>
        </div>
      </section>

      {/* TWO SERVICES */}
      <section className="section" style={{ paddingTop: 34 }}>
        <div className="container">
          <div className="service-grid">
            {/* Service A */}
            <div className="service-card a">
              <div className="icon">🏪</div>
              <div className="eyebrow-sm">Service 1</div>
              <h2 style={{ fontSize: '1.5rem' }}>List on CultureConnect</h2>
              <p className="muted">
                We build and manage your storefront on the CultureConnect
                marketplace — the full white-glove treatment.
              </p>
              <ul>
                <li>Professional product listings &amp; photography</li>
                <li>Marketing to buyers across all 50 states</li>
                <li>We handle payments, shipping labels &amp; support</li>
                <li>Your story &amp; heritage featured authentically</li>
                <li>Live sales dashboard &amp; monthly payouts</li>
              </ul>
              <div className="service-price">
                {Math.round(COMMISSION_RATE * 100)}% per sale
                <br />
                <small>
                  No upfront cost. We only earn when you do. List at{' '}
                  {Math.round(MARKUP * 100)}% of your in-store price.
                </small>
              </div>
            </div>

            {/* Service B */}
            <div className="service-card b anchor-target" id="crosslisting">
              <div className="icon">🔁</div>
              <div className="eyebrow-sm">Service 2</div>
              <h2 style={{ fontSize: '1.5rem' }}>Cross-listing service</h2>
              <p className="muted">
                Already want to be on Etsy and eBay? We list, sync, and manage
                your inventory across platforms — efficiently and in one place.
              </p>
              <ul>
                <li>One catalog, published to Etsy &amp; eBay automatically</li>
                <li>Inventory &amp; price sync — no double-selling</li>
                <li>Optimized titles, tags &amp; SEO for each platform</li>
                <li>Consolidated orders in a single dashboard</li>
                <li>Add-on to marketplace listing, or standalone</li>
              </ul>
              <div className="service-price">
                $29/mo + {Math.round(COMMISSION_RATE * 0.5 * 100)}% per sale
                <br />
                <small>Flat fee covers unlimited cross-listed products.</small>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* COMMISSION EXPLAINER */}
      <section className="section anchor-target" id="pricing" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="panel">
            <div className="eyebrow-sm">Simple, transparent pricing</div>
            <h2 style={{ fontSize: '1.6rem' }}>How the 20% commission works</h2>
            <p className="muted" style={{ maxWidth: '52em' }}>
              We encourage shops to list online at {Math.round(MARKUP * 100)}% of
              their in-person price. That covers our{' '}
              {Math.round(COMMISSION_RATE * 100)}% commission — which pays for all
              marketing, listings, and platform work — while you still net close
              to your normal in-store margin. Here's a $100 in-store item:
            </p>
            <div className="grid-2" style={{ maxWidth: 620 }}>
              <div>
                <div className="calc-row">
                  <span>In-store price</span>
                  <span>$100.00</span>
                </div>
                <div className="calc-row">
                  <span>Online price ({Math.round(MARKUP * 100)}%)</span>
                  <span>$120.00</span>
                </div>
                <div className="calc-row">
                  <span>CultureConnect (20%)</span>
                  <span className="neg">− $24.00</span>
                </div>
                <div className="calc-row total">
                  <span>You keep</span>
                  <span className="pos">$96.00</span>
                </div>
              </div>
              <div className="panel" style={{ background: 'var(--sand)' }}>
                <strong>Why it works for you</strong>
                <p className="muted" style={{ fontSize: '0.9rem' }}>
                  You net ~96% of your usual in-store price while reaching
                  customers nationwide — with zero time spent on photos,
                  marketing, SEO, or shipping logistics. We only make money when
                  you make a sale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* SIGNUP FORM */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="band" style={{ background: 'linear-gradient(150deg, var(--clay), var(--clay-dark))' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <div style={{ fontSize: '2.6rem' }}>📨</div>
                <h2 style={{ color: '#fff' }}>Thanks — we'll be in touch!</h2>
                <p style={{ color: '#f7e6d9' }}>
                  Our onboarding team reviews every shop personally. (Demo form —
                  nothing was actually submitted.)
                </p>
              </div>
            ) : (
              <>
                <div className="eyebrow-sm" style={{ color: 'var(--saffron)' }}>
                  Ready to grow?
                </div>
                <h2 style={{ color: '#fff' }}>Apply to join CultureConnect</h2>
                <form
                  onSubmit={(e) => {
                    e.preventDefault()
                    setSent(true)
                  }}
                  style={{ maxWidth: 620, marginTop: 16 }}
                >
                  <div className="grid-2">
                    <div className="field">
                      <label style={{ color: '#fff' }}>Shop name</label>
                      <input className="input" required placeholder="Your shop" />
                    </div>
                    <div className="field">
                      <label style={{ color: '#fff' }}>City / neighborhood</label>
                      <input className="input" required placeholder="e.g. Queens, NY" />
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="field">
                      <label style={{ color: '#fff' }}>Email</label>
                      <input className="input" type="email" required placeholder="you@shop.com" />
                    </div>
                    <div className="field">
                      <label style={{ color: '#fff' }}>Which service?</label>
                      <select
                        className="select"
                        value={service}
                        onChange={(e) => setService(e.target.value)}
                      >
                        <option value="listing">List on CultureConnect</option>
                        <option value="crosslisting">Cross-listing (Etsy/eBay)</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                  </div>
                  <button className="btn btn-dark" type="submit">
                    Submit application
                  </button>
                </form>
              </>
            )}
          </div>
          <p className="muted" style={{ textAlign: 'center', marginTop: 20 }}>
            Prefer to talk first?{' '}
            <Link to="/about" style={{ color: 'var(--clay)', fontWeight: 600 }}>
              Learn about our mission →
            </Link>
          </p>
        </div>
      </section>
    </>
  )
}
