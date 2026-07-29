import { useState } from 'react'
import { useApp } from '../context/AppContext'
import AdminAuthModal from './AdminAuthModal'

// Gate for the admin area. If not signed in as an admin, show a lock screen
// with the invite-only Google sign-in instead of the protected content.
export default function RequireAdmin({ children }) {
  const { user } = useApp()
  const [showAuth, setShowAuth] = useState(false)

  if (user?.role === 'admin') return children

  return (
    <div className="container" style={{ padding: '80px 0' }}>
      <div
        className="panel"
        style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}
      >
        <h2 style={{ marginBottom: 6 }}>Admin access only</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          The operations console - shop discovery, listings, cross-listing,
          finance, and city buildout - is invite-only and signed in with a real
          Google account.
        </p>
        {user && (
          <div
            className="notice"
            style={{
              background: '#fdeceb',
              borderColor: '#f3c9c5',
              color: '#8f271e',
            }}
          >
            You're signed in as a <strong>buyer</strong>. Admin access needs an
            invited Google account.
          </div>
        )}
        <button
          className="btn btn-dark btn-block"
          onClick={() => setShowAuth(true)}
        >
          Sign in with Google
        </button>
      </div>
      {showAuth && <AdminAuthModal onClose={() => setShowAuth(false)} />}
    </div>
  )
}
