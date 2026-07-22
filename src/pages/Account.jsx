import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { doc, getDoc, updateDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { User, Mail, Phone, MapPin, Save } from 'lucide-react'

export default function Account() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', phone: '', address: '' })
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    async function load() {
      const snap = await getDoc(doc(db, 'customers', user.uid))
      if (snap.exists()) {
        const d = snap.data()
        setForm({ name: d.name || '', phone: d.phone || '', address: d.address || '' })
      }
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
    <div className="pt-24 pb-16 max-w-2xl mx-auto px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h1 className="text-2xl font-bold gold-text mb-8" style={{ fontFamily: 'var(--font-heading)' }}>My Account</h1>

        <div className="glass rounded-2xl p-6 mb-6">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-16 h-16 rounded-full bg-gold-dim flex items-center justify-center text-gold text-xl font-bold">
              {form.name?.charAt(0)?.toUpperCase() || '?'}
            </div>
            <div>
              <p className="text-sm font-semibold text-text">{user?.email}</p>
              <p className="text-xs text-text-muted">Member since {new Date(user?.metadata?.createdAt).toLocaleDateString()}</p>
            </div>
          </div>
        </div>

        <form onSubmit={handleSave} className="glass rounded-2xl p-6 space-y-4">
          <h2 className="text-lg font-semibold text-text mb-4">Personal Information</h2>

          <div className="relative">
            <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input placeholder="Full Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} className="input-field pl-10" />
          </div>
          <div className="relative">
            <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
            <input placeholder="Phone Number" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field pl-10" />
          </div>
          <div className="relative">
            <MapPin className="absolute left-3 top-3 text-text-muted" size={18} />
            <textarea placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} className="input-field pl-10 min-h-[80px]" />
          </div>

          <button type="submit" disabled={loading} className="btn-gold flex items-center gap-2">
            <Save size={16} /> {loading ? 'Saving...' : 'Save Changes'}
          </button>
        </form>
      </motion.div>
    </div>
  )
}
