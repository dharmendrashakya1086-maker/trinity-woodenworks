import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Hammer, Send, CheckCircle } from 'lucide-react'

const WOOD_TYPES = ['Sheesham (Rosewood)', 'Teak', 'Mango Wood', 'Oak', 'Walnut', 'Reclaimed Wood']

export default function CustomOrder() {
  const { user } = useAuth()
  const navigate = useNavigate()
  const [form, setForm] = useState({ title: '', description: '', woodType: WOOD_TYPES[0], dimensions: '', budget: '', phone: '' })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await addDoc(collection(db, 'customOrders'), {
        customer_id: user.uid, ...form, status: 'pending', createdAt: new Date().toISOString(),
      })
      setSubmitted(true)
    } catch { toast.error('Failed to submit') }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="pt-20 pb-16 min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-8 text-center max-w-sm w-full">
          <CheckCircle size={40} className="mx-auto text-gold mb-4" />
          <h2 className="text-lg font-semibold text-text mb-2">Custom Order Submitted!</h2>
          <p className="text-[13px] text-text-muted mb-4">We'll review your request and contact you within 24 hours.</p>
          <button onClick={() => navigate('/track-custom-order')} className="btn-gold text-sm">Track Status →</button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-16 max-w-2xl mx-auto px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="mb-6">
        <h1 className="text-xl sm:text-2xl font-bold gold-text flex items-center gap-2" style={{ fontFamily: 'var(--font-heading)' }}>
          <Hammer size={22} className="text-gold" /> Custom Order
        </h1>
        <p className="text-text-muted text-sm mt-1">Tell us what you need and we'll craft it for you</p>
      </motion.div>

      <form onSubmit={handleSubmit} className="glass rounded-2xl p-5 space-y-4">
        <div>
          <label className="text-[11px] text-text-muted mb-1 block">Title</label>
          <input placeholder="e.g. Custom Dining Table" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })} required className="input-field text-sm" />
        </div>
        <div>
          <label className="text-[11px] text-text-muted mb-1 block">Description</label>
          <textarea placeholder="Describe your vision in detail..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required className="input-field text-sm min-h-[120px]" />
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-text-muted mb-1 block">Wood Type</label>
            <select value={form.woodType} onChange={e => setForm({ ...form, woodType: e.target.value })} className="input-field text-sm">
              {WOOD_TYPES.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>
          <div>
            <label className="text-[11px] text-text-muted mb-1 block">Dimensions</label>
            <input placeholder="L × W × H" value={form.dimensions} onChange={e => setForm({ ...form, dimensions: e.target.value })} className="input-field text-sm" />
          </div>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="text-[11px] text-text-muted mb-1 block">Budget (₹)</label>
            <input placeholder="e.g. 25000" type="number" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className="input-field text-sm" />
          </div>
          <div>
            <label className="text-[11px] text-text-muted mb-1 block">Phone</label>
            <input placeholder="+91 XXXXX XXXXX" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required className="input-field text-sm" />
          </div>
        </div>
        <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2 text-sm">
          <Send size={14} /> {loading ? 'Submitting...' : 'Submit Custom Order'}
        </button>
      </form>
    </div>
  )
}
