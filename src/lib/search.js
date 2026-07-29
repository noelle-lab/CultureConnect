// Shared catalog search — one place that decides what "search" means so the
// navbar suggestion dropdown and the full results page always agree.
//
// A search matches across a business, a product, a heritage, or basically any
// text we have: names, descriptions, categories, owners, neighborhoods,
// specialties, and the founder story snippets. Splitting the query into words
// means "turkish sweets" or "handwoven oaxaca" both work even though those
// words live in different fields.

function norm(v) {
  return (v ?? '').toString().toLowerCase()
}

// All the text worth searching for one store, joined into a single haystack.
function storeHaystack(store) {
  return [
    store.name,
    store.owner,
    store.ownerName,
    store.heritage,
    store.city,
    store.neighborhood,
    store.story,
    ...(store.specialties || []),
  ]
    .map(norm)
    .join(' ')
}

function productHaystack(product, store) {
  return [
    product.name,
    product.category,
    product.description,
    store?.name,
    store?.heritage,
  ]
    .map(norm)
    .join(' ')
}

// Every term must appear somewhere in the haystack (AND search).
function matchesAll(haystack, terms) {
  return terms.every((t) => haystack.includes(t))
}

export function searchCatalog(query, stores, products, { limit } = {}) {
  const terms = norm(query).split(/\s+/).filter(Boolean)

  if (terms.length === 0) {
    return { stores: [], products: [], heritages: [], empty: true }
  }

  const matchedStores = stores.filter((s) => matchesAll(storeHaystack(s), terms))

  const matchedProducts = products.filter((p) => {
    const store = stores.find((s) => s.id === p.storeId)
    return matchesAll(productHaystack(p, store), terms)
  })

  // Heritages that match on their own (so "vietnamese" surfaces the heritage
  // as a distinct suggestion, not just the shop that happens to have it).
  const heritages = [...new Set(stores.map((s) => s.heritage))]
    .filter(Boolean)
    .filter((h) => matchesAll(norm(h), terms))

  const clamp = (arr) => (limit ? arr.slice(0, limit) : arr)

  return {
    stores: clamp(matchedStores),
    products: clamp(matchedProducts),
    heritages: clamp(heritages),
    empty:
      matchedStores.length === 0 &&
      matchedProducts.length === 0 &&
      heritages.length === 0,
  }
}
