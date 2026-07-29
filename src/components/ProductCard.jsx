import { Link } from 'react-router-dom'
import { useApp } from '../context/AppContext'
import { onlinePrice } from '../data/mockData'

export default function ProductCard({ product }) {
  const { publishedStores: stores, addToCart } = useApp()
  const store = stores.find((s) => s.id === product.storeId)
  const price = onlinePrice(product.inPersonPrice)

  return (
    <div className="product-card">
      <Link to={`/product/${product.id}`} className="product-thumb">
        {product.image ? (
          <img src={product.image} alt={product.name} loading="lazy" />
        ) : (
          <span className="thumb-fallback">{product.name?.charAt(0) || '?'}</span>
        )}
      </Link>
      <div className="product-body">
        <span className="product-store">
          {store?.name} · {store?.heritage}
        </span>
        <Link to={`/product/${product.id}`} className="product-name">
          {product.name}
        </Link>
        <span className="product-cat">{product.category}</span>
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
