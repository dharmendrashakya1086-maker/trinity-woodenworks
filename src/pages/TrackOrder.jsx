import { useState } from 'react'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Search, Package } from 'lucide-react'

const statusSteps = ['pending', 'processing', 'shipped', 'delivered']

export default function TrackOrder() {
  const { user } = useAuth()
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState(null)
  const [searching, setSearching] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    setSearching(true)
    const q = query(collection(db, 'orders'), where('customer_id', '==', user.uid))
    const snap = await getDocs(q)
    const found = snap.docs.find(d => d.id === orderId || d.id.startsWith(orderId))
    setOrder(found ? { id: found.id, ...found.data() } : null)
    setSearching(false)
  }

  return (
    <div className="pt-24 pb-16 max-w-2xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl font-bold gold-text mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Track Order</h1>

      <form onSubmit={handleSearch} className="glass rounded-2xl p-6 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input
              placeholder="Enter Order ID"
              value={orderId}
              onChange={e => setOrderId(e.target.value)}
              className="input-field pl-10"
            />
          </div>
          <button type="submit" disabled={searching} className="btn-gold">
            {searching ? 'Searching...' : 'Track'}
          </button>
        </div>
      </form>

      {order && (
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-2xl p-6">
          <div className="flex items-center gap-3 mb-6">
            <Package size={24} className="text-gold" />
            <div>
              <p className="text-sm font-semibold text-text">Order #{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-xs text-text-muted">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          {/* Progress Bar */}
          <div className="flex items-center gap-2 mb-6">
            {statusSteps.map((step, i) => {
              const currentIdx = statusSteps.indexOf(order.status)
              const isActive = i <= currentIdx
              return (
                <div key={step} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full h-2 rounded-full transition-all ${isActive ? 'bg-gold' : 'bg-dark-border'}`} />
                  <span className={`text-[10px] capitalize ${isActive ? 'text-gold' : 'text-text-muted'}`}>{step}</span>
                </div>
              )
            })}
          </div>

          {/* Items */}
          <div className="space-y-3 mb-6">
            {order.items?.map((item, j) => (
              <div key={j} className="flex items-center gap-3">
                <img src={item.image || '/placeholder.jpg'} alt="" className="w-12 h-12 rounded-lg object-cover" />
                <div className="flex-1">
                  <p className="text-sm text-text">{item.name}</p>
                  <p className="text-xs text-text-muted">×{item.qty}</p>
                </div>
                <span className="text-sm text-gold">₹{(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-4 border-t border-dark-border">
            <span className="text-sm text-text-muted">Total</span>
            <span className="text-lg font-bold text-gold">₹{order.total?.toLocaleString()}</span>
          </div>
        </motion.div>
      )}

      {order === null && !searching && orderId && (
        <p className="text-center text-text-muted text-sm">No order found with this ID</p>
      )}
    </div>
  )
}
