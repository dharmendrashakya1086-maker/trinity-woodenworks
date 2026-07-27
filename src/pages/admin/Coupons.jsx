import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCoupons, createCoupon, updateCoupon, deleteCoupon, logAudit } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Search, Plus, Trash2, Edit2, Tag, Percent, IndianRupee, Truck, Copy, X, Loader } from 'lucide-react'

const types = [
  { value: 'percentage', label: 'Percentage Off', icon: Percent },
  { value: 'fixed', label: 'Fixed Amount Off', icon: IndianRupee },
  { value: 'free_shipping', label: 'Free Shipping', icon: Truck },
]

export default function Coupons() {
  const { user } = useAuth()
  const [coupons, setCoupons] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    code: '', type: 'percentage', value: 0, minOrder: 0, usageLimit: 0,
    expiresAt: '', active: true, description: '',
  })

  useEffect(() => { load() }, [])

  async function load() {
    setCoupons(await getCoupons())
  }

  function resetForm() {
    setForm({ code: '', type: 'percentage', value: 0, minOrder: 0, usageLimit: 0, expiresAt: '', active: true, description: '' })
    setEditing(null)
    setShowForm(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.code.trim()) { toast.error('Enter a coupon code'); return }
    setLoading(true)
    try {
      const data = { ...form, code: form.code.toUpperCase().trim() }
      if (editing) {
        await updateCoupon(editing, data)
        await logAudit({ userId: user.uid, action: 'update_coupon', entityType: 'coupons', entityId: editing })
        toast.success('Coupon updated')
      } else {
        await createCoupon(data)
        await logAudit({ userId: user.uid, action: 'create_coupon', entityType: 'coupons', newValue: { code: data.code } })
        toast.success('Coupon created')
      }
      resetForm()
      load()
    } catch (err) { toast.error(err.message) }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this coupon?')) return
    await deleteCoupon(id)
    await logAudit({ userId: user.uid, action: 'delete_coupon', entityType: 'coupons', entityId: id })
    toast.success('Coupon deleted')
    load()
  }

  function handleEdit(coupon) {
    setForm({
      code: coupon.code, type: coupon.type, value: coupon.value,
      minOrder: coupon.minOrder || 0, usageLimit: coupon.usageLimit || 0,
      expiresAt: coupon.expiresAt || '', active: coupon.active !== false, description: coupon.description || '',
    })
    setEditing(coupon.id)
    setShowForm(true)
  }

  function copyCode(code) {
    navigator.clipboard.writeText(code)
    toast.success('Copied!')
  }

  const filtered = coupons.filter(c => !search || c.code?.toLowerCase().includes(search.toLowerCase()) || c.description?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Coupons</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-gold text-xs flex items-center gap-1">
          <Plus size={14} /> Create Coupon
        </button>
      </div>

      <div className="relative flex-1 min-w-[200px] mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
        <input placeholder="Search coupons..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-xs w-full" />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Code</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Type</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Value</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Min Order</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Usage</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Expires</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Status</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <motion.tr key={c.id} layout initial={{ opacity: 0 }} animate={{ opacity: 1 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="py-2 px-3">
                    <div className="flex items-center gap-2">
                      <span className="text-xs text-gold font-mono font-semibold">{c.code}</span>
                      <button onClick={() => copyCode(c.code)} className="text-text-dim hover:text-gold bg-transparent" aria-label="Copy code">
                        <Copy size={10} />
                      </button>
                    </div>
                  </td>
                  <td className="py-2 px-3">
                    <span className="badge badge-blue text-[9px]">
                      {c.type === 'percentage' ? '% Off' : c.type === 'fixed' ? '₹ Off' : 'Free Ship'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-xs text-text">
                    {c.type === 'percentage' ? `${c.value}%` : c.type === 'fixed' ? `₹${c.value}` : '—'}
                  </td>
                  <td className="py-2 px-3 text-[11px] text-text-muted">{c.minOrder ? `₹${c.minOrder}` : '—'}</td>
                  <td className="py-2 px-3 text-[11px] text-text-muted">{c.usageCount || 0}{c.usageLimit ? `/${c.usageLimit}` : ''}</td>
                  <td className="py-2 px-3 text-[10px] text-text-dim">{c.expiresAt ? new Date(c.expiresAt).toLocaleDateString() : 'Never'}</td>
                  <td className="py-2 px-3">
                    <span className={`badge ${c.active !== false ? 'badge-green' : 'badge-red'} text-[9px]`}>
                      {c.active !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="py-2 px-3 text-right">
                    <div className="flex items-center justify-end gap-1">
                      <button onClick={() => handleEdit(c)} className="p-1.5 glass rounded-lg hover:bg-gold-dim" aria-label="Edit coupon">
                        <Edit2 size={12} className="text-gold" />
                      </button>
                      <button onClick={() => handleDelete(c.id)} className="p-1.5 glass rounded-lg hover:bg-red-500/10" aria-label="Delete coupon">
                        <Trash2 size={12} className="text-accent-red" />
                      </button>
                    </div>
                  </td>
                </motion.tr>
              ))}
              {filtered.length === 0 && (
                <tr><td colSpan={8} className="py-8 text-center text-text-dim text-xs">No coupons yet</td></tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Coupon Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={resetForm}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl p-5 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text">{editing ? 'Edit Coupon' : 'Create Coupon'}</h3>
                <button onClick={resetForm} className="text-text-dim hover:text-text bg-transparent"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Coupon Code</label>
                  <input value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}
                    className="input-field text-xs w-full" placeholder="e.g. SUMMER25" />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field text-xs w-full">
                    {types.map(t => <option key={t.value} value={t.value}>{t.label}</option>)}
                  </select>
                </div>
                {form.type !== 'free_shipping' && (
                  <div>
                    <label className="text-[10px] text-text-muted mb-1 block">{form.type === 'percentage' ? 'Percentage' : 'Amount (₹)'}</label>
                    <input type="number" value={form.value} onChange={e => setForm({ ...form, value: Number(e.target.value) })}
                      className="input-field text-xs w-full" min="0" />
                  </div>
                )}
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Minimum Order (₹)</label>
                  <input type="number" value={form.minOrder} onChange={e => setForm({ ...form, minOrder: Number(e.target.value) })}
                    className="input-field text-xs w-full" min="0" />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Usage Limit (0 = unlimited)</label>
                  <input type="number" value={form.usageLimit} onChange={e => setForm({ ...form, usageLimit: Number(e.target.value) })}
                    className="input-field text-xs w-full" min="0" />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Expiry Date</label>
                  <input type="date" value={form.expiresAt} onChange={e => setForm({ ...form, expiresAt: e.target.value })}
                    className="input-field text-xs w-full" />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Description</label>
                  <input value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}
                    className="input-field text-xs w-full" placeholder="e.g. Summer sale discount" />
                </div>
                <div className="flex items-center gap-2">
                  <input type="checkbox" checked={form.active} onChange={e => setForm({ ...form, active: e.target.checked })} className="accent-gold" />
                  <span className="text-[11px] text-text-muted">Active</span>
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
