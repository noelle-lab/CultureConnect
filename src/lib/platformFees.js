// Cross-listing platform fee models.
//
// When a shop cross-lists a product onto Etsy or eBay, those marketplaces each
// take their own cut — and it is NOT a single flat number. Each platform layers
// a listing/insertion fee, a percentage "value" fee, payment processing, and a
// few optional add-ons (ads, international, etc.). The business owner needs to
// see, per product, exactly what each platform would keep and what they'd net.
//
// Numbers below are the publicly-published US rates as of 2025 and are used to
// *estimate* fees in this prototype — no marketplace API is called.

const r2 = (n) => Math.round(n * 100) / 100

// ---------------------------------------------------------------------------
// Etsy
// ---------------------------------------------------------------------------
export const ETSY_FEES = {
  listing: 0.2, // per listing, renews on sale or every 4 months
  transactionRate: 0.065, // 6.5% of item price + shipping
  paymentRate: 0.03, // payment processing, US
  paymentFixed: 0.25, // + flat per transaction, US
  offsiteAdsRate: 0.15, // charged only on a sale that came from an Etsy-run ad
}

// Etsy's own required listing attributes (the "who / what / when" it insists on).
export const ETSY_WHO_MADE = [
  ['i_did', 'I made it'],
  ['collective', 'A member of my shop / collective'],
  ['someone_else', 'Another company or person'],
]
export const ETSY_WHAT_IS_IT = [
  ['finished', 'A finished product'],
  ['supply', 'A supply or tool to make things'],
]
export const ETSY_WHEN_MADE = [
  ['made_to_order', 'Made to order'],
  ['2020_2025', '2020–2025'],
  ['2010_2019', '2010–2019'],
  ['2006_2009', '2006–2009'],
  ['before_2006', 'Before 2006 (vintage)'],
]

// price = the online (marked-up) price the item sells for on the channel.
export function etsyFees(price, { shipping = 0, offsiteAds = false } = {}) {
  const p = Number(price) || 0
  const ship = Number(shipping) || 0
  const base = p + ship
  const lines = [
    { key: 'listing', label: 'Listing fee', amount: ETSY_FEES.listing, note: 'per listing' },
    {
      key: 'transaction',
      label: 'Transaction fee',
      amount: r2(base * ETSY_FEES.transactionRate),
      note: '6.5% of item + shipping',
    },
    {
      key: 'processing',
      label: 'Payment processing',
      amount: r2(base * ETSY_FEES.paymentRate + ETSY_FEES.paymentFixed),
      note: '3% + $0.25',
    },
  ]
  if (offsiteAds) {
    lines.push({
      key: 'offsite',
      label: 'Offsite Ads fee',
      amount: r2(base * ETSY_FEES.offsiteAdsRate),
      note: '15% — only on ad-driven sales',
    })
  }
  const totalFees = r2(lines.reduce((s, l) => s + l.amount, 0))
  return { price: p, shipping: ship, lines, totalFees, net: r2(p - totalFees) }
}

// ---------------------------------------------------------------------------
// eBay
// ---------------------------------------------------------------------------
export const EBAY_FEES = {
  freeListingsPerMonth: 250, // first 250 fixed-price listings/month are free
  insertion: 0.35, // per listing beyond the free allotment
  finalValueRate: 0.1325, // 13.25% for most categories, up to $7,500
  finalValueFixed: 0.3, // + flat per order
  intlRate: 0.0165, // extra 1.65% when shipping internationally
}

export const EBAY_CONDITIONS = [
  ['new', 'New'],
  ['new_other', 'New (other)'],
  ['used', 'Used'],
  ['handmade', 'Handmade'],
]
export const EBAY_RETURNS = [
  ['no_returns', 'No returns'],
  ['14-day returns', '14-day returns'],
  ['30-day returns', '30-day returns'],
  ['60-day returns', '60-day returns'],
]

export function ebayFees(
  price,
  { shipping = 0, insertionApplies = false, promoted = false, promotedRate = 2, intlShipping = false } = {},
) {
  const p = Number(price) || 0
  const ship = Number(shipping) || 0
  const base = p + ship
  const lines = []
  if (insertionApplies) {
    lines.push({
      key: 'insertion',
      label: 'Insertion fee',
      amount: EBAY_FEES.insertion,
      note: 'beyond 250 free/mo',
    })
  }
  lines.push({
    key: 'finalValue',
    label: 'Final value fee',
    amount: r2(base * EBAY_FEES.finalValueRate + EBAY_FEES.finalValueFixed),
    note: '13.25% + $0.30',
  })
  if (promoted) {
    const rate = (Number(promotedRate) || 0) / 100
    lines.push({
      key: 'promoted',
      label: 'Promoted listings',
      amount: r2(base * rate),
      note: `${Number(promotedRate) || 0}% ad rate`,
    })
  }
  if (intlShipping) {
    lines.push({
      key: 'intl',
      label: 'International fee',
      amount: r2(base * EBAY_FEES.intlRate),
      note: '1.65% cross-border',
    })
  }
  const totalFees = r2(lines.reduce((s, l) => s + l.amount, 0))
  return { price: p, shipping: ship, lines, totalFees, net: r2(p - totalFees) }
}

// ---------------------------------------------------------------------------
// Per-product channel configuration
// ---------------------------------------------------------------------------
// The full set of platform-specific fields a product carries once an owner sets
// it up for cross-listing. Stored on the product as `channelDetails`.
export function blankChannelDetails() {
  return {
    etsy: {
      enabled: false,
      title: '',
      tags: '',
      taxonomy: '',
      whoMade: 'i_did',
      whatIsIt: 'finished',
      whenMade: 'made_to_order',
      materials: '',
      processingTime: '1–3 business days',
      quantity: 1,
      shippingPrice: 0,
      autoRenew: true,
      offsiteAds: false,
    },
    ebay: {
      enabled: false,
      title: '',
      categoryId: '',
      condition: 'new',
      brand: '',
      itemType: '',
      material: '',
      quantity: 1,
      shippingPrice: 0,
      handlingTime: '1 business day',
      returns: '30-day returns',
      promoted: false,
      promotedRate: 2,
      intlShipping: false,
      insertionApplies: false,
    },
  }
}

// Build the working channel config for a product: blank defaults, overlaid with
// anything already saved, and back-filled from the legacy `crosslisted` array so
// products enabled before this editor existed show up as enabled.
export function channelDetailsFor(product) {
  const blank = blankChannelDetails()
  const existing = product?.channelDetails || {}
  const merged = {
    etsy: { ...blank.etsy, ...existing.etsy },
    ebay: { ...blank.ebay, ...existing.ebay },
  }
  ;(product?.crosslisted || []).forEach((ch) => {
    if (merged[ch]) merged[ch].enabled = true
  })
  return merged
}

// The channel keys that are currently switched on, for syncing back to the
// product's `crosslisted` array (what the admin console + storefront read).
export function enabledChannels(channelDetails) {
  return ['etsy', 'ebay'].filter((ch) => channelDetails?.[ch]?.enabled)
}
