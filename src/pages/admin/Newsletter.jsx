import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import { getNewsletterSubscribers, deleteSubscriber, logAudit } from '../../lib/firestore'
import { useAuth } from '../../contexts/AuthContext'
import toast from 'react-hot-toast'
import { Search, Trash2, Mail, Download, Users } from 'lucide-react'

export default function Newsletter() {
  const { user } = useAuth()
  const [subscribers, setSubscribers] = useState([])
  const [search, setSearch] = useState('')

  useEffect(() => { load() }, [])

  async function load() { setSubscribers(await getNewsletterSubscribers()) }

  async function handleDelete(id) {
    if (!confirm('Remove subscriber?')) return
    await deleteSubscriber(id); toast.success('Removed'); load()
  }

  function exportCSV() {
    if (!subscribers.length) return
    const csv = ['Email,Name,Date']
    subscribers.forEach(s => csv.push(`${s.email || ''},${s.name || ''},${s.createdAt || ''}`))
    const blob = new Blob([csv.join('\n')], { type: 'text/csv' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a'); a.href = url; a.download = 'subscribers.csv'; a.click()
    URL.revokeObjectURL(url)
  }

  const filtered = subscribers.filter(s => !search || s.email?.toLowerCase().includes(search.toLowerCase()) || s.name?.toLowerCase().includes(search.toLowerCase()))

  return (
    <div>
      <div className="flex items-center justify-between mb-5">
        <h1 className="text-xl font-bold gold-text" style={{ fontFamily: 'var(--font-heading)' }}>Newsletter</h1>
        <div className="flex items-center gap-2">
          <span className="text-[10px] text-text-muted">{subscribers.length} subscribers</span>
          <button onClick={exportCSV} className="btn-secondary text-[10px] flex items-center gap-1"><Download size={12} /> Export</button>
        </div>
      </div>

      <div className="relative flex-1 min-w-[200px] mb-4">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-text-dim" size={14} />
        <input placeholder="Search subscribers..." value={search} onChange={e => setSearch(e.target.value)} className="input-field pl-9 text-xs w-full" />
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-left">
          <thead>
            <tr className="border-b border-white/[0.06]">
              <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Email</th>
              <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Name</th>
              <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium">Subscribed</th>
              <th className="py-2.5 px-3 text-[10px] text-text-muted font-medium text-right">Actions</th>
            </tr>
          </thead>
          <tbody>
            {filtered.map(s => (
              <tr key={s.id} className="border-b border-white/[0.04] hover:bg-white/[0.02]">
                <td className="py-2 px-3">
                  <div className="flex items-center gap-2">
                    <Mail size={12} className="text-gold" />
                    <span className="text-xs text-text">{s.email}</span>
                  </div>
                </td>
                <td className="py-2 px-3 text-[11px] text-text-muted">{s.name || '—'}</td>
                <td className="py-2 px-3 text-[10px] text-text-dim">{s.createdAt ? new Date(s.createdAt).toLocaleDateString() : '—'}</td>
                <td className="py-2 px-3 text-right">
                  <button onClick={() => handleDelete(s.id)} className="p-1.5 glass rounded-lg hover:bg-red-500/10" aria-label="Remove subscriber">
                    <Trash2 size={12} className="text-accent-red" />
                  </button>
                </td>
              </tr>
            ))}
            {filtered.length === 0 && <tr><td colSpan={4} className="py-8 text-center text-text-dim text-xs">No subscribers</td></tr>}
          </tbody>
        </table>
      </div>
    </div>
  )
}
