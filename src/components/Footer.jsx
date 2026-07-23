import { Link } from 'react-router-dom'

export default function Footer() {
  return (
    <footer className="footer">
      <div className="container">
        <div className="footer-grid">
          <div>
            <Link to="/" className="brand" style={{ marginBottom: 12 }}>
              <img src="/logo.svg" alt="" className="brand-logo" />
              <span>
                CultureConnect
                <small>Authentic · Local · Everywhere</small>
              </span>
            </Link>
            <p style={{ maxWidth: '28em', fontSize: '0.9rem' }}>
              Bringing family-owned, ethnic-minority-run businesses from big
              cities to every city in the U.S. — making authentic cultural goods
              easier to discover and buy, wherever you live.
            </p>
          </div>

          <div>
            <h5>Shop</h5>
            <Link to="/shop">All products</Link>
            <Link to="/shop?cat=Food+%26+Pantry">Food &amp; pantry</Link>
            <Link to="/shop?cat=Home+%26+Textiles">Home &amp; textiles</Link>
            <Link to="/request-store">Request a city</Link>
          </div>

          <div>
            <h5>For Businesses</h5>
            <Link to="/services">List with us</Link>
            <Link to="/services#crosslisting">Cross-listing service</Link>
            <Link to="/services#pricing">Pricing &amp; commission</Link>
            <Link to="/about">Our mission</Link>
          </div>

          <div>
            <h5>Company</h5>
            <Link to="/about">About</Link>
            <Link to="/how-it-works">How it works</Link>
            <Link to="/contact">Contact</Link>
            <Link to="/admin">Team login</Link>
          </div>
        </div>

        <div className="footer-bottom">
          <span>© 2026 CultureConnect · A demo marketplace concept.</span>
          <span>Starting in New York City · Expanding to SF &amp; DC next.</span>
        </div>
      </div>
    </footer>
  )
}
