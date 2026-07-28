import { useState } from 'react'
import { useApp, DEMO_ACCOUNTS } from '../context/AppContext'

// Fake buyer sign-in modal. Any credentials are accepted — this is a demo.
// (Admins do NOT use this. They sign in with a real Google account from the
// discreet link at the bottom of the page — see AdminAuthModal.)
export default function AuthModal({ onClose }) {
  const { signIn } = useApp()
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const demo = DEMO_ACCOUNTS.buyer

  function submit(e) {
    e.preventDefault()
    signIn(email || demo.email, name)
    onClose()
  }

  function useDemo() {
    signIn(demo.email, 'Demo Buyer')
    onClose()
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <button className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 style={{ fontSize: '1.5rem', marginBottom: 4 }}>Welcome back</h2>
        <p className="muted" style={{ marginTop: 0, fontSize: '0.9rem' }}>
          Sign in to CultureConnect
        </p>

        <form onSubmit={submit}>
          <div className="field">
            <label>Email</label>
            <input
              className="input"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={demo.email}
            />
          </div>
          <div className="field">
            <label>Password</label>
            <input className="input" type="password" placeholder="••••••••" />
          </div>
          <button className="btn btn-primary btn-block" type="submit">
            Sign in
          </button>
        </form>

        <button
          className="btn btn-ghost btn-block"
          style={{ marginTop: 10 }}
          onClick={useDemo}
        >
          Skip - use demo buyer account
        </button>

        <div className="demo-hint">
          Demo mode · use <code>{demo.email}</code> with any password, or click the
          button above. Buyer sign-in is simulated for the prototype.
        </div>
      </div>
    </div>
  )
}
