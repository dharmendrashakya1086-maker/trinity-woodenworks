import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Package, ArrowRight } from 'lucide-react'

const statusColors = {
  pending: 'text-yellow-400',
  processing: 'text-blue-400',
  shipped: 'text-purple-400',
  delivered: 'text-green-400',
  cancelled: 'text-red-400',
}

export default function Orders() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])

  useEffect(() => {
    async function load() {
      const q = query(collection(db, 'orders'), where('customer_id', '==', user.uid), orderBy('createdAt', 'desc'))
      const snap = await getDocs(q)
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    load()
  }, [user])

  return (
    <div className="pt-24 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
      <h1 className="text-2xl font-bold gold-text mb-8" style={{ fontFamily: 'var(--font-heading)' }}>My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={48} className="mx-auto text-text-muted mb-4" />
          <p className="text-text-muted mb-4">No orders yet</p>
          <Link to="/shop" className="btn-gold no-underline inline-flex items-center gap-2">
            Start Shopping <ArrowRight size={16} />
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {orders.map((o, i) => (
            <motion.div
              key={o.id}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
              className="glass rounded-2xl p-5"
            >
              <div className="flex flex-wrap items-start justify-between gap-4 mb-3">
                <div>
                  <p className="text-xs text-text-muted">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-xs text-text-muted mt-1">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`text-xs font-semibold uppercase ${statusColors[o.status] || 'text-text-muted'}`}>
                  {o.status}
                </span>
              </div>

              <div className="flex flex-wrap gap-3 mb-3">
                {o.items?.slice(0, 3).map((item, j) => (
                  <div key={j} className="flex items-center gap-2">
                    <img src={item.image || '/placeholder.jpg'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div>
                      <p className="text-xs text-text truncate max-w-[150px]">{item.name}</p>
                      <p className="text-xs text-text-muted">×{item.qty}</p>
                    </div>
                  </div>
                ))}
                {o.items?.length > 3 && (
                  <span className="text-xs text-text-muted self-center">+{o.items.length - 3} more</span>
                )}
              </div>

              <div className="flex justify-between items-center pt-3 border-t border-dark-border">
                <span className="text-sm font-bold text-gold">₹{o.total?.toLocaleString()}</span>
                <Link to={`/track-order?id=${o.id}`} className="text-xs text-gold hover:underline no-underline">
                  Track Order →
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
