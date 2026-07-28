import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import { onlinePrice, MARKUP } from '../../data/mockData'
import { money } from '../../data/analytics'
import ImageInput from '../../components/ImageInput'

const CATEGORIES = [
  'Food & Pantry',
  'Home & Textiles',
  'Apparel',
  'Beauty & Wellness',
]

// Modal editor for creating a new listing or editing an existing one —
// including its description and photo.
function ListingEditor({ initial, stores, onSave, onClose }) {
  const isNew = !initial?.id
  const [form, setForm] = useState({
    storeId: stores[0]?.id || '',
    name: '',
    category: CATEGORIES[0],
    inPersonPrice: '',
    stock: '',
    emoji: '🏷️',
    description: '',
    image: '',
    crosslisted: [],
    ...initial,
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function toggleChannel(ch) {
    setForm((f) => ({
      ...f,
      crosslisted: f.crosslisted.includes(ch)
        ? f.crosslisted.filter((c) => c !== ch)
        : [...f.crosslisted, ch],
    }))
  }

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.storeId) return
    onSave({
      ...form,
      inPersonPrice: Number(form.inPersonPrice) || 0,
      stock: Number(form.stock) || 0,
    })
  }

  const preview = onlinePrice(Number(form.inPersonPrice) || 0)

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal modal-wide" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 style={{ fontSize: '1.4rem', marginTop: 0, marginBottom: 16 }}>
          {isNew ? 'New listing' : `Edit ${initial.name}`}
        </h2>

        <div className="field">
          <label>Business *</label>
          <select className="select" value={form.storeId} onChange={set('storeId')} required>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.emoji} {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Product name *</label>
            <input className="input" value={form.name} onChange={set('name')} required />
          </div>
          <div className="field">
            <label>Emoji</label>
            <input className="input" value={form.emoji} onChange={set('emoji')} maxLength={4} />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Category</label>
            <select className="select" value={form.category} onChange={set('category')}>
              {CATEGORIES.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Stock</label>
            <input
              className="input"
              type="number"
              value={form.stock}
              onChange={set('stock')}
              placeholder="0"
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>In-store price ($)</label>
            <input
              className="input"
              type="number"
              step="0.01"
              value={form.inPersonPrice}
              onChange={set('inPersonPrice')}
              placeholder="0.00"
            />
          </div>
          <div className="field">
            <label>Online price ({Math.round(MARKUP * 100)}%, auto)</label>
            <input
              className="input"
              value={money(preview)}
              disabled
              style={{ fontWeight: 700 }}
            />
          </div>
        </div>

        <ImageInput
          label="Product photo"
          value={form.image}
          onChange={(v) => setForm({ ...form, image: v })}
        />

        <div className="field">
          <label>Description</label>
          <textarea
            className="textarea"
            value={form.description}
            onChange={set('description')}
            placeholder="What it is, how it's made, why it's special…"
          />
        </div>

        <div className="field">
          <label>Cross-listing channels</label>
          <div className="flex gap-8 wrap">
            {['etsy', 'ebay'].map((ch) => (
              <label
                key={ch}
                className="flex center gap-8"
                style={{ cursor: 'pointer', fontSize: '0.85rem' }}
              >
                <input
                  type="checkbox"
                  checked={form.crosslisted.includes(ch)}
                  onChange={() => toggleChannel(ch)}
                />
                {ch === 'etsy' ? 'Etsy' : 'eBay'}
              </label>
            ))}
          </div>
        </div>

        <div className="flex gap-8" style={{ marginTop: 8 }}>
          <button className="btn btn-primary" type="submit">
            {isNew ? 'Create listing' : 'Save changes'}
          </button>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default function Listings() {
  const { products, stores, updateProduct, addProduct, removeProduct } = useApp()
  const [editor, setEditor] = useState(null) // null | product | 'new'

  function handleSave(form) {
    if (editor === 'new') addProduct(form)
    else updateProduct(editor.id, form)
    setEditor(null)
  }

  return (
    <>
      <div className="admin-header">
        <h1>Listings</h1>
        <p>
          Every product on the marketplace. Add listings, edit descriptions and
          photos. Online prices are auto-set to {Math.round(MARKUP * 100)}% of
          the shop's in-person price.
        </p>
      </div>

      <div className="flex between center wrap" style={{ marginBottom: 16, gap: 12 }}>
        <span className="muted" style={{ fontSize: '0.88rem' }}>
          {products.length} listings
        </span>
        <button
          className="btn btn-primary btn-sm"
          onClick={() => setEditor('new')}
          disabled={stores.length === 0}
        >
          ＋ New listing
        </button>
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
              return (
                <tr key={p.id}>
                  <td>
                    <div className="flex center gap-8">
                      {p.image ? (
                        <img className="row-thumb" src={p.image} alt="" />
                      ) : (
                        <span style={{ fontSize: '1.3rem' }}>{p.emoji}</span>
                      )}
                      <span style={{ fontWeight: 600, maxWidth: 220 }}>{p.name}</span>
                    </div>
                  </td>
                  <td className="muted">
                    {store?.emoji} {store?.name}
                  </td>
                  <td>
                    <span className="badge badge-culture">{p.category}</span>
                  </td>
                  <td className="text-right">{money(p.inPersonPrice)}</td>
                  <td className="text-right" style={{ fontWeight: 700 }}>
                    {money(onlinePrice(p.inPersonPrice))}
                  </td>
                  <td className="text-right">
                    {p.stock <= 8 ? (
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
                  <td className="text-right">
                    <div className="flex gap-8" style={{ justifyContent: 'flex-end' }}>
                      <button className="btn btn-ghost btn-sm" onClick={() => setEditor(p)}>
                        Edit
                      </button>
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => {
                          if (confirm(`Delete listing "${p.name}"?`)) removeProduct(p.id)
                        }}
                        title="Delete listing"
                      >
                        🗑
                      </button>
                    </div>
                  </td>
                </tr>
              )
            })}
          </tbody>
        </table>
      </div>

      {editor && (
        <ListingEditor
          initial={editor === 'new' ? {} : editor}
          stores={stores}
          onSave={handleSave}
          onClose={() => setEditor(null)}
        />
      )}
    </>
  )
}
