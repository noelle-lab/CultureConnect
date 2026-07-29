import { Fragment, useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { orderTotals, money } from '../../data/analytics'

const STATUSES = ['paid', 'shipped', 'delivered']

export default function Orders() {
  const { orders, products, stores } = useApp()
  const [expanded, setExpanded] = useState(null)
  // Local status overrides for the demo (orders live in seed/context; we keep
  // a lightweight local map so the admin can move them along visually).
  const [statusMap, setStatusMap] = useState({})
  const [query, setQuery] = useState('')
  const [sort, setSort] = useState('date-desc')

  function statusOf(o) {
    return statusMap[o.id] ?? o.status
  }

  const visible = useMemo(() => {
    let list = orders.filter((o) => {
      if (!query) return true
      const hay = `${o.id} ${o.buyer} ${o.city}`.toLowerCase()
      return hay.includes(query.toLowerCase())
    })
    const grossOf = (o) => orderTotals(o, products).gross
    const unitsOf = (o) => orderTotals(o, products).units
    const cmp = {
      'date-desc': (a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0),
      'date-asc': (a, b) => (a.date > b.date ? 1 : a.date < b.date ? -1 : 0),
      'gross-desc': (a, b) => grossOf(b) - grossOf(a),
      'gross-asc': (a, b) => grossOf(a) - grossOf(b),
      'units-desc': (a, b) => unitsOf(b) - unitsOf(a),
      buyer: (a, b) => a.buyer.localeCompare(b.buyer),
    }[sort]
    return cmp ? [...list].sort(cmp) : list
  }, [orders, products, query, sort])
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

      <div className="flex between center wrap" style={{ marginBottom: 16, gap: 12 }}>
        <div className="flex center wrap" style={{ gap: 10 }}>
          <input
            className="input"
            placeholder="Search orders…"
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
            <option value="date-desc">Date: Newest first</option>
            <option value="date-asc">Date: Oldest first</option>
            <option value="gross-desc">Gross: High to Low</option>
            <option value="gross-asc">Gross: Low to High</option>
            <option value="units-desc">Units: High to Low</option>
            <option value="buyer">Buyer: A–Z</option>
          </select>
        </div>
        <span className="muted" style={{ fontSize: '0.88rem' }}>
          {visible.length} of {orders.length} orders
        </span>
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
            {visible.map((o) => {
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
                                  {l.product.name}{' '}
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
