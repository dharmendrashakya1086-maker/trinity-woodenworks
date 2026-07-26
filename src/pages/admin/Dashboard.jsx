import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { motion } from 'framer-motion'
import { getEntities, publishAll, logAudit, getAuditLog } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Package, ShoppingCart, TrendingUp, ArrowUpCircle, Loader, Shield, FolderTree, Layers } from 'lucide-react'
import CategoryManager from '../../components/admin/CategoryManager'

export default function Dashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ draftProducts: 0, liveProducts: 0, draftCategories: 0, liveCategories: 0, orders: 0, totalRevenue: 0 })
  const [categories, setCategories] = useState([])
  const [auditLog, setAuditLog] = useState([])
  const [publishing, setPublishing] = useState(false)
  const [activeTab, setActiveTab] = useState('overview')

  useEffect(() => { load() }, [])

  async function load() {
    const [dp, lp, dc, lc, orders, audit, cats] = await Promise.all([
      getEntities('products_draft'), getEntities('products'),
      getEntities('categories_draft'), getEntities('categories'),
      getEntities('orders'), getAuditLog({ limit: 10 }),
      getEntities('categories'),
    ])
    setStats({
      draftProducts: dp.length, liveProducts: lp.length,
      draftCategories: dc.length, liveCategories: lc.length,
      orders: orders.length,
      totalRevenue: orders.reduce((sum, o) => sum + (o.total || 0), 0),
    })
    setCategories(cats)
    setAuditLog(audit)
  }

  async function handlePublishAll() {
    const changes = stats.draftProducts + stats.draftCategories
    if (changes === 0) { toast('Nothing to publish'); return }
    if (!confirm(`Publish ${stats.draftProducts} products and ${stats.draftCategories} categories?`)) return
    setPublishing(true)
    try {
      const [p, c] = await Promise.all([publishAll('products'), publishAll('categories')])
      await logAudit({ userId: user.uid, action: 'publish_all', entityType: 'all', newValue: { products: p, categories: c } })
      toast.success(`Published ${p} products and ${c} categories!`)
      load()
    } catch (err) { toast.error(err.message) }
    setPublishing(false)
  }

  const tabs = [
    { id: 'overview', label: 'Overview', icon: Package },
    { id: 'categories', label: 'Categories', icon: FolderTree },
    { id: 'audit', label: 'Audit Log', icon: Shield },
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
          <button onClick={handlePublishAll} disabled={publishing} className="btn-gold inline-flex items-center gap-2 text-sm disabled:opacity-50">
            {publishing ? <><Loader size={14} className="animate-spin" /> Publishing...</> : <><ArrowUpCircle size={14} /> Publish All</>}
          </button>
        </motion.div>
      )}

      {/* Tabs */}
      <div className="flex gap-1 mb-5 glass rounded-lg p-1">
        {tabs.map(t => (
          <button key={t.id} onClick={() => setActiveTab(t.id)}
            className={`flex items-center gap-1.5 px-3 py-2 rounded-md text-xs font-medium transition-all bg-transparent border-none cursor-pointer
              ${activeTab === t.id ? 'bg-gold-dim text-gold' : 'text-text-muted hover:text-text'}`}>
            <t.icon size={13} /> {t.label}
          </button>
        ))}
      </div>

      {activeTab === 'overview' && (
        <div className="grid grid-cols-2 lg:grid-cols-3 gap-3 mb-6">
          {[
            { label: 'Products (Draft)', value: stats.draftProducts, to: '/admin/products' },
            { label: 'Products (Live)', value: stats.liveProducts, to: '/admin/products' },
            { label: 'Categories (Draft)', value: stats.draftCategories, to: '#', onClick: () => setActiveTab('categories') },
            { label: 'Categories (Live)', value: stats.liveCategories, to: '#', onClick: () => setActiveTab('categories') },
            { label: 'Orders', value: stats.orders, to: '/admin/orders' },
            { label: 'Revenue', value: `₹${stats.totalRevenue.toLocaleString()}`, to: '/admin/orders' },
          ].map((c, i) => (
            <motion.div key={c.label} initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              {c.onClick ? (
                <button onClick={c.onClick} className="glass glass-hover rounded-xl p-4 flex items-center gap-3 w-full text-left bg-transparent border-none cursor-pointer">
                  <div className="w-10 h-10 rounded-lg bg-gold-dim border border-gold/10 flex items-center justify-center"><Package className="text-gold" size={18} /></div>
                  <div><p className="text-[10px] text-text-muted">{c.label}</p><p className="text-lg font-bold text-text">{c.value}</p></div>
                </button>
              ) : (
                <Link to={c.to} className="glass glass-hover rounded-xl p-4 flex items-center gap-3 no-underline block">
                  <div className="w-10 h-10 rounded-lg bg-gold-dim border border-gold/10 flex items-center justify-center"><Package className="text-gold" size={18} /></div>
                  <div><p className="text-[10px] text-text-muted">{c.label}</p><p className="text-lg font-bold text-text">{c.value}</p></div>
                </Link>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {activeTab === 'categories' && (
        <div className="glass rounded-xl p-4">
          <CategoryManager categories={categories} onUpdate={load} />
        </div>
      )}

      {activeTab === 'audit' && (
        <div className="glass rounded-xl p-4">
          <div className="flex items-center gap-2 mb-3">
            <Shield size={14} className="text-gold" />
            <h2 className="text-sm font-semibold text-text">Audit Log</h2>
          </div>
          {auditLog.length === 0 ? (
            <p className="text-text-dim text-xs py-4 text-center">No activity yet</p>
          ) : (
            <div className="space-y-2 max-h-[400px] overflow-y-auto">
              {auditLog.map((a, i) => (
                <div key={a.id || i} className="flex items-start gap-2 py-2 border-b border-white/[0.04] last:border-0">
                  <div className="w-6 h-6 rounded-full bg-gold-dim flex items-center justify-center flex-shrink-0 mt-0.5">
                    <Shield size={10} className="text-gold" />
                  </div>
                  <div className="min-w-0">
                    <p className="text-[11px] text-text">
                      <span className="text-gold">{a.action}</span> on <span className="text-text-muted">{a.entityType}/{a.entityId?.slice(0, 8)}</span>
                    </p>
                    <p className="text-[10px] text-text-dim">{new Date(a.createdAt).toLocaleString()}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
