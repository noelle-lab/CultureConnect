import { useMemo } from 'react'
import { useApp } from '../../context/AppContext'
import { onlinePrice } from '../../data/mockData'
import { money } from '../../data/analytics'

const CHANNELS = [
  { key: 'etsy', label: 'Etsy', badge: 'badge-etsy', emoji: '🧵' },
  { key: 'ebay', label: 'eBay', badge: 'badge-ebay', emoji: '🏷️' },
]

// Cross-listing control center: publish/unpublish each product to Etsy & eBay.
export default function CrossListing() {
  const { products, stores, toggleCrosslist } = useApp()

  // Only shops that opted into the cross-listing service.
  const eligibleStoreIds = useMemo(
    () =>
      new Set(
        stores.filter((s) => s.services.includes('crosslisting')).map((s) => s.id),
      ),
    [stores],
  )
  const eligible = products.filter((p) => eligibleStoreIds.has(p.storeId))

  const stats = CHANNELS.map((c) => ({
    ...c,
    count: eligible.filter((p) => p.crosslisted.includes(c.key)).length,
  }))

  return (
    <>
      <div className="admin-header">
        <h1>Cross-Listing</h1>
        <p>
          Publish products from cross-listing shops to Etsy &amp; eBay. Inventory
          and pricing stay synced from a single catalog.
        </p>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="label">Cross-listing shops</div>
          <div className="value">{eligibleStoreIds.size}</div>
          <div className="delta">enrolled in the service</div>
        </div>
        {stats.map((s) => (
          <div className="kpi" key={s.key}>
            <div className="label">Live on {s.label}</div>
            <div className="value">
              {s.emoji} {s.count}
            </div>
            <div className="delta">of {eligible.length} eligible products</div>
          </div>
        ))}
      </div>

      {eligible.length === 0 ? (
        <div className="empty">
          <div className="big">🔁</div>
          <p>
            No shops are enrolled in cross-listing yet. Enable it per shop under{' '}
            <strong>Partner Shops</strong>.
          </p>
        </div>
      ) : (
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Product</th>
                <th>Shop</th>
                <th className="text-right">Online price</th>
                <th className="text-right">Stock</th>
                {CHANNELS.map((c) => (
                  <th key={c.key} style={{ textAlign: 'center' }}>
                    {c.emoji} {c.label}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {eligible.map((p) => {
                const store = stores.find((s) => s.id === p.storeId)
                return (
                  <tr key={p.id}>
                    <td>
                      <div className="flex center gap-8">
                        <span style={{ fontSize: '1.3rem' }}>{p.emoji}</span>
                        <span style={{ fontWeight: 600 }}>{p.name}</span>
                      </div>
                    </td>
                    <td className="muted">
                      {store?.emoji} {store?.name}
                    </td>
                    <td className="text-right" style={{ fontWeight: 600 }}>
                      {money(onlinePrice(p.inPersonPrice))}
                    </td>
                    <td className="text-right">{p.stock}</td>
                    {CHANNELS.map((c) => (
                      <td key={c.key} style={{ textAlign: 'center' }}>
                        <label
                          className="switch"
                          style={{ display: 'inline-block' }}
                          title={`${p.crosslisted.includes(c.key) ? 'Unpublish from' : 'Publish to'} ${c.label}`}
                        >
                          <input
                            type="checkbox"
                            checked={p.crosslisted.includes(c.key)}
                            onChange={() => toggleCrosslist(p.id, c.key)}
                          />
                          <span className="slider" />
                        </label>
                      </td>
                    ))}
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  )
}
