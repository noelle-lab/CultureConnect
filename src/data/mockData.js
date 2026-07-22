// CultureConnect seed data.
// Everything here is demo data. Prices are stored as the shop's real
// in-person price; the online price shown to buyers is marked up (default
// 120% of the in-person price) and CultureConnect keeps a 20% commission.

export const COMMISSION_RATE = 0.2 // CultureConnect's cut of each online sale
export const MARKUP = 1.2 // shops are encouraged to list at 120% of in-person price

// ---------------------------------------------------------------------------
// Partner shops (the family-owned businesses on the platform)
// ---------------------------------------------------------------------------
export const stores = [
  {
    id: 'st-golden-lotus',
    name: 'Golden Lotus Provisions',
    owner: 'The Tran Family',
    heritage: 'Vietnamese',
    city: 'New York City',
    neighborhood: 'Sunset Park, Brooklyn',
    status: 'active', // prospect | contacted | onboarding | active
    services: ['listing', 'crosslisting'],
    joined: '2025-11-04',
    story:
      'A three-generation grocery and dry-goods shop specializing in Vietnamese pantry staples, hand-packed teas, and lunar new year gifts.',
    emoji: '🪷',
    rating: 4.9,
  },
  {
    id: 'st-casa-oaxaca',
    name: 'Casa Oaxaca Textiles',
    owner: 'Familia Ramírez',
    heritage: 'Mexican (Oaxacan)',
    city: 'New York City',
    neighborhood: 'East Harlem',
    status: 'active',
    services: ['listing', 'crosslisting'],
    joined: '2025-12-01',
    story:
      'Handwoven rugs, embroidered blouses, and black clay pottery brought directly from artisan cooperatives in Oaxaca.',
    emoji: '🧶',
    rating: 4.8,
  },
  {
    id: 'st-anatolia',
    name: 'Anatolia Home',
    owner: 'The Demir Family',
    heritage: 'Turkish',
    city: 'New York City',
    neighborhood: 'Sheepshead Bay, Brooklyn',
    status: 'active',
    services: ['listing'],
    joined: '2026-01-18',
    story:
      'Family importers of hand-painted ceramics, copper coffee sets, and Turkish towels woven on antique looms.',
    emoji: '🫖',
    rating: 4.7,
  },
  {
    id: 'st-little-lagos',
    name: 'Little Lagos Market',
    owner: 'The Okafor Family',
    heritage: 'Nigerian',
    city: 'New York City',
    neighborhood: 'The Bronx',
    status: 'active',
    services: ['listing', 'crosslisting'],
    joined: '2026-02-09',
    story:
      'West African spice blends, palm oil, shea butter, and Ankara-print accessories sourced from family suppliers.',
    emoji: '🌶️',
    rating: 4.9,
  },
  {
    id: 'st-himalayan-thread',
    name: 'Himalayan Thread',
    owner: 'The Sherpa Family',
    heritage: 'Nepali / Tibetan',
    city: 'New York City',
    neighborhood: 'Jackson Heights, Queens',
    status: 'onboarding',
    services: ['listing'],
    joined: '2026-06-30',
    story:
      'Hand-knit wool goods, singing bowls, and prayer flags made by a Himalayan artisan collective.',
    emoji: '🏔️',
    rating: 4.6,
  },
  {
    id: 'st-manila-pantry',
    name: 'Manila Pantry',
    owner: 'The Santos Family',
    heritage: 'Filipino',
    city: 'New York City',
    neighborhood: 'Woodside, Queens',
    status: 'contacted',
    services: [],
    joined: null,
    story:
      'Neighborhood staple for Filipino snacks, sauces, and handmade capiz-shell home goods. In early conversations with CultureConnect.',
    emoji: '🥥',
    rating: null,
  },
]

// ---------------------------------------------------------------------------
// Products (only active/onboarding stores have live listings)
// ---------------------------------------------------------------------------
export const products = [
  {
    id: 'p-lotus-tea',
    storeId: 'st-golden-lotus',
    name: 'Hand-Packed Lotus Green Tea (100g)',
    category: 'Food & Pantry',
    inPersonPrice: 14.0,
    emoji: '🍵',
    stock: 40,
    crosslisted: ['etsy'],
    description:
      'Fragrant green tea scented overnight with fresh lotus stamens, hand-packed in the shop. A Tết staple.',
  },
  {
    id: 'p-lotus-mooncake',
    storeId: 'st-golden-lotus',
    name: 'Lotus Seed Mooncake Gift Box (4 pc)',
    category: 'Food & Pantry',
    inPersonPrice: 32.0,
    emoji: '🥮',
    stock: 18,
    crosslisted: ['etsy', 'ebay'],
    description: 'Classic baked mooncakes with lotus seed paste and salted egg yolk, in a keepsake tin.',
  },
  {
    id: 'p-oaxaca-rug',
    storeId: 'st-casa-oaxaca',
    name: 'Handwoven Zapotec Wool Rug (2x3 ft)',
    category: 'Home & Textiles',
    inPersonPrice: 180.0,
    emoji: '🪮',
    stock: 6,
    crosslisted: ['etsy', 'ebay'],
    description:
      'Naturally dyed wool rug woven on a pedal loom in Teotitlán del Valle. Each piece is one of a kind.',
  },
  {
    id: 'p-oaxaca-blouse',
    storeId: 'st-casa-oaxaca',
    name: 'Embroidered Oaxacan Blouse',
    category: 'Apparel',
    inPersonPrice: 68.0,
    emoji: '👚',
    stock: 12,
    crosslisted: ['etsy'],
    description: 'Cotton blouse with hand-embroidered floral yoke in the San Antonino style.',
  },
  {
    id: 'p-oaxaca-pottery',
    storeId: 'st-casa-oaxaca',
    name: 'Barro Negro Black Clay Vase',
    category: 'Home & Textiles',
    inPersonPrice: 45.0,
    emoji: '🏺',
    stock: 9,
    crosslisted: [],
    description: 'Burnished black clay vase from San Bartolo Coyotepec, shaped and polished by hand.',
  },
  {
    id: 'p-turkish-set',
    storeId: 'st-anatolia',
    name: 'Hand-Hammered Copper Coffee Set',
    category: 'Home & Textiles',
    inPersonPrice: 95.0,
    emoji: '☕',
    stock: 7,
    crosslisted: [],
    description: 'Two-cup Turkish coffee set with copper cezve, saucers, and hand-painted cups.',
  },
  {
    id: 'p-turkish-towel',
    storeId: 'st-anatolia',
    name: 'Peshtemal Turkish Bath Towel',
    category: 'Home & Textiles',
    inPersonPrice: 34.0,
    emoji: '🧺',
    stock: 25,
    crosslisted: [],
    description: 'Quick-drying, loom-woven cotton towel that softens with every wash.',
  },
  {
    id: 'p-lagos-spice',
    storeId: 'st-little-lagos',
    name: 'Suya Spice Blend (Yaji), 8 oz',
    category: 'Food & Pantry',
    inPersonPrice: 12.0,
    emoji: '🌶️',
    stock: 60,
    crosslisted: ['ebay'],
    description: 'Smoky, peanut-forward West African grilling spice blended fresh in the Bronx.',
  },
  {
    id: 'p-lagos-shea',
    storeId: 'st-little-lagos',
    name: 'Raw Unrefined Shea Butter (16 oz)',
    category: 'Beauty & Wellness',
    inPersonPrice: 22.0,
    emoji: '🧴',
    stock: 44,
    crosslisted: ['etsy', 'ebay'],
    description: 'Ivory-grade shea butter sourced from a women-run cooperative in northern Nigeria.',
  },
  {
    id: 'p-lagos-ankara',
    storeId: 'st-little-lagos',
    name: 'Ankara Print Tote Bag',
    category: 'Apparel',
    inPersonPrice: 28.0,
    emoji: '👜',
    stock: 30,
    crosslisted: ['etsy'],
    description: 'Sturdy cotton tote lined and trimmed with vibrant Ankara wax print.',
  },
  {
    id: 'p-himalaya-bowl',
    storeId: 'st-himalayan-thread',
    name: 'Hand-Hammered Singing Bowl (5 in)',
    category: 'Home & Textiles',
    inPersonPrice: 58.0,
    emoji: '🔔',
    stock: 15,
    crosslisted: [],
    description: 'Seven-metal singing bowl with striker and cushion, tuned for meditation.',
  },
  {
    id: 'p-himalaya-wool',
    storeId: 'st-himalayan-thread',
    name: 'Hand-Knit Wool Beanie',
    category: 'Apparel',
    inPersonPrice: 26.0,
    emoji: '🧶',
    stock: 20,
    crosslisted: [],
    description: 'Warm, fleece-lined wool beanie knit by a Himalayan artisan collective.',
  },
]

// ---------------------------------------------------------------------------
// City expansion requests (submitted by buyers on the public site)
// ---------------------------------------------------------------------------
export const cityRequests = [
  {
    id: 'cr-austin',
    city: 'Austin',
    state: 'TX',
    votes: 214,
    note: 'Would love authentic Oaxacan textiles and West African groceries here.',
    submittedBy: 'demo-buyer',
    date: '2026-05-12',
    status: 'researching', // requested | researching | planned | launched
  },
  {
    id: 'cr-columbus',
    city: 'Columbus',
    state: 'OH',
    votes: 138,
    note: 'Big Nepali and Somali communities, almost no authentic retail options.',
    submittedBy: 'demo-buyer',
    date: '2026-04-28',
    status: 'planned',
  },
  {
    id: 'cr-raleigh',
    city: 'Raleigh',
    state: 'NC',
    votes: 96,
    note: 'Please bring Vietnamese pantry goods to the Triangle!',
    submittedBy: 'demo-buyer',
    date: '2026-06-02',
    status: 'requested',
  },
  {
    id: 'cr-boise',
    city: 'Boise',
    state: 'ID',
    votes: 61,
    note: 'Refugee community here has amazing food traditions and nowhere to shop.',
    submittedBy: 'demo-buyer',
    date: '2026-06-19',
    status: 'requested',
  },
]

// ---------------------------------------------------------------------------
// Sample orders (for the admin dashboard + finance views)
// ---------------------------------------------------------------------------
export const orders = [
  {
    id: 'ord-1042',
    date: '2026-07-19',
    buyer: 'ana.p@example.com',
    city: 'Denver, CO',
    items: [
      { productId: 'p-lagos-shea', qty: 2 },
      { productId: 'p-lagos-spice', qty: 1 },
    ],
    status: 'shipped', // paid | shipped | delivered
  },
  {
    id: 'ord-1041',
    date: '2026-07-18',
    buyer: 'marcus.l@example.com',
    city: 'Nashville, TN',
    items: [{ productId: 'p-oaxaca-rug', qty: 1 }],
    status: 'delivered',
  },
  {
    id: 'ord-1040',
    date: '2026-07-18',
    buyer: 'jenny.k@example.com',
    city: 'Portland, OR',
    items: [
      { productId: 'p-lotus-mooncake', qty: 1 },
      { productId: 'p-lotus-tea', qty: 2 },
    ],
    status: 'paid',
  },
  {
    id: 'ord-1039',
    date: '2026-07-16',
    buyer: 'sam.d@example.com',
    city: 'Kansas City, MO',
    items: [{ productId: 'p-turkish-set', qty: 1 }],
    status: 'delivered',
  },
  {
    id: 'ord-1038',
    date: '2026-07-15',
    buyer: 'priya.n@example.com',
    city: 'Madison, WI',
    items: [
      { productId: 'p-lagos-ankara', qty: 1 },
      { productId: 'p-himalaya-beanie', qty: 0 },
    ],
    status: 'delivered',
  },
]

// ---------------------------------------------------------------------------
// Pricing helpers
// ---------------------------------------------------------------------------

// The price a buyer pays online (shop's in-person price marked up).
export function onlinePrice(inPersonPrice) {
  return Math.round(inPersonPrice * MARKUP * 100) / 100
}

// CultureConnect's 20% commission on a given online price.
export function commission(onlineTotal) {
  return Math.round(onlineTotal * COMMISSION_RATE * 100) / 100
}

// What the shop actually nets on an online sale.
export function shopPayout(onlineTotal) {
  return Math.round(onlineTotal * (1 - COMMISSION_RATE) * 100) / 100
}
