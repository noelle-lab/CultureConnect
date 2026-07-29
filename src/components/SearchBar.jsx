import { useEffect, useMemo, useRef, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { searchCatalog } from '../lib/search'

// Rotating "suggested search" prompts. These show as grey placeholder text and
// cycle every few seconds so the bar quietly hints at the kinds of things you
// can search — businesses, products, heritages, or anything else. A few are
// filled in from the live catalog so the examples always match what's on sale.
function buildPlaceholders(stores, products) {
  const heritages = [...new Set(stores.map((s) => s.heritage))].filter(Boolean)
  const specialties = [
    ...new Set(stores.flatMap((s) => s.specialties || [])),
  ].filter(Boolean)

  const pick = (arr, n) => arr.slice(0, n)

  const prompts = [
    'Search a business, product, or heritage…',
    ...pick(heritages, 3).map((h) => `Search for ${h} shops…`),
    ...pick(specialties, 3).map((sp) => `Search for ${sp.toLowerCase()}…`),
    stores[0] && `Search for “${stores[0].name}”…`,
    products[0] && `Search for “${products[0].name.split('(')[0].trim()}”…`,
    'Search by anything — tea, pottery, spices…',
  ].filter(Boolean)

  // De-dupe while keeping order.
  return [...new Set(prompts)]
}

export default function SearchBar({ variant = 'nav' }) {
  const { publishedStores: stores, publishedProducts: products } = useApp()
  const navigate = useNavigate()

  const [query, setQuery] = useState('')
  const [open, setOpen] = useState(false)
  const [focused, setFocused] = useState(false)
  const [phIndex, setPhIndex] = useState(0)
  const wrapRef = useRef(null)

  const placeholders = useMemo(
    () => buildPlaceholders(stores, products),
    [stores, products],
  )

  // Rotate the grey placeholder text — but hold still while the user is
  // actually typing or focused, so it never yanks a prompt out from under them.
  useEffect(() => {
    if (focused || query) return
    const t = setInterval(() => {
      setPhIndex((i) => (i + 1) % placeholders.length)
    }, 3200)
    return () => clearInterval(t)
  }, [focused, query, placeholders.length])

  // Live suggestions as you type (businesses + products + heritages).
  const suggestions = useMemo(() => {
    if (query.trim().length < 1) return null
    return searchCatalog(query, stores, products, { limit: 6 })
  }, [query, stores, products])

  // Close the dropdown on an outside click.
  useEffect(() => {
    function onClick(e) {
      if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false)
    }
    document.addEventListener('mousedown', onClick)
    return () => document.removeEventListener('mousedown', onClick)
  }, [])

  function goToResults(q) {
    const term = (q ?? query).trim()
    if (!term) return
    setOpen(false)
    navigate(`/search?q=${encodeURIComponent(term)}`)
  }

  function handleSubmit(e) {
    e.preventDefault()
    goToResults()
  }

  function handleKeyDown(e) {
    if (e.key === 'Escape') setOpen(false)
  }

  const showDropdown = open && !!suggestions

  return (
    <form
      className={`search-bar search-bar-${variant}`}
      ref={wrapRef}
      onSubmit={handleSubmit}
      role="search"
    >
      <input
        className="search-input"
        type="search"
        aria-label="Search businesses, products, and heritages"
        value={query}
        placeholder={placeholders[phIndex]}
        onChange={(e) => {
          setQuery(e.target.value)
          setOpen(true)
        }}
        onFocus={() => {
          setFocused(true)
          setOpen(true)
        }}
        onBlur={() => setFocused(false)}
        onKeyDown={handleKeyDown}
      />
      {query && (
        <button
          type="button"
          className="search-clear"
          aria-label="Clear search"
          onClick={() => {
            setQuery('')
            setOpen(false)
          }}
        >
          ×
        </button>
      )}

      {showDropdown && (
        <div className="search-suggest" role="listbox">
          <button
            type="button"
            className="suggest-row suggest-all"
            onMouseDown={(e) => e.preventDefault()}
            onClick={() => goToResults()}
          >
            <span className="suggest-text">
              Search for “<strong>{query.trim()}</strong>”
            </span>
          </button>

          {suggestions.heritages.length > 0 && (
            <div className="suggest-group">
              <div className="suggest-label">Heritage</div>
              {suggestions.heritages.map((h) => (
                <button
                  key={`h-${h}`}
                  type="button"
                  className="suggest-row"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => goToResults(h)}
                >
                  <span className="suggest-text">{h}</span>
                </button>
              ))}
            </div>
          )}

          {suggestions.stores.length > 0 && (
            <div className="suggest-group">
              <div className="suggest-label">Businesses</div>
              {suggestions.stores.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className="suggest-row"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setOpen(false)
                    navigate(`/store/${s.id}`)
                  }}
                >
                  <span className="suggest-thumb">
                    {s.image ? (
                      <img src={s.image} alt="" />
                    ) : (
                      s.name?.charAt(0) || '?'
                    )}
                  </span>
                  <span className="suggest-text">
                    {s.name}
                    <span className="suggest-sub">{s.heritage}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {suggestions.products.length > 0 && (
            <div className="suggest-group">
              <div className="suggest-label">Products</div>
              {suggestions.products.map((p) => (
                <button
                  key={p.id}
                  type="button"
                  className="suggest-row"
                  onMouseDown={(e) => e.preventDefault()}
                  onClick={() => {
                    setOpen(false)
                    navigate(`/product/${p.id}`)
                  }}
                >
                  <span className="suggest-thumb">
                    {p.image ? (
                      <img src={p.image} alt="" />
                    ) : (
                      p.name?.charAt(0) || '?'
                    )}
                  </span>
                  <span className="suggest-text">
                    {p.name}
                    <span className="suggest-sub">{p.category}</span>
                  </span>
                </button>
              ))}
            </div>
          )}

          {suggestions.empty && (
            <div className="suggest-empty muted">
              No matches yet — press Enter to search everything.
            </div>
          )}
        </div>
      )}
    </form>
  )
}
