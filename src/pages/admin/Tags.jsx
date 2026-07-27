import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getTags, createTag, updateTag, deleteTag, logAudit } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Plus, Trash2, Edit2, X, Loader, Search, Hash } from 'lucide-react'

export default function Tags() {
  const { user } = useAuth()
  const [tags, setTags] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({ name: '', slug: '', color: '#D4AF37' })

  useEffect(() => { load() }, [])

  async function load() { setTags(await getTags()) }

  function resetForm() { setForm({ name: '', slug: '', color: '#D4AF37' }); setEditing(null); setShowForm(false) }

  function makeSlug(name) { return name.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '') }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Enter tag name'); return }
    setLoading(true)
    try {
      const data = { ...form, slug: form.slug || makeSlug(form.name) }
      if (editing) { await updateTag(editing, data); toast.success('Tag updated') }
      else { await createTag(data); toast.success('Tag created') }
      await logAudit({ userId: user.uid, action: editing ? 'update_tag' : 'create_tag', entityType: 'tags' })
      resetForm(); load()
    } catch (err) { toast.error(err.message) }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this tag?')) return
    await deleteTag(id); toast.success('Deleted'); load()
  }

  const filtered = tags.filter(t => !search || t.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Tags</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-gold text-xs flex items-center gap-1"><Plus size={14} /> Add Tag</button>
      </div>

      <div className="relative flex-1 min-w-[200px] mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
        <input placeholder="Search tags..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-xs w-full" />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Tag</th>
              <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Slug</th>
              <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Products</th>
              <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(t => (
              <tr key={t.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: t.color || '#D4AF37' }} />
                    <span className="text-xs text-text font-medium">{t.name}</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-[10px] text-text-dim font-mono">{t.slug || '—'}</td>
                <td className="py-2 px-3 text-[11px] text-text-muted">{t.productCount || 0}</td>
                <td className="py-2 px-3 text-right">
                  <div className="flex items-center justify-end gap-1">
                    <button onClick={() => { setForm(t); setEditing(t.id); setShowForm(true) }} className="p-1.5 glass rounded-lg hover:bg-gold-dim" aria-label="Edit">
                      <Edit2 size={12} className="text-gold" />
                    </button>
                    <button onClick={() => handleDelete(t.id)} className="p-1.5 glass rounded-lg hover:bg-red-500/10" aria-label="Delete">
                      <Trash2 size={12} className="text-accent-red" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-text-dim text-xs">No tags yet</td></tr>}
          </tbody>
        </table>
      </div>

      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={resetForm}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl p-5 max-w-sm w-full" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text">{editing ? 'Edit Tag' : 'Add Tag'}</h3>
                <button onClick={resetForm} className="text-text-dim hover:text-text bg-transparent"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Tag Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field text-xs w-full" placeholder="e.g. teak-wood" />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Slug</label>
                  <input value={form.slug} onChange={e => setForm({ ...form, slug: e.target.value })} className="input-field text-xs w-full" placeholder="auto-generated" />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Color</label>
                  <div className="flex items-center gap-2">
                    <input type="color" value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="w-8 h-8 rounded cursor-pointer bg-transparent border-none" />
                    <input value={form.color} onChange={e => setForm({ ...form, color: e.target.value })} className="input-field text-xs flex-1" />
                  </div>
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
