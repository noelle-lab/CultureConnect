import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'

const PIPELINE = ['prospect', 'contacted', 'onboarding', 'active']
const STAGE_LABEL = {
  prospect: 'Prospect',
  contacted: 'Contacted',
  onboarding: 'Onboarding',
  active: 'Active',
}

// Shop discovery + research board. Admins log and organize minority-owned
// shops they find (starting in NYC), and move them through the pipeline.
export default function Discovery() {
  const { stores, addStore, updateStore } = useApp()
  const [cityFilter, setCityFilter] = useState('all')
  const [adding, setAdding] = useState(false)
  const [form, setForm] = useState({
    name: '',
    owner: '',
    heritage: '',
    city: 'New York City',
    neighborhood: '',
    story: '',
    emoji: '🏬',
  })

  const cities = useMemo(
    () => ['all', ...new Set(stores.map((s) => s.city))],
    [stores],
  )

  const visible = stores.filter(
    (s) => cityFilter === 'all' || s.city === cityFilter,
  )

  const byStage = (stage) => visible.filter((s) => s.status === stage)

  function advance(store) {
    const idx = PIPELINE.indexOf(store.status)
    if (idx < PIPELINE.length - 1) {
      updateStore(store.id, { status: PIPELINE[idx + 1] })
    }
  }
  function regress(store) {
    const idx = PIPELINE.indexOf(store.status)
    if (idx > 0) updateStore(store.id, { status: PIPELINE[idx - 1] })
  }

  function submit(e) {
    e.preventDefault()
    if (!form.name.trim()) return
    addStore({ ...form, status: 'prospect', services: [], rating: null })
    setForm({
      name: '',
      owner: '',
      heritage: '',
      city: 'New York City',
      neighborhood: '',
      story: '',
      emoji: '🏬',
    })
    setAdding(false)
  }

  return (
    <>
      <div className="admin-header">
        <h1>Shop Discovery</h1>
        <p>
          Research, log, and organize minority-owned family shops - then move them
          through the onboarding pipeline. Starting in NYC, expanding to SF &amp; DC.
        </p>
      </div>

      <div className="flex between center wrap" style={{ marginBottom: 18, gap: 12 }}>
        <div className="flex gap-8 center">
          <label className="muted" style={{ fontSize: '0.85rem', fontWeight: 600 }}>
            City
          </label>
          <select
            className="select"
            style={{ width: 'auto' }}
            value={cityFilter}
            onChange={(e) => setCityFilter(e.target.value)}
          >
            {cities.map((c) => (
              <option key={c} value={c}>
                {c === 'all' ? 'All cities' : c}
              </option>
            ))}
          </select>
        </div>
        <button className="btn btn-primary btn-sm" onClick={() => setAdding((a) => !a)}>
          {adding ? 'Cancel' : '+ Log a new shop'}
        </button>
      </div>

      {adding && (
        <form className="panel" onSubmit={submit} style={{ marginBottom: 20 }}>
          <h3 style={{ marginTop: 0 }}>Log a prospective shop</h3>
          <div className="grid-2">
            <div className="field">
              <label>Shop name</label>
              <input
                className="input"
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </div>
            <div className="field">
              <label>Owner / family</label>
              <input
                className="input"
                value={form.owner}
                onChange={(e) => setForm({ ...form, owner: e.target.value })}
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
                onChange={(e) => setForm({ ...form, heritage: e.target.value })}
                placeholder="e.g. Ethiopian"
              />
            </div>
            <div className="field">
              <label>Emoji</label>
              <input
                className="input"
                value={form.emoji}
                onChange={(e) => setForm({ ...form, emoji: e.target.value })}
                maxLength={4}
              />
            </div>
          </div>
          <div className="grid-2">
            <div className="field">
              <label>City</label>
              <input
                className="input"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
              />
            </div>
            <div className="field">
              <label>Neighborhood</label>
              <input
                className="input"
                value={form.neighborhood}
                onChange={(e) => setForm({ ...form, neighborhood: e.target.value })}
                placeholder="e.g. Flushing, Queens"
              />
            </div>
          </div>
          <div className="field">
            <label>Research notes</label>
            <textarea
              className="textarea"
              value={form.story}
              onChange={(e) => setForm({ ...form, story: e.target.value })}
              placeholder="What they sell, why they'd be a great fit, contact info…"
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Add to pipeline
          </button>
        </form>
      )}

      {/* Kanban pipeline */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(220px, 1fr))',
          gap: 16,
          overflowX: 'auto',
        }}
      >
        {PIPELINE.map((stage) => (
          <div key={stage}>
            <div
              className="flex between center"
              style={{ marginBottom: 10, padding: '0 2px' }}
            >
              <strong style={{ fontSize: '0.92rem' }}>{STAGE_LABEL[stage]}</strong>
              <span className={`status-pill status-${stage}`}>
                {byStage(stage).length}
              </span>
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {byStage(stage).map((s) => (
                <div
                  key={s.id}
                  className="panel"
                  style={{ padding: 14 }}
                >
                  <div style={{ fontSize: '1.4rem' }}>{s.emoji}</div>
                  <div style={{ fontWeight: 700, fontSize: '0.94rem' }}>{s.name}</div>
                  <div className="muted" style={{ fontSize: '0.78rem' }}>
                    {s.heritage || '-'} · {s.neighborhood || s.city}
                  </div>
                  {s.story && (
                    <p
                      className="muted"
                      style={{ fontSize: '0.8rem', margin: '8px 0 0' }}
                    >
                      {s.story.length > 90 ? s.story.slice(0, 90) + '…' : s.story}
                    </p>
                  )}
                  <div className="flex gap-8" style={{ marginTop: 10 }}>
                    <button
                      className="btn btn-ghost btn-sm"
                      onClick={() => regress(s)}
                      disabled={stage === 'prospect'}
                      title="Move back"
                    >
                      ←
                    </button>
                    <button
                      className="btn btn-primary btn-sm"
                      style={{ flex: 1 }}
                      onClick={() => advance(s)}
                      disabled={stage === 'active'}
                    >
                      {stage === 'active' ? 'Onboarded ✓' : 'Advance →'}
                    </button>
                  </div>
                </div>
              ))}
              {byStage(stage).length === 0 && (
                <div
                  className="muted"
                  style={{
                    fontSize: '0.82rem',
                    textAlign: 'center',
                    padding: '18px 8px',
                    border: '1px dashed var(--line)',
                    borderRadius: 10,
                  }}
                >
                  Empty
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </>
  )
}
