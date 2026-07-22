import { useState } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Mail, ArrowLeft } from 'lucide-react'

export default function ForgotPassword() {
  const { resetPassword } = useAuth()
  const [email, setEmail] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    setLoading(true)
    try {
      await resetPassword(email)
      setSent(true)
    } catch (err) {
      toast.error('No account found with this email')
    }
    setLoading(false)
  }

  return (
    <div className="pt-24 pb-16 min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-md">
        <Link to="/login" className="inline-flex items-center gap-2 text-sm text-text-muted hover:text-gold no-underline mb-6">
          <ArrowLeft size={16} /> Back to Login
        </Link>

        <div className="text-center mb-8">
          <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Reset Password</h1>
          <p className="text-text-muted text-sm mt-2">We'll send you a reset link</p>
        </div>

        {sent ? (
          <div className="glass rounded-2xl p-6 text-center">
            <Mail size={40} className="mx-auto text-gold mb-4" />
            <h2 className="text-lg font-semibold text-text mb-2">Check your email</h2>
            <p className="text-sm text-text-muted mb-4">We've sent a password reset link to {email}</p>
            <Link to="/login" className="btn-gold no-underline inline-block">Back to Login</Link>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" size={18} />
              <input type="email" placeholder="Your email" value={email} onChange={e => setEmail(e.target.value)} required className="input-field pl-10" />
            </div>
            <button type="submit" disabled={loading} className="btn-gold w-full disabled:opacity-50">
              {loading ? 'Sending...' : 'Send Reset Link'}
            </button>
          </form>
        )}
      </motion.div>
    </div>
  )
}
