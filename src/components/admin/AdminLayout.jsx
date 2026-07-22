import { Outlet, Link, useLocation, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { LayoutDashboard, Package, ShoppingCart, LogOut, ArrowLeft } from 'lucide-react'

export default function AdminLayout() {
  const { isAdmin, logout } = useAuth()
  const location = useLocation()

  if (!isAdmin) return <Navigate to="/admin/login" />

  const links = [
    { to: '/admin', icon: LayoutDashboard, label: 'Dashboard' },
    { to: '/admin/products', icon: Package, label: 'Products' },
    { to: '/admin/orders', icon: ShoppingCart, label: 'Orders' },
  ]

  return (
    <div className="min-h-screen bg-dark flex">
      {/* Sidebar */}
      <aside className="w-64 glass border-r border-dark-border p-4 flex flex-col fixed h-full">
        <h2 className="text-lg font-bold gold-text mb-6 px-2" style={{ fontFamily: 'var(--font-heading)' }}>
          Admin Panel
        </h2>

        <nav className="flex-1 space-y-1">
          {links.map(l => {
            const active = location.pathname === l.to
            return (
              <Link
                key={l.to}
                to={l.to}
                className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm no-underline transition-all ${
                  active ? 'bg-gold-dim text-gold' : 'text-text-muted hover:text-text hover:bg-white/5'
                }`}
              >
                <l.icon size={18} />
                {l.label}
              </Link>
            )
          })}
        </nav>

        <div className="space-y-1 mt-auto">
          <Link to="/" className="flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-text-muted hover:text-text hover:bg-white/5 no-underline transition-all">
            <ArrowLeft size={18} /> Back to Site
          </Link>
          <button onClick={logout} className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm text-red-400 hover:bg-red-500/10 border-none bg-transparent cursor-pointer transition-all">
            <LogOut size={18} /> Logout
          </button>
        </div>
      </aside>

      {/* Main content */}
      <main className="flex-1 ml-64 p-8">
        <Outlet />
      </main>
    </div>
  )
}
