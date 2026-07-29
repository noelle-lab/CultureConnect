import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

// Gate for the business-owner portal. If not signed in as a shop owner, show a
// friendly prompt pointing back to the "For Businesses" page where the demo
// owner sign-in lives.
export default function RequireOwner({ children }) {
  const { user } = useApp()

  if (user?.role === 'owner') return children

  return (
    <div className="container" style={{ padding: '80px 0' }}>
      <div
        className="panel"
        style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}
      >
        <h2 style={{ marginBottom: 6 }}>Shop owner sign-in required</h2>
        <p className="muted" style={{ marginTop: 0 }}>
          The owner portal lets partner shops manage their CultureConnect
          listings and — for shops on the cross-listing plan — their Etsy and
          eBay listings.
        </p>
        {user && user.role !== 'owner' && (
          <div
            className="notice"
            style={{
              background: '#fdeceb',
              borderColor: '#f3c9c5',
              color: '#8f271e',
            }}
          >
            You're signed in as a <strong>{user.role}</strong>. The portal is for
            partner shop owners.
          </div>
        )}
        <Link className="btn btn-dark btn-block" to="/services#owner-signin">
          Go to owner sign-in
        </Link>
      </div>
    </div>
  )
}
