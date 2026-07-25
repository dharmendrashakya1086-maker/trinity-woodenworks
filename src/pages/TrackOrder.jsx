import { useState } from 'react'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Search, Package } from 'lucide-react'

const steps = ['pending', 'processing', 'shipped', 'delivered']

export default function TrackOrder() {
  const { user } = useAuth()
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    setSearched(true)
    const q = query(collection(db, 'orders'), where('customer_id', '==', user.uid))
    const snap = await getDocs(q)
    const found = snap.docs.find(d => d.id === orderId || d.id.startsWith(orderId))
    setOrder(found ? { id: found.id, ...found.data() } : null)
  }

  return (
    <div className="pt-20 pb-16 max-w-2xl mx-auto px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold gold-text mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Track Order</h1>

      <form onSubmit={handleSearch} className="glass rounded-xl p-4 mb-6">
        <div className="flex gap-3">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={15} />
            <input placeholder="Enter Order ID" value={orderId} onChange={e => setOrderId(e.target.value)} className="input-field pl-10 text-sm" />
          </div>
          <button type="submit" className="btn-gold text-sm px-5">Track</button>
        </div>
      </form>

      {order && (
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-5">
          <div className="flex items-center gap-2 mb-4">
            <Package size={18} className="text-gold" />
            <div>
              <p className="text-sm font-semibold text-text">Order #{order.id.slice(0, 8).toUpperCase()}</p>
              <p className="text-[11px] text-text-dim">{new Date(order.createdAt).toLocaleDateString()}</p>
            </div>
          </div>

          <div className="flex items-center gap-1 mb-5">
            {steps.map((step, i) => {
              const currentIdx = steps.indexOf(order.status)
              const isActive = i <= currentIdx
              return (
                <div key={step} className="flex-1 flex flex-col items-center gap-1">
                  <div className={`w-full h-1.5 rounded-full transition-all ${isActive ? 'bg-gold' : 'bg-white/[0.05]'}`} />
                  <span className={`text-[9px] capitalize ${isActive ? 'text-gold' : 'text-text-dim'}`}>{step}</span>
                </div>
              )
            })}
          </div>

          <div className="space-y-2 mb-4">
            {order.items?.map((item, j) => (
              <div key={j} className="flex items-center gap-3">
                <img src={item.image || '/placeholder.svg'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                <div className="flex-1"><p className="text-sm text-text">{item.name}</p><p className="text-[11px] text-text-muted">×{item.qty}</p></div>
                <span className="text-sm text-gold">₹{(item.price * item.qty).toLocaleString()}</span>
              </div>
            ))}
          </div>

          <div className="flex justify-between items-center pt-3 border-t border-white/[0.04]">
            <span className="text-sm text-text-muted">Total</span>
            <span className="text-lg font-bold text-gold">₹{order.total?.toLocaleString()}</span>
          </div>
        </motion.div>
      )}

      {searched && !order && <p className="text-center text-text-muted text-sm">No order found</p>}
    </div>
  )
}
