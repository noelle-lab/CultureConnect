import { Fragment, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { orderTotals, money } from '../../data/analytics'

const STATUSES = ['paid', 'shipped', 'delivered']

export default function Orders() {
  const { orders, products, stores } = useApp()
  const [expanded, setExpanded] = useState(null)
  // Local status overrides for the demo (orders live in seed/context; we keep
  // a lightweight local map so the admin can move them along visually).
  const [statusMap, setStatusMap] = useState({})

  function statusOf(o) {
    return statusMap[o.id] ?? o.status
  }
  function cycle(o) {
    const cur = statusOf(o)
    const idx = STATUSES.indexOf(cur)
    const next = STATUSES[Math.min(idx + 1, STATUSES.length - 1)]
    setStatusMap((m) => ({ ...m, [o.id]: next }))
  }

  return (
    <>
      <div className="admin-header">
        <h1>Orders</h1>
        <p>Every online order, with the commission split and fulfillment status.</p>
      </div>

      <div className="table-wrap">
        <table className="data">
          <thead>
            <tr>
              <th>Order</th>
              <th>Date</th>
              <th>Buyer</th>
              <th>Ship to</th>
              <th className="text-right">Units</th>
              <th className="text-right">Gross</th>
              <th className="text-right">Our cut</th>
              <th className="text-right">Shop payout</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {orders.map((o) => {
              const t = orderTotals(o, products)
              const st = statusOf(o)
              const isOpen = expanded === o.id
              return (
                <Fragment key={o.id}>
                  <tr
                    onClick={() => setExpanded(isOpen ? null : o.id)}
                    style={{ cursor: 'pointer' }}
                  >
                    <td style={{ fontWeight: 600 }}>
                      {isOpen ? '▾' : '▸'} {o.id}
                    </td>
                    <td className="muted">{o.date}</td>
                    <td>{o.buyer}</td>
                    <td>{o.city}</td>
                    <td className="text-right">{t.units}</td>
                    <td className="text-right">{money(t.gross)}</td>
                    <td className="text-right" style={{ color: 'var(--jade)', fontWeight: 600 }}>
                      {money(t.commission)}
                    </td>
                    <td className="text-right">{money(t.payout)}</td>
                    <td onClick={(e) => e.stopPropagation()}>
                      <button
                        className={`status-pill status-${st}`}
                        style={{ border: 'none', cursor: 'pointer' }}
                        onClick={() => cycle(o)}
                        title="Click to advance status"
                      >
                        <span className="dot" />
                        {st}
                      </button>
                    </td>
                  </tr>
                  {isOpen && (
                    <tr>
                      <td colSpan={9} style={{ background: '#fdfbf6' }}>
                        <div style={{ padding: '4px 8px' }}>
                          <strong style={{ fontSize: '0.85rem' }}>Line items</strong>
                          {t.lines.map((l) => {
                            const store = stores.find((s) => s.id === l.product.storeId)
                            return (
                              <div
                                key={l.productId}
                                className="flex between center"
                                style={{ padding: '6px 0', fontSize: '0.88rem' }}
                              >
                                <span>
                                  {l.product.emoji} {l.product.name}{' '}
                                  <span className="muted">
                                    · {store?.name} × {l.qty}
                                  </span>
                                </span>
                                <span style={{ fontWeight: 600 }}>{money(l.lineTotal)}</span>
                              </div>
                            )
                          })}
                        </div>
                      </td>
                    </tr>
                  )}
                </Fragment>
              )
            })}
          </tbody>
        </table>
      </div>
    </>
  )
}
