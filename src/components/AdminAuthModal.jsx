import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { HAS_GOOGLE } from '../lib/adminAuth'
import GoogleSignInButton from './GoogleSignInButton'

// Admin sign-in. Real Google account, invite-only. This is deliberately
// separate from the buyer AuthModal so the public flow never touches it.
export default function AdminAuthModal({ onClose }) {
  const { signInAdminGoogle } = useApp()
  const navigate = useNavigate()
  const [error, setError] = useState(null)

  function handleSignIn(profile) {
    const res = signInAdminGoogle(profile)
    if (res.ok) {
      onClose()
      navigate('/admin')
    } else {
      setError({ reason: res.reason, email: profile?.email })
    }
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 style={{ fontSize: '1.4rem', margin: '10px 0 4px' }}>
          Admin sign in
        </h2>
        <p className="muted" style={{ marginTop: 0, fontSize: '0.9rem' }}>
          For the CultureConnect team. Access is invite-only and uses your real
          Google account.
        </p>

        {error && (
          <div
            className="notice"
            style={{
              background: '#fdeceb',
              borderColor: '#f3c9c5',
              color: '#8f271e',
            }}
          >
            {error.reason === 'not-invited' ? (
              <>
                <strong>{error.email}</strong> hasn't been invited yet. Ask an
                existing admin to send you an invite link, then open it on this
                device and sign in again.
              </>
            ) : error.reason === 'unverified' ? (
              <>That Google account's email isn't verified.</>
            ) : (
              <>Couldn't sign you in. Please try again.</>
            )}
          </div>
        )}

        <div style={{ marginTop: 6, display: 'grid', placeItems: 'center' }}>
          <GoogleSignInButton onSignIn={handleSignIn} />
        </div>

        <div className="demo-hint" style={{ marginTop: 16 }}>
          {HAS_GOOGLE ? (
            <>Only Google accounts that have redeemed an invite can get in.</>
          ) : (
            <>
              Buyers &amp; businesses use the ordinary (simulated) sign-in — this
              Google gate is just for admins.
            </>
          )}
        </div>
      </div>
    </div>
  )
}
