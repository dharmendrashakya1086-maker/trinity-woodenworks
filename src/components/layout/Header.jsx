import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { Menu, X, ShoppingBag, User, LogOut, ChevronDown } from 'lucide-react'

export default function Header() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()

  const isActive = (path) => location.pathname === path

  const navLinks = [
    { to: '/', label: 'Home' },
    { to: '/shop', label: 'Shop' },
    { to: '/categories', label: 'Categories' },
    { to: '/about', label: 'About' },
    { to: '/contact', label: 'Contact' },
  ]

  async function handleLogout() {
    await logout()
    setUserMenuOpen(false)
    navigate('/')
  }

  return (
    <header className="fixed top-0 left-0 right-0 z-50 glass border-b border-dark-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline">
          <span className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>
            Trinity Woodenworks
          </span>
        </Link>

        {/* Desktop Nav */}
        <nav className="hidden md:flex items-center gap-6">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`text-sm no-underline transition-colors ${isActive(l.to) ? 'text-gold' : 'text-text-muted hover:text-text'}`}
            >
              {l.label}
            </Link>
          ))}
        </nav>

        {/* Right side */}
        <div className="flex items-center gap-3">
          {user ? (
            <>
              <Link to="/cart" className="relative p-2 text-text-muted hover:text-gold transition-colors">
                <ShoppingBag size={20} />
                {count > 0 && (
                  <span className="absolute -top-1 -right-1 bg-gold text-dark text-xs w-5 h-5 rounded-full flex items-center justify-center font-bold">
                    {count}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="flex items-center gap-1 text-sm text-text-muted hover:text-gold transition-colors bg-transparent border-none cursor-pointer"
                >
                  <User size={18} />
                  <ChevronDown size={14} />
                </button>

                {userMenuOpen && (
                  <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl p-2 shadow-xl">
                    <Link to="/account" onClick={() => setUserMenuOpen(false)} className="block px-3 py-2 text-sm text-text-muted hover:text-gold hover:bg-gold-dim rounded-lg no-underline transition-all">
                      My Account
                    </Link>
                    <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="block px-3 py-2 text-sm text-text-muted hover:text-gold hover:bg-gold-dim rounded-lg no-underline transition-all">
                      My Orders
                    </Link>
                    <Link to="/track-order" onClick={() => setUserMenuOpen(false)} className="block px-3 py-2 text-sm text-text-muted hover:text-gold hover:bg-gold-dim rounded-lg no-underline transition-all">
                      Track Order
                    </Link>
                    <Link to="/custom-order" onClick={() => setUserMenuOpen(false)} className="block px-3 py-2 text-sm text-text-muted hover:text-gold hover:bg-gold-dim rounded-lg no-underline transition-all">
                      Custom Order
                    </Link>
                    <hr className="border-dark-border my-1" />
                    <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-400 hover:bg-red-500/10 rounded-lg border-none bg-transparent cursor-pointer transition-all">
                      <LogOut size={14} /> Logout
                    </button>
                  </div>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="btn-gold text-sm no-underline px-4 py-2">
              Sign In
            </Link>
          )}

          {/* Mobile menu toggle */}
          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 text-text-muted bg-transparent border-none cursor-pointer"
          >
            {menuOpen ? <X size={22} /> : <Menu size={22} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden glass border-t border-dark-border px-4 py-4 space-y-2">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={`block py-2 text-sm no-underline ${isActive(l.to) ? 'text-gold' : 'text-text-muted'}`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </header>
  )
}
