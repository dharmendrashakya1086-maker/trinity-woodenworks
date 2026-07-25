import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Mail, ArrowLeft, CheckCircle } from 'lucide-react'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try { await resetPassword(email); setSent(true) }
    catch { toast.error('No account found with this email') }
    setLoading(false)
  }

  return (
    <div className="pt-20 pb-16 min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <Link to="/login" className="inline-flex items-center gap-1.5 text-xs text-text-muted hover:text-gold no-underline mb-5">
          <ArrowLeft size={14} /> Back to Login
        </Link>

        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Reset Password</h1>
          <p className="text-text-muted text-[13px] mt-1">We'll send you a reset link</p>
        </div>

        {sent ? (
          <div className="glass rounded-2xl p-8 text-center">
            <CheckCircle size={40} className="mx-auto text-gold mb-4" />
            <h2 className="text-lg font-semibold text-text mb-2">Check your email</h2>
            <p className="text-[13px] text-text-muted mb-4">We've sent a reset link to {email}</p>
            <Link to="/login" className="btn-gold no-underline inline-block text-sm">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
            <div>
              <label className="text-[11px] text-text-muted mb-1.5 block font-medium">Email</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={15} />
                <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                  required className="input-field pl-10 text-sm" />
              </div>
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full text-sm disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
