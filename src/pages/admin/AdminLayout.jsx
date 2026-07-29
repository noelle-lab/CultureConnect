import { NavLink, Outlet, Link, useNavigate } from 'react-router-dom'
import { useApp } from '../../context/AppContext'

const NAV = [
  { group: 'Overview', items: [['', 'Dashboard', true]] },
  {
    group: 'Sourcing',
    items: [
      ['discovery', 'Shop Discovery'],
      ['stores', 'Partner Shops'],
      ['city-requests', 'City Buildout'],
    ],
  },
  {
    group: 'Commerce',
    items: [
      ['listings', 'Listings'],
      ['crosslisting', 'Cross-Listing'],
      ['orders', 'Orders'],
      ['finance', 'Finance & Payouts'],
    ],
  },
  {
    group: 'Team',
    items: [['team', 'Team & Invites']],
  },
]

export default function AdminLayout() {
  const { user, signOut, resetDemo, hasPendingEdits, publishEdits, discardEdits } =
    useApp()
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
              {user?.picture ? (
                <img className="admin-avatar" src={user.picture} alt="" />
              ) : (
                <span className="avatar admin">
                  {(user?.name || 'A').charAt(0).toUpperCase()}
                </span>
              )}
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

      {/* Draft / publish bar: admin edits stay in a draft until they're pushed
          live here, so nothing on the public storefront changes by surprise. */}
      <div className={`edit-bar${hasPendingEdits ? ' has-edits' : ''}`}>
        <div className="container edit-bar-inner">
          {hasPendingEdits ? (
            <>
              <span className="edit-bar-status">
                <span className="edit-dot" />
                You have unpublished edits — the live storefront hasn't changed
                yet.
              </span>
              <div className="flex center gap-8">
                <button
                  className="btn btn-ghost btn-sm"
                  onClick={() => {
                    if (
                      confirm(
                        'Discard all unpublished edits and revert to the live storefront? This cannot be undone.',
                      )
                    )
                      discardEdits()
                  }}
                >
                  Discard edits
                </button>
                <button
                  className="btn btn-primary btn-sm"
                  onClick={publishEdits}
                >
                  ✓ Publish edits
                </button>
              </div>
            </>
          ) : (
            <span className="edit-bar-status muted">
              <span className="edit-dot live" />
              The live storefront is up to date — no unpublished edits.
            </span>
          )}
        </div>
      </div>

      <div className="admin-shell">
        <aside className="admin-sidebar">
          <div className="admin-brand">
            Operations <span className="tag">ADMIN</span>
          </div>
          <nav className="admin-nav">
            {NAV.map((section) => (
              <div key={section.group}>
                <div className="group-label">{section.group}</div>
                {section.items.map(([path, label, index]) => (
                  <NavLink
                    key={path}
                    to={path ? `/admin/${path}` : '/admin'}
                    end={!!index || path === ''}
                    className={({ isActive }) => (isActive ? 'active' : '')}
                  >
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
