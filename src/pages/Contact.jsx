import { useState } from 'react'
import { motion } from 'framer-motion'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../config/firebase'
import toast from 'react-hot-toast'
import { Mail, Phone, MapPin, Send } from 'lucide-react'

export default function Contact() {
  const [form, setForm] = useState({ name: '', email: '', phone: '', message: '' })
  const [loading, setLoading] = useState(false)
  const [sent, setSent] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await addDoc(collection(db, 'contactMessages'), {
        ...form,
        createdAt: new Date().toISOString(),
      })
      setSent(true)
      toast.success('Message sent!')
    } catch {
      toast.error('Failed to send')
    }
    setLoading(false)
  }

  return (
    <div className="pt-24 pb-16 max-w-5xl mx-auto px-4 sm:px-6">
      <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
        <h1 className="text-3xl font-bold gold-text mb-2" style={{ fontFamily: 'var(--font-heading)' }}>Contact Us</h1>
        <p className="text-text-muted text-sm mb-10">We'd love to hear from you</p>
      </motion.div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
        {/* Info */}
        <motion.div initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} className="space-y-6">
          <div className="glass rounded-2xl p-5 flex items-start gap-4">
            <MapPin className="text-gold mt-1" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-text">Address</h3>
              <p className="text-sm text-text-muted">Varanasi, Uttar Pradesh, India</p>
            </div>
          </div>
          <div className="glass rounded-2xl p-5 flex items-start gap-4">
            <Phone className="text-gold mt-1" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-text">Phone</h3>
              <p className="text-sm text-text-muted">+91 98765 43210</p>
            </div>
          </div>
          <div className="glass rounded-2xl p-5 flex items-start gap-4">
            <Mail className="text-gold mt-1" size={20} />
            <div>
              <h3 className="text-sm font-semibold text-text">Email</h3>
              <p className="text-sm text-text-muted">hello@trinitywoodenworks.com</p>
            </div>
          </div>
        </motion.div>

        {/* Form */}
        <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="md:col-span-2">
          {sent ? (
            <div className="glass rounded-2xl p-10 text-center">
              <Send size={40} className="mx-auto text-gold mb-4" />
              <h2 className="text-xl font-bold text-text mb-2">Message Sent!</h2>
              <p className="text-sm text-text-muted">We'll get back to you within 24 hours.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <input placeholder="Your Name" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} required className="input-field" />
                <input type="email" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} required className="input-field" />
              </div>
              <input placeholder="Phone (optional)" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} className="input-field" />
              <textarea placeholder="Your Message" value={form.message} onChange={e => setForm({ ...form, message: e.target.value })} required className="input-field min-h-[120px]" />
              <button type="submit" disabled={loading} className="btn-gold flex items-center gap-2">
                <Send size={16} /> {loading ? 'Sending...' : 'Send Message'}
              </button>
            </form>
          )}
        </motion.div>
      </div>
    </div>
  )
}
