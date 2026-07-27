import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getAuditLog } from '../../lib/firestore'
import { Search, Shield, Filter, Download } from 'lucide-react'

export default function AuditLog() {
  const [logs, setLogs] = useState([])
  const [search, setSearch] = useState('')
  const [entityFilter, setEntityFilter] = useState('')
  const [actionFilter, setActionFilter] = useState('')

  useEffect(() => { load() }, [])

  async function load() { setLogs(await getAuditLog({ limit: 200 })) }

  const entityTypes = [...new Set(logs.map(l => l.entityType).filter(Boolean))]
  const actionTypes = [...new Set(logs.map(l => l.action).filter(Boolean))]

  const filtered = logs.filter(l => {
    const matchSearch = !search || l.entityId?.toLowerCase().includes(search.toLowerCase()) || l.action?.toLowerCase().includes(search.toLowerCase())
    const matchEntity = !entityFilter || l.entityType === entityFilter
    const matchAction = !actionFilter || l.action === actionFilter
    return matchSearch && matchEntity && matchAction
  })

  function exportCSV() {
    if (!filtered.length) return
    const csv = ['Date,User,Action,Entity,Entity ID']
    filtered.forEach(l => csv.push(`${l.createdAt || ''},${l.userId || ''},${l.action || ''},${l.entityType || ''},${l.entityId || ''}`))
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'audit-log.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Audit Log</h1>
        <button onClick={exportCSV} className="btn-secondary text-[10px] flex items-center gap-1"><Download size={12} /> Export</button>
      </div>

      <div className="flex flex-wrap gap-2 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
          <input placeholder="Search audit log..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-xs w-full" />
        </div>
        <select value={entityFilter} onChange={e => setEntityFilter(e.target.value)} className="input-field text-xs w-auto">
          <option value="">All Entities</option>
          {entityTypes.map(e => <option key={e} value={e}>{e}</option>)}
        </select>
        <select value={actionFilter} onChange={e => setActionFilter(e.target.value)} className="input-field text-xs w-auto">
          <option value="">All Actions</option>
          {actionTypes.map(a => <option key={a} value={a}>{a}</option>)}
        </select>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className="border-b border-white/[0.06]">
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Time</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">User</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Action</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Entity</th>
                <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Entity ID</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((l, i) => (
                <motion.tr key={l.id || i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: i * 0.01 }}
                  className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                  <td className="py-2 px-3 text-[10px] text-text-dim">{l.createdAt ? new Date(l.createdAt).toLocaleString() : '—'}</td>
                  <td className="py-2 px-3 text-[11px] text-text-muted font-mono">{l.userId?.slice(0, 12) || '—'}</td>
                  <td className="py-2 px-3">
                    <span className="badge badge-blue text-[9px]">{l.action}</span>
                  </td>
                  <td className="py-2 px-3 text-[11px] text-text-muted">{l.entityType || '—'}</td>
                  <td className="py-2 px-3 text-[10px] text-text-dim font-mono">{l.entityId?.slice(0, 16) || '—'}</td>
                </motion.tr>
              ))}
              {filtered.length === 0 && <tr><td colSpan={5} className="py-8 text-center text-text-dim text-xs">No audit records</td></tr>}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
