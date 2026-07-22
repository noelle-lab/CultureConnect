import { onlinePrice, COMMISSION_RATE } from './mockData'

// Given an order and the product catalog, compute its economics.
export function orderTotals(order, products) {
  let gross = 0
  let units = 0
  const lines = order.items
    .map((item) => {
      const product = products.find((p) => p.id === item.productId)
      if (!product || item.qty <= 0) return null
      const unit = onlinePrice(product.inPersonPrice)
      const lineTotal = unit * item.qty
      gross += lineTotal
      units += item.qty
      return { ...item, product, unit, lineTotal }
    })
    .filter(Boolean)

  const commission = Math.round(gross * COMMISSION_RATE * 100) / 100
  const payout = Math.round((gross - commission) * 100) / 100
  return { lines, gross, units, commission, payout }
}

// Aggregate a list of orders.
export function aggregate(orders, products) {
  return orders.reduce(
    (acc, o) => {
      const t = orderTotals(o, products)
      acc.gross += t.gross
      acc.commission += t.commission
      acc.payout += t.payout
      acc.units += t.units
      return acc
    },
    { gross: 0, commission: 0, payout: 0, units: 0 },
  )
}

export function money(n) {
  return `$${(Math.round(n * 100) / 100).toLocaleString('en-US', {
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  })}`
}
