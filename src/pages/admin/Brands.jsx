import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getBrands, createBrand, updateBrand, deleteBrand, logAudit } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, X, Loader, Search, Tag } from 'lucide-react'

export default function Brands() {
  const { user } = useAuth()
  const [brands, setBrands] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', logo: '', description: '', website: '', status: 'active' })

  useEffect(() => { load() }, [])

  async function load() { setBrands(await getBrands()) }

  function resetForm() { setForm({ name: '', logo: '', description: '', website: '', status: 'active' }); setEditing(null); setShowForm(false) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Enter brand name'); return }
    setLoading(true)
    try {
      if (editing) { await updateBrand(editing, form); toast.success('Brand updated') }
      else { await createBrand(form); toast.success('Brand created') }
      await logAudit({ userId: user.uid, action: editing ? 'update_brand' : 'create_brand', entityType: 'brands' })
      resetForm(); load()
    } catch (err) { toast.error(err.message) }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this brand?')) return
    await deleteBrand(id); toast.success('Deleted'); load()
  }

  const filtered = brands.filter(b => !search || b.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Brands</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-gold text-xs flex items-center gap-1"><Plus size={14} /> Add Brand</button>
      </div>

      <div className="relative flex-1 min-w-[200px] mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
        <input placeholder="Search brands..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-xs w-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(b => (
          <motion.div key={b.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div className="flex items-center gap-3">
                {b.logo ? <img src={b.logo} alt="" className="w-10 h-10 rounded-lg object-cover" /> :
                  <div className="w-10 h-10 rounded-lg bg-gold-dim flex items-center justify-center"><Tag size={16} className="text-gold" /></div>}
                <div>
                  <h3 className="text-sm font-semibold text-text">{b.name}</h3>
                  <span className={`badge ${b.status === 'active' ? 'badge-green' : 'badge-red'} text-[9px]`}>{b.status || 'active'}</span>
                </div>
              </div>
            </div>
            {b.description && <p className="text-[11px] text-text-muted mb-3 line-clamp-2">{b.description}</p>}
            {b.website && <p className="text-[10px] text-gold mb-3 truncate">{b.website}</p>}
            <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
              <button onClick={() => { setForm(b); setEditing(b.id); setShowForm(true) }} className="flex-1 p-1.5 glass rounded-lg hover:bg-gold-dim text-[10px] text-text-muted flex items-center justify-center gap-1">
                <Edit2 size={10} /> Edit
              </button>
              <button onClick={() => handleDelete(b.id)} className="p-1.5 glass rounded-lg hover:bg-red-500/10" aria-label="Delete">
                <Trash2 size={10} className="text-accent-red" />
              </button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="text-text-dim text-xs py-8 text-center col-span-full">No brands yet</p>}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={resetForm}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl p-5 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text">{editing ? 'Edit Brand' : 'Add Brand'}</h3>
                <button onClick={resetForm} className="text-text-dim hover:text-text bg-transparent"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Brand Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-xs w-full" />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Logo URL</label>
                  <input value={form.logo} onChange={e => setForm({ ...form, logo: e.target.value })} className="input-field text-xs w-full" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Description</label>
                  <textarea value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} className="input-field text-xs w-full min-h-[60px]" />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Website</label>
                  <input value={form.website} onChange={e => setForm({ ...form, website: e.target.value })} className="input-field text-xs w-full" placeholder="https://..." />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field text-xs w-full">
                    <option value="active">Active</option>
                    <option value="inactive">Inactive</option>
                  </select>
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
