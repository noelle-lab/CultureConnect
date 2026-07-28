import { useState } from 'react'
import { useApp } from '../../context/AppContext'
import ImageInput from '../../components/ImageInput'

const STATUS_OPTIONS = ['prospect', 'contacted', 'onboarding', 'active']

const BLANK = {
  name: '',
  owner: '',
  heritage: '',
  city: 'New York City',
  neighborhood: '',
  address: '',
  hours: '',
  founded: '',
  emoji: '🏬',
  story: '',
  longStory: '',
  image: '',
  rating: '',
  status: 'prospect',
}

// Modal editor used for both creating a new business and editing an existing
// one — including its short + full bio and its storefront photo.
function BusinessEditor({ initial, onSave, onClose }) {
  const [form, setForm] = useState({ ...BLANK, ...initial })
  const set = (k) => (e) =>
    setForm({ ...form, [k]: e?.target ? e.target.value : e })
  const isNew = !initial?.id

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    onSave({
      ...form,
      founded: form.founded ? Number(form.founded) : null,
      rating: form.rating ? Number(form.rating) : null,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form
        className="modal modal-wide"
        onClick={(e) => e.stopPropagation()}
        onSubmit={submit}
      >
        <button
          type="button"
          className="modal-close"
          onClick={onClose}
          aria-label="Close"
        >
          ✕
        </button>
        <h2 style={{ fontSize: '1.4rem', marginTop: 0, marginBottom: 16 }}>
          {isNew ? 'New business' : `Edit ${initial.name}`}
        </h2>

        <div className="grid-2">
          <div className="field">
            <label>Business name *</label>
            <input className="input" value={form.name} onChange={set('name')} required />
          </div>
          <div className="field">
            <label>Owner / family</label>
            <input
              className="input"
              value={form.owner}
              onChange={set('owner')}
              placeholder="The ___ Family"
            />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Heritage / culture</label>
            <input
              className="input"
              value={form.heritage}
              onChange={set('heritage')}
              placeholder="e.g. Ethiopian"
            />
          </div>
          <div className="field">
            <label>Emoji</label>
            <input className="input" value={form.emoji} onChange={set('emoji')} maxLength={4} />
          </div>
        </div>

        <div className="grid-2">
          <div className="field">
            <label>City</label>
            <input className="input" value={form.city} onChange={set('city')} />
          </div>
          <div className="field">
            <label>Neighborhood</label>
            <input
              className="input"
              value={form.neighborhood}
              onChange={set('neighborhood')}
              placeholder="e.g. Flushing, Queens"
            />
          </div>
        </div>

        <div className="field">
          <label>Address</label>
          <input className="input" value={form.address} onChange={set('address')} />
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Hours</label>
            <input
              className="input"
              value={form.hours}
              onChange={set('hours')}
              placeholder="Mon–Sat 9am–7pm"
            />
          </div>
          <div className="field">
            <label>Founded (year)</label>
            <input
              className="input"
              type="number"
              value={form.founded ?? ''}
              onChange={set('founded')}
              placeholder="2011"
            />
          </div>
        </div>

        <ImageInput
          label="Storefront photo"
          aspect="16/9"
          value={form.image}
          onChange={(v) => setForm({ ...form, image: v })}
        />

        <div className="field">
          <label>Short bio (one-liner shown on cards)</label>
          <textarea
            className="textarea"
            value={form.story}
            onChange={set('story')}
            placeholder="A three-generation grocery specializing in…"
          />
        </div>

        <div className="field">
          <label>Full bio / story (shown on the shop page)</label>
          <textarea
            className="textarea"
            style={{ minHeight: 120 }}
            value={form.longStory}
            onChange={set('longStory')}
            placeholder="The fuller story of the family and the business…"
          />
        </div>

        <div className="grid-2">
          <div className="field">
            <label>Pipeline status</label>
            <select className="select" value={form.status} onChange={set('status')}>
              {STATUS_OPTIONS.map((o) => (
                <option key={o} value={o}>
                  {o}
                </option>
              ))}
            </select>
          </div>
          <div className="field">
            <label>Rating (optional)</label>
            <input
              className="input"
              type="number"
              step="0.1"
              min="0"
              max="5"
              value={form.rating ?? ''}
              onChange={set('rating')}
              placeholder="4.8"
            />
          </div>
        </div>

        <div className="flex gap-8" style={{ marginTop: 8 }}>
          <button className="btn btn-primary" type="submit">
            {isNew ? 'Create business' : 'Save changes'}
          </button>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

export default function Stores() {
  const { draftStores: stores, draftProducts: products, updateStore, addStore } = useApp()
  const [editor, setEditor] = useState(null) // null | { store } | 'new'

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

  function handleSave(form) {
    if (editor === 'new') addStore(form)
    else updateStore(editor.id, form)
    setEditor(null)
  }

  return (
    <>
      <div className="admin-header">
        <h1>Partner Shops</h1>
        <p>
          Manage every shop on the platform - create new businesses, edit their
          bios and photos, set status and services.
        </p>
      </div>

      <div className="flex between center wrap" style={{ marginBottom: 16, gap: 12 }}>
        <span className="muted" style={{ fontSize: '0.88rem' }}>
          {stores.length} businesses
        </span>
        <button className="btn btn-primary btn-sm" onClick={() => setEditor('new')}>
          ＋ New business
        </button>
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
              <th></th>
            </tr>
          </thead>
          <tbody>
            {stores.map((s) => (
              <tr key={s.id}>
                <td>
                  <div className="flex center gap-8">
                    {s.image ? (
                      <img className="row-thumb" src={s.image} alt="" />
                    ) : (
                      <span style={{ fontSize: '1.4rem' }}>{s.emoji}</span>
                    )}
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
                <td className="text-right">
                  <button className="btn btn-ghost btn-sm" onClick={() => setEditor(s)}>
                    Edit
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {editor && (
        <BusinessEditor
          initial={editor === 'new' ? {} : editor}
          onSave={handleSave}
          onClose={() => setEditor(null)}
        />
      )}
    </>
  )
}
