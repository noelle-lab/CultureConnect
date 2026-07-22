import { useMemo, useState } from 'react'
import { useApp } from '../../context/AppContext'
import { COMMISSION_RATE, MARKUP, onlinePrice } from '../../data/mockData'
import { aggregate, orderTotals, money } from '../../data/analytics'

export default function Finance() {
  const { orders, products, stores } = useApp()
  const totals = aggregate(orders, products)

  // --- Per-shop payout ledger --------------------------------------------
  const ledger = useMemo(() => {
    const map = {}
    orders.forEach((o) => {
      orderTotals(o, products).lines.forEach((l) => {
        const sid = l.product.storeId
        if (!map[sid]) map[sid] = { gross: 0, commission: 0, payout: 0, units: 0 }
        const g = l.lineTotal
        map[sid].gross += g
        map[sid].commission += g * COMMISSION_RATE
        map[sid].payout += g * (1 - COMMISSION_RATE)
        map[sid].units += l.qty
      })
    })
    return Object.entries(map)
      .map(([sid, v]) => ({
        store: stores.find((s) => s.id === sid),
        ...v,
      }))
      .filter((r) => r.store)
      .sort((a, b) => b.gross - a.gross)
  }, [orders, products, stores])

  // --- Pricing calculator -------------------------------------------------
  const [inStore, setInStore] = useState(100)
  const online = onlinePrice(Number(inStore) || 0)
  const cut = Math.round(online * COMMISSION_RATE * 100) / 100
  const keep = Math.round((online - cut) * 100) / 100

  return (
    <>
      <div className="admin-header">
        <h1>Finance &amp; Payouts</h1>
        <p>
          The engine behind our model: we take a {Math.round(COMMISSION_RATE * 100)}%
          commission on every online sale and pay shops the rest.
        </p>
      </div>

      <div className="kpi-grid">
        <div className="kpi">
          <div className="label">Gross online sales</div>
          <div className="value">{money(totals.gross)}</div>
          <div className="delta">all orders to date</div>
        </div>
        <div className="kpi">
          <div className="label">CultureConnect revenue</div>
          <div className="value" style={{ color: 'var(--jade)' }}>
            {money(totals.commission)}
          </div>
          <div className="delta up">{Math.round(COMMISSION_RATE * 100)}% commission</div>
        </div>
        <div className="kpi">
          <div className="label">Owed to shops</div>
          <div className="value">{money(totals.payout)}</div>
          <div className="delta">{Math.round((1 - COMMISSION_RATE) * 100)}% of sales</div>
        </div>
        <div className="kpi">
          <div className="label">Units sold</div>
          <div className="value">{totals.units}</div>
          <div className="delta">across {ledger.length} shops</div>
        </div>
      </div>

      <div className="admin-cols">
        {/* Payout ledger */}
        <div className="panel">
          <div className="flex between center" style={{ marginBottom: 8 }}>
            <h3 style={{ margin: 0 }}>Shop payout ledger</h3>
            <button
              className="btn btn-ghost btn-sm"
              onClick={() => alert('Demo: payouts marked as sent. In production this would trigger ACH transfers to each shop.')}
            >
              💸 Run payouts
            </button>
          </div>
          <div className="table-wrap">
            <table className="data">
              <thead>
                <tr>
                  <th>Shop</th>
                  <th className="text-right">Units</th>
                  <th className="text-right">Gross</th>
                  <th className="text-right">Our 20%</th>
                  <th className="text-right">Payout</th>
                </tr>
              </thead>
              <tbody>
                {ledger.map((r) => (
                  <tr key={r.store.id}>
                    <td>
                      <div className="flex center gap-8">
                        <span style={{ fontSize: '1.2rem' }}>{r.store.emoji}</span>
                        <span style={{ fontWeight: 600 }}>{r.store.name}</span>
                      </div>
                    </td>
                    <td className="text-right">{r.units}</td>
                    <td className="text-right">{money(r.gross)}</td>
                    <td className="text-right" style={{ color: 'var(--jade)', fontWeight: 600 }}>
                      {money(r.commission)}
                    </td>
                    <td className="text-right" style={{ fontWeight: 700 }}>
                      {money(r.payout)}
                    </td>
                  </tr>
                ))}
                {ledger.length === 0 && (
                  <tr>
                    <td colSpan={5} className="muted" style={{ textAlign: 'center', padding: 24 }}>
                      No sales yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Pricing calculator */}
        <div className="panel" style={{ alignSelf: 'start' }}>
          <h3 style={{ marginTop: 0 }}>Pricing calculator</h3>
          <p className="muted" style={{ fontSize: '0.88rem', marginTop: 0 }}>
            Shops list at {Math.round(MARKUP * 100)}% of their in-store price so
            our commission is covered and they keep ~
            {Math.round((MARKUP * (1 - COMMISSION_RATE)) * 100)}% of their
            in-store value.
          </p>
          <div className="field">
            <label>In-store price</label>
            <input
              className="input"
              type="number"
              step="1"
              value={inStore}
              onChange={(e) => setInStore(e.target.value)}
            />
          </div>
          <div className="calc-row">
            <span>Online price ({Math.round(MARKUP * 100)}%)</span>
            <span style={{ fontWeight: 600 }}>{money(online)}</span>
          </div>
          <div className="calc-row">
            <span>CultureConnect ({Math.round(COMMISSION_RATE * 100)}%)</span>
            <span className="neg">− {money(cut)}</span>
          </div>
          <div className="calc-row total">
            <span>Shop keeps</span>
            <span className="pos">{money(keep)}</span>
          </div>
          <div
            className="notice"
            style={{ marginTop: 14, marginBottom: 0 }}
          >
            Shop nets {money(keep)} vs. {money(Number(inStore) || 0)} in-store —
            that's{' '}
            {inStore > 0 ? Math.round((keep / Number(inStore)) * 100) : 0}% of the
            original price, with zero marketing effort.
          </div>
        </div>
      </div>
    </>
  )
}
