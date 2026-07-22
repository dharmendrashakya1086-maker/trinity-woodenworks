import { useState } from 'react'
import { motion } from 'framer-motion'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Send, CheckCircle } from 'lucide-react'

const woodTypes = ['Sheesham (Rosewood)', 'Teak', 'Oak', 'Walnut', 'Mango Wood', 'Acacia']
const itemTypes = ['Table', 'Chair', 'Bed', 'Wardrobe', 'Shelf', 'Mirror Frame', 'Door', 'Window', 'Other']

export default function CustomOrder() {
  const { user } = useAuth()
  const [form, setForm] = useState({
    name: user?.displayName || '',
    email: user?.email || '',
    phone: '',
    itemType: '',
    woodType: '',
    dimensions: '',
    description: '',
    budget: '',
    referenceImage: null,
  })
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await addDoc(collection(db, 'customOrders'), {
        customer_id: user.uid,
        customer_name: form.name,
        customer_email: form.email,
        customer_phone: form.phone,
        itemType: form.itemType,
        woodType: form.woodType,
        dimensions: form.dimensions,
        description: form.description,
        budget: form.budget,
        status: 'new',
        createdAt: new Date().toISOString(),
      })
      setSubmitted(true)
      toast.success('Custom order request submitted!')
    } catch {
      toast.error('Failed to submit')
    }
    setLoading(false)
  }

  if (submitted) {
    return (
      <div className="pt-24 pb-16 min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-3xl p-10 text-center max-w-md">
          <CheckCircle size={50} className="mx-auto text-gold mb-4" />
          <h1 className="text-2xl font-bold text-text mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Request Submitted!</h1>
          <p className="text-sm text-text-muted mb-6">Our team will review your requirements and get back to you within 24 hours.</p>
          <button onClick={() => setSubmitted(false)} className="btn-outline">Submit Another</button>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-24 pb-16 max-w-2xl mx-auto px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-3xl font-bold gold-text mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Custom Order</h1>
        <p className="text-text-muted text-sm mb-8">Tell us about your dream piece and we'll make it happen</p>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-5">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="text-xs text-text-muted mb-1 block">Your Name</label>
              <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="input-field" />
            </div>
            <div>
              <label className="text-xs text-text-muted mb-1 block">Phone</label>
              <input value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} required className="input-field" />
            </div>
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Item Type</label>
            <select value={form.itemType} onChange={e => setForm({ ...form, itemType: e.target.value })} required className="input-field">
              <option value="">Select item type</option>
              {itemTypes.map(t => <option key={t} value={t}>{t}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Wood Type</label>
            <select value={form.woodType} onChange={e => setForm({ ...form, woodType: e.target.value })} required className="input-field">
              <option value="">Select wood type</option>
              {woodTypes.map(w => <option key={w} value={w}>{w}</option>)}
            </select>
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Dimensions (L × W × H)</label>
            <input placeholder="e.g. 120cm × 60cm × 75cm" value={form.dimensions} onChange={e => setForm({ ...form, dimensions: e.target.value })} className="input-field" />
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Budget (₹)</label>
            <input placeholder="Estimated budget" value={form.budget} onChange={e => setForm({ ...form, budget: e.target.value })} className="input-field" />
          </div>

          <div>
            <label className="text-xs text-text-muted mb-1 block">Description</label>
            <textarea placeholder="Describe your vision — style, finish, any special requirements..." value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} required className="input-field min-h-[120px]" />
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full flex items-center justify-center gap-2">
            <Send size={16} /> {loading ? 'Submitting...' : 'Submit Request'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
