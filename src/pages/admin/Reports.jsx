import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getEntities, getAllInventory } from '../../lib/firestore'
import { BarChart3, TrendingUp, Package, ShoppingCart, Users, IndianRupee, Download } from 'lucide-react'

export default function Reports() {
  const [orders, setOrders] = useState([])
  const [products, setProducts] = useState([])
  const [inventory, setInventory] = useState([])
  const [customers, setCustomers] = useState([])
  const [period, setPeriod] = useState('all')

  useEffect(() => {
    async function load() {
      const [o, p, i, c] = await Promise.all([getEntities('orders'), getEntities('products'), getAllInventory(), getEntities('customers')])
      setOrders(o); setProducts(p); setInventory(i); setCustomers(c)
    }
    load()
  }, [])

  function filterByPeriod(arr) {
    if (period === 'all') return arr
    const now = new Date()
    const start = new Date()
    if (period === '7d') start.setDate(now.getDate() - 7)
    else if (period === '30d') start.setDate(now.getDate() - 30)
    else if (period === '90d') start.setDate(now.getDate() - 90)
    return arr.filter(o => new Date(o.createdAt) >= start)
  }

  const filteredOrders = filterByPeriod(orders)
  const revenue = filteredOrders.reduce((s, o) => s + (o.total || 0), 0)
  const avgOrder = filteredOrders.length ? revenue / filteredOrders.length : 0

  const topProducts = {}
  filteredOrders.forEach(o => o.items?.forEach(item => {
    topProducts[item.name] = (topProducts[item.name] || 0) + (item.qty || 1)
  }))
  const sorted = Object.entries(topProducts).sort((a, b) => b[1] - a[1]).slice(0, 5)

  const monthlyRevenue = {}
  filteredOrders.forEach(o => {
    const month = o.createdAt?.substring(0, 7)
    if (month) monthlyRevenue[month] = (monthlyRevenue[month] || 0) + (o.total || 0)
  })

  function exportCSV(data, filename) {
    if (!data.length) return
    const csv = [Object.keys(data[0]).join(',')]
    data.forEach(row => csv.push(Object.values(row).map(v => typeof v === 'string' && v.includes(',') ? `"${v}"` : v).join(',')))
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = filename; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Reports</h1>
        <div className="flex items-center gap-2">
          <select value={period} onChange={e => setPeriod(e.target.value)} className="input-field text-xs w-auto">
            <option value="all">All Time</option>
            <option value="7d">Last 7 Days</option>
            <option value="30d">Last 30 Days</option>
            <option value="90d">Last 90 Days</option>
          </select>
          <button onClick={() => exportCSV(filteredOrders.map(o => ({ id: o.id, date: o.createdAt, total: o.total, status: o.status, items: o.items?.length })), 'orders.csv')}
            className="btn-secondary text-[10px] flex items-center gap-1">
            <Download size={12} /> Export Orders
          </button>
        </div>
      </div>

      {/* KPI Cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        {[
          { label: 'Revenue', value: `₹${revenue.toLocaleString()}`, icon: IndianRupee, color: 'text-gold' },
          { label: 'Orders', value: filteredOrders.length, icon: ShoppingCart, color: 'text-accent-blue' },
          { label: 'Avg Order', value: `₹${Math.round(avgOrder).toLocaleString()}`, icon: TrendingUp, color: 'text-accent-green' },
          { label: 'Customers', value: customers.length, icon: Users, color: 'text-gold' },
        ].map((s, i) => (
          <motion.div key={s.label} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}
            className="glass rounded-xl p-4">
            <div className="flex items-center gap-2 mb-2">
              <s.icon size={14} className={s.color} />
              <span className="text-[10px] text-text-muted">{s.label}</span>
            </div>
            <p className="text-xl font-bold text-text">{s.value}</p>
          </motion.div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Top Products */}
        <div className="glass rounded-xl p-4">
          <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <Package size={14} className="text-gold" /> Top Selling Products
          </h2>
          {sorted.length ? sorted.map(([name, qty], i) => (
            <div key={name} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
              <span className="text-[10px] text-text-dim w-4">{i + 1}.</span>
              <div className="flex-1 min-w-0">
                <p className="text-[11px] text-text truncate">{name}</p>
              </div>
              <span className="text-[11px] text-gold font-semibold">{qty} sold</span>
            </div>
          )) : <p className="text-text-dim text-xs py-4 text-center">No data</p>}
        </div>

        {/* Revenue by Month */}
        <div className="glass rounded-xl p-4">
          <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <BarChart3 size={14} className="text-gold" /> Revenue by Month
          </h2>
          {Object.keys(monthlyRevenue).length ? Object.entries(monthlyRevenue).sort((a, b) => b[0].localeCompare(a[0])).map(([month, rev]) => (
            <div key={month} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
              <span className="text-[11px] text-text-muted">{month}</span>
              <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                <div className="h-full bg-gold/40 rounded-full" style={{ width: `${Math.min(100, (rev / revenue) * 100)}%` }} />
              </div>
              <span className="text-[11px] text-gold font-semibold">₹{rev.toLocaleString()}</span>
            </div>
          )) : <p className="text-text-dim text-xs py-4 text-center">No data</p>}
        </div>

        {/* Order Status Breakdown */}
        <div className="glass rounded-xl p-4">
          <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <ShoppingCart size={14} className="text-gold" /> Order Status
          </h2>
          {['pending', 'processing', 'shipped', 'delivered', 'cancelled'].map(status => {
            const count = filteredOrders.filter(o => o.status === status).length
            const pct = filteredOrders.length ? (count / filteredOrders.length) * 100 : 0
            return (
              <div key={status} className="flex items-center gap-3 py-2 border-b border-white/[0.04] last:border-0">
                <span className="text-[11px] text-text-muted capitalize w-20">{status}</span>
                <div className="flex-1 h-2 bg-white/[0.04] rounded-full overflow-hidden">
                  <div className="h-full bg-gold/40 rounded-full" style={{ width: `${pct}%` }} />
                </div>
                <span className="text-[11px] text-text-muted w-8 text-right">{count}</span>
              </div>
            )
          })}
        </div>

        {/* Inventory Status */}
        <div className="glass rounded-xl p-4">
          <h2 className="text-sm font-semibold text-text mb-3 flex items-center gap-2">
            <Package size={14} className="text-gold" /> Inventory Status
          </h2>
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Total', value: inventory.reduce((s, i) => s + (i.quantity || 0), 0), color: 'text-text' },
              { label: 'Low Stock', value: inventory.filter(i => i.quantity > 0 && i.quantity <= (i.reorderLevel || 5)).length, color: 'text-yellow-400' },
              { label: 'Out of Stock', value: inventory.filter(i => i.quantity === 0).length, color: 'text-accent-red' },
            ].map(s => (
              <div key={s.label} className="text-center">
                <p className={`text-lg font-bold ${s.color}`}>{s.value}</p>
                <p className="text-[9px] text-text-muted">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
