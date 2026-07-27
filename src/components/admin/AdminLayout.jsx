import { useState, useEffect } from 'react'
import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LayoutDashboard, Package, ShoppingCart, Database, LogOut, Menu, X, Warehouse, Users, Tag, Megaphone, Factory, BarChart3, Settings } from 'lucide-react'

const nav = [
  { to: '/admin', icon: LayoutDashboard, label: 'Dashboard', end: true },
  { to: '/admin/products', icon: Package, label: 'Products' },
  { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  { to: '/admin/customers', icon: Users, label: 'Customers' },
  { to: '/admin/inventory', icon: Warehouse, label: 'Inventory' },
  { to: '/admin/manufacturing', icon: Factory, label: 'Manufacturing' },
  { to: '/admin/coupons', icon: Tag, label: 'Coupons' },
  { to: '/admin/marketing', icon: Megaphone, label: 'Marketing' },
  { to: '/admin/reports', icon: BarChart3, label: 'Reports' },
  { to: '/admin/settings', icon: Settings, label: 'Settings' },
  { to: '/admin/seed', icon: Database, label: 'Seed Data' },
]

export default function AdminLayout() {
  const { currentUser, logout } = useAuth()
  const location = useLocation()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)

  useEffect(() => { setOpen(false) }, [location])

  function isActive(to) {
    return to === '/admin' ? location.pathname === '/admin' : location.pathname.startsWith(to)
  }

  async function handleLogout() { await logout(); navigate('/') }

  return (
    <div className="flex min-h-screen">
      <aside className="w-60 bg-surface border-r border-white/[0.06] flex flex-col fixed inset-y-0 left-0 z-30
        max-lg:fixed max-lg:inset-y-0 max-lg:left-0 max-lg:w-60 max-lg:transform max-lg:transition-transform max-lg:duration-300
        max-lg:data-[open=false]:-translate-x-full">
        <div className="p-4 border-b border-white/[0.06]">
          <Link to="/admin" className="text-sm font-bold gold-text no-underline" style={{ fontFamily: 'var(--font-heading)' }}>Trinity Admin</Link>
        </div>
        <nav className="flex-1 p-3 space-y-1">
          {nav.map(n => (
            <Link key={n.to} to={n.to} end={n.end}
              className={`flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium no-underline transition-all
                ${isActive(n.to) ? 'bg-gold-dim text-gold border border-gold/10' : 'text-text-muted hover:bg-white/[0.03] hover:text-text border border-transparent'}`}>
              <n.icon size={15} /> {n.label}
            </Link>
          ))}
        </nav>
        <div className="p-3 border-t border-white/[0.06]">
          <button onClick={handleLogout} className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg text-xs font-medium text-text-muted hover:text-red-400 hover:bg-white/[0.03] w-full transition-all">
            <LogOut size={15} /> Logout
          </button>
        </div>
      </aside>

      <div className="flex-1 lg:ml-60">
        <div className="lg:hidden p-3 border-b border-white/[0.06] flex items-center gap-3">
          <button onClick={() => setOpen(!open)} className="p-1.5 glass rounded-lg">
            {open ? <X size={16} className="text-text-muted" /> : <Menu size={16} className="text-text-muted" />}
          </button>
          <span className="text-sm font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Trinity Admin</span>
        </div>

        <div className="p-5 max-w-6xl mx-auto">
          <Outlet />
        </div>
      </div>

      {open && <div className="fixed inset-0 bg-black/40 z-20 lg:hidden" onClick={() => setOpen(false)} />}
    </div>
  )
}
