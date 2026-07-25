import { useState } from 'react'
import { Link } from 'react-router-dom'
import { collection, addDoc } from 'firebase/firestore'
import { db } from '../../config/firebase'
import toast from 'react-hot-toast'

export default function Footer() {
  const [email, setEmail] = useState('')

  async function handleNewsletter(e) {
    e.preventDefault()
    if (!email) return
    try {
      await addDoc(collection(db, 'newsletter'), { email, createdAt: new Date().toISOString() })
      toast.success('Subscribed!')
      setEmail('')
    } catch {
      toast.error('Failed to subscribe')
    }
  }

  return (
    <footer className="bg-[#08080c] border-t border-white/[0.04] mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-14">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <h3 className="text-lg font-bold gold-text mb-3" style={{ fontFamily: 'var(--font-heading)' }}>
              Trinity
            </h3>
            <p className="text-[13px] text-text-muted leading-relaxed mb-4">
              Premium handcrafted wooden furniture and home décor, made with precision in Varanasi, India.
            </p>
            <div className="flex gap-3">
              {['facebook', 'instagram', 'twitter'].map(s => (
                <a key={s} href={`https://${s}.com`} target="_blank" rel="noreferrer"
                  className="w-9 h-9 rounded-lg bg-white/[0.03] border border-white/[0.06] flex items-center justify-center text-text-muted hover:text-gold hover:border-gold/20 hover:bg-gold-dim transition-all text-xs capitalize">
                  {s[0].toUpperCase()}
                </a>
              ))}
            </div>
          </div>

          {/* Quick Links */}
          <div>
            <h4 className="text-[13px] font-semibold text-text mb-4 uppercase tracking-wider">Quick Links</h4>
            <div className="space-y-2.5">
              {[
                { to: '/shop', label: 'Shop All' },
                { to: '/categories', label: 'Categories' },
                { to: '/custom-order', label: 'Custom Order' },
                { to: '/track-order', label: 'Track Order' },
              ].map(l => (
                <Link key={l.to} to={l.to} className="block text-[13px] text-text-muted hover:text-gold transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Account */}
          <div>
            <h4 className="text-[13px] font-semibold text-text mb-4 uppercase tracking-wider">Account</h4>
            <div className="space-y-2.5">
              {[
                { to: '/login', label: 'Sign In' },
                { to: '/signup', label: 'Sign Up' },
                { to: '/account', label: 'My Account' },
                { to: '/orders', label: 'Order History' },
              ].map(l => (
                <Link key={l.to} to={l.to} className="block text-[13px] text-text-muted hover:text-gold transition-colors">
                  {l.label}
                </Link>
              ))}
            </div>
          </div>

          {/* Newsletter */}
          <div>
            <h4 className="text-[13px] font-semibold text-text mb-4 uppercase tracking-wider">Newsletter</h4>
            <p className="text-[13px] text-text-muted mb-3">Get updates on new arrivals and offers.</p>
            <form onSubmit={handleNewsletter} className="flex">
              <input
                type="email"
                placeholder="Your email"
                value={email}
                onChange={e => setEmail(e.target.value)}
                required
                className="flex-1 px-3 py-2 bg-white/[0.03] border border-white/[0.06] rounded-l-lg text-[13px] text-text placeholder:text-text-dim"
              />
              <button type="submit" className="px-4 py-2 bg-gold text-dark text-[13px] font-semibold rounded-r-lg hover:bg-gold-light transition-colors">
                Join
              </button>
            </form>
          </div>
        </div>

        <div className="border-t border-white/[0.04] mt-10 pt-6 text-center text-[12px] text-text-dim">
          © {new Date().getFullYear()} Trinity Woodenworks. All rights reserved.
        </div>
      </div>
    </footer>
  )
}
