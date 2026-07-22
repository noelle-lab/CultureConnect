import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { onlinePrice, MARKUP } from '../../data/mockData'
import { money } from '../../data/analytics'

export default function Listings() {
  const { products, stores, updateProduct } = useApp()
  const [editing, setEditing] = useState(null)
  const [draft, setDraft] = useState({})

  function startEdit(p) {
    setEditing(p.id)
    setDraft({ inPersonPrice: p.inPersonPrice, stock: p.stock })
  }
  function save(p) {
    updateProduct(p.id, {
      inPersonPrice: Number(draft.inPersonPrice) || p.inPersonPrice,
      stock: Number(draft.stock) ?? p.stock,
    })
    setEditing(null)
  }

  return (
    <>
      <div className="admin-header">
        <h1>Listings</h1>
        <p>
          Every product on the marketplace. Online prices are auto-set to{' '}
          {Math.round(MARKUP * 100)}% of the shop's in-person price.
        </p>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Product</th>
              <th>Shop</th>
              <th>Category</th>
              <th className="text-right">In-store</th>
              <th className="text-right">Online ({Math.round(MARKUP * 100)}%)</th>
              <th className="text-right">Stock</th>
              <th>Channels</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => {
              const store = stores.find((s) => s.id === p.storeId)
              const isEditing = editing === p.id
              return (
                <tr key={p.id}>
                  <td>
                    <div className="flex center gap-8">
                      <span style={{ fontSize: '1.3rem' }}>{p.emoji}</span>
                      <span style={{ fontWeight: 600, maxWidth: 220 }}>{p.name}</span>
                    </div>
                  </td>
                  <td className="muted">
                    {store?.emoji} {store?.name}
                  </td>
                  <td>
                    <span className="badge badge-culture">{p.category}</span>
                  </td>
                  <td className="text-right">
                    {isEditing ? (
                      <input
                        className="input"
                        style={{ width: 80, padding: '6px 8px', textAlign: 'right' }}
                        type="number"
                        step="0.01"
                        value={draft.inPersonPrice}
                        onChange={(e) =>
                          setDraft({ ...draft, inPersonPrice: e.target.value })
                        }
                      />
                    ) : (
                      money(p.inPersonPrice)
                    )}
                  </td>
                  <td className="text-right" style={{ fontWeight: 700 }}>
                    {money(
                      onlinePrice(
                        isEditing ? Number(draft.inPersonPrice) || 0 : p.inPersonPrice,
                      ),
                    )}
                  </td>
                  <td className="text-right">
                    {isEditing ? (
                      <input
                        className="input"
                        style={{ width: 64, padding: '6px 8px', textAlign: 'right' }}
                        type="number"
                        value={draft.stock}
                        onChange={(e) => setDraft({ ...draft, stock: e.target.value })}
                      />
                    ) : p.stock <= 8 ? (
                      <span style={{ color: 'var(--clay)', fontWeight: 700 }}>
                        {p.stock} low
                      </span>
                    ) : (
                      p.stock
                    )}
                  </td>
                  <td>
                    <div className="chip-row">
                      {p.crosslisted.includes('etsy') && (
                        <span className="badge badge-etsy">Etsy</span>
                      )}
                      {p.crosslisted.includes('ebay') && (
                        <span className="badge badge-ebay">eBay</span>
                      )}
                      {p.crosslisted.length === 0 && (
                        <span className="muted" style={{ fontSize: '0.8rem' }}>
                          CC only
                        </span>
                      )}
                    </div>
                  </td>
                  <td>
                    {isEditing ? (
                      <div className="flex gap-8">
                        <button className="btn btn-primary btn-sm" onClick={() => save(p)}>
                          Save
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setEditing(null)}
                        >
                          ✕
                        </button>
                      </div>
                    ) : (
                      <button className="btn btn-ghost btn-sm" onClick={() => startEdit(p)}>
                        Edit
                      </button>
                    )}
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
