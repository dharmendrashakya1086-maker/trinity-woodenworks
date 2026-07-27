import { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { getCampaigns, createCampaign, updateCampaign, deleteCampaign, logAudit } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Search, Plus, Trash2, Edit2, Megaphone, Calendar, Users, BarChart3, X, Loader } from 'lucide-react'

const campaignTypes = ['seasonal_sale', 'product_launch', 'festival_promo', 'clearance', 'loyalty', 'referral']
const channels = ['email', 'push', 'sms', 'whatsapp', 'social']

export default function Marketing() {
  const { user } = useAuth()
  const [campaigns, setCampaigns] = useState([])
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [loading, setLoading] = useState(false)
  const [form, setForm] = useState({
    name: '', type: 'seasonal_sale', objective: '', audience: '',
    budget: 0, startDate: '', endDate: '', channels: [], status: 'draft',
  })

  useEffect(() => { load() }, [])

  async function load() {
    setCampaigns(await getCampaigns())
  }

  function resetForm() {
    setForm({ name: '', type: 'seasonal_sale', objective: '', audience: '', budget: 0, startDate: '', endDate: '', channels: [], status: 'draft' })
    setEditing(null)
    setShowForm(false)
  }

  async function handleSubmit(e) {
    e.preventDefault()
    if (!form.name.trim()) { toast.error('Enter campaign name'); return }
    setLoading(true)
    try {
      if (editing) {
        await updateCampaign(editing, form)
        await logAudit({ userId: user.uid, action: 'update_campaign', entityType: 'campaigns', entityId: editing })
        toast.success('Campaign updated')
      } else {
        await createCampaign(form)
        await logAudit({ userId: user.uid, action: 'create_campaign', entityType: 'campaigns', newValue: { name: form.name } })
        toast.success('Campaign created')
      }
      resetForm()
      load()
    } catch (err) { toast.error(err.message) }
    setLoading(false)
  }

  async function handleDelete(id) {
    if (!confirm('Delete this campaign?')) return
    await deleteCampaign(id)
    toast.success('Campaign deleted')
    load()
  }

  function handleEdit(c) {
    setForm({
      name: c.name || '', type: c.type || 'seasonal_sale', objective: c.objective || '',
      audience: c.audience || '', budget: c.budget || 0, startDate: c.startDate || '',
      endDate: c.endDate || '', channels: c.channels || [], status: c.status || 'draft',
    })
    setEditing(c.id)
    setShowForm(true)
  }

  const filtered = campaigns.filter(c => !search || c.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Marketing</h1>
        <button onClick={() => { resetForm(); setShowForm(true) }} className="btn-gold text-xs flex items-center gap-1">
          <Plus size={14} /> New Campaign
        </button>
      </div>

      <div className="relative flex-1 min-w-[200px] mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
        <input placeholder="Search campaigns..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-xs w-full" />
      </div>

      {filtered.length === 0 ? (
        <div className="glass rounded-xl p-10 text-center">
          <Megaphone size={32} className="text-text-dim mx-auto mb-3" />
          <p className="text-sm text-text-muted">No campaigns yet</p>
          <p className="text-[10px] text-text-dim mt-1">Create your first campaign to start marketing</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {filtered.map(c => (
            <motion.div key={c.id} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}
              className="glass rounded-xl p-4">
              <div className="flex items-start justify-between mb-3">
                <div>
                  <h3 className="text-sm font-semibold text-text">{c.name}</h3>
                  <p className="text-[10px] text-text-muted capitalize">{c.type?.replace('_', ' ')}</p>
                </div>
                <span className={`badge ${c.status === 'active' ? 'badge-green' : c.status === 'completed' ? 'badge-blue' : 'badge-gold'} text-[9px]`}>
                  {c.status || 'draft'}
                </span>
              </div>
              {c.objective && <p className="text-[11px] text-text-muted mb-3 line-clamp-2">{c.objective}</p>}
              <div className="flex flex-wrap gap-1.5 mb-3">
                {c.channels?.map(ch => (
                  <span key={ch} className="px-2 py-0.5 rounded-full bg-gold-dim text-[9px] text-gold capitalize">{ch}</span>
                ))}
              </div>
              <div className="flex items-center justify-between text-[10px] text-text-dim">
                <span>Budget: ₹{(c.budget || 0).toLocaleString()}</span>
                {c.startDate && <span>{new Date(c.startDate).toLocaleDateString()}</span>}
              </div>
              <div className="flex gap-2 mt-3 pt-3 border-t border-white/[0.04]">
                <button onClick={() => handleEdit(c)} className="flex-1 p-1.5 glass rounded-lg hover:bg-gold-dim text-[10px] text-text-muted flex items-center justify-center gap-1">
                  <Edit2 size={10} /> Edit
                </button>
                <button onClick={() => handleDelete(c.id)} className="p-1.5 glass rounded-lg hover:bg-red-500/10 text-[10px] text-accent-red" aria-label="Delete campaign">
                  <Trash2 size={10} />
                </button>
              </div>
            </motion.div>
          ))}
        </div>
      )}

      {/* Campaign Form Modal */}
      <AnimatePresence>
        {showForm && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={resetForm}>
            <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} exit={{ scale: 0.95, opacity: 0 }}
              className="glass rounded-2xl p-5 max-w-md w-full max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-sm font-semibold text-text">{editing ? 'Edit Campaign' : 'New Campaign'}</h3>
                <button onClick={resetForm} className="text-text-dim hover:text-text bg-transparent"><X size={16} /></button>
              </div>
              <form onSubmit={handleSubmit} className="space-y-3">
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Campaign Name</label>
                  <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
                    className="input-field text-xs w-full" placeholder="e.g. Summer Sale 2026" />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Type</label>
                  <select value={form.type} onChange={e => setForm({ ...form, type: e.target.value })} className="input-field text-xs w-full">
                    {campaignTypes.map(t => <option key={t} value={t}>{t.replace('_', ' ').replace(/\b\w/g, l => l.toUpperCase())}</option>)}
                  </select>
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Objective</label>
                  <input value={form.objective} onChange={e => setForm({ ...form, objective: e.target.value })}
                    className="input-field text-xs w-full" placeholder="e.g. Increase summer furniture sales" />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Target Audience</label>
                  <input value={form.audience} onChange={e => setForm({ ...form, audience: e.target.value })}
                    className="input-field text-xs w-full" placeholder="e.g. All customers, New visitors" />
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Budget (₹)</label>
                  <input type="number" value={form.budget} onChange={e => setForm({ ...form, budget: Number(e.target.value) })}
                    className="input-field text-xs w-full" min="0" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[10px] text-text-muted mb-1 block">Start Date</label>
                    <input type="date" value={form.startDate} onChange={e => setForm({ ...form, startDate: e.target.value })}
                      className="input-field text-xs w-full" />
                  </div>
                  <div>
                    <label className="text-[10px] text-text-muted mb-1 block">End Date</label>
                    <input type="date" value={form.endDate} onChange={e => setForm({ ...form, endDate: e.target.value })}
                      className="input-field text-xs w-full" />
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Channels</label>
                  <div className="flex flex-wrap gap-1.5">
                    {channels.map(ch => (
                      <button key={ch} type="button" onClick={() => {
                        setForm({ ...form, channels: form.channels.includes(ch) ? form.channels.filter(c => c !== ch) : [...form.channels, ch] })
                      }}
                        className={`px-2.5 py-1 rounded-lg text-[10px] border transition-all capitalize
                          ${form.channels.includes(ch) ? 'border-gold bg-gold-dim text-gold' : 'border-white/[0.08] text-text-muted'}`}>
                        {ch}
                      </button>
                    ))}
                  </div>
                </div>
                <div>
                  <label className="text-[10px] text-text-muted mb-1 block">Status</label>
                  <select value={form.status} onChange={e => setForm({ ...form, status: e.target.value })} className="input-field text-xs w-full">
                    {['draft', 'scheduled', 'active', 'paused', 'completed'].map(s => <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>)}
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
