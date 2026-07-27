import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getEntities, getAuditLog } from '../../lib/firestore'
import { Search, User, Mail, Phone, MapPin, Eye, Calendar, ChevronLeft, ChevronRight } from 'lucide-react'

export default function Customers() {
  const [customers, setCustomers] = useState([])
  const [orders, setOrders] = useState([])
  const [search, setSearch] = useState('')
  const [selected, setSelected] = useState(null)
  const [page, setPage] = useState(1)
  const perPage = 12

  useEffect(() => {
    async function load() {
      const [c, o] = await Promise.all([getEntities('customers'), getEntities('orders')])
      setCustomers(c)
      setOrders(o)
    }
    load()
  }, [])

  function getCustomerOrders(email) {
    return orders.filter(o => o.customer_email === email || o.userId === email)
  }

  function getTotalSpent(email) {
    return getCustomerOrders(email).reduce((s, o) => s + (o.total || 0), 0)
  }

  const filtered = customers.filter(c => {
    const matchSearch = !search ||
      c.name?.toLowerCase().includes(search.toLowerCase()) ||
      c.email?.toLowerCase().includes(search.toLowerCase()) ||
      c.phone?.includes(search)
    return matchSearch
  })

  const totalPages = Math.ceil(filtered.length / perPage)
  const paginated = filtered.slice((page - 1) * perPage, page * perPage)

  return (
    <div>
      <h1 className="text-xl font-bold gold-text mb-5" style={{ fontFamily: 'var(--font-heading)' }}>Customers</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-5">
        {[
          { label: 'Total Customers', value: customers.length },
          { label: 'Total Orders', value: orders.length },
          { label: 'Total Revenue', value: `₹${orders.reduce((s, o) => s + (o.total || 0), 0).toLocaleString()}` },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-3">
            <span className="text-[10px] text-text-muted">{s.label}</span>
            <p className="text-lg font-bold text-text">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="relative flex-1 min-w-[200px] mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
        <input placeholder="Search by name, email, or phone..." value={search} onChange={e => { setSearch(e.target.value); setPage(1) }}
          className="input-field pl-9 text-xs w-full" />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Customer</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Contact</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Orders</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Total Spent</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Joined</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(c => {
                const cOrders = getCustomerOrders(c.email || c.id)
                return (
                  <motion.tr key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                    className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                    <td className="py-2 px-3">
                      <div className="flex items-center gap-2">
                        <div className="w-7 h-7 rounded-full bg-gold-dim flex items-center justify-center text-[10px] text-gold font-bold">
                          {c.name?.[0]?.toUpperCase() || <User size={12} />}
                        </div>
                        <span className="text-xs text-text">{c.name || 'Unknown'}</span>
                      </div>
                    </td>
                    <td className="py-2 px-3">
                      <p className="text-[11px] text-text-muted">{c.email || '—'}</p>
                      <p className="text-[10px] text-text-dim">{c.phone || ''}</p>
                    </td>
                    <td className="py-2 px-3 text-[11px] text-text-muted">{cOrders.length}</td>
                    <td className="py-2 px-3 text-xs text-gold font-semibold">₹{getTotalSpent(c.email || c.id).toLocaleString()}</td>
                    <td className="py-2 px-3 text-[10px] text-text-dim">{c.createdAt ? new Date(c.createdAt).toLocaleDateString() : '—'}</td>
                    <td className="py-2 px-3 text-right">
                      <button onClick={() => setSelected(c)} className="p-1.5 glass rounded-lg hover:bg-gold-dim" aria-label="View customer">
                        <Eye size={12} className="text-gold" />
                      </button>
                    </td>
                  </motion.tr>
                )
              })}
              {paginated.length === 0 && (
                <tr><td colSpan={6} className="py-8 text-center text-text-dim text-xs">No customers found</td></tr>
              )}
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

      {/* Customer Detail Modal */}
      {selected && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setSelected(null)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-5 max-w-lg w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="flex items-center gap-3 mb-4">
              <div className="w-10 h-10 rounded-full bg-gold-dim flex items-center justify-center text-sm text-gold font-bold">
                {selected.name?.[0]?.toUpperCase() || <User size={16} />}
              </div>
              <div>
                <h3 className="text-sm font-semibold text-text">{selected.name || 'Unknown'}</h3>
                <p className="text-[10px] text-text-muted">{selected.email}</p>
              </div>
            </div>

            <div className="space-y-3 mb-4">
              {selected.phone && (
                <div className="flex items-center gap-2 text-[11px] text-text-muted">
                  <Phone size={12} /> {selected.phone}
                </div>
              )}
              {selected.address && (
                <div className="flex items-center gap-2 text-[11px] text-text-muted">
                  <MapPin size={12} /> {selected.address}
                </div>
              )}
              <div className="flex items-center gap-2 text-[11px] text-text-muted">
                <Calendar size={12} /> Joined {selected.createdAt ? new Date(selected.createdAt).toLocaleDateString() : 'Unknown'}
              </div>
            </div>

            <div className="border-t border-white/[0.04] pt-3">
              <h4 className="text-[11px] font-semibold text-text mb-2">Order History ({getCustomerOrders(selected.email || selected.id).length})</h4>
              <div className="space-y-2 max-h-[200px] overflow-y-auto">
                {getCustomerOrders(selected.email || selected.id).map(o => (
                  <div key={o.id} className="flex items-center justify-between bg-white/[0.02] rounded-lg p-2.5">
                    <div>
                      <p className="text-[11px] text-text">#{o.id.slice(0, 8).toUpperCase()}</p>
                      <p className="text-[10px] text-text-dim">{new Date(o.createdAt).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-xs text-gold font-semibold">₹{o.total?.toLocaleString()}</p>
                      <span className={`badge badge-${o.status === 'delivered' ? 'green' : o.status === 'cancelled' ? 'red' : 'gold'} text-[8px]`}>{o.status}</span>
                    </div>
                  </div>
                ))}
                {getCustomerOrders(selected.email || selected.id).length === 0 && (
                  <p className="text-text-dim text-[10px] py-2 text-center">No orders yet</p>
                )}
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
