import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { collection, getDocs, doc, setDoc, query, orderBy, limit } from 'firebase/firestore'
import { db } from '../../config/firebase'
import toast from 'react-hot-toast'
import { Package, ShoppingCart, Users, TrendingUp, Eye, ArrowUpCircle, Loader } from 'lucide-react'

export default function Dashboard() {
  const [stats, setStats] = useState({ draftProducts: 0, liveProducts: 0, draftCategories: 0, liveCategories: 0, orders: 0, customOrders: 0, totalRevenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    async function safeGet(q) { try { return await getDocs(q) } catch { return { docs: [], size: 0 } } }
    async function load() {
      const [dp, lp, dc, lc, orderSnap, customSnap] = await Promise.all([
        safeGet(collection(db, 'products_draft')),
        safeGet(collection(db, 'products')),
        safeGet(collection(db, 'categories_draft')),
        safeGet(collection(db, 'categories')),
        safeGet(collection(db, 'orders')),
        safeGet(collection(db, 'customOrders')),
      ])
      const orders = orderSnap.docs.map(d => d.data())
      setStats({
        draftProducts: dp.size, liveProducts: lp.size,
        draftCategories: dc.size, liveCategories: lc.size,
        orders: orderSnap.size, customOrders: customSnap.size,
        totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      })
      const recentSnap = await safeGet(query(collection(db, 'orders'), orderBy('createdAt', 'desc'), limit(5)))
      setRecentOrders(recentSnap.docs.map(d => ({ id: d.id, ...d.data() })))
    }
    load()
  }, [])

  async function publishAll() {
    const changes = stats.draftProducts + stats.draftCategories
    if (changes === 0) { toast('Nothing to publish'); return }
    if (!confirm(`Publish ${stats.draftProducts} products and ${stats.draftCategories} categories to live?`)) return

    setPublishing(true)
    try {
      // Copy all drafts to live
      const [prodDraftSnap, catDraftSnap] = await Promise.all([
        getDocs(collection(db, 'products_draft')),
        getDocs(collection(db, 'categories_draft')),
      ])

      const batch1 = prodDraftSnap.docs.map(d => setDoc(doc(db, 'products', d.id), d.data()))
      const batch2 = catDraftSnap.docs.map(d => setDoc(doc(db, 'categories', d.id), d.data()))
      await Promise.all([...batch1, ...batch2])

      // Update stats
      setStats(s => ({ ...s, liveProducts: stats.draftProducts, liveCategories: stats.draftCategories }))
      toast.success(`Published ${stats.draftProducts} products and ${stats.draftCategories} categories!`)
    } catch (err) {
      toast.error('Publish failed: ' + err.message)
    }
    setPublishing(false)
  }

  const cards = [
    { label: 'Products (Draft)', value: stats.draftProducts, icon: Package, to: '/admin/products', accent: 'badge-gold' },
    { label: 'Products (Live)', value: stats.liveProducts, icon: Package, to: '/admin/products', accent: 'badge-green' },
    { label: 'Categories (Draft)', value: stats.draftCategories, icon: Package, to: '/admin/products', accent: 'badge-gold' },
    { label: 'Categories (Live)', value: stats.liveCategories, icon: Package, to: '/admin/products', accent: 'badge-green' },
    { label: 'Orders', value: stats.orders, icon: ShoppingCart, to: '/admin/orders', accent: 'badge-gold' },
    { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, icon: TrendingUp, to: '/admin/orders', accent: 'badge-gold' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold gold-text mb-5" style={{ fontFamily: 'var(--font-heading)' }}>Dashboard</h1>

      {/* Publish All Banner */}
      {stats.draftProducts > 0 || stats.draftCategories > 0 ? (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 mb-5 border border-gold/20 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text">You have unpublished changes</p>
            <p className="text-[11px] text-text-muted">{stats.draftProducts} product drafts, {stats.draftCategories} category drafts ready to publish</p>
          </div>
          <button onClick={publishAll} disabled={publishing}
            className="btn-gold inline-flex items-center gap-2 text-sm disabled:opacity-50">
            {publishing ? <><Loader size={14} className="animate-spin" /> Publishing...</> : <><ArrowUpCircle size={14} /> Publish All</>}
          </button>
        </motion.div>
      ) : null}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={c.to} className="glass glass-hover rounded-xl p-4 flex items-center gap-3 no-underline block">
              <div className="w-10 h-10 rounded-lg bg-gold-dim border border-gold/10 flex items-center justify-center">
                <c.icon className="text-gold" size={18} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted">{c.label}</p>
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
