import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { collection, getDocs, doc, updateDoc, query, orderBy } from 'firebase/firestore'
import { db } from '../../config/firebase'
import toast from 'react-hot-toast'
import { Search, Eye, Package, ChevronLeft, ChevronRight } from 'lucide-react'

const statusOptions = ['pending', 'processing', 'shipped', 'delivered', 'cancelled']
const statusColors = {
  pending: 'badge-gold', processing: 'badge-blue', shipped: 'badge-blue',
  delivered: 'badge-green', cancelled: 'badge-red',
}

export default function Orders() {
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(1)
  const perPage = 10

  useEffect(() => {
    async function load() {
      const snap = await getDocs(query(collection(db, 'orders'), orderBy('createdAt', 'desc')))
      setOrders(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    load()
  }, [])

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.id.includes(search) || o.customer_email?.includes(search)
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })
  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  async function updateStatus(id, status) {
    await updateDoc(doc(db, 'orders', id), { status })
    setOrders(orders.map(o => o.id === id ? { ...o, status } : o))
    toast.success('Status updated')
  }

  return (
    <div>
      <h1 className="text-xl font-bold gold-text mb-4" style={{ fontFamily: 'var(--font-heading)' }}>Orders</h1>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
          <input placeholder="Search by ID or email..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-xs w-full" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field text-xs w-auto">
          <option value="">All Status</option>
          {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
        </select>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Order</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Customer</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Items</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Total</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Status</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(o => (
                <motion.tr key={o.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="py-2 px-3">
                    <p className="text-xs text-text font-medium">#{o.id.slice(0, 8).toUpperCase()}</p>
                    <p className="text-[10px] text-text-dim">{new Date(o.createdAt).toLocaleDateString()}</p>
                  </td>
                  <td className="py-2 px-3 text-[11px] text-text-muted">{o.customer_email || '—'}</td>
                  <td className="py-2 px-3 text-[11px] text-text-muted">{o.items?.length || 0}</td>
                  <td className="py-2 px-3 text-xs text-gold font-semibold">₹{o.total?.toLocaleString()}</td>
                  <td className="py-2 px-3">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      className="bg-transparent border-none text-[10px] text-text cursor-pointer p-0">
                      {statusOptions.map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
                    </select>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <button onClick={() => setSelected(o)} className="p-1.5 glass rounded-lg hover:bg-gold-dim"><Eye size={12} className="text-gold" /></button>
                  </td>
                </motion.tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-4">
          <button onClick={() => setPage(p => Math.max(1, p - 1))} disabled={page === 1} className="p-1.5 glass rounded-lg disabled:opacity-30"><ChevronLeft size={14} className="text-text-muted" /></button>
          <span className="text-[11px] text-text-muted">{page}/{totalPages}</span>
          <button onClick={() => setPage(p => Math.min(totalPages, p + 1))} disabled={page === totalPages} className="p-1.5 glass rounded-lg disabled:opacity-30"><ChevronRight size={14} className="text-text-muted" /></button>
        </div>
      )}

      <AnimatePresence>
        {selected && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text">Order #{selected.id.slice(0, 8).toUpperCase()}</h3>
                <span className={`badge ${statusColors[selected.status]} text-[9px]`}>{selected.status}</span>
              </div>
              <div className="space-y-2 mb-4">
                {selected.items?.map((item, j) => (
                  <div key={j} className="flex items-center gap-3 bg-white/[0.02] rounded-lg p-2.5">
                    <img src={item.image || '/placeholder.svg'} alt="" className="w-10 h-10 rounded-lg object-cover" />
                    <div className="flex-1">
                      <p className="text-xs text-text">{item.name}</p>
                      <p className="text-[10px] text-text-muted">₹{item.price?.toLocaleString()} × {item.qty}</p>
                    </div>
                    <span className="text-xs text-gold">₹{(item.price * item.qty).toLocaleString()}</span>
                  </div>
                ))}
              </div>
              {selected.shippingAddress && (
                <div className="bg-white/[0.02] rounded-lg p-3 mb-3">
                  <p className="text-[10px] text-text-dim mb-1">Shipping Address</p>
                  <p className="text-xs text-text">{selected.shippingAddress}</p>
                </div>
              )}
              <div className="flex justify-between items-center pt-3 border-t border-white/[0.04]">
                <span className="text-xs text-text-muted">Total</span>
                <span className="text-lg font-bold text-gold">₹{selected.total?.toLocaleString()}</span>
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
