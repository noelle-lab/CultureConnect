import { Link } from 'react-router-dom'
import { COMMISSION_RATE, MARKUP } from '../data/mockData'

export default function HowItWorks() {
  return (
    <>
      {/* HERO */}
      <section className="hero">
        <div className="container" style={{ padding: '60px 0 44px' }}>
          <span className="eyebrow">🧭 How CultureConnect works</span>
          <h1 style={{ fontSize: '2.8rem', maxWidth: '15em' }}>
            From a neighborhood shelf to your doorstep.
          </h1>
          <p className="lead" style={{ maxWidth: '42em' }}>
            CultureConnect sits between family-owned cultural shops and shoppers
            all over the country. Our team does the discovery, tech, and
            marketing behind the scenes — so authentic goods can travel far
            beyond the block they started on.
          </p>
        </div>
      </section>

      {/* THE FOUR STEPS */}
      <section className="section" style={{ paddingTop: 30 }}>
        <div className="container">
          <div className="section-head" style={{ justifyContent: 'center', textAlign: 'center' }}>
            <div>
              <div className="eyebrow-sm">The lifecycle</div>
              <h2>Four steps, start to finish</h2>
            </div>
          </div>
          <div className="steps">
            <div className="step">
              <div className="num">1</div>
              <h4>We partner with shops</h4>
              <p>
                Our team researches and onboards family-owned, ethnic-minority-run
                businesses — neighborhood by neighborhood, starting in NYC.
              </p>
            </div>
            <div className="step">
              <div className="num">2</div>
              <h4>We handle the tech</h4>
              <p>
                Listings, photography, marketing, payments, and cross-listing to
                Etsy &amp; eBay — all done for the shop, at no upfront cost.
              </p>
            </div>
            <div className="step">
              <div className="num">3</div>
              <h4>You shop authentically</h4>
              <p>
                Browse verified cultural goods with real stories and heritage
                behind them, and buy directly — no matter where you live.
              </p>
            </div>
            <div className="step">
              <div className="num">4</div>
              <h4>Shops grow nationwide</h4>
              <p>
                Small businesses reach customers far beyond their block, get paid
                on a clear monthly ledger, and their culture travels with them.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* TWO AUDIENCES */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="detail-grid">
            <div className="panel">
              <div className="eyebrow-sm">If you're a shopper</div>
              <h2 style={{ fontSize: '1.5rem' }}>Authentic goods, delivered anywhere</h2>
              <ul className="check-list">
                <li>Discover teas, textiles, spices, and handmade goods from real families.</li>
                <li>Every product is tied to a verified partner shop and its heritage.</li>
                <li>Buy directly — we handle payment, shipping, and support.</li>
                <li>Don't see your city yet? Request it and vote demand up the list.</li>
              </ul>
              <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/shop" className="btn btn-primary">🛍️ Shop the marketplace</Link>
                <Link to="/request-store" className="btn btn-ghost">📍 Request your city</Link>
              </div>
            </div>
            <div className="panel" style={{ background: 'var(--saffron-soft)', borderColor: '#eeddb4' }}>
              <div className="eyebrow-sm">If you own a shop</div>
              <h2 style={{ fontSize: '1.5rem' }}>You run the shop. We run the internet.</h2>
              <ul className="check-list">
                <li>Full white-glove marketplace listing, or Etsy/eBay cross-listing — or both.</li>
                <li>We build the listings, shoot the photos, and run the marketing.</li>
                <li>
                  A {Math.round(COMMISSION_RATE * 100)}% commission covers all of it —
                  list at {Math.round(MARKUP * 100)}% of your in-store price and keep ~96%.
                </li>
                <li>Live sales dashboard and monthly payouts, no upfront cost.</li>
              </ul>
              <div style={{ marginTop: 18, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
                <Link to="/services" className="btn btn-primary">See both services →</Link>
                <Link to="/services#pricing" className="btn btn-ghost">How pricing works</Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* PRICING SNAPSHOT */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="panel">
            <div className="eyebrow-sm">The business model, in one line</div>
            <h2 style={{ fontSize: '1.5rem' }}>
              A {Math.round(COMMISSION_RATE * 100)}% commission funds the whole platform
            </h2>
            <p className="muted" style={{ maxWidth: '52em' }}>
              Shops list online at {Math.round(MARKUP * 100)}% of their in-person
              price. That markup covers our commission — which pays for marketing,
              listings, and logistics — while the shop still nets close to its
              usual in-store margin. Here's a $100 in-store item:
            </p>
            <div className="calc-row"><span>In-store price</span><span>$100.00</span></div>
            <div className="calc-row"><span>Online price ({Math.round(MARKUP * 100)}%)</span><span>$120.00</span></div>
            <div className="calc-row"><span>CultureConnect ({Math.round(COMMISSION_RATE * 100)}%)</span><span className="neg">− $24.00</span></div>
            <div className="calc-row total"><span>Shop keeps</span><span className="pos">$96.00</span></div>
          </div>
        </div>
      </section>

      {/* CTA BAND */}
      <section className="section" style={{ paddingTop: 0 }}>
        <div className="container">
          <div className="band">
            <div className="eyebrow-sm" style={{ color: 'var(--saffron)' }}>Ready when you are</div>
            <h2>Start shopping, or bring your shop aboard.</h2>
            <p>
              Whether you're looking for goods that are hard to find outside a big
              city, or you run a shop that deserves a bigger audience — this is
              where it starts.
            </p>
            <div style={{ marginTop: 20, display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link to="/shop" className="btn btn-primary">🛍️ Shop now</Link>
              <Link to="/services" className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                🤝 List your shop
              </Link>
              <Link to="/contact" className="btn btn-ghost" style={{ color: '#fff', borderColor: 'rgba(255,255,255,0.3)' }}>
                Talk to us
              </Link>
            </div>
          </div>
        </div>
      </section>
    </>
  )
}
