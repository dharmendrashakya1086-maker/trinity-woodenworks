import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { User, Phone, MapPin, Save } from 'lucide-react'

export default function Account() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'customers', user.uid))
      if (snap.exists()) { const d = snap.data(); setForm({ name: d.name || '', phone: d.phone || '', address: d.address || '' }) }
    }
    load()
  }, [user])

  async function handleSave(e) {
    e.preventDefault()
    setLoading(true)
    await updateDoc(doc(db, 'customers', user.uid), form)
    toast.success('Profile updated!')
    setLoading(false)
  }

  return (
    <div className="pt-20 pb-16 max-w-2xl mx-auto px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-xl sm:text-2xl font-bold gold-text mb-6" style={{ fontFamily: 'var(--font-heading)' }}>My Account</h1>

        <div className="glass rounded-2xl p-5 mb-5 flex items-center gap-4">
          <div className="w-14 h-14 rounded-full bg-gold-dim border border-gold/20 flex items-center justify-center text-gold text-lg font-bold">
            {form.name?.charAt(0)?.toUpperCase() || '?'}
          </div>
          <div>
            <p className="text-sm font-semibold text-text">{user?.email}</p>
            <p className="text-[11px] text-text-muted">Member since {new Date(user?.metadata?.createdAt).toLocaleDateString()}</p>
          </div>
        </div>

        <form onSubmit={handleSave} className="glass rounded-2xl p-5 space-y-4">
          <h2 className="text-sm font-semibold text-text">Personal Information</h2>
          <div>
            <label className="text-[11px] text-text-muted mb-1 block">Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={15} />
              <input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field pl-10 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-text-muted mb-1 block">Phone</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={15} />
              <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field pl-10 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-text-muted mb-1 block">Address</label>
            <div className="relative">
              <MapPin className="absolute left-3 top-3 text-text-dim" size={15} />
              <textarea placeholder="Your address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field pl-10 text-sm min-h-[80px]" />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn-gold flex items-center gap-2 text-sm">
            <Save size={14} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
