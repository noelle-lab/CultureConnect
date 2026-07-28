// CultureConnect seed data.
// Everything here is demo data. Prices are stored as the shop's real
// in-person price; the online price shown to buyers is marked up (default
// 120% of the in-person price) and CultureConnect keeps a 20% commission.

export const COMMISSION_RATE = 0.2 // CultureConnect's cut of each online sale
export const MARKUP = 1.2 // shops are encouraged to list at 120% of in-person price

// ---------------------------------------------------------------------------
// Photo credits
// ---------------------------------------------------------------------------
// Every product and shop photo below is a real (non-AI) photograph sourced from
// openly-licensed collections via Openverse (Flickr / Wikimedia Commons). Each
// image carries an attribution record so we can credit the photographer and
// license, per the terms of Creative Commons. The businesses themselves are
// illustrative demo shops (see README) — the photos represent the kind of goods
// and storefronts these NYC family shops sell, not a specific real business.
const LICENSE_URLS = {
  'CC BY 2.0': 'https://creativecommons.org/licenses/by/2.0/',
  'CC BY-SA 2.0': 'https://creativecommons.org/licenses/by-sa/2.0/',
  'CC BY-SA 3.0': 'https://creativecommons.org/licenses/by-sa/3.0/',
  'CC BY-SA 4.0': 'https://creativecommons.org/licenses/by-sa/4.0/',
  'CC0 1.0': 'https://creativecommons.org/publicdomain/zero/1.0/',
}

// credit(title, author, license, sourceUrl) -> attribution record
function credit(title, author, license, source) {
  return { title, author, license, licenseUrl: LICENSE_URLS[license], source }
}

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
    address: '5814 8th Avenue, Sunset Park, Brooklyn, NY 11220',
    hours: 'Mon–Sat 8am–8pm · Sun 8am–6pm',
    founded: 1998,
    status: 'active', // prospect | contacted | onboarding | active
    services: ['listing', 'crosslisting'],
    joined: '2025-11-04',
    story:
      'A three-generation grocery and dry-goods shop specializing in Vietnamese pantry staples, hand-packed teas, and lunar new year gifts.',
    longStory:
      'Bà Trần arrived in Sunset Park in 1997 with a suitcase of tea and a family recipe book. A year later she and her husband opened Golden Lotus on 8th Avenue — Brooklyn’s bustling Little Saigon — hand-packing loose teas in the back while raising three kids at the front counter. Two decades on, their daughter Linh runs the shop, still scenting green tea overnight with fresh lotus stamens each summer and stacking mooncakes to the ceiling every fall for Tết Trung Thu.',
    specialties: ['Hand-packed teas', 'Lunar New Year gifts', 'Vietnamese pantry staples'],
    emoji: '🪷',
    rating: 4.9,
    image: '/images/stores/golden-lotus.jpg',
    imageCredit: credit(
      'Busy indoor market with vendors and packaged goods',
      'PattayaPatrol',
      'CC BY-SA 4.0',
      'https://commons.wikimedia.org/w/index.php?curid=190866864',
    ),
  },
  {
    id: 'st-casa-oaxaca',
    name: 'Casa Oaxaca Textiles',
    owner: 'Familia Ramírez',
    heritage: 'Mexican (Oaxacan)',
    city: 'New York City',
    neighborhood: 'East Harlem',
    address: '163 East 116th Street, East Harlem, NY 10029',
    hours: 'Tue–Sun 11am–7pm · Closed Mon',
    founded: 2011,
    status: 'active',
    services: ['listing', 'crosslisting'],
    joined: '2025-12-01',
    story:
      'Handwoven rugs, embroidered blouses, and black clay pottery brought directly from artisan cooperatives in Oaxaca.',
    longStory:
      'The Ramírez family carries El Barrio’s Mexican heart onto 116th Street. Every rug, blouse, and clay pot is bought directly from artisan cooperatives in Teotitlán del Valle and San Bartolo Coyotepec — many from cousins and compadres the family has known for generations. Doña Marta still greets regulars in Zapotec and can tell you the name of the weaver who made your rug.',
    specialties: ['Zapotec weaving', 'Hand embroidery', 'Barro negro pottery'],
    emoji: '🧶',
    rating: 4.8,
    image: '/images/stores/casa-oaxaca.jpg',
    imageCredit: credit(
      'Embroidered table runners in a market',
      'Pasha Kirillov',
      'CC BY-SA 2.0',
      'https://www.flickr.com/photos/74834643@N07/8043988627',
    ),
  },
  {
    id: 'st-anatolia',
    name: 'Anatolia Home',
    owner: 'The Demir Family',
    heritage: 'Turkish',
    city: 'New York City',
    neighborhood: 'Sheepshead Bay, Brooklyn',
    address: '1709 Sheepshead Bay Road, Brooklyn, NY 11235',
    hours: 'Mon–Sat 10am–7pm · Sun 12–5pm',
    founded: 2016,
    status: 'active',
    services: ['listing'],
    joined: '2026-01-18',
    story:
      'Family importers of hand-painted ceramics, copper coffee sets, and Turkish towels woven on antique looms.',
    longStory:
      'Mehmet and Ayşe Demir import by hand from the workshops of their hometown near İzmir — hammered copper cezves, hand-painted Kütahya ceramics, and peştemals still woven on antique shuttle looms. What began as a suitcase trade between Brooklyn and Turkey is now a light-filled shop where the smell of fresh Turkish coffee greets you at the door.',
    specialties: ['Hand-painted ceramics', 'Copper coffee ware', 'Loom-woven textiles'],
    emoji: '🫖',
    rating: 4.7,
    image: '/images/stores/anatolia.jpg',
    imageCredit: credit(
      'Hand-painted ceramics and pottery on display',
      'AdilElouarti',
      'CC0 1.0',
      'https://commons.wikimedia.org/w/index.php?curid=190833833',
    ),
  },
  {
    id: 'st-little-lagos',
    name: 'Little Lagos Market',
    owner: 'The Okafor Family',
    heritage: 'Nigerian',
    city: 'New York City',
    neighborhood: 'The Bronx',
    address: '215 East 167th Street, The Bronx, NY 10456',
    hours: 'Mon–Sat 9am–9pm · Sun 11am–6pm',
    founded: 2009,
    status: 'active',
    services: ['listing', 'crosslisting'],
    joined: '2026-02-09',
    story:
      'West African spice blends, palm oil, shea butter, and Ankara-print accessories sourced from family suppliers.',
    longStory:
      'When the Okafor family opened Little Lagos, they wanted the Bronx’s growing West African community to smell home the moment they walked in. They blend their suya spice fresh in-store and stock ivory shea butter from a women’s cooperative in northern Nigeria that Mama Okafor’s sister helps run. On Saturdays the shop doubles as a meeting place.',
    specialties: ['Fresh-blended spices', 'Shea & body care', 'Ankara accessories'],
    emoji: '🌶️',
    rating: 4.9,
    image: '/images/stores/little-lagos.jpg',
    imageCredit: credit(
      'Spice shop with mounds of colorful spices',
      'kyle simourd',
      'CC BY 2.0',
      'https://www.flickr.com/photos/89241789@N00/2064899357',
    ),
  },
  {
    id: 'st-himalayan-thread',
    name: 'Himalayan Thread',
    owner: 'The Sherpa Family',
    heritage: 'Nepali / Tibetan',
    city: 'New York City',
    neighborhood: 'Jackson Heights, Queens',
    address: '37-52 74th Street, Jackson Heights, Queens, NY 11372',
    hours: 'Daily 11am–8pm',
    founded: 2019,
    status: 'onboarding',
    services: ['listing'],
    joined: '2026-06-30',
    story:
      'Hand-knit wool goods, singing bowls, and prayer flags made by a Himalayan artisan collective.',
    longStory:
      'Pemba Sherpa and his cousins run Himalayan Thread as the retail arm of a small artisan collective back home in the Solukhumbu. Hand-knit wool, seven-metal singing bowls, and prayer flags arrive in duffel bags carried by relatives flying into JFK. A portion of every sale goes back to the knitters and metalsmiths — by name.',
    specialties: ['Hand-knit wool', 'Singing bowls', 'Prayer flags'],
    emoji: '🏔️',
    rating: 4.6,
    image: '/images/stores/himalayan-thread.jpg',
    imageCredit: credit(
      'Himalayan storefront with prayer flags and dharma arts',
      'Wonderlane',
      'CC BY 2.0',
      'https://www.flickr.com/photos/71401718@N00/8405093594',
    ),
  },
  {
    id: 'st-manila-pantry',
    name: 'Manila Pantry',
    owner: 'The Santos Family',
    heritage: 'Filipino',
    city: 'New York City',
    neighborhood: 'Woodside, Queens',
    address: '63-05 Roosevelt Avenue, Woodside, Queens, NY 11377',
    hours: 'Daily 9am–9pm',
    founded: 2004,
    status: 'contacted',
    services: [],
    joined: null,
    story:
      'Neighborhood staple for Filipino snacks, sauces, and handmade capiz-shell home goods. In early conversations with CultureConnect.',
    longStory:
      'A Little Manila fixture under the 7 train, the Santos family’s pantry has been the go-to for Filipino snacks, sauces, and handmade capiz-shell home goods for two decades. They’re in early conversations with CultureConnect about reaching customers beyond Queens.',
    specialties: ['Filipino snacks & sauces', 'Capiz-shell home goods'],
    emoji: '🥥',
    rating: null,
    image: '/images/stores/manila-pantry.jpg',
    imageCredit: credit(
      'Filipino sari-sari corner store',
      'Glen',
      'CC BY 2.0',
      'https://commons.wikimedia.org/w/index.php?curid=15580008',
    ),
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
    image: '/images/products/lotus-tea.jpg',
    imageCredit: credit(
      'Loose-leaf green tea',
      'properhealthyliving',
      'CC BY-SA 2.0',
      'https://www.flickr.com/photos/193754768@N07/51398670627',
    ),
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
    image: '/images/products/mooncake.jpg',
    imageCredit: credit(
      'Moon cakes',
      'miss karen',
      'CC BY 2.0',
      'https://www.flickr.com/photos/47489771@N00/262305960',
    ),
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
    image: '/images/products/oaxaca-rug.jpg',
    imageCredit: credit(
      'Handmade wool rug',
      'ToGa Wanderings',
      'CC BY 2.0',
      'https://www.flickr.com/photos/69031678@N00/14143291597',
    ),
  },
  {
    id: 'p-oaxaca-blouse',
    storeId: 'st-casa-oaxaca',
    name: 'Hand-Embroidered Oaxacan Huipil',
    category: 'Apparel',
    inPersonPrice: 68.0,
    emoji: '👚',
    stock: 12,
    crosslisted: ['etsy'],
    description: 'Cotton blouse with a hand-embroidered floral yoke in the vivid Isthmus style.',
    image: '/images/products/oaxaca-blouse.jpg',
    imageCredit: credit(
      'Hand-embroidered huipil',
      'RubyGoes',
      'CC BY 2.0',
      'https://www.flickr.com/photos/61997808@N00/8211019184',
    ),
  },
  {
    id: 'p-oaxaca-pottery',
    storeId: 'st-casa-oaxaca',
    name: 'Barro Negro Black Clay Bowl',
    category: 'Home & Textiles',
    inPersonPrice: 45.0,
    emoji: '🏺',
    stock: 9,
    crosslisted: [],
    description: 'Burnished black clay from San Bartolo Coyotepec, shaped and polished by hand — a craft passed down through generations.',
    image: '/images/products/oaxaca-pottery.jpg',
    imageCredit: credit(
      'Barro negro (black clay) potter at work',
      'scratchpost',
      'CC BY 2.0',
      'https://www.flickr.com/photos/11803716@N00/24435383230',
    ),
  },
  {
    id: 'p-turkish-set',
    storeId: 'st-anatolia',
    name: 'Hand-Hammered Copper Cezve (Turkish Coffee Pot)',
    category: 'Home & Textiles',
    inPersonPrice: 95.0,
    emoji: '☕',
    stock: 7,
    crosslisted: [],
    description: 'Solid copper cezve, hand-hammered and tinned by a coppersmith near İzmir — the traditional pot for brewing Turkish coffee.',
    image: '/images/products/turkish-coffee.jpg',
    imageCredit: credit(
      'Hand-hammered copper Turkish coffee pot',
      'Noumenon',
      'CC BY-SA 3.0',
      'https://commons.wikimedia.org/w/index.php?curid=2304254',
    ),
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
    description: 'Quick-drying, loom-woven cotton peştemal with hand-knotted fringe that softens with every wash.',
    image: '/images/products/turkish-towel.jpg',
    imageCredit: credit(
      'Striped peshtemal (hammam) towels',
      'sander muller',
      'CC BY-SA 3.0',
      'https://commons.wikimedia.org/w/index.php?curid=15862995',
    ),
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
    image: '/images/products/suya-spice.jpg',
    imageCredit: credit(
      'Ground spices at a market stall',
      'mckaysavage',
      'CC BY 2.0',
      'https://www.flickr.com/photos/56796376@N00/5373673363',
    ),
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
    image: '/images/products/shea-butter.jpg',
    imageCredit: credit(
      '100% natural African shea butter',
      'daveynin',
      'CC BY 2.0',
      'https://www.flickr.com/photos/44124370018@N01/3760127384',
    ),
  },
  {
    id: 'p-lagos-ankara',
    storeId: 'st-little-lagos',
    name: 'Ankara Wax-Print Tote Bag',
    category: 'Apparel',
    inPersonPrice: 28.0,
    emoji: '👜',
    stock: 30,
    crosslisted: ['etsy'],
    description: 'Sturdy cotton tote cut and trimmed from vibrant West African wax-print cloth.',
    image: '/images/products/ankara-tote.jpg',
    imageCredit: credit(
      'African wax-print cloth',
      'Tomathon',
      'CC BY-SA 2.0',
      'https://www.flickr.com/photos/42657964@N00/5523519784',
    ),
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
    image: '/images/products/singing-bowl.jpg',
    imageCredit: credit(
      'Tibetan singing bowl with striker and cushion',
      'eekim',
      'CC BY 2.0',
      'https://www.flickr.com/photos/63669472@N00/4200833309',
    ),
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
    image: '/images/products/wool-beanie.jpg',
    imageCredit: credit(
      'Hand-knit wool beanie',
      'Siona Karen',
      'CC BY 2.0',
      'https://www.flickr.com/photos/26149290@N02/3871307470',
    ),
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

// ---------------------------------------------------------------------------
// Shipping estimator (demo)
// Orders ship from CultureConnect's NYC fulfillment hub. Rates are estimated
// by distance zone, derived from the destination ZIP code (or state). This is
// mock logic - no carrier API is called.
// ---------------------------------------------------------------------------

export const FREE_SHIPPING_THRESHOLD = 75 // free Standard shipping over this subtotal

// US state → distance zone relative to the NYC hub (1 = closest … 4 = farthest).
const STATE_ZONES = {
  NY: 1, NJ: 1, CT: 1, PA: 1, MA: 1, RI: 1, DE: 1,
  MD: 2, DC: 2, VA: 2, NH: 2, VT: 2, ME: 2, OH: 2, WV: 2, NC: 2, MI: 2, IN: 2,
  SC: 3, GA: 3, KY: 3, TN: 3, IL: 3, WI: 3, MO: 3, IA: 3, MN: 3, AL: 3, MS: 3, AR: 3, FL: 3,
  LA: 4, OK: 4, TX: 4, KS: 4, NE: 4, SD: 4, ND: 4, CO: 4, WY: 4, MT: 4,
  NM: 4, AZ: 4, UT: 4, ID: 4, NV: 4, CA: 4, OR: 4, WA: 4, AK: 4, HI: 4,
}

// Per-zone base rates: [standard, express] in dollars.
const ZONE_RATES = {
  1: { standard: 6.5, express: 14.0 },
  2: { standard: 8.5, express: 17.0 },
  3: { standard: 10.5, express: 21.0 },
  4: { standard: 12.5, express: 25.0 },
}

// Rough ZIP first-digit → zone, used when only a ZIP is provided.
const ZIP_PREFIX_ZONES = { 0: 1, 1: 1, 2: 2, 3: 3, 4: 2, 5: 3, 6: 3, 7: 4, 8: 4, 9: 4 }

// Pull a 5-digit ZIP and/or 2-letter state out of a free-text address string.
export function parseDestination(input) {
  const text = String(input || '').trim()
  const zip = (text.match(/\b(\d{5})(?:-\d{4})?\b/) || [])[1] || null
  let state = null
  const stateMatch = text.toUpperCase().match(/\b([A-Z]{2})\b(?!.*\b[A-Z]{2}\b)/)
  if (stateMatch && STATE_ZONES[stateMatch[1]]) state = stateMatch[1]
  return { zip, state, raw: text }
}

// Resolve a destination (parsed or partial) to a distance zone, or null.
export function shippingZone({ zip, state } = {}) {
  if (state && STATE_ZONES[state]) return STATE_ZONES[state]
  if (zip && zip.length >= 1) return ZIP_PREFIX_ZONES[zip[0]] ?? 3
  return null
}

// Estimate shipping options for a destination + cart subtotal.
// Returns { zone, options: [{ id, label, eta, amount, free }] } or null if the
// destination can't be resolved.
export function shippingQuotes(destination, subtotal = 0) {
  const parsed =
    typeof destination === 'string' ? parseDestination(destination) : destination || {}
  const zone = shippingZone(parsed)
  if (!zone) return null
  const rates = ZONE_RATES[zone]
  const etaByZone = {
    1: { standard: '2–3 business days', express: '1 business day' },
    2: { standard: '3–4 business days', express: '2 business days' },
    3: { standard: '4–5 business days', express: '2 business days' },
    4: { standard: '5–7 business days', express: '2–3 business days' },
  }
  const freeStandard = subtotal >= FREE_SHIPPING_THRESHOLD
  return {
    zone,
    options: [
      {
        id: 'standard',
        label: 'Standard',
        eta: etaByZone[zone].standard,
        amount: freeStandard ? 0 : rates.standard,
        free: freeStandard,
      },
      {
        id: 'express',
        label: 'Express',
        eta: etaByZone[zone].express,
        amount: rates.express,
        free: false,
      },
    ],
  }
}
