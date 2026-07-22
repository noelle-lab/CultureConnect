import { Link } from 'react-router-dom'
import { useApp } from '../../context/AppContext'
import { aggregate, orderTotals, money } from '../../data/analytics'

export default function Dashboard() {
  const { orders, products, stores, cityRequests } = useApp()
  const totals = aggregate(orders, products)
  const activeShops = stores.filter((s) => s.status === 'active').length
  const pipelineShops = stores.filter((s) =>
    ['prospect', 'contacted', 'onboarding'].includes(s.status),
  ).length

  // Fake 6-month gross trend for the mini chart (last value = live gross).
  const trend = [4200, 5100, 6400, 7300, 8900, Math.round(totals.gross) + 9400]
  const maxTrend = Math.max(...trend)
  const months = ['Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul']

  const recent = orders.slice(0, 5)

  return (
    <>
      <div className="admin-header">
        <h1>Dashboard</h1>
        <p>The state of CultureConnect — sales, shops, and expansion at a glance.</p>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="label">Gross online sales</div>
          <div className="value">{money(totals.gross)}</div>
          <div className="delta up">▲ 22% vs last month</div>
        </div>
        <div className="kpi">
          <div className="label">Our commission (20%)</div>
          <div className="value">{money(totals.commission)}</div>
          <div className="delta up">▲ 22% vs last month</div>
        </div>
        <div className="kpi">
          <div className="label">Paid to shops</div>
          <div className="value">{money(totals.payout)}</div>
          <div className="delta">across {activeShops} active shops</div>
        </div>
        <div className="kpi">
          <div className="label">Active partner shops</div>
          <div className="value">{activeShops}</div>
          <div className="delta up">+{pipelineShops} in pipeline</div>
        </div>
      </div>

      <div className="admin-cols">
        <div className="panel">
          <div className="flex between center">
            <h3 style={{ margin: 0 }}>Gross sales trend</h3>
            <span className="muted" style={{ fontSize: '0.85rem' }}>
              Last 6 months
            </span>
          </div>
          <div className="bars">
            {trend.map((v, i) => (
              <div className="bar-col" key={i}>
                <div
                  className="bar"
                  style={{ height: `${(v / maxTrend) * 100}%` }}
                  title={money(v)}
                />
                <span>{months[i]}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="panel">
          <h3 style={{ marginTop: 0 }}>Expansion pipeline</h3>
          <p className="muted" style={{ fontSize: '0.88rem', marginTop: 0 }}>
            Top buyer-requested cities driving where we build next.
          </p>
          {[...cityRequests]
            .sort((a, b) => b.votes - a.votes)
            .slice(0, 4)
            .map((c) => (
              <div key={c.id} style={{ marginBottom: 12 }}>
                <div className="flex between" style={{ fontSize: '0.9rem' }}>
                  <span style={{ fontWeight: 600 }}>
                    {c.city}, {c.state}
                  </span>
                  <span className="muted">{c.votes} votes</span>
                </div>
                <div className="progress" style={{ marginTop: 4 }}>
                  <span style={{ width: `${Math.min(100, (c.votes / 220) * 100)}%` }} />
                </div>
              </div>
            ))}
          <Link to="/admin/city-requests" className="btn btn-ghost btn-sm btn-block" style={{ marginTop: 8 }}>
            Manage buildout →
          </Link>
        </div>
      </div>

      <div className="panel" style={{ marginTop: 20 }}>
        <div className="flex between center" style={{ marginBottom: 12 }}>
          <h3 style={{ margin: 0 }}>Recent orders</h3>
          <Link to="/admin/orders" className="btn btn-ghost btn-sm">
            View all orders →
          </Link>
        </div>
        <div className="table-wrap">
          <table className="data">
            <thead>
              <tr>
                <th>Order</th>
                <th>Date</th>
                <th>Ship to</th>
                <th>Items</th>
                <th className="text-right">Gross</th>
                <th className="text-right">Our cut</th>
                <th>Status</th>
              </tr>
            </thead>
            <tbody>
              {recent.map((o) => {
                const t = orderTotals(o, products)
                return (
                  <tr key={o.id}>
                    <td style={{ fontWeight: 600 }}>{o.id}</td>
                    <td className="muted">{o.date}</td>
                    <td>{o.city}</td>
                    <td>{t.units}</td>
                    <td className="text-right">{money(t.gross)}</td>
                    <td className="text-right" style={{ color: 'var(--jade)', fontWeight: 600 }}>
                      {money(t.commission)}
                    </td>
                    <td>
                      <span className={`status-pill status-${o.status}`}>
                        <span className="dot" />
                        {o.status}
                      </span>
                    </td>
                  </tr>
                )
              })}
            </tbody>
          </table>
        </div>
      </div>
    </>
  )
}
