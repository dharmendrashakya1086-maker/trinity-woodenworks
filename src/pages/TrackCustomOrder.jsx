import { useState } from 'react'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Search, Hammer } from 'lucide-react'

const steps = ['pending', 'reviewing', 'crafting', 'completed']

export default function TrackCustomOrder() {
  const { user } = useAuth()
  const [orderId, setOrderId] = useState('')
  const [order, setOrder] = useState(null)
  const [searched, setSearched] = useState(false)

  async function handleSearch(e) {
    e.preventDefault()
    setSearched(true)
    const q = query(collection(db, 'customOrders'), where('customer_id', '==', user.uid))
    const snap = await getDocs(q)
    const found = snap.docs.find(d => d.id === orderId || d.id.startsWith(orderId))
    setOrder(found ? { id: found.id, ...found.data() } : null)
  }

  return (
    <div className="pt-20 pb-16 max-w-2xl mx-auto px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold gold-text mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Track Custom Order</h1>

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
            <Hammer size={18} className="text-gold" />
            <div>
              <p className="text-sm font-semibold text-text">{order.title}</p>
              <p className="text-[11px] text-text-dim">#{order.id.slice(0, 8).toUpperCase()} • {new Date(order.createdAt).toLocaleDateString()}</p>
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

          <div className="space-y-3">
            <div className="bg-white/[0.02] rounded-lg p-3">
              <p className="text-[11px] text-text-dim mb-1">Description</p>
              <p className="text-sm text-text">{order.description}</p>
            </div>
            <div className="grid grid-cols-3 gap-3">
              <div className="bg-white/[0.02] rounded-lg p-3">
                <p className="text-[11px] text-text-dim mb-1">Wood</p>
                <p className="text-sm text-text">{order.woodType}</p>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-3">
                <p className="text-[11px] text-text-dim mb-1">Dimensions</p>
                <p className="text-sm text-text">{order.dimensions || '—'}</p>
              </div>
              <div className="bg-white/[0.02] rounded-lg p-3">
                <p className="text-[11px] text-text-dim mb-1">Budget</p>
                <p className="text-sm text-gold">{order.budget ? `₹${Number(order.budget).toLocaleString()}` : '—'}</p>
              </div>
            </div>
          </div>
        </motion.div>
      )}

      {searched && !order && <p className="text-center text-text-muted text-sm">No custom order found</p>}
    </div>
  )
}
