import { useEffect, useRef, useState } from 'react'
import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import AuthModal from './AuthModal'
import SearchBar from './SearchBar'

export default function Navbar() {
  const { user, cart, signOut } = useApp()
  const [showAuth, setShowAuth] = useState(false) // buyer sign-in modal
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef(null)
  const navigate = useNavigate()

  const cartCount = cart.reduce((n, i) => n + i.qty, 0)

  useEffect(() => {
    function onClick(e) {
      if (menuRef.current && !menuRef.current.contains(e.target)) setMenuOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function handleSignOut() {
    signOut()
    setMenuOpen(false)
    navigate('/')
  }

  return (
    <>
      <header className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="brand">
            <img src="/logo.svg" alt="" className="brand-logo" />
            <span className="brand-name">
              CultureConnect
              <small>Authentic · Local · Everywhere</small>
            </span>
          </Link>

          <nav className="nav-links">
            <div className="nav-dropdown">
              <NavLink to="/shop" className="nav-dropdown-trigger">
                Shop <span className="caret">▾</span>
              </NavLink>
              <div className="nav-dropdown-menu">
                <NavLink to="/shop" end>
                  All products
                </NavLink>
                <NavLink to="/businesses">Browse businesses</NavLink>
              </div>
            </div>
            <NavLink to="/services">For Businesses</NavLink>
            <NavLink to="/request-store">Request a City</NavLink>
            <NavLink to="/about">Our Mission</NavLink>
          </nav>

          <SearchBar />

          <div className="nav-right">
            <Link to="/cart" className="cart-btn">
              Cart
              {cartCount > 0 && <span className="cart-badge">{cartCount}</span>}
            </Link>

            {user ? (
              <div className="dropdown" ref={menuRef}>
                <button
                  className="user-chip"
                  onClick={() => setMenuOpen((o) => !o)}
                >
                  <span className={`avatar ${user.role === 'admin' ? 'admin' : ''}`}>
                    {(user.name || user.email || '?').charAt(0).toUpperCase()}
                  </span>
                  {user.role === 'admin' ? 'Admin' : 'Account'} ▾
                </button>
                {menuOpen && (
                  <div className="dropdown-menu">
                    <div className="menu-label">
                      {user.name || 'Signed in'}
                    </div>
                    <div style={{ padding: '0 12px 6px', fontSize: '0.8rem' }} className="muted">
                      {user.email}
                    </div>
                    <hr />
                    {user.role === 'admin' && (
                      <Link to="/admin" onClick={() => setMenuOpen(false)}>
                        Admin Dashboard
                      </Link>
                    )}
                    {user.role === 'owner' && (
                      <Link to="/portal" onClick={() => setMenuOpen(false)}>
                        Owner Portal
                      </Link>
                    )}
                    <Link to="/shop" onClick={() => setMenuOpen(false)}>
                      Continue shopping
                    </Link>
                    <Link to="/cart" onClick={() => setMenuOpen(false)}>
                      Your cart
                    </Link>
                    <hr />
                    <button onClick={handleSignOut}>Sign out</button>
                  </div>
                )}
              </div>
            ) : (
              <button
                className="btn btn-dark btn-sm"
                onClick={() => setShowAuth(true)}
              >
                Sign in
              </button>
            )}
          </div>
        </div>
      </header>

      {showAuth && <AuthModal onClose={() => setShowAuth(false)} />}
    </>
  )
}
