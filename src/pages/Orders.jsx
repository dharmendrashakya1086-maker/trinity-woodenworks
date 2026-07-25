import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, query, where, orderBy, getDocs } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import { Package, ArrowRight } from 'lucide-react'

const statusColors = {
  pending: 'badge-gold', processing: 'badge-blue', shipped: 'badge-blue',
  delivered: 'badge-green', cancelled: 'badge-red',
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
    <div className="pt-20 pb-16 max-w-4xl mx-auto px-4 sm:px-6">
      <h1 className="text-xl sm:text-2xl font-bold gold-text mb-6" style={{ fontFamily: 'var(--font-heading)' }}>My Orders</h1>

      {orders.length === 0 ? (
        <div className="text-center py-16">
          <Package size={40} className="mx-auto text-text-dim mb-4" />
          <p className="text-text-muted text-sm mb-4">No orders yet</p>
          <Link to="/shop" className="btn-gold no-underline inline-flex items-center gap-2 text-sm">
            Start Shopping <ArrowRight size={14} />
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {orders.map((o, i) => (
            <motion.div key={o.id} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
              className="glass rounded-xl p-4">
              <div className="flex flex-wrap items-start justify-between gap-3 mb-3">
                <div>
                  <p className="text-[11px] text-text-muted">Order #{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-[11px] text-text-dim mt-0.5">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <span className={`badge ${statusColors[o.status] || 'badge-gold'} text-[10px]`}>{o.status}</span>
              </div>
              <div className="flex flex-wrap gap-2 mb-3">
                {o.items?.slice(0, 3).map((item, j) => (
                  <div key={j} className="flex items-center gap-2 bg-white/[0.02] rounded-lg px-2 py-1">
                    <img src={item.image || '/placeholder.svg'} alt="" className="w-8 h-8 rounded object-cover" />
                    <span className="text-[11px] text-text-muted">{item.name} ×{item.qty}</span>
                  </div>
                ))}
              </div>
              <div className="flex justify-between items-center pt-2 border-t border-white/[0.04]">
                <span className="text-sm font-bold text-gold">₹{o.total?.toLocaleString()}</span>
                <Link to={`/track-order?id=${o.id}`} className="text-[11px] text-gold hover:underline no-underline">Track →</Link>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </div>
  )
}
