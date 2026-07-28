import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'

// Consolidated photo attribution. Every product and storefront image on
// CultureConnect is a real (non-AI) photograph shared under a Creative Commons
// or public-domain license via Openverse. This page credits each photographer
// and links the license, as those licenses require.
export default function Credits() {
  const { stores, products } = useApp()

  const rows = [
    ...stores
      .filter((s) => s.imageCredit)
      .map((s) => ({ kind: 'Shop', name: s.name, ...s.imageCredit })),
    ...products
      .filter((p) => p.imageCredit)
      .map((p) => ({ kind: 'Product', name: p.name, ...p.imageCredit })),
  ]

  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <div className="eyebrow-sm">Photo credits</div>
          <h2>Real photos, real credit</h2>
          <p style={{ maxWidth: 640 }}>
            Every image on CultureConnect is a genuine photograph — no AI
            imagery — shared by its creator under a Creative Commons or
            public-domain license and discovered through{' '}
            <a href="https://openverse.org" target="_blank" rel="noopener noreferrer">
              Openverse
            </a>
            . We credit each photographer and license below. The shops
            themselves are illustrative demo businesses; the photos represent
            the kind of goods and storefronts these NYC family shops sell.
          </p>
        </div>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Used for</th>
              <th>Photograph</th>
              <th>Photographer</th>
              <th>License</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={i}>
                <td>
                  <span className="muted">{r.kind}</span>
                  <br />
                  {r.name}
                </td>
                <td>
                  {r.source ? (
                    <a href={r.source} target="_blank" rel="noopener noreferrer">
                      {r.title}
                    </a>
                  ) : (
                    r.title
                  )}
                </td>
                <td>{r.author}</td>
                <td>
                  {r.licenseUrl ? (
                    <a href={r.licenseUrl} target="_blank" rel="noopener noreferrer">
                      {r.license}
                    </a>
                  ) : (
                    r.license
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <p className="muted" style={{ marginTop: 24 }}>
        Want to see your shop and your own photos here?{' '}
        <Link to="/services" style={{ fontWeight: 600 }}>
          List with CultureConnect →
        </Link>
      </p>
    </div>
  )
}
