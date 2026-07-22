import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { collection, getDocs } from 'firebase/firestore'
import { db } from '../../config/firebase'
import { Package, ShoppingCart, Users, TrendingUp } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({ products: 0, orders: 0, customers: 0, revenue: 0 })

  useEffect(() => {
    async function load() {
      const [prodSnap, orderSnap, custSnap] = await Promise.all([
        getDocs(collection(db, 'products')),
        getDocs(collection(db, 'orders')),
        getDocs(collection(db, 'customers')),
      ])
      const orders = orderSnap.docs.map(d => d.data())
      setStats({
        products: prodSnap.size,
        orders: orderSnap.size,
        customers: custSnap.size,
        revenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      })
    }
    load()
  }, [])

  const cards = [
    { icon: Package, label: 'Products', value: stats.products, color: 'text-blue-400' },
    { icon: ShoppingCart, label: 'Orders', value: stats.orders, color: 'text-green-400' },
    { icon: Users, label: 'Customers', value: stats.customers, color: 'text-purple-400' },
    { icon: TrendingUp, label: 'Revenue', value: `₹${stats.revenue.toLocaleString()}`, color: 'text-gold' },
  ]

  return (
    <div>
      <h1 className="text-2xl font-bold gold-text mb-8" style={{ fontFamily: 'var(--font-heading)' }}>Dashboard</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, i) => (
          <motion.div
            key={c.label}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            className="glass rounded-2xl p-5"
          >
            <c.icon className={`${c.color} mb-3`} size={24} />
            <p className="text-2xl font-bold text-text">{c.value}</p>
            <p className="text-xs text-text-muted mt-1">{c.label}</p>
          </motion.div>
        ))}
      </div>
    </div>
  )
}
