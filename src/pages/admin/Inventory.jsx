import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAllInventory, adjustStock, getInventoryLog, getEntities } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Search, Package, AlertTriangle, XCircle, Plus, Minus, History, Loader } from 'lucide-react'

export default function Inventory() {
  const { user } = useAuth()
  const [inventory, setInventory] = useState([])
  const [products, setProducts] = useState([])
  const [log, setLog] = useState([])
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [adjustModal, setAdjustModal] = useState(null)
  const [qty, setQty] = useState(0)
  const [reason, setReason] = useState('')
  const [loading, setLoading] = useState(false)
  const [activeTab, setActiveTab] = useState('stock')

  useEffect(() => { load() }, [])

  async function load() {
    const [inv, prods, logData] = await Promise.all([getAllInventory(), getEntities('products'), getInventoryLog()])
    setInventory(inv)
    setProducts(prods)
    setLog(logData)
  }

  function getProductName(productId) {
    return products.find(p => p.id === productId)?.name || productId?.slice(0, 8)
  }

  const filtered = inventory.filter(i => {
    const name = getProductName(i.productId).toLowerCase()
    const matchSearch = !search || name.includes(search.toLowerCase()) || i.productId?.includes(search)
    if (filter === 'low') return matchSearch && i.quantity > 0 && i.quantity <= (i.reorderLevel || 5)
    if (filter === 'out') return matchSearch && i.quantity === 0
    if (filter === 'in') return matchSearch && i.quantity > 0
    return matchSearch
  })

  async function handleAdjust() {
    if (!reason.trim()) { toast.error('Enter a reason'); return }
    setLoading(true)
    try {
      await adjustStock(adjustModal.productId, adjustModal.variantId, qty, reason, user.uid)
      toast.success(`Stock adjusted by ${qty > 0 ? '+' : ''}${qty}`)
      setAdjustModal(null)
      setQty(0)
      setReason('')
      load()
    } catch (err) { toast.error(err.message) }
    setLoading(false)
  }

  const totalStock = inventory.reduce((s, i) => s + (i.quantity || 0), 0)
  const lowCount = inventory.filter(i => i.quantity > 0 && i.quantity <= (i.reorderLevel || 5)).length
  const outCount = inventory.filter(i => i.quantity === 0).length

  return (
    <div>
      <h1 className="text-xl font-bold gold-text mb-5" style={{ fontFamily: 'var(--font-heading)' }}>Inventory</h1>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Total Stock', value: totalStock, icon: Package, color: 'text-gold' },
          { label: 'In Stock', value: inventory.filter(i => i.quantity > 0).length, icon: Package, color: 'text-accent-green' },
          { label: 'Low Stock', value: lowCount, icon: AlertTriangle, color: 'text-yellow-400' },
          { label: 'Out of Stock', value: outCount, icon: XCircle, color: 'text-accent-red' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-3">
            <div className="flex items-center gap-2 mb-1">
              <s.icon size={14} className={s.color} />
              <span className="text-[10px] text-text-muted">{s.label}</span>
            </div>
            <p className="text-lg font-bold text-text">{s.value}</p>
          </motion.div>
        ))}
      </div>

      {/* Tabs */}
      <div className="flex gap-1 mb-4 glass rounded-lg p-1">
        {['stock', 'log'].map(tab => (
          <button key={tab} onClick={() => setActiveTab(tab)}
            className={`px-3 py-2 rounded-md text-xs font-medium transition-all bg-transparent border-none cursor-pointer
              ${activeTab === tab ? 'bg-gold-dim text-gold' : 'text-text-muted hover:text-text'}`}>
            {tab === 'stock' ? 'Stock Levels' : 'Adjustment History'}
          </button>
        ))}
      </div>

      {activeTab === 'stock' && (
        <>
          <div className="flex flex-wrap gap-2 mb-4">
            <div className="relative flex-1 min-w-[200px]">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
              <input placeholder="Search products..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-xs w-full" />
            </div>
            {['all', 'in', 'low', 'out'].map(f => (
              <button key={f} onClick={() => setFilter(f)}
                className={`px-3 py-1.5 rounded-lg text-[10px] font-medium border transition-all bg-transparent cursor-pointer
                  ${filter === f ? 'border-gold bg-gold-dim text-gold' : 'border-white/[0.08] text-text-muted hover:border-gold/30'}`}>
                {f === 'all' ? 'All' : f === 'in' ? 'In Stock' : f === 'low' ? 'Low Stock' : 'Out of Stock'}
              </button>
            ))}
          </div>

          <div className="glass rounded-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="border-b border-white/[0.06]">
                    <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Product</th>
                    <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Variant</th>
                    <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Quantity</th>
                    <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Reserved</th>
                    <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Reorder Level</th>
                    <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Status</th>
                    <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((item, i) => {
                    const status = item.quantity === 0 ? 'out' : item.quantity <= (item.reorderLevel || 5) ? 'low' : 'in'
                    return (
                      <motion.tr key={item.id} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.02 }}
                        className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                        <td className="py-2 px-3 text-[11px] text-text">{getProductName(item.productId)}</td>
                        <td className="py-2 px-3 text-[10px] text-text-muted">{item.variantId || '—'}</td>
                        <td className="py-2 px-3 text-xs font-semibold text-text">{item.quantity}</td>
                        <td className="py-2 px-3 text-[11px] text-text-muted">{item.reserved || 0}</td>
                        <td className="py-2 px-3 text-[11px] text-text-muted">{item.reorderLevel || 5}</td>
                        <td className="py-2 px-3">
                          <span className={`badge ${status === 'in' ? 'badge-green' : status === 'low' ? 'badge-gold' : 'badge-red'} text-[9px]`}>
                            {status === 'in' ? 'In Stock' : status === 'low' ? 'Low Stock' : 'Out of Stock'}
                          </span>
                        </td>
                        <td className="py-2 px-3 text-right">
                          <button onClick={() => setAdjustModal(item)}
                            className="p-1.5 glass rounded-lg hover:bg-gold-dim" aria-label="Adjust stock">
                            <Plus size={12} className="text-gold" />
                          </button>
                        </td>
                      </motion.tr>
                    )
                  })}
                  {filtered.length === 0 && (
                    <tr><td colSpan={7} className="py-8 text-center text-text-dim text-xs">No inventory records found</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </>
      )}

      {activeTab === 'log' && (
        <div className="glass rounded-xl p-4">
          <div className="space-y-2 max-h-[500px] overflow-y-auto">
            {log.map((entry, i) => (
              <div key={entry.id || i} className="flex items-start gap-3 py-2 border-b border-white/[0.04] last:border-0">
                <div className="w-7 h-7 rounded-full bg-gold-dim flex items-center justify-center flex-shrink-0 mt-0.5">
                  {entry.adjustment > 0 ? <Plus size={12} className="text-accent-green" /> : <Minus size={12} className="text-accent-red" />}
                </div>
                <div className="min-w-0 flex-1">
                  <p className="text-[11px] text-text">
                    <span className={entry.adjustment > 0 ? 'text-accent-green' : 'text-accent-red'}>
                      {entry.adjustment > 0 ? '+' : ''}{entry.adjustment}
                    </span> units for <span className="text-gold">{getProductName(entry.productId)}</span>
                  </p>
                  <p className="text-[10px] text-text-dim">{entry.reason}</p>
                  <p className="text-[10px] text-text-dim">{new Date(entry.createdAt).toLocaleString()}</p>
                </div>
              </div>
            ))}
            {log.length === 0 && <p className="text-text-dim text-xs py-4 text-center">No adjustments yet</p>}
          </div>
        </div>
      )}

      {/* Adjust Stock Modal */}
      {adjustModal && (
        <div className="fixed inset-0 bg-black/60 flex items-center justify-center z-50 p-4" onClick={() => setAdjustModal(null)}>
          <motion.div initial={{ scale: 0.95, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
            className="glass rounded-2xl p-5 max-w-sm w-full" onClick={e => e.stopPropagation()}>
            <h3 className="text-sm font-semibold text-text mb-4">Adjust Stock — {getProductName(adjustModal.productId)}</h3>
            <p className="text-[10px] text-text-dim mb-3">Current: {adjustModal.quantity} units</p>
            <div className="space-y-3">
              <div>
                <label className="text-[10px] text-text-muted mb-1 block">Adjustment (+ to add, − to remove)</label>
                <input type="number" value={qty} onChange={e => setQty(Number(e.target.value))}
                  className="input-field text-xs w-full" placeholder="e.g. 10 or -5" />
              </div>
              <div>
                <label className="text-[10px] text-text-muted mb-1 block">Reason</label>
                <input value={reason} onChange={e => setReason(e.target.value)}
                  className="input-field text-xs w-full" placeholder="e.g. New shipment received" />
              </div>
              <div className="flex gap-2 pt-2">
                <button onClick={handleAdjust} disabled={loading} className="btn-gold flex-1 text-xs flex items-center justify-center gap-1">
                  {loading ? <Loader size={12} className="animate-spin" /> : 'Apply'}
                </button>
                <button onClick={() => setAdjustModal(null)} className="btn-secondary flex-1 text-xs">Cancel</button>
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </div>
  )
}
