import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { HAS_GOOGLE } from '../../lib/adminAuth'

// Copy-to-clipboard button with a little "Copied!" confirmation.
function CopyButton({ text, label = 'Copy link' }) {
  const [copied, setCopied] = useState(false)
  async function copy() {
    try {
      await navigator.clipboard.writeText(text)
    } catch {
      // Fallback for older browsers / insecure origins.
      const ta = document.createElement('textarea')
      ta.value = text
      document.body.appendChild(ta)
      ta.select()
      document.execCommand('copy')
      document.body.removeChild(ta)
    }
    setCopied(true)
    setTimeout(() => setCopied(false), 1600)
  }
  return (
    <button className="btn btn-primary btn-sm" onClick={copy} type="button">
      {copied ? '✓ Copied' : label}
    </button>
  )
}

export default function Team() {
  const { admins, invites, createInvite, revokeInvite, revokeAdmin, user } =
    useApp()
  const [email, setEmail] = useState('')
  const [busy, setBusy] = useState(false)
  const [created, setCreated] = useState(null) // most recent invite
  const [error, setError] = useState('')

  const pending = invites.filter((i) => !i.redeemed)

  async function submit(e) {
    e.preventDefault()
    setError('')
    const clean = email.trim().toLowerCase()
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(clean)) {
      setError('Please enter a valid email address.')
      return
    }
    if (admins.some((a) => a.email === clean)) {
      setError('That person is already an admin.')
      return
    }
    setBusy(true)
    const invite = await createInvite(clean)
    setBusy(false)
    setCreated(invite)
    setEmail('')
  }

  return (
    <>
      <div className="admin-header">
        <h1>Team &amp; Invites</h1>
        <p>
          Admins sign in with a real Google account, and access is invite-only.
          Create a link below, email it to the person yourself, and they unlock
          access when they open it.
        </p>
      </div>

      {!HAS_GOOGLE && (
        <div className="notice" style={{ marginBottom: 20 }}>
          <strong>Heads up:</strong> no Google Client ID is configured yet, so
          admin sign-in runs in <em>demo</em> mode. The invite flow works
          exactly the same — add <code>VITE_GOOGLE_CLIENT_ID</code> to turn on
          real Google accounts. See the README.
        </div>
      )}

      {/* Invite a new admin */}
      <div className="panel" style={{ marginBottom: 22 }}>
        <h3 style={{ marginTop: 0 }}>Invite an admin</h3>
        <form onSubmit={submit}>
          <div className="flex gap-8 wrap" style={{ alignItems: 'flex-end' }}>
            <div className="field" style={{ flex: 1, minWidth: 240, marginBottom: 0 }}>
              <label>Their email address</label>
              <input
                className="input"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="name@example.com"
              />
            </div>
            <button className="btn btn-primary" type="submit" disabled={busy}>
              {busy ? 'Creating…' : 'Create invite link'}
            </button>
          </div>
        </form>
        {error && (
          <div
            className="notice"
            style={{
              marginTop: 12,
              marginBottom: 0,
              background: '#fdeceb',
              borderColor: '#f3c9c5',
              color: '#8f271e',
            }}
          >
            {error}
          </div>
        )}

        {created && (
          <div className="invite-result">
            <div style={{ fontWeight: 600, marginBottom: 6 }}>
              Invite link for {created.email}
            </div>
            <div className="invite-link-row">
              <code className="invite-link">{created.link}</code>
              <CopyButton text={created.link} />
            </div>
            <p className="muted" style={{ fontSize: '0.85rem', margin: '10px 0 0' }}>
              Email this link to {created.email} yourself — the site won't send
              it for you. When they open it and sign in with Google, they get
              admin access. The link expires in 14 days and only works for that
              email.
            </p>
          </div>
        )}
      </div>

      {/* Pending invites */}
      <div className="panel" style={{ marginBottom: 22 }}>
        <h3 style={{ marginTop: 0 }}>
          Pending invites{' '}
          <span className="muted" style={{ fontWeight: 400 }}>
            ({pending.length})
          </span>
        </h3>
        {pending.length === 0 ? (
          <p className="muted" style={{ margin: 0 }}>
            No invites waiting to be redeemed.
          </p>
        ) : (
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Email</th>
                  <th>Created</th>
                  <th>Link</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {pending.map((i) => (
                  <tr key={i.id}>
                    <td style={{ fontWeight: 600 }}>{i.email}</td>
                    <td className="muted">{i.createdAt}</td>
                    <td>
                      <CopyButton text={i.link} />
                    </td>
                    <td className="text-right">
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => revokeInvite(i.id)}
                      >
                        Revoke
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Current admins */}
      <div className="panel">
        <h3 style={{ marginTop: 0 }}>
          Admins{' '}
          <span className="muted" style={{ fontWeight: 400 }}>
            ({admins.length})
          </span>
        </h3>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Person</th>
                <th>Role</th>
                <th>Added</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {admins.map((a) => {
                const isOwner = a.status === 'owner'
                const isSelf = a.email === user?.email
                return (
                  <tr key={a.email}>
                    <td>
                      <div className="flex center gap-8">
                        {a.picture ? (
                          <img className="admin-avatar" src={a.picture} alt="" />
                        ) : (
                          <span className="avatar admin">
                            {(a.name || a.email).charAt(0).toUpperCase()}
                          </span>
                        )}
                        <div>
                          <div style={{ fontWeight: 600 }}>
                            {a.name || '—'}
                            {isSelf && (
                              <span className="muted" style={{ fontWeight: 400 }}>
                                {' '}
                                (you)
                              </span>
                            )}
                          </div>
                          <div className="muted" style={{ fontSize: '0.78rem' }}>
                            {a.email}
                          </div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span
                        className={`badge ${isOwner ? 'badge-etsy' : 'badge-culture'}`}
                      >
                        {isOwner ? 'Owner' : 'Admin'}
                      </span>
                    </td>
                    <td className="muted">{a.addedAt || '—'}</td>
                    <td className="text-right">
                      {isOwner ? (
                        <span className="muted" style={{ fontSize: '0.82rem' }}>
                          Can't be removed
                        </span>
                      ) : (
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => {
                            if (
                              confirm(
                                `Remove admin access for ${a.email}? They'll be signed out and will need a new invite to return.`,
                              )
                            )
                              revokeAdmin(a.email)
                          }}
                        >
                          Remove
                        </button>
                      )}
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
