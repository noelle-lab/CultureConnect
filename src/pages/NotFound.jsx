import { Link } from 'react-router-dom'

export default function NotFound() {
  return (
    <div className="container section">
      <div className="empty">
        <div className="big">🧭</div>
        <h2>Page not found</h2>
        <p>Let's get you back to the marketplace.</p>
        <Link to="/" className="btn btn-primary">
          Go home
        </Link>
      </div>
    </div>
  )
}
