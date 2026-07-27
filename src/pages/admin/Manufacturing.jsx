import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getEntities, createEntity, updateEntity, deleteEntity, logAudit } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Search, Trash2, Edit2, Factory, Clock, CheckCircle, AlertCircle, X, Loader } from 'lucide-react'

const statuses = ['draft', 'waiting_materials', 'scheduled', 'in_production', 'quality_check', 'completed', 'cancelled']
const statusColors = {
  draft: 'badge-gold', waiting_materials: 'badge-gold', scheduled: 'badge-blue',
  in_production: 'badge-blue', quality_check: 'badge-gold', completed: 'badge-green', cancelled: 'badge-red',
}

export default function Manufacturing() {
  const { user } = useAuth()
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [search, setSearch] = useState('')
  const [statusFilter, setStatusFilter] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    productName: '', quantity: 1, priority: 'medium', materials: '',
    notes: '', dueDate: '', status: 'draft', assignedTo: '',
  })

  useEffect(() => { load() }, [])

  async function load() {
    const [o, p] = await Promise.all([getEntities('production_orders'), getEntities('products')])
    setOrders(o)
    setProducts(p)
  }

  function resetForm() {
    setForm({ productName: '', quantity: 1, priority: 'medium', materials: '', notes: '', dueDate: '', status: 'draft', assignedTo: '' })
    setEditing(null)
    setShowForm(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.productName.trim()) { toast.error('Enter product name'); return }
    setLoading(true)
    try {
      if (editing) {
        await updateEntity('production_orders', editing, form)
        await logAudit({ userId: user.uid, action: 'update_production', entityType: 'production_orders', entityId: editing })
        toast.success('Production order updated')
      } else {
        await createEntity('production_orders', `prod_${Date.now()}`, form)
        await logAudit({ userId: user.uid, action: 'create_production', entityType: 'production_orders', newValue: { name: form.productName } })
        toast.success('Production order created')
      }
      resetForm()
      load()
    } catch (err) { toast.error(err.message) }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this production order?')) return
    await deleteEntity('production_orders', id)
    toast.success('Deleted')
    load()
  }

  async function updateStatus(id, status) {
    await updateEntity('production_orders', id, { status })
    load()
    toast.success('Status updated')
  }

  function handleEdit(order) {
    setForm({
      productName: order.productName || '', quantity: order.quantity || 1, priority: order.priority || 'medium',
      materials: order.materials || '', notes: order.notes || '', dueDate: order.dueDate || '',
      status: order.status || 'draft', assignedTo: order.assignedTo || '',
    })
    setEditing(order.id)
    setShowForm(true)
  }

  const filtered = orders.filter(o => {
    const matchSearch = !search || o.productName?.toLowerCase().includes(search.toLowerCase())
    const matchStatus = !statusFilter || o.status === statusFilter
    return matchSearch && matchStatus
  })

  const stats = {
    total: orders.length,
    inProgress: orders.filter(o => o.status === 'in_production').length,
    completed: orders.filter(o => o.status === 'completed').length,
    pending: orders.filter(o => ['draft', 'waiting_materials', 'scheduled'].includes(o.status)).length,
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Manufacturing</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-gold text-xs flex items-center gap-1">
          <Plus size={14} /> New Production Order
        </button>
      </div>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Orders', value: stats.total, color: 'text-text' },
          { label: 'In Progress', value: stats.inProgress, color: 'text-accent-blue' },
          { label: 'Completed', value: stats.completed, color: 'text-accent-green' },
          { label: 'Pending', value: stats.pending, color: 'text-yellow-400' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-3">
            <span className="text-[10px] text-text-muted">{s.label}</span>
            <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
          <input placeholder="Search production orders..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-xs w-full" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="input-field text-xs w-auto">
          <option value="">All Status</option>
          {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
        </select>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Product</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Qty</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Priority</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Due Date</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Assigned</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Status</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(o => (
                <motion.tr key={o.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="py-2 px-3 text-xs text-text">{o.productName}</td>
                  <td className="py-2 px-3 text-[11px] text-text-muted">{o.quantity}</td>
                  <td className="py-2 px-3">
                    <span className={`badge ${o.priority === 'high' ? 'badge-red' : o.priority === 'medium' ? 'badge-gold' : 'badge-blue'} text-[9px]`}>
                      {o.priority}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-[10px] text-text-dim">{o.dueDate ? new Date(o.dueDate).toLocaleDateString() : '—'}</td>
                  <td className="py-2 px-3 text-[11px] text-text-muted">{o.assignedTo || '—'}</td>
                  <td className="py-2 px-3">
                    <select value={o.status} onChange={e => updateStatus(o.id, e.target.value)}
                      className="bg-transparent border-none text-[10px] text-text cursor-pointer p-0">
                      {statuses.map(s => <option key={s} value={s}>{s.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                    </select>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(o)} className="p-1.5 glass rounded-lg hover:bg-gold-dim" aria-label="Edit">
                        <Edit2 size={12} className="text-gold" />
                      </button>
                      <button onClick={() => handleDelete(o.id)} className="p-1.5 glass rounded-lg hover:bg-red-500/10" aria-label="Delete">
                        <Trash2 size={12} className="text-accent-red" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={7} className="py-8 text-center text-text-dim text-xs">No production orders</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={resetForm}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text">{editing ? 'Edit Production Order' : 'New Production Order'}</h3>
                <button onClick={resetForm} className="text-text-dim hover:text-text bg-transparent"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Product Name</label>
                  <input value={form.productName} onChange={e => setForm({ ...form, productName: e.target.value })}
                    className="input-field text-xs w-full" placeholder="e.g. Teak Wood Dining Table" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-text-muted mb-1 block">Quantity</label>
                    <input type="number" value={form.quantity} onChange={e => setForm({ ...form, quantity: Number(e.target.value) })}
                      className="input-field text-xs w-full" min="1" />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted mb-1 block">Priority</label>
                    <select value={form.priority} onChange={e => setForm({ ...form, priority: e.target.value })} className="input-field text-xs w-full">
                      {['low', 'medium', 'high', 'urgent'].map(p => <option key={p} value={p}>{p.charAt(0).toUpperCase() + p.slice(1)}</option>)}
                    </select>
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Materials Required</label>
                  <input value={form.materials} onChange={e => setForm({ ...form, materials: e.target.value })}
                    className="input-field text-xs w-full" placeholder="e.g. Teak wood planks, screws, varnish" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-text-muted mb-1 block">Due Date</label>
                    <input type="date" value={form.dueDate} onChange={e => setForm({ ...form, dueDate: e.target.value })}
                      className="input-field text-xs w-full" />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted mb-1 block">Assigned To</label>
                    <input value={form.assignedTo} onChange={e => setForm({ ...form, assignedTo: e.target.value })}
                      className="input-field text-xs w-full" placeholder="Worker name" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Notes</label>
                  <textarea value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })}
                    className="input-field text-xs w-full min-h-[60px]" placeholder="Special instructions..." />
                </div>
                <div className="flex gap-2 pt-2">
                  <button type="submit" disabled={loading} className="btn-gold flex-1 text-xs flex items-center justify-center gap-1">
                    {loading ? <Loader size={12} className="animate-spin" /> : editing ? 'Update' : 'Create'}
                  </button>
                  <button type="button" onClick={resetForm} className="btn-secondary flex-1 text-xs">Cancel</button>
                </div>
              </form>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}
