import { useApp } from '../../context/AppContext'

const STATUS_OPTIONS = ['prospect', 'contacted', 'onboarding', 'active']

export default function Stores() {
  const { stores, products, updateStore } = useApp()

  function productCount(storeId) {
    return products.filter((p) => p.storeId === storeId).length
  }

  function toggleService(store, service) {
    const has = store.services.includes(service)
    updateStore(store.id, {
      services: has
        ? store.services.filter((s) => s !== service)
        : [...store.services, service],
    })
  }

  return (
    <>
      <div className="admin-header">
        <h1>Partner Shops</h1>
        <p>Manage every shop on the platform — status, services, and details.</p>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Shop</th>
              <th>Heritage</th>
              <th>Location</th>
              <th>Listings</th>
              <th>Services</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="flex center gap-8">
                    <span style={{ fontSize: '1.4rem' }}>{s.emoji}</span>
                    <div>
                      <div style={{ fontWeight: 600 }}>{s.name}</div>
                      <div className="muted" style={{ fontSize: '0.78rem' }}>
                        {s.owner}
                        {s.rating ? ` · ★ ${s.rating}` : ''}
                      </div>
                    </div>
                  </div>
                </td>
                <td>{s.heritage}</td>
                <td className="muted">{s.neighborhood}</td>
                <td>{productCount(s.id)}</td>
                <td>
                  <div className="flex gap-8 wrap">
                    <label className="flex center gap-8" style={{ fontSize: '0.78rem', cursor: 'pointer' }}>
                      <span className="switch">
                        <input
                          type="checkbox"
                          checked={s.services.includes('listing')}
                          onChange={() => toggleService(s, 'listing')}
                        />
                        <span className="slider" />
                      </span>
                      List
                    </label>
                    <label className="flex center gap-8" style={{ fontSize: '0.78rem', cursor: 'pointer' }}>
                      <span className="switch">
                        <input
                          type="checkbox"
                          checked={s.services.includes('crosslisting')}
                          onChange={() => toggleService(s, 'crosslisting')}
                        />
                        <span className="slider" />
                      </span>
                      Cross
                    </label>
                  </div>
                </td>
                <td>
                  <select
                    className="select"
                    style={{ width: 'auto', padding: '6px 10px', fontSize: '0.82rem' }}
                    value={s.status}
                    onChange={(e) => updateStore(s.id, { status: e.target.value })}
                  >
                    {STATUS_OPTIONS.map((o) => (
                      <option key={o} value={o}>
                        {o}
                      </option>
                    ))}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
