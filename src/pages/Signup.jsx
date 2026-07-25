import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { motion } from 'framer-motion'
import { useAuth } from '../contexts/AuthContext'
import toast from 'react-hot-toast'
import { User, Mail, Lock, Eye, EyeOff } from 'lucide-react'

export default function Signup() {
  const { signup } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [showPw, setShowPw] = useState(false)
  const [loading, setLoading] = useState(false)

  async function handleSubmit(e) {
    e.preventDefault()
    if (password.length < 6) { toast.error('Password must be at least 6 characters'); return }
    setLoading(true)
    try {
      await signup(email, password, name)
      toast.success('Account created!')
      navigate('/')
    } catch (err) {
      toast.error(err.code === 'auth/email-already-in-use' ? 'Email already registered' : 'Signup failed')
    }
    setLoading(false)
  }

  return (
    <div className="pt-20 pb-16 min-h-screen flex items-center justify-center px-4">
      <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="w-full max-w-sm">
        <div className="text-center mb-6">
          <h1 className="text-2xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Create Account</h1>
          <p className="text-text-muted text-[13px] mt-1">Join Trinity Woodenworks</p>
        </div>

        <form onSubmit={handleSubmit} className="glass rounded-2xl p-6 space-y-4">
          <div>
            <label className="text-[11px] text-text-muted mb-1.5 block font-medium">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={15} />
              <input type="text" placeholder="John Doe" value={name} onChange={e => setName(e.target.value)}
                required className="input-field pl-10 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-text-muted mb-1.5 block font-medium">Email</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={15} />
              <input type="email" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)}
                required className="input-field pl-10 text-sm" />
            </div>
          </div>
          <div>
            <label className="text-[11px] text-text-muted mb-1.5 block font-medium">Password</label>
            <div className="relative">
              <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={15} />
              <input type={showPw ? 'text' : 'password'} placeholder="Min 6 characters" value={password} onChange={e => setPassword(e.target.value)}
                required className="input-field pl-10 pr-10 text-sm" />
              <button type="button" onClick={() => setShowPw(!showPw)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-text-dim bg-transparent border-none">
                {showPw ? <EyeOff size={15} /> : <Eye size={15} />}
              </button>
            </div>
          </div>

          <button type="submit" disabled={loading} className="btn-gold w-full text-sm disabled:opacity-50">
            {loading ? 'Creating account...' : 'Sign Up'}
          </button>

          <p className="text-center text-[13px] text-text-muted">
            Already have an account? <Link to="/login" className="text-gold hover:underline no-underline font-medium">Sign In</Link>
          </p>
        </form>
      </motion.div>
    </div>
  )
}
