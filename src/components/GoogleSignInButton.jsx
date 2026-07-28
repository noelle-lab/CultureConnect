import { useEffect, useRef, useState } from 'react'
import {
  GOOGLE_CLIENT_ID,
  HAS_GOOGLE,
  loadGoogleIdentity,
  decodeGoogleCredential,
} from '../lib/adminAuth'

// A "Sign in with Google" button for admins.
//
// • When a real VITE_GOOGLE_CLIENT_ID is configured, this renders Google's
//   genuine button and hands the caller the verified Google profile.
// • When it isn't (nobody has set it up yet), it falls back to a clearly
//   labelled DEMO sign-in so the invite-only flow is still fully explorable.
//   The demo path still enforces the same invite check — you just type the
//   email of the "Google account" instead of really authenticating.
//
// Props: onSignIn(profile) where profile = { email, name, picture, emailVerified }
export default function GoogleSignInButton({ onSignIn, demoEmail = '' }) {
  const btnRef = useRef(null)
  const cbRef = useRef(onSignIn)
  cbRef.current = onSignIn
  const [status, setStatus] = useState(HAS_GOOGLE ? 'loading' : 'demo')

  useEffect(() => {
    if (!HAS_GOOGLE) return
    let cancelled = false

    loadGoogleIdentity()
      .then((google) => {
        if (cancelled || !btnRef.current) return
        google.accounts.id.initialize({
          client_id: GOOGLE_CLIENT_ID,
          callback: ({ credential }) => {
            const profile = decodeGoogleCredential(credential)
            if (profile) cbRef.current?.(profile)
          },
        })
        google.accounts.id.renderButton(btnRef.current, {
          theme: 'outline',
          size: 'large',
          width: 300,
          text: 'signin_with',
          shape: 'pill',
        })
        setStatus('ready')
      })
      .catch(() => {
        // Couldn't reach Google (offline, blocked). Offer the demo path so the
        // user isn't stuck.
        if (!cancelled) setStatus('demo')
      })

    return () => {
      cancelled = true
    }
  }, [])

  if (HAS_GOOGLE && status !== 'demo') {
    return (
      <div>
        <div ref={btnRef} className="gsi-btn-host" />
        {status === 'loading' && (
          <div className="muted" style={{ fontSize: '0.82rem', marginTop: 8 }}>
            Loading Google sign-in…
          </div>
        )}
      </div>
    )
  }

  return <DemoGoogleButton onSignIn={onSignIn} demoEmail={demoEmail} />
}

// Simulated Google sign-in used when no real client ID is configured.
function DemoGoogleButton({ onSignIn, demoEmail }) {
  const [open, setOpen] = useState(false)
  const [email, setEmail] = useState(demoEmail)
  const [name, setName] = useState('')

  function go(e) {
    e.preventDefault()
    if (!email.trim()) return
    onSignIn({
      email: email.trim(),
      name: name.trim(),
      picture: '',
      emailVerified: true,
    })
  }

  if (!open) {
    return (
      <div>
        <button
          type="button"
          className="btn btn-block google-btn"
          onClick={() => setOpen(true)}
        >
          <GoogleGlyph />
          Continue with Google
        </button>
        <div className="demo-hint" style={{ marginTop: 10 }}>
          <strong>Demo mode.</strong> No Google Client ID is configured, so this
          simulates the real sign-in. Add <code>VITE_GOOGLE_CLIENT_ID</code> to
          switch on genuine Google accounts (see README).
        </div>
      </div>
    )
  }

  return (
    <form onSubmit={go}>
      <div className="field">
        <label>Google account email</label>
        <input
          className="input"
          type="email"
          value={email}
          autoFocus
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@gmail.com"
          required
        />
      </div>
      <div className="field">
        <label>Name (optional)</label>
        <input
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Your name"
        />
      </div>
      <button type="submit" className="btn btn-block google-btn">
        <GoogleGlyph />
        Continue as {email || 'this account'}
      </button>
    </form>
  )
}

function GoogleGlyph() {
  return (
    <svg width="18" height="18" viewBox="0 0 18 18" aria-hidden="true">
      <path
        fill="#4285F4"
        d="M17.64 9.2c0-.64-.06-1.25-.16-1.84H9v3.48h4.84a4.14 4.14 0 0 1-1.8 2.72v2.26h2.92c1.7-1.57 2.68-3.88 2.68-6.62Z"
      />
      <path
        fill="#34A853"
        d="M9 18c2.43 0 4.47-.8 5.96-2.18l-2.92-2.26c-.8.54-1.84.86-3.04.86-2.34 0-4.32-1.58-5.02-3.7H.96v2.34A9 9 0 0 0 9 18Z"
      />
      <path
        fill="#FBBC05"
        d="M3.98 10.72a5.4 5.4 0 0 1 0-3.44V4.94H.96a9 9 0 0 0 0 8.12l3.02-2.34Z"
      />
      <path
        fill="#EA4335"
        d="M9 3.58c1.32 0 2.5.46 3.44 1.35l2.58-2.58C13.47.9 11.43 0 9 0A9 9 0 0 0 .96 4.94l3.02 2.34C4.68 5.16 6.66 3.58 9 3.58Z"
      />
    </svg>
  )
}
