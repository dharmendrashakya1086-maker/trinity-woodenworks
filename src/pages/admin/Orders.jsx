import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { collection, getDocs, updateDoc, doc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import toast from 'react-hot-toast'
import { Package, Search } from 'lucide-react'

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const statusColors = {
  pending: 'text-yellow-400 bg-yellow-400/10',
  processing: 'text-blue-400 bg-blue-400/10',
  shipped: 'text-purple-400 bg-purple-400/10',
  delivered: 'text-green-400 bg-green-400/10',
  cancelled: 'text-red-400 bg-red-400/10',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')

  async function load() {
    const snap = await getDocs(collection(db, 'orders'))
    setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })).sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)))
  }

  useEffect(() => { load() }, [])

  async function updateStatus(id, status) {
    await updateDoc(doc(db, 'orders', id), { status })
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o))
    toast.success('Status updated!')
  }

  const filtered = orders.filter(o =>
    o.id.includes(search) || o.customer_name?.toLowerCase().includes(search.toLowerCase()) || o.customer_email?.toLowerCase().includes(search.toLowerCase())
  )

  return (
    <div>
      <h1 className="text-2xl font-bold gold-text mb-6" style={{ fontFamily: 'var(--font-heading)' }}>Orders</h1>

      <div className="relative mb-6 max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
        <input placeholder="Search by ID, name, or email..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-10" />
      </div>

      <div className="space-y-4">
        {filtered.map((o, i) => (
          <motion.div
            key={o.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.03 }}
            className="glass rounded-2xl p-5"
          >
            <div className="flex flex-wrap items-start justify-between gap-4 mb-4">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Package size={16} className="text-gold" />
                  <span className="text-xs text-text-muted">#{o.id.slice(0, 8).toUpperCase()}</span>
                </div>
                <p className="text-sm font-medium text-text">{o.customer_name || 'Unknown'}</p>
                <p className="text-xs text-text-muted">{o.customer_email}</p>
                <p className="text-xs text-text-muted mt-1">{new Date(o.createdAt).toLocaleString()}</p>
              </div>

              <select
                value={o.status}
                onChange={e => updateStatus(o.id, e.target.value)}
                className={`text-xs font-semibold px-3 py-1.5 rounded-lg border-none cursor-pointer ${statusColors[o.status] || 'text-text-muted bg-white/5'}`}
                style={{ background: 'rgba(255,255,255,0.05)' }}
              >
                {statusOptions.map(s => <option key={s} value={s}>{s}</option>)}
              </select>
            </div>

            {/* Items */}
            <div className="flex flex-wrap gap-3 mb-4">
              {o.items?.map((item, j) => (
                <div key={j} className="flex items-center gap-2 bg-white/5 rounded-lg px-2 py-1">
                  <img src={item.image || '/placeholder.jpg'} alt="" className="w-8 h-8 rounded object-cover" />
                  <span className="text-xs text-text-muted">{item.name} ×{item.qty}</span>
                </div>
              ))}
            </div>

            <div className="flex justify-between items-center pt-3 border-t border-dark-border">
              <span className="text-sm text-text-muted capitalize">{o.paymentMethod || 'COD'}</span>
              <span className="text-sm font-bold text-gold">₹{o.total?.toLocaleString()}</span>
            </div>

            {o.shipping && (
              <p className="text-xs text-text-muted mt-2">
                📍 {o.shipping.address}, {o.shipping.city}, {o.shipping.state} - {o.shipping.pincode}
              </p>
            )}
          </motion.div>
        ))}
      </div>
    </div>
  )
}
