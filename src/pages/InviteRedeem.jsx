import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import GoogleSignInButton from '../components/GoogleSignInButton'

// Public landing page for an invite link: /invite?token=…
//
// Redeeming a valid link adds the invited email to the admin roster (on this
// device), then invites them to sign in with the matching Google account.
export default function InviteRedeem() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const { redeemInvite, signInAdminGoogle } = useApp()
  const navigate = useNavigate()

  const [state, setState] = useState({ phase: 'verifying' })
  const [signInError, setSignInError] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (!token) {
      setState({ phase: 'error', reason: 'no-token' })
      return
    }
    redeemInvite(token).then((res) => {
      if (cancelled) return
      if (res.ok) setState({ phase: 'ready', email: res.email })
      else setState({ phase: 'error', reason: res.reason })
    })
    return () => {
      cancelled = true
    }
    // token is stable for the life of this page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  function handleSignIn(profile) {
    const res = signInAdminGoogle(profile)
    if (res.ok) navigate('/admin')
    else setSignInError({ reason: res.reason, email: profile?.email })
  }

  return (
    <div className="container" style={{ padding: '70px 0' }}>
      <div
        className="panel"
        style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}
      >
        {state.phase === 'verifying' && (
          <>
            <div style={{ fontSize: '2.6rem' }}>⏳</div>
            <h2>Checking your invite…</h2>
          </>
        )}

        {state.phase === 'ready' && (
          <>
            <div style={{ fontSize: '2.6rem' }}>🎉</div>
            <h2 style={{ marginBottom: 6 }}>You're invited</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              Admin access has been unlocked for <strong>{state.email}</strong> on
              this device. Sign in with that Google account to continue.
            </p>

            {signInError && (
              <div
                className="notice"
                style={{
                  background: '#fdeceb',
                  borderColor: '#f3c9c5',
                  color: '#8f271e',
                }}
              >
                {signInError.reason === 'not-invited' ? (
                  <>
                    <strong>{signInError.email}</strong> doesn't match this
                    invite. Please sign in with{' '}
                    <strong>{state.email}</strong>.
                  </>
                ) : (
                  <>Couldn't sign you in. Please try again.</>
                )}
              </div>
            )}

            <div style={{ marginTop: 10, display: 'grid', placeItems: 'center' }}>
              <GoogleSignInButton
                onSignIn={handleSignIn}
                demoEmail={state.email}
              />
            </div>
          </>
        )}

        {state.phase === 'error' && (
          <>
            <div style={{ fontSize: '2.6rem' }}>🔒</div>
            <h2 style={{ marginBottom: 6 }}>This invite link isn't valid</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              {state.reason === 'expired'
                ? 'This invite has expired. Ask an admin to send you a fresh link.'
                : state.reason === 'no-token'
                  ? 'No invite token was found in the link.'
                  : "We couldn't verify this link. Ask an admin to send you a new one."}
            </p>
            <Link to="/" className="btn btn-ghost btn-block" style={{ marginTop: 8 }}>
              ← Back to CultureConnect
            </Link>
          </>
        )}
      </div>
    </div>
  )
}
