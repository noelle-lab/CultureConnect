import { Link } from 'react-router-dom'
import { useApp, SERVICE_LABEL } from '../../context/AppContext'

// The triage board for inbound partner-shop applications (submitted from the
// public "For Businesses" page). A request comes in as `new`; the team reviews
// it, moves promising shops to `research` — which also seeds a prospect on the
// Shop Discovery pipeline — and finally marks each one `approved` or `declined`.
const BOARD = ['new', 'research', 'approved', 'declined']
const STAGE_LABEL = {
  new: 'New requests',
  research: 'In research',
  approved: 'Approved',
  declined: 'Declined',
}
const STAGE_BLURB = {
  new: 'Just came in — needs a first look.',
  research: 'Being vetted on the discovery pipeline.',
  approved: 'Cleared to onboard as a partner.',
  declined: 'Not a fit right now.',
}

export default function PartnerRequests() {
  const {
    partnerRequests,
    movePartnerRequestToResearch,
    setPartnerRequestStatus,
  } = useApp()

  const byStage = (stage) =>
    partnerRequests.filter((r) => (r.status || 'new') === stage)

  return (
    <>
      <div className="admin-header">
        <h1>Partner Requests</h1>
        <p>
          Shops that applied to join CultureConnect from the{' '}
          <Link to="/services" style={{ color: 'var(--clay)', fontWeight: 600 }}>
            For Businesses
          </Link>{' '}
          page. Triage each one and move the promising shops into research —
          they'll show up on the{' '}
          <Link
            to="/admin/discovery"
            style={{ color: 'var(--clay)', fontWeight: 600 }}
          >
            Shop Discovery
          </Link>{' '}
          pipeline as a fresh prospect.
        </p>
      </div>

      <div className="kpi-grid">
        {BOARD.map((stage) => (
          <div className="kpi" key={stage}>
            <div className="label">{STAGE_LABEL[stage]}</div>
            <div className="value">{byStage(stage).length}</div>
            <div className="delta">requests</div>
          </div>
        ))}
      </div>

      {/* Kanban board */}
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(4, minmax(240px, 1fr))',
          gap: 16,
          overflowX: 'auto',
          marginTop: 20,
        }}
      >
        {BOARD.map((stage) => (
          <div key={stage}>
            <div
              className="flex between center"
              style={{ marginBottom: 4, padding: '0 2px' }}
            >
              <strong style={{ fontSize: '0.92rem' }}>
                {STAGE_LABEL[stage]}
              </strong>
              <span className={`status-pill status-${stage}`}>
                {byStage(stage).length}
              </span>
            </div>
            <p
              className="muted"
              style={{ fontSize: '0.75rem', margin: '0 2px 10px' }}
            >
              {STAGE_BLURB[stage]}
            </p>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
              {byStage(stage).map((r) => (
                <div key={r.id} className="panel" style={{ padding: 14 }}>
                  <div style={{ fontWeight: 700, fontSize: '0.94rem' }}>
                    {r.shop}
                  </div>
                  <div className="muted" style={{ fontSize: '0.78rem' }}>
                    {[r.heritage, r.city].filter(Boolean).join(' · ') || '—'}
                  </div>
                  <div
                    className="muted"
                    style={{ fontSize: '0.78rem', marginTop: 2 }}
                  >
                    {r.contact ? `${r.contact} · ` : ''}
                    <a
                      href={`mailto:${r.email}`}
                      style={{ color: 'var(--clay)', fontWeight: 600 }}
                    >
                      {r.email}
                    </a>
                  </div>
                  {r.service && (
                    <div style={{ marginTop: 8 }}>
                      <span className="tag">{SERVICE_LABEL[r.service] ?? r.service}</span>
                    </div>
                  )}
                  {r.message && (
                    <p
                      className="muted"
                      style={{ fontSize: '0.8rem', margin: '8px 0 0' }}
                    >
                      {r.message.length > 120
                        ? `${r.message.slice(0, 120)}…`
                        : r.message}
                    </p>
                  )}
                  <div
                    className="muted"
                    style={{ fontSize: '0.72rem', marginTop: 8 }}
                  >
                    Applied {r.date}
                  </div>

                  {/* Stage actions */}
                  <div
                    className="flex gap-8 wrap"
                    style={{ marginTop: 12 }}
                  >
                    {stage === 'new' && (
                      <>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => movePartnerRequestToResearch(r.id)}
                        >
                          Move to research →
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setPartnerRequestStatus(r.id, 'declined')}
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {stage === 'research' && (
                      <>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setPartnerRequestStatus(r.id, 'new')}
                          title="Move back to new"
                        >
                          ←
                        </button>
                        <button
                          className="btn btn-primary btn-sm"
                          style={{ flex: 1 }}
                          onClick={() => setPartnerRequestStatus(r.id, 'approved')}
                        >
                          Approve partner ✓
                        </button>
                        <button
                          className="btn btn-ghost btn-sm"
                          onClick={() => setPartnerRequestStatus(r.id, 'declined')}
                        >
                          Decline
                        </button>
                      </>
                    )}
                    {stage === 'approved' && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setPartnerRequestStatus(r.id, 'research')}
                      >
                        ← Back to research
                      </button>
                    )}
                    {stage === 'declined' && (
                      <button
                        className="btn btn-ghost btn-sm"
                        onClick={() => setPartnerRequestStatus(r.id, 'new')}
                      >
                        ↺ Reopen
                      </button>
                    )}
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
