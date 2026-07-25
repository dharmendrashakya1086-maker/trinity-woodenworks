import { useState } from 'react'
import { motion } from 'framer-motion'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Mail, Phone, MapPin, Send, CheckCircle } from 'lucide-react'

export default function Contact() {
  const { user } = useAuth()
  const [form, setForm] = useState({ name: '', email: '', phone: '', subject: '', message: '' })
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...form, customer_id: user?.uid || null, createdAt: new Date().toISOString(), read: false,
      })
      setSent(true)
    } catch { toast.error('Failed to send message') }
    setLoading(false)
  }

  if (sent) {
    return (
      <div className="pt-20 pb-16 min-h-screen flex items-center justify-center px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="glass rounded-2xl p-8 text-center max-w-sm w-full">
          <CheckCircle size={40} className="mx-auto text-gold mb-4" />
          <h2 className="text-lg font-semibold text-text mb-2">Message Sent!</h2>
          <p className="text-[13px] text-text-muted">We'll get back to you within 24 hours.</p>
        </motion.div>
      </div>
    )
  }

  return (
    <div className="pt-20 pb-16 max-w-5xl mx-auto px-4 sm:px-6">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="text-center mb-8">
        <h1 className="text-2xl sm:text-3xl font-bold gold-text mb-1" style={{ fontFamily: 'var(--font-heading)' }}>Contact Us</h1>
        <p className="text-text-muted text-sm">We'd love to hear from you</p>
      </motion.div>

      <div className="grid md:grid-cols-3 gap-6">
        <div className="space-y-3">
          {[
            { icon: Phone, label: '+91 XXXXX XXXXX', sub: 'Mon-Sat 10am-7pm' },
            { icon: Mail, label: 'info@trinitywoodenworks.com', sub: '24/7 Online' },
            { icon: MapPin, label: 'Varanasi, Uttar Pradesh', sub: 'India' },
          ].map(({ icon: Icon, label, sub }) => (
            <div key={label} className="glass rounded-xl p-4 flex items-start gap-3">
              <div className="w-9 h-9 rounded-lg bg-gold-dim border border-gold/10 flex items-center justify-center flex-shrink-0">
                <Icon className="text-gold" size={15} />
              </div>
              <div><p className="text-sm text-text">{label}</p><p className="text-[11px] text-text-dim">{sub}</p></div>
            </div>
          ))}
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-5 space-y-3 md:col-span-2">
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="input-field text-sm" />
            <input placeholder="Email" type="email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="input-field text-sm" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <input placeholder="Phone (optional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field text-sm" />
            <input placeholder="Subject" value={form.subject} onChange={e => setForm({ ...form, subject: e.target.value })} required className="input-field text-sm" />
          </div>
          <textarea placeholder="Your message..." value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required className="input-field text-sm min-h-[120px]" />
          <button type="submit" disabled={loading} className="btn-gold flex items-center gap-2 text-sm">
            <Send size={14} /> {loading ? 'Sending...' : 'Send Message'}
          </button>
        </form>
      </div>
    </div>
  )
}
