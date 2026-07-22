import { useState } from 'react'
import { motion } from 'framer-motion'
import { collection, query, where, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Search, Package } from 'lucide-react'

const statusColors = {
  new: 'text-blue-400',
  reviewing: 'text-yellow-400',
  quoted: 'text-purple-400',
  in_progress: 'text-orange-400',
  completed: 'text-green-400',
  cancelled: 'text-red-400',
}

export default function TrackCustomOrder() {
  const { user } = useAuth()
  const [orders, setOrders] = useState(null)

  async function handleSearch(e) {
    e.preventDefault()
    const q = query(collection(db, 'customOrders'), where('customer_id', '==', user.uid))
    const snap = await getDocs(q)
    setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
  }

  return (
    <div className="pt-24 pb-16 max-w-3xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl font-bold gold-text mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Track Custom Orders</h1>

      <button onClick={handleSearch} className="btn-gold mb-6 flex items-center gap-2">
        <Search size={16} /> Load My Custom Orders
      </button>

      {orders && orders.length === 0 && (
        <p className="text-text-muted text-sm">No custom orders found</p>
      )}

      {orders && orders.length > 0 && (
        <div className="space-y-4">
          {orders.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex justify-between items-start mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-text">{o.itemType} — {o.woodType}</h3>
                  <p className="text-xs text-text-muted mt-1">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-semibold uppercase ${statusColors[o.status] || 'text-text-muted'}`}>
                  {o.status?.replace('_', ' ')}
                </span>
              </div>

              {o.dimensions && <p className="text-xs text-text-muted mb-2">Dimensions: {o.dimensions}</p>}
              {o.description && <p className="text-sm text-text-muted mb-3">{o.description}</p>}
              {o.budget && (
                <div className="flex items-center gap-2 text-xs text-text-muted">
                  <span>Budget:</span>
                  <span className="text-gold font-semibold">₹{Number(o.budget).toLocaleString()}</span>
                </div>
              )}
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
