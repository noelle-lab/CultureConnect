import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { onlinePrice } from '../data/mockData'

export default function ProductCard({ product }) {
  const { stores, addToCart } = useApp()
  const store = stores.find((s) => s.id === product.storeId)
  const price = onlinePrice(product.inPersonPrice)

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-thumb">
        {product.emoji}
      </Link>
      <div className="product-body">
        <span className="product-store">
          {store?.emoji} {store?.name} · {store?.heritage}
        </span>
        <Link to={`/product/${product.id}`} className="product-name">
          {product.name}
        </Link>
        <div className="chip-row">
          {product.crosslisted.includes('etsy') && (
            <span className="badge badge-etsy">Etsy</span>
          )}
          {product.crosslisted.includes('ebay') && (
            <span className="badge badge-ebay">eBay</span>
          )}
          <span className="badge badge-culture">{product.category}</span>
        </div>
        <div className="product-foot">
          <span className="price">${price.toFixed(2)}</span>
          <button
            className="btn btn-primary btn-sm"
            onClick={() => addToCart(product.id)}
          >
            Add
          </button>
        </div>
      </div>
    </div>
  )
}
