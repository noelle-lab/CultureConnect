import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { useFormDraft } from '../../lib/useFormDraft'
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
  // Auto-save the in-progress listing so an admin doesn't lose a half-entered
  // product to an accidental close, backdrop click, or refresh. A new listing
  // and each existing product get their own draft slot.
  const { form, setForm, draftRestored, clearDraft, resetDraft } = useFormDraft(
    `listing.${initial?.id || 'new'}`,
    {
      storeId: stores[0]?.id || '',
      name: '',
      category: CATEGORIES[0],
      inPersonPrice: '',
      stock: '',
      description: '',
      image: '',
      crosslisted: [],
      ...initial,
    },
  )
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim() || !form.storeId) return
    clearDraft() // saved for real now — drop the in-progress draft
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

        {draftRestored && (
          <div className="draft-note">
            <span>
              <strong>Restored your unsaved progress.</strong> Pick up where you
              left off, or start over.
            </span>
            <button
              type="button"
              className="btn btn-ghost btn-sm"
              onClick={resetDraft}
            >
              Start fresh
            </button>
          </div>
        )}

        <div className="field">
          <label>Business *</label>
          <select className="select" value={form.storeId} onChange={set('storeId')} required>
            {stores.map((s) => (
              <option key={s.id} value={s.id}>
                {s.name}
              </option>
            ))}
          </select>
        </div>

        <div className="field">
          <label>Product name *</label>
          <input className="input" value={form.name} onChange={set('name')} required />
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

        <p className="muted" style={{ fontSize: '0.8rem', marginTop: 4 }}>
          Cross-listing to Etsy &amp; eBay is now managed by each shop from their
          owner portal.
        </p>

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
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('name')

  const storeName = (id) => stores.find((s) => s.id === id)?.name || ''

  const visible = useMemo(() => {
    let list = products.filter((p) => {
      if (!query) return true
      const hay = `${p.name} ${p.category} ${storeName(p.storeId)}`.toLowerCase()
      return hay.includes(query.toLowerCase())
    })
    const cmp = {
      name: (a, b) => a.name.localeCompare(b.name),
      'name-desc': (a, b) => b.name.localeCompare(a.name),
      'price-asc': (a, b) => a.inPersonPrice - b.inPersonPrice,
      'price-desc': (a, b) => b.inPersonPrice - a.inPersonPrice,
      'stock-desc': (a, b) => b.stock - a.stock,
      'stock-asc': (a, b) => a.stock - b.stock,
      shop: (a, b) => storeName(a.storeId).localeCompare(storeName(b.storeId)),
    }[sort]
    return cmp ? [...list].sort(cmp) : list
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [products, stores, query, sort])

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
        <div className="flex center wrap" style={{ gap: 10 }}>
          <input
            className="input"
            placeholder="Search listings…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            style={{ width: 220 }}
          />
          <select
            className="select"
            style={{ width: 'auto' }}
            value={sort}
            onChange={(e) => setSort(e.target.value)}
          >
            <option value="name">Name: A–Z</option>
            <option value="name-desc">Name: Z–A</option>
            <option value="price-asc">Price: Low to High</option>
            <option value="price-desc">Price: High to Low</option>
            <option value="stock-desc">Stock: High to Low</option>
            <option value="stock-asc">Stock: Low to High</option>
            <option value="shop">Shop: A–Z</option>
          </select>
          <span className="muted" style={{ fontSize: '0.88rem' }}>
            {visible.length} of {products.length}
          </span>
        </div>
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
            {visible.map((p) => {
              const store = stores.find((s) => s.id === p.storeId)
              return (
                <tr key={p.id}>
                  <td>
                    <div className="flex center gap-8">
                      {p.image ? (
                        <img className="row-thumb" src={p.image} alt="" />
                      ) : (
                        <span className="row-thumb row-thumb-fallback">
                          {p.name?.charAt(0) || '?'}
                        </span>
                      )}
                      <span style={{ fontWeight: 600, maxWidth: 220 }}>{p.name}</span>
                    </div>
                  </td>
                  <td className="muted">{store?.name}</td>
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
                        Delete
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
