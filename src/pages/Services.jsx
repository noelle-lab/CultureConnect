import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { COMMISSION_RATE, MARKUP } from '../data/mockData'
import { useApp } from '../context/AppContext'

const BLANK_APPLICATION = {
  shop: '',
  city: '',
  email: '',
  heritage: '',
  service: 'listing',
  message: '',
}

export default function Services() {
  const [sent, setSent] = useState(false)
  const [application, setApplication] = useState(BLANK_APPLICATION)
  const { user, signInOwner, addPartnerRequest } = useApp()
  const navigate = useNavigate()

  function submitApplication(e) {
    e.preventDefault()
    if (!application.shop.trim() || !application.email.trim()) return
    addPartnerRequest({
      shop: application.shop.trim(),
      city: application.city.trim(),
      email: application.email.trim(),
      heritage: application.heritage.trim(),
      service: application.service,
      message: application.message.trim(),
    })
    setSent(true)
  }

  // Owner-portal gate: the visitor has to type the email their shop is
  // registered under. signInOwner hashes it and only lets matching, registered
  // owners through, so the page never reveals which emails work.
  const [ownerEmail, setOwnerEmail] = useState('')
  const [ownerError, setOwnerError] = useState('')
  const [checking, setChecking] = useState(false)

  async function handleOwnerSignIn(e) {
    e.preventDefault()
    setOwnerError('')
    setChecking(true)
    try {
      const res = await signInOwner(ownerEmail)
      if (res.ok) {
        navigate('/portal')
      } else {
        setOwnerError(
          "We couldn't find a partner shop for that email. Double-check the address your shop is registered under.",
        )
      }
    } finally {
      setChecking(false)
    }
  }

  return (
    <>
      <section className="hero" style={{ paddingBottom: 0 }}>
        <div className="container" style={{ padding: '56px 0 40px' }}>
          <span className="eyebrow">For shop owners</span>
          <h1 style={{ fontSize: '2.6rem', maxWidth: '16em' }}>
            You run the shop. We run the internet.
          </h1>
          <p className="lead">
            CultureConnect gives family-owned, ethnic-minority-run businesses two
            ways to grow beyond their neighborhood - with none of the technical
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
              <div className="eyebrow-sm">Service 1</div>
              <h2 style={{ fontSize: '1.5rem' }}>List on CultureConnect</h2>
              <p className="muted">
                We build and manage your storefront on the CultureConnect
                marketplace - the full white-glove treatment.
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
                  {Math.round(MARKUP * 100)}% of your shop price.
                </small>
              </div>
            </div>

            {/* Service B */}
            <div className="service-card b anchor-target" id="crosslisting">
              <div className="eyebrow-sm">Service 2</div>
              <h2 style={{ fontSize: '1.5rem' }}>Cross-listing service</h2>
              <p className="muted">
                Already want to be on Etsy and eBay? We list, sync, and manage
                your inventory across platforms - efficiently and in one place.
              </p>
              <ul>
                <li>One catalog, published to Etsy &amp; eBay automatically</li>
                <li>Inventory &amp; price sync - no double-selling</li>
                <li>Optimized titles, tags &amp; SEO for each platform</li>
                <li>Consolidated orders in a single dashboard</li>
                <li>Add-on to marketplace listing, or standalone</li>
              </ul>
              <div className="service-price">
                $10/mo, no cost per sale
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
            <h2 style={{ fontSize: '1.6rem' }}>How the {Math.round(COMMISSION_RATE * 100)}% commission works</h2>
            <p className="muted" style={{ maxWidth: '52em' }}>
              We encourage shops to list online at {Math.round(MARKUP * 100)}% of
              their shop price. That covers our{' '}
              {Math.round(COMMISSION_RATE * 100)}% commission - which pays for all
              marketing, listings, and platform work - while you still net close
              to your normal margin. Here's a $100 shop item:
            </p>
            <div className="grid-2" style={{ maxWidth: 620 }}>
              <div>
                <div className="calc-row">
                  <span>Shop price</span>
                  <span>$100.00</span>
                </div>
                <div className="calc-row">
                  <span>Online price ({Math.round(MARKUP * 100)}%)</span>
                  <span>$108.00</span>
                </div>
                <div className="calc-row">
                  <span>CultureConnect ({Math.round(COMMISSION_RATE * 100)}%)</span>
                  <span className="neg">− $8.64</span>
                </div>
                <div className="calc-row total">
                  <span>You keep</span>
                  <span className="pos">$99.36</span>
                </div>
              </div>
              <div className="panel" style={{ background: 'var(--sand)' }}>
                <strong>Why it works for you</strong>
                <p className="muted" style={{ fontSize: '0.9rem' }}>
                  You net ~99% of your usual shop price while reaching
                  customers nationwide - with zero time spent on photos,
                  marketing, SEO, or shipping logistics. We only make money when
                  you make a sale.
                </p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* EXISTING OWNER SIGN-IN */}
      <section className="section anchor-target" id="owner-signin" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="panel">
            <div className="eyebrow-sm">Already a partner shop?</div>
            <h2 style={{ fontSize: '1.6rem', marginBottom: 4 }}>
              Sign in to your owner portal
            </h2>
            <p className="muted" style={{ maxWidth: '52em', marginTop: 0 }}>
              Manage your CultureConnect listings, pricing and stock. Shops on the
              cross-listing plan also manage their Etsy and eBay listings — with
              every platform's fees worked out for you.
            </p>

            {user?.role === 'owner' ? (
              <div className="notice" style={{ maxWidth: 520 }}>
                You're signed in as <strong>{user.name}</strong> ({user.shop}).{' '}
                <Link to="/portal" style={{ color: 'var(--clay)', fontWeight: 600 }}>
                  Go to your dashboard →
                </Link>
              </div>
            ) : (
              <form
                onSubmit={handleOwnerSignIn}
                style={{ maxWidth: 420, marginTop: 16 }}
              >
                <div className="field">
                  <label htmlFor="owner-email">Registered shop email</label>
                  <input
                    id="owner-email"
                    className="input"
                    type="email"
                    autoComplete="email"
                    placeholder="you@yourshop.com"
                    value={ownerEmail}
                    onChange={(e) => {
                      setOwnerEmail(e.target.value)
                      if (ownerError) setOwnerError('')
                    }}
                    required
                  />
                </div>
                {ownerError && (
                  <div
                    className="notice"
                    style={{
                      background: '#fdeceb',
                      borderColor: '#f3c9c5',
                      color: '#8f271e',
                      marginTop: 4,
                    }}
                  >
                    {ownerError}
                  </div>
                )}
                <button
                  className="btn btn-primary btn-block"
                  type="submit"
                  disabled={checking}
                  style={{ marginTop: 12 }}
                >
                  {checking ? 'Checking…' : 'Access owner portal'}
                </button>
                <p className="muted" style={{ fontSize: '0.85rem', marginTop: 12 }}>
                  Access is limited to registered partner shops. Enter the email
                  your shop is registered under.{' '}
                  <Link to="/contact" style={{ color: 'var(--clay)', fontWeight: 600 }}>
                    Not a partner yet?
                  </Link>
                </p>
              </form>
            )}
          </div>
        </div>
      </section>

      {/* SIGNUP FORM */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="band" style={{ background: 'linear-gradient(150deg, var(--clay), var(--clay-dark))' }}>
            {sent ? (
              <div style={{ textAlign: 'center', padding: '10px 0' }}>
                <h2 style={{ color: '#fff' }}>Thanks - we'll be in touch!</h2>
                <p style={{ color: '#f7e6d9' }}>
                  Your request is now with our onboarding team, who reviews every
                  shop personally. We'll reach out at{' '}
                  <strong>{application.email}</strong> once we've taken a look.
                </p>
              </div>
            ) : (
              <>
                <div className="eyebrow-sm" style={{ color: 'var(--saffron)' }}>
                  Ready to grow?
                </div>
                <h2 style={{ color: '#fff' }}>Apply to join CultureConnect</h2>
                <form onSubmit={submitApplication} style={{ maxWidth: 620, marginTop: 16 }}>
                  <div className="grid-2">
                    <div className="field">
                      <label style={{ color: '#fff' }}>Shop name</label>
                      <input
                        className="input"
                        required
                        placeholder="Your shop"
                        value={application.shop}
                        onChange={(e) =>
                          setApplication({ ...application, shop: e.target.value })
                        }
                      />
                    </div>
                    <div className="field">
                      <label style={{ color: '#fff' }}>City / neighborhood</label>
                      <input
                        className="input"
                        required
                        placeholder="e.g. Queens, NY"
                        value={application.city}
                        onChange={(e) =>
                          setApplication({ ...application, city: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="grid-2">
                    <div className="field">
                      <label style={{ color: '#fff' }}>Email</label>
                      <input
                        className="input"
                        type="email"
                        required
                        placeholder="you@shop.com"
                        value={application.email}
                        onChange={(e) =>
                          setApplication({ ...application, email: e.target.value })
                        }
                      />
                    </div>
                    <div className="field">
                      <label style={{ color: '#fff' }}>Heritage / culture</label>
                      <input
                        className="input"
                        placeholder="e.g. Oaxacan"
                        value={application.heritage}
                        onChange={(e) =>
                          setApplication({ ...application, heritage: e.target.value })
                        }
                      />
                    </div>
                  </div>
                  <div className="field">
                    <label style={{ color: '#fff' }}>Which service?</label>
                    <select
                      className="select"
                      value={application.service}
                      onChange={(e) =>
                        setApplication({ ...application, service: e.target.value })
                      }
                    >
                      <option value="listing">List on CultureConnect</option>
                      <option value="crosslisting">Cross-listing (Etsy/eBay)</option>
                      <option value="both">Both</option>
                    </select>
                  </div>
                  <div className="field">
                    <label style={{ color: '#fff' }}>
                      Tell us about your shop <span style={{ opacity: 0.7 }}>(optional)</span>
                    </label>
                    <textarea
                      className="textarea"
                      placeholder="What you sell, your story, and why you'd be a great fit…"
                      value={application.message}
                      onChange={(e) =>
                        setApplication({ ...application, message: e.target.value })
                      }
                    />
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
