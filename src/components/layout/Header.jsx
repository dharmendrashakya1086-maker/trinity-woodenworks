import { useState } from 'react'
import { Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { useCart } from '../../contexts/CartContext'
import { ShoppingBag, User, LogOut, Menu, X, Search, Heart, Eye, Store } from 'lucide-react'
import SearchOverlay from '../ui/SearchOverlay'

export default function Header() {
  const { user, logout } = useAuth()
  const { count } = useCart()
  const [menuOpen, setMenuOpen] = useState(false)
  const [userMenuOpen, setUserMenuOpen] = useState(false)
  const [searchOpen, setSearchOpen] = useState(false)
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
    <>
    <nav className="fixed top-0 left-0 right-0 z-50 bg-[#0a0a0f] border-b border-white/[0.04]">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
        {/* Logo */}
        <Link to="/" className="flex items-center gap-2 no-underline shrink-0">
          <span className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>
            Trinity
          </span>
          <span className="text-[10px] text-text-muted tracking-widest uppercase hidden sm:block mt-0.5">
            Woodenworks
          </span>
        </Link>

        {/* Desktop Nav Links */}
        <div className="hidden md:flex items-center gap-1">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              className={`px-3 py-1.5 text-[13px] font-medium rounded-lg no-underline transition-all ${
                isActive(l.to)
                  ? 'text-gold bg-gold-dim'
                  : 'text-text-muted hover:text-text hover:bg-white/[0.03]'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>

        {/* Right Icons */}
        <div className="flex items-center gap-1">
          <button onClick={() => setSearchOpen(true)}
            className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-gold-dim transition-all bg-transparent border-none cursor-pointer"
            title="Search">
            <Search size={18} />
          </button>

          <Link
            to="/shop"
            className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-gold-dim transition-all"
            title="Browse Products"
          >
            <Store size={18} />
          </Link>

          {user ? (
            <>
              <Link
                to="/orders"
                className="p-2 rounded-lg text-text-muted hover:text-gold hover:bg-gold-dim transition-all hidden sm:flex"
                title="My Orders"
              >
                <Eye size={18} />
              </Link>

              <Link
                to="/cart"
                className="relative p-2 rounded-lg text-text-muted hover:text-gold hover:bg-gold-dim transition-all"
                title="Cart"
              >
                <ShoppingBag size={18} />
                {count > 0 && (
                  <span className="absolute -top-0.5 -right-0.5 bg-gold text-dark text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                    {count}
                  </span>
                )}
              </Link>

              <div className="relative">
                <button
                  onClick={() => setUserMenuOpen(!userMenuOpen)}
                  className="w-8 h-8 rounded-full bg-gold/20 border border-gold/30 flex items-center justify-center text-gold text-xs font-bold cursor-pointer hover:bg-gold/30 transition-all"
                >
                  {user.email?.[0]?.toUpperCase() || <User size={14} />}
                </button>

                {userMenuOpen && (
                  <>
                    <div className="fixed inset-0 z-40" onClick={() => setUserMenuOpen(false)} />
                    <div className="absolute right-0 top-full mt-2 w-48 glass rounded-xl p-1.5 z-50 shadow-2xl">
                      <div className="px-3 py-2 border-b border-white/[0.05] mb-1">
                        <p className="text-[11px] text-text-muted truncate">{user.email}</p>
                      </div>
                      <Link to="/account" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-[13px] text-text-muted hover:text-gold hover:bg-gold-dim rounded-lg transition-all">
                        <User size={14} /> My Account
                      </Link>
                      <Link to="/orders" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-[13px] text-text-muted hover:text-gold hover:bg-gold-dim rounded-lg transition-all">
                        <Eye size={14} /> My Orders
                      </Link>
                      <Link to="/custom-order" onClick={() => setUserMenuOpen(false)} className="flex items-center gap-2 px-3 py-2 text-[13px] text-text-muted hover:text-gold hover:bg-gold-dim rounded-lg transition-all">
                        <Store size={14} /> Custom Order
                      </Link>
                      <div className="border-t border-white/[0.05] mt-1 pt-1">
                        <button onClick={handleLogout} className="w-full flex items-center gap-2 px-3 py-2 text-[13px] text-red-400 hover:bg-red-500/10 rounded-lg bg-transparent transition-all">
                          <LogOut size={14} /> Logout
                        </button>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </>
          ) : (
            <Link to="/login" className="btn-gold text-xs px-4 py-2 no-underline rounded-lg">
              Sign In
            </Link>
          )}

          <button
            onClick={() => setMenuOpen(!menuOpen)}
            className="md:hidden p-2 rounded-lg text-text-muted hover:text-gold hover:bg-gold-dim transition-all bg-transparent"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
        </div>
      </div>

      {/* Mobile Nav */}
      {menuOpen && (
        <div className="md:hidden bg-[#0a0a0f] border-t border-white/[0.04] px-4 py-3 space-y-1">
          {navLinks.map(l => (
            <Link
              key={l.to}
              to={l.to}
              onClick={() => setMenuOpen(false)}
              className={`block py-2.5 px-3 text-sm rounded-lg no-underline transition-all ${
                isActive(l.to) ? 'text-gold bg-gold-dim' : 'text-text-muted hover:text-text'
              }`}
            >
              {l.label}
            </Link>
          ))}
        </div>
      )}
    </nav>
    <SearchOverlay open={searchOpen} onClose={() => setSearchOpen(false)} />
    </>
  )
}
