import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../contexts/CartContext'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'

export default function Cart() {
  const { items, updateQty, removeItem, total, count, clearCart } = useCart()

  if (items.length === 0) return (
    <div className="pt-20 pb-16 max-w-4xl mx-auto px-4 text-center min-h-[60vh] flex flex-col items-center justify-center">
      <div className="w-20 h-20 rounded-full bg-white/[0.03] border border-white/[0.06] flex items-center justify-center mb-5">
        <ShoppingBag size={32} className="text-text-dim" />
      </div>
      <h1 className="text-xl font-bold text-text mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Your cart is empty</h1>
      <p className="text-text-muted text-sm mb-6">Add some products to get started</p>
      <Link to="/shop" className="btn-gold no-underline inline-flex items-center gap-2">
        Browse Products <ArrowRight size={16} />
      </Link>
    </div>
  )

  return (
    <div className="pt-20 pb-16 max-w-5xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-xl sm:text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>
          Shopping Cart ({count})
        </h1>
        <button onClick={clearCart} aria-label="Clear all items from cart" className="btn-danger text-xs">Clear Cart</button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Items */}
        <div className="lg:col-span-2 space-y-3">
          {items.map((item, i) => (
            <motion.div
              key={item.id}
              initial={{ opacity: 0, y: 15 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4 flex gap-4"
            >
              <img src={item.image || '/placeholder.svg'} alt={item.name} className="w-20 h-20 rounded-lg object-cover shrink-0" />
              <div className="flex-1 min-w-0">
                <h3 className="text-sm font-semibold text-text truncate">{item.name}</h3>
                <p className="text-gold font-bold text-sm mt-0.5">₹{item.price?.toLocaleString()}</p>
                <div className="flex items-center gap-3 mt-2">
                  <div className="qty-controls">
                    <button onClick={() => updateQty(item.id, item.qty - 1)} aria-label={`Decrease quantity of ${item.name}`}><Minus size={12} /></button>
                    <span className="text-xs" aria-label={`Quantity: ${item.qty}`}>{item.qty}</span>
                    <button onClick={() => updateQty(item.id, item.qty + 1)} aria-label={`Increase quantity of ${item.name}`}><Plus size={12} /></button>
                  </div>
                  <button onClick={() => removeItem(item.id)} aria-label={`Remove ${item.name} from cart`} className="text-text-dim hover:text-red-400 bg-transparent transition-colors">
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>
              <span className="text-sm font-bold text-gold shrink-0">₹{(item.price * item.qty).toLocaleString()}</span>
            </motion.div>
          ))}
        </div>

        {/* Summary */}
        <div className="lg:col-span-1">
          <div className="glass rounded-xl p-5 sticky top-20">
            <h3 className="text-sm font-semibold text-text mb-4">Order Summary</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between text-text-muted">
                <span>Subtotal ({count} items)</span>
                <span className="text-text">₹{total.toLocaleString()}</span>
              </div>
              <div className="flex justify-between text-text-muted">
                <span>Shipping</span>
                <span className="text-accent-green">{total >= 5000 ? 'Free' : '₹99'}</span>
              </div>
              <div className="border-t border-white/[0.05] pt-3 flex justify-between">
                <span className="font-semibold text-text">Total</span>
                <span className="text-lg font-bold text-gold">₹{(total >= 5000 ? total : total + 99).toLocaleString()}</span>
              </div>
            </div>
            <Link to="/checkout" className="btn-gold w-full flex items-center justify-center gap-2 no-underline mt-5">
              Proceed to Checkout <ArrowRight size={16} />
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
