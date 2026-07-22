import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useCart } from '../contexts/CartContext'
import { Trash2, Plus, Minus, ShoppingBag, ArrowRight } from 'lucide-react'

export default function Cart() {
  const { items, updateQty, removeItem, total, count, clearCart } = useCart()

  if (items.length === 0) return (
    <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 text-center">
      <ShoppingBag size={48} className="mx-auto text-text-muted mb-4" />
      <h1 className="text-2xl font-bold text-text mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Your cart is empty</h1>
      <p className="text-text-muted text-sm mb-6">Add some products to get started</p>
      <Link to="/shop" className="btn-gold no-underline inline-flex items-center gap-2">
        Browse Products <ArrowRight size={16} />
      </Link>
    </div>
  )

  return (
    <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>
          Shopping Cart ({count})
        </h1>
        <button onClick={clearCart} className="text-xs text-red-400 hover:text-red-300 bg-transparent border-none cursor-pointer">
          Clear Cart
        </button>
      </div>

      <div className="space-y-4">
        {items.map((item, i) => (
          <motion.div
            key={item.id}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            className="glass rounded-2xl p-4 flex gap-4"
          >
            <img src={item.image || '/placeholder.jpg'} alt={item.name} className="w-20 h-20 rounded-xl object-cover" />
            <div className="flex-1 min-w-0">
              <h3 className="text-sm font-semibold text-text truncate">{item.name}</h3>
              <p className="text-gold font-bold text-sm mt-1">₹{item.price?.toLocaleString()}</p>
              <div className="flex items-center gap-2 mt-2">
                <button onClick={() => updateQty(item.id, item.qty - 1)} className="w-7 h-7 glass rounded-md flex items-center justify-center text-text-muted hover:text-gold bg-transparent border-none cursor-pointer">
                  <Minus size={14} />
                </button>
                <span className="text-sm font-semibold text-text w-6 text-center">{item.qty}</span>
                <button onClick={() => updateQty(item.id, item.qty + 1)} className="w-7 h-7 glass rounded-md flex items-center justify-center text-text-muted hover:text-gold bg-transparent border-none cursor-pointer">
                  <Plus size={14} />
                </button>
              </div>
            </div>
            <div className="flex flex-col items-end justify-between">
              <button onClick={() => removeItem(item.id)} className="text-text-muted hover:text-red-400 bg-transparent border-none cursor-pointer transition-colors">
                <Trash2 size={16} />
              </button>
              <span className="text-sm font-bold text-gold">₹{(item.price * item.qty).toLocaleString()}</span>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Summary */}
      <div className="glass rounded-2xl p-6 mt-6">
        <div className="flex justify-between items-center mb-4">
          <span className="text-text-muted">Subtotal</span>
          <span className="text-lg font-bold text-gold">₹{total.toLocaleString()}</span>
        </div>
        <div className="flex justify-between items-center mb-6 text-sm text-text-muted">
          <span>Shipping</span>
          <span>{total >= 5000 ? 'Free' : 'Calculated at checkout'}</span>
        </div>
        <Link to="/checkout" className="btn-gold w-full flex items-center justify-center gap-2 no-underline">
          Proceed to Checkout <ArrowRight size={16} />
        </Link>
      </div>
    </div>
  )
}
