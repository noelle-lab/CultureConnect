import { useState } from 'react'
import { useApp } from '../context/AppContext'
import AuthModal from './AuthModal'

// Gate for the admin area. If not signed in as an admin, show a lock screen
// with an inline sign-in modal instead of the protected content.
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
        <div style={{ fontSize: '3rem', marginBottom: 8 }}>🔐</div>
        <h2 style={{ marginBottom: 6 }}>Admin access only</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          The operations dashboard — shop discovery, cross-listing, finance, and
          city buildout — lives behind an admin sign-in.
        </p>
        {user && (
          <div className="notice" style={{ background: '#fdeceb', borderColor: '#f3c9c5', color: '#8f271e' }}>
            You're signed in as a <strong>buyer</strong>. Switch to an admin
            account to continue.
          </div>
        )}
        <button className="btn btn-dark btn-block" onClick={() => setShowAuth(true)}>
          🔐 Sign in as Admin
        </button>
      </div>
      {showAuth && (
        <AuthModal initialRole="admin" onClose={() => setShowAuth(false)} />
      )}
    </div>
  )
}
