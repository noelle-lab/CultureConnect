import { useState } from 'react'
import { useApp } from '../context/AppContext'

export default function RequestStore() {
  const { cityRequests, addCityRequest, voteCityRequest } = useApp()
  const [form, setForm] = useState({ city: '', state: '', note: '' })
  const [submitted, setSubmitted] = useState(false)
  const [voted, setVoted] = useState([])

  const ranked = [...cityRequests].sort((a, b) => b.votes - a.votes)

  function submit(e) {
    e.preventDefault()
    if (!form.city.trim()) return
    addCityRequest({
      city: form.city.trim(),
      state: form.state.trim().toUpperCase(),
      note: form.note.trim(),
    })
    setForm({ city: '', state: '', note: '' })
    setSubmitted(true)
    setTimeout(() => setSubmitted(false), 2600)
  }

  function handleVote(id) {
    if (voted.includes(id)) return
    voteCityRequest(id)
    setVoted((v) => [...v, id])
  }

  return (
    <div className="container section">
      <div className="section-head">
        <div>
          <div className="eyebrow-sm">Help us build the map</div>
          <h1 style={{ fontSize: '2.2rem' }}>Request a city</h1>
          <p style={{ maxWidth: '44em' }}>
            CultureConnect grows city by city. Tell us where you want authentic
            cultural shops next - every request helps our team prioritize where
            to build. The most-requested cities move to the front of the line.
          </p>
        </div>
      </div>

      <div className="detail-grid" style={{ gridTemplateColumns: '1fr 1.3fr' }}>
        {/* Form */}
        <form className="panel" onSubmit={submit} style={{ alignSelf: 'start' }}>
          <h3 style={{ marginTop: 0 }}>📍 Request your city</h3>
          {submitted && (
            <div className="notice">
              Thanks! Your city has been added to the board below.
            </div>
          )}
          <div className="grid-2">
            <div className="field">
              <label>City</label>
              <input
                className="input"
                value={form.city}
                onChange={(e) => setForm({ ...form, city: e.target.value })}
                placeholder="e.g. Minneapolis"
                required
              />
            </div>
            <div className="field">
              <label>State</label>
              <input
                className="input"
                value={form.state}
                onChange={(e) => setForm({ ...form, state: e.target.value })}
                placeholder="MN"
                maxLength={2}
              />
            </div>
          </div>
          <div className="field">
            <label>What would you want to find there? (optional)</label>
            <textarea
              className="textarea"
              value={form.note}
              onChange={(e) => setForm({ ...form, note: e.target.value })}
              placeholder="Tell us about the communities and goods you'd love to see."
            />
          </div>
          <button className="btn btn-primary btn-block" type="submit">
            Submit request
          </button>
        </form>

        {/* Board */}
        <div>
          <div className="flex between center" style={{ marginBottom: 12 }}>
            <h3 style={{ margin: 0 }}>🔥 Most-requested cities</h3>
            <span className="muted" style={{ fontSize: '0.85rem' }}>
              {ranked.length} cities requested
            </span>
          </div>
          {ranked.map((c) => (
            <div
              key={c.id}
              className="panel"
              style={{ marginBottom: 12, padding: '16px 18px' }}
            >
              <div className="flex between center">
                <div>
                  <strong style={{ fontSize: '1.05rem' }}>
                    {c.city}
                    {c.state ? `, ${c.state}` : ''}
                  </strong>
                  <span
                    className={`status-pill status-${c.status}`}
                    style={{ marginLeft: 10 }}
                  >
                    <span className="dot" />
                    {c.status}
                  </span>
                  {c.note && (
                    <p className="muted" style={{ margin: '6px 0 0', fontSize: '0.88rem' }}>
                      “{c.note}”
                    </p>
                  )}
                </div>
                <button
                  className={`btn btn-sm ${voted.includes(c.id) ? 'btn-ghost' : 'btn-primary'}`}
                  onClick={() => handleVote(c.id)}
                  disabled={voted.includes(c.id)}
                  style={{ flexShrink: 0 }}
                >
                  ▲ {c.votes}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}
