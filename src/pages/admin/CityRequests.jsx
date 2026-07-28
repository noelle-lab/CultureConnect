import { useApp } from '../../context/AppContext'

const FLOW = ['requested', 'researching', 'planned', 'launched']
const NEXT_LABEL = {
  requested: 'Start research',
  researching: 'Mark planned',
  planned: 'Launch city',
  launched: 'Launched ✓',
}

// Admin view of the city buildout - buyer requests drive expansion planning.
export default function CityRequestsAdmin() {
  const { cityRequests, setCityRequestStatus } = useApp()
  const ranked = [...cityRequests].sort((a, b) => b.votes - a.votes)

  const counts = FLOW.reduce((acc, f) => {
    acc[f] = cityRequests.filter((c) => c.status === f).length
    return acc
  }, {})

  function advance(c) {
    const idx = FLOW.indexOf(c.status)
    if (idx < FLOW.length - 1) setCityRequestStatus(c.id, FLOW[idx + 1])
  }

  return (
    <>
      <div className="admin-header">
        <h1>City Buildout</h1>
        <p>
          Buyer-submitted city requests, ranked by demand - the roadmap for where
          CultureConnect expands next.
        </p>
      </div>

      <div className="kpi-grid">
        {FLOW.map((f) => (
          <div className="kpi" key={f}>
            <div className="label" style={{ textTransform: 'capitalize' }}>
              {f}
            </div>
            <div className="value">{counts[f]}</div>
            <div className="delta">cities</div>
          </div>
        ))}
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Rank</th>
              <th>City</th>
              <th className="text-right">Demand</th>
              <th>Buyer note</th>
              <th>Requested</th>
              <th>Stage</th>
              <th></th>
            </tr>
          </thead>
          <tbody>
            {ranked.map((c, i) => (
              <tr key={c.id}>
                <td style={{ fontWeight: 700 }}>#{i + 1}</td>
                <td>
                  <div style={{ fontWeight: 600 }}>
                    {c.city}
                    {c.state ? `, ${c.state}` : ''}
                  </div>
                </td>
                <td className="text-right">
                  <div style={{ fontWeight: 700 }}>{c.votes}</div>
                  <div className="progress" style={{ marginTop: 4, width: 90, marginLeft: 'auto' }}>
                    <span style={{ width: `${Math.min(100, (c.votes / 220) * 100)}%` }} />
                  </div>
                </td>
                <td className="muted" style={{ maxWidth: 260, fontSize: '0.85rem' }}>
                  {c.note ? `“${c.note}”` : '-'}
                </td>
                <td className="muted">{c.date}</td>
                <td>
                  <span className={`status-pill status-${c.status}`}>
                    <span className="dot" />
                    {c.status}
                  </span>
                </td>
                <td>
                  <button
                    className="btn btn-ghost btn-sm"
                    onClick={() => advance(c)}
                    disabled={c.status === 'launched'}
                  >
                    {NEXT_LABEL[c.status]}
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </>
  )
}
