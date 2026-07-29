import { useMemo, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import {
  onlinePrice,
  commission,
  shopPayout,
  COMMISSION_RATE,
  MARKUP,
} from '../data/mockData'
import { money } from '../data/analytics'
import {
  etsyFees,
  ebayFees,
  channelDetailsFor,
  enabledChannels,
  ETSY_WHO_MADE,
  ETSY_WHAT_IS_IT,
  ETSY_WHEN_MADE,
  EBAY_CONDITIONS,
  EBAY_RETURNS,
} from '../lib/platformFees'

// ---------------------------------------------------------------------------
// Shared: a fee breakdown (item price → each fee → what you keep)
// ---------------------------------------------------------------------------
function FeeBreakdown({ result, netLabel = 'You keep', netNote }) {
  return (
    <div className="fee-list">
      <div className="calc-row">
        <span>Item price (synced)</span>
        <span>{money(result.price)}</span>
      </div>
      {result.shipping > 0 && (
        <div className="calc-row">
          <span>Shipping charged to buyer</span>
          <span>{money(result.shipping)}</span>
        </div>
      )}
      {result.lines.map((l) => (
        <div className="calc-row" key={l.key}>
          <span>
            {l.label} <small className="muted">· {l.note}</small>
          </span>
          <span className="neg">− {money(l.amount)}</span>
        </div>
      ))}
      <div className="calc-row total">
        <span>{netLabel}</span>
        <span className="pos">{money(result.net)}</span>
      </div>
      {netNote && (
        <p className="muted" style={{ fontSize: '0.78rem', margin: '4px 2px 0' }}>
          {netNote}
        </p>
      )}
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editor 1 — manage a CultureConnect listing (price, stock, description)
// ---------------------------------------------------------------------------
function ListingEditor({ product, onSave, onClose }) {
  const [form, setForm] = useState({
    inPersonPrice: product.inPersonPrice,
    stock: product.stock,
    description: product.description || '',
  })
  const set = (k) => (e) => setForm({ ...form, [k]: e.target.value })

  const inPerson = Number(form.inPersonPrice) || 0
  const online = onlinePrice(inPerson)
  const cc = commission(online)
  const net = shopPayout(online)

  function submit(e) {
    e.preventDefault()
    onSave(product.id, {
      inPersonPrice: inPerson,
      stock: Number(form.stock) || 0,
      description: form.description,
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal modal-wide" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 style={{ fontSize: '1.3rem', marginTop: 0, marginBottom: 4 }}>
          Manage listing
        </h2>
        <p className="muted" style={{ marginTop: 0 }}>{product.name}</p>

        <div className="grid-2">
          <div className="field">
            <label>Your in-store price ($)</label>
            <input
              className="input"
              type="number"
              step="0.01"
              value={form.inPersonPrice}
              onChange={set('inPersonPrice')}
            />
          </div>
          <div className="field">
            <label>Stock on hand</label>
            <input
              className="input"
              type="number"
              value={form.stock}
              onChange={set('stock')}
            />
          </div>
        </div>

        <div className="field">
          <label>Description</label>
          <textarea
            className="textarea"
            value={form.description}
            onChange={set('description')}
            placeholder="What it is, how it's made, why it's special…"
          />
        </div>

        <div className="panel" style={{ background: 'var(--sand)', marginTop: 4 }}>
          <strong style={{ fontSize: '0.95rem' }}>
            What you earn on CultureConnect
          </strong>
          <div className="fee-list" style={{ marginTop: 8 }}>
            <div className="calc-row">
              <span>Online price ({Math.round(MARKUP * 100)}% of in-store)</span>
              <span>{money(online)}</span>
            </div>
            <div className="calc-row">
              <span>
                CultureConnect commission{' '}
                <small className="muted">· {Math.round(COMMISSION_RATE * 100)}%</small>
              </span>
              <span className="neg">− {money(cc)}</span>
            </div>
            <div className="calc-row total">
              <span>Your payout per sale</span>
              <span className="pos">{money(net)}</span>
            </div>
          </div>
          <p className="muted" style={{ fontSize: '0.78rem', margin: '6px 2px 0' }}>
            No upfront or per-listing cost — CultureConnect only earns when you
            make a sale, and handles photography, marketing, payments and
            shipping.
          </p>
        </div>

        <div className="flex gap-8" style={{ marginTop: 12 }}>
          <button className="btn btn-primary" type="submit">
            Save listing
          </button>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// Editor 2 — configure cross-listing (Etsy + eBay), the full platform detail
// ---------------------------------------------------------------------------
function CrosslistEditor({ product, onSave, onClose }) {
  const price = onlinePrice(product.inPersonPrice)

  const [details, setDetails] = useState(() => {
    const d = channelDetailsFor(product)
    if (!d.etsy.title) d.etsy.title = product.name
    if (!d.ebay.title) d.ebay.title = product.name.slice(0, 80)
    return d
  })
  const setEtsy = (patch) =>
    setDetails((d) => ({ ...d, etsy: { ...d.etsy, ...patch } }))
  const setEbay = (patch) =>
    setDetails((d) => ({ ...d, ebay: { ...d.ebay, ...patch } }))

  const etsy = details.etsy
  const ebay = details.ebay

  const etsyResult = etsyFees(price, {
    shipping: Number(etsy.shippingPrice) || 0,
    offsiteAds: etsy.offsiteAds,
  })
  const ebayResult = ebayFees(price, {
    shipping: Number(ebay.shippingPrice) || 0,
    insertionApplies: ebay.insertionApplies,
    promoted: ebay.promoted,
    promotedRate: ebay.promotedRate,
    intlShipping: ebay.intlShipping,
  })

  const tagCount = etsy.tags.split(',').map((t) => t.trim()).filter(Boolean).length

  function submit(e) {
    e.preventDefault()
    onSave(product.id, {
      channelDetails: details,
      crosslisted: enabledChannels(details),
    })
  }

  return (
    <div className="modal-overlay" onClick={onClose}>
      <form className="modal modal-wide" onClick={(e) => e.stopPropagation()} onSubmit={submit}>
        <button type="button" className="modal-close" onClick={onClose} aria-label="Close">
          ✕
        </button>
        <h2 style={{ fontSize: '1.3rem', marginTop: 0, marginBottom: 4 }}>
          Cross-list this product
        </h2>
        <p className="muted" style={{ marginTop: 0 }}>
          {product.name} · synced price <strong>{money(price)}</strong>
        </p>
        <p className="muted" style={{ marginTop: 0, fontSize: '0.82rem' }}>
          Turn on a platform and fill in everything it asks for. The synced price
          comes from your CultureConnect listing — each marketplace's fees, and
          what you'd actually keep, are worked out for you below.
        </p>

        {/* ---------------- ETSY ---------------- */}
        <div className={`platform-card${etsy.enabled ? ' on' : ''}`}>
          <div className="platform-head">
            <div className="flex center gap-8">
              <span className="badge badge-etsy">Etsy</span>
              <strong>Etsy listing</strong>
            </div>
            <label className="flex center gap-8" style={{ cursor: 'pointer', fontSize: '0.82rem' }}>
              <span className="switch">
                <input
                  type="checkbox"
                  checked={etsy.enabled}
                  onChange={(e) => setEtsy({ enabled: e.target.checked })}
                />
                <span className="slider" />
              </span>
              {etsy.enabled ? 'Publishing to Etsy' : 'Off'}
            </label>
          </div>

          {etsy.enabled && (
            <div className="platform-body">
              <div className="platform-fields">
                <div className="field">
                  <label>Listing title <small className="muted">(SEO — up to 140 chars)</small></label>
                  <input
                    className="input"
                    maxLength={140}
                    value={etsy.title}
                    onChange={(e) => setEtsy({ title: e.target.value })}
                    required
                  />
                </div>
                <div className="field">
                  <label>
                    Tags <small className="muted">(comma-separated, up to 13 — {tagCount}/13)</small>
                  </label>
                  <input
                    className="input"
                    value={etsy.tags}
                    onChange={(e) => setEtsy({ tags: e.target.value })}
                    placeholder="handmade, vietnamese, lotus tea, gift"
                  />
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>Category / taxonomy</label>
                    <input
                      className="input"
                      value={etsy.taxonomy}
                      onChange={(e) => setEtsy({ taxonomy: e.target.value })}
                      placeholder="e.g. Food & Drink > Tea"
                    />
                  </div>
                  <div className="field">
                    <label>Materials</label>
                    <input
                      className="input"
                      value={etsy.materials}
                      onChange={(e) => setEtsy({ materials: e.target.value })}
                      placeholder="green tea, lotus"
                    />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>Who made it?</label>
                    <select className="select" value={etsy.whoMade} onChange={(e) => setEtsy({ whoMade: e.target.value })}>
                      {ETSY_WHO_MADE.map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>What is it?</label>
                    <select className="select" value={etsy.whatIsIt} onChange={(e) => setEtsy({ whatIsIt: e.target.value })}>
                      {ETSY_WHAT_IS_IT.map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>When was it made?</label>
                    <select className="select" value={etsy.whenMade} onChange={(e) => setEtsy({ whenMade: e.target.value })}>
                      {ETSY_WHEN_MADE.map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                  <div className="field">
                    <label>Processing time</label>
                    <input
                      className="input"
                      value={etsy.processingTime}
                      onChange={(e) => setEtsy({ processingTime: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>Quantity available</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={etsy.quantity}
                      onChange={(e) => setEtsy({ quantity: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Shipping price you charge ($)</label>
                    <input
                      className="input"
                      type="number"
                      step="0.01"
                      value={etsy.shippingPrice}
                      onChange={(e) => setEtsy({ shippingPrice: e.target.value })}
                      placeholder="0.00"
                    />
                  </div>
                </div>
                <label className="flex center gap-8" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={etsy.autoRenew}
                    onChange={(e) => setEtsy({ autoRenew: e.target.checked })}
                  />
                  Auto-renew the listing when it sells or expires
                </label>
                <label className="flex center gap-8" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={etsy.offsiteAds}
                    onChange={(e) => setEtsy({ offsiteAds: e.target.checked })}
                  />
                  Include Etsy Offsite Ads fee in my estimate (15% on ad-driven sales)
                </label>
              </div>

              <div className="platform-fees">
                <div className="fee-title">Etsy fees & payout</div>
                <FeeBreakdown
                  result={etsyResult}
                  netNote="Estimate per sale. Offsite Ads only apply when a buyer arrives from an Etsy-run ad."
                />
              </div>
            </div>
          )}
        </div>

        {/* ---------------- EBAY ---------------- */}
        <div className={`platform-card${ebay.enabled ? ' on' : ''}`}>
          <div className="platform-head">
            <div className="flex center gap-8">
              <span className="badge badge-ebay">eBay</span>
              <strong>eBay listing</strong>
            </div>
            <label className="flex center gap-8" style={{ cursor: 'pointer', fontSize: '0.82rem' }}>
              <span className="switch">
                <input
                  type="checkbox"
                  checked={ebay.enabled}
                  onChange={(e) => setEbay({ enabled: e.target.checked })}
                />
                <span className="slider" />
              </span>
              {ebay.enabled ? 'Publishing to eBay' : 'Off'}
            </label>
          </div>

          {ebay.enabled && (
            <div className="platform-body">
              <div className="platform-fields">
                <div className="field">
                  <label>Listing title <small className="muted">(up to 80 chars)</small></label>
                  <input
                    className="input"
                    maxLength={80}
                    value={ebay.title}
                    onChange={(e) => setEbay({ title: e.target.value })}
                    required
                  />
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>Category</label>
                    <input
                      className="input"
                      value={ebay.categoryId}
                      onChange={(e) => setEbay({ categoryId: e.target.value })}
                      placeholder="e.g. Home & Garden > Kitchen"
                    />
                  </div>
                  <div className="field">
                    <label>Condition</label>
                    <select className="select" value={ebay.condition} onChange={(e) => setEbay({ condition: e.target.value })}>
                      {EBAY_CONDITIONS.map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>Brand <small className="muted">(item specific)</small></label>
                    <input
                      className="input"
                      value={ebay.brand}
                      onChange={(e) => setEbay({ brand: e.target.value })}
                      placeholder="Unbranded / Handmade"
                    />
                  </div>
                  <div className="field">
                    <label>Type <small className="muted">(item specific)</small></label>
                    <input
                      className="input"
                      value={ebay.itemType}
                      onChange={(e) => setEbay({ itemType: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>Material <small className="muted">(item specific)</small></label>
                    <input
                      className="input"
                      value={ebay.material}
                      onChange={(e) => setEbay({ material: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Quantity available</label>
                    <input
                      className="input"
                      type="number"
                      min="0"
                      value={ebay.quantity}
                      onChange={(e) => setEbay({ quantity: e.target.value })}
                    />
                  </div>
                </div>
                <div className="grid-2">
                  <div className="field">
                    <label>Handling time</label>
                    <input
                      className="input"
                      value={ebay.handlingTime}
                      onChange={(e) => setEbay({ handlingTime: e.target.value })}
                    />
                  </div>
                  <div className="field">
                    <label>Returns policy</label>
                    <select className="select" value={ebay.returns} onChange={(e) => setEbay({ returns: e.target.value })}>
                      {EBAY_RETURNS.map(([v, l]) => (
                        <option key={v} value={v}>{l}</option>
                      ))}
                    </select>
                  </div>
                </div>
                <div className="field">
                  <label>Shipping price you charge ($)</label>
                  <input
                    className="input"
                    type="number"
                    step="0.01"
                    value={ebay.shippingPrice}
                    onChange={(e) => setEbay({ shippingPrice: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <label className="flex center gap-8" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={ebay.insertionApplies}
                    onChange={(e) => setEbay({ insertionApplies: e.target.checked })}
                  />
                  I'm past my 250 free listings this month (add $0.35 insertion fee)
                </label>
                <label className="flex center gap-8" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                  <input
                    type="checkbox"
                    checked={ebay.intlShipping}
                    onChange={(e) => setEbay({ intlShipping: e.target.checked })}
                  />
                  Offer international shipping (adds 1.65% cross-border fee)
                </label>
                <div className="flex center gap-8 wrap">
                  <label className="flex center gap-8" style={{ fontSize: '0.85rem', cursor: 'pointer' }}>
                    <input
                      type="checkbox"
                      checked={ebay.promoted}
                      onChange={(e) => setEbay({ promoted: e.target.checked })}
                    />
                    Promote this listing at
                  </label>
                  <input
                    className="input"
                    type="number"
                    step="0.5"
                    min="0"
                    disabled={!ebay.promoted}
                    value={ebay.promotedRate}
                    onChange={(e) => setEbay({ promotedRate: e.target.value })}
                    style={{ width: 80 }}
                  />
                  <span className="muted" style={{ fontSize: '0.85rem' }}>% ad rate</span>
                </div>
              </div>

              <div className="platform-fees">
                <div className="fee-title">eBay fees & payout</div>
                <FeeBreakdown
                  result={ebayResult}
                  netNote="Estimate per sale. Final value fee covers eBay's payment processing."
                />
              </div>
            </div>
          )}
        </div>

        <div className="flex gap-8" style={{ marginTop: 12 }}>
          <button className="btn btn-primary" type="submit">
            Save cross-listing
          </button>
          <button className="btn btn-ghost" type="button" onClick={onClose}>
            Cancel
          </button>
        </div>
      </form>
    </div>
  )
}

// ---------------------------------------------------------------------------
// The portal
// ---------------------------------------------------------------------------
export default function OwnerPortal() {
  const { user, stores, products, updateProduct, signOut } = useApp()
  const navigate = useNavigate()

  const store = stores.find((s) => s.id === user?.storeId)
  const myProducts = useMemo(
    () => products.filter((p) => p.storeId === user?.storeId),
    [products, user?.storeId],
  )

  const hasCrosslisting = !!store?.services?.includes('crosslisting')
  const [tab, setTab] = useState('listings')
  const [ccEditor, setCcEditor] = useState(null) // product | null
  const [xlEditor, setXlEditor] = useState(null) // product | null

  if (!store) {
    return (
      <div className="container" style={{ padding: '80px 0' }}>
        <div className="panel" style={{ maxWidth: 480, margin: '0 auto', textAlign: 'center' }}>
          <h2>We couldn't find your shop</h2>
          <p className="muted">Try signing in again from the For Businesses page.</p>
          <Link className="btn btn-dark" to="/services#owner-signin">Owner sign-in</Link>
        </div>
      </div>
    )
  }

  function saveListing(id, patch) {
    updateProduct(id, patch)
    setCcEditor(null)
  }
  function saveCrosslist(id, patch) {
    updateProduct(id, patch)
    setXlEditor(null)
  }

  // Cross-listing summary stats.
  const liveEtsy = myProducts.filter((p) => (p.crosslisted || []).includes('etsy')).length
  const liveEbay = myProducts.filter((p) => (p.crosslisted || []).includes('ebay')).length

  return (
    <>
      {/* Portal header */}
      <section className="portal-hero">
        <div className="container">
          <div className="flex between center wrap" style={{ gap: 16 }}>
            <div>
              <span className="eyebrow-sm" style={{ color: 'var(--saffron)' }}>
                Shop owner portal
              </span>
              <h1 style={{ fontSize: '2rem', margin: '4px 0 6px' }}>{store.name}</h1>
              <p className="muted" style={{ margin: 0 }}>
                Signed in as {user.name} · {store.neighborhood}
              </p>
              <div className="chip-row" style={{ marginTop: 10 }}>
                <span className="badge badge-cc">CultureConnect listing</span>
                {hasCrosslisting ? (
                  <span className="badge badge-culture">Cross-listing enabled</span>
                ) : (
                  <span className="badge" style={{ background: 'var(--sand-2)', color: 'var(--muted)' }}>
                    Cross-listing not enabled
                  </span>
                )}
              </div>
            </div>
            <div className="flex center gap-8">
              <Link to={`/store/${store.id}`} className="btn btn-ghost btn-sm">
                View shop page
              </Link>
              <button
                className="btn btn-dark btn-sm"
                onClick={() => {
                  signOut()
                  navigate('/services')
                }}
              >
                Sign out
              </button>
            </div>
          </div>
        </div>
      </section>

      <section className="section" style={{ paddingTop: 24 }}>
        <div className="container">
          {/* Tabs */}
          <div className="portal-tabs">
            <button
              className={`portal-tab${tab === 'listings' ? ' active' : ''}`}
              onClick={() => setTab('listings')}
            >
              CultureConnect listings
            </button>
            {hasCrosslisting && (
              <button
                className={`portal-tab${tab === 'crosslisting' ? ' active' : ''}`}
                onClick={() => setTab('crosslisting')}
              >
                Cross-listing (Etsy &amp; eBay)
              </button>
            )}
          </div>

          {/* ------- CULTURECONNECT LISTINGS TAB ------- */}
          {tab === 'listings' && (
            <>
              <div className="kpi-grid" style={{ marginBottom: 18 }}>
                <div className="kpi">
                  <div className="label">Live listings</div>
                  <div className="value">{myProducts.length}</div>
                  <div className="delta">on the CultureConnect marketplace</div>
                </div>
                <div className="kpi">
                  <div className="label">Commission</div>
                  <div className="value">{Math.round(COMMISSION_RATE * 100)}%</div>
                  <div className="delta">no upfront or per-listing cost</div>
                </div>
                <div className="kpi">
                  <div className="label">Units in stock</div>
                  <div className="value">
                    {myProducts.reduce((n, p) => n + (Number(p.stock) || 0), 0)}
                  </div>
                  <div className="delta">across all products</div>
                </div>
              </div>

              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-right">In-store</th>
                      <th className="text-right">Online ({Math.round(MARKUP * 100)}%)</th>
                      <th className="text-right">Commission</th>
                      <th className="text-right">Your payout</th>
                      <th className="text-right">Stock</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProducts.map((p) => {
                      const online = onlinePrice(p.inPersonPrice)
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
                              <span style={{ fontWeight: 600, maxWidth: 240 }}>{p.name}</span>
                            </div>
                          </td>
                          <td className="text-right">{money(p.inPersonPrice)}</td>
                          <td className="text-right" style={{ fontWeight: 700 }}>
                            {money(online)}
                          </td>
                          <td className="text-right neg">− {money(commission(online))}</td>
                          <td className="text-right pos" style={{ fontWeight: 700 }}>
                            {money(shopPayout(online))}
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
                          <td className="text-right">
                            <button className="btn btn-ghost btn-sm" onClick={() => setCcEditor(p)}>
                              Manage
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}

          {/* ------- CROSS-LISTING TAB ------- */}
          {tab === 'crosslisting' && hasCrosslisting && (
            <>
              <div className="kpi-grid" style={{ marginBottom: 18 }}>
                <div className="kpi">
                  <div className="label">Live on Etsy</div>
                  <div className="value">{liveEtsy}</div>
                  <div className="delta">of {myProducts.length} products</div>
                </div>
                <div className="kpi">
                  <div className="label">Live on eBay</div>
                  <div className="value">{liveEbay}</div>
                  <div className="delta">of {myProducts.length} products</div>
                </div>
                <div className="kpi">
                  <div className="label">Cross-listing plan</div>
                  <div className="value">$10<small style={{ fontSize: '0.9rem' }}>/mo</small></div>
                  <div className="delta">flat — no per-sale cost from us</div>
                </div>
              </div>

              <p className="muted" style={{ maxWidth: '58em', marginTop: 0 }}>
                One catalog, published to Etsy and eBay. Each product carries its
                own platform details — titles, tags, item specifics, shipping —
                and each marketplace charges its own fees. Configure a product to
                see exactly what Etsy or eBay would keep and what you'd net.
              </p>

              <div className="table-wrap">
                <table className="data">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th className="text-right">Synced price</th>
                      <th className="text-right">Etsy net</th>
                      <th className="text-right">eBay net</th>
                      <th>Channels</th>
                      <th></th>
                    </tr>
                  </thead>
                  <tbody>
                    {myProducts.map((p) => {
                      const price = onlinePrice(p.inPersonPrice)
                      const d = channelDetailsFor(p)
                      const onEtsy = (p.crosslisted || []).includes('etsy')
                      const onEbay = (p.crosslisted || []).includes('ebay')
                      const etsyNet = etsyFees(price, {
                        shipping: Number(d.etsy.shippingPrice) || 0,
                        offsiteAds: d.etsy.offsiteAds,
                      }).net
                      const ebayNet = ebayFees(price, {
                        shipping: Number(d.ebay.shippingPrice) || 0,
                        insertionApplies: d.ebay.insertionApplies,
                        promoted: d.ebay.promoted,
                        promotedRate: d.ebay.promotedRate,
                        intlShipping: d.ebay.intlShipping,
                      }).net
                      return (
                        <tr key={p.id}>
                          <td>
                            <span style={{ fontWeight: 600, maxWidth: 240, display: 'inline-block' }}>
                              {p.name}
                            </span>
                          </td>
                          <td className="text-right" style={{ fontWeight: 700 }}>
                            {money(price)}
                          </td>
                          <td className="text-right" style={{ color: onEtsy ? 'var(--jade)' : 'var(--muted)' }}>
                            {onEtsy ? money(etsyNet) : '—'}
                          </td>
                          <td className="text-right" style={{ color: onEbay ? 'var(--jade)' : 'var(--muted)' }}>
                            {onEbay ? money(ebayNet) : '—'}
                          </td>
                          <td>
                            <div className="chip-row">
                              {onEtsy && <span className="badge badge-etsy">Etsy</span>}
                              {onEbay && <span className="badge badge-ebay">eBay</span>}
                              {!onEtsy && !onEbay && (
                                <span className="muted" style={{ fontSize: '0.8rem' }}>
                                  Not cross-listed
                                </span>
                              )}
                            </div>
                          </td>
                          <td className="text-right">
                            <button className="btn btn-ghost btn-sm" onClick={() => setXlEditor(p)}>
                              {onEtsy || onEbay ? 'Edit' : 'Configure'}
                            </button>
                          </td>
                        </tr>
                      )
                    })}
                  </tbody>
                </table>
              </div>
            </>
          )}
        </div>
      </section>

      {ccEditor && (
        <ListingEditor product={ccEditor} onSave={saveListing} onClose={() => setCcEditor(null)} />
      )}
      {xlEditor && (
        <CrosslistEditor product={xlEditor} onSave={saveCrosslist} onClose={() => setXlEditor(null)} />
      )}
    </>
  )
}
