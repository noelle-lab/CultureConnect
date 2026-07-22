import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp, DEMO_ACCOUNTS } from '../context/AppContext'

// Fake sign-in modal. Buyer vs Admin tabs. Any credentials are accepted —
// this is a demo. The chosen role decides what the app unlocks.
export default function AuthModal({ initialRole = 'buyer', onClose }) {
  const { signIn } = useApp()
  const navigate = useNavigate()
  const [role, setRole] = useState(initialRole)
  const [email, setEmail] = useState('')
  const [name, setName] = useState('')

  const demo = DEMO_ACCOUNTS[role]

  function submit(e) {
    e.preventDefault()
    signIn(role, email || demo.email, name)
    onClose()
    if (role === 'admin') navigate('/admin')
  }

  function useDemo() {
    signIn(role, demo.email, role === 'admin' ? 'Noelle (Admin)' : 'Demo Buyer')
    onClose()
    if (role === 'admin') navigate('/admin')
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

        <div className="auth-tabs" role="tablist">
          <button
            className={role === 'buyer' ? 'active' : ''}
            onClick={() => setRole('buyer')}
          >
            🛍️ Buyer
          </button>
          <button
            className={role === 'admin' ? 'active' : ''}
            onClick={() => setRole('admin')}
          >
            🔐 Admin
          </button>
        </div>

        <form onSubmit={submit}>
          {role === 'admin' && (
            <div className="field">
              <label>Name</label>
              <input
                className="input"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name"
              />
            </div>
          )}
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
            Sign in as {role === 'admin' ? 'Admin' : 'Buyer'}
          </button>
        </form>

        <button
          className="btn btn-ghost btn-block"
          style={{ marginTop: 10 }}
          onClick={useDemo}
        >
          Skip — use demo {role} account
        </button>

        <div className="demo-hint">
          Demo mode · use <code>{demo.email}</code> with any password, or click the
          button above. The {role} experience is fully explorable.
        </div>
      </div>
    </div>
  )
}
