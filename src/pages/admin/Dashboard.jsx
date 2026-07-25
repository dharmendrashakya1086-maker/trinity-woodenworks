import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getEntities, publishAll, logAudit, getAuditLog } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Package, ShoppingCart, TrendingUp, Eye, ArrowUpCircle, Loader, History, Shield } from 'lucide-react'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ draftProducts: 0, liveProducts: 0, draftCategories: 0, liveCategories: 0, orders: 0, totalRevenue: 0 })
  const [recentOrders, setRecentOrders] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [publishing, setPublishing] = useState(false)

  useEffect(() => {
    async function load() {
      const [dp, lp, dc, lc, orders, audit] = await Promise.all([
        getEntities('products_draft'),
        getEntities('products'),
        getEntities('categories_draft'),
        getEntities('categories'),
        getEntities('orders'),
        getAuditLog({ limit: 10 }),
      ])
      setStats({
        draftProducts: dp.length, liveProducts: lp.length,
        draftCategories: dc.length, liveCategories: lc.length,
        orders: orders.length,
        totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
      })
      setRecentOrders(orders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5))
      setAuditLog(audit)
    }
    load()
  }, [])

  async function handlePublishAll() {
    const changes = stats.draftProducts + stats.draftCategories
    if (changes === 0) { toast('Nothing to publish'); return }
    if (!confirm(`Publish ${stats.draftProducts} products and ${stats.draftCategories} categories?`)) return
    setPublishing(true)
    try {
      const [p, c] = await Promise.all([publishAll('products'), publishAll('categories')])
      await logAudit({ userId: user.uid, action: 'publish_all', entityType: 'all', newValue: { products: p, categories: c } })
      toast.success(`Published ${p} products and ${c} categories!`)
      setStats(s => ({ ...s, liveProducts: s.draftProducts, liveCategories: s.draftCategories }))
    } catch (err) { toast.error(err.message) }
    setPublishing(false)
  }

  const cards = [
    { label: 'Products (Draft)', value: stats.draftProducts, to: '/admin/products' },
    { label: 'Products (Live)', value: stats.liveProducts, to: '/admin/products' },
    { label: 'Categories (Draft)', value: stats.draftCategories, to: '/admin/products' },
    { label: 'Categories (Live)', value: stats.liveCategories, to: '/admin/products' },
    { label: 'Orders', value: stats.orders, to: '/admin/orders' },
    { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, to: '/admin/orders' },
  ]

  return (
    <div>
      <h1 className="text-xl font-bold gold-text mb-5" style={{ fontFamily: 'var(--font-heading)' }}>Dashboard</h1>

      {(stats.draftProducts > 0 || stats.draftCategories > 0) && (
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}
          className="glass rounded-xl p-4 mb-5 border border-gold/20 flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-semibold text-text">Unpublished changes ready</p>
            <p className="text-[11px] text-text-muted">{stats.draftProducts} product drafts, {stats.draftCategories} category drafts</p>
          </div>
          <button onClick={handlePublishAll} disabled={publishing}
            className="btn-gold inline-flex items-center gap-2 text-sm disabled:opacity-50">
            {publishing ? <><Loader size={14} className="animate-spin" /> Publishing...</> : <><ArrowUpCircle size={14} /> Publish All</>}
          </button>
        </motion.div>
      )}

      <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Link to={c.to} className="glass glass-hover rounded-xl p-4 flex items-center gap-3 no-underline block">
              <div className="w-10 h-10 rounded-lg bg-gold-dim border border-gold/10 flex items-center justify-center">
                <Package className="text-gold" size={18} />
              </div>
              <div>
                <p className="text-[10px] text-text-muted">{c.label}</p>
                <p className="text-lg font-bold text-text">{c.value}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        {/* Recent Orders */}
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
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Audit Log */}
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-gold" />
            <h2 className="text-sm font-semibold text-text">Audit Log</h2>
          </div>
          {auditLog.length === 0 ? (
            <p className="text-text-dim text-xs py-4 text-center">No activity yet</p>
          ) : (
            <div className="space-y-2 max-h-[300px] overflow-y-auto">
              {auditLog.map((a, i) => (
                <div key={a.id || i} className="flex items-start gap-2 py-2 border-b border-white/[0.04] last:border-0">
                  <div className="w-6 h-6 rounded-full bg-gold-dim flex items-center justify-center flex-shrink-0 mt-0.5">
                    <History size={10} className="text-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-text">
                      <span className="text-gold">{a.action}</span>
                      {' '}on{' '}
                      <span className="text-text-muted">{a.entityType}/{a.entityId?.slice(0, 8)}</span>
                    </p>
                    <p className="text-[10px] text-text-dim">{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
