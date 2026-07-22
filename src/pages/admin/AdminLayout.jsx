import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const NAV = [
  { group: 'Overview', items: [['', '📊', 'Dashboard', true]] },
  {
    group: 'Sourcing',
    items: [
      ['discovery', '🔎', 'Shop Discovery'],
      ['stores', '🏪', 'Partner Shops'],
      ['city-requests', '🗺️', 'City Buildout'],
    ],
  },
  {
    group: 'Commerce',
    items: [
      ['listings', '🏷️', 'Listings'],
      ['crosslisting', '🔁', 'Cross-Listing'],
      ['orders', '📦', 'Orders'],
      ['finance', '💰', 'Finance & Payouts'],
    ],
  },
]

export default function AdminLayout() {
  const { user, signOut, resetDemo } = useApp()
  const navigate = useNavigate()

  return (
    <div>
      {/* slim top bar */}
      <div className="navbar">
        <div className="container navbar-inner">
          <Link to="/" className="brand">
            <img src="/logo.svg" alt="" className="brand-logo" />
            <span>
              CultureConnect
              <small>Admin Console</small>
            </span>
          </Link>
          <div className="nav-right">
            <Link to="/" className="btn btn-ghost btn-sm">
              ← View storefront
            </Link>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => {
                if (
                  confirm(
                    'Reset all demo data (shops, listings, orders, requests) back to defaults?',
                  )
                )
                  resetDemo()
              }}
            >
              ↺ Reset demo
            </button>
            <div className="user-chip">
              <span className="avatar admin">
                {(user?.name || 'A').charAt(0).toUpperCase()}
              </span>
              {user?.name || 'Admin'}
            </div>
            <button
              className="btn btn-dark btn-sm"
              onClick={() => {
                signOut()
                navigate('/')
              }}
            >
              Sign out
            </button>
          </div>
        </div>
      </div>

      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            🔐 Operations <span className="tag">ADMIN</span>
          </div>
          <nav className="admin-nav">
            {NAV.map((section) => (
              <div key={section.group}>
                <div className="group-label">{section.group}</div>
                {section.items.map(([path, ico, label, index]) => (
                  <NavLink
                    key={path}
                    to={path ? `/admin/${path}` : '/admin'}
                    end={!!index || path === ''}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
                    <span className="nav-ico">{ico}</span>
                    {label}
                  </NavLink>
                ))}
              </div>
            ))}
          </nav>
        </aside>

        <main className="admin-content">
          <Outlet />
        </main>
      </div>
    </div>
  )
}
