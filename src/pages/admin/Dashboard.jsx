import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, getDocs, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { Package, ShoppingCart, Users, TrendingUp, Eye } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, categories: 0, orders: 0, customOrders: 0, totalRevenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])

  useEffect(() => {
    async function load() {
      const [prodSnap, catSnap, orderSnap, customSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'categories')),
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'customOrders')),
      ])
      const orders = orderSnap.docs.map(d => d.data())
      setStats({
        products: prodSnap.size, categories: catSnap.size, orders: orderSnap.size,
        customOrders: customSnap.size, totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      })
      const recentQ = query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5))
      const recentSnap = await getDocs(recentQ)
      setRecentOrders(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    load()
  }, [])

  const cards = [
    { label: 'Products', value: stats.products, icon: Package, to: '/admin/products' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, to: '/admin/orders' },
    { label: 'Custom Orders', value: stats.customOrders, icon: Users, to: '/admin/orders' },
    { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, to: '/admin/orders' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold gold-text mb-5" style={{ fontFamily: 'var(--font-heading)' }}>Dashboard</h1>

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={c.to} className="glass glass-hover rounded-xl p-4 flex items-center gap-3 no-underline block">
              <div className="w-10 h-10 rounded-lg bg-gold-dim border border-gold/10 flex items-center justify-center">
                <c.icon className="text-gold" size={18} />
              </div>
              <div>
                <p className="text-[11px] text-text-muted">{c.label}</p>
                <p className="text-lg font-bold text-text">{c.value}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="glass rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-text">Recent Orders</h2>
          <Link to="/admin/orders" className="text-[11px] text-gold hover:underline no-underline">View All →</Link>
        </div>
        {recentOrders.length === 0 ? (
          <p className="text-text-dim text-xs py-4 text-center">No orders yet</p>
        ) : (
          <div className="space-y-2">
            {recentOrders.map(o => (
              <div key={o.id} className="flex items-center justify-between py-2 border-b border-white/[0.04] last:border-0">
                <div>
                  <p className="text-xs text-text">#{o.id.slice(0, 8).toUpperCase()}</p>
                  <p className="text-[10px] text-text-dim">{new Date(o.createdAt).toLocaleDateString()}</p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`badge ${o.status === 'delivered' ? 'badge-green' : o.status === 'cancelled' ? 'badge-red' : 'badge-gold'} text-[9px]`}>{o.status}</span>
                  <span className="text-xs text-gold font-semibold">₹{o.total?.toLocaleString()}</span>
                  <Link to={`/admin/orders?id=${o.id}`} className="text-text-dim hover:text-gold"><Eye size={13} /></Link>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
