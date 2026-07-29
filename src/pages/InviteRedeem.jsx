import { useEffect, useState } from 'react'
import { useSearchParams, useNavigate, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import GoogleSignInButton from '../components/GoogleSignInButton'

// Public landing page for an invite link: /invite?token=…
//
// Flow:
//   1. On load we only VERIFY the link (read-only) — opening it grants nothing.
//   2. The invitee clicks "Accept invitation". That deliberate step adds their
//      email to the admin roster and remembers the account on this device.
//   3. They then sign in with the matching Google account to enter the console.
export default function InviteRedeem() {
  const [params] = useSearchParams()
  const token = params.get('token')
  const { verifyInvite, acceptInvite, signInAdminGoogle } = useApp()
  const navigate = useNavigate()

  const [state, setState] = useState({ phase: 'verifying' })
  const [accepting, setAccepting] = useState(false)
  const [signInError, setSignInError] = useState(null)

  useEffect(() => {
    let cancelled = false
    if (!token) {
      setState({ phase: 'error', reason: 'no-token' })
      return
    }
    verifyInvite(token).then((res) => {
      if (cancelled) return
      if (res.ok)
        setState({
          phase: 'invited',
          email: res.email,
          alreadyAdmin: res.alreadyAdmin,
        })
      else setState({ phase: 'error', reason: res.reason })
    })
    return () => {
      cancelled = true
    }
    // token is stable for the life of this page
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token])

  async function handleAccept() {
    setAccepting(true)
    const res = await acceptInvite(token)
    setAccepting(false)
    if (res.ok) setState((s) => ({ ...s, phase: 'accepted', email: res.email }))
    else setState({ phase: 'error', reason: res.reason })
  }

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
            <h2>Checking your invite…</h2>
          </>
        )}

        {state.phase === 'invited' && (
          <>
            <h2 style={{ marginBottom: 6 }}>You've been invited</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              <strong>{state.email}</strong> has been invited to join the
              CultureConnect team as an <strong>admin</strong>. Accept below to
              add this account and remember it on this device.
            </p>
            {state.alreadyAdmin && (
              <div className="notice" style={{ textAlign: 'left' }}>
                This account already has admin access on this device. Accepting
                again is harmless — you can go straight to signing in.
              </div>
            )}
            <button
              className="btn btn-dark btn-block"
              style={{ marginTop: 10 }}
              onClick={handleAccept}
              disabled={accepting}
            >
              {accepting ? 'Accepting…' : '✓ Accept invitation'}
            </button>
            <Link
              to="/"
              className="btn btn-ghost btn-block"
              style={{ marginTop: 8 }}
            >
              Not now
            </Link>
          </>
        )}

        {state.phase === 'accepted' && (
          <>
            <h2 style={{ marginBottom: 6 }}>Invitation accepted</h2>
            <p className="muted" style={{ marginTop: 0 }}>
              <strong>{state.email}</strong> is now an admin, and we'll remember
              this account on this device. Sign in with that Google account to
              open the console.
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
