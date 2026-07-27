import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getAttributes, createAttribute, updateAttribute, deleteAttribute, logAudit } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, X, Loader, Search, List } from 'lucide-react'

const predefinedTypes = ['Wood Type', 'Finish', 'Material', 'Color', 'Size', 'Shape', 'Texture', 'Assembly', 'Warranty']

export default function Attributes() {
  const { user } = useAuth()
  const [attributes, setAttributes] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', type: 'Wood Type', values: '', displayOrder: 0 })

  useEffect(() => { load() }, [])

  async function load() { setAttributes(await getAttributes()) }

  function resetForm() { setForm({ name: '', type: 'Wood Type', values: '', displayOrder: 0 }); setEditing(null); setShowForm(false) }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Enter attribute name'); return }
    setLoading(true)
    try {
      const data = { ...form, values: form.values.split(',').map(v => v.trim()).filter(Boolean) }
      if (editing) { await updateAttribute(editing, data); toast.success('Attribute updated') }
      else { await createAttribute(data); toast.success('Attribute created') }
      await logAudit({ userId: user.uid, action: editing ? 'update_attribute' : 'create_attribute', entityType: 'attributes' })
      resetForm(); load()
    } catch (err) { toast.error(err.message) }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this attribute?')) return
    await deleteAttribute(id); toast.success('Deleted'); load()
  }

  const filtered = attributes.filter(a => !search || a.name?.toLowerCase().includes(search.toLowerCase()) || a.type?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Attributes</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-gold text-xs flex items-center gap-1"><Plus size={14} /> Add Attribute</button>
      </div>

      <div className="relative flex-1 min-w-[200px] mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
        <input placeholder="Search attributes..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-xs w-full" />
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
        {filtered.map(a => (
          <motion.div key={a.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
            className="glass rounded-xl p-4">
            <div className="flex items-start justify-between mb-3">
              <div>
                <h3 className="text-sm font-semibold text-text">{a.name}</h3>
                <span className="badge badge-blue text-[9px]">{a.type}</span>
              </div>
            </div>
            <div className="flex flex-wrap gap-1 mb-3">
              {(a.values || []).map((v, i) => (
                <span key={i} className="px-2 py-0.5 rounded-full bg-gold-dim text-[9px] text-gold">{v}</span>
              ))}
              {(!a.values || a.values.length === 0) && <span className="text-[10px] text-text-dim">No values</span>}
            </div>
            <div className="flex gap-2 pt-2 border-t border-white/[0.04]">
              <button onClick={() => { setForm({ ...a, values: (a.values || []).join(', ') }); setEditing(a.id); setShowForm(true) }}
                className="flex-1 p-1.5 glass rounded-lg hover:bg-gold-dim text-[10px] text-text-muted flex items-center justify-center gap-1">
                <Edit2 size={10} /> Edit
              </button>
              <button onClick={() => handleDelete(a.id)} className="p-1.5 glass rounded-lg hover:bg-red-500/10" aria-label="Delete">
                <Trash2 size={10} className="text-accent-red" />
              </button>
            </div>
          </motion.div>
        ))}
        {filtered.length === 0 && <p className="text-text-dim text-xs py-8 text-center col-span-full">No attributes yet</p>}
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={resetForm}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl p-5 max-w-md w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text">{editing ? 'Edit Attribute' : 'Add Attribute'}</h3>
                <button onClick={resetForm} className="text-text-dim hover:text-text bg-transparent"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Attribute Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-xs w-full" placeholder="e.g. Wood Type" />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field text-xs w-full">
                    {predefinedTypes.map(t => <option key={t} value={t}>{t}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Values (comma separated)</label>
                  <input value={form.values} onChange={e => setForm({ ...form, values: e.target.value })} className="input-field text-xs w-full" placeholder="e.g. Teak, Oak, Walnut" />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Display Order</label>
                  <input type="number" value={form.displayOrder} onChange={e => setForm({ ...form, displayOrder: Number(e.target.value) })} className="input-field text-xs w-full" />
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
